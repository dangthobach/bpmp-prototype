import React from 'react';
import { DMNVersionSnapshot } from '../../types/dmn';
import { X, RotateCcw, Clock, User, Eye, Table } from 'lucide-react';

interface DmnVersionInspectModalProps {
  version: DMNVersionSnapshot | null;
  onClose: () => void;
  onRevert: (version: DMNVersionSnapshot) => void;
}

export const DmnVersionInspectModal: React.FC<DmnVersionInspectModalProps> = ({
  version,
  onClose,
  onRevert
}) => {
  if (!version) return null;

  const { decision } = version;
  const formattedDate = new Date(version.createdAt).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[88vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 border border-purple-200/80 dark:border-purple-800/80 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Chi Tiết Phiên Bản {version.versionTag}
                </h3>
                {version.isCurrent && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white uppercase">
                    Hiện Tại
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {decision.name} &bull; Hit Policy: <strong className="font-mono text-purple-600">{decision.hitPolicy}</strong>
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

        {/* Metadata info */}
        <div className="p-3.5 bg-slate-100/60 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-slate-700 dark:text-slate-300">Ghi chú commit:</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">&quot;{version.summary}&quot;</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {version.author.name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formattedDate}
            </span>
            <span className="font-mono bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
              {decision.rules.length} quy tắc
            </span>
          </div>
        </div>

        {/* Read-Only Table */}
        <div className="flex-1 overflow-auto p-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-[10.5px] uppercase font-bold text-slate-600 dark:text-slate-300">
                  <th className="py-2.5 px-3 w-12 text-center font-mono">#</th>
                  {decision.inputs.map(inp => (
                    <th key={inp.id} className="py-2.5 px-3 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-l border-slate-200 dark:border-slate-800">
                      {inp.label}
                    </th>
                  ))}
                  {decision.outputs.map(out => (
                    <th key={out.id} className="py-2.5 px-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-l border-slate-200 dark:border-slate-800">
                      {out.label}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-800">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                {decision.rules.map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                      #{rule.ruleNumber}
                    </td>
                    {decision.inputs.map(inp => (
                      <td key={inp.id} className="py-2.5 px-3 border-l border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                        {rule.inputEntries[inp.id] || '-'}
                      </td>
                    ))}
                    {decision.outputs.map(out => {
                      const val = rule.outputEntries[out.id];
                      return (
                        <td key={out.id} className="py-2.5 px-3 border-l border-slate-100 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                          {typeof val === 'number' ? val.toLocaleString() : String(val ?? '-')}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 border-l border-slate-100 dark:border-slate-800 text-[11px] font-sans text-slate-500 italic">
                      {rule.annotation || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <span className="text-xs text-slate-400">Chế độ xem tĩnh (Read-only Snapshot)</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Đóng
            </button>
            {!version.isCurrent && (
              <button
                onClick={() => {
                  onRevert(version);
                  onClose();
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi Phục Bản Này ({version.versionTag})</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
