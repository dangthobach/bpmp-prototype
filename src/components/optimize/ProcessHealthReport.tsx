import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
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
  ReferenceLine 
} from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  Filter, 
  Download, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  ServerCrash, 
  RefreshCw, 
  Search,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface ProcessHealthReportProps {
  currentProcessKey?: string;
}

// Mock historical health & failure trend data
const HEALTH_TREND_DATA_30D = [
  { date: '05/04', overallRate: 4.8, nclosRate: 3.9, elosRate: 2.1, retailBioRate: 6.8, sddRate: 1.5, incidents: 14, executions: 2150, apiTimeout: 6, dmnError: 4, workerCrash: 3, dbLock: 1 },
  { date: '07/04', overallRate: 4.5, nclosRate: 3.7, elosRate: 2.0, retailBioRate: 6.4, sddRate: 1.4, incidents: 13, executions: 2210, apiTimeout: 5, dmnError: 4, workerCrash: 3, dbLock: 1 },
  { date: '09/04', overallRate: 4.2, nclosRate: 3.5, elosRate: 1.9, retailBioRate: 5.9, sddRate: 1.2, incidents: 11, executions: 2340, apiTimeout: 5, dmnError: 3, workerCrash: 2, dbLock: 1 },
  { date: '11/04', overallRate: 4.9, nclosRate: 4.1, elosRate: 2.3, retailBioRate: 7.2, sddRate: 1.6, incidents: 16, executions: 2400, apiTimeout: 8, dmnError: 4, workerCrash: 3, dbLock: 1 },
  { date: '13/04', overallRate: 5.6, nclosRate: 4.8, elosRate: 2.8, retailBioRate: 8.5, sddRate: 2.1, incidents: 22, executions: 2510, apiTimeout: 12, dmnError: 5, workerCrash: 4, dbLock: 1 },
  { date: '15/04', overallRate: 4.1, nclosRate: 3.4, elosRate: 1.8, retailBioRate: 5.7, sddRate: 1.3, incidents: 12, executions: 2600, apiTimeout: 5, dmnError: 4, workerCrash: 2, dbLock: 1 },
  { date: '17/04', overallRate: 3.6, nclosRate: 2.9, elosRate: 1.6, retailBioRate: 4.8, sddRate: 1.1, incidents: 10, executions: 2580, apiTimeout: 4, dmnError: 3, workerCrash: 2, dbLock: 1 },
  { date: '19/04', overallRate: 3.2, nclosRate: 2.7, elosRate: 1.5, retailBioRate: 4.4, sddRate: 0.9, incidents: 9, executions: 2700, apiTimeout: 4, dmnError: 3, workerCrash: 1, dbLock: 1 },
  { date: '21/04', overallRate: 3.8, nclosRate: 3.1, elosRate: 1.7, retailBioRate: 5.2, sddRate: 1.2, incidents: 11, executions: 2640, apiTimeout: 5, dmnError: 3, workerCrash: 2, dbLock: 1 },
  { date: '23/04', overallRate: 3.1, nclosRate: 2.5, elosRate: 1.4, retailBioRate: 4.1, sddRate: 0.8, incidents: 8, executions: 2800, apiTimeout: 3, dmnError: 3, workerCrash: 1, dbLock: 1 },
  { date: '25/04', overallRate: 2.9, nclosRate: 2.4, elosRate: 1.3, retailBioRate: 3.8, sddRate: 0.7, incidents: 8, executions: 2920, apiTimeout: 3, dmnError: 3, workerCrash: 1, dbLock: 1 },
  { date: '27/04', overallRate: 2.7, nclosRate: 2.2, elosRate: 1.2, retailBioRate: 3.5, sddRate: 0.7, incidents: 7, executions: 2850, apiTimeout: 3, dmnError: 2, workerCrash: 1, dbLock: 1 },
  { date: '29/04', overallRate: 3.4, nclosRate: 2.8, elosRate: 1.6, retailBioRate: 4.6, sddRate: 1.0, incidents: 10, executions: 2750, apiTimeout: 4, dmnError: 3, workerCrash: 2, dbLock: 1 },
  { date: '01/05', overallRate: 2.5, nclosRate: 2.0, elosRate: 1.1, retailBioRate: 3.2, sddRate: 0.6, incidents: 6, executions: 2650, apiTimeout: 2, dmnError: 2, workerCrash: 1, dbLock: 1 },
  { date: '03/05', overallRate: 2.8, nclosRate: 2.3, elosRate: 1.3, retailBioRate: 3.6, sddRate: 0.8, incidents: 8, executions: 2900, apiTimeout: 3, dmnError: 3, workerCrash: 1, dbLock: 1 },
];

