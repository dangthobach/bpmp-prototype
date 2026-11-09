import React, { useState } from 'react';
import { ProcessDefinition, TaskHeatmapData } from '../../types/bpm';
import { NCLOS_HEATMAP_DATA } from '../../data/mockBpmData';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  PieChart, 
  Clock, 
  Calendar, 
  RotateCcw, 
  Filter, 
  Flame, 
  Layers, 
  HelpCircle,
  ChevronDown,
  Info,
  Activity,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  CheckCircle2,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { ProcessHealthReport } from './ProcessHealthReport';
import { ProcessThroughputDashboard } from './ProcessThroughputDashboard';

interface OptimizeModuleProps {
  processes: ProcessDefinition[];
  currentProcess: ProcessDefinition;
}

export const OptimizeModule: React.FC<OptimizeModuleProps> = ({
  processes,
  currentProcess,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'charts' | 'throughput' | 'health' | 'heatmap'>('throughput');

  // Heatmap configuration state matching image_12d8ec25.png
  const [selectedProcessKey, setSelectedProcessKey] = useState<string>('NCLOS');
  const [timeUnit, setTimeUnit] = useState<string>('Giờ');
  const [thresholdHours, setThresholdHours] = useState<number>(1);
  const [dateRange, setDateRange] = useState<string>('13/05/2026 - 20/05/2026');
  const [hoveredTaskHeatmap, setHoveredTaskHeatmap] = useState<{
    task: TaskHeatmapData;
    x: number;
    y: number;
  } | null>(null);

  // Process data for charts matching image_bc407308.png
  const processNames = ['GIẢI NGÂN (SDD)', 'NCLOS', 'ELOS', 'TFE', 'pscf', 'BPDP', 'BG', 'SCF', 'LC', 'BCLC', 'RetailBio', 'BCLI'];
  const processVolumes = [120, 80, 24500, 15, 60, 40, 10, 30, 25, 10, 21800, 5];

  // Peak Hour Heatmap dates (sample 15 days out of month)
  const heatmapDates = [
    '19/05', '18/05', '17/05', '16/05', '15/05', '14/05', '13/05', '12/05',
    '11/05', '10/05', '09/05', '08/05', '07/05', '06/05', '05/05'
  ];

  const nclosProcess = processes.find(p => p.key === 'NCLOS') || processes[0];

  // Dynamic metric calculations for Executive Dashboard Summary
  const heatmapEntries = Object.values(NCLOS_HEATMAP_DATA);
  const bottleneckTasks = heatmapEntries.filter(
    (h) => h.colorGrade === 'purple' || (h.totalInstances > 0 && h.overThresholdCount / h.totalInstances >= 0.35)
  );
  const bottleneckCount = bottleneckTasks.length;

  const totalActiveInstances = processVolumes.reduce((acc, curr) => acc + curr, 0);
  const totalCompletedInstances = 31290;
  const totalAllInstances = totalActiveInstances + totalCompletedInstances;
  const activeInstanceRatio = ((totalActiveInstances / totalAllInstances) * 100).toFixed(1);

  const avgCycleTimeHours = 14.2;
  const cycleTimeImprovementPercent = 28;
  const slaCompliancePercent = 94.8;
  const criticalTasksCount = 48;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-white dark:bg-slate-900 select-none">
      {/* Top Tabs bar */}
      <div className="px-4 py-2 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shrink-0 flex-wrap gap-2">
        {/* Modern Segmented Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Tổng Quan &amp; Chỉ Số Nhanh
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'charts'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Biểu Đồ Vận Hành &amp; Hiệu Suất
          </button>

          <button
            onClick={() => setActiveTab('throughput')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'throughput'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>Process Throughput &amp; Cycle Time</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'health'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Process Health &amp; Tỷ Lệ Lỗi</span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'heatmap'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>BPMN Heatmap Analysis</span>
          </button>
        </div>

        {/* Top Right Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // reset filters
            }}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
          >
            ✕ Xóa Bộ Lọc
          </button>
          <button
            onClick={() => {
              // apply filters
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            ✓ Áp Dụng
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-100/50 dark:bg-slate-950/40">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Executive Dashboard Summary Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Chỉ Số Hiệu Suất Vận Hành Toàn Diện (Executive Process KPI Cockpit)
                    </h3>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Live Stream
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Phân tích tức thời từ {processes.length} quy trình nghiệp vụ &bull; {totalActiveInstances.toLocaleString()} phiên thực thi đang chạy
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Hệ thống Camunda/Zeebee ổn định
                </span>
              </div>
            </div>

            {/* 4 Visual KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: Average Cycle Time */}
              <div 
                onClick={() => setActiveTab('throughput')}
                className="bg-slate-50/70 dark:bg-slate-800/40 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-800/60 transition-all rounded-lg p-3.5 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between group cursor-pointer"
                title="Nhấp để xem Bảng theo dõi Process Throughput & Tốc độ hoàn tất theo thời gian"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Average Cycle Time
                    </span>
                    <div className="p-1.5 rounded-md bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                      {avgCycleTimeHours}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">giờ / quy trình</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      <TrendingDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      -{cycleTimeImprovementPercent}%
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Nhanh hơn 5.5h sau tối ưu
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                    <span>Chờ: 3.1h (22%)</span>
                    <span>Xử lý: 11.1h (78%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div className="bg-amber-400 h-full w-[22%]" title="Thời gian chờ: 3.1h" />
                    <div className="bg-emerald-500 h-full w-[78%]" title="Thời gian xử lý: 11.1h" />
                  </div>
                  <div className="mt-2 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline flex items-center justify-end gap-0.5">
                    <span>Xem Throughput &rarr;</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Bottleneck Count */}
              <div 
                onClick={() => setActiveTab('heatmap')}
                className="bg-slate-50/70 dark:bg-slate-800/40 hover:bg-rose-50/60 dark:hover:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-800/60 transition-all rounded-lg p-3.5 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between group cursor-pointer"
                title="Nhấp để chuyển trực tiếp đến BPMN Heatmap"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Bottleneck Count
                    </span>
                    <div className="p-1.5 rounded-md bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 group-hover:scale-105 transition-transform">
                      <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                      {bottleneckCount}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">điểm nghẽn cần xử lý</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Vượt SLA &gt; 35%
                    </span>
                    <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium truncate">
                      THUC DIA &bull; THAM DINH 2
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Xem trực quan node BPMN</span>
                  <span className="text-rose-600 dark:text-rose-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    Mở Heatmap &rarr;
                  </span>
                </div>
              </div>

              {/* Card 3: Total Active Instances */}
              <div 
                onClick={() => setActiveTab('charts')}
                className="bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/60 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-800/60 transition-all rounded-lg p-3.5 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between group cursor-pointer"
                title="Nhấp để xem biểu đồ phân bổ instance"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Total Active Instances
                    </span>
                    <div className="p-1.5 rounded-md bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 group-hover:scale-105 transition-transform">
                      <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono tracking-tight">
                      {totalActiveInstances.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">phiên đang chạy</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                      <Zap className="w-3 h-3 text-blue-600" />
                      {activeInstanceRatio}% tổng tải
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      ELOS (24.5k), RetailBio (21.8k)
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                    <span>Đang chạy: {totalActiveInstances.toLocaleString()}</span>
                    <span>Đã xong: {totalCompletedInstances.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div className="bg-blue-600 h-full" style={{ width: `${activeInstanceRatio}%` }} />
                    <div className="bg-slate-300 dark:bg-slate-600 h-full" style={{ width: `${100 - Number(activeInstanceRatio)}%` }} />
                  </div>
                </div>
              </div>

              {/* Card 4: SLA Compliance Rate & Process Health */}
              <div 
                onClick={() => setActiveTab('health')}
                className="bg-slate-50/70 dark:bg-slate-800/40 hover:bg-purple-50/60 dark:hover:bg-purple-950/20 hover:border-purple-300 dark:hover:border-purple-800/60 transition-all rounded-lg p-3.5 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between group cursor-pointer"
                title="Nhấp để xem Báo cáo Process Health & Tỷ lệ lỗi chi tiết"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      SLA Compliance &amp; Health
                    </span>
                    <div className="p-1.5 rounded-md bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono tracking-tight">
                      {slaCompliancePercent}%
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">hoàn tất đúng cam kết</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      +1.2% MoM
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Vượt ngưỡng chuẩn (&ge; 92%)
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">{criticalTasksCount} ca cần can thiệp</span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:underline flex items-center gap-0.5">
                    Xem Process Health &rarr;
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Tab View */}
          {activeTab === 'throughput' && (
            <ProcessThroughputDashboard
              processes={processes}
              currentProcessKey={selectedProcessKey}
              onNotify={(msg) => {
                // notification feedback
              }}
              onOpenHeatmap={(procKey) => {
                setSelectedProcessKey(procKey);
                setActiveTab('heatmap');
              }}
            />
          )}

          {activeTab === 'charts' && (
            <div className="space-y-4">
            {/* Row 1: Instance theo quy trình + Xu hướng mới theo ngày */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Chart 1: Bar chart INSTANCE THEO QUY TRÌNH */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
                  INSTANCE THEO QUY TRÌNH
                </h4>
                <div className="h-56 flex items-end gap-2 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                  {processNames.map((name, i) => {
                    const maxVal = 26000;
                    const heightPercent = Math.min(100, Math.max(6, (processVolumes[i] / maxVal) * 100));
                    return (
                      <div key={name} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        {/* Tooltip */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                          {name}: {processVolumes[i].toLocaleString()}
                        </div>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t transition-all ${
                            name === 'ELOS' || name === 'RetailBio'
                              ? 'bg-blue-600 group-hover:bg-blue-500'
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        />
                        <span className="text-[9px] text-slate-500 mt-2 truncate w-full text-center -rotate-45 origin-top-left transform translate-y-3">
                          {name.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-6 text-[10px] text-slate-400 flex justify-between">
                  <span>Dữ liệu tổng hợp theo tenant: ecmbpm</span>
                  <span className="font-mono">Tổng: 46,750 instances</span>
                </div>
              </div>

              {/* Chart 2: Line chart XU HƯỚNG INSTANCE MỚI THEO NGÀY */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  XU HƯỚNG INSTANCE MỚI THEO NGÀY
                </h4>
                <div className="h-56 w-full relative pt-4">
                  {/* SVG line path simulating image_bc407308.png with huge peak near 18/05 */}
                  <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 160">
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" />

                    {/* Area fill */}
                    <path
                      d="M 0 140 L 40 138 L 80 139 L 120 137 L 160 138 L 200 136 L 240 137 L 280 135 L 320 136 L 360 135 L 400 134 L 440 30 L 460 35 L 480 120 L 500 135 L 500 140 Z"
                      fill="url(#lineGrad)"
                    />
                    {/* Line path */}
                    <path
                      d="M 0 140 L 40 138 L 80 139 L 120 137 L 160 138 L 200 136 L 240 137 L 280 135 L 320 136 L 360 135 L 400 134 L 440 30 L 460 35 L 480 120 L 500 135"
                      fill="none"
                      stroke="#047857"
                      strokeWidth="2.5"
                    />
                    {/* Peak point */}
                    <circle cx="440" cy="30" r="4" fill="#047857" />
                    <text x="440" y="18" fontSize="10" fontWeight="bold" fill="#047857" textAnchor="middle">
                      32,150
                    </text>
                  </svg>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-3">
                    <span>19/04</span>
                    <span>26/04</span>
                    <span>03/05</span>
                    <span>10/05</span>
                    <span className="font-bold text-emerald-700">18/05</span>
                    <span>19/05</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Phân bổ trạng thái instance (Donut) + Thời gian xử lý trung bình */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Donut Chart matching image_bc407308.png */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
                  PHÂN BỔ TRẠNG THÁI INSTANCE
                </h4>
                <div className="flex items-center justify-around h-56">
                  {/* SVG Donut */}
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Completed: 54.1% -> strokeDasharray="54.1 45.9" strokeDashoffset="0" */}
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#16a34a" strokeWidth="18" strokeDasharray="54.1 45.9" strokeDashoffset="0" />
                      {/* Active: 39.4% -> strokeDasharray="39.4 60.6" strokeDashoffset="-54.1" */}
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#2563eb" strokeWidth="18" strokeDasharray="39.4 60.6" strokeDashoffset="-54.1" />
                      {/* Issues/Errors: 6.6% -> strokeDasharray="6.6 93.4" strokeDashoffset="-93.5" */}
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#dc2626" strokeWidth="18" strokeDasharray="6.6 93.4" strokeDashoffset="-93.5" />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-[11px] text-slate-400 font-semibold block">Tổng</span>
                      <span className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono">73930</span>
                    </div>
                  </div>

                  {/* Legend list matching screenshot */}
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-600" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Completed: 54.1%</span>
                      <span className="font-mono text-slate-400">(40,012)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-600" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Active: 39.4%</span>
                      <span className="font-mono text-slate-400">(29,145)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-600" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Issues: 6.6%</span>
                      <span className="font-mono text-slate-400">(4,773)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal Bar: THỜI GIAN XỬ LÝ TRUNG BÌNH THEO QUY TRÌNH */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  THỜI GIAN XỬ LÝ TRUNG BÌNH THEO QUY TRÌNH
                </h4>
                <div className="space-y-2 pt-2">
                  {[
                    { name: 'ELOS', minutes: 85315, color: '#15803d' },
                    { name: 'RetailBio', minutes: 21600, color: '#16a34a' },
                    { name: 'GIẢI NGÂN (SDD)', minutes: 1420, color: '#64748b' },
                    { name: 'NCLOS', minutes: 890, color: '#64748b' },
                    { name: 'TFE', minutes: 450, color: '#64748b' },
                    { name: 'pscf', minutes: 320, color: '#64748b' },
                  ].map(item => {
                    const widthPercent = (item.minutes / 90000) * 100;
                    return (
                      <div key={item.name} className="flex items-center text-xs">
                        <span className="w-32 font-semibold text-slate-700 dark:text-slate-300 truncate text-[11px]">
                          {item.name}
                        </span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-5 rounded overflow-hidden flex items-center">
                          <div
                            style={{ width: `${widthPercent}%`, backgroundColor: item.color }}
                            className="h-full rounded transition-all"
                          />
                        </div>
                        <span className="w-24 text-right font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                          {item.minutes.toLocaleString()} phút
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 3: PEAK HOUR XỬ LÝ (HEATMAP) matching image_bc407308.png */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  PEAK HOUR XỬ LÝ (HEATMAP)
                </h4>
                {/* Legend matching screenshot */}
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-100 border border-slate-300" /> Không có</div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-sky-200" /> Rất thấp</div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-sky-400" /> Thấp</div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-400" /> Trung bình</div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-500" /> Cao</div>
                  <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-600" /> Cao điểm</div>
                </div>
              </div>

              {/* 24-Hour Heatmap Grid */}
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Hours Header */}
                  <div className="grid grid-cols-25 text-[10px] font-mono text-slate-400 pb-1 border-b border-slate-100">
                    <span className="w-12">Ngày</span>
                    {Array.from({ length: 24 }).map((_, h) => (
                      <span key={h} className="text-center">{h}h</span>
                    ))}
                  </div>

                  {/* Rows by day */}
                  <div className="space-y-1 pt-1.5">
                    {heatmapDates.map((date, idx) => (
                      <div key={date} className="grid grid-cols-25 items-center">
                        <span className="text-[10px] font-mono text-slate-500 w-12">{date}</span>
                        {Array.from({ length: 24 }).map((_, hour) => {
                          // Simulate realistic bank peak hours (9h-11h, 14h-16h)
                          let bg = 'bg-slate-100 dark:bg-slate-800';
                          if (idx === 0 && (hour === 1 || hour === 2)) {
                            bg = 'bg-red-400'; // Peak anomaly in screenshot
                          } else if (hour >= 8 && hour <= 16) {
                            bg = hour >= 9 && hour <= 11 ? 'bg-amber-400' : 'bg-sky-400';
                          } else if (hour >= 4 && hour <= 6) {
                            bg = 'bg-sky-300';
                          } else if (hour >= 18 && hour <= 21) {
                            bg = 'bg-sky-200';
                          }
                          return (
                            <div
                              key={hour}
                              className={`h-3 mx-0.5 rounded-2xs ${bg} transition-transform hover:scale-125 cursor-pointer`}
                              title={`${date} ${hour}:00 - Hoạt động: ${bg.includes('red') ? 'Cao điểm' : bg.includes('amber') ? 'Trung bình' : 'Bình thường'}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Process Health & Failure Rates Tab with Recharts Trend Graphs */}
        {activeTab === 'health' && (
          <ProcessHealthReport currentProcessKey={selectedProcessKey} />
        )}

        {/* User Task Analysis (Heatmap on BPMN Diagram matching image_12d8ec25.png) */}
        {activeTab === 'heatmap' && (
          <div className="flex h-[720px] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm relative">
            {/* Diagram Viewport */}
            <div className="flex-1 flex flex-col overflow-auto p-4 relative">
              {/* Process metadata bar */}
              <div className="flex items-center gap-6 pb-3 mb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Process</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{nclosProcess.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Started Date</span>
                  <span className="font-mono">{nclosProcess.createdAt}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Version</span>
                  <span className="font-bold font-mono">{nclosProcess.version}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Description</span>
                  <span className="text-slate-600 dark:text-slate-400">{nclosProcess.description}</span>
                </div>
              </div>

              {/* SVG BPMN Canvas with glowing Heatmap overlays */}
              <div className="flex-1 relative overflow-auto min-h-[500px]">
                <svg className="w-[1000px] h-[700px] bg-white dark:bg-slate-950">
                  {/* Grid lines */}
                  <line x1="50" y1="300" x2="950" y2="300" stroke="#cbd5e1" strokeDasharray="4 4" />
                  <line x1="50" y1="480" x2="950" y2="480" stroke="#cbd5e1" strokeDasharray="4 4" />

                  {/* Edges */}
                  {nclosProcess.edges.map(e => {
                    const src = nclosProcess.nodes.find(n => n.id === e.source);
                    const tgt = nclosProcess.nodes.find(n => n.id === e.target);
                    if (!src || !tgt) return null;
                    return (
                      <line
                        key={e.id}
                        x1={src.x + src.width / 2}
                        y1={src.y + src.height / 2}
                        x2={tgt.x + tgt.width / 2}
                        y2={tgt.y + tgt.height / 2}
                        stroke="#475569"
                        strokeWidth="1.5"
                      />
                    );
                  })}

                  {/* Nodes with Heatmap overlays */}
                  {nclosProcess.nodes.map(node => {
                    const heatmap = NCLOS_HEATMAP_DATA[node.id];
                    let glowColor = 'rgba(59, 130, 246, 0.4)'; // blue/green
                    if (heatmap) {
                      if (heatmap.colorGrade === 'purple') glowColor = 'rgba(168, 85, 247, 0.55)';
                      else if (heatmap.colorGrade === 'orange') glowColor = 'rgba(249, 115, 22, 0.55)';
                      else if (heatmap.colorGrade === 'yellow') glowColor = 'rgba(234, 179, 8, 0.55)';
                      else glowColor = 'rgba(34, 197, 94, 0.55)';
                    }

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onMouseEnter={(e) => {
                          if (heatmap) {
                            setHoveredTaskHeatmap({
                              task: heatmap,
                              x: node.x + node.width / 2,
                              y: node.y + node.height,
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredTaskHeatmap(null)}
                        className="cursor-pointer"
                      >
                        {/* Glowing heatmap backdrop matching image_12d8ec25.png */}
                        {heatmap && (
                          <rect
                            x="-10"
                            y="-10"
                            width={node.width + 20}
                            height={node.height + 20}
                            rx="12"
                            fill={glowColor}
                            filter="blur(8px)"
                            className="pointer-events-none"
                          />
                        )}

                        {node.type.includes('Task') ? (
                          <g>
                            <rect
                              width={node.width}
                              height={node.height}
                              rx="6"
                              fill="#ffffff"
                              stroke="#334155"
                              strokeWidth="1.5"
                            />
                            <text
                              x={node.width / 2}
                              y={node.height / 2 + 3}
                              fontSize="9.5"
                              textAnchor="middle"
                              fontWeight="600"
                              fill="#0f172a"
                            >
                              {node.name}
                            </text>
                          </g>
                        ) : node.type === 'exclusiveGateway' ? (
                          <g>
                            <polygon
                              points={`${node.width/2},0 ${node.width},${node.height/2} ${node.width/2},${node.height} 0,${node.height/2}`}
                              fill="#ffffff"
                              stroke="#334155"
                              strokeWidth="1.5"
                            />
                            <text x={node.width/2} y={node.height/2 + 4} fontSize="12" textAnchor="middle" fontWeight="bold">X</text>
                          </g>
                        ) : (
                          <circle cx={node.width/2} cy={node.height/2} r={node.width/2} fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Rich Hover Popover matching image_12d8ec25.png */}
                {hoveredTaskHeatmap && (
                  <div
                    style={{
                      left: Math.min(650, hoveredTaskHeatmap.x),
                      top: hoveredTaskHeatmap.y + 10,
                    }}
                    className="absolute z-30 w-72 bg-slate-900/95 text-white p-3 rounded-lg shadow-2xl border border-slate-700 pointer-events-none text-xs space-y-1.5 backdrop-blur-xs font-sans"
                  >
                    <div className="font-bold text-emerald-400 pb-1 border-b border-slate-700">
                      {hoveredTaskHeatmap.task.elementName}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tổng số hồ sơ:</span>
                      <span className="font-mono font-bold">{hoveredTaskHeatmap.task.totalInstances}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Thời gian xử lý trung bình:</span>
                      <span className="font-mono font-bold">{hoveredTaskHeatmap.task.avgProcTimeHours} giờ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Số hồ sơ vượt ngưỡng:</span>
                      <span className="font-mono text-red-400 font-bold">{hoveredTaskHeatmap.task.overThresholdCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Số hồ sơ dưới ngưỡng:</span>
                      <span className="font-mono text-green-400 font-bold">{hoveredTaskHeatmap.task.underThresholdCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tổng thời gian xử lý:</span>
                      <span className="font-mono">{hoveredTaskHeatmap.task.totalProcHours} giờ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tổng thời gian chờ:</span>
                      <span className="font-mono">{hoveredTaskHeatmap.task.totalWaitHours} giờ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Thời gian chờ trung bình:</span>
                      <span className="font-mono">{hoveredTaskHeatmap.task.avgWaitHours} giờ</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Configuration Panel matching image_12d8ec25.png */}
            <div className="w-72 border-l border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900 flex flex-col text-xs space-y-4 shrink-0">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Cấu hình HeatMap
              </h3>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Chọn quy trình</label>
                <select
                  value={selectedProcessKey}
                  onChange={(e) => setSelectedProcessKey(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-semibold"
                >
                  <option value="NCLOS">NCLOS - v3</option>
                  <option value="SDD">SDD - v2</option>
                  <option value="PSCF">PSCF - v1</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Đơn vị đo lường</label>
                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs"
                >
                  <option value="Giờ">Giờ</option>
                  <option value="Phút">Phút</option>
                  <option value="Ngày">Ngày</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Ngưỡng (Threshold SLA)</label>
                <input
                  type="number"
                  value={thresholdHours}
                  onChange={(e) => setThresholdHours(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Khoảng thời gian</label>
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono"
                />
              </div>

              <button
                onClick={() => {
                  // Reload Heatmap
                }}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded text-xs shadow-sm transition-colors cursor-pointer mt-2"
              >
                Tải Heatmap
              </button>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-100 dark:border-emerald-800/40 text-[11px] text-emerald-900 dark:text-emerald-300 space-y-1">
                <p className="font-semibold">Phân tích điểm nghẽn (Bottlenecks):</p>
                <p>Task <strong>THUC DIA</strong> và <strong>THAM DINH 2</strong> có tỷ lệ vượt ngưỡng cao nhất ({'>'} 40%). Cần bổ sung nhân sự thẩm định.</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Process Optimization Matrix Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    Bảng Phân Tích Hiệu Suất Theo Quy Trình (Process Performance Breakdown)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Thống kê chi tiết khối lượng thực thi, Cycle Time trung bình và điểm cảnh báo trễ hạn
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                  Tổng 12 Quy trình hoạt động
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Tên Quy Trình</th>
                      <th className="px-3 py-3">Mã Key</th>
                      <th className="px-3 py-3 text-right">Active Instances</th>
                      <th className="px-3 py-3 text-right">Cycle Time TB</th>
                      <th className="px-3 py-3 text-right">Tuân Thủ SLA</th>
                      <th className="px-3 py-3 text-center">Điểm Nghẽn</th>
                      <th className="px-3 py-3 text-center">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {processNames.slice(0, 6).map((name, idx) => {
                      const vol = processVolumes[idx];
                      const isHighVolume = vol > 1000;
                      const procSla = idx === 1 ? '89.4%' : idx === 2 ? '96.2%' : '95.1%';
                      const cycle = idx === 1 ? '16.8h' : idx === 2 ? '11.4h' : '13.2h';
                      const hasBottleneck = idx === 1 || idx === 0;

                      return (
                        <tr key={name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                            {name}
                          </td>
                          <td className="px-3 py-3 font-mono text-slate-500">
                            {name.split(' ')[0]}
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                            {vol.toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-right font-mono text-slate-600 dark:text-slate-300">
                            {cycle}
                          </td>
                          <td className="px-3 py-3 text-right font-mono font-semibold text-emerald-600">
                            {procSla}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {hasBottleneck ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                <Flame className="w-3 h-3 text-rose-600" />
                                {idx === 1 ? '3 điểm nghẽn' : '1 điểm nghẽn'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Ổn định
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Đang vận hành" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase">
                    Tối Ưu Phân Bổ Nhân Lực
                  </h5>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed">
                  Bổ sung 2 chuyên viên thẩm định cho khâu <strong>THAM DINH 2</strong> và <strong>THUC DIA</strong> trong khung giờ 14:00 - 17:00 để hạ Cycle Time về dưới 12h.
                </p>
              </div>

              <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <h5 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase">
                    Quy Trình Tự Động Hóa (STP)
                  </h5>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-400 leading-relaxed">
                  Áp dụng Straight-Through Processing cho các khoản vay tiêu dùng dưới 100M VND trên quy trình <strong>ELOS</strong> để giảm 45% thời gian xử lý thủ công.
                </p>
              </div>

              <div className="p-4 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <h5 className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase">
                    Cảnh Báo Sớm SLA Tự Động
                  </h5>
                </div>
                <p className="text-xs text-purple-800 dark:text-purple-400 leading-relaxed">
                  Thiết lập trigger thông báo qua email/webhook khi thời gian chờ ở trạng thái <strong>CHO XU LY</strong> vượt quá 75% ngưỡng hạn mức cho phép.
                </p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
