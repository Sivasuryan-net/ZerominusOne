import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { ThreatAlert } from '../../types';
import { ProcessTreeGraph } from '../visualizers/ProcessTreeGraph';
import { FeatureVectorPanel } from '../visualizers/FeatureVectorPanel';
import {
  ShieldAlert,
  Terminal,
  Activity,
  CheckCircle2,
  Lock,
  Search,
  ExternalLink,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

export const LiveThreatsScreen: React.FC = () => {
  const { threatAlerts, isolateThreatAlert, resolveAlert } = useSecurity();
  const [selectedAlert, setSelectedAlert] = useState<ThreatAlert | null>(threatAlerts[0] || null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>Live EDR Threat Telemetry & Deep Investigation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time process tree graph, VirusTotal hash check, and feature vector Z-scores
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Alert List */}
        <div className="lg:col-span-5 space-y-3 font-mono text-xs">
          {threatAlerts.map((alert) => {
            const isSelected = selectedAlert?.id === alert.id;
            return (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-rose-950/30 border-rose-500 shadow-lg ring-1 ring-rose-500/50'
                    : 'bg-[#151921] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 text-xs">{alert.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alert.status === 'ACTIVE'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>

                <h4 className="font-sans font-semibold text-slate-100 text-xs mt-2 line-clamp-2">
                  {alert.summary}
                </h4>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                  <span>Host: {alert.entity}</span>
                  <span className="font-bold text-rose-400">Risk {alert.riskScore}/100</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Deep Investigation Panel */}
        <div className="lg:col-span-7">
          {selectedAlert ? (
            <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 space-y-6 shadow-2xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {selectedAlert.id}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{selectedAlert.timestamp}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans mt-1">
                    {selectedAlert.summary}
                  </h3>
                </div>

                <div className="flex items-center gap-2 font-sans shrink-0">
                  {selectedAlert.status === 'ACTIVE' && (
                    <button
                      onClick={() => isolateThreatAlert(selectedAlert.id)}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Isolate Host</span>
                    </button>
                  )}
                  {selectedAlert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => resolveAlert(selectedAlert.id)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Resolve</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Reputation Check */}
              {selectedAlert.reputationCheck && (
                <div className="bg-[#0B0E14] p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="text-slate-400 font-sans text-xs font-semibold flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-400" />
                    <span>VirusTotal & Certificate Reputation Check</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">VT Detection:</span>
                      <span className="text-rose-400 font-bold">{selectedAlert.reputationCheck.vtRatio}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">First Seen:</span>
                      <span className="text-slate-200">{selectedAlert.reputationCheck.firstSeen}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Digital Certificate:</span>
                      <span className="text-slate-200">{selectedAlert.reputationCheck.signerStatus}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Process Tree */}
              {selectedAlert.processTree && <ProcessTreeGraph tree={selectedAlert.processTree} />}

              {/* Feature Vectors */}
              {selectedAlert.features && <FeatureVectorPanel features={selectedAlert.features} />}

              {/* AI Explainability */}
              {selectedAlert.explainability && (
                <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/30 space-y-2 font-sans text-xs">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Model Explainability Summary</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-semibold">
                    {selectedAlert.explainability.summary}
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    {selectedAlert.explainability.detailedExplanation}
                  </p>

                  <div className="mt-3 space-y-1">
                    <span className="text-[11px] font-bold text-slate-300 block">Key Anomaly Indicators:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                      {selectedAlert.explainability.keyIndicators.map((ind, i) => (
                        <li key={i}>{ind}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-medium flex items-start gap-2">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Recommended SOC Action:</strong> {selectedAlert.explainability.recommendedAction}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-[#151921] border border-slate-800 rounded-2xl font-sans text-xs">
              Select an alert from the left panel to inspect telemetry details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
