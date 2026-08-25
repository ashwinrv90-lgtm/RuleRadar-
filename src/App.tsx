import React, { useState, useEffect } from 'react';
import { 
  RuleProposal, 
  ExistingRule, 
  SyntheticApplicant, 
  RuleCategory, 
  RuleOperator, 
  RuleAction, 
  ProposerRole 
} from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CurrentStateLookup } from './components/CurrentStateLookup';
import { RuleBuilder } from './components/RuleBuilder';
import { ImpactAnalysis } from './components/ImpactAnalysis';
import { AuditTrailView } from './components/AuditTrailView';
import { LiveRulesCatalogModal } from './components/LiveRulesCatalogModal';
import { CodeModulesModal } from './components/CodeModulesModal';
import { CohortModal } from './components/CohortModal';
import { SimulationProgressModal, SimulationProgressState } from './components/SimulationProgressModal';

import { 
  SEED_EXISTING_RULES, 
  SEED_PROPOSALS, 
  SEED_APPLICANTS 
} from './data/seedData';
import { 
  runRuleSimulation, 
  evaluateComplianceFlags, 
  mapImpactedCodeModules, 
  matchCodeModulesForProposal,
  generateRuleDiff,
  generateFallbackBriefs 
} from './utils/engine';

export default function App() {
  // Theme state: default to 'dark'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('ruleradar_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // fallback
    }
    return 'dark';
  });

  // Apply dark class to <html> element
  useEffect(() => {
    try {
      localStorage.setItem('ruleradar_theme', theme);
    } catch {
      // ignore
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Navigation & View State
  const [activeView, setActiveView] = useState<'dashboard' | 'new-proposal' | 'audit-log' | 'proposal-detail'>('dashboard');
  const [proposalStep, setProposalStep] = useState<1 | 2 | 3>(1);

  // Proposal Creation Workflow State
  const [selectedCategory, setSelectedCategory] = useState<RuleCategory>('Eligibility');
  const [clonedRule, setClonedRule] = useState<ExistingRule | null>(null);
  const [activeProposal, setActiveProposal] = useState<RuleProposal | null>(null);

  // Core Data State
  const [existingRules, setExistingRules] = useState<ExistingRule[]>(SEED_EXISTING_RULES);
  const [proposals, setProposals] = useState<RuleProposal[]>(SEED_PROPOSALS);
  const [applicants, setApplicants] = useState<SyntheticApplicant[]>(SEED_APPLICANTS);

  // Loading & Modal State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLiveRulesModalOpen, setIsLiveRulesModalOpen] = useState<boolean>(false);
  const [isCodeModulesModalOpen, setIsCodeModulesModalOpen] = useState<boolean>(false);
  const [isCohortModalOpen, setIsCohortModalOpen] = useState<boolean>(false);
  
  // Sequential Simulation Progress Modal State
  const [isSimulatingModalOpen, setIsSimulatingModalOpen] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<SimulationProgressState>({
    currentStepIndex: 0,
    stepStatuses: {
      cohort: 'pending',
      compliance: 'pending',
      modules: 'pending',
      gemini: 'pending'
    }
  });

  // Fetch initial data from server or fallback
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rulesRes, proposalsRes, applicantsRes] = await Promise.all([
          fetch('/api/rules').catch(() => null),
          fetch('/api/proposals').catch(() => null),
          fetch('/api/applicants').catch(() => null)
        ]);

        if (rulesRes && rulesRes.ok) {
          const rulesData = await rulesRes.json();
          if (Array.isArray(rulesData) && rulesData.length > 0) setExistingRules(rulesData);
        }
        if (proposalsRes && proposalsRes.ok) {
          const proposalsData = await proposalsRes.json();
          if (Array.isArray(proposalsData) && proposalsData.length > 0) setProposals(proposalsData);
        }
        if (applicantsRes && applicantsRes.ok) {
          const applicantsData = await applicantsRes.json();
          if (Array.isArray(applicantsData) && applicantsData.length > 0) setApplicants(applicantsData);
        }
      } catch (err) {
        console.warn('Backend API not responding, using rich client-side store:', err);
      }
    };

    fetchData();
  }, []);

  // Handle Proposal Submission & Sequential Simulation
  const handleFormulateProposal = async (formData: {
    title: string;
    category: RuleCategory;
    field: string;
    operator: RuleOperator;
    threshold: string | number;
    unit?: string;
    action: RuleAction;
    effective_date: string;
    proposer_role: ProposerRole;
    proposer_name: string;
    rationale: string;
    affected_existing_rule_id?: string;
  }) => {
    setIsSimulatingModalOpen(true);
    setIsLoading(true);

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // Step 1: Testing against synthetic applicant cohort
      setSimulationProgress({
        currentStepIndex: 0,
        stepStatuses: { cohort: 'active', compliance: 'pending', modules: 'pending', gemini: 'pending' },
        ruleTitle: formData.title,
        category: formData.category,
        field: formData.field
      });

      const matchingRule = formData.affected_existing_rule_id
        ? existingRules.find(r => r.id === formData.affected_existing_rule_id)
        : existingRules.find(r => r.category === formData.category && r.field === formData.field);
      
      const diff = generateRuleDiff(matchingRule || null, formData);
      const simulation = runRuleSimulation(formData, applicants);
      await sleep(350);

      // Step 2: Evaluating compliance flags (RBI DLG, DPDP Act, Fair Practice Code)
      setSimulationProgress(prev => ({
        ...prev,
        currentStepIndex: 1,
        stepStatuses: { cohort: 'done', compliance: 'active', modules: 'pending', gemini: 'pending' }
      }));
      const compliance = evaluateComplianceFlags(formData.category, formData.field, formData.threshold, formData.action);
      await sleep(320);

      // Step 3: Mapping affected microservices
      setSimulationProgress(prev => ({
        ...prev,
        currentStepIndex: 2,
        stepStatuses: { cohort: 'done', compliance: 'done', modules: 'active', gemini: 'pending' }
      }));
      const matchedModules = matchCodeModulesForProposal(formData.category, formData.field, !!matchingRule);
      await sleep(320);

      // Step 4: Generating AI briefs via Gemini
      setSimulationProgress(prev => ({
        ...prev,
        currentStepIndex: 3,
        stepStatuses: { cohort: 'done', compliance: 'done', modules: 'done', gemini: 'active' }
      }));

      let briefs;
      try {
        const briefRes = await fetch('/api/generate-briefs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            diff_against_current: diff,
            simulation_results: simulation,
            compliance_flags: compliance,
            matched_code_modules: matchedModules
          })
        });
        if (briefRes.ok) {
          const briefData = await briefRes.json();
          if (briefData && (briefData.credit || briefData.briefs)) {
            briefs = briefData.briefs || briefData;
          }
        }
      } catch (err) {
        console.warn('AI generation server note, applying synthesis fallback:', err);
      }

      if (!briefs || !briefs.credit) {
        briefs = generateFallbackBriefs(formData, simulation, compliance);
      }

      // Step 5: Sequential completion flash
      setSimulationProgress(prev => ({
        ...prev,
        currentStepIndex: 4,
        stepStatuses: { cohort: 'done', compliance: 'done', modules: 'done', gemini: 'done' }
      }));
      await sleep(400);

      const newProposal: RuleProposal = {
        id: `PROP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: formData.title,
        category: formData.category,
        field: formData.field,
        operator: formData.operator,
        threshold: formData.threshold,
        unit: formData.unit,
        action: formData.action,
        effective_date: formData.effective_date,
        proposer_role: formData.proposer_role,
        proposer_name: formData.proposer_name,
        rationale: formData.rationale,
        affected_existing_rule_id: formData.affected_existing_rule_id,
        diff_against_current: diff,
        status: 'Simulated',
        created_at: new Date().toISOString(),
        simulation_results: simulation,
        matched_code_modules: matchedModules,
        compliance_flags: compliance,
        ai_briefs: briefs
      };

      // Persist to server if running
      fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProposal)
      }).catch(err => console.warn('Could not persist proposal to backend:', err));

      setProposals(prev => [newProposal, ...prev]);
      setActiveProposal(newProposal);
      setIsSimulatingModalOpen(false);
      setIsLoading(false);
      setProposalStep(3);
      setActiveView('proposal-detail');
    } catch (e) {
      console.error('Simulation execution failed:', e);
      setIsSimulatingModalOpen(false);
      setIsLoading(false);
    }
  };

  // Handle Proposal Status Update (Approve / Reject)
  const handleUpdateStatus = async (proposalId: string, newStatus: RuleProposal['status']) => {
    try {
      await fetch(`/api/proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn('Status patch network note:', e);
    }

    setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: newStatus } : p));
    if (activeProposal && activeProposal.id === proposalId) {
      setActiveProposal(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Handle AI Brief Regeneration
  const handleRegenerateBriefs = async (proposal: RuleProposal) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/proposals/${proposal.id}/regenerate-briefs`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.briefs) {
          const updatedProposal = { ...proposal, ai_briefs: data.briefs };
          setProposals(prev => prev.map(p => p.id === proposal.id ? updatedProposal : p));
          setActiveProposal(updatedProposal);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('AI regen error:', e);
    }

    // Client fallback regeneration
    if (proposal.simulation_results) {
      const regeneratedBriefs = generateFallbackBriefs(
        proposal,
        proposal.simulation_results,
        proposal.compliance_flags
      );
      const updatedProposal = { ...proposal, ai_briefs: regeneratedBriefs };
      setProposals(prev => prev.map(p => p.id === proposal.id ? updatedProposal : p));
      setActiveProposal(updatedProposal);
    }
    setIsLoading(false);
  };

  // Reset to initial seed state
  const handleResetData = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setExistingRules(SEED_EXISTING_RULES);
    setProposals(SEED_PROPOSALS);
    setApplicants(SEED_APPLICANTS);
    setActiveProposal(null);
    setActiveView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#020617] flex flex-col font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-800 selection:text-white transition-colors duration-150">
      
      {/* Top Navigation */}
      <Navbar
        activeView={activeView === 'proposal-detail' ? 'dashboard' : activeView}
        setActiveView={(v) => {
          if (v === 'new-proposal') {
            setProposalStep(1);
            setClonedRule(null);
          }
          setActiveView(v);
        }}
        onOpenLiveRules={() => setIsLiveRulesModalOpen(true)}
        onOpenCodeModules={() => setIsCodeModulesModalOpen(true)}
        onOpenCohort={() => setIsCohortModalOpen(true)}
        onResetData={handleResetData}
        liveRulesCount={existingRules.filter(r => r.status === 'Live').length}
        proposalsCount={proposals.length}
        applicantsCount={applicants.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main App Container */}
      <main className="flex-1 pb-16">
        
        {/* VIEW 1: DASHBOARD */}
        {activeView === 'dashboard' && (
          <Dashboard
            proposals={proposals}
            existingRules={existingRules}
            onSelectProposal={(p) => {
              setActiveProposal(p);
              setActiveView('proposal-detail');
            }}
            onStartNewProposal={() => {
              setProposalStep(1);
              setClonedRule(null);
              setActiveView('new-proposal');
            }}
            onStartWithCategory={(cat) => {
              setSelectedCategory(cat);
              setProposalStep(1);
              setClonedRule(null);
              setActiveView('new-proposal');
            }}
          />
        )}

        {/* VIEW 2: NEW PROPOSAL WIZARD (Steps 1 & 2) */}
        {activeView === 'new-proposal' && (
          <div>
            {/* Step 1: Mandatory Current State Lookup */}
            {proposalStep === 1 && (
              <CurrentStateLookup
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                existingRules={existingRules}
                proposals={proposals}
                onProceedToBuilder={(cloned) => {
                  if (cloned) setClonedRule(cloned);
                  setProposalStep(2);
                }}
              />
            )}

            {/* Step 2: Structured Rule Builder & Live Diff */}
            {proposalStep === 2 && (
              <RuleBuilder
                category={selectedCategory}
                onBackToLookup={() => setProposalStep(1)}
                existingRules={existingRules}
                initialRule={clonedRule}
                onSubmitProposal={handleFormulateProposal}
                isLoading={isLoading}
              />
            )}
          </div>
        )}

        {/* VIEW 3: PROPOSAL DETAIL / IMPACT ANALYSIS (Step 3) */}
        {activeView === 'proposal-detail' && activeProposal && (
          <ImpactAnalysis
            proposal={activeProposal}
            onUpdateStatus={handleUpdateStatus}
            onRegenerateBriefs={handleRegenerateBriefs}
            onBackToDashboard={() => setActiveView('dashboard')}
            existingRules={existingRules}
            isGeneratingBriefs={isLoading}
          />
        )}

        {/* VIEW 4: AUDIT TRAIL LOG */}
        {activeView === 'audit-log' && (
          <AuditTrailView
            proposals={proposals}
            onSelectProposal={(p) => {
              setActiveProposal(p);
              setActiveView('proposal-detail');
            }}
            onNewProposal={() => {
              setProposalStep(1);
              setClonedRule(null);
              setActiveView('new-proposal');
            }}
          />
        )}

      </main>

      {/* Global Modals */}
      <LiveRulesCatalogModal
        isOpen={isLiveRulesModalOpen}
        onClose={() => setIsLiveRulesModalOpen(false)}
        rules={existingRules}
        onSelectRuleForProposal={(rule) => {
          setSelectedCategory(rule.category);
          setClonedRule(rule);
          setProposalStep(2);
          setActiveView('new-proposal');
        }}
      />

      <CodeModulesModal
        isOpen={isCodeModulesModalOpen}
        onClose={() => setIsCodeModulesModalOpen(false)}
      />

      <CohortModal
        isOpen={isCohortModalOpen}
        onClose={() => setIsCohortModalOpen(false)}
        applicants={applicants}
      />

      {/* Multi-step Real-time Simulation Progress Modal */}
      <SimulationProgressModal
        isOpen={isSimulatingModalOpen}
        progress={simulationProgress}
      />

      {/* Persistent Precision Status Bar */}
      <footer className="bg-slate-900 dark:bg-[#090d16] border-t border-slate-800 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 text-[11px] font-mono py-2.5 px-4 sticky bottom-0 z-30 transition-colors duration-150">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>LOS Engine Online</span>
            </span>
            <span>•</span>
            <span>Unsecured Loan Policy Sandbox</span>
            <span>•</span>
            <span>Synthetic Data Protocol Active</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-400 dark:text-slate-500">Gemini 3.7 Flash Model Integrated</span>
            <span>•</span>
            <span className="text-teal-400">RuleRadar v4.2</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
