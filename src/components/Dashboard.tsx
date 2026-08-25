import React, { useState } from 'react';
import { 
  RuleProposal, 
  RuleCategory, 
  ExistingRule 
} from '../types';
import { 
  Search, 
  Filter, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Code2,
  TrendingUp,
  UserCheck,
  SearchCode,
  FileCheck2,
  AlertOctagon,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  proposals: RuleProposal[];
  existingRules: ExistingRule[];
  onSelectProposal: (proposal: RuleProposal) => void;
  onStartNewProposal: () => void;
  onStartWithCategory: (category: RuleCategory) => void;
}

const CATEGORY_META: Record<RuleCategory, { icon: React.ComponentType<{ className?: string }>; description: string; tag: string }> = {
  'Eligibility': {
    icon: UserCheck,
    description: 'Income floors, age bounds, FOIR caps, employment type, and loan amount limits.',
    tag: 'Income & Demographics'
  },
  'Bureau-check': {
    icon: SearchCode,
    description: 'CIBIL score floors, 30-day enquiry thresholds, active trade lines, and bureau flags.',
    tag: 'CIBIL & Inquiries'
  },
  'KYC': {
    icon: FileCheck2,
    description: 'PAN/Aadhaar status, Video KYC verification, address geofencing, and DPDP rules.',
    tag: 'Identity & Geo'
  },
  'Collections/DPD': {
    icon: AlertOctagon,
    description: 'Days Past Due (DPD) limits, bounce history, SMA delinquency triggers, and recovery.',
    tag: 'Delinquency & Bounce'
  }
};

