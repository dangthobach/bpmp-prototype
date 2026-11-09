import React, { useState, useMemo, useEffect } from 'react';
import { 
  DMNDecisionDefinition, 
  DMNRule, 
  DMNInputClause, 
  DMNOutputClause, 
  HitPolicy, 
  DMNEvaluationResult,
  DMNVersionSnapshot
} from '../../types/dmn';
import { INITIAL_DMN_DECISIONS } from '../../data/mockDmnData';
import { INITIAL_DMN_VERSION_HISTORY } from '../../data/mockDmnVersionHistory';
import { generateDmnXml, exportDmnFile } from './dmnXmlGenerator';
import { DmnVisualLogicEditor } from './DmnVisualLogicEditor';
import { validateDmnDecision, DmnValidationReport, DmnRuleConflict } from './dmnValidator';
import { DmnVersionHistorySidebar } from './DmnVersionHistorySidebar';
import { DmnVersionCompareModal } from './DmnVersionCompareModal';
import { DmnVersionInspectModal } from './DmnVersionInspectModal';
import { 
  Table, 
  Plus, 
  Trash2, 
  Copy, 
  Play, 
  RotateCcw, 
  FileCode, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  ShieldAlert,
  X,
  Sliders, 
  Search, 
  Sparkles, 
  Info, 
  ArrowRight, 
  Columns, 
  Layers, 
  ChevronDown,
  Check,
  Zap,
  HelpCircle,
  History,
  GitBranch,
  ArrowLeftRight
} from 'lucide-react';

interface DmnTableModuleProps {
  initialDecisionKey?: string;
  onDeployDecision?: (decision: DMNDecisionDefinition) => void;
}

