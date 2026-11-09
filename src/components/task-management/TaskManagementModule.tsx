import React, { useState } from 'react';
import { 
  RBACItem, 
  ProcessRBACDefinition, 
  GranularAction, 
  ProcessAction, 
  QueueAction,
  RolePermissionDetail,
  ProcessRolePermissionDetail,
  RBACAuditLogEntry,
  AuditActionType
} from '../../types/bpm';
import { 
  INITIAL_RBAC_ITEMS, 
  INITIAL_PROCESS_RBAC,
  INITIAL_RBAC_AUDIT_LOGS 
} from '../../data/mockBpmData';
import { AccessAuditLog } from './AccessAuditLog';
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  Settings, 
  Filter, 
  SlidersHorizontal, 
  Layers, 
  Lock, 
  Check, 
  Trash2,
  FileCode2,
  LayoutGrid,
  List,
  Eye,
  Play,
  RotateCcw,
  Ban,
  ArrowRight,
  Info,
  X,
  Workflow,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  FileText,
  History,
  Download,
  Clock,
  UserCheck,
  Tag,
  ArrowUpRight
} from 'lucide-react';

const ALL_SYSTEM_ROLES = [
  'NCLOS ADMIN',
  'NCLOS B CA',
  'NCLOS B KS2',
  'NCLOS B TLCO',
  'NCLOS B CO',
  'NCLOS B TK',
  'NCLOS SALE',
  'NCLOS FA',
  'NCLOS CA',
  'SUPER_ADMIN'
];

