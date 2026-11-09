import React from 'react';
import { 
  Search, 
  Bell, 
  Globe, 
  Moon, 
  Sun, 
  Layers, 
  ChevronRight, 
  Building2,
  FolderGit2,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  currentModule: string;
  processKey: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  tenantName: string;
  onSelectTenant: (name: string) => void;
  activeWorkspace?: 'client-portal' | 'admin-console';
  onSelectWorkspace?: (workspace: 'client-portal' | 'admin-console') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  processKey,
  isDarkMode,
  onToggleDarkMode,
  tenantName,
  onSelectTenant,
  activeWorkspace = 'client-portal',
  onSelectWorkspace,
}) => {
  const [showTenantMenu, setShowTenantMenu] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  // Generate contextual breadcrumbs matching screenshots
  const getBreadcrumbs = () => {
    if (activeWorkspace === 'client-portal') {
      return [
        { icon: Building2, label: 'Organizations' },
        { label: tenantName, isTenant: true },
        { icon: Layers, label: 'Client Portal' },
        { label: 'Dịch Vụ Khách Hàng & Cán Bộ', active: true },
      ];
    }
    switch (currentModule) {
      case 'modeler':
        return [
          { icon: Building2, label: 'Organizations' },
          { label: tenantName, isTenant: true },
          { icon: FolderGit2, label: 'Projects' },
          { label: `${processKey}-Disbursement` },
          { icon: Layers, label: 'Applications' },
          { label: processKey, active: true },
        ];
      case 'operation':
        return [
          { icon: Building2, label: 'Organizations' },
          { label: tenantName, isTenant: true },
          { label: 'Operate' },
          { label: 'Process' },
          { label: processKey, active: true },
        ];
      case 'optimize':
        return [
          { icon: Building2, label: 'Organizations' },
          { label: tenantName, isTenant: true },
          { label: 'Optimization' },
          { label: 'Reports' },
          { label: 'User Task Analysis', active: true },
        ];
      case 'identity':
        return [
          { label: 'Dashboard' },
          { label: 'Foundation Services' },
          { label: 'Identity' },
          { label: 'Dashboard', active: true },
        ];
      case 'task-management':
        return [
          { label: 'Trang chủ' },
          { label: 'Foundation Services' },
          { label: 'Task Management', active: true },
        ];
      case 'tasklist':
        return [
          { label: 'Trang chủ' },
          { label: 'End User Workspace' },
          { label: 'Tasklist Inbox', active: true },
        ];
      default:
        return [
          { label: 'Trang chủ' },
          { label: 'Foundation Services' },
          { label: 'BPM Foundation', active: true },
        ];
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 sticky top-0 z-30 select-none transition-colors">
      {/* Left Breadcrumb Trail */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto no-scrollbar py-1">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
            )}
            <div 
              className={`flex items-center gap-1.5 whitespace-nowrap px-2 py-1 rounded-md transition-all text-xs ${
                crumb.active 
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/70 dark:bg-emerald-950/40' 
                  : crumb.isTenant 
                    ? 'text-slate-900 dark:text-slate-100 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs' 
                    : 'hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
              onClick={() => crumb.isTenant && setShowTenantMenu(!showTenantMenu)}
            >
              {crumb.icon && <crumb.icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />}
              <span>{crumb.label}</span>
              {crumb.isTenant && (
                <span className="text-[10px] text-slate-400 font-normal">▾</span>
              )}
            </div>
          </React.Fragment>
        ))}

        {/* Tenant selector dropdown */}
        {showTenantMenu && (
          <div className="absolute top-12 left-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 min-w-[220px] z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1.5">
              Tổ Chức / Tenant Không Gian
            </div>
            {['ecmbpm', 'vietinbank_bpm', 'techcom_workflow', 'vnpt_enterprise'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  onSelectTenant(t);
                  setShowTenantMenu(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  tenantName === t 
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t}</span>
                </div>
                {tenantName === t && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Workspace Switcher: Client Portal vs Admin & DevOps */}
        {onSelectWorkspace && (
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => onSelectWorkspace('client-portal')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                activeWorkspace === 'client-portal'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="Cổng Dịch Vụ Khách Hàng & Cán Bộ Nghiệp Vụ Trong Tổ Chức"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Client Portal</span>
            </button>
            <button
              onClick={() => onSelectWorkspace('admin-console')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                activeWorkspace === 'admin-console'
                  ? 'bg-slate-900 text-white dark:bg-slate-700 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="Bàn Quản Trị Hệ Thống, Modeler & DevOps"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Admin / DevOps</span>
            </button>
          </div>
        )}

        {/* Search with modern Shortcut Pill */}
        <div className="relative hidden md:flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm tác vụ, quy trình..."
            className="w-52 lg:w-64 pl-8 pr-12 py-1.5 text-xs bg-slate-100/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-slate-200 placeholder-slate-400 transition-all shadow-2xs"
          />
          <kbd className="absolute right-2 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-8 h-8 rounded-lg border border-slate-200/70 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer relative"
            title="Thông báo vận hành"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          </button>

          {/* Notifications Popover */}
          {notificationsOpen && (
            <div className="absolute right-0 top-10 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-3.5 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Thông báo vận hành</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-medium">Đã đọc tất cả</span>
              </div>
              <div className="space-y-2 mt-2.5 text-xs">
                <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-lg border border-emerald-100 dark:border-emerald-800/40">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-300">Deployment thành công</p>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">Quy trình SDD v2.0 đã deploy lên Camunda Engine</p>
                </div>
                <div className="p-2.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-800/40">
                  <p className="font-semibold text-amber-900 dark:text-amber-300">Cảnh báo SLA</p>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">Hồ sơ 503558 (Cán bộ bán hàng) còn 30 phút hết hạn</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Language switch */}
        <button 
          className="h-8 px-2 rounded-lg border border-slate-200/70 dark:border-slate-800 flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all text-xs font-semibold cursor-pointer"
          title="Ngôn ngữ giao diện"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>VI</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="w-8 h-8 rounded-lg border border-slate-200/70 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
          title="Chế độ Sáng / Tối"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="Tài khoản: Bùi Văn Tâm (tambv)"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white text-xs font-bold flex items-center justify-center shadow-xs">
              TB
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">tambv</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-tight">NCLOS ADMIN</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-11 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in duration-100">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center shadow-xs">
                  TB
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Bùi Văn Tâm</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">tambv@ecmbpm.vn</p>
                </div>
              </div>
              <div className="py-2 text-xs space-y-1.5">
                <div className="flex justify-between py-0.5 text-slate-600 dark:text-slate-400">
                  <span>Vai trò hệ thống:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">NCLOS ADMIN</span>
                </div>
                <div className="flex justify-between py-0.5 text-slate-600 dark:text-slate-400">
                  <span>Tenant scope:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{tenantName}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <button 
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left py-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium cursor-pointer"
                >
                  Đăng xuất tài khoản
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
