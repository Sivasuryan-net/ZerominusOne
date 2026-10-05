"""Watch a downloads folder and submit new files to the EDR API.

This agent only reads files, hashes them, and uploads them for static analysis.
It never opens a file as an executable and never deletes or quarantines files.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import mimetypes
import os
import platform
import socket
import threading
import time
import urllib.error
import urllib.request
import uuid
from pathlib import Path
from queue import Empty, Queue
from typing import Any

from watchdog.events import FileCreatedEvent, FileMovedEvent, FileSystemEventHandler
from watchdog.observers import Observer

LOGGER = logging.getLogger("zero-minus-one.download-watcher")


def current_platform() -> str:
    return "Windows" if platform.system() == "Windows" else "Linux"


def current_user() -> str:
    try:
        return os.getlogin()
    except OSError:
        return os.environ.get("USERNAME") or os.environ.get("USER") or "unknown"


class ApiClient:
    def __init__(self, base_url: str, agent_id: str, hostname: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.agent_id = agent_id
        self.hostname = hostname

    def _request(self, method: str, path: str, body: bytes, content_type: str) -> dict[str, Any]:
        request = urllib.request.Request(
            f"{self.base_url}{path}",
            data=body,
            headers={"Content-Type": content_type, "Accept": "application/json"},
            method=method,
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))

    def heartbeat(self) -> None:
        payload = {
            "id": self.agent_id,
            "hostname": self.hostname,
            "ipAddress": socket.gethostbyname(socket.gethostname()),
            "platform": current_platform(),
            "agentVersion": "0.1.0-download-watcher",
            "status": "ONLINE",
            "lastSeen": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "activeUser": current_user(),
            "threatCount": 0,
            "resourceUsage": {"cpu": 0, "ram": 0},
            "telemetryFeed": "Sysmon",
        }
        self._request("POST", "/api/agents/heartbeat", json.dumps(payload).encode(), "application/json")

    def ingest(self, file_path: Path, metadata: dict[str, Any]) -> dict[str, Any]:
        boundary = f"----ZeroMinusOne{uuid.uuid4().hex}"
        content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        file_bytes = file_path.read_bytes()
        metadata_bytes = json.dumps(metadata).encode("utf-8")
        parts = [
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"metadata\"\r\n\r\n".encode(),
            metadata_bytes,
            f"\r\n--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{file_path.name}\"\r\nContent-Type: {content_type}\r\n\r\n".encode(),
            file_bytes,
            f"\r\n--{boundary}--\r\n".encode(),
        ]
        return self._request(
            "POST",
            "/api/ingest",
            b"".join(parts),
            f"multipart/form-data; boundary={boundary}",
        )


class DownloadHandler(FileSystemEventHandler):
    def __init__(self, queue: Queue[Path]) -> None:
        self.queue = queue
        super().__init__()

    def _enqueue(self, path: str) -> None:
        candidate = Path(path)
        if candidate.is_file():
            self.queue.put(candidate)

    def on_created(self, event: FileCreatedEvent) -> None:
        if not event.is_directory:
            self._enqueue(event.src_path)

    def on_moved(self, event: FileMovedEvent) -> None:
        if not event.is_directory:
            self._enqueue(event.dest_path)


def wait_until_stable(file_path: Path, interval: float = 1.0, attempts: int = 5) -> bool:
    previous: tuple[int, int] | None = None
    for _ in range(attempts):
        try:
            stat = file_path.stat()
        except FileNotFoundError:
            return False
        current = (stat.st_size, stat.st_mtime_ns)
        if current == previous:
            return True
        previous = current
        time.sleep(interval)
    return False


def sha256_file(file_path: Path) -> str:
    digest = hashlib.sha256()
    with file_path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def process_files(queue: Queue[Path], client: ApiClient, entity_id: str) -> None:
    seen: dict[str, tuple[int, int]] = {}
    while True:
        try:
            file_path = queue.get(timeout=1)
        except Empty:
            continue
        try:
            if not wait_until_stable(file_path):
                LOGGER.warning("File did not stabilize before timeout: %s", file_path)
                continue
            stat = file_path.stat()
            marker = (stat.st_size, stat.st_mtime_ns)
            key = str(file_path.resolve())
            if seen.get(key) == marker:
                continue
            file_hash = sha256_file(file_path)
            metadata = {
                "source": "download",
                "entity": socket.gethostname(),
                "entityId": entity_id,
                "platform": current_platform(),
                "commandLine": "",
                "sha256": file_hash,
            }
            result = client.ingest(file_path, metadata)
            seen[key] = marker
            LOGGER.info("Submitted %s sha256=%s alert=%s", file_path, file_hash, result.get("alertId"))
        except (OSError, urllib.error.URLError, ValueError) as error:
            LOGGER.error("Could not process %s: %s", file_path, error)
        finally:
            queue.task_done()


def run(folder: Path, api_url: str, interval: float, agent_id: str) -> None:
    folder.mkdir(parents=True, exist_ok=True)
    hostname = socket.gethostname()
    client = ApiClient(api_url, agent_id, hostname)
    events: Queue[Path] = Queue()
    observer = Observer()
    observer.schedule(DownloadHandler(events), str(folder), recursive=False)
    observer.start()
    worker = threading.Thread(target=process_files, args=(events, client, agent_id), daemon=True)
    worker.start()
    LOGGER.info("Watching %s; agent=%s; api=%s", folder, agent_id, api_url)
    try:
        while True:
            try:
                client.heartbeat()
            except (OSError, urllib.error.URLError, ValueError) as error:
                LOGGER.warning("Heartbeat failed: %s", error)
            time.sleep(interval)
    except KeyboardInterrupt:
        LOGGER.info("Stopping download watcher")
    finally:
        observer.stop()
        observer.join()


def main() -> None:
    parser = argparse.ArgumentParser(description="Zero Minus One Downloads folder agent")
    parser.add_argument("--folder", type=Path, default=Path.home() / "Downloads")
    parser.add_argument("--api-url", default=os.getenv("ZERO_ONE_API_URL", "http://127.0.0.1:8000"))
    parser.add_argument("--agent-id", default=os.getenv("ZERO_ONE_AGENT_ID", f"AGENT-{uuid.uuid4().hex[:8].upper()}"))
    parser.add_argument("--heartbeat-seconds", type=float, default=30, dest="interval")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO if args.verbose else logging.WARNING, format="%(asctime)s %(levelname)s %(message)s")
    run(args.folder, args.api_url, args.interval, args.agent_id)


if __name__ == "__main__":
    main()
