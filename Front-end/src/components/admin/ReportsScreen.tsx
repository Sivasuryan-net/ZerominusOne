import React from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { FileText, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const { threatAlerts, agentDevices, mailItems } = useSecurity();

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Executive Cyber Telemetry & Audit Reports</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compliance telemetry summary for zero-day defense and isolation logs
          </p>
        </div>

        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-md font-mono shrink-0">
          <Download className="w-3.5 h-3.5" />
          <span>Export Executive PDF</span>
        </button>
      </div>

      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Zero-Day Behavioral Detection Summary</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Over the past reporting window, the platform normalized <strong>18,450 telemetry events</strong> across {agentDevices.length} registered endpoint agents and M365 mailboxes. A total of {threatAlerts.length} zero-day anomalies were scored using the Autoencoder reconstruction loss model.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-mono text-xs">
          <div className="p-3 bg-black/40 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Active Alerts:</span>
            <span className="text-rose-400 font-bold text-base">{threatAlerts.filter(a => a.status === 'ACTIVE').length}</span>
          </div>
          <div className="p-3 bg-black/40 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Agent Host Fleet:</span>
            <span className="text-blue-400 font-bold text-base">{agentDevices.length} Online</span>
          </div>
          <div className="p-3 bg-black/40 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Email Sandbox Detonations:</span>
            <span className="text-amber-400 font-bold text-base">{mailItems.filter(m => m.sandboxStatus === 'DETONATED').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
