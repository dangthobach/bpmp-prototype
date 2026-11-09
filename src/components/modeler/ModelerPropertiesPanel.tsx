import React, { useState } from 'react';
import { 
  ProcessDefinition, 
  BPMNNode, 
  BPMNLaneDefinition, 
  ZeebeIOMapping 
} from '../../types/bpm';
import { 
  Settings, 
  User, 
  Cpu, 
  Layers, 
  Repeat, 
  Plus, 
  Trash2, 
  ChevronDown, 
  Code, 
  FileText, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Check, 
  Zap, 
  Send,
  Table
} from 'lucide-react';

interface ModelerPropertiesPanelProps {
  selectedNode: BPMNNode | null;
  currentProcess: ProcessDefinition;
  onUpdateNode: (updatedNode: BPMNNode) => void;
  onUpdateProcess: (updatedProcess: ProcessDefinition) => void;
  availableLanes: BPMNLaneDefinition[];
  onOpenDmn?: (decisionKey: string) => void;
}

export const ModelerPropertiesPanel: React.FC<ModelerPropertiesPanelProps> = ({
  selectedNode,
  currentProcess,
  onUpdateNode,
  onUpdateProcess,
  availableLanes,
  onOpenDmn,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'actors' | 'execution' | 'iomapping' | 'multiInstance'>('general');

  const isCamunda = currentProcess.engine === 'Camunda';

  // Helper to update specific node property
  const handlePropChange = (prop: keyof BPMNNode, val: any) => {
    if (!selectedNode) return;
    onUpdateNode({ ...selectedNode, [prop]: val });
  };

  // Add / remove candidate role
  const handleAddCandidateGroup = (role: string) => {
    if (!selectedNode) return;
    const current = selectedNode.candidateGroups || [];
    if (!current.includes(role)) {
      handlePropChange('candidateGroups', [...current, role]);
    }
  };

  const handleRemoveCandidateGroup = (role: string) => {
    if (!selectedNode) return;
    const current = selectedNode.candidateGroups || [];
    handlePropChange('candidateGroups', current.filter(r => r !== role));
  };

  // I/O Mapping helpers
  const handleAddInputMapping = () => {
    if (!selectedNode) return;
    const currentIo: ZeebeIOMapping = selectedNode.ioMapping || { inputs: [], outputs: [] };
    const newInputs = [...currentIo.inputs, { source: '= request.payload', target: 'variableName' }];
    handlePropChange('ioMapping', { ...currentIo, inputs: newInputs });
  };

  const handleRemoveInputMapping = (index: number) => {
    if (!selectedNode || !selectedNode.ioMapping) return;
    const newInputs = selectedNode.ioMapping.inputs.filter((_, i) => i !== index);
    handlePropChange('ioMapping', { ...selectedNode.ioMapping, inputs: newInputs });
  };

  const handleAddOutputMapping = () => {
    if (!selectedNode) return;
    const currentIo: ZeebeIOMapping = selectedNode.ioMapping || { inputs: [], outputs: [] };
    const newOutputs = [...currentIo.outputs, { source: '= response.status', target: 'outputStatus' }];
    handlePropChange('ioMapping', { ...currentIo, outputs: newOutputs });
  };

  const handleRemoveOutputMapping = (index: number) => {
    if (!selectedNode || !selectedNode.ioMapping) return;
    const newOutputs = selectedNode.ioMapping.outputs.filter((_, i) => i !== index);
    handlePropChange('ioMapping', { ...selectedNode.ioMapping, outputs: newOutputs });
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 text-xs select-none z-10 shadow-sm">
      {/* Panel Top Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center font-bold">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                {selectedNode ? selectedNode.type : 'QUY TRÌNH CHUNG'}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                {isCamunda ? 'Camunda 8' : 'Flowable 7'}
              </span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate w-48 text-[11.5px]">
              {selectedNode ? selectedNode.name : currentProcess.name}
            </h4>
          </div>
        </div>
      </div>

      {/* Modern Segmented Navigation Tabs */}
      <div className="px-2 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1 overflow-x-auto text-[10.5px] font-semibold">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'general' ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Chung
        </button>

        <button
          onClick={() => setActiveTab('actors')}
          className={`px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'actors' ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Tác Nhân &amp; Làn
        </button>

        <button
          onClick={() => setActiveTab('execution')}
          className={`px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'execution' ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Động Cơ (Zeebe)
        </button>

        <button
          onClick={() => setActiveTab('iomapping')}
          className={`px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'iomapping' ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          I/O Mapping
        </button>

        <button
          onClick={() => setActiveTab('multiInstance')}
          className={`px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'multiInstance' ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Lặp &amp; Hook
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* ======================================================= */}
        {/* TAB 1: GENERAL                                         */}
        {/* ======================================================= */}
        {activeTab === 'general' && (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Element ID / Key
              </label>
              <input
                type="text"
                value={selectedNode ? selectedNode.id : currentProcess.key}
                onChange={(e) => {
                  if (selectedNode) handlePropChange('id', e.target.value);
                  else onUpdateProcess({ ...currentProcess, key: e.target.value });
                }}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Tên Hiển Thị (Display Name)
              </label>
              <input
                type="text"
                value={selectedNode ? selectedNode.name : currentProcess.name}
                onChange={(e) => {
                  if (selectedNode) handlePropChange('name', e.target.value);
                  else onUpdateProcess({ ...currentProcess, name: e.target.value });
                }}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Mục Tiêu Động Cơ (Target Engine)
              </label>
              <select
                value={currentProcess.engine}
                onChange={(e) => onUpdateProcess({ ...currentProcess, engine: e.target.value as any })}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Camunda">Camunda 8 (Zeebe Cloud / On-Premise)</option>
                <option value="Flowable">Flowable 7.0 (BPMN &amp; CMMN Engine)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Mô Tả Nghiệp Vụ (Documentation)
              </label>
              <textarea
                rows={3}
                value={selectedNode?.documentation || currentProcess.description}
                onChange={(e) => {
                  if (selectedNode) handlePropChange('documentation', e.target.value);
                  else onUpdateProcess({ ...currentProcess, description: e.target.value });
                }}
                placeholder="Ghi chú hướng dẫn cho cán bộ vận hành..."
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Kích hoạt thực thi (Executable)</span>
              <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 2: ACTORS & SWIMLANES (TÁC NHÂN & LÀN BƠI)           */}
        {/* ======================================================= */}
        {activeTab === 'actors' && (
          <div className="space-y-3">
            {/* Assigned Swimlane */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Làn Xử Lý / Tác Nhân (Assigned Swimlane)
              </label>
              <select
                value={selectedNode?.laneId || ''}
                onChange={(e) => {
                  const targetLane = availableLanes.find(l => l.id === e.target.value);
                  handlePropChange('laneId', e.target.value);
                  if (targetLane) {
                    handlePropChange('actorName', targetLane.name);
                    if (targetLane.actorRole && !selectedNode?.assigneeRole) {
                      handlePropChange('assigneeRole', targetLane.actorRole);
                    }
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">-- Chưa gán Làn bơi --</option>
                {availableLanes.map(lane => (
                  <option key={lane.id} value={lane.id}>
                    {lane.name} ({lane.actorRole})
                  </option>
                ))}
              </select>
            </div>

            {/* Candidate Groups */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Nhóm Vai Trò Xử Lý (Candidate Groups)
                </label>
                <span className="text-[10px] text-slate-400">Zeebe Assignment</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(selectedNode?.candidateGroups || [selectedNode?.assigneeRole || 'NCLOS B CO']).map(role => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold font-mono bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20"
                  >
                    <span>{role}</span>
                    <button
                      onClick={() => handleRemoveCandidateGroup(role)}
                      className="text-slate-400 hover:text-rose-500 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  id="newRoleInput"
                  placeholder="Thêm Role (VD: NCLOS CA)..."
                  className="flex-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        handleAddCandidateGroup(val);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('newRoleInput') as HTMLInputElement;
                    if (el && el.value.trim()) {
                      handleAddCandidateGroup(el.value.trim());
                      el.value = '';
                    }
                  }}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Assignee Expression */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Biểu thức Người xử lý (Assignee Expression)
              </label>
              <input
                type="text"
                value={selectedNode?.assigneeRole || '= initiator'}
                onChange={(e) => handlePropChange('assigneeRole', e.target.value)}
                placeholder="VD: = initiator hoặc ${currentUser}"
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Camunda Form Binding */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Biểu Mẫu Tác Vụ (Camunda / Flowable Form Key)
              </label>
              <input
                type="text"
                value={selectedNode?.formKey || 'camunda-form:bpmn:UserTaskForm_HSGN'}
                onChange={(e) => handlePropChange('formKey', e.target.value)}
                placeholder="camunda-form:bpmn:UserTaskForm_01"
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* SLA Commitment */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Thời Hạn SLA Cam Kết (Giờ)
              </label>
              <input
                type="number"
                value={selectedNode?.slaHours || 4}
                onChange={(e) => handlePropChange('slaHours', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* View Endpoint */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Đăng Ký Giao Diện (View Endpoint)
              </label>
              <select
                value={selectedNode?.viewEndpoint || 'PSCF TaskView'}
                onChange={(e) => handlePropChange('viewEndpoint', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="PSCF TaskView">PSCF TaskView (Hồ sơ tín dụng chuỗi)</option>
                <option value="LC VIEW">LC VIEW (Tài trợ thương mại)</option>
                <option value="TFE VIEW">TFE VIEW (Thấu chi doanh nghiệp)</option>
                <option value="Retail Bio Task View">Retail Bio Task View (Sinh trắc học)</option>
              </select>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 3: ENGINE EXECUTION (ZEEBE / FLOWABLE)              */}
        {/* ======================================================= */}
        {activeTab === 'execution' && (
          <div className="space-y-3">
            {/* Service Task Job Definition */}
            {selectedNode?.type === 'serviceTask' && (
              <div className="p-2.5 rounded-lg border border-purple-200/80 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20 space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300 text-[11px]">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Zeebe Task Definition</span>
                </div>
                <div>
                  <label className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 block mb-0.5">
                    Job Worker Type
                  </label>
                  <input
                    type="text"
                    value={selectedNode.jobType || `${selectedNode.id}-worker`}
                    onChange={(e) => handlePropChange('jobType', e.target.value)}
                    placeholder="e.g. loan-disbursement-worker"
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 block mb-0.5">
                    Số Lần Thử Lại (Retries)
                  </label>
                  <input
                    type="number"
                    value={selectedNode.jobRetries ?? 3}
                    onChange={(e) => handlePropChange('jobRetries', Number(e.target.value))}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {/* Business Rule Task DMN */}
            {selectedNode?.type === 'businessRuleTask' && (
              <div className="p-2.5 rounded-lg border border-amber-200/80 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300 text-[11px]">
                  <Code className="w-3.5 h-3.5" />
                  <span>Zeebe Called Decision (DMN Table)</span>
                </div>
                <div>
                  <label className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 block mb-0.5">
                    Decision ID (Bảng DMN)
                  </label>
                  <input
                    type="text"
                    value={selectedNode.calledDecision?.decisionId || 'creditScoreDMN'}
                    onChange={(e) => handlePropChange('calledDecision', { ...selectedNode.calledDecision, decisionId: e.target.value, resultVariable: selectedNode.calledDecision?.resultVariable || 'creditRating' })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 block mb-0.5">
                    Biến Kết Quả Trả Về (Result Variable)
                  </label>
                  <input
                    type="text"
                    value={selectedNode.calledDecision?.resultVariable || 'creditRating'}
                    onChange={(e) => handlePropChange('calledDecision', { ...selectedNode.calledDecision, decisionId: selectedNode.calledDecision?.decisionId || 'creditScoreDMN', resultVariable: e.target.value })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => onOpenDmn?.(selectedNode.calledDecision?.decisionId || 'creditScoreDMN')}
                  className="w-full mt-1.5 py-1.5 px-2 bg-amber-600 hover:bg-amber-500 active:scale-[0.98] text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  title="Chuyển sang tab DMN để chỉnh sửa bảng ma trận quyết định này"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Mở Bảng Quyết Định Trong Tab DMN</span>
                </button>
              </div>
            )}

            {/* Call Activity */}
            {selectedNode?.type === 'callActivity' && (
              <div className="p-2.5 rounded-lg border border-indigo-200/80 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300 text-[11px]">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Zeebe Called Element (Sub-process)</span>
                </div>
                <div>
                  <label className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 block mb-0.5">
                    Called Process ID
                  </label>
                  <input
                    type="text"
                    value={selectedNode.calledElement?.processId || 'sub_kyso_contract'}
                    onChange={(e) => handlePropChange('calledElement', { processId: e.target.value, propagateAllChildVariables: true })}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span>Truyền tất cả biến con (Propagate)</span>
                  <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                </div>
              </div>
            )}

            {/* Script Task */}
            {selectedNode?.type === 'scriptTask' && (
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Định Dạng Biểu Thức (Script Format)
                  </label>
                  <select
                    value={selectedNode.scriptFormat || 'feel'}
                    onChange={(e) => handlePropChange('scriptFormat', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs cursor-pointer font-mono"
                  >
                    <option value="feel">FEEL (Friendly Enough Expression Language - Camunda 8)</option>
                    <option value="groovy">Groovy Script</option>
                    <option value="javascript">JavaScript (ECMAScript)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Nội Dung Mã Lệnh Script
                  </label>
                  <textarea
                    rows={4}
                    value={selectedNode.scriptBody || '{ interestRate: loanAmount * 0.085 / 12, approved: true }'}
                    onChange={(e) => handlePropChange('scriptBody', e.target.value)}
                    className="w-full p-2 bg-slate-950 text-emerald-400 font-mono text-xs rounded border border-slate-800 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Boundary / Catch Events */}
            {(selectedNode?.type === 'boundaryErrorEvent' || selectedNode?.type === 'errorEndEvent') && (
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Mã Lỗi Bắt Ngoại Lệ (Error Code)
                </label>
                <input
                  type="text"
                  value={selectedNode.errorCode || 'ERR_GATEWAY_TIMEOUT'}
                  onChange={(e) => handlePropChange('errorCode', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs"
                />
              </div>
            )}

            {/* Flowable Async Continuation */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px]">Flowable Engine Properties</span>
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Asynchronous Continuation (flowable:async="true")</span>
              </label>
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Exclusive Job (flowable:exclusive="true")</span>
              </label>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 4: I/O MAPPING (zeebe:ioMapping)                     */}
        {/* ======================================================= */}
        {activeTab === 'iomapping' && (
          <div className="space-y-4">
            {/* Input Mappings */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                  Inputs Mapping (Biến Đầu Vào)
                </span>
                <button
                  onClick={handleAddInputMapping}
                  className="flex items-center gap-1 text-[10.5px] font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm Input</span>
                </button>
              </div>
              <div className="space-y-1.5">
                {(selectedNode?.ioMapping?.inputs || [
                  { source: '= loanApplication.amount', target: 'disbursedAmount' },
                  { source: '= customer.taxId', target: 'taxCode' }
                ]).map((inp, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700">
                    <input
                      type="text"
                      defaultValue={inp.source}
                      className="w-1/2 px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10.5px] font-mono"
                      placeholder="Source expr"
                    />
                    <span className="text-slate-400">&rarr;</span>
                    <input
                      type="text"
                      defaultValue={inp.target}
                      className="w-1/2 px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10.5px] font-mono"
                      placeholder="Target var"
                    />
                    <button
                      onClick={() => handleRemoveInputMapping(idx)}
                      className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Output Mappings */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                  Outputs Mapping (Biến Đầu Ra)
                </span>
                <button
                  onClick={handleAddOutputMapping}
                  className="flex items-center gap-1 text-[10.5px] font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm Output</span>
                </button>
              </div>
              <div className="space-y-1.5">
                {(selectedNode?.ioMapping?.outputs || [
                  { source: '= response.status', target: 'loanDecisionStatus' }
                ]).map((out, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700">
                    <input
                      type="text"
                      defaultValue={out.source}
                      className="w-1/2 px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10.5px] font-mono"
                      placeholder="Source expr"
                    />
                    <span className="text-slate-400">&rarr;</span>
                    <input
                      type="text"
                      defaultValue={out.target}
                      className="w-1/2 px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10.5px] font-mono"
                      placeholder="Target var"
                    />
                    <button
                      onClick={() => handleRemoveOutputMapping(idx)}
                      className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 5: MULTI-INSTANCE & EVENT LISTENERS                 */}
        {/* ======================================================= */}
        {activeTab === 'multiInstance' && (
          <div className="space-y-3.5">
            {/* Multi-Instance Section */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                Xử Lý Lặp &amp; Song Song (Multi-Instance)
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[10.5px] font-semibold">
                <button
                  onClick={() => handlePropChange('multiInstance', undefined)}
                  className={`p-1.5 rounded border text-center cursor-pointer ${
                    !selectedNode?.multiInstance ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Không Lặp
                </button>
                <button
                  onClick={() => handlePropChange('multiInstance', { isSequential: false, inputCollection: '= customerList', inputElement: 'customer' })}
                  className={`p-1.5 rounded border text-center cursor-pointer ${
                    selectedNode?.multiInstance && !selectedNode.multiInstance.isSequential ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Song Song (|||)
                </button>
                <button
                  onClick={() => handlePropChange('multiInstance', { isSequential: true, inputCollection: '= approvalLevels', inputElement: 'level' })}
                  className={`p-1.5 rounded border text-center cursor-pointer ${
                    selectedNode?.multiInstance?.isSequential ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold' : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Tuần Tự (≡)
                </button>
              </div>

              {selectedNode?.multiInstance && (
                <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700 space-y-2 text-[10.5px]">
                  <div>
                    <label className="text-slate-500 block">Tập dữ liệu đầu vào (Input Collection)</label>
                    <input
                      type="text"
                      value={selectedNode.multiInstance.inputCollection || '= customerList'}
                      onChange={(e) => handlePropChange('multiInstance', { ...selectedNode.multiInstance, inputCollection: e.target.value })}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block">Biến đại diện từng phần tử (Input Element)</label>
                    <input
                      type="text"
                      value={selectedNode.multiInstance.inputElement || 'customer'}
                      onChange={(e) => handlePropChange('multiInstance', { ...selectedNode.multiInstance, inputElement: e.target.value })}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block">Điều kiện kết thúc sớm (Completion Condition)</label>
                    <input
                      type="text"
                      placeholder="VD: = nrOfCompletedInstances >= 1"
                      value={selectedNode.multiInstance.completionCondition || ''}
                      onChange={(e) => handlePropChange('multiInstance', { ...selectedNode.multiInstance, completionCondition: e.target.value })}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Kafka Event-Driven Hook */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                Tích Hợp Kafka Event Hook
              </span>
              <p className="text-[10px] text-slate-400">
                Tự động bắn sự kiện Kafka topic khi quy trình đi qua bước này:
              </p>
              <div className="space-y-1 font-mono text-[10.5px]">
                {['task.activated', 'task.completed', 'task.canceled'].map(ev => (
                  <label key={ev} className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded">
                    <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                    <span className="text-slate-700 dark:text-slate-300">ecm.bpm.{currentProcess.key.toLowerCase()}.{ev}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
