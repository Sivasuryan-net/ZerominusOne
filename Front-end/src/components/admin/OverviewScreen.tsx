import React from 'react';
import { useSecurity } from '../../context/SecurityContext';
import {
  ShieldAlert,
  Server,
  Mail,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Flame
} from 'lucide-react';

export const OverviewScreen: React.FC = () => {
  const {
    threatAlerts,
    agentDevices,
    mailItems,
    casesList,
    isolateThreatAlert,
    setAdminTab,
    injectSyntheticThreat
  } = useSecurity();

  const activeThreats = threatAlerts.filter((a) => a.status === 'ACTIVE');
  const isolatedDevicesCount = agentDevices.filter((d) => d.status === 'ISOLATED').length;
  const maliciousMailCount = mailItems.filter((m) => m.sandboxStatus === 'DETONATED' || m.sandboxStatus === 'MALICIOUS').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Quick Synthetic Generator */}
      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-100 uppercase">
              SOC Command & Telemetry Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time Zero-Day EDR, Autoencoder ML scoring, and multi-endpoint telemetry stream
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <button
            onClick={() => injectSyntheticThreat('zero_day')}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-md"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Inject Zero-Day Attack</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div
          onClick={() => setAdminTab('live_threats')}
          className="bg-[#151921] rounded-2xl p-4 border border-rose-500/30 cursor-pointer hover:border-rose-500 transition-all shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-sans">
            <span>Active EDR Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{activeThreats.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-sans">
            {activeThreats.length > 0 ? 'High Anomaly Priority' : 'All Clear'}
          </div>
        </div>

        <div
          onClick={() => setAdminTab('agent_fleet')}
          className="bg-[#151921] rounded-2xl p-4 border border-slate-800 cursor-pointer hover:border-slate-700 transition-all shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-sans">
            <span>Active Agent Fleet</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{agentDevices.length}</div>
          <div className="text-[10px] text-emerald-400 mt-1 font-sans flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isolatedDevicesCount} Isolated Hosts</span>
          </div>
        </div>

        <div
          onClick={() => setAdminTab('mail_security')}
          className="bg-[#151921] rounded-2xl p-4 border border-slate-800 cursor-pointer hover:border-slate-700 transition-all shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-sans">
            <span>Mail Sandbox Detonations</span>
            <Mail className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{maliciousMailCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-sans">M365 Tenant Feed</div>
        </div>

        <div
          onClick={() => setAdminTab('cases')}
          className="bg-[#151921] rounded-2xl p-4 border border-slate-800 cursor-pointer hover:border-slate-700 transition-all shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-sans">
            <span>SOC Cases</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{casesList.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-sans">Open Investigations</div>
        </div>
      </div>

      {/* Active Threat Alerts Stream Table */}
      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-100 font-sans">Real-Time Threat Telemetry Ticker</h3>
          </div>
          <button
            onClick={() => setAdminTab('live_threats')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 font-sans"
          >
            <span>View All Telemetry</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {threatAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                alert.status === 'ACTIVE'
                  ? 'bg-rose-950/20 border-rose-500/40 text-slate-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-rose-400">{alert.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    {alert.platform}
                  </span>
                  <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                </div>
                <p className="font-sans font-semibold text-slate-100 text-xs leading-snug">
                  {alert.summary}
                </p>
                <div className="text-[11px] text-slate-400 font-sans">Target: {alert.entity}</div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold text-rose-400">Risk {alert.riskScore}/100</div>
                  <div className="text-[10px] text-slate-400">ML Loss: {alert.autoencoderLoss}</div>
                </div>

                {alert.status === 'ACTIVE' ? (
                  <button
                    onClick={() => isolateThreatAlert(alert.id)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 font-sans"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Isolate Host</span>
                  </button>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-bold font-sans">
                    {alert.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
