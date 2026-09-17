import {
  ThreatAlert,
  MailItem,
  AgentDevice,
  InvestigationCase,
  AuditLogEntry,
  ATTACKTechnique,
  ThresholdSettings
} from '../types';

export const initialThresholdSettings: ThresholdSettings = {
  autoIsolateRiskThreshold: 85,
  autoencoderLossThreshold: 0.72,
  ruleWeightRatio: 0.5,
  mlWeightRatio: 0.5,
  telemetryVerbosity: 'VERBOSE',
  reAuthRequiredForIsolation: true,
  darkAdminTheme: true
};

export const sampleThreatAlerts: ThreatAlert[] = [
  {
    id: 'ALT-8902',
    timestamp: '2026-08-10 16:32:11',
    entity: 'FINANCE-PC04 (DESKTOP-89X22)',
    entityId: 'DEV-001',
    platform: 'Windows',
    type: 'ZERO_DAY_ANOMALY',
    summary: 'Unsigned process spawning powershell.exe with base64 encoded payload and LSASS handle request',
    riskScore: 92,
    ruleScore: 85,
    mlScore: 98,
    autoencoderLoss: 0.89,
    status: 'ACTIVE',
    rules: [
      'SIG-104: Encoded PowerShell Command Executed',
      'SIG-209: Suspicious LSASS Process Access',
      'SIG-401: Unsigned Binary Execution in Temp Directory'
    ],
    features: [
      { name: 'process_entropy', value: 7.82, baselineMean: 3.21, baselineStd: 0.45, zScore: 10.2, category: 'Process' },
      { name: 'network_outbound_fanout', value: 48, baselineMean: 4.1, baselineStd: 1.2, zScore: 36.5, category: 'Network' },
      { name: 'lsass_memory_read_bytes', value: 204800, baselineMean: 0, baselineStd: 12, zScore: 17000, category: 'Memory' },
      { name: 'file_creation_temp_dir', value: 14, baselineMean: 1.1, baselineStd: 0.8, zScore: 16.1, category: 'FileSystem' }
    ],
    reputationCheck: {
      vtRatio: '0/72 (Unknown Zero-Day)',
      firstSeen: 'Just now',
      signerStatus: 'Unsigned / Invalid Certificate'
    },
    processTree: {
      pid: 4812,
      name: 'invoice_update_installer.exe',
      commandLine: 'C:\\Users\\Finance\\Downloads\\invoice_update_installer.exe --silent',
      user: 'CORP\\FinanceUser',
      isAnomalous: true,
      anomalyReason: 'Unsigned binary in Downloads directory with elevated entropy',
      children: [
        {
          pid: 5904,
          name: 'cmd.exe',
          commandLine: 'cmd.exe /c powershell -EncodedCommand JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAA...',
          user: 'CORP\\FinanceUser',
          isAnomalous: true,
          anomalyReason: 'Obfuscated PowerShell execution from cmd parent',
          children: [
            {
              pid: 6112,
              name: 'powershell.exe',
              commandLine: 'powershell.exe -e JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAA...',
              user: 'NT AUTHORITY\\SYSTEM',
              isAnomalous: true,
              anomalyReason: 'Token impersonation attempt (FinanceUser -> SYSTEM)'
            }
          ]
        }
      ]
    },
    explainability: {
      summary: 'High-confidence Zero-Day execution detected via multi-model behavioral ensemble.',
      detailedExplanation: 'The target binary invoice_update_installer.exe exhibited extreme deviation (Z > 10.0) across file entropy, process lineage, and memory access features. The Autoencoder reconstruction loss (0.89 vs 0.12 baseline) indicates an unknown evasion pattern attempting token privilege escalation.',
      keyIndicators: [
        'Shannon entropy value 7.82/8.0 (Obfuscated/Encrypted payload)',
        'Lsass.exe process handle acquired with PROCESS_VM_READ access',
        'Impersonated NT AUTHORITY\\SYSTEM token without valid parent process context'
      ],
      recommendedAction: 'Isolate endpoint FINANCE-PC04 immediately, terminate process tree (PID 4812/5904/6112), and initiate memory triage.'
    }
  },
  {
    id: 'ALT-8891',
    timestamp: '2026-08-10 15:10:04',
    entity: 'EXEC-MACBOOK-PRO (macOS 14.5)',
    entityId: 'DEV-002',
    platform: 'macOS',
    type: 'BEHAVIORAL_INJECTION',
    summary: 'dylib injection into Safari helper with persistent launchd agent installation',
    riskScore: 78,
    ruleScore: 70,
    mlScore: 86,
    autoencoderLoss: 0.76,
    status: 'INVESTIGATING',
    rules: [
      'SIG-MAC-08: Dylib Injection into System Process',
      'SIG-MAC-14: Persistence via LaunchAgents Directory Write'
    ],
    features: [
      { name: 'dylib_load_count_untrusted', value: 3, baselineMean: 0.05, baselineStd: 0.1, zScore: 29.5, category: 'Process' },
      { name: 'launchd_plist_created', value: 1, baselineMean: 0.01, baselineStd: 0.05, zScore: 19.8, category: 'FileSystem' }
    ],
    reputationCheck: {
      vtRatio: '2/71 (Adware/PUP)',
      firstSeen: '2 days ago',
      signerStatus: 'Revoked Developer ID'
    },
    processTree: {
      pid: 1042,
      name: 'SafariHelper',
      commandLine: '/Applications/Safari.app/Contents/XPCServices/SafariHelper.xpc',
      user: 'exec_user',
      children: [
        {
          pid: 1890,
          name: 'update_check_helper',
          commandLine: '/Users/exec_user/Library/LaunchAgents/com.sys.update.plist',
          user: 'exec_user',
          isAnomalous: true,
          anomalyReason: 'Untrusted dylib loaded into system process memory space'
        }
      ]
    },
    explainability: {
      summary: 'Unsigned dylib injection detected on macOS executive device.',
      detailedExplanation: 'An untrusted dynamic library attempted to hook Safari helper routines and write a persistence plist in ~/Library/LaunchAgents.',
      keyIndicators: [
        'DYLD_INSERT_LIBRARIES variable override detected',
        'Creation of com.sys.update.plist in user LaunchAgents folder'
      ],
      recommendedAction: 'Revoke local launchd job, clean LaunchAgents folder, and audit Safari extension certificates.'
    }
  },
  {
    id: 'ALT-8872',
    timestamp: '2026-08-10 12:45:00',
    entity: 'M365 Tenant (sarah.jenkins@company.com)',
    entityId: 'M365-001',
    platform: 'M365',
    type: 'MAIL_ATTACHMENT_EXPLOIT',
    summary: 'Detonated VBScript Macro attachment in sandbox resulting in outbound C2 beacon',
    riskScore: 95,
    ruleScore: 90,
    mlScore: 99,
    autoencoderLoss: 0.94,
    status: 'ACTIVE',
    rules: [
      'SIG-MAIL-01: Email Attachment Macro Execution',
      'SIG-MAIL-05: Sandbox C2 Beacon Connection'
    ],
    features: [
      { name: 'macro_vbscript_eval_calls', value: 18, baselineMean: 0, baselineStd: 0.1, zScore: 179.0, category: 'Process' },
      { name: 'outbound_dns_requests_raw_ip', value: 12, baselineMean: 0.2, baselineStd: 0.4, zScore: 29.5, category: 'Network' }
    ],
    reputationCheck: {
      vtRatio: '45/72 (Known Dropper)',
      firstSeen: '3 weeks ago',
      signerStatus: 'No Signature'
    },
    explainability: {
      summary: 'Sandbox detonation caught malicious VBScript dropper in email attachment.',
      detailedExplanation: 'The incoming message contained urgent_invoice_PO9821.docm which triggered automatic cloud sandbox detonation. The embedded script attempted memory allocation and HTTP POSTs to raw IP addresses.',
      keyIndicators: [
        'VBA AutoOpen() macro calling WScript.Shell',
        'HTTP POST requests to 185.220.101.4:8443'
      ],
      recommendedAction: 'Purge email from all inbox stores, block sender domain, and revoke OAuth consent for sarah.jenkins@company.com.'
    }
  }
];

