import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  Workflow, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { RBACAuditLogEntry, AuditActionType } from '../../types/bpm';
import { INITIAL_RBAC_AUDIT_LOGS } from '../../data/mockBpmData';

export interface AccessAuditLogProps {
  logs?: RBACAuditLogEntry[];
  onExportCSV?: () => void;
  className?: string;
}

export const AccessAuditLog: React.FC<AccessAuditLogProps> = ({
  logs = INITIAL_RBAC_AUDIT_LOGS,
  onExportCSV,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [filterResource, setFilterResource] = useState<string>('ALL');
  const [filterProcess, setFilterProcess] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Filter by resource type (Process / Element / Queue)
      if (filterResource !== 'ALL' && log.targetType !== filterResource) {
        return false;
      }
      // Filter by action type
      if (filterAction !== 'ALL' && log.actionType !== filterAction) {
        return false;
      }
      // Filter by process key
      if (filterProcess !== 'ALL' && log.processKey !== filterProcess) {
        return false;
      }
      // Search term in Actor, Resource, Action, Details
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const actorMatch = log.actor.toLowerCase().includes(query) || log.actorRole.toLowerCase().includes(query);
        const resourceMatch = log.targetName.toLowerCase().includes(query) || log.targetType.toLowerCase().includes(query);
        const actionMatch = log.actionType.toLowerCase().includes(query);
        const detailMatch = log.details.toLowerCase().includes(query);
        const processMatch = log.processKey.toLowerCase().includes(query);

        if (!actorMatch && !resourceMatch && !actionMatch && !detailMatch && !processMatch) {
          return false;
        }
      }
      return true;
    });
  }, [logs, filterResource, filterAction, filterProcess, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  // Export CSV handler
  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV();
      return;
    }
    const headers = ['Timestamp,Actor,Action,Resource,Process,Detail,PreviousState,NewState\n'];
    const rows = filteredLogs.map((l) => 
      `"${l.timestamp}","${l.actor} (${l.actorRole})","${l.actionType}","${l.targetType}: ${l.targetName}","${l.processKey}","${l.details}","${l.previousState || ''}","${l.newState || ''}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AccessAuditLog_${Date.now()}.csv`;
    a.click();
  };

  // Helper to format Action Badge
  const getActionBadge = (actionType: AuditActionType) => {
    switch (actionType) {
      case 'ROLE_ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            + Role Assigned
          </span>
        );
      case 'ROLE_REMOVED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            - Role Removed
          </span>
        );
      case 'ACTION_UPDATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            ⚡ Action Updated
          </span>
        );
      case 'FILTER_MODIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            ⚙ Filter Modified
          </span>
        );
      case 'QUEUE_CREATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            ★ Queue Created
          </span>
        );
      case 'PROCESS_PERM_UPDATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            ❖ Process Perm Updated
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {actionType}
          </span>
        );
    }
  };

  // Helper for Resource badge
  const getResourceBadge = (type: string, key: string, name: string) => {
    let typeClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (type === 'Process') typeClass = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
    if (type === 'Element') typeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
    if (type === 'Queue') typeClass = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase border ${typeClass}`}>
            {type}
          </span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {key}
          </span>
        </div>
        <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate max-w-[220px]" title={name}>
          {name}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col gap-4 overflow-hidden h-full ${className}`}>
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Tổng Nhật Ký Thay Đổi</span>
            <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-slate-100 mt-1.5">
            {logs.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Bản ghi RBAC được lưu trữ</p>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Actor Gần Nhất</span>
            <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1.5 flex items-center gap-1.5 truncate">
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold truncate">
              {logs[0]?.actor || 'None'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-semibold">
              {logs[0]?.actorRole}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{logs[0]?.timestamp || '-'}</p>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Tài Nguyên Tác Động</span>
            <div className="p-1 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Workflow className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-slate-100 mt-1.5">
            {new Set(logs.map((l) => l.targetName)).size}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Process, Element, Queue</p>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Tiêu Chuẩn Bảo Mật</span>
            <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">
            ISO 27001 / Basel II
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Audit log chống giả mạo</p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm Actor, Resource, Action hoặc Chi tiết..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">Resource:</span>
            <select
              value={filterResource}
              onChange={(e) => {
                setFilterResource(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="ALL">All Resources</option>
              <option value="Process">Process</option>
              <option value="Element">Element</option>
              <option value="Queue">Queue</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">Action:</span>
            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="ALL">All Actions</option>
              <option value="ROLE_ASSIGNED">+ Role Assigned</option>
              <option value="ROLE_REMOVED">- Role Removed</option>
              <option value="ACTION_UPDATED">⚡ Action Updated</option>
              <option value="FILTER_MODIFIED">⚙ Filter Modified</option>
              <option value="QUEUE_CREATED">★ Queue Created</option>
              <option value="PROCESS_PERM_UPDATED">❖ Process Perm Updated</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">Process:</span>
            <select
              value={filterProcess}
              onChange={(e) => {
                setFilterProcess(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="ALL">All Processes</option>
              <option value="NCLOS">NCLOS</option>
              <option value="SDD">SDD</option>
              <option value="PSCF">PSCF</option>
              <option value="ISM">ISM</option>
            </select>
          </div>

          {(searchTerm || filterResource !== 'ALL' || filterAction !== 'ALL' || filterProcess !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterResource('ALL');
                setFilterAction('ALL');
                setFilterProcess('ALL');
                setCurrentPage(1);
              }}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold cursor-pointer px-2"
            >
              Reset Filters
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Export audit log to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table with Required Columns: Timestamp, Actor, Action, Resource, Detail */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-auto shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10.5px] font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-4 whitespace-nowrap">Timestamp</th>
              <th className="py-2.5 px-4 whitespace-nowrap">Actor</th>
              <th className="py-2.5 px-4 whitespace-nowrap">Action</th>
              <th className="py-2.5 px-4 whitespace-nowrap">Resource</th>
              <th className="py-2.5 px-4">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">
                      No matching audit records found
                    </p>
                    <p className="text-xs text-slate-400">
                      Try adjusting the search query or reset the filter dropdowns.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterResource('ALL');
                        setFilterAction('ALL');
                        setFilterProcess('ALL');
                        setCurrentPage(1);
                      }}
                      className="mt-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => {
                const initial = log.actor ? log.actor.charAt(0).toUpperCase() : 'U';
                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    {/* 1. Timestamp Column */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>

                    {/* 2. Actor Column */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[11px]">
                          {initial}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 font-mono text-xs">
                            {log.actor}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {log.actorRole}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Action Column */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.actionType)}
                    </td>

                    {/* 4. Resource Column */}
                    <td className="py-3 px-4">
                      {getResourceBadge(log.targetType, log.processKey, log.targetName)}
                    </td>

                    {/* 5. Detail Column */}
                    <td className="py-3 px-4">
                      <div className="space-y-1.5 max-w-[420px]">
                        <p className="text-slate-700 dark:text-slate-300 text-[11.5px] leading-relaxed">
                          {log.details}
                        </p>

                        {/* Before / After Diff */}
                        {(log.previousState || log.newState) && (
                          <div className="flex flex-wrap items-center gap-2 text-[10.5px] pt-0.5">
                            {log.previousState && (
                              <div className="flex items-center gap-1 font-mono">
                                <span className="text-rose-600 font-semibold text-[10px]">Prev:</span>
                                <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-[10px]">
                                  {log.previousState}
                                </span>
                              </div>
                            )}
                            {log.previousState && log.newState && (
                              <span className="text-slate-400 text-[10px]">→</span>
                            )}
                            {log.newState && (
                              <div className="flex items-center gap-1 font-mono">
                                <span className="text-emerald-600 font-semibold text-[10px]">New:</span>
                                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-[10px]">
                                  {log.newState}
                                </span>
                              </div>
                            )}
                          </div>
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

      {/* Footer & Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-500 shrink-0 px-1 py-1">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong>{paginatedLogs.length}</strong> of <strong>{filteredLogs.length}</strong> changes (Total: {logs.length})
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline-flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Immutable Log</span>
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Previous
            </button>
            <span className="px-2 font-mono text-[11px]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessAuditLog;
