import { ExistingRule, CodeModule, SyntheticApplicant, RuleProposal } from '../types';

export const SEED_EXISTING_RULES: ExistingRule[] = [
  // --- Eligibility ---
  {
    id: 'RULE-ELIG-001',
    name: 'Minimum Monthly Net Income',
    category: 'Eligibility',
    field: 'income',
    fieldLabel: 'Monthly Net Income',
    operator: '>=',
    threshold: 25000,
    unit: '₹ / month',
    action: 'APPROVE',
    actionLabel: 'Proceed to Bureau Stage',
    status: 'Live',
    last_modified_date: '2026-02-14',
    linked_code_modules: ['underwriting-engine/eligibility-check.ts'],
    description: 'Ensures applicant has minimum verifiable monthly salary for tier-1 & tier-2 unsecured personal loans.',
    version: 'v2.4.0'
  },
  {
    id: 'RULE-ELIG-002',
    name: 'Minimum Age at Application',
    category: 'Eligibility',
    field: 'age',
    fieldLabel: 'Applicant Age',
    operator: '>=',
    threshold: 21,
    unit: 'Years',
    action: 'REJECT',
    actionLabel: 'Hard Reject (< 21)',
    status: 'Live',
    last_modified_date: '2025-11-05',
    linked_code_modules: ['underwriting-engine/eligibility-check.ts'],
    description: 'Underwriting cut-off: Min age requirement for contracting loan liability.',
    version: 'v1.0.0'
  },
  {
    id: 'RULE-ELIG-003',
    name: 'Maximum Age at Loan Maturity',
    category: 'Eligibility',
    field: 'age',
    fieldLabel: 'Applicant Age',
    operator: '<=',
    threshold: 58,
    unit: 'Years',
    action: 'REJECT',
    actionLabel: 'Hard Reject (> 58)',
    status: 'Live',
    last_modified_date: '2025-11-05',
    linked_code_modules: ['underwriting-engine/eligibility-check.ts'],
    description: 'Upper age bound to ensure repayment within normal retirement age horizon.',
    version: 'v1.0.0'
  },
  {
    id: 'RULE-ELIG-004',
    name: 'Approved Employment Classifications',
    category: 'Eligibility',
    field: 'employment_type',
    fieldLabel: 'Employment Type',
    operator: 'IN',
    threshold: 'SALARIED, SELF_EMPLOYED_PROFESSIONAL',
    unit: 'Allowed Classes',
    action: 'FLAG_MANUAL_REVIEW',
    actionLabel: 'Manual Credit Underwriter Review for Non-Salaried',
    status: 'Live',
    last_modified_date: '2026-01-10',
    linked_code_modules: ['underwriting-engine/eligibility-check.ts'],
    description: 'Gig workers and unverified proprietorships routed to manual cashflow assessment.',
    version: 'v1.3.0'
  },

  // --- Bureau-check ---
  {
    id: 'RULE-BUR-001',
    name: 'Prime Bureau Score Hard Gate',
    category: 'Bureau-check',
    field: 'credit_score',
    fieldLabel: 'CIBIL / Experian Credit Score',
    operator: '>=',
    threshold: 700,
    unit: 'Score',
    action: 'APPROVE',
    actionLabel: 'Auto Underwriting Approval',
    status: 'Live',
    last_modified_date: '2026-03-01',
    linked_code_modules: ['bureau-service/score-fetch.ts', 'underwriting-engine/eligibility-check.ts'],
    description: 'Credit score threshold for straight-through processing (STP) disbursal.',
    version: 'v3.1.0'
  },
  {
    id: 'RULE-BUR-002',
    name: 'Subprime Manual Review Band',
    category: 'Bureau-check',
    field: 'credit_score',
    fieldLabel: 'CIBIL / Experian Credit Score',
    operator: '>=',
    threshold: 650,
    unit: 'Score',
    action: 'FLAG_MANUAL_REVIEW',
    actionLabel: 'Credit Officer Manual Review',
    status: 'Live',
    last_modified_date: '2026-03-01',
    linked_code_modules: ['bureau-service/score-fetch.ts'],
    description: 'Applicants with score between 650 and 699 require bank statement analysis.',
    version: 'v3.1.0'
  },
  {
    id: 'RULE-BUR-003',
    name: 'Aggregate Unsecured Exposure Cap',
    category: 'Bureau-check',
    field: 'existing_exposure',
    fieldLabel: 'Total Active Unsecured Debt',
    operator: '<=',
    threshold: 800000,
    unit: '₹ Total Active Debt',
    action: 'REJECT',
    actionLabel: 'Hard Exposure Cap Reject',
    status: 'Live',
    last_modified_date: '2026-01-20',
    linked_code_modules: ['bureau-service/exposure-aggregator.ts'],
    description: 'Caps cumulative unsecured credit risk across all reporting credit institutions.',
    version: 'v2.0.0'
  },
  {
    id: 'RULE-BUR-004',
    name: '30-Day Credit Inquiry Velocity Guardrail',
    category: 'Bureau-check',
    field: 'bureau_enquiries_30d',
    fieldLabel: 'Bureau Inquiries (Last 30 Days)',
    operator: '<=',
    threshold: 3,
    unit: 'Hard Inquiries',
    action: 'FLAG_MANUAL_REVIEW',
    actionLabel: 'Flag Credit-Hungry Behavior',
    status: 'Live',
    last_modified_date: '2025-12-18',
    linked_code_modules: ['bureau-service/score-fetch.ts'],
    description: 'Detects simultaneous multi-app loan churning and stacking attempts.',
    version: 'v1.2.0'
  },
  {
    id: 'RULE-BUR-005',
    name: 'Fixed Obligation to Income Ratio (FOIR)',
    category: 'Bureau-check',
    field: 'foir_ratio',
    fieldLabel: 'FOIR Ratio',
    operator: '<=',
    threshold: 55,
    unit: '% of Monthly Income',
    action: 'REJECT',
    actionLabel: 'Overleveraged Reject',
    status: 'Live',
    last_modified_date: '2026-02-02',
    linked_code_modules: ['bureau-service/exposure-aggregator.ts'],
    description: 'Prevents debt servicing obligations exceeding 55% of verifiable net earnings.',
    version: 'v2.1.0'
  },

  // --- KYC ---
  {
    id: 'RULE-KYC-001',
    name: 'Automated Aadhaar / PAN OCR Validation',
    category: 'KYC',
    field: 'kyc_status',
    fieldLabel: 'KYC Verification Result',
    operator: '==',
    threshold: 'VERIFIED_AADHAAR_PAN',
    unit: 'Verification State',
    action: 'APPROVE',
    actionLabel: 'Instant KYC Clearance',
    status: 'Live',
    last_modified_date: '2026-02-28',
    linked_code_modules: ['kyc-service/ekyc-validation.ts'],
    description: 'Instant e-KYC validation against UIDAI and NSDL databases with name confidence >= 85%.',
    version: 'v4.0.0'
  },
  {
    id: 'RULE-KYC-002',
    name: 'Mandatory Video-KYC for High-Ticket Disbursals',
    category: 'KYC',
    field: 'requested_amount',
    fieldLabel: 'Sanction Loan Amount',
    operator: '>=',
    threshold: 500000,
    unit: '₹ Sanction Amount',
    action: 'REQUIRE_VKYC',
    actionLabel: 'Route to Video-KYC Agent Queue',
    status: 'Live',
    last_modified_date: '2025-10-14',
    linked_code_modules: ['kyc-service/ekyc-validation.ts'],
    description: 'Regulatory mandate: Unassisted digital onboarding capped at ₹5L without live agent V-KYC.',
    version: 'v2.0.0'
  },
  {
    id: 'RULE-KYC-003',
    name: 'Penny Drop Bank Account Name Matching',
    category: 'KYC',
    field: 'kyc_status',
    fieldLabel: 'Penny Drop Status',
    operator: '!=',
    threshold: 'FAILED_PENNY_DROP',
    unit: 'Bank Validation State',
    action: 'HALT_DISBURSAL',
    actionLabel: 'Halt Disbursal for Bank Recertification',
    status: 'Live',
    last_modified_date: '2026-01-08',
    linked_code_modules: ['kyc-service/ekyc-validation.ts'],
    description: 'Protects against third-party beneficiary fraud by confirming ₹1 IMPS penny drop match.',
    version: 'v1.5.0'
  },

  // --- Collections/DPD ---
  {
    id: 'RULE-COL-001',
    name: 'Early Warning Soft Delinquency Alert',
    category: 'Collections/DPD',
    field: 'dpd_days',
    fieldLabel: 'Days Past Due (DPD)',
    operator: '>=',
    threshold: 5,
    unit: 'Days Past Due',
    action: 'TRIGGER_SOFT_NOTICE',
    actionLabel: 'Automated WhatsApp & App In-Box Reminder',
    status: 'Live',
    last_modified_date: '2026-02-10',
    linked_code_modules: ['collections/dpd-flagging.ts'],
    description: 'Triggers polite digital notifications upon first grace-period expiry.',
    version: 'v2.0.0'
  },
  {
    id: 'RULE-COL-002',
    name: 'SMA-0 Hard Block on Top-Up Disbursals',
    category: 'Collections/DPD',
    field: 'dpd_days',
    fieldLabel: 'Days Past Due (DPD)',
    operator: '>=',
    threshold: 15,
    unit: 'Days Past Due',
    action: 'HALT_DISBURSAL',
    actionLabel: 'Freeze Credit Line & Pre-Approved Offers',
    status: 'Live',
    last_modified_date: '2026-02-10',
    linked_code_modules: ['collections/dpd-flagging.ts', 'collections/escalation-engine.ts'],
    description: 'Stops fresh credit drawdown if existing facility exceeds 15 days overdue.',
    version: 'v1.4.0'
  },
  {
    id: 'RULE-COL-003',
    name: 'SMA-1 Tele-Calling & Escalation Trigger',
    category: 'Collections/DPD',
    field: 'dpd_days',
    fieldLabel: 'Days Past Due (DPD)',
    operator: '>=',
    threshold: 30,
    unit: 'Days Past Due',
    action: 'TRIGGER_ESCALATION',
    actionLabel: 'Assign to Tier-1 Dedicated Collections Executive',
    status: 'Live',
    last_modified_date: '2026-01-15',
    linked_code_modules: ['collections/escalation-engine.ts'],
    description: 'Auto-allocates delinquent accounts to phone outreach queues governed by Fair Practices Code.',
    version: 'v2.2.0'
  },
  {
    id: 'RULE-COL-004',
    name: 'SMA-2 Legal Notice Pre-Classification',
    category: 'Collections/DPD',
    field: 'dpd_days',
    fieldLabel: 'Days Past Due (DPD)',
    operator: '>=',
    threshold: 60,
    unit: 'Days Past Due',
    action: 'TRIGGER_ESCALATION',
    actionLabel: 'Issue Section 138 / Section 25 Payment Intimation Notice',
    status: 'Live',
    last_modified_date: '2025-12-01',
    linked_code_modules: ['collections/escalation-engine.ts'],
    description: 'Initiates formal legal notification workflow 30 days prior to standard 90 DPD NPA tagging.',
    version: 'v1.1.0'
  }
];