export const sampleMailItems: MailItem[] = [
  {
    id: 'MAIL-101',
    sender: 'billing-alert@secure-payment-update.com',
    recipient: 'sarah.jenkins@company.com',
    subject: 'URGENT: Overdue Invoice PO-98211 Confirmation Required',
    timestamp: '2026-08-10 12:44:18',
    attachmentName: 'urgent_invoice_PO9821.docm',
    attachmentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    sandboxStatus: 'DETONATED',
    riskScore: 95,
    verdict: 'MALICIOUS_DROPPER'
  },
  {
    id: 'MAIL-102',
    sender: 'hr-payroll@company-portal-update.org',
    recipient: 'all-staff@company.com',
    subject: 'Direct Deposit Account Update Needed Before August 15',
    timestamp: '2026-08-10 11:12:00',
    attachmentName: 'employee_update_form.pdf.exe',
    attachmentHash: '8f4e2c1a89b33410502aefc88349129d38c23841a0293a19e8301829f0183182',
    sandboxStatus: 'MALICIOUS',
    riskScore: 88,
    verdict: 'EXECUTABLE_DISGUISED_AS_PDF'
  },
  {
    id: 'MAIL-103',
    sender: 'reports@google-analytics.com',
    recipient: 'marketing@company.com',
    subject: 'Weekly Search Console Performance Digest - August 2026',
    timestamp: '2026-08-10 09:30:00',
    attachmentName: 'digest_summary.pdf',
    sandboxStatus: 'CLEAN',
    riskScore: 2,
    verdict: 'SAFE'
  }
];

