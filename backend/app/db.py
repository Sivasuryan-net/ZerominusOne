import json
import os
import sqlite3
from contextlib import contextmanager
from typing import Any, Iterator

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./zero_minus_one.db")


def _sqlite_path() -> str:
    if DATABASE_URL.startswith("sqlite:///"):
        return DATABASE_URL.removeprefix("sqlite:///")
    return "./zero_minus_one.db"


@contextmanager
def connection() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(_sqlite_path())
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                payload TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS mail (
                id TEXT PRIMARY KEY,
                payload TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS agents (
                id TEXT PRIMARY KEY,
                payload TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY,
                payload TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                payload TEXT NOT NULL
            );
            """
        )


def upsert(table: str, identifier: str, payload: dict[str, Any], timestamp: str) -> None:
    column = "created_at" if table in {"alerts", "mail"} else "updated_at"
    with connection() as conn:
        if table == "alerts":
            conn.execute(
                "INSERT OR REPLACE INTO alerts (id, payload, status, created_at) VALUES (?, ?, ?, ?)",
                (identifier, json.dumps(payload), payload.get("status", "ACTIVE"), timestamp),
            )
        else:
            conn.execute(
                f"INSERT OR REPLACE INTO {table} (id, payload, {column}) VALUES (?, ?, ?)",
                (identifier, json.dumps(payload), timestamp),
            )


def read_all(table: str) -> list[dict[str, Any]]:
    with connection() as conn:
        rows = conn.execute(f"SELECT payload FROM {table}").fetchall()
    return [json.loads(row["payload"]) for row in rows]


def read_one(table: str, identifier: str) -> dict[str, Any] | None:
    with connection() as conn:
        row = conn.execute(f"SELECT payload FROM {table} WHERE id = ?", (identifier,)).fetchone()
    return json.loads(row["payload"]) if row else None


def update_alert_status(identifier: str, status: str) -> dict[str, Any] | None:
    alert = read_one("alerts", identifier)
    if alert is None:
        return None
    alert["status"] = status
    upsert("alerts", identifier, alert, alert.get("timestamp", ""))
    return alert


def save_setting(key: str, payload: dict[str, Any]) -> None:
    with connection() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, payload) VALUES (?, ?)",
            (key, json.dumps(payload)),
        )


def read_setting(key: str) -> dict[str, Any] | None:
    with connection() as conn:
        row = conn.execute("SELECT payload FROM settings WHERE key = ?", (key,)).fetchone()
    return json.loads(row["payload"]) if row else None