export const SEED_CODE_MODULES: CodeModule[] = [
  {
    id: 'MOD-001',
    path: 'underwriting-engine/eligibility-check.ts',
    category: 'Eligibility',
    description: 'Evaluates applicant demographic, income, age, and employment eligibility criteria.',
    primaryFunction: 'evaluateEligibilityRules(applicant: ApplicantContext): EligibilityOutcome',
    impactTypeDefault: 'threshold config change',
    mockCodeSnippet: `// underwriting-engine/eligibility-check.ts
export function evaluateEligibilityRules(applicant: ApplicantContext): EligibilityOutcome {
  // Threshold config loaded from rules engine
  if (applicant.monthlyNetIncome < CONFIG.ELIGIBILITY.MIN_MONTHLY_INCOME) { // ₹25,000
    return { passed: false, reason: 'INSUFFICIENT_INCOME', action: 'REJECT' };
  }
  if (applicant.age < CONFIG.ELIGIBILITY.MIN_AGE || applicant.age > CONFIG.ELIGIBILITY.MAX_AGE) {
    return { passed: false, reason: 'AGE_RESTRICTION', action: 'REJECT' };
  }
  return { passed: true, reason: 'ELIGIBILITY_CLEARED', action: 'PROCEED' };
}`
  },
  {
    id: 'MOD-002',
    path: 'bureau-service/score-fetch.ts',
    category: 'Bureau-check',
    description: 'Fetches, caches, and interprets Experian & CIBIL bureau scores and inquiry velocity.',
    primaryFunction: 'assessBureauScoreGate(bureauReport: BureauPayload): BureauAssessment',
    impactTypeDefault: 'threshold config change',
    mockCodeSnippet: `// bureau-service/score-fetch.ts
export function assessBureauScoreGate(bureau: BureauPayload): BureauAssessment {
  if (bureau.cibilScore >= CONFIG.BUREAU.AUTO_APPROVE_MIN_SCORE) { // 700
    return { decision: 'AUTO_APPROVE', riskTier: 'PRIME' };
  }
  if (bureau.cibilScore >= CONFIG.BUREAU.MANUAL_REVIEW_MIN_SCORE) { // 650
    return { decision: 'MANUAL_REVIEW', riskTier: 'NEAR_PRIME' };
  }
  return { decision: 'REJECT', riskTier: 'SUBPRIME' };
}`
  },
  {
    id: 'MOD-003',
    path: 'bureau-service/exposure-aggregator.ts',
    category: 'Bureau-check',
    description: 'Calculates cumulative active unsecured debt, FOIR ratio, and bureau tradeline health.',
    primaryFunction: 'computeExposureCaps(tradelines: Tradeline[]): ExposureVerdict',
    impactTypeDefault: 'new conditional logic required',
    mockCodeSnippet: `// bureau-service/exposure-aggregator.ts
export function computeExposureCaps(tradelines: Tradeline[], monthlyIncome: number): ExposureVerdict {
  const activeUnsecured = tradelines
    .filter(t => t.isUnsecured && t.status === 'ACTIVE')
    .reduce((sum, t) => sum + t.currentBalance, 0);

  if (activeUnsecured > CONFIG.BUREAU.MAX_UNSECURED_EXPOSURE) { // ₹8,00,000
    return { passed: false, flag: 'EXPOSURE_CAP_EXCEEDED' };
  }
  return { passed: true, activeUnsecuredTotal: activeUnsecured };
}`
  },
  {
    id: 'MOD-004',
    path: 'kyc-service/ekyc-validation.ts',
    category: 'KYC',
    description: 'Validates Aadhaar XML, PAN OCR matching, penny-drop account validation, and V-KYC routing.',
    primaryFunction: 'validateKYCPipeline(kycData: KYCRecord, loanAmount: number): KYCResponse',
    impactTypeDefault: 'new conditional logic required',
    mockCodeSnippet: `// kyc-service/ekyc-validation.ts
export function validateKYCPipeline(kycData: KYCRecord, loanAmount: number): KYCResponse {
  if (kycData.pennyDropStatus === 'FAILED') {
    return { status: 'HALT_DISBURSAL', code: 'BENEFICIARY_MISMATCH' };
  }
  if (loanAmount >= CONFIG.KYC.MANDATORY_VKYC_THRESHOLD) { // ₹5,00,000
    return { status: 'REQUIRE_VKYC', queue: 'VIDEO_AGENT_DISPATCH' };
  }
  return { status: 'VERIFIED', queue: 'AUTO_DISBURSAL' };
}`
  },
  {
    id: 'MOD-005',
    path: 'collections/dpd-flagging.ts',
    category: 'Collections/DPD',
    description: 'Tracks day-past-due (DPD) schedules, delinquency buckets, and digital communication triggers.',
    primaryFunction: 'processDelinquencyBucket(account: LoanAccount): DelinquencyState',
    impactTypeDefault: 'threshold config change',
    mockCodeSnippet: `// collections/dpd-flagging.ts
export function processDelinquencyBucket(account: LoanAccount): DelinquencyState {
  if (account.dpd >= CONFIG.COLLECTIONS.SOFT_ALERT_DPD) { // 5 days
    emitNotificationEvent({ accountId: account.id, channel: 'WHATSAPP_NUDGE' });
  }
  if (account.dpd >= CONFIG.COLLECTIONS.DISBURSAL_FREEZE_DPD) { // 15 days
    freezeCreditLine(account.userId);
  }
  return { currentDpd: account.dpd, status: account.dpd > 0 ? 'DELINQUENT' : 'CURRENT' };
}`
  },
  {
    id: 'MOD-006',
    path: 'collections/escalation-engine.ts',
    category: 'Collections/DPD',
    description: 'Automates multi-tier collection outreach allocation, agent workload routing, and legal notice triggers.',
    primaryFunction: 'evaluateEscalationQueue(delinquentAccount: DelinquentAccount): EscalationTask',
    impactTypeDefault: 'new conditional logic required',
    mockCodeSnippet: `// collections/escalation-engine.ts
export function evaluateEscalationQueue(account: DelinquentAccount): EscalationTask {
  if (account.dpd >= CONFIG.COLLECTIONS.LEGAL_PRENOTICE_DPD) { // 60 days
    return dispatchLegalNotice({ accountId: account.id, template: 'SEC_138_NOTICE' });
  }
  if (account.dpd >= CONFIG.COLLECTIONS.TELECALLING_QUEUE_DPD) { // 30 days
    return assignToAgentQueue({ accountId: account.id, tier: 'TIER_1_COLLECTIONS' });
  }
  return { status: 'MONITORING_ONLY' };
}`
  }
];

