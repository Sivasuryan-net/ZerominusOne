import io

from fastapi.testclient import TestClient

from app.main import app


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
