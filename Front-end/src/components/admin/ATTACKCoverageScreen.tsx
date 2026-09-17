import React from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { ShieldCheck, Target, Activity, Flame } from 'lucide-react';

export const ATTACKCoverageScreen: React.FC = () => {
  const { attackTechniques } = useSecurity();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            <Target className="w-5 h-5 text-rose-500" />
            <span>MITRE ATT&CK Matrix Technique Coverage</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Behavioral ML & Rule detection mapping across enterprise threat tactics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {attackTechniques.map((tech) => (
          <div key={tech.id} className="bg-[#151921] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400 text-sm">{tech.id} - {tech.name}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  tech.coverageStatus === 'FULL'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {tech.coverageStatus}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-sans">{tech.description}</div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
              <span>Tactic: <strong className="text-slate-200">{tech.tactic}</strong></span>
              <span className="text-rose-400 font-bold">{tech.detectionsCount} Telemetry Triggers</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
