import { DMNDecisionDefinition, DMNRule, DMNInputClause, DMNOutputClause, HitPolicy } from '../../types/dmn';

export type DmnConflictType = 
  | 'OVERLAPPING_CONFLICT'   // Overlapping input conditions with conflicting outputs
  | 'REDUNDANT_RULE'         // Duplicate inputs and duplicate outputs
  | 'SHADOWED_RULE'          // Rule that will never be reached under FIRST policy
  | 'SYNTAX_ERROR';          // Malformed FEEL expression

export type DmnSeverity = 'error' | 'warning' | 'info';

export interface DmnRuleConflict {
  id: string;
  type: DmnConflictType;
  severity: DmnSeverity;
  rule1: DMNRule;
  rule2?: DMNRule;
  conflictingClauseIds: string[];
  conflictingClauseLabels: string[];
  differingOutputLabels: string[];
  message: string;
  details: string;
  suggestedFix?: string;
}

export interface DmnValidationReport {
  isValid: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
  conflicts: DmnRuleConflict[];
  ruleConflictMap: Record<string, DmnRuleConflict[]>; // ruleId -> array of conflicts involving this rule
}

interface NumericRange {
  min: number;
  includeMin: boolean;
  max: number;
  includeMax: boolean;
}

/**
 * Parses numeric FEEL expression into a range [min, max].
 */
function parseNumericRange(expr: string | undefined): NumericRange | null {
  if (!expr || expr.trim() === '-' || expr.trim() === '') {
    return { min: -Infinity, includeMin: true, max: Infinity, includeMax: true };
  }

  const clean = expr.trim();

  // Range syntax like [10..20] or [10, 20]
  const rangeMatch = clean.match(/^([\[\(])\s*(-?\d+(?:\.\d+)?)\s*(?:\.\.|,)\s*(-?\d+(?:\.\d+)?)\s*([\]\)])$/);
  if (rangeMatch) {
    return {
      min: parseFloat(rangeMatch[2]),
      includeMin: rangeMatch[1] === '[',
      max: parseFloat(rangeMatch[3]),
      includeMax: rangeMatch[4] === ']'
    };
  }

  if (clean.startsWith('>=')) {
    const val = parseFloat(clean.replace('>=', '').trim());
    return isNaN(val) ? null : { min: val, includeMin: true, max: Infinity, includeMax: true };
  }
  if (clean.startsWith('>')) {
    const val = parseFloat(clean.replace('>', '').trim());
    return isNaN(val) ? null : { min: val, includeMin: false, max: Infinity, includeMax: true };
  }
  if (clean.startsWith('<=')) {
    const val = parseFloat(clean.replace('<=', '').trim());
    return isNaN(val) ? null : { min: -Infinity, includeMin: true, max: val, includeMax: true };
  }
  if (clean.startsWith('<')) {
    const val = parseFloat(clean.replace('<', '').trim());
    return isNaN(val) ? null : { min: -Infinity, includeMin: true, max: val, includeMax: false };
  }
  if (clean.startsWith('==')) {
    const val = parseFloat(clean.replace('==', '').trim());
    return isNaN(val) ? null : { min: val, includeMin: true, max: val, includeMax: true };
  }

  // Exact number without operator (e.g. "720")
  const directNum = parseFloat(clean);
  if (!isNaN(directNum)) {
    return { min: directNum, includeMin: true, max: directNum, includeMax: true };
  }

  return null;
}

/**
 * Checks if two numeric ranges overlap.
 */
function rangesOverlap(r1: NumericRange, r2: NumericRange): boolean {
  // If r1 is completely above r2
  if (r1.min > r2.max) return false;
  if (r1.min === r2.max && (!r1.includeMin || !r2.includeMax)) return false;

  // If r2 is completely above r1
  if (r2.min > r1.max) return false;
  if (r2.min === r1.max && (!r2.includeMin || !r1.includeMax)) return false;

  return true;
}

/**
 * Checks if two string FEEL expressions overlap.
 */
