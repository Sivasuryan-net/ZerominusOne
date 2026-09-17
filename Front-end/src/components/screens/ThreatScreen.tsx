import React, { useState } from 'react';
import { useSecurity } from '../../context/SecurityContext';
import {
  ShieldAlert,
  Trash2,
  EyeOff,
  HelpCircle,
  FileText,
  AlertTriangle,
  Bot,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const ThreatScreen: React.FC = () => {
  const { activeThreat, removeThreat, ignoreThreat, setActiveTab } = useSecurity();

  const [isExpanded, setIsExpanded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<{
    summary?: string;
    explanation?: string;
    recommendation?: string;
  } | null>(null);

  if (!activeThreat) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">No Active Threat Flagged</h3>
        <p className="text-xs text-slate-500">Your device is currently clean and protected.</p>
        <button
          onClick={() => setActiveTab('home')}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition-all"
        >
          Return to Status
        </button>
      </div>
    );
  }

  const handleFetchAiExplanation = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threatName: activeThreat.fileName,
          reason: activeThreat.reason,
          category: activeThreat.matchType
        })
      });
      const data = await res.json();
      setAiExplanation(data);
    } catch (err) {
      console.error('Failed to fetch friendly AI breakdown:', err);
      setAiExplanation({
        summary: 'Suspicious Activity Explanation',
        explanation: 'This file attempted to perform actions that are typical of malware. Our system automatically stopped it to keep your personal data safe.',
        recommendation: 'Removing this file is the safest action for your device.'
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-6 px-4 space-y-6 animate-in fade-in duration-300">
      {/* Alert Header Card */}
      <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 text-center card-shadow">
        <div className="w-16 h-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center mx-auto mb-4 animate-bounce">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          Security Alert
        </span>

        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          We found something suspicious.
        </h2>

        {/* Flagged File Info */}
        <div className="mt-4 p-3.5 bg-white rounded-2xl border border-rose-200 text-left">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Flagged Item
          </div>
          <div className="text-sm font-extrabold text-slate-900 font-mono truncate mt-0.5">
            {activeThreat.fileName}
          </div>
          <div className="text-xs text-slate-500 truncate mt-0.5">
            Location: {activeThreat.location}
          </div>
        </div>

        {/* Plain Language Reason - MERGED into one simple sentence */}
        <div className="mt-4 p-4 bg-white/90 rounded-2xl border border-rose-200/80 text-left text-xs text-slate-700 leading-relaxed font-medium">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-bold mb-0.5">Why it was flagged:</strong>
              {activeThreat.reason}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* 1. Remove It (Primary, Red) */}
        <button
          onClick={() => removeThreat(activeThreat.id)}
          className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          <span>Remove It (Recommended)</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          {/* 2. Ignore (Secondary) */}
          <button
            onClick={() => ignoreThreat(activeThreat.id)}
            className="py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <EyeOff className="w-4 h-4 text-slate-400" />
            <span>Ignore</span>
          </button>

          {/* 3. Learn More */}
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              if (!aiExplanation && !isExpanded) {
                handleFetchAiExplanation();
              }
            }}
            className="py-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-2xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Learn More</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Non-Technical Explanation */}
      {isExpanded && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 card-shadow space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Simple Explanation</span>
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              Non-Technical
            </span>
          </div>

          <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
            <p>
              {activeThreat.explanationDetails ||
                'This file was detected because its contents or actions pose a risk to your device. We stopped it before it could run.'}
            </p>

            {/* AI Assistant Plain-Language Deep Dive */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Security AI Helper</span>
              </div>

              {aiLoading ? (
                <div className="text-[11px] text-blue-600 flex items-center gap-2 py-1">
                  <Bot className="w-4 h-4 animate-spin" />
                  <span>Preparing plain-language summary...</span>
                </div>
              ) : aiExplanation ? (
                <div className="space-y-1.5 text-xs">
                  <p className="font-semibold text-slate-900">{aiExplanation.summary}</p>
                  <p className="text-slate-600">{aiExplanation.explanation}</p>
                  <p className="text-emerald-700 font-semibold pt-1">
                    💡 Advice: {aiExplanation.recommendation}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleFetchAiExplanation}
                  className="text-xs font-semibold text-blue-600 underline"
                >
                  Ask AI Helper for a simpler summary
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