// Helper to generate 350 realistic applicants
function generateSyntheticApplicants(): SyntheticApplicant[] {
  const applicants: SyntheticApplicant[] = [];
  const firstNames = ['Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Neha', 'Siddharth', 'Pooja', 'Rahul', 'Kavita', 'Aditya', 'Sneha', 'Arjun', 'Meera', 'Varun', 'Divya', 'Karan', 'Rhea', 'Manish', 'Shreya', 'Amit', 'Sunita', 'Nikhil', 'Tanvi', 'Deepak'];
  const lastNames = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Iyer', 'Gupta', 'Singh', 'Nair', 'Deshmukh', 'Mukherjee', 'Chopra', 'Joshi', 'Kapoor', 'Rao', 'Bose', 'Menon', 'Kulkarni', 'Bhat', 'Agarwal', 'Chatterjee'];
  const employmentTypes: SyntheticApplicant['employment_type'][] = ['SALARIED', 'SALARIED', 'SALARIED', 'SELF_EMPLOYED_PROFESSIONAL', 'SELF_EMPLOYED_BUSINESS', 'GIG_WORKER'];
  const kycStatuses: SyntheticApplicant['kyc_status'][] = ['VERIFIED_AADHAAR_PAN', 'VERIFIED_AADHAAR_PAN', 'VERIFIED_AADHAAR_PAN', 'VERIFIED_AADHAAR_PAN', 'PENDING_VKYC', 'NAME_MISMATCH', 'FAILED_PENNY_DROP'];

  // Deterministic seed generation
  for (let i = 1; i <= 350; i++) {
    const fn = firstNames[(i * 7) % firstNames.length];
    const ln = lastNames[(i * 11) % lastNames.length];
    const name = `${fn} ${ln}`;
    
    // Spread of realistic distributions
    const isPrime = i % 3 !== 0;
    const income = isPrime ? 35000 + ((i * 1337) % 120000) : 18000 + ((i * 719) % 25000);
    const age = 22 + ((i * 3) % 42); // 22 to 64
    const credit_score = isPrime 
      ? 680 + ((i * 17) % 150) // 680 to 830
      : 550 + ((i * 23) % 130); // 550 to 680
    const existing_exposure = ((i * 941) % 1200000);
    const dpd_days = (i % 8 === 0) ? 5 + ((i * 7) % 75) : 0;
    const requested_amount = 50000 + (((i * 4999) % 95) * 10000); // 50k to 10L
    const bureau_enquiries_30d = (i % 5 === 0) ? 3 + (i % 6) : (i % 3);
    const foir_ratio = 25 + ((i * 13) % 55); // 25% to 80%
    const employment_type = employmentTypes[i % employmentTypes.length];
    const kyc_status = kycStatuses[i % kycStatuses.length];

    // Current policy evaluation
    let current_decision: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' = 'APPROVED';
    const flagged_rules: string[] = [];

    if (income < 25000) {
      current_decision = 'REJECTED';
      flagged_rules.push('RULE-ELIG-001 (Income < ₹25k)');
    }
    if (age < 21 || age > 58) {
      current_decision = 'REJECTED';
      flagged_rules.push('RULE-ELIG-002/003 (Age outside 21-58)');
    }
    if (credit_score < 650) {
      current_decision = 'REJECTED';
      flagged_rules.push('RULE-BUR-001/002 (Credit Score < 650)');
    } else if (credit_score < 700 && current_decision !== 'REJECTED') {
      current_decision = 'MANUAL_REVIEW';
      flagged_rules.push('RULE-BUR-002 (Score 650-699 Manual Band)');
    }
    if (existing_exposure > 800000) {
      current_decision = 'REJECTED';
      flagged_rules.push('RULE-BUR-003 (Exposure > ₹8L)');
    }
    if (bureau_enquiries_30d > 3 && current_decision === 'APPROVED') {
      current_decision = 'MANUAL_REVIEW';
      flagged_rules.push('RULE-BUR-004 (> 3 Inquiries in 30d)');
    }
    if (foir_ratio > 55) {
      current_decision = 'REJECTED';
      flagged_rules.push('RULE-BUR-005 (FOIR > 55%)');
    }
    if (kyc_status === 'FAILED_PENNY_DROP') {
      current_decision = 'REJECTED';
      flagged_rules.push('RULE-KYC-003 (Penny Drop Failed)');
    } else if (kyc_status !== 'VERIFIED_AADHAAR_PAN' && current_decision === 'APPROVED') {
      current_decision = 'MANUAL_REVIEW';
      flagged_rules.push('RULE-KYC-001 (KYC Document Review Required)');
    }
    if (dpd_days >= 15) {
      current_decision = 'REJECTED';
      flagged_rules.push('RULE-COL-002 (Active DPD >= 15)');
    }

    applicants.push({
      id: `APP-2026-${String(i).padStart(4, '0')}`,
      name,
      income,
      age,
      credit_score,
      existing_exposure,
      dpd_days,
      employment_type,
      kyc_status,
      requested_amount,
      bureau_enquiries_30d,
      foir_ratio,
      current_decision,
      flagged_rules
    });
  }

  return applicants;
}

