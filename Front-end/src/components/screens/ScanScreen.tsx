import React from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { ShieldCheck, Search, Database, Eye, X, CheckCircle2 } from 'lucide-react';

export const ScanScreen: React.FC = () => {
  const {
    scanProgress,
    scanStep,
    scanFileCurrent,
    scannedFilesCount,
    cancelScan
  } = useSecurity();

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6 text-center animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Scan in Progress</h2>
        <p className="text-xs text-slate-500 mt-1">
          Checking your device files and active programs for safety
        </p>
      </div>

      {/* Circle Progress Visual */}
      <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-6">
        {/* SVG Circular Progress Bar */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="88"
            cy="88"
            r="76"
            className="text-slate-100"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="88"
            cy="88"
            r="76"
            className="text-blue-600 transition-all duration-300 ease-out"
            strokeWidth="10"
            strokeDasharray={477}
            strokeDashoffset={477 - (477 * scanProgress) / 100}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>

        {/* Center Animated Shield / Percent */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1 animate-pulse">
            <Search className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {scanProgress}%
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
            {scannedFilesCount.toLocaleString()} items
          </span>
        </div>
      </div>

      {/* Plain Language Steps Progress */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow text-left space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Safety Check Steps
        </h3>

        <div className="space-y-3 font-medium text-xs">
          {/* Step 1: Known Threat Check */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
              scanStep === 'checking_signatures'
                ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                : scanProgress >= 50
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                scanStep === 'checking_signatures'
                  ? 'bg-blue-600 text-white animate-spin'
                  : scanProgress >= 50
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {scanProgress >= 50 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Database className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-bold">1. Checking against known threats...</div>
              <div className="text-[11px] opacity-80 mt-0.5">
                Matches files against our catalog of known viruses.
              </div>
            </div>
          </div>

          {/* Step 2: Behavior Check */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
              scanStep === 'analyzing_behavior'
                ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                : scanStep === 'complete'
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                scanStep === 'analyzing_behavior'
                  ? 'bg-blue-600 text-white animate-pulse'
                  : scanStep === 'complete'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {scanStep === 'complete' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-bold">2. Watching how files behave...</div>
              <div className="text-[11px] opacity-80 mt-0.5">
                Ensures no program attempts unauthorized system changes.
              </div>
            </div>
          </div>
        </div>

        {/* Current File Activity */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-mono truncate">
          {scanFileCurrent || 'Preparing scan engine...'}
        </div>
      </div>

      {/* Cancel Action */}
      <div className="pt-2">
        <button
          onClick={cancelScan}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-all"
        >
          <X className="w-4 h-4 text-slate-400" />
          <span>Cancel Scan</span>
        </button>
      </div>
    </div>
  );
};
