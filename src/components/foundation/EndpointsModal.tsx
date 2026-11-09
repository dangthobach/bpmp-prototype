import React, { useState } from 'react';
import { EndpointConfig } from '../../types/bpm';
import { INITIAL_ENDPOINTS } from '../../data/mockBpmData';
import { 
  Radio, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface EndpointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EndpointsModal: React.FC<EndpointsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [endpoints, setEndpoints] = useState<EndpointConfig[]>(INITIAL_ENDPOINTS);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingEp, setEditingEp] = useState<EndpointConfig | null>(null);

  // Form fields
  const [serviceName, setServiceName] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('Task View');
  const [endpointUrl, setEndpointUrl] = useState<string>('');
  const [httpMethod, setHttpMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [authType, setAuthType] = useState<'NONE' | 'BEARER' | 'BASIC' | 'OAUTH2'>('NONE');

  if (!isOpen) return null;

  const handleSaveEndpoint = () => {
    if (!serviceName || !endpointUrl) return;
    if (editingEp) {
      setEndpoints(endpoints.map(ep => ep.id === editingEp.id ? {
        ...editingEp,
        serviceName,
        serviceType,
        endpointUrl,
        httpMethod,
        authType,
      } : ep));
      setEditingEp(null);
    } else {
      const newEp: EndpointConfig = {
        id: `ep_${Date.now()}`,
        serviceName,
        serviceType,
        endpointUrl,
        httpMethod,
        authType,
        active: true,
      };
      setEndpoints([...endpoints, newEp]);
      setShowAddModal(false);
    }
    setServiceName('');
    setEndpointUrl('');
  };

  const handleDelete = (id: string) => {
    setEndpoints(endpoints.filter(e => e.id !== id));
  };

  const handleStartEdit = (ep: EndpointConfig) => {
    setEditingEp(ep);
    setServiceName(ep.serviceName);
    setServiceType(ep.serviceType);
    setEndpointUrl(ep.endpointUrl);
    setHttpMethod(ep.httpMethod);
    setAuthType(ep.authType);
    setShowAddModal(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header matching image_7898a8a8.png */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Source System Endpoints
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            ✕
          </button>
        </div>

        {/* Content area */}
        <div className="p-5 flex-1 overflow-auto space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setEditingEp(null);
                setServiceName('');
                setEndpointUrl('');
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Endpoint</span>
            </button>
            <span className="text-xs text-slate-500">Đăng ký API endpoints tích hợp luồng workflow ngoài</span>
          </div>

          {/* Table matching image_7898a8a8.png with green header */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-emerald-700 text-white font-semibold text-[11.5px]">
                <tr>
                  <th className="py-2.5 px-4">Service Name</th>
                  <th className="py-2.5 px-4">Service Type</th>
                  <th className="py-2.5 px-4">Endpoint URL</th>
                  <th className="py-2.5 px-4 text-center">HTTP Method</th>
                  <th className="py-2.5 px-4 text-center">Auth Type</th>
                  <th className="py-2.5 px-4 text-center">Active</th>
                  <th className="py-2.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {endpoints.map((ep) => (
                  <tr key={ep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {ep.serviceName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {ep.serviceType}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-700 dark:text-emerald-400 truncate max-w-xs" title={ep.endpointUrl}>
                      {ep.endpointUrl}
                    </td>
                    <td className="py-3 px-4 font-mono text-center font-bold">
                      {ep.httpMethod}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {ep.authType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        {ep.active ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStartEdit(ep)}
                          className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded"
                          title="Edit endpoint"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ep.id)}
                          className="p-1 text-red-500 hover:text-red-700 rounded"
                          title="Delete endpoint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination & footer matching image_7898a8a8.png */}
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <div>
              Hiển thị <strong>1 - {endpoints.length}</strong> của <strong>{endpoints.length}</strong>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <button className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-40" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="w-6 h-6 rounded bg-emerald-700 text-white font-bold text-center leading-6 text-xs">
                  1
                </span>
                <button className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-40" disabled>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <span>Số dòng:</span>
                <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs">
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Close matching image_7898a8a8.png */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
          >
            Close
          </button>
        </div>
      </div>

      {/* Add / Edit Endpoint Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {editingEp ? 'Chỉnh Sửa Endpoint' : 'Thêm Endpoint Mới'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Service Name</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. TradeFinance View"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-semibold"
                >
                  <option value="Task View">Task View</option>
                  <option value="Rest Hook">Rest Hook</option>
                  <option value="Kafka Producer">Kafka Producer</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Endpoint URL</label>
                <input
                  type="text"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  placeholder="https://ecm.aws.ecmbpm.vn/api/..."
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">HTTP Method</label>
                  <select
                    value={httpMethod}
                    onChange={(e) => setHttpMethod(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-semibold"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Auth Type</label>
                  <select
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-semibold"
                  >
                    <option value="NONE">NONE</option>
                    <option value="BEARER">BEARER TOKEN</option>
                    <option value="BASIC">BASIC AUTH</option>
                    <option value="OAUTH2">OAUTH2</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/60">
              <button onClick={() => setShowAddModal(false)} className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold">
                Hủy
              </button>
              <button onClick={handleSaveEndpoint} className="px-4 py-1.5 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800">
                Lưu Endpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
