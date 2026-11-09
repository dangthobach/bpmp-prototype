import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  Zap, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Filter, 
  RotateCcw, 
  Download, 
  ArrowUpRight, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Search,
  ChevronDown,
  Info,
  Check,
  Percent
} from 'lucide-react';
import { ProcessDefinition } from '../../types/bpm';

interface ProcessThroughputDashboardProps {
  processes?: ProcessDefinition[];
  currentProcessKey?: string;
  onNotify?: (msg: string) => void;
  onOpenHeatmap?: (processKey: string) => void;
}

export const ProcessThroughputDashboard: React.FC<ProcessThroughputDashboardProps> = ({
  processes = [],
  currentProcessKey = 'ALL',
  onNotify,
  onOpenHeatmap,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'hourly'>('daily');
  const [selectedProcess, setSelectedProcess] = useState<string>(currentProcessKey === 'NCLOS' ? 'NCLOS' : 'ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeMetricTab, setActiveMetricTab] = useState<'cycle-time' | 'comparison' | 'stages' | 'percentiles'>('cycle-time');
  const [visibleProcesses, setVisibleProcesses] = useState<Record<string, boolean>>({
    SDD: true,
    NCLOS: true,
    ELOS: true,
    PSCF: true,
    RetailBio: false
  });
  const [tableSearch, setTableSearch] = useState<string>('');

  const showToast = (msg: string) => {
    if (onNotify) onNotify(msg);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Đã đồng bộ dữ liệu Throughput & Cycle Time mới nhất từ BPM Engine!');
    }, 600);
  };

  const handleExport = () => {
    showToast('Đang xuất báo cáo Throughput & Cycle Time (.CSV & Analytics PDF)...');
  };

  // Primary dataset: Average Completion Time (hours) and Throughput Volume over time
  const throughputTimeSeriesData = useMemo(() => {
    if (timeRange === '7d') {
      return [
        { date: '14/05', avgHours: 15.6, volume: 1350, slaTarget: 24, queueHours: 3.8, execHours: 11.8, p50: 13.2, p90: 20.1, p99: 23.5 },
        { date: '15/05', avgHours: 14.8, volume: 1420, slaTarget: 24, queueHours: 3.4, execHours: 11.4, p50: 12.8, p90: 19.5, p99: 22.8 },
        { date: '16/05', avgHours: 14.2, volume: 1580, slaTarget: 24, queueHours: 3.1, execHours: 11.1, p50: 12.1, p90: 18.9, p99: 22.1 },
        { date: '17/05', avgHours: 13.9, volume: 1820, slaTarget: 24, queueHours: 2.9, execHours: 11.0, p50: 11.8, p90: 18.4, p99: 21.6 },
        { date: '18/05', avgHours: 12.4, volume: 3215, slaTarget: 24, queueHours: 2.2, execHours: 10.2, p50: 10.5, p90: 16.8, p99: 20.2 }, // Peak volume
        { date: '19/05', avgHours: 12.8, volume: 2450, slaTarget: 24, queueHours: 2.4, execHours: 10.4, p50: 10.9, p90: 17.2, p99: 20.8 },
        { date: '20/05 (Hôm nay)', avgHours: 12.1, volume: 1980, slaTarget: 24, queueHours: 2.1, execHours: 10.0, p50: 10.2, p90: 16.4, p99: 19.8 },
      ];
    }

    if (timeRange === '90d') {
      return [
        { date: 'T3 - Tuần 1', avgHours: 21.4, volume: 4800, slaTarget: 24, queueHours: 6.8, execHours: 14.6, p50: 18.5, p90: 26.2, p99: 31.0 },
        { date: 'T3 - Tuần 2', avgHours: 19.8, volume: 5200, slaTarget: 24, queueHours: 5.9, execHours: 13.9, p50: 17.2, p90: 24.8, p99: 29.5 },
        { date: 'T3 - Tuần 3', avgHours: 18.5, volume: 5600, slaTarget: 24, queueHours: 5.1, execHours: 13.4, p50: 16.0, p90: 23.5, p99: 28.0 },
        { date: 'T3 - Tuần 4', avgHours: 17.2, volume: 6100, slaTarget: 24, queueHours: 4.6, execHours: 12.6, p50: 14.8, p90: 22.1, p99: 26.4 },
        { date: 'T4 - Tuần 1', avgHours: 16.5, volume: 6400, slaTarget: 24, queueHours: 4.2, execHours: 12.3, p50: 14.1, p90: 21.2, p99: 25.2 },
        { date: 'T4 - Tuần 2', avgHours: 15.8, volume: 6900, slaTarget: 24, queueHours: 3.9, execHours: 11.9, p50: 13.5, p90: 20.4, p99: 24.1 },
        { date: 'T4 - Tuần 3', avgHours: 15.1, volume: 7300, slaTarget: 24, queueHours: 3.5, execHours: 11.6, p50: 12.9, p90: 19.6, p99: 23.0 },
        { date: 'T4 - Tuần 4', avgHours: 14.4, volume: 7800, slaTarget: 24, queueHours: 3.2, execHours: 11.2, p50: 12.2, p90: 18.8, p99: 22.1 },
        { date: 'T5 - Tuần 1', avgHours: 13.8, volume: 8400, slaTarget: 24, queueHours: 2.8, execHours: 11.0, p50: 11.6, p90: 18.0, p99: 21.2 },
        { date: 'T5 - Tuần 2', avgHours: 13.2, volume: 9200, slaTarget: 24, queueHours: 2.5, execHours: 10.7, p50: 11.0, p90: 17.4, p99: 20.5 },
        { date: 'T5 - Tuần 3', avgHours: 12.4, volume: 11500, slaTarget: 24, queueHours: 2.2, execHours: 10.2, p50: 10.4, p90: 16.5, p99: 19.6 },
      ];
    }

    // Default: 30 days
    return [
      { date: '21/04', avgHours: 18.2, volume: 1150, slaTarget: 24, queueHours: 5.2, execHours: 13.0, p50: 15.8, p90: 23.4, p99: 27.8 },
      { date: '24/04', avgHours: 17.6, volume: 1280, slaTarget: 24, queueHours: 4.9, execHours: 12.7, p50: 15.2, p90: 22.8, p99: 26.9 },
      { date: '27/04', avgHours: 16.9, volume: 1340, slaTarget: 24, queueHours: 4.5, execHours: 12.4, p50: 14.6, p90: 21.9, p99: 25.8 },
      { date: '30/04', avgHours: 16.2, volume: 1120, slaTarget: 24, queueHours: 4.1, execHours: 12.1, p50: 14.0, p90: 21.1, p99: 24.9 },
      { date: '03/05', avgHours: 15.7, volume: 1450, slaTarget: 24, queueHours: 3.9, execHours: 11.8, p50: 13.5, p90: 20.4, p99: 24.1 },
      { date: '06/05', avgHours: 15.1, volume: 1620, slaTarget: 24, queueHours: 3.6, execHours: 11.5, p50: 13.0, p90: 19.8, p99: 23.4 },
      { date: '09/05', avgHours: 14.6, volume: 1780, slaTarget: 24, queueHours: 3.3, execHours: 11.3, p50: 12.5, p90: 19.1, p99: 22.6 },
      { date: '12/05', avgHours: 14.0, volume: 1890, slaTarget: 24, queueHours: 3.0, execHours: 11.0, p50: 12.0, p90: 18.5, p99: 21.9 },
      { date: '15/05', avgHours: 13.5, volume: 2100, slaTarget: 24, queueHours: 2.7, execHours: 10.8, p50: 11.5, p90: 17.9, p99: 21.1 },
      { date: '18/05', avgHours: 12.4, volume: 3215, slaTarget: 24, queueHours: 2.2, execHours: 10.2, p50: 10.5, p90: 16.8, p99: 20.2 },
      { date: '20/05', avgHours: 12.1, volume: 2280, slaTarget: 24, queueHours: 2.1, execHours: 10.0, p50: 10.2, p90: 16.4, p99: 19.8 },
    ];
  }, [timeRange]);

  // Comparison dataset: Completion Time trend by Process Definition over time
  const processComparisonData = useMemo(() => {
    return [
      { date: '21/04', SDD: 20.5, NCLOS: 41.2, ELOS: 4.8, PSCF: 31.5, RetailBio: 0.6 },
      { date: '26/04', SDD: 19.1, NCLOS: 39.8, ELOS: 4.2, PSCF: 29.8, RetailBio: 0.5 },
      { date: '01/05', SDD: 17.8, NCLOS: 38.0, ELOS: 3.6, PSCF: 28.2, RetailBio: 0.5 },
      { date: '06/05', SDD: 16.5, NCLOS: 36.4, ELOS: 2.9, PSCF: 26.5, RetailBio: 0.4 },
      { date: '11/05', SDD: 15.2, NCLOS: 34.8, ELOS: 2.3, PSCF: 24.8, RetailBio: 0.4 },
      { date: '16/05', SDD: 14.6, NCLOS: 33.2, ELOS: 1.9, PSCF: 23.2, RetailBio: 0.4 },
      { date: '20/05', SDD: 13.8, NCLOS: 31.9, ELOS: 1.6, PSCF: 21.8, RetailBio: 0.3 },
    ];
  }, []);

  // Stage breakdown dataset over time (Milestone stages in hours)
  const stageBreakdownData = useMemo(() => {
    return [
      { date: '21/04', intake: 2.8, creditRisk: 7.6, approval: 4.9, coreIntegration: 2.9 },
      { date: '27/04', intake: 2.5, creditRisk: 7.1, approval: 4.5, coreIntegration: 2.8 },
      { date: '03/05', intake: 2.2, creditRisk: 6.6, approval: 4.2, coreIntegration: 2.7 },
      { date: '09/05', intake: 1.9, creditRisk: 6.1, approval: 3.9, coreIntegration: 2.7 },
      { date: '15/05', intake: 1.7, creditRisk: 5.5, approval: 3.6, coreIntegration: 2.7 },
      { date: '20/05', intake: 1.4, creditRisk: 4.8, approval: 3.3, coreIntegration: 2.6 },
    ];
  }, []);

  // Summary Metrics Table Data across all processes
  const processSummaryTable = useMemo(() => {
    return [
      {
        key: 'SDD',
        name: 'GIẢI NGÂN DOANH NGHIỆP (SDD)',
        completedCount: 5240,
        activeCount: 120,
        currentAvgHours: 13.8,
        previousAvgHours: 20.5,
        deltaPercent: -32.7,
        p50Hours: 11.5,
        p90Hours: 18.2,
        slaTarget: 24,
        slaCompliance: 96.8,
        status: 'FAST',
        engine: 'Camunda 8'
      },
      {
        key: 'NCLOS',
        name: 'THẨM ĐỊNH & PHÊ DUYỆT TÍN DỤNG (NCLOS)',
        completedCount: 3890,
        activeCount: 80,
        currentAvgHours: 31.9,
        previousAvgHours: 41.2,
        deltaPercent: -22.6,
        p50Hours: 27.4,
        p90Hours: 43.1,
        slaTarget: 48,
        slaCompliance: 91.2,
        status: 'ATTENTION',
        engine: 'Camunda 8'
      },
      {
        key: 'ELOS',
        name: 'VAY TIÊU DÙNG TỰ ĐỘNG (ELOS - STP)',
        completedCount: 24500,
        activeCount: 340,
        currentAvgHours: 1.6,
        previousAvgHours: 4.8,
        deltaPercent: -66.7,
        p50Hours: 1.1,
        p90Hours: 2.8,
        slaTarget: 6,
        slaCompliance: 99.4,
        status: 'EXCELLENT',
        engine: 'Camunda 8'
      },
      {
        key: 'PSCF',
        name: 'TÀI TRỢ CHUỖI CUNG ỨNG Ô TÔ (PSCF)',
        completedCount: 1820,
        activeCount: 60,
        currentAvgHours: 21.8,
        previousAvgHours: 31.5,
        deltaPercent: -30.8,
        p50Hours: 18.6,
        p90Hours: 29.4,
        slaTarget: 36,
        slaCompliance: 95.3,
        status: 'FAST',
        engine: 'Flowable'
      },
      {
        key: 'RetailBio',
        name: 'ĐỊNH DANH SINH TRẮC HỌC (RetailBio)',
        completedCount: 21800,
        activeCount: 210,
        currentAvgHours: 0.3,
        previousAvgHours: 0.6,
        deltaPercent: -50.0,
        p50Hours: 0.2,
        p90Hours: 0.5,
        slaTarget: 2,
        slaCompliance: 99.9,
        status: 'EXCELLENT',
        engine: 'Camunda 8'
      },
      {
        key: 'LC',
        name: 'PHÁT HÀNH THƯ TÍN DỤNG (L/C & GUARANTEE)',
        completedCount: 940,
        activeCount: 25,
        currentAvgHours: 44.5,
        previousAvgHours: 58.2,
        deltaPercent: -23.5,
        p50Hours: 38.0,
        p90Hours: 64.2,
        slaTarget: 72,
        slaCompliance: 93.6,
        status: 'GOOD',
        engine: 'Camunda 8'
      }
    ].filter(p => {
      if (!tableSearch.trim()) return true;
      const q = tableSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q);
    });
  }, [tableSearch]);

  // Overall aggregate KPIs
  const currentAvgOverall = 12.1;
  const previousAvgOverall = 18.2;
  const improvementRatio = (((previousAvgOverall - currentAvgOverall) / previousAvgOverall) * 100).toFixed(1);
  const totalCompletedInstances = 58890;
  const avgThroughputPerDay = 1845;
  const fastTrackRatio = 68.5;

  return (
    <div className="space-y-5 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* ==================================================== */}
      {/* 1. TOP HEADER & INTERACTIVE FILTER TOOLBAR           */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                  Bảng Theo Dõi Thông Lượng Quy Trình (Process Throughput &amp; Cycle Time)
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Real-time Recharts
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Trực quan hóa thời gian hoàn tất trung bình (Average Completion Time) của các phiên thực thi qua thời gian.
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Process Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-400 pl-1.5 font-medium">Quy trình:</span>
            <select
              value={selectedProcess}
              onChange={(e) => setSelectedProcess(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Toàn Bộ Quy Trình</option>
              <option value="SDD">Giải Ngân (SDD)</option>
              <option value="NCLOS">Thẩm Định (NCLOS)</option>
              <option value="ELOS">Vay Tiêu Dùng (ELOS)</option>
              <option value="PSCF">Tài Trợ Ô Tô (PSCF)</option>
              <option value="RetailBio">Sinh Trắc Học (RetailBio)</option>
            </select>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {(['7d', '30d', '90d'] as const).map(tr => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === tr
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tr === '7d' ? '7 Ngày' : tr === '30d' ? '30 Ngày' : '90 Ngày'}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
            title="Tải xuống báo cáo thông lượng"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Làm mới thông số thông lượng"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. REAL-TIME THROUGHPUT KPI SUMMARY STRIP            */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Average Completion Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
              Avg Completion Time
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100 tracking-tight">
              {currentAvgOverall}h
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-{improvementRatio}%</span>
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>SLA Target: <strong>24.0 giờ</strong></span>
            <span className="text-emerald-600 font-semibold">Nhanh hơn 11.9h</span>
          </div>
        </div>

        {/* KPI 2: Daily Throughput Volume */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
              Daily Throughput Volume
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400 tracking-tight">
              {avgThroughputPerDay.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400">instances / ngày</span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Đỉnh tải 18/05: <strong className="font-mono text-blue-600">3,215 inst</strong></span>
            <span className="text-slate-400">Tải ổn định</span>
          </div>
        </div>

        {/* KPI 3: Queue Wait Time vs Execution Ratio */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
              Queue Wait vs Execution
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tracking-tight">
              2.1h
            </span>
            <span className="text-xs font-semibold text-slate-400">chờ / 10.0h xử lý</span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Thời gian chờ: <strong>17.4%</strong></span>
            <span className="text-emerald-600 font-semibold">Giảm 58% độ trễ</span>
          </div>
        </div>

        {/* KPI 4: Fast-Track Throughput (STP Rate) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
              Fast-Track STP Throughput
            </span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              {fastTrackRatio}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+6.2%</span>
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Hoàn thành &lt; 8h: <strong>40,340 inst</strong></span>
            <span className="text-slate-400 font-mono">DMN Auto</span>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. MULTI-TAB CHART NAVIGATION BAR                    */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-2 shadow-2xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveMetricTab('cycle-time')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeMetricTab === 'cycle-time'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Xu Hướng Completion Time vs Volume (Over Time)</span>
          </button>

          <button
            onClick={() => setActiveMetricTab('comparison')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeMetricTab === 'comparison'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>So Sánh Tốc Độ Từng Quy Trình (Multi-Process)</span>
          </button>

          <button
            onClick={() => setActiveMetricTab('stages')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeMetricTab === 'stages'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Phân Bổ Thời Gian Từng Giai Đoạn (Stages)</span>
          </button>

          <button
            onClick={() => setActiveMetricTab('percentiles')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeMetricTab === 'percentiles'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Độ Phân Tán P50 / P90 / P99 (Tail Latency)</span>
          </button>
        </div>

        <div className="flex items-center gap-3 pr-2 text-xs">
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            Dữ liệu Camunda History &amp; Optimize API
          </span>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 4. MAIN VISUALIZATION CHARTS (RECHARTS)              */}
      {/* ==================================================== */}
      
      {/* TAB 1: Dual-Axis Throughput & Completion Time Trend */}
      {activeMetricTab === 'cycle-time' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Thời Gian Hoàn Tất Trung Bình (Hours) &amp; Khối Lượng Thông Lượng (Instances) Qua Thời Gian</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Đường xanh lá thể hiện thời gian hoàn tất trung bình (trục trái, giờ), cột màu xanh dương thể hiện số lượng instance hoàn thành (trục phải).
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-3 h-0.5 bg-emerald-500 rounded" />
                <span>Cycle Time TB (h)</span>
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/80" />
                <span>Số Instance (Throughput)</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-rose-500">
                <span className="w-3 h-0.5 border-b border-dashed border-rose-500" />
                <span>SLA Max (24h)</span>
              </span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={throughputTimeSeriesData}
                margin={{ top: 15, right: 20, left: -5, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAvgHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                {/* Left Y-Axis for Hours */}
                <YAxis 
                  yAxisId="left"
                  unit="h"
                  domain={[0, 30]}
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                {/* Right Y-Axis for Throughput Volume */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 'auto']}
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl text-xs space-y-2 border border-slate-700 min-w-[220px]">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="font-bold text-emerald-400">{label}</span>
                            <span className="text-[10px] text-slate-400 font-mono">BPM Engine</span>
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Thời gian hoàn tất TB:</span>
                              <strong className="font-mono text-emerald-300">{data.avgHours} giờ</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Số instance hoàn tất:</span>
                              <strong className="font-mono text-blue-300">{data.volume.toLocaleString()} inst</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Hạn mức SLA cam kết:</span>
                              <strong className="font-mono text-rose-300">{data.slaTarget} giờ</strong>
                            </div>
                            <div className="pt-1.5 border-t border-slate-800 flex justify-between text-[10.5px]">
                              <span className="text-slate-400">Chờ: {data.queueHours}h &bull; Xử lý: {data.execHours}h</span>
                              <span className="text-emerald-400 font-semibold">
                                {data.avgHours < data.slaTarget ? `Nhanh hơn ${(data.slaTarget - data.avgHours).toFixed(1)}h` : 'Trễ hạn'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Reference line for SLA target */}
                <ReferenceLine yAxisId="left" y={24} stroke="#f43f5e" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'SLA Max (24h)', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
                <ReferenceLine yAxisId="left" y={12} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Fast Benchmark (12h)', fill: '#f59e0b', fontSize: 10, position: 'insideBottomRight' }} />

                {/* Right Bars for Volume */}
                <Bar yAxisId="right" dataKey="volume" name="Thông Lượng (Instances)" fill="#3b82f6" fillOpacity={0.35} barSize={20} radius={[4, 4, 0, 0]} />

                {/* Left Area & Line for Cycle Time */}
                <Area yAxisId="left" type="monotone" dataKey="avgHours" fill="url(#colorAvgHours)" stroke="none" />
                <Line yAxisId="left" type="monotone" dataKey="avgHours" name="Thời Gian Hoàn Tất TB (Giờ)" stroke="#10b981" strokeWidth={2.8} dot={{ r: 4, fill: '#10b981', strokeWidth: 1.5, stroke: '#ffffff' }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
            <span className="text-slate-600 dark:text-slate-300">
              💡 <strong>Nhận định phân tích thông lượng:</strong> Trong giai đoạn cao điểm ngày <strong>18/05</strong>, thông lượng tăng vọt lên <strong>3,215 instances/ngày</strong> nhưng thời gian hoàn tất trung bình vẫn giảm xuống mức tối ưu <strong>12.4 giờ</strong> nhờ cơ chế phân luồng tự động Camunda DMN.
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: Multi-Process Speed Comparison Over Time */}
      {activeMetricTab === 'comparison' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-blue-600" />
                <span>So Sánh Tốc Độ Hoàn Tất Từng Mô Hình Quy Trình Qua Thời Gian (Multi-Process Comparison)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Quan sát sự thay đổi thời gian xử lý của các quy trình nghiệp vụ trọng điểm để xác định quy trình cải thiện nhanh nhất.
              </p>
            </div>

            {/* Toggle Process Lines */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              {[
                { key: 'SDD', label: 'SDD (Giải ngân)', color: '#10b981' },
                { key: 'NCLOS', label: 'NCLOS (Thẩm định)', color: '#3b82f6' },
                { key: 'ELOS', label: 'ELOS (Vay tiêu dùng)', color: '#8b5cf6' },
                { key: 'PSCF', label: 'PSCF (Chuỗi ô tô)', color: '#f59e0b' },
                { key: 'RetailBio', label: 'RetailBio (Sinh trắc)', color: '#ec4899' },
              ].map(proc => {
                const isVis = visibleProcesses[proc.key];
                return (
                  <button
                    key={proc.key}
                    onClick={() => setVisibleProcesses(prev => ({ ...prev, [proc.key]: !isVis }))}
                    className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isVis 
                        ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100'
                        : 'opacity-40 border-transparent text-slate-400'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: proc.color }} />
                    <span>{proc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={processComparisonData}
                margin={{ top: 15, right: 20, left: -5, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  unit="h"
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 min-w-[200px]">
                          <p className="font-bold text-blue-400 border-b border-slate-800 pb-1">{label}</p>
                          <div className="space-y-1 text-[11px]">
                            {payload.map((p, idx) => (
                              <div key={idx} className="flex justify-between items-center">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                  <span>{p.name}:</span>
                                </span>
                                <strong className="font-mono" style={{ color: p.color }}>{p.value} giờ</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />

                {visibleProcesses.SDD && <Line type="monotone" dataKey="SDD" name="SDD (Giải ngân)" stroke="#10b981" strokeWidth={2.4} dot={{ r: 4 }} />}
                {visibleProcesses.NCLOS && <Line type="monotone" dataKey="NCLOS" name="NCLOS (Thẩm định)" stroke="#3b82f6" strokeWidth={2.4} dot={{ r: 4 }} />}
                {visibleProcesses.ELOS && <Line type="monotone" dataKey="ELOS" name="ELOS (Vay tiêu dùng)" stroke="#8b5cf6" strokeWidth={2.4} dot={{ r: 4 }} />}
                {visibleProcesses.PSCF && <Line type="monotone" dataKey="PSCF" name="PSCF (Chuỗi ô tô)" stroke="#f59e0b" strokeWidth={2.4} dot={{ r: 4 }} />}
                {visibleProcesses.RetailBio && <Line type="monotone" dataKey="RetailBio" name="RetailBio (Sinh trắc)" stroke="#ec4899" strokeWidth={2.4} dot={{ r: 4 }} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 3: Stage Breakdown Over Time */}
      {activeMetricTab === 'stages' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Phân Rã Thời Gian Hoàn Tất Theo Từng Giai Đoạn Quy Trình (Milestone Stages)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem xét mức độ rút ngắn thời gian ở từng chặng: Tiếp nhận ban đầu, Thẩm định rủi ro, Phê duyệt lãnh đạo và Tích hợp hệ thống Core.
              </p>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stageBreakdownData}
                margin={{ top: 15, right: 20, left: -5, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  unit="h"
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const total = payload.reduce((acc, p) => acc + Number(p.value), 0).toFixed(1);
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 min-w-[210px]">
                          <div className="flex justify-between border-b border-slate-800 pb-1">
                            <span className="font-bold text-purple-400">{label}</span>
                            <span className="font-mono text-emerald-300 font-bold">Tổng: {total}h</span>
                          </div>
                          <div className="space-y-1 text-[11px]">
                            {payload.map((p, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="text-slate-300 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                  <span>{p.name}:</span>
                                </span>
                                <strong className="font-mono">{p.value} giờ</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                <Area type="monotone" dataKey="intake" stackId="1" name="Tiếp nhận & Rà soát" stroke="#10b981" fill="#10b981" fillOpacity={0.7} />
                <Area type="monotone" dataKey="creditRisk" stackId="1" name="Thẩm định rủi ro (Risk)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.7} />
                <Area type="monotone" dataKey="approval" stackId="1" name="Phê duyệt lãnh đạo (Approval)" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.7} />
                <Area type="monotone" dataKey="coreIntegration" stackId="1" name="Tích hợp CoreBanking" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.7} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 4: Percentile Latency & Completion Time Dispersion (P50, P90, P99) */}
      {activeMetricTab === 'percentiles' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>Độ Phân Tán Thời Gian Hoàn Tất: Trung Vị (P50) vs Điểm Đuôi (P90, P99 Tail Latency)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Kiểm tra 1% hồ sơ chậm nhất (P99) và 10% hồ sơ trễ nhất (P90) để đảm bảo không có hồ sơ bị nghẽn vượt hạn mức SLA 24h.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                P99 Hiện Tại: 19.8h &lt; SLA 24h
              </span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={throughputTimeSeriesData}
                margin={{ top: 15, right: 20, left: -5, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  unit="h"
                  domain={[0, 32]}
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 min-w-[210px]">
                          <p className="font-bold text-amber-400 border-b border-slate-800 pb-1">{label}</p>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-emerald-300">P50 (Trung vị - 50% hồ sơ):</span>
                              <strong className="font-mono">{data.p50}h</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-300">P90 (90% hồ sơ hoàn thành):</span>
                              <strong className="font-mono">{data.p90}h</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-rose-300">P99 (1% hồ sơ chậm nhất):</span>
                              <strong className="font-mono">{data.p99}h</strong>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-800 text-[10.5px]">
                              <span className="text-slate-400">Ngưỡng cam kết SLA:</span>
                              <strong className="font-mono text-rose-400">24.0h</strong>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={24} stroke="#f43f5e" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'SLA Limit (24h)', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                <Line type="monotone" dataKey="p50" name="P50 (Trung vị)" stroke="#10b981" strokeWidth={2.4} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="p90" name="P90 (Đa số hồ sơ)" stroke="#3b82f6" strokeWidth={2.4} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="p99" name="P99 (1% chậm nhất)" stroke="#f43f5e" strokeWidth={2.4} strokeDasharray="3 3" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. PROCESS THROUGHPUT & CYCLE TIME MATRIX TABLE      */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Bảng Tổng Hợp Thông Lượng &amp; Thời Gian Hoàn Tất Từng Quy Trình (Process Matrix)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Chi tiết số lượng hoàn thành, Completion Time hiện tại so với kỳ trước và tỷ lệ tuân thủ cam kết SLA.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm tên hoặc mã quy trình..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Quy Trình Nghiệp Vụ</th>
                <th className="px-3 py-3">Key &amp; Engine</th>
                <th className="px-3 py-3 text-right">Đã Hoàn Thành</th>
                <th className="px-3 py-3 text-right">Cycle Time Hiện Tại</th>
                <th className="px-3 py-3 text-right">Kỳ Trước</th>
                <th className="px-3 py-3 text-right">Tốc Độ Cải Thiện</th>
                <th className="px-3 py-3 text-right">SLA Max</th>
                <th className="px-3 py-3 text-right">Tuân Thủ SLA</th>
                <th className="px-3 py-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {processSummaryTable.map((item) => (
                <tr key={item.key} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {item.name}
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 block">
                      {item.key}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.engine}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    {item.completedCount.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {item.currentAvgHours}h
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-slate-400">
                    {item.previousAvgHours}h
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10.5px] font-bold font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                      <TrendingDown className="w-3 h-3 text-emerald-600" />
                      {item.deltaPercent}%
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-slate-500">
                    {item.slaTarget}h
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-semibold text-emerald-600">
                    {item.slaCompliance}%
                  </td>
                  <td className="px-3 py-3 text-center">
                    {onOpenHeatmap ? (
                      <button
                        onClick={() => onOpenHeatmap(item.key)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px] font-semibold cursor-pointer transition-colors"
                        title="Xem bản đồ nhiệt Heatmap"
                      >
                        BPMN Heatmap &rarr;
                      </button>
                    ) : (
                      <span className="text-slate-400">&bull;&bull;&bull;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
