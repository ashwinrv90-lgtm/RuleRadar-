import React from 'react';
import { SEED_CODE_MODULES } from '../data/seedData';
import { Code2, Layers, ShieldCheck, AlertCircle } from 'lucide-react';

interface CodeModulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeModulesModal: React.FC<CodeModulesModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[88vh] rounded-sm shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 bg-emerald-900 dark:bg-slate-950 text-slate-100 flex items-center justify-between border-b border-emerald-950 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white uppercase font-mono tracking-wider">
                  LOS Codebase Microservices Catalog
                </h3>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                  {SEED_CODE_MODULES.length} SERVICES MAPPED
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 dark:text-slate-400 font-sans">
                Microservice modules correlated with credit policy rules across underwriting, bureau ingestion, KYC, and collections.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-sm font-bold text-lg leading-none transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Framing Disclaimer */}
        <div className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-sans">
            <strong className="text-slate-900 dark:text-slate-100">Note:</strong> Illustrative code impact based on rule-category mapping, not live static analysis. Represents the modular architecture of a modern Loan Origination System.
          </span>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {SEED_CODE_MODULES.map((mod) => (
            <div
              key={mod.id}
              className="bg-slate-900 text-slate-100 rounded-sm border border-slate-800 p-4 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded-sm border border-slate-800">
                    {mod.id}
                  </span>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                    {mod.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-white">
                    {mod.path}
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-sm uppercase tracking-wider font-bold">
                  Impact: {mod.impactTypeDefault}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-sans">
                {mod.description}
              </p>

              <div className="text-[11px] font-mono text-slate-400">
                Primary Function Entrypoint: <span className="text-emerald-300">{mod.primaryFunction}</span>
              </div>

              {/* Code Snippet Box */}
              <div>
                <pre className="text-[11px] font-mono bg-slate-950 p-3 rounded-sm text-emerald-300 overflow-x-auto custom-scrollbar border border-slate-800">
                  {mod.mockCodeSnippet}
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Close Modules Catalog
          </button>
        </div>

      </div>
    </div>
  );
};
