import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ActiveTab,
  AdminTab,
  ScanStep,
  ThreatItem,
  QuarantineItem,
  HistoryItem,
  AppSettings,
  ThreatAlert,
  MailItem,
  AgentDevice,
  InvestigationCase,
  AuditLogEntry,
  ATTACKTechnique,
  ThresholdSettings
} from '../types';
import {
  sampleThreatAlerts,
  sampleMailItems,
  sampleAgentDevices,
  sampleCases,
  sampleAuditLogs,
  sampleATTACKTechniques,
  initialThresholdSettings
} from '../data/initialData';

export type AppMode = 'consumer' | 'admin';

interface SecurityContextType {
  // App Mode State
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;

  // Consumer Mode State
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isProtected: boolean;
  realTimeProtection: boolean;
  setRealTimeProtection: (val: boolean) => void;
  lastCheckedTime: string;
  threatsBlockedCount: number;

  // Scan state
  isScanning: boolean;
  scanProgress: number;
  scanStep: ScanStep;
  scanFileCurrent: string;
  scannedFilesCount: number;
  startScan: () => void;
  cancelScan: () => void;

  // Active consumer threat state
  activeThreat: ThreatItem | null;
  setActiveThreat: (threat: ThreatItem | null) => void;
  removeThreat: (threatId: string) => void;
  ignoreThreat: (threatId: string) => void;

  // Quarantine state
  quarantineList: QuarantineItem[];
  deleteFromQuarantine: (id: string) => void;
  restoreFromQuarantine: (id: string) => void;

  // History state
  historyList: HistoryItem[];

  // Consumer Settings
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;

  // Demo / Simulation helper
  triggerSimulation: (type: 'known_virus' | 'suspicious_behavior') => void;

  // --- Admin / SOC State & Actions ---
  threatAlerts: ThreatAlert[];
  mailItems: MailItem[];
  agentDevices: AgentDevice[];
  casesList: InvestigationCase[];
  auditLogs: AuditLogEntry[];
  attackTechniques: ATTACKTechnique[];
  thresholdSettings: ThresholdSettings;

  updateThresholdSettings: (newSettings: Partial<ThresholdSettings>) => void;
  isolateThreatAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  isolateDevice: (deviceId: string) => void;
  injectSyntheticThreat: (type: 'zero_day' | 'mail' | 'behavior') => void;

  // Admin Re-Auth Modal State
  isReAuthModalOpen: boolean;
  setIsReAuthModalOpen: (open: boolean) => void;
  pendingActionDescription: string;
  requestReAuthAction: (description: string, callback: () => void) => void;
  executeReAuthAction: (password: string) => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

const initialQuarantine: QuarantineItem[] = [
  {
    id: 'q-101',
    fileName: 'invoice_update_installer.exe',
    quarantinedAt: 'Yesterday, 4:20 PM',
    originalPath: 'C:\\Users\\Downloads\\invoice_update_installer.exe',
    reason: 'This file matches a known virus signature.',
    fileSize: '4.2 MB'
  },
  {
    id: 'q-102',
    fileName: 'quick_cleaner_tool.scr',
    quarantinedAt: '3 days ago, 11:15 AM',
    originalPath: 'C:\\Users\\Desktop\\quick_cleaner_tool.scr',
    reason: 'This file tried to change system files without permission.',
    fileSize: '1.8 MB'
  }
];

const initialHistory: HistoryItem[] = [
  {
    id: 'h-1',
    title: 'Blocked: invoice_update_installer.exe',
    fileName: 'invoice_update_installer.exe',
    date: 'Yesterday, 4:20 PM',
    timestamp: Date.now() - 86400000,
    type: 'blocked',
    statusTag: 'Removed',
    details: 'This file matched a known virus signature and was moved to quarantine automatically.'
  },
  {
    id: 'h-2',
    title: 'Quick System Scan Completed',
    fileName: '14,820 files checked',
    date: 'Yesterday, 9:00 AM',
    timestamp: Date.now() - 140000000,
    type: 'safe',
    statusTag: 'Clean',
    details: 'Full file signature and behavior check completed. No threats or suspicious files were found.'
  },
  {
    id: 'h-3',
    title: 'Allowed: dev_tool_installer.exe',
    fileName: 'dev_tool_installer.exe',
    date: '4 days ago',
    timestamp: Date.now() - 350000000,
    type: 'ignored',
    statusTag: 'Ignored',
    details: 'You chose to ignore a warning for this file and allowed it to run.'
  }
];

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mode selection
  const [appMode, setAppMode] = useState<AppMode>('consumer');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');

  // Consumer navigation & settings
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [realTimeProtection, setRealTimeProtection] = useState<boolean>(true);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>('Today, 9:15 AM');
  const [threatsBlockedCount, setThreatsBlockedCount] = useState<number>(14);

