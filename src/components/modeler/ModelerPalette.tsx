import React, { useState } from 'react';
import { BPMNodeType, BPMNNode } from '../../types/bpm';
import { 
  Circle, 
  Square, 
  Diamond, 
  Database, 
  FileText, 
  Clock, 
  Mail, 
  AlertTriangle, 
  Zap, 
  Cpu, 
  Table, 
  Code, 
  Send, 
  Layers, 
  User, 
  ShieldCheck, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Search,
  Sparkles,
  Columns,
  Minus
} from 'lucide-react';

interface PaletteItem {
  type: BPMNodeType;
  label: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  defaultProps: Partial<BPMNNode>;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // 1. Tác Nhân & Làn Bơi (Actors & Structure)
  {
    type: 'pool',
    label: 'Participant / Pool',
    category: 'Tác Nhân & Làn Bơi',
    description: 'Hộp phân luồng tổ chức hoặc đối tác bên ngoài',
    icon: <Columns className="w-3.5 h-3.5 text-indigo-500" />,
    defaultProps: { width: 950, height: 280, name: 'KHỐI VẬN HÀNH & TÍN DỤNG' }
  },
  {
    type: 'lane',
    label: 'Swimlane (Làn Bơi)',
    category: 'Tác Nhân & Làn Bơi',
    description: 'Làn phân vai trò tác nhân cụ thể (RM, Thẩm định, KSV)',
    icon: <Layers className="w-3.5 h-3.5 text-blue-500" />,
    defaultProps: { width: 900, height: 160, name: 'Làn Thẩm Định Tín Dụng' }
  },

  // 2. Sự Kiện Bắt Đầu (Start Events)
  {
    type: 'startEvent',
    label: 'Start Event (None)',
    category: 'Sự Kiện Bắt Đầu',
    description: 'Khởi đầu quy trình thủ công hoặc API trigger',
    icon: <Circle className="w-3.5 h-3.5 text-emerald-600" />,
    defaultProps: { width: 36, height: 36, name: 'BẮT ĐẦU' }
  },
  {
    type: 'timerStartEvent',
    label: 'Timer Start Event',
    category: 'Sự Kiện Bắt Đầu',
    description: 'Khởi động theo lịch định kỳ Cron (Camunda 8 timer)',
    icon: <Clock className="w-3.5 h-3.5 text-emerald-600" />,
    defaultProps: { width: 36, height: 36, name: 'CRON START (08:00)' }
  },
  {
    type: 'messageStartEvent',
    label: 'Message Start Event',
    category: 'Sự Kiện Bắt Đầu',
    description: 'Khởi động từ Kafka / RabbitMQ message payload',
    icon: <Mail className="w-3.5 h-3.5 text-emerald-600" />,
    defaultProps: { width: 36, height: 36, name: 'MESSAGE START' }
  },

  // 3. Tác Vụ Nghiệp Vụ (Tasks - Camunda 8 & Flowable)
  {
    type: 'userTask',
    label: 'User Task (Biểu Mẫu)',
    category: 'Tác Vụ Nghiệp Vụ',
    description: 'Tác vụ người dùng với Camunda Form / Flowable Form',
    icon: <User className="w-3.5 h-3.5 text-sky-600" />,
    defaultProps: { width: 110, height: 55, name: 'THẨM ĐỊNH HỒ SƠ', assigneeRole: 'NCLOS B CO', slaHours: 4 }
  },
  {
    type: 'serviceTask',
    label: 'Service Task (Zeebe Worker)',
    category: 'Tác Vụ Nghiệp Vụ',
    description: 'Job Worker tự động hoá, tích hợp Core Banking hoặc REST',
    icon: <Cpu className="w-3.5 h-3.5 text-purple-600" />,
    defaultProps: { width: 110, height: 55, name: 'TRA CỨU CIC AUTOMATED', jobType: 'cic-lookup-worker', jobRetries: 3 }
  },
  {
    type: 'businessRuleTask',
    label: 'Business Rule Task (DMN)',
    category: 'Tác Vụ Nghiệp Vụ',
    description: 'Bảng quyết định tín dụng DMN (Called Decision)',
    icon: <Table className="w-3.5 h-3.5 text-amber-600" />,
    defaultProps: { width: 110, height: 55, name: 'CHẤM ĐIỂM TÍN DỤNG DMN' }
  },
  {
    type: 'scriptTask',
    label: 'Script Task (FEEL / Groovy)',
    category: 'Tác Vụ Nghiệp Vụ',
    description: 'Xử lý logic biến bằng biểu thức FEEL hoặc Script',
    icon: <Code className="w-3.5 h-3.5 text-emerald-600" />,
    defaultProps: { width: 110, height: 55, name: 'TÍNH TOÁN LÃI SUẤT', scriptFormat: 'feel' }
  },
  {
    type: 'sendTask',
    label: 'Send Task (Kafka Producer)',
    category: 'Tác Vụ Nghiệp Vụ',
    description: 'Phát sinh thông điệp Kafka topic ra hệ thống ngoài',
    icon: <Send className="w-3.5 h-3.5 text-blue-600" />,
    defaultProps: { width: 110, height: 55, name: 'GỬI THÔNG BÁO SMS/EMAIL' }
  },
  {
    type: 'receiveTask',
    label: 'Receive Task (Correlation)',
    category: 'Tác Vụ Nghiệp Vụ',
    description: 'Tạm dừng quy trình chờ tin nhắn Zeebe Subscription',
    icon: <Mail className="w-3.5 h-3.5 text-teal-600" />,
    defaultProps: { width: 110, height: 55, name: 'CHỜ KẾT QUẢ GIẢI NGÂN' }
  },
  {
    type: 'callActivity',
    label: 'Call Activity (Sub-process)',
    category: 'Tác Vụ Nghiệp Vụ',
    description: 'Gọi thực thi quy trình con độc lập có tái sử dụng',
    icon: <Layers className="w-3.5 h-3.5 text-indigo-600" />,
    defaultProps: { width: 115, height: 55, name: 'GỌI QUY TRÌNH KÝ SỐ' }
  },

