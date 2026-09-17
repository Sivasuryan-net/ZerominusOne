import React from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { ShieldCheck, Lock, KeyRound, Zap, History } from 'lucide-react';

export const AdminSettingsScreen: React.FC = () => {
  const { thresholdSettings, updateThresholdSettings, auditLogs, injectSyntheticThreat } = useSecurity();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-500" />
            <span>Admin Policy, Re-Auth & Audit Trail Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure high-privilege SOC authorization requirements and review immutable logs
          </p>
        </div>
      </div>

      {/* Security Policies */}
      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 space-y-4 font-sans text-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <KeyRound className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-bold text-slate-100">High-Privilege Action Security Policies</h3>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-slate-800">
          <div>
            <span className="font-bold text-slate-100 block">Require Admin Re-Authentication for Host Isolation</span>
            <span className="text-[11px] text-slate-400">
              When enabled, a modal requiring admin key confirmation appears before isolating any host or deleting files.
            </span>
          </div>
          <button
            onClick={() => updateThresholdSettings({ reAuthRequiredForIsolation: !thresholdSettings.reAuthRequiredForIsolation })}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              thresholdSettings.reAuthRequiredForIsolation ? 'bg-rose-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                thresholdSettings.reAuthRequiredForIsolation ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Synthetic Threat Injection Deck */}
      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 space-y-3 font-sans text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100">Synthetic Threat Generator Deck</h3>
        </div>
        <p className="text-slate-400 text-xs">
          Simulate zero-day attacks, phishing email attachments, or macOS dylib injections in real time.
        </p>

        <div className="flex flex-wrap gap-2 pt-1 font-mono">
          <button
            onClick={() => injectSyntheticThreat('zero_day')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all shadow-md"
          >
            ⚡ Inject Windows Zero-Day
          </button>
          <button
            onClick={() => injectSyntheticThreat('mail')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-all shadow-md"
          >
            ✉️ Inject Phishing Attachment
          </button>
          <button
            onClick={() => injectSyntheticThreat('behavior')}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition-all shadow-md"
          >
            🍏 Inject macOS Behavior Anomaly
          </button>
        </div>
      </div>

      {/* Immutable Audit Trail Ledger */}
      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 font-sans">
          <History className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100">Immutable SOC Audit Trail Ledger</h3>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 bg-black/40 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-emerald-400">{log.id}</span>
                <span className="text-slate-400">{log.timestamp}</span>
              </div>
              <div className="text-slate-200 font-bold">{log.action}</div>
              <div className="text-slate-400 font-sans text-[11px]">Actor: {log.actor} | Target: {log.target}</div>
              <div className="text-[10px] text-slate-500 font-sans">{log.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
