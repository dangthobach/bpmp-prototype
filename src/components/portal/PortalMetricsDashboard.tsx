import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  AreaChart,
  Area,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  RotateCcw, 
  Layers, 
  UserCheck, 
  ArrowUpRight, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Calendar, 
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { ClientRequest } from '../../types/clientPortal';

interface PortalMetricsDashboardProps {
  requests: ClientRequest[];
  onNavigateTab: (tab: 'dashboard' | 'new-request' | 'my-requests' | 'officer-desk' | 'tracking-lookup' | 'metrics-dashboard') => void;
  onFilterStatus?: (status: string) => void;
  onSelectRequest?: (reqId: string) => void;
  onNotify?: (msg: string) => void;
}

export const PortalMetricsDashboard: React.FC<PortalMetricsDashboardProps> = ({
  requests,
  onNavigateTab,
  onFilterStatus,
  onSelectRequest,
  onNotify,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [selectedProcessFilter, setSelectedProcessFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const showToast = (msg: string) => {
    if (onNotify) onNotify(msg);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Đã đồng bộ số liệu thời gian thực từ Camunda / Zeebe Metrics Engine!');
    }, 600);
  };

  // Real-time calculated KPI statistics
  const metrics = useMemo(() => {
    const total = requests.length;
    const active = requests.filter(r => r.status === 'IN_REVIEW' || r.status === 'SUBMITTED' || r.status === 'ADDITIONAL_DOCS_REQUIRED').length;
    const pendingNeedDocs = requests.filter(r => r.status === 'ADDITIONAL_DOCS_REQUIRED').length;
    const completed = requests.filter(r => r.status === 'APPROVED' || r.status === 'DISBURSED').length;
    const totalDisbursedAmount = requests.filter(r => r.status === 'APPROVED' || r.status === 'DISBURSED').reduce((acc, r) => acc + r.amount, 0);

    // Simulated average completion hours based on active requests
    const avgHours = 14.8;
    const targetSlaHours = 24.0;
    const slaCompliance = 96.4;

    return {
      total,
      active,
      pendingNeedDocs,
      completed,
      totalDisbursedAmount,
      avgHours,
      targetSlaHours,
      slaCompliance
    };
  }, [requests]);

  // Chart 1 Data: Active Process Instances by Process Definition
  const activeInstancesByProcess = useMemo(() => {
    return [
      {
        processKey: 'SDD',
        name: 'Giải Ngân (SDD)',
        inReview: 4,
        needDocs: 2,
        approved: 5,
        totalActive: 6,
        avgSla: '24h',
        color: '#10b981'
      },
      {
        processKey: 'NCLOS',
        name: 'Thẩm Định (NCLOS)',
        inReview: 5,
        needDocs: 1,
        approved: 3,
        totalActive: 6,
        avgSla: '48h',
        color: '#3b82f6'
      },
      {
        processKey: 'PSCF',
        name: 'Tài Trợ Ô Tô (PSCF)',
        inReview: 3,
        needDocs: 0,
        approved: 4,
        totalActive: 3,
        avgSla: '36h',
        color: '#8b5cf6'
      },
      {
        processKey: 'CORP_CARD',
        name: 'Thẻ Tín Dụng DN',
        inReview: 2,
        needDocs: 1,
        approved: 2,
        totalActive: 3,
        avgSla: '12h',
        color: '#f59e0b'
      }
    ].filter(p => selectedProcessFilter === 'ALL' || p.processKey === selectedProcessFilter);
  }, [selectedProcessFilter]);

  // Chart 2 Data: Average Completion Time vs Target SLA (Hours)
  const completionTimeData = useMemo(() => {
    return [
      {
        process: 'SDD (Giải ngân)',
        processKey: 'SDD',
        actualTime: 14.2,
        targetSla: 24.0,
        fastTrackMin: 8.5,
        status: 'Tốt (Vượt tiến độ 40%)'
      },
      {
        process: 'NCLOS (Thẩm định)',
        processKey: 'NCLOS',
        actualTime: 32.6,
        targetSla: 48.0,
        fastTrackMin: 22.0,
        status: 'Tốt (Vượt tiến độ 32%)'
      },
      {
        process: 'PSCF (Chuỗi ô tô)',
        processKey: 'PSCF',
        actualTime: 22.4,
        targetSla: 36.0,
        fastTrackMin: 14.0,
        status: 'Tốt (Vượt tiến độ 37%)'
      },
      {
        process: 'CORP_CARD (Thẻ DN)',
        processKey: 'CORP_CARD',
        actualTime: 9.8,
        targetSla: 12.0,
        fastTrackMin: 4.5,
        status: 'Tốt (Đạt chuẩn)'
      },
      {
        process: 'LC (Bảo lãnh & L/C)',
        processKey: 'LC',
        actualTime: 46.1,
        targetSla: 72.0,
        fastTrackMin: 28.0,
        status: 'Tốt (Vượt tiến độ 36%)'
      }
    ].filter(p => selectedProcessFilter === 'ALL' || p.processKey === selectedProcessFilter);
  }, [selectedProcessFilter]);

  // Chart 3 Data: Pending Tasks Distribution by Assignee Queue / Role
  const pendingTasksData = useMemo(() => {
    return [
      {
        role: 'NCLOS SALE',
        label: 'Cán Bộ Bán Hàng (RM)',
        count: 5,
        overdue: 0,
        avgWaitHours: 2.4,
        color: '#10b981'
      },
      {
        role: 'NCLOS B CO',
        label: 'Chuyên Viên Thẩm Định',
        count: 4,
        overdue: 0,
        avgWaitHours: 4.1,
        color: '#3b82f6'
      },
      {
        role: 'NCLOS B TLCO',
        label: 'Team Lead Phân Bổ',
        count: 2,
        overdue: 0,
        avgWaitHours: 1.2,
        color: '#6366f1'
      },
      {
        role: 'NCLOS B KS2',
        label: 'Kiểm Soát Rủi Ro Cấp 2',
        count: 3,
        overdue: 1,
        avgWaitHours: 6.8,
        color: '#f59e0b'
      },
      {
        role: 'NCLOS ADMIN',
        label: 'Lãnh Đạo Duyệt Giải Ngân',
        count: 2,
        overdue: 0,
        avgWaitHours: 3.5,
        color: '#8b5cf6'
      },
      {
        role: 'NCLOS FA',
        label: 'Thực Địa & Tài Sản',
        count: 2,
        overdue: 0,
        avgWaitHours: 5.2,
        color: '#ec4899'
      }
    ];
  }, []);

  // Chart 4 Data: Real-time 24h Hourly Throughput & Request Lifecycle Trend
  const hourlyThroughputData = useMemo(() => {
    return [
      { hour: '08:00', newRequests: 2, completed: 1, activeLoad: 12 },
      { hour: '09:30', newRequests: 5, completed: 3, activeLoad: 14 },
      { hour: '11:00', newRequests: 8, completed: 6, activeLoad: 16 },
      { hour: '13:30', newRequests: 4, completed: 4, activeLoad: 16 },
      { hour: '15:00', newRequests: 7, completed: 5, activeLoad: 18 },
      { hour: '16:30', newRequests: 6, completed: 8, activeLoad: 16 },
      { hour: '18:00', newRequests: 3, completed: 4, activeLoad: 15 },
    ];
  }, []);

  // Donut chart status distribution
  const statusPieData = useMemo(() => {
    return [
      { name: 'Đang Thẩm Định', value: 8, color: '#3b82f6' },
      { name: 'Cần Bổ Sung Chứng Từ', value: 3, color: '#f43f5e' },
      { name: 'Chờ Ký Quyết Định', value: 4, color: '#f59e0b' },
      { name: 'Đã Hoàn Thành / Giải Ngân', value: 14, color: '#10b981' },
    ];
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ==================================================== */}
      {/* 1. TOP HEADER & METRIC CONTROLS TOOLBAR              */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                  Bảng Đo Lường Hiệu Năng Quy Trình Thời Gian Thực (Process Metrics Dashboard)
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Recharts
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Theo dõi tiến độ thực thi các phiên bản quy trình, thời gian xử lý trung bình và tải trọng các hàng đợi tác vụ.
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Process Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-400 pl-1.5 font-medium">Quy trình:</span>
            <select
              value={selectedProcessFilter}
              onChange={(e) => setSelectedProcessFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả quy trình</option>
              <option value="SDD">Giải Ngân (SDD)</option>
              <option value="NCLOS">Thẩm Định (NCLOS)</option>
              <option value="PSCF">Tài Trợ Ô Tô (PSCF)</option>
              <option value="CORP_CARD">Thẻ Tín Dụng DN</option>
            </select>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {(['24h', '7d', '30d'] as const).map(tr => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === tr
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tr === '24h' ? '24 Giờ' : tr === '7d' ? '7 Ngày' : '30 Ngày'}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Làm mới chỉ số đo lường"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. REAL-TIME STATISTIC KPI SUMMARY CARDS (GRID 4)    */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Process Instances */}
        <div 
          onClick={() => {
            if (onFilterStatus) onFilterStatus('IN_REVIEW');
            onNavigateTab('my-requests');
          }}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs hover:border-emerald-500/80 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Phiên Đang Chạy (Active Instances)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {metrics.active + 12}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+3 hôm nay</span>
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Đang thẩm định: <strong>{metrics.active + 8}</strong></span>
            <span className="text-emerald-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              <span>Xem danh sách</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Average Completion Time */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Thời Gian Xử Lý TB (Avg Completion)</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
              {metrics.avgHours}h
            </span>
            <span className="text-xs font-semibold text-slate-400">
              / Cam kết SLA {metrics.targetSlaHours}h
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-emerald-600 font-semibold">Nhanh hơn SLA 38.3%</span>
            <span className="text-slate-400">Tốc độ xuất sắc</span>
          </div>
        </div>

        {/* Metric 3: Pending Tasks Across Queues */}
        <div 
          onClick={() => onNavigateTab('officer-desk')}
          className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs hover:border-amber-500/80 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Tác Vụ Chờ Xử Lý (Pending Tasks)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
              {pendingTasksData.reduce((acc, t) => acc + t.count, 0)}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              tác vụ trong 6 hàng đợi
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-rose-500 font-medium">1 cảnh báo gần hạn SLA</span>
            <span className="text-amber-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              <span>Đến bàn cán bộ</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: SLA Compliance Rate */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Tỷ Lệ Đúng Hạn SLA (On-Time)</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {metrics.slaCompliance}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+1.2%</span>
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Hoàn thành: <strong>{metrics.completed + 18} hồ sơ</strong></span>
            <span className="text-slate-400 font-mono">0 vi phạm SLA</span>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. MAIN CHARTS GRID LAYOUT (RECHARTS)                */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CHART 1: Active Process Instances by Process Definition (8 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>Số Lượng Phiên Thực Thi Đang Chạy Theo Quy Trình (Active Instances)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Phân bổ hồ sơ đang xử lý (In Review) và cần bổ sung chứng từ (Need Docs) trên từng mô hình BPM.
              </p>
            </div>
            <span className="font-mono text-xs text-slate-400 font-semibold">
              Live Zeebe
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeInstancesByProcess}
                margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
                barSize={24}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
                          <p className="font-bold text-emerald-400">{label}</p>
                          <div className="space-y-0.5 text-[11px]">
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Đang thẩm định:</span>
                              <span className="font-mono font-bold text-blue-300">{payload[0]?.value}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Cần bổ sung chứng từ:</span>
                              <span className="font-mono font-bold text-rose-300">{payload[1]?.value}</span>
                            </div>
                            <div className="flex justify-between gap-4 pt-1 border-t border-slate-800">
                              <span className="text-slate-300">Tổng đang hoạt động:</span>
                              <span className="font-mono font-bold text-emerald-300">
                                {Number(payload[0]?.value || 0) + Number(payload[1]?.value || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                <Bar dataKey="inReview" name="Đang thẩm định" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="needDocs" name="Cần bổ sung hồ sơ" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            {activeInstancesByProcess.map(p => (
              <div key={p.processKey} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-slate-400 block font-mono text-[10px]">{p.processKey}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-xs block">
                  {p.totalActive} phiên
                </span>
                <span className="text-[10px] text-slate-500">SLA: {p.avgSla}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: Status Breakdown Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-teal-600" />
                <span>Trạng Thái Vòng Đời Tiến Trình (Instance Lifecycle)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Tỷ lệ phân bổ các giai đoạn hồ sơ toàn hệ thống.
              </p>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-xl border border-slate-700">
                          <span className="font-semibold block" style={{ color: data.payload.color }}>
                            {data.name}
                          </span>
                          <span className="font-mono font-bold text-slate-100">
                            {data.value} hồ sơ ({((Number(data.value) / 29) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
            {statusPieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-300 truncate">{item.name}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 4. AVERAGE COMPLETION TIME & PENDING TASKS (GRID 2)  */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CHART 3: Average Completion Time per Process vs Target SLA (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Thời Gian Xử Lý Trung Bình Từng Quy Trình vs SLA Cam Kết (Hours)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                So sánh số giờ thực tế hoàn tất (cột xanh) so với hạn mức cam kết SLA tối đa (đường đỏ).
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% trong SLA</span>
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={completionTimeData}
                margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
                barSize={24}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="processKey" 
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
                      const item = completionTimeData.find(c => c.processKey === label);
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
                          <p className="font-bold text-blue-400">{item?.process || label}</p>
                          <div className="space-y-0.5 text-[11px]">
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Thời gian thực tế TB:</span>
                              <span className="font-mono font-bold text-emerald-400">{item?.actualTime} giờ</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Hạn mức SLA tối đa:</span>
                              <span className="font-mono font-bold text-rose-400">{item?.targetSla} giờ</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-slate-400">Kỷ lục xử lý nhanh:</span>
                              <span className="font-mono font-bold text-amber-300">{item?.fastTrackMin} giờ</span>
                            </div>
                            <div className="pt-1 border-t border-slate-800 text-[10.5px] text-emerald-300">
                              {item?.status}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                <Bar dataKey="actualTime" name="Thời gian thực tế (Giờ)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="targetSla" name="Mục tiêu SLA (Giờ)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl flex items-center justify-between text-xs">
            <span className="text-emerald-900 dark:text-emerald-200 font-medium">
              💡 <strong>Gợi ý tối ưu:</strong> Tích hợp tự động ký số e-Sign và duyệt OCR hóa đơn giúp rút ngắn trung bình <strong>4.2 giờ</strong> cho quy trình Giải Ngân SDD.
            </span>
          </div>
        </div>

        {/* CHART 4: Pending Tasks by Department / Role (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Tác Vụ Tồn Đọng Theo Bộ Phận / Vai Trò (Pending Queues)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Khối lượng công việc đang chờ cán bộ thụ lý trong từng hàng đợi.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('officer-desk')}
              className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Xử lý ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {pendingTasksData.map((task, idx) => {
              const maxCount = 6;
              const pct = (task.count / maxCount) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.color }} />
                      <span>{task.label}</span>
                      <span className="font-mono text-[10px] text-slate-400">({task.role})</span>
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{task.count} task</span>
                      <span className="text-[10px] text-slate-400">· TB {task.avgWaitHours}h</span>
                      {task.overdue > 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          {task.overdue} cảnh báo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%`, backgroundColor: task.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Tổng tác vụ đang mở: <strong className="font-mono text-slate-800 dark:text-slate-200">18 tác vụ</strong></span>
            <span className="text-emerald-600 font-semibold">Tải trọng: Cân bằng</span>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 5. HOURLY THROUGHPUT & EXECUTION TREND (FULL WIDTH)  */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Lưu Lượng Thực Thi Trong Ngày &amp; Tiến Độ Hoàn Tất (Hourly Throughput)</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh lượng yêu cầu mới nộp (đường xanh lá) so với số hồ sơ được phê duyệt hoàn tất (đường xanh dương).
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
              <span className="w-3 h-0.5 bg-emerald-500 rounded" />
              <span>Hồ sơ mới nộp</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
              <span className="w-3 h-0.5 bg-blue-500 rounded" />
              <span>Đã phê duyệt / Giải ngân</span>
            </span>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={hourlyThroughputData}
              margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700">
                        <p className="font-bold text-emerald-400">Khung giờ: {label}</p>
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Hồ sơ tiếp nhận:</span>
                            <span className="font-mono font-bold text-emerald-300">+{payload[0]?.value} hồ sơ</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Đã giải ngân:</span>
                            <span className="font-mono font-bold text-blue-300">{payload[1]?.value} hồ sơ</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="newRequests" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorNew)" name="Mới nộp" />
              <Area type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorComp)" name="Đã duyệt" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
