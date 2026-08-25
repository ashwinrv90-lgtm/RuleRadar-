import React, { useState } from 'react';
import { RuleProposal, RuleCategory } from '../types';
import { FileText, Search, Calendar, User, ArrowRight, ShieldCheck, Download } from 'lucide-react';

interface AuditTrailViewProps {
  proposals: RuleProposal[];
  onSelectProposal: (proposal: RuleProposal) => void;
  onNewProposal: () => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  proposals,
  onSelectProposal,
  onNewProposal
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProposals = proposals.filter((p) => {
    const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.proposer_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(proposals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ruleradar_audit_ledger_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-900 dark:bg-emerald-950 text-emerald-300 dark:text-emerald-400 border border-emerald-800 dark:border-emerald-700 text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
              COMPLIANCE AUDIT TRAIL
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold uppercase tracking-wider">
              IMMUTABLE POLICY VERSIONING
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 uppercase tracking-tight">
            Policy Change Ledger & Historical Diffs
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
            Full chronological archive of all policy rule amendments, simulation baselines, multi-role briefs, and approval status.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold font-mono uppercase tracking-wider transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Ledger</span>
          </button>

          <button
            onClick={onNewProposal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-sm bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold font-mono uppercase tracking-wider transition shadow-xs cursor-pointer"
          >
            <span>+ Propose Rule</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="instrument-card p-3 rounded-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail by ID, title, field, or proposer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono focus:ring-1 focus:ring-emerald-700 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-emerald-700 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
        >
          <option value="ALL">All Categories ({proposals.length})</option>
          <option value="Eligibility">Eligibility</option>
          <option value="Bureau-check">Bureau-check</option>
          <option value="KYC">KYC</option>
          <option value="Collections/DPD">Collections/DPD</option>
        </select>
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {filteredProposals.map((prop) => (
          <div
            key={prop.id}
            onClick={() => onSelectProposal(prop)}
            className="instrument-card p-4 rounded-sm hover:border-emerald-500 dark:hover:border-emerald-600 transition cursor-pointer group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-sm">
                  {prop.id}
                </span>
                <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                  {prop.category}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase font-mono group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                  {prop.title}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider ${
                  prop.status === 'Approved'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : prop.status === 'Rejected'
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                }`}>
                  {prop.status}
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold">
                  {new Date(prop.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Diff Preview */}
            <div className="bg-slate-950 text-slate-200 p-3 rounded-sm font-mono text-xs overflow-x-auto whitespace-pre custom-scrollbar max-h-32 mb-3 border border-slate-800">
              {prop.diff_against_current}
            </div>

            {/* Footer Summary */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono pt-1 uppercase tracking-wider">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{prop.proposer_name} ({prop.proposer_role})</span>
                </span>
                <span>•</span>
                <span>Effective: {prop.effective_date}</span>
              </div>

              <div className="flex items-center space-x-1 text-emerald-800 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition">
                <span>View Full Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
