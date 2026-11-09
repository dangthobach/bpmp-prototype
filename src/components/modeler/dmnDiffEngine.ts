import { 
  DMNDecisionDefinition, 
  DMNDiffReport, 
  DMNRuleDiffItem, 
  DMNDiffRuleStatus,
  DMNRule 
} from '../../types/dmn';

/**
 * Compares two DMN decision definition snapshots and produces a structured diff report.
 * @param base Base (e.g. historical / older) version
 * @param target Target (e.g. current / newer) version
 * @param baseTag Label for base version (e.g. 'v1.0')
 * @param targetTag Label for target version (e.g. 'v2.0')
 */
export function compareDmnVersions(
  base: DMNDecisionDefinition,
  target: DMNDecisionDefinition,
  baseTag = 'v' + base.version + '.0',
  targetTag = 'v' + target.version + '.0'
): DMNDiffReport {
  // 1. Hit Policy
  const hitPolicyChanged = base.hitPolicy !== target.hitPolicy;

  // 2. Schema: Inputs
  const baseInputIds = new Set(base.inputs.map(i => i.id));
  const targetInputIds = new Set(target.inputs.map(i => i.id));

  const inputsAdded = target.inputs.filter(i => !baseInputIds.has(i.id));
  const inputsRemoved = base.inputs.filter(i => !targetInputIds.has(i.id));

  // 3. Schema: Outputs
  const baseOutputIds = new Set(base.outputs.map(o => o.id));
  const targetOutputIds = new Set(target.outputs.map(o => o.id));

  const outputsAdded = target.outputs.filter(o => !baseOutputIds.has(o.id));
  const outputsRemoved = base.outputs.filter(o => !targetOutputIds.has(o.id));

  // 4. Compare Rules
  const allInputIds = Array.from(new Set([...base.inputs.map(i => i.id), ...target.inputs.map(i => i.id)]));
  const allOutputIds = Array.from(new Set([...base.outputs.map(o => o.id), ...target.outputs.map(o => o.id)]));

  const rulesDiff: DMNRuleDiffItem[] = [];

  const baseRulesMap = new Map<string, DMNRule>();
  base.rules.forEach(r => baseRulesMap.set(r.id, r));

  const targetRulesMap = new Map<string, DMNRule>();
  target.rules.forEach(r => targetRulesMap.set(r.id, r));

  const processedBaseRuleIds = new Set<string>();

  // Process rules from target
  target.rules.forEach((targetRule, index) => {
    // Try matching by ID first
    let baseRule = baseRulesMap.get(targetRule.id);

    // If ID not found, attempt matching by rule index if rule count matches and inputs correlate
    if (!baseRule && index < base.rules.length && !processedBaseRuleIds.has(base.rules[index].id)) {
      const candidate = base.rules[index];
      // If at least 50% clauses match or rule numbers align
      if (candidate.ruleNumber === targetRule.ruleNumber) {
        baseRule = candidate;
      }
    }

    if (baseRule) {
      processedBaseRuleIds.add(baseRule.id);

      // Compare inputs
      const inputDiffs: Record<string, { baseVal?: string; targetVal?: string; isChanged: boolean }> = {};
      let hasInputDiff = false;

      allInputIds.forEach(inpId => {
        const bVal = baseRule?.inputEntries[inpId] ?? '-';
        const tVal = targetRule.inputEntries[inpId] ?? '-';
        const isChanged = bVal !== tVal;
        if (isChanged) hasInputDiff = true;
        inputDiffs[inpId] = { baseVal: bVal, targetVal: tVal, isChanged };
      });

      // Compare outputs
      const outputDiffs: Record<string, { baseVal?: any; targetVal?: any; isChanged: boolean }> = {};
      let hasOutputDiff = false;

      allOutputIds.forEach(outId => {
        const bVal = baseRule?.outputEntries[outId] ?? '-';
        const tVal = targetRule.outputEntries[outId] ?? '-';
        const isChanged = String(bVal) !== String(tVal);
        if (isChanged) hasOutputDiff = true;
        outputDiffs[outId] = { baseVal: bVal, targetVal: tVal, isChanged };
      });

      // Compare annotation
      const bAnno = baseRule.annotation || '';
      const tAnno = targetRule.annotation || '';
      const isAnnoChanged = bAnno !== tAnno;
      const annotationDiff = { baseVal: bAnno, targetVal: tAnno, isChanged: isAnnoChanged };

      const isModified = hasInputDiff || hasOutputDiff || isAnnoChanged;
      const status: DMNDiffRuleStatus = isModified ? 'MODIFIED' : 'UNCHANGED';

      rulesDiff.push({
        status,
        ruleNumber: targetRule.ruleNumber,
        ruleId: targetRule.id,
        baseRule,
        targetRule,
        inputDiffs,
        outputDiffs,
        annotationDiff
      });
    } else {
      // Newly ADDED rule
      const inputDiffs: Record<string, { baseVal?: string; targetVal?: string; isChanged: boolean }> = {};
      allInputIds.forEach(inpId => {
        inputDiffs[inpId] = {
          baseVal: undefined,
          targetVal: targetRule.inputEntries[inpId] ?? '-',
          isChanged: true
        };
      });

      const outputDiffs: Record<string, { baseVal?: any; targetVal?: any; isChanged: boolean }> = {};
      allOutputIds.forEach(outId => {
        outputDiffs[outId] = {
          baseVal: undefined,
          targetVal: targetRule.outputEntries[outId] ?? '-',
          isChanged: true
        };
      });

      rulesDiff.push({
        status: 'ADDED',
        ruleNumber: targetRule.ruleNumber,
        ruleId: targetRule.id,
        targetRule,
        inputDiffs,
        outputDiffs,
        annotationDiff: {
          baseVal: undefined,
          targetVal: targetRule.annotation || '',
          isChanged: Boolean(targetRule.annotation)
        }
      });
    }
  });

  // Now process any base rules that were REMOVED in target
  base.rules.forEach(baseRule => {
    if (!processedBaseRuleIds.has(baseRule.id)) {
      const inputDiffs: Record<string, { baseVal?: string; targetVal?: string; isChanged: boolean }> = {};
      allInputIds.forEach(inpId => {
        inputDiffs[inpId] = {
          baseVal: baseRule.inputEntries[inpId] ?? '-',
          targetVal: undefined,
          isChanged: true
        };
      });

      const outputDiffs: Record<string, { baseVal?: any; targetVal?: any; isChanged: boolean }> = {};
      allOutputIds.forEach(outId => {
        outputDiffs[outId] = {
          baseVal: baseRule.outputEntries[outId] ?? '-',
          targetVal: undefined,
          isChanged: true
        };
      });

      rulesDiff.push({
        status: 'REMOVED',
        ruleNumber: baseRule.ruleNumber,
        ruleId: baseRule.id,
        baseRule,
        inputDiffs,
        outputDiffs,
        annotationDiff: {
          baseVal: baseRule.annotation || '',
          targetVal: undefined,
          isChanged: Boolean(baseRule.annotation)
        }
      });
    }
  });

  // Calculate statistics
  const addedRulesCount = rulesDiff.filter(r => r.status === 'ADDED').length;
  const removedRulesCount = rulesDiff.filter(r => r.status === 'REMOVED').length;
  const modifiedRulesCount = rulesDiff.filter(r => r.status === 'MODIFIED').length;
  const unchangedRulesCount = rulesDiff.filter(r => r.status === 'UNCHANGED').length;

  const schemaChangesCount = inputsAdded.length + inputsRemoved.length + outputsAdded.length + outputsRemoved.length + (hitPolicyChanged ? 1 : 0);
  const totalChanges = addedRulesCount + removedRulesCount + modifiedRulesCount + schemaChangesCount;

  return {
    baseVersionTag: baseTag,
    targetVersionTag: targetTag,
    hitPolicyChanged,
    baseHitPolicy: base.hitPolicy,
    targetHitPolicy: target.hitPolicy,
    inputsAdded,
    inputsRemoved,
    outputsAdded,
    outputsRemoved,
    rulesDiff,
    stats: {
      addedRulesCount,
      removedRulesCount,
      modifiedRulesCount,
      unchangedRulesCount,
      totalChanges
    }
  };
}
