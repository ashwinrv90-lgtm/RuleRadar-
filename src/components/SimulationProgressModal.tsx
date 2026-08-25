import React from 'react';
import { Sparkles, Check, CheckCircle2, ShieldAlert, Cpu, Users, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type SimulationStepId = 'cohort' | 'compliance' | 'modules' | 'gemini' | 'complete';

export interface SimulationProgressState {
  currentStepIndex: number; // 0 to 4 (4 is complete)
  stepStatuses: {
    cohort: 'pending' | 'active' | 'done';
    compliance: 'pending' | 'active' | 'done';
    modules: 'pending' | 'active' | 'done';
    gemini: 'pending' | 'active' | 'done';
  };
  ruleTitle?: string;
  category?: string;
  field?: string;
}

interface SimulationProgressModalProps {
  isOpen: boolean;
  progress: SimulationProgressState;
}

const STEPS_CONFIG = [
  {
    id: 'cohort' as const,
    title: 'Testing against synthetic applicant cohort...',
    activeDetail: 'Simulating decision boundaries across 350 realistic applicant credit profiles',
    doneDetail: 'Cohort simulation complete (evaluated approvals, rejections, & review queue)',
    icon: Users,
    isAI: false
  },
  {
    id: 'compliance' as const,
    title: 'Evaluating compliance flags (RBI DLG, DPDP Act, FPC)...',
    activeDetail: 'Cross-checking regulatory directives for KFS disclosures, DPDP consent, and Fair Practices Code',
    doneDetail: 'Compliance evaluation complete (regulatory guardrails checked)',
    icon: ShieldAlert,
    isAI: false
  },
  {
    id: 'modules' as const,
    title: 'Mapping affected microservices...',
    activeDetail: 'Tracing policy parameters to LOS underwriting services and config schemas',
    doneDetail: 'Microservice dependency mapping complete',
    icon: Cpu,
    isAI: false
  },
  {
    id: 'gemini' as const,
    title: 'Generating AI briefs via Gemini...',
    activeDetail: 'Invoking Gemini model for Credit, Business, Engineering, QA, and Product perspectives',
    doneDetail: 'AI multi-perspective role briefs synthesized via Gemini',
    icon: Sparkles,
    isAI: true
  }
];

export const SimulationProgressModal: React.FC<SimulationProgressModalProps> = ({
  isOpen,
  progress
}) => {
  if (!isOpen) return null;

  const isComplete = progress.currentStepIndex >= 4;

  return (
    <AnimatePresence>
      <div 
        id="simulation-progress-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-sm shadow-2xl overflow-hidden font-sans"
        >
          {/* Modal Header */}
          <div className="bg-slate-900 dark:bg-black p-5 text-slate-100 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* AI Accent reserved pulse badge */}
                <div className="w-8 h-8 rounded-sm bg-violet-950/80 border border-violet-700/60 flex items-center justify-center text-violet-300">
                  <Sparkles className="w-4 h-4 animate-pulse text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-white">
                    Simulating Policy & Generating Briefs
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {progress.category ? `${progress.category} Engine` : 'LOS Rule Engine'} • {progress.field || 'Policy Rule'}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-1.5">
                {isComplete ? (
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono px-2.5 py-1 rounded-sm uppercase tracking-wider font-bold flex items-center space-x-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Ready</span>
                  </span>
                ) : (
                  <span className="bg-violet-950/90 text-violet-300 border border-violet-700/80 text-[10px] font-mono px-2.5 py-1 rounded-sm uppercase tracking-wider font-bold flex items-center space-x-1.5 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                    <span>Processing</span>
                  </span>
                )}
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-4 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className={`h-full ${isComplete ? 'bg-emerald-400' : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-violet-500'}`}
                initial={{ width: '10%' }}
                animate={{ 
                  width: `${Math.min(100, Math.max(15, (progress.currentStepIndex + 1) * 25))}%` 
                }}
                transition={{ duration: 0.35 }}
              />
            </div>
          </div>

          {/* Steps List */}
          <div className="p-6 space-y-3.5 bg-slate-50 dark:bg-slate-900/50">
            {STEPS_CONFIG.map((step, idx) => {
              const status = progress.stepStatuses[step.id];
              const isActive = status === 'active';
              const isDone = status === 'done';
              const isPending = status === 'pending';

              return (
                <div
                  key={step.id}
                  id={`simulation-step-${step.id}`}
                  className={`p-3.5 rounded-sm border transition-all duration-200 ${
                    isDone
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-slate-800 dark:text-slate-200'
                      : isActive
                      ? step.isAI
                        ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-300 dark:border-violet-700/80 text-violet-950 dark:text-violet-100 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 text-slate-400 dark:text-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Step State Icon */}
                    <div className="shrink-0 mt-0.5">
                      {isDone ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : isActive ? (
                        step.isAI ? (
                          <div className="w-5 h-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                        )
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-400">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    {/* Step Title & Subtext */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className={`text-xs font-bold font-mono tracking-wide ${
                          isActive && step.isAI
                            ? 'text-violet-900 dark:text-violet-300'
                            : isDone
                            ? 'text-slate-900 dark:text-slate-100'
                            : isActive
                            ? 'text-slate-900 dark:text-slate-100'
                            : 'text-slate-500 dark:text-slate-500'
                        }`}>
                          {step.title}
                        </div>

                        {/* Tag for AI step */}
                        {step.isAI && (
                          <span className="shrink-0 text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-sm bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-800">
                            AI GEMINI
                          </span>
                        )}
                      </div>

                      <p className={`text-[11px] mt-0.5 leading-normal ${
                        isActive && step.isAI
                          ? 'text-violet-700 dark:text-violet-400 font-medium'
                          : isDone
                          ? 'text-emerald-800 dark:text-emerald-400/80 font-sans'
                          : isActive
                          ? 'text-slate-600 dark:text-slate-300 font-sans'
                          : 'text-slate-400 dark:text-slate-600 font-sans'
                      }`}>
                        {isDone ? step.doneDetail : isActive ? step.activeDetail : 'Waiting in execution queue...'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Footer / Complete Transition Banner */}
          <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
            {isComplete ? (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex items-center justify-center space-x-2 text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Simulation Complete • Loading Impact Analysis...</span>
              </motion.div>
            ) : (
              <div className="w-full flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] uppercase tracking-wider">
                  Step {progress.currentStepIndex + 1} of 4 in progress
                </span>
                <span className="text-[10px] text-slate-400">
                  Do not close window
                </span>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
