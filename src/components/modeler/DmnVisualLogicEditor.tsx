import React, { useState } from 'react';
import { 
  DMNDecisionDefinition, 
  DMNRule, 
  DMNInputClause, 
  DMNOutputClause 
} from '../../types/dmn';
import { DmnValidationReport } from './dmnValidator';
import { 
  ArrowRight, 
  Plus, 
  Trash2, 
  Copy, 
  Sparkles, 
  Check, 
  Edit3, 
  Layers, 
  Filter, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Search,
  Code,
  Zap,
  Info,
  HelpCircle,
  Eye,
  CornerDownRight,
  Download
} from 'lucide-react';

interface DmnVisualLogicEditorProps {
  decision: DMNDecisionDefinition;
  onUpdateDecision: (updated: DMNDecisionDefinition) => void;
  activeEvaluatedRuleId: string | null;
  testInputs: Record<string, any>;
  onRunTest: () => void;
  onExportDmn?: () => void;
  validationReport?: DmnValidationReport;
  isSimulationActive?: boolean;
}

export const DmnVisualLogicEditor: React.FC<DmnVisualLogicEditorProps> = ({
  decision,
  onUpdateDecision,
  activeEvaluatedRuleId,
  testInputs,
  onRunTest,
  onExportDmn,
  validationReport,
  isSimulationActive = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRuleForEdit, setSelectedRuleForEdit] = useState<DMNRule | null>(null);
  const [isCreatingNewRule, setIsCreatingNewRule] = useState(false);
  const [selectedInputFilter, setSelectedInputFilter] = useState<string | null>(null);
  const [selectedOutputFilter, setSelectedOutputFilter] = useState<string | null>(null);

  // Modal editing state for visual rule builder
  const [editingRuleInputs, setEditingRuleInputs] = useState<Record<string, { op: string; val: string }>>({});
  const [editingRuleOutputs, setEditingRuleOutputs] = useState<Record<string, any>>({});
  const [editingAnnotation, setEditingAnnotation] = useState('');

  // Helper to parse FEEL expression into Operator and Value
  const parseFeelExpr = (expr: string | undefined): { op: string; val: string } => {
    if (!expr || expr.trim() === '-' || expr.trim() === '') {
      return { op: '-', val: '' };
    }
    const clean = expr.trim();
    if (clean.startsWith('>=')) return { op: '>=', val: clean.replace('>=', '').trim() };
    if (clean.startsWith('<=')) return { op: '<=', val: clean.replace('<=', '').trim() };
    if (clean.startsWith('>')) return { op: '>', val: clean.replace('>', '').trim() };
    if (clean.startsWith('<')) return { op: '<', val: clean.replace('<', '').trim() };
    if (clean.startsWith('==')) return { op: '==', val: clean.replace('==', '').trim() };
    if (clean.startsWith('!=')) return { op: '!=', val: clean.replace('!=', '').trim() };
    if (clean.startsWith('"') && clean.endsWith('"')) {
      return { op: '==', val: clean.slice(1, -1) };
    }
    return { op: '==', val: clean };
  };

  // Helper to construct FEEL expression from Operator and Value
  const buildFeelExpr = (op: string, val: string, typeRef?: string): string => {
    if (op === '-' || !val || val.trim() === '') return '-';
    if (typeRef === 'string') {
      const clean = val.replace(/"/g, '');
      return `"${clean}"`;
    }
    if (typeRef === 'boolean') {
      return val === 'true' ? 'true' : 'false';
    }
    if (op === '==') return val;
    return `${op} ${val}`;
  };

  const handleOpenEditRuleModal = (rule: DMNRule) => {
    setSelectedRuleForEdit(rule);
    setIsCreatingNewRule(false);

    const parsedInputs: Record<string, { op: string; val: string }> = {};
    decision.inputs.forEach(inp => {
      parsedInputs[inp.id] = parseFeelExpr(rule.inputEntries[inp.id]);
    });
    setEditingRuleInputs(parsedInputs);

    const initialOutputs: Record<string, any> = {};
    decision.outputs.forEach(out => {
      initialOutputs[out.id] = rule.outputEntries[out.id] !== undefined ? rule.outputEntries[out.id] : '';
    });
    setEditingRuleOutputs(initialOutputs);
    setEditingAnnotation(rule.annotation || '');
  };

  const handleOpenCreateRuleModal = () => {
    setSelectedRuleForEdit(null);
    setIsCreatingNewRule(true);

    const emptyInputs: Record<string, { op: string; val: string }> = {};
    decision.inputs.forEach(inp => {
      emptyInputs[inp.id] = { op: '-', val: '' };
    });
    setEditingRuleInputs(emptyInputs);

    const emptyOutputs: Record<string, any> = {};
    decision.outputs.forEach(out => {
      emptyOutputs[out.id] = out.typeRef === 'number' ? 0 : out.typeRef === 'boolean' ? false : 'APPROVED';
    });
    setEditingRuleOutputs(emptyOutputs);
    setEditingAnnotation('');
  };

  const handleSaveModalRule = () => {
    const finalInputs: Record<string, string> = {};
    decision.inputs.forEach(inp => {
      const parsed = editingRuleInputs[inp.id] || { op: '-', val: '' };
      finalInputs[inp.id] = buildFeelExpr(parsed.op, parsed.val, inp.typeRef);
    });

    if (isCreatingNewRule) {
      const newRule: DMNRule = {
        id: `rule_${Date.now().toString().slice(-4)}`,
        ruleNumber: decision.rules.length + 1,
        inputEntries: finalInputs,
        outputEntries: editingRuleOutputs,
        annotation: editingAnnotation.trim() || 'Quy tắc định nghĩa trực quan'
      };
      onUpdateDecision({
        ...decision,
        rules: [...decision.rules, newRule]
      });
    } else if (selectedRuleForEdit) {
      const updatedRules = decision.rules.map(r => {
        if (r.id === selectedRuleForEdit.id) {
          return {
            ...r,
            inputEntries: finalInputs,
            outputEntries: editingRuleOutputs,
            annotation: editingAnnotation.trim()
          };
        }
        return r;
      });
      onUpdateDecision({
        ...decision,
        rules: updatedRules
      });
    }

    setSelectedRuleForEdit(null);
    setIsCreatingNewRule(false);
  };

  const handleDeleteRule = (ruleId: string) => {
    const remaining = decision.rules
      .filter(r => r.id !== ruleId)
      .map((r, idx) => ({ ...r, ruleNumber: idx + 1 }));
    onUpdateDecision({ ...decision, rules: remaining });
  };

  const handleDuplicateRule = (rule: DMNRule) => {
    const newRuleId = `rule_${Date.now().toString().slice(-4)}`;
    const clonedRule: DMNRule = {
      ...rule,
      id: newRuleId,
      ruleNumber: decision.rules.length + 1,
      annotation: `[Bản sao #${rule.ruleNumber}] ${rule.annotation || ''}`
    };
    onUpdateDecision({ ...decision, rules: [...decision.rules, clonedRule] });
  };

  // Filter rules based on search and selected variable tags
  const filteredRules = decision.rules.filter(r => {
    const matchesSearch = 
      !searchTerm ||
      (r.annotation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(r.inputEntries).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase())) ||
      Object.values(r.outputEntries).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesInputFilter = 
      !selectedInputFilter || 
      (r.inputEntries[selectedInputFilter] && r.inputEntries[selectedInputFilter] !== '-');

    const matchesOutputFilter = 
      !selectedOutputFilter || 
      (r.outputEntries[selectedOutputFilter] !== undefined);

    return matchesSearch && matchesInputFilter && matchesOutputFilter;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100/50 dark:bg-slate-950/40 p-4 space-y-3">
      {/* Top Controls Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                  Visual Logic Row Mapper &bull; Sơ Đồ Ánh Xạ Biến Đầu Vào &rarr; Đầu Ra
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  {decision.inputs.length} Inputs &rarr; {decision.outputs.length} Outputs
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Trực quan hóa từng dòng quy tắc logic, kết nối điều kiện đầu vào sang kết luận đầu ra theo chuẩn DMN 1.3
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Lọc hàng quy tắc logic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 w-52 shadow-2xs font-mono"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>

          {/* Run Test Button */}
          <button
            onClick={onRunTest}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Kiểm thử dữ liệu mẫu với các hàng logic"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Chạy Thử Nghiệm</span>
          </button>

          {/* Export .dmn Button */}
          {onExportDmn && (
            <button
              onClick={onExportDmn}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Xuất bảng quyết định hiện tại sang định dạng tệp .dmn chuẩn OMG DMN 1.3 / Camunda 8"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất .dmn</span>
            </button>
          )}

          {/* Add Visual Rule */}
          <button
            onClick={handleOpenCreateRuleModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Logic Row Mới</span>
          </button>
        </div>
      </div>

      {/* Tri-Pane Visual Editor Workspace */}
      <div className="flex-1 flex gap-3 overflow-hidden">
        {/* ======================================================= */}
        {/* PANE 1: INPUT VARIABLES PALETTE (Bên Trái)              */}
        {/* ======================================================= */}
        <div className="w-64 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 flex flex-col shrink-0 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-sky-800 dark:text-sky-300 text-xs uppercase tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Biến Đầu Vào ({decision.inputs.length})</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">When / IF</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
            {decision.inputs.map(input => {
              const isFilterActive = selectedInputFilter === input.id;
              const testVal = testInputs[input.id];

              return (
                <div
                  key={input.id}
                  onClick={() => setSelectedInputFilter(isFilterActive ? null : input.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer group relative ${
                    isFilterActive 
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 shadow-xs' 
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                      {input.label}
                    </span>
                    <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-semibold">
                      {input.typeRef}
                    </span>
                  </div>

                  <div className="font-mono text-[10.5px] text-slate-500 dark:text-slate-400 mt-1">
                    variable: <code>{input.expression}</code>
                  </div>

                  {/* Test Value Indicator */}
                  {testVal !== undefined && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Giá trị test:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-200 truncate max-w-[110px]">
                        {typeof testVal === 'number' ? testVal.toLocaleString() : String(testVal)}
                      </span>
                    </div>
                  )}

                  {/* Connector Port Dot on Right edge */}
                  <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-sky-500 border-2 border-white dark:border-slate-900 shadow-2xs" />
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
            Nhấp biến để lọc các hàng logic sử dụng biến này.
          </div>
        </div>

        {/* ======================================================= */}
        {/* PANE 2: CENTER LOGIC ROWS PIPELINE (Chính Giữa)         */}
        {/* ======================================================= */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col shadow-xs overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wide">
                Danh Sách Hàng Quy Tắc Logic ({filteredRules.length} / {decision.rules.length} Rules)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Hit Policy: {decision.hitPolicy}
              </span>
            </div>

            {(selectedInputFilter || selectedOutputFilter) && (
              <button
                onClick={() => { setSelectedInputFilter(null); setSelectedOutputFilter(null); }}
                className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc biến</span>
              </button>
            )}
          </div>

          {/* Logic Rows Flow Cards Container */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredRules.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                Không tìm thấy hàng logic nào phù hợp với bộ lọc.
              </div>
            ) : (
              filteredRules.map(rule => {
                const isEvaluatedMatch = activeEvaluatedRuleId === rule.id;
                const ruleConflicts = validationReport?.ruleConflictMap[rule.id] || [];
                const hasConflict = ruleConflicts.length > 0;
                const hasError = ruleConflicts.some(c => c.severity === 'error');

                return (
                  <div
                    key={rule.id}
                    className={`p-3.5 rounded-2xl border transition-all relative group ${
                      isEvaluatedMatch 
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/50 shadow-md' 
                        : hasError
                        ? 'border-rose-400 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20 ring-1 ring-rose-500/40 shadow-xs'
                        : hasConflict
                        ? 'border-amber-400 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 ring-1 ring-amber-500/40 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-850/30'
                    }`}
                  >
                    {/* Top Row: Rule Badge & Actions */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs font-bold ${
                          isEvaluatedMatch 
                            ? 'bg-emerald-600 text-white animate-pulse' 
                            : hasError
                            ? 'bg-rose-600 text-white font-bold'
                            : hasConflict
                            ? 'bg-amber-500 text-white font-bold'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}>
                          #{rule.ruleNumber}
                        </span>

                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {rule.annotation ? rule.annotation : `Quy tắc quyết định số #${rule.ruleNumber}`}
                        </span>

                        {isEvaluatedMatch && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs animate-pulse">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            {isSimulationActive ? 'MÔ PHỎNG TRỰC TIẾP: KHỚP QUY TẮC' : 'Đang Khớp Dữ Liệu Thử Nghiệm'}
                          </span>
                        )}

                        {hasError && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Xung Đột Quy Tắc
                          </span>
                        )}
                      </div>

                      {/* Rule Card Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditRuleModal(rule)}
                          className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                          title="Mở trình soạn thảo trực quan cho quy tắc này"
                        >
                          <Edit3 className="w-3 h-3 text-emerald-600" />
                          <span>Chỉnh Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDuplicateRule(rule)}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                          title="Nhân bản quy tắc"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Xóa quy tắc này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Conflict Alert Banner inside Rule Card */}
                    {hasConflict && (
                      <div className={`mb-2.5 p-2.5 rounded-xl border flex items-start gap-2 text-xs ${
                        hasError 
                          ? 'bg-rose-50/80 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200' 
                          : 'bg-amber-50/80 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                      }`}>
                        <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${hasError ? 'text-rose-600' : 'text-amber-600'}`} />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-1.5 py-0.2 rounded font-bold font-mono text-[9.5px] ${
                              hasError ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100' : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                            }`}>
                              {ruleConflicts[0].type === 'OVERLAPPING_CONFLICT' ? 'XUNG ĐỘT' : ruleConflicts[0].type === 'REDUNDANT_RULE' ? 'TRÙNG LẶP' : 'CẢNH BÁO'}
                            </span>
                            <span className="font-bold text-[11px]">{ruleConflicts[0].message}</span>
                          </div>
                          <p className="text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                            {ruleConflicts[0].details}
                          </p>
                          {ruleConflicts[0].suggestedFix && (
                            <p className="text-[10px] text-indigo-700 dark:text-indigo-300 italic pt-1 border-t border-rose-200/60 dark:border-rose-800/60">
                              💡 {ruleConflicts[0].suggestedFix}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Middle: Visual Mapping Flow (IF Conditions -> Maps To -> THEN Outputs) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-2xs">
                      {/* Left: Condition Blocks (IF) */}
                      <div className="flex-1 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded border border-sky-200/50">
                          IF
                        </span>

                        {decision.inputs.map(input => {
                          const expr = rule.inputEntries[input.id] || '-';
                          const isWildcard = expr === '-' || !expr;

                          return (
                            <div
                              key={input.id}
                              onClick={() => handleOpenEditRuleModal(rule)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                                isWildcard
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                  : 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-semibold'
                              }`}
                              title={`${input.label}: ${expr}`}
                            >
                              <span className="text-slate-400 text-[10px]">{input.expression}:</span>
                              <span>{expr}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Center: Connective Mapping Arrow */}
                      <div className="flex items-center justify-center px-2 py-1 text-slate-400">
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
                          <span>MAPS TO</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Right: Outcome Blocks (THEN) */}
                      <div className="flex-1 flex flex-wrap items-center gap-1.5 justify-end">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200/50">
                          THEN
                        </span>

                        {decision.outputs.map(output => {
                          const val = rule.outputEntries[output.id];
                          const isApproved = val === 'APPROVED' || val === true;
                          const isRejected = val === 'REJECTED';
                          const isResultOutput = isSimulationActive && isEvaluatedMatch;

                          return (
                            <div
                              key={output.id}
                              onClick={() => handleOpenEditRuleModal(rule)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                isResultOutput
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100 border-2 border-emerald-500 shadow-sm font-black'
                                  : isApproved
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : isRejected
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              }`}
                              title={`${output.label}: ${val}`}
                            >
                              <span className="text-slate-400 text-[10px] font-normal">{output.name}:</span>
                              <span>{typeof val === 'number' ? val.toLocaleString() : String(val)}</span>
                              {isResultOutput && (
                                <span className="ml-0.5 px-1 py-0.2 rounded text-[8.5px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
                                  Result
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================= */}
        {/* PANE 3: OUTPUT TARGET VARIABLES (Bên Phải)               */}
        {/* ======================================================= */}
        <div className="w-64 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 flex flex-col shrink-0 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 text-xs uppercase tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Biến Kết Luận ({decision.outputs.length})</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Then / OUTPUT</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
            {decision.outputs.map(output => {
              const isFilterActive = selectedOutputFilter === output.id;

              return (
                <div
                  key={output.id}
                  onClick={() => setSelectedOutputFilter(isFilterActive ? null : output.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer group relative ${
                    isFilterActive 
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 shadow-xs' 
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-amber-300'
                  }`}
                >
                  {/* Connector Port Dot on Left edge */}
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 shadow-2xs" />

                  <div className="flex items-center justify-between pl-1">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                      {output.label}
                    </span>
                    <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-semibold">
                      {output.typeRef}
                    </span>
                  </div>

                  <div className="font-mono text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 pl-1">
                    variable: <code>{output.name}</code>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
            Các biến đầu ra sẽ được nạp lại vào quy trình Camunda 8 Zeebe workflow.
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* MODAL: VISUAL LOGIC RULE BUILDER & VARIABLE MAPPER      */}
      {/* ======================================================= */}
      {(selectedRuleForEdit || isCreatingNewRule) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {isCreatingNewRule ? 'Thêm Hàng Quy Tắc Logic Trực Quan' : `Chỉnh Sửa Logic Row #${selectedRuleForEdit?.ruleNumber}`}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Cấu hình điều kiện (IF) và ánh xạ kết quả (THEN) bằng bộ điều khiển trực quan
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedRuleForEdit(null); setIsCreatingNewRule(false); }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Rule Description / Annotation */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mô Tả / Diễn Giải Nghiệp Vụ
                </label>
                <input
                  type="text"
                  value={editingAnnotation}
                  onChange={(e) => setEditingAnnotation(e.target.value)}
                  placeholder="VD: Khách hàng đạt chuẩn phê duyệt tự động cấp hạn mức cao..."
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Conditions Section (WHEN / IF) */}
              <div className="p-3 bg-sky-50/50 dark:bg-sky-950/20 rounded-xl border border-sky-200/60 dark:border-sky-800/50 space-y-3">
                <div className="flex items-center justify-between font-bold text-sky-800 dark:text-sky-300 text-xs">
                  <span>1. Mệnh Đề Điều Kiện Đầu Vào (When / IF Conditions)</span>
                  <span className="text-[10.5px] font-mono text-sky-600">FEEL Expressions</span>
                </div>

                <div className="space-y-2.5">
                  {decision.inputs.map(inp => {
                    const currentEntry = editingRuleInputs[inp.id] || { op: '-', val: '' };

                    return (
                      <div key={inp.id} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="w-40 shrink-0 font-bold text-slate-700 dark:text-slate-200">
                          {inp.label}
                          <span className="block font-mono text-[10px] text-slate-400 font-normal">{inp.expression}</span>
                        </div>

                        {/* Operator Selector */}
                        <select
                          value={currentEntry.op}
                          onChange={(e) => {
                            setEditingRuleInputs(prev => ({
                              ...prev,
                              [inp.id]: { ...currentEntry, op: e.target.value }
                            }));
                          }}
                          className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono font-bold cursor-pointer"
                        >
                          <option value="-">- Bất kỳ (Wildcard)</option>
                          <option value=">=">&gt;= (Lớn hơn hoặc bằng)</option>
                          <option value="<=">&lt;= (Nhỏ hơn hoặc bằng)</option>
                          <option value=">">&gt; (Lớn hơn)</option>
                          <option value="<">&lt; (Nhỏ hơn)</option>
                          <option value="==">== (Bằng chính xác)</option>
                          <option value="!=">!= (Khác)</option>
                        </select>

                        {/* Value Input */}
                        {currentEntry.op !== '-' && (
                          inp.allowedValues ? (
                            <select
                              value={currentEntry.val || inp.allowedValues[0]}
                              onChange={(e) => {
                                setEditingRuleInputs(prev => ({
                                  ...prev,
                                  [inp.id]: { ...currentEntry, val: e.target.value }
                                }));
                              }}
                              className="flex-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold"
                            >
                              {inp.allowedValues.map(v => (
                                <option key={v} value={v}>{v}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={inp.typeRef === 'number' ? 'number' : 'text'}
                              value={currentEntry.val}
                              onChange={(e) => {
                                setEditingRuleInputs(prev => ({
                                  ...prev,
                                  [inp.id]: { ...currentEntry, val: e.target.value }
                                }));
                              }}
                              placeholder="Nhập giá trị so sánh..."
                              className="flex-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono"
                            />
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Outcomes Section (THEN / OUTPUTS) */}
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-800/50 space-y-3">
                <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300 text-xs">
                  <span>2. Ánh Xạ Kết Quả Đầu Ra (Then / Mapped Outcomes)</span>
                  <span className="text-[10.5px] font-mono text-amber-600">Decision Results</span>
                </div>

                <div className="space-y-2.5">
                  {decision.outputs.map(out => {
                    const currentVal = editingRuleOutputs[out.id];

                    return (
                      <div key={out.id} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="w-40 shrink-0 font-bold text-slate-700 dark:text-slate-200">
                          {out.label}
                          <span className="block font-mono text-[10px] text-slate-400 font-normal">{out.name}</span>
                        </div>

                        {out.allowedValues ? (
                          <select
                            value={currentVal || out.allowedValues[0]}
                            onChange={(e) => setEditingRuleOutputs(prev => ({ ...prev, [out.id]: e.target.value }))}
                            className="flex-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold cursor-pointer"
                          >
                            {out.allowedValues.map(v => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        ) : out.typeRef === 'boolean' ? (
                          <div className="flex gap-2 flex-1">
                            <button
                              type="button"
                              onClick={() => setEditingRuleOutputs(prev => ({ ...prev, [out.id]: true }))}
                              className={`flex-1 py-1 rounded text-xs font-bold border cursor-pointer ${
                                currentVal === true ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200'
                              }`}
                            >
                              True
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRuleOutputs(prev => ({ ...prev, [out.id]: false }))}
                              className={`flex-1 py-1 rounded text-xs font-bold border cursor-pointer ${
                                currentVal === false ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200'
                              }`}
                            >
                              False
                            </button>
                          </div>
                        ) : (
                          <input
                            type={out.typeRef === 'number' ? 'number' : 'text'}
                            value={currentVal ?? ''}
                            onChange={(e) => {
                              const val = out.typeRef === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                              setEditingRuleOutputs(prev => ({ ...prev, [out.id]: val }));
                            }}
                            className="flex-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono font-bold"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Camunda 8 FEEL &amp; DMN 1.3 Parser Validated
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSelectedRuleForEdit(null); setIsCreatingNewRule(false); }}
                  className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveModalRule}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  {isCreatingNewRule ? 'Thêm Quy Tắc' : 'Cập Nhật Quy Tắc'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
