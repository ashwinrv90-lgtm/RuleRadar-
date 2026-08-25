import type { 
  RuleCategory, 
  RuleOperator, 
  RuleAction, 
  ExistingRule, 
  CodeModule, 
  SyntheticApplicant, 
  SimulationResults, 
  ComplianceFlag 
} from '../types.js';
import { SEED_CODE_MODULES } from '../data/seedData.js';

export function evaluateComplianceFlags(
  category: RuleCategory,
  field: string,
  _threshold?: string | number,
  _action?: RuleAction
): ComplianceFlag[] {
  const flags: ComplianceFlag[] = [];
  const lowerField = field.toLowerCase();

  // 1. Pricing / APR / Fees / KFS
  if (
    lowerField.includes('apr') || 
    lowerField.includes('pricing') || 
    lowerField.includes('interest') || 
    lowerField.includes('fee') || 
    lowerField.includes('charge') ||
    lowerField.includes('rate')
  ) {
    flags.push({
      id: 'FLAG-KFS-RBI',
      severity: 'HIGH_FLAG',
      title: 'KFS (Key Fact Statement) disclosure review required',
      regulationReference: 'RBI Digital Lending Guidelines (DLG) & Master Direction on Fair Practices',
      description: 'Changes to interest rates, processing fees, penal charges, or annualized percentage rates (APR) mandate real-time recalculation of the Key Fact Statement (KFS) prior to loan contract execution.',
      actionRequired: 'Submit revised pricing matrix to Compliance & Legal; verify KFS PDF generation service in loan disbursal flow.'
    });
  }

  // 2. Collections / DPD / Fair Practices Code
  if (category === 'Collections/DPD' || lowerField.includes('dpd') || lowerField.includes('collection') || lowerField.includes('recovery')) {
    flags.push({
      id: 'FLAG-FPC-RECOVERY',
      severity: 'HIGH_FLAG',
      title: 'Review against Fair Practices Code recovery/collection norms',
      regulationReference: 'RBI Guidelines on Digital Lending & Fair Practices Code for Recovery Agents',
      description: 'Collection triggers, customer outreach automation, and communication channels must strictly adhere to the 08:00 to 19:00 calling window, frequency restrictions (max 2 digital touches/day), and polite tone guidelines.',
      actionRequired: 'Ensure collections scheduler enforces strict operating hour guards, opt-out management, and auditable event logging.'
    });
  }

  // 3. Bureau / Consent / DPDP Act
  if (
    category === 'Bureau-check' || 
    lowerField.includes('bureau') || 
    lowerField.includes('cibil') || 
    lowerField.includes('experian') || 
    lowerField.includes('enquiry') ||
    lowerField.includes('inquiry') ||
    lowerField.includes('consent') ||
    lowerField.includes('aadhaar') ||
    lowerField.includes('pan')
  ) {
    flags.push({
      id: 'FLAG-DPDP-CONSENT',
      severity: 'MODERATE_FLAG',
      title: 'Review against DPDP Act consent requirements',
      regulationReference: 'Digital Personal Data Protection (DPDP) Act 2023 / CICRA Act 2005',
      description: 'Bureau data pulls, inquiry velocity tracking, and identity verification rely on explicit user-authorized purpose limitation. Modifications to frequency or data storage require verification of consent audit logs.',
      actionRequired: 'Verify OTP/consent timestamp retention in database and ensure bureau pull tokens are refreshed strictly per active loan application scope.'
    });
  }

  // If no triggers
  if (flags.length === 0) {
    flags.push({
      id: 'FLAG-CLEAR-STD',
      severity: 'CLEAR',
      title: 'Standard Policy Governance Applies',
      regulationReference: 'Internal Risk & Underwriting Policy Framework v4.2',
      description: 'No external regulatory threshold triggers (KFS, DPDP, FPC) were activated by this field or category. Standard internal change management applies.',
      actionRequired: 'Standard dual-signoff from Credit Risk Head and Product Lead required prior to production release.'
    });
  }

  return flags;
}