  const [activeThreat, setActiveThreat] = useState<ThreatItem | null>(null);
  const [quarantineList, setQuarantineList] = useState<QuarantineItem[]>(initialQuarantine);
  const [historyList, setHistoryList] = useState<HistoryItem[]>(initialHistory);

  const [settings, setSettings] = useState<AppSettings>({
    realTimeProtection: true,
    scanFrequency: 'daily',
    checkKnownThreats: true,
    watchBehavior: true,
    notificationsEnabled: true
  });

  // Admin / SOC State
  const [threatAlerts, setThreatAlerts] = useState<ThreatAlert[]>(sampleThreatAlerts);
  const [mailItems, setMailItems] = useState<MailItem[]>(sampleMailItems);
  const [agentDevices, setAgentDevices] = useState<AgentDevice[]>(sampleAgentDevices);
  const [casesList, setCasesList] = useState<InvestigationCase[]>(sampleCases);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(sampleAuditLogs);
  const [attackTechniques, setAttackTechniques] = useState<ATTACKTechnique[]>(sampleATTACKTechniques);
  const [thresholdSettings, setThresholdSettings] = useState<ThresholdSettings>(initialThresholdSettings);

  // Re-Auth Modal state
  const [isReAuthModalOpen, setIsReAuthModalOpen] = useState(false);
  const [pendingActionDescription, setPendingActionDescription] = useState('');
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  // Sync realTimeProtection with settings
  useEffect(() => {
    setSettings((prev) => ({ ...prev, realTimeProtection }));
  }, [realTimeProtection]);

  // Consumer Scan state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStep, setScanStep] = useState<ScanStep>('idle');
  const [scanFileCurrent, setScanFileCurrent] = useState<string>('');
  const [scannedFilesCount, setScannedFilesCount] = useState<number>(0);

  const isProtected = activeThreat === null && realTimeProtection;

  // Scan Simulation Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isScanning) {
      if (scanProgress < 50) {
        setScanStep('checking_signatures');
        const fileSample = [
          'Checking System Files (bootmgr.dll)...',
          'Scanning Downloads folder (setup.exe)...',
          'Checking Application data (app.dll)...',
          'Checking Known Threats Database...'
        ][Math.floor(scanProgress / 12) % 4];
        setScanFileCurrent(fileSample);
      } else if (scanProgress < 95) {
        setScanStep('analyzing_behavior');
        const fileSample = [
          'Watching background process behaviors...',
          'Checking file permission requests...',
          'Monitoring startup items...',
          'Verifying network connections...'
        ][Math.floor((scanProgress - 50) / 11) % 4];
        setScanFileCurrent(fileSample);
      } else {
        setScanStep('complete');
        setScanFileCurrent('Finalizing scan summary...');
      }

      timer = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsScanning(false);
            setLastCheckedTime('Just now');

