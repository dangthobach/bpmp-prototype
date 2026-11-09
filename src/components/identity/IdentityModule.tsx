import React, { useState } from 'react';
import { UserAccount } from '../../types/bpm';
import { INITIAL_USERS } from '../../data/mockBpmData';
import { 
  Users, 
  Shield, 
  KeyRound, 
  FileText, 
  Lock, 
  Unlock, 
  Search, 
  Plus, 
  CheckCircle2, 
  Globe, 
  Server, 
  Layers, 
  Cpu, 
  UserCheck,
  LayoutDashboard,
  Filter,
  ShieldAlert,
  ArrowUpRight,
  Fingerprint,
  Mail,
  Building,
  ChevronRight,
  CheckSquare,
  Square,
  MinusSquare,
  Download,
  Trash2,
  UserCog,
  Key,
  RefreshCw,
  SlidersHorizontal,
  Check,
  X,
  ChevronDown,
  AlertTriangle,
  FolderInput,
  ShieldCheck,
  UserX,
  Sparkles,
  Activity,
  Radio,
  RotateCw,
  ExternalLink,
  Table as TableIcon,
  Grid,
  UserPlus
} from 'lucide-react';

export interface RoleItem {
  id: string;
  name: string;
  desc: string;
  userCount: number;
  type: string;
  permissions: string[];
  isSystem?: boolean;
}

export interface PermissionCatalogueItem {
  id: string;
  module: string;
  name: string;
  description: string;
  auditLogged: boolean;
  grantedRoles: string[];
}

export interface SystemResourceItem {
  id: string;
  name: string;
  type: string;
  status: 'ONLINE' | 'MAINTENANCE' | 'OFFLINE';
  latency: string;
  lastPing: string;
  tenantScope: string;
}

export interface ServiceAccountItem {
  id: string;
  name: string;
  email: string;
  status: 'VALID' | 'EXPIRING' | 'REVOKED';
  certExpiry: string;
  mTLSKey: string;
  lastUsed: string;
  scope: string;
}

const AVAILABLE_ROLES = [
  'SUPER_ADMIN',
  'NCLOS ADMIN',
  'NCLOS CA',
  'NCLOS B CO',
  'NCLOS B KS2',
  'NCLOS B TLCO',
  'NCLOS SALE',
  'NCLOS FA',
  'NCLOS B TK',
  'AUDITOR'
];

const AVAILABLE_DEPARTMENTS = [
  'Khối Tín Dụng SME',
  'Khối Khách Hàng Doanh Nghiệp Lớn (CIB)',
  'Trung Tâm Thẩm Định & Phê Duyệt',
  'Phòng Kiểm Soát Tín Dụng & Rủi Ro',
  'Khối Vận Hành & Chuyển Đổi Số',
  'Khối Bán Lẻ & Mạng Lưới Chi Nhánh'
];

const INITIAL_ROLE_ITEMS: RoleItem[] = [
  { id: 'r_1', name: 'SUPER_ADMIN', desc: 'Toàn quyền cấu hình nền tảng, tenant và multi-engine (Camunda, Flowable)', userCount: 4, type: 'System Admin', permissions: ['process:view', 'process:create', 'process:edit_bpmn', 'process:deploy_camunda', 'process:deploy_flowable', 'process:export_xml', 'instance:suspend', 'instance:cancel', 'rbac:manage_process_roles', 'rbac:manage_queues', 'audit:view_logs'], isSystem: true },
  { id: 'r_2', name: 'NCLOS ADMIN', desc: 'Quản trị quy trình NCLOS, cấu hình hàng đợi và ủy quyền tác vụ', userCount: 18, type: 'Process Admin', permissions: ['process:view', 'process:deploy_camunda', 'instance:view', 'instance:suspend', 'instance:resume', 'task:reassign_officer', 'rbac:manage_queues'] },
  { id: 'r_3', name: 'NCLOS CA', desc: 'Chuyên gia phê duyệt cấp tín dụng doanh nghiệp (Credit Approver)', userCount: 42, type: 'Credit Business', permissions: ['task:view_assigned', 'task:approve_form', 'task:reject_form', 'task:sendback_amend', 'instance:view'] },
  { id: 'r_4', name: 'NCLOS B CO', desc: 'Cán bộ thẩm định khoản vay (Credit Officer) tiếp nhận và đề xuất', userCount: 164, type: 'Credit Business', permissions: ['task:view_assigned', 'task:claim_from_queue', 'task:approve_form', 'task:sendback_amend'] },
  { id: 'r_5', name: 'NCLOS B KS2', desc: 'Kiểm soát viên tín dụng cấp 2 kiểm tra tính hợp lệ pháp lý', userCount: 88, type: 'Compliance & Control', permissions: ['task:view_assigned', 'task:approve_form', 'task:sendback_amend', 'audit:view_logs'] },
  { id: 'r_6', name: 'NCLOS B TLCO', desc: 'Team Lead phân bổ hồ sơ và điều phối tải làm việc', userCount: 36, type: 'Operations Lead', permissions: ['task:view_assigned', 'task:claim_from_queue', 'task:reassign_officer', 'instance:view'] },
  { id: 'r_7', name: 'NCLOS SALE', desc: 'Cán bộ quản lý quan hệ khách hàng doanh nghiệp (RM/Sale)', userCount: 300, type: 'Front-Office', permissions: ['process:view', 'task:view_assigned', 'task:approve_form'] },
  { id: 'r_8', name: 'NCLOS FA', desc: 'Cán bộ đề xuất thực địa và giám định tài sản bảo đảm', userCount: 54, type: 'Field Officer', permissions: ['task:view_assigned', 'task:approve_form'] },
  { id: 'r_9', name: 'NCLOS B TK', desc: 'Thư ký Hội đồng tín dụng phụ trách biên bản nghị quyết', userCount: 22, type: 'Secretariat', permissions: ['task:view_assigned', 'task:approve_form', 'process:export_xml'] },
  { id: 'r_10', name: 'AUDITOR', desc: 'Kiểm toán nội bộ và giám sát tuân thủ vận hành BPM', userCount: 12, type: 'Audit & Compliance', permissions: ['audit:view_logs', 'audit:export_csv', 'instance:view'] },
];

const INITIAL_PERMISSIONS_CATALOGUE: PermissionCatalogueItem[] = [
  // Modeler
  { id: 'p_1', module: 'Modeler (BPMN 2.0)', name: 'process:view', description: 'Xem lược đồ BPMN và cấu hình chi tiết', auditLogged: false, grantedRoles: ['SUPER_ADMIN', 'NCLOS ADMIN', 'NCLOS SALE'] },
  { id: 'p_2', module: 'Modeler (BPMN 2.0)', name: 'process:create', description: 'Tạo mới phiên bản định nghĩa quy trình', auditLogged: true, grantedRoles: ['SUPER_ADMIN', 'NCLOS ADMIN'] },
  { id: 'p_3', module: 'Modeler (BPMN 2.0)', name: 'process:edit_bpmn', description: 'Chỉnh sửa nút, gateway, luồng thực thi', auditLogged: true, grantedRoles: ['SUPER_ADMIN'] },
  { id: 'p_4', module: 'Modeler (BPMN 2.0)', name: 'process:deploy_camunda', description: 'Deploy gói quy trình lên Camunda 8 Engine', auditLogged: true, grantedRoles: ['SUPER_ADMIN', 'NCLOS ADMIN'] },
  { id: 'p_5', module: 'Modeler (BPMN 2.0)', name: 'process:deploy_flowable', description: 'Deploy gói quy trình lên Flowable Engine', auditLogged: true, grantedRoles: ['SUPER_ADMIN'] },
  { id: 'p_6', module: 'Modeler (BPMN 2.0)', name: 'process:export_xml', description: 'Xuất file XML BPMN 2.0 chuẩn ISO', auditLogged: false, grantedRoles: ['SUPER_ADMIN', 'NCLOS B TK'] },
  { id: 'p_7', module: 'Modeler (BPMN 2.0)', name: 'process:version_compare', description: 'So sánh khác biệt semantic giữa các phiên bản', auditLogged: false, grantedRoles: ['SUPER_ADMIN', 'NCLOS ADMIN'] },
  // Instances & Task Operations
  { id: 'p_8', module: 'Task Operations & Instances', name: 'instance:view', description: 'Xem chi tiết instance, luồng biến và token', auditLogged: false, grantedRoles: ['SUPER_ADMIN', 'NCLOS ADMIN', 'NCLOS CA', 'NCLOS B TLCO', 'AUDITOR'] },
  { id: 'p_9', module: 'Task Operations & Instances', name: 'instance:suspend', description: 'Tạm dừng quy trình đang chạy khi nghi ngờ rủi ro', auditLogged: true, grantedRoles: ['SUPER_ADMIN', 'NCLOS ADMIN'] },
  { id: 'p_10', module: 'Task Operations & Instances', name: 'instance:resume', description: 'Tiếp tục thực thi quy trình sau khi tạm dừng', auditLogged: true, grantedRoles: ['SUPER_ADMIN', 'NCLOS ADMIN'] },
  { id: 'p_11', module: 'Task Operations & Instances', name: 'instance:cancel', description: 'Hủy bỏ và đóng phiên instance bất thường', auditLogged: true, grantedRoles: ['SUPER_ADMIN'] },
  { id: 'p_12', module: 'Task Operations & Instances', name: 'instance:migrate_version', description: 'Di chuyển token instance sang phiên bản BPMN mới', auditLogged: true, grantedRoles: ['SUPER_ADMIN'] },
  { id: 'p_13', module: 'Task Operations & Instances', name: 'task:retry_failed', description: 'Thử lại tác vụ Service Task bị lỗi giao tiếp API', auditLogged: true, grantedRoles: ['SUPER_ADMIN', 'NCLOS ADMIN'] },
  // Tasklist
  { id: 'p_14', module: 'Tasklist (End User)', name: 'task:view_assigned', description: 'Xem các tác vụ trong inbox cá nhân', auditLogged: false, grantedRoles: ['NCLOS CA', 'NCLOS B CO', 'NCLOS B KS2', 'NCLOS B TLCO', 'NCLOS SALE', 'NCLOS FA', 'NCLOS B TK'] },
  { id: 'p_15', module: 'Tasklist (End User)', name: 'task:claim_from_queue', description: 'Tiếp nhận tác vụ từ hàng đợi chung của phòng ban', auditLogged: true, grantedRoles: ['NCLOS B CO', 'NCLOS B TLCO'] },
  { id: 'p_16', module: 'Tasklist (End User)', name: 'task:approve_form', description: 'Phê duyệt form và hoàn thành tác vụ người dùng', auditLogged: true, grantedRoles: ['NCLOS CA', 'NCLOS B CO', 'NCLOS B KS2', 'NCLOS SALE', 'NCLOS FA', 'NCLOS B TK'] },
  { id: 'p_17', module: 'Tasklist (End User)', name: 'task:reject_form', description: 'Từ chối cấp tín dụng và dừng hồ sơ', auditLogged: true, grantedRoles: ['NCLOS CA'] },
  { id: 'p_18', module: 'Tasklist (End User)', name: 'task:sendback_amend', description: 'Yêu cầu bổ sung hồ sơ và trả về bước trước', auditLogged: true, grantedRoles: ['NCLOS CA', 'NCLOS B CO', 'NCLOS B KS2'] },
  { id: 'p_19', module: 'Tasklist (End User)', name: 'task:reassign_officer', description: 'Điều chuyển tác vụ sang cán bộ xử lý khác', auditLogged: true, grantedRoles: ['SUPER_ADMIN', 'NCLOS ADMIN', 'NCLOS B TLCO'] },
  // RBAC & Access Control
  { id: 'p_20', module: 'RBAC & Access Control', name: 'rbac:manage_process_roles', description: 'Phân quyền vai trò theo bước quy trình', auditLogged: true, grantedRoles: ['SUPER_ADMIN'] },
  { id: 'p_21', module: 'RBAC & Access Control', name: 'rbac:manage_queues', description: 'Cấu hình và tạo mới hàng đợi tác vụ', auditLogged: true, grantedRoles: ['SUPER_ADMIN', 'NCLOS ADMIN'] },
  { id: 'p_22', module: 'RBAC & Access Control', name: 'rbac:edit_rule_expression', description: 'Biên tập biểu thức phân bổ FEEL / SpEL', auditLogged: true, grantedRoles: ['SUPER_ADMIN'] },
  { id: 'p_23', module: 'RBAC & Access Control', name: 'audit:view_logs', description: 'Tra cứu nhật ký an ninh và xác thực', auditLogged: false, grantedRoles: ['SUPER_ADMIN', 'NCLOS B KS2', 'AUDITOR'] },
  { id: 'p_24', module: 'RBAC & Access Control', name: 'audit:export_csv', description: 'Xuất file chứng từ audit log phục vụ thanh tra', auditLogged: true, grantedRoles: ['SUPER_ADMIN', 'AUDITOR'] }
];