export const Dashboard: React.FC<DashboardProps> = ({
  proposals,
  existingRules,
  onSelectProposal,
  onStartWithCategory
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    const matchSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.proposer_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });

  const categories: RuleCategory[] = ['Eligibility', 'Bureau-check', 'KYC', 'Collections/DPD'];

  const liveRulesTotal = existingRules.filter(r => r.status === 'Live').length;

  return (
    <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 space-y-6">
      
      {/* 1. Concise One-Line Purpose Statement Hero (No buttons) */}
      <div className="bg-[#064e3b] dark:bg-[#032b21] text-white px-5 py-4 rounded-sm border border-[#065f46] dark:border-emerald-950 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-150">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-sm bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white uppercase font-mono flex items-center space-x-2">
              <span>Credit Policy Simulation & Audit Ledger</span>
            </h1>
            <p className="text-xs text-emerald-100/80 font-sans mt-0.5 leading-normal">
              Simulate proposed underwriting and bureau threshold changes against synthetic cohorts to analyze STP risk, code diffs, and compliance before engineering deployment.
            </p>
          </div>
        </div>
      </div>

      {/* 2. THE PRIMARY ACTION: 4 Prominent Domain Cards to start a proposal */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-0.5">
          <div>
            <h2 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider flex items-center space-x-2">
              <span>Select a Lending Domain to Start a Proposal</span>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono px-2 py-0.2 rounded-xs border border-emerald-300 dark:border-emerald-800">
                Step 1: Current State
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Choose a domain below to inspect baseline rules and formulate a new policy change proposal.
            </p>
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold uppercase tracking-wider hidden sm:block">
            Primary Starting Action
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            const liveCount = existingRules.filter(r => r.category === cat && r.status === 'Live').length;
            const propCount = proposals.filter(p => p.category === cat).length;

            return (
              <button
                key={cat}
                id={`start-proposal-category-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => onStartWithCategory(cat)}
                className="group relative p-5 rounded-sm border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-600 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 shadow-xs hover:shadow-md transition-all duration-150 text-left flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Top Bar: Icon + Live Rule Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-sm bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-800 dark:group-hover:bg-emerald-600 text-slate-700 dark:text-slate-300 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded-sm bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold uppercase">
                        {liveCount} Live Rules
                      </span>
                    </div>
                  </div>

                  {/* Domain Title & Tag */}
                  <div className="mb-1.5">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      {meta.tag}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors font-sans">
                      {cat}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed line-clamp-2 mb-4">
                    {meta.description}
                  </p>
                </div>

                {/* Bottom CTA Indicator */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/90 flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                    {propCount} historical audits
                  </span>
                  <div className="flex items-center space-x-1 text-emerald-800 dark:text-emerald-300 font-bold group-hover:translate-x-1 transition-transform">
                    <span>Start Proposal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Slim, Secondary Reference Status Strip (Compact, visually receded) */}
      <div className="bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-sm px-4 py-2 text-xs font-mono text-slate-500 dark:text-slate-400 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="text-[9px] uppercase font-bold tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded-xs">
              LOS PULSE
            </span>
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Production Rules: <strong className="text-slate-800 dark:text-slate-200">{liveRulesTotal} active</strong></span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Audited Proposals: <strong className="text-slate-800 dark:text-slate-200">{proposals.length} records</strong></span>
          </div>

          <div className="flex items-center space-x-1.5">
            <Code2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Code Modules: <strong className="text-slate-800 dark:text-slate-200">6 microservices</strong></span>
          </div>

          <div className="flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Synthetic Cohort: <strong className="text-slate-800 dark:text-slate-200">350 applicants</strong></span>
          </div>
        </div>
      </div>

      {/* 4. Proposal History & Search/Filters (Below the fold / for review) */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-0.5">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider">
              Policy Proposal Audit History ({filteredProposals.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Archive of previously simulated and audited policy amendments.
            </p>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">
            SORTED BY RECENCY
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="instrument-card p-3 rounded-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search proposals by title, rule ID, field, proposer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-emerald-600 outline-none bg-white dark:bg-slate-950 font-sans transition"
            />
          </div>

          {/* Category & Status Selectors */}
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-emerald-600 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="ALL">All Categories</option>
              <option value="Eligibility">Eligibility</option>
              <option value="Bureau-check">Bureau-check</option>
              <option value="KYC">KYC</option>
              <option value="Collections/DPD">Collections/DPD</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-emerald-600 outline-none bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            >
              <option value="ALL">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Simulated">Simulated</option>
              <option value="Draft">Draft</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Proposals Ledger List */}
        <div className="space-y-3">
          {filteredProposals.length > 0 ? (
            filteredProposals.map((proposal) => {
              const hasSim = !!proposal.simulation_results;
              const deltaApproval = hasSim ? (proposal.simulation_results!.approvalRateAfter - proposal.simulation_results!.approvalRateBefore).toFixed(1) : null;

              return (
                <div
                  key={proposal.id}
                  id={`proposal-row-${proposal.id}`}
                  onClick={() => onSelectProposal(proposal)}
                  className="instrument-card p-4 rounded-sm hover:border-emerald-500 dark:hover:border-emerald-600 transition cursor-pointer group shadow-xs"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left info */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-sm">
                          {proposal.id}
                        </span>
                        <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                          {proposal.category}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider ${
                          proposal.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : proposal.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                            : 'bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}>
                          {proposal.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition font-sans">
                        {proposal.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 max-w-2xl font-sans">
                        {proposal.rationale}
                      </p>

                      {/* Rule logic snippet */}
                      <div className="flex items-center space-x-2 pt-1 font-mono text-xs text-slate-700 dark:text-slate-300">
                        <span className="text-slate-400 dark:text-slate-500 text-[11px] uppercase">Rule Logic:</span>
                        <span className="bg-slate-950 dark:bg-black text-slate-100 px-2 py-0.5 rounded-sm text-[11px] border border-slate-800">
                          <span className="text-emerald-400">{proposal.field}</span>{' '}
                          <span className="text-rose-400">{proposal.operator}</span>{' '}
                          <span className="text-white font-bold">{proposal.threshold} {proposal.unit || ''}</span>
                          {' -> '}
                          <span className="text-emerald-400 font-bold">{proposal.action}</span>
                        </span>
                      </div>
                    </div>

                    {/* Right metrics & CTA */}
                    <div className="flex items-center space-x-4 shrink-0 lg:border-l lg:border-slate-100 dark:lg:border-slate-800 lg:pl-6">
                      {/* Simulation pill summary */}
                      {hasSim && (
                        <div className="text-right font-mono text-xs space-y-0.5 hidden sm:block">
                          <div className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">STP Approval Delta:</div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {proposal.simulation_results!.approvalRateBefore}% → {proposal.simulation_results!.approvalRateAfter}%
                            <span className={`ml-1 text-[11px] ${Number(deltaApproval) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              ({Number(deltaApproval) >= 0 ? '+' : ''}{deltaApproval}%)
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            {proposal.simulation_results!.flippedAccountsCount} flipped accounts
                          </div>
                        </div>
                      )}

                      {/* Action Arrow */}
                      <div className="p-2 rounded-sm bg-slate-50 dark:bg-slate-800 group-hover:bg-[#064e3b] dark:group-hover:bg-emerald-600 group-hover:text-white text-slate-400 dark:text-slate-500 transition">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Footer bar */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <div className="flex items-center space-x-3">
                      <span>Proposer: <strong className="text-slate-700 dark:text-slate-300">{proposal.proposer_name}</strong> ({proposal.proposer_role})</span>
                      <span>•</span>
                      <span>Created: {new Date(proposal.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                      <span>{proposal.matched_code_modules.length} Code Modules</span>
                      <span>•</span>
                      <span>{proposal.compliance_flags.length} Compliance Flags</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="instrument-card p-8 rounded-sm text-center text-slate-500 dark:text-slate-400 text-xs">
              <Filter className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase font-mono">No Proposals Found</p>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-sans">Try adjusting search or category filters above.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
