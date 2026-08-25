import React, { useState, useRef, useEffect } from 'react';
import { 
  RuleCategory, 
  RuleOperator, 
  RuleAction, 
  ProposerRole, 
  ExistingRule 
} from '../types';
import { 
  ArrowLeft, 
  Play, 
  Sparkles, 
  GitCompare, 
  HelpCircle,
  Clock,
  ChevronDown,
  Search,
  Plus,
  Sliders,
  Info,
  Check
} from 'lucide-react';
import { WizardStepper } from './WizardStepper';
import { generateRuleDiff } from '../utils/engine';

interface RuleBuilderProps {
  category: RuleCategory;
  onBackToLookup: () => void;
  existingRules: ExistingRule[];
  initialRule?: ExistingRule | null;
  onSubmitProposal: (formData: {
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
  }) => Promise<void>;
  isLoading: boolean;
}

interface FieldPreset {
  field: string;
  label: string;
  unit: string;
  defaultOp: RuleOperator;
  defaultVal: string | number;
  defaultAction: RuleAction;
  placeholder: string;
  description: string;
  exampleRange: string;
}

const FIELD_PRESETS: Record<RuleCategory, FieldPreset[]> = {
  'Eligibility': [
    { 
      field: 'income', 
      label: 'Monthly Net Income', 
      unit: '₹ / month', 
      defaultOp: '>=', 
      defaultVal: 30000, 
      defaultAction: 'APPROVE', 
      placeholder: 'e.g. 30000',
      description: 'Monthly net take-home salary or verified business turnover, in ₹.',
      exampleRange: 'Typical range: ₹15,000 – ₹2,50,000.'
    },
    { 
      field: 'age', 
      label: 'Applicant Age (Min)', 
      unit: 'Years', 
      defaultOp: '>=', 
      defaultVal: 21, 
      defaultAction: 'REJECT', 
      placeholder: 'e.g. 21',
      description: 'Applicant age at time of credit underwriting, in completed years.',
      exampleRange: 'Standard eligibility range: 21 – 60 years.'
    },
    { 
      field: 'employment_type', 
      label: 'Approved Employment Classes', 
      unit: 'Class', 
      defaultOp: 'IN', 
      defaultVal: 'SALARIED, SELF_EMPLOYED_PROFESSIONAL', 
      defaultAction: 'FLAG_MANUAL_REVIEW', 
      placeholder: 'e.g. SALARIED',
      description: 'Approved borrower occupation categories and verification tiers.',
      exampleRange: 'e.g. SALARIED, SELF_EMPLOYED_PROFESSIONAL.'
    }
  ],
  'Bureau-check': [
    { 
      field: 'credit_score', 
      label: 'CIBIL / Experian Credit Score', 
      unit: 'Score (300-900)', 
      defaultOp: '>=', 
      defaultVal: 720, 
      defaultAction: 'APPROVE', 
      placeholder: 'e.g. 720',
      description: 'Primary credit bureau score (CIBIL / Experian / CRIF High Mark).',
      exampleRange: 'Standard range: 300 – 900 (Prime cutoff: 700–750).'
    },
    { 
      field: 'existing_exposure', 
      label: 'Total Active Unsecured Debt', 
      unit: '₹ Active Exposure', 
      defaultOp: '<=', 
      defaultVal: 600000, 
      defaultAction: 'REJECT', 
      placeholder: 'e.g. 600000',
      description: 'Aggregate live unsecured credit exposure across all open tradelines, in ₹.',
      exampleRange: 'Typical ceiling: ₹2,00,000 – ₹15,00,000.'
    },
    { 
      field: 'foir_ratio', 
      label: 'Fixed Obligation to Income (FOIR)', 
      unit: '% of Income', 
      defaultOp: '<=', 
      defaultVal: 50, 
      defaultAction: 'REJECT', 
      placeholder: 'e.g. 50',
      description: 'Fixed Obligation to Income Ratio (monthly debt EMI obligations divided by net income), in %.',
      exampleRange: 'Typical limit: 40% – 60%.'
    },
    { 
      field: 'bureau_enquiries_30d', 
      label: 'Bureau Inquiries (Last 30 Days)', 
      unit: 'Hard Inquiries', 
      defaultOp: '<=', 
      defaultVal: 2, 
      defaultAction: 'FLAG_MANUAL_REVIEW', 
      placeholder: 'e.g. 2',
      description: 'Hard credit inquiry velocity across financial institutions within the past 30 days.',
      exampleRange: 'Velocity threshold: 1 – 3 hard inquiries.'
    }
  ],
  'KYC': [
    { 
      field: 'requested_amount', 
      label: 'Sanction Loan Amount (VKYC Gate)', 
      unit: '₹ Sanction Amount', 
      defaultOp: '>=', 
      defaultVal: 400000, 
      defaultAction: 'REQUIRE_VKYC', 
      placeholder: 'e.g. 400000',
      description: 'The loan amount requested by the applicant, in ₹.',
      exampleRange: 'Typical range: ₹50,000 – ₹25,00,000.'
    },
    { 
      field: 'kyc_status', 
      label: 'KYC Document Validation State', 
      unit: 'State', 
      defaultOp: '==', 
      defaultVal: 'VERIFIED_AADHAAR_PAN', 
      defaultAction: 'APPROVE', 
      placeholder: 'VERIFIED_AADHAAR_PAN',
      description: 'Identity document validation state across DigiLocker / Aadhaar XML / PAN NSDL.',
      exampleRange: 'e.g. VERIFIED_AADHAAR_PAN, DIGILOCKER_OK, PENDING_VKYC.'
    }
  ],
  'Collections/DPD': [
    { 
      field: 'dpd_days', 
      label: 'Days Past Due (DPD) Milestone', 
      unit: 'Days Past Due', 
      defaultOp: '>=', 
      defaultVal: 3, 
      defaultAction: 'TRIGGER_SOFT_NOTICE', 
      placeholder: 'e.g. 3',
      description: 'Days Past Due delinquency counter since installment due date.',
      exampleRange: 'Typical milestones: 3, 5, 15, 30, 60, 90 DPD.'
    }
  ]
};

