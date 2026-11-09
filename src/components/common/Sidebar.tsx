import React from 'react';
import { 
  GitFork, 
  Settings, 
  Users, 
  BarChart3, 
  LayoutGrid, 
  ShieldCheck, 
  CheckSquare, 
  Building2,
  Workflow,
  Radio,
  FileCode2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  onSelectModule: (module: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  tenantName: string;
  onOpenEndpointsModal: () => void;
  activeWorkspace?: 'client-portal' | 'admin-console';
  onSelectWorkspace?: (workspace: 'client-portal' | 'admin-console') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  collapsed,
  onToggleCollapse,
  tenantName,
  onOpenEndpointsModal,
  activeWorkspace = 'client-portal',
  onSelectWorkspace,
}) => {
  const mainNavItems = [
    { id: 'client-portal', label: 'Client Portal', icon: Building2, description: 'Cổng Khách Hàng & Cán Bộ Nghiệp Vụ (Self-Service)' },
    { id: 'modeler', label: 'Modeler', icon: GitFork, description: 'Thiết kế & Quản lý quy trình BPMN 2.0' },
    { id: 'operation', label: 'Operation', icon: Settings, description: 'Vận hành tác vụ & Quản lý instance' },
    { id: 'identity', label: 'Identity', icon: Users, description: 'Quản lý người dùng & phân quyền' },
    { id: 'optimize', label: 'Optimize', icon: BarChart3, description: 'Báo cáo, phân tích & Heatmap quy trình' },
    { id: 'task-management', label: 'Task Mgmt', icon: ShieldCheck, description: 'Quản lý RBAC theo Queue & Element' },
    { id: 'tasklist', label: 'Tasklist', icon: CheckSquare, description: 'Xử lý tác vụ End User (Claim, Approve)' },
    { id: 'foundation', label: 'Foundation', icon: LayoutGrid, description: 'Dịch vụ dùng chung (Endpoints, Allocation, Templates)' },
  ];

  return (
    <aside 
      className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between shrink-0 transition-all duration-200 z-20 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Top Brand Logo */}
      <div>
        <div className="h-14 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center px-3.5 gap-2.5">
          {/* BPMP modern emblem */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-xs shrink-0 ring-2 ring-emerald-500/20">
            <Workflow className="w-4 h-4 text-white" />
          </div>

          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                BPMP Platform
              </h1>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide truncate">
                Multi-Engine BPMN 2.0
              </p>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-1">
          {mainNavItems.map((item) => {
            const isActive = (activeWorkspace === 'client-portal' && item.id === 'client-portal') ||
                             (activeWorkspace === 'admin-console' && currentModule === item.id);
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title={collapsed ? `${item.label} - ${item.description}` : undefined}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full shadow-xs" />
                )}

                <item.icon 
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`} 
                />

                {!collapsed && (
                  <span className="truncate tracking-tight">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Tenant badge & controls */}
      <div className="p-2 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
        {/* Quick Endpoint Modal Trigger */}
        <button
          onClick={onOpenEndpointsModal}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Source System Endpoints"
        >
          <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {!collapsed && <span className="truncate font-medium text-[11px]">System Endpoints</span>}
        </button>

        {/* Tenant badge */}
        <div className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-md bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              BT
            </div>
            {!collapsed && (
              <div className="truncate text-[11px] leading-tight">
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{tenantName}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Multi-tenant Active</p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
            title={collapsed ? 'Mở rộng thanh menu' : 'Thu gọn thanh menu'}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