export const DmnTableModule: React.FC<DmnTableModuleProps> = ({
  initialDecisionKey,
  onDeployDecision
}) => {
  const [decisions, setDecisions] = useState<DMNDecisionDefinition[]>(INITIAL_DMN_DECISIONS);
  const [selectedKey, setSelectedKey] = useState<string>(initialDecisionKey || 'creditScoreDMN');
  const [viewMode, setViewMode] = useState<'matrix' | 'visual'>('matrix');
  const [searchRuleTerm, setSearchRuleTerm] = useState<string>('');
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);
  const [showXmlModal, setShowXmlModal] = useState<boolean>(false);
  const [xmlContent, setXmlContent] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Version History States
  const [versionHistories, setVersionHistories] = useState<Record<string, DMNVersionSnapshot[]>>(INITIAL_DMN_VERSION_HISTORY);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState<boolean>(false);
  const [compareModalState, setCompareModalState] = useState<{ isOpen: boolean; base: DMNVersionSnapshot; target: DMNVersionSnapshot } | null>(null);
  const [inspectModalVersion, setInspectModalVersion] = useState<DMNVersionSnapshot | null>(null);

  // Simulation presets for instant evaluation testing
  const SIMULATION_PRESETS: Array<{ id: string; name: string; description: string; values: Record<string, any> }> = [
    {
      id: 'preset_vip',
      name: '🌟 VIP STP (Cấp 2 Tỷ)',
      description: 'Khách hàng VIP, CIC cao (750), DTI 30%, Bất động sản -> Cấp 2 Tỷ',
      values: {
        in_cic: 750,
        in_income: 60000000,
        in_dti: 0.30,
        in_collateral: 'BẤT ĐỘNG SẢN',
        in_tenor: 12,
        in_tier: 'DIAMOND',
        in_bad_debt: false,
        in_bio: true,
        in_amount: 80000000
      }
    },
    {
      id: 'preset_standard',
      name: '🏢 Tiêu Chuẩn (Hạn mức 800 Tr)',
      description: 'Hồ sơ đạt chuẩn, CIC 660, DTI 45%, Bất động sản -> Hạn mức 800 Triệu',
      values: {
        in_cic: 660,
        in_income: 25000000,
        in_dti: 0.45,
        in_collateral: 'BẤT ĐỘNG SẢN',
        in_tenor: 24,
        in_tier: 'GOLD',
        in_bad_debt: false,
        in_bio: true,
        in_amount: 500000000
      }
    },
    {
      id: 'preset_stk',
      name: '📑 Sổ Tiết Kiệm (Cấp 1 Tỷ)',
      description: 'Tài sản Sổ Tiết Kiệm, CIC 690, DTI 40% -> Duyệt Cấp 1 Tỷ',
      values: {
        in_cic: 690,
        in_income: 35000000,
        in_dti: 0.40,
        in_collateral: 'SỔ TIẾT KIỆM',
        in_tenor: 12,
        in_tier: 'PLATINUM',
        in_bad_debt: false,
        in_bio: true,
        in_amount: 1000000000
      }
    },
    {
      id: 'preset_risk',
      name: '⚠️ Rủi Ro (Từ Chối)',
      description: 'Điểm CIC thấp (560), DTI 65%, Có nợ xấu -> Từ chối (REJECTED)',
      values: {
        in_cic: 560,
        in_income: 12000000,
        in_dti: 0.65,
        in_collateral: 'TÍN CHẤP',
        in_tenor: 36,
        in_tier: 'STANDARD',
        in_bad_debt: true,
        in_bio: false,
        in_amount: 20000000
      }
    }
  ];

  // Validation Layer States
  const [showValidationPanel, setShowValidationPanel] = useState<boolean>(false);
  const [highlightedConflictId, setHighlightedConflictId] = useState<string | null>(null);

  // Active Decision
  const currentDecision = useMemo(() => {
    return decisions.find(d => d.key === selectedKey) || decisions[0];
  }, [decisions, selectedKey]);

  // Real-Time Rule Conflict Validation Layer
  const validationReport = useMemo(() => {
    return validateDmnDecision(currentDecision);
  }, [currentDecision]);

  // Test bench form values
  const [testInputs, setTestInputs] = useState<Record<string, any>>({
    in_cic: 730,
    in_income: 60000000,
    in_dti: 0.32,
    in_collateral: 'BẤT ĐỘNG SẢN',
    in_tenor: 12,
    in_tier: 'DIAMOND',
    in_bad_debt: false,
    in_bio: true,
    in_amount: 80000000
  });

  const [evaluationResult, setEvaluationResult] = useState<DMNEvaluationResult | null>(null);
  const [activeEvaluatedRuleId, setActiveEvaluatedRuleId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Update current decision in state
  const updateCurrentDecision = (updated: DMNDecisionDefinition) => {
    setDecisions(prev => prev.map(d => d.key === updated.key ? updated : d));
  };

  // Version snapshots for the currently selected decision
  const currentVersions = useMemo(() => {
    return versionHistories[currentDecision.key] || [];
  }, [versionHistories, currentDecision.key]);

  // Save a new version snapshot
  const handleSaveSnapshot = (tag: string, summary: string, authorName: string) => {
    const newSnapshot: DMNVersionSnapshot = {
      id: `snap_${currentDecision.key}_${Date.now()}`,
      decisionKey: currentDecision.key,
      versionTag: tag,
      versionNumber: currentDecision.version + 0.1,
      createdAt: new Date().toISOString(),
      author: {
        name: authorName || 'Admin BPM (Bạn)',
        role: 'BPM Decision Architect'
      },
      summary: summary,
      decision: JSON.parse(JSON.stringify(currentDecision)),
      isCurrent: true
    };

    setVersionHistories(prev => {
      const existing = prev[currentDecision.key] || [];
      const updated = existing.map(v => ({ ...v, isCurrent: false }));
      return {
        ...prev,
        [currentDecision.key]: [newSnapshot, ...updated]
      };
    });

    showToast(`Đã lưu snapshot phiên bản mới thành công: ${tag}`);
  };

  // Revert decision table to a previous version snapshot
  const handleRevertVersion = (snapshot: DMNVersionSnapshot) => {
    // 1. Auto-save current state as a backup snapshot
    const backupSnapshot: DMNVersionSnapshot = {
      id: `snap_backup_${Date.now()}`,
      decisionKey: currentDecision.key,
      versionTag: `v${currentDecision.version}.bak`,
      versionNumber: currentDecision.version,
      createdAt: new Date().toISOString(),
      author: {
        name: 'Hệ Thống (Auto Backup)',
        role: 'BPM Engine'
      },
      summary: `Tự động sao lưu dữ liệu trước khi khôi phục về ${snapshot.versionTag}`,
      decision: JSON.parse(JSON.stringify(currentDecision)),
      isCurrent: false
    };

    // 2. Deep copy restored definition into active state
    const restoredDecision: DMNDecisionDefinition = JSON.parse(JSON.stringify(snapshot.decision));
    updateCurrentDecision(restoredDecision);

    // 3. Create a revert log snapshot marking it current
    const revertLogSnapshot: DMNVersionSnapshot = {
      id: `snap_revert_${Date.now()}`,
      decisionKey: currentDecision.key,
      versionTag: `${snapshot.versionTag} (Khôi Phục)`,
      versionNumber: snapshot.versionNumber,
      createdAt: new Date().toISOString(),
      author: {
        name: 'Admin BPM (Bạn)',
        role: 'Decision Architect'
      },
      summary: `Khôi phục thành công từ mốc ${snapshot.versionTag}: "${snapshot.summary}"`,
      decision: restoredDecision,
      isCurrent: true
    };

    setVersionHistories(prev => {
      const existing = prev[currentDecision.key] || [];
      const unCurrented = existing.map(v => ({ ...v, isCurrent: false }));
      return {
        ...prev,
        [currentDecision.key]: [revertLogSnapshot, backupSnapshot, ...unCurrented]
      };
    });

    showToast(`Đã khôi phục thành công bảng quyết định về phiên bản ${snapshot.versionTag}!`);
  };

  // Hit Policy configuration helper
  const handleHitPolicyChange = (policy: HitPolicy) => {
    updateCurrentDecision({ ...currentDecision, hitPolicy: policy });
    showToast(`Đã chuyển đổi Hit Policy sang: ${policy}`);
  };

  // Quick test helper to demo conflict detection
  const handleInjectSampleConflict = () => {
    if (currentDecision.rules.length === 0) return;
    const baseRule = currentDecision.rules[0];
    const conflictRule: DMNRule = {
      id: `conflict_test_${Date.now().toString().slice(-4)}`,
      ruleNumber: currentDecision.rules.length + 1,
      inputEntries: {
        ...baseRule.inputEntries
      },
      outputEntries: {
        ...baseRule.outputEntries,
        [currentDecision.outputs[0].id]: 'REJECTED' // Conflicting result
      },
      annotation: '⚠️ [Quy tắc thử nghiệm xung đột]: Cùng điều kiện với dòng #1 nhưng kết quả bị Từ Chối (Mâu thuẫn)'
    };
    updateCurrentDecision({
      ...currentDecision,
      rules: [...currentDecision.rules, conflictRule]
    });
    setShowValidationPanel(true);
    setHighlightedConflictId(`conflict_${baseRule.id}_${conflictRule.id}`);
    showToast('Đã thêm 1 quy tắc mẫu gây xung đột để kiểm tra bộ phát hiện lỗi!');
  };

  // Quick fix: remove conflicting or redundant rule
  const handleRemoveConflictRule = (ruleId: string) => {
    handleDeleteRule(ruleId);
    showToast('Đã loại bỏ dòng quy tắc xung đột.');
  };

  // Add new Rule row
  const handleAddRule = () => {
    const newRuleId = `rule_${Date.now().toString().slice(-4)}`;
    const emptyInputs: Record<string, string> = {};
    currentDecision.inputs.forEach(i => {
      emptyInputs[i.id] = '-';
    });

    const defaultOutputs: Record<string, any> = {};
    currentDecision.outputs.forEach(o => {
      defaultOutputs[o.id] = o.typeRef === 'number' ? 0 : o.typeRef === 'boolean' ? false : 'PENDING';
    });

    const newRule: DMNRule = {
      id: newRuleId,
      ruleNumber: currentDecision.rules.length + 1,
      inputEntries: emptyInputs,
      outputEntries: defaultOutputs,
      annotation: 'Quy tắc mới khởi tạo'
    };

    updateCurrentDecision({
      ...currentDecision,
      rules: [...currentDecision.rules, newRule]
    });
    showToast(`Đã thêm dòng quy tắc #${newRule.ruleNumber}`);
  };

  // Duplicate Rule row
  const handleDuplicateRule = (rule: DMNRule) => {
    const newRuleId = `rule_${Date.now().toString().slice(-4)}`;
    const clonedRule: DMNRule = {
      ...rule,
      id: newRuleId,
      ruleNumber: currentDecision.rules.length + 1,
      annotation: `[Bản sao #${rule.ruleNumber}] ${rule.annotation || ''}`
    };

    updateCurrentDecision({
      ...currentDecision,
      rules: [...currentDecision.rules, clonedRule]
    });
    showToast(`Đã nhân bản quy tắc #${rule.ruleNumber}`);
  };

  // Delete Rule row
  const handleDeleteRule = (ruleId: string) => {
    const remaining = currentDecision.rules
      .filter(r => r.id !== ruleId)
      .map((r, idx) => ({ ...r, ruleNumber: idx + 1 }));

    updateCurrentDecision({
      ...currentDecision,
      rules: remaining
    });
    if (activeEvaluatedRuleId === ruleId) {
      setActiveEvaluatedRuleId(null);
      setEvaluationResult(null);
    }
    showToast('Đã xóa dòng quy tắc DMN.');
  };

  // Cell Value Edit
  const handleCellChange = (ruleId: string, clauseId: string, isInput: boolean, value: any) => {
    const updatedRules = currentDecision.rules.map(rule => {
      if (rule.id === ruleId) {
        if (isInput) {
          return {
            ...rule,
            inputEntries: { ...rule.inputEntries, [clauseId]: value }
          };
        } else {
          return {
            ...rule,
            outputEntries: { ...rule.outputEntries, [clauseId]: value }
          };
        }
      }
      return rule;
    });

    updateCurrentDecision({ ...currentDecision, rules: updatedRules });
  };

  // Add Input Column
  const handleAddInputClause = () => {
    const newId = `in_${Date.now().toString().slice(-4)}`;
    const newClause: DMNInputClause = {
      id: newId,
      label: 'Điều Kiện Mới',
      expression: `variable_${newId}`,
      typeRef: 'number'
    };

    const updatedRules = currentDecision.rules.map(r => ({
      ...r,
      inputEntries: { ...r.inputEntries, [newId]: '-' }
    }));

    updateCurrentDecision({
      ...currentDecision,
      inputs: [...currentDecision.inputs, newClause],
      rules: updatedRules
    });
    showToast('Đã thêm cột điều kiện đầu vào (Input Clause).');
  };

  // Add Output Column
  const handleAddOutputClause = () => {
    const newId = `out_${Date.now().toString().slice(-4)}`;
    const newClause: DMNOutputClause = {
      id: newId,
      label: 'Kết Quả Mới',
      name: `result_${newId}`,
      typeRef: 'string'
    };

    const updatedRules = currentDecision.rules.map(r => ({
      ...r,
      outputEntries: { ...r.outputEntries, [newId]: 'DEFAULT_VALUE' }
    }));

    updateCurrentDecision({
      ...currentDecision,
      outputs: [...currentDecision.outputs, newClause],
      rules: updatedRules
    });
    showToast('Đã thêm cột kết quả đầu ra (Output Clause).');
  };

  // FEEL Expression Evaluator for DMN Simulator
  const evaluateRuleCell = (cellExpr: string, inputValue: any): boolean => {
    if (!cellExpr || cellExpr.trim() === '-' || cellExpr.trim() === '') return true;
    const expr = cellExpr.trim();

    // Check string match e.g. "BẤT ĐỘNG SẢN"
    if (expr.startsWith('"') && expr.endsWith('"')) {
      const cleanTarget = expr.slice(1, -1);
      return String(inputValue).trim().toLowerCase() === cleanTarget.toLowerCase();
    }

    // Check boolean match
    if (expr === 'true' || expr === 'false') {
      return Boolean(inputValue) === (expr === 'true');
    }

    // Check numeric comparisons (FEEL syntax: >= 720, <= 0.35, > 12, etc.)
    const numVal = Number(inputValue);
    if (!isNaN(numVal)) {
      if (expr.startsWith('>=')) {
        return numVal >= parseFloat(expr.replace('>=', '').trim());
      }
      if (expr.startsWith('<=')) {
        return numVal <= parseFloat(expr.replace('<=', '').trim());
      }
      if (expr.startsWith('>')) {
        return numVal > parseFloat(expr.replace('>', '').trim());
      }
      if (expr.startsWith('<')) {
        return numVal < parseFloat(expr.replace('<', '').trim());
      }
      if (expr.startsWith('==')) {
        return numVal === parseFloat(expr.replace('==', '').trim());
      }
      // Single number match
      const targetNum = parseFloat(expr);
      if (!isNaN(targetNum)) {
        return numVal === targetNum;
      }
    }

    return false;
  };

  // Run Real-Time Decision Evaluation
  const handleRunEvaluation = () => {
    const startTime = performance.now();
    const matched: DMNRule[] = [];

    for (const rule of currentDecision.rules) {
      let isMatch = true;
      for (const input of currentDecision.inputs) {
        const cellExpr = rule.inputEntries[input.id];
        const val = testInputs[input.id];
        if (!evaluateRuleCell(cellExpr, val)) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        matched.push(rule);
        // If FIRST hit policy, stop on first match
        if (currentDecision.hitPolicy === 'FIRST') {
          break;
        }
      }
    }

    const elapsed = Math.max(0.8, Number((performance.now() - startTime).toFixed(2)));

    if (matched.length > 0) {
      const activeRule = matched[0];
      setActiveEvaluatedRuleId(activeRule.id);
      setEvaluationResult({
        matchedRules: matched,
        outputs: activeRule.outputEntries,
        evaluationTimeMs: elapsed,
        hitPolicyApplied: currentDecision.hitPolicy,
        status: 'SUCCESS'
      });
      showToast(`Quyết định thành công: Khớp quy tắc #${activeRule.ruleNumber} (${elapsed}ms)`);
    } else {
      setActiveEvaluatedRuleId(null);
      setEvaluationResult({
        matchedRules: [],
        outputs: {},
        evaluationTimeMs: elapsed,
        hitPolicyApplied: currentDecision.hitPolicy,
        status: 'NO_MATCH',
        message: 'Không tìm thấy dòng quy tắc nào khớp với bộ thông số đầu vào này.'
      });
      showToast('Không có quy tắc DMN nào khớp với dữ liệu thử nghiệm.');
    }
  };

  // Real-Time Simulation Reactive Evaluation: Automatically runs when simulation is active and inputs change
  useEffect(() => {
    if (!isSimulationActive) {
      setActiveEvaluatedRuleId(null);
      setEvaluationResult(null);
      return;
    }

    const startTime = performance.now();
    const matched: DMNRule[] = [];

    for (const rule of currentDecision.rules) {
      let isMatch = true;
      for (const input of currentDecision.inputs) {
        const cellExpr = rule.inputEntries[input.id];
        const val = testInputs[input.id];
        if (!evaluateRuleCell(cellExpr, val)) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        matched.push(rule);
        if (currentDecision.hitPolicy === 'FIRST') {
          break;
        }
      }
    }

    const elapsed = Math.max(0.4, Number((performance.now() - startTime).toFixed(2)));

    if (matched.length > 0) {
      const activeRule = matched[0];
      setActiveEvaluatedRuleId(activeRule.id);
      setEvaluationResult({
        matchedRules: matched,
        outputs: activeRule.outputEntries,
        evaluationTimeMs: elapsed,
        hitPolicyApplied: currentDecision.hitPolicy,
        status: 'SUCCESS'
      });
    } else {
      setActiveEvaluatedRuleId(null);
      setEvaluationResult({
        matchedRules: [],
        outputs: {},
        evaluationTimeMs: elapsed,
        hitPolicyApplied: currentDecision.hitPolicy,
        status: 'NO_MATCH',
        message: 'Không tìm thấy dòng quy tắc nào khớp với bộ thông số đầu vào này.'
      });
    }
  }, [isSimulationActive, testInputs, currentDecision]);

  // Filtered Rules
  const filteredRules = currentDecision.rules.filter(rule => {
    if (!searchRuleTerm) return true;
    const term = searchRuleTerm.toLowerCase();
    const inMatch = Object.values(rule.inputEntries).some(v => String(v).toLowerCase().includes(term));
    const outMatch = Object.values(rule.outputEntries).some(v => String(v).toLowerCase().includes(term));
    const descMatch = (rule.annotation || '').toLowerCase().includes(term);
    return inMatch || outMatch || descMatch;
  });

  // Open XML View
  const handleOpenXml = () => {
    const xml = generateDmnXml(currentDecision);
    setXmlContent(xml);
    setShowXmlModal(true);
  };

  // Direct Export DMN file
  const handleExportDmn = () => {
    const filename = exportDmnFile(currentDecision);
    showToast(`Đã xuất bảng quyết định thành công: ${filename} (Chuẩn OMG DMN 1.3)`);
  };

  // Copy XML to clipboard
  const handleCopyXml = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      showToast('Đã sao chép mã nguồn DMN 1.3 XML vào clipboard!');
    } catch {
      showToast('Không thể sao chép tự động, vui lòng copy thủ công.');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 select-none">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-1/2 translate-x-1/2 z-60 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Bar for DMN */}
      <div className="h-12 border-b border-slate-200/80 dark:border-slate-800/80 px-4 flex items-center justify-between text-xs bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Decision Table Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium text-[11px]">Bảng Quyết Định:</span>
            <select
              value={selectedKey}
              onChange={(e) => {
                setSelectedKey(e.target.value);
                setEvaluationResult(null);
                setActiveEvaluatedRuleId(null);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 font-bold text-slate-800 dark:text-slate-200 text-xs shadow-2xs focus:outline-none cursor-pointer"
            >
              {decisions.map(d => (
                <option key={d.key} value={d.key}>
                  {d.name} ({d.key})
                </option>
              ))}
            </select>
          </div>

          {/* Hit Policy Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium text-[11px]">Hit Policy:</span>
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              {(['FIRST', 'UNIQUE', 'COLLECT', 'PRIORITY', 'RULE_ORDER'] as HitPolicy[]).map(hp => (
                <button
                  key={hp}
                  onClick={() => handleHitPolicyChange(hp)}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-mono font-bold transition-all cursor-pointer ${
                    currentDecision.hitPolicy === hp
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  title={`Hit Policy: ${hp}`}
                >
                  {hp === 'FIRST' ? 'F (First)' : hp === 'UNIQUE' ? 'U (Unique)' : hp === 'COLLECT' ? 'C (Collect)' : hp === 'PRIORITY' ? 'P' : 'R'}
                </button>
              ))}
            </div>
          </div>

          {/* DMN Spec Badge */}
          <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            OMG DMN 1.3 &bull; Camunda 8
          </span>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* View Mode Switcher: Matrix Grid vs Visual Logic Row Mapper */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-sky-500" />
              <span>Bảng Ma Trận Lưới</span>
            </button>
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'visual'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>Sơ Đồ Ánh Xạ Logic (Visual Mapper)</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden lg:block" />

          {/* Validation Status Pill */}
          <button
            onClick={() => setShowValidationPanel(!showValidationPanel)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              validationReport.hasErrors
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 shadow-2xs font-bold animate-pulse'
                : validationReport.hasWarnings
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-2xs font-bold'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
            }`}
            title="Kiểm tra xung đột quy tắc và trùng lặp điều kiện"
          >
            {validationReport.hasErrors ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            ) : validationReport.hasWarnings ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>
              {validationReport.hasErrors
                ? `${validationReport.errorCount} Lỗi Xung Đột`
                : validationReport.hasWarnings
                ? `${validationReport.warningCount} Cảnh Báo Trùng Lấn`
                : '0 Xung Đột (Hợp Lệ)'}
            </span>
          </button>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* Add Sample Conflict Button for testing */}
          <button
            onClick={handleInjectSampleConflict}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Thêm một quy tắc mâu thuẫn để thử nghiệm bộ phát hiện xung đột"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden xl:inline">+ Thử Xung Đột</span>
          </button>

          {/* Simulation Real-Time Toggle */}
          <button
            onClick={() => {
              const next = !isSimulationActive;
              setIsSimulationActive(next);
              showToast(next ? 'Đã bật chế độ mô phỏng trực tiếp (Simulation ON)' : 'Đã tắt chế độ mô phỏng (Simulation OFF)');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              isSimulationActive 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-xs' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
            title="Bật/Tắt chế độ Mô Phỏng Thời Gian Thực (Simulation)"
          >
            <div className="relative flex items-center">
              <Zap className={`w-3.5 h-3.5 ${isSimulationActive ? 'text-amber-300' : 'text-slate-400'}`} />
              {isSimulationActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </div>
            <span>Simulation</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
              isSimulationActive ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
            }`}>
              {isSimulationActive ? 'ON' : 'OFF'}
            </span>
          </button>

          {viewMode === 'matrix' && (
            <button
              onClick={handleAddRule}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Quy Tắc</span>
            </button>
          )}

          {/* Direct Export .dmn Button */}
          <button
            onClick={handleExportDmn}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Xuất bảng quyết định hiện tại sang định dạng tệp .dmn chuẩn OMG DMN 1.3 / Camunda 8"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất .dmn</span>
          </button>

          {/* DMN XML Preview */}
          <button
            onClick={handleOpenXml}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Xem và chỉnh sửa OMG DMN 1.3 XML"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            <span>DMN XML</span>
          </button>

          {/* Version History Sidebar Toggle */}
          <button
            onClick={() => setIsVersionHistoryOpen(!isVersionHistoryOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              isVersionHistoryOpen
                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 shadow-2xs'
            }`}
            title="Xem lịch sử phiên bản, so sánh sai khác (Diff) và khôi phục (Revert)"
          >
            <History className={`w-3.5 h-3.5 ${isVersionHistoryOpen ? 'text-white' : 'text-purple-600'}`} />
            <span>Lịch Sử</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
              isVersionHistoryOpen ? 'bg-purple-700 text-purple-100' : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
            }`}>
              v{currentDecision.version}.0 ({currentVersions.length})
            </span>
          </button>
        </div>
      </div>

      {/* Main DMN Workspace: Visual Logic Mapper OR Tabular Matrix Grid */}
      <div className="flex-1 flex overflow-hidden relative">
        {viewMode === 'visual' ? (
          <DmnVisualLogicEditor
            decision={currentDecision}
            onUpdateDecision={updateCurrentDecision}
            activeEvaluatedRuleId={activeEvaluatedRuleId}
            testInputs={testInputs}
            onRunTest={handleRunEvaluation}
            onExportDmn={handleExportDmn}
            validationReport={validationReport}
            isSimulationActive={isSimulationActive}
          />
        ) : (
        <div className="flex-1 flex overflow-hidden">
        {/* ======================================================= */}
        {/* 1. DMN DECISION TABLE CANVAS & GRID                     */}
        {/* ======================================================= */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 bg-slate-100/50 dark:bg-slate-950/40 space-y-3">
          {/* Decision Description Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wide">
                  {currentDecision.name}
                </h3>
                <span className="text-[10.5px] font-mono text-slate-400">
                  Key: #{currentDecision.key} &bull; v{currentDecision.version}.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {currentDecision.description}
              </p>
            </div>

            {/* Quick Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm biểu thức FEEL, kết quả..."
                value={searchRuleTerm}
                onChange={(e) => setSearchRuleTerm(e.target.value)}
                className="pl-7 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none w-56 font-mono"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
            </div>
          </div>

          {/* Validation Conflict Inspector Drawer */}
          {showValidationPanel && (
            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md space-y-3 animate-in fade-in duration-150 shrink-0">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                    validationReport.hasErrors
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/60 dark:border-rose-800'
                      : validationReport.hasWarnings
                      ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/60 dark:border-amber-800'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800'
                  }`}>
                    {validationReport.hasErrors || validationReport.hasWarnings ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      Bảng Phân Tích &amp; Phát Hiện Xung Đột Quy Tắc (DMN Rule Conflict Detection)
                    </h4>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                      Tự động phân tích giao thoa miền giá trị (FEEL Range Intersection) theo Hit Policy: <strong className="font-mono text-purple-600">{currentDecision.hitPolicy}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInjectSampleConflict}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors cursor-pointer"
                    title="Thêm một quy tắc mâu thuẫn để kiểm tra bộ phát hiện xung đột"
                  >
                    + Tạo Xung Đột Mẫu
                  </button>
                  <button
                    onClick={() => setShowValidationPanel(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                    title="Đóng bảng phân tích"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Conflict items list */}
              {validationReport.conflicts.length === 0 ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300/60 dark:border-emerald-800/40 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">Hoàn hảo! Không phát hiện bất kỳ xung đột hoặc trùng lặp nào trong {currentDecision.rules.length} quy tắc DMN.</span>
                  </div>
                  <span className="text-[10.5px] font-mono text-emerald-600 dark:text-emerald-400">Camunda 8 FEEL Validated</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {validationReport.conflicts.map(conflict => {
                    const isErr = conflict.severity === 'error';
                    const isSelected = highlightedConflictId === conflict.id;

                    return (
                      <div
                        key={conflict.id}
                        onClick={() => setHighlightedConflictId(isSelected ? null : conflict.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                          isSelected
                            ? 'ring-2 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-400'
                            : isErr
                            ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60 hover:border-rose-300'
                            : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                              isErr
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200'
                            }`}>
                              {conflict.type === 'OVERLAPPING_CONFLICT'
                                ? 'XUNG ĐỘT KẾT QUẢ'
                                : conflict.type === 'SHADOWED_RULE'
                                ? 'QUY TẮC BỊ CHE KHUẤT'
                                : conflict.type === 'REDUNDANT_RULE'
                                ? 'TRÙNG LẶP DƯ THỪA'
                                : 'LỖI CÚ PHÁP'}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {conflict.message}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {conflict.type === 'REDUNDANT_RULE' && conflict.rule2 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveConflictRule(conflict.rule2!.id);
                                }}
                                className="px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded text-[10.5px] font-semibold transition-colors cursor-pointer"
                              >
                                Xóa dòng #{conflict.rule2.ruleNumber}
                              </button>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              {isSelected ? 'Đang chọn' : 'Nhấp để highlight'}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                          {conflict.details}
                        </p>

                        {conflict.suggestedFix && (
                          <div className="mt-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-800 text-[10.5px] text-indigo-700 dark:text-indigo-300 flex items-center gap-1 font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span><strong>Gợi ý:</strong> {conflict.suggestedFix}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Real-Time Simulation Result Output Ribbon */}
          {isSimulationActive && evaluationResult && (
            <div className={`p-3 rounded-xl border flex items-center justify-between flex-wrap gap-2 text-xs shadow-2xs transition-all ${
              evaluationResult.status === 'SUCCESS'
                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500/40'
                : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400/40'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs ${
                  evaluationResult.status === 'SUCCESS'
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'bg-amber-500 text-white'
                }`}>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {evaluationResult.status === 'SUCCESS'
                        ? `Mô Phỏng Trực Tiếp: Khớp Quy Tắc #${evaluationResult.matchedRules[0]?.ruleNumber}`
                        : 'Mô Phỏng: Không có quy tắc nào khớp'}
                    </span>
                    <span className="font-mono text-[10.5px] text-slate-500">
                      ({evaluationResult.evaluationTimeMs}ms &bull; {currentDecision.hitPolicy})
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    {evaluationResult.status === 'SUCCESS'
                      ? 'Dòng quy tắc và các ô kết quả tương ứng đã được đánh dấu trực tiếp trên bảng ma trận bên dưới.'
                      : 'Hãy điều chỉnh các giá trị kiểm thử ở bảng bên phải để khớp với điều kiện nghiệp vụ.'}
                  </p>
                </div>
              </div>

              {/* Real-Time Output Badges */}
              {evaluationResult.status === 'SUCCESS' && (
                <div className="flex items-center gap-2 flex-wrap">
                  {currentDecision.outputs.map(out => {
                    const val = evaluationResult.outputs[out.id];
                    return (
                      <div 
                        key={out.id} 
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-700/80 rounded-lg shadow-2xs font-mono"
                      >
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">{out.label}:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                          {typeof val === 'number' ? val.toLocaleString() : String(val)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tabular Decision Table Grid */}
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              {/* Table Top Super-Header (When / Inputs vs Then / Outputs) */}
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10.5px] font-bold uppercase select-none">
                  {/* Hit Policy Cell */}
                  <th className="py-2.5 px-3 w-12 text-center bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                    {currentDecision.hitPolicy.charAt(0)}
                  </th>

                  {/* Input Clauses Super Header */}
                  <th 
                    colSpan={currentDecision.inputs.length} 
                    className="py-2.5 px-3 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-x border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <span>Khi Thỏa Mãn Điều Kiện Đầu Vào (When / Inputs)</span>
                      <button
                        onClick={handleAddInputClause}
                        className="text-[10px] flex items-center gap-0.5 text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                        title="Thêm cột điều kiện đầu vào"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm Cột Input</span>
                      </button>
                    </div>
                  </th>

                  {/* Output Clauses Super Header */}
                  <th 
                    colSpan={currentDecision.outputs.length} 
                    className="py-2.5 px-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-r border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <span>Thì Xác Định Kết Quả Đầu Ra (Then / Outputs)</span>
                      <button
                        onClick={handleAddOutputClause}
                        className="text-[10px] flex items-center gap-0.5 text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                        title="Thêm cột kết quả đầu ra"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm Cột Output</span>
                      </button>
                    </div>
                  </th>

                  {/* Annotation Super Header */}
                  <th className="py-2.5 px-3 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400">
                    Ghi Chú Nghiệp Vụ
                  </th>

                  {/* Action Header */}
                  <th className="py-2.5 px-2 w-14 text-center bg-slate-100 dark:bg-slate-850 text-slate-500">
                    Thao Tác
                  </th>
                </tr>

                {/* Second Header Row: Specific Clause Labels & Expression Names */}
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10.5px] bg-slate-50/70 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-300">
                  <th className="py-2 px-3 text-center text-slate-400">#</th>

                  {/* Inputs */}
                  {currentDecision.inputs.map(input => (
                    <th key={input.id} className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 min-w-[130px]">
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{input.label}</div>
                      <div className="font-mono text-[9.5px] text-sky-600 dark:text-sky-400 mt-0.5">
                        {input.expression} ({input.typeRef})
                      </div>
                    </th>
                  ))}

                  {/* Outputs */}
                  {currentDecision.outputs.map(output => {
                    const liveVal = isSimulationActive && evaluationResult?.status === 'SUCCESS'
                      ? evaluationResult.outputs[output.id]
                      : null;

                    return (
                      <th key={output.id} className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 min-w-[130px]">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{output.label}</span>
                          {liveVal !== null && (
                            <span 
                              className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-mono text-[9px] font-extrabold border border-emerald-300 dark:border-emerald-700 animate-pulse truncate max-w-[85px]"
                              title={`Kết quả mô phỏng trực tiếp: ${typeof liveVal === 'number' ? liveVal.toLocaleString() : String(liveVal)}`}
                            >
                              = {typeof liveVal === 'number' ? liveVal.toLocaleString() : String(liveVal)}
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[9.5px] text-amber-600 dark:text-amber-400 mt-0.5">
                          {output.name} ({output.typeRef})
                        </div>
                      </th>
                    );
                  })}

                  {/* Annotation column */}
                  <th className="py-2 px-3 text-slate-500 min-w-[180px]">
                    Diễn giải quy tắc tín dụng
                  </th>

                  <th className="py-2 px-2 text-center text-slate-400">
                    ✕
                  </th>
                </tr>
              </thead>

              {/* Rules Body */}
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRules.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={2 + currentDecision.inputs.length + currentDecision.outputs.length + 1} 
                      className="py-12 text-center text-slate-400 text-xs"
                    >
                      Không tìm thấy dòng quy tắc nào khớp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredRules.map(rule => {
                    const isEvaluatedMatch = activeEvaluatedRuleId === rule.id;
                    const ruleConflicts = validationReport.ruleConflictMap[rule.id] || [];
                    const hasConflict = ruleConflicts.length > 0;
                    const hasError = ruleConflicts.some(c => c.severity === 'error');
                    const isHighlighted = highlightedConflictId && ruleConflicts.some(c => c.id === highlightedConflictId);

                    return (
                      <tr 
                        key={rule.id}
                        id={`rule-row-${rule.id}`}
                        className={`transition-colors group ${
                          isHighlighted
                            ? 'bg-rose-100/90 dark:bg-rose-950/60 ring-2 ring-rose-500 font-semibold'
                            : isEvaluatedMatch 
                            ? 'bg-emerald-50/90 dark:bg-emerald-950/40 ring-2 ring-emerald-500/40 font-semibold' 
                            : hasError
                            ? 'bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-50/90 border-l-4 border-l-rose-500'
                            : hasConflict
                            ? 'bg-amber-50/50 dark:bg-amber-950/25 hover:bg-amber-50/80 border-l-4 border-l-amber-500'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {/* Rule Number & Evaluated / Conflict Indicator */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400 text-xs">
                          <div className="flex items-center justify-center gap-1">
                            {hasError ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowValidationPanel(true);
                                  setHighlightedConflictId(ruleConflicts[0]?.id || null);
                                }}
                                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10.5px] cursor-pointer shadow-xs animate-pulse"
                                title={ruleConflicts.map(c => `[LỖI XUNG ĐỘT] ${c.message}\n${c.details}`).join('\n\n')}
                              >
                                !
                              </button>
                            ) : hasConflict ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setShowValidationPanel(true);
                                  setHighlightedConflictId(ruleConflicts[0]?.id || null);
                                }}
                                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] cursor-pointer shadow-xs"
                                title={ruleConflicts.map(c => `[CẢNH BÁO] ${c.message}\n${c.details}`).join('\n\n')}
                              >
                                ▲
                              </button>
                            ) : isEvaluatedMatch ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] animate-pulse">
                                ✓
                              </span>
                            ) : (
                              rule.ruleNumber
                            )}
                          </div>
                        </td>

                        {/* Input Cells (FEEL Expression Syntax) */}
                        {currentDecision.inputs.map(input => {
                          const cellVal = rule.inputEntries[input.id] || '-';
                          const isClauseConflicting = hasConflict && ruleConflicts.some(c => c.conflictingClauseIds.includes(input.id));

                          return (
                            <td 
                              key={input.id} 
                              className={`py-1.5 px-2.5 border-r border-slate-100 dark:border-slate-800 ${
                                isClauseConflicting ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                              }`}
                            >
                              <div className="relative">
                                <input
                                  type="text"
                                  value={cellVal}
                                  onChange={(e) => handleCellChange(rule.id, input.id, true, e.target.value)}
                                  className={`w-full px-2 py-1 rounded bg-transparent text-xs font-mono focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 border hover:border-slate-200 dark:hover:border-slate-700 ${
                                    isClauseConflicting
                                      ? 'border-amber-400/80 dark:border-amber-600/80 font-bold text-amber-900 dark:text-amber-200'
                                      : cellVal === '-' 
                                      ? 'border-transparent text-slate-400 font-bold text-center' 
                                      : 'border-transparent text-slate-800 dark:text-slate-200'
                                  }`}
                                  title={isClauseConflicting ? 'Cột điều kiện đầu vào này nằm trong tập điều kiện gây trùng lấn giữa các quy tắc' : undefined}
                                />
                                {isClauseConflicting && (
                                  <span 
                                    className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-amber-500 pointer-events-none" 
                                    title="Điều kiện chồng lấn"
                                  />
                                )}
                              </div>
                            </td>
                          );
                        })}

                        {/* Output Cells */}
                        {currentDecision.outputs.map(output => {
                          const cellVal = rule.outputEntries[output.id] !== undefined ? rule.outputEntries[output.id] : '-';
                          const isResultOutput = isSimulationActive && isEvaluatedMatch;

                          return (
                            <td 
                              key={output.id} 
                              className={`py-1.5 px-2.5 border-r border-slate-100 dark:border-slate-800 transition-all ${
                                isResultOutput 
                                  ? 'bg-emerald-100/90 dark:bg-emerald-950/70 ring-2 ring-emerald-500/70 font-extrabold' 
                                  : ''
                              }`}
                            >
                              <div className="relative flex items-center">
                                <input
                                  type="text"
                                  value={typeof cellVal === 'number' ? cellVal.toLocaleString() : String(cellVal)}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/,/g, '');
                                    const parsed = output.typeRef === 'number' && !isNaN(Number(raw)) ? Number(raw) : raw;
                                    handleCellChange(rule.id, output.id, false, parsed);
                                  }}
                                  className={`w-full px-2 py-1 rounded bg-transparent text-xs font-mono font-bold focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 ${
                                    isResultOutput ? 'text-emerald-950 dark:text-emerald-100 font-black' : 'text-slate-800 dark:text-slate-200'
                                  }`}
                                />
                                {isResultOutput && (
                                  <span className="absolute right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white shadow-xs pointer-events-none uppercase tracking-wider flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Result
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}

                        {/* Annotation Cell */}
                        <td className="py-1.5 px-2.5">
                          <input
                            type="text"
                            value={rule.annotation || ''}
                            onChange={(e) => {
                              const updatedRules = currentDecision.rules.map(r => r.id === rule.id ? { ...r, annotation: e.target.value } : r);
                              updateCurrentDecision({ ...currentDecision, rules: updatedRules });
                            }}
                            placeholder="Ghi chú điều kiện..."
                            className="w-full px-2 py-1 rounded bg-transparent text-xs text-slate-600 dark:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                          />
                        </td>

                        {/* Row Actions */}
                        <td className="py-1.5 px-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDuplicateRule(rule)}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                              title="Nhân bản quy tắc này"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Xóa quy tắc này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Helper */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
            <div className="flex items-center gap-3">
              <span>Cú pháp FEEL hợp lệ: <code>&gt;= 720</code>, <code>&lt;= 0.35</code>, <code>&quot;BẤT ĐỘNG SẢN&quot;</code>, <code>-</code> (Bất kỳ / Wildcard)</span>
            </div>
            <span className="font-mono">
              Tổng số quy tắc: {currentDecision.rules.length} dòng logic
            </span>
          </div>
        </div>

        {/* ======================================================= */}
        {/* 2. DMN SIMULATOR / TEST BENCH CONSOLE (Bên Phải)        */}
        {/* ======================================================= */}
        {isSimulationActive && (
          <div className="w-84 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 text-xs overflow-y-auto">
            {/* Simulator Header */}
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                    <span>Mô Phỏng Trực Tiếp</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Camunda 8 FEEL Micro-Engine
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/20">
                LIVE
              </span>
            </div>

            {/* Quick Simulation Presets */}
            <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/50">
              <span className="font-bold text-slate-600 dark:text-slate-300 block text-[10.5px] uppercase tracking-wide mb-1.5">
                Kịch Bản Thử Nghiệm Nhanh
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {SIMULATION_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setTestInputs(preset.values);
                      showToast(`Đã nạp kịch bản: ${preset.name}`);
                    }}
                    className="p-1.5 text-left bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 rounded-lg text-[10.5px] transition-all cursor-pointer group"
                    title={preset.description}
                  >
                    <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 flex items-center justify-between">
                      <span className="truncate">{preset.name}</span>
                      <Zap className="w-2.5 h-2.5 text-slate-400 group-hover:text-emerald-500 shrink-0 ml-1" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Form Inputs */}
            <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wide">
                  Tham Số Đầu Vào Thử Nghiệm
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Tự động tính
                </span>
              </div>

              {currentDecision.inputs.map(input => (
                <div key={input.id}>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    {input.label} <span className="font-mono text-[10px] text-slate-400">({input.expression})</span>
                  </label>
                  {input.allowedValues && input.allowedValues.length > 0 ? (
                    <select
                      value={testInputs[input.id] || input.allowedValues[0]}
                      onChange={(e) => setTestInputs(prev => ({ ...prev, [input.id]: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      {input.allowedValues.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  ) : input.typeRef === 'boolean' ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTestInputs(prev => ({ ...prev, [input.id]: true }))}
                        className={`flex-1 py-1 rounded text-xs font-bold border cursor-pointer ${
                          testInputs[input.id] === true ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200'
                        }`}
                      >
                        True
                      </button>
                      <button
                        type="button"
                        onClick={() => setTestInputs(prev => ({ ...prev, [input.id]: false }))}
                        className={`flex-1 py-1 rounded text-xs font-bold border cursor-pointer ${
                          testInputs[input.id] === false ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200'
                        }`}
                      >
                        False
                      </button>
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={testInputs[input.id] ?? ''}
                      onChange={(e) => setTestInputs(prev => ({ ...prev, [input.id]: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  )}
                </div>
              ))}

              {/* Real-time evaluation status bar */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Phản hồi thời gian thực: 0ms</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunEvaluation}
                  className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded hover:bg-emerald-500 cursor-pointer"
                  title="Tính toán lại ngay lập tức"
                >
                  Tính lại
                </button>
              </div>

              {/* Evaluation Results Card */}
              {evaluationResult && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      Kết Quả Đánh Giá
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {evaluationResult.evaluationTimeMs}ms
                    </span>
                  </div>

                  {evaluationResult.status === 'SUCCESS' ? (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Khớp Dòng Quy Tắc #{evaluationResult.matchedRules[0]?.ruleNumber}</span>
                      </div>

                      {/* Display Outputs */}
                      <div className="space-y-1.5 pt-1">
                        {currentDecision.outputs.map(out => {
                          const val = evaluationResult.outputs[out.id];
                          return (
                            <div key={out.id} className="flex justify-between items-center text-[11px] p-1.5 bg-white dark:bg-slate-900 rounded border border-emerald-200/60 dark:border-emerald-800/40">
                              <span className="text-slate-500">{out.label}:</span>
                              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                                {typeof val === 'number' ? val.toLocaleString() : String(val)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Annotation snippet */}
                      {evaluationResult.matchedRules[0]?.annotation && (
                        <p className="text-[10px] text-emerald-800 dark:text-emerald-400 italic pt-1 border-t border-emerald-200/50">
                          &quot;{evaluationResult.matchedRules[0].annotation}&quot;
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Không Có Kết Quả Khớp</span>
                      </div>
                      <p className="text-[10.5px]">
                        {evaluationResult.message}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      )}

      {/* 3. DMN VERSION HISTORY SIDEBAR (Slide-over drawer) */}
      {isVersionHistoryOpen && (
        <DmnVersionHistorySidebar
          isOpen={isVersionHistoryOpen}
          onClose={() => setIsVersionHistoryOpen(false)}
          decision={currentDecision}
          versions={currentVersions}
          onSaveSnapshot={handleSaveSnapshot}
          onRevertToVersion={handleRevertVersion}
          onCompareVersions={(base, target) => setCompareModalState({ isOpen: true, base, target })}
          onInspectVersion={(v) => setInspectModalVersion(v)}
        />
      )}
    </div>

      {/* DMN 1.3 XML Modal */}
      {showXmlModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    OMG DMN 1.3 XML Definition – {currentDecision.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Decision Key: #{currentDecision.key} &bull; Hit Policy: {currentDecision.hitPolicy}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowXmlModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-slate-950">
              <textarea
                value={xmlContent}
                onChange={(e) => setXmlContent(e.target.value)}
                className="w-full h-96 bg-transparent text-amber-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">OMG DMN 1.3 &amp; Camunda Zeebe DMN Spec Compliant</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyXml}
                  className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                  title="Sao chép toàn bộ mã nguồn XML vào Clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao Chép XML</span>
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([xmlContent], { type: 'application/xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${currentDecision.key}.dmn`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast(`Đã xuất tệp ${currentDecision.key}.dmn chuẩn OMG DMN 1.3`);
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Tải tệp .dmn về máy tính"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Tệp .dmn</span>
                </button>
                <button
                  onClick={() => {
                    setShowXmlModal(false);
                    showToast('Đã đóng cửa sổ DMN 1.3 XML.');
                  }}
                  className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version Compare Modal */}
      {compareModalState && (
        <DmnVersionCompareModal
          isOpen={compareModalState.isOpen}
          onClose={() => setCompareModalState(null)}
          baseVersion={compareModalState.base}
          targetVersion={compareModalState.target}
          allVersions={currentVersions}
          onRevertToVersion={handleRevertVersion}
        />
      )}

      {/* Version Inspect Modal */}
      {inspectModalVersion && (
        <DmnVersionInspectModal
          version={inspectModalVersion}
          onClose={() => setInspectModalVersion(null)}
          onRevert={handleRevertVersion}
        />
      )}
    </div>
  );
};
