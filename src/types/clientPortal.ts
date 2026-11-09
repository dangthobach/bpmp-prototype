export type ClientRequestStatus = 
  | 'SUBMITTED' 
  | 'IN_REVIEW' 
  | 'ADDITIONAL_DOCS_REQUIRED' 
  | 'APPROVED' 
  | 'DISBURSED' 
  | 'REJECTED';

export interface RequestStep {
  id: string;
  name: string;
  role: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'REJECTED';
  updatedAt?: string;
  handlerName?: string;
  notes?: string;
}

export interface RequestDocument {
  id: string;
  name: string;
  category: 'LEGAL' | 'FINANCIAL' | 'COLLATERAL' | 'PURPOSE' | 'OTHER';
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  isRequired: boolean;
  notes?: string;
}

export interface RequestComment {
  id: string;
  author: string;
  authorRole: string;
  createdAt: string;
  content: string;
  isStaff: boolean;
}

export interface ProcessVariableEntry {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  value: string;
  description?: string;
  isSystem?: boolean;
}

export interface ClientRequest {
  id: string;
  trackingCode: string;
  serviceKey: string;
  serviceName: string;
  category: string;
  customerName: string;
  customerOrg: string;
  customerTaxId?: string;
  customerPhone: string;
  customerEmail: string;
  amount: number;
  currency: string;
  termMonths: number;
  purpose: string;
  status: ClientRequestStatus;
  createdAt: string;
  updatedAt: string;
  assignedOfficer: string;
  currentStepName: string;
  steps: RequestStep[];
  documents: RequestDocument[];
  comments: RequestComment[];
  slaDeadline: string;
  processKey?: string;
  processInstanceId?: string;
  variables?: Record<string, any>;
  branch?: string;
}

export interface ServiceItem {
  key: string;
  name: string;
  category: 'Tín Dụng SME' | 'Tài Trợ Thương Mại' | 'Dịch Vụ Thanh Toán' | 'Hành Chính Nội Bộ';
  description: string;
  estimatedDays: number;
  maxAmountText: string;
  requiredDocsCount: number;
  iconName: string;
  processKey: string;
  isPopular?: boolean;
}

export interface ClientPersona {
  id: string;
  name: string;
  title: string;
  org: string;
  phone: string;
  email: string;
  type: 'CLIENT_SME' | 'CLIENT_INDIVIDUAL' | 'ORG_OFFICER';
  avatarInitials: string;
}
