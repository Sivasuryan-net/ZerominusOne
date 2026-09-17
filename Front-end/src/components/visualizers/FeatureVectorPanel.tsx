import React from 'react';
import { FeatureValue } from '../../types';
import { Activity, BarChart2, Zap } from 'lucide-react';

interface FeatureVectorPanelProps {
  features: FeatureValue[];
}

export const FeatureVectorPanel: React.FC<FeatureVectorPanelProps> = ({ features }) => {
  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between text-slate-400 uppercase tracking-wider font-semibold">
        <span className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Feature Vector & Z-Score Anomaly Metrics</span>
        </span>
        <span className="text-[10px] text-slate-500">Isolation Forest + Autoencoder</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map((feat) => {
          const isHighZ = Math.abs(feat.zScore) > 3.0;
          return (
            <div
              key={feat.name}
              className={`p-3 rounded-xl border ${
                isHighZ
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-[11px] truncate">{feat.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isHighZ ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Z = {feat.zScore > 0 ? `+${feat.zScore.toFixed(1)}` : feat.zScore.toFixed(1)}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                <div>
                  <span className="text-slate-500 block">Observed:</span>
                  <span className="font-bold text-white">{feat.value}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Baseline (μ ± σ):</span>
                  <span>
                    {feat.baselineMean} ± {feat.baselineStd}
                  </span>
                </div>
              </div>

              {/* Visual Z-Bar */}
              <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${isHighZ ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, Math.max(10, Math.abs(feat.zScore) * 8))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