export function matchCodeModulesForProposal(
  category: RuleCategory,
  field: string,
  isExistingField: boolean
): Array<{
  path: string;
  impactNote: string;
  impactType: 'threshold config change' | 'new conditional logic required';
}> {
  const knownPresetFields = [
    'income',
    'age',
    'credit_score',
    'existing_exposure',
    'dpd_days',
    'bureau_enquiries_30d',
    'foir_ratio',
    'requested_amount',
    'kyc_status',
    'employment_type'
  ];
  const isKnown = knownPresetFields.includes(field);
  const categoryModules = SEED_CODE_MODULES.filter(m => m.category === category);

  // If a custom field doesn't match a known code-module mapping, flag as Unmapped for engineering review
  if (!isKnown && field.trim() !== '') {
    return [
      {
        path: `underwriting-engine/${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}-custom-rules.ts`,
        impactNote: 'Unmapped — flag for engineering review',
        impactType: 'new conditional logic required'
      },
      ...categoryModules.map(m => ({
        path: m.path,
        impactNote: `Unmapped — flag for engineering review (custom attribute: ${field})`,
        impactType: 'new conditional logic required' as const
      }))
    ];
  }

  return categoryModules.map(m => {
    const isThresholdOnly = isExistingField && isKnown;
    const impactType: 'threshold config change' | 'new conditional logic required' = isThresholdOnly ? 'threshold config change' : 'new conditional logic required';
    
    let impactNote = '';
    if (impactType === 'threshold config change') {
      impactNote = `threshold config change in ${m.path} (CONFIG.${category.toUpperCase().replace(/[^A-Z]/g, '_')}.${field.toUpperCase()})`;
    } else {
      impactNote = `new conditional branching & evaluation logic required in ${m.path}`;
    }

    return {
      path: m.path,
      impactNote,
      impactType
    };
  });
}

export function mapImpactedCodeModules(
  category: RuleCategory,
  _threshold?: string | number
): Array<{
  path: string;
  impactNote: string;
  impactType: 'threshold config change' | 'new conditional logic required';
}> {
  return matchCodeModulesForProposal(category, '', true);
}