  // 4. Cổng Phân Nhánh (Gateways)
  {
    type: 'exclusiveGateway',
    label: 'Exclusive Gateway (XOR)',
    category: 'Cổng Phân Nhánh',
    description: 'Rẽ 1 nhánh duy nhất thỏa mãn điều kiện',
    icon: <Diamond className="w-3.5 h-3.5 text-amber-500" />,
    defaultProps: { width: 36, height: 36, name: 'X' }
  },
  {
    type: 'parallelGateway',
    label: 'Parallel Gateway (AND)',
    category: 'Cổng Phân Nhánh',
    description: 'Phân nhánh hoặc đồng bộ song song tất cả các luồng',
    icon: <Plus className="w-3.5 h-3.5 text-amber-500" />,
    defaultProps: { width: 36, height: 36, name: '+' }
  },
  {
    type: 'inclusiveGateway',
    label: 'Inclusive Gateway (OR)',
    category: 'Cổng Phân Nhánh',
    description: 'Rẽ 1 hoặc nhiều nhánh đồng thời theo biểu thức',
    icon: <Circle className="w-3.5 h-3.5 text-amber-500" />,
    defaultProps: { width: 36, height: 36, name: 'O' }
  },
  {
    type: 'eventBasedGateway',
    label: 'Event-Based Gateway',
    category: 'Cổng Phân Nhánh',
    description: 'Chờ sự kiện nào xảy ra trước thì rẽ theo nhánh đó',
    icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
    defaultProps: { width: 36, height: 36, name: '★' }
  },

  // 5. Sự Kiện Biên & Trung Gian (Intermediate & Boundary)
  {
    type: 'intermediateTimerEvent',
    label: 'Intermediate Timer Event',
    category: 'Sự Kiện Biên & Trung Gian',
    description: 'Chờ trễ thời gian (Duration PT2H hoặc Date)',
    icon: <Clock className="w-3.5 h-3.5 text-rose-500" />,
    defaultProps: { width: 36, height: 36, name: 'CHỜ 24H' }
  },
  {
    type: 'boundaryErrorEvent',
    label: 'Boundary Error Event',
    category: 'Sự Kiện Biên & Trung Gian',
    description: 'Bắt ngoại lệ runtime (ERR_TIMEOUT, DMN_FAIL) để chuyển luồng',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
    defaultProps: { width: 34, height: 34, name: 'BẮT LỖI TIMEOUT', errorCode: 'ERR_TIMEOUT' }
  },
  {
    type: 'boundaryTimerEvent',
    label: 'Boundary Timer (SLA Warning)',
    category: 'Sự Kiện Biên & Trung Gian',
    description: 'Sự kiện biên cảnh báo vượt ngưỡng thời gian SLA',
    icon: <Zap className="w-3.5 h-3.5 text-amber-600" />,
    defaultProps: { width: 34, height: 34, name: 'QUÁ HẠN 4H' }
  },