function stringConditionsOverlap(expr1: string | undefined, expr2: string | undefined): boolean {
  if (!expr1 || expr1.trim() === '-' || expr1.trim() === '') return true;
  if (!expr2 || expr2.trim() === '-' || expr2.trim() === '') return true;

  const clean1 = expr1.trim().replace(/^["']|["']$/g, '').toLowerCase();
  const clean2 = expr2.trim().replace(/^["']|["']$/g, '').toLowerCase();

  // Handle multi-values e.g. "SỔ TIẾT KIỆM", "BẤT ĐỘNG SẢN"
  const vals1 = clean1.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
  const vals2 = clean2.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));

  return vals1.some(v => vals2.includes(v));
}

/**
 * Checks if two boolean FEEL expressions overlap.
 */
function booleanConditionsOverlap(expr1: string | undefined, expr2: string | undefined): boolean {
  if (!expr1 || expr1.trim() === '-' || expr1.trim() === '') return true;
  if (!expr2 || expr2.trim() === '-' || expr2.trim() === '') return true;

  const b1 = expr1.trim().toLowerCase() === 'true';
  const b2 = expr2.trim().toLowerCase() === 'true';

  return b1 === b2;
}

/**
 * Checks if two clauses overlap based on clause type.
 */
function clausesOverlap(
  val1: string | undefined, 
  val2: string | undefined, 
  typeRef: string
): boolean {
  if (typeRef === 'number') {
    const r1 = parseNumericRange(val1);
    const r2 = parseNumericRange(val2);
    if (!r1 || !r2) return true; // Fail safe on unparseable
    return rangesOverlap(r1, r2);
  }

  if (typeRef === 'boolean') {
    return booleanConditionsOverlap(val1, val2);
  }

  return stringConditionsOverlap(val1, val2);
}

/**
 * Checks if outputs between two rules differ.
 */
function getDifferingOutputs(
  r1: DMNRule, 
  r2: DMNRule, 
  outputs: DMNOutputClause[]
): string[] {
  const differing: string[] = [];
  for (const out of outputs) {
    const val1 = r1.outputEntries[out.id];
    const val2 = r2.outputEntries[out.id];
    if (String(val1) !== String(val2)) {
      differing.push(out.label || out.name);
    }
  }
  return differing;
}

/**
 * Main validation engine for DMN Decision Tables.
 */
export function validateDmnDecision(decision: DMNDecisionDefinition): DmnValidationReport {
  const conflicts: DmnRuleConflict[] = [];
  const ruleConflictMap: Record<string, DmnRuleConflict[]> = {};

  const initRuleConflict = (ruleId: string) => {
    if (!ruleConflictMap[ruleId]) ruleConflictMap[ruleId] = [];
  };

  decision.rules.forEach(r => initRuleConflict(r.id));

  // Check for syntax errors on rules
  decision.rules.forEach(rule => {
    decision.inputs.forEach(input => {
      const expr = rule.inputEntries[input.id];
      if (expr && expr !== '-' && expr.trim() !== '') {
        if (input.typeRef === 'number') {
          const range = parseNumericRange(expr);
          if (!range) {
            const conflict: DmnRuleConflict = {
              id: `syntax_${rule.id}_${input.id}`,
              type: 'SYNTAX_ERROR',
              severity: 'error',
              rule1: rule,
              conflictingClauseIds: [input.id],
              conflictingClauseLabels: [input.label],
              differingOutputLabels: [],
              message: `Cú pháp không hợp lệ tại dòng #${rule.ruleNumber}`,
              details: `Biểu thức "${expr}" ở cột "${input.label}" không phải là số hoặc khoảng số FEEL hợp lệ.`,
              suggestedFix: `Sử dụng cú pháp chuẩn như: >= 700, <= 50, hoặc [10..50].`
            };
            conflicts.push(conflict);
            ruleConflictMap[rule.id].push(conflict);
          }
        }
      }
    });
  });

  // Pairwise rule overlap check
  const rules = decision.rules;
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const r1 = rules[i];
      const r2 = rules[j];

      // Two rules overlap IF AND ONLY IF all input clauses overlap
      let allInputsOverlap = true;
      const overlappingClauses: string[] = [];
      const overlappingLabels: string[] = [];

      for (const input of decision.inputs) {
        const val1 = r1.inputEntries[input.id];
        const val2 = r2.inputEntries[input.id];

        if (clausesOverlap(val1, val2, input.typeRef)) {
          overlappingClauses.push(input.id);
          overlappingLabels.push(input.label);
        } else {
          allInputsOverlap = false;
          break; // At least one input clause is mutually disjoint => rules are disjoint!
        }
      }

      if (allInputsOverlap) {
        const differingOutputs = getDifferingOutputs(r1, r2, decision.outputs);
        const hasDifferingOutputs = differingOutputs.length > 0;

        if (hasDifferingOutputs) {
          // Both conditions can be satisfied, but produce DIFFERENT results!
          const isUniquePolicy = decision.hitPolicy === 'UNIQUE';
          const isFirstPolicy = decision.hitPolicy === 'FIRST';

          const severity: DmnSeverity = isUniquePolicy ? 'error' : (isFirstPolicy ? 'warning' : 'error');
          const type: DmnConflictType = isUniquePolicy ? 'OVERLAPPING_CONFLICT' : (isFirstPolicy ? 'SHADOWED_RULE' : 'OVERLAPPING_CONFLICT');

          const conflict: DmnRuleConflict = {
            id: `conflict_${r1.id}_${r2.id}`,
            type,
            severity,
            rule1: r1,
            rule2: r2,
            conflictingClauseIds: overlappingClauses,
            conflictingClauseLabels: overlappingLabels,
            differingOutputLabels: differingOutputs,
            message: isUniquePolicy
              ? `Xung đột nghiêm trọng (Hit Policy UNIQUE): Dòng #${r1.ruleNumber} và #${r2.ruleNumber}`
              : `Chồng lấn điều kiện đầu vào: Dòng #${r1.ruleNumber} và #${r2.ruleNumber}`,
            details: `Cả hai quy tắc đều có thể thỏa mãn đồng thời trên các cột: [${overlappingLabels.join(', ')}], nhưng trả về kết quả mâu thuẫn trên: [${differingOutputs.join(', ')}].`,
            suggestedFix: isFirstPolicy
              ? `Với chính sách FIRST, dòng #${r1.ruleNumber} sẽ luôn được ưu tiên kích hoạt trước dòng #${r2.ruleNumber}. Nếu đây là ý định phân tầng, bạn có thể giữ nguyên hoặc giới hạn điều kiện chặt hơn.`
              : `Thêm điều kiện phân biệt hoặc điều chỉnh khoảng giá trị (ví dụ: chia thành [650..719] và [>= 720]) để hai quy tắc hoàn toàn tách biệt.`
          };

          conflicts.push(conflict);
          ruleConflictMap[r1.id].push(conflict);
          ruleConflictMap[r2.id].push(conflict);
        } else {
          // Identical inputs and identical outputs => Redundant Rule
          const conflict: DmnRuleConflict = {
            id: `redundant_${r1.id}_${r2.id}`,
            type: 'REDUNDANT_RULE',
            severity: 'warning',
            rule1: r1,
            rule2: r2,
            conflictingClauseIds: overlappingClauses,
            conflictingClauseLabels: overlappingLabels,
            differingOutputLabels: [],
            message: `Quy tắc trùng lặp dư thừa: Dòng #${r1.ruleNumber} và #${r2.ruleNumber}`,
            details: `Dòng #${r2.ruleNumber} có tất cả điều kiện đầu vào và kết quả đầu ra hoàn toàn trùng với dòng #${r1.ruleNumber}.`,
            suggestedFix: `Bạn có thể xóa bớt dòng #${r2.ruleNumber} để bảng quyết định tinh gọn và dễ bảo trì hơn.`
          };

          conflicts.push(conflict);
          ruleConflictMap[r1.id].push(conflict);
          ruleConflictMap[r2.id].push(conflict);
        }
      }
    }
  }

  const errorCount = conflicts.filter(c => c.severity === 'error').length;
  const warningCount = conflicts.filter(c => c.severity === 'warning').length;

  return {
    isValid: errorCount === 0,
    hasErrors: errorCount > 0,
    hasWarnings: warningCount > 0,
    errorCount,
    warningCount,
    conflicts,
    ruleConflictMap
  };
}
