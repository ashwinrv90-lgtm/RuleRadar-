import React, { useState } from 'react';
import { SyntheticApplicant } from '../types';
import { Database, Search, Users, ArrowRight } from 'lucide-react';

interface CohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicants: SyntheticApplicant[];
}

export const CohortModal: React.FC<CohortModalProps> = ({
  isOpen,
  onClose,
  applicants
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDecision, setFilterDecision] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredApplicants = applicants.filter(a => {
    const matchDec = filterDecision === 'ALL' || a.current_decision === filterDecision;
    const matchSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.employment_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDec && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[88vh] rounded-sm shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 bg-emerald-900 dark:bg-slate-950 text-slate-100 flex items-center justify-between border-b border-emerald-950 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white uppercase font-mono tracking-wider">
                  Synthetic Loan Applicant Cohort
                </h3>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                  {applicants.length} APPLICANTS
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 dark:text-slate-400 font-sans">
                Statistically realistic synthetic data representing personal loan applicants across India.
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

        {/* Search & Filter */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, ID, city, employment type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono focus:ring-1 focus:ring-emerald-700 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>

          <select
            value={filterDecision}
            onChange={(e) => setFilterDecision(e.target.value)}
            className="px-2.5 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-emerald-700 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">All Current Decisions</option>
            <option value="APPROVED">APPROVED</option>
            <option value="MANUAL_REVIEW">MANUAL_REVIEW</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] uppercase border-b border-slate-200 dark:border-slate-700 font-bold tracking-wider">
                <tr>
                  <th className="p-2.5">ID & Name</th>
                  <th className="p-2.5">CIBIL</th>
                  <th className="p-2.5">Income</th>
                  <th className="p-2.5">Requested</th>
                  <th className="p-2.5">Exposure</th>
                  <th className="p-2.5">FOIR</th>
                  <th className="p-2.5">Inquiries (30d)</th>
                  <th className="p-2.5">DPD</th>
                  <th className="p-2.5">KYC Status</th>
                  <th className="p-2.5">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredApplicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs">
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100 font-sans">{app.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{app.id} • {app.employment_type}</div>
                    </td>
                    <td className="p-2.5 font-bold">
                      <span className={app.credit_score >= 750 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : app.credit_score >= 680 ? 'text-slate-800 dark:text-slate-200' : 'text-rose-700 dark:text-rose-400 font-bold'}>
                        {app.credit_score}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-800 dark:text-slate-200">
                      ₹{app.income.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-slate-800 dark:text-slate-100 font-bold">
                      ₹{app.requested_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400">
                      ₹{app.existing_exposure.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400">
                      {app.foir_ratio}%
                    </td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400">
                      {app.bureau_enquiries_30d}
                    </td>
                    <td className="p-2.5">
                      {app.dpd_days > 0 ? (
                        <span className="text-rose-700 dark:text-rose-300 font-bold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded-sm border border-rose-200 dark:border-rose-800">
                          {app.dpd_days}d
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600">0d</span>
                      )}
                    </td>
                    <td className="p-2.5 text-[10px] text-slate-600 dark:text-slate-400 uppercase">
                      {app.kyc_status}
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                        app.current_decision === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                        app.current_decision === 'MANUAL_REVIEW' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700' : 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      }`}>
                        {app.current_decision}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span className="text-[11px] uppercase font-bold">Showing {filteredApplicants.length} of {applicants.length} Applicants</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-sm bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Close Cohort Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
