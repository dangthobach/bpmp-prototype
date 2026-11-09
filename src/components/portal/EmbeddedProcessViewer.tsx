import React, { useState, useMemo } from 'react';
import { ProcessDefinition, BPMNNode, BPMNEdge } from '../../types/bpm';
import { ClientRequest } from '../../types/clientPortal';
import { 
  Sliders, 
  Database, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Copy, 
  Check, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  FileText, 
  Code, 
  User, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  Cpu, 
  Tag, 
  DollarSign, 
  Building2, 
  Activity,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Target,
  Eye,
  EyeOff,
  Compass,
  Layout
} from 'lucide-react';

interface EmbeddedProcessViewerProps {
  request: ClientRequest;
  processDefinition?: ProcessDefinition;
  onNotify?: (msg: string) => void;
  onOpenAdminConsole?: () => void;
  onUploadAdditionalDoc?: () => void;
}

export const EmbeddedProcessViewer: React.FC<EmbeddedProcessViewerProps> = ({
  request,
  processDefinition,
  onNotify,
  onOpenAdminConsole,
  onUploadAdditionalDoc,
}) => {
  // Canvas zoom & pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fitMode, setFitMode] = useState<'fit' | 'manual'>('fit');
  const [showInspector, setShowInspector] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'diagram' | 'variables' | 'audit'>('diagram');

  // Variables search & category filter
  const [varSearchQuery, setVarSearchQuery] = useState<string>('');
  const [varCategory, setVarCategory] = useState<'ALL' | 'FINANCIAL' | 'IDENTITY' | 'PROCESS_SPECIFIC' | 'ENGINE'>('ALL');
  const [varViewMode, setVarViewMode] = useState<'table' | 'json'>('table');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const showToast = (msg: string) => {
    if (onNotify) {
      onNotify(msg);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast(`Đã sao chép ${label}!`);
  };

  // Safe fallback process definition
  const procDef = processDefinition || {
    id: 'proc_fallback',
    key: request.processKey || 'SDD',
    name: request.serviceName,
    version: 2,
    status: 'deployed' as const,
    engine: 'Camunda' as const,
    creator: 'daohanh.forwork@gmail.com',
    checkinUser: 'system_admin',
    createdAt: '07/07/2025 20:43:27',
    description: 'Quy trình giải ngân và thẩm định tín dụng tự động',
    category: 'Banking' as const,
    nodes: [
      { id: 'start_node', name: 'KHOI TAO HO SO', type: 'startEvent' as const, x: 60, y: 180, width: 36, height: 36 },
      { id: 'task_tiepnhan', name: 'TIEP NHAN HO SO TRUC TUYEN', type: 'userTask' as const, x: 160, y: 160, width: 130, height: 55, assigneeRole: 'NCLOS SALE', slaHours: 2 },
      { id: 'task_cbbh', name: 'CAN BO BAN HANG (CBBH) RUA SOAT', type: 'userTask' as const, x: 340, y: 160, width: 140, height: 55, assigneeRole: 'NCLOS SALE', slaHours: 4 },
      { id: 'task_bosung', name: 'CHO BO SUNG HO SO TU FRONT END', type: 'userTask' as const, x: 530, y: 160, width: 150, height: 55, assigneeRole: 'NCLOS B KS2', slaHours: 24 },
      { id: 'task_lodv', name: 'LODV PHE DUYET GIAI NGAN', type: 'userTask' as const, x: 730, y: 160, width: 140, height: 55, assigneeRole: 'NCLOS ADMIN', slaHours: 6 },
      { id: 'task_tichhop', name: 'HACH TOAN & CHUYEN TIEN CORE', type: 'serviceTask' as const, x: 920, y: 160, width: 140, height: 55 },
      { id: 'end_node', name: 'HOAN THANH', type: 'endEvent' as const, x: 1110, y: 172, width: 36, height: 36 }
    ],
    edges: [
      { id: 'e1', source: 'start_node', target: 'task_tiepnhan', label: 'Start' },
      { id: 'e2', source: 'task_tiepnhan', target: 'task_cbbh', label: 'Verified' },
      { id: 'e3', source: 'task_cbbh', target: 'task_bosung', label: 'Cần bổ sung' },
      { id: 'e4', source: 'task_bosung', target: 'task_lodv', label: 'Hợp lệ' },
      { id: 'e5', source: 'task_lodv', target: 'task_tichhop', label: 'Approved' },
      { id: 'e6', source: 'task_tichhop', target: 'end_node', label: 'Success' }
    ]
  };

  // Determine active node and node statuses
  const nodeStatusMap = useMemo(() => {
    const map: Record<string, 'COMPLETED' | 'ACTIVE' | 'PENDING' | 'REJECTED'> = {};
    const nodes = procDef.nodes;
    const currentStepUpper = (request.currentStepName || '').toUpperCase();

    // Check if entire instance completed or rejected
    if (request.status === 'APPROVED' || request.status === 'DISBURSED') {
      nodes.forEach(n => {
        map[n.id] = 'COMPLETED';
      });
      return map;
    }

    if (request.status === 'REJECTED') {
      nodes.forEach((n, idx) => {
        if (idx < 2) map[n.id] = 'COMPLETED';
        else if (idx === 2) map[n.id] = 'REJECTED';
        else map[n.id] = 'PENDING';
      });
      return map;
    }

    // Identify active node index based on matching name or default
    let activeIdx = nodes.findIndex(n => 
      n.name.toUpperCase().includes(currentStepUpper) || 
      currentStepUpper.includes(n.name.toUpperCase()) ||
      (currentStepUpper.includes('BO SUNG') && n.name.toUpperCase().includes('BO SUNG')) ||
      (currentStepUpper.includes('TIEP NHAN') && n.name.toUpperCase().includes('TIEP NHAN'))
    );

    if (activeIdx === -1) {
      activeIdx = Math.min(2, nodes.length - 1);
    }

    nodes.forEach((n, idx) => {
      if (idx < activeIdx) {
        map[n.id] = 'COMPLETED';
      } else if (idx === activeIdx) {
        map[n.id] = 'ACTIVE';
      } else {
        map[n.id] = 'PENDING';
      }
    });

    return map;
  }, [procDef, request.status, request.currentStepName]);

  // Selected node details
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) {
      // Default to active node
      const activeEntry = Object.entries(nodeStatusMap).find(([, status]) => status === 'ACTIVE');
      const targetId = activeEntry ? activeEntry[0] : procDef.nodes[0]?.id;
      return procDef.nodes.find(n => n.id === targetId) || procDef.nodes[0];
    }
    return procDef.nodes.find(n => n.id === selectedNodeId) || procDef.nodes[0];
  }, [selectedNodeId, procDef, nodeStatusMap]);

  // Active running node
  const activeNode = useMemo(() => {
    const activeEntry = Object.entries(nodeStatusMap).find(([, status]) => status === 'ACTIVE');
    const targetId = activeEntry ? activeEntry[0] : procDef.nodes[0]?.id;
    return procDef.nodes.find(n => n.id === targetId) || procDef.nodes[0];
  }, [nodeStatusMap, procDef]);

  // Consolidated variables list
  const consolidatedVariables = useMemo(() => {
    const rawVars = request.variables || {};
    const entries: Array<{
      key: string;
      value: any;
      type: 'string' | 'number' | 'boolean' | 'json';
      category: 'FINANCIAL' | 'IDENTITY' | 'PROCESS_SPECIFIC' | 'ENGINE';
      description: string;
    }> = [];

    // Financial
    entries.push({
      key: 'amount',
      value: rawVars.amount || request.amount,
      type: 'number',
      category: 'FINANCIAL',
      description: 'Số tiền đề nghị giải ngân / vay vốn'
    });
    entries.push({
      key: 'currency',
      value: rawVars.currency || request.currency || 'VNĐ',
      type: 'string',
      category: 'FINANCIAL',
      description: 'Đồng tiền giao dịch'
    });
    entries.push({
      key: 'termMonths',
      value: rawVars.termMonths || request.termMonths,
      type: 'number',
      category: 'FINANCIAL',
      description: 'Thời hạn khoản vay / chu kỳ tài trợ (tháng)'
    });
    entries.push({
      key: 'purpose',
      value: rawVars.purpose || request.purpose,
      type: 'string',
      category: 'FINANCIAL',
      description: 'Mục đích sử dụng vốn chi tiết'
    });

    // Identity
    entries.push({
      key: 'customerOrg',
      value: rawVars.customerOrg || request.customerOrg,
      type: 'string',
      category: 'IDENTITY',
      description: 'Tên Doanh nghiệp / Tổ chức nộp đơn'
    });
    entries.push({
      key: 'customerTaxId',
      value: rawVars.customerTaxId || request.customerTaxId || '0108992211',
      type: 'string',
      category: 'IDENTITY',
      description: 'Mã số thuế / Mã số định danh'
    });
    entries.push({
      key: 'customerName',
      value: rawVars.customerName || request.customerName,
      type: 'string',
      category: 'IDENTITY',
      description: 'Người đại diện theo pháp luật / Người nộp'
    });
    entries.push({
      key: 'branch',
      value: rawVars.branch || request.branch || 'Chi nhánh Hoàn Kiếm',
      type: 'string',
      category: 'IDENTITY',
      description: 'Chi nhánh quản lý tín dụng'
    });

    // Process Specific
    if (procDef.key === 'SDD') {
      entries.push({
        key: 'disbursementMethod',
        value: rawVars.disbursementMethod || 'TRANSFER',
        type: 'string',
        category: 'PROCESS_SPECIFIC',
        description: 'Phương thức giải ngân (Chuyển khoản NCC / Tiền mặt / L/C)'
      });
      entries.push({
        key: 'beneficiaryAccount',
        value: rawVars.beneficiaryAccount || '0451000389882',
        type: 'string',
        category: 'PROCESS_SPECIFIC',
        description: 'Số tài khoản người thụ hưởng'
      });
      entries.push({
        key: 'beneficiaryBank',
        value: rawVars.beneficiaryBank || 'Vietcombank - CN Sở Giao Dịch',
        type: 'string',
        category: 'PROCESS_SPECIFIC',
        description: 'Ngân hàng thụ hưởng'
      });
      entries.push({
        key: 'contractInvoiceNumber',
        value: rawVars.contractInvoiceNumber || '44/2026/HĐKT-VP',
        type: 'string',
        category: 'PROCESS_SPECIFIC',
        description: 'Số hợp đồng kinh tế / Hóa đơn chứng minh'
      });
      entries.push({
        key: 'collateralType',
        value: rawVars.collateralType || 'Bất động sản công nghiệp & Khoản phải thu',
        type: 'string',
        category: 'PROCESS_SPECIFIC',
        description: 'Phân loại tài sản bảo đảm thế chấp'
      });
    } else {
      entries.push({
        key: 'requestedLimit',
        value: rawVars.requestedLimit || request.amount,
        type: 'number',
        category: 'PROCESS_SPECIFIC',
        description: 'Hạn mức đề xuất thẩm định tối đa'
      });
      entries.push({
        key: 'riskAppraisalMode',
        value: rawVars.riskAppraisalMode || 'STANDARD',
        type: 'string',
        category: 'PROCESS_SPECIFIC',
        description: 'Phân luồng đánh giá rủi ro (Standard / Green-Track)'
      });
      entries.push({
        key: 'cicTargetScore',
        value: rawVars.cicTargetScore || 'Hạng 1 - Tốt (Score: 710)',
        type: 'string',
        category: 'PROCESS_SPECIFIC',
        description: 'Điểm xếp hạng tín dụng CIC mục tiêu'
      });
    }

    // Engine Context & Dynamic
    entries.push({
      key: 'autoExecuteBRMS',
      value: rawVars.autoExecuteBRMS !== undefined ? rawVars.autoExecuteBRMS : true,
      type: 'boolean',
      category: 'ENGINE',
      description: 'Tự động kiểm tra quy tắc rủi ro qua Camunda DMN / BRMS'
    });
    entries.push({
      key: 'priorityLevel',
      value: rawVars.priorityLevel || 'HIGH',
      type: 'string',
      category: 'ENGINE',
      description: 'Mức độ ưu tiên phân bổ hàng đợi (HIGH / NORMAL)'
    });
    entries.push({
      key: 'notifyChannel',
      value: rawVars.notifyChannel || 'SMS_AND_EMAIL',
      type: 'string',
      category: 'ENGINE',
      description: 'Kênh thông báo kết quả tức thì cho khách hàng'
    });

    // Add any extra dynamic keys from rawVars
    Object.keys(rawVars).forEach(k => {
      if (!entries.some(e => e.key === k)) {
        const val = rawVars[k];
        const valType = typeof val === 'number' ? 'number' : typeof val === 'boolean' ? 'boolean' : typeof val === 'object' ? 'json' : 'string';
        entries.push({
          key: k,
          value: val,
          type: valType,
          category: 'ENGINE',
          description: 'Biến nghiệp vụ mở rộng truyền vào Engine'
        });
      }
    });

    return entries;
  }, [request, procDef]);

  // Filtered variables list
  const filteredVariables = useMemo(() => {
    return consolidatedVariables.filter(v => {
      if (varCategory !== 'ALL' && v.category !== varCategory) return false;
      if (varSearchQuery.trim()) {
        const q = varSearchQuery.toLowerCase();
        return (
          v.key.toLowerCase().includes(q) ||
          String(v.value).toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [consolidatedVariables, varCategory, varSearchQuery]);

  // Accurate Bounding Box & Responsive ViewBox for SVG canvas (removes empty left margin)
  const canvasBounds = useMemo(() => {
    if (!procDef.nodes.length) {
      return { minX: 0, minY: 0, maxX: 1000, maxY: 500, viewBox: '0 0 1000 500', width: 1000, height: 500 };
    }
    const xs = procDef.nodes.map(n => n.x);
    const ys = procDef.nodes.map(n => n.y);
    const maxXs = procDef.nodes.map(n => n.x + (n.width || 120));
    const maxYs = procDef.nodes.map(n => n.y + (n.height || 60));

    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...maxXs);
    const maxY = Math.max(...maxYs);

    const pad = 36;
    const vbX = Math.max(0, minX - pad);
    const vbY = Math.max(0, minY - pad);
    const vbW = Math.max(760, maxX - vbX + pad);
    const vbH = Math.max(400, maxY - vbY + pad);

    return {
      minX,
      minY,
      maxX,
      maxY,
      viewBox: `${vbX} ${vbY} ${vbW} ${vbH}`,
      width: vbW,
      height: vbH
    };
  }, [procDef]);

  // Format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const processInstanceKey = request.processInstanceId || `INST-${request.id.replace('req_', '')}`;
  const businessKey = request.trackingCode;

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-950 p-6 overflow-y-auto' : ''}`}>
      {/* ==================================================== */}
      {/* 1. PROCESS INSTANCE KEY & EXECUTION METADATA BANNER  */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {procDef.key}
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {procDef.name}
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-500 font-mono">
                {procDef.engine} 8 Zeebe · v{procDef.version}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Đơn vị: <strong>{request.customerOrg}</strong> · Chi nhánh: <strong>{request.branch || 'Chi nhánh Hoàn Kiếm'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAdminConsole && (
              <button
                onClick={onOpenAdminConsole}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-700 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                title="Mở trong bảng điều khiển Quản trị BPM"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin View</span>
              </button>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer transition-colors"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Unboxed Metadata Strip (Zero-Pill Discipline) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10.5px]">Process Instance Key:</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
              <span className="truncate">{processInstanceKey}</span>
              <button
                onClick={() => copyToClipboard(processInstanceKey, 'Instance Key')}
                className="text-slate-400 hover:text-emerald-600 cursor-pointer"
                title="Sao chép Instance Key"
              >
                {copiedKey === 'Instance Key' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[10.5px]">Mã Business Key / Hồ Sơ:</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-700 dark:text-emerald-400">
              <span>{businessKey}</span>
              <button
                onClick={() => copyToClipboard(businessKey, 'Business Key')}
                className="text-slate-400 hover:text-emerald-600 cursor-pointer"
                title="Sao chép Business Key"
              >
                {copiedKey === 'Business Key' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[10.5px]">Vị Trí Token Hiện Tại:</span>
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold truncate">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
              <span className="truncate">{request.currentStepName}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[10.5px]">Thời Hạn Cam Kết (SLA):</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold block">
              {request.slaDeadline}
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. TAB CONTROLS: EMBEDDED BPMN MAP vs VARIABLES      */}
      {/* ==================================================== */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveTab('diagram')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'diagram'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Sơ Đồ BPMN Trực Quan &amp; Luồng Token</span>
          </button>

          <button
            onClick={() => setActiveTab('variables')}
            className={`flex items-center gap-2 px-3.5 py-2.5 font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'variables'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-blue-500" />
            <span>Biến Ngữ Cảnh Quy Trình ({consolidatedVariables.length})</span>
          </button>
        </div>

        {activeTab === 'diagram' && (
          <div className="flex items-center gap-1.5 pb-1 flex-wrap">
            {/* View Mode Toggle: Fit to frame vs Manual Zoom */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10.5px]">
              <button
                onClick={() => {
                  setFitMode('fit');
                  setZoomLevel(1);
                  showToast('Đã căn chỉnh luồng quy trình vừa khít khung hình, loại bỏ khoảng trắng dư thừa!');
                }}
                className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                  fitMode === 'fit'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tự động căn chỉnh vừa khung hình, không bị khoảng trống bên trái"
              >
                Căn Vừa Khung
              </button>
              <button
                onClick={() => {
                  setFitMode('manual');
                  showToast('Chuyển sang chế độ cuộn tự do và phóng to / thu nhỏ.');
                }}
                className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                  fitMode === 'manual'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Chế độ tự do phóng to và cuộn bản đồ"
              >
                Cuộn Tự Do
              </button>
            </div>

            {/* Jump to active running step */}
            <button
              onClick={() => {
                setSelectedNodeId(activeNode.id);
                setShowInspector(true);
                showToast(`Đã tập trung vào bước đang chạy: ${activeNode.name}`);
              }}
              className="flex items-center gap-1 px-2 py-1 text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 rounded border border-emerald-200 dark:border-emerald-800 cursor-pointer transition-colors"
              title="Nhảy tới và làm nổi bật bước đang thực thi"
            >
              <Target className="w-3 h-3 text-emerald-600" />
              <span>Bước Hiện Tại</span>
            </button>

            {/* Toggle Node Inspector Panel */}
            <button
              onClick={() => {
                setShowInspector(!showInspector);
                showToast(!showInspector ? 'Đã mở bảng thông tin chi tiết bước quy trình' : 'Đã thu gọn bảng chi tiết để mở rộng tối đa sơ đồ quy trình');
              }}
              className={`flex items-center gap-1 px-2 py-1 text-[10.5px] font-semibold rounded border cursor-pointer transition-colors ${
                showInspector
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  : 'bg-emerald-600 text-white border-emerald-600'
              }`}
              title={showInspector ? 'Ẩn bảng chi tiết node để mở rộng sơ đồ' : 'Hiện bảng chi tiết node'}
            >
              {showInspector ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showInspector ? 'Thu Gọn Chi Tiết' : 'Mở Rộng Sơ Đồ'}</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">|</span>

            {/* Zoom controls */}
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.15))}
              className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Thu nhỏ sơ đồ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10.5px] text-slate-500 w-10 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.8, prev + 0.15))}
              className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Phóng to sơ đồ"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Đặt lại tỉ lệ 1:1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* TAB 1: INTERACTIVE SVG BPMN PROCESS MAP              */}
      {/* ==================================================== */}
      {activeTab === 'diagram' && (
        <div className="space-y-3">
          {/* Action Callout if additional docs required */}
          {request.status === 'ADDITIONAL_DOCS_REQUIRED' && onUploadAdditionalDoc && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Hồ sơ đang tạm dừng tại bước: <strong>{request.currentStepName}</strong> để bổ sung chứng từ.
                </span>
              </div>
              <button
                onClick={onUploadAdditionalDoc}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Bổ Sung Tài Liệu Ngay
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left: Interactive Canvas Viewport (Dynamically expands to 12 cols when inspector is collapsed) */}
            <div className={`${showInspector && selectedNode ? 'lg:col-span-8' : 'lg:col-span-12'} bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 overflow-hidden shadow-2xs relative transition-all duration-200`}>
              <div className={`select-none ${fitMode === 'manual' ? 'overflow-x-auto overflow-y-auto max-h-[540px] cursor-grab active:cursor-grabbing' : 'overflow-hidden flex items-center justify-center'}`}>
                <div style={{ transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined, transformOrigin: fitMode === 'fit' ? 'center center' : 'top left', transition: 'transform 0.15s ease-out', width: '100%' }}>
                  <svg
                    viewBox={canvasBounds.viewBox}
                    className="w-full h-auto min-h-[460px] max-h-[580px] overflow-visible block"
                    style={{ maxHeight: isFullscreen ? '80vh' : '580px' }}
                  >
                    <defs>
                      {/* Grid Pattern */}
                      <pattern id="embedded_grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="#94a3b8" fillOpacity="0.18" />
                      </pattern>

                      {/* Arrow Markers */}
                      <marker
                        id="arrow-default"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                      </marker>

                      <marker
                        id="arrow-completed"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
                      </marker>

                      <marker
                        id="arrow-active"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669" />
                      </marker>
                    </defs>

                    {/* Canvas Background */}
                    <rect width="100%" height="100%" fill="url(#embedded_grid)" />

                    {/* Edges with Connections */}
                    {procDef.edges.map(edge => {
                      const src = procDef.nodes.find(n => n.id === edge.source);
                      const tgt = procDef.nodes.find(n => n.id === edge.target);
                      if (!src || !tgt) return null;

                      const srcX = src.x + (src.width || 120);
                      const srcY = src.y + (src.height || 50) / 2;
                      const tgtX = tgt.x;
                      const tgtY = tgt.y + (tgt.height || 50) / 2;

                      const srcStatus = nodeStatusMap[src.id];
                      const isCompletedPath = srcStatus === 'COMPLETED';
                      const isActiveTransition = srcStatus === 'ACTIVE';

                      const midX = (srcX + tgtX) / 2;
                      const pathD = `M ${srcX} ${srcY} C ${midX} ${srcY}, ${midX} ${tgtY}, ${tgtX} ${tgtY}`;

                      return (
                        <g key={edge.id}>
                          <path
                            d={pathD}
                            fill="none"
                            stroke={isCompletedPath ? '#10b981' : isActiveTransition ? '#059669' : '#94a3b8'}
                            strokeWidth={isCompletedPath || isActiveTransition ? 2.2 : 1.4}
                            strokeDasharray={isActiveTransition ? '4 3' : 'none'}
                            markerEnd={`url(#${isCompletedPath ? 'arrow-completed' : isActiveTransition ? 'arrow-active' : 'arrow-default'})`}
                            className={isActiveTransition ? 'animate-pulse' : ''}
                          />

                          {edge.label && (
                            <g transform={`translate(${midX}, ${(srcY + tgtY) / 2 - 8})`}>
                              <rect
                                x={-edge.label.length * 3 - 6}
                                y="-7"
                                width={edge.label.length * 6 + 12}
                                height="15"
                                rx="3"
                                fill="#ffffff"
                                stroke="#cbd5e1"
                                strokeWidth="0.8"
                                className="dark:fill-slate-800 dark:stroke-slate-700"
                              />
                              <text
                                fontSize="8.5"
                                textAnchor="middle"
                                y="3"
                                fill="#475569"
                                fontWeight="600"
                                className="dark:fill-slate-300 font-mono"
                              >
                                {edge.label}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* Nodes Rendering */}
                    {procDef.nodes.map(node => {
                      const status = nodeStatusMap[node.id] || 'PENDING';
                      const isSelected = selectedNode?.id === node.id;
                      const isUserTask = node.type === 'userTask';
                      const isServiceTask = node.type === 'serviceTask';
                      const isGateway = node.type.includes('Gateway');
                      const isStart = node.type.includes('start') || node.type === 'startEvent';
                      const isEnd = node.type.includes('end') || node.type === 'endEvent';

                      const width = node.width || (isStart || isEnd ? 36 : isGateway ? 38 : 125);
                      const height = node.height || (isStart || isEnd ? 36 : isGateway ? 38 : 54);

                      // Style variants
                      let fillBg = '#ffffff';
                      let strokeColor = '#94a3b8';
                      let strokeW = 1.2;

                      if (status === 'COMPLETED') {
                        fillBg = '#f0fdf4';
                        strokeColor = '#10b981';
                        strokeW = 1.8;
                      } else if (status === 'ACTIVE') {
                        fillBg = '#ecfdf5';
                        strokeColor = '#059669';
                        strokeW = 2.4;
                      } else if (status === 'REJECTED') {
                        fillBg = '#fff1f2';
                        strokeColor = '#e11d48';
                        strokeW = 1.8;
                      }

                      if (isSelected) {
                        strokeColor = '#2563eb';
                        strokeW = 2.8;
                      }

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${node.x}, ${node.y})`}
                          onClick={() => {
                            setSelectedNodeId(node.id);
                            setShowInspector(true);
                          }}
                          className="cursor-pointer transition-transform hover:scale-[1.02]"
                        >
                          {/* Active Beacon Halo */}
                          {status === 'ACTIVE' && (
                            <rect
                              x="-5"
                              y="-5"
                              width={width + 10}
                              height={height + 10}
                              rx="12"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="2.5"
                              strokeDasharray="6 4"
                              className="animate-spin-slow origin-center opacity-70"
                            />
                          )}

                          {/* Task Node Shape */}
                          {isUserTask || isServiceTask ? (
                            <g>
                              <rect
                                width={width}
                                height={height}
                                rx="8"
                                fill={fillBg}
                                stroke={strokeColor}
                                strokeWidth={strokeW}
                                className="shadow-xs dark:fill-slate-800"
                              />

                              {/* Task Icon */}
                              <g transform="translate(8, 7)">
                                {isUserTask ? (
                                  <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                ) : (
                                  <Cpu className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                                )}
                              </g>

                              {/* Task Name */}
                              <text
                                x={width / 2}
                                y={height / 2 - 2}
                                fontSize="8.5"
                                textAnchor="middle"
                                fontWeight="700"
                                fill="#0f172a"
                                className="dark:fill-slate-100 select-none"
                              >
                                {node.name.length > 20 ? `${node.name.slice(0, 18)}..` : node.name}
                              </text>

                              {/* Subtitle / Assignee Role & Status */}
                              <text
                                x={width / 2}
                                y={height / 2 + 12}
                                fontSize="7"
                                textAnchor="middle"
                                fill="#64748b"
                                className="font-mono dark:fill-slate-400 select-none"
                              >
                                {node.assigneeRole || (node.slaHours ? `SLA: ${node.slaHours}h` : 'SYSTEM')}
                              </text>

                              {/* Status Badges */}
                              {status === 'COMPLETED' && (
                                <g transform={`translate(${width - 16}, 4)`}>
                                  <circle cx="6" cy="6" r="6" fill="#10b981" />
                                  <path d="M 3.5 6 L 5.5 8 L 8.5 4" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                                </g>
                              )}

                              {status === 'ACTIVE' && (
                                <g transform={`translate(${width - 16}, 4)`}>
                                  <circle cx="6" cy="6" r="6" fill="#059669" />
                                  <circle cx="6" cy="6" r="3" fill="#ffffff" className="animate-ping" />
                                </g>
                              )}
                            </g>
                          ) : isGateway ? (
                            /* Gateway Diamond */
                            <g>
                              <polygon
                                points={`${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`}
                                fill={fillBg}
                                stroke={strokeColor}
                                strokeWidth={strokeW}
                                className="dark:fill-slate-800"
                              />
                              <text
                                x={width / 2}
                                y={height / 2 + 3.5}
                                fontSize="12"
                                textAnchor="middle"
                                fontWeight="bold"
                                fill="#475569"
                                className="dark:fill-slate-300 select-none font-mono"
                              >
                                X
                              </text>
                            </g>
                          ) : isStart ? (
                            /* Start Event Circle */
                            <g>
                              <circle
                                cx={width / 2}
                                cy={height / 2}
                                r={width / 2 - 1}
                                fill={status === 'COMPLETED' ? '#ecfdf5' : '#ffffff'}
                                stroke="#10b981"
                                strokeWidth="2"
                                className="dark:fill-slate-800"
                              />
                              <polygon
                                points={`${width / 2 - 3},${height / 2 - 5} ${width / 2 + 5},${height / 2} ${width / 2 - 3},${height / 2 + 5}`}
                                fill="#10b981"
                              />
                            </g>
                          ) : (
                            /* End Event Double Circle */
                            <g>
                              <circle
                                cx={width / 2}
                                cy={height / 2}
                                r={width / 2 - 1}
                                fill={status === 'COMPLETED' ? '#ecfdf5' : '#ffffff'}
                                stroke={status === 'COMPLETED' ? '#10b981' : '#0f172a'}
                                strokeWidth="3"
                                className="dark:fill-slate-800"
                              />
                              <circle
                                cx={width / 2}
                                cy={height / 2}
                                r={width / 2 - 5}
                                fill="none"
                                stroke={status === 'COMPLETED' ? '#10b981' : '#0f172a'}
                                strokeWidth="1"
                              />
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Canvas Legend */}
              <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Đã hoàn thành</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
                    <strong className="text-emerald-700 dark:text-emerald-400 font-bold">Vị trí Token hiện tại</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>Chưa tới lượt</span>
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">
                  Nhấp vào node bất kỳ để kiểm tra vai trò &amp; SLA
                </span>
              </div>
            </div>

            {/* Right: Selected Node Inspector Card */}
            {showInspector && selectedNode && (
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs space-y-4 animate-fade-in">
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="pr-2">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      Chi Tiết Bước Quy Trình
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 mt-0.5 line-clamp-2">
                      {selectedNode.name}
                    </h5>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      nodeStatusMap[selectedNode.id] === 'ACTIVE'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : nodeStatusMap[selectedNode.id] === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {nodeStatusMap[selectedNode.id] === 'ACTIVE' ? 'Đang Xử Lý' : nodeStatusMap[selectedNode.id] === 'COMPLETED' ? 'Đã Xong' : 'Chờ Lượt'}
                    </span>
                    <button
                      onClick={() => setShowInspector(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer transition-colors"
                      title="Thu gọn bảng chi tiết để mở rộng sơ đồ"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              {/* Node Details Table */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">Node ID:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedNode.id}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">Loại tác vụ:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedNode.type}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">Vai trò đảm nhiệm:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {selectedNode.assigneeRole || 'Hệ thống tự động (Automated)'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">Thời hạn cam kết SLA:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedNode.slaHours ? `${selectedNode.slaHours} giờ làm việc` : 'Theo chu kỳ Core'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-slate-400">Cán bộ phụ trách:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {request.assignedOfficer}
                  </span>
                </div>
              </div>

              {/* Documentation & Guidance */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-500" />
                  <span>Hướng dẫn tại bước này:</span>
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {selectedNode.documentation || 
                    (nodeStatusMap[selectedNode.id] === 'ACTIVE'
                      ? 'Cán bộ đang đối chiếu hồ sơ và kiểm tra tính hợp lệ của chứng từ. Khách hàng có thể theo dõi thời gian thực hoặc bổ sung hồ sơ nếu được yêu cầu.'
                      : 'Bước này nằm trong luồng quy trình chuẩn hóa đã được số hóa trên động cơ Camunda.')}
                </p>
              </div>

              {/* Action shortcut button */}
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('variables')}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xem Toàn Bộ Biến Của Hồ Sơ Này →</span>
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: RUNTIME PROCESS VARIABLES EXPLORER            */}
      {/* ==================================================== */}
      {activeTab === 'variables' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Trình Khám Phá Biến Quy Trình (Process Variables Inspector)</span>
              </h4>
              <p className="text-xs text-slate-500">
                Toàn bộ các biến ngữ cảnh được nạp vào Token thực thi của Camunda / Flowable cho hồ sơ <strong>{businessKey}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Table / JSON toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setVarViewMode('table')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    varViewMode === 'table' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Bảng Thuộc Tính
                </button>
                <button
                  onClick={() => setVarViewMode('json')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    varViewMode === 'json' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Cây JSON Raw
                </button>
              </div>

              <button
                onClick={() => {
                  const payloadObj: Record<string, any> = {};
                  consolidatedVariables.forEach(v => { payloadObj[v.key] = v.value; });
                  navigator.clipboard.writeText(JSON.stringify(payloadObj, null, 2));
                  setCopiedJson(true);
                  setTimeout(() => setCopiedJson(false), 2000);
                  showToast('Đã sao chép toàn bộ biến JSON!');
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Đã chép' : 'Sao chép JSON'}</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2.5 pt-1">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kiếm biến theo tên key, giá trị hoặc mô tả..."
                value={varSearchQuery}
                onChange={(e) => setVarSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1 text-xs overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL', label: 'Tất Cả Biến' },
                { id: 'FINANCIAL', label: 'Tài Chính & Hạn Mức' },
                { id: 'IDENTITY', label: 'Khách Hàng & Pháp Lý' },
                { id: 'PROCESS_SPECIFIC', label: 'Nghiệp Vụ Đặc Thù' },
                { id: 'ENGINE', label: 'Engine Rules & DMN' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setVarCategory(cat.id as any)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    varCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* View Mode 1: Table Grid */}
          {varViewMode === 'table' ? (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Tên Khóa (Key)</th>
                    <th className="py-2.5 px-3">Kiểu (Type)</th>
                    <th className="py-2.5 px-3">Giá Trị Runtime (Value)</th>
                    <th className="py-2.5 px-3">Mô Tả Mục Đích</th>
                    <th className="py-2.5 px-3 text-right">Sao Chép</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredVariables.map(v => (
                    <tr key={v.key} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {v.key}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {v.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                        {typeof v.value === 'number' && v.key.toLowerCase().includes('amount') ? (
                          <span>{formatVND(v.value)}</span>
                        ) : typeof v.value === 'boolean' ? (
                          <span className={v.value ? 'text-emerald-600' : 'text-slate-500'}>{String(v.value)}</span>
                        ) : typeof v.value === 'object' ? (
                          JSON.stringify(v.value)
                        ) : (
                          String(v.value)
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {v.description}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => copyToClipboard(String(v.value), v.key)}
                          className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                          title="Sao chép giá trị"
                        >
                          {copiedKey === v.key ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* View Mode 2: Formatted Raw JSON */
            <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-[11px] max-h-96 overflow-y-auto leading-relaxed border border-slate-800">
              <pre>
                {JSON.stringify(
                  filteredVariables.reduce((acc, v) => ({ ...acc, [v.key]: v.value }), {}),
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