export function runRuleSimulation(
  proposed: {
    category: RuleCategory;
    field: string;
    operator: RuleOperator;
    threshold: string | number;
    action: RuleAction;
  },
  arg2: ExistingRule[] | SyntheticApplicant[],
  arg3?: SyntheticApplicant[]
): SimulationResults {
  const applicants: SyntheticApplicant[] = Array.isArray(arg3) ? arg3 : (arg2 as SyntheticApplicant[]);
  const existingRules: ExistingRule[] = Array.isArray(arg3) ? (arg2 as ExistingRule[]) : [];
  let approvedBeforeCount = 0;
  let manualBeforeCount = 0;
  let rejectedBeforeCount = 0;
  let ticketSumBefore = 0;

  let approvedAfterCount = 0;
  let manualAfterCount = 0;
  let rejectedAfterCount = 0;
  let ticketSumAfter = 0;

  let flippedCount = 0;
  let flippedToApproved = 0;
  let flippedToRejected = 0;
  let flippedToReview = 0;
  const flippedSamples: SimulationResults['flippedSamples'] = [];

  const scoreDistributionMap: Record<string, { before: number; after: number }> = {
    '< 650 (Subprime)': { before: 0, after: 0 },
    '650 - 699 (Near Prime)': { before: 0, after: 0 },
    '700 - 719 (Target Shift)': { before: 0, after: 0 },
    '720 - 749 (Prime)': { before: 0, after: 0 },
    '750+ (Super Prime)': { before: 0, after: 0 }
  };

  const getScoreBucket = (score: number) => {
    if (score < 650) return '< 650 (Subprime)';
    if (score < 700) return '650 - 699 (Near Prime)';
    if (score < 720) return '700 - 719 (Target Shift)';
    if (score < 750) return '720 - 749 (Prime)';
    return '750+ (Super Prime)';
  };

  applicants.forEach(app => {
    const oldDecision = app.current_decision;
    const bucket = getScoreBucket(app.credit_score);

    if (oldDecision === 'APPROVED') {
      approvedBeforeCount++;
      ticketSumBefore += app.requested_amount;
      scoreDistributionMap[bucket].before++;
    } else if (oldDecision === 'MANUAL_REVIEW') {
      manualBeforeCount++;
    } else {
      rejectedBeforeCount++;
    }

    // Now evaluate with proposed rule
    let newDecision = oldDecision;
    let flipReason = '';

    const numThreshold = typeof proposed.threshold === 'number' ? proposed.threshold : parseFloat(proposed.threshold as string);
    const applicantVal = (app as unknown as Record<string, unknown>)[proposed.field];

    if (proposed.field === 'credit_score') {
      const score = app.credit_score;
      if (proposed.operator === '>=' && typeof numThreshold === 'number') {
        if (score < numThreshold) {
          if (score >= 650) {
            newDecision = 'MANUAL_REVIEW';
            flipReason = `Credit score ${score} falls below new auto-approval threshold ${numThreshold}; re-routed to manual review.`;
          } else {
            newDecision = 'REJECTED';
            flipReason = `Credit score ${score} is below cutoff ${numThreshold}.`;
          }
        } else {
          // If above new threshold and previously manual review
          if (oldDecision === 'MANUAL_REVIEW' && score >= numThreshold && app.income >= 25000 && app.foir_ratio <= 55) {
            newDecision = 'APPROVED';
            flipReason = `Credit score ${score} satisfies revised threshold ${numThreshold}; qualified for auto-approval.`;
          }
        }
      }
    } else if (proposed.field === 'income') {
      const inc = app.income;
      if (proposed.operator === '>=' && typeof numThreshold === 'number') {
        if (inc < numThreshold) {
          newDecision = 'REJECTED';
          flipReason = `Monthly income ₹${inc.toLocaleString('en-IN')} is below new threshold ₹${numThreshold.toLocaleString('en-IN')}.`;
        } else if (inc >= numThreshold && oldDecision === 'REJECTED' && app.credit_score >= 700 && app.foir_ratio <= 55) {
          newDecision = 'APPROVED';
          flipReason = `Monthly income ₹${inc.toLocaleString('en-IN')} meets lowered requirement.`;
        }
      }
    } else if (proposed.field === 'existing_exposure') {
      const exp = app.existing_exposure;
      if (proposed.operator === '<=' && typeof numThreshold === 'number') {
        if (exp > numThreshold) {
          newDecision = 'REJECTED';
          flipReason = `Existing unsecured exposure ₹${exp.toLocaleString('en-IN')} exceeds tighter cap ₹${numThreshold.toLocaleString('en-IN')}.`;
        }
      }
    } else if (proposed.field === 'foir_ratio') {
      const foir = app.foir_ratio;
      if (proposed.operator === '<=' && typeof numThreshold === 'number') {
        if (foir > numThreshold) {
          newDecision = 'REJECTED';
          flipReason = `FOIR ${foir}% exceeds tighter limit ${numThreshold}%.`;
        }
      }
    } else if (proposed.field === 'bureau_enquiries_30d') {
      const inq = app.bureau_enquiries_30d;
      if (proposed.operator === '<=' && typeof numThreshold === 'number') {
        if (inq > numThreshold && oldDecision === 'APPROVED') {
          newDecision = 'MANUAL_REVIEW';
          flipReason = `${inq} bureau inquiries in 30 days exceeds proposed limit ${numThreshold}; flagged for credit check.`;
        }
      }
    } else if (proposed.field === 'dpd_days') {
      const dpd = app.dpd_days;
      if (proposed.operator === '>=' && typeof numThreshold === 'number') {
        if (dpd >= numThreshold && proposed.action === 'HALT_DISBURSAL' && oldDecision === 'APPROVED') {
          newDecision = 'REJECTED';
          flipReason = `Active DPD ${dpd} days triggers reimbursal freeze at tighter ${numThreshold} day threshold.`;
        }
      }
    } else if (proposed.field === 'requested_amount') {
      const req = app.requested_amount;
      if (proposed.operator === '>=' && typeof numThreshold === 'number') {
        if (req >= numThreshold && proposed.action === 'REQUIRE_VKYC' && oldDecision === 'APPROVED') {
          newDecision = 'MANUAL_REVIEW';
          flipReason = `Requested loan ₹${req.toLocaleString('en-IN')} requires mandatory live Video-KYC before final sanction.`;
        }
      }
    } else {
      // General evaluation for Custom Fields
      if (applicantVal !== undefined) {
        let conditionMet = false;
        if (typeof applicantVal === 'number' && typeof numThreshold === 'number') {
          if (proposed.operator === '>=') conditionMet = applicantVal >= numThreshold;
          else if (proposed.operator === '<=') conditionMet = applicantVal <= numThreshold;
          else if (proposed.operator === '>') conditionMet = applicantVal > numThreshold;
          else if (proposed.operator === '<') conditionMet = applicantVal < numThreshold;
          else if (proposed.operator === '==') conditionMet = applicantVal === numThreshold;
          else if (proposed.operator === '!=') conditionMet = applicantVal !== numThreshold;
        } else {
          const strVal = String(applicantVal).toLowerCase();
          const strThresh = String(proposed.threshold).toLowerCase();
          if (proposed.operator === '==') conditionMet = strVal === strThresh;
          else if (proposed.operator === '!=') conditionMet = strVal !== strThresh;
          else if (proposed.operator === 'IN') conditionMet = strThresh.split(',').map(s => s.trim()).includes(strVal);
        }

        if (conditionMet) {
          if (proposed.action === 'APPROVE' && oldDecision !== 'APPROVED') {
            newDecision = 'APPROVED';
            flipReason = `Custom attribute '${proposed.field}' satisfies condition (${applicantVal} ${proposed.operator} ${proposed.threshold}).`;
          } else if (proposed.action === 'REJECT' && oldDecision !== 'REJECTED') {
            newDecision = 'REJECTED';
            flipReason = `Custom attribute '${proposed.field}' triggered rejection (${applicantVal} ${proposed.operator} ${proposed.threshold}).`;
          } else if (proposed.action === 'FLAG_MANUAL_REVIEW' && oldDecision === 'APPROVED') {
            newDecision = 'MANUAL_REVIEW';
            flipReason = `Custom attribute '${proposed.field}' triggered underwriting review gate.`;
          }
        }
      } else {
        // Deterministic synthetic evaluation for novel custom attributes
        const isMarginal = app.credit_score < 710 || app.foir_ratio > 48;
        if (isMarginal && oldDecision === 'APPROVED' && (proposed.action === 'REJECT' || proposed.action === 'FLAG_MANUAL_REVIEW')) {
          newDecision = proposed.action === 'REJECT' ? 'REJECTED' : 'MANUAL_REVIEW';
          flipReason = `Custom attribute '${proposed.field}' (${proposed.operator} ${proposed.threshold}) applied to cohort risk tier.`;
        }
      }
    }

    if (newDecision === 'APPROVED') {
      approvedAfterCount++;
      ticketSumAfter += app.requested_amount;
      scoreDistributionMap[bucket].after++;
    } else if (newDecision === 'MANUAL_REVIEW') {
      manualAfterCount++;
    } else {
      rejectedAfterCount++;
    }

    if (newDecision !== oldDecision) {
      flippedCount++;
      if (newDecision === 'APPROVED') flippedToApproved++;
      if (newDecision === 'REJECTED') flippedToRejected++;
      if (newDecision === 'MANUAL_REVIEW') flippedToReview++;

      if (flippedSamples.length < 6) {
        flippedSamples.push({
          id: app.id,
          name: app.name,
          creditScore: app.credit_score,
          income: app.income,
          requestedAmount: app.requested_amount,
          oldDecision,
          newDecision,
          flipReason: flipReason || `Decision changed from ${oldDecision} to ${newDecision} under proposed rule.`
        });
      }
    }
  });

  const total = applicants.length;
  const avgTicketBefore = approvedBeforeCount > 0 ? Math.round(ticketSumBefore / approvedBeforeCount) : 0;
  const avgTicketAfter = approvedAfterCount > 0 ? Math.round(ticketSumAfter / approvedAfterCount) : 0;

  const distributionByScore = Object.entries(scoreDistributionMap).map(([range, counts]) => ({
    range,
    approvedBefore: counts.before,
    approvedAfter: counts.after
  }));

  return {
    totalApplicants: total,
    approvalRateBefore: Number(((approvedBeforeCount / total) * 100).toFixed(1)),
    approvalRateAfter: Number(((approvedAfterCount / total) * 100).toFixed(1)),
    avgTicketBefore,
    avgTicketAfter,
    manualReviewRateBefore: Number(((manualBeforeCount / total) * 100).toFixed(1)),
    manualReviewRateAfter: Number(((manualAfterCount / total) * 100).toFixed(1)),
    rejectionRateBefore: Number(((rejectedBeforeCount / total) * 100).toFixed(1)),
    rejectionRateAfter: Number(((rejectedAfterCount / total) * 100).toFixed(1)),
    flippedAccountsCount: flippedCount,
    flippedToApproved,
    flippedToRejected,
    flippedToReview,
    flippedSamples,
    distributionByScore
  };
}

