import React, { useState } from 'react';
import { TaskItem, ProcessInstance } from '../../types/bpm';
import { INITIAL_TASKS } from '../../data/mockBpmData';
import { 
  CheckSquare, 
  Clock, 
  UserCheck, 
  UserMinus, 
  Send, 
  CornerUpLeft, 
  Ban, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Building,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpDown,
  AlertTriangle,
  Flame,
  LayoutGrid,
  Columns,
  Table as TableIcon,
  Check,
  X,
  ExternalLink
} from 'lucide-react';

interface TasklistModuleProps {
  currentUsername: string;
  onTaskCompleted: (task: TaskItem, decision: 'APPROVE' | 'REJECT' | 'SENDBACK') => void;
}

type SortOption = 'priority_desc' | 'priority_asc' | 'sla_asc' | 'newest';
type ViewLayout = 'grid' | 'split';

export const TasklistModule: React.FC<TasklistModuleProps> = ({
  currentUsername,
  onTaskCompleted,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState<'my' | 'group' | 'completed'>('my');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(tasks[0] || null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('priority_desc');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [viewLayout, setViewLayout] = useState<ViewLayout>('grid');

  // Form input changes
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const priorityWeight: Record<'HIGH' | 'MEDIUM' | 'LOW', number> = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  const priorityConfig: Record<'HIGH' | 'MEDIUM' | 'LOW', {
    label: string;
    badgeClass: string;
    dotClass: string;
  }> = {
    HIGH: {
      label: 'High Priority',
      badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20',
      dotClass: 'bg-rose-500 animate-pulse'
    },
    MEDIUM: {
      label: 'Medium Priority',
      badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20',
      dotClass: 'bg-amber-500'
    },
    LOW: {
      label: 'Low Priority',
      badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20',
      dotClass: 'bg-blue-500'
    }
  };

  const renderPriorityBadge = (priority: 'HIGH' | 'MEDIUM' | 'LOW', compact = false) => {
    const cfg = priorityConfig[priority] || priorityConfig.MEDIUM;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold text-[10.5px] font-mono tracking-tight whitespace-nowrap ${cfg.badgeClass}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
        <span>{compact ? priority : cfg.label}</span>
      </span>
    );
  };

  const handleClaimTask = (task: TaskItem) => {
    const updated = tasks.map(t => t.id === task.id ? { ...t, assignee: currentUsername, status: 'ASSIGNED' as const } : t);
    setTasks(updated);
    if (selectedTask?.id === task.id) {
      setSelectedTask({ ...selectedTask, assignee: currentUsername, status: 'ASSIGNED' });
    }
    showToast(`Đã nhận (Claim) tác vụ "${task.taskName}" thành công!`);
  };

  const handleUnclaimTask = (task: TaskItem) => {
    const updated = tasks.map(t => t.id === task.id ? { ...t, assignee: null, status: 'UNASSIGNED' as const } : t);
    setTasks(updated);
    if (selectedTask?.id === task.id) {
      setSelectedTask({ ...selectedTask, assignee: null, status: 'UNASSIGNED' });
    }
    showToast(`Đã trả lại (Unclaim) tác vụ về hàng đợi chung!`);
  };

  const handleSubmitTask = (decision: 'APPROVE' | 'REJECT' | 'SENDBACK') => {
    if (!selectedTask) return;
    const updated = tasks.map(t => t.id === selectedTask.id ? { ...t, status: 'COMPLETED' as const } : t);
    setTasks(updated);
    onTaskCompleted(selectedTask, decision);
    const actionLabel = decision === 'APPROVE' ? 'Phê duyệt' : decision === 'REJECT' ? 'Từ chối' : 'Yêu cầu bổ sung';
    showToast(`Đã ${actionLabel} hồ sơ ${selectedTask.recordCode} thành công!`);
    
    // Select next task
    const remaining = updated.filter(t => t.status !== 'COMPLETED');
    setSelectedTask(remaining[0] || null);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'my') {
      if (t.assignee !== currentUsername || t.status === 'COMPLETED') return false;
    } else if (activeTab === 'group') {
      if (t.assignee !== null || t.status === 'COMPLETED') return false;
    } else if (activeTab === 'completed') {
      if (t.status !== 'COMPLETED') return false;
    }

    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (searchTerm.trim()) {
      const matchSearch = 
        t.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.recordCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
    }

    return true;
  });

  // Sort tasks by Priority or other criteria
  const sortedAndFilteredTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority_desc') {
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    }
    if (sortBy === 'priority_asc') {
      return (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
    }
    if (sortBy === 'sla_asc') {
      return a.slaHours - b.slaHours;
    }
    return b.id.localeCompare(a.id);
  });

  // Multi-select helpers
  const isAllSelected = sortedAndFilteredTasks.length > 0 && 
    sortedAndFilteredTasks.every(t => selectedTaskIds.includes(t.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const currentIds = new Set(sortedAndFilteredTasks.map(t => t.id));
      setSelectedTaskIds(prev => prev.filter(id => !currentIds.has(id)));
    } else {
      const newIds = new Set([...selectedTaskIds, ...sortedAndFilteredTasks.map(t => t.id)]);
      setSelectedTaskIds(Array.from(newIds));
    }
  };

  const toggleSelectTask = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  // Bulk Approve / Reject Action Handler
  const handleBulkAction = (decision: 'APPROVE' | 'REJECT') => {
    if (selectedTaskIds.length === 0) return;
    const count = selectedTaskIds.length;
    const targetTasks = tasks.filter(t => selectedTaskIds.includes(t.id));

    // Update state to COMPLETED
    const updatedTasks = tasks.map(t => 
      selectedTaskIds.includes(t.id) ? { ...t, status: 'COMPLETED' as const } : t
    );
    setTasks(updatedTasks);

    // Call onTaskCompleted for each selected task
    targetTasks.forEach(task => {
      onTaskCompleted(task, decision);
    });

    const actionText = decision === 'APPROVE' ? 'phê duyệt' : 'từ chối';
    showToast(`Đã ${actionText} hàng loạt ${count} tác vụ thành công!`);
    setSelectedTaskIds([]);

    // Update selectedTask if needed
    if (selectedTask && selectedTaskIds.includes(selectedTask.id)) {
      const nextRemaining = updatedTasks.filter(t => t.status !== 'COMPLETED');
      setSelectedTask(nextRemaining[0] || null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-white dark:bg-slate-900 select-none relative">
      {/* Toast notification */}
      {feedbackToast && (
        <div className="absolute top-4 right-1/2 translate-x-1/2 z-60 bg-emerald-700 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Application Bar with View Mode Switcher */}
      <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                Hộp Thư Tác Vụ (Tasklist Workspace)
              </h2>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                {currentUsername}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tiếp nhận, xử lý, thẩm định và phê duyệt hồ sơ theo quy trình BPMN
            </p>
          </div>
        </div>

        {/* Tab & Layout Mode Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Inbox Scope Tabs (Modern Segmented Tray) */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-medium border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                activeTab === 'my' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Của Tôi <span className="ml-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">({tasks.filter(t => t.assignee === currentUsername && t.status !== 'COMPLETED').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                activeTab === 'group' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Hàng Đợi Chung <span className="ml-1 text-[11px] font-mono text-slate-500 font-bold">({tasks.filter(t => t.assignee === null && t.status !== 'COMPLETED').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                activeTab === 'completed' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Hoàn Thành <span className="ml-1 text-[11px] font-mono text-slate-500 font-bold">({tasks.filter(t => t.status === 'COMPLETED').length})</span>
            </button>
          </div>

          {/* Grid vs Split Layout Switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <button
              onClick={() => setViewLayout('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewLayout === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Chế độ Bảng Lưới (Data Grid with Multi-select)"
            >
              <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bảng Lưới</span>
            </button>
            <button
              onClick={() => setViewLayout('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewLayout === 'split'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Chế độ Chia Màn Hình (Split Form View)"
            >
              <Columns className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chi Tiết Form</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* VIEW LAYOUT 1: FULL DATA GRID WITH MULTI-SELECT COLUMN   */}
      {/* ======================================================= */}
      {viewLayout === 'grid' && (
        <div className="flex-1 flex flex-col overflow-hidden p-4 bg-slate-100/50 dark:bg-slate-950/40 space-y-3">
          {/* Grid Filter and Sort Toolbar */}
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs flex items-center justify-between flex-wrap gap-3 shrink-0">
            <div className="flex items-center gap-3 flex-1 min-w-[260px]">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm tác vụ, mã hồ sơ, tên khách hàng..."
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
            </div>

            {/* Filter and Sort controls */}
            <div className="flex items-center gap-3 flex-wrap text-xs">
              {/* Quick Priority Filter Pills */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(p => {
                  const count = p === 'ALL' ? tasks.length : tasks.filter(t => t.priority === p).length;
                  const isSelected = filterPriority === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setFilterPriority(p)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? p === 'HIGH'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : p === 'MEDIUM'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : p === 'LOW'
                            ? 'bg-blue-500 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <span>{p === 'ALL' ? 'Tất cả' : p}</span>
                      <span className="ml-1 opacity-80 text-[10px] font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Sort by Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-500 font-medium">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="priority_desc">Ưu tiên (Cao → Thấp)</option>
                  <option value="priority_asc">Ưu tiên (Thấp → Cao)</option>
                  <option value="sla_asc">SLA (Sắp hết hạn trước)</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Grid with Multi-Select Checkbox Column */}
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-auto shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10.5px] font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <tr>
                  {/* Multi-select Checkbox Column */}
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      title="Chọn tất cả tác vụ hiển thị"
                    />
                  </th>
                  <th className="py-3 px-3 whitespace-nowrap">Mã Hồ Sơ</th>
                  <th className="py-3 px-3">Tác Vụ (Task Name)</th>
                  <th className="py-3 px-3">Doanh Nghiệp / Khách Hàng</th>
                  <th className="py-3 px-3">Quy Trình</th>
                  <th className="py-3 px-3 whitespace-nowrap">Số Tiền Đề Xuất</th>
                  <th className="py-3 px-3 whitespace-nowrap">Độ Ưu Tiên</th>
                  <th className="py-3 px-3 whitespace-nowrap">Thời Hạn SLA</th>
                  <th className="py-3 px-3 whitespace-nowrap">Người Xử Lý</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedAndFilteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      Không tìm thấy tác vụ nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  sortedAndFilteredTasks.map((task) => {
                    const isChecked = selectedTaskIds.includes(task.id);
                    return (
                      <tr 
                        key={task.id} 
                        onClick={() => {
                          setSelectedTask(task);
                        }}
                        className={`transition-colors cursor-pointer ${
                          isChecked 
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/40' 
                            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Checkbox Column */}
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => toggleSelectTask(task.id, e as any)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>

                        {/* Record Code */}
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                          {task.recordCode}
                        </td>

                        {/* Task Name */}
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                          {task.taskName}
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium max-w-[200px] truncate" title={task.customerName}>
                          {task.customerName}
                        </td>

                        {/* Process Key */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {task.processKey}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-3 font-mono text-[11px] font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {task.amount}
                        </td>

                        {/* Priority Indicator */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {renderPriorityBadge(task.priority, false)}
                        </td>

                        {/* SLA */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{task.slaHours}h</span>
                          </div>
                        </td>

                        {/* Assignee */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {task.assignee ? (
                            <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>{task.assignee}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Hàng đợi chung</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setViewLayout('split');
                              }}
                              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                              title="Mở biểu mẫu tác nghiệp"
                            >
                              Mở Form
                            </button>
                            {task.assignee ? (
                              <button
                                onClick={() => handleUnclaimTask(task)}
                                className="p-1 text-slate-400 hover:text-amber-600 rounded cursor-pointer"
                                title="Trả lại queue (Unclaim)"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleClaimTask(task)}
                                className="p-1 text-slate-400 hover:text-emerald-600 rounded cursor-pointer"
                                title="Nhận xử lý (Claim)"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
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
      )}

      {/* ======================================================= */}
      {/* VIEW LAYOUT 2: SPLIT VIEW (TASK LIST + FORM DETAIL)     */}
      {/* ======================================================= */}
      {viewLayout === 'split' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Task List Column with Multi-select Checkboxes */}
          <div className="w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/60 shrink-0">
            {/* Filter and Priority Sort Toolbar */}
            <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 space-y-2 bg-white dark:bg-slate-900">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm tác vụ, mã hồ sơ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              </div>

              {/* Priority Filter and Sort Row */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Filter Priority Dropdown */}
                <div className="flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold text-slate-700 dark:text-slate-300"
                    title="Lọc theo mức độ ưu tiên"
                  >
                    <option value="ALL">Tất cả ưu tiên</option>
                    <option value="HIGH">🔴 High (Cao)</option>
                    <option value="MEDIUM">🟡 Medium (Vừa)</option>
                    <option value="LOW">🔵 Low (Thấp)</option>
                  </select>
                </div>

                {/* Sort by Priority Dropdown */}
                <div className="flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold text-slate-700 dark:text-slate-300"
                    title="Sắp xếp tác vụ"
                  >
                    <option value="priority_desc">Ưu tiên High → Low</option>
                    <option value="priority_asc">Ưu tiên Low → High</option>
                    <option value="sla_asc">Hạn SLA gấp trước</option>
                    <option value="newest">Mới nhất trước</option>
                  </select>
                </div>
              </div>

              {/* Select All Checkbox Strip */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Chọn tất cả ({sortedAndFilteredTasks.length})</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedTaskIds.length} đã chọn
                </span>
              </div>
            </div>

            {/* Tasks Cards List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {sortedAndFilteredTasks.map((task) => {
                const isSelected = selectedTask?.id === task.id;
                const isChecked = selectedTaskIds.includes(task.id);
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`p-3 cursor-pointer transition-colors relative flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-l-3 border-emerald-600'
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => toggleSelectTask(task.id, e as any)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          {task.recordCode}
                        </span>
                        {/* Priority Indicator Badge */}
                        {renderPriorityBadge(task.priority, true)}
                      </div>

                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs mb-1">
                        {task.taskName}
                      </h3>

                      <p className="text-slate-600 dark:text-slate-400 text-[11px] truncate mb-2">
                        {task.customerName}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{task.amount}</span>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Hạn: {task.slaHours}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {sortedAndFilteredTasks.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  Không có tác vụ nào phù hợp với mức ưu tiên hoặc tìm kiếm.
                </div>
              )}
            </div>
          </div>

          {/* Task Detail & Dynamic Form Processing View */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
            {selectedTask ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header info */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold font-mono text-[10px]">
                        {selectedTask.processKey}
                      </span>
                      <span className="font-mono text-xs text-slate-500">{selectedTask.recordCode}</span>
                      {renderPriorityBadge(selectedTask.priority, false)}
                    </div>
                    <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {selectedTask.taskName} – {selectedTask.customerName}
                    </h1>
                  </div>

                  {/* Claim / Unclaim Action Controls */}
                  <div className="flex items-center gap-2">
                    {selectedTask.assignee ? (
                      <button
                        onClick={() => handleUnclaimTask(selectedTask)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold cursor-pointer"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Trả lại Queue (Unclaim)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleClaimTask(selectedTask)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-sm cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Nhận Xử Lý (Claim Task)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Task Body: Profile info + Dynamic Input Form */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl">
                  {/* Profile Overview Card */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Doanh Nghiệp Đề Xuất</span>
                      <strong className="text-slate-900 dark:text-slate-100 truncate block">{selectedTask.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Hạn Mức Đề Xuất</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm">{selectedTask.amount}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Mức Độ Ưu Tiên</span>
                      <div className="mt-0.5">
                        {renderPriorityBadge(selectedTask.priority, false)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Thời Hạn SLA Còn Lại</span>
                      <strong className="text-amber-600 font-mono">{selectedTask.slaHours} giờ</strong>
                    </div>
                  </div>

                  {/* Dynamic Form Generated From Template */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>Biểu Mẫu Tác Nghiệp (Document &amp; Form Generator)</span>
                      </h3>
                      <span className="text-[11px] text-slate-400">Tự động kết xuất từ MDM Service</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTask.formFields.map(field => (
                        <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>

                          {field.type === 'textarea' ? (
                            <textarea
                              rows={3}
                              defaultValue={field.value}
                              onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
                            />
                          ) : field.type === 'select' ? (
                            <select
                              defaultValue={field.value}
                              onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold"
                            >
                              {field.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : field.type === 'checkbox' ? (
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                              <input
                                type="checkbox"
                                defaultChecked={field.value}
                                onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.checked })}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Xác nhận đúng quy định tín dụng</span>
                            </label>
                          ) : (
                            <input
                              type={field.type}
                              defaultValue={field.value}
                              onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Execution Action Toolbar */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Lưu ý: Mọi quyết định phê duyệt đều được ghi nhận vào Audit Log hệ thống.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSubmitTask('SENDBACK')}
                      className="flex items-center gap-1.5 px-3.5 py-2 border border-amber-300/80 dark:border-amber-700/80 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
                    >
                      <CornerUpLeft className="w-3.5 h-3.5" />
                      <span>Yêu Cầu Bổ Sung</span>
                    </button>
                    <button
                      onClick={() => handleSubmitTask('REJECT')}
                      className="flex items-center gap-1.5 px-3.5 py-2 border border-rose-300/80 dark:border-rose-800/80 text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-950/40 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Từ Chối Hồ Sơ</span>
                    </button>
                    <button
                      onClick={() => handleSubmitTask('APPROVE')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Phê Duyệt &amp; Chuyển Tiếp</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                Vui lòng chọn một tác vụ trong danh sách để xử lý.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* FLOATING ACTION TOOLBAR (Appears when tasks selected)    */}
      {/* ======================================================= */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 dark:bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/60 ring-2 ring-emerald-500/20 select-none animate-in fade-in zoom-in-95 duration-150">
          {/* Selected Count Indicator */}
          <div className="flex items-center gap-2.5 pr-3.5 border-r border-slate-700/80">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold font-mono">
              {selectedTaskIds.length}
            </span>
            <div className="text-xs">
              <span className="font-semibold block leading-tight">Đã chọn hồ sơ</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedTaskIds.length} / {sortedAndFilteredTasks.length} tác vụ
              </span>
            </div>
          </div>

          {/* Action Buttons: Bulk Approve and Bulk Reject */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('APPROVE')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Phê Duyệt ({selectedTaskIds.length})</span>
            </button>

            <button
              onClick={() => handleBulkAction('REJECT')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Từ Chối ({selectedTaskIds.length})</span>
            </button>

            <button
              onClick={() => setSelectedTaskIds([])}
              className="px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            >
              Bỏ chọn
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