export const sampleAgentDevices: AgentDevice[] = [
  {
    id: 'DEV-001',
    hostname: 'FINANCE-PC04',
    ipAddress: '192.168.1.104',
    platform: 'Windows',
    agentVersion: 'v3.2.0-edr',
    status: 'WARNING',
    lastSeen: 'Just now',
    activeUser: 'CORP\\FinanceUser',
    threatCount: 1,
    resourceUsage: { cpu: 18, ram: 42 },
    telemetryFeed: 'Sysmon'
  },
  {
    id: 'DEV-002',
    hostname: 'EXEC-MACBOOK-PRO',
    ipAddress: '192.168.1.112',
    platform: 'macOS',
    agentVersion: 'v3.2.0-edr',
    status: 'ONLINE',
    lastSeen: '2 mins ago',
    activeUser: 'exec_user',
    threatCount: 1,
    resourceUsage: { cpu: 8, ram: 34 },
    telemetryFeed: 'eBPF'
  },
  {
    id: 'DEV-003',
    hostname: 'PROD-K8S-NODE-01',
    ipAddress: '10.240.0.12',
    platform: 'Linux',
    agentVersion: 'v3.2.0-edr',
    status: 'ONLINE',
    lastSeen: '1 min ago',
    activeUser: 'root',
    threatCount: 0,
    resourceUsage: { cpu: 28, ram: 65 },
    telemetryFeed: 'eBPF'
  },
  {
    id: 'DEV-004',
    hostname: 'FIELD-TABLET-09',
    ipAddress: '172.16.42.88',
    platform: 'Android',
    agentVersion: 'v3.2.0-mobile',
    status: 'ONLINE',
    lastSeen: '5 mins ago',
    activeUser: 'field_tech',
    threatCount: 0,
    resourceUsage: { cpu: 4, ram: 22 },
    telemetryFeed: 'Logcat'
  }
];

export const sampleCases: InvestigationCase[] = [
  {
    id: 'CASE-402',
    title: 'Zero-Day PowerShell In-Memory LSASS Dumping Attempt',
    assignee: 'Lead SOC Analyst',
    status: 'OPEN',
    severity: 'CRITICAL',
    createdAt: '2026-08-10 16:35:00',
    alerts: ['ALT-8902'],
    notes: [
      'Initial triage confirmed encoded powershell command executing from Downloads folder.',
      'Auto-isolation pending administrator re-authentication confirmation.',
      'Memory dump request issued to endpoint agent.'
    ]
  },
  {
    id: 'CASE-398',
    title: 'Phishing Campaign via Fake M365 Invoice Macro Attachment',
    assignee: 'Email Threat Team',
    status: 'IN_PROGRESS',
    severity: 'HIGH',
    createdAt: '2026-08-10 13:00:00',
    alerts: ['ALT-8872'],
    notes: [
      'Sandboxed attachment urgent_invoice_PO9821.docm triggered outbound C2 IPs.',
      'Purged from 14 user inboxes across tenant.'
    ]
  }
];

export const sampleAuditLogs: AuditLogEntry[] = [
  {
    id: 'AUDIT-901',
    timestamp: '2026-08-10 16:34:00',
    actor: 'admin@company.com',
    action: 'RE_AUTH_SUCCESS',
    target: 'ADMIN_REAUTH_MODAL',
    reason: 'Elevated authorization confirmed for high-privilege SOC action.',
    status: 'SUCCESS'
  },
  {
    id: 'AUDIT-900',
    timestamp: '2026-08-10 15:45:00',
    actor: 'system_auto_defense',
    action: 'AUTO_QUARANTINE',
    target: 'invoice_update_installer.exe',
    reason: 'Matched signature and elevated behavioral entropy.',
    status: 'SUCCESS'
  }
];

export const sampleATTACKTechniques: ATTACKTechnique[] = [
  {
    id: 'T1059.001',
    name: 'PowerShell',
    tactic: 'Execution',
    detectionsCount: 42,
    coverageStatus: 'FULL',
    description: 'Command and script execution via PowerShell with encoded command flags.'
  },
  {
    id: 'T1003.001',
    name: 'LSASS Memory Dumping',
    tactic: 'Credential Access',
    detectionsCount: 18,
    coverageStatus: 'FULL',
    description: 'Reading process memory of Local Security Authority Subsystem Service.'
  },
  {
    id: 'T1547.001',
    name: 'Registry Run Keys / Startup Folder',
    tactic: 'Persistence',
    detectionsCount: 29,
    coverageStatus: 'BEHAVIORAL_ONLY',
    description: 'Modifying startup run registry keys to maintain persistence across reboots.'
  },
  {
    id: 'T1027',
    name: 'Obfuscated Files or Information',
    tactic: 'Defense Evasion',
    detectionsCount: 65,
    coverageStatus: 'FULL',
    description: 'Using high Shannon entropy binaries, packed executables, or base64 streams.'
  }
];
