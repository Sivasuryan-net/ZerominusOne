import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { ShieldAlert, KeyRound, X, CheckCircle2 } from 'lucide-react';

export const ReAuthModal: React.FC = () => {
  const { isReAuthModalOpen, setIsReAuthModalOpen, pendingActionDescription, executeReAuthAction } = useSecurity();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isReAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required for high-privilege confirmation');
      return;
    }
    const success = executeReAuthAction(password);
    if (!success) {
      setError('Invalid admin credentials');
    } else {
      setPassword('');
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 font-mono text-xs">
      <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-[#0B0E14] text-[#E6EDF3] p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between pb-3 border-b border-[#2D333B]">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-500 border border-rose-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider">ADMIN RE-AUTH REQUIRED</h3>
              <p className="text-[10px] text-[#8B949E]">High-Privilege SOC Action Confirmation</p>
            </div>
          </div>
          <button
            onClick={() => setIsReAuthModalOpen(false)}
            className="rounded-lg p-1 text-[#8B949E] hover:bg-[#2D333B] hover:text-[#E6EDF3]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-xl bg-[#151921] p-3.5 border border-[#2D333B]">
          <p className="text-[10px] uppercase text-[#8B949E] font-bold mb-1">Target Action</p>
          <p className="text-xs font-semibold text-[#D29922] leading-relaxed">{pendingActionDescription}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#E6EDF3] mb-1 flex items-center justify-between">
              <span>Admin Re-Authentication Key</span>
              <span className="text-[10px] text-[#8B949E]">Demo Pass: any key</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin key..."
                autoFocus
                className="w-full rounded-xl bg-[#0B0E14] border border-[#2D333B] px-3.5 py-2.5 pl-9 text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:border-rose-500 focus:outline-none"
              />
              <KeyRound className="absolute left-3 top-3 h-3.5 w-3.5 text-[#8B949E]" />
            </div>
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
          </div>

          <div className="rounded-xl bg-rose-500/5 p-3 border border-rose-500/20 text-[11px] text-[#8B949E]">
            <p className="leading-tight">
              <strong className="text-rose-400">Audit Trail Notice:</strong> This action will be permanently recorded in the immutable SOC audit ledger.
            </p>
          </div>

          <div className="flex gap-2 pt-1 font-sans">
            <button
              type="button"
              onClick={() => setIsReAuthModalOpen(false)}
              className="flex-1 rounded-xl border border-[#2D333B] bg-[#151921] py-2.5 text-xs font-semibold text-[#8B949E] hover:bg-[#2D333B] hover:text-[#E6EDF3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-md transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              Authorize Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