export function generateRuleDiff(
  currentRule: ExistingRule | null,
  proposed: {
    category: RuleCategory;
    field: string;
    operator: RuleOperator;
    threshold: string | number;
    action: RuleAction;
    title: string;
  }
): string {
  if (currentRule) {
    return `CATEGORY: ${proposed.category}
FIELD: ${proposed.field}

- [CURRENT ${currentRule.id}]: ${currentRule.field} ${currentRule.operator} ${currentRule.threshold} ${currentRule.unit || ''} -> ACTION: ${currentRule.action} (${currentRule.actionLabel})
+ [PROPOSED]:              ${proposed.field} ${proposed.operator} ${proposed.threshold} -> ACTION: ${proposed.action}

IMPACT DELTA:
Changed operator/threshold from [${currentRule.operator} ${currentRule.threshold}] to [${proposed.operator} ${proposed.threshold}].
Action modified: ${currentRule.action === proposed.action ? 'Same action triggered at revised boundary' : `Action changed from ${currentRule.action} to ${proposed.action}`}.`;
  }

  return `CATEGORY: ${proposed.category}
FIELD: ${proposed.field}

+ [NEW RULE PROPOSAL]: ${proposed.field} ${proposed.operator} ${proposed.threshold} -> ACTION: ${proposed.action}

IMPACT DELTA:
Introduces a brand new policy condition to the ${proposed.category} evaluation pipeline. No prior single rule directly governed this discrete condition.`;
}

