import React from 'react';
import { 
  ExistingRule, 
  RuleCategory, 
  RuleProposal 
} from '../types';
import { 
  ShieldCheck, 
  History, 
  ArrowRight, 
  Code2, 
  Calendar, 
  Layers, 
  AlertCircle,
  Copy,
  Info
} from 'lucide-react';
import { WizardStepper } from './WizardStepper';

interface CurrentStateLookupProps {
  selectedCategory: RuleCategory;
  onSelectCategory: (cat: RuleCategory) => void;
  existingRules: ExistingRule[];
  proposals: RuleProposal[];
  onProceedToBuilder: (clonedRule?: ExistingRule) => void;
}

const CATEGORY_INFO: Record<RuleCategory, { label: string; desc: string; icon: string; fieldCount: number }> = {
  'Eligibility': {
    label: 'Eligibility & Demographics',
    desc: 'Income floors, age gates, approved employment categories, and basic underwriting criteria.',
    icon: '👤',
    fieldCount: 4
  },
  'Bureau-check': {
    label: 'Bureau-check & Underwriting',
    desc: 'CIBIL/Experian score cutoffs, unsecured exposure aggregates, enquiry velocity, and FOIR ratio.',
    icon: '📊',
    fieldCount: 5
  },
  'KYC': {
    label: 'KYC & Identity Verification',
    desc: 'Aadhaar XML, PAN OCR matching, mandatory Video-KYC triggers, and penny-drop bank verification.',
    icon: '🪪',
    fieldCount: 3
  },
  'Collections/DPD': {
    label: 'Collections & DPD Triggers',
    desc: 'Delinquency alerting milestones (DPD 5, 15, 30, 60), disbursal halts, and legal intimation dispatch.',
    icon: '⚠️',
    fieldCount: 4
  }
};

