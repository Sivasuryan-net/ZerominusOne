import React from 'react';
import { ProcessNode } from '../../types';
import { Terminal, AlertTriangle, ChevronRight, User, Hash } from 'lucide-react';

interface ProcessTreeGraphProps {
  tree: ProcessNode;
}

const ProcessTreeNode: React.FC<{ node: ProcessNode; level: number }> = ({ node, level }) => {
  return (
    <div className="space-y-1.5 font-mono text-xs">
      <div
        className={`p-3 rounded-xl border transition-colors ${
          node.isAnomalous
            ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
            : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}
        style={{ marginLeft: `${level * 16}px` }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className={`w-3.5 h-3.5 ${node.isAnomalous ? 'text-rose-400' : 'text-blue-400'}`} />
            <span className="font-bold text-white">{node.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">PID: {node.pid}</span>
          </div>

          {node.isAnomalous && (
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Anomalous Node</span>
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-400 break-all mt-1 bg-black/40 p-1.5 rounded border border-slate-800/80">
          <span className="text-slate-500">$ </span>
          {node.commandLine}
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            {node.user}
          </span>
          {node.hash && (
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3 text-slate-400" />
              {node.hash.substring(0, 12)}...
            </span>
          )}
        </div>

        {node.anomalyReason && (
          <div className="text-[10px] text-rose-300 bg-rose-900/40 p-1.5 rounded mt-1.5 font-sans font-medium">
            ⚠️ {node.anomalyReason}
          </div>
        )}
      </div>

      {node.children && node.children.length > 0 && (
        <div className="space-y-1.5">
          {node.children.map((child) => (
            <ProcessTreeNode key={child.pid} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ProcessTreeGraph: React.FC<ProcessTreeGraphProps> = ({ tree }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span>Execution Lineage & Process Hierarchy</span>
        <span className="text-[10px] text-slate-500">Parent / Child Dependency</span>
      </div>
      <div className="p-4 rounded-2xl bg-black/80 border border-slate-800 space-y-2 overflow-x-auto max-h-96">
        <ProcessTreeNode node={tree} level={0} />
      </div>
    </div>
  );
};
