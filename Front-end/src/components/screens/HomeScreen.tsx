import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Clock,
  CheckCircle2,
  Lock,
  Zap,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    isProtected,
    realTimeProtection,
    setRealTimeProtection,
    lastCheckedTime,
    threatsBlockedCount,
    startScan,
    setActiveTab,
    activeThreat,
    triggerSimulation
  } = useSecurity();

  const [showDemoDrawer, setShowDemoDrawer] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Active Threat Banner if flagged */}
      {activeThreat && (
        <div
          onClick={() => setActiveTab('threat')}
          className="cursor-pointer bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 animate-bounce">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Action Required
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                Suspicious file detected: <span className="underline">{activeThreat.fileName}</span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-rose-600 shrink-0">
            <span>Review Now</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      )}

      {/* Main Status Hero Card */}
      <div
        className={`rounded-3xl p-8 text-center border transition-all card-shadow ${
          isProtected
            ? 'bg-gradient-to-b from-emerald-50/70 via-white to-white border-emerald-200/80'
            : 'bg-gradient-to-b from-rose-50/80 via-white to-white border-rose-200/80'
        }`}
      >
        {/* Shield Icon Badge */}
        <div className="relative inline-block mb-5">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto transition-transform ${
              isProtected
                ? 'bg-emerald-100 text-emerald-600 animate-soft-pulse'
                : 'bg-rose-100 text-rose-600 animate-bounce'
            }`}
          >
            {isProtected ? (
              <ShieldCheck className="w-16 h-16 fill-emerald-200/60" />
            ) : (
              <ShieldAlert className="w-16 h-16 fill-rose-200/60" />
            )}
          </div>
          {isProtected && (
            <span className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          )}
        </div>

        {/* Headline & Description */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {isProtected ? "You're Protected" : 'Threat Detected'}
        </h2>
        <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          We check every file against known threats and watch for suspicious behavior.
        </p>

        {/* Real-Time Protection Toggle */}
        <div className="mt-6 inline-flex items-center gap-3 bg-slate-100/80 px-4 py-2.5 rounded-2xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-700">Real-Time Protection</span>
          <button
            type="button"
            role="switch"
            aria-checked={realTimeProtection}
            onClick={() => setRealTimeProtection(!realTimeProtection)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              realTimeProtection ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                realTimeProtection ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-bold ${realTimeProtection ? 'text-emerald-700' : 'text-slate-500'}`}>
            {realTimeProtection ? 'ON' : 'OFF'}
          </span>
        </div>

        {/* Scan Now Button */}
        <div className="mt-8">
          <button
            onClick={startScan}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 mx-auto active:scale-98"
          >
            <Search className="w-5 h-5" />
            <span>Scan Now</span>
          </button>
        </div>
      </div>

      {/* Two Stat Tiles */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Last Checked</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{lastCheckedTime}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Up to date</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>Threats Blocked</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{threatsBlockedCount}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">All-time protection</div>
        </div>
      </div>

      {/* Security Features Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 card-shadow space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          How ZeroMinusOne Keeps You Safe
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Known Threats Database</h4>
              <p className="text-slate-600 mt-0.5 leading-normal">
                Compares new files against a live catalog of known malware and viruses.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Smart Behavior Guard</h4>
              <p className="text-slate-600 mt-0.5 leading-normal">
                Watches how programs act so it can catch brand-new threats before they cause harm.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Tester Drawer for UI Review */}
      <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200/80 text-xs space-y-3">
        <button
          onClick={() => setShowDemoDrawer(!showDemoDrawer)}
          className="w-full flex items-center justify-between font-semibold text-slate-700 hover:text-slate-900"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Interactive Demo: Test Threat Scenarios</span>
          </div>
          <span className="text-[11px] text-blue-600">{showDemoDrawer ? 'Hide' : 'Try it'}</span>
        </button>

        {showDemoDrawer && (
          <div className="pt-2 border-t border-slate-200/60 grid sm:grid-cols-2 gap-2 font-medium">
            <button
              onClick={() => triggerSimulation('known_virus')}
              className="p-3 bg-white border border-slate-200 rounded-xl hover:border-rose-300 hover:bg-rose-50/50 text-left transition-all group"
            >
              <div className="text-slate-900 font-bold group-hover:text-rose-700">
                1. Test Known Threat Match
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Simulates finding a file matching an established virus list.
              </div>
            </button>

            <button
              onClick={() => triggerSimulation('suspicious_behavior')}
              className="p-3 bg-white border border-slate-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/50 text-left transition-all group"
            >
              <div className="text-slate-900 font-bold group-hover:text-amber-700">
                2. Test Suspicious Behavior Match
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Simulates a new unknown file attempting unauthorized changes.
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
