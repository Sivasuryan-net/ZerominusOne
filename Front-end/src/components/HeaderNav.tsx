import React from 'react';
import { useSecurity } from '../context/SecurityContext';
import { AdminTab } from '../types';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Sparkles,
  Lock,
  Activity,
  Server,
  Mail,
  Target,
  Briefcase,
  FileText,
  KeyRound,
  LayoutDashboard,
  UserCheck
} from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const {
    appMode,
    setAppMode,
    adminTab,
    setAdminTab,
    activeTab,
    setActiveTab,
    isProtected,
    triggerSimulation,
    threatAlerts
  } = useSecurity();

  const activeAlertsCount = threatAlerts.filter((a) => a.status === 'ACTIVE').length;

  if (appMode === 'admin') {
    const adminNavItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
      { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
      { id: 'live_threats', label: 'Live Threats', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
      { id: 'behavior_explorer', label: 'ML Anomaly', icon: <Activity className="w-3.5 h-3.5" /> },
      { id: 'mail_security', label: 'Mail Sandbox', icon: <Mail className="w-3.5 h-3.5" /> },
      { id: 'agent_fleet', label: 'Agent Fleet', icon: <Server className="w-3.5 h-3.5" /> },
      { id: 'attck_map', label: 'MITRE ATT&CK', icon: <Target className="w-3.5 h-3.5" /> },
      { id: 'cases', label: 'SOC Cases', icon: <Briefcase className="w-3.5 h-3.5" /> },
      { id: 'reports', label: 'Reports', icon: <FileText className="w-3.5 h-3.5" /> },
      { id: 'admin_settings', label: 'Re-Auth & Audit', icon: <KeyRound className="w-3.5 h-3.5" /> }
    ];

    return (
      <header className="sticky top-0 z-40 bg-[#0B0E14] border-b border-[#2D333B] text-[#E6EDF3]">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-tight text-white font-mono">
                  ZEROMINUSONE SOC CONTROL CENTER
                </h1>
                {activeAlertsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse font-mono">
                    {activeAlertsCount} ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8B949E]">
                Behavioral EDR & High-Privilege Administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAppMode('consumer')}
              className="px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Consumer View</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Bar */}
        <div className="border-t border-[#2D333B] bg-[#151921]/90 overflow-x-auto">
          <div className="mx-auto max-w-7xl px-4 flex gap-1 py-1.5">
            {adminNavItems.map((item) => {
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAdminTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all font-sans ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#2D333B]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>
    );
  }

  // Consumer Mode Header
  return (
    <header className="sticky top-0 z-40 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#2D333B] text-[#E6EDF3]">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-all ${
              isProtected
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
            }`}
          >
            {isProtected ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[#E6EDF3] group-hover:text-emerald-400 transition-colors">
              ZeroMinusOne
            </h1>
            <p className="text-[11px] text-[#8B949E]">Simple Device Protection</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Demo Simulator trigger */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => triggerSimulation('known_virus')}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-[#151921] text-[#8B949E] hover:text-rose-400 border border-[#2D333B] transition-colors flex items-center gap-1"
              title="Simulate catching a known virus"
            >
              <Sparkles className="w-3 h-3 text-rose-400" />
              <span>Simulate Virus</span>
            </button>
            <button
              onClick={() => triggerSimulation('suspicious_behavior')}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-[#151921] text-[#8B949E] hover:text-amber-400 border border-[#2D333B] transition-colors flex items-center gap-1"
              title="Simulate catching suspicious behavior"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Simulate Behavior</span>
            </button>
          </div>

          <button
            onClick={() => setAppMode('admin')}
            className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Admin / SOC Center</span>
          </button>
        </div>
      </div>
    </header>
  );
};