// Helper text resolver for current field (preset or custom)
const getFieldHelperText = (currentField: string, currentCategory: RuleCategory): string => {
  if (!currentField || currentField.trim() === '') {
    return 'Select a standard policy field or type a custom attribute name.';
  }

  const normalized = currentField.trim().toLowerCase();

  // Search in current category
  const catPresets = FIELD_PRESETS[currentCategory] || [];
  const foundInCat = catPresets.find(p => p.field.toLowerCase() === normalized);
  if (foundInCat) {
    return `${foundInCat.description} ${foundInCat.exampleRange}`;
  }

  // Search in all categories
  for (const cat of Object.keys(FIELD_PRESETS) as RuleCategory[]) {
    const found = FIELD_PRESETS[cat].find(p => p.field.toLowerCase() === normalized);
    if (found) {
      return `${found.description} ${found.exampleRange}`;
    }
  }

  // Custom field
  return 'Custom field — not yet mapped to a code module. Engineering will need to confirm implementation.';
};

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  category,
  onBackToLookup,
  existingRules,
  initialRule,
  onSubmitProposal,
  isLoading
}) => {
  const presets = FIELD_PRESETS[category] || FIELD_PRESETS['Bureau-check'];
  const defaultPreset = presets[0];

  const [title, setTitle] = useState(
    initialRule 
      ? `Revise ${initialRule.name} threshold`
      : `Refine ${category} Policy Gate (${defaultPreset.label})`
  );
  const [field, setField] = useState(initialRule ? initialRule.field : defaultPreset.field);
  const [fieldSearch, setFieldSearch] = useState(initialRule ? initialRule.field : defaultPreset.field);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const comboboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);

  const isPresetField = presets.some(p => p.field.toLowerCase() === field.toLowerCase());
  const [operator, setOperator] = useState<RuleOperator>(initialRule ? initialRule.operator : defaultPreset.defaultOp);
  const [threshold, setThreshold] = useState<string | number>(initialRule ? initialRule.threshold : defaultPreset.defaultVal);
  const [unit, setUnit] = useState(initialRule ? initialRule.unit || '' : defaultPreset.unit);
  const [action, setAction] = useState<RuleAction>(initialRule ? initialRule.action : defaultPreset.defaultAction);
  const [effectiveDate, setEffectiveDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [proposerRole, setProposerRole] = useState<ProposerRole>('Credit');
  const [proposerName, setProposerName] = useState('Policy Underwriting Team');
  const [rationale, setRationale] = useState(
    initialRule 
      ? `Calibration based on recent portfolio performance indicators and credit bureau telemetry.`
      : `Proposed threshold adjustment to optimize portfolio risk-return curve and reduce early vintage delinquencies.`
  );

  // Close combobox when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setIsComboboxOpen(false);
        setIsUserTyping(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered preset options based on whether user is actively typing a search query
  const filteredPresets = (!isUserTyping || fieldSearch.trim() === '')
    ? presets
    : presets.filter(p => 
        p.field.toLowerCase().includes(fieldSearch.toLowerCase()) || 
        p.label.toLowerCase().includes(fieldSearch.toLowerCase())
      );

  const exactMatch = presets.find(p => p.field.toLowerCase() === fieldSearch.trim().toLowerCase());
  const showCustomOption = isUserTyping && fieldSearch.trim() !== '' && !exactMatch;

  // Total navigable items in the dropdown
  const totalNavigableItems = filteredPresets.length + (showCustomOption ? 1 : 0);

  // Scroll active item into view when navigating via keyboard
  useEffect(() => {
    if (isComboboxOpen && highlightedIndex >= 0 && dropdownListRef.current) {
      const activeEl = dropdownListRef.current.querySelector(`[data-combobox-index="${highlightedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isComboboxOpen]);

  // Handle preset selection
  const handleSelectPreset = (presetItem: FieldPreset) => {
    setField(presetItem.field);
    setFieldSearch(presetItem.field);
    setOperator(presetItem.defaultOp);
    setThreshold(presetItem.defaultVal);
    setUnit(presetItem.unit);
    setAction(presetItem.defaultAction);
    setTitle(`Update ${presetItem.label} Policy Threshold`);
    setIsComboboxOpen(false);
    setIsUserTyping(false);
    setHighlightedIndex(-1);
  };

  // Handle custom field selection
  const handleSelectCustomField = (customValue: string) => {
    const sanitized = customValue.trim().toLowerCase().replace(/\s+/g, '_');
    if (!sanitized) return;
    setField(sanitized);
    setFieldSearch(sanitized);
    setTitle(`Define ${sanitized} Policy Condition`);
    setIsComboboxOpen(false);
    setIsUserTyping(false);
    setHighlightedIndex(-1);
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isComboboxOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsComboboxOpen(true);
        setIsUserTyping(false);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (totalNavigableItems === 0) return;
      setHighlightedIndex(prev => (prev + 1 >= totalNavigableItems ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (totalNavigableItems === 0) return;
      setHighlightedIndex(prev => (prev <= 0 ? totalNavigableItems - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (totalNavigableItems === 0) {
        if (fieldSearch.trim()) {
          handleSelectCustomField(fieldSearch);
        }
        return;
      }

      if (highlightedIndex >= 0 && highlightedIndex < filteredPresets.length) {
        handleSelectPreset(filteredPresets[highlightedIndex]);
      } else if (highlightedIndex === filteredPresets.length && showCustomOption) {
        handleSelectCustomField(fieldSearch);
      } else if (filteredPresets.length > 0) {
        handleSelectPreset(filteredPresets[0]);
      } else if (showCustomOption) {
        handleSelectCustomField(fieldSearch);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsComboboxOpen(false);
      setFieldSearch(field);
      setIsUserTyping(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Tab') {
      setIsComboboxOpen(false);
      setIsUserTyping(false);
      setHighlightedIndex(-1);
    }
  };

  // Find currently live matching rule in this category & field
  const currentLiveRule = existingRules.find(
    r => r.category === category && r.field === field && r.status === 'Live'
  ) || null;

  // Generate live diff
  const liveDiff = generateRuleDiff(currentLiveRule, {
    category,
    field,
    operator,
    threshold,
    action,
    title
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitProposal({
      title,
      category,
      field,
      operator,
      threshold: typeof threshold === 'string' && !isNaN(Number(threshold)) && threshold.trim() !== '' ? Number(threshold) : threshold,
      unit,
      action,
      effective_date: effectiveDate,
      proposer_role: proposerRole,
      proposer_name: proposerName,
      rationale,
      affected_existing_rule_id: currentLiveRule ? currentLiveRule.id : undefined
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Visual Horizontal Stepper */}
      <WizardStepper 
        currentStep={2} 
        onStepClick={(step) => {
          if (step === 1) onBackToLookup();
        }} 
      />

      {/* Form & Diff Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Structured Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="instrument-card p-6 rounded-sm">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider">
                  Formulate Policy Rule
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
                  Define condition parameters for the <span className="font-bold text-[#064e3b] dark:text-emerald-400 uppercase font-mono">{category}</span> engine.
                </p>
              </div>
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                {category}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Proposal Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1">
                  Proposal Title / Description
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tighten Prime Score Gate to 720"
                  className="w-full px-3.5 py-2 rounded-sm border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-mono focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Field & Operator Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Field Combobox */}
                <div className="sm:col-span-2 relative" ref={comboboxRef}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider">
                      Evaluated Field
                    </label>
                    {!isPresetField && (
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-sm bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Custom Attribute
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      id="evaluated-field-combobox-input"
                      value={fieldSearch}
                      onChange={(e) => {
                        setFieldSearch(e.target.value);
                        setIsUserTyping(true);
                        setIsComboboxOpen(true);
                        setHighlightedIndex(0);
                      }}
                      onFocus={(e) => {
                        setIsComboboxOpen(true);
                        setIsUserTyping(false);
                        setHighlightedIndex(-1);
                        e.target.select();
                      }}
                      onClick={() => {
                        setIsComboboxOpen(true);
                        setIsUserTyping(false);
                      }}
                      onKeyDown={handleKeyDown}
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="off"
                      autoComplete="off"
                      placeholder="Search preset or type custom field..."
                      className="w-full pl-3 pr-8 py-2 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => {
                        setIsComboboxOpen(prev => {
                          const next = !prev;
                          if (next) {
                            setIsUserTyping(false);
                            setHighlightedIndex(-1);
                          }
                          return next;
                        });
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isComboboxOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {isComboboxOpen && (
                    <div 
                      ref={dropdownListRef}
                      id="evaluated-field-combobox-dropdown"
                      className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-sm shadow-xl py-1 text-xs font-mono"
                    >
                      {/* Presets Header */}
                      {filteredPresets.length > 0 && (
                        <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800/80">
                          <span>{category} Preset Fields ({filteredPresets.length})</span>
                          <span className="text-[9px] lowercase font-normal text-slate-400">↑↓ to navigate, ↵ to select</span>
                        </div>
                      )}

                      {/* Presets List */}
                      {filteredPresets.map((p, index) => {
                        const isSelected = p.field.toLowerCase() === field.toLowerCase();
                        const isHighlighted = highlightedIndex === index;

                        return (
                          <button
                            key={p.field}
                            data-combobox-index={index}
                            type="button"
                            onClick={() => handleSelectPreset(p)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            className={`w-full text-left px-3 py-2.5 flex items-center justify-between transition cursor-pointer border-l-2 ${
                              isHighlighted
                                ? 'bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-200 border-emerald-600 dark:border-emerald-400'
                                : isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#064e3b] dark:text-emerald-300 font-bold border-emerald-500 dark:border-emerald-600'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200 border-transparent'
                            }`}
                          >
                            <div className="flex-1 pr-2">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold">{p.field}</span>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                )}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 text-[11px] font-sans truncate mt-0.5">
                                {p.label}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 shrink-0">
                              {p.unit}
                            </span>
                          </button>
                        );
                      })}

                      {/* Clear "Add custom field" Option */}
                      {showCustomOption && (
                        <div className="border-t border-slate-200 dark:border-slate-800 mt-1 pt-1 bg-amber-50/40 dark:bg-amber-950/20">
                          <button
                            data-combobox-index={filteredPresets.length}
                            type="button"
                            id="add-custom-field-option-btn"
                            onClick={() => handleSelectCustomField(fieldSearch)}
                            onMouseEnter={() => setHighlightedIndex(filteredPresets.length)}
                            className={`w-full text-left px-3 py-2.5 transition flex items-center space-x-2.5 cursor-pointer font-sans border-l-2 ${
                              highlightedIndex === filteredPresets.length
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-100 border-amber-500'
                                : 'hover:bg-amber-100/70 dark:hover:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-400/60'
                            }`}
                          >
                            <div className="w-6 h-6 rounded-sm bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                              <Plus className="w-4 h-4 font-bold" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-xs font-mono flex items-center space-x-1">
                                <span>+ Add custom field:</span>
                                <span className="underline decoration-amber-500 font-bold text-amber-950 dark:text-amber-100">
                                  {fieldSearch.trim().toLowerCase().replace(/\s+/g, '_')}
                                </span>
                              </div>
                              <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                                Custom attribute — will flag for engineering mapping & review
                              </div>
                            </div>
                          </button>
                        </div>
                      )}

                      {filteredPresets.length === 0 && !showCustomOption && (
                        <div className="px-3 py-4 text-slate-500 text-center text-xs font-sans">
                          No matching presets. Press <kbd className="px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Enter</kbd> to add as custom field.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline Helper Text once a field is selected */}
                  <div className="mt-1.5 flex items-start space-x-1.5 text-[11px] font-sans text-slate-500 dark:text-slate-400">
                    <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">
                      {getFieldHelperText(field, category)}
                    </span>
                  </div>

                </div>

                {/* Operator */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1">
                    Operator
                  </label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as RuleOperator)}
                    className="w-full px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value=">=">&gt;= (Greater or Eq)</option>
                    <option value="<=">&lt;= (Less or Eq)</option>
                    <option value="==">== (Equal to)</option>
                    <option value="!=">!= (Not Equal)</option>
                    <option value="IN">IN (Set Member)</option>
                    <option value=">">&gt; (Strict Greater)</option>
                    <option value="<">&lt; (Strict Less)</option>
                  </select>
                </div>

              </div>

              {/* Threshold & Unit Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1">
                    Proposed Threshold Value
                  </label>
                  <input
                    type="text"
                    required
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    placeholder="e.g. 720 or 25000"
                    className="w-full px-3.5 py-2 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1">
                    Unit / Specifier
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    placeholder="e.g. Score / ₹"
                    className="w-full px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Action Triggered */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1">
                  Engine Action Triggered
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as RuleAction)}
                  className="w-full px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="APPROVE">APPROVE (Straight-Through STP Disbursal)</option>
                  <option value="FLAG_MANUAL_REVIEW">FLAG_MANUAL_REVIEW (Route to Credit Underwriter)</option>
                  <option value="REJECT">REJECT (Hard Underwriting Disqualification)</option>
                  <option value="REQUIRE_VKYC">REQUIRE_VKYC (Mandatory Live Video-KYC Agent Dispatch)</option>
                  <option value="TRIGGER_SOFT_NOTICE">TRIGGER_SOFT_NOTICE (Automated Digital Notification)</option>
                  <option value="HALT_DISBURSAL">HALT_DISBURSAL (Block Account Top-Ups & Drawdown)</option>
                  <option value="TRIGGER_ESCALATION">TRIGGER_ESCALATION (Assign to Collections Legal Queue)</option>
                </select>
              </div>

              {/* Proposer Role & Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1">
                    Proposer Discipline / Role
                  </label>
                  <select
                    value={proposerRole}
                    onChange={(e) => setProposerRole(e.target.value as ProposerRole)}
                    className="w-full px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Credit">Credit (Risk & Portfolio Policy)</option>
                    <option value="Business">Business (Growth & Disbursal Conversion)</option>
                    <option value="Product">Product (LOS Product Manager)</option>
                    <option value="Engineering">Engineering (LOS Platform Team)</option>
                    <option value="QA">QA (Quality & Testing)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1">
                    Proposer Name / Sign-off
                  </label>
                  <input
                    type="text"
                    required
                    value={proposerName}
                    onChange={(e) => setProposerName(e.target.value)}
                    placeholder="e.g. Aditi Deshmukh (Risk Lead)"
                    className="w-full px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Effective Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Target Effective Date</span>
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-mono focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Policy Rationale */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1">
                  Policy Rationale & Business Justification
                </label>
                <textarea
                  rows={3}
                  required
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Explain why this rule is needed, what risk or growth factor is driving it..."
                  className="w-full px-3.5 py-2 rounded-sm border border-slate-300 dark:border-slate-700 text-xs font-sans focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  id="submit-proposal-simulate-btn"
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-sm bg-[#064e3b] hover:bg-[#065f46] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Simulating Policy Impact & Calling Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>Run Impact Simulation & Multi-Role Briefs</span>
                      <Play className="w-4 h-4 fill-current ml-1" />
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>

        {/* Right Column: Live Diff View & Code Module Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Side-by-Side Diff View */}
          <div className="bg-slate-900 dark:bg-slate-900/90 text-slate-100 p-5 rounded-sm border border-slate-700 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-700 dark:border-slate-800 pb-3 mb-3">
              <h3 className="text-xs font-bold text-emerald-300 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                <GitCompare className="w-4 h-4 text-emerald-400" />
                <span>Real-Time Policy Diff</span>
              </h3>
              <span className="text-[10px] font-mono bg-slate-800 dark:bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-sm uppercase tracking-wider font-bold">
                LOS-DIFF-ENGINE
              </span>
            </div>

            {/* Current vs Proposed Visual Blocks */}
            <div className="space-y-3 font-mono text-xs">
              
              {/* Current Rule Box */}
              <div className="bg-slate-950 dark:bg-black p-3 rounded-sm border border-rose-900/40">
                <div className="text-[10px] uppercase font-bold text-rose-400 mb-1 flex items-center justify-between">
                  <span>- Current Baseline ({currentLiveRule ? currentLiveRule.id : 'No Single Rule'})</span>
                  {currentLiveRule && <span className="text-slate-500">{currentLiveRule.version}</span>}
                </div>
                {currentLiveRule ? (
                  <div className="text-slate-300 leading-relaxed">
                    <span className="text-slate-400">{currentLiveRule.field}</span>{' '}
                    <span className="text-rose-300 font-bold">{currentLiveRule.operator}</span>{' '}
                    <span className="text-white font-bold bg-slate-800 px-1.5 py-0.5 rounded-sm">
                      {currentLiveRule.threshold} {currentLiveRule.unit || ''}
                    </span>
                    <div className="mt-1 text-[10px] text-slate-400 uppercase font-bold">
                      ACTION: <span className="text-rose-300">{currentLiveRule.action}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 italic text-[11px]">
                    No existing active rule directly bounds this exact field independently.
                  </div>
                )}
              </div>

              {/* Proposed Rule Box */}
              <div className="bg-slate-950 dark:bg-black p-3 rounded-sm border border-emerald-900/40">
                <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">
                  + Proposed Rule (New Policy Formulation)
                </div>
                <div className="text-slate-300 leading-relaxed">
                  <span className="text-emerald-400 font-bold">{field}</span>{' '}
                  <span className="text-emerald-300 font-bold">{operator}</span>{' '}
                  <span className="text-white font-bold bg-emerald-950 border border-emerald-800 px-1.5 py-0.5 rounded-sm">
                    {threshold} {unit}
                  </span>
                  <div className="mt-1 text-[10px] text-slate-400 uppercase font-bold">
                    ACTION: <span className="text-emerald-400 font-bold">{action}</span>
                  </div>
                </div>
              </div>

              {/* Formatted Diff Raw Terminal Output */}
              <div className="pt-2">
                <div className="text-[10px] text-slate-400 font-mono uppercase mb-1 font-bold tracking-wider">Raw Diff Output:</div>
                <div className="bg-black text-emerald-300 p-3 rounded-sm text-[11px] font-mono whitespace-pre-wrap leading-tight border border-slate-800 custom-scrollbar max-h-48 overflow-y-auto">
                  {liveDiff}
                </div>
              </div>

            </div>
          </div>

          {/* Quick Notice about Impact Generation */}
          <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-sm text-xs text-slate-800 dark:text-slate-200 space-y-2">
            <div className="font-bold flex items-center space-x-1.5 text-slate-900 dark:text-slate-100 uppercase font-mono text-[11px] tracking-wider">
              <HelpCircle className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              <span>Automated Impact Generation</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Upon clicking <strong className="text-slate-900 dark:text-slate-100 font-mono">Run Impact Simulation</strong>, RuleRadar will:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1 pl-1 font-sans">
              <li>Test against 350 realistic applicant profiles.</li>
              <li>Flag compliance concerns (RBI DLG, DPDP Act, FPC).</li>
              <li>Map affected microservices in the LOS codebase.</li>
              <li>Invoke Gemini AI to author tailored briefs for Credit, Business, Engineering, QA, and Product.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};

