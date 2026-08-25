import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  RuleProposal, 
  ProposerRole, 
  ExistingRule,
  RuleCategory 
} from '../types';
import { 
  CreditCard, 
  TrendingUp, 
  Code2, 
  CheckSquare, 
  Layers, 
  Copy, 
  Check, 
  Sparkles, 
  Radar,
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Download, 
  ChevronRight, 
  AlertCircle, 
  Info,
  Calendar,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import { SimulationPanel } from './SimulationPanel';
import { CompliancePanel } from './CompliancePanel';
import { WizardStepper } from './WizardStepper';
import { SEED_CODE_MODULES } from '../data/seedData';

// Custom Markdown Brief Component with Theme-Matched Typography & Violet AI Accent Bullets
const MarkdownBrief: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans space-y-2">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5 font-mono uppercase tracking-wide">{children}</h3>,
          h2: ({ children }) => <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5 font-mono uppercase tracking-wide">{children}</h3>,
          h3: ({ children }) => <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-2.5 mb-1 font-mono uppercase">{children}</h4>,
          strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>,
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="space-y-1.5 my-2 list-none pl-0">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-1.5 my-2 list-decimal pl-4">{children}</ol>,
          li: ({ children }) => (
            <li className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 mt-2 shrink-0" />
              <div className="flex-1">{children}</div>
            </li>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded-xs font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-violet-700 dark:text-violet-300 border border-slate-200 dark:border-slate-700">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="p-3 my-2 rounded-sm font-mono text-[11px] bg-slate-950 dark:bg-black text-emerald-300 overflow-x-auto border border-slate-800">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

interface ImpactAnalysisProps {
  proposal: RuleProposal;
  onUpdateStatus: (id: string, status: RuleProposal['status']) => Promise<void>;
  onRegenerateBriefs: (proposal: RuleProposal) => Promise<void>;
  onBackToDashboard: () => void;
  existingRules: ExistingRule[];
  isGeneratingBriefs: boolean;
}

export const ImpactAnalysis: React.FC<ImpactAnalysisProps> = ({
  proposal,
  onUpdateStatus,
  onRegenerateBriefs,
  onBackToDashboard,
  existingRules,
  isGeneratingBriefs
}) => {
  // Default tab lands on proposer's own role first
  const [activeTab, setActiveTab] = useState<ProposerRole>(proposal.proposer_role || 'Credit');
  const [copiedPrd, setCopiedPrd] = useState(false);
  const [activeSection, setActiveSection] = useState<'briefs' | 'simulation' | 'compliance'>('briefs');

  useEffect(() => {
    if (proposal.proposer_role) {
      setActiveTab(proposal.proposer_role);
    }
  }, [proposal.id, proposal.proposer_role]);

  const briefs = proposal.ai_briefs || {
    credit: 'Analyzing credit & risk portfolio dynamics...',
    business: 'Analyzing conversion, ticket size & disbursal impact...',
    engineering: 'Analyzing LOS microservice module modifications...',
    qa: 'Compiling 5-tier test scenario suite and cross-rule interaction vectors...',
    product: 'Synthesizing executive cross-functional PRD summary...'
  };

  const handleCopyPrd = () => {
    const prdContent = `# PRD Appendix: Credit Policy Rule Impact Analysis
## Rule Proposal: ${proposal.title} [${proposal.id}]
- **Category**: ${proposal.category}
- **Proposed Logic**: \`${proposal.field} ${proposal.operator} ${proposal.threshold} ${proposal.unit || ''}\` -> \`${proposal.action}\`
- **Proposer**: ${proposal.proposer_name} (${proposal.proposer_role})
- **Effective Date**: ${proposal.effective_date}
- **Policy Rationale**: ${proposal.rationale}

**AI Executive Verdict**: ${briefs.verdict || "Recommended with monitoring — improves risk posture with balanced conversion."}

---

### 1. Executive Product Summary
${briefs.product}

---

### 2. Credit & Risk Assessment
${briefs.credit}

---

### 3. Business & Origination Volume Impact
${briefs.business}

---

### 4. Engineering Impact & Code Mapping
*(Note: Illustrative code impact based on rule-category mapping)*
${briefs.engineering}

**Impacted Code Modules**:
${proposal.matched_code_modules.map(m => `- \`${m.path}\` (${m.impactNote})`).join('\n')}

---

### 5. QA Test Plan & Rule Interaction Scenarios
${briefs.qa}

---

### 6. Portfolio Simulation Summary (~350 Synthetic Loan Applicants)
- **STP Approval Rate**: ${proposal.simulation_results?.approvalRateBefore}% -> ${proposal.simulation_results?.approvalRateAfter}%
- **Manual Review Queue**: ${proposal.simulation_results?.manualReviewRateBefore}% -> ${proposal.simulation_results?.manualReviewRateAfter}%
- **Average Ticket Size**: ₹${proposal.simulation_results?.avgTicketBefore?.toLocaleString('en-IN')} -> ₹${proposal.simulation_results?.avgTicketAfter?.toLocaleString('en-IN')}
- **Total Decision Flips**: ${proposal.simulation_results?.flippedAccountsCount} accounts

---

### 7. Regulatory Compliance Flags
${proposal.compliance_flags.map(f => `- **[${f.title}]** (${f.regulationReference}): ${f.description}`).join('\n')}

*Generated by RuleRadar LOS Policy Engine*
`;

    navigator.clipboard.writeText(prdContent);
    setCopiedPrd(true);
    setTimeout(() => setCopiedPrd(false), 2500);
  };

  // Matched code modules details
  const categoryModules = SEED_CODE_MODULES.filter(m => m.category === proposal.category);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6"
    >
      
      {/* Visual Horizontal Stepper */}
      <WizardStepper currentStep={3} />

      {/* Top Breadcrumb & Status Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider">
          <button 
            onClick={onBackToDashboard}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition flex items-center space-x-1 cursor-pointer"
          >
            <span>Ledger</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span className="font-bold text-slate-700 dark:text-slate-300">{proposal.id}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span className="font-bold text-[#064e3b] dark:text-emerald-400">Impact Analysis</span>
        </div>

        {/* Status Pill & Action Buttons */}
        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider border ${
            proposal.status === 'Approved'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              : proposal.status === 'Rejected'
              ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}>
            {proposal.status}
          </span>

          {/* AI-Specific Refresh Button (Using reserved violet AI color) */}
          <button
            onClick={() => onRegenerateBriefs(proposal)}
            disabled={isGeneratingBriefs}
            title="Re-run Gemini AI Analysis with latest parameters"
            className="px-2.5 py-1 rounded-sm border border-violet-300 dark:border-violet-700/80 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isGeneratingBriefs ? 'animate-spin text-violet-600 dark:text-violet-400' : 'text-violet-600 dark:text-violet-400'}`} />
            <span className="hidden sm:inline">Regenerate Briefs</span>
          </button>

          {proposal.status !== 'Approved' && (
            <button
              onClick={() => onUpdateStatus(proposal.id, 'Approved')}
              className="flex items-center space-x-1 px-3 py-1 rounded-sm bg-[#064e3b] hover:bg-[#065f46] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Policy</span>
            </button>
          )}

          {proposal.status !== 'Rejected' && (
            <button
              onClick={() => onUpdateStatus(proposal.id, 'Rejected')}
              className="flex items-center space-x-1 px-3 py-1 rounded-sm bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Proposal Info Card */}
      <div className="bg-slate-900 dark:bg-slate-900/90 text-slate-100 p-6 rounded-sm border border-slate-700 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider">
                {proposal.category}
              </span>
              <span className="font-mono text-xs text-slate-400 uppercase">
                RULE ID: {proposal.id}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase font-sans">
              {proposal.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-400 max-w-3xl leading-relaxed font-sans">
              {proposal.rationale}
            </p>
          </div>

          {/* Quick Logic Tag */}
          <div className="bg-slate-950 dark:bg-black p-3.5 rounded-sm border border-slate-800 shrink-0 font-mono text-xs">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-bold">Evaluated Condition</div>
            <div className="flex items-center space-x-1.5 font-bold">
              <span className="text-emerald-400">{proposal.field}</span>
              <span className="text-rose-400">{proposal.operator}</span>
              <span className="text-white bg-slate-800 px-1.5 py-0.5 rounded-sm">
                {proposal.threshold} {proposal.unit || ''}
              </span>
            </div>
            <div className="mt-1.5 text-[11px] text-slate-400">
              ACTION: <span className="text-emerald-400 font-bold">{proposal.action}</span>
            </div>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Proposer: <strong className="text-slate-200">{proposal.proposer_name}</strong> ({proposal.proposer_role})</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Effective: <strong className="text-slate-200">{proposal.effective_date}</strong></span>
            </span>
          </div>
          <div className="text-[11px] text-violet-300 font-bold uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Multi-Perspective Analysis Active</span>
          </div>
        </div>
      </div>

      {/* Section Switcher (Briefs | Simulation | Compliance) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 gap-2">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveSection('briefs')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 cursor-pointer ${
              activeSection === 'briefs'
                ? 'bg-[#064e3b] dark:bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Role Impact Briefs</span>
          </button>

          <button
            onClick={() => setActiveSection('simulation')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 cursor-pointer ${
              activeSection === 'simulation'
                ? 'bg-[#064e3b] dark:bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Simulation Panel ({proposal.simulation_results?.flippedAccountsCount || 0} Flips)</span>
          </button>

          <button
            onClick={() => setActiveSection('compliance')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 cursor-pointer ${
              activeSection === 'compliance'
                ? 'bg-[#064e3b] dark:bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Compliance Flags ({proposal.compliance_flags.length})</span>
          </button>
        </div>

        {/* Copy for PRD button */}
        <button
          onClick={handleCopyPrd}
          id="copy-for-prd-btn"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer"
        >
          {copiedPrd ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copy for PRD</span>
            </>
          )}
        </button>
      </div>

      {/* SECTION 1: ROLE BRIEFS (TABBED BY ROLE) */}
      {activeSection === 'briefs' && (
        <div className="space-y-4">
          
          {/* Headline AI Verdict Card - Prominently Displayed Above Role Tabs */}
          <div className="p-4 sm:p-5 rounded-sm border border-violet-300 dark:border-violet-700/80 bg-gradient-to-r from-violet-900/90 via-violet-950/95 to-slate-900 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-sm bg-violet-400/20 text-violet-300 border border-violet-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <Radar className="w-3 h-3 text-violet-300 animate-pulse" />
                    <span>AI Executive Verdict</span>
                  </span>
                  <span className="text-[10px] font-mono text-violet-300/70 uppercase">High-Conviction Synthesis</span>
                </div>
                <p className="text-base sm:text-lg font-semibold text-violet-100 tracking-tight leading-snug">
                  {briefs.verdict || "Recommended with monitoring — improves risk posture with balanced conversion; pilot on 15% of volume before full rollout."}
                </p>
              </div>
              <div className="shrink-0 flex items-center space-x-2">
                <span className="px-2 py-1 rounded-sm bg-violet-500/20 border border-violet-500/30 text-violet-200 text-[11px] font-mono font-bold uppercase tracking-wider">
                  &lt; 3s Quick Scan
                </span>
              </div>
            </div>
          </div>

          {/* 5 Distinct Role Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-200/80 dark:bg-slate-950 p-1.5 rounded-sm border border-slate-300 dark:border-slate-800">
            
            {/* 1. Credit Tab */}
            <button
              id="tab-role-credit"
              onClick={() => setActiveTab('Credit')}
              className={`py-2 px-3 rounded-sm text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'Credit'
                  ? 'bg-white dark:bg-slate-900 text-[#064e3b] dark:text-emerald-400 shadow-xs ring-1 ring-slate-300 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Credit</span>
              {proposal.proposer_role === 'Credit' && (
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-1 py-0.2 rounded-sm font-mono font-bold">PROPOSER</span>
              )}
            </button>

            {/* 2. Business Tab */}
            <button
              id="tab-role-business"
              onClick={() => setActiveTab('Business')}
              className={`py-2 px-3 rounded-sm text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'Business'
                  ? 'bg-white dark:bg-slate-900 text-[#064e3b] dark:text-emerald-400 shadow-xs ring-1 ring-slate-300 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Business</span>
              {proposal.proposer_role === 'Business' && (
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-1 py-0.2 rounded-sm font-mono font-bold">PROPOSER</span>
              )}
            </button>

            {/* 3. Engineering Tab */}
            <button
              id="tab-role-engineering"
              onClick={() => setActiveTab('Engineering')}
              className={`py-2 px-3 rounded-sm text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'Engineering'
                  ? 'bg-white dark:bg-slate-900 text-[#064e3b] dark:text-emerald-400 shadow-xs ring-1 ring-slate-300 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50'
              }`}
            >
              <Code2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>Engineering</span>
              {proposal.proposer_role === 'Engineering' && (
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-1 py-0.2 rounded-sm font-mono font-bold">PROPOSER</span>
              )}
            </button>

            {/* 4. QA Tab */}
            <button
              id="tab-role-qa"
              onClick={() => setActiveTab('QA')}
              className={`py-2 px-3 rounded-sm text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'QA'
                  ? 'bg-white dark:bg-slate-900 text-[#064e3b] dark:text-emerald-400 shadow-xs ring-1 ring-slate-300 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>QA</span>
              {proposal.proposer_role === 'QA' && (
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-1 py-0.2 rounded-sm font-mono font-bold">PROPOSER</span>
              )}
            </button>

            {/* 5. Product Tab */}
            <button
              id="tab-role-product"
              onClick={() => setActiveTab('Product')}
              className={`py-2 px-3 rounded-sm text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'Product'
                  ? 'bg-white dark:bg-slate-900 text-[#064e3b] dark:text-emerald-400 shadow-xs ring-1 ring-slate-300 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-700 dark:text-slate-400" />
              <span>Product</span>
              {proposal.proposer_role === 'Product' && (
                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-1 py-0.2 rounded-sm font-mono font-bold">PROPOSER</span>
              )}
            </button>

          </div>

          {/* TAB CONTENT CARDS */}
          
          {/* 1. CREDIT TAB */}
          {activeTab === 'Credit' && (
            <div className="instrument-card p-6 rounded-sm space-y-4 border border-violet-200/90 dark:border-violet-900/60 bg-gradient-to-b from-violet-50/20 via-white to-white dark:from-violet-950/20 dark:via-slate-900 dark:to-slate-900 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-sm bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase font-mono tracking-wider">Credit & Portfolio Risk Perspective</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Loss rates, expected credit loss (ECL), delinquency vintage, and underwriter queue sizing.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-800">
                    <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                    <span>AI Generated</span>
                  </span>
                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                    RISK TIER FOCUS
                  </span>
                </div>
              </div>

              <MarkdownBrief content={briefs.credit} />
            </div>
          )}

          {/* 2. BUSINESS TAB */}
          {activeTab === 'Business' && (
            <div className="instrument-card p-6 rounded-sm space-y-4 border border-violet-200/90 dark:border-violet-900/60 bg-gradient-to-b from-violet-50/20 via-white to-white dark:from-violet-950/20 dark:via-slate-900 dark:to-slate-900 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-sm bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase font-mono tracking-wider">Business, Growth & Conversion Perspective</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Funnel drop-off, STP turnaround time (TAT), monthly disbursal targets, and average ticket size.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-800">
                    <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                    <span>AI Generated</span>
                  </span>
                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                    REVENUE & VOLUME FOCUS
                  </span>
                </div>
              </div>

              <MarkdownBrief content={briefs.business} />
            </div>
          )}

          {/* 3. ENGINEERING TAB */}
          {activeTab === 'Engineering' && (
            <div className="space-y-4">
              
              {/* Mandatory Prominent Label */}
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-3.5 rounded-sm text-xs text-slate-900 dark:text-slate-200 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase font-mono text-[11px]">Illustrative code impact based on rule-category mapping, not live static analysis.</span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 font-sans">
                    This control panel correlates policy thresholds with target LOS microservice modules to predict configuration and logic changes before engineering sprint kickoff.
                  </p>
                </div>
              </div>

              {/* Engineering Brief Narrative */}
              <div className="instrument-card p-6 rounded-sm space-y-4 border border-violet-200/90 dark:border-violet-900/60 bg-gradient-to-b from-violet-50/20 via-white to-white dark:from-violet-950/20 dark:via-slate-900 dark:to-slate-900 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-sm bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase font-mono tracking-wider">Engineering Architecture & Effort Brief</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Service topology, configuration keys, database schema impact, and rollback feature flags.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-800">
                      <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                      <span>AI Generated</span>
                    </span>
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                      PLATFORM ARCHITECTURE
                    </span>
                  </div>
                </div>

                <MarkdownBrief content={briefs.engineering} />
              </div>

              {/* Impacted Code Modules List & Snippet Viewer */}
              <div className="instrument-card p-5 rounded-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider">
                    Matched LOS Code Modules in {proposal.category} ({proposal.matched_code_modules.length})
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">TARGET SERVICES</span>
                </div>

                <div className="space-y-3">
                  {proposal.matched_code_modules.map((mod, idx) => {
                    const fullMod = categoryModules.find(m => m.path === mod.path);

                    return (
                      <div key={idx} className="bg-slate-950 dark:bg-black text-slate-100 p-4 rounded-sm border border-slate-800 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-mono text-xs font-bold text-emerald-300">{mod.path}</span>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider ${
                            mod.impactType === 'threshold config change'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-900 text-slate-300 border border-slate-700'
                          }`}>
                            {mod.impactType}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 font-sans">
                          {mod.impactNote}
                        </p>

                        {fullMod && (
                          <div className="mt-2 pt-2 border-t border-slate-800">
                            <div className="text-[10px] text-slate-500 font-mono mb-1 uppercase">Code Snippet Reference:</div>
                            <pre className="text-[11px] font-mono bg-black p-2.5 rounded-sm text-emerald-300 overflow-x-auto custom-scrollbar border border-slate-800">
                              {fullMod.mockCodeSnippet}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* 4. QA TAB (Concrete Test Scenarios + Interaction Test) */}
          {activeTab === 'QA' && (
            <div className="instrument-card p-6 rounded-sm space-y-4 border border-violet-200/90 dark:border-violet-900/60 bg-gradient-to-b from-violet-50/20 via-white to-white dark:from-violet-950/20 dark:via-slate-900 dark:to-slate-900 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-sm bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase font-mono tracking-wider">QA Test Scenarios & Verification Matrix</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Concrete step-by-step test plans, boundary tests, and cross-rule conflict scenarios.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-800">
                    <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                    <span>AI Generated</span>
                  </span>
                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                    CROSS-RULE INTERACTION TESTED
                  </span>
                </div>
              </div>

              {/* Notice emphasizing cross-rule test inclusion */}
              <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 rounded-sm text-xs text-emerald-950 dark:text-emerald-200 flex items-center space-x-2 font-sans">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong>Scenario Validation:</strong> RuleRadar generated 3-5 concrete test cases tailored to this rule, specifically verifying interaction with existing live rules in <strong>{proposal.category}</strong>.
                </span>
              </div>

              <MarkdownBrief content={briefs.qa} />
            </div>
          )}

          {/* 5. PRODUCT TAB (Executive Summary + Copy for PRD) */}
          {activeTab === 'Product' && (
            <div className="instrument-card p-6 rounded-sm space-y-4 border border-violet-200/90 dark:border-violet-900/60 bg-gradient-to-b from-violet-50/20 via-white to-white dark:from-violet-950/20 dark:via-slate-900 dark:to-slate-900 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-sm bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase font-mono tracking-wider">Product Manager Executive Synthesis</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Comprehensive summary tying together Credit, Business, Engineering, and QA for your PRD.</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-800">
                    <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                    <span>AI Generated</span>
                  </span>
                  
                  {/* Copy for PRD Action */}
                  <button
                    onClick={handleCopyPrd}
                    id="copy-prd-button-product-tab"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-[#064e3b] hover:bg-[#065f46] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    {copiedPrd ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy for PRD</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <MarkdownBrief content={briefs.product} />

              {/* Ready to Paste Box */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-sm text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between font-sans">
                <span>
                  Ready to copy directly into Confluence, Jira Issue Description, or Notion PRD.
                </span>
                <span className="font-mono text-[10px] text-emerald-900 dark:text-emerald-300 font-bold uppercase tracking-wider">
                  FORMATTED IN MARKDOWN
                </span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* SECTION 2: SIMULATION PANEL */}
      {activeSection === 'simulation' && proposal.simulation_results && (
        <SimulationPanel simulation={proposal.simulation_results} />
      )}

      {/* SECTION 3: COMPLIANCE PANEL */}
      {activeSection === 'compliance' && (
        <CompliancePanel flags={proposal.compliance_flags} />
      )}

    </motion.div>
  );
};
