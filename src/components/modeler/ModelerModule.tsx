import React, { useState, useEffect } from 'react';
import { 
  ProcessDefinition, 
  BPMNNode, 
  BPMNEdge, 
  BPMNodeType,
  BPMNLaneDefinition,
  BPMNPoolDefinition 
} from '../../types/bpm';
import { ModelerPalette } from './ModelerPalette';
import { ModelerPropertiesPanel } from './ModelerPropertiesPanel';
import { generateBpmnXml } from './bpmnXmlGenerator';
import { DmnTableModule } from './DmnTableModule';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Upload, 
  Send, 
  Layers, 
  Plus, 
  Check, 
  FileCode, 
  Sliders, 
  Settings, 
  Radio, 
  HelpCircle,
  Eye,
  Minimize2,
  Maximize2,
  ChevronDown,
  ChevronRight,
  Move,
  MousePointer,
  Link2,
  Square,
  Circle,
  Database,
  FileText,
  User,
  Cpu,
  Table,
  Code,
  Mail,
  Diamond,
  AlertTriangle,
  Zap,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Columns
} from 'lucide-react';

interface ModelerModuleProps {
  currentProcess: ProcessDefinition;
  onUpdateProcess: (updated: ProcessDefinition) => void;
  processes: ProcessDefinition[];
  onSelectProcess: (key: string) => void;
  onDeployToEngine: (engine: 'Camunda' | 'Flowable') => void;
}

// Default Pools and Swimlanes representing banking participants
const DEFAULT_POOLS: BPMNPoolDefinition[] = [
  {
    id: 'pool_customer',
    name: 'KHÁCH HÀNG DOANH NGHIỆP & CHUỖI CUNG ỨNG (EXTERNAL PARTICIPANT)',
    participantRef: 'Participant_Customer',
    x: 40,
    y: 40,
    width: 1400,
    height: 120,
    lanes: [
      { 
        id: 'lane_portal', 
        name: 'Cổng Tự Phục Vụ (SME Portal / Mobile App)', 
        actorRole: 'CUSTOMER_SME', 
        actorType: 'EXTERNAL', 
        color: '#f8fafc',
        y: 40, 
        height: 120 
      }
    ]
  },
  {
    id: 'pool_bank',
    name: 'NGÂN HÀNG – KHỐI TÍN DỤNG & VẬN HÀNH (CAMUNDA 8 ZEEBE & FLOWABLE)',
    participantRef: 'Participant_Bank',
    x: 40,
    y: 190,
    width: 1400,
    height: 820,
    lanes: [
      { 
        id: 'lane_sales', 
        name: '1. Cán Bộ Bán Hàng & Tiếp Nhận (RM / Sales)', 
        actorRole: 'NCLOS SALE', 
        actorType: 'HUMAN', 
        color: '#f0fdf4',
        y: 190, 
        height: 180 
      },
      { 
        id: 'lane_underwriting', 
        name: '2. Thẩm Định & Kiểm Soát Hồ Sơ (Underwriter / KSV)', 
        actorRole: 'NCLOS B CO', 
        actorType: 'HUMAN', 
        color: '#f8fafc',
        y: 370, 
        height: 250 
      },
      { 
        id: 'lane_approver', 
        name: '3. Cấp Phê Duyệt / Ban Tín Dụng (Credit Approver)', 
        actorRole: 'NCLOS CA', 
        actorType: 'HUMAN', 
        color: '#f0f9ff',
        y: 620, 
        height: 190 
      },
      { 
        id: 'lane_automated', 
        name: '4. Tự Động Hóa Core Banking (Zeebe Job Workers / STP)', 
        actorRole: 'ZEEBE_WORKER', 
        actorType: 'SYSTEM', 
        color: '#faf5ff',
        y: 810, 
        height: 200 
      }
    ]
  }
];

