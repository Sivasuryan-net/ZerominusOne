import asyncio
import hashlib
import json
import random
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .db import init_db, read_all, read_one, read_setting, save_setting, update_alert_status, upsert
from .pipeline.ml_autoencoder import AutoencoderModel
from .pipeline.ml_isolation_forest import AnomalyModel
from .pipeline.risk_scorer import calculate_risk
from .pipeline.rule_engine import evaluate_rules
from .pipeline.static_features import extract_features
from .schemas import (
    AgentDevice,
    ATTACKTechnique,
    IngestMetadata,
    InvestigationCase,
    MailItem,
    SimulationRequest,
    StatusUpdate,
    ThresholdSettings,
    ThreatAlert,
)

app = FastAPI(title="Zero Minus One EDR API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
init_db()

anomaly_model = AnomalyModel()
autoencoder_model = AutoencoderModel()
connected_clients: set[WebSocket] = set()
simulation_task: asyncio.Task[None] | None = None


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def broadcast(event: dict[str, Any]) -> None:
    disconnected: list[WebSocket] = []
    for client in connected_clients:
        try:
            await client.send_json(event)
        except Exception:
            disconnected.append(client)
    for client in disconnected:
        connected_clients.discard(client)


def default_thresholds() -> ThresholdSettings:
    stored = read_setting("thresholds")
    return ThresholdSettings(**stored) if stored else ThresholdSettings()


def alert_from_payload(payload: dict[str, Any]) -> ThreatAlert:
    timestamp = payload.setdefault("timestamp", now())
    payload.setdefault("id", f"ALT-{uuid.uuid4().hex[:8].upper()}")
    payload.setdefault("entity", "SIMULATED-ENDPOINT")
    payload.setdefault("entityId", "SIM-001")
    payload.setdefault("platform", "Windows")
    payload.setdefault("type", "ZERO_DAY_ANOMALY")
    payload.setdefault("summary", "Simulated security event")
    payload.setdefault("riskScore", 50)
    payload.setdefault("ruleScore", 0)
    payload.setdefault("mlScore", 0)
    payload.setdefault("autoencoderLoss", 0)
    payload.setdefault("status", "ACTIVE")
    return ThreatAlert(**payload)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "timestamp": now()}


@app.get("/api/alerts", response_model=list[ThreatAlert])
def list_alerts() -> list[dict[str, Any]]:
    return read_all("alerts")


@app.get("/api/alerts/{alert_id}", response_model=ThreatAlert)
def get_alert(alert_id: str) -> dict[str, Any]:
    alert = read_one("alerts", alert_id)
    if alert is None:
        raise HTTPException(404, "Alert not found")
    return alert


@app.patch("/api/alerts/{alert_id}/status", response_model=ThreatAlert)
def set_alert_status(alert_id: str, update: StatusUpdate) -> dict[str, Any]:
    alert = update_alert_status(alert_id, update.status)
    if alert is None:
        raise HTTPException(404, "Alert not found")
    return alert


@app.post("/api/ingest", response_model=dict[str, str])
async def ingest(
    file: UploadFile = File(...),
    metadata: str = Form(default="{}"),
) -> dict[str, str]:
    raw_metadata = IngestMetadata(**json.loads(metadata))
    content = await file.read()
    features = extract_features(file.filename or "upload.bin", content)
    rule_score, rules = evaluate_rules(file.filename or "upload.bin", features, raw_metadata.commandLine)
    ml_score = anomaly_model.score(features)
    autoencoder_loss = autoencoder_model.reconstruction_loss(features)
    thresholds = default_thresholds()
    alert_type = "KNOWN_MALWARE" if rule_score >= 70 else "ZERO_DAY_ANOMALY" if ml_score >= 70 else "BEHAVIORAL_INJECTION"
    alert = ThreatAlert(
        id=f"ALT-{uuid.uuid4().hex[:8].upper()}",
        timestamp=now(),
        entity=raw_metadata.entity,
        entityId=raw_metadata.entityId,
        platform=raw_metadata.platform,
        type=alert_type,
        summary=f"Analysis completed for {file.filename or 'uploaded file'}",
        riskScore=calculate_risk(rule_score, ml_score, autoencoder_loss, thresholds.ruleWeightRatio, thresholds.mlWeightRatio),
        ruleScore=rule_score,
        mlScore=ml_score,
        autoencoderLoss=autoencoder_loss,
        status="ACTIVE",
        rules=rules,
        reputationCheck={"vtRatio": "Not queried", "firstSeen": "Just now", "signerStatus": "Unknown"},
    )
    upsert("alerts", alert.id, alert.model_dump(), alert.timestamp)
    await broadcast({"event": "alert.created", "data": alert.model_dump()})
    return {"alertId": alert.id}


@app.get("/api/mail", response_model=list[MailItem])
def list_mail() -> list[dict[str, Any]]:
    return read_all("mail")


@app.get("/api/agents", response_model=list[AgentDevice])
def list_agents() -> list[dict[str, Any]]:
    return read_all("agents")


@app.get("/api/cases", response_model=list[InvestigationCase])
def list_cases() -> list[dict[str, Any]]:
    return read_all("cases")


@app.get("/api/attck-coverage", response_model=list[ATTACKTechnique])
def attack_coverage() -> list[dict[str, Any]]:
    return []


@app.get("/api/settings/thresholds", response_model=ThresholdSettings)
def get_thresholds() -> ThresholdSettings:
    return default_thresholds()


@app.put("/api/settings/thresholds", response_model=ThresholdSettings)
def put_thresholds(settings: ThresholdSettings) -> ThresholdSettings:
    save_setting("thresholds", settings.model_dump())
    return settings


@app.get("/api/quarantine")
def quarantine() -> list[dict[str, Any]]:
    return []


@app.post("/api/quarantine/{item_id}/restore")
def restore_quarantine(item_id: str) -> dict[str, str]:
    raise HTTPException(404, "Quarantine item not found")


@app.websocket("/ws/live")
async def live_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    connected_clients.add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connected_clients.discard(websocket)


async def play_simulation(interval: float) -> None:
    fixture_path = Path(__file__).parent / "simulation" / "fixtures" / "events.json"
    events = json.loads(fixture_path.read_text(encoding="utf-8"))
    for event in events:
        if event["kind"] == "alert":
            alert = alert_from_payload(event["payload"])
            upsert("alerts", alert.id, alert.model_dump(), alert.timestamp)
            await broadcast({"event": "alert.created", "data": alert.model_dump()})
        elif event["kind"] == "mail":
            payload = {"id": f"MAIL-{uuid.uuid4().hex[:6].upper()}", "timestamp": now(), **event["payload"]}
            mail = MailItem(**payload)
            upsert("mail", mail.id, mail.model_dump(), mail.timestamp)
            await broadcast({"event": "mail.created", "data": mail.model_dump()})
        await asyncio.sleep(interval + random.uniform(0, interval))


@app.post("/api/simulate/start")
async def start_simulation(request: SimulationRequest = SimulationRequest()) -> dict[str, str]:
    global simulation_task
    if simulation_task and not simulation_task.done():
        return {"status": "already_running"}
    simulation_task = asyncio.create_task(play_simulation(request.intervalSeconds))
    return {"status": "started"}


@app.post("/api/simulate/stop")
async def stop_simulation() -> dict[str, str]:
    global simulation_task
    if simulation_task and not simulation_task.done():
        simulation_task.cancel()
        simulation_task = None
    return {"status": "stopped"}
