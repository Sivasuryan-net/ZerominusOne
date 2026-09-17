import React from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { Server, ShieldAlert, Cpu, Lock, CheckCircle2, RefreshCw } from 'lucide-react';

export const AgentFleetScreen: React.FC = () => {
  const { agentDevices, isolateDevice } = useSecurity();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            <span>Multi-Platform Endpoint Agent Fleet Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-platform telemetry normalization (Sysmon, eBPF, Logcat, M365 Graph API)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        {agentDevices.map((dev) => (
          <div
            key={dev.id}
            className={`p-4 rounded-2xl border space-y-3 ${
              dev.status === 'ISOLATED'
                ? 'bg-rose-950/20 border-rose-500/40 text-slate-300'
                : dev.status === 'WARNING'
                ? 'bg-amber-950/20 border-amber-500/40 text-slate-300'
                : 'bg-[#151921] border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{dev.hostname}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  dev.status === 'ISOLATED'
                    ? 'bg-rose-500/20 text-rose-400'
                    : dev.status === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {dev.status}
              </span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-400 font-sans">
              <div>Platform: <strong className="text-slate-200">{dev.platform}</strong></div>
              <div>IP: {dev.ipAddress}</div>
              <div>User: {dev.activeUser}</div>
              <div>Agent: {dev.agentVersion}</div>
              <div>Telemetry Feed: <span className="text-blue-400 font-mono">{dev.telemetryFeed}</span></div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-500">CPU Usage:</span>
                <span className="text-slate-300">{dev.resourceUsage.cpu}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">RAM Usage:</span>
                <span className="text-slate-300">{dev.resourceUsage.ram}%</span>
              </div>
            </div>

            <div className="pt-2 font-sans">
              {dev.status !== 'ISOLATED' ? (
                <button
                  onClick={() => isolateDevice(dev.id)}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Isolate Host Network</span>
                </button>
              ) : (
                <div className="w-full py-2 bg-rose-950 text-rose-400 border border-rose-500/30 rounded-xl text-center font-bold text-[11px]">
                  🔒 Network Isolated
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
