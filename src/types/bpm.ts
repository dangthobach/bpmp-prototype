export type BPMNodeType = 
  | 'startEvent'
  | 'messageStartEvent'
  | 'timerStartEvent'
  | 'userTask'
  | 'serviceTask'
  | 'businessRuleTask'
  | 'scriptTask'
  | 'sendTask'
  | 'receiveTask'
  | 'callActivity'
  | 'subProcess'
  | 'exclusiveGateway'
  | 'parallelGateway'
  | 'inclusiveGateway'
  | 'eventBasedGateway'
  | 'intermediateCatchEvent'
  | 'intermediateTimerEvent'
  | 'intermediateMessageEvent'
  | 'boundaryTimerEvent'
  | 'boundaryErrorEvent'
  | 'endEvent'
  | 'terminateEndEvent'
  | 'errorEndEvent'
  | 'pool'
  | 'lane'
  | 'dataStore'
  | 'dataObject'
  | 'textAnnotation';

export interface ZeebeTaskDefinition {
  type: string;
  retries: number;
}

export interface ZeebeIOMapping {
  inputs: Array<{ source: string; target: string }>;
  outputs: Array<{ source: string; target: string }>;
}

export interface ZeebeCalledDecision {
  decisionId: string;
  resultVariable: string;
  binding?: 'latest' | 'deployment';
}

export interface ZeebeCalledElement {
  processId: string;
  propagateAllChildVariables: boolean;
}

export interface MultiInstanceConfig {
  isSequential: boolean;
  inputCollection?: string;
  inputElement?: string;
  outputCollection?: string;
  outputElement?: string;
  completionCondition?: string;
}

export interface BPMNLaneDefinition {
  id: string;
  name: string;
  actorRole: string;
  actorType: 'HUMAN' | 'SYSTEM' | 'EXTERNAL';
  color?: string;
  y: number;
  height: number;
}

export interface BPMNPoolDefinition {
  id: string;
  name: string;
  participantRef: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lanes: BPMNLaneDefinition[];
}

export interface BPMNNode {
  id: string;
  name: string;
  type: BPMNodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  poolId?: string;
  laneId?: string;
  actorName?: string;
  assigneeRole?: string;
  candidateGroups?: string[];
  candidateUsers?: string[];
  slaHours?: number;
  documentation?: string;
  
  // Camunda 8 Zeebe specific attributes
  jobType?: string;
  jobRetries?: number;
  taskHeaders?: Record<string, string>;
  ioMapping?: ZeebeIOMapping;
  calledDecision?: ZeebeCalledDecision;
  calledElement?: ZeebeCalledElement;
  
  // Form configuration (Camunda Form / Flowable Form)
  formKey?: string;
  formId?: string;
  
  // Script and Message configurations
  scriptFormat?: string;
  scriptBody?: string;
  messageName?: string;
  correlationKey?: string;
  timerDefinition?: { type: 'duration' | 'date' | 'cycle'; value: string };
  errorCode?: string;
  errorMessage?: string;
  
  // Multi-instance loop characteristics
  multiInstance?: MultiInstanceConfig;
  
  // Flowable 7 Engine attributes
  flowableAsync?: boolean;
  flowableExclusive?: boolean;
  executionListeners?: Array<{ event: string; type: string; value: string }>;
  taskListeners?: Array<{ event: string; type: string; value: string }>;
  extensionProperties?: Record<string, string>;
  viewEndpoint?: string;
}

export interface BPMNEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
  waypoints?: Array<{ x: number; y: number }>;
}

export interface ProcessDefinition {
  id: string;
  key: string;
  name: string;
  version: number;
  status: 'checkin' | 'deployed' | 'draft';
  engine: 'Camunda' | 'Flowable';
  creator: string;
  checkinUser: string;
  createdAt: string;
  description: string;
  category: 'Banking' | 'Procurement' | 'HR' | 'Custom';
  nodes: BPMNNode[];
  edges: BPMNEdge[];
  pools?: BPMNPoolDefinition[];
  xml?: string;
}

