export type ActiveTab = 'home' | 'scan' | 'threat' | 'history' | 'quarantine' | 'settings';

export type AdminTab =
  | 'overview'
  | 'live_threats'
  | 'behavior_explorer'
  | 'mail_security'
  | 'quarantine'
  | 'agent_fleet'
  | 'attck_map'
  | 'cases'
  | 'reports'
  | 'admin_settings';

export type ScanStep = 'idle' | 'scanning_files' | 'checking_signatures' | 'analyzing_behavior' | 'complete';

export type PlatformType = 'Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS' | 'M365';
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export interface ThreatItem {
  id: string;
  fileName: string;
  location: string;
  reason: string; // Plain-language explanation of why flagged
  matchType: 'known_threat' | 'suspicious_behavior';
  detectedAt: string;
  status: 'active_threat' | 'removed' | 'ignored' | 'quarantined';
  explanationDetails?: string;
  fileSize?: string;
}

export interface QuarantineItem {
  id: string;
  fileName: string;
  quarantinedAt: string;
  originalPath: string;
  reason: string;
  fileSize: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  fileName: string;
  date: string;
  timestamp: number; // for sorting
  type: 'blocked' | 'safe' | 'ignored';
  statusTag: 'Removed' | 'Ignored' | 'Allowed' | 'Clean';
  details: string; // Plain-language 1-2 sentence description
}

export interface AppSettings {
  realTimeProtection: boolean;
  scanFrequency: 'daily' | 'weekly' | 'manual';
  checkKnownThreats: boolean;
  watchBehavior: boolean;
  notificationsEnabled: boolean;
}

// Admin / SOC Telemetry & Advanced Interfaces
export interface ProcessNode {
  pid: number;
  name: string;
  commandLine: string;
  user: string;
  hash?: string;
  children?: ProcessNode[];
  isAnomalous?: boolean;
  anomalyReason?: string;
}

export interface FeatureValue {
  name: string;
  value: number;
  baselineMean: number;
  baselineStd: number;
  zScore: number;
  category: 'Process' | 'Network' | 'FileSystem' | 'Registry' | 'Memory';
}

export interface ThreatAlert {
  id: string;
  timestamp: string;
  entity: string;
  entityId: string;
  platform: PlatformType;
  type: 'ZERO_DAY_ANOMALY' | 'KNOWN_MALWARE' | 'MAIL_ATTACHMENT_EXPLOIT' | 'BEHAVIORAL_INJECTION' | 'SUSPICIOUS_PERSISTENCE';
  summary: string;
  riskScore: number;
  ruleScore: number;
  mlScore: number;
  autoencoderLoss: number;
  status: 'ACTIVE' | 'ISOLATED' | 'INVESTIGATING' | 'DISMISSED' | 'RESOLVED';
  processTree?: ProcessNode;
  features?: FeatureValue[];
  rules?: string[];
  reputationCheck?: {
    vtRatio: string;
    firstSeen: string;
    signerStatus: string;
  };
  explainability?: {
    summary: string;
    detailedExplanation: string;
    keyIndicators: string[];
    recommendedAction: string;
  };
}

export interface MailItem {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  timestamp: string;
  attachmentName?: string;
  attachmentHash?: string;
  sandboxStatus: 'CLEAN' | 'ANALYZING' | 'MALICIOUS' | 'DETONATED';
  riskScore: number;
  verdict: string;
}

export interface AgentDevice {
  id: string;
  hostname: string;
  ipAddress: string;
  platform: PlatformType;
  agentVersion: string;
  status: 'ONLINE' | 'OFFLINE' | 'ISOLATED' | 'WARNING';
  lastSeen: string;
  activeUser: string;
  threatCount: number;
  resourceUsage: {
    cpu: number;
    ram: number;
  };
  telemetryFeed: 'Sysmon' | 'Logcat' | 'Graph API' | 'eBPF';
}

export interface InvestigationCase {
  id: string;
  title: string;
  assignee: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  severity: SeverityLevel;
  createdAt: string;
  alerts: string[];
  notes: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  reason: string;
  status: 'SUCCESS' | 'DENIED' | 'REQUIRES_REAUTH';
}

export interface ATTACKTechnique {
  id: string;
  name: string;
  tactic: string;
  detectionsCount: number;
  coverageStatus: 'FULL' | 'PARTIAL' | 'BEHAVIORAL_ONLY';
  description: string;
}

export interface ThresholdSettings {
  autoIsolateRiskThreshold: number;
  autoencoderLossThreshold: number;
  ruleWeightRatio: number;
  mlWeightRatio: number;
  telemetryVerbosity: 'MINIMAL' | 'BALANCED' | 'VERBOSE' | 'DEBUG';
  reAuthRequiredForIsolation: boolean;
  darkAdminTheme: boolean;
}
