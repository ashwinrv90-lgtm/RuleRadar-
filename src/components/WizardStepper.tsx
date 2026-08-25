import React from 'react';
import { Check } from 'lucide-react';

export interface WizardStepperProps {
  currentStep: 1 | 2 | 3;
  onStepClick?: (step: 1 | 2 | 3) => void;
  className?: string;
}

interface StepItem {
  number: 1 | 2 | 3;
  label: string;
  sublabel: string;
}

const STEPS: StepItem[] = [
  { number: 1, label: 'Current State', sublabel: 'Segment Baseline' },
  { number: 2, label: 'Rule Builder', sublabel: 'Formulation & Diff' },
  { number: 3, label: 'Impact Analysis', sublabel: 'Multi-Role Briefs' },
];

export const WizardStepper: React.FC<WizardStepperProps> = ({
  currentStep,
  onStepClick,
  className = ''
}) => {
  return (
    <div className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm p-4 sm:p-5 shadow-xs mb-6 ${className}`}>
      <div className="flex items-center justify-between max-w-4xl mx-auto relative">
        
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isUpcoming = currentStep < step.number;
          const isClickable = onStepClick && step.number <= currentStep;

          return (
            <React.Fragment key={step.number}>
              {/* Step Item */}
              <div 
                onClick={() => {
                  if (isClickable && onStepClick) {
                    onStepClick(step.number);
                  }
                }}
                className={`flex items-center space-x-3 z-10 transition-all ${
                  isClickable ? 'cursor-pointer group' : 'cursor-default'
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-200 shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-700 dark:bg-emerald-600 text-white ring-2 ring-emerald-500/40 shadow-xs'
                      : isActive
                      ? 'bg-emerald-800 dark:bg-emerald-600 text-white ring-4 ring-emerald-500/25 shadow-md scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span className="text-sm">{step.number}</span>
                  )}
                </div>

                {/* Step Text Label */}
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-xs ${
                      isActive 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                        : isCompleted 
                        ? 'bg-slate-100 dark:bg-slate-800 text-emerald-800 dark:text-emerald-400' 
                        : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {isActive ? 'Step In Progress' : isCompleted ? 'Completed' : `Step 0${step.number}`}
                    </span>
                  </div>
                  <span className={`text-xs sm:text-sm font-bold uppercase tracking-tight font-mono transition mt-0.5 ${
                    isActive
                      ? 'text-slate-900 dark:text-slate-100 font-extrabold'
                      : isCompleted
                      ? 'text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}>
                    {step.label}
                  </span>
                  <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                    {step.sublabel}
                  </span>
                </div>
              </div>

              {/* Connecting Bar */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4 h-1 relative bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      currentStep > step.number ? 'bg-emerald-700 dark:bg-emerald-500 w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}

      </div>
    </div>
  );
};
