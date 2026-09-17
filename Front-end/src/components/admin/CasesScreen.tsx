import React from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { Briefcase, MessageSquare, AlertCircle, Plus } from 'lucide-react';

export const CasesScreen: React.FC = () => {
  const { casesList } = useSecurity();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <span>SOC Incident & Investigation Cases</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyst workflow, alert correlation, and incident triage logs
          </p>
        </div>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {casesList.map((c) => (
          <div key={c.id} className="bg-[#151921] border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-400 text-sm">{c.id}</span>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded">
                  {c.severity}
                </span>
                <span className="text-slate-400 text-[11px] font-sans">{c.createdAt}</span>
              </div>
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold font-sans">
                {c.status}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-100 font-sans">{c.title}</h3>
            <div className="text-[11px] text-slate-400 font-sans">Assignee: <strong className="text-slate-200">{c.assignee}</strong></div>

            <div className="bg-black/40 p-3 rounded-xl border border-slate-800 space-y-1.5 font-sans">
              <span className="text-[10px] uppercase text-slate-500 font-bold font-mono">Analyst Triage Notes:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                {c.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