// Mock recent failed process incidents
interface ProcessIncident {
  id: string;
  instanceId: string;
  processKey: string;
  processName: string;
  activityName: string;
  timestamp: string;
  errorType: 'API_TIMEOUT' | 'DMN_ERROR' | 'WORKER_CRASH' | 'DB_LOCK';
  errorMessage: string;
  severity: 'CRITICAL' | 'WARNING' | 'RESOLVED';
  retryCount: number;
}

const RECENT_INCIDENTS: ProcessIncident[] = [
  {
    id: 'INC-9014',
    instanceId: 'PRC-NCLOS-89412',
    processKey: 'NCLOS',
    processName: 'Cho Vay Tiêu Dùng NCLOS',
    activityName: 'Tra Cứu Thông Tin CIC Quốc Gia',
    timestamp: '10:42 04/05/2026',
    errorType: 'API_TIMEOUT',
    errorMessage: 'Gateway Timeout: Cổng kết nối CIC phản hồi vượt quá 15,000ms',
    severity: 'WARNING',
    retryCount: 2,
  },
  {
    id: 'INC-9013',
    instanceId: 'PRC-BIO-77201',
    processKey: 'RetailBio',
    processName: 'Xác Thực Sinh Trắc Học (RetailBio)',
    activityName: 'Xác Thực Khuôn Mặt & Chip CCCD',
    timestamp: '10:35 04/05/2026',
    errorType: 'API_TIMEOUT',
    errorMessage: 'Connection reset by peer: Dịch vụ đối soát BCA quá tải đột biến',
    severity: 'CRITICAL',
    retryCount: 3,
  },
  {
    id: 'INC-9012',
    instanceId: 'PRC-ELOS-44810',
    processKey: 'ELOS',
    processName: 'Phát Hành Thẻ Nhanh ELOS',
    activityName: 'Đánh Giá Quy Tắc Điểm Tín Dụng DMN',
    timestamp: '10:18 04/05/2026',
    errorType: 'DMN_ERROR',
    errorMessage: 'DMN Decision Rule Violation: Không tìm thấy phân khúc khách hàng ID #982',
    severity: 'RESOLVED',
    retryCount: 1,
  },
  {
    id: 'INC-9011',
    instanceId: 'PRC-SDD-33290',
    processKey: 'GIẢI NGÂN (SDD)',
    processName: 'Giải Ngân Tài Trợ SDD',
    activityName: 'Tạo Bút Toán Hạch Toán Core Banking',
    timestamp: '09:55 04/05/2026',
    errorType: 'DB_LOCK',
    errorMessage: 'Deadlock detected: Giao dịch xung đột khóa tài khoản số dư tạm ứng',
    severity: 'RESOLVED',
    retryCount: 2,
  },
  {
    id: 'INC-9010',
    instanceId: 'PRC-NCLOS-89301',
    processKey: 'NCLOS',
    processName: 'Cho Vay Tiêu Dùng NCLOS',
    activityName: 'Thẩm Định Thực Địa Hồ Sơ',
    timestamp: '09:20 04/05/2026',
    errorType: 'WORKER_CRASH',
    errorMessage: 'Worker out of memory during PDF inspection upload (Payload > 45MB)',
    severity: 'WARNING',
    retryCount: 1,
  },
  {
    id: 'INC-9009',
    instanceId: 'PRC-BIO-77119',
    processKey: 'RetailBio',
    processName: 'Xác Thực Sinh Trắc Học (RetailBio)',
    activityName: 'Đối Soát Dấu Vân Tay & Khuôn Mặt',
    timestamp: '08:45 04/05/2026',
    errorType: 'API_TIMEOUT',
    errorMessage: 'HTTP 504: Cổng đối soát nhận diện khuôn mặt sinh trắc học không phản hồi',
    severity: 'RESOLVED',
    retryCount: 2,
  },
];

