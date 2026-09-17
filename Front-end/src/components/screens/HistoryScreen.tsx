import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import { HistoryItem } from '../../types';
import {
  History,
  ShieldCheck,
  ShieldAlert,
  EyeOff,
  CheckCircle2,
  X,
  Calendar,
  FileText
} from 'lucide-react';

export const HistoryScreen: React.FC = () => {
  const { historyList } = useSecurity();
  const [filter, setFilter] = useState<'all' | 'blocked' | 'ignored'>('all');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const filteredHistory = historyList.filter((item) => {
    if (filter === 'blocked') return item.type === 'blocked';
    if (filter === 'ignored') return item.type === 'ignored';
    return true;
  });

  const getStatusBadge = (statusTag: string, type: HistoryItem['type']) => {
    switch (type) {
      case 'blocked':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
            {statusTag}
          </span>
        );
      case 'ignored':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {statusTag}
          </span>
        );
      case 'safe':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {statusTag}
          </span>
        );
    }
  };

  const getIcon = (type: HistoryItem['type']) => {
    switch (type) {
      case 'blocked':
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        );
      case 'ignored':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <EyeOff className="w-5 h-5" />
          </div>
        );
      case 'safe':
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-5 animate-in fade-in duration-300">
      {/* Title & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Protection History</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            A simple record of scans and threat actions taken on your device
          </p>
        </div>

        {/* Top Filter Buttons */}
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All ({historyList.length})
          </button>
          <button
            onClick={() => setFilter('blocked')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'blocked'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Blocked
          </button>
          <button
            onClick={() => setFilter('ignored')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'ignored'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Ignored
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2.5">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No history events match this filter.
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 card-shadow card-shadow-hover cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getIcon(item.type)}
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="truncate">{item.fileName}</span>
                    <span>•</span>
                    <span className="shrink-0">{item.date}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {getStatusBadge(item.statusTag, item.type)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event Details Drawer Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {getIcon(selectedItem.type)}
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedItem.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{selectedItem.date}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plain Sentence Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-2 leading-relaxed font-medium">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>What Happened</span>
              </div>
              <p>{selectedItem.details}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