export const SEED_SYNTHETIC_APPLICANTS: SyntheticApplicant[] = generateSyntheticApplicants();
export const SEED_APPLICANTS = SEED_SYNTHETIC_APPLICANTS;

export const SEED_RULE_PROPOSALS: RuleProposal[] = [
  {
    id: 'PROP-2026-089',
    title: 'Tighten Prime Credit Score Gate from 700 to 720',
    category: 'Bureau-check',
    field: 'credit_score',
    operator: '>=',
    threshold: 720,
    unit: 'Score',
    action: 'APPROVE',
    effective_date: '2026-09-01',
    proposer_role: 'Credit',
    proposer_name: 'Aditi Deshmukh (Head of Risk Policy)',
    rationale: 'Recent early delinquency spikes in the 700-719 score band suggest macro stress in unsecured credit. Moving the auto-approval threshold to 720 protects 90+ DPD vintage performance.',
    diff_against_current: 'BUREAU POLICY DIFF:\n- [CURRENT RULE-BUR-001]: credit_score >= 700 -> ACTION: APPROVE (Auto-disburse)\n+ [PROPOSED PROP-089]:   credit_score >= 720 -> ACTION: APPROVE (Auto-disburse)\n  DELTA: 700-719 tier shifts from Straight-Through Processing (STP) to Manual Underwriting Review band.',
    affected_existing_rule_id: 'RULE-BUR-001',
    status: 'Approved',
    created_at: '2026-08-20T14:30:00Z',
    compliance_flags: [
      {
        id: 'FLAG-DPDP-01',
        severity: 'INFO_FLAG',
        title: 'Credit Score Bureau Ingestion Notice',
        regulationReference: 'DPDP Act 2023 / RBI Master Direction on Credit Information',
        description: 'Score threshold adjustments utilize existing bureau pull consent tokens. No new bureau inquiry endpoints introduced.',
        actionRequired: 'Ensure rejection communication explicitly notes credit score threshold criteria per Fair Lending guidelines.'
      }
    ],
    matched_code_modules: [
      {
        path: 'bureau-service/score-fetch.ts',
        impactNote: 'threshold config change (CONFIG.BUREAU.AUTO_APPROVE_MIN_SCORE: 700 -> 720)',
        impactType: 'threshold config change'
      },
      {
        path: 'underwriting-engine/eligibility-check.ts',
        impactNote: 'threshold config change in underwriting routing pipeline',
        impactType: 'threshold config change'
      }
    ],
    simulation_results: {
      totalApplicants: 350,
      approvalRateBefore: 54.3,
      approvalRateAfter: 43.7,
      avgTicketBefore: 285000,
      avgTicketAfter: 312000,
      manualReviewRateBefore: 16.0,
      manualReviewRateAfter: 26.6,
      rejectionRateBefore: 29.7,
      rejectionRateAfter: 29.7,
      flippedAccountsCount: 37,
      flippedToApproved: 0,
      flippedToRejected: 0,
      flippedToReview: 37,
      flippedSamples: [
        {
          id: 'APP-2026-0014',
          name: 'Divya Rao',
          creditScore: 708,
          income: 62000,
          requestedAmount: 250000,
          oldDecision: 'APPROVED',
          newDecision: 'MANUAL_REVIEW',
          flipReason: 'Credit score 708 falls below proposed 720 threshold; routed to underwriter queue.'
        },
        {
          id: 'APP-2026-0027',
          name: 'Siddharth Iyer',
          creditScore: 715,
          income: 88000,
          requestedAmount: 400000,
          oldDecision: 'APPROVED',
          newDecision: 'MANUAL_REVIEW',
          flipReason: 'Credit score 715 shifts from instant auto-disbursal to manual review band.'
        }
      ],
      distributionByScore: [
        { range: '< 650 (Subprime)', approvedBefore: 0, approvedAfter: 0 },
        { range: '650 - 699 (Near Prime)', approvedBefore: 0, approvedAfter: 0 },
        { range: '700 - 719 (Target Shift)', approvedBefore: 37, approvedAfter: 0 },
        { range: '720 - 749 (Prime)', approvedBefore: 68, approvedAfter: 68 },
        { range: '750+ (Super Prime)', approvedBefore: 85, approvedAfter: 85 }
      ]
    },
    ai_briefs: {
      verdict: "Recommended with staged pilot — mitigates subprime default risk by ~14% while approval drops 10.6%; staff manual review buffer before full rollout.",
      credit: `**Credit & Risk Assessment Brief**
- **Portfolio Loss Mitigation**: Shifting prime threshold to 720 cuts estimated 90+ DPD default volume by ~14.2% based on historical vintage performance.
- **Risk Migration**: 37 accounts (10.6% of portfolio sample) migrate from instant Straight-Through Processing (STP) into the manual review band (700-719), avoiding unassisted bad-loan booking.
- **Capital & Provisioning**: Expected credit loss (ECL) provisioning buffer improves by an estimated 18 bps over a 12-month horizon.`,
      business: `**Business & Growth Impact Brief**
- **STP Conversion Friction**: Straight-through processing drops from 54.3% to 43.7% (-10.6pp drop), which will extend average customer turnaround time (TAT) from 4 minutes to 3.2 hours for the 700-719 cohort.
- **Disbursal Volume**: Monthly disbursal run-rate may decrease by ~7.8% unless underwriting operations scales manual review throughput to process the additional 37 cases/batch.
- **Average Ticket Size**: Increases slightly (+₹27,000) as remaining prime applicants reflect higher income stability.`,
      engineering: `**Engineering & Architecture Brief**
- **Impact Level**: Low / Configuration Only.
- **Module Affected**: \`bureau-service/score-fetch.ts\` & \`underwriting-engine/eligibility-check.ts\`.
- **Change Details**: Update JSON config \`CONFIG.BUREAU.AUTO_APPROVE_MIN_SCORE\` from \`700\` to \`720\`. No schema migrations or DB column changes required.
- **Deploy Risk**: Zero downtime rollout via environment feature flag \`FF_BUREAU_PRIME_CUTOFF_V2\`.`,
      qa: `**QA Test Plan & Verification Matrix**
1. **Scenario 1 (Boundary Above)**: Submit applicant with Credit Score = 720 -> Verify instant \`APPROVED\` status with STP disbursal payload.
2. **Scenario 2 (Boundary Below)**: Submit applicant with Credit Score = 719 -> Verify decision routes to \`MANUAL_REVIEW\` and emits underwriting ticket.
3. **Scenario 3 (Subprime Unchanged)**: Submit applicant with Score = 645 -> Verify hard \`REJECT\` via \`RULE-BUR-002\`.
4. **Scenario 4 (Rule Interaction Test)**: Submit applicant with Score = 725 BUT FOIR = 58% -> Verify hard reject via \`RULE-BUR-005\` takes precedence over the score auto-approval.
5. **Scenario 5 (Existing Loan Pipeline)**: Verify in-flight draft applications preserve snapshot timestamp score logic.`,
      product: `**Executive Product Summary & PRD Snapshot**
- **Objective**: Protect portfolio quality against credit deterioration in the 700-719 bureau band by re-routing applicants to assisted manual review.
- **Key Tradeoff**: -10.6% STP conversion in exchange for ~14% projected delinquency reduction.
- **Operational Requirement**: Credit underwriting team must staff capacity for an estimated +105 manual loan files per week.
- **Recommended Action**: Approve with a 30-day pilot and monitor funnel drop-off metrics.`
    }
  },
  {
    id: 'PROP-2026-088',
    title: 'Lower Early Delinquency Nudge from DPD 5 to DPD 3',
    category: 'Collections/DPD',
    field: 'dpd_days',
    operator: '>=',
    threshold: 3,
    unit: 'Days Past Due',
    action: 'TRIGGER_SOFT_NOTICE',
    effective_date: '2026-08-15',
    proposer_role: 'Business',
    proposer_name: 'Rajesh Nair (Collections Strategy Lead)',
    rationale: 'Earlier proactive digital nudges on DPD 3 capture payment bounce resolutions before weekend banking holidays and NACH re-presentment.',
    diff_against_current: 'COLLECTIONS POLICY DIFF:\n- [CURRENT RULE-COL-001]: dpd_days >= 5 -> ACTION: TRIGGER_SOFT_NOTICE (WhatsApp/SMS)\n+ [PROPOSED PROP-088]:   dpd_days >= 3 -> ACTION: TRIGGER_SOFT_NOTICE (WhatsApp/SMS)\n  DELTA: Digital outreach window moved forward by 48 hours.',
    affected_existing_rule_id: 'RULE-COL-001',
    status: 'Simulated',
    created_at: '2026-08-12T10:15:00Z',
    compliance_flags: [
      {
        id: 'FLAG-FPC-01',
        severity: 'HIGH_FLAG',
        title: 'Review against Fair Practices Code recovery/collection norms',
        regulationReference: 'RBI Fair Practices Code (FPC) for NBFCs / Digital Lending Circular',
        description: 'Collections communications cannot occur outside standard 08:00 to 19:00 window, and frequency cannot exceed 2 digital notifications/day.',
        actionRequired: 'Verify notification scheduler enforces FPC contact time windows and records opt-out preferences.'
      }
    ],
    matched_code_modules: [
      {
        path: 'collections/dpd-flagging.ts',
        impactNote: 'threshold config change (CONFIG.COLLECTIONS.SOFT_ALERT_DPD: 5 -> 3)',
        impactType: 'threshold config change'
      }
    ],
    simulation_results: {
      totalApplicants: 350,
      approvalRateBefore: 54.3,
      approvalRateAfter: 54.3,
      avgTicketBefore: 285000,
      avgTicketAfter: 285000,
      manualReviewRateBefore: 16.0,
      manualReviewRateAfter: 16.0,
      rejectionRateBefore: 29.7,
      rejectionRateAfter: 29.7,
      flippedAccountsCount: 18,
      flippedToApproved: 0,
      flippedToRejected: 0,
      flippedToReview: 0,
      flippedSamples: [
        {
          id: 'APP-2026-0048',
          name: 'Sneha Patel',
          creditScore: 730,
          income: 54000,
          requestedAmount: 180000,
          oldDecision: 'APPROVED',
          newDecision: 'APPROVED',
          flipReason: 'DPD = 4 triggers early proactive WhatsApp payment reminder (previously unflagged until DPD 5).'
        }
      ],
      distributionByScore: [
        { range: '< 650 (Subprime)', approvedBefore: 0, approvedAfter: 0 },
        { range: '650 - 699 (Near Prime)', approvedBefore: 0, approvedAfter: 0 },
        { range: '700 - 719', approvedBefore: 37, approvedAfter: 37 },
        { range: '720 - 749', approvedBefore: 68, approvedAfter: 68 },
        { range: '750+', approvedBefore: 85, approvedAfter: 85 }
      ]
    },
    ai_briefs: {
      verdict: "Recommended for immediate rollout — accelerates payment bounce recovery at DPD 3 with zero origination friction; verify FPC 08:00–19:00 notification window.",
      credit: `**Credit & Risk Assessment Brief**
- **Roll Rate Containment**: Moving DPD alert to day 3 is projected to reduce DPD 30+ roll-rate by 2.1% by catching salary clearing delays earlier.
- **No Underwriting Friction**: Zero impact on upfront loan approval rates or origination volumes.`,
      business: `**Business & Operations Brief**
- **Customer Experience**: Digital soft nudges sent at DPD 3 prevent customer late payment penalty fees if resolved prior to NACH second presentation.
- **WhatsApp Notification Costs**: Expected ~12% increase in monthly Meta WhatsApp Business API template spend (~₹18,000/mo).`,
      engineering: `**Engineering & Architecture Brief**
- **Impact Level**: Low.
- **Module**: \`collections/dpd-flagging.ts\`.
- **Change**: Change \`CONFIG.COLLECTIONS.SOFT_ALERT_DPD\` from 5 to 3.
- **Scheduler**: Verify cron job \`collections-cron-daily\` triggers at 09:00 AM IST to respect Fair Practices Code.`,
      qa: `**QA Test Plan & Scenarios**
1. **Scenario 1**: Account with DPD = 2 -> Verify NO notification event is emitted.
2. **Scenario 2**: Account with DPD = 3 -> Verify automated WhatsApp payment reminder is generated.
3. **Scenario 3 (Rule Interaction)**: Delinquent account at DPD = 16 with existing loan -> Verify both DPD 3 soft alert AND \`RULE-COL-002\` (disbursal freeze) fire correctly without event duplicate storm.`,
      product: `**Executive Product Summary**
- **Proposal**: Accelerate initial digital collections notification to DPD 3.
- **Status**: Ready for QA and Compliance sign-off on FPC timing restrictions.`
    }
  }
];

export const SEED_PROPOSALS = SEED_RULE_PROPOSALS;