export const CurrentStateLookup: React.FC<CurrentStateLookupProps> = ({
  selectedCategory,
  onSelectCategory,
  existingRules,
  proposals,
  onProceedToBuilder
}) => {
  // Filter live rules for this category
  const categoryRules = existingRules.filter(
    r => r.category === selectedCategory && r.status === 'Live'
  );

  // Find most recent proposal in this category
  const categoryProposals = proposals
    .filter(p => p.category === selectedCategory)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  const mostRecentProposal = categoryProposals[0] || null;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Visual Horizontal Stepper */}
      <WizardStepper currentStep={1} />

      {/* Intro Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight uppercase font-sans">
          Current State & Rule Interaction Lookup
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl font-sans">
          Before proposing a new rule, inspect all live rules currently governing this segment and review the most recent historical change. RuleRadar uses this baseline to detect cross-rule friction and compile test cases.
        </p>
      </div>

      {/* Category Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(Object.keys(CATEGORY_INFO) as RuleCategory[]).map((cat) => {
          const isSelected = selectedCategory === cat;
          const info = CATEGORY_INFO[cat];
          const rulesInCat = existingRules.filter(r => r.category === cat && r.status === 'Live').length;

          return (
            <button
              key={cat}
              id={`cat-select-${cat.toLowerCase().replace(/[^a-z]/g, '-')}`}
              onClick={() => onSelectCategory(cat)}
              className={`p-3.5 rounded-sm text-left border transition-all relative cursor-pointer ${
                isSelected 
                  ? 'bg-[#064e3b] dark:bg-[#043327] text-white border-emerald-800 dark:border-emerald-600 shadow-xs' 
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{info.icon}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider ${
                  isSelected ? 'bg-emerald-800/80 dark:bg-emerald-900/90 text-emerald-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {rulesInCat} Live Rules
                </span>
              </div>
              <div className="font-bold text-xs uppercase tracking-wider mb-1 font-mono">{cat}</div>
              <div className={`text-[11px] line-clamp-2 font-sans ${isSelected ? 'text-emerald-100/80' : 'text-slate-500 dark:text-slate-400'}`}>
                {info.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Framing Banner: "Here's what's currently running and what last changed here" */}
      <div className="bg-slate-900 dark:bg-slate-900/90 text-white p-4 rounded-sm border border-slate-700 dark:border-slate-800 shadow-xs mb-6 flex items-start space-x-3">
        <div className="p-2 rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 mt-0.5">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-wider text-emerald-300 uppercase font-mono">
            Segment Baseline: {selectedCategory}
          </h2>
          <p className="text-xs text-slate-300 dark:text-slate-400 mt-0.5 font-sans">
            Here is what is currently running live in production for <strong className="text-emerald-300 uppercase font-mono">{selectedCategory}</strong> and the most recent policy change recorded in the audit trail.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column: Currently Live Rules in Selected Category (2 cols wide) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Active Production Rules ({categoryRules.length})</span>
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider font-bold">Status: ALL LIVE</span>
          </div>

          <div className="space-y-3">
            {categoryRules.map((rule) => (
              <div 
                key={rule.id}
                id={`rule-card-${rule.id}`}
                className="instrument-card p-4 rounded-sm hover:border-emerald-500 dark:hover:border-emerald-600 transition group relative shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-sm">
                        {rule.id}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase font-mono">
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
                  
                  {/* Clone / Modify Button */}
                  <button
                    onClick={() => onProceedToBuilder(rule)}
                    title="Clone this rule into Rule Builder"
                    className="shrink-0 flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-sm transition cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Tweak</span>
                  </button>
                </div>

                {/* Rule Logic Box */}
                <div className="bg-slate-950 dark:bg-black text-slate-200 p-3 rounded-sm font-mono text-xs mb-2 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">{rule.field}</span>
                    <span className="text-rose-400 font-bold">{rule.operator}</span>
                    <span className="text-white font-bold bg-slate-800 dark:bg-slate-900 px-2 py-0.5 rounded-sm border border-slate-700">
                      {typeof rule.threshold === 'number' && rule.threshold > 1000 
                        ? `₹${rule.threshold.toLocaleString('en-IN')}`
                        : rule.threshold} {rule.unit || ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px] uppercase font-bold">
                    <span className="text-slate-400">THEN</span>
                    <span className="text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-sm">
                      {rule.action}
                    </span>
                  </div>
                </div>

                {/* Footer Info: Linked Modules & Last Modified */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1 uppercase tracking-wider">
                  <div className="flex items-center space-x-1 truncate max-w-md">
                    <Code2 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-600 dark:text-slate-400">
                      {rule.linked_code_modules.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Updated {rule.last_modified_date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Most Recent Past Proposal (1 col wide) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider flex items-center space-x-2">
              <History className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Last Changed In Category</span>
            </h3>
          </div>

          {mostRecentProposal ? (
            <div className="instrument-card p-4 rounded-sm border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-sm">
                  {mostRecentProposal.id}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider ${
                  mostRecentProposal.status === 'Approved'
                    ? 'bg-[#064e3b] text-white'
                    : mostRecentProposal.status === 'Simulated'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-700 text-white'
                }`}>
                  {mostRecentProposal.status}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase font-mono mb-1">
                {mostRecentProposal.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 font-sans">
                Proposed by <strong className="text-slate-800 dark:text-slate-200">{mostRecentProposal.proposer_name}</strong> ({mostRecentProposal.proposer_role}) on {new Date(mostRecentProposal.created_at).toLocaleDateString()}
              </p>

              {/* Diff snippet */}
              <div className="mb-3">
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase mb-1 font-bold tracking-wider">Audit Diff Snapshot</div>
                <div className="bg-slate-950 dark:bg-black text-slate-200 p-2.5 rounded-sm text-[10px] font-mono overflow-x-auto whitespace-pre custom-scrollbar max-h-36 border border-slate-800">
                  {mostRecentProposal.diff_against_current}
                </div>
              </div>

              {/* Simulation outcome metrics */}
              {mostRecentProposal.simulation_results && (
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-sm border border-emerald-200 dark:border-emerald-900/70 text-xs space-y-1 mb-3 font-sans">
                  <div className="flex justify-between font-mono text-[10px] uppercase">
                    <span className="text-slate-600 dark:text-slate-400">Approval Rate Delta:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {mostRecentProposal.simulation_results.approvalRateBefore}% → {mostRecentProposal.simulation_results.approvalRateAfter}%
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] uppercase">
                    <span className="text-slate-600 dark:text-slate-400">Flipped Accounts:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {mostRecentProposal.simulation_results.flippedAccountsCount} files
                    </span>
                  </div>
                </div>
              )}

              <div className="text-[10px] text-emerald-900 dark:text-emerald-200 font-mono font-bold uppercase tracking-wider bg-emerald-100/80 dark:bg-emerald-950/60 p-2 rounded-sm flex items-center space-x-1.5 border border-emerald-200 dark:border-emerald-800">
                <Info className="w-3.5 h-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                <span>Audited in permanent ledger.</span>
              </div>
            </div>
          ) : (
            <div className="instrument-card p-6 rounded-sm text-center text-slate-500 dark:text-slate-400 text-xs">
              <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300 uppercase font-mono text-xs">No Prior Proposals</p>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-sans">This category has operated on baseline configuration without recent changes.</p>
            </div>
          )}

          {/* Quick Guidance Box */}
          <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-sm text-xs text-slate-700 dark:text-slate-300">
            <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center space-x-1.5 font-mono uppercase text-[10px] tracking-wider">
              <Info className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Next Step: Formulate Rule</span>
            </h5>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans text-xs">
              When ready, proceed to the Rule Builder. RuleRadar will calculate real-time diffs, map impacted LOS code modules, evaluate regulatory flags, and run automated Monte Carlo style portfolio simulations.
            </p>
          </div>

        </div>

      </div>

      {/* Action Footer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-sm shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          Selected Category: <strong className="text-[#064e3b] dark:text-emerald-400 uppercase">{selectedCategory}</strong> ({categoryRules.length} live rules evaluated)
        </div>
        <button
          id="proceed-to-builder-btn"
          onClick={() => onProceedToBuilder()}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-sm bg-[#064e3b] hover:bg-[#065f46] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition active:scale-95 cursor-pointer"
        >
          <span>Formulate Proposed Rule in {selectedCategory}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
