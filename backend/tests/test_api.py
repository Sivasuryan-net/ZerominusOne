import io
import hashlib
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app
from app.ingestion.download_watcher import sha256_file


client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_ingest_persists_alert() -> None:
    response = client.post(
        "/api/ingest",
        files={"file": ("sample.txt", io.BytesIO(b"safe sample"), "text/plain")},
        data={"metadata": "{}"},
    )
    assert response.status_code == 200
    alert_id = response.json()["alertId"]
    stored = client.get(f"/api/alerts/{alert_id}")
    assert stored.status_code == 200
    assert stored.json()["status"] == "ACTIVE"


def test_thresholds_round_trip() -> None:
    response = client.put(
        "/api/settings/thresholds",
        json={
            "autoIsolateRiskThreshold": 90,
            "autoencoderLossThreshold": 0.8,
            "ruleWeightRatio": 0.6,
            "mlWeightRatio": 0.4,
            "telemetryVerbosity": "BALANCED",
            "reAuthRequiredForIsolation": True,
            "darkAdminTheme": True,
        },
    )
    assert response.status_code == 200
    assert client.get("/api/settings/thresholds").json()["ruleWeightRatio"] == 0.6


def test_agent_heartbeat() -> None:
    payload = {
        "id": "AGENT-TEST",
        "hostname": "TEST-PC",
        "ipAddress": "127.0.0.1",
        "platform": "Windows",
        "agentVersion": "test",
        "status": "ONLINE",
        "lastSeen": "2026-09-17T00:00:00Z",
        "activeUser": "tester",
        "threatCount": 0,
        "resourceUsage": {"cpu": 0, "ram": 0},
        "telemetryFeed": "Sysmon",
    }
    response = client.post("/api/agents/heartbeat", json=payload)
    assert response.status_code == 200
    assert any(agent["id"] == "AGENT-TEST" for agent in client.get("/api/agents").json())


def test_watcher_hashes_file(tmp_path: Path) -> None:
    sample = tmp_path / "sample.bin"
    sample.write_bytes(b"watcher sample")
    assert sha256_file(sample) == hashlib.sha256(b"watcher sample").hexdigest()