export const ProcessHealthReport: React.FC<ProcessHealthReportProps> = ({ currentProcessKey }) => {
  const [timeRange, setTimeRange] = useState<'7D' | '14D' | '30D'>('30D');
  const [selectedProcess, setSelectedProcess] = useState<string>(currentProcessKey || 'ALL');
  const [activeChartType, setActiveChartType] = useState<'OVERALL' | 'MULTI_PROCESS' | 'ROOT_CAUSE'>('OVERALL');
  const [incidentSearchTerm, setIncidentSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'RESOLVED'>('ALL');
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true);
  const [incidentsList, setIncidentsList] = useState<ProcessIncident[]>(RECENT_INCIDENTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered trend data based on selected time range
  const displayTrendData = useMemo(() => {
    if (timeRange === '7D') {
      return HEALTH_TREND_DATA_30D.slice(-7);
    }
    if (timeRange === '14D') {
      return HEALTH_TREND_DATA_30D.slice(-14);
    }
    return HEALTH_TREND_DATA_30D;
  }, [timeRange]);

  // Calculated metrics
  const avgFailureRate = useMemo(() => {
    const sum = displayTrendData.reduce((acc, curr) => acc + curr.overallRate, 0);
    return (sum / displayTrendData.length).toFixed(2);
  }, [displayTrendData]);

  const totalIncidents = useMemo(() => {
    return displayTrendData.reduce((acc, curr) => acc + curr.incidents, 0);
  }, [displayTrendData]);

  const totalExecutions = useMemo(() => {
    return displayTrendData.reduce((acc, curr) => acc + curr.executions, 0);
  }, [displayTrendData]);

  const autoRecoveryRate = 88.5; // 88.5%
  const mttrMinutes = 11.4; // 11.4 min

  // Filtered incidents table
  const filteredIncidents = useMemo(() => {
    return incidentsList.filter(item => {
      const matchSearch = 
        item.instanceId.toLowerCase().includes(incidentSearchTerm.toLowerCase()) ||
        item.processName.toLowerCase().includes(incidentSearchTerm.toLowerCase()) ||
        item.activityName.toLowerCase().includes(incidentSearchTerm.toLowerCase()) ||
        item.errorMessage.toLowerCase().includes(incidentSearchTerm.toLowerCase());
      
      const matchSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
      const matchProcess = selectedProcess === 'ALL' || item.processKey === selectedProcess;

      return matchSearch && matchSeverity && matchProcess;
    });
  }, [incidentsList, incidentSearchTerm, severityFilter, selectedProcess]);

  const handleManualRetry = (incidentId: string) => {
    setIncidentsList(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          severity: 'RESOLVED',
          retryCount: inc.retryCount + 1,
          errorMessage: '[Auto-Retry Thành Công] - Tác vụ đã được kích hoạt lại và hoàn tất vào 10:48 04/05/2026'
        };
      }
      return inc;
    }));
    setToastMessage(`Đã gửi lệnh thử lại (Manual Retry) cho sự cố ${incidentId} thành công.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportCSV = () => {
    const headers = ['Mã Sự Cố,Mã Instance,Quy Trình,Bước Lỗi,Thời Điểm,Loại Lỗi,Nội Dung Lỗi,Mức Độ,Số Lần Retry'];
    const rows = filteredIncidents.map(inc => 
      `"${inc.id}","${inc.instanceId}","${inc.processName}","${inc.activityName}","${inc.timestamp}","${inc.errorType}","${inc.errorMessage.replace(/"/g, '""')}","${inc.severity}","${inc.retryCount}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Process_Health_Failure_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Đã xuất báo cáo tỷ lệ lỗi sự cố định dạng CSV.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Custom Recharts Tooltip for Failure Rate
  const CustomRateTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 font-bold">
            <span className="text-slate-300">Ngày {label}</span>
            <span className="font-mono text-emerald-400">{data.executions.toLocaleString()} lượt chạy</span>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tỷ Lệ Lỗi Chung:</span>
              <span className={`font-mono font-bold ${data.overallRate > 4.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {data.overallRate}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Số Ca Lỗi / Sự Cố:</span>
              <span className="font-mono text-rose-300 font-semibold">{data.incidents} sự cố</span>
            </div>
            <div className="pt-1.5 border-t border-slate-800 text-[10.5px] text-slate-400 space-y-0.5">
              <div className="flex justify-between">
                <span>• Timeout API/Gateway:</span>
                <span className="font-mono text-white">{data.apiTimeout}</span>
              </div>
              <div className="flex justify-between">
                <span>• Quy tắc DMN:</span>
                <span className="font-mono text-white">{data.dmnError}</span>
              </div>
              <div className="flex justify-between">
                <span>• Worker / Bộ nhớ:</span>
                <span className="font-mono text-white">{data.workerCrash}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                  Báo Cáo Sức Khỏe Quy Trình &amp; Tỷ Lệ Thất Bại (Process Health &amp; Failure Rates)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Health Score: 97.2%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Phân tích xu hướng tỷ lệ lỗi theo thời gian qua Recharts, tự động nhận diện điểm nghẽn và mã lỗi hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time Range Selector */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            {(['7D', '14D', '30D'] as const).map(tr => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                  timeRange === tr
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {tr === '7D' ? '7 Ngày' : tr === '14D' ? '14 Ngày' : '30 Ngày'}
              </button>
            ))}
          </div>

          {/* Process Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedProcess}
              onChange={(e) => setSelectedProcess(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
            >
              <option value="ALL">Toàn Bộ Quy Trình</option>
              <option value="NCLOS">NCLOS (Cho Vay Tiêu Dùng)</option>
              <option value="ELOS">ELOS (Hạn Mức Thẻ)</option>
              <option value="RetailBio">RetailBio (Sinh Trắc Học)</option>
              <option value="GIẢI NGÂN (SDD)">GIẢI NGÂN (SDD)</option>
            </select>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            title="Xuất bảng sự cố và tỷ lệ lỗi sang CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* 4 Process Health KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Failure Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Tỷ Lệ Thất Bại Bình Quân
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
              {avgFailureRate}%
            </span>
            <span className="text-xs font-medium text-slate-500">ngưỡng SLA &lt; 4.0%</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <TrendingDown className="w-3 h-3" />
              -0.85%
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Giảm rõ rệt so với 30 ngày trước
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Cao nhất: 5.6% (13/04)</span>
            <span className="text-emerald-600 font-semibold">Thấp nhất: 2.5%</span>
          </div>
        </div>

        {/* KPI 2: Total Incidents */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Tổng Số Sự Cố / Lỗi
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {totalIncidents}
            </span>
            <span className="text-xs font-medium text-slate-500">/ {totalExecutions.toLocaleString()} lượt chạy</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Zap className="w-3 h-3" />
              {((totalIncidents / totalExecutions) * 100).toFixed(2)}%
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Tỷ trọng lỗi trên tổng thực thi
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Chờ can thiệp: 2 ca</span>
            <span className="text-emerald-600 font-semibold">Đã resolve: {totalIncidents - 2} ca</span>
          </div>
        </div>

        {/* KPI 3: Auto-Recovery Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Tỷ Lệ Tự Phục Hồi (Auto-Retry)
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              {autoRecoveryRate}%
            </span>
            <span className="text-xs font-medium text-slate-500">thành công tự động</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" />
              +4.2%
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Exponential Backoff hiệu quả
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Retry tối đa: 3 lần</span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold">Tự động hóa</span>
          </div>
        </div>

        {/* KPI 4: Mean Time to Recovery (MTTR) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Thời Gian Phục Hồi (MTTR)
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400 font-mono tracking-tight">
              {mttrMinutes}
            </span>
            <span className="text-xs font-semibold text-slate-500">phút / sự cố</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <TrendingDown className="w-3 h-3" />
              -2.1m
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Nhanh hơn 15% so với SLA quy định
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between font-mono">
            <span>SLA Cam kết: &le; 20m</span>
            <span className="text-purple-600 font-semibold">Đạt chuẩn</span>
          </div>
        </div>
      </div>

      {/* Main Trend Graphs Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Graph Header with View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>Đồ Thị Xu Hướng Tỷ Lệ Lỗi Quy Trình Theo Thời Gian</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 font-normal">
                Recharts Animated Engine
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              So sánh tỷ lệ lỗi % đối chiếu với ngưỡng cảnh báo SLA 4.0% và phân tích theo từng quy trình trọng điểm
            </p>
          </div>

          {/* Graph Type Switcher (Segmented Control Tray) */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <button
              onClick={() => setActiveChartType('OVERALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeChartType === 'OVERALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tỷ Lệ Chung (%)
            </button>
            <button
              onClick={() => setActiveChartType('MULTI_PROCESS')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeChartType === 'MULTI_PROCESS'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Theo Quy Trình
            </button>
            <button
              onClick={() => setActiveChartType('ROOT_CAUSE')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeChartType === 'ROOT_CAUSE'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Nguyên Nhân Gốc
            </button>
          </div>
        </div>

        {/* View 1: Overall Failure Rate Area Chart */}
        {activeChartType === 'OVERALL' && (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="failureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  unit="%" 
                  domain={[0, 8]} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomRateTooltip />} />
                <ReferenceLine 
                  y={4.0} 
                  stroke="#f43f5e" 
                  strokeDasharray="4 4" 
                  label={{ value: 'Ngưỡng Cảnh Báo SLA (4.0%)', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="overallRate" 
                  name="Tỷ Lệ Lỗi (%)"
                  stroke="#dc2626" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#failureGrad)" 
                  dot={{ r: 3, fill: '#dc2626' }}
                  activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* View 2: Multi-Process Line Chart Comparison */}
        {activeChartType === 'MULTI_PROCESS' && (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  unit="%" 
                  domain={[0, 10]} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => [`${value}%`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                />
                <ReferenceLine y={4.0} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Ngưỡng SLA (4%)', fill: '#f43f5e', fontSize: 10 }} />
                <Line type="monotone" dataKey="retailBioRate" name="RetailBio (Sinh Trắc)" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 2.5 }} />
                <Line type="monotone" dataKey="nclosRate" name="NCLOS (Vay Tiêu Dùng)" stroke="#d97706" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="elosRate" name="ELOS (Hạn Mức Thẻ)" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="sddRate" name="GIẢI NGÂN (SDD)" stroke="#059669" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* View 3: Root Cause Breakdown Stacked Bar Chart */}
        {activeChartType === 'ROOT_CAUSE' && (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis 
                  dataKey="date" 
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
                  formatter={(value: any, name: any) => [`${value} ca sự cố`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                />
                <Bar dataKey="apiTimeout" name="Gateway/API Timeout" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="dmnError" name="Vi Phạm DMN / Business Rule" stackId="a" fill="#f59e0b" />
                <Bar dataKey="workerCrash" name="Worker / OOM Exception" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="dbLock" name="Database Lock / Deadlock" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart Footer Highlights */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Nguyên nhân chính: <strong>Gateway CIC &amp; Căn cước BCA timeout (46%)</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Tỷ lệ phục hồi tự động thành công: <strong>88.5%</strong></span>
            </span>
          </div>
          <span className="font-mono text-slate-400">
            Dữ liệu tổng hợp từ Camunda Zeebe Incident Exporter
          </span>
        </div>
      </div>

      {/* Incident Log & Auto-Remediation Drill-down Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
              <ServerCrash className="w-4 h-4 text-rose-500" />
              <span>Nhật Ký Sự Cố Vận Hành &amp; Thao Tác Khắc Phục (Incident Remediation Log)</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Danh sách chi tiết các ca lỗi phát sinh trong quy trình, hỗ trợ thao tác Retry thủ công hoặc kiểm tra thông điệp lỗi
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm mã instance, lỗi..."
                value={incidentSearchTerm}
                onChange={(e) => setIncidentSearchTerm(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-52 shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>

            <div className="flex p-0.5 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs font-medium">
              {(['ALL', 'CRITICAL', 'WARNING', 'RESOLVED'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    severityFilter === sev
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {sev === 'ALL' ? 'Tất cả' : sev === 'CRITICAL' ? 'Nghiêm Trọng' : sev === 'WARNING' ? 'Cảnh Báo' : 'Đã Khắc Phục'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10.5px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Mã Sự Cố</th>
                <th className="py-3 px-3">Instance / Quy Trình</th>
                <th className="py-3 px-3">Bước Quy Trình Bị Lỗi</th>
                <th className="py-3 px-3">Thời Điểm</th>
                <th className="py-3 px-3">Nguyên Nhân &amp; Chi Tiết Lỗi</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    Không có sự cố nào khớp với điều kiện lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {inc.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        {inc.instanceId}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {inc.processName}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {inc.activityName}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {inc.timestamp}
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="text-[11px] text-slate-800 dark:text-slate-200 font-medium line-clamp-2" title={inc.errorMessage}>
                        {inc.errorMessage}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span>Retry đã thực hiện: {inc.retryCount}/3</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {inc.severity === 'CRITICAL' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                          Nghiêm Trọng
                        </span>
                      )}
                      {inc.severity === 'WARNING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Cần Kiểm Tra
                        </span>
                      )}
                      {inc.severity === 'RESOLVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Đã Phục Hồi
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {inc.severity !== 'RESOLVED' ? (
                        <button
                          onClick={() => handleManualRetry(inc.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-[11px] font-semibold transition-all shadow-2xs cursor-pointer"
                          title="Thử lại bước quy trình này (Manual Retry)"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">Hoàn tất</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