  // 6. Sự Kiện Kết Thúc (End Events)
  {
    type: 'endEvent',
    label: 'End Event (None)',
    category: 'Sự Kiện Kết Thúc',
    description: 'Kết thúc luồng thực thi',
    icon: <Circle className="w-3.5 h-3.5 fill-slate-800 text-slate-800 dark:text-slate-200" />,
    defaultProps: { width: 36, height: 36, name: 'KẾT THÚC' }
  },
  {
    type: 'terminateEndEvent',
    label: 'Terminate End Event',
    category: 'Sự Kiện Kết Thúc',
    description: 'Hủy bỏ toàn bộ process instance ngay lập tức',
    icon: <Circle className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />,
    defaultProps: { width: 36, height: 36, name: 'HỦY HỒ SƠ' }
  },
  {
    type: 'errorEndEvent',
    label: 'Error End Event',
    category: 'Sự Kiện Kết Thúc',
    description: 'Kết thúc với mã lỗi ném ra ngoại lệ',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
    defaultProps: { width: 36, height: 36, name: 'LỖI TỪ CHỐI' }
  },

  // 7. Kho Dữ Liệu & Chú Thích (Artifacts)
  {
    type: 'dataStore',
    label: 'Data Store Reference',
    category: 'Kho Dữ Liệu & Chú Thích',
    description: 'Cơ sở dữ liệu tập trung hoặc Kho hồ sơ số ECM',
    icon: <Database className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />,
    defaultProps: { width: 45, height: 45, name: 'ECM DOCUMENT STORE' }
  },
  {
    type: 'textAnnotation',
    label: 'Text Annotation',
    category: 'Kho Dữ Liệu & Chú Thích',
    description: 'Ghi chú nghiệp vụ gắn kèm các bước xử lý',
    icon: <FileText className="w-3.5 h-3.5 text-slate-500" />,
    defaultProps: { width: 120, height: 40, name: '/* Kiểm tra số dư CIC trước khi duyệt */' }
  }
];

interface ModelerPaletteProps {
  onAddNode: (item: PaletteItem) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ModelerPalette: React.FC<ModelerPaletteProps> = ({
  onAddNode,
  isExpanded,
  onToggleExpand
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'Tác Nhân & Làn Bơi': true,
    'Sự Kiện Bắt Đầu': true,
    'Tác Vụ Nghiệp Vụ': true,
    'Cổng Phân Nhánh': true,
    'Sự Kiện Biên & Trung Gian': false,
    'Sự Kiện Kết Thúc': true,
    'Kho Dữ Liệu & Chú Thích': false,
  });

  const categories = Array.from(new Set(PALETTE_ITEMS.map(i => i.category)));

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredItems = PALETTE_ITEMS.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-200 z-10 ${
        isExpanded ? 'w-64' : 'w-12'
      }`}
    >
      {/* Top Header */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        {isExpanded && (
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Camunda 8 Controls
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Zeebe
            </span>
          </div>
        )}
        <button
          onClick={onToggleExpand}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer ml-auto"
          title={isExpanded ? 'Thu gọn Palette' : 'Mở rộng bảng điều khiển BPMN'}
        >
          {isExpanded ? <Minus className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Palette View */}
      {isExpanded ? (
        <div className="flex-1 overflow-y-auto p-2 space-y-2 text-xs">
          {/* Quick Search */}
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="Tìm kiếm tác vụ, tác nhân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
          </div>

          {/* Grouped Categories */}
          {categories.map(cat => {
            const items = filteredItems.filter(i => i.category === cat);
            if (items.length === 0) return null;
            const isOpen = openCategories[cat] ?? true;

            return (
              <div key={cat} className="border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <span>{cat} ({items.length})</span>
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="p-1.5 space-y-1">
                    {items.map(item => (
                      <div
                        key={item.type + item.label}
                        draggable
                        onDragEnd={() => onAddNode(item)}
                        onClick={() => onAddNode(item)}
                        className="flex items-center gap-2 p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-grab active:cursor-grabbing group transition-all"
                        title={item.description}
                      >
                        <div className="w-6 h-6 rounded flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs group-hover:scale-105 transition-transform">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {item.label}
                          </div>
                          <div className="text-[9.5px] text-slate-400 truncate">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Collapsed Compact Icon Strip */
        <div className="flex-1 flex flex-col items-center py-2 gap-2 overflow-y-auto">
          {PALETTE_ITEMS.slice(0, 10).map((item) => (
            <button
              key={item.type}
              onClick={() => onAddNode(item)}
              draggable
              onDragEnd={() => onAddNode(item)}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-2xs cursor-grab active:cursor-grabbing"
              title={`${item.label} (${item.category}) - Kéo hoặc nhấp để thêm`}
            >
              {item.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