export interface ProcessInstance {
  id: string;
  processKey: string;
  processName: string;
  recordCode: string; // Mã hồ sơ (e.g. SDD-0000426693)
  currentStep: string;
  name: string; // Tên khách hàng / doanh nghiệp
  status: 'ACTIVATED' | 'COMPLETED' | 'CANCELED' | 'SUSPENDED';
  startedAt: string;
  completedAt?: string;
  version: number;
  createdBy: string;
  activeNodeId?: string;
  amount?: string;
  branch?: string;
}

export interface TaskItem {
  id: string;
  instanceId: string;
  recordCode: string;
  processKey: string;
  processName: string;
  taskName: string;
  customerName: string;
  amount: string;
  assignee: string | null;
  candidateRoles: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  slaHours: number;
  startedAt: string;
  dueAt: string;
  status: 'UNASSIGNED' | 'ASSIGNED' | 'COMPLETED';
  formFields: Array<{
    id: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date';
    value: any;
    options?: string[];
    required?: boolean;
  }>;
}

export interface TaskHeatmapData {
  elementId: string;
  elementName: string;
  totalInstances: number;
  avgProcTimeHours: number;
  overThresholdCount: number;
  underThresholdCount: number;
  totalProcHours: number;
  avgWaitHours: number;
  totalWaitHours: number;
  colorGrade: 'green' | 'yellow' | 'orange' | 'purple';
}

export interface EndpointConfig {
  id: string;
  serviceName: string;
  serviceType: string;
  endpointUrl: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  authType: 'NONE' | 'BEARER' | 'BASIC' | 'OAUTH2';
  active: boolean;
}

export type GranularAction = 'VIEW' | 'EXECUTE' | 'REASSIGN' | 'CANCEL';
export type ProcessAction = 'VIEW' | 'START' | 'DEPLOY' | 'TERMINATE';
export type QueueAction = 'VIEW' | 'CLAIM' | 'REASSIGN';

export interface RolePermissionDetail {
  role: string;
  actions: GranularAction[];
}

export interface ProcessRolePermissionDetail {
  role: string;
  actions: ProcessAction[];
}

export interface QueueRolePermissionDetail {
  role: string;
  actions: QueueAction[];
}

export interface RBACFilterRule {
  id: string;
  field: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
  value: string;
  expression: string;
}

export interface RBACItem {
  id: string;
  processKey: string;
  name: string;
  type: 'Queue' | 'Element' | 'Process';
  elementType: string;
  roles: string[];
  rolePermissions?: RolePermissionDetail[];
  filters: number;
  filterRules?: RBACFilterRule[];
  queryExpression?: string;
  description?: string;
}

export interface ProcessRBACDefinition {
  processKey: string;
  processName: string;
  category: string;
  roles: string[];
  rolePermissions: ProcessRolePermissionDetail[];
  totalElements: number;
  totalQueues: number;
}

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  department: string;
  roles: string[];
  status: 'ACTIVE' | 'LOCKED';
  lastLogin: string;
  directPermissions?: string[];
}

export interface AllocationRule {
  id: string;
  name: string;
  processKey: string;
  stepName: string;
  strategy: 'ROUND_ROBIN' | 'WORKLOAD_BALANCING' | 'SKILL_BASED';
  targetGroup: string;
  maxActivePerUser: number;
  autoEscalateHours: number;
  active: boolean;
}

export type AuditActionType = 
  | 'ROLE_ASSIGNED' 
  | 'ROLE_REMOVED' 
  | 'ACTION_UPDATED' 
  | 'FILTER_MODIFIED' 
  | 'QUEUE_CREATED' 
  | 'PROCESS_PERM_UPDATED';

export interface RBACAuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  processKey: string;
  targetType: 'Process' | 'Element' | 'Queue';
  targetName: string;
  actionType: AuditActionType;
  details: string;
  previousState?: string;
  newState?: string;
}
