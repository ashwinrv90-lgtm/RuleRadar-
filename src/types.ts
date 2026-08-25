export type RuleCategory = 'Eligibility' | 'Bureau-check' | 'KYC' | 'Collections/DPD';

export type RuleOperator = '>=' | '<=' | '==' | '!=' | 'IN' | 'NOT_IN' | '>' | '<';

export type RuleAction = 
  | 'APPROVE' 
  | 'REJECT' 
  | 'FLAG_MANUAL_REVIEW' 
  | 'REQUIRE_VKYC' 
  | 'TRIGGER_ESCALATION' 
  | 'HALT_DISBURSAL' 
  | 'TRIGGER_SOFT_NOTICE';

export type ProposerRole = 'Credit' | 'Business' | 'Engineering' | 'QA' | 'Product';

export type ProposalStatus = 'Draft' | 'Simulated' | 'Approved' | 'Rejected';

export interface ExistingRule {
  id: string;
  name: string;
  category: RuleCategory;
  field: string;
  fieldLabel: string;
  operator: RuleOperator;
  threshold: string | number;
  unit?: string;
  action: RuleAction;
  actionLabel: string;
  status: 'Live' | 'Deprecated';
  last_modified_date: string;
  linked_code_modules: string[];
  description: string;
  version: string;
}

export interface CodeModule {
  id: string;
  path: string;
  category: RuleCategory;
  description: string;
  primaryFunction: string;
  impactTypeDefault: 'threshold config change' | 'new conditional logic required' | 'orchestration update';
  mockCodeSnippet: string;
}

export interface SyntheticApplicant {
  id: string;
  name: string;
  income: number; // monthly in INR
  age: number;
  credit_score: number;
  existing_exposure: number; // in INR
  dpd_days: number;
  employment_type: 'SALARIED' | 'SELF_EMPLOYED_PROFESSIONAL' | 'SELF_EMPLOYED_BUSINESS' | 'GIG_WORKER';
  kyc_status: 'VERIFIED_AADHAAR_PAN' | 'PENDING_VKYC' | 'FAILED_PENNY_DROP' | 'NAME_MISMATCH';
  requested_amount: number;
  bureau_enquiries_30d: number;
  foir_ratio: number; // percentage, e.g. 45
  current_decision: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
  flagged_rules: string[];
}

export interface SimulationResults {
  totalApplicants: number;
  approvalRateBefore: number;
  approvalRateAfter: number;
  avgTicketBefore: number;
  avgTicketAfter: number;
  manualReviewRateBefore: number;
  manualReviewRateAfter: number;
  rejectionRateBefore: number;
  rejectionRateAfter: number;
  flippedAccountsCount: number;
  flippedToApproved: number;
  flippedToRejected: number;
  flippedToReview: number;
  flippedSamples: Array<{
    id: string;
    name: string;
    creditScore: number;
    income: number;
    requestedAmount: number;
    oldDecision: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
    newDecision: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
    flipReason: string;
  }>;
  distributionByScore: Array<{
    range: string;
    approvedBefore: number;
    approvedAfter: number;
  }>;
}

export interface ComplianceFlag {
  id: string;
  severity: 'HIGH_FLAG' | 'MODERATE_FLAG' | 'INFO_FLAG' | 'CLEAR';
  title: string;
  regulationReference: string;
  description: string;
  actionRequired: string;
}

export interface AIBriefs {
  verdict?: string;
  credit: string;
  business: string;
  engineering: string;
  qa: string;
  product: string;
}

export interface RuleProposal {
  id: string;
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
  diff_against_current: string;
  affected_existing_rule_id?: string;
  status: ProposalStatus;
  created_at: string;
  simulation_results?: SimulationResults;
  compliance_flags: ComplianceFlag[];
  ai_briefs?: AIBriefs;
  matched_code_modules: Array<{
    path: string;
    impactNote: string;
    impactType: 'threshold config change' | 'new conditional logic required';
  }>;
}
