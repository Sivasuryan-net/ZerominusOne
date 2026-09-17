import React from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { Mail, ShieldAlert, FileCode, CheckCircle2, Zap, Trash2, Ban } from 'lucide-react';

export const MailSecurityScreen: React.FC = () => {
  const { mailItems, injectSyntheticThreat } = useSecurity();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-100 font-sans flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <span>M365 & Mailbox Attachment Security Agent</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated email attachment detonation sandbox & zero-day macro extraction
          </p>
        </div>

        <button
          onClick={() => injectSyntheticThreat('mail')}
          className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shrink-0 font-mono"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Inject Phishing Email Attachment</span>
        </button>
      </div>

      <div className="bg-[#151921] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 font-sans">Ingested Mail Stream & Detonation Verdicts</h3>
          <span className="text-xs font-mono text-slate-400">Total Analyzed: {mailItems.length}</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {mailItems.map((mail) => (
            <div
              key={mail.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                mail.sandboxStatus === 'DETONATED' || mail.sandboxStatus === 'MALICIOUS'
                  ? 'bg-rose-950/20 border-rose-500/40 text-slate-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-amber-400">{mail.id}</span>
                  <span className="text-slate-400 text-[11px]">{mail.timestamp}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      mail.sandboxStatus === 'DETONATED'
                        ? 'bg-rose-500/20 text-rose-400'
                        : mail.sandboxStatus === 'CLEAN'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {mail.sandboxStatus}
                  </span>
                </div>

                <div className="font-sans font-bold text-slate-100 text-xs mt-1">
                  {mail.subject}
                </div>

                <div className="text-[11px] text-slate-400 font-sans flex items-center gap-2 flex-wrap">
                  <span>From: <strong className="text-slate-300">{mail.sender}</strong></span>
                  <span>To: {mail.recipient}</span>
                </div>

                {mail.attachmentName && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-300 bg-black/40 p-1.5 rounded border border-slate-800 mt-2">
                    <FileCode className="w-3.5 h-3.5 text-rose-400" />
                    <span>Attachment: <strong>{mail.attachmentName}</strong></span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 font-sans">
                {mail.sandboxStatus !== 'CLEAN' && (
                  <>
                    <button className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition-all flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />
                      <span>Purge Inbox</span>
                    </button>
                    <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1">
                      <Ban className="w-3 h-3 text-rose-400" />
                      <span>Block Domain</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