export function generateFallbackBriefs(
  proposal: {
    title: string;
    category: RuleCategory;
    field: string;
    operator: RuleOperator;
    threshold: string | number;
    action: RuleAction;
    rationale?: string;
  },
  simulation: SimulationResults,
  compliance: ComplianceFlag[]
): {
  verdict: string;
  credit: string;
  business: string;
  engineering: string;
  qa: string;
  product: string;
} {
  const numDelta = simulation.approvalRateAfter - simulation.approvalRateBefore;
  const deltaApproval = numDelta.toFixed(1);
  const deltaTicket = simulation.avgTicketAfter - simulation.avgTicketBefore;

  let verdict = `Recommended with monitoring — improves risk posture with balanced conversion; pilot across 15% traffic before full rollout.`;
  if (numDelta < -5) {
    verdict = `Recommended with staged pilot — mitigates subprime default risk but reduces approval by ${Math.abs(numDelta).toFixed(1)}%; staff underwriting review queue.`;
  } else if (numDelta > 2) {
    verdict = `Recommended for volume growth — yields +${numDelta.toFixed(1)}% approval expansion with manageable risk; monitor 30+ DPD vintage metrics.`;
  } else if (simulation.manualReviewRateAfter > simulation.manualReviewRateBefore + 3) {
    verdict = `Recommended with operations buffer — re-routes ${simulation.flippedToReview || simulation.flippedAccountsCount} borderline files to manual review to safeguard quality.`;
  }

  return {
    verdict,
    credit: `**Credit & Risk Assessment Brief**
- **Portfolio Loss Rate Impact**: Evaluated under 350 applicant stress-test cohort. STP approval shifts by **${deltaApproval}%** (${simulation.approvalRateBefore}% -> ${simulation.approvalRateAfter}%).
- **Expected Credit Loss (ECL)**: Provisioning impact is bounded by tighter score cutoffs and risk-tier recalibration.
- **Underwriting Load**: Manual underwriting queue load shifts from **${simulation.manualReviewRateBefore}%** to **${simulation.manualReviewRateAfter}%** of total originations.
- **Risk Rationale**: ${proposal.rationale || 'Calibrated to optimize risk-adjusted returns and prevent early vintage 30+ DPD migration.'}`,

    business: `**Business & Origination Volume Brief**
- **Disbursal Conversion Velocity**: Projected monthly STP conversion impact of **${deltaApproval}%** across targeted digital lending funnels.
- **Average Sanction Ticket Size**: Shifts from ₹${(simulation.avgTicketBefore / 1000).toFixed(0)}k to ₹${(simulation.avgTicketAfter / 1000).toFixed(0)}k (${deltaTicket >= 0 ? '+' : ''}₹${deltaTicket.toLocaleString('en-IN')}).
- **Turnaround Time (TAT)**: Straight-through disbursals complete within sub-3-minute SLA for auto-approved segment; flagged manual files route with 45-minute underwriter SLA.`,

    engineering: `**Engineering & Architecture Brief**
- **Impact Level**: Standard Microservice Configuration & Rule Routing.
- **Target Category Service**: \`LOS-${proposal.category.toUpperCase().replace(/[^A-Z]/g, '_')}-SERVICE\`.
- **Change Pattern**: Evaluated as threshold property configuration update in central policy vault with automated fallback caching.
- **Rollback Guard**: Feature flag \`FF_POLICY_${proposal.category.toUpperCase().replace(/[^A-Z]/g, '_')}_V4\` provisioned for instant zero-downtime regression mitigation.`,

    qa: `**QA Test Plan & Concrete Scenarios**
1. **Scenario 1 (Direct Threshold Boundary)**: Applicant with \`${proposal.field} = ${proposal.threshold}\` -> Verify policy triggers action \`${proposal.action}\`.
2. **Scenario 2 (Sub-threshold Boundary)**: Applicant with value just below threshold -> Verify expected fallback or rejection routing executes deterministically.
3. **Scenario 3 (Cross-Rule Interaction in ${proposal.category})**: Applicant satisfying this new rule alongside active ${proposal.category} rules -> Verify evaluation order priority and ensure no infinite loop or conflicting event emission.
4. **Scenario 4 (Corrupted / Null Bureau Payload)**: Missing bureau attribute payload -> Verify system raises explicit \`MANUAL_REVIEW\` fallback rather than unhandled exception.`,

    product: `**Executive Product Synthesis**
- **Proposal**: ${proposal.title} [${proposal.category}]
- **Condition**: \`${proposal.field} ${proposal.operator} ${proposal.threshold}\` -> \`${proposal.action}\`
- **Portfolio Shift**: ${simulation.flippedAccountsCount} applicants flip status in the validation cohort.
- **Compliance Status**: ${compliance.map(c => c.title).join('; ')}.
- **Readiness**: Ready for Confluence PRD appendix insertion and cross-functional sign-off.`
  };
}

