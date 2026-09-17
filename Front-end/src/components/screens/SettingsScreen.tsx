import React from 'react';
import { useSecurity } from '../../context/SecurityContext';
import {
  Settings,
  Shield,
  Bell,
  Clock,
  Database,
  Eye,
  Info,
  CheckCircle2
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useSecurity();

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <span>Protection Settings</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Customize how ZeroMinusOne protects your personal device
        </p>
      </div>

      {/* Main Settings Group */}
      <div className="bg-white rounded-3xl border border-slate-200/80 card-shadow divide-y divide-slate-100">
        {/* 1. Real-Time Protection Toggle */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Real-Time Protection</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                Continuously guards your device against threats in the background.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.realTimeProtection}
            onClick={() => updateSettings({ realTimeProtection: !settings.realTimeProtection })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.realTimeProtection ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                settings.realTimeProtection ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 2. Automatic Scan Frequency Picker */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Scan Automatically</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                Choose how often ZeroMinusOne checks your files for safety.
              </p>
            </div>
          </div>

          <select
            value={settings.scanFrequency}
            onChange={(e) => updateSettings({ scanFrequency: e.target.value as any })}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shrink-0"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="manual">Manual only</option>
          </select>
        </div>

        {/* 3. Check new files against known threats Toggle */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Check new files against known threats</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                Uses an up-to-date list of known viruses.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.checkKnownThreats}
            onClick={() => updateSettings({ checkKnownThreats: !settings.checkKnownThreats })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.checkKnownThreats ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                settings.checkKnownThreats ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 4. Watch for suspicious behavior Toggle */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Watch for suspicious behavior</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                Detects new threats by how they act, even if we've never seen them before.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.watchBehavior}
            onClick={() => updateSettings({ watchBehavior: !settings.watchBehavior })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.watchBehavior ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                settings.watchBehavior ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 5. Notifications Toggle */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Threat Alerts & Notifications</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                Show immediate pop-ups when a suspicious file or action is stopped.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={settings.notificationsEnabled}
            onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                settings.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* About / Version Info */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 card-shadow flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">ZeroMinusOne for Personal Device</h4>
            <p className="text-slate-500 mt-0.5">Threat Database Version 2026.08.10 (Up to date)</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono font-bold rounded-lg text-[11px]">
          v3.2.0
        </span>
      </div>
    </div>
  );
};
