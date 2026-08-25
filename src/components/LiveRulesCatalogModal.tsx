import React, { useState } from 'react';
import { ExistingRule, RuleCategory } from '../types';
import { ShieldCheck, Search, Code2, Calendar, Copy } from 'lucide-react';

interface LiveRulesCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: ExistingRule[];
  onSelectRuleForProposal: (rule: ExistingRule) => void;
}

export const LiveRulesCatalogModal: React.FC<LiveRulesCatalogModalProps> = ({
  isOpen,
  onClose,
  rules,
  onSelectRuleForProposal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredRules = rules.filter(r => {
    const matchCat = selectedCategory === 'ALL' || r.category === selectedCategory;
    const matchSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[88vh] rounded-sm shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 bg-emerald-900 dark:bg-slate-950 text-slate-100 flex items-center justify-between border-b border-emerald-950 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white uppercase font-mono tracking-wider">
                  Live LOS Policy Rules Catalog
                </h3>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                  {rules.length} ACTIVE RULES
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 dark:text-slate-400 font-sans">
                Production rules engine governing personal loans and unsecured credit bureau verification.
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

        {/* Filters */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by rule name, field, ID, logic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono focus:ring-1 focus:ring-emerald-700 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-emerald-700 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="ALL">All Categories ({rules.length})</option>
              <option value="Eligibility">Eligibility</option>
              <option value="Bureau-check">Bureau-check</option>
              <option value="KYC">KYC</option>
              <option value="Collections/DPD">Collections/DPD</option>
            </select>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="instrument-card p-4 rounded-sm border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-600 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-sm">
                      {rule.id}
                    </span>
                    <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                      {rule.category}
                    </span>
                    <span className="font-bold text-xs uppercase font-mono text-slate-900 dark:text-slate-100">
                      {rule.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold">
                      {rule.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-sans">
                    {rule.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onSelectRuleForProposal(rule);
                  }}
                  className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold font-mono uppercase tracking-wider transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Propose Amendment</span>
                </button>
              </div>

              {/* Logic Box */}
              <div className="bg-slate-950 text-slate-200 p-2.5 rounded-sm font-mono text-xs flex flex-wrap items-center justify-between gap-2 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-400 font-bold">{rule.field}</span>
                  <span className="text-slate-300 font-bold">{rule.operator}</span>
                  <span className="text-white font-bold bg-slate-800 px-2 py-0.5 rounded-sm">
                    {typeof rule.threshold === 'number' && rule.threshold > 1000 ? `₹${rule.threshold.toLocaleString('en-IN')}` : rule.threshold} {rule.unit || ''}
                  </span>
                </div>
                <div className="text-[10px] uppercase font-bold">
                  <span className="text-slate-400">ACTION: </span>
                  <span className="text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded-sm border border-emerald-800">
                    {rule.action}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <Code2 className="w-3 h-3 text-slate-400" />
                  <span>Modules: {rule.linked_code_modules.join(', ')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Last Modified: {rule.last_modified_date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span className="text-[11px] uppercase font-bold">Showing {filteredRules.length} of {rules.length} Live Rules</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Close Catalog
          </button>
        </div>

      </div>
    </div>
  );
};
