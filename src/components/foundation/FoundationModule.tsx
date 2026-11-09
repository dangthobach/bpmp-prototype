import React, { useState } from 'react';
import { ProcessDefinition, AllocationRule } from '../../types/bpm';
import { INITIAL_ALLOCATION_RULES } from '../../data/mockBpmData';
import { 
  Cpu, 
  Layers, 
  Bell, 
  FileText, 
  Plus, 
  Check, 
  Trash2, 
  Wand2, 
  Send, 
  Radio, 
  Sliders, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface FoundationModuleProps {
  onRegisterCustomWorkflow: (newProcess: ProcessDefinition) => void;
  onOpenEndpointsModal: () => void;
  onNavigateToModeler: (key: string) => void;
}

export const FoundationModule: React.FC<FoundationModuleProps> = ({
  onRegisterCustomWorkflow,
  onOpenEndpointsModal,
  onNavigateToModeler,
}) => {
  const [activeTab, setActiveTab] = useState<'template-generator' | 'allocation' | 'notifications' | 'documents'>('template-generator');
  const [allocationRules, setAllocationRules] = useState<AllocationRule[]>(INITIAL_ALLOCATION_RULES);

  // Template Generator state
  const [domainType, setDomainType] = useState<'Banking' | 'HR' | 'Procurement' | 'Insurance' | 'ITSM'>('Banking');
  const [workflowKey, setWorkflowKey] = useState<string>('EXPENSE');
  const [workflowName, setWorkflowName] = useState<string>('Quy trình Phê duyệt Chi phí & Mua sắm');
  const [stepCount, setStepCount] = useState<number>(3);
  const [customSteps, setCustomSteps] = useState<string[]>([
    'TẠO ĐỀ NGHỊ CHI PHÍ',
    'TRƯỞNG BỘ PHẬN DUYỆT',
    'KẾ TOÁN TRƯỞNG KIỂM SOÁT',
    'GIÁM ĐỐC TÀI CHÍNH PHÊ DUYỆT'
  ]);
  const [targetEngine, setTargetEngine] = useState<'Camunda' | 'Flowable'>('Camunda');
  const [generatedSuccess, setGeneratedSuccess] = useState<boolean>(false);

  const domainPresets = {
    Banking: {
      key: 'MORTGAGE',
      name: 'Vay thế chấp mua bất động sản dự án',
      steps: ['TIẾP NHẬN ĐƠN VAY', 'THẨM ĐỊNH PHÁP LÝ TSBĐ', 'ĐỊNH GIÁ TÀI SẢN', 'HỘI ĐỒNG TÍN DỤNG PHÊ DUYỆT', 'GIẢI NGÂN']
    },
    HR: {
      key: 'ONBOARDING',
      name: 'Quy trình Tiếp nhận Nhân sự Mới (Onboarding)',
      steps: ['TIẾP NHẬN HỒ SƠ ỨNG VIÊN', 'CẤP TÀI KHOẢN IT & THẺ', 'ĐÀO TẠO HỘI NHẬP', 'ĐÁNH GIÁ THỬ VIỆC']
    },
    Procurement: {
      key: 'PO_APPROVAL',
      name: 'Phê duyệt Hợp đồng Mua sắm & Đấu thầu',
      steps: ['LẬP TỜ TRÌNH MUA SẮM', 'ĐÁNH GIÁ NHÀ CUNG CẤP', 'PHÊ DUYỆT NGÂN SÁCH', 'KÝ KẾT HỢP ĐỒNG']
    },
    Insurance: {
      key: 'CLAIM_SETTLE',
      name: 'Quy trình Giải quyết Quyền lợi Bảo hiểm',
      steps: ['TIẾP NHẬN YÊU CẦU BỒI THƯỜNG', 'GIÁM ĐỊNH TỔN THẤT', 'TÍNH TOÁN QUYỀN LỢI', 'CHI TRẢ BỒI THƯỜNG']
    },
    ITSM: {
      key: 'SERVICE_REQ',
      name: 'Yêu cầu Thay đổi Hạ tầng CNTT (Change Request)',
      steps: ['GỬI YÊU CẦU THAY ĐỔI', 'ĐÁNH GIÁ TÁC ĐỘNG CAB', 'THỰC HIỆN TRIỂN KHAI', 'HẬU KIỂM HOÀN TẤT']
    }
  };

  const handleSelectDomainPreset = (domain: 'Banking' | 'HR' | 'Procurement' | 'Insurance' | 'ITSM') => {
    setDomainType(domain);
    const p = domainPresets[domain];
    setWorkflowKey(p.key);
    setWorkflowName(p.name);
    setCustomSteps(p.steps);
  };

  const handleCreateCustomWorkflow = () => {
    const nodes = [
      { id: `${workflowKey.toLowerCase()}_start`, name: 'BẮT ĐẦU', type: 'startEvent' as const, x: 80, y: 150, width: 36, height: 36 },
      ...customSteps.map((s, idx) => ({
        id: `${workflowKey.toLowerCase()}_step_${idx + 1}`,
        name: s,
        type: 'userTask' as const,
        x: 180 + idx * 170,
        y: 140,
        width: 130,
        height: 55,
        assigneeRole: 'NCLOS ADMIN',
        slaHours: 4,
      })),
      { 
        id: `${workflowKey.toLowerCase()}_end`, 
        name: 'HOÀN THÀNH', 
        type: 'endEvent' as const, 
        x: 180 + customSteps.length * 170, 
        y: 150, 
        width: 36, 
        height: 36 
      }
    ];

    const edges = [
      { id: 'e_start', source: `${workflowKey.toLowerCase()}_start`, target: `${workflowKey.toLowerCase()}_step_1` },
      ...customSteps.slice(0, customSteps.length - 1).map((_, idx) => ({
        id: `e_${idx}`,
        source: `${workflowKey.toLowerCase()}_step_${idx + 1}`,
        target: `${workflowKey.toLowerCase()}_step_${idx + 2}`,
      })),
      { id: 'e_end', source: `${workflowKey.toLowerCase()}_step_${customSteps.length}`, target: `${workflowKey.toLowerCase()}_end` }
    ];

    const newProc: ProcessDefinition = {
      id: `proc_${workflowKey.toLowerCase()}`,
      key: workflowKey,
      name: workflowName,
      version: 1,
      status: 'checkin',
      engine: targetEngine,
      creator: 'daohanh.forwork@gmail.com',
      checkinUser: 'daohanh',
      createdAt: '19/05/2026 15:00:00',
      description: `Quy trình tự động hóa cho nghiệp vụ: ${workflowName}`,
      category: 'Custom',
      nodes,
      edges,
    };

    onRegisterCustomWorkflow(newProc);
    setGeneratedSuccess(true);
    setTimeout(() => setGeneratedSuccess(false), 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-white dark:bg-slate-900 select-none">
      {/* Top Tabs */}
      <div className="h-12 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('template-generator')}
            className={`py-3 transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'template-generator' ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Process Registration &amp; Template Generator</span>
            {activeTab === 'template-generator' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
          </button>

          <button
            onClick={() => setActiveTab('allocation')}
            className={`py-3 transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'allocation' ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Allocation Service</span>
            {activeTab === 'allocation' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notifications' ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-slate-500" />
            <span>Notification Service</span>
            {activeTab === 'notifications' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'documents' ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Document Template Engine</span>
            {activeTab === 'documents' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
          </button>
        </div>

        <button
          onClick={onOpenEndpointsModal}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5 text-emerald-600" />
          <span>Source System Endpoints Table</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/40">
        {activeTab === 'template-generator' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {generatedSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-900 dark:text-emerald-200 flex items-center justify-between animate-fade-in text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span>Quy trình mới &quot;{workflowName}&quot; ({workflowKey}) đã được khởi tạo và đăng ký thành công vào hệ thống!</span>
                </div>
                <button
                  onClick={() => onNavigateToModeler(workflowKey)}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded text-xs font-bold hover:bg-emerald-800"
                >
                  Mở trong Modeler →
                </button>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-2xs space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Customizable Template Generator cho mọi nghiệp vụ</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Khởi tạo nhanh quy trình BPMN 2.0 theo mẫu đăng ký chuẩn (Process Registration Template). Hỗ trợ ngân hàng, nhân sự, mua sắm và bảo hiểm.
                </p>
              </div>

              {/* Domain Presets */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Chọn Ngành / Lĩnh Vực Mẫu (Domain Preset)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {(['Banking', 'HR', 'Procurement', 'Insurance', 'ITSM'] as const).map(domain => (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => handleSelectDomainPreset(domain)}
                      className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        domainType === domain 
                          ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-500' 
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold">{domain}</div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{domainPresets[domain].key}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workflow Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mã Quy Trình (Key)</label>
                  <input
                    type="text"
                    value={workflowKey}
                    onChange={(e) => setWorkflowKey(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mục Tiêu Engine Triển Khai</label>
                  <select
                    value={targetEngine}
                    onChange={(e) => setTargetEngine(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-semibold"
                  >
                    <option value="Camunda">Camunda 7.20 / 8.4 Engine</option>
                    <option value="Flowable">Flowable 7.0 Engine</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tên Quy Trình Nghiệp Vụ</label>
                  <input
                    type="text"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-semibold"
                  />
                </div>
              </div>

              {/* Dynamic Steps list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Các Bước Xử Lý Tuần Tự (User Tasks)
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomSteps([...customSteps, `BƯỚC BỔ SUNG ${customSteps.length + 1}`])}
                    className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm bước</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {customSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const updated = [...customSteps];
                          updated[idx] = e.target.value;
                          setCustomSteps(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium"
                      />
                      {customSteps.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setCustomSteps(customSteps.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleCreateCustomWorkflow}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Khởi Tạo &amp; Đăng Ký Quy Trình (BPMN 2.0)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Allocation Service */}
        {activeTab === 'allocation' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Task Allocation Service</h3>
                <p className="text-xs text-slate-500">Quy tắc phân bổ task tự động: Round-robin, cân bằng tải (Workload), và kỹ năng</p>
              </div>
            </div>

            <div className="space-y-3">
              {allocationRules.map(rule => (
                <div key={rule.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {rule.processKey} - {rule.stepName}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{rule.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 text-[11px] mt-1">
                      <span>Chiến lược: <strong className="text-slate-700 dark:text-slate-300">{rule.strategy}</strong></span>
                      <span>Nhóm nhận: <strong className="font-mono">{rule.targetGroup}</strong></span>
                      <span>Tối đa task/người: <strong className="font-mono">{rule.maxActivePerUser}</strong></span>
                      <span>Tự động leo thang (Escalate): <strong className="font-mono text-amber-600">{rule.autoEscalateHours}h</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setAllocationRules(allocationRules.map(r => r.id === rule.id ? { ...r, active: !r.active } : r));
                      }}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        rule.active 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {rule.active ? 'Đang kích hoạt' : 'Tạm dừng'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications & Documents */}
        {(activeTab === 'notifications' || activeTab === 'documents') && (
          <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
              {activeTab === 'notifications' ? <Bell className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {activeTab === 'notifications' ? 'Multi-Channel Notification Gateway' : 'Document Template Rendering Engine'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {activeTab === 'notifications' 
                ? 'Đã kết nối SMS Brandname, Email SMTP và Push Notification cho các sự kiện BPM runtime: Active task, Escalation và SLA warnings.' 
                : 'Tự động biên dịch biểu mẫu XML, xuất báo cáo PDF/Word chuẩn ngân hàng có chữ ký số điện tử.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
