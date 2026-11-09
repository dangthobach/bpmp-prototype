import React, { useState } from 'react';
import { 
  ClientRequest, 
  ServiceItem, 
  ClientPersona, 
  ClientRequestStatus,
  ProcessVariableEntry
} from '../../types/clientPortal';
import { 
  ProcessDefinition, 
  ProcessInstance 
} from '../../types/bpm';
import { 
  CLIENT_PERSONAS, 
  SERVICE_CATALOG, 
  INITIAL_CLIENT_REQUESTS 
} from '../../data/mockClientPortalData';
import { INITIAL_PROCESS_DEFINITIONS } from '../../data/mockBpmData';
import { 
  Building2, 
  FileText, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Download, 
  Send, 
  User, 
  ChevronRight, 
  ChevronLeft,
  Plus, 
  DollarSign, 
  ArrowRight, 
  Eye, 
  MessageSquare, 
  CheckSquare, 
  Calendar, 
  Phone, 
  Mail, 
  Filter, 
  FileCheck, 
  ArrowUpRight, 
  RefreshCw, 
  X, 
  Maximize2,
  Minimize2, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  CreditCard, 
  Layers, 
  AlertTriangle,
  FolderOpen,
  CornerDownRight,
  Printer,
  Code,
  Copy,
  Check,
  Sliders,
  Settings2,
  Database,
  Play,
  FileSpreadsheet,
  Map,
  Activity,
  GitBranch
} from 'lucide-react';
import { EmbeddedProcessViewer } from './EmbeddedProcessViewer';
import { PortalMetricsDashboard } from './PortalMetricsDashboard';

interface ClientPortalModuleProps {
  onNotify?: (msg: string) => void;
  onOpenAdminConsole?: () => void;
  processes?: ProcessDefinition[];
  onProcessInstanceCreated?: (instance: ProcessInstance) => void;
}

type PortalTab = 'dashboard' | 'new-request' | 'my-requests' | 'officer-desk' | 'tracking-lookup' | 'metrics-dashboard';