const INITIAL_RESOURCES: SystemResourceItem[] = [
  { id: 'res_1', name: 'NCLOS Workflow Engine API', type: 'Workflow Engine API', status: 'ONLINE', latency: '24ms', lastPing: '19/05/2026 14:27', tenantScope: 'Global Cluster' },
  { id: 'res_2', name: 'SDD Disbursement Core Service', type: 'Core Service', status: 'ONLINE', latency: '18ms', lastPing: '19/05/2026 14:26', tenantScope: 'Khối Tín Dụng SME' },
  { id: 'res_3', name: 'PSCF TaskView Endpoint Gateway', type: 'BPM Endpoint', status: 'ONLINE', latency: '32ms', lastPing: '19/05/2026 14:25', tenantScope: 'Khối Bán Lẻ & Mạng Lưới' },
  { id: 'res_4', name: 'Camunda 8 Zeebe Broker Cluster', type: 'Queue Broker', status: 'ONLINE', latency: '12ms', lastPing: '19/05/2026 14:27', tenantScope: 'Global Infrastructure' },
  { id: 'res_5', name: 'Flowable Engine Standby Cluster', type: 'Workflow Engine API', status: 'ONLINE', latency: '15ms', lastPing: '19/05/2026 14:27', tenantScope: 'Failover Site' },
  { id: 'res_6', name: 'DMN FEEL Business Rule Evaluator', type: 'Core Service', status: 'ONLINE', latency: '8ms', lastPing: '19/05/2026 14:27', tenantScope: 'Global Cluster' }
];

const INITIAL_SERVICE_ACCOUNTS: ServiceAccountItem[] = [
  { id: 'sa_1', name: 'sa-camunda-worker@ecmbpm', email: 'sa-camunda-worker@ecmbpm.vn', status: 'VALID', certExpiry: '15/12/2026', mTLSKey: 'SHA256:4a8b...9f21', lastUsed: '2 phút trước', scope: 'Engine Execution & Task Polling' },
  { id: 'sa_2', name: 'sa-flowable-sync@ecmbpm', email: 'sa-flowable-sync@ecmbpm.vn', status: 'VALID', certExpiry: '20/11/2026', mTLSKey: 'SHA256:8e11...3c44', lastUsed: '5 phút trước', scope: 'State Replication & Dual-Run' },
  { id: 'sa_3', name: 'sa-notification-push@ecmbpm', email: 'sa-notification-push@ecmbpm.vn', status: 'VALID', certExpiry: '30/10/2026', mTLSKey: 'SHA256:f19c...28a0', lastUsed: '12 phút trước', scope: 'Webhook & Mobile Push SLA' },
  { id: 'sa_4', name: 'sa-credit-scoring-gateway@ecmbpm', email: 'sa-credit-scoring@ecmbpm.vn', status: 'EXPIRING', certExpiry: '02/06/2026', mTLSKey: 'SHA256:e3b0...c419', lastUsed: '1 giờ trước', scope: 'CIC & Internal Rating Integration' },
  { id: 'sa_5', name: 'sa-document-vault-signer@ecmbpm', email: 'sa-doc-signer@ecmbpm.vn', status: 'VALID', certExpiry: '28/01/2027', mTLSKey: 'SHA256:91a2...77ee', lastUsed: '3 giờ trước', scope: 'Digital Signature & Archival' }
];