export const ModelerModule: React.FC<ModelerModuleProps> = ({
  currentProcess,
  onUpdateProcess,
  processes,
  onSelectProcess,
  onDeployToEngine,
}) => {
  // Selection and Canvas State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [tokenSimActive, setTokenSimActive] = useState<boolean>(false);
  const [simStepIndex, setSimStepIndex] = useState<number>(0);
  const [simPlaying, setSimPlaying] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [activeTool, setActiveTool] = useState<'select' | 'pan' | 'connect'>('select');
  const [isPaletteExpanded, setIsPaletteExpanded] = useState<boolean>(true);
  const [canvasOffset, setCanvasOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // XML modal state
  const [showXmlModal, setShowXmlModal] = useState<boolean>(false);
  const [xmlContent, setXmlContent] = useState<string>('');
  const [showDeployModal, setShowDeployModal] = useState<boolean>(false);
  const [targetEngine, setTargetEngine] = useState<'Camunda' | 'Flowable'>(currentProcess.engine || 'Camunda');
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Modeler Mode: BPMN 2.0 vs DMN 1.3
  const [activeModelerMode, setActiveModelerMode] = useState<'bpmn' | 'dmn'>('bpmn');
  const [activeDmnKey, setActiveDmnKey] = useState<string>('creditScoreDMN');

  // Pools & Lanes
  const pools = currentProcess.pools || DEFAULT_POOLS;
  const allLanes: BPMNLaneDefinition[] = pools.flatMap(p => p.lanes);

  // Simulation execution paths
  const simulationPath = currentProcess.nodes.map(n => n.id);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (tokenSimActive && simPlaying) {
      timer = setInterval(() => {
        setSimStepIndex((prev) => (prev + 1) % simulationPath.length);
      }, 1600);
    }
    return () => clearInterval(timer);
  }, [tokenSimActive, simPlaying, simulationPath.length]);

  const selectedNode = currentProcess.nodes.find(n => n.id === selectedNodeId) || null;

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  // Node Dragging simulation
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDownNode = (e: React.MouseEvent, node: BPMNNode) => {
    e.stopPropagation();
    if (activeTool === 'connect' && connectingSourceId) {
      // Create Sequence Flow Edge between source and target
      if (connectingSourceId !== node.id) {
        const newEdge: BPMNEdge = {
          id: `e_${Date.now()}`,
          source: connectingSourceId,
          target: node.id,
          label: 'Sequence Flow'
        };
        onUpdateProcess({ ...currentProcess, edges: [...currentProcess.edges, newEdge] });
        showToast(`Đã nối luồng Sequence Flow từ ${connectingSourceId} tới ${node.id}`);
      }
      setConnectingSourceId(null);
      setActiveTool('select');
      return;
    }

    setSelectedNodeId(node.id);
    if (activeTool === 'select') {
      setDraggingNodeId(node.id);
      setDragOffset({
        x: e.clientX - node.x * zoomLevel,
        y: e.clientY - node.y * zoomLevel,
      });
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (!draggingNodeId) return;
    const newX = Math.max(20, Math.round((e.clientX - dragOffset.x) / zoomLevel));
    const newY = Math.max(20, Math.round((e.clientY - dragOffset.y) / zoomLevel));

    // Determine Lane ID based on new Y coordinate
    let detectedLaneId: string | undefined = undefined;
    let detectedActor: string | undefined = undefined;
    for (const lane of allLanes) {
      if (newY >= lane.y && newY < lane.y + lane.height) {
        detectedLaneId = lane.id;
        detectedActor = lane.name;
        break;
      }
    }

    const updated = currentProcess.nodes.map(n => {
      if (n.id === draggingNodeId) {
        return { 
          ...n, 
          x: newX, 
          y: newY,
          laneId: detectedLaneId || n.laneId,
          actorName: detectedActor || n.actorName
        };
      }
      return n;
    });
    onUpdateProcess({ ...currentProcess, nodes: updated });
  };

  const handleMouseUpCanvas = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'pan' || e.button === 1) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - canvasOffset.x,
        y: e.clientY - canvasOffset.y
      });
    } else {
      setSelectedNodeId(null);
      setConnectingSourceId(null);
    }
  };

  // Add node from Palette
  const handleAddPaletteNode = (item: any) => {
    const newNode: BPMNNode = {
      id: `${item.type}_${Date.now().toString().slice(-5)}`,
      name: item.defaultProps.name || item.label.toUpperCase(),
      type: item.type,
      x: 240 + (currentProcess.nodes.length % 5) * 50,
      y: 220 + (currentProcess.nodes.length % 4) * 60,
      width: item.defaultProps.width || 100,
      height: item.defaultProps.height || 50,
      ...item.defaultProps,
      laneId: 'lane_sales',
      actorName: 'Cán Bộ Bán Hàng (RM / Sales)'
    };
    onUpdateProcess({ ...currentProcess, nodes: [...currentProcess.nodes, newNode] });
    setSelectedNodeId(newNode.id);
    showToast(`Đã thêm thành phần [${item.label}] theo chuẩn Camunda 8`);
  };

  // Quick Context Pad Actions on Node
  const handleAppendNode = (fromNode: BPMNNode, type: BPMNodeType, name: string) => {
    const newNodeId = `${type}_${Date.now().toString().slice(-5)}`;
    const newNode: BPMNNode = {
      id: newNodeId,
      name: name,
      type: type,
      x: fromNode.x + fromNode.width + 80,
      y: fromNode.y,
      width: type.includes('Gateway') || type.includes('Event') ? 36 : 110,
      height: type.includes('Gateway') || type.includes('Event') ? 36 : 50,
      laneId: fromNode.laneId,
      assigneeRole: fromNode.assigneeRole || 'NCLOS B CO',
      slaHours: 4
    };

    const newEdge: BPMNEdge = {
      id: `e_${Date.now()}`,
      source: fromNode.id,
      target: newNodeId,
      label: ''
    };

    onUpdateProcess({
      ...currentProcess,
      nodes: [...currentProcess.nodes, newNode],
      edges: [...currentProcess.edges, newEdge]
    });
    setSelectedNodeId(newNodeId);
  };

  const handleDeleteNode = (nodeId: string) => {
    const updatedNodes = currentProcess.nodes.filter(n => n.id !== nodeId);
    const updatedEdges = currentProcess.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    onUpdateProcess({ ...currentProcess, nodes: updatedNodes, edges: updatedEdges });
    setSelectedNodeId(null);
    showToast('Đã xóa thành phần khỏi BPMN canvas.');
  };

  const handleOpenXmlModal = () => {
    const xml = generateBpmnXml(currentProcess);
    setXmlContent(xml);
    setShowXmlModal(true);
  };

  // Node Rendering Helpers
  const getNodeFill = (type: BPMNodeType) => {
    if (type === 'userTask') return '#ffffff';
    if (type === 'serviceTask') return '#faf5ff';
    if (type === 'businessRuleTask') return '#fffbeb';
    if (type === 'scriptTask') return '#f0fdf4';
    if (type === 'sendTask' || type === 'receiveTask') return '#f0f9ff';
    if (type === 'callActivity') return '#ffffff';
    return '#ffffff';
  };

  const getNodeStroke = (type: BPMNodeType, isSelected: boolean) => {
    if (isSelected) return '#10b981';
    if (type === 'serviceTask') return '#9333ea';
    if (type === 'businessRuleTask') return '#d97706';
    if (type === 'callActivity') return '#4f46e5';
    if (type.includes('Event') && (type.includes('terminate') || type.includes('error'))) return '#dc2626';
    return '#334155';
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-white dark:bg-slate-900 select-none">
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed top-4 right-1/2 translate-x-1/2 z-60 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Top Application Bar with Process Meta, Mode Switcher & Controls */}
      <div className="h-12 border-b border-slate-200/80 dark:border-slate-800/80 px-4 flex items-center justify-between text-xs bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Mode Switcher: BPMN vs DMN */}
          <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <button
              onClick={() => setActiveModelerMode('bpmn')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeModelerMode === 'bpmn'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quy Trình BPMN 2.0</span>
            </button>

            <button
              onClick={() => setActiveModelerMode('dmn')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeModelerMode === 'dmn'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-amber-500" />
              <span>Luật Nghiệp Vụ DMN 1.3</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:border-slate-700 hidden sm:block" />

          {/* Version Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-medium">Phiên bản:</span>
            <select 
              value={currentProcess.version}
              onChange={() => {}}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-1 font-semibold text-slate-800 dark:text-slate-200 text-xs shadow-2xs focus:outline-none"
            >
              <option value={currentProcess.version}>Version {currentProcess.version}.0 (Latest)</option>
              <option value={1}>Version 1.0</option>
            </select>
          </div>

          {/* Target Engine Badge with Spec */}
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-medium">Động cơ:</span>
            <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {currentProcess.engine === 'Camunda' ? 'Camunda 8 (Zeebe)' : 'Flowable 7.0'}
            </span>
          </div>
        </div>

        {/* Action Controls for BPMN Mode */}
        {activeModelerMode === 'bpmn' && (
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.1))}
                className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
                title="Thu nhỏ"
              >
                -
              </button>
              <span className="px-1.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
                className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
                title="Phóng to"
              >
                +
              </button>
              <button
                onClick={() => { setZoomLevel(1); setCanvasOffset({ x: 0, y: 0 }); }}
                className="px-1.5 py-1 text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer border-l border-slate-200 dark:border-slate-700"
                title="Khôi phục 100%"
              >
                Reset
              </button>
            </div>

            {/* Deploy to Engine Button */}
            <button
              onClick={() => setShowDeployModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Deploy to Engine</span>
            </button>

            {/* BPMN XML Viewer/Editor */}
            <button
              onClick={handleOpenXmlModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
              title="Xem và kết xuất chuẩn BPMN 2.0 XML"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-400" />
              <span>BPMN XML</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Mode View: DMN Table vs BPMN Workspace */}
      {activeModelerMode === 'dmn' ? (
        <DmnTableModule 
          initialDecisionKey={activeDmnKey} 
          onDeployDecision={(dec) => {
            showToast(`Đã triển khai bảng quyết định DMN [${dec.name}] thành công!`);
          }}
        />
      ) : (
        /* BPMN Workspace (Palette + Canvas + Properties Panel) */
        <div className="flex-1 flex overflow-hidden relative">
          {/* Full-featured Camunda 8 / Flowable Palette */}
          <ModelerPalette
            onAddNode={handleAddPaletteNode}
            isExpanded={isPaletteExpanded}
            onToggleExpand={() => setIsPaletteExpanded(!isPaletteExpanded)}
          />

          {/* Central Canvas Viewport */}
          <div 
            className="flex-1 bg-slate-100/60 dark:bg-slate-950/70 overflow-hidden relative cursor-default"
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
          onMouseDown={handleCanvasMouseDown}
        >
          {/* Subtle BPMN dot grid */}
          <div 
            className="absolute inset-0 opacity-25 dark:opacity-10 pointer-events-none" 
            style={{
              backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Floating Canvas Tool strip (Select, Pan, Global Connect, Token Sim) */}
          <div className="absolute top-3 left-4 z-20 flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md text-xs">
            <button
              onClick={() => { setActiveTool('select'); setConnectingSourceId(null); }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTool === 'select' ? 'bg-slate-100 dark:bg-slate-700 text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Hand / Select Tool (V)"
            >
              <MousePointer className="w-4 h-4" />
            </button>

            <button
              onClick={() => { setActiveTool('pan'); setConnectingSourceId(null); }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTool === 'pan' ? 'bg-slate-100 dark:bg-slate-700 text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Pan Canvas Tool (Space)"
            >
              <Move className="w-4 h-4" />
            </button>

            <button
              onClick={() => { setActiveTool('connect'); showToast('Chọn node nguồn, sau đó nhấp node đích để nối Sequence Flow'); }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTool === 'connect' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold ring-1 ring-emerald-500' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Global Connect Tool (Nối Sequence Flow)"
            >
              <Link2 className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

            {/* Token Simulation toggle */}
            <button
              onClick={() => {
                setTokenSimActive(!tokenSimActive);
                if (!tokenSimActive) setSimPlaying(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
                tokenSimActive 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Bật/Tắt mô phỏng luồng token BPMN"
            >
              <span className="font-mono">Token Sim</span>
              {tokenSimActive && <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />}
            </button>

            {tokenSimActive && (
              <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setSimPlaying(!simPlaying)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
                  title={simPlaying ? 'Tạm dừng' : 'Chạy tiếp'}
                >
                  {simPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setSimStepIndex(0)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
                  title="Khởi động lại mô phỏng"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Minimap toggle button */}
          <div className="absolute top-3 right-4 z-20">
            <button
              onClick={() => setShowMinimap(!showMinimap)}
              className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              {showMinimap ? 'Ẩn Minimap' : 'Hiện Minimap'}
            </button>
          </div>

          {/* Floating Minimap View */}
          {showMinimap && (
            <div className="absolute bottom-6 right-4 z-20 w-48 h-36 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-lg p-2 pointer-events-none">
              <div className="text-[9px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                <span>MINIMAP OVERVIEW</span>
                <span className="font-mono text-[8.5px]">{currentProcess.nodes.length} nodes</span>
              </div>
              <svg className="w-full h-28 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800">
                {pools.map(p => (
                  <rect key={p.id} x={p.x * 0.1} y={p.y * 0.1} width={p.width * 0.1} height={p.height * 0.1} fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                ))}
                {currentProcess.nodes.map(n => (
                  <rect
                    key={n.id}
                    x={n.x * 0.1}
                    y={n.y * 0.1}
                    width={n.width * 0.1}
                    height={n.height * 0.1}
                    fill={n.type.includes('Task') ? '#10b981' : n.type.includes('Gateway') ? '#f59e0b' : '#64748b'}
                    opacity={0.8}
                  />
                ))}
              </svg>
            </div>
          )}

          {/* Interactive SVG BPMN Canvas */}
          <div 
            className="w-full h-full overflow-auto relative"
            style={{ cursor: activeTool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
          >
            <svg 
              className="w-[2000px] h-[1300px]" 
              style={{ 
                transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoomLevel})`, 
                transformOrigin: 'top left' 
              }}
            >
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
                </marker>
                <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
                </marker>
              </defs>

              {/* ======================================================= */}
              {/* 1. DRAW PARTICIPANTS / POOLS & SWIMLANES (TÁC NHÂN)     */}
              {/* ======================================================= */}
              <g id="pools-lanes-layer">
                {pools.map(pool => (
                  <g key={pool.id} className="select-none">
                    {/* Pool Outer Box */}
                    <rect
                      x={pool.x}
                      y={pool.y}
                      width={pool.width}
                      height={pool.height}
                      fill="#ffffff"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      className="dark:fill-slate-900 dark:stroke-slate-700"
                    />
                    {/* Pool Header Label (Vertical Orientation) */}
                    <rect
                      x={pool.x}
                      y={pool.y}
                      width="34"
                      height={pool.height}
                      fill="#f1f5f9"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                      className="dark:fill-slate-800 dark:stroke-slate-700"
                    />
                    <text
                      x={pool.x + 22}
                      y={pool.y + pool.height / 2}
                      fontSize="11"
                      fill="#334155"
                      fontWeight="bold"
                      textAnchor="middle"
                      transform={`rotate(-90 ${pool.x + 22} ${pool.y + pool.height / 2})`}
                      className="dark:fill-slate-300 tracking-wider"
                    >
                      {pool.name}
                    </text>

                    {/* Swimlanes within Pool */}
                    {pool.lanes.map((lane, lIdx) => (
                      <g key={lane.id}>
                        {/* Lane Row Line */}
                        {lIdx > 0 && (
                          <line
                            x1={pool.x + 34}
                            y1={lane.y}
                            x2={pool.x + pool.width}
                            y2={lane.y}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                            strokeDasharray="4 2"
                            className="dark:stroke-slate-700"
                          />
                        )}
                        {/* Lane Header Bar (Vertical) */}
                        <rect
                          x={pool.x + 34}
                          y={lane.y}
                          width="28"
                          height={lane.height}
                          fill={lane.color || '#f8fafc'}
                          stroke="#cbd5e1"
                          strokeWidth="1"
                          className="dark:fill-slate-850 dark:stroke-slate-700"
                        />
                        <text
                          x={pool.x + 48}
                          y={lane.y + lane.height / 2}
                          fontSize="9.5"
                          fill="#475569"
                          fontWeight="600"
                          textAnchor="middle"
                          transform={`rotate(-90 ${pool.x + 48} ${lane.y + lane.height / 2})`}
                          className="dark:fill-slate-400"
                        >
                          {lane.name}
                        </text>
                      </g>
                    ))}
                  </g>
                ))}
              </g>

              {/* ======================================================= */}
              {/* 2. DRAW SEQUENCE FLOW EDGES                              */}
              {/* ======================================================= */}
              <g id="sequence-flows-layer">
                {currentProcess.edges.map(edge => {
                  const srcNode = currentProcess.nodes.find(n => n.id === edge.source);
                  const tgtNode = currentProcess.nodes.find(n => n.id === edge.target);
                  if (!srcNode || !tgtNode) return null;

                  const x1 = srcNode.x + srcNode.width / 2;
                  const y1 = srcNode.y + srcNode.height / 2;
                  const x2 = tgtNode.x + tgtNode.width / 2;
                  const y2 = tgtNode.y + tgtNode.height / 2;

                  // Orthogonal Manhattan step routing
                  const midX = (x1 + x2) / 2;
                  const pathD = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;

                  const isEdgeActive = tokenSimActive && (simulationPath[simStepIndex] === edge.source);

                  return (
                    <g key={edge.id} className="cursor-pointer group">
                      <path 
                        d={pathD} 
                        fill="none" 
                        stroke={isEdgeActive ? '#10b981' : '#475569'} 
                        strokeWidth={isEdgeActive ? 2.5 : 1.4}
                        markerEnd={isEdgeActive ? "url(#arrow-active)" : "url(#arrow)"} 
                        className="transition-all"
                      />
                      {edge.label && (
                        <g>
                          <rect
                            x={midX - 35}
                            y={(y1 + y2) / 2 - 12}
                            width="70"
                            height="16"
                            fill="#ffffff"
                            rx="3"
                            className="dark:fill-slate-900"
                          />
                          <text 
                            x={midX} 
                            y={(y1 + y2) / 2} 
                            fontSize="9" 
                            fill="#475569" 
                            textAnchor="middle" 
                            className="font-medium dark:fill-slate-300"
                          >
                            {edge.label}
                          </text>
                        </g>
                      )}
                      {/* Animated Token on active path */}
                      {isEdgeActive && (
                        <circle r="4" fill="#10b981">
                          <animateMotion path={pathD} dur="1.2s" repeatCount="indefinite" />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* ======================================================= */}
              {/* 3. DRAW BPMN NODES (CAMUNDA 8 & FLOWABLE CONTROLS)       */}
              {/* ======================================================= */}
              <g id="bpmn-nodes-layer">
                {currentProcess.nodes.map(node => {
                  const isSelected = selectedNodeId === node.id;
                  const isSimCurrent = tokenSimActive && simulationPath[simStepIndex] === node.id;
                  const isTask = node.type.includes('Task') || node.type === 'callActivity';
                  const isGateway = node.type.includes('Gateway');
                  const isEvent = node.type.includes('Event');

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onMouseDown={(e) => handleMouseDownNode(e, node)}
                      className="cursor-pointer group select-none"
                    >
                      {/* Selection Aura */}
                      {isSelected && (
                        <rect
                          x="-6"
                          y="-6"
                          width={node.width + 12}
                          height={node.height + 12}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          rx="6"
                        />
                      )}

                      {/* TASK SHAPE */}
                      {isTask && (
                        <g>
                          <rect
                            width={node.width}
                            height={node.height}
                            rx="8"
                            fill={getNodeFill(node.type)}
                            stroke={getNodeStroke(node.type, isSelected)}
                            strokeWidth={node.type === 'callActivity' ? '3' : isSelected ? '2' : '1.5'}
                            className="dark:fill-slate-800"
                          />

                          {/* Task Type Icon (Top Left) */}
                          {node.type === 'userTask' && (
                            <path d="M 6 8 a 3 3 0 1 0 6 0 a 3 3 0 0 0 -6 0 M 4 17 a 5 5 0 0 1 10 0" fill="none" stroke="#0284c7" strokeWidth="1.2" />
                          )}
                          {node.type === 'serviceTask' && (
                            <circle cx="10" cy="11" r="4" fill="none" stroke="#9333ea" strokeWidth="1.4" strokeDasharray="2 1" />
                          )}
                          {node.type === 'businessRuleTask' && (
                            <rect x="6" y="7" width="9" height="7" fill="none" stroke="#d97706" strokeWidth="1.2" />
                          )}
                          {node.type === 'scriptTask' && (
                            <path d="M 6 12 L 9 9 L 6 6 M 11 13 L 14 13" fill="none" stroke="#059669" strokeWidth="1.2" />
                          )}

                          {/* SLA Badge (Top Right) */}
                          {node.slaHours && (
                            <g transform={`translate(${node.width - 24}, 4)`}>
                              <rect width="20" height="10" rx="3" fill="#f1f5f9" className="dark:fill-slate-700" />
                              <text x="10" y="8" fontSize="7.5" fill="#64748b" textAnchor="middle" fontWeight="bold" className="font-mono">
                                {node.slaHours}h
                              </text>
                            </g>
                          )}

                          {/* Task Name Label */}
                          <text
                            x={node.width / 2}
                            y={node.height / 2 - 2}
                            fontSize="9.5"
                            fontWeight="600"
                            fill="#1e293b"
                            textAnchor="middle"
                            className="dark:fill-slate-100"
                          >
                            {node.name.length > 20 ? node.name.slice(0, 18) + '...' : node.name}
                          </text>

                          {/* Role / Worker Chip (Bottom) */}
                          <text
                            x={node.width / 2}
                            y={node.height - 7}
                            fontSize="8"
                            fill="#64748b"
                            textAnchor="middle"
                            className="font-mono dark:fill-slate-400"
                          >
                            {node.jobType ? `[Worker: ${node.jobType.slice(0, 12)}]` : (node.assigneeRole || 'Unassigned')}
                          </text>

                          {/* Multi-Instance Parallel ||| or Sequential ≡ Marker */}
                          {node.multiInstance && (
                            <text x={node.width / 2} y={node.height + 10} fontSize="11" fill="#475569" fontWeight="bold" textAnchor="middle">
                              {node.multiInstance.isSequential ? '≡' : '|||'}
                            </text>
                          )}
                        </g>
                      )}

                      {/* GATEWAY SHAPE (DIAMOND) */}
                      {isGateway && (
                        <g>
                          <polygon
                            points={`0,${node.height / 2} ${node.width / 2},0 ${node.width},${node.height / 2} ${node.width / 2},${node.height}`}
                            fill="#ffffff"
                            stroke={isSelected ? '#10b981' : '#d97706'}
                            strokeWidth={isSelected ? '2.5' : '1.8'}
                            className="dark:fill-slate-800"
                          />
                          <text
                            x={node.width / 2}
                            y={node.height / 2 + 4}
                            fontSize="12"
                            fontWeight="bold"
                            fill="#d97706"
                            textAnchor="middle"
                          >
                            {node.type === 'parallelGateway' ? '+' : node.type === 'inclusiveGateway' ? 'O' : 'X'}
                          </text>
                          <text
                            x={node.width / 2}
                            y={node.height + 14}
                            fontSize="8.5"
                            fill="#475569"
                            textAnchor="middle"
                            className="dark:fill-slate-300 font-semibold"
                          >
                            {node.name !== 'X' ? node.name : ''}
                          </text>
                        </g>
                      )}

                      {/* START / END / INTERMEDIATE EVENT SHAPES */}
                      {isEvent && (
                        <g>
                          <circle
                            cx={node.width / 2}
                            cy={node.height / 2}
                            r={node.width / 2 - 2}
                            fill={node.type === 'terminateEndEvent' ? '#dc2626' : '#ffffff'}
                            stroke={node.type.includes('end') ? '#dc2626' : '#10b981'}
                            strokeWidth={node.type.includes('end') ? '3' : '2'}
                            className="dark:fill-slate-800"
                          />
                          {node.type === 'timerStartEvent' && (
                            <path d={`M ${node.width / 2} ${node.height / 2 - 5} L ${node.width / 2} ${node.height / 2} L ${node.width / 2 + 4} ${node.height / 2}`} stroke="#10b981" strokeWidth="1.2" fill="none" />
                          )}
                          {node.type === 'boundaryErrorEvent' && (
                            <polygon points={`${node.width / 2 - 3},${node.height / 2 - 6} ${node.width / 2 + 4},${node.height / 2 - 1} ${node.width / 2 - 1},${node.height / 2} ${node.width / 2 + 2},${node.height / 2 + 6} ${node.width / 2 - 4},${node.height / 2 + 1} ${node.width / 2 + 1},${node.height / 2}`} fill="#dc2626" />
                          )}
                          <text
                            x={node.width / 2}
                            y={node.height + 14}
                            fontSize="8.5"
                            fill="#475569"
                            textAnchor="middle"
                            className="dark:fill-slate-300 font-semibold"
                          >
                            {node.name}
                          </text>
                        </g>
                      )}

                      {/* ARTIFACTS (DATA STORE) */}
                      {node.type === 'dataStore' && (
                        <g>
                          <path
                            d={`M 0 8 C 0 3, ${node.width} 3, ${node.width} 8 L ${node.width} ${node.height - 8} C ${node.width} ${node.height - 3}, 0 ${node.height - 3}, 0 ${node.height - 8} Z`}
                            fill="#ffffff"
                            stroke="#475569"
                            strokeWidth="1.5"
                            className="dark:fill-slate-800"
                          />
                          <ellipse cx={node.width / 2} cy="8" rx={node.width / 2} ry="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1.2" />
                          <text x={node.width / 2} y={node.height + 14} fontSize="8.5" fill="#475569" textAnchor="middle" className="font-semibold">
                            {node.name}
                          </text>
                        </g>
                      )}

                      {/* Token Simulation Highlight */}
                      {isSimCurrent && (
                        <circle 
                          cx={node.width / 2} 
                          cy={node.height / 2} 
                          r={node.width / 2 + 6} 
                          fill="none" 
                          stroke="#10b981" 
                          strokeWidth="2.5" 
                          strokeDasharray="4 2" 
                          className="animate-spin"
                        />
                      )}

                      {/* ======================================================= */}
                      {/* INTERACTIVE CONTEXT PAD (Floating Tool on Selected Node) */}
                      {/* ======================================================= */}
                      {isSelected && (
                        <g transform={`translate(${node.width + 12}, 0)`} className="cursor-default">
                          {/* Append User Task */}
                          <g 
                            onClick={(e) => { e.stopPropagation(); handleAppendNode(node, 'userTask', 'BƯỚC TIẾP THEO'); }}
                            className="cursor-pointer hover:opacity-80"
                          >
                            <title>Tạo tiếp User Task</title>
                            <rect width="20" height="20" rx="4" fill="#0284c7" />
                            <text x="10" y="14" fontSize="12" fill="#ffffff" textAnchor="middle" fontWeight="bold">+</text>
                          </g>

                          {/* Append Exclusive Gateway */}
                          <g 
                            transform="translate(0, 24)"
                            onClick={(e) => { e.stopPropagation(); handleAppendNode(node, 'exclusiveGateway', 'X'); }}
                            className="cursor-pointer hover:opacity-80"
                          >
                            <title>Tạo rẽ nhánh Gateway</title>
                            <rect width="20" height="20" rx="4" fill="#d97706" />
                            <text x="10" y="14" fontSize="11" fill="#ffffff" textAnchor="middle" fontWeight="bold">X</text>
                          </g>

                          {/* Append Service Task */}
                          <g 
                            transform="translate(0, 48)"
                            onClick={(e) => { e.stopPropagation(); handleAppendNode(node, 'serviceTask', 'ZEEBE WORKER'); }}
                            className="cursor-pointer hover:opacity-80"
                          >
                            <title>Tạo tiếp Service Task (Zeebe)</title>
                            <rect width="20" height="20" rx="4" fill="#9333ea" />
                            <text x="10" y="14" fontSize="9" fill="#ffffff" textAnchor="middle" fontWeight="bold">⚙</text>
                          </g>

                          {/* Delete Node */}
                          <g 
                            transform="translate(0, 72)"
                            onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                            className="cursor-pointer hover:opacity-80"
                          >
                            <title>Xóa thành phần này</title>
                            <rect width="20" height="20" rx="4" fill="#dc2626" />
                            <text x="10" y="14" fontSize="11" fill="#ffffff" textAnchor="middle" fontWeight="bold">✕</text>
                          </g>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Right Properties Panel with full Camunda 8 Zeebe & Flowable specs */}
        <ModelerPropertiesPanel
          selectedNode={selectedNode}
          currentProcess={currentProcess}
          onUpdateNode={(updated) => {
            const updatedNodes = currentProcess.nodes.map(n => n.id === updated.id ? updated : n);
            onUpdateProcess({ ...currentProcess, nodes: updatedNodes });
          }}
          onUpdateProcess={onUpdateProcess}
          availableLanes={allLanes}
          onOpenDmn={(key) => {
            setActiveDmnKey(key);
            setActiveModelerMode('dmn');
            showToast(`Đã chuyển sang bảng quyết định DMN: [${key}]`);
          }}
        />
      </div>
      )}

      {/* BPMN 2.0 XML Viewer/Editor Modal */}
      {showXmlModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    BPMN 2.0 XML Definition – {currentProcess.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Target Engine: {currentProcess.engine} (Zeebe &amp; Flowable namespaces enabled)
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowXmlModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-slate-950">
              <textarea
                value={xmlContent}
                onChange={(e) => setXmlContent(e.target.value)}
                className="w-full h-96 bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">OMG BPMN 2.0 &amp; Camunda 8 Model Spec Compliant</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([xmlContent], { type: 'application/xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${currentProcess.key}_camunda8_v${currentProcess.version}.bpmn20.xml`;
                    a.click();
                  }}
                  className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Tải file .bpmn
                </button>
                <button
                  onClick={() => {
                    onUpdateProcess({ ...currentProcess, xml: xmlContent });
                    setShowXmlModal(false);
                    showToast('Đã lưu cấu hình BPMN 2.0 XML.');
                  }}
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 cursor-pointer"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Engine Deploy Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Deploy to Engine Cockpit</h3>
              </div>
              <button onClick={() => setShowDeployModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Chọn Động Cơ Triển Khai (Target BPMN Engine)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Camunda', 'Flowable'] as const).map(engine => (
                    <button
                      key={engine}
                      onClick={() => setTargetEngine(engine)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        targetEngine === engine 
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-600'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-sm font-bold">{engine === 'Camunda' ? 'Camunda 8 (Zeebe)' : 'Flowable 7'}</div>
                      <p className="text-[10.5px] text-slate-500 font-normal mt-0.5">
                        {engine === 'Camunda' ? 'Zeebe gRPC / REST Engine' : 'Spring Boot / Flowable REST'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Mã Quy Trình:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{currentProcess.key}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Phiên Bản Mới:</span>
                  <span className="font-mono text-emerald-600 font-bold">v{currentProcess.version + 1} (Incremental)</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tác Nhân / Swimlanes:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{allLanes.length} Làn Xử Lý</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tenant Isolation:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">ecmbpm</span>
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex justify-end gap-2">
              <button
                onClick={() => setShowDeployModal(false)}
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onDeployToEngine(targetEngine);
                  setShowDeployModal(false);
                  showToast(`Đã triển khai thành công quy trình lên ${targetEngine} Engine!`);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Triển Khai Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
