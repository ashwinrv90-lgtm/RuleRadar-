import React, { useState } from 'react';
import { SimulationResults } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ClipboardCheck, 
  AlertTriangle, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Search,
  Filter
} from 'lucide-react';

interface SimulationPanelProps {
  simulation: SimulationResults;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ simulation }) => {
  const [showFlippedModal, setShowFlippedModal] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [activeBucketFilter, setActiveBucketFilter] = useState<'ALL' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW'>('ALL');

  const approvalRateDelta = Number((simulation.approvalRateAfter - simulation.approvalRateBefore).toFixed(1));
  const manualReviewDelta = Number((simulation.manualReviewRateAfter - simulation.manualReviewRateBefore).toFixed(1));
  const avgTicketDelta = simulation.avgTicketAfter - simulation.avgTicketBefore;

  // Chart data for Before vs After Rates
  const rateComparisonData = [
    {
      metric: 'Auto-Approve (STP)',
      'Current Policy': simulation.approvalRateBefore,
      'Proposed Rule': simulation.approvalRateAfter
    },
    {
      metric: 'Manual Review',
      'Current Policy': simulation.manualReviewRateBefore,
      'Proposed Rule': simulation.manualReviewRateAfter
    },
    {
      metric: 'Hard Reject',
      'Current Policy': simulation.rejectionRateBefore,
      'Proposed Rule': simulation.rejectionRateAfter
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* 4 Core Impact Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Approval Rate */}
        <div className="instrument-card p-4 rounded-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono mb-1 uppercase tracking-wider">
            <span>STP APPROVAL RATE</span>
            <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {simulation.approvalRateAfter}%
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              from {simulation.approvalRateBefore}%
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs font-semibold">
            {approvalRateDelta >= 0 ? (
              <span className="text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-sm flex items-center space-x-1 font-mono text-[11px]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{approvalRateDelta}% pp expansion</span>
              </span>
            ) : (
              <span className="text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-sm flex items-center space-x-1 font-mono text-[11px]">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{approvalRateDelta}% pp tightened</span>
              </span>
            )}
          </div>
        </div>

        {/* 2. Manual Review Queue */}
        <div className="instrument-card p-4 rounded-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono mb-1 uppercase tracking-wider">
            <span>MANUAL REVIEW LOAD</span>
            <ClipboardCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {simulation.manualReviewRateAfter}%
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              from {simulation.manualReviewRateBefore}%
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs font-semibold">
            {manualReviewDelta > 0 ? (
              <span className="text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-sm flex items-center space-x-1 font-mono text-[11px]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{manualReviewDelta}% pp ops load</span>
              </span>
            ) : (
              <span className="text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-sm flex items-center space-x-1 font-mono text-[11px]">
                <span>{manualReviewDelta}% pp queue delta</span>
              </span>
            )}
          </div>
        </div>

        {/* 3. Average Ticket Size */}
        <div className="instrument-card p-4 rounded-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono mb-1 uppercase tracking-wider">
            <span>AVG SANCTION TICKET</span>
            <DollarSign className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              ₹{(simulation.avgTicketAfter / 1000).toFixed(0)}k
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              from ₹{(simulation.avgTicketBefore / 1000).toFixed(0)}k
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs font-semibold font-mono text-[11px]">
            <span className={`px-2 py-0.5 rounded-sm border flex items-center space-x-1 ${
              avgTicketDelta >= 0 ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' : 'text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800'
            }`}>
              <span>{avgTicketDelta >= 0 ? '+' : ''}₹{avgTicketDelta.toLocaleString('en-IN')} shift</span>
            </span>
          </div>
        </div>

        {/* 4. Flipped Accounts */}
        <div className="instrument-card p-4 rounded-sm relative overflow-hidden border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300 font-mono mb-1 uppercase tracking-wider font-bold">
            <span>DECISION FLIPPED</span>
            <AlertTriangle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {simulation.flippedAccountsCount}
            </span>
            <span className="text-xs font-mono text-emerald-800 dark:text-emerald-400">
              / {simulation.totalApplicants} files
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs font-semibold text-emerald-900 dark:text-emerald-300 font-mono text-[11px]">
            <span>{((simulation.flippedAccountsCount / simulation.totalApplicants) * 100).toFixed(1)}% of cohort affected</span>
          </div>
        </div>

      </div>

      {/* Chart Visualizer: Before vs After Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider">
                Cohort Decision Distribution (% of {simulation.totalApplicants} Applicants)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Direct before-and-after comparison of applicant routing under current vs. proposed rule.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rateComparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                <Tooltip 
                  formatter={(val: number) => [`${val}%`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '4px', color: '#f8fafc', fontSize: '12px', border: '1px solid #334155' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Current Policy" fill="#64748b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Proposed Rule" fill="#059669" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flipped Accounts Summary & Drilldown Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-sm border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider">
                Flipped Accounts Breakdown
              </h4>
              <span className="text-[11px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                {simulation.flippedAccountsCount} Total
              </span>
            </div>

            {/* Sub-breakdowns */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between p-2.5 rounded-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-800 dark:text-slate-200 font-medium">Approved → Manual Review Queue:</span>
                <span className="font-mono font-bold text-slate-950 dark:text-slate-100">{simulation.flippedToReview} files</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-sm bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs">
                <span className="text-rose-900 dark:text-rose-300 font-medium">Approved → Hard Rejection:</span>
                <span className="font-mono font-bold text-rose-950 dark:text-rose-200">{simulation.flippedToRejected} files</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-sm bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs">
                <span className="text-emerald-900 dark:text-emerald-300 font-medium">Rejected / Review → Approved:</span>
                <span className="font-mono font-bold text-emerald-950 dark:text-emerald-200">{simulation.flippedToApproved} files</span>
              </div>
            </div>

            {/* Sample Flipped Account Snippet */}
            {simulation.flippedSamples.length > 0 && (
              <div className="text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-sm border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono mb-1 tracking-wider">
                  Representative Flipped Case
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>{simulation.flippedSamples[0].name}</span>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">{simulation.flippedSamples[0].id}</span>
                </div>
                <div className="flex items-center space-x-2 my-1 font-mono text-[11px]">
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-sm line-through">
                    {simulation.flippedSamples[0].oldDecision}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="bg-[#064e3b] dark:bg-emerald-700 text-white px-1.5 py-0.5 rounded-sm font-bold">
                    {simulation.flippedSamples[0].newDecision}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic font-sans">
                  "{simulation.flippedSamples[0].flipReason}"
                </p>
              </div>
            )}
          </div>

          {/* View Full Flipped List Button */}
          <button
            onClick={() => setShowFlippedModal(true)}
            id="view-all-flipped-accounts-btn"
            className="w-full mt-4 flex items-center justify-center space-x-2 py-2 px-3 rounded-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider text-xs transition cursor-pointer"
          >
            <span>Inspect All Flipped Samples ({simulation.flippedSamples.length})</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Expandable Flipped Applicant Modal / Drawer */}
      {showFlippedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[85vh] rounded-sm shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider flex items-center space-x-2">
                  <span>Flipped Cohort Diagnostics</span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-2 py-0.5 rounded-sm">
                    {simulation.flippedAccountsCount} Affected Applicants
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 font-sans">
                  Individual applicant records that alter decision state when transitioning from current policy to proposed rule.
                </p>
              </div>
              <button
                onClick={() => setShowFlippedModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded font-bold text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Filter Bar */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3 text-xs">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter by applicant name, ID, reason..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-slate-300 dark:border-slate-700 text-xs focus:ring-1 focus:ring-emerald-700 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {simulation.flippedSamples
                  .filter(s => 
                    s.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
                    s.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
                    s.flipReason.toLowerCase().includes(filterQuery.toLowerCase())
                  )
                  .map((sample) => (
                    <div key={sample.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm border border-slate-200 dark:border-slate-700">
                            {sample.id}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{sample.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            CIBIL: {sample.creditScore} | Income: ₹{sample.income.toLocaleString('en-IN')} | Req: ₹{sample.requestedAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-sans">
                          {sample.flipReason}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 font-mono text-xs">
                        <span className={`px-2 py-0.5 rounded-sm text-[11px] font-semibold ${
                          sample.oldDecision === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {sample.oldDecision}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className={`px-2 py-0.5 rounded-sm text-[11px] font-bold ${
                          sample.newDecision === 'APPROVED' ? 'bg-[#064e3b] dark:bg-emerald-700 text-white' : 
                          sample.newDecision === 'MANUAL_REVIEW' ? 'bg-slate-800 dark:bg-slate-700 text-white' : 'bg-rose-700 dark:bg-rose-800 text-white'
                        }`}>
                          {sample.newDecision}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowFlippedModal(false)}
                className="px-4 py-1.5 rounded-sm bg-[#064e3b] hover:bg-[#065f46] text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Close Diagnostic View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
