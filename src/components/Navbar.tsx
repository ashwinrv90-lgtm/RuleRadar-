import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Code2, 
  Database, 
  PlusCircle, 
  RotateCcw,
  Activity,
  Sun,
  Moon
} from 'lucide-react';
import { RuleCategory } from '../types';

interface NavbarProps {
  activeView: 'dashboard' | 'new-proposal' | 'audit-log';
  setActiveView: (view: 'dashboard' | 'new-proposal' | 'audit-log') => void;
  onOpenLiveRules: () => void;
  onOpenCodeModules: () => void;
  onOpenCohort: () => void;
  onResetData: () => void;
  liveRulesCount: number;
  proposalsCount: number;
  applicantsCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onStartNewProposalWithCategory?: (cat: RuleCategory) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onOpenLiveRules,
  onOpenCodeModules,
  onOpenCohort,
  onResetData,
  liveRulesCount,
  proposalsCount,
  applicantsCount,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="h-14 bg-[#064e3b] dark:bg-[#032b21] text-white flex items-center justify-between px-4 sm:px-6 border-b border-[#065f46] dark:border-emerald-950/80 shrink-0 sticky top-0 z-40 shadow-sm transition-colors duration-150">
      <div className="flex items-center space-x-6">
        
        {/* Brand Logo & Version */}
        <button 
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-3 text-left group focus:outline-none"
          id="navbar-brand-btn"
        >
          <div className="w-8 h-8 bg-emerald-400 rounded-sm flex items-center justify-center shadow-xs">
            <div className="w-3.5 h-3.5 border-2 border-[#064e3b] rotate-45"></div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight uppercase text-white font-sans flex items-center">
              RuleRadar
              <span className="font-mono opacity-70 ml-2 text-xs font-normal tracking-normal text-emerald-200">
                v2.4.0
              </span>
            </h1>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-emerald-700/50 dark:border-emerald-900/60">
          <button
            id="nav-dashboard-tab"
            onClick={() => setActiveView('dashboard')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
              activeView === 'dashboard'
                ? 'bg-emerald-600/30 dark:bg-emerald-600/40 text-emerald-200 border border-emerald-500/50 shadow-xs'
                : 'text-emerald-100/70 hover:text-white hover:bg-emerald-700/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-audit-tab"
            onClick={() => setActiveView('audit-log')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
              activeView === 'audit-log'
                ? 'bg-emerald-600/30 dark:bg-emerald-600/40 text-emerald-200 border border-emerald-500/50 shadow-xs'
                : 'text-emerald-100/70 hover:text-white hover:bg-emerald-700/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Ledger ({proposalsCount})</span>
          </button>
        </nav>
      </div>

      {/* Quick System Reference Pills & Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        
        {/* De-emphasized, Grouped Reference Strip */}
        <div className="hidden lg:flex items-center bg-[#043327]/80 dark:bg-[#021c15]/90 border border-emerald-800/70 dark:border-emerald-900/70 rounded-sm px-2.5 py-1 text-[11px] font-mono text-emerald-200/70 shadow-xs">
          <span className="text-[9px] uppercase tracking-wider text-emerald-400/60 font-bold mr-2">LOS REF</span>
          
          <button 
            onClick={onOpenLiveRules} 
            className="hover:text-white transition cursor-pointer text-emerald-200/80 hover:underline"
            title="Inspect Live Rules Catalog"
          >
            Live Rules ({liveRulesCount})
          </button>

          <span className="text-emerald-800/90 dark:text-emerald-900 mx-2 select-none">|</span>

          <button 
            onClick={onOpenCodeModules} 
            className="hover:text-white transition cursor-pointer text-emerald-200/80 hover:underline"
            title="Inspect Mapped Code Modules"
          >
            Modules (6)
          </button>

          <span className="text-emerald-800/90 dark:text-emerald-900 mx-2 select-none">|</span>

          <button 
            onClick={onOpenCohort} 
            className="hover:text-white transition cursor-pointer text-emerald-200/80 hover:underline"
            title="Inspect Synthetic Applicant Cohort"
          >
            Cohort ({applicantsCount})
          </button>
        </div>

        {/* Small subtle divider */}
        <div className="hidden lg:block h-4 w-px bg-emerald-700/40 dark:bg-emerald-900/50" />

        {/* Theme Toggle (Sun/Moon) */}
        <button
          id="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded-sm text-emerald-200/80 hover:text-white hover:bg-emerald-800/60 dark:hover:bg-emerald-900/60 transition cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-emerald-300" />
          ) : (
            <Moon className="w-4 h-4 text-emerald-200" />
          )}
        </button>

        {/* Reset Action (tucked to side) */}
        <button
          id="nav-reset-btn"
          onClick={onResetData}
          title="Reset to default seed data"
          className="p-1.5 rounded-sm text-emerald-300/60 hover:text-white hover:bg-emerald-800/60 dark:hover:bg-emerald-900/60 transition"
          aria-label="Reset Data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Single Primary CTA: New Rule Proposal */}
        <button
          id="nav-new-proposal-btn"
          onClick={() => setActiveView('new-proposal')}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-[#064e3b] dark:text-[#022018] font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm transition active:scale-95 shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5 text-[#064e3b] dark:text-[#022018]" />
          <span>New Proposal</span>
        </button>

      </div>
    </header>
  );
};