export const TaskManagementModule: React.FC = () => {
  // Top Scope Tabs: Element, Process, Queue, Audit
  const [activeScopeTab, setActiveScopeTab] = useState<'element' | 'process' | 'queue' | 'audit'>('element');
  
  // View Toggle: Table or Matrix
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');

  // Selected Process on left
  const [selectedProcessKey, setSelectedProcessKey] = useState<string>('NCLOS');
  const [searchProcess, setSearchProcess] = useState<string>('');

  // Items State
  const [rbacItems, setRbacItems] = useState<RBACItem[]>(INITIAL_RBAC_ITEMS);
  const [processRbacList, setProcessRbacList] = useState<ProcessRBACDefinition[]>(INITIAL_PROCESS_RBAC);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<RBACAuditLogEntry[]>(INITIAL_RBAC_AUDIT_LOGS);

  // Drawer Configuration State
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [activeEditingItem, setActiveEditingItem] = useState<RBACItem | null>(null);
  const [roleSearchTerm, setRoleSearchTerm] = useState<string>('');
  const [activeEditingProcess, setActiveEditingProcess] = useState<ProcessRBACDefinition | null>(null);

  // Create Queue Modal State
  const [showCreateQueueModal, setShowCreateQueueModal] = useState<boolean>(false);
  const [newQueueName, setNewQueueName] = useState<string>('');
  const [newQueueQuery, setNewQueueQuery] = useState<string>('amount >= 5000000000');
  const [newQueueRoles, setNewQueueRoles] = useState<string[]>(['NCLOS ADMIN', 'NCLOS CA']);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to log audit events
  const logAuditChange = (
    targetType: 'Process' | 'Element' | 'Queue',
    targetName: string,
    processKey: string,
    actionType: AuditActionType,
    details: string,
    previousState?: string,
    newState?: string
  ) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newLog: RBACAuditLogEntry = {
      id: `audit_${Date.now()}`,
      timestamp,
      actor: 'tambv (Bùi Văn Tâm)',
      actorRole: 'NCLOS ADMIN',
      processKey,
      targetType,
      targetName,
      actionType,
      details,
      previousState,
      newState
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Left sidebar processes
  const processList = [
    { key: 'ISM', name: 'ISM', count: 7 },
    { key: 'NCLOS', name: 'NCLOS', count: 33 },
    { key: 'PSCF', name: 'PSCF', count: 13 },
    { key: 'SDD', name: 'SDD - GIẢI NGÂN', count: 26 },
  ];

  const filteredProcessList = processList.filter(p => 
    p.name.toLowerCase().includes(searchProcess.toLowerCase()) ||
    p.key.toLowerCase().includes(searchProcess.toLowerCase())
  );

  // Filter items by active process & scope
  const elementItems = rbacItems.filter(i => i.processKey === selectedProcessKey && i.type === 'Element');
  const queueItems = rbacItems.filter(i => i.processKey === selectedProcessKey && i.type === 'Queue');

  // Open Drawer for Element / Queue
  const handleOpenDrawer = (item: RBACItem) => {
    setActiveEditingItem({
      ...item,
      rolePermissions: item.rolePermissions || item.roles.map(r => ({
        role: r,
        actions: ['VIEW', 'EXECUTE'] as GranularAction[]
      }))
    });
    setDrawerOpen(true);
  };

  // Save changes from Drawer
  const handleSaveDrawer = () => {
    if (!activeEditingItem) return;
    const oldItem = rbacItems.find(i => i.id === activeEditingItem.id);
    const oldRolesStr = oldItem ? `[${oldItem.roles.join(', ')}]` : '[]';
    const newRolesStr = `[${activeEditingItem.roles.join(', ')}]`;

    setRbacItems(prev => prev.map(item => item.id === activeEditingItem.id ? activeEditingItem : item));

    // Audit Log
    logAuditChange(
      activeEditingItem.type,
      activeEditingItem.name,
      activeEditingItem.processKey,
      'ACTION_UPDATED',
      `Cập nhật cấu hình phân quyền vai trò và hành động: ${newRolesStr}`,
      `Vai trò cũ: ${oldRolesStr}`,
      `Vai trò mới: ${newRolesStr}`
    );

    setDrawerOpen(false);
    showToast(`Đã lưu cấu hình phân quyền cho "${activeEditingItem.name}" thành công!`);
  };

  // Toggle role in drawer
  const handleToggleRoleInDrawer = (roleName: string) => {
    if (!activeEditingItem) return;
    const currentRoles = activeEditingItem.roles || [];
    const currentDetails = activeEditingItem.rolePermissions || [];

    if (currentRoles.includes(roleName)) {
      // Remove role
      setActiveEditingItem({
        ...activeEditingItem,
        roles: currentRoles.filter(r => r !== roleName),
        rolePermissions: currentDetails.filter(d => d.role !== roleName)
      });
      logAuditChange(
        activeEditingItem.type,
        activeEditingItem.name,
        activeEditingItem.processKey,
        'ROLE_REMOVED',
        `Gỡ bỏ vai trò [${roleName}] khỏi tác vụ ${activeEditingItem.name}`,
        `Role: ${roleName}`,
        'Đã gỡ'
      );
    } else {
      // Add role with default View & Execute
      setActiveEditingItem({
        ...activeEditingItem,
        roles: [...currentRoles, roleName],
        rolePermissions: [...currentDetails, { role: roleName, actions: ['VIEW', 'EXECUTE'] }]
      });
      logAuditChange(
        activeEditingItem.type,
        activeEditingItem.name,
        activeEditingItem.processKey,
        'ROLE_ASSIGNED',
        `Gán vai trò mới [${roleName}] với quyền [VIEW, EXECUTE] cho tác vụ ${activeEditingItem.name}`,
        'Chưa có quyền',
        `Role: ${roleName} [VIEW, EXECUTE]`
      );
    }
  };

  // Toggle granular action for a role
  const handleToggleGranularAction = (roleName: string, action: GranularAction) => {
    if (!activeEditingItem) return;
    const currentDetails = activeEditingItem.rolePermissions || [];
    const roleEntry = currentDetails.find(d => d.role === roleName);

    let updatedDetails: RolePermissionDetail[];
    if (roleEntry) {
      const hasAction = roleEntry.actions.includes(action);
      const newActions = hasAction
        ? roleEntry.actions.filter(a => a !== action)
        : [...roleEntry.actions, action];
      
      updatedDetails = currentDetails.map(d => d.role === roleName ? { ...d, actions: newActions } : d);
    } else {
      updatedDetails = [...currentDetails, { role: roleName, actions: [action] }];
    }

    setActiveEditingItem({
      ...activeEditingItem,
      rolePermissions: updatedDetails
    });
  };

  // Process-level action toggle
  const handleToggleProcessAction = (procKey: string, roleName: string, action: ProcessAction) => {
    setProcessRbacList(prev => prev.map(proc => {
      if (proc.processKey !== procKey) return proc;
      const existing = proc.rolePermissions.find(p => p.role === roleName);
      let updatedPerms: ProcessRolePermissionDetail[];
      if (existing) {
        const has = existing.actions.includes(action);
        const newActs = has ? existing.actions.filter(a => a !== action) : [...existing.actions, action];
        updatedPerms = proc.rolePermissions.map(p => p.role === roleName ? { ...p, actions: newActs } : p);
      } else {
        updatedPerms = [...proc.rolePermissions, { role: roleName, actions: [action] }];
      }

      // Log process perm audit
      logAuditChange(
        'Process',
        proc.processName,
        procKey,
        'PROCESS_PERM_UPDATED',
        `Thay đổi quyền [${action}] của vai trò [${roleName}] trên quy trình ${procKey}`,
        `Action: ${action} toggled`,
        `Role: ${roleName} -> ${action}`
      );

      return {
        ...proc,
        roles: updatedPerms.filter(p => p.actions.length > 0).map(p => p.role),
        rolePermissions: updatedPerms
      };
    }));
    showToast(`Đã cập nhật quyền ${action} của vai trò ${roleName} trên quy trình ${procKey}`);
  };

  // Create new queue
  const handleCreateQueue = () => {
    if (!newQueueName) return;
    const newQueue: RBACItem = {
      id: `queue_${Date.now()}`,
      processKey: selectedProcessKey,
      name: newQueueName,
      type: 'Queue',
      elementType: 'Query · 0 element',
      roles: newQueueRoles,
      rolePermissions: newQueueRoles.map(r => ({ role: r, actions: ['VIEW', 'EXECUTE', 'REASSIGN'] })),
      filters: 1,
      queryExpression: newQueueQuery,
      description: 'Hàng đợi lọc tác vụ tùy chỉnh theo điều kiện nghiệp vụ'
    };
    setRbacItems([newQueue, ...rbacItems]);

    // Audit log
    logAuditChange(
      'Queue',
      newQueueName,
      selectedProcessKey,
      'QUEUE_CREATED',
      `Tạo work queue mới "${newQueueName}" với truy vấn "${newQueueQuery}" gán cho [${newQueueRoles.join(', ')}]`,
      undefined,
      `Query: ${newQueueQuery}, Roles: [${newQueueRoles.join(', ')}]`
    );

    setShowCreateQueueModal(false);
    setNewQueueName('');
    showToast(`Đã tạo hàng đợi mới "${newQueueName}" thành công!`);
  };

  const handleExportAuditCSV = () => {
    const headers = ['Timestamp,Actor,Action,Resource,Process,Detail\n'];
    const rows = auditLogs.map(l => 
      `"${l.timestamp}","${l.actor} (${l.actorRole})","${l.actionType}","${l.targetType}: ${l.targetName}","${l.processKey}","${l.details}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AccessAuditLog_${Date.now()}.csv`;
    a.click();
    showToast('Đã tải xuống tệp nhật ký kiểm toán AccessAuditLog.csv thành công!');
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-3.5rem)] overflow-hidden bg-white dark:bg-slate-900 select-none relative">
      {/* Toast */}
      {toastMessage && (
        <div className="absolute top-4 right-1/2 translate-x-1/2 z-60 bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Process Selector (Visible in Element & Queue tabs) */}
      {activeScopeTab !== 'process' && activeScopeTab !== 'audit' && (
        <div className="w-60 border-r border-slate-200 dark:border-slate-800 p-3 bg-slate-50/60 dark:bg-slate-900/60 overflow-y-auto text-xs space-y-3 shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search process..."
              value={searchProcess}
              onChange={(e) => setSearchProcess(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              <span>PROCESSES</span>
              <span>{processList.length}</span>
            </div>

            <div className="space-y-1">
              {filteredProcessList.map(proc => {
                const isSelected = selectedProcessKey === proc.key;
                return (
                  <button
                    key={proc.key}
                    onClick={() => setSelectedProcessKey(proc.key)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500/30 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileCode2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="truncate">{proc.name}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      isSelected ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}>
                      {proc.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick RBAC Scope Explanation */}
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 rounded-lg text-[11px] text-emerald-900 dark:text-emerald-300 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cơ chế RBAC 3 Lớp</span>
            </p>
            <p className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-400">
              Quyền hạn được kế thừa từ <strong>Process</strong> → <strong>Element</strong> → <strong>Queue</strong>, đảm bảo bảo mật dữ liệu tuyệt đối giữa các bộ phận.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 bg-slate-50/40 dark:bg-slate-950/40">
        {/* Top Control Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {activeScopeTab === 'audit'
                  ? 'Access Audit Log – Lịch Sử Thay Đổi Phân Quyền (RBAC)'
                  : activeScopeTab === 'process' 
                  ? 'Quản Trị Phân Quyền Theo Process' 
                  : `${selectedProcessKey} – Phân Quyền ${activeScopeTab === 'element' ? 'Element' : 'Queue'}`}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeScopeTab === 'audit' && 'Theo dõi đầy đủ theo thứ tự thời gian ai đã thay đổi quyền gì, vào thời điểm nào trên Process, Element và Queue.'}
              {activeScopeTab === 'process' && 'Quản lý quyền thao tác vòng đời trên từng quy trình theo vai trò (View, Start, Deploy, Terminate).'}
              {activeScopeTab === 'element' && 'Kiểm soát quyền truy cập chi tiết trên từng element BPMN 2.0 (Xem, Nhận xử lý, Chuyển tiếp, Hủy).'}
              {activeScopeTab === 'queue' && 'Cấu hình role-based access trên từng hàng đợi task và điều kiện truy vấn nghiệp vụ.'}
            </p>
          </div>

          {/* View Toggle & Actions */}
          <div className="flex items-center gap-2.5">
            {/* Table / Matrix View Switch (Hidden in Audit log view) */}
            {activeScopeTab !== 'audit' && (
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bảng Danh Sách</span>
                </button>
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'matrix'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ma Trận (Matrix View)</span>
                </button>
              </div>
            )}

            {/* Audit Tab: Export CSV */}
            {activeScopeTab === 'audit' && (
              <button
                onClick={handleExportAuditCSV}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                title="Tải xuống tệp CSV nhật ký kiểm toán RBAC"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất CSV Kiểm Toán</span>
              </button>
            )}

            {/* Action buttons */}
            {activeScopeTab === 'queue' && (
              <button
                onClick={() => setShowCreateQueueModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo Hàng Đợi Mới</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Main Scope Tabs (Modern Segmented Tray) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 shadow-2xs mb-4 w-fit flex-wrap">
          <button
            onClick={() => setActiveScopeTab('process')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScopeTab === 'process' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Theo Process</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold">
              {processRbacList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveScopeTab('element')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScopeTab === 'element' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. Theo Element</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold">
              {elementItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveScopeTab('queue')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScopeTab === 'queue' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5 text-emerald-600" />
            <span>3. Theo Queue</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold">
              {queueItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveScopeTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScopeTab === 'audit' 
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-purple-600" />
            <span>4. Access Audit Log</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-mono font-bold">
              {auditLogs.length}
            </span>
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* VIEW 1: Phân Quyền Theo Process                     */}
        {/* ---------------------------------------------------- */}
        {activeScopeTab === 'process' && (
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-auto shadow-2xs">
            {viewMode === 'table' ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10.5px] font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-3 px-4">Quy Trình (Process)</th>
                    <th className="py-3 px-4">Lĩnh Vực / Nhóm</th>
                    <th className="py-3 px-4">Vai Trò Được Cấp Quyền</th>
                    <th className="py-3 px-4 text-center">Cấu Phần (Elements / Queues)</th>
                    <th className="py-3 px-4 text-center">Hành Động Quy Trình</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {processRbacList.map(proc => (
                    <tr key={proc.processKey} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {proc.processName}
                        </div>
                        <span className="font-mono text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                          KEY: {proc.processKey}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {proc.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {proc.roles.map(r => (
                            <span 
                              key={r}
                              className="px-2 py-0.5 rounded text-[10.5px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{proc.totalElements}</span> elements · <span className="text-purple-600 font-bold">{proc.totalQueues}</span> queues
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedProcessKey(proc.processKey);
                              setActiveScopeTab('element');
                            }}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 rounded text-xs font-semibold transition-colors"
                          >
                            Chi Tiết Element →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* Process Matrix Grid View */
              <div className="overflow-x-auto p-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 font-bold w-60">Process</th>
                      {ALL_SYSTEM_ROLES.slice(0, 6).map(role => (
                        <th key={role} className="py-2.5 px-3 text-center bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] font-bold">
                          {role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {processRbacList.map(proc => (
                      <tr key={proc.processKey} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                          {proc.processKey}
                        </td>
                        {ALL_SYSTEM_ROLES.slice(0, 6).map(role => {
                          const rolePerm = proc.rolePermissions.find(p => p.role === role);
                          const acts = rolePerm?.actions || [];
                          return (
                            <td key={role} className="py-3 px-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {(['VIEW', 'START', 'DEPLOY', 'TERMINATE'] as ProcessAction[]).map(act => {
                                  const has = acts.includes(act);
                                  return (
                                    <button
                                      key={act}
                                      onClick={() => handleToggleProcessAction(proc.processKey, role, act)}
                                      className={`w-5 h-5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                                        has
                                          ? 'bg-emerald-600 text-white shadow-2xs'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:bg-slate-200'
                                      }`}
                                      title={`${role} on ${proc.processKey}: ${act}`}
                                    >
                                      {act[0]}
                                    </button>
                                  );
                                })}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 2: Phân Quyền Theo Element                     */}
        {/* ---------------------------------------------------- */}
        {activeScopeTab === 'element' && (
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-auto shadow-2xs">
            {viewMode === 'table' ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10.5px] font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Tên Element / Tác Vụ</th>
                    <th className="py-2.5 px-4">BPMN Type</th>
                    <th className="py-2.5 px-4">Vai Trò Được Gán (Roles)</th>
                    <th className="py-2.5 px-4">Quyền Thao Tác (Actions)</th>
                    <th className="py-2.5 px-4">Bộ Lọc Điều Kiện</th>
                    <th className="py-2.5 px-4 text-center">Cấu Hình</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {elementItems.map((item) => (
                    <tr 
                      key={item.id} 
                      onClick={() => handleOpenDrawer(item)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700">
                        {item.name}
                        {item.description && (
                          <p className="text-[10.5px] font-normal text-slate-500 dark:text-slate-400 truncate max-w-xs mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-mono">
                          {item.elementType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.roles.length > 0 ? (
                            item.roles.map(r => (
                              <span 
                                key={r}
                                className="px-2 py-0.5 rounded text-[10.5px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              >
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs italic">Chưa gán vai trò nào</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {/* Granular Action Badges: V, E, R, C */}
                        <div className="flex items-center gap-1 font-mono text-[10px]">
                          <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center" title="Quyền Xem (View)">
                            V
                          </span>
                          <span className="w-4 h-4 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold flex items-center justify-center" title="Quyền Xử Lý / Claim (Execute)">
                            E
                          </span>
                          <span className="w-4 h-4 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold flex items-center justify-center" title="Quyền Chuyển Tiếp (Reassign)">
                            R
                          </span>
                          <span className="w-4 h-4 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold flex items-center justify-center" title="Quyền Hủy (Cancel)">
                            C
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {item.filters > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {item.filters} filter active
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDrawer(item);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Cấu hình quyền hạn chi tiết"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* Element Matrix Grid View */
              <div className="overflow-x-auto p-4">
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-4">
                  <span>Chú thích ma trận:</span>
                  <span className="inline-flex items-center gap-1"><span className="w-4 h-4 rounded bg-emerald-600 text-white text-[9px] font-bold text-center leading-4">V</span> View</span>
                  <span className="inline-flex items-center gap-1"><span className="w-4 h-4 rounded bg-blue-600 text-white text-[9px] font-bold text-center leading-4">E</span> Execute / Claim</span>
                  <span className="inline-flex items-center gap-1"><span className="w-4 h-4 rounded bg-purple-600 text-white text-[9px] font-bold text-center leading-4">R</span> Reassign</span>
                  <span className="inline-flex items-center gap-1"><span className="w-4 h-4 rounded bg-amber-600 text-white text-[9px] font-bold text-center leading-4">C</span> Cancel</span>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 font-bold w-64">BPMN Element</th>
                      {ALL_SYSTEM_ROLES.slice(0, 6).map(role => (
                        <th key={role} className="py-2.5 px-2 text-center bg-slate-50 dark:bg-slate-800/60 font-mono text-[10.5px] font-bold">
                          {role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {elementItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                          {item.name}
                        </td>
                        {ALL_SYSTEM_ROLES.slice(0, 6).map(role => {
                          const hasRole = item.roles.includes(role);
                          return (
                            <td key={role} className="py-2.5 px-2 text-center">
                              {hasRole ? (
                                <button
                                  onClick={() => handleOpenDrawer(item)}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-300 dark:border-emerald-700"
                                >
                                  <span>V·E</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenDrawer(item)}
                                  className="w-5 h-5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-300 text-xs inline-flex items-center justify-center cursor-pointer"
                                  title={`Gán quyền cho vai trò ${role}`}
                                >
                                  +
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 3: Phân Quyền Theo Queue                       */}
        {/* ---------------------------------------------------- */}
        {activeScopeTab === 'queue' && (
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-auto shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10.5px] font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Tên Hàng Đợi (Queue Name)</th>
                  <th className="py-2.5 px-4">Truy Vấn Nghiệp Vụ (Filter Query)</th>
                  <th className="py-2.5 px-4">Vai Trò Được Phép Nhận Task</th>
                  <th className="py-2.5 px-4">Quyền Thao Tác</th>
                  <th className="py-2.5 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {queueItems.map((queue) => (
                  <tr key={queue.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span>{queue.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal mt-0.5">{queue.description}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                      {queue.queryExpression || 'status == "ACTIVE"'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {queue.roles.map(r => (
                          <span 
                            key={r}
                            className="px-2 py-0.5 rounded text-[10.5px] font-bold font-mono bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        View · Claim · Reassign
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenDrawer(queue)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded cursor-pointer"
                        title="Cấu hình quyền trên queue này"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 4: Access Audit Log (Kiểm Toán Phân Quyền)     */}
        {/* ---------------------------------------------------- */}
        {activeScopeTab === 'audit' && (
          <AccessAuditLog logs={auditLogs} onExportCSV={handleExportAuditCSV} />
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* SLIDE-OVER CONFIGURATION DRAWER (Interactive)        */}
      {/* ---------------------------------------------------- */}
      {drawerOpen && activeEditingItem && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
          />

          {/* Drawer Canvas */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-10 text-xs select-none animate-slide-left">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono">
                    {activeEditingItem.type}
                  </span>
                  <span className="font-mono text-slate-400">{activeEditingItem.id}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {activeEditingItem.name}
                </h3>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Section 1: Role Search & Assignment */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Tìm kiếm &amp; Gán Vai Trò (Role Assignment)
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Chọn các vai trò được phép tương tác với tác vụ này:</p>
                
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Lọc vai trò..."
                    value={roleSearchTerm}
                    onChange={(e) => setRoleSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                {/* Available Roles Pills */}
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700">
                  {ALL_SYSTEM_ROLES.filter(r => r.toLowerCase().includes(roleSearchTerm.toLowerCase())).map(role => {
                    const isSelected = activeEditingItem.roles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleToggleRoleInDrawer(role)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                        }`}
                      >
                        <span>{role}</span>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Granular Actions Per Assigned Role */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Phân Quyền Hành Động Chi Tiết (Granular Actions)
                </label>
                <p className="text-[11px] text-slate-500 mb-3">
                  Cấp quyền thực thi riêng biệt cho từng vai trò đã chọn:
                </p>

                <div className="space-y-2.5">
                  {activeEditingItem.roles.map(role => {
                    const roleEntry = activeEditingItem.rolePermissions?.find(d => d.role === role);
                    const acts = roleEntry?.actions || ['VIEW', 'EXECUTE'];
                    return (
                      <div key={role} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {role}
                          </span>
                          <button
                            onClick={() => handleToggleRoleInDrawer(role)}
                            className="text-red-500 hover:text-red-700 text-[10.5px] cursor-pointer"
                          >
                            Xóa vai trò
                          </button>
                        </div>

                        {/* Granular Checkboxes: View, Execute/Claim, Reassign, Cancel */}
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={acts.includes('VIEW')}
                              onChange={() => handleToggleGranularAction(role, 'VIEW')}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-medium text-slate-700 dark:text-slate-300">Xem (View)</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={acts.includes('EXECUTE')}
                              onChange={() => handleToggleGranularAction(role, 'EXECUTE')}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-medium text-slate-700 dark:text-slate-300">Nhận &amp; Duyệt (Execute)</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={acts.includes('REASSIGN')}
                              onChange={() => handleToggleGranularAction(role, 'REASSIGN')}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-medium text-slate-700 dark:text-slate-300">Chuyển tiếp (Reassign)</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={acts.includes('CANCEL')}
                              onChange={() => handleToggleGranularAction(role, 'CANCEL')}
                              className="rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-medium text-slate-700 dark:text-slate-300">Hủy tác vụ (Cancel)</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}

                  {activeEditingItem.roles.length === 0 && (
                    <div className="p-4 text-center text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      Vui lòng chọn ít nhất một vai trò ở phía trên để cấu hình hành động.
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Dynamic Rule / Expression Filter Builder */}
              <div>
                <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Bộ Lọc Điều Kiện Thực Thi (Dynamic Rule Expression)
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Chỉ cho phép xử lý khi biến số của process instance thỏa mãn:
                </p>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                  <input
                    type="text"
                    value={activeEditingItem.filterRules?.[0]?.expression || 'loanAmount <= 15000000000 VND'}
                    onChange={(e) => {
                      const updatedRules = [{
                        id: 'f_dynamic',
                        field: 'loanAmount',
                        operator: '<=' as const,
                        value: '15000000000',
                        expression: e.target.value
                      }];
                      setActiveEditingItem({
                        ...activeEditingItem,
                        filters: e.target.value ? 1 : 0,
                        filterRules: updatedRules
                      });
                    }}
                    placeholder="e.g. loanAmount <= 15000000000 && branch == 'HN'"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded font-mono text-xs text-emerald-700 dark:text-emerald-400"
                  />
                  <div className="flex gap-2 flex-wrap text-[10.5px] text-slate-400">
                    <span className="cursor-pointer hover:text-emerald-600" onClick={() => setActiveEditingItem({ ...activeEditingItem, filters: 1, filterRules: [{ id: '1', field: 'loanAmount', operator: '<=', value: '5000000000', expression: 'loanAmount < 5,000,000,000 VND' }] })}>
                      + Thêm mẫu: &lt; 5 tỷ
                    </span>
                    <span>·</span>
                    <span className="cursor-pointer hover:text-emerald-600" onClick={() => setActiveEditingItem({ ...activeEditingItem, filters: 1, filterRules: [{ id: '2', field: 'branch', operator: '==', value: 'HN', expression: 'branch == "Chi nhánh Hà Nội"' }] })}>
                      + Thêm mẫu: Chi nhánh HN
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-end gap-2">
              <button
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-semibold"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleSaveDrawer}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm"
              >
                Lưu Cấu Hình RBAC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* CREATE QUEUE MODAL                                   */}
      {/* ---------------------------------------------------- */}
      {showCreateQueueModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Tạo Hàng Đợi Tác Vụ (Work Queue)
              </h3>
              <button onClick={() => setShowCreateQueueModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tên Hàng Đợi</label>
                <input
                  type="text"
                  value={newQueueName}
                  onChange={(e) => setNewQueueName(e.target.value)}
                  placeholder="e.g. Hàng đợi hồ sơ VIP SME"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Biểu Thức Lọc Tác Vụ (SQL / Camunda Query)</label>
                <input
                  type="text"
                  value={newQueueQuery}
                  onChange={(e) => setNewQueueQuery(e.target.value)}
                  placeholder="amount >= 5000000000 && branch == 'HN'"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-emerald-700"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Vai Trò Được Phép Claim</label>
                <div className="flex gap-1.5 flex-wrap">
                  {['NCLOS ADMIN', 'NCLOS CA', 'NCLOS B CO', 'NCLOS B TLCO'].map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setNewQueueRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-mono cursor-pointer ${
                        newQueueRoles.includes(role) 
                          ? 'bg-purple-600 text-white font-bold' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button onClick={() => setShowCreateQueueModal(false)} className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold">
                Hủy
              </button>
              <button onClick={handleCreateQueue} className="px-4 py-1.5 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800">
                Tạo Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