export const IdentityModule: React.FC = () => {
  const [subView, setSubView] = useState<'dashboard' | 'users' | 'roles' | 'permissions' | 'resources' | 'audit'>('dashboard');
  const [userList, setUserList] = useState<UserAccount[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LOCKED'>('ALL');
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newFullName, setNewFullName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('NCLOS B CO');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Batch Operations State
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSelectionDropdownOpen, setIsSelectionDropdownOpen] = useState<boolean>(false);
  const [bulkActionModal, setBulkActionModal] = useState<'roles' | 'permissions' | 'department' | 'security' | 'delete' | null>(null);
  const [bulkTargetRole, setBulkTargetRole] = useState<string>('NCLOS B CO');
  const [bulkRoleMode, setBulkRoleMode] = useState<'add' | 'replace' | 'remove'>('add');
  const [bulkTargetDept, setBulkTargetDept] = useState<string>('Khối Tín Dụng SME');
  const [bulkResetPw, setBulkResetPw] = useState<boolean>(true);
  const [bulkEnforce2fa, setBulkEnforce2fa] = useState<boolean>(true);
  const [bulkRevokeSessions, setBulkRevokeSessions] = useState<boolean>(true);
  const [bulkSelectedPerms, setBulkSelectedPerms] = useState<string[]>([]);
  const [bulkPermMode, setBulkPermMode] = useState<'grant' | 'revoke'>('grant');

  // Roles Batch Operations State
  const [rolesList, setRolesList] = useState<RoleItem[]>(INITIAL_ROLE_ITEMS);
  const [selectedRoleNames, setSelectedRoleNames] = useState<string[]>([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState<string>('');
  const [roleTypeFilter, setRoleTypeFilter] = useState<string>('ALL');
  const [roleViewMode, setRoleViewMode] = useState<'table' | 'grid'>('table');
  const [bulkRoleActionModal, setBulkRoleActionModal] = useState<'grantPerms' | 'changeType' | 'delete' | 'assignToUsers' | null>(null);
  const [bulkRoleTargetPerms, setBulkRoleTargetPerms] = useState<string[]>([]);
  const [bulkRoleTargetType, setBulkRoleTargetType] = useState<string>('Credit Business');
  const [bulkRoleTargetUsers, setBulkRoleTargetUsers] = useState<string[]>([]);
  const [bulkRoleAssignMode, setBulkRoleAssignMode] = useState<'add' | 'remove' | 'replace'>('add');

  // Permissions Batch Operations State
  const [permissionsList, setPermissionsList] = useState<PermissionCatalogueItem[]>(INITIAL_PERMISSIONS_CATALOGUE);
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);
  const [permSearchTerm, setPermSearchTerm] = useState<string>('');
  const [permModuleFilter, setPermModuleFilter] = useState<string>('ALL');
  const [bulkPermActionModal, setBulkPermActionModal] = useState<'assignToRole' | 'revokeFromRole' | 'assignToUsers' | null>(null);
  const [bulkPermTargetRole, setBulkPermTargetRole] = useState<string>('NCLOS B CO');
  const [bulkPermTargetUsers, setBulkPermTargetUsers] = useState<string[]>([]);
  const [bulkPermDirectMode, setBulkPermDirectMode] = useState<'grant' | 'revoke'>('grant');

  // Resources & Service Accounts Batch Operations State
  const [resourcesList, setResourcesList] = useState<SystemResourceItem[]>(INITIAL_RESOURCES);
  const [serviceAccountsList, setServiceAccountsList] = useState<ServiceAccountItem[]>(INITIAL_SERVICE_ACCOUNTS);
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [selectedSaIds, setSelectedSaIds] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleUserLock = (userId: string) => {
    setUserList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
        showToast(`Đã ${nextStatus === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản "${u.username}" thành công!`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleCreateUser = () => {
    if (!newUsername || !newFullName) return;
    const newUser: UserAccount = {
      id: `u_${Date.now()}`,
      username: newUsername,
      fullName: newFullName,
      email: newEmail || `${newUsername}@ecmbpm.vn`,
      department: 'Khối Tín Dụng SME',
      roles: [newRole],
      status: 'ACTIVE',
      lastLogin: 'Chưa đăng nhập',
    };
    setUserList([newUser, ...userList]);
    setShowAddUserModal(false);
    setNewUsername('');
    setNewFullName('');
    setNewEmail('');
    showToast(`Đã tạo mới tài khoản "${newUsername}" thành công!`);
  };

  const filteredUsers = userList.filter(u => {
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = 
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.roles.some(r => r.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const activeCount = userList.filter(u => u.status === 'ACTIVE').length;
  const lockedCount = userList.filter(u => u.status === 'LOCKED').length;

  // Selection handlers
  const handleToggleSelectAll = () => {
    const filteredIds = filteredUsers.map(u => u.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every(id => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedUserIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleUser = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectActiveOnly = () => {
    const activeIds = filteredUsers.filter(u => u.status === 'ACTIVE').map(u => u.id);
    setSelectedUserIds(activeIds);
    setIsSelectionDropdownOpen(false);
    showToast(`Đã chọn ${activeIds.length} tài khoản đang Active.`);
  };

  const handleSelectLockedOnly = () => {
    const lockedIds = filteredUsers.filter(u => u.status === 'LOCKED').map(u => u.id);
    setSelectedUserIds(lockedIds);
    setIsSelectionDropdownOpen(false);
    showToast(`Đã chọn ${lockedIds.length} tài khoản đang bị Khóa.`);
  };

  const handleInvertSelection = () => {
    const filteredIds = filteredUsers.map(u => u.id);
    const inverted = filteredIds.filter(id => !selectedUserIds.includes(id));
    setSelectedUserIds(inverted);
    setIsSelectionDropdownOpen(false);
    showToast(`Đã đảo ngược lựa chọn (${inverted.length} tài khoản).`);
  };

  const handleClearSelection = () => {
    setSelectedUserIds([]);
    setIsSelectionDropdownOpen(false);
  };

  // Bulk actions
  const handleBulkLock = (targetStatus: 'ACTIVE' | 'LOCKED') => {
    if (selectedUserIds.length === 0) return;
    setUserList(prev => prev.map(u => {
      if (selectedUserIds.includes(u.id)) {
        return { ...u, status: targetStatus };
      }
      return u;
    }));
    showToast(`Đã ${targetStatus === 'LOCKED' ? 'khóa' : 'mở khóa'} thành công ${selectedUserIds.length} tài khoản người dùng!`);
  };

  const handleBulkApplyRoles = () => {
    if (selectedUserIds.length === 0 || !bulkTargetRole) return;
    setUserList(prev => prev.map(u => {
      if (!selectedUserIds.includes(u.id)) return u;
      let newRoles = [...u.roles];
      if (bulkRoleMode === 'add') {
        if (!newRoles.includes(bulkTargetRole)) {
          newRoles.push(bulkTargetRole);
        }
      } else if (bulkRoleMode === 'replace') {
        newRoles = [bulkTargetRole];
      } else if (bulkRoleMode === 'remove') {
        newRoles = newRoles.filter(r => r !== bulkTargetRole);
        if (newRoles.length === 0) {
          newRoles = ['NCLOS B CO']; // default fallback
        }
      }
      return { ...u, roles: newRoles };
    }));
    setBulkActionModal(null);
    showToast(`Đã cập nhật vai trò "${bulkTargetRole}" cho ${selectedUserIds.length} người dùng theo chế độ ${bulkRoleMode === 'add' ? 'Thêm mới' : bulkRoleMode === 'replace' ? 'Ghi đè' : 'Gỡ bỏ'}!`);
  };

  const handleBulkApplyDept = () => {
    if (selectedUserIds.length === 0 || !bulkTargetDept) return;
    setUserList(prev => prev.map(u => {
      if (selectedUserIds.includes(u.id)) {
        return { ...u, department: bulkTargetDept };
      }
      return u;
    }));
    setBulkActionModal(null);
    showToast(`Đã điều chuyển ${selectedUserIds.length} người dùng sang phòng ban "${bulkTargetDept}"!`);
  };

  const handleBulkApplySecurity = () => {
    if (selectedUserIds.length === 0) return;
    const actions: string[] = [];
    if (bulkResetPw) actions.push('Gửi email đặt lại mật khẩu');
    if (bulkEnforce2fa) actions.push('Bắt buộc 2FA');
    if (bulkRevokeSessions) actions.push('Hủy phiên đăng nhập');
    setBulkActionModal(null);
    showToast(`Đã thực thi an ninh cho ${selectedUserIds.length} tài khoản (${actions.join(', ')})!`);
  };

  const handleBulkDelete = (permanent: boolean) => {
    if (selectedUserIds.length === 0) return;
    const count = selectedUserIds.length;
    setUserList(prev => prev.filter(u => !selectedUserIds.includes(u.id)));
    setSelectedUserIds([]);
    setBulkActionModal(null);
    showToast(permanent 
      ? `Đã xóa vĩnh viễn ${count} tài khoản khỏi hệ thống tenant!` 
      : `Đã lưu trữ an toàn ${count} tài khoản người dùng!`
    );
  };

  const handleBulkExportCsv = () => {
    const selectedUsers = userList.filter(u => selectedUserIds.includes(u.id));
    if (selectedUsers.length === 0) return;
    
    const headers = ['ID', 'Username', 'FullName', 'Email', 'Department', 'Roles', 'Status', 'LastLogin'];
    const rows = selectedUsers.map(u => [
      u.id,
      u.username,
      `"${u.fullName.replace(/"/g, '""')}"`,
      u.email,
      `"${u.department.replace(/"/g, '""')}"`,
      `"${u.roles.join('; ')}"`,
      u.status,
      `"${u.lastLogin}"`
    ]);
    
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecm_users_bulk_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`Đã xuất file CSV thành công cho ${selectedUsers.length} tài khoản được chọn!`);
  };

  // Direct Permissions for Users
  const handleBulkApplyPermissions = () => {
    if (selectedUserIds.length === 0 || bulkSelectedPerms.length === 0) return;
    setUserList(prev => prev.map(u => {
      if (!selectedUserIds.includes(u.id)) return u;
      const currentPerms = u.directPermissions || [];
      let nextPerms: string[];
      if (bulkPermMode === 'grant') {
        nextPerms = Array.from(new Set([...currentPerms, ...bulkSelectedPerms]));
      } else {
        nextPerms = currentPerms.filter(p => !bulkSelectedPerms.includes(p));
      }
      return { ...u, directPermissions: nextPerms };
    }));
    const count = selectedUserIds.length;
    setBulkActionModal(null);
    showToast(`Đã ${bulkPermMode === 'grant' ? 'gán' : 'thu hồi'} ${bulkSelectedPerms.length} quyền hạn trực tiếp cho ${count} người dùng!`);
  };

  // ==================== ROLES BATCH HANDLERS ====================
  const filteredRoles = rolesList.filter(r => {
    if (roleTypeFilter !== 'ALL' && r.type !== roleTypeFilter) return false;
    if (roleSearchTerm.trim()) {
      const q = roleSearchTerm.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
    }
    return true;
  });

  const handleToggleSelectAllRoles = () => {
    const ids = filteredRoles.map(r => r.name);
    const allSelected = ids.length > 0 && ids.every(id => selectedRoleNames.includes(id));
    if (allSelected) {
      setSelectedRoleNames(prev => prev.filter(n => !ids.includes(n)));
    } else {
      setSelectedRoleNames(prev => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleToggleRole = (roleName: string) => {
    setSelectedRoleNames(prev => 
      prev.includes(roleName) ? prev.filter(r => r !== roleName) : [...prev, roleName]
    );
  };

  const handleBulkGrantPermsToRoles = (mode: 'grant' | 'revoke') => {
    if (selectedRoleNames.length === 0 || bulkRoleTargetPerms.length === 0) return;
    setRolesList(prev => prev.map(r => {
      if (!selectedRoleNames.includes(r.name)) return r;
      let nextPerms: string[];
      if (mode === 'grant') {
        nextPerms = Array.from(new Set([...r.permissions, ...bulkRoleTargetPerms]));
      } else {
        nextPerms = r.permissions.filter(p => !bulkRoleTargetPerms.includes(p));
      }
      return { ...r, permissions: nextPerms };
    }));
    setBulkRoleActionModal(null);
    showToast(`Đã ${mode === 'grant' ? 'bổ sung' : 'gỡ bỏ'} ${bulkRoleTargetPerms.length} quyền cho ${selectedRoleNames.length} vai trò!`);
  };

  const handleBulkChangeRolesType = () => {
    if (selectedRoleNames.length === 0 || !bulkRoleTargetType) return;
    setRolesList(prev => prev.map(r => {
      if (!selectedRoleNames.includes(r.name)) return r;
      return { ...r, type: bulkRoleTargetType };
    }));
    setBulkRoleActionModal(null);
    showToast(`Đã chuyển phân loại sang "${bulkRoleTargetType}" cho ${selectedRoleNames.length} vai trò!`);
  };

  const handleBulkUpdateRoleAssignmentsToUsers = () => {
    if (selectedRoleNames.length === 0 || bulkRoleTargetUsers.length === 0) return;
    setUserList(prev => prev.map(u => {
      if (!bulkRoleTargetUsers.includes(u.id)) return u;
      let nextRoles: string[];
      if (bulkRoleAssignMode === 'add') {
        nextRoles = Array.from(new Set([...u.roles, ...selectedRoleNames]));
      } else if (bulkRoleAssignMode === 'remove') {
        nextRoles = u.roles.filter(r => !selectedRoleNames.includes(r));
      } else {
        nextRoles = [...selectedRoleNames];
      }
      return { ...u, roles: nextRoles };
    }));

    setRolesList(prev => prev.map(r => {
      const count = userList.filter(u => {
        if (bulkRoleTargetUsers.includes(u.id)) {
          if (bulkRoleAssignMode === 'add') return u.roles.includes(r.name) || selectedRoleNames.includes(r.name);
          if (bulkRoleAssignMode === 'remove') return u.roles.includes(r.name) && !selectedRoleNames.includes(r.name);
          return selectedRoleNames.includes(r.name);
        }
        return u.roles.includes(r.name);
      }).length;
      return { ...r, userCount: count };
    }));

    setBulkRoleActionModal(null);
    showToast(`Đã ${bulkRoleAssignMode === 'add' ? 'gán' : bulkRoleAssignMode === 'remove' ? 'thu hồi' : 'ghi đè'} ${selectedRoleNames.length} vai trò cho ${bulkRoleTargetUsers.length} người dùng!`);
  };

  const handleBulkDeleteRoles = () => {
    if (selectedRoleNames.length === 0) return;
    const systemRoles = selectedRoleNames.filter(name => {
      const r = rolesList.find(item => item.name === name);
      return r?.isSystem;
    });
    const deletable = selectedRoleNames.filter(name => {
      const r = rolesList.find(item => item.name === name);
      return !r?.isSystem;
    });
    if (deletable.length === 0) {
      showToast(`Không thể xóa vì toàn bộ vai trò đã chọn (${systemRoles.join(', ')}) là vai trò hệ thống (System Roles) được bảo vệ!`);
      setBulkRoleActionModal(null);
      return;
    }
    setRolesList(prev => prev.filter(r => !deletable.includes(r.name)));
    setUserList(prev => prev.map(u => ({
      ...u,
      roles: u.roles.filter(r => !deletable.includes(r))
    })));
    setSelectedRoleNames([]);
    setBulkRoleActionModal(null);
    if (systemRoles.length > 0) {
      showToast(`Đã xóa ${deletable.length} vai trò tùy chỉnh. Đã bảo vệ và giữ lại ${systemRoles.length} vai trò hệ thống!`);
    } else {
      showToast(`Đã xóa thành công ${deletable.length} vai trò và cập nhật lại hồ sơ người dùng!`);
    }
  };

  const handleBulkExportRoles = () => {
    const targetRoles = rolesList.filter(r => selectedRoleNames.includes(r.name));
    if (targetRoles.length === 0) return;
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(targetRoles, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', jsonStr);
    dl.setAttribute('download', `ecm_roles_matrix_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
    showToast(`Đã xuất ma trận ${targetRoles.length} vai trò ra file JSON!`);
  };

  // ==================== PERMISSIONS BATCH HANDLERS ====================
  const filteredPerms = permissionsList.filter(p => {
    if (permModuleFilter !== 'ALL' && p.module !== permModuleFilter) return false;
    if (permSearchTerm.trim()) {
      const q = permSearchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.module.toLowerCase().includes(q);
    }
    return true;
  });

  const handleToggleSelectAllPerms = () => {
    const ids = filteredPerms.map(p => p.id);
    const allSelected = ids.length > 0 && ids.every(id => selectedPermIds.includes(id));
    if (allSelected) {
      setSelectedPermIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedPermIds(prev => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleTogglePerm = (id: string) => {
    setSelectedPermIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkAssignPermsToRole = () => {
    if (selectedPermIds.length === 0 || !bulkPermTargetRole) return;
    const permNames = permissionsList.filter(p => selectedPermIds.includes(p.id)).map(p => p.name);
    // Update role permissions
    setRolesList(prev => prev.map(r => {
      if (r.name === bulkPermTargetRole) {
        return { ...r, permissions: Array.from(new Set([...r.permissions, ...permNames])) };
      }
      return r;
    }));
    // Update catalogue granted roles
    setPermissionsList(prev => prev.map(p => {
      if (selectedPermIds.includes(p.id) && !p.grantedRoles.includes(bulkPermTargetRole)) {
        return { ...p, grantedRoles: [...p.grantedRoles, bulkPermTargetRole] };
      }
      return p;
    }));
    setBulkPermActionModal(null);
    showToast(`Đã gán ${permNames.length} quyền vào vai trò "${bulkPermTargetRole}"!`);
  };

  const handleBulkRevokePermsFromRole = () => {
    if (selectedPermIds.length === 0 || !bulkPermTargetRole) return;
    const permNames = permissionsList.filter(p => selectedPermIds.includes(p.id)).map(p => p.name);
    setRolesList(prev => prev.map(r => {
      if (r.name === bulkPermTargetRole) {
        return { ...r, permissions: r.permissions.filter(p => !permNames.includes(p)) };
      }
      return r;
    }));
    setPermissionsList(prev => prev.map(p => {
      if (selectedPermIds.includes(p.id)) {
        return { ...p, grantedRoles: p.grantedRoles.filter(r => r !== bulkPermTargetRole) };
      }
      return p;
    }));
    setBulkPermActionModal(null);
    showToast(`Đã thu hồi ${permNames.length} quyền khỏi vai trò "${bulkPermTargetRole}"!`);
  };

  const handleBulkToggleAuditLogging = (enable: boolean) => {
    if (selectedPermIds.length === 0) return;
    setPermissionsList(prev => prev.map(p => {
      if (selectedPermIds.includes(p.id)) {
        return { ...p, auditLogged: enable };
      }
      return p;
    }));
    showToast(`Đã ${enable ? 'kích hoạt' : 'tắt'} ghi nhận Audit Trace cho ${selectedPermIds.length} quyền hạn!`);
  };

  const handleBulkExportPerms = () => {
    const targetPerms = permissionsList.filter(p => selectedPermIds.includes(p.id));
    if (targetPerms.length === 0) return;
    const headers = ['ID', 'Module', 'PermissionName', 'Description', 'AuditLogged', 'GrantedRoles'];
    const rows = targetPerms.map(p => [
      p.id,
      `"${p.module}"`,
      p.name,
      `"${p.description}"`,
      p.auditLogged ? 'YES' : 'NO',
      `"${p.grantedRoles.join('; ')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const dl = document.createElement('a');
    dl.setAttribute('href', encodeURI(csvContent));
    dl.setAttribute('download', `ecm_permissions_bulk_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
    showToast(`Đã xuất CSV danh mục ${targetPerms.length} quyền hạn!`);
  };

  const handleBulkAssignPermsToUsers = () => {
    if (selectedPermIds.length === 0 || bulkPermTargetUsers.length === 0) return;
    const permNames = permissionsList.filter(p => selectedPermIds.includes(p.id)).map(p => p.name);
    setUserList(prev => prev.map(u => {
      if (!bulkPermTargetUsers.includes(u.id)) return u;
      const current = u.directPermissions || [];
      let next: string[];
      if (bulkPermDirectMode === 'grant') {
        next = Array.from(new Set([...current, ...permNames]));
      } else {
        next = current.filter(p => !permNames.includes(p));
      }
      return { ...u, directPermissions: next };
    }));
    setBulkPermActionModal(null);
    showToast(`Đã ${bulkPermDirectMode === 'grant' ? 'cấp trực tiếp' : 'thu hồi'} ${permNames.length} quyền cho ${bulkPermTargetUsers.length} tài khoản người dùng!`);
  };

  // ==================== RESOURCES & SA BATCH HANDLERS ====================
  const handleToggleSelectAllResources = () => {
    const ids = resourcesList.map(r => r.id);
    const all = ids.length > 0 && ids.every(id => selectedResourceIds.includes(id));
    setSelectedResourceIds(all ? [] : ids);
  };

  const handleToggleResource = (id: string) => {
    setSelectedResourceIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkSetResourceStatus = (status: 'ONLINE' | 'MAINTENANCE' | 'OFFLINE') => {
    if (selectedResourceIds.length === 0) return;
    setResourcesList(prev => prev.map(r => {
      if (selectedResourceIds.includes(r.id)) {
        return { ...r, status };
      }
      return r;
    }));
    showToast(`Đã chuyển trạng thái ${selectedResourceIds.length} tài nguyên sang ${status}!`);
  };

  const handleBulkPingResources = () => {
    if (selectedResourceIds.length === 0) return;
    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    setResourcesList(prev => prev.map(r => {
      if (selectedResourceIds.includes(r.id)) {
        const randLatency = Math.floor(Math.random() * 25) + 6;
        return { ...r, latency: `${randLatency}ms`, lastPing: `Hôm nay ${nowTime}` };
      }
      return r;
    }));
    showToast(`Đã gửi Ping Health Check đồng loạt tới ${selectedResourceIds.length} tài nguyên (Tất cả phản hồi tốt)!`);
  };

  const handleBulkExportResources = () => {
    const target = resourcesList.filter(r => selectedResourceIds.includes(r.id));
    if (target.length === 0) return;
    const headers = ['ID', 'ResourceName', 'Type', 'Status', 'Latency', 'LastPing', 'TenantScope'];
    const rows = target.map(r => [r.id, `"${r.name}"`, `"${r.type}"`, r.status, r.latency, `"${r.lastPing}"`, `"${r.tenantScope}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const dl = document.createElement('a');
    dl.setAttribute('href', encodeURI(csvContent));
    dl.setAttribute('download', `ecm_resources_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
    showToast(`Đã xuất file cấu hình ${target.length} tài nguyên!`);
  };

  const handleToggleSelectAllSa = () => {
    const ids = serviceAccountsList.map(s => s.id);
    const all = ids.length > 0 && ids.every(id => selectedSaIds.includes(id));
    setSelectedSaIds(all ? [] : ids);
  };

  const handleToggleSa = (id: string) => {
    setSelectedSaIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkRotateCertificates = () => {
    if (selectedSaIds.length === 0) return;
    const randomHex = () => Math.random().toString(16).substring(2, 6);
    setServiceAccountsList(prev => prev.map(sa => {
      if (selectedSaIds.includes(sa.id)) {
        const newKey = `SHA256:${randomHex()}${randomHex()}...${randomHex()}`;
        return { ...sa, status: 'VALID', mTLSKey: newKey, certExpiry: '06/11/2027', lastUsed: 'Vừa cấp lại cert mTLS' };
      }
      return sa;
    }));
    showToast(`Đã xoay vòng chứng chỉ mTLS cho ${selectedSaIds.length} Service Accounts thành công (Hạn mới 2027)!`);
  };

  const handleBulkRenewCertificates = () => {
    if (selectedSaIds.length === 0) return;
    setServiceAccountsList(prev => prev.map(sa => {
      if (selectedSaIds.includes(sa.id)) {
        return { ...sa, status: 'VALID', certExpiry: '15/12/2027' };
      }
      return sa;
    }));
    showToast(`Đã gia hạn chứng chỉ (+365 ngày) cho ${selectedSaIds.length} Service Accounts!`);
  };

  const handleBulkRevokeServiceAccounts = () => {
    if (selectedSaIds.length === 0) return;
    setServiceAccountsList(prev => prev.map(sa => {
      if (selectedSaIds.includes(sa.id)) {
        return { ...sa, status: 'REVOKED' };
      }
      return sa;
    }));
    showToast(`Đã thu hồi / khóa truy cập ${selectedSaIds.length} Service Accounts!`);
  };

  const handleBulkExportServiceAccounts = () => {
    const target = serviceAccountsList.filter(s => selectedSaIds.includes(s.id));
    if (target.length === 0) return;
    const headers = ['ID', 'SAName', 'Email', 'Status', 'CertExpiry', 'mTLSKey', 'LastUsed', 'Scope'];
    const rows = target.map(s => [s.id, `"${s.name}"`, s.email, s.status, s.certExpiry, `"${s.mTLSKey}"`, `"${s.lastUsed}"`, `"${s.scope}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const dl = document.createElement('a');
    dl.setAttribute('href', encodeURI(csvContent));
    dl.setAttribute('download', `ecm_service_accounts_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
    showToast(`Đã xuất thông số kết nối ${target.length} Service Accounts!`);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-white dark:bg-slate-900 select-none relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-3 right-1/2 translate-x-1/2 z-60 bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Horizontal Navigation (Refactored: Replaces redundant inner sidebar with breadcrumbs & top tabs) */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 px-6 pt-3 pb-0 shrink-0">
        {/* Interactive Breadcrumb System */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-2.5">
          <button 
            onClick={() => setSubView('dashboard')}
            className="hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer transition-colors"
          >
            Dashboard
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-slate-400">Foundation Services</span>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <button 
            onClick={() => setSubView('dashboard')}
            className="hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer font-semibold transition-colors"
          >
            Identity
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
            {subView === 'dashboard' ? 'Overview' : subView === 'users' ? 'User Management' : subView === 'roles' ? 'Roles Matrix' : subView === 'permissions' ? 'Permissions Catalogue' : subView === 'resources' ? 'Resources & Services' : 'Security Audit'}
          </span>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Fingerprint className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Identity &amp; Access Management (IAM)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Multi-Tenant SSO
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản trị người dùng, vai trò hệ thống, quyền hạn tài nguyên và giám sát nhật ký an ninh tập trung.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Người Dùng</span>
            </button>
          </div>
        </div>

        {/* Clean Modern Segmented Tabs Strip */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 shadow-2xs mb-2.5 w-fit flex-wrap">
          <button
            onClick={() => setSubView('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subView === 'dashboard'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setSubView('users')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subView === 'users'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Users</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold">
              616
            </span>
          </button>

          <button
            onClick={() => setSubView('roles')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subView === 'roles'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Roles</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold">
              40
            </span>
          </button>

          <button
            onClick={() => setSubView('permissions')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subView === 'permissions'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            <span>Permissions</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold">
              76
            </span>
          </button>

          <button
            onClick={() => setSubView('resources')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subView === 'resources'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>Resources</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold">
              36
            </span>
          </button>

          <button
            onClick={() => setSubView('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subView === 'audit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Audit Logs</span>
          </button>
        </div>
      </div>

      {/* Main Full-Width Content Container */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/40">
        {/* ==================================================== */}
        {/* VIEW 1: DASHBOARD                                   */}
        {/* ==================================================== */}
        {subView === 'dashboard' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Top Stat Cards Grid matching exact numbers in screenshot */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* TOTAL USERS */}
              <div 
                onClick={() => setSubView('users')}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-2xs hover:border-blue-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider">TOTAL USERS</span>
                  <Users className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-3xl font-extrabold text-blue-600 font-mono">616</p>
                <p className="text-[11px] text-slate-400 mt-1">Tổng tài khoản trong tenant</p>
              </div>

              {/* ACTIVE */}
              <div 
                onClick={() => { setStatusFilter('ACTIVE'); setSubView('users'); }}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-2xs hover:border-emerald-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider">ACTIVE</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-3xl font-extrabold text-emerald-600 font-mono">612</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">99.3% sẵn sàng xử lý</p>
              </div>

              {/* LOCKED */}
              <div 
                onClick={() => { setStatusFilter('LOCKED'); setSubView('users'); }}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-2xs hover:border-rose-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider">LOCKED</span>
                  <Lock className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-3xl font-extrabold text-rose-600 font-mono">2</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Đang khóa an ninh</p>
              </div>

              {/* ROLES */}
              <div 
                onClick={() => setSubView('roles')}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-2xs hover:border-amber-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider">ROLES</span>
                  <Shield className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-3xl font-extrabold text-amber-600 font-mono">40</p>
                <p className="text-[11px] text-slate-400 mt-1">Vai trò nghiệp vụ &amp; kỹ thuật</p>
              </div>
            </div>

            {/* Row 2 Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PERMISSIONS */}
              <div 
                onClick={() => setSubView('permissions')}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-2xs hover:border-purple-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider">PERMISSIONS</span>
                  <KeyRound className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-3xl font-extrabold text-purple-600 font-mono">76</p>
                <p className="text-[11px] text-slate-400 mt-1">Hành động được phân bổ chi tiết</p>
              </div>

              {/* RESOURCES */}
              <div 
                onClick={() => setSubView('resources')}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-2xs hover:border-blue-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider">RESOURCES</span>
                  <Cpu className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-3xl font-extrabold text-blue-500 font-mono">36</p>
                <p className="text-[11px] text-slate-400 mt-1">Process definitions, Queues &amp; APIs</p>
              </div>

              {/* ACTIVE SA */}
              <div 
                onClick={() => setSubView('resources')}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center shadow-2xs hover:border-orange-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider">ACTIVE SA</span>
                  <Server className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-3xl font-extrabold text-orange-600 font-mono">14</p>
                <p className="text-[11px] text-slate-400 mt-1">Service accounts tích hợp mTLS</p>
              </div>
            </div>

            {/* Quick Links Section matching image_4ed40de0.png */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Quick Links &amp; Phím Tắt Quản Trị</span>
                </h3>
                <span className="text-[11px] text-slate-400">Chọn cấu phần cần kiểm tra</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setSubView('users')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Quản lý Users ({userList.length})</span>
                </button>
                <button
                  onClick={() => setSubView('roles')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Ma trận Roles (40)</span>
                </button>
                <button
                  onClick={() => setSubView('permissions')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Danh mục Permissions (76)</span>
                </button>
                <button
                  onClick={() => setSubView('audit')}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Nhật Ký Audit Logs</span>
                </button>
              </div>
            </div>

            {/* Security Alert Banner */}
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                    Chính Sách Bảo Mật &amp; Multi-Tenant Đang Kích Hoạt
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                    Toàn bộ tài khoản và vai trò được cô lập hoàn toàn theo Tenant ID. Đã áp dụng xác thực 2 bước (2FA) và giám sát đăng nhập bất thường.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800">
                ACTIVE · 0 ALERT
              </span>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 2: USERS MANAGEMENT (Full-Width Table)         */}
        {/* ==================================================== */}
        {subView === 'users' && (
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    User Management (Danh Sách Người Dùng)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10.5px] font-bold font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {userList.length} users
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Quản lý tài khoản, phân quyền vai trò, chuyển phòng ban và thực hiện các thao tác lô an ninh tập trung.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedUserIds.length > 0 && (
                  <button
                    onClick={() => handleBulkExportCsv()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                    title="Xuất file CSV các tài khoản đang chọn"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Xuất CSV ({selectedUserIds.length})</span>
                  </button>
                )}
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm Người Dùng</span>
                </button>
              </div>
            </div>

            {/* Active Batch Operations Toolbar Banner (appears when users are selected) */}
            {selectedUserIds.length > 0 && (
              <div className="p-3 bg-emerald-50/95 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center justify-between flex-wrap gap-3 shadow-xs animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-700 text-white flex items-center justify-center text-xs font-bold font-mono">
                    {selectedUserIds.length}
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Batch Actions Toolbar: Đang chọn {selectedUserIds.length} / {filteredUsers.length} người dùng</span>
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                      Thao tác cập nhật vai trò, gán quyền trực tiếp hoặc xóa hàng loạt
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setBulkActionModal('roles')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Cập nhật vai trò hệ thống cho các người dùng được chọn"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>Cập Nhật Vai Trò</span>
                  </button>

                  <button
                    onClick={() => setBulkActionModal('permissions')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Gán trực tiếp danh mục quyền hạn (direct permissions) cho nhiều người dùng cùng lúc"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Gán Permissions Lô</span>
                  </button>

                  <button
                    onClick={() => setBulkActionModal('delete')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Xóa hoặc lưu trữ hàng loạt người dùng đã chọn"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Xóa Lô</span>
                  </button>

                  <button
                    onClick={() => handleBulkLock('LOCKED')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <Lock className="w-3 h-3 text-rose-500" />
                    <span>Khóa</span>
                  </button>

                  <button
                    onClick={() => handleBulkLock('ACTIVE')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <Unlock className="w-3 h-3 text-emerald-500" />
                    <span>Mở Khóa</span>
                  </button>

                  <button
                    onClick={() => setBulkActionModal('department')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <Building className="w-3 h-3 text-blue-500" />
                    <span>Đổi Phòng Ban</span>
                  </button>

                  <button
                    onClick={() => setBulkActionModal('security')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <Key className="w-3 h-3 text-purple-500" />
                    <span>Bảo Mật &amp; 2FA</span>
                  </button>

                  <button
                    onClick={handleClearSelection}
                    className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
                    title="Bỏ chọn tất cả"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
              {/* Search & Filter Toolbar */}
              <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
                <div className="relative w-80">
                  <input
                    type="text"
                    placeholder="Tìm theo tên, username, email, phòng ban..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs flex-wrap">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px] font-medium">Trạng thái:</span>
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                      <button
                        onClick={() => setStatusFilter('ALL')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          statusFilter === 'ALL' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Tất cả ({userList.length})
                      </button>
                      <button
                        onClick={() => setStatusFilter('ACTIVE')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          statusFilter === 'ACTIVE' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Active ({activeCount})
                      </button>
                      <button
                        onClick={() => setStatusFilter('LOCKED')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          statusFilter === 'LOCKED' ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Locked ({userList.length - activeCount})
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Width Table with Multi-Select Checkboxes */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold text-[11px] uppercase tracking-wider">
                    <tr>
                      {/* Master Checkbox Header with Quick-Select Dropdown */}
                      <th className="py-3 px-3 w-10 text-center relative">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={handleToggleSelectAll}
                            className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                            title={
                              filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.includes(u.id))
                                ? 'Bỏ chọn tất cả'
                                : 'Chọn tất cả hiển thị'
                            }
                          >
                            {filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.includes(u.id)) ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : filteredUsers.some(u => selectedUserIds.includes(u.id)) ? (
                              <MinusSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          
                          {/* Quick selection dropdown toggle */}
                          <button
                            type="button"
                            onClick={() => setIsSelectionDropdownOpen(!isSelectionDropdownOpen)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5 rounded"
                            title="Tùy chọn chọn lô nhanh"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Dropdown Menu for Bulk Selection Options */}
                        {isSelectionDropdownOpen && (
                          <div className="absolute left-2 top-9 z-50 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 text-left normal-case font-normal text-xs divide-y divide-slate-100 dark:divide-slate-800 animate-fade-in">
                            <div className="px-3 py-1.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                              Chọn nhanh người dùng
                            </div>
                            <div className="py-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const allIds = filteredUsers.map(u => u.id);
                                  setSelectedUserIds(allIds);
                                  setIsSelectionDropdownOpen(false);
                                  showToast(`Đã chọn toàn bộ ${allIds.length} người dùng đang hiển thị.`);
                                }}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200 cursor-pointer"
                              >
                                <span>Tất cả hiển thị</span>
                                <span className="text-[10px] font-mono text-slate-400 font-bold">{filteredUsers.length}</span>
                              </button>

                              <button
                                type="button"
                                onClick={handleSelectActiveOnly}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200 cursor-pointer"
                              >
                                <span>Chỉ chọn Active</span>
                                <span className="text-[10px] font-mono text-emerald-600 font-bold">{activeCount}</span>
                              </button>

                              <button
                                type="button"
                                onClick={handleSelectLockedOnly}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200 cursor-pointer"
                              >
                                <span>Chỉ chọn Locked</span>
                                <span className="text-[10px] font-mono text-rose-600 font-bold">{lockedCount}</span>
                              </button>
                            </div>

                            <div className="py-1">
                              <button
                                type="button"
                                onClick={handleInvertSelection}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                              >
                                Đảo ngược lựa chọn
                              </button>
                              <button
                                type="button"
                                onClick={handleClearSelection}
                                className="w-full px-3 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 cursor-pointer"
                              >
                                Bỏ chọn tất cả
                              </button>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className="py-3 px-4">Họ và Tên</th>
                      <th className="py-3 px-4">Tài Khoản / Email</th>
                      <th className="py-3 px-4">Phòng Ban Nghiệp Vụ</th>
                      <th className="py-3 px-4">Vai Trò Hệ Thống</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4">Lần Đăng Nhập Cuối</th>
                      <th className="py-3 px-4 text-center">Thao Tác Khóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-400">
                          Không tìm thấy người dùng nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(user => {
                        const isSelected = selectedUserIds.includes(user.id);
                        return (
                          <tr 
                            key={user.id} 
                            className={`transition-colors ${
                              isSelected 
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 font-medium' 
                                : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            {/* Row Selection Checkbox */}
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleUser(user.id)}
                                className="text-slate-500 hover:text-emerald-600 cursor-pointer"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                )}
                              </button>
                            </td>

                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-[11px] uppercase ${
                                  isSelected 
                                    ? 'bg-emerald-600 text-white shadow-xs' 
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}>
                                  {user.fullName.charAt(0)}
                                </div>
                                <span className={isSelected ? 'text-emerald-900 dark:text-emerald-200 font-bold' : ''}>
                                  {user.fullName}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-mono text-emerald-700 dark:text-emerald-400 block font-bold text-xs">
                                {user.username}
                              </span>
                              <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{user.email}</span>
                              </span>
                            </td>

                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-slate-400" />
                                <span>{user.department}</span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex gap-1.5 flex-wrap items-center">
                                {user.roles.map(r => (
                                  <span 
                                    key={r} 
                                    className="px-2 py-0.5 rounded text-[10.5px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                  >
                                    {r}
                                  </span>
                                ))}
                                {user.directPermissions && user.directPermissions.length > 0 && (
                                  <span 
                                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-help"
                                    title={`Direct Permissions: ${user.directPermissions.join(', ')}`}
                                  >
                                    +{user.directPermissions.length} direct perms
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold inline-flex items-center gap-1 ${
                                user.status === 'ACTIVE' 
                                  ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900' 
                                  : 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <span>{user.status}</span>
                              </span>
                            </td>

                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                              {user.lastLogin}
                            </td>

                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => toggleUserLock(user.id)}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  user.status === 'ACTIVE' 
                                    ? 'text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40' 
                                    : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950/40'
                                }`}
                                title={user.status === 'ACTIVE' ? 'Khóa tài khoản này' : 'Mở khóa tài khoản'}
                              >
                                {user.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 3: ROLES & PERMISSIONS MATRIX                  */}
        {/* ==================================================== */}
        {subView === 'roles' && (
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Roles &amp; Permissions Matrix ({rolesList.length} Vai Trò Hệ Thống)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10.5px] font-bold font-mono bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    RBAC Level 3
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Các vai trò được chuẩn hóa phân tầng theo nghiệp vụ tín dụng, giải ngân và quản trị nền tảng BPM.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkExportRoles}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Xuất Ma Trận ({selectedRoleNames.length > 0 ? selectedRoleNames.length : rolesList.length})</span>
                </button>
              </div>
            </div>

            {/* Active Batch Operations Toolbar for Roles */}
            {selectedRoleNames.length > 0 && (
              <div className="p-3 bg-amber-50/95 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-between flex-wrap gap-3 shadow-xs animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                    {selectedRoleNames.length}
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Batch Actions Toolbar: Đang chọn {selectedRoleNames.length} / {filteredRoles.length} vai trò</span>
                    </span>
                    <span className="text-amber-700 dark:text-amber-400 text-[11px]">
                      Cập nhật gán tài khoản người dùng, bổ sung quyền hạn, xóa vai trò hoặc xuất ma trận
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Bulk Role-Assignment Updates to Users */}
                  <button
                    onClick={() => {
                      setBulkRoleTargetUsers([]);
                      setBulkRoleAssignMode('add');
                      setBulkRoleActionModal('assignToUsers');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Cập nhật gán vai trò này cho các tài khoản người dùng"
                  >
                    <UserCheck className="w-3 h-3 text-amber-200" />
                    <span>Cập Nhật Gán Người Dùng</span>
                  </button>

                  {/* Bulk Grant/Revoke Permissions */}
                  <button
                    onClick={() => setBulkRoleActionModal('grantPerms')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-200 hover:bg-amber-100/50 dark:hover:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Gán bổ sung hoặc thu hồi quyền hạn cho các vai trò đã chọn"
                  >
                    <KeyRound className="w-3 h-3 text-amber-600" />
                    <span>Gán Permissions Lô</span>
                  </button>

                  {/* Bulk Change Category */}
                  <button
                    onClick={() => setBulkRoleActionModal('changeType')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Đổi nhóm phân loại cho các vai trò đã chọn"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-blue-500" />
                    <span>Đổi Nhóm Phân Loại</span>
                  </button>

                  {/* Bulk Export JSON */}
                  <button
                    onClick={handleBulkExportRoles}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Xuất ma trận vai trò ra JSON"
                  >
                    <Download className="w-3 h-3 text-emerald-500" />
                    <span>Xuất JSON</span>
                  </button>

                  {/* Bulk Deletion */}
                  <button
                    onClick={() => setBulkRoleActionModal('delete')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Xóa các vai trò tùy chỉnh đã chọn (tự động bảo vệ vai trò hệ thống)"
                  >
                    <Trash2 className="w-3 h-3 text-rose-600" />
                    <span>Xóa Lô</span>
                  </button>

                  {/* Clear Selection */}
                  <button
                    onClick={() => setSelectedRoleNames([])}
                    className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
                    title="Bỏ chọn tất cả"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Filter, Search & View Toggle Bar for Roles */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 flex items-center justify-between flex-wrap gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
                <button
                  type="button"
                  onClick={handleToggleSelectAllRoles}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  title="Chọn tất cả vai trò đang hiển thị"
                >
                  {filteredRoles.length > 0 && filteredRoles.every(r => selectedRoleNames.includes(r.name)) ? (
                    <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                  ) : filteredRoles.some(r => selectedRoleNames.includes(r.name)) ? (
                    <MinusSquare className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>Chọn tất cả ({filteredRoles.length})</span>
                </button>

                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Tìm vai trò theo tên, mô tả, phân nhóm..."
                    value={roleSearchTerm}
                    onChange={(e) => setRoleSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* View Switch: Table / Grid */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setRoleViewMode('table')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      roleViewMode === 'table'
                        ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="Xem dạng Bảng (Table View) với cột Checkbox"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Bảng Roles</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleViewMode('grid')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      roleViewMode === 'grid'
                        ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="Xem dạng Thẻ (Grid View)"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Thẻ Lưới</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="text-slate-400 text-[11px] font-medium">Nhóm:</span>
                  {['ALL', 'Credit Business', 'System Admin', 'Process Admin', 'Compliance & Control', 'Operations Lead', 'Front-Office'].map(type => (
                    <button
                      key={type}
                      onClick={() => setRoleTypeFilter(type)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        roleTypeFilter === type
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {type === 'ALL' ? 'Tất cả' : type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* TABULAR VIEW WITH SELECTION CHECKBOX COLUMN */}
            {roleViewMode === 'table' ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center">
                          <button
                            type="button"
                            onClick={handleToggleSelectAllRoles}
                            className="text-slate-600 dark:text-slate-300 hover:text-amber-600 cursor-pointer"
                            title="Chọn tất cả vai trò đang hiển thị"
                          >
                            {filteredRoles.length > 0 && filteredRoles.every(r => selectedRoleNames.includes(r.name)) ? (
                              <CheckSquare className="w-4 h-4 text-amber-600" />
                            ) : filteredRoles.some(r => selectedRoleNames.includes(r.name)) ? (
                              <MinusSquare className="w-4 h-4 text-amber-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </th>
                        <th className="py-3 px-4">Mã Vai Trò (Role Key)</th>
                        <th className="py-3 px-4">Mô Tả Chức Năng</th>
                        <th className="py-3 px-4">Phân Nhóm Nghiệp Vụ</th>
                        <th className="py-3 px-4 text-center">Tài Khoản Gán</th>
                        <th className="py-3 px-4">Quyền Hạn Áp Dụng (Permissions)</th>
                        <th className="py-3 px-4 text-center">Thao Tác Nhanh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredRoles.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                            Không tìm thấy vai trò phù hợp với bộ lọc hiện tại.
                          </td>
                        </tr>
                      ) : (
                        filteredRoles.map(role => {
                          const isSelected = selectedRoleNames.includes(role.name);
                          return (
                            <tr
                              key={role.id}
                              className={`transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-50/70 dark:bg-amber-950/30 font-medium'
                                  : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                              }`}
                              onClick={() => handleToggleRole(role.name)}
                            >
                              {/* Selection Checkbox Column */}
                              <td 
                                className="py-3 px-3 text-center" 
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleToggleRole(role.name)}
                                  className="text-slate-400 hover:text-amber-600 cursor-pointer"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-amber-600" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                  )}
                                </button>
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold font-mono text-amber-800 dark:text-amber-400 text-xs">
                                    {role.name}
                                  </span>
                                  {role.isSystem && (
                                    <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                                      SYSTEM
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4 max-w-xs text-slate-600 dark:text-slate-300">
                                <p className="line-clamp-2">{role.desc}</p>
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                                  {role.type}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRoleNames([role.name]);
                                    setBulkRoleTargetUsers([]);
                                    setBulkRoleAssignMode('add');
                                    setBulkRoleActionModal('assignToUsers');
                                  }}
                                  className="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 cursor-pointer transition-all inline-flex items-center gap-1"
                                  title="Nhấn để quản lý gán vai trò này cho người dùng"
                                >
                                  <Users className="w-3 h-3" />
                                  <span>{role.userCount} users</span>
                                </button>
                              </td>

                              <td className="py-3 px-4 max-w-sm">
                                <div className="flex flex-wrap items-center gap-1">
                                  {role.permissions.slice(0, 3).map(p => (
                                    <span
                                      key={p}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                    >
                                      {p}
                                    </span>
                                  ))}
                                  {role.permissions.length > 3 && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                                      +{role.permissions.length - 3} khác
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedRoleNames([role.name]);
                                      setBulkRoleActionModal('grantPerms');
                                    }}
                                    className="text-[10px] text-amber-700 dark:text-amber-400 hover:underline font-semibold ml-1 cursor-pointer"
                                  >
                                    + Gán quyền
                                  </button>
                                </div>
                              </td>

                              <td 
                                className="py-3 px-4 text-center whitespace-nowrap"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedRoleNames([role.name]);
                                      setBulkRoleTargetUsers([]);
                                      setBulkRoleAssignMode('add');
                                      setBulkRoleActionModal('assignToUsers');
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                                    title="Cập nhật gán người dùng"
                                  >
                                    <UserPlus className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedRoleNames([role.name]);
                                      setBulkRoleActionModal('grantPerms');
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                                    title="Quản lý quyền hạn (Permissions)"
                                  >
                                    <KeyRound className="w-3.5 h-3.5" />
                                  </button>
                                  {!role.isSystem && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedRoleNames([role.name]);
                                        setBulkRoleActionModal('delete');
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                      title="Xóa vai trò tùy chỉnh"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Grid View of Roles */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoles.map(role => {
                  const isSelected = selectedRoleNames.includes(role.name);
                  return (
                    <div 
                      key={role.id} 
                      className={`p-4 bg-white dark:bg-slate-900 border rounded-xl shadow-2xs space-y-2.5 transition-all relative ${
                        isSelected 
                          ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/10 dark:bg-amber-950/20' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-amber-400/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleRole(role.name)}
                            className="text-slate-400 hover:text-amber-600 cursor-pointer pt-0.5"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-amber-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-amber-800 dark:text-amber-400 text-xs font-mono">{role.name}</span>
                              {role.isSystem && (
                                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                                  SYSTEM
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Phân nhóm: {role.type}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRoleNames([role.name]);
                            setBulkRoleTargetUsers([]);
                            setBulkRoleAssignMode('add');
                            setBulkRoleActionModal('assignToUsers');
                          }}
                          className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer"
                          title="Cập nhật gán người dùng"
                        >
                          {role.userCount} users
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{role.desc}</p>

                      {/* Permissions summary pills */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Quyền hạn áp dụng ({role.permissions.length}):</span>
                          <span 
                            onClick={() => {
                              setSelectedRoleNames([role.name]);
                              setBulkRoleActionModal('grantPerms');
                            }}
                            className="text-amber-700 dark:text-amber-400 font-semibold cursor-pointer hover:underline text-[10.5px]"
                          >
                            + Gán thêm quyền
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 4).map(p => (
                            <span key={p} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {p}
                            </span>
                          ))}
                          {role.permissions.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                              +{role.permissions.length - 4} khác
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW 4: PERMISSIONS CATALOGUE                       */}
        {/* ==================================================== */}
        {subView === 'permissions' && (
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Permissions Catalogue ({permissionsList.length} Quyền Hạn Chi Tiết)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10.5px] font-bold font-mono bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    Atomic RBAC
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Chuẩn phân quyền hạt nhân, kiểm soát truy cập và bảo vệ API/Quy trình tác vụ hệ thống.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkExportPerms}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Xuất CSV ({selectedPermIds.length > 0 ? selectedPermIds.length : permissionsList.length})</span>
                </button>
              </div>
            </div>

            {/* Active Batch Operations Toolbar for Permissions */}
            {selectedPermIds.length > 0 && (
              <div className="p-3 bg-purple-50/95 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 rounded-xl flex items-center justify-between flex-wrap gap-3 shadow-xs animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-purple-700 text-white flex items-center justify-center text-xs font-bold font-mono">
                    {selectedPermIds.length}
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-purple-950 dark:text-purple-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Batch Actions Toolbar: Đang chọn {selectedPermIds.length} / {filteredPerms.length} quyền hạn</span>
                    </span>
                    <span className="text-purple-700 dark:text-purple-400 text-[11px]">
                      Gán quyền vào vai trò, thu hồi quyền hoặc bật/tắt Audit Trace hàng loạt
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setBulkPermActionModal('assignToRole')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Gán các quyền đã chọn cho một vai trò mục tiêu"
                  >
                    <Shield className="w-3 h-3 text-purple-200" />
                    <span>Gán Vào Vai Trò</span>
                  </button>

                  <button
                    onClick={() => setBulkPermActionModal('revokeFromRole')}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Thu hồi các quyền đã chọn khỏi một vai trò mục tiêu"
                  >
                    <UserX className="w-3 h-3 text-rose-500" />
                    <span>Thu Hồi Khỏi Role</span>
                  </button>

                  <button
                    onClick={() => {
                      setBulkPermTargetUsers([]);
                      setBulkPermDirectMode('grant');
                      setBulkPermActionModal('assignToUsers');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Cấp trực tiếp các quyền đã chọn cho tài khoản người dùng"
                  >
                    <UserPlus className="w-3 h-3 text-purple-600" />
                    <span>Gán Cho Người Dùng</span>
                  </button>

                  <button
                    onClick={() => handleBulkToggleAuditLogging(true)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Bật ghi nhận Audit Log cho tất cả quyền hạn đã chọn"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Bật Audit Trace</span>
                  </button>

                  <button
                    onClick={() => handleBulkToggleAuditLogging(false)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    title="Tắt ghi nhận Audit Log"
                  >
                    <span>Tắt Audit Trace</span>
                  </button>

                  <button
                    onClick={handleBulkExportPerms}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3 h-3 text-purple-500" />
                    <span>Xuất CSV</span>
                  </button>

                  <button
                    onClick={() => setSelectedPermIds([])}
                    className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
                    title="Bỏ chọn tất cả"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Filter & Search Bar for Permissions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 flex items-center justify-between flex-wrap gap-3 shadow-xs">
              <div className="relative w-80">
                <input
                  type="text"
                  placeholder="Tìm theo mã quyền hạn, mô tả, module..."
                  value={permSearchTerm}
                  onChange={(e) => setPermSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-slate-400 text-[11px] font-medium">Module:</span>
                {['ALL', 'Modeler (BPMN 2.0)', 'Task Operations & Instances', 'Tasklist (End User)', 'RBAC & Access Control'].map(mod => (
                  <button
                    key={mod}
                    onClick={() => setPermModuleFilter(mod)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      permModuleFilter === mod
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {mod === 'ALL' ? 'Tất cả' : mod.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions Table with Checkboxes */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">
                        <button
                          type="button"
                          onClick={handleToggleSelectAllPerms}
                          className="text-slate-600 dark:text-slate-300 hover:text-purple-600 cursor-pointer"
                          title="Chọn tất cả quyền đang hiển thị"
                        >
                          {filteredPerms.length > 0 && filteredPerms.every(p => selectedPermIds.includes(p.id)) ? (
                            <CheckSquare className="w-4 h-4 text-purple-600" />
                          ) : filteredPerms.some(p => selectedPermIds.includes(p.id)) ? (
                            <MinusSquare className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </th>
                      <th className="py-3 px-4">Mã Quyền Hạn (Permission Key)</th>
                      <th className="py-3 px-4">Cấu Phần (Module)</th>
                      <th className="py-3 px-4">Mô Tả Chức Năng</th>
                      <th className="py-3 px-4 text-center">Audit Trace</th>
                      <th className="py-3 px-4">Vai Trò Đang Sở Hữu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPerms.map(perm => {
                      const isSelected = selectedPermIds.includes(perm.id);
                      return (
                        <tr 
                          key={perm.id} 
                          className={`transition-colors ${
                            isSelected 
                              ? 'bg-purple-50/70 dark:bg-purple-950/30 font-medium' 
                              : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePerm(perm.id)}
                              className="text-slate-400 hover:text-purple-600 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-purple-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-purple-700 dark:text-purple-400 font-bold block text-xs">
                              {perm.name}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                            {perm.module}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">
                            {perm.description}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setPermissionsList(prev => prev.map(item => 
                                  item.id === perm.id ? { ...item, auditLogged: !item.auditLogged } : item
                                ));
                                showToast(`Đã ${!perm.auditLogged ? 'kích hoạt' : 'tắt'} Audit Trace cho "${perm.name}"!`);
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-all cursor-pointer ${
                                perm.auditLogged 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {perm.auditLogged ? 'GHI LOG' : 'TẮT'}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {perm.grantedRoles.map(r => (
                                <span 
                                  key={r}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                >
                                  {r}
                                </span>
                              ))}
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
        {/* VIEW 5: RESOURCES & SERVICE ACCOUNTS                */}
        {/* ==================================================== */}
        {subView === 'resources' && (
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    System Resources &amp; Active Service Accounts (mTLS)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10.5px] font-bold font-mono bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    Zero Trust mTLS
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Quản lý tài nguyên quy trình, API Endpoints và tài khoản dịch vụ (SA) tích hợp hệ thống.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkPingResources}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Health Check Toàn Bộ</span>
                </button>
              </div>
            </div>

            {/* PART 1: SYSTEM RESOURCES */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs space-y-3 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    Registered Process Resources &amp; API Endpoints ({resourcesList.length})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  {selectedResourceIds.length > 0 ? `Đã chọn ${selectedResourceIds.length} tài nguyên` : 'Chọn để thao tác lô'}
                </span>
              </div>

              {/* Active Batch Operations Toolbar for Resources */}
              {selectedResourceIds.length > 0 && (
                <div className="p-2.5 bg-blue-50/95 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 rounded-lg flex items-center justify-between flex-wrap gap-2 text-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-950 dark:text-blue-100 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Batch Actions ({selectedResourceIds.length} resources):</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleBulkSetResourceStatus('ONLINE')}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded font-semibold text-xs cursor-pointer shadow-2xs hover:bg-emerald-50"
                    >
                      Set ONLINE
                    </button>
                    <button
                      onClick={() => handleBulkSetResourceStatus('MAINTENANCE')}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 rounded font-semibold text-xs cursor-pointer shadow-2xs hover:bg-amber-50"
                    >
                      Set MAINTENANCE
                    </button>
                    <button
                      onClick={() => handleBulkSetResourceStatus('OFFLINE')}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 rounded font-semibold text-xs cursor-pointer shadow-2xs hover:bg-rose-50"
                    >
                      Set OFFLINE
                    </button>
                    <button
                      onClick={handleBulkPingResources}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <Activity className="w-3 h-3" />
                      <span>Ping Check Lô</span>
                    </button>
                    <button
                      onClick={handleBulkExportResources}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded font-semibold text-xs cursor-pointer shadow-2xs"
                    >
                      Xuất CSV
                    </button>
                    <button
                      onClick={() => setSelectedResourceIds([])}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Bỏ chọn"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Resources Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">
                        <button
                          type="button"
                          onClick={handleToggleSelectAllResources}
                          className="text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
                        >
                          {resourcesList.length > 0 && resourcesList.every(r => selectedResourceIds.includes(r.id)) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : resourcesList.some(r => selectedResourceIds.includes(r.id)) ? (
                            <MinusSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </th>
                      <th className="py-2.5 px-4">Tên Tài Nguyên</th>
                      <th className="py-2.5 px-4">Loại Hình</th>
                      <th className="py-2.5 px-4">Trạng Thái</th>
                      <th className="py-2.5 px-4">Độ Trễ</th>
                      <th className="py-2.5 px-4">Lần Ping Cuối</th>
                      <th className="py-2.5 px-4">Phạm Vi Tenant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {resourcesList.map(res => {
                      const isSelected = selectedResourceIds.includes(res.id);
                      return (
                        <tr 
                          key={res.id}
                          className={`transition-colors ${
                            isSelected 
                              ? 'bg-blue-50/70 dark:bg-blue-950/30 font-medium' 
                              : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleResource(res.id)}
                              className="text-slate-400 hover:text-blue-600 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                              )}
                            </button>
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                            {res.name}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                            {res.type}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              res.status === 'ONLINE'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : res.status === 'MAINTENANCE'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}>
                              {res.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                            {res.latency}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                            {res.lastPing}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                            {res.tenantScope}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PART 2: ACTIVE SERVICE ACCOUNTS (mTLS) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-xs space-y-3 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-orange-500" />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    Active Service Accounts (mTLS 1.3 Certified) ({serviceAccountsList.length})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  {selectedSaIds.length > 0 ? `Đã chọn ${selectedSaIds.length} SA` : 'Chọn để thao tác lô'}
                </span>
              </div>

              {/* Active Batch Operations Toolbar for Service Accounts */}
              {selectedSaIds.length > 0 && (
                <div className="p-2.5 bg-orange-50/95 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 rounded-lg flex items-center justify-between flex-wrap gap-2 text-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-950 dark:text-orange-100 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                      <span>Batch Actions ({selectedSaIds.length} SA):</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={handleBulkRotateCertificates}
                      className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded font-semibold text-xs cursor-pointer shadow-2xs flex items-center gap-1"
                      title="Tạo mới thumbprint và xoay vòng chứng chỉ mTLS"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Xoay Vòng mTLS Cert</span>
                    </button>
                    <button
                      onClick={handleBulkRenewCertificates}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded font-semibold text-xs cursor-pointer shadow-2xs hover:bg-slate-100"
                    >
                      Gia Hạn (+1 Năm)
                    </button>
                    <button
                      onClick={handleBulkRevokeServiceAccounts}
                      className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 rounded font-semibold text-xs cursor-pointer shadow-2xs"
                    >
                      Thu Hồi / Khóa SA
                    </button>
                    <button
                      onClick={handleBulkExportServiceAccounts}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded font-semibold text-xs cursor-pointer shadow-2xs"
                    >
                      Xuất Hồ Sơ mTLS
                    </button>
                    <button
                      onClick={() => setSelectedSaIds([])}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Bỏ chọn"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* SA Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">
                        <button
                          type="button"
                          onClick={handleToggleSelectAllSa}
                          className="text-slate-600 dark:text-slate-300 hover:text-orange-600 cursor-pointer"
                        >
                          {serviceAccountsList.length > 0 && serviceAccountsList.every(s => selectedSaIds.includes(s.id)) ? (
                            <CheckSquare className="w-4 h-4 text-orange-600" />
                          ) : serviceAccountsList.some(s => selectedSaIds.includes(s.id)) ? (
                            <MinusSquare className="w-4 h-4 text-orange-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </th>
                      <th className="py-2.5 px-4">Tài Khoản Dịch Vụ / Email</th>
                      <th className="py-2.5 px-4">Chứng Chỉ mTLS</th>
                      <th className="py-2.5 px-4">Hạn Chứng Chỉ</th>
                      <th className="py-2.5 px-4">Mã Khóa (Thumbprint)</th>
                      <th className="py-2.5 px-4">Lần Dùng Cuối</th>
                      <th className="py-2.5 px-4">Phạm Vi Quyền Hạn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {serviceAccountsList.map(sa => {
                      const isSelected = selectedSaIds.includes(sa.id);
                      return (
                        <tr 
                          key={sa.id}
                          className={`transition-colors ${
                            isSelected 
                              ? 'bg-orange-50/70 dark:bg-orange-950/30 font-medium' 
                              : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSa(sa.id)}
                              className="text-slate-400 hover:text-orange-600 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-orange-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                              )}
                            </button>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block">
                              {sa.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {sa.email}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              sa.status === 'VALID'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : sa.status === 'EXPIRING'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}>
                              {sa.status === 'VALID' ? 'CERT VALID' : sa.status === 'EXPIRING' ? 'EXPIRING SOON' : 'REVOKED'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            {sa.certExpiry}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                            {sa.mTLSKey}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                            {sa.lastUsed}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                            {sa.scope}
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
        {/* VIEW 6: SECURITY AUDIT LOGS                         */}
        {/* ==================================================== */}
        {subView === 'audit' && (
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Security &amp; Identity Audit Logs
                </h3>
                <p className="text-xs text-slate-500">
                  Lưu vết các thao tác xác thực, phân quyền vai trò và can thiệp quy trình an ninh.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Log Retention: 365 Days
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10.5px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Thời Gian</th>
                    <th className="py-2.5 px-4">Tài Khoản Thao Tác</th>
                    <th className="py-2.5 px-4">Hành Động An Ninh</th>
                    <th className="py-2.5 px-4">Chi Tiết / Đối Tượng Ảnh Hưởng</th>
                    <th className="py-2.5 px-4 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {[
                    { time: '19/05/2026 14:27:12', user: 'tambv (Bùi Văn Tâm)', action: 'DEPLOY_PROCESS', target: 'SDD v2.0 -> Camunda Engine Multi-Tenant', status: 'SUCCESS' },
                    { time: '19/05/2026 14:15:00', user: 'daohanh (Admin CoE)', action: 'ASSIGN_ROLE', target: 'Gán vai trò [NCLOS B CO] cho user lannt', status: 'SUCCESS' },
                    { time: '19/05/2026 13:50:22', user: 'system (Allocation Engine)', action: 'AUTO_ALLOCATION', target: 'Task 6755399452413089 -> [NCLOS B TLCO]', status: 'SUCCESS' },
                    { time: '19/05/2026 12:40:11', user: 'minhhp (Vận hành)', action: 'INTERVENE_MOVE', target: 'Instance 2251799825038320 -> Chuyển bước CHO XU LY', status: 'SUCCESS' },
                    { time: '19/05/2026 11:18:04', user: 'security_monitor', action: 'ACCOUNT_LOCK', target: 'Khóa tự động user test_user_02 do đăng nhập sai 5 lần', status: 'ALERT' },
                  ].map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{log.time}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{log.user}</td>
                      <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-semibold">{log.action}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-sans text-xs">{log.target}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Thêm Người Dùng Mới</span>
              </h3>
              <button 
                onClick={() => setShowAddUserModal(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Tên Đăng Nhập (Username)</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. hungnv"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-emerald-700"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Họ và Tên</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Nguyễn Văn Hùng"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email Công Vụ</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="hungnv@ecmbpm.vn"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Vai Trò Ban Đầu</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-semibold cursor-pointer"
                >
                  <option value="NCLOS B CO">NCLOS B CO (Cán bộ thẩm định khoản vay)</option>
                  <option value="NCLOS SALE">NCLOS SALE (Cán bộ quản lý quan hệ khách hàng)</option>
                  <option value="NCLOS CA">NCLOS CA (Chuyên gia phê duyệt cấp tín dụng)</option>
                  <option value="NCLOS B KS2">NCLOS B KS2 (Kiểm soát viên cấp 2)</option>
                  <option value="NCLOS B TLCO">NCLOS B TLCO (Team Lead phân bổ)</option>
                  <option value="NCLOS ADMIN">NCLOS ADMIN (Quản trị quy trình)</option>
                </select>
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button 
                onClick={() => setShowAddUserModal(false)} 
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={handleCreateUser} 
                className="px-4 py-1.5 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 cursor-pointer shadow-xs"
              >
                Lưu Người Dùng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* FLOATING BATCH ACTION DOCK                           */}
      {/* ==================================================== */}
      {selectedUserIds.length > 0 && subView === 'users' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-4xl w-[94%] sm:w-auto bg-slate-900/95 dark:bg-slate-950/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center justify-between gap-3 sm:gap-4 flex-wrap animate-fade-in ring-1 ring-emerald-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs">
              {selectedUserIds.length}
            </div>
            <div className="text-xs">
              <span className="font-bold text-white">Đã chọn {selectedUserIds.length} tài khoản</span>
              <span className="text-slate-400 hidden sm:inline ml-1">thao tác lô</span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleBulkLock('LOCKED')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Khóa tất cả tài khoản đã chọn"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Khóa lô</span>
            </button>

            <button
              onClick={() => handleBulkLock('ACTIVE')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Mở khóa tất cả tài khoản đã chọn"
            >
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mở khóa lô</span>
            </button>

            <button
              onClick={() => setBulkActionModal('roles')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Cập nhật vai trò cho người dùng đã chọn"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Gán vai trò</span>
            </button>

            <button
              onClick={() => setBulkActionModal('permissions')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/40 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="Gán quyền hạn trực tiếp (Direct Permissions) cho nhiều người dùng"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-200" />
              <span>Gán permissions</span>
            </button>

            <button
              onClick={() => setBulkActionModal('department')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Chuyển đơn vị/phòng ban"
            >
              <Building className="w-3.5 h-3.5 text-blue-400" />
              <span>Đổi phòng ban</span>
            </button>

            <button
              onClick={() => setBulkActionModal('security')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Đặt lại mật khẩu & Cấu hình 2FA"
            >
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>Bảo mật / 2FA</span>
            </button>

            <button
              onClick={handleBulkExportCsv}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Xuất file CSV các tài khoản đã chọn"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={() => setBulkActionModal('delete')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="Xóa hoặc lưu trữ tài khoản đã chọn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa lô</span>
            </button>

            <button
              onClick={handleClearSelection}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              title="Bỏ chọn tất cả"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* BULK ACTION MODAL 1: ROLES ASSIGNMENT               */}
      {/* ==================================================== */}
      {bulkActionModal === 'roles' && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Gán / Cập Nhật Vai Trò Hàng Loạt
                </h3>
              </div>
              <button 
                onClick={() => setBulkActionModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Target users summary */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-slate-500 block mb-1 font-medium">
                  Áp dụng cho {selectedUserIds.length} tài khoản người dùng:
                </span>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {userList.filter(u => selectedUserIds.includes(u.id)).map(u => (
                    <span 
                      key={u.id}
                      className="px-2 py-0.5 rounded text-[10.5px] font-mono font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {u.username}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Chế độ thao tác vai trò
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkRoleMode('add')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      bulkRoleMode === 'add'
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="block text-xs">Thêm vai trò</span>
                    <span className="text-[10px] opacity-75 font-normal block mt-0.5">Bổ sung vào hiện có</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkRoleMode('replace')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      bulkRoleMode === 'replace'
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="block text-xs">Ghi đè tất cả</span>
                    <span className="text-[10px] opacity-75 font-normal block mt-0.5">Thay thế toàn bộ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkRoleMode('remove')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      bulkRoleMode === 'remove'
                        ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="block text-xs">Thu hồi vai trò</span>
                    <span className="text-[10px] opacity-75 font-normal block mt-0.5">Gỡ bỏ vai trò</span>
                  </button>
                </div>
              </div>

              {/* Role Selection Dropdown */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Chọn vai trò mục tiêu
                </label>
                <select
                  value={bulkTargetRole}
                  onChange={(e) => setBulkTargetRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {AVAILABLE_ROLES.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Hệ thống phân quyền RBAC sẽ tự động đồng bộ permissions ngay sau khi xác nhận.
                </p>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button 
                onClick={() => setBulkActionModal(null)} 
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={handleBulkApplyRoles} 
                className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 cursor-pointer shadow-xs"
              >
                Xác Nhận Cập Nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* BULK ACTION MODAL 2: DEPARTMENT TRANSFER           */}
      {/* ==================================================== */}
      {bulkActionModal === 'department' && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Building className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Điều Chuyển Phòng Ban Hàng Loạt
                </h3>
              </div>
              <button 
                onClick={() => setBulkActionModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-slate-500 block mb-1 font-medium">
                  {selectedUserIds.length} tài khoản sẽ được chuyển sang đơn vị mới:
                </span>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {userList.filter(u => selectedUserIds.includes(u.id)).map(u => (
                    <span 
                      key={u.id}
                      className="px-2 py-0.5 rounded text-[10.5px] font-mono font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {u.fullName} ({u.department})
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Chọn phòng ban / khối nghiệp vụ tiếp nhận
                </label>
                <select
                  value={bulkTargetDept}
                  onChange={(e) => setBulkTargetDept(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {AVAILABLE_DEPARTMENTS.map(d => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Lưu ý: Các tác vụ BPM đang xử lý theo quyền cá nhân của người dùng vẫn được bảo toàn.
                </p>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button 
                onClick={() => setBulkActionModal(null)} 
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={handleBulkApplyDept} 
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
              >
                Xác Nhận Điều Chuyển
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* BULK ACTION MODAL 3: SECURITY & 2FA POLICIES        */}
      {/* ==================================================== */}
      {bulkActionModal === 'security' && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Thiết Lập Bảo Mật &amp; 2FA Hàng Loạt
                </h3>
              </div>
              <button 
                onClick={() => setBulkActionModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Thực thi các biện pháp an ninh nghiêm ngặt đồng thời cho <strong className="text-slate-900 dark:text-white">{selectedUserIds.length}</strong> tài khoản được chọn:
              </p>

              <div className="space-y-3">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={bulkResetPw}
                    onChange={(e) => setBulkResetPw(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      Đặt lại mật khẩu &amp; gửi link kích hoạt qua email công vụ
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Tạo mật mã một lần ngẫu nhiên có hiệu lực trong 24 giờ.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={bulkEnforce2fa}
                    onChange={(e) => setBulkEnforce2fa(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      Bắt buộc xác thực đa yếu tố 2FA (TOTP / OTP SMS)
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Người dùng bắt buộc quét mã QR qua Google Authenticator trong lần đăng nhập tới.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={bulkRevokeSessions}
                    onChange={(e) => setBulkRevokeSessions(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      Hủy bỏ toàn bộ phiên làm việc (Revoke Active Sessions)
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Lập tức đăng xuất tài khoản trên mọi trình duyệt và thiết bị di động.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button 
                onClick={() => setBulkActionModal(null)} 
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={handleBulkApplySecurity} 
                className="px-4 py-1.5 bg-purple-700 text-white rounded-lg text-xs font-semibold hover:bg-purple-800 cursor-pointer shadow-xs"
              >
                Thực Thi Bảo Mật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* BULK ACTION MODAL 4: DELETE / ARCHIVE CONFIRMATION  */}
      {/* ==================================================== */}
      {bulkActionModal === 'delete' && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-rose-200 dark:border-rose-900/60 flex items-center justify-between bg-rose-50/80 dark:bg-rose-950/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                  Xác Nhận Xóa / Lưu Trữ Lô Người Dùng
                </h3>
              </div>
              <button 
                onClick={() => setBulkActionModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-700 dark:text-slate-300">
                Bạn đang chuẩn bị thao tác trên <strong className="text-rose-600">{selectedUserIds.length}</strong> tài khoản người dùng:
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 max-h-28 overflow-y-auto space-y-1">
                {userList.filter(u => selectedUserIds.includes(u.id)).map(u => (
                  <div key={u.id} className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{u.fullName} ({u.username})</span>
                    <span className="text-slate-400 font-mono">{u.department}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-300 text-[11.5px]">
                <strong>Khuyến nghị:</strong> Bạn nên chọn <em>Lưu Trữ (Archive)</em> để giữ lại lịch sử audit logs và các hồ sơ tín dụng đã từng xử lý, hoặc <em>Xóa Vĩnh Viễn</em> nếu đây là các tài khoản test/dư thừa.
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button 
                onClick={() => setBulkActionModal(null)} 
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={() => handleBulkDelete(false)} 
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Lưu Trữ (Archive)
              </button>
              <button 
                onClick={() => handleBulkDelete(true)} 
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* BULK ACTION MODAL 5: USER DIRECT PERMISSIONS        */}
      {/* ==================================================== */}
      {bulkActionModal === 'permissions' && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/70 dark:bg-emerald-950/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Gán Quyền Hạn Trực Tiếp (Direct Permissions)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Áp dụng cho {selectedUserIds.length} người dùng đã chọn
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setBulkActionModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Chế độ phân quyền:</span>
                <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setBulkPermMode('grant')}
                    className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                      bulkPermMode === 'grant' 
                        ? 'bg-emerald-700 text-white shadow-xs' 
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    + Gán Thêm Quyền (Grant)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkPermMode('revoke')}
                    className={`px-3 py-1 rounded-md font-semibold cursor-pointer transition-all ${
                      bulkPermMode === 'revoke' 
                        ? 'bg-rose-600 text-white shadow-xs' 
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    - Thu Hồi Quyền (Revoke)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Chọn danh mục quyền hạn ({bulkSelectedPerms.length} quyền đã chọn):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkSelectedPerms(INITIAL_PERMISSIONS_CATALOGUE.map(p => p.name))}
                      className="text-emerald-700 dark:text-emerald-400 hover:underline text-[11px] font-semibold cursor-pointer"
                    >
                      Chọn tất cả
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => setBulkSelectedPerms([])}
                      className="text-slate-400 hover:underline text-[11px] cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  {INITIAL_PERMISSIONS_CATALOGUE.map(perm => {
                    const isChecked = bulkSelectedPerms.includes(perm.name);
                    return (
                      <label 
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                          isChecked ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkSelectedPerms(prev => [...prev, perm.name]);
                            } else {
                              setBulkSelectedPerms(prev => prev.filter(p => p !== perm.name));
                            }
                          }}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                              {perm.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {perm.module}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {perm.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button 
                onClick={() => setBulkActionModal(null)} 
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={handleBulkApplyPermissions} 
                className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 cursor-pointer shadow-xs"
              >
                Xác Nhận {bulkPermMode === 'grant' ? 'Gán Quyền' : 'Thu Hồi'} ({bulkSelectedPerms.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* BULK ACTION MODAL 6: ROLE GRANT PERMISSIONS          */}
      {/* ==================================================== */}
      {bulkRoleActionModal === 'grantPerms' && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-50/70 dark:bg-amber-950/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Gán / Bổ Sung Quyền Hạn Cho {selectedRoleNames.length} Vai Trò
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {selectedRoleNames.join(', ')}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setBulkRoleActionModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Chọn quyền hạn cần bổ sung ({bulkRoleTargetPerms.length} đã chọn):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkRoleTargetPerms(INITIAL_PERMISSIONS_CATALOGUE.map(p => p.name))}
                      className="text-amber-700 dark:text-amber-400 hover:underline text-[11px] font-semibold cursor-pointer"
                    >
                      Chọn tất cả
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => setBulkRoleTargetPerms([])}
                      className="text-slate-400 hover:underline text-[11px] cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  {INITIAL_PERMISSIONS_CATALOGUE.map(perm => {
                    const isChecked = bulkRoleTargetPerms.includes(perm.name);
                    return (
                      <label 
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                          isChecked ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkRoleTargetPerms(prev => [...prev, perm.name]);
                            } else {
                              setBulkRoleTargetPerms(prev => prev.filter(p => p !== perm.name));
                            }
                          }}
                          className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs block">
                            {perm.name}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate block">
                            {perm.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button 
                onClick={() => setBulkRoleActionModal(null)} 
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={() => handleBulkGrantPermsToRoles('revoke')} 
                className="px-3.5 py-1.5 border border-rose-300 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-semibold cursor-pointer hover:bg-rose-50"
              >
                Thu Hồi Khỏi Roles
              </button>
              <button 
                onClick={() => handleBulkGrantPermsToRoles('grant')} 
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Gán Bổ Sung ({bulkRoleTargetPerms.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* BULK ACTION MODAL 7: ROLE CHANGE CATEGORY           */}
      {/* ==================================================== */}
      {bulkRoleActionModal === 'changeType' && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-blue-50/70 dark:bg-blue-950/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Đổi Nhóm Phân Loại Cho {selectedRoleNames.length} Vai Trò
                </h3>
              </div>
              <button 
                onClick={() => setBulkRoleActionModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Chọn nhóm nghiệp vụ mới cho các vai trò: <strong className="font-mono text-slate-900 dark:text-white">{selectedRoleNames.join(', ')}</strong>
              </p>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nhóm Phân Loại Mới:
                </label>
                <select
                  value={bulkRoleTargetType}
                  onChange={(e) => setBulkRoleTargetType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {['Credit Business', 'System Admin', 'Process Admin', 'Compliance & Control', 'Operations Lead', 'Front-Office', 'Field Officer', 'Secretariat', 'Audit & Compliance'].map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button 
                onClick={() => setBulkRoleActionModal(null)} 
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={handleBulkChangeRolesType} 
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Xác Nhận Đổi Nhóm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* BULK ACTION MODAL 8: ROLE BULK DELETE               */}
      {/* ==================================================== */}
      {bulkRoleActionModal === 'delete' && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-rose-200 dark:border-rose-900/60 flex items-center justify-between bg-rose-50/80 dark:bg-rose-950/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                  Xác Nhận Xóa {selectedRoleNames.length} Vai Trò
                </h3>
              </div>
              <button 
                onClick={() => setBulkRoleActionModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-700 dark:text-slate-300">
                Bạn sắp xóa các vai trò sau khỏi hệ thống tenant:
              </p>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-slate-800 dark:text-slate-200 space-y-1">
                {selectedRoleNames.map(r => (
                  <div key={r} className="flex items-center justify-between">
                    <span>{r}</span>
                    <span className="text-[10px] text-slate-400">
                      {rolesList.find(x => x.name === r)?.isSystem ? 'Không thể xóa (System)' : 'Tùy chỉnh'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button 
                onClick={() => setBulkRoleActionModal(null)} 
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={handleBulkDeleteRoles} 
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* BULK ACTION MODAL 9: PERMISSION ASSIGN TO ROLE       */}
      {/* ==================================================== */}
      {(bulkPermActionModal === 'assignToRole' || bulkPermActionModal === 'revokeFromRole') && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className={`p-4 border-b flex items-center justify-between ${
              bulkPermActionModal === 'assignToRole' 
                ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' 
                : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold ${
                  bulkPermActionModal === 'assignToRole' ? 'bg-purple-700' : 'bg-rose-600'
                }`}>
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {bulkPermActionModal === 'assignToRole' ? 'Gán Quyền Vào Vai Trò' : 'Thu Hồi Quyền Khỏi Vai Trò'}
                </h3>
              </div>
              <button 
                onClick={() => setBulkPermActionModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Thao tác trên <strong className="text-slate-900 dark:text-white font-mono">{selectedPermIds.length}</strong> quyền hạn đã chọn.
              </p>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Chọn vai trò mục tiêu:
                </label>
                <select
                  value={bulkPermTargetRole}
                  onChange={(e) => setBulkPermTargetRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  {rolesList.map(r => (
                    <option key={r.name} value={r.name}>
                      {r.name} ({r.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button 
                onClick={() => setBulkPermActionModal(null)} 
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={bulkPermActionModal === 'assignToRole' ? handleBulkAssignPermsToRole : handleBulkRevokePermsFromRole} 
                className={`px-4 py-1.5 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs ${
                  bulkPermActionModal === 'assignToRole' ? 'bg-purple-700 hover:bg-purple-800' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Xác Nhận {bulkPermActionModal === 'assignToRole' ? 'Gán Quyền' : 'Thu Hồi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* BULK ACTION MODAL 10: ROLE ASSIGN TO USERS           */}
      {/* ==================================================== */}
      {bulkRoleActionModal === 'assignToUsers' && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-50/70 dark:bg-amber-950/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Cập Nhật Gán {selectedRoleNames.length} Vai Trò Cho Người Dùng
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {selectedRoleNames.join(', ')}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setBulkRoleActionModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Assignment Mode */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Phương thức phân quyền:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkRoleAssignMode('add')}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      bulkRoleAssignMode === 'add'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 font-bold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">Gán Bổ Sung</span>
                    <span className="text-[9.5px] text-slate-400 font-normal">Giữ vai trò cũ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkRoleAssignMode('remove')}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      bulkRoleAssignMode === 'remove'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 font-bold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">Thu Hồi</span>
                    <span className="text-[9.5px] text-slate-400 font-normal">Gỡ bỏ vai trò này</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkRoleAssignMode('replace')}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      bulkRoleAssignMode === 'replace'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 font-bold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">Ghi Đè</span>
                    <span className="text-[9.5px] text-slate-400 font-normal">Thay thế toàn bộ</span>
                  </button>
                </div>
              </div>

              {/* Target Users Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Chọn tài khoản người dùng ({bulkRoleTargetUsers.length}/{userList.length}):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkRoleTargetUsers(userList.map(u => u.id))}
                      className="text-amber-700 dark:text-amber-400 hover:underline text-[11px] font-semibold cursor-pointer"
                    >
                      Chọn tất cả
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => setBulkRoleTargetUsers([])}
                      className="text-slate-400 hover:underline text-[11px] cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  {userList.map(user => {
                    const isChecked = bulkRoleTargetUsers.includes(user.id);
                    return (
                      <label 
                        key={user.id}
                        className={`flex items-center gap-2.5 p-2.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                          isChecked ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkRoleTargetUsers(prev => [...prev, user.id]);
                            } else {
                              setBulkRoleTargetUsers(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                              {user.fullName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono ml-1.5">
                              @{user.username}
                            </span>
                            <span className="text-[10.5px] text-slate-400 block">
                              {user.department}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 max-w-[140px] justify-end">
                            {user.roles.map(r => (
                              <span key={r} className="px-1.5 py-0.2 rounded text-[9.5px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button 
                onClick={() => setBulkRoleActionModal(null)} 
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={handleBulkUpdateRoleAssignmentsToUsers}
                disabled={bulkRoleTargetUsers.length === 0}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Xác Nhận Cập Nhật ({bulkRoleTargetUsers.length} Users)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* BULK ACTION MODAL 11: PERM ASSIGN DIRECT TO USERS    */}
      {/* ==================================================== */}
      {bulkPermActionModal === 'assignToUsers' && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-4 border-b border-purple-200 dark:border-purple-800 flex items-center justify-between bg-purple-50/80 dark:bg-purple-950/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Cấp / Thu Hồi Quyền Trực Tiếp Cho Người Dùng
                  </h3>
                  <span className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                    {selectedPermIds.length} quyền hạn chi tiết được chọn
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setBulkPermActionModal(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                  Hành động thực hiện:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkPermDirectMode('grant')}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      bulkPermDirectMode === 'grant'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200 font-bold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">Cấp Trực Tiếp (Grant)</span>
                    <span className="text-[9.5px] text-slate-400">Gán quyền đặc cách</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkPermDirectMode('revoke')}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      bulkPermDirectMode === 'revoke'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 font-bold shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">Thu Hồi (Revoke)</span>
                    <span className="text-[9.5px] text-slate-400">Gỡ quyền trực tiếp</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Chọn tài khoản áp dụng ({bulkPermTargetUsers.length}/{userList.length}):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBulkPermTargetUsers(userList.map(u => u.id))}
                      className="text-purple-700 dark:text-purple-400 hover:underline text-[11px] font-semibold cursor-pointer"
                    >
                      Chọn tất cả
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => setBulkPermTargetUsers([])}
                      className="text-slate-400 hover:underline text-[11px] cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  {userList.map(user => {
                    const isChecked = bulkPermTargetUsers.includes(user.id);
                    return (
                      <label 
                        key={user.id}
                        className={`flex items-center gap-2.5 p-2.5 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                          isChecked ? 'bg-purple-50/50 dark:bg-purple-950/20' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkPermTargetUsers(prev => [...prev, user.id]);
                            } else {
                              setBulkPermTargetUsers(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                              {user.fullName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono ml-1.5">
                              @{user.username}
                            </span>
                            <span className="text-[10.5px] text-slate-400 block">
                              {user.department}
                            </span>
                          </div>
                          <div className="text-right">
                            {user.directPermissions && user.directPermissions.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                +{user.directPermissions.length} direct
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button 
                onClick={() => setBulkPermActionModal(null)} 
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button 
                onClick={handleBulkAssignPermsToUsers}
                disabled={bulkPermTargetUsers.length === 0}
                className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Xác Nhận ({bulkPermTargetUsers.length} Users)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
