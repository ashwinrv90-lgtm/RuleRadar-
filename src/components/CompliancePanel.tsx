import React from 'react';
import { ComplianceFlag } from '../types';
import { 
  AlertOctagon, 
  AlertTriangle, 
  ShieldCheck, 
  FileCheck2, 
  Info,
  ExternalLink
} from 'lucide-react';

interface CompliancePanelProps {
  flags: ComplianceFlag[];
}

export const CompliancePanel: React.FC<CompliancePanelProps> = ({ flags }) => {
  const hasHighFlag = flags.some(f => f.severity === 'HIGH_FLAG');
  const hasModerateFlag = flags.some(f => f.severity === 'MODERATE_FLAG');
  const isClear = flags.every(f => f.severity === 'CLEAR');

  return (
    <div className="space-y-4">
      
      {/* Compliance Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <FileCheck2 className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider">
            Regulatory Compliance Gate & Legal Flags ({flags.length})
          </h3>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center space-x-1.5 font-mono text-xs">
          {hasHighFlag ? (
            <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 px-2.5 py-0.5 rounded-sm font-bold uppercase tracking-wider flex items-center space-x-1">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>HIGH COMPLIANCE REVIEW REQUIRED</span>
            </span>
          ) : hasModerateFlag ? (
            <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-sm font-bold uppercase tracking-wider flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              <span>MODERATE AUDIT FLAG</span>
            </span>
          ) : (
            <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-sm font-bold uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>STANDARD REVIEW APPLIES</span>
            </span>
          )}
        </div>
      </div>

      {/* Mandatory Framing Disclaimer */}
      <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-sm text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-2">
        <Info className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
        <span className="font-sans">
          <strong className="text-slate-800 dark:text-slate-200">Disclaimer:</strong> Compliance flags are deterministic pattern-matched against regulatory frameworks (RBI DLG, DPDP Act 2023, Fair Practices Code), not a substitute for formal institutional legal certification.
        </span>
      </div>

      {/* Flags List */}
      <div className="space-y-3">
        {flags.map((flag) => {
          const isHigh = flag.severity === 'HIGH_FLAG';
          const isMod = flag.severity === 'MODERATE_FLAG';
          const isStandard = flag.severity === 'CLEAR';

          return (
            <div
              key={flag.id}
              className={`p-4 rounded-sm border transition ${
                isHigh
                  ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-950 dark:text-rose-200'
                  : isMod
                  ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/30 text-slate-900 dark:text-slate-200'
                  : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {isHigh && <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                    {isMod && <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" />}
                    {isStandard && <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                      <span className="uppercase font-mono">{flag.title}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                        {flag.regulationReference}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed font-sans">
                      {flag.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Required Box */}
              <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-start space-x-2 text-xs font-sans">
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 uppercase shrink-0">
                  Mandatory Action:
                </span>
                <span className="text-slate-800 dark:text-slate-300 font-medium">
                  {flag.actionRequired}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
