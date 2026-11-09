import React, { useState, useMemo } from 'react';
import { ProcessDefinition, ProcessInstance } from '../../types/bpm';
import { 
  ArrowRightLeft, 
  CornerDownRight, 
  Ban, 
  RotateCw, 
  Filter, 
  X, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  PieChart,
  Activity,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles
} from 'lucide-react';

interface OperationModuleProps {
  currentProcess: ProcessDefinition;
  instances: ProcessInstance[];
  onUpdateInstances: (instances: ProcessInstance[]) => void;
  onSelectProcess: (key: string) => void;
}

export const OperationModule: React.FC<OperationModuleProps> = ({
  currentProcess,
  instances,
  onUpdateInstances,
  onSelectProcess,
}) => {
  // Filter state
  const [filterVersion, setFilterVersion] = useState<string>('ALL');
  const [filterTaskName, setFilterTaskName] = useState<string>('ALL');
  const [filterId, setFilterId] = useState<string>('');
  const [filterRecordCode, setFilterRecordCode] = useState<string>('');
  const [filterActive, setFilterActive] = useState<boolean>(true);
  const [filterIssues, setFilterIssues] = useState<boolean>(true);
  const [filterCompleted, setFilterCompleted] = useState<boolean>(true);
  const [filterCanceled, setFilterCanceled] = useState<boolean>(false);

  // Selected row
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([]);
  const [activeInstanceDetail, setActiveInstanceDetail] = useState<ProcessInstance | null>(null);

  // Summary Dashboard Card Toggle
  const [showSummaryDashboard, setShowSummaryDashboard] = useState<boolean>(true);

  // Computed summary metrics for the current process
  const currentProcessInstances = useMemo(() => {
    return instances.filter(i => i.processKey === currentProcess.key);
  }, [instances, currentProcess.key]);

  const activeCount = useMemo(() => {
    return currentProcessInstances.filter(i => i.status === 'ACTIVATED').length;
  }, [currentProcessInstances]);

  const completedCount = useMemo(() => {
    return currentProcessInstances.filter(i => i.status === 'COMPLETED').length;
  }, [currentProcessInstances]);

  const canceledCount = useMemo(() => {
    return currentProcessInstances.filter(i => i.status === 'CANCELED' || i.status === 'SUSPENDED').length;
  }, [currentProcessInstances]);

  const totalInstances = currentProcessInstances.length;

  const completionRate = totalInstances > 0 
    ? Math.round((completedCount / totalInstances) * 100) 
    : 0;

  const activeRate = totalInstances > 0 
    ? Math.round((activeCount / totalInstances) * 100) 
    : 0;

  const canceledRate = totalInstances > 0 
    ? Math.max(0, 100 - completionRate - activeRate) 
    : 0;

  // Modals for actions
  const [showMigrateModal, setShowMigrateModal] = useState<boolean>(false);
  const [showMoveModal, setShowMoveModal] = useState<boolean>(false);
  const [targetStep, setTargetStep] = useState<string>('CHO XU LY');
  const [targetVersion, setTargetVersion] = useState<number>(3);

  // Filter instances
  const filteredInstances = instances.filter(inst => {
    if (inst.processKey !== currentProcess.key) return false;
    if (filterVersion !== 'ALL' && inst.version.toString() !== filterVersion) return false;
    if (filterTaskName !== 'ALL' && inst.currentStep !== filterTaskName) return false;
    if (filterId && !inst.id.includes(filterId)) return false;
    if (filterRecordCode && !inst.recordCode.toLowerCase().includes(filterRecordCode.toLowerCase())) return false;
    
    // Status filters
    if (inst.status === 'ACTIVATED' && !filterActive) return false;
    if (inst.status === 'COMPLETED' && !filterCompleted) return false;
    if (inst.status === 'CANCELED' && !filterCanceled) return false;
    
    return true;
  });

  const handleToggleSelectAll = () => {
    if (selectedInstanceIds.length === filteredInstances.length) {
      setSelectedInstanceIds([]);
    } else {
      setSelectedInstanceIds(filteredInstances.map(i => i.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    if (selectedInstanceIds.includes(id)) {
      setSelectedInstanceIds(selectedInstanceIds.filter(i => i !== id));
    } else {
      setSelectedInstanceIds([...selectedInstanceIds, id]);
    }
  };

  const handleCancelSelected = () => {
    if (selectedInstanceIds.length === 0) return;
    const updated = instances.map(inst => {
      if (selectedInstanceIds.includes(inst.id)) {
        return { ...inst, status: 'CANCELED' as const, completedAt: '19/05/2026 14:35:00' };
      }
      return inst;
    });
    onUpdateInstances(updated);
    setSelectedInstanceIds([]);
  };

  const handleMigrateInstances = () => {
    const updated = instances.map(inst => {
      if (selectedInstanceIds.includes(inst.id)) {
        return { ...inst, version: targetVersion };
      }
      return inst;
    });
    onUpdateInstances(updated);
    setShowMigrateModal(false);
    setSelectedInstanceIds([]);
  };

  const handleMoveTokens = () => {
    const updated = instances.map(inst => {
      if (selectedInstanceIds.includes(inst.id)) {
        const targetNode = currentProcess.nodes.find(n => n.name === targetStep);
        return { 
          ...inst, 
          currentStep: targetStep, 
          activeNodeId: targetNode?.id || inst.activeNodeId 
        };
      }
      return inst;
    });
    onUpdateInstances(updated);
    setShowMoveModal(false);
    setSelectedInstanceIds([]);
  };

  // Determine active highlight node in top diagram based on selected row or first instance
  const highlightedNodeName = selectedInstanceIds.length > 0
    ? instances.find(i => i.id === selectedInstanceIds[0])?.currentStep
    : activeInstanceDetail?.currentStep;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-white dark:bg-slate-900 select-none">
      {/* Top BPMN Diagram Visualizer & Process Info matching image_b6a9cae4.png */}
      <div className="h-64 border-b border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col shrink-0 relative">
        <div className="flex items-center justify-between pb-1 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{currentProcess.key}</h2>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
              <span>Create: <strong className="text-slate-700 dark:text-slate-300 font-normal">{currentProcess.creator}</strong></span>
              <span>Version: <strong className="text-slate-700 dark:text-slate-300 font-bold">{currentProcess.version}</strong></span>
              <span>description: <span className="text-slate-600 dark:text-slate-400">{currentProcess.description}</span></span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-bold tracking-wider">
            BPMN.IO
          </div>
        </div>

        {/* Scaled Mini SVG Diagram with active token marker */}
        <div className="flex-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-950 overflow-hidden relative">
          <svg className="w-full h-full" viewBox="0 0 850 400">
            {/* Draw nodes */}
            {currentProcess.nodes.map(node => {
              const isActiveHere = highlightedNodeName === node.name;
              return (
                <g key={node.id} transform={`translate(${node.x * 0.9}, ${node.y * 0.4})`}>
                  {node.type.includes('Task') ? (
                    <g>
                      <rect
                        width={node.width * 0.9}
                        height={node.height * 0.8}
                        rx="4"
                        fill={isActiveHere ? '#dcfce7' : '#ffffff'}
                        stroke={isActiveHere ? '#15803d' : '#475569'}
                        strokeWidth={isActiveHere ? 2.5 : 1}
                      />
                      <text
                        x={(node.width * 0.9) / 2}
                        y={(node.height * 0.8) / 2 + 3}
                        fontSize="7.5"
                        textAnchor="middle"
                        fontWeight="600"
                        fill="#0f172a"
                      >
                        {node.name.length > 15 ? `${node.name.slice(0, 13)}..` : node.name}
                      </text>
                      {isActiveHere && (
                        <circle cx="6" cy="6" r="4" fill="#16a34a" className="animate-ping" />
                      )}
                    </g>
                  ) : node.type === 'exclusiveGateway' ? (
                    <polygon
                      points={`${node.width/2},0 ${node.width},${node.height/2} ${node.width/2},${node.height} 0,${node.height/2}`}
                      fill="#ffffff"
                      stroke="#475569"
                      strokeWidth="1"
                    />
                  ) : (
                    <circle
                      cx={node.width/2}
                      cy={node.height/2}
                      r={node.width/2}
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Top Right Operational Buttons */}
        <div className="absolute right-4 bottom-4 flex items-center gap-2">
          <button
            onClick={() => setShowMigrateModal(true)}
            disabled={selectedInstanceIds.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Migrate Version</span>
          </button>
          <button
            onClick={() => setShowMoveModal(true)}
            disabled={selectedInstanceIds.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <CornerDownRight className="w-3.5 h-3.5" />
            <span>Move Token</span>
          </button>
          <button
            onClick={handleCancelSelected}
            disabled={selectedInstanceIds.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Cancel Instance</span>
          </button>
        </div>
      </div>

      {/* Split Body: Filters on Left + Data Grid on Right matching image_b6a9cae4.png */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Filter Panel */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-800 p-3 bg-slate-50/40 dark:bg-slate-900/60 overflow-y-auto text-xs space-y-3.5 shrink-0">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Process Version</label>
            <select
              value={filterVersion}
              onChange={(e) => setFilterVersion(e.target.value)}
              className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
            >
              <option value="ALL">ALL</option>
              <option value="1">Version 1</option>
              <option value="2">Version 2</option>
              <option value="3">Version 3</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Task Name</label>
            <select
              value={filterTaskName}
              onChange={(e) => setFilterTaskName(e.target.value)}
              className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
            >
              <option value="ALL">ALL</option>
              {currentProcess.nodes.filter(n => n.type.includes('Task')).map(n => (
                <option key={n.id} value={n.name}>{n.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">ID</label>
            <input
              type="text"
              placeholder="e.g. 6755399..."
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Mã hồ sơ</label>
            <input
              type="text"
              placeholder="e.g. SDD-0000426..."
              value={filterRecordCode}
              onChange={(e) => setFilterRecordCode(e.target.value)}
              className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono"
            />
          </div>

          {/* Running Instances Checkbox group */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Running Instances</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterActive}
                onChange={(e) => setFilterActive(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Active ({activeCount})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterIssues}
                onChange={(e) => setFilterIssues(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Issues (0)</span>
            </label>
          </div>

          {/* Finished Instances Checkbox group */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Finished Instances</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterCompleted}
                onChange={(e) => setFilterCompleted(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Completed ({completedCount})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterCanceled}
                onChange={(e) => setFilterCanceled(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Canceled ({canceledCount})</span>
            </label>
          </div>

          {/* Buttons: Clear Filter, Apply Filter matching screenshot */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <button
              onClick={() => {
                setFilterVersion('ALL');
                setFilterTaskName('ALL');
                setFilterId('');
                setFilterRecordCode('');
                setFilterActive(true);
                setFilterIssues(true);
                setFilterCompleted(true);
                setFilterCanceled(false);
              }}
              className="flex-1 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-medium"
            >
              Clear Filter
            </button>
            <button
              onClick={() => {
                // applied
              }}
              className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Main Instance Table */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Summary Dashboard Card: Active vs. Completed Instances with Progress Ring */}
          <div className="p-3.5 m-3 mb-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-xs backdrop-blur-xs transition-all">
            {/* Dashboard Card Top Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                    <span>Tổng Quan Trạng Thái Luồng Vận Hành (Instance Performance Overview)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                      {currentProcess.key} &bull; v{currentProcess.version}.0
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Trực quan hóa tỷ lệ hồ sơ Active (Đang xử lý) so với Completed (Đã hoàn tất) theo thời gian thực
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
                  <button
                    onClick={() => {
                      setFilterActive(true);
                      setFilterCompleted(true);
                      setFilterCanceled(true);
                    }}
                    className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                      filterActive && filterCompleted && filterCanceled
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Tất cả ({totalInstances})
                  </button>
                  <button
                    onClick={() => {
                      setFilterActive(true);
                      setFilterCompleted(false);
                      setFilterCanceled(false);
                    }}
                    className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                      filterActive && !filterCompleted && !filterCanceled
                        ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-emerald-600'
                    }`}
                  >
                    Active ({activeCount})
                  </button>
                  <button
                    onClick={() => {
                      setFilterActive(false);
                      setFilterCompleted(true);
                      setFilterCanceled(false);
                    }}
                    className={`px-2 py-0.5 rounded font-semibold transition-all cursor-pointer ${
                      !filterActive && filterCompleted && !filterCanceled
                        ? 'bg-blue-600 text-white shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-blue-600'
                    }`}
                  >
                    Completed ({completedCount})
                  </button>
                </div>

                <button
                  onClick={() => setShowSummaryDashboard(!showSummaryDashboard)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors flex items-center gap-1 text-[11px]"
                  title={showSummaryDashboard ? 'Thu gọn thẻ tổng quan' : 'Mở rộng thẻ tổng quan'}
                >
                  <span className="hidden sm:inline">{showSummaryDashboard ? 'Thu gọn' : 'Mở rộng'}</span>
                  {showSummaryDashboard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Dashboard Card Content */}
            {showSummaryDashboard && (
              <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center animate-in fade-in duration-150">
                
                {/* 1. Progress Ring Column */}
                <div className="lg:col-span-3 flex items-center gap-3 p-2.5 bg-slate-50/80 dark:bg-slate-850/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <div className="relative w-22 h-22 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 92 92">
                      {/* Background track circle */}
                      <circle
                        cx="46"
                        cy="46"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="7"
                        fill="transparent"
                        className="text-slate-200 dark:text-slate-700/60"
                      />

                      {/* Completed Segment (Blue) */}
                      {totalInstances > 0 && completedCount > 0 && (
                        <circle
                          cx="46"
                          cy="46"
                          r="36"
                          stroke="#2563eb"
                          strokeWidth="7"
                          strokeDasharray={`${(completionRate / 100) * 226.195} 226.195`}
                          strokeDashoffset={0}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-700 ease-out"
                        />
                      )}

                      {/* Active Segment (Emerald) */}
                      {totalInstances > 0 && activeCount > 0 && (
                        <circle
                          cx="46"
                          cy="46"
                          r="36"
                          stroke="#10b981"
                          strokeWidth="7"
                          strokeDasharray={`${(activeRate / 100) * 226.195} 226.195`}
                          strokeDashoffset={-((completionRate / 100) * 226.195)}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-700 ease-out"
                        />
                      )}

                      {/* Canceled Segment (Rose) */}
                      {totalInstances > 0 && canceledCount > 0 && (
                        <circle
                          cx="46"
                          cy="46"
                          r="36"
                          stroke="#f43f5e"
                          strokeWidth="7"
                          strokeDasharray={`${(canceledRate / 100) * 226.195} 226.195`}
                          strokeDashoffset={-(((completionRate + activeRate) / 100) * 226.195)}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-700 ease-out"
                        />
                      )}
                    </svg>

                    {/* Progress Ring Center Value */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                      <span className="font-mono font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-none">
                        {completionRate}%
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-tight mt-0.5">
                        Hoàn tất
                      </span>
                    </div>
                  </div>

                  {/* Ring Legend */}
                  <div className="space-y-1 text-[10.5px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Active:</span>
                      <strong className="font-mono text-slate-900 dark:text-slate-100 font-bold">{activeCount}</strong>
                      <span className="text-slate-400 text-[9.5px]">({activeRate}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Completed:</span>
                      <strong className="font-mono text-slate-900 dark:text-slate-100 font-bold">{completedCount}</strong>
                      <span className="text-slate-400 text-[9.5px]">({completionRate}%)</span>
                    </div>
                    {canceledCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Canceled:</span>
                        <strong className="font-mono text-slate-900 dark:text-slate-100 font-bold">{canceledCount}</strong>
                        <span className="text-slate-400 text-[9.5px]">({canceledRate}%)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Active Instances KPI Card */}
                <div 
                  onClick={() => {
                    setFilterActive(true);
                    setFilterCompleted(false);
                    setFilterCanceled(false);
                  }}
                  className={`lg:col-span-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                    filterActive && !filterCompleted && !filterCanceled
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Đang Xử Lý (Active)
                    </span>
                    <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {activeRate}%
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-mono font-extrabold text-emerald-900 dark:text-emerald-100">
                      {activeCount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">/ {totalInstances} hồ sơ</span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-emerald-700/80 dark:text-emerald-400">
                    <span>Tokens đang dịch chuyển</span>
                    <span className="font-semibold underline group-hover:text-emerald-900 dark:group-hover:text-emerald-200">
                      {filterActive && !filterCompleted && !filterCanceled ? '✓ Đang lọc' : 'Lọc Active →'}
                    </span>
                  </div>
                </div>

                {/* 3. Completed Instances KPI Card */}
                <div 
                  onClick={() => {
                    setFilterActive(false);
                    setFilterCompleted(true);
                    setFilterCanceled(false);
                  }}
                  className={`lg:col-span-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                    !filterActive && filterCompleted && !filterCanceled
                      ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-800/60 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      Đã Hoàn Tất (Completed)
                    </span>
                    <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {completionRate}%
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-mono font-extrabold text-blue-900 dark:text-blue-100">
                      {completedCount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">/ {totalInstances} hồ sơ</span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-blue-700/80 dark:text-blue-400">
                    <span>Đạt chuẩn kết thúc End Event</span>
                    <span className="font-semibold underline group-hover:text-blue-900 dark:group-hover:text-blue-200">
                      {!filterActive && filterCompleted && !filterCanceled ? '✓ Đang lọc' : 'Lọc Completed →'}
                    </span>
                  </div>
                </div>

                {/* 4. Operational Health & Ratio Summary */}
                <div className="lg:col-span-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-purple-500" />
                      Tỷ Lệ Vận Hành (Ratio)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      SLA On-track
                    </span>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    {/* Active vs Completed Mini Bar */}
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                      <div 
                        style={{ width: `${activeRate}%` }} 
                        className="bg-emerald-500 h-full transition-all duration-500" 
                        title={`Active: ${activeRate}%`}
                      />
                      <div 
                        style={{ width: `${completionRate}%` }} 
                        className="bg-blue-600 h-full transition-all duration-500" 
                        title={`Completed: ${completionRate}%`}
                      />
                      <div 
                        style={{ width: `${canceledRate}%` }} 
                        className="bg-rose-500 h-full transition-all duration-500" 
                        title={`Canceled: ${canceledRate}%`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>Đang chọn: <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedInstanceIds.length}</strong>/{filteredInstances.length}</span>
                      <button
                        onClick={() => {
                          setFilterActive(true);
                          setFilterCompleted(true);
                          setFilterCanceled(true);
                          setFilterVersion('ALL');
                          setFilterTaskName('ALL');
                        }}
                        className="text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer"
                      >
                        Reset Bộ Lọc
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          <table className="w-full text-left text-xs border-collapse">
            {/* Green Header Row matching image_b6a9cae4.png */}
            <thead className="bg-emerald-700 text-white sticky top-0 z-10 font-semibold select-none text-[11.5px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedInstanceIds.length > 0 && selectedInstanceIds.length === filteredInstances.length}
                    onChange={handleToggleSelectAll}
                    className="rounded text-emerald-900 border-white"
                  />
                </th>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Mã hồ sơ</th>
                <th className="py-2.5 px-3">Bước</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Started At</th>
                <th className="py-2.5 px-3">Completed At</th>
                <th className="py-2.5 px-3 text-center">Version</th>
                <th className="py-2.5 px-3">Created By</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredInstances.map((inst, index) => {
                const isSelected = selectedInstanceIds.includes(inst.id);
                return (
                  <tr
                    key={inst.id}
                    onClick={() => setActiveInstanceDetail(inst)}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/70 dark:bg-emerald-950/30' : index % 2 === 1 ? 'bg-slate-50/30 dark:bg-slate-900/30' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(inst.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-2 px-3 font-mono text-emerald-700 dark:text-emerald-400 font-medium hover:underline">
                      {inst.id}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {inst.recordCode}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {inst.currentStep}
                    </td>
                    <td className="py-2 px-3 truncate max-w-[220px]" title={inst.name}>
                      {inst.name}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        inst.status === 'ACTIVATED' 
                          ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40' 
                          : inst.status === 'COMPLETED' 
                            ? 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40' 
                            : 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40'
                      }`}>
                        {inst.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {inst.startedAt}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {inst.completedAt || '-'}
                    </td>
                    <td className="py-2 px-3 font-mono text-center font-bold text-slate-700 dark:text-slate-300">
                      {inst.version}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {inst.createdBy}
                    </td>
                    <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          const updated = instances.map(i => i.id === inst.id ? { ...i, status: 'CANCELED' as const } : i);
                          onUpdateInstances(updated);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                        title="Cancel this instance"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredInstances.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              Không tìm thấy instance nào phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>
      </div>

      {/* Migration Modal */}
      {showMigrateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Migrate Process Instances</h3>
              </div>
              <button onClick={() => setShowMigrateModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Chuyển đổi <strong className="text-emerald-700">{selectedInstanceIds.length}</strong> instances đang chọn sang phiên bản quy trình mới:
              </p>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Version</label>
                <select
                  value={targetVersion}
                  onChange={(e) => setTargetVersion(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold"
                >
                  <option value={2}>Version 2 (Current)</option>
                  <option value={3}>Version 3 (Latest Production)</option>
                </select>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded text-[11px] text-slate-500">
                Engine sẽ tự động ánh xạ token vị trí hiện tại sang node tương ứng trong định nghĩa mới.
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button onClick={() => setShowMigrateModal(false)} className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold">
                Hủy
              </button>
              <button onClick={handleMigrateInstances} className="px-4 py-1.5 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800">
                Xác nhận Migrate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Token Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CornerDownRight className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Di chuyển vị trí Token (Move)</h3>
              </div>
              <button onClick={() => setShowMoveModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Can thiệp vận hành: di chuyển token của <strong className="text-emerald-700">{selectedInstanceIds.length}</strong> instances tới một bước chỉ định:
              </p>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Element / Step</label>
                <select
                  value={targetStep}
                  onChange={(e) => setTargetStep(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-semibold"
                >
                  {currentProcess.nodes.filter(n => n.type.includes('Task')).map(n => (
                    <option key={n.id} value={n.name}>{n.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button onClick={() => setShowMoveModal(false)} className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold">
                Hủy
              </button>
              <button onClick={handleMoveTokens} className="px-4 py-1.5 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800">
                Move Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instance Detail Drawer / Modal */}
      {activeInstanceDetail && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-50 flex flex-col p-4 text-xs overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">INSTANCE DETAILS</span>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">{activeInstanceDetail.id}</h3>
            </div>
            <button onClick={() => setActiveInstanceDetail(null)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
          </div>

          <div className="py-3 space-y-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500">Mã hồ sơ:</span>
              <span className="font-mono font-semibold">{activeInstanceDetail.recordCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Khách hàng:</span>
              <span className="font-semibold text-right max-w-[200px]">{activeInstanceDetail.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bước hiện tại:</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">{activeInstanceDetail.currentStep}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Số tiền đề xuất:</span>
              <span className="font-mono font-semibold">{activeInstanceDetail.amount || '4,500,000,000 VND'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Đơn vị kinh doanh:</span>
              <span>{activeInstanceDetail.branch || 'Chi nhánh Hà Nội'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Khởi tạo lúc:</span>
              <span className="font-mono">{activeInstanceDetail.startedAt}</span>
            </div>
          </div>

          <div className="py-3">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">Process Variables (Camunda Execution Payload)</span>
            <div className="p-2 bg-slate-950 rounded text-emerald-400 font-mono text-[11px] space-y-1">
              <div>&quot;customerName&quot;: &quot;{activeInstanceDetail.name}&quot;</div>
              <div>&quot;recordCode&quot;: &quot;{activeInstanceDetail.recordCode}&quot;</div>
              <div>&quot;amount&quot;: 4500000000</div>
              <div>&quot;creditRating&quot;: &quot;AAA&quot;</div>
              <div>&quot;isCollateralValid&quot;: true</div>
              <div>&quot;approvalLevel&quot;: &quot;DIRECTOR&quot;</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