export const ClientPortalModule: React.FC<ClientPortalModuleProps> = ({
  onNotify,
  onOpenAdminConsole,
  processes = INITIAL_PROCESS_DEFINITIONS,
  onProcessInstanceCreated,
}) => {
  const availableProcesses = (processes && processes.length > 0) ? processes : INITIAL_PROCESS_DEFINITIONS;
  const [activeTab, setActiveTab] = useState<PortalTab>('dashboard');
  const [currentPersona, setCurrentPersona] = useState<ClientPersona>(CLIENT_PERSONAS[0]);
  const [requests, setRequests] = useState<ClientRequest[]>(INITIAL_CLIENT_REQUESTS);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('req_001');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Request Details Sub-tabs (Embedded BPMN vs Docs vs Comments vs Stepper)
  const [requestDetailTab, setRequestDetailTab] = useState<'embedded-bpmn' | 'documents' | 'comments' | 'stepper'>('embedded-bpmn');
  const [lookupShowEmbedded, setLookupShowEmbedded] = useState<boolean>(true);

  // Enhanced New Request Wizard State
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedProcessKey, setSelectedProcessKey] = useState<string>('SDD');
  const [businessKey, setBusinessKey] = useState<string>('SDD-2026-00892');
  const [branchCode, setBranchCode] = useState<string>('CN_HOAN_KIEM');
  const [newRequestService, setNewRequestService] = useState<string>('SDD_LOAN');

  // Customer Identity
  const [newCustomerName, setNewCustomerName] = useState<string>(currentPersona.name);
  const [newCustomerOrg, setNewCustomerOrg] = useState<string>(currentPersona.org);
  const [newCustomerTaxId, setNewCustomerTaxId] = useState<string>('0108992211');
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>(currentPersona.phone);
  const [newCustomerEmail, setNewCustomerEmail] = useState<string>(currentPersona.email);

  // Core Financial Variables
  const [newAmount, setNewAmount] = useState<number>(2500000000);
  const [newTermMonths, setNewTermMonths] = useState<number>(6);
  const [newPurpose, setNewPurpose] = useState<string>('Bổ sung vốn lưu động thực hiện hợp đồng cung cấp thiết bị tin học quý 4/2026');

  // Process-Specific Variables (SDD Disbursement)
  const [disbursementMethod, setDisbursementMethod] = useState<string>('TRANSFER');
  const [beneficiaryAccount, setBeneficiaryAccount] = useState<string>('0451000389882');
  const [beneficiaryBank, setBeneficiaryBank] = useState<string>('Vietcombank - CN Sở Giao Dịch');
  const [contractInvoiceNumber, setContractInvoiceNumber] = useState<string>('HĐKT-2026/89-VT');
  const [collateralType, setCollateralType] = useState<string>('Bất động sản & Hàng tồn kho');

  // Process-Specific Variables (NCLOS Credit Appraisal)
  const [requestedLimit, setRequestedLimit] = useState<number>(5000000000);
  const [riskAppraisalMode, setRiskAppraisalMode] = useState<string>('STANDARD');
  const [collateralValue, setCollateralValue] = useState<number>(8000000000);
  const [annualRevenue, setAnnualRevenue] = useState<number>(15000000000);
  const [cicTargetScore, setCicTargetScore] = useState<string>('Hạng 1 - Tốt (Score: 685)');

  // Dynamic Custom Engine Variables (Camunda/Flowable context)
  const [customVariables, setCustomVariables] = useState<ProcessVariableEntry[]>([
    { key: 'autoExecuteBRMS', type: 'boolean', value: 'true', description: 'Tự động kiểm tra quy tắc rủi ro qua Camunda DMN / BRMS' },
    { key: 'priorityLevel', type: 'string', value: 'HIGH', description: 'Mức độ ưu tiên xếp hàng phân bổ Tasklist' },
    { key: 'notifyChannel', type: 'string', value: 'SMS_AND_EMAIL', description: 'Kênh thông báo kết quả tức thì cho khách hàng' },
    { key: 'requireFieldAudit', type: 'boolean', value: 'false', description: 'Yêu cầu cán bộ thực địa trước khi ký quyết định' },
  ]);

  // Inline Add Dynamic Variable state
  const [showAddVarRow, setShowAddVarRow] = useState<boolean>(false);
  const [newVarKey, setNewVarKey] = useState<string>('');
  const [newVarType, setNewVarType] = useState<'string' | 'number' | 'boolean' | 'json'>('string');
  const [newVarVal, setNewVarVal] = useState<string>('');
  const [newVarDesc, setNewVarDesc] = useState<string>('');

  // Step 4 Review & Payload state
  const [payloadViewMode, setPayloadViewMode] = useState<'table' | 'json'>('json');
  const [jsonCopied, setJsonCopied] = useState<boolean>(false);

  // Uploaded Dossier Documents
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; type: string; requiredKey?: string }>>([
    { name: 'Giay_De_Nghi_Vay_Von_Signed.pdf', size: '2.1 MB', type: 'Giấy đề nghị giải ngân', requiredKey: 'doc_request' },
    { name: 'HopDong_KinhTe_DauVao_2026.pdf', size: '4.5 MB', type: 'Hợp đồng kinh tế đầu vào', requiredKey: 'doc_contract' },
    { name: 'Hoa_Don_VAT_77189_BanChuan_CQT.pdf', size: '1.4 MB', type: 'Hóa đơn GTGT điện tử', requiredKey: 'doc_invoice' }
  ]);
  const [eSignAccepted, setESignAccepted] = useState<boolean>(true);

  // Additional Docs Modal State (for client when status is ADDITIONAL_DOCS_REQUIRED)
  const [showAddDocsModal, setShowAddDocsModal] = useState<boolean>(false);
  const [addDocFileName, setAddDocFileName] = useState<string>('Hoa_Don_VAT_77189_BanChuan_CQT.pdf');
  const [addDocNotes, setAddDocNotes] = useState<string>('Gửi lại bản hóa đơn điện tử có đầy đủ mã xác thực cơ quan thuế và biên bản giao nhận hàng.');

  // Officer Action Modal State (for officer review)
  const [showOfficerActionModal, setShowOfficerActionModal] = useState<boolean>(false);
  const [officerDecision, setOfficerDecision] = useState<'APPROVE' | 'REQUEST_DOCS' | 'REJECT'>('APPROVE');
  const [officerReason, setOfficerReason] = useState<string>('Hồ sơ hợp lệ, đủ điều kiện tiến hành phê duyệt theo quy trình.');

  // Lookup Code State
  const [lookupQuery, setLookupQuery] = useState<string>('HS-2026-0891');
  const [lookupResult, setLookupResult] = useState<ClientRequest | null>(null);

  // New Comment Input
  const [newCommentText, setNewCommentText] = useState<string>('');

  const showToast = (msg: string) => {
    if (onNotify) {
      onNotify(msg);
    }
  };

  const selectedRequest = requests.find(r => r.id === selectedRequestId) || requests[0];

  // Switch persona helper
  const handlePersonaChange = (personaId: string) => {
    const p = CLIENT_PERSONAS.find(item => item.id === personaId);
    if (p) {
      setCurrentPersona(p);
      setNewCustomerName(p.name);
      setNewCustomerOrg(p.org);
      setNewCustomerPhone(p.phone);
      setNewCustomerEmail(p.email);
      showToast(`Đã chuyển đổi người dùng sang: ${p.name} (${p.title})`);
    }
  };

  // Status Badge Helper
  const getStatusDisplay = (status: ClientRequestStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return {
          label: 'Đã Tiếp Nhận',
          bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
        };
      case 'IN_REVIEW':
        return {
          label: 'Đang Thẩm Định',
          bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
        };
      case 'ADDITIONAL_DOCS_REQUIRED':
        return {
          label: 'Cần Bổ Sung Hồ Sơ',
          bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
        };
      case 'APPROVED':
        return {
          label: 'Đã Phê Duyệt',
          bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
        };
      case 'DISBURSED':
        return {
          label: 'Đã Giải Ngân Thành Công',
          bg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-900',
        };
      case 'REJECTED':
        return {
          label: 'Từ Chối Hồ Sơ',
          bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-100 text-slate-700',
        };
    }
  };

  // Format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const currentProcessDef = availableProcesses.find(p => p.key === selectedProcessKey) || availableProcesses[0];

  const handleSelectProcess = (key: string) => {
    setSelectedProcessKey(key);
    const proc = availableProcesses.find(p => p.key === key);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generatedKey = `${key}-2026-0${randomSuffix}`;
    setBusinessKey(generatedKey);
    if (proc) {
      showToast(`Đã chọn quy trình: ${proc.name} (${proc.key})`);
    }
  };

  const handleGenerateBusinessKey = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const generatedKey = `${selectedProcessKey}-2026-0${randomSuffix}`;
    setBusinessKey(generatedKey);
    showToast(`Đã tạo mã Business Key mới: ${generatedKey}`);
  };

  const handleAddCustomVariable = () => {
    if (!newVarKey.trim()) {
      showToast('Vui lòng nhập tên biến (Key)!');
      return;
    }
    const cleanKey = newVarKey.trim().replace(/\s+/g, '_');
    if (customVariables.some(v => v.key === cleanKey)) {
      showToast(`Biến "${cleanKey}" đã tồn tại!`);
      return;
    }
    setCustomVariables(prev => [
      ...prev,
      {
        key: cleanKey,
        type: newVarType,
        value: newVarVal || (newVarType === 'boolean' ? 'false' : newVarType === 'number' ? '0' : ''),
        description: newVarDesc.trim() || 'Biến nghiệp vụ tự định nghĩa'
      }
    ]);
    setNewVarKey('');
    setNewVarVal('');
    setNewVarDesc('');
    setShowAddVarRow(false);
    showToast(`Đã thêm biến "${cleanKey}" vào Engine context!`);
  };

  const handleRemoveCustomVariable = (keyToRemove: string) => {
    setCustomVariables(prev => prev.filter(v => v.key !== keyToRemove));
    showToast(`Đã xóa biến "${keyToRemove}" khỏi Engine context!`);
  };

  const handleResetCustomVariables = () => {
    setCustomVariables([
      { key: 'autoExecuteBRMS', type: 'boolean', value: 'true', description: 'Tự động kiểm tra quy tắc rủi ro qua Camunda DMN / BRMS' },
      { key: 'priorityLevel', type: 'string', value: 'HIGH', description: 'Mức độ ưu tiên xếp hàng phân bổ Tasklist' },
      { key: 'notifyChannel', type: 'string', value: 'SMS_AND_EMAIL', description: 'Kênh thông báo kết quả tức thì cho khách hàng' },
      { key: 'requireFieldAudit', type: 'boolean', value: 'false', description: 'Yêu cầu cán bộ thực địa trước khi ký quyết định' },
    ]);
    showToast('Đã khôi phục các biến mặc định!');
  };

  // Build full JSON payload for Camunda / Flowable
  const buildEnginePayload = () => {
    const vars: Record<string, any> = {
      amount: newAmount,
      currency: 'VNĐ',
      termMonths: newTermMonths,
      customerName: newCustomerName,
      customerOrg: newCustomerOrg,
      customerTaxId: newCustomerTaxId,
      customerPhone: newCustomerPhone,
      customerEmail: newCustomerEmail,
      branch: branchCode === 'CN_HOAN_KIEM' ? 'Chi nhánh Hoàn Kiếm' : branchCode === 'CN_DONG_DA' ? 'Chi nhánh Đống Đa' : branchCode === 'CN_THANG_LONG' ? 'Chi nhánh Thăng Long' : 'Hội sở chính',
      purpose: newPurpose,
    };

    if (selectedProcessKey === 'SDD') {
      vars.disbursementMethod = disbursementMethod;
      vars.beneficiaryAccount = beneficiaryAccount;
      vars.beneficiaryBank = beneficiaryBank;
      vars.contractInvoiceNumber = contractInvoiceNumber;
      vars.collateralType = collateralType;
    } else if (selectedProcessKey === 'NCLOS') {
      vars.requestedLimit = requestedLimit;
      vars.riskAppraisalMode = riskAppraisalMode;
      vars.collateralValue = collateralValue;
      vars.annualRevenue = annualRevenue;
      vars.cicTargetScore = cicTargetScore;
    }

    customVariables.forEach(v => {
      if (v.type === 'number') {
        vars[v.key] = Number(v.value) || 0;
      } else if (v.type === 'boolean') {
        vars[v.key] = v.value.toLowerCase() === 'true';
      } else if (v.type === 'json') {
        try {
          vars[v.key] = JSON.parse(v.value);
        } catch {
          vars[v.key] = v.value;
        }
      } else {
        vars[v.key] = v.value;
      }
    });

    return {
      processDefinitionKey: currentProcessDef.key,
      processDefinitionVersion: currentProcessDef.version,
      engine: currentProcessDef.engine,
      businessKey: businessKey || `${currentProcessDef.key}-2026-0001`,
      initiator: currentPersona.name,
      initiatorRole: currentPersona.title,
      submittedAt: new Date().toISOString(),
      variables: vars,
      documentsCount: uploadedFiles.length,
    };
  };

  // Handle Submit New Request
  const handleSubmitNewRequest = () => {
    const payload = buildEnginePayload();
    const newCode = businessKey || `HS-2026-0${Math.floor(100 + Math.random() * 900)}`;

    const newReq: ClientRequest = {
      id: `req_${Date.now()}`,
      trackingCode: newCode,
      serviceKey: currentProcessDef.key,
      serviceName: currentProcessDef.name,
      category: currentProcessDef.category || 'Banking',
      customerName: newCustomerName,
      customerOrg: newCustomerOrg,
      customerTaxId: newCustomerTaxId,
      customerPhone: newCustomerPhone,
      customerEmail: newCustomerEmail,
      amount: newAmount,
      currency: 'VNĐ',
      termMonths: newTermMonths,
      purpose: newPurpose,
      status: 'SUBMITTED',
      createdAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
      updatedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
      assignedOfficer: 'Phòng Khách Hàng Doanh Nghiệp (BPM Tự Động Phân Bổ)',
      currentStepName: currentProcessDef.nodes.find(n => n.type === 'userTask')?.name || 'TIEP NHAN HO SO TRUC TUYEN',
      slaDeadline: 'Sau 48 giờ làm việc',
      processKey: currentProcessDef.key,
      branch: branchCode === 'CN_HOAN_KIEM' ? 'Chi nhánh Hoàn Kiếm' : branchCode === 'CN_DONG_DA' ? 'Chi nhánh Đống Đa' : branchCode === 'CN_THANG_LONG' ? 'Chi nhánh Thăng Long' : 'Hội sở chính',
      variables: payload.variables,
      steps: [
        {
          id: 'st_1',
          name: 'Nộp hồ sơ trực tuyến & Ký số e-Sign',
          role: 'Khách hàng',
          status: 'COMPLETED',
          updatedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
          handlerName: currentPersona.name,
          notes: `Đã nộp thành công vào quy trình ${currentProcessDef.name} (${currentProcessDef.engine} Engine).`
        },
        {
          id: 'st_2',
          name: currentProcessDef.nodes.find(n => n.type === 'userTask')?.name || 'Cán bộ RM tiếp nhận',
          role: currentProcessDef.nodes.find(n => n.type === 'userTask')?.assigneeRole || 'NCLOS SALE',
          status: 'IN_PROGRESS',
          handlerName: 'Phòng Tín Dụng SME',
          notes: 'BPM Engine đang chờ cán bộ nhận việc (Claim).'
        },
        {
          id: 'st_3',
          name: 'Thẩm định rủi ro & Chấm điểm tín dụng',
          role: 'NCLOS B KS2',
          status: 'PENDING'
        },
        {
          id: 'st_4',
          name: 'Phê duyệt cấp hạn mức / Quyết định giải ngân',
          role: 'NCLOS ADMIN',
          status: 'PENDING'
        }
      ],
      documents: uploadedFiles.map((f, i) => ({
        id: `d_up_${i}_${Date.now()}`,
        name: f.type,
        category: 'PURPOSE',
        fileName: f.name,
        fileSize: f.size,
        uploadedAt: new Date().toLocaleDateString('vi-VN'),
        status: 'VERIFIED',
        isRequired: true,
      })),
      comments: [
        {
          id: `c_${Date.now()}`,
          author: currentPersona.name,
          authorRole: currentPersona.title,
          createdAt: new Date().toLocaleTimeString('vi-VN'),
          content: `Khách hàng đã hoàn tất nộp hồ sơ ${newCode} với ${uploadedFiles.length} tài liệu đính kèm. Kính gửi ngân hàng thẩm định.`,
          isStaff: false
        }
      ]
    };

    // Create ProcessInstance for BPM Engine
    const newInstance: ProcessInstance = {
      id: `inst_${Date.now()}`,
      processKey: currentProcessDef.key,
      processName: currentProcessDef.name,
      recordCode: newCode,
      currentStep: currentProcessDef.nodes.find(n => n.type === 'userTask')?.name || 'TIEP NHAN HO SO',
      name: newCustomerOrg || newCustomerName,
      status: 'ACTIVATED',
      startedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
      version: currentProcessDef.version,
      createdBy: currentPersona.name,
      amount: formatVND(newAmount),
      branch: branchCode === 'CN_HOAN_KIEM' ? 'Chi nhánh Hoàn Kiếm' : branchCode === 'CN_DONG_DA' ? 'Chi nhánh Đống Đa' : branchCode === 'CN_THANG_LONG' ? 'Chi nhánh Thăng Long' : 'Hội sở chính',
      activeNodeId: currentProcessDef.nodes.find(n => n.type === 'userTask')?.id || 'task_tiepnhan',
    };

    if (onProcessInstanceCreated) {
      onProcessInstanceCreated(newInstance);
    }

    setRequests([newReq, ...requests]);
    setSelectedRequestId(newReq.id);
    setActiveTab('my-requests');
    setWizardStep(1);
    showToast(`Khởi tạo thành công hồ sơ ${newCode} trên quy trình ${currentProcessDef.name}! Tiến trình BPM đã kích hoạt.`);
  };

  // Handle Client Add Documents
  const handleClientAddDocs = () => {
    if (!addDocFileName) return;
    setRequests(prev => prev.map(r => {
      if (r.id === selectedRequestId) {
        const newDoc = {
          id: `doc_${Date.now()}`,
          name: 'Hồ sơ bổ sung đợt 2',
          category: 'PURPOSE' as const,
          fileName: addDocFileName,
          fileSize: '1.4 MB',
          uploadedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
          status: 'PENDING' as const,
          isRequired: true,
          notes: addDocNotes
        };
        const newComment = {
          id: `c_${Date.now()}`,
          author: currentPersona.name,
          authorRole: currentPersona.title,
          createdAt: new Date().toLocaleTimeString('vi-VN'),
          content: `Khách hàng đã tải lên tài liệu bổ sung: "${addDocFileName}". Ghi chú: ${addDocNotes}`,
          isStaff: false
        };
        return {
          ...r,
          status: 'IN_REVIEW' as ClientRequestStatus,
          currentStepName: 'CAN BO RUA SOAT HO SO BO SUNG',
          documents: [...r.documents, newDoc],
          comments: [...r.comments, newComment],
          updatedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
        };
      }
      return r;
    }));
    setShowAddDocsModal(false);
    showToast(`Đã bổ sung tài liệu cho hồ sơ ${selectedRequest.trackingCode} thành công!`);
  };

  // Handle Officer Decision
  const handleOfficerDecisionSubmit = () => {
    setRequests(prev => prev.map(r => {
      if (r.id === selectedRequestId) {
        let nextStatus: ClientRequestStatus = 'IN_REVIEW';
        let stepName = r.currentStepName;
        if (officerDecision === 'APPROVE') {
          nextStatus = 'APPROVED';
          stepName = 'HOAN THANH PHE DUYET';
        } else if (officerDecision === 'REQUEST_DOCS') {
          nextStatus = 'ADDITIONAL_DOCS_REQUIRED';
          stepName = 'CHO BO SUNG HO SO TU FRONT END';
        } else {
          nextStatus = 'REJECTED';
          stepName = 'TU CHOI HO SO';
        }

        const newComment = {
          id: `c_off_${Date.now()}`,
          author: currentPersona.name,
          authorRole: currentPersona.title,
          createdAt: new Date().toLocaleTimeString('vi-VN'),
          content: `Cán bộ thẩm định: ${officerReason}`,
          isStaff: true
        };

        const updatedSteps = r.steps.map((st, idx) => {
          if (idx === 2) {
            return {
              ...st,
              status: officerDecision === 'APPROVE' ? 'COMPLETED' as const : officerDecision === 'REQUEST_DOCS' ? 'IN_PROGRESS' as const : 'REJECTED' as const,
              updatedAt: new Date().toLocaleDateString('vi-VN'),
              handlerName: currentPersona.name,
              notes: officerReason
            };
          }
          if (idx === 3 && officerDecision === 'APPROVE') {
            return {
              ...st,
              status: 'COMPLETED' as const,
              updatedAt: new Date().toLocaleDateString('vi-VN'),
              handlerName: 'LODV Phê Duyệt',
              notes: 'Đã ký quyết định phê duyệt tín dụng.'
            };
          }
          return st;
        });

        return {
          ...r,
          status: nextStatus,
          currentStepName: stepName,
          comments: [...r.comments, newComment],
          steps: updatedSteps,
          updatedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN')
        };
      }
      return r;
    }));

    setShowOfficerActionModal(false);
    showToast(`Đã cập nhật xử lý hồ sơ ${selectedRequest.trackingCode}: ${officerDecision}!`);
  };

  // Handle Send Comment
  const handleSendComment = () => {
    if (!newCommentText.trim()) return;
    const newComment = {
      id: `c_user_${Date.now()}`,
      author: currentPersona.name,
      authorRole: currentPersona.title,
      createdAt: new Date().toLocaleTimeString('vi-VN'),
      content: newCommentText.trim(),
      isStaff: currentPersona.type === 'ORG_OFFICER'
    };
    setRequests(prev => prev.map(r => {
      if (r.id === selectedRequestId) {
        return {
          ...r,
          comments: [...r.comments, newComment]
        };
      }
      return r;
    }));
    setNewCommentText('');
    showToast('Đã gửi phản hồi thành công!');
  };

  // Lookup helper (Support searching by trackingCode, processInstanceId, or request ID)
  const handlePerformLookup = () => {
    const q = lookupQuery.trim().toUpperCase();
    const found = requests.find(r => 
      r.trackingCode.toUpperCase() === q ||
      (r.processInstanceId && r.processInstanceId.toUpperCase() === q) ||
      r.id.toUpperCase() === q ||
      (r.customerTaxId && r.customerTaxId.toUpperCase() === q)
    );
    if (found) {
      setLookupResult(found);
      setSelectedRequestId(found.id);
      setLookupShowEmbedded(true);
      showToast(`Đã tìm thấy thông tin tiến trình BPM của hồ sơ ${found.trackingCode}!`);
    } else {
      setLookupResult(null);
      showToast(`Không tìm thấy hồ sơ với mã "${lookupQuery}". Vui lòng thử "HS-2026-0891" hoặc "inst_6755399"!`);
    }
  };

  // Filtered requests list
  const filteredRequests = requests.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        r.trackingCode.toLowerCase().includes(q) ||
        r.serviceName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerOrg.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate Metrics
  const totalCount = requests.length;
  const inReviewCount = requests.filter(r => r.status === 'IN_REVIEW' || r.status === 'SUBMITTED').length;
  const needDocsCount = requests.filter(r => r.status === 'ADDITIONAL_DOCS_REQUIRED').length;
  const completedCount = requests.filter(r => r.status === 'APPROVED' || r.status === 'DISBURSED').length;
  const totalAmount = requests.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70 dark:bg-slate-950 overflow-y-auto">
      {/* ==================================================== */}
      {/* TOP PORTAL BAR: Persona switcher & Workspace Toggle */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-3.5 flex items-center justify-between flex-wrap gap-4 sticky top-0 z-20 shadow-2xs">
        {/* Left branding & portal description */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Cổng Dịch Vụ Khách Hàng &amp; Nghiệp Vụ Doanh Nghiệp (Client &amp; Org Portal)
              </h2>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Self-Service &amp; Staff
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Khởi tạo hồ sơ vay, nộp giấy tờ, theo dõi hành trình thẩm định và phê duyệt trực tuyến.
            </p>
          </div>
        </div>

        {/* Right Persona Switcher & Admin Switch */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Persona Switcher Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-400 pl-1.5 text-[11px] font-medium flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Góc nhìn:</span>
            </span>
            <select
              value={currentPersona.id}
              onChange={(e) => handlePersonaChange(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {CLIENT_PERSONAS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type === 'ORG_OFFICER' ? 'Cán bộ RM' : p.type === 'CLIENT_SME' ? 'Khách hàng SME' : 'Cá nhân'})
                </option>
              ))}
            </select>
          </div>

          {/* Quick link to Admin Console */}
          {onOpenAdminConsole && (
            <button
              onClick={onOpenAdminConsole}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Chuyển sang bảng điều khiển quản trị Modeler, Operations, IAM"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bàn Quản Trị Admin / DevOps</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* PORTAL NAVIGATION TABS                               */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Tổng Quan (Dashboard)</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics-dashboard')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'metrics-dashboard'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đo Lường &amp; Hiệu Năng (Metrics)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </button>

          <button
            onClick={() => {
              setActiveTab('new-request');
              setWizardStep(1);
            }}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'new-request'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nộp Hồ Sơ Mới (New Request)</span>
          </button>

          <button
            onClick={() => setActiveTab('my-requests')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'my-requests'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Theo Dõi Hồ Sơ &amp; Tiến Độ ({requests.length})</span>
            {needDocsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('officer-desk')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'officer-desk'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Bàn Xử Lý Cán Bộ Nghiệp Vụ (Staff Desk)</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking-lookup')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tracking-lookup'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Tra Cứu Mã Hồ Sơ &amp; Biểu Mẫu</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MAIN PORTAL BODY                                     */}
      {/* ==================================================== */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* ==================================================== */}
        {/* VIEW 0: REAL-TIME PROCESS METRICS DASHBOARD (RECHARTS)*/}
        {/* ==================================================== */}
        {activeTab === 'metrics-dashboard' && (
          <PortalMetricsDashboard
            requests={requests}
            onNavigateTab={setActiveTab}
            onFilterStatus={(st) => {
              setStatusFilter(st);
              setActiveTab('my-requests');
            }}
            onSelectRequest={(id) => {
              setSelectedRequestId(id);
              setActiveTab('my-requests');
            }}
            onNotify={showToast}
          />
        )}

        {/* ==================================================== */}
        {/* VIEW 1: PORTAL DASHBOARD                             */}
        {/* ==================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome banner with Current Persona */}
            <div className="p-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-800 text-white rounded-2xl shadow-sm flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider block">
                  Không gian làm việc khách hàng &amp; đối tác
                </span>
                <h3 className="text-xl font-bold">
                  Xin chào, {currentPersona.name}!
                </h3>
                <p className="text-xs text-slate-200 max-w-xl">
                  {currentPersona.org} · {currentPersona.title}. Bạn có thể theo dõi tiến độ phê duyệt hồ sơ tín dụng, bổ sung tài liệu trực tuyến hoặc nộp đề nghị giải ngân nhanh chóng.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setActiveTab('metrics-dashboard')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/30 hover:bg-emerald-500/50 text-white border border-emerald-400/40 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-emerald-300" />
                  <span>Hiệu Năng &amp; Thống Kê</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('new-request');
                    setWizardStep(1);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Khởi Tạo Hồ Sơ Ngay</span>
                </button>
                <button
                  onClick={() => setActiveTab('my-requests')}
                  className="flex items-center gap-2 px-3.5 py-2 bg-emerald-800/60 hover:bg-emerald-800 text-white border border-emerald-500/40 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>Xem Hồ Sơ ({requests.length})</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                onClick={() => {
                  setStatusFilter('ALL');
                  setActiveTab('my-requests');
                }}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-2xs hover:border-emerald-400 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Tổng Hồ Sơ Của Tôi</span>
                  <FileText className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {totalCount}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Tổng số hồ sơ trong hệ thống
                </span>
              </div>

              <div 
                onClick={() => {
                  setStatusFilter('IN_REVIEW');
                  setActiveTab('my-requests');
                }}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-2xs hover:border-amber-400 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Đang Thẩm Định</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                  {inReviewCount}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Đang trong luồng phê duyệt
                </span>
              </div>

              <div 
                onClick={() => {
                  setStatusFilter('ADDITIONAL_DOCS_REQUIRED');
                  setActiveTab('my-requests');
                }}
                className={`p-4 bg-white dark:bg-slate-900 border rounded-xl shadow-2xs cursor-pointer transition-all ${
                  needDocsCount > 0 ? 'border-rose-400 ring-2 ring-rose-500/10' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Cần Bổ Sung Tài Liệu</span>
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                  {needDocsCount}
                </div>
                <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 block">
                  {needDocsCount > 0 ? 'Cần hành động ngay từ bạn' : 'Không có yêu cầu tồn đọng'}
                </span>
              </div>

              <div 
                onClick={() => {
                  setStatusFilter('APPROVED');
                  setActiveTab('my-requests');
                }}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-2xs hover:border-teal-400 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>Tổng Hạn Mức Giải Ngân</span>
                  <DollarSign className="w-4 h-4 text-teal-500" />
                </div>
                <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 truncate">
                  {formatVND(totalAmount)}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {completedCount} hồ sơ đã hoàn tất
                </span>
              </div>
            </div>

            {/* Recent Requests Section with Timeline preview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Hồ Sơ Đang Xử Lý Gần Đây
                  </h4>
                  <p className="text-xs text-slate-500">
                    Theo dõi trạng thái thời gian thực và thời hạn cam kết SLA.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('my-requests')}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem toàn bộ ({requests.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Mã Hồ Sơ</th>
                      <th className="py-2.5 px-3">Loại Dịch Vụ</th>
                      <th className="py-2.5 px-3">Số Tiền Đề Xuất</th>
                      <th className="py-2.5 px-3">Bước Xử Lý Hiện Tại</th>
                      <th className="py-2.5 px-3">Trạng Thái</th>
                      <th className="py-2.5 px-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {requests.slice(0, 3).map(req => {
                      const statusUi = getStatusDisplay(req.status);
                      return (
                        <tr 
                          key={req.id} 
                          onClick={() => {
                            setSelectedRequestId(req.id);
                            setActiveTab('my-requests');
                          }}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {req.trackingCode}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {req.serviceName}
                            </span>
                            <span className="text-[10.5px] text-slate-400">
                              Tạo ngày: {req.createdAt}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                            {formatVND(req.amount)}
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-slate-700 dark:text-slate-300 font-medium block">
                              {req.currentStepName}
                            </span>
                            <span className="text-[10.5px] text-slate-400">
                              Phụ trách: {req.assignedOfficer}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${statusUi.bg}`}>
                              {statusUi.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRequestId(req.id);
                                setActiveTab('my-requests');
                              }}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-700 rounded-lg text-xs font-semibold cursor-pointer border border-slate-200 dark:border-slate-700 transition-colors"
                            >
                              Chi Tiết
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Service Catalog Showcase */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Danh Mục Dịch Vụ Trực Tuyến Hỗ Trợ Doanh Nghiệp
                  </h4>
                  <p className="text-xs text-slate-500">
                    Chọn dịch vụ phù hợp để khởi tạo hồ sơ vay vốn hoặc đề nghị tài trợ trực tuyến.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SERVICE_CATALOG.map(svc => (
                  <div
                    key={svc.key}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-2xs space-y-3 hover:border-emerald-500 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {svc.category}
                        </span>
                        {svc.isPopular && (
                          <span className="text-[9.5px] font-bold font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Phổ Biến
                          </span>
                        )}
                      </div>

                      <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {svc.name}
                      </h5>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {svc.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Hạn mức: <strong className="text-slate-800 dark:text-slate-200">{svc.maxAmountText}</strong></span>
                        <span>SLA: <strong className="text-slate-800 dark:text-slate-200">{svc.estimatedDays} ngày</strong></span>
                      </div>

                      <button
                        onClick={() => {
                          const targetKey = svc.processKey === 'SDD' ? 'SDD' : 'NCLOS';
                          handleSelectProcess(targetKey);
                          setNewRequestService(svc.key);
                          setActiveTab('new-request');
                          setWizardStep(1);
                        }}
                        className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white dark:bg-emerald-950/40 dark:hover:bg-emerald-600 dark:text-emerald-300 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5"
                      >
                        <span>Nộp Hồ Sơ Ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 2: NEW REQUEST WIZARD (MULTI-STEP PROCESS BPM)  */}
        {/* ==================================================== */}
        {activeTab === 'new-request' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
            {/* Wizard Header with 4-Step Stepper */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Khởi Tạo Hồ Sơ Trực Tuyến &amp; Kích Hoạt Quy Trình BPM
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lựa chọn định nghĩa quy trình BPMN, nhập biến ngữ cảnh (Process Variables), đính kèm chứng từ và kích hoạt tiến trình tự động.
                </p>
              </div>

              {/* Wizard Step Indicator with labels */}
              <div className="flex items-center gap-2 text-xs font-medium overflow-x-auto no-scrollbar">
                {[
                  { step: 1, label: '1. Quy Trình & Khách Hàng' },
                  { step: 2, label: '2. Biến & Tham Số BPM' },
                  { step: 3, label: '3. Hồ Sơ Đính Kèm' },
                  { step: 4, label: '4. Rà Soát & Ký Số' },
                ].map(item => (
                  <div key={item.step} className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setWizardStep(item.step)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        wizardStep === item.step
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : wizardStep > item.step
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                        {item.step}
                      </span>
                      <span>{item.label}</span>
                    </button>
                    {item.step < 4 && <span className="w-3 h-0.5 bg-slate-200 dark:bg-slate-700" />}
                  </div>
                ))}
              </div>
            </div>

            {/* ==================================================== */}
            {/* STEP 1: Select Process Definition & Customer Identity*/}
            {/* ==================================================== */}
            {wizardStep === 1 && (
              <div className="space-y-6 text-xs animate-in fade-in duration-150">
                {/* 1.1 Process Definition Selection Cards */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-emerald-600" />
                        <span>Bước 1.1: Chọn Định Nghĩa Quy Trình BPMN (Process Definition)</span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        Chọn quy trình triển khai trên Camunda 8 hoặc Flowable 7 để làm việc và ánh xạ hồ sơ nghiệp vụ.
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {availableProcesses.length} quy trình khả dụng
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {availableProcesses.map(proc => {
                      const isSelected = selectedProcessKey === proc.key;
                      return (
                        <div
                          key={proc.id}
                          onClick={() => handleSelectProcess(proc.key)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                            isSelected
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                {proc.key}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {proc.engine}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                v{proc.version}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                · {proc.category}
                              </span>
                            </div>

                            <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {proc.name}
                            </h5>
                            <p className="text-[11px] text-slate-500 line-clamp-2">
                              {proc.description}
                            </p>
                          </div>

                          <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Quy mô: <strong>{proc.nodes.length} nodes</strong></span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              {isSelected ? 'Đang chọn' : 'Nhấp để chọn'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 1.2 Business Key & Branch Selector */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Định Danh Hồ Sơ (Business Key) &amp; Chi Nhánh Tiếp Nhận
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                          Mã Nghiệp Vụ / Business Key (Duy nhất trong BPM):
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateBusinessKey}
                          className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Tạo mã tự động</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={businessKey}
                        onChange={(e) => setBusinessKey(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="VD: SDD-2026-00429"
                      />
                      <span className="text-[10.5px] text-slate-400 block">
                        Business Key dùng để liên kết hồ sơ trên Camunda/Flowable và tra cứu SLA xuyên suốt.
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Chi nhánh / Đơn vị thẩm định tín dụng:
                      </label>
                      <select
                        value={branchCode}
                        onChange={(e) => setBranchCode(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                      >
                        <option value="CN_HOAN_KIEM">Chi nhánh Hoàn Kiếm (Phòng Khách Hàng Doanh Nghiệp)</option>
                        <option value="CN_DONG_DA">Chi nhánh Đống Đa (Trung tâm Tín dụng SME)</option>
                        <option value="CN_THANG_LONG">Chi nhánh Thăng Long (Khối KHDN Lớn)</option>
                        <option value="HO_BPM">Hội sở chính - Khối Quản lý Tín dụng Tập trung</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 1.3 Customer / Organization Identity */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Bước 1.2: Định Danh Khách Hàng / Đơn Vị Đề Nghị</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Tên Doanh Nghiệp / Tổ Chức Đề Nghị:
                      </label>
                      <input
                        type="text"
                        value={newCustomerOrg}
                        onChange={(e) => setNewCustomerOrg(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
                        placeholder="Công ty TNHH..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Mã Số Doanh Nghiệp / Mã Số Thuế:
                      </label>
                      <input
                        type="text"
                        value={newCustomerTaxId}
                        onChange={(e) => setNewCustomerTaxId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Người đại diện theo pháp luật / Người nộp hồ sơ:
                      </label>
                      <input
                        type="text"
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Số điện thoại liên hệ:
                      </label>
                      <input
                        type="text"
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Email nhận thông báo phê duyệt &amp; ký kết hợp đồng:
                      </label>
                      <input
                        type="email"
                        value={newCustomerEmail}
                        onChange={(e) => setNewCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Next Button */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400">
                    Quy trình đã chọn: <strong>{currentProcessDef.name}</strong> ({currentProcessDef.engine})
                  </span>
                  <button
                    onClick={() => setWizardStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Tiếp tục: Nhập Biến Quy Trình</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* STEP 2: Input Core & Process-Specific Variables       */}
            {/* ==================================================== */}
            {wizardStep === 2 && (
              <div className="space-y-6 text-xs animate-in fade-in duration-150">
                {/* Process Context Ribbon */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded">
                      {currentProcessDef.key}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">
                      {currentProcessDef.name}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      · Động cơ: {currentProcessDef.engine} · Version: v{currentProcessDef.version}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                    Business Key: <strong>{businessKey}</strong>
                  </span>
                </div>

                {/* 2.1 Core Financial Variables */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>2.1: Biến Tài Chính Cốt Lõi (Core Financial Variables)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Số tiền đề nghị vay / giải ngân (VNĐ):
                      </label>
                      <input
                        type="number"
                        step={50000000}
                        value={newAmount}
                        onChange={(e) => setNewAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 text-base"
                      />
                      <span className="text-[11px] text-slate-500 font-mono">
                        Bằng chữ: <strong>{formatVND(newAmount)}</strong>
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Thời hạn vay / chu kỳ tài trợ (tháng):
                      </label>
                      <select
                        value={newTermMonths}
                        onChange={(e) => setNewTermMonths(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                      >
                        <option value={3}>3 tháng (Ngắn hạn lưu động)</option>
                        <option value={6}>6 tháng (Theo chu kỳ kinh doanh)</option>
                        <option value={9}>9 tháng (Tài trợ thương mại)</option>
                        <option value={12}>12 tháng (Hạn mức tín dụng năm)</option>
                        <option value={24}>24 tháng (Trung hạn mua sắm TSCĐ)</option>
                        <option value={36}>36 tháng (Đầu tư dự án)</option>
                      </select>
                      <span className="text-[10.5px] text-slate-400 block">
                        Thời hạn áp dụng để tính toán lãi suất và lập lịch trả nợ tự động trong BPM.
                      </span>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Mục đích sử dụng vốn chi tiết:
                      </label>
                      <textarea
                        rows={2}
                        value={newPurpose}
                        onChange={(e) => setNewPurpose(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        placeholder="Mô tả cụ thể mục đích thanh toán nhà cung cấp, mua nguyên vật liệu, thanh toán chi phí theo HĐKT..."
                      />
                    </div>
                  </div>
                </div>

                {/* 2.2 Process-Specific Variables */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-blue-500" />
                      <span>2.2: Biến Đặc Thù Của Quy Trình {selectedProcessKey}</span>
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      Context Schema: {selectedProcessKey}
                    </span>
                  </div>

                  {selectedProcessKey === 'SDD' ? (
                    /* SDD Specific Form Fields */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                          Phương thức giải ngân (disbursementMethod):
                        </label>
                        <select
                          value={disbursementMethod}
                          onChange={(e) => setDisbursementMethod(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                        >
                          <option value="TRANSFER">Chuyển khoản trực tiếp cho bên thụ hưởng / NCC</option>
                          <option value="CASH">Giải ngân tiền mặt tại quầy (theo quy định)</option>
                          <option value="LC">Phát hành thư tín dụng L/C trả chậm</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                          Số hợp đồng mua bán / Hóa đơn số:
                        </label>
                        <input
                          type="text"
                          value={contractInvoiceNumber}
                          onChange={(e) => setContractInvoiceNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                          placeholder="HĐKT-2026/..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                          Số tài khoản thụ hưởng (beneficiaryAccount):
                        </label>
                        <input
                          type="text"
                          value={beneficiaryAccount}
                          onChange={(e) => setBeneficiaryAccount(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                          Ngân hàng thụ hưởng (beneficiaryBank):
                        </label>
                        <input
                          type="text"
                          value={beneficiaryBank}
                          onChange={(e) => setBeneficiaryBank(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                          Loại tài sản bảo đảm thế chấp (collateralType):
                        </label>
                        <input
                          type="text"
                          value={collateralType}
                          onChange={(e) => setCollateralType(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ) : selectedProcessKey === 'NCLOS' ? (
                    /* NCLOS Specific Form Fields */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                          Hạn mức đề xuất cấp mới (requestedLimit):
                        </label>
                        <input
                          type="number"
                          step={100000000}
                          value={requestedLimit}
                          onChange={(e) => setRequestedLimit(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                          Luồng thẩm định rủi ro (riskAppraisalMode):
                        </label>
                        <select
                          value={riskAppraisalMode}
                          onChange={(e) => setRiskAppraisalMode(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                        >
                          <option value="STANDARD">Tiêu chuẩn (Standard Review - 2 vòng kiểm soát)</option>
                          <option value="GREEN_TRACK">Luồng nhanh Green-Track (Áp dụng DN có xếp hạng tốt)</option>
                          <option value="SPECIAL">Thẩm định thực địa phức hợp (Bao gồm khảo sát kho bãi)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                          Giá trị định giá tài sản bảo đảm ước tính (VNĐ):
                        </label>
                        <input
                          type="number"
                          step={100000000}
                          value={collateralValue}
                          onChange={(e) => setCollateralValue(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                          Doanh thu kiểm toán năm liền kề (annualRevenue):
                        </label>
                        <input
                          type="number"
                          step={100000000}
                          value={annualRevenue}
                          onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                          Xếp hạng tín dụng mục tiêu CIC (cicTargetScore):
                        </label>
                        <input
                          type="text"
                          value={cicTargetScore}
                          onChange={(e) => setCicTargetScore(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Generic / Custom Process */
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                      Quy trình <strong>{currentProcessDef.name}</strong> không yêu cầu trường đặc thù cố định. Bạn có thể định nghĩa các biến linh hoạt trong bảng Biến Động bên dưới.
                    </div>
                  )}
                </div>

                {/* 2.3 Dynamic Custom Process Variables Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Code className="w-4 h-4 text-emerald-600" />
                        <span>2.3: Bảng Biến Quy Trình Động (Camunda / Flowable Process Variables)</span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        Các biến định kiểu này được truyền vào Engine context để điều phối Gateway và chạy Decision Table (DMN).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetCustomVariables}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                      >
                        Khôi phục mặc định
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddVarRow(!showAddVarRow)}
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 rounded-lg text-xs font-semibold cursor-pointer border border-emerald-200 dark:border-emerald-800 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{showAddVarRow ? 'Đóng form' : '+ Thêm Biến Quy Trình'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Add Variable Form */}
                  {showAddVarRow && (
                    <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                          Thêm biến mới vào ngữ cảnh thực thi:
                        </span>
                        <button 
                          onClick={() => setShowAddVarRow(false)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <div className="sm:col-span-1 space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            Tên biến (Key):
                          </label>
                          <input
                            type="text"
                            placeholder="VD: maxDiscountPct"
                            value={newVarKey}
                            onChange={(e) => setNewVarKey(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                          />
                        </div>

                        <div className="sm:col-span-1 space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            Kiểu dữ liệu:
                          </label>
                          <select
                            value={newVarType}
                            onChange={(e) => setNewVarType(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                          >
                            <option value="string">string (Chuỗi ký tự)</option>
                            <option value="number">number (Số thực / nguyên)</option>
                            <option value="boolean">boolean (True / False)</option>
                            <option value="json">json (JSON Object)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-1 space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            Giá trị (Value):
                          </label>
                          <input
                            type="text"
                            placeholder="VD: true / 25 / value"
                            value={newVarVal}
                            onChange={(e) => setNewVarVal(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                          />
                        </div>

                        <div className="sm:col-span-1 space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            Mô tả mục đích:
                          </label>
                          <input
                            type="text"
                            placeholder="Mô tả ngắn..."
                            value={newVarDesc}
                            onChange={(e) => setNewVarDesc(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddVarRow(false)}
                          className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCustomVariable}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          Lưu Biến
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Variables Table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Tên Biến (Key)</th>
                          <th className="py-2.5 px-3">Kiểu (Type)</th>
                          <th className="py-2.5 px-3">Giá Trị (Value)</th>
                          <th className="py-2.5 px-3">Mục Đích Sử Dụng</th>
                          <th className="py-2.5 px-3 text-right">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {customVariables.map((v, idx) => (
                          <tr key={v.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                              {v.key}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {v.type}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              <input
                                type="text"
                                value={v.value}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  setCustomVariables(prev => prev.map((item, i) => i === idx ? { ...item, value: newVal } : item));
                                }}
                                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 rounded text-xs font-mono font-semibold"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                              {v.description}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomVariable(v.key)}
                                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                                title="Xóa biến này"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Navigation */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Quay lại: Chọn Quy Trình</span>
                  </button>

                  <button
                    onClick={() => setWizardStep(3)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Tiếp tục: Đính Kèm Hồ Sơ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* STEP 3: Documents Upload Checklist                   */}
            {/* ==================================================== */}
            {wizardStep === 3 && (
              <div className="space-y-6 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-emerald-600" />
                      <span>Bước 3: Danh Mục Hồ Sơ &amp; Tài Liệu Chứng Minh</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Tải lên các tài liệu theo quy định thẩm định của quy trình <strong>{currentProcessDef.name}</strong>.
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-500">Tiến độ hồ sơ:</span>
                    <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${Math.min(100, (uploadedFiles.length / 3) * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                      {uploadedFiles.length}/3 tệp
                    </span>
                  </div>
                </div>

                {/* Process-Specific Required Documents Checklist */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Danh mục chứng từ bắt buộc theo quy trình {selectedProcessKey}:</span>
                    <span className="text-[10.5px] text-slate-400 font-normal">Hỗ trợ PDF, DOCX, XLSX, JPG</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(selectedProcessKey === 'SDD' ? [
                      { key: 'doc_request', title: 'Giấy đề nghị giải ngân kiêm khế ước nhận nợ (Mẫu 01/GN-SME)', required: true },
                      { key: 'doc_contract', title: 'Hợp đồng kinh tế đầu vào / Đơn đặt hàng đã ký kết', required: true },
                      { key: 'doc_invoice', title: 'Hóa đơn GTGT điện tử hợp lệ (có mã xác thực CQT)', required: true },
                      { key: 'doc_acceptance', title: 'Biên bản nghiệm thu bàn giao / Bảng kê chi phí thực tế', required: false },
                    ] : [
                      { key: 'doc_legal', title: 'Hồ sơ pháp lý doanh nghiệp (GPĐKKD, Điều lệ, Biên bản họp HĐTV)', required: true },
                      { key: 'doc_financial', title: 'Báo cáo tài chính kiểm toán 02 năm gần nhất & Tờ khai VAT quý', required: true },
                      { key: 'doc_collateral', title: 'Hồ sơ tài sản bảo đảm (Giấy chứng nhận QSDĐ / Đăng ký phương tiện)', required: true },
                      { key: 'doc_business_plan', title: 'Phương án kinh doanh và phương án trả nợ vay vốn', required: true },
                    ]).map((reqDoc, idx) => {
                      const attachedFile = uploadedFiles.find(f => f.requiredKey === reqDoc.key || f.type.toLowerCase().includes(reqDoc.title.slice(0, 10).toLowerCase()));
                      return (
                        <div key={idx} className="p-3.5 flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-start gap-2.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              attachedFile ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                            }`}>
                              {attachedFile ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-[10px]">{idx + 1}</span>}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                  {reqDoc.title}
                                </span>
                                {reqDoc.required ? (
                                  <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                                    Bắt buộc
                                  </span>
                                ) : (
                                  <span className="text-[9.5px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                    Khuyến nghị
                                  </span>
                                )}
                              </div>
                              {attachedFile ? (
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                                  ✓ Đã đính kèm: {attachedFile.name} ({attachedFile.size})
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 mt-0.5 block">
                                  Chưa có tệp đính kèm
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            {attachedFile ? (
                              <button
                                type="button"
                                onClick={() => setUploadedFiles(prev => prev.filter(f => f !== attachedFile))}
                                className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-semibold cursor-pointer border border-rose-200 dark:border-rose-900"
                              >
                                Gỡ bỏ
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setUploadedFiles(prev => [
                                    ...prev,
                                    {
                                      name: `${reqDoc.key.toUpperCase()}_${newCustomerTaxId}.pdf`,
                                      size: '2.4 MB',
                                      type: reqDoc.title,
                                      requiredKey: reqDoc.key
                                    }
                                  ]);
                                  showToast(`Đã đính kèm tệp cho "${reqDoc.title}"!`);
                                }}
                                className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Đính kèm tệp mẫu</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Upload Additional Files Area */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                  <Upload className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">
                    Kéo thả hoặc nhấp để thêm tài liệu bổ sung khác (tối đa 25MB)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Hỗ trợ tệp scan giấy tờ pháp lý, bảng cân đối kế toán, biên bản bàn giao, hóa đơn thanh toán.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFiles(prev => [
                        ...prev,
                        { name: `TaiLieu_BoSung_${Date.now().toString().slice(-4)}.pdf`, size: '1.8 MB', type: 'Tài liệu bổ sung khác' }
                      ]);
                      showToast('Đã thêm 1 tệp đính kèm bổ sung!');
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    + Chọn Tệp Tải Lên Bổ Sung
                  </button>
                </div>

                {/* Current Uploaded Files Summary */}
                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Danh sách toàn bộ tệp đính kèm đã sẵn sàng ({uploadedFiles.length}):
                  </label>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                              {f.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Loại: {f.type} · Dung lượng: {f.size}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Xóa tệp này"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Quay lại: Biến &amp; Tham Số</span>
                  </button>

                  <button
                    onClick={() => setWizardStep(4)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Tiếp tục: Rà Soát Schema &amp; Ký Số</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* STEP 4: Live Variable Schema Review & e-Sign Submit  */}
            {/* ==================================================== */}
            {wizardStep === 4 && (
              <div className="space-y-6 text-xs animate-in fade-in duration-150">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Bước 4: Rà Soát Schema Biến, Xác Nhận Ký Số &amp; Kích Hoạt BPM Core</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Kiểm tra toàn bộ payload context trước khi gửi đến Engine. Khi kích hoạt, hồ sơ sẽ đồng thời tạo instance mới trong BPM Engine.
                  </p>
                </div>

                {/* 4 Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase">Quy trình BPM:</span>
                    <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 text-xs block truncate">
                      {currentProcessDef.key}
                    </span>
                    <span className="text-[10.5px] text-slate-500">{currentProcessDef.engine} v{currentProcessDef.version}</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase">Mã Hồ Sơ (Business Key):</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-slate-100 text-xs block truncate">
                      {businessKey}
                    </span>
                    <span className="text-[10.5px] text-slate-500">{branchCode}</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase">Số tiền đề nghị:</span>
                    <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 text-xs block truncate">
                      {formatVND(newAmount)}
                    </span>
                    <span className="text-[10.5px] text-slate-500">{newTermMonths} tháng</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <span className="text-[10px] text-slate-400 block uppercase">Hồ sơ đính kèm:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                      {uploadedFiles.length} tệp tài liệu
                    </span>
                    <span className="text-[10.5px] text-emerald-600 font-semibold">Đã kiểm tra hợp lệ</span>
                  </div>
                </div>

                {/* Live Variable Schema & Payload Preview */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 space-y-0">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-blue-500" />
                        <span>Xem trước biến Engine Context (Variables Payload Preview)</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Segmented view switcher */}
                      <div className="flex items-center bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-[11px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setPayloadViewMode('json')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            payloadViewMode === 'json' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Raw JSON Schema
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayloadViewMode('table')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            payloadViewMode === 'table' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Bảng Dữ Liệu
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(buildEnginePayload(), null, 2));
                          setJsonCopied(true);
                          setTimeout(() => setJsonCopied(false), 2000);
                          showToast('Đã sao chép JSON Payload vào bộ nhớ đệm!');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-300 dark:border-slate-600 cursor-pointer"
                      >
                        {jsonCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{jsonCopied ? 'Đã chép' : 'Sao chép JSON'}</span>
                      </button>
                    </div>
                  </div>

                  {payloadViewMode === 'json' ? (
                    <div className="p-4 bg-slate-950 text-slate-100 font-mono text-[11px] max-h-72 overflow-y-auto leading-relaxed">
                      <pre>{JSON.stringify(buildEnginePayload(), null, 2)}</pre>
                    </div>
                  ) : (
                    <div className="p-0 max-h-72 overflow-y-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
                          <tr>
                            <th className="py-2 px-3">Tên Thuộc Tính (Key)</th>
                            <th className="py-2 px-3">Giá Trị Context (Value)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                          {Object.entries(buildEnginePayload().variables).map(([k, v]) => (
                            <tr key={k} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-1.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                                {k}
                              </td>
                              <td className="py-1.5 px-3 text-emerald-700 dark:text-emerald-400 break-all">
                                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pre-flight Automated System Checks */}
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-2">
                  <h5 className="font-bold text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Kết Quả Kiểm Tra Tự Động Trước Khi Gửi (Pre-flight Checks)</span>
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Định nghĩa quy trình <strong>{currentProcessDef.key}</strong> đã sẵn sàng trên {currentProcessDef.engine}.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Business Key <strong>{businessKey}</strong> hợp lệ &amp; không trùng lặp.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Đã nạp <strong>{customVariables.length + 8} biến nghiệp vụ</strong> với kiểu dữ liệu hợp lệ.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Đã đính kèm <strong>{uploadedFiles.length} tài liệu chứng minh</strong> đạt yêu cầu tối thiểu.</span>
                    </div>
                  </div>
                </div>

                {/* Digital Signature Confirmation Box */}
                <div className="p-4 border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 rounded-xl space-y-3 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="esignCheck"
                      checked={eSignAccepted}
                      onChange={(e) => setESignAccepted(e.target.checked)}
                      className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="esignCheck" className="text-slate-700 dark:text-slate-300 cursor-pointer text-xs leading-relaxed">
                      <strong>Xác nhận ký số điện tử &amp; cam kết tính pháp lý:</strong> Tôi ({newCustomerName} - đại diện {newCustomerOrg}) xác nhận các thông tin kê khai và tài liệu đính kèm là hoàn toàn chính xác, trung thực. Tôi đồng ý để ngân hàng tra cứu lịch sử tín dụng CIC và kích hoạt tiến trình thẩm định trên hệ thống BPM Core.
                    </label>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Chứng thư số điện tử: <strong className="font-mono text-slate-600 dark:text-slate-300">SHA256-VNPT-CA-8921-SME</strong></span>
                    <span>Thời gian đóng dấu: <strong className="font-mono text-slate-600 dark:text-slate-300">{new Date().toLocaleDateString('vi-VN')}</strong></span>
                  </div>
                </div>

                {/* Navigation & Submit Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setWizardStep(3)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Quay lại: Hồ Sơ Đính Kèm</span>
                  </button>

                  <button
                    disabled={!eSignAccepted}
                    onClick={handleSubmitNewRequest}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kích Hoạt Quy Trình &amp; Nộp Lên BPM Core</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 3: MY REQUESTS & JOURNEY TRACKER                */}
        {/* ==================================================== */}
        {activeTab === 'my-requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left list of requests & Support card (Collapsible) */}
            {!sidebarCollapsed && (
              <div className="lg:col-span-4 xl:col-span-3 space-y-3 animate-fade-in">
                {/* Filter & Search */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Hồ Sơ Của Bạn ({filteredRequests.length})
                    </span>
                    <button
                      onClick={() => {
                        setSidebarCollapsed(true);
                        showToast('Đã thu gọn danh sách bên trái để mở rộng tối đa vùng xem sơ đồ quy trình!');
                      }}
                      className="p-1 text-slate-400 hover:text-emerald-600 rounded cursor-pointer transition-colors"
                      title="Thu gọn danh sách bên trái để mở rộng sơ đồ"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm theo mã hồ sơ, tên công ty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
                    {['ALL', 'IN_REVIEW', 'ADDITIONAL_DOCS_REQUIRED', 'APPROVED', 'DISBURSED'].map(st => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
                          statusFilter === st
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {st === 'ALL' ? 'Tất cả' : st === 'IN_REVIEW' ? 'Đang thẩm định' : st === 'ADDITIONAL_DOCS_REQUIRED' ? 'Cần bổ sung' : st === 'APPROVED' ? 'Đã duyệt' : 'Đã giải ngân'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cards list */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-0.5">
                  {filteredRequests.map(req => {
                    const isSelected = req.id === selectedRequestId;
                    const statusUi = getStatusDisplay(req.status);
                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequestId(req.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                            {req.trackingCode}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold border ${statusUi.bg}`}>
                            {statusUi.label}
                          </span>
                        </div>

                        <h5 className="font-semibold text-xs text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                          {req.serviceName}
                        </h5>

                        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                            {formatVND(req.amount)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRequestId(req.id);
                                setRequestDetailTab('embedded-bpmn');
                              }}
                              className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
                              title="Mở trực tiếp luồng quy trình BPMN & Biến Runtime"
                            >
                              <Map className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                              <span>BPMN Flow</span>
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {req.createdAt.split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Left Side Support & RM Hotline Card - Eliminates empty white space */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-emerald-50/50 dark:from-slate-900 dark:to-emerald-950/20 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Hỗ Trợ Khách Hàng 24/7</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                      SME Care
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between items-center">
                      <span>Đang thẩm định:</span>
                      <strong className="font-mono text-amber-600">{inReviewCount} hồ sơ</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cần bổ sung chứng từ:</span>
                      <strong className="font-mono text-rose-600">{needDocsCount} hồ sơ</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Đã giải ngân hoàn tất:</span>
                      <strong className="font-mono text-emerald-600">{completedCount} hồ sơ</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1 text-slate-500">
                    <p>
                      Cán bộ thụ lý: <strong>Bùi Văn Tâm (RM Khối SME)</strong>
                    </p>
                    <p className="flex items-center gap-1 font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      <Phone className="w-3 h-3" />
                      <span>024.3984.6688 · Máy lẻ 8821</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Right Detailed Journey & BPMN Process Actions */}
            <div className={`${sidebarCollapsed ? 'lg:col-span-12' : 'lg:col-span-8 xl:col-span-9'} bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-5 transition-all duration-200`}>
              {/* Header of selected request */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    {sidebarCollapsed && (
                      <button
                        onClick={() => setSidebarCollapsed(false)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg cursor-pointer hover:bg-emerald-100 transition-colors mr-1"
                        title="Mở lại danh sách hồ sơ bên trái"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span>Danh Sách ({filteredRequests.length})</span>
                      </button>
                    )}
                    <span className="font-mono font-bold text-base text-emerald-700 dark:text-emerald-400">
                      {selectedRequest.trackingCode}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusDisplay(selectedRequest.status).bg}`}>
                      {getStatusDisplay(selectedRequest.status).label}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                    {selectedRequest.serviceName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedRequest.customerOrg} · Người nộp: {selectedRequest.customerName} · Chi nhánh: {selectedRequest.branch || 'Hội sở chính'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setSidebarCollapsed(!sidebarCollapsed);
                      showToast(sidebarCollapsed ? 'Đã hiển thị lại danh sách hồ sơ' : 'Đã mở rộng vùng xem quy trình tối đa màn hình');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-all"
                    title={sidebarCollapsed ? 'Thu nhỏ về chế độ 2 cột' : 'Mở rộng sơ đồ toàn chiều rộng (ẩn danh sách)'}
                  >
                    {sidebarCollapsed ? <ChevronLeft className="w-3.5 h-3.5 text-emerald-600" /> : <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{sidebarCollapsed ? 'Chế Độ 2 Cột' : 'Toàn Chiều Rộng'}</span>
                  </button>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Số tiền đề nghị:</span>
                    <span className="font-mono font-bold text-base text-slate-900 dark:text-slate-100">
                      {formatVND(selectedRequest.amount)}
                    </span>
                    <span className="text-[10.5px] text-slate-400 block mt-0.5">
                      Thời hạn: {selectedRequest.termMonths} tháng
                    </span>
                  </div>
                </div>
              </div>

              {/* Segmented Sub-navigation Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setRequestDetailTab('embedded-bpmn')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    requestDetailTab === 'embedded-bpmn'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>🗺️ Luồng BPMN &amp; Biến Nhúng</span>
                </button>

                <button
                  onClick={() => setRequestDetailTab('documents')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    requestDetailTab === 'documents'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>📄 Tài Liệu Đính Kèm ({selectedRequest.documents.length})</span>
                </button>

                <button
                  onClick={() => setRequestDetailTab('comments')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    requestDetailTab === 'comments'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                  <span>💬 Trao Đổi Cán Bộ ({selectedRequest.comments.length})</span>
                </button>

                <button
                  onClick={() => setRequestDetailTab('stepper')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    requestDetailTab === 'stepper'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>📜 Lịch Sử Stepper</span>
                </button>
              </div>

              {/* ACTION CALLOUT: If additional docs required */}
              {selectedRequest.status === 'ADDITIONAL_DOCS_REQUIRED' && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-start gap-2.5 max-w-md">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-xs text-rose-900 dark:text-rose-200">
                        Hồ sơ cần bổ sung tài liệu để tiếp tục phê duyệt
                      </h5>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                        Cán bộ thẩm định yêu cầu cung cấp thêm bản mềm hóa đơn VAT có mã xác thực CQT và biên bản bàn giao.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAddDocsModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Bổ Sung Tài Liệu Ngay</span>
                  </button>
                </div>
              )}

              {/* SUB-VIEW 1: EMBEDDED BPMN PROCESS DIAGRAM & RUNTIME VARIABLES */}
              {requestDetailTab === 'embedded-bpmn' && (
                <EmbeddedProcessViewer
                  request={selectedRequest}
                  processDefinition={
                    availableProcesses.find(p => p.key === selectedRequest.processKey || p.key === selectedRequest.serviceKey) ||
                    availableProcesses.find(p => p.key === 'SDD') ||
                    availableProcesses[0]
                  }
                  onNotify={showToast}
                  onOpenAdminConsole={onOpenAdminConsole}
                  onUploadAdditionalDoc={() => setShowAddDocsModal(true)}
                />
              )}

              {/* SUB-VIEW 2: DOCUMENTS CHECKLIST */}
              {requestDetailTab === 'documents' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Tài Liệu Đã Nộp &amp; Chứng Từ Pháp Lý ({selectedRequest.documents.length})
                    </h5>
                    <button
                      onClick={() => setShowAddDocsModal(true)}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg font-semibold cursor-pointer border border-emerald-200 dark:border-emerald-800 transition-colors"
                    >
                      <Upload className="w-3 h-3" />
                      <span>+ Tải thêm tài liệu</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs bg-white dark:bg-slate-900">
                    {selectedRequest.documents.map(doc => (
                      <div key={doc.id} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                              {doc.fileName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Loại: {doc.name} · Dung lượng: {doc.fileSize} · Nộp lúc: {doc.uploadedAt}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            doc.status === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                              : doc.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {doc.status === 'VERIFIED' ? 'Đã duyệt' : doc.status === 'REJECTED' ? 'Cần tải lại' : 'Chờ duyệt'}
                          </span>
                          <button
                            onClick={() => showToast(`Đang tải tệp "${doc.fileName}"...`)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 cursor-pointer rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Tải về"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-VIEW 3: CHAT & COMMENTS */}
              {requestDetailTab === 'comments' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>Trao Đổi Thông Tin Với Cán Bộ Phụ Trách ({selectedRequest.comments.length})</span>
                  </h5>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedRequest.comments.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic text-center py-6">
                        Chưa có trao đổi nào trong hồ sơ này.
                      </p>
                    ) : (
                      selectedRequest.comments.map(c => (
                        <div 
                          key={c.id} 
                          className={`p-3 rounded-xl text-xs space-y-1 ${
                            c.isStaff
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 ml-6'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mr-6 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10.5px]">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {c.author} <span className="font-normal text-slate-400">({c.authorRole})</span>
                            </span>
                            <span className="text-slate-400 font-mono">{c.createdAt}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                            {c.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Send Comment Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                      placeholder="Nhập nội dung trao đổi hoặc thắc mắc gửi cán bộ..."
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      onClick={handleSendComment}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-VIEW 4: STEPPER TIMELINE */}
              {requestDetailTab === 'stepper' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Hành Trình Xử Lý Tuyến Tính (Linear Stepper)
                  </h5>

                  <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    {selectedRequest.steps.map((st, i) => (
                      <div key={st.id} className="flex items-start gap-3 relative pl-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                          st.status === 'COMPLETED'
                            ? 'bg-emerald-600 text-white ring-4 ring-white dark:ring-slate-900'
                            : st.status === 'IN_PROGRESS'
                            ? 'bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-950 animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 ring-4 ring-white dark:ring-slate-900'
                        }`}>
                          {st.status === 'COMPLETED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                        </div>

                        <div className="flex-1 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {st.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {st.updatedAt || 'Đang chờ xử lý'}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 mt-1">
                            Vai trò xử lý: <strong className="text-slate-700 dark:text-slate-300 font-mono">{st.role}</strong>
                            {st.handlerName && ` · Cán bộ: ${st.handlerName}`}
                          </div>

                          {st.notes && (
                            <p className="mt-1.5 p-2 bg-white dark:bg-slate-900 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
                              {st.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 4: OFFICER / STAFF WORKDESK (FOR USERS IN ORG)  */}
        {/* ==================================================== */}
        {activeTab === 'officer-desk' && (
          <div className="space-y-5">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h3 className="font-bold text-sm text-blue-950 dark:text-blue-100">
                    Bàn Làm Việc Thẩm Định Của Cán Bộ Nghiệp Vụ Trong Tổ Chức (Staff Workdesk)
                  </h3>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                  Cán bộ RM, Thẩm định rủi ro và Lãnh đạo phê duyệt tiếp nhận hồ sơ từ khách hàng, kiểm tra chấm điểm tín dụng và ký duyệt giải ngân.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                  Cán bộ đang đăng nhập: <strong>{currentPersona.name}</strong>
                </span>
              </div>
            </div>

            {/* Officer Action Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Hồ Sơ Cần Cán Bộ Xử Lý ({requests.length})
                </h4>
                <span className="text-xs text-slate-500">
                  Chọn hồ sơ để tiến hành thẩm định hoặc phê duyệt
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Mã Hồ Sơ</th>
                      <th className="py-2.5 px-3">Khách Hàng / Doanh Nghiệp</th>
                      <th className="py-2.5 px-3">Sản Phẩm &amp; Nhu Cầu Vốn</th>
                      <th className="py-2.5 px-3">Hạn SLA</th>
                      <th className="py-2.5 px-3">Trạng Thái</th>
                      <th className="py-2.5 px-3 text-right">Tác Vụ Nghiệp Vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {requests.map(req => {
                      const statusUi = getStatusDisplay(req.status);
                      return (
                        <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                            {req.trackingCode}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                              {req.customerOrg}
                            </span>
                            <span className="text-[10.5px] text-slate-400">
                              Đại diện: {req.customerName} · {req.customerPhone}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block">
                              {formatVND(req.amount)}
                            </span>
                            <span className="text-[10.5px] text-slate-400 truncate max-w-xs block">
                              {req.serviceName} ({req.termMonths} tháng)
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                            {req.slaDeadline}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold border ${statusUi.bg}`}>
                              {statusUi.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedRequestId(req.id);
                                  showToast(`Đã kiểm tra CIC cho khách hàng ${req.customerName}: Điểm tín dụng Hạng 1 (Good - 720/800)!`);
                                }}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded text-[10.5px] font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                                title="Chạy kiểm tra điểm tín dụng CIC"
                              >
                                Check CIC
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedRequestId(req.id);
                                  setOfficerDecision('APPROVE');
                                  setShowOfficerActionModal(true);
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10.5px] font-semibold cursor-pointer shadow-2xs"
                              >
                                Duyệt / Phản Hồi
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 5: PUBLIC LOOKUP & STANDARD FORMS               */}
        {/* ==================================================== */}
        {activeTab === 'tracking-lookup' && (
          <div className="space-y-6">
            {/* Search Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Tra Cứu Nhanh Tiến Độ Hồ Sơ Bằng Mã Định Danh
                </h4>
                <p className="text-xs text-slate-500">
                  Nhập mã biên nhận hồ sơ (VD: HS-2026-0891, HS-2026-0850) để kiểm tra tiến trình giải ngân.
                </p>
              </div>

              <div className="flex items-center gap-2 max-w-xl">
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePerformLookup()}
                  placeholder="Nhập mã hồ sơ (VD: HS-2026-0891)..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  onClick={handlePerformLookup}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Tra Cứu</span>
                </button>
              </div>

              {lookupResult && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-emerald-800 dark:text-emerald-300">
                          {lookupResult.trackingCode}
                        </span>
                        <span className="text-slate-400">/</span>
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                          {lookupResult.processInstanceId || 'inst_' + lookupResult.id}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getStatusDisplay(lookupResult.status).bg}`}>
                        {getStatusDisplay(lookupResult.status).label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300">
                      <span>Sản phẩm: <strong>{lookupResult.serviceName}</strong></span>
                      <span>·</span>
                      <span>Khách hàng: <strong>{lookupResult.customerOrg}</strong></span>
                      <span>·</span>
                      <span>Số tiền: <strong className="font-mono text-slate-900 dark:text-slate-100">{formatVND(lookupResult.amount)}</strong></span>
                      <span>·</span>
                      <span>Bước hiện tại: <strong className="text-emerald-700 dark:text-emerald-400">{lookupResult.currentStepName}</strong></span>
                      <span>·</span>
                      <span>Cán bộ: <strong>{lookupResult.assignedOfficer}</strong></span>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-emerald-200/60 dark:border-emerald-800/60">
                      <p className="text-[11px] text-slate-500">
                        Quy trình BPMN và các biến runtime đã được đồng bộ trực tiếp từ Camunda/Zeebe Process Engine.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedRequestId(lookupResult.id);
                          setRequestDetailTab('embedded-bpmn');
                          setActiveTab('my-requests');
                        }}
                        className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Mở đầy đủ trong Hồ Sơ Của Tôi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Embedded BPMN & Variables for Lookup Result */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm p-4">
                    <div className="mb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <Map className="w-4 h-4 text-emerald-600" />
                          <span>Mô Hình Tiến Trình BPMN &amp; Bộ Biến Nhúng (Embedded Process View)</span>
                        </h5>
                        <p className="text-xs text-slate-500">
                          Khách hàng xem trực tiếp vị trí Token đang chạy, các bước hoàn thành và giá trị biến nghiệp vụ.
                        </p>
                      </div>
                      <span className="font-mono text-[11px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                        Instance: {lookupResult.processInstanceId || 'inst_' + lookupResult.id}
                      </span>
                    </div>

                    <EmbeddedProcessViewer
                      request={lookupResult}
                      processDefinition={
                        availableProcesses.find(p => p.key === lookupResult.processKey || p.key === lookupResult.serviceKey) || availableProcesses[0]
                      }
                      onNotify={showToast}
                      onOpenAdminConsole={onOpenAdminConsole}
                      onUploadAdditionalDoc={() => {
                        setSelectedRequestId(lookupResult.id);
                        setShowAddDocsModal(true);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Standard Forms Download Library */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Thư Viện Biểu Mẫu Chuẩn Cho Khách Hàng Doanh Nghiệp
                </h4>
                <p className="text-xs text-slate-500">
                  Tải về các mẫu giấy đề nghị giải ngân, khế ước nhận nợ, báo cáo dòng tiền chuẩn hóa của ngân hàng.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { title: 'Giấy đề nghị giải ngân kiêm khế ước nhận nợ (Mẫu 01/GN-SME)', size: '240 KB', type: 'DOCX' },
                  { title: 'Bảng kê hóa đơn, chứng từ chi tiêu đầu vào (Mẫu 02/BK-VAT)', size: '180 KB', type: 'XLSX' },
                  { title: 'Biên bản họp Hội đồng thành viên/HĐQT về việc vay vốn', size: '150 KB', type: 'DOCX' },
                  { title: 'Mẫu cam kết sử dụng vốn đúng mục đích & phương án trả nợ', size: '190 KB', type: 'PDF' },
                  { title: 'Checklist hồ sơ pháp lý & tài chính dành cho doanh nghiệp SME', size: '110 KB', type: 'PDF' },
                  { title: 'Mẫu đề nghị phát hành bảo lãnh thực hiện hợp đồng trực tuyến', size: '210 KB', type: 'DOCX' },
                ].map((form, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs line-clamp-1">
                          {form.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Định dạng: {form.type} · Dung lượng: {form.size}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast(`Đang tải xuống tệp biểu mẫu: ${form.title}...`)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 rounded cursor-pointer"
                      title="Tải về biểu mẫu"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: CLIENT ADDITIONAL DOCUMENTS UPLOAD MODAL    */}
      {/* ==================================================== */}
      {showAddDocsModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in text-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-rose-50/80 dark:bg-rose-950/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Bổ Sung Tài Liệu Cho Hồ Sơ {selectedRequest.trackingCode}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {selectedRequest.serviceName}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowAddDocsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-900 dark:text-amber-200">
                <strong>Yêu cầu từ cán bộ thẩm định:</strong> Cần bản PDF hóa đơn điện tử GTGT có mã số tra cứu CQT và biên bản bàn giao hàng đợt 1.
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Tên tệp tài liệu bổ sung:
                </label>
                <input
                  type="text"
                  value={addDocFileName}
                  onChange={(e) => setAddDocFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Ghi chú gửi kèm cán bộ:
                </label>
                <textarea
                  rows={3}
                  value={addDocNotes}
                  onChange={(e) => setAddDocNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button
                onClick={() => setShowAddDocsModal(false)}
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleClientAddDocs}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Xác Nhận Nộp Bổ Sung
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: OFFICER DECISION & REVIEW MODAL             */}
      {/* ==================================================== */}
      {showOfficerActionModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in text-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-blue-50/80 dark:bg-blue-950/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Phê Duyệt / Thẩm Định Hồ Sơ {selectedRequest.trackingCode}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {selectedRequest.customerOrg} · Số tiền: {formatVND(selectedRequest.amount)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowOfficerActionModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Quyết định của cán bộ:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOfficerDecision('APPROVE')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      officerDecision === 'APPROVE'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-bold text-xs">Phê Duyệt</span>
                    <span className="text-[10px] text-slate-400">Đủ điều kiện</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOfficerDecision('REQUEST_DOCS')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      officerDecision === 'REQUEST_DOCS'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 font-bold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-bold text-xs">Yêu Cầu Bổ Sung</span>
                    <span className="text-[10px] text-slate-400">Thiếu giấy tờ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOfficerDecision('REJECT')}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      officerDecision === 'REJECT'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 font-bold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-bold text-xs">Từ Chối</span>
                    <span className="text-[10px] text-slate-400">Không phù hợp</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Ý kiến thẩm định / Lý do chi tiết:
                </label>
                <textarea
                  rows={3}
                  value={officerReason}
                  onChange={(e) => setOfficerReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button
                onClick={() => setShowOfficerActionModal(false)}
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleOfficerDecisionSubmit}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Xác Nhận Quyết Định
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