            const newHistory: HistoryItem = {
              id: `h-${Date.now()}`,
              title: 'System Scan Completed',
              fileName: '18,450 files scanned',
              date: 'Just now',
              timestamp: Date.now(),
              type: 'safe',
              statusTag: 'Clean',
              details: 'Checked against known threats and verified app behaviors. Everything is clean.'
            };
            setHistoryList((prev) => [newHistory, ...prev]);
            setActiveTab('home');
            return 100;
          }
          setScannedFilesCount((c) => c + Math.floor(Math.random() * 120) + 40);
          return prev + 3;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [isScanning, scanProgress]);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScannedFilesCount(0);
    setScanStep('checking_signatures');
    setActiveTab('scan');
  };

  const cancelScan = () => {
    setIsScanning(false);
    setScanProgress(0);
    setScanStep('idle');
    setActiveTab('home');
  };

  const removeThreat = (threatId: string) => {
    const targetThreat = activeThreat;
    if (targetThreat && targetThreat.id === threatId) {
      const newQuarantineItem: QuarantineItem = {
        id: `q-${Date.now()}`,
        fileName: targetThreat.fileName,
        quarantinedAt: 'Just now',
        originalPath: targetThreat.location,
        reason: targetThreat.reason,
        fileSize: targetThreat.fileSize || '2.4 MB'
      };
      setQuarantineList((prev) => [newQuarantineItem, ...prev]);

      const newHistoryItem: HistoryItem = {
        id: `h-${Date.now()}`,
        title: `Blocked: ${targetThreat.fileName}`,
        fileName: targetThreat.fileName,
        date: 'Just now',
        timestamp: Date.now(),
        type: 'blocked',
        statusTag: 'Removed',
        details: `${targetThreat.reason} The file was removed and placed in quarantine.`
      };
      setHistoryList((prev) => [newHistoryItem, ...prev]);

      setThreatsBlockedCount((c) => c + 1);
      setActiveThreat(null);
      setActiveTab('home');
    }
  };

  const ignoreThreat = (threatId: string) => {
    const targetThreat = activeThreat;
    if (targetThreat && targetThreat.id === threatId) {
      const newHistoryItem: HistoryItem = {
        id: `h-${Date.now()}`,
        title: `Allowed: ${targetThreat.fileName}`,
        fileName: targetThreat.fileName,
        date: 'Just now',
        timestamp: Date.now(),
        type: 'ignored',
        statusTag: 'Ignored',
        details: `You chose to ignore the warning for ${targetThreat.fileName} and allowed it to remain on your device.`
      };
      setHistoryList((prev) => [newHistoryItem, ...prev]);
      setActiveThreat(null);
      setActiveTab('home');
    }
  };

  const deleteFromQuarantine = (id: string) => {
    setQuarantineList((prev) => prev.filter((item) => item.id !== id));
  };

  const restoreFromQuarantine = (id: string) => {
    const item = quarantineList.find((q) => q.id === id);
    if (item) {
      setQuarantineList((prev) => prev.filter((q) => q.id !== id));
      const newHistoryItem: HistoryItem = {
        id: `h-${Date.now()}`,
        title: `Restored: ${item.fileName}`,
        fileName: item.fileName,
        date: 'Just now',
        timestamp: Date.now(),
        type: 'ignored',
        statusTag: 'Allowed',
        details: `Restored from quarantine to original folder (${item.originalPath}).`
      };
      setHistoryList((prev) => [newHistoryItem, ...prev]);
    }
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      if (partial.realTimeProtection !== undefined) {
        setRealTimeProtection(partial.realTimeProtection);
      }
      return updated;
    });
  };

  const triggerSimulation = (type: 'known_virus' | 'suspicious_behavior') => {
    if (type === 'known_virus') {
      const threat: ThreatItem = {
        id: `t-${Date.now()}`,
        fileName: 'suspicious_download_patch.exe',
        location: 'C:\\Users\\Downloads\\suspicious_download_patch.exe',
        reason: 'This file matches a known virus signature.',
        matchType: 'known_threat',
        detectedAt: 'Just now',
        status: 'active_threat',
        explanationDetails: 'Our threat database detected a matching virus signature for this file. It was blocked from executing.',
        fileSize: '3.1 MB'
      };
      setActiveThreat(threat);
      setActiveTab('threat');
    } else {
      const threat: ThreatItem = {
        id: `t-${Date.now()}`,
        fileName: 'unknown_helper_script.vbs',
        location: 'C:\\Users\\AppData\\Local\\Temp\\unknown_helper_script.vbs',
        reason: 'This file is acting like malware — it tried to change system settings without asking.',
        matchType: 'suspicious_behavior',
        detectedAt: 'Just now',
        status: 'active_threat',
        explanationDetails: 'Even though this file is new, we caught it attempting to modify critical device startup settings in secret.',
        fileSize: '1.2 MB'
      };
      setActiveThreat(threat);
      setActiveTab('threat');
    }
  };

  // --- Admin Re-Auth Handlers ---
  const requestReAuthAction = (description: string, callback: () => void) => {
    if (thresholdSettings.reAuthRequiredForIsolation) {
      setPendingActionDescription(description);
      setPendingCallback(() => callback);
      setIsReAuthModalOpen(true);
    } else {
      callback();
    }
  };

  const executeReAuthAction = (password: string): boolean => {
    if (password.length > 0) {
      if (pendingCallback) {
        pendingCallback();
      }
      setIsReAuthModalOpen(false);
      setPendingCallback(null);

      // Record audit entry
      const auditEntry: AuditLogEntry = {
        id: `AUDIT-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actor: 'admin@company.com',
        action: 'ADMIN_REAUTH_CONFIRMED',
        target: pendingActionDescription,
        reason: 'Authorized high-privilege action via Re-Auth Modal',
        status: 'SUCCESS'
      };
      setAuditLogs((prev) => [auditEntry, ...prev]);
      return true;
    }
    return false;
  };

  // Admin SOC Actions
  const updateThresholdSettings = (newSettings: Partial<ThresholdSettings>) => {
    setThresholdSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const isolateThreatAlert = (alertId: string) => {
    const action = () => {
      setThreatAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'ISOLATED' } : a))
      );
    };
    requestReAuthAction(`Host Isolation & Process Termination for Alert ${alertId}`, action);
  };

  const resolveAlert = (alertId: string) => {
    setThreatAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'RESOLVED' } : a))
    );
  };

  const isolateDevice = (deviceId: string) => {
    const target = agentDevices.find((d) => d.id === deviceId);
    const action = () => {
      setAgentDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, status: 'ISOLATED' } : d))
      );
    };
    requestReAuthAction(`Network Host Isolation for ${target?.hostname || deviceId}`, action);
  };

  const injectSyntheticThreat = (type: 'zero_day' | 'mail' | 'behavior') => {
    if (type === 'zero_day') {
      const newAlert: ThreatAlert = {
        id: `ALT-${Math.floor(Math.random() * 9000 + 1000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        entity: 'DESKTOP-INJECTED-01',
        entityId: 'DEV-001',
        platform: 'Windows',
        type: 'ZERO_DAY_ANOMALY',
        summary: 'Synthetic Zero-Day Injection: Memory entropy deviation Z=14.2 on unsigned payload',
        riskScore: 96,
        ruleScore: 88,
        mlScore: 99,
        autoencoderLoss: 0.95,
        status: 'ACTIVE',
        rules: ['SIG-104: Encoded PowerShell Command', 'SIG-401: Unsigned Binary Execution'],
        features: [
          { name: 'process_entropy', value: 7.95, baselineMean: 3.1, baselineStd: 0.4, zScore: 12.1, category: 'Process' },
          { name: 'lsass_read_bytes', value: 409600, baselineMean: 0, baselineStd: 10, zScore: 40960, category: 'Memory' }
        ],
        explainability: {
          summary: 'Synthetic zero-day injected to test SOC alert velocity.',
          detailedExplanation: 'Simulated unsigned process execution with elevated Autoencoder loss.',
          keyIndicators: ['High Shannon entropy', 'Unauthorized token impersonation'],
          recommendedAction: 'Isolate host DESKTOP-INJECTED-01'
        }
      };
      setThreatAlerts((prev) => [newAlert, ...prev]);
    } else if (type === 'mail') {
      const newMail: MailItem = {
        id: `MAIL-${Math.floor(Math.random() * 900 + 100)}`,
        sender: 'phish@external-malicious-domain.com',
        recipient: 'finance@company.com',
        subject: 'URGENT: Executive Wire Transfer Confirmation Form',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        attachmentName: 'wire_transfer_form.pdf.vbs',
        attachmentHash: '3a1f4e9281c0021b',
        sandboxStatus: 'DETONATED',
        riskScore: 94,
        verdict: 'MALICIOUS_ATTACHMENT'
      };
      setMailItems((prev) => [newMail, ...prev]);
    } else {
      // Behavior injection
      const newAlert: ThreatAlert = {
        id: `ALT-${Math.floor(Math.random() * 9000 + 1000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        entity: 'EXEC-MACBOOK-PRO',
        entityId: 'DEV-002',
        platform: 'macOS',
        type: 'BEHAVIORAL_INJECTION',
        summary: 'Synthetic Behavioral Injection: Untrusted LaunchAgent plist created in ~/Library/LaunchAgents',
        riskScore: 84,
        ruleScore: 75,
        mlScore: 89,
        autoencoderLoss: 0.81,
        status: 'ACTIVE',
        rules: ['SIG-MAC-14: Persistence via LaunchAgents'],
        explainability: {
          summary: 'Behavioral anomaly detected on macOS.',
          detailedExplanation: 'Program attempted persistence hook.',
          keyIndicators: ['LaunchAgents plist write'],
          recommendedAction: 'Inspect LaunchAgents folder.'
        }
      };
      setThreatAlerts((prev) => [newAlert, ...prev]);
    }
  };

  return (
    <SecurityContext.Provider
      value={{
        appMode,
        setAppMode,
        adminTab,
        setAdminTab,
        activeTab,
        setActiveTab,
        isProtected,
        realTimeProtection,
        setRealTimeProtection,
        lastCheckedTime,
        threatsBlockedCount,
        isScanning,
        scanProgress,
        scanStep,
        scanFileCurrent,
        scannedFilesCount,
        startScan,
        cancelScan,
        activeThreat,
        setActiveThreat,
        removeThreat,
        ignoreThreat,
        quarantineList,
        deleteFromQuarantine,
        restoreFromQuarantine,
        historyList,
        settings,
        updateSettings,
        triggerSimulation,

        // Admin SOC
        threatAlerts,
        mailItems,
        agentDevices,
        casesList,
        auditLogs,
        attackTechniques,
        thresholdSettings,
        updateThresholdSettings,
        isolateThreatAlert,
        resolveAlert,
        isolateDevice,
        injectSyntheticThreat,

        // Re-Auth Modal
        isReAuthModalOpen,
        setIsReAuthModalOpen,
        pendingActionDescription,
        requestReAuthAction,
        executeReAuthAction
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
