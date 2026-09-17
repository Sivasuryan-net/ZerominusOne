import React from 'react';
import { SecurityProvider, useSecurity } from './context/SecurityContext';
import { HeaderNav } from './components/HeaderNav';
import { BottomNav } from './components/BottomNav';
import { ReAuthModal } from './components/modals/ReAuthModal';

// Consumer Mode Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { ScanScreen } from './components/screens/ScanScreen';
import { ThreatScreen } from './components/screens/ThreatScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { QuarantineScreen } from './components/screens/QuarantineScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

// Admin SOC Mode Screens
import { OverviewScreen } from './components/admin/OverviewScreen';
import { LiveThreatsScreen } from './components/admin/LiveThreatsScreen';
import { BehaviorAnalysisScreen } from './components/admin/BehaviorAnalysisScreen';
import { MailSecurityScreen } from './components/admin/MailSecurityScreen';
import { AgentFleetScreen } from './components/admin/AgentFleetScreen';
import { ATTACKCoverageScreen } from './components/admin/ATTACKCoverageScreen';
import { CasesScreen } from './components/admin/CasesScreen';
import { ReportsScreen } from './components/admin/ReportsScreen';
import { AdminSettingsScreen } from './components/admin/AdminSettingsScreen';

const MainAppContent: React.FC = () => {
  const { appMode, adminTab, activeTab } = useSecurity();

  const renderConsumerScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'scan':
        return <ScanScreen />;
      case 'threat':
        return <ThreatScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'quarantine':
        return <QuarantineScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const renderAdminScreen = () => {
    switch (adminTab) {
      case 'overview':
        return <OverviewScreen />;
      case 'live_threats':
        return <LiveThreatsScreen />;
      case 'behavior_explorer':
        return <BehaviorAnalysisScreen />;
      case 'mail_security':
        return <MailSecurityScreen />;
      case 'agent_fleet':
        return <AgentFleetScreen />;
      case 'attck_map':
        return <ATTACKCoverageScreen />;
      case 'cases':
        return <CasesScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'admin_settings':
        return <AdminSettingsScreen />;
      default:
        return <OverviewScreen />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        appMode === 'admin'
          ? 'bg-[#0B0E14] text-[#E6EDF3] selection:bg-rose-500/30'
          : 'bg-[#0B0E14] text-[#E6EDF3] selection:bg-emerald-500/30'
      }`}
    >
      <HeaderNav />

      <main
        className={`flex-1 px-4 py-6 w-full mx-auto ${
          appMode === 'admin' ? 'max-w-7xl' : 'max-w-4xl pb-20 sm:pb-8'
        }`}
      >
        {appMode === 'admin' ? renderAdminScreen() : renderConsumerScreen()}
      </main>

      {appMode === 'consumer' && <BottomNav />}

      {/* Global Admin Re-Authentication Confirmation Modal */}
      <ReAuthModal />
    </div>
  );
};

export default function App() {
  return (
    <SecurityProvider>
      <MainAppContent />
    </SecurityProvider>
  );
}
