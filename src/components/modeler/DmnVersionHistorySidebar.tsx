import React, { useState } from 'react';
import { 
  DMNVersionSnapshot, 
  DMNDecisionDefinition 
} from '../../types/dmn';
import { 
  X, 
  History, 
  Plus, 
  RotateCcw, 
  ArrowLeftRight, 
  Eye, 
  Clock, 
  User, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  GitCommit,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCode,
  ShieldCheck
} from 'lucide-react';

interface DmnVersionHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  decision: DMNDecisionDefinition;
  versions: DMNVersionSnapshot[];
  onSaveSnapshot: (tag: string, summary: string, authorName: string) => void;
  onRevertToVersion: (version: DMNVersionSnapshot) => void;
  onCompareVersions: (base: DMNVersionSnapshot, target: DMNVersionSnapshot) => void;
  onInspectVersion: (version: DMNVersionSnapshot) => void;
}

export const DmnVersionHistorySidebar: React.FC<DmnVersionHistorySidebarProps> = ({
  isOpen,
  onClose,
  decision,
  versions,
  onSaveSnapshot,
  onRevertToVersion,
  onCompareVersions,
  onInspectVersion
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [newVersionTag, setNewVersionTag] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newAuthor, setNewAuthor] = useState('Admin BPM (Bạn)');
  const [confirmRevertSnapshot, setConfirmRevertSnapshot] = useState<DMNVersionSnapshot | null>(null);

  if (!isOpen) return null;

  // Auto-suggest next version tag
  const suggestedNextTag = `v${decision.version}.${versions.length}`;

  const handleOpenCreateSnapshot = () => {
    setNewVersionTag(suggestedNextTag);
    setNewSummary('');
    setIsCreatingSnapshot(true);
  };

  const handleSubmitSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionTag.trim() || !newSummary.trim()) return;

    onSaveSnapshot(newVersionTag.trim(), newSummary.trim(), newAuthor.trim());
    setIsCreatingSnapshot(false);
    setNewSummary('');
  };

  const filteredVersions = versions.filter(v => {
    const q = searchTerm.toLowerCase();
    return (
      v.versionTag.toLowerCase().includes(q) ||
      v.summary.toLowerCase().includes(q) ||
      v.author.name.toLowerCase().includes(q)
    );
  });

  const currentVersion = versions.find(v => v.isCurrent) || versions[0];

  return (
    <div className="w-96 sm:w-[410px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 text-xs shadow-xl h-full overflow-hidden select-none animate-in slide-in-from-right duration-200">
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-center">
            <History className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
              <span>Lịch Sử Phiên Bản DMN</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                {versions.length}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[220px]">
              {decision.name}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          title="Đóng bảng lịch sử"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Snapshot Action Bar */}
      <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-850/30 space-y-2.5">
        {!isCreatingSnapshot ? (
          <button
            onClick={handleOpenCreateSnapshot}
            className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lưu Snapshot Phiên Bản Mới</span>
          </button>
        ) : (
          <form onSubmit={handleSubmitSnapshot} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-purple-300 dark:border-purple-800 shadow-sm space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-700">
              <span className="font-bold text-[11px] text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Tạo Mốc Snapshot Mới
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingSnapshot(false)}
                className="text-slate-400 hover:text-slate-600 text-[11px]"
              >
                Hủy
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Mã Phiên Bản</label>
                <input
                  type="text"
                  value={newVersionTag}
                  onChange={(e) => setNewVersionTag(e.target.value)}
                  placeholder="v2.1"
                  className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Tác Giả</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 block mb-1">Nội Dung Thay Đổi (Commit Message)</label>
              <textarea
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                placeholder="Mô tả lý do thay đổi quy tắc, cập nhật điều kiện FEEL..."
                className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none h-14"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer transition-colors"
            >
              Lưu Snapshot Ngay
            </button>
          </form>
        )}

        {/* Quick Search */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo thẻ phiên bản, người sửa, ghi chú..."
            className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
        </div>
      </div>

      {/* Version Timeline List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {filteredVersions.length === 0 ? (
          <div className="p-6 text-center text-slate-400 space-y-1">
            <History className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-xs">Không tìm thấy phiên bản phù hợp</p>
            <p className="text-[10.5px]">Thử từ khóa tìm kiếm khác</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-4 py-1">
            {filteredVersions.map((ver, idx) => {
              const isCurrent = ver.isCurrent || ver.id === currentVersion.id;
              const formattedDate = new Date(ver.createdAt).toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={ver.id} className="relative pl-5 group">
                  {/* Timeline Dot Indicator */}
                  <span className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 flex items-center justify-center transition-all ${
                    isCurrent 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30' 
                      : 'border-purple-500 group-hover:scale-110'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-emerald-500 animate-pulse' : 'bg-purple-500'}`} />
                  </span>

                  {/* Version Card */}
                  <div className={`p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/80 shadow-xs'
                      : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 shadow-2xs'
                  }`}>
                    {/* Header Row: Version Tag & Status */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-slate-100">
                          {ver.versionTag}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                            Hiện Tại
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formattedDate}
                      </span>
                    </div>

                    {/* Commit Note / Summary */}
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-2">
                      {ver.summary}
                    </p>

                    {/* Meta Info: Author & Rules summary */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1 truncate max-w-[170px]">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {ver.author.name}
                        </span>
                      </div>

                      <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                        {ver.decision.rules.length} quy tắc &bull; {ver.decision.hitPolicy}
                      </span>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Inspect / View Button */}
                      <button
                        onClick={() => onInspectVersion(ver)}
                        className="px-2 py-1 text-[10.5px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Xem chi tiết các quy tắc của phiên bản này"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Xem</span>
                      </button>

                      {/* Compare / Diff Button */}
                      <button
                        onClick={() => onCompareVersions(ver, currentVersion)}
                        className="px-2 py-1 text-[10.5px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 border border-purple-200 dark:border-purple-800/80 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="So sánh sai khác giữa phiên bản này và bản hiện tại"
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                        <span>So Sánh</span>
                      </button>

                      {/* Revert Button (only for previous non-current versions) */}
                      {!isCurrent && (
                        <button
                          onClick={() => setConfirmRevertSnapshot(ver)}
                          className="px-2 py-1 text-[10.5px] font-semibold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 border border-amber-300 dark:border-amber-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Khôi phục bảng quyết định về phiên bản này"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-600" />
                          <span>Khôi Phục</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Reverting */}
      {confirmRevertSnapshot && (
        <div className="p-3.5 border-t border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/70 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold text-xs">
            <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Xác nhận khôi phục về {confirmRevertSnapshot.versionTag}?</span>
          </div>
          <p className="text-[10.5px] text-amber-700 dark:text-amber-300 leading-normal">
            Bảng quyết định sẽ được quay lại trạng thái <strong>{confirmRevertSnapshot.versionTag}</strong> ({confirmRevertSnapshot.decision.rules.length} quy tắc). Toàn bộ dữ liệu hiện tại sẽ được tự động sao lưu thành một snapshot mới.
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setConfirmRevertSnapshot(null)}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onRevertToVersion(confirmRevertSnapshot);
                setConfirmRevertSnapshot(null);
              }}
              className="px-3 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow-xs cursor-pointer"
            >
              Xác Nhận Khôi Phục
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-[10.5px] text-slate-400">
        <span className="flex items-center gap-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Audit Trail Ready
        </span>
        <span>Chuẩn OMG DMN 1.3</span>
      </div>

    </div>
  );
};
