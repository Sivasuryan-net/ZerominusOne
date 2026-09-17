import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { QuarantineItem } from '../../types';
import {
  Lock,
  Trash2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

export const QuarantineScreen: React.FC = () => {
  const { quarantineList, deleteFromQuarantine, restoreFromQuarantine } = useSecurity();
  const [restoreConfirmItem, setRestoreConfirmItem] = useState<QuarantineItem | null>(null);

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-600" />
          <span>Quarantine Vault</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Safely isolated files that cannot harm your device or run in the background
        </p>
      </div>

      {/* List or Empty State */}
      {quarantineList.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 card-shadow space-y-4 my-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-12 h-12 fill-emerald-100" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Nothing in quarantine.</h3>
            <p className="text-sm text-slate-500 mt-1">You're all clear!</p>
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When suspicious files are detected and removed, they stay safely locked here until you delete them permanently.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {quarantineList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-mono truncate">
                      {item.fileName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Quarantined: {item.quarantinedAt} • {item.fileSize}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold shrink-0">
                  Isolated
                </span>
              </div>

              {/* Reason */}
              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-normal">
                <span className="font-semibold text-slate-800">Reason:</span> {item.reason}
              </div>

              {/* Two Action Buttons */}
              <div className="pt-1 flex items-center justify-end gap-2 text-xs">
                {/* Restore button */}
                <button
                  onClick={() => setRestoreConfirmItem(item)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restore</span>
                </button>

                {/* Delete Permanently button */}
                <button
                  onClick={() => deleteFromQuarantine(item.id)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restore Warning Confirmation Modal */}
      {restoreConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Restore File?</h3>
            </div>

            <p className="text-xs text-slate-700 font-medium leading-relaxed bg-amber-50 p-3 rounded-2xl border border-amber-200 text-amber-900">
              ⚠️ <strong>Warning:</strong> Only restore files you trust. Restoring this item will move it back to its original folder ({restoreConfirmItem.originalPath}).
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRestoreConfirmItem(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  restoreFromQuarantine(restoreConfirmItem.id);
                  setRestoreConfirmItem(null);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors"
              >
                Yes, Restore File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
