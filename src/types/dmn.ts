export type HitPolicy = 'UNIQUE' | 'FIRST' | 'PRIORITY' | 'ANY' | 'COLLECT' | 'RULE_ORDER';

export interface DMNInputClause {
  id: string;
  label: string;
  expression: string; // FEEL expression / variable (e.g. cicScore, customerAge)
  typeRef: 'number' | 'string' | 'boolean' | 'date';
  allowedValues?: string[];
  description?: string;
}

export interface DMNOutputClause {
  id: string;
  label: string;
  name: string; // Target variable name (e.g. decisionResult, maxLimitVND)
  typeRef: 'string' | 'number' | 'boolean';
  allowedValues?: string[];
  description?: string;
}

export interface DMNRule {
  id: string;
  ruleNumber: number;
  inputEntries: Record<string, string>; // inputClauseId -> FEEL expression string
  outputEntries: Record<string, any>; // outputClauseId -> output value
  annotation?: string;
  isActive?: boolean;
}

export interface DMNDecisionDefinition {
  id: string;
  key: string;
  name: string;
  hitPolicy: HitPolicy;
  description: string;
  version: number;
  engine: 'Camunda' | 'Flowable';
  inputs: DMNInputClause[];
  outputs: DMNOutputClause[];
  rules: DMNRule[];
  xml?: string;
}

export interface DMNEvaluationResult {
  matchedRules: DMNRule[];
  outputs: Record<string, any>;
  evaluationTimeMs: number;
  hitPolicyApplied: HitPolicy;
  status: 'SUCCESS' | 'NO_MATCH' | 'ERROR';
  message?: string;
}

export interface DMNVersionAuthor {
  name: string;
  email?: string;
  role?: string;
  avatar?: string;
}

export interface DMNVersionSnapshot {
  id: string;
  decisionKey: string;
  versionTag: string; // e.g. "v1.0", "v1.1", "v2.0"
  versionNumber: number;
  createdAt: string; // ISO date string
  author: DMNVersionAuthor;
  summary: string;
  decision: DMNDecisionDefinition;
  isCurrent?: boolean;
}

export type DMNDiffRuleStatus = 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';

export interface DMNRuleDiffItem {
  status: DMNDiffRuleStatus;
  ruleNumber: number;
  ruleId: string;
  baseRule?: DMNRule;
  targetRule?: DMNRule;
  inputDiffs: Record<string, { baseVal?: string; targetVal?: string; isChanged: boolean }>;
  outputDiffs: Record<string, { baseVal?: any; targetVal?: any; isChanged: boolean }>;
  annotationDiff?: { baseVal?: string; targetVal?: string; isChanged: boolean };
}

export interface DMNDiffReport {
  baseVersionTag: string;
  targetVersionTag: string;
  hitPolicyChanged: boolean;
  baseHitPolicy: HitPolicy;
  targetHitPolicy: HitPolicy;
  inputsAdded: DMNInputClause[];
  inputsRemoved: DMNInputClause[];
  outputsAdded: DMNOutputClause[];
  outputsRemoved: DMNOutputClause[];
  rulesDiff: DMNRuleDiffItem[];
  stats: {
    addedRulesCount: number;
    removedRulesCount: number;
    modifiedRulesCount: number;
    unchangedRulesCount: number;
    totalChanges: number;
  };
}
