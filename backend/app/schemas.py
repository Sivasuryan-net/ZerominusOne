from typing import Any, Literal
from pydantic import BaseModel, Field


Platform = Literal["Windows", "macOS", "Linux", "Android", "iOS", "M365"]
AlertType = Literal[
    "ZERO_DAY_ANOMALY",
    "KNOWN_MALWARE",
    "MAIL_ATTACHMENT_EXPLOIT",
    "BEHAVIORAL_INJECTION",
    "SUSPICIOUS_PERSISTENCE",
]
AlertStatus = Literal["ACTIVE", "ISOLATED", "INVESTIGATING", "DISMISSED", "RESOLVED"]


class ProcessNode(BaseModel):
    pid: int
    name: str
    commandLine: str
    user: str
    hash: str | None = None
    children: list["ProcessNode"] = Field(default_factory=list)
    isAnomalous: bool | None = None
    anomalyReason: str | None = None


class FeatureValue(BaseModel):
    name: str
    value: float
    baselineMean: float
    baselineStd: float
    zScore: float
    category: Literal["Process", "Network", "FileSystem", "Registry", "Memory"]


class Explainability(BaseModel):
    summary: str
    detailedExplanation: str
    keyIndicators: list[str]
    recommendedAction: str


class ThreatAlert(BaseModel):
    id: str
    timestamp: str
    entity: str
    entityId: str
    platform: Platform
    type: AlertType
    summary: str
    riskScore: float = Field(ge=0, le=100)
    ruleScore: float = Field(ge=0, le=100)
    mlScore: float = Field(ge=0, le=100)
    autoencoderLoss: float = Field(ge=0)
    status: AlertStatus = "ACTIVE"
    processTree: ProcessNode | None = None
    features: list[FeatureValue] = Field(default_factory=list)
    rules: list[str] = Field(default_factory=list)
    reputationCheck: dict[str, str] | None = None
    explainability: Explainability | None = None


class MailItem(BaseModel):
    id: str
    sender: str
    recipient: str
    subject: str
    timestamp: str
    attachmentName: str | None = None
    attachmentHash: str | None = None
    sandboxStatus: Literal["CLEAN", "ANALYZING", "MALICIOUS", "DETONATED"]
    riskScore: float = Field(ge=0, le=100)
    verdict: str


class AgentDevice(BaseModel):
    id: str
    hostname: str
    ipAddress: str
    platform: Platform
    agentVersion: str
    status: Literal["ONLINE", "OFFLINE", "ISOLATED", "WARNING"]
    lastSeen: str
    activeUser: str
    threatCount: int
    resourceUsage: dict[str, float]
    telemetryFeed: Literal["Sysmon", "Logcat", "Graph API", "eBPF"]


class InvestigationCase(BaseModel):
    id: str
    title: str
    assignee: str
    status: Literal["OPEN", "IN_PROGRESS", "CLOSED"]
    severity: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"]
    createdAt: str
    alerts: list[str]
    notes: list[str]


class ATTACKTechnique(BaseModel):
    id: str
    name: str
    tactic: str
    detectionsCount: int
    coverageStatus: Literal["FULL", "PARTIAL", "BEHAVIORAL_ONLY"]
    description: str


class ThresholdSettings(BaseModel):
    autoIsolateRiskThreshold: float = 85
    autoencoderLossThreshold: float = 0.72
    ruleWeightRatio: float = 0.5
    mlWeightRatio: float = 0.5
    telemetryVerbosity: Literal["MINIMAL", "BALANCED", "VERBOSE", "DEBUG"] = "BALANCED"
    reAuthRequiredForIsolation: bool = True
    darkAdminTheme: bool = True


class StatusUpdate(BaseModel):
    status: AlertStatus


class SimulationRequest(BaseModel):
    intervalSeconds: float = Field(default=5, ge=0.2, le=60)


class IngestMetadata(BaseModel):
    source: str = "download"
    entity: str = "LOCAL-ENDPOINT"
    entityId: str = "LOCAL-001"
    platform: Platform = "Windows"
    commandLine: str = ""


class SimulationEvent(BaseModel):
    kind: Literal["alert", "mail", "agent"]
    payload: dict[str, Any]
