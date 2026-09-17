import React from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { Activity, Cpu, Sliders, Zap, BarChart, ShieldCheck } from 'lucide-react';

export const BehaviorAnalysisScreen: React.FC = () => {
  const { thresholdSettings, updateThresholdSettings, threatAlerts } = useSecurity();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Behavioral Machine Learning & Anomaly Scoring Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Autoencoder reconstruction loss model + Isolation Forest feature vector weights
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ML Threshold Controls */}
        <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 space-y-5 font-sans">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100">ML Scoring Thresholds & Weights</h3>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Auto-Isolate Risk Score Cutoff:</span>
                <span className="font-bold text-rose-400">{thresholdSettings.autoIsolateRiskThreshold} / 100</span>
              </div>
              <input
                type="range"
                min="50"
                max="98"
                value={thresholdSettings.autoIsolateRiskThreshold}
                onChange={(e) => updateThresholdSettings({ autoIsolateRiskThreshold: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Autoencoder Reconstruction Loss Cutoff:</span>
                <span className="font-bold text-amber-400">{thresholdSettings.autoencoderLossThreshold}</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="0.95"
                step="0.01"
                value={thresholdSettings.autoencoderLossThreshold}
                onChange={(e) => updateThresholdSettings({ autoencoderLossThreshold: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Rule Weight vs ML Model Weight Ratio:</span>
                <span className="font-bold text-emerald-400">
                  {Math.round(thresholdSettings.ruleWeightRatio * 100)}% Rule / {Math.round(thresholdSettings.mlWeightRatio * 100)}% ML
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={thresholdSettings.ruleWeightRatio}
                onChange={(e) => {
                  const r = Number(e.target.value);
                  updateThresholdSettings({ ruleWeightRatio: r, mlWeightRatio: Number((1 - r).toFixed(2)) });
                }}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Feature Weights Breakdown */}
        <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 font-sans">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100">Telemetry Feature Weights in Vector</h3>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Process Entropy (Shannon)', weight: 0.28, desc: 'Detects obfuscated/encrypted payloads' },
              { name: 'Memory Handle Requests (LSASS)', weight: 0.25, desc: 'Detects credential dumping attempts' },
              { name: 'Outbound Network Fanout', weight: 0.22, desc: 'Detects C2 beaconing & scanning' },
              { name: 'LaunchAgents / Startup Plist Creation', weight: 0.15, desc: 'Detects persistence mechanisms' },
              { name: 'Unsigned Binary Execution', weight: 0.10, desc: 'Detects non-certified executables' }
            ].map((feat) => (
              <div key={feat.name} className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span>{feat.name}</span>
                  <span className="text-purple-400">{(feat.weight * 100).toFixed(0)}%</span>
                </div>
                <div className="text-[10px] text-slate-400 font-sans">{feat.desc}</div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-purple-500" style={{ width: `${feat.weight * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
