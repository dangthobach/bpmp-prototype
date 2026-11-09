/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ModelerModule } from './components/modeler/ModelerModule';
import { OperationModule } from './components/operation/OperationModule';
import { OptimizeModule } from './components/optimize/OptimizeModule';
import { IdentityModule } from './components/identity/IdentityModule';
import { TaskManagementModule } from './components/task-management/TaskManagementModule';
import { TasklistModule } from './components/tasklist/TasklistModule';
import { FoundationModule } from './components/foundation/FoundationModule';
import { EndpointsModal } from './components/foundation/EndpointsModal';
import { ClientPortalModule } from './components/portal/ClientPortalModule';
import { 
  ProcessDefinition, 
  ProcessInstance, 
  TaskItem 
} from './types/bpm';
import { 
  INITIAL_PROCESS_DEFINITIONS, 
  INITIAL_INSTANCES 
} from './data/mockBpmData';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeWorkspace, setActiveWorkspace] = useState<'client-portal' | 'admin-console'>('client-portal');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [tenantName, setTenantName] = useState<string>('ecmbpm');
  const [currentModule, setCurrentModule] = useState<string>('modeler');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [showEndpointsModal, setShowEndpointsModal] = useState<boolean>(false);

  // Core Data
  const [processes, setProcesses] = useState<ProcessDefinition[]>(INITIAL_PROCESS_DEFINITIONS);
  const [selectedProcessKey, setSelectedProcessKey] = useState<string>('SDD');
  const [instances, setInstances] = useState<ProcessInstance[]>(INITIAL_INSTANCES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentProcess = processes.find(p => p.key === selectedProcessKey) || processes[0];

  const handleUpdateProcess = (updated: ProcessDefinition) => {
    setProcesses(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeployToEngine = (engine: 'Camunda' | 'Flowable') => {
    showNotification(`Quy trình "${currentProcess.name}" đã được biên dịch và deploy thành công lên ${engine} Engine!`);
    const updated = {
      ...currentProcess,
      version: currentProcess.version + 1,
      status: 'deployed' as const,
      engine,
    };
    handleUpdateProcess(updated);
  };

  const handleTaskCompleted = (task: TaskItem, decision: 'APPROVE' | 'REJECT' | 'SENDBACK') => {
    // Find instance and advance step
    setInstances(prev => prev.map(inst => {
      if (inst.id === task.instanceId) {
        if (decision === 'APPROVE') {
          return {
            ...inst,
            currentStep: 'HOAN THANH',
            status: 'COMPLETED' as const,
            completedAt: '19/05/2026 15:10:00'
          };
        } else if (decision === 'REJECT') {
          return {
            ...inst,
            currentStep: 'TU CHOI',
            status: 'CANCELED' as const,
            completedAt: '19/05/2026 15:10:00'
          };
        } else {
          return {
            ...inst,
            currentStep: 'CHO BO SUNG HO SO TU FRONT END',
            status: 'ACTIVATED' as const
          };
        }
      }
      return inst;
    }));
  };

  const handleRegisterCustomWorkflow = (newProc: ProcessDefinition) => {
    setProcesses(prev => [newProc, ...prev]);
    setSelectedProcessKey(newProc.key);
    showNotification(`Đã tạo quy trình mới "${newProc.name}" (${newProc.key})!`);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 bg-slate-900/90 dark:bg-slate-800/95 text-white backdrop-blur-md px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700/60 ring-2 ring-emerald-500/20 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Collapsible Navigation Sidebar */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={(mod) => {
          if (mod === 'client-portal') {
            setActiveWorkspace('client-portal');
          } else {
            setActiveWorkspace('admin-console');
            setCurrentModule(mod);
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        tenantName={tenantName}
        onOpenEndpointsModal={() => setShowEndpointsModal(true)}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={setActiveWorkspace}
      />

      {/* Main Application Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header with Breadcrumbs, Tenant, Dark mode */}
        <Header
          currentModule={currentModule}
          processKey={selectedProcessKey}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          tenantName={tenantName}
          onSelectTenant={(t) => {
            setTenantName(t);
            showNotification(`Đã chuyển đổi ngữ cảnh sang tenant: ${t}`);
          }}
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={setActiveWorkspace}
        />

        {/* Viewport Render based on active workspace & module */}
        <main className="flex-1 flex overflow-hidden">
          {activeWorkspace === 'client-portal' ? (
            <ClientPortalModule
              onNotify={showNotification}
              onOpenAdminConsole={() => setActiveWorkspace('admin-console')}
              processes={processes}
              onProcessInstanceCreated={(newInstance) => {
                setInstances(prev => [newInstance, ...prev]);
                showNotification(`Đã tạo tiến trình BPM Core: ${newInstance.recordCode} (${newInstance.processName})`);
              }}
            />
          ) : (
            <>
              {currentModule === 'modeler' && (
                <ModelerModule
                  currentProcess={currentProcess}
                  onUpdateProcess={handleUpdateProcess}
                  processes={processes}
                  onSelectProcess={setSelectedProcessKey}
                  onDeployToEngine={handleDeployToEngine}
                />
              )}

              {currentModule === 'operation' && (
                <OperationModule
                  currentProcess={currentProcess}
                  instances={instances}
                  onUpdateInstances={setInstances}
                  onSelectProcess={setSelectedProcessKey}
                />
              )}

              {currentModule === 'optimize' && (
                <OptimizeModule
                  processes={processes}
                  currentProcess={currentProcess}
                />
              )}

              {currentModule === 'identity' && (
                <IdentityModule />
              )}

              {currentModule === 'task-management' && (
                <TaskManagementModule />
              )}

              {currentModule === 'tasklist' && (
                <TasklistModule
                  currentUsername="tambv"
                  onTaskCompleted={handleTaskCompleted}
                />
              )}

              {currentModule === 'foundation' && (
                <FoundationModule
                  onRegisterCustomWorkflow={handleRegisterCustomWorkflow}
                  onOpenEndpointsModal={() => setShowEndpointsModal(true)}
                  onNavigateToModeler={(key) => {
                    setSelectedProcessKey(key);
                    setCurrentModule('modeler');
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Source System Endpoints Modal */}
      <EndpointsModal
        isOpen={showEndpointsModal}
        onClose={() => setShowEndpointsModal(false)}
      />
    </div>
  );
}
