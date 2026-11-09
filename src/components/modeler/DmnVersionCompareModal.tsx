import React, { useState, useMemo } from 'react';
import { DMNVersionSnapshot } from '../../types/dmn';
import { compareDmnVersions } from './dmnDiffEngine';
import { 
  X, 
  ArrowLeftRight, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  GitCommit,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DmnVersionCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseVersion: DMNVersionSnapshot;
  targetVersion: DMNVersionSnapshot;
  allVersions: DMNVersionSnapshot[];
  onRevertToVersion: (version: DMNVersionSnapshot) => void;
}

export const DmnVersionCompareModal: React.FC<DmnVersionCompareModalProps> = ({
  isOpen,
  onClose,
  baseVersion,
  targetVersion,
  allVersions,
  onRevertToVersion
}) => {
  const [selectedBaseId, setSelectedBaseId] = useState<string>(baseVersion.id);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(targetVersion.id);

  const activeBase = useMemo(() => {
    return allVersions.find(v => v.id === selectedBaseId) || baseVersion;
  }, [allVersions, selectedBaseId, baseVersion]);

  const activeTarget = useMemo(() => {
    return allVersions.find(v => v.id === selectedTargetId) || targetVersion;
  }, [allVersions, selectedTargetId, targetVersion]);

  const diffReport = useMemo(() => {
    return compareDmnVersions(
      activeBase.decision,
      activeTarget.decision,
      activeBase.versionTag,
      activeTarget.versionTag
    );
  }, [activeBase, activeTarget]);

  if (!isOpen) return null;

  // Union of inputs and outputs for tabular rendering
  const allInputs = Array.from(
    new Map([
      ...activeBase.decision.inputs.map(i => [i.id, i] as const),
      ...activeTarget.decision.inputs.map(i => [i.id, i] as const)
    ]).values()
  );

  const allOutputs = Array.from(
    new Map([
      ...activeBase.decision.outputs.map(o => [o.id, o] as const),
      ...activeTarget.decision.outputs.map(o => [o.id, o] as const)
    ]).values()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header with Version Selectors */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 border border-purple-200/80 dark:border-purple-800/80 flex items-center justify-center shadow-xs">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>So Sánh Phiên Bản Bảng Quyết Định (DMN Version Diff)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {activeBase.decisionKey}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Đối chiếu trực quan điều kiện FEEL, kết quả đầu ra và sự thay đổi logic giữa hai mốc thời gian
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Version Switchers & Diff Metrics Ribbon */}
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center justify-between flex-wrap gap-4">
          {/* Comparison Pair Selectors */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Bản Gốc (Base):</span>
              <select
                value={selectedBaseId}
                onChange={(e) => setSelectedBaseId(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none"
              >
                {allVersions.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.versionTag} {v.isCurrent ? '(Hiện Tại)' : ''} – {new Date(v.createdAt).toLocaleDateString('vi-VN')}
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400" />

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Bản Đối Chiếu (Target):</span>
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-300 cursor-pointer focus:outline-none"
              >
                {allVersions.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.versionTag} {v.isCurrent ? '(Hiện Tại)' : ''} – {new Date(v.createdAt).toLocaleDateString('vi-VN')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Diff Stats */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
              +{diffReport.stats.addedRulesCount} Mới
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold font-mono bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
              ~{diffReport.stats.modifiedRulesCount} Sửa đổi
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold font-mono bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/60 dark:border-rose-800">
              -{diffReport.stats.removedRulesCount} Đã xóa
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              ={diffReport.stats.unchangedRulesCount} Giữ nguyên
            </span>
          </div>
        </div>

        {/* Schema Changes Banner (if any) */}
        {(diffReport.hitPolicyChanged || diffReport.inputsAdded.length > 0 || diffReport.inputsRemoved.length > 0 || diffReport.outputsAdded.length > 0 || diffReport.outputsRemoved.length > 0) && (
          <div className="px-5 py-2.5 bg-purple-50/70 dark:bg-purple-950/30 border-b border-purple-200/60 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span className="font-bold">Thay Đổi Cấu Trúc (Schema Changes):</span>
              {diffReport.hitPolicyChanged && (
                <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-purple-300 text-[11px]">
                  Hit Policy: <strong className="line-through text-slate-400">{diffReport.baseHitPolicy}</strong> ➔ <strong className="text-emerald-600">{diffReport.targetHitPolicy}</strong>
                </span>
              )}
              {diffReport.inputsAdded.length > 0 && (
                <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 text-[11px]">
                  + Cột Input: {diffReport.inputsAdded.map(i => i.label).join(', ')}
                </span>
              )}
              {diffReport.inputsRemoved.length > 0 && (
                <span className="font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-300 text-[11px]">
                  - Xóa Input: {diffReport.inputsRemoved.map(i => i.label).join(', ')}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rules Diff Table */}
        <div className="flex-1 overflow-auto p-4 bg-slate-100/50 dark:bg-slate-950/40">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-[10.5px] uppercase font-bold text-slate-600 dark:text-slate-300">
                  <th className="py-2.5 px-3 w-14 text-center">Trạng Thái</th>
                  <th className="py-2.5 px-3 w-12 text-center">Dòng</th>
                  
                  {/* Inputs */}
                  {allInputs.map(inp => (
                    <th key={inp.id} className="py-2.5 px-3 bg-sky-50/50 dark:bg-sky-950/20 text-sky-800 dark:text-sky-300 border-l border-slate-200 dark:border-slate-800">
                      <div>
                        <span>{inp.label}</span>
                        <span className="block text-[9.5px] font-mono text-slate-400 font-normal">({inp.expression})</span>
                      </div>
                    </th>
                  ))}

                  {/* Outputs */}
                  {allOutputs.map(out => (
                    <th key={out.id} className="py-2.5 px-3 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-l border-slate-200 dark:border-slate-800">
                      <div>
                        <span>{out.label}</span>
                        <span className="block text-[9.5px] font-mono text-slate-400 font-normal">({out.name})</span>
                      </div>
                    </th>
                  ))}

                  <th className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-800">Ghi Chú Nghiệp Vụ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {diffReport.rulesDiff.map((diffItem, idx) => {
                  const isAdded = diffItem.status === 'ADDED';
                  const isRemoved = diffItem.status === 'REMOVED';
                  const isModified = diffItem.status === 'MODIFIED';

                  return (
                    <tr
                      key={diffItem.ruleId || idx}
                      className={`transition-colors ${
                        isAdded
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30'
                          : isRemoved
                          ? 'bg-rose-50/60 dark:bg-rose-950/30 text-slate-400'
                          : isModified
                          ? 'bg-amber-50/40 dark:bg-amber-950/20'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Status Badge */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        {isAdded ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-600 text-white shadow-2xs">
                            + MỚI
                          </span>
                        ) : isRemoved ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-600 text-white shadow-2xs">
                            - ĐÃ XÓA
                          </span>
                        ) : isModified ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500 text-white shadow-2xs">
                            ~ SỬA
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400">
                            =
                          </span>
                        )}
                      </td>

                      {/* Rule Number */}
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500 text-xs">
                        #{diffItem.ruleNumber}
                      </td>

                      {/* Input Cells */}
                      {allInputs.map(inp => {
                        const cellDiff = diffItem.inputDiffs[inp.id];
                        if (!cellDiff) return <td key={inp.id} className="py-2.5 px-3 border-l border-slate-100 dark:border-slate-800 text-slate-300">-</td>;

                        if (isModified && cellDiff.isChanged) {
                          return (
                            <td key={inp.id} className="py-2 px-3 border-l border-slate-100 dark:border-slate-800 bg-amber-100/40 dark:bg-amber-950/50">
                              <div className="flex flex-col gap-0.5 text-[11px]">
                                <span className="line-through text-rose-600 dark:text-rose-400 font-semibold">{cellDiff.baseVal || '-'}</span>
                                <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                                  <span>➔</span> {cellDiff.targetVal || '-'}
                                </span>
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td key={inp.id} className="py-2.5 px-3 border-l border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                            <span className={isRemoved ? 'line-through text-slate-400' : ''}>
                              {isRemoved ? cellDiff.baseVal : cellDiff.targetVal || '-'}
                            </span>
                          </td>
                        );
                      })}

                      {/* Output Cells */}
                      {allOutputs.map(out => {
                        const cellDiff = diffItem.outputDiffs[out.id];
                        if (!cellDiff) return <td key={out.id} className="py-2.5 px-3 border-l border-slate-100 dark:border-slate-800 text-slate-300">-</td>;

                        if (isModified && cellDiff.isChanged) {
                          const fmtBase = typeof cellDiff.baseVal === 'number' ? cellDiff.baseVal.toLocaleString() : String(cellDiff.baseVal);
                          const fmtTarget = typeof cellDiff.targetVal === 'number' ? cellDiff.targetVal.toLocaleString() : String(cellDiff.targetVal);

                          return (
                            <td key={out.id} className="py-2 px-3 border-l border-slate-100 dark:border-slate-800 bg-amber-100/40 dark:bg-amber-950/50 font-bold">
                              <div className="flex flex-col gap-0.5 text-[11px]">
                                <span className="line-through text-rose-600 dark:text-rose-400">{fmtBase || '-'}</span>
                                <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-extrabold">
                                  <span>➔</span> {fmtTarget || '-'}
                                </span>
                              </div>
                            </td>
                          );
                        }

                        const rawVal = isRemoved ? cellDiff.baseVal : cellDiff.targetVal;
                        const fmtVal = typeof rawVal === 'number' ? rawVal.toLocaleString() : String(rawVal ?? '-');

                        return (
                          <td key={out.id} className="py-2.5 px-3 border-l border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                            <span className={isRemoved ? 'line-through text-slate-400' : ''}>
                              {fmtVal}
                            </span>
                          </td>
                        );
                      })}

                      {/* Annotation */}
                      <td className="py-2.5 px-3 border-l border-slate-100 dark:border-slate-800 text-[11px] font-sans text-slate-500 italic">
                        {isModified && diffItem.annotationDiff?.isChanged ? (
                          <div className="space-y-0.5">
                            <p className="line-through text-rose-500/80">&quot;{diffItem.annotationDiff.baseVal}&quot;</p>
                            <p className="text-emerald-700 dark:text-emerald-300 font-semibold">&quot;{diffItem.annotationDiff.targetVal}&quot;</p>
                          </div>
                        ) : (
                          <span>
                            {isRemoved ? diffItem.annotationDiff?.baseVal : diffItem.annotationDiff?.targetVal || '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer with Revert Action */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold">Mẹo:</span>
            <span>Bạn có thể khôi phục lại bảng quyết định về bản gốc <strong>{activeBase.versionTag}</strong> bất kỳ lúc nào mà không làm mất dữ liệu hiện tại.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Đóng
            </button>

            {!activeBase.isCurrent && (
              <button
                onClick={() => {
                  onRevertToVersion(activeBase);
                  onClose();
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-[0.98]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi Phục Về Phiên Bản {activeBase.versionTag}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
