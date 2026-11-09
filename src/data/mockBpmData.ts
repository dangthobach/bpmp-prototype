import { 
  ProcessDefinition, 
  ProcessInstance, 
  TaskItem, 
  TaskHeatmapData, 
  EndpointConfig, 
  RBACItem, 
  UserAccount,
  AllocationRule,
  ProcessRBACDefinition,
  RBACAuditLogEntry
} from '../types/bpm';

export const INITIAL_PROCESS_DEFINITIONS: ProcessDefinition[] = [
  {
    id: 'proc_sdd',
    key: 'SDD',
    name: 'GIẢI NGÂN (SDD)',
    version: 2,
    status: 'checkin',
    engine: 'Camunda',
    creator: 'daohanh.forwork@gmail.com',
    checkinUser: 'tambv',
    createdAt: '07/07/2025 20:43:27',
    description: 'Quy trình giải ngân vốn vay doanh nghiệp SME và chuỗi cung ứng',
    category: 'Banking',
    nodes: [
      { id: 'start_sdd', name: 'KHOI TAO HO SO', type: 'startEvent', x: 80, y: 390, width: 36, height: 36 },
      { id: 'task_cbbh', name: 'CAN BO BAN HANG', type: 'userTask', x: 190, y: 190, width: 90, height: 48, assigneeRole: 'NCLOS SALE', slaHours: 4 },
      { id: 'task_hoanthien', name: 'CHO HOAN THIEN', type: 'userTask', x: 190, y: 300, width: 90, height: 48, assigneeRole: 'NCLOS SALE', slaHours: 8 },
      { id: 'task_choxuly', name: 'CHO XU LY', type: 'userTask', x: 310, y: 190, width: 90, height: 48, assigneeRole: 'NCLOS B CO', slaHours: 6 },
      { id: 'task_tiepnhan', name: 'TIEP NHAN HO SO', type: 'userTask', x: 260, y: 460, width: 100, height: 50, assigneeRole: 'NCLOS B TLCO', slaHours: 2 },
      { id: 'task_msca', name: 'MSCA XU LY', type: 'serviceTask', x: 200, y: 590, width: 90, height: 45 },
      { id: 'task_cbbh_nhap', name: 'CBBH NHAP THONG TIN', type: 'userTask', x: 200, y: 690, width: 95, height: 45, assigneeRole: 'NCLOS SALE', slaHours: 4 },
      { id: 'task_gdtt', name: 'GDTT', type: 'userTask', x: 420, y: 250, width: 80, height: 45, assigneeRole: 'NCLOS CA', slaHours: 12 },
      { id: 'task_taotailieu', name: 'CHO TAO TAI LIEU HSGN', type: 'userTask', x: 340, y: 590, width: 95, height: 45, assigneeRole: 'NCLOS B TK', slaHours: 4 },
      { id: 'task_kiemtra_dk', name: 'KIEM TRA DIEU KIEN GIAI NGAN', type: 'userTask', x: 340, y: 645, width: 95, height: 48, assigneeRole: 'NCLOS B KS2', slaHours: 6 },
      { id: 'task_cso_kiemsoat', name: 'CSO KIEM SOAT HO SO', type: 'userTask', x: 340, y: 775, width: 95, height: 45, assigneeRole: 'NCLOS B KS2', slaHours: 4 },
      { id: 'task_lodv', name: 'LODV DUYET HO SO', type: 'userTask', x: 200, y: 890, width: 95, height: 45, assigneeRole: 'NCLOS ADMIN', slaHours: 8 },
      { id: 'task_validation', name: 'CHO VALIDATION', type: 'serviceTask', x: 400, y: 840, width: 90, height: 45 },
      { id: 'task_ksv_cso', name: 'KSV CSO PHE DUYET', type: 'userTask', x: 490, y: 775, width: 95, height: 45, assigneeRole: 'NCLOS CA', slaHours: 12 },
      { id: 'task_bosung', name: 'CHO BO SUNG HO SO TU FRONT END', type: 'userTask', x: 480, y: 490, width: 95, height: 45, assigneeRole: 'NCLOS SALE', slaHours: 24 },
      { id: 'task_cso_kyloi', name: 'CSO XU LY HO SO SI KY LOI', type: 'userTask', x: 530, y: 490, width: 95, height: 45, assigneeRole: 'NCLOS B KS2', slaHours: 8 },
      { id: 'task_chogiaingan', name: 'CHO GIAI NGAN', type: 'userTask', x: 600, y: 610, width: 90, height: 45, assigneeRole: 'NCLOS ADMIN', slaHours: 6 },
      { id: 'task_tichhop', name: 'TICH HOP', type: 'serviceTask', x: 670, y: 550, width: 80, height: 45 },
      { id: 'task_ksv_ketqua', name: 'KSV XEM XET KET QUA TICH HOP', type: 'userTask', x: 670, y: 675, width: 95, height: 45, assigneeRole: 'NCLOS CA', slaHours: 4 },
      { id: 'gw_1', name: 'X', type: 'exclusiveGateway', x: 170, y: 395, width: 36, height: 36 },
      { id: 'gw_2', name: 'X', type: 'exclusiveGateway', x: 270, y: 565, width: 36, height: 36 },
      { id: 'gw_3', name: 'X', type: 'exclusiveGateway', x: 370, y: 710, width: 36, height: 36 },
      { id: 'gw_4', name: 'X', type: 'exclusiveGateway', x: 600, y: 520, width: 36, height: 36 },
      { id: 'end_tuchoi', name: 'TU CHOI', type: 'endEvent', x: 170, y: 830, width: 32, height: 32 },
      { id: 'end_hoanthanh', name: 'HOAN THANH', type: 'endEvent', x: 740, y: 510, width: 32, height: 32 },
    ],
    edges: [
      { id: 'e1', source: 'start_sdd', target: 'gw_1', label: 'Khoi tao' },
      { id: 'e2', source: 'gw_1', target: 'task_cbbh', label: 'Online' },
      { id: 'e3', source: 'gw_1', target: 'task_tiepnhan', label: 'Offline' },
      { id: 'e4', source: 'task_cbbh', target: 'task_choxuly', label: 'Online Submit' },
      { id: 'e5', source: 'task_cbbh', target: 'task_hoanthien', label: 'Sale Reject' },
      { id: 'e6', source: 'task_choxuly', target: 'task_gdtt', label: 'Submit GDTT' },
      { id: 'e7', source: 'task_tiepnhan', target: 'gw_2', label: 'Phân luồng' },
      { id: 'e8', source: 'gw_2', target: 'task_msca', label: 'Auto loan' },
      { id: 'e9', source: 'gw_2', target: 'task_taotailieu', label: 'New workitem' },
      { id: 'e10', source: 'task_taotailieu', target: 'task_kiemtra_dk', label: 'Kiem tra' },
      { id: 'e11', source: 'task_kiemtra_dk', target: 'gw_3', label: 'Xet duyet' },
      { id: 'e12', source: 'gw_3', target: 'task_cso_kiemsoat', label: 'CSO Kiem soat' },
      { id: 'e13', source: 'task_cso_kiemsoat', target: 'task_validation', label: 'Submit' },
      { id: 'e14', source: 'task_validation', target: 'task_ksv_cso', label: 'Pass' },
      { id: 'e15', source: 'task_ksv_cso', target: 'task_chogiaingan', label: 'CSO Approve' },
      { id: 'e16', source: 'task_chogiaingan', target: 'gw_4', label: 'Chuyen tien' },
      { id: 'e17', source: 'gw_4', target: 'task_tichhop', label: 'Sync' },
      { id: 'e18', source: 'task_tichhop', target: 'end_hoanthanh', label: 'Hoan thanh' },
      { id: 'e19', source: 'gw_3', target: 'end_tuchoi', label: 'Reject' },
    ],
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
  id="Definitions_SDD" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="SDD" name="GIẢI NGÂN (SDD)" isExecutable="true" camunda:versionTag="v2.0">
    <bpmn:startEvent id="start_sdd" name="KHOI TAO HO SO" />
    <bpmn:userTask id="task_tiepnhan" name="TIEP NHAN HO SO" camunda:candidateGroups="NCLOS B TLCO" />
    <bpmn:userTask id="task_choxuly" name="CHO XU LY" camunda:candidateGroups="NCLOS B CO" />
    <bpmn:userTask id="task_chogiaingan" name="CHO GIAI NGAN" camunda:candidateGroups="NCLOS ADMIN" />
    <bpmn:endEvent id="end_hoanthanh" name="HOAN THANH" />
  </bpmn:process>
</bpmn:definitions>`
  },
  {
    id: 'proc_nclos',
    key: 'NCLOS',
    name: 'NCLOS – Thẩm định & Phê duyệt',
    version: 3,
    status: 'deployed',
    engine: 'Camunda',
    creator: 'daohanh.forwork@gmail.com',
    checkinUser: 'system_admin',
    createdAt: '17/05/2026 17:05:33',
    description: 'Quy trình thẩm định tín dụng, phê duyệt cấp hạn mức và thực địa',
    category: 'Banking',
    nodes: [
      { id: 'start_nclos', name: 'BAT DAU', type: 'startEvent', x: 60, y: 220, width: 36, height: 36 },
      { id: 'nclos_thamdinh1', name: 'THAM DINH 1', type: 'userTask', x: 140, y: 200, width: 110, height: 50, assigneeRole: 'NCLOS B CO', slaHours: 4 },
      { id: 'nclos_thamdinh2', name: 'THAM DINH 2', type: 'userTask', x: 330, y: 200, width: 110, height: 50, assigneeRole: 'NCLOS B CO', slaHours: 6 },
      { id: 'nclos_soan_kyso', name: 'SOAN HO SO KY SO', type: 'userTask', x: 520, y: 200, width: 110, height: 50, assigneeRole: 'NCLOS B TK', slaHours: 2 },
      { id: 'nclos_pheduyet_thucdia', name: 'PHE DUYET DE XUAT THUC DIA', type: 'userTask', x: 700, y: 200, width: 120, height: 50, assigneeRole: 'NCLOS FA', slaHours: 4 },
      { id: 'nclos_teamlead_phanbo', name: 'B TEAM LEAD PHAN BO', type: 'userTask', x: 140, y: 390, width: 115, height: 50, assigneeRole: 'NCLOS B TLCO', slaHours: 2 },
      { id: 'nclos_b_thamdinh1', name: 'B THAM DINH 1', type: 'userTask', x: 330, y: 390, width: 110, height: 50, assigneeRole: 'NCLOS B CO', slaHours: 4 },
      { id: 'nclos_b_thamdinh2', name: 'B THAM DINH 2', type: 'userTask', x: 520, y: 390, width: 110, height: 50, assigneeRole: 'NCLOS B CO', slaHours: 4 },
      { id: 'nclos_kiemsoat1', name: 'B KIEM SOAT CAP 1', type: 'userTask', x: 700, y: 390, width: 110, height: 50, assigneeRole: 'NCLOS ADMIN', slaHours: 4 },
      { id: 'nclos_thucdia', name: 'THUC DIA', type: 'userTask', x: 140, y: 550, width: 110, height: 50, assigneeRole: 'NCLOS FA', slaHours: 8 },
      { id: 'nclos_gw1', name: 'X', type: 'exclusiveGateway', x: 275, y: 208, width: 34, height: 34 },
      { id: 'nclos_gw2', name: 'X', type: 'exclusiveGateway', x: 465, y: 208, width: 34, height: 34 },
      { id: 'nclos_gw3', name: 'X', type: 'exclusiveGateway', x: 275, y: 398, width: 34, height: 34 },
      { id: 'nclos_gw4', name: 'X', type: 'exclusiveGateway', x: 465, y: 398, width: 34, height: 34 },
      { id: 'nclos_gw5', name: 'X', type: 'exclusiveGateway', x: 645, y: 398, width: 34, height: 34 },
      { id: 'nclos_gw6', name: 'X', type: 'exclusiveGateway', x: 275, y: 558, width: 34, height: 34 },
      { id: 'end_nclos', name: 'KET THUC', type: 'endEvent', x: 860, y: 398, width: 34, height: 34 },
    ],
    edges: [
      { id: 'ne1', source: 'start_nclos', target: 'nclos_thamdinh1' },
      { id: 'ne2', source: 'nclos_thamdinh1', target: 'nclos_gw1' },
      { id: 'ne3', source: 'nclos_gw1', target: 'nclos_thamdinh2', label: 'DEC THAM DINH 1' },
      { id: 'ne4', source: 'nclos_thamdinh2', target: 'nclos_gw2' },
      { id: 'ne5', source: 'nclos_gw2', target: 'nclos_soan_kyso' },
      { id: 'ne6', source: 'nclos_soan_kyso', target: 'nclos_pheduyet_thucdia' },
      { id: 'ne7', source: 'start_nclos', target: 'nclos_teamlead_phanbo' },
      { id: 'ne8', source: 'nclos_teamlead_phanbo', target: 'nclos_gw3' },
      { id: 'ne9', source: 'nclos_gw3', target: 'nclos_b_thamdinh1', label: 'DEC B TEAM LEAD' },
      { id: 'ne10', source: 'nclos_b_thamdinh1', target: 'nclos_gw4' },
      { id: 'ne11', source: 'nclos_gw4', target: 'nclos_b_thamdinh2' },
      { id: 'ne12', source: 'nclos_b_thamdinh2', target: 'nclos_gw5' },
      { id: 'ne13', source: 'nclos_gw5', target: 'nclos_kiemsoat1' },
      { id: 'ne14', source: 'nclos_gw3', target: 'nclos_thucdia' },
      { id: 'ne15', source: 'nclos_thucdia', target: 'nclos_gw6' },
      { id: 'ne16', source: 'nclos_kiemsoat1', target: 'end_nclos' },
    ]
  },
  {
    id: 'proc_pscf',
    key: 'PSCF',
    name: 'PSCF – Chuỗi ô tô sau giải ngân',
    version: 1,
    status: 'deployed',
    engine: 'Flowable',
    creator: 'daohanh.forwork@gmail.com',
    checkinUser: 'autouser',
    createdAt: '10/06/2026 09:15:00',
    description: 'Quy trình tài trợ chuỗi cung ứng đại lý ô tô và giải ngân định kỳ',
    category: 'Banking',
    nodes: [
      { id: 'pscf_s', name: 'KHOI TAO', type: 'startEvent', x: 60, y: 150, width: 36, height: 36 },
      { id: 'pscf_t1', name: 'TIEP NHAN DON VAY', type: 'userTask', x: 150, y: 140, width: 120, height: 50 },
      { id: 'pscf_t2', name: 'KIEM TRA KHO XE', type: 'userTask', x: 320, y: 140, width: 120, height: 50 },
      { id: 'pscf_t3', name: 'PHE DUYET HAN MUC', type: 'userTask', x: 490, y: 140, width: 120, height: 50 },
      { id: 'pscf_e', name: 'GIAI NGAN', type: 'endEvent', x: 660, y: 147, width: 36, height: 36 },
    ],
    edges: [
      { id: 'pe1', source: 'pscf_s', target: 'pscf_t1' },
      { id: 'pe2', source: 'pscf_t1', target: 'pscf_t2' },
      { id: 'pe3', source: 'pscf_t2', target: 'pscf_t3' },
      { id: 'pe4', source: 'pscf_t3', target: 'pscf_e' },
    ]
  },
  {
    id: 'proc_retailbio',
    key: 'RetailBio',
    name: 'RetailBio – Định danh sinh trắc học KHCN',
    version: 2,
    status: 'deployed',
    engine: 'Camunda',
    creator: 'daohanh.forwork@gmail.com',
    checkinUser: 'tambv',
    createdAt: '12/06/2026 14:00:20',
    description: 'Xác thực NFC CCCD gắn chip và sinh trắc học khuôn mặt tự động',
    category: 'Banking',
    nodes: [
      { id: 'rb_s', name: 'CHUP ANH CCCD', type: 'startEvent', x: 60, y: 150, width: 36, height: 36 },
      { id: 'rb_t1', name: 'QUET NFC CHIP', type: 'serviceTask', x: 160, y: 140, width: 120, height: 50 },
      { id: 'rb_t2', name: 'LIVENESS FACE MATCH', type: 'serviceTask', x: 330, y: 140, width: 120, height: 50 },
      { id: 'rb_t3', name: 'HAU KIEM BAN LE', type: 'userTask', x: 500, y: 140, width: 120, height: 50 },
      { id: 'rb_e', name: 'XAC THUC THANH CONG', type: 'endEvent', x: 670, y: 147, width: 36, height: 36 },
    ],
    edges: [
      { id: 'rbe1', source: 'rb_s', target: 'rb_t1' },
      { id: 'rbe2', source: 'rb_t1', target: 'rb_t2' },
      { id: 'rbe3', source: 'rb_t2', target: 'rb_t3' },
      { id: 'rbe4', source: 'rb_t3', target: 'rb_e' },
    ]
  }
];

export const INITIAL_INSTANCES: ProcessInstance[] = [
  {
    id: '6755399452413089',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    recordCode: 'SDD-0000426693',
    currentStep: 'TIEP NHAN HO SO',
    name: 'CÔNG TY TNHH TM DỊCH VỤ AN BÌNH',
    status: 'ACTIVATED',
    startedAt: '19/05/2026 14:27:21',
    version: 2,
    createdBy: '15371639',
    activeNodeId: 'task_tiepnhan',
    amount: '4,500,000,000 VND',
    branch: 'Chi nhánh Hà Nội'
  },
  {
    id: '6755399452455708',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    recordCode: '503558',
    currentStep: 'CAN BO BAN HANG',
    name: 'CÔNG TY TNHH XÂY DỰNG MINH PHÁT',
    status: 'ACTIVATED',
    startedAt: '19/05/2026 14:27:18',
    version: 2,
    createdBy: '15148358',
    activeNodeId: 'task_cbbh',
    amount: '1,200,000,000 VND',
    branch: 'Chi nhánh Sài Gòn'
  },
  {
    id: '2251799825074821',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    recordCode: '503486',
    currentStep: 'GDTT',
    name: 'CÔNG TY TNHH QUỐC TẾ HẢI ĐĂNG',
    status: 'ACTIVATED',
    startedAt: '19/05/2026 14:27:16',
    version: 2,
    createdBy: '5910268',
    activeNodeId: 'task_gdtt',
    amount: '8,900,000,000 VND',
    branch: 'Chi nhánh Đà Nẵng'
  },
  {
    id: '2251799825038320',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    recordCode: '503101',
    currentStep: 'CHO XU LY',
    name: 'CÔNG TY TNHH SAO MAI PHÁT TRIỂN',
    status: 'ACTIVATED',
    startedAt: '19/05/2026 14:27:14',
    version: 2,
    createdBy: '19169427',
    activeNodeId: 'task_choxuly',
    amount: '3,100,000,000 VND',
    branch: 'Chi nhánh Hải Phòng'
  },
  {
    id: '6755399452419839',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    recordCode: 'SDD-0000426832',
    currentStep: 'KSV CSO PHE DUYET',
    name: 'CÔNG TY TNHH DỊCH VỤ VẬN TẢI THÀNH CÔNG',
    status: 'ACTIVATED',
    startedAt: '19/05/2026 14:27:12',
    version: 2,
    createdBy: '68183',
    activeNodeId: 'task_ksv_cso',
    amount: '6,700,000,000 VND',
    branch: 'Chi nhánh Cần Thơ'
  },
  {
    id: '6755399452409218',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    recordCode: '503060',
    currentStep: 'CHO XU LY',
    name: 'CÔNG TY TNHH THƯƠNG MẠI TIẾN THỊNH',
    status: 'ACTIVATED',
    startedAt: '19/05/2026 14:27:09',
    version: 2,
    createdBy: '17277136',
    activeNodeId: 'task_choxuly',
    amount: '2,800,000,000 VND',
    branch: 'Chi nhánh Đồng Nai'
  },
  {
    id: '6755399452458970',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    recordCode: '503585',
    currentStep: 'CHO HOAN THIEN',
    name: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ Á CHÂU',
    status: 'ACTIVATED',
    startedAt: '19/05/2026 14:27:00',
    version: 2,
    createdBy: '13158856',
    activeNodeId: 'task_hoanthien',
    amount: '5,000,000,000 VND',
    branch: 'Chi nhánh Hà Nội'
  },
  {
    id: '6755399452417214',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    recordCode: 'SDD-0000426883',
    currentStep: 'KSV CSO PHE DUYET',
    name: 'CÔNG TY TNHH KHÁNH HƯNG VIỆT',
    status: 'ACTIVATED',
    startedAt: '19/05/2026 14:26:57',
    version: 2,
    createdBy: '15675809',
    activeNodeId: 'task_ksv_cso',
    amount: '12,500,000,000 VND',
    branch: 'Chi nhánh TP.HCM'
  },
  // Additional instances with other statuses for realistic operations
  {
    id: '6755399452411122',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    recordCode: 'SDD-0000426500',
    currentStep: 'CHO VALIDATION',
    name: 'CÔNG TY ĐẦU TƯ BẤT ĐỘNG SẢN HOÀNG GIA',
    status: 'ACTIVATED',
    startedAt: '19/05/2026 14:20:10',
    version: 2,
    createdBy: '9928172',
    activeNodeId: 'task_validation',
    amount: '15,000,000,000 VND',
    branch: 'Chi nhánh Hà Nội'
  },
  {
    id: '6755399452418899',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    recordCode: 'SDD-0000426210',
    currentStep: 'HOAN THANH',
    name: 'CÔNG TY DƯỢC PHẨM TRUNG ƯƠNG 3',
    status: 'COMPLETED',
    startedAt: '18/05/2026 10:15:00',
    completedAt: '19/05/2026 11:30:00',
    version: 2,
    createdBy: '8821901',
    amount: '7,800,000,000 VND',
    branch: 'Chi nhánh Đà Nẵng'
  },
  {
    id: '6755399452419999',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    recordCode: 'SDD-0000425999',
    currentStep: 'TU CHOI',
    name: 'CÔNG TY XNK NÔNG SẢN THỦ ĐÔ',
    status: 'CANCELED',
    startedAt: '18/05/2026 09:00:00',
    completedAt: '18/05/2026 16:45:00',
    version: 2,
    createdBy: '15371639',
    amount: '2,200,000,000 VND',
    branch: 'Chi nhánh Cần Thơ'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task_001',
    instanceId: '6755399452413089',
    recordCode: 'SDD-0000426693',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    taskName: 'TIEP NHAN HO SO',
    customerName: 'CÔNG TY TNHH TM DỊCH VỤ AN BÌNH',
    amount: '4,500,000,000 VND',
    assignee: null,
    candidateRoles: ['NCLOS B TLCO', 'NCLOS ADMIN'],
    priority: 'HIGH',
    slaHours: 2,
    startedAt: '19/05/2026 14:27:21',
    dueAt: '19/05/2026 16:27:21',
    status: 'UNASSIGNED',
    formFields: [
      { id: 'f_tax', label: 'Mã số thuế', type: 'text', value: '0109887766', required: true },
      { id: 'f_amount', label: 'Số tiền giải ngân đề xuất', type: 'text', value: '4,500,000,000 VND', required: true },
      { id: 'f_term', label: 'Thời hạn vay (tháng)', type: 'number', value: 12, required: true },
      { id: 'f_interest', label: 'Lãi suất (%/năm)', type: 'number', value: 7.8, required: true },
      { id: 'f_purpose', label: 'Mục đích vay vốn', type: 'textarea', value: 'Bổ sung vốn lưu động thu mua nguyên vật liệu quý 3/2026', required: true },
      { id: 'f_collateral', label: 'Tài sản bảo đảm', type: 'select', value: 'Bất động sản công nghiệp', options: ['Bất động sản công nghiệp', 'Sổ tiết kiệm/Kỳ phiếu', 'Phương tiện vận tải', 'Quyền đòi nợ từ hợp đồng kinh tế'], required: true },
      { id: 'f_doc_verified', label: 'Đã kiểm tra tính đầy đủ của bộ hồ sơ pháp lý', type: 'checkbox', value: true }
    ]
  },
  {
    id: 'task_002',
    instanceId: '6755399452419839',
    recordCode: 'SDD-0000426832',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    taskName: 'KSV CSO PHE DUYET',
    customerName: 'CÔNG TY TNHH DỊCH VỤ VẬN TẢI THÀNH CÔNG',
    amount: '6,700,000,000 VND',
    assignee: 'tambv',
    candidateRoles: ['NCLOS CA'],
    priority: 'HIGH',
    slaHours: 12,
    startedAt: '19/05/2026 14:27:12',
    dueAt: '20/05/2026 02:27:12',
    status: 'ASSIGNED',
    formFields: [
      { id: 'f_compliance', label: 'Đánh giá rủi ro tín dụng', type: 'select', value: 'Hạng A - Rủi ro thấp', options: ['Hạng AAA - Tối ưu', 'Hạng A - Rủi ro thấp', 'Hạng BBB - Chấp nhận được', 'Hạng C - Rủi ro cao'] },
      { id: 'f_covenant', label: 'Điều kiện giải ngân tiên quyết', type: 'textarea', value: 'Đăng ký giao dịch bảo đảm thành công tại Cục ĐKGD BĐ Trung ương' },
      { id: 'f_approval_decision', label: 'Ý kiến phê duyệt cấp tín dụng', type: 'textarea', value: 'Đồng ý giải ngân đợt 1 với số tiền 6,700,000,000 VND theo đúng hạn mức phê duyệt.' }
    ]
  },
  {
    id: 'task_003',
    instanceId: '2251799825074821',
    recordCode: '503486',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    taskName: 'GDTT',
    customerName: 'CÔNG TY TNHH QUỐC TẾ HẢI ĐĂNG',
    amount: '8,900,000,000 VND',
    assignee: null,
    candidateRoles: ['NCLOS CA'],
    priority: 'MEDIUM',
    slaHours: 12,
    startedAt: '19/05/2026 14:27:16',
    dueAt: '20/05/2026 02:27:16',
    status: 'UNASSIGNED',
    formFields: [
      { id: 'f_director_note', label: 'Ghi chú Giám đốc trung tâm', type: 'textarea', value: 'Khách hàng có lịch sử tín dụng CIC sạch, doanh thu xuất khẩu tăng trưởng 25% cùng kỳ.' },
      { id: 'f_special_terms', label: 'Áp dụng gói ưu đãi lãi suất doanh nghiệp xuất khẩu', type: 'checkbox', value: true }
    ]
  },
  {
    id: 'task_004',
    instanceId: '6755399452409218',
    recordCode: '503060',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    taskName: 'CHO XU LY HO SO',
    customerName: 'CÔNG TY TNHH THỰC PHẨM SẠCH MIỀN BẮC',
    amount: '3,200,000,000 VND',
    assignee: 'tambv',
    candidateRoles: ['NCLOS B CO'],
    priority: 'LOW',
    slaHours: 48,
    startedAt: '19/05/2026 14:27:09',
    dueAt: '21/05/2026 14:27:09',
    status: 'ASSIGNED',
    formFields: [
      { id: 'f_doc_archive', label: 'Mục đích lưu trữ & đối soát', type: 'text', value: 'Đối soát hồ sơ hạn mức thấu chi định kỳ' },
      { id: 'f_audit_pass', label: 'Đã hoàn tất lưu chiểu điện tử', type: 'checkbox', value: true }
    ]
  },
  {
    id: 'task_005',
    instanceId: '6755399452458970',
    recordCode: '503585',
    processKey: 'NCLOS',
    processName: 'NCLOS QUY TRÌNH TÍN DỤNG',
    taskName: 'CHO HOAN THIEN CHUNG TU',
    customerName: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ XANH',
    amount: '12,500,000,000 VND',
    assignee: null,
    candidateRoles: ['NCLOS SALE', 'NCLOS B TLCO'],
    priority: 'MEDIUM',
    slaHours: 24,
    startedAt: '19/05/2026 14:27:00',
    dueAt: '20/05/2026 14:27:00',
    status: 'UNASSIGNED',
    formFields: [
      { id: 'f_tech_eval', label: 'Thẩm định công nghệ tài sản bảo đảm', type: 'textarea', value: 'Dây chuyền sản xuất đạt tiêu chuẩn ISO 14001, giá trị định giá 15 tỷ VND' },
      { id: 'f_insure_verified', label: 'Bảo hiểm tài sản còn hiệu lực tối thiểu 12 tháng', type: 'checkbox', value: true }
    ]
  },
  {
    id: 'task_006',
    instanceId: '6755399452417214',
    recordCode: 'SDD-0000426883',
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD)',
    taskName: 'LUU CHIEU VA HOAN TAT',
    customerName: 'CÔNG TY TNHH KHO VẬN TÂN PHÁT',
    amount: '1,800,000,000 VND',
    assignee: 'tambv',
    candidateRoles: ['NCLOS B KS2'],
    priority: 'LOW',
    slaHours: 72,
    startedAt: '19/05/2026 14:26:57',
    dueAt: '22/05/2026 14:26:57',
    status: 'ASSIGNED',
    formFields: [
      { id: 'f_final_check', label: 'Kiểm tra tài liệu sau giải ngân', type: 'textarea', value: 'Hóa đơn GTGT và hợp đồng mua bán xe đầu kéo đã được đối chiếu khớp đúng' },
      { id: 'f_complete_ack', label: 'Xác nhận kết thúc quy trình giải ngân', type: 'checkbox', value: true }
    ]
  }
];

export const NCLOS_HEATMAP_DATA: Record<string, TaskHeatmapData> = {
  nclos_thamdinh1: {
    elementId: 'nclos_thamdinh1',
    elementName: 'THAM DINH 1',
    totalInstances: 139,
    avgProcTimeHours: 3.44,
    overThresholdCount: 46,
    underThresholdCount: 64,
    totalProcHours: 7.1,
    avgWaitHours: 0.39,
    totalWaitHours: 53.89,
    colorGrade: 'purple'
  },
  nclos_thamdinh2: {
    elementId: 'nclos_thamdinh2',
    elementName: 'THAM DINH 2',
    totalInstances: 112,
    avgProcTimeHours: 4.12,
    overThresholdCount: 52,
    underThresholdCount: 60,
    totalProcHours: 8.6,
    avgWaitHours: 0.55,
    totalWaitHours: 61.2,
    colorGrade: 'purple'
  },
  nclos_teamlead_phanbo: {
    elementId: 'nclos_teamlead_phanbo',
    elementName: 'B TEAM LEAD PHAN BO',
    totalInstances: 185,
    avgProcTimeHours: 1.15,
    overThresholdCount: 12,
    underThresholdCount: 173,
    totalProcHours: 3.2,
    avgWaitHours: 0.12,
    totalWaitHours: 22.4,
    colorGrade: 'green'
  },
  nclos_b_thamdinh1: {
    elementId: 'nclos_b_thamdinh1',
    elementName: 'B THAM DINH 1',
    totalInstances: 98,
    avgProcTimeHours: 2.85,
    overThresholdCount: 28,
    underThresholdCount: 70,
    totalProcHours: 5.4,
    avgWaitHours: 0.28,
    totalWaitHours: 27.5,
    colorGrade: 'yellow'
  },
  nclos_b_thamdinh2: {
    elementId: 'nclos_b_thamdinh2',
    elementName: 'B THAM DINH 2',
    totalInstances: 84,
    avgProcTimeHours: 3.8,
    overThresholdCount: 35,
    underThresholdCount: 49,
    totalProcHours: 6.9,
    avgWaitHours: 0.42,
    totalWaitHours: 35.1,
    colorGrade: 'purple'
  },
  nclos_pheduyet_thucdia: {
    elementId: 'nclos_pheduyet_thucdia',
    elementName: 'PHE DUYET DE XUAT THUC DIA',
    totalInstances: 76,
    avgProcTimeHours: 1.95,
    overThresholdCount: 14,
    underThresholdCount: 62,
    totalProcHours: 2.7,
    avgWaitHours: 0.18,
    totalWaitHours: 13.9,
    colorGrade: 'green'
  },
  nclos_thucdia: {
    elementId: 'nclos_thucdia',
    elementName: 'THUC DIA',
    totalInstances: 63,
    avgProcTimeHours: 6.5,
    overThresholdCount: 42,
    underThresholdCount: 21,
    totalProcHours: 14.8,
    avgWaitHours: 1.2,
    totalWaitHours: 75.6,
    colorGrade: 'orange'
  },
  nclos_kiemsoat1: {
    elementId: 'nclos_kiemsoat1',
    elementName: 'B KIEM SOAT CAP 1',
    totalInstances: 104,
    avgProcTimeHours: 2.1,
    overThresholdCount: 19,
    underThresholdCount: 85,
    totalProcHours: 4.1,
    avgWaitHours: 0.22,
    totalWaitHours: 23.0,
    colorGrade: 'green'
  }
};

export const INITIAL_ENDPOINTS: EndpointConfig[] = [
  {
    id: 'ep_1',
    serviceName: 'PSCF TaskView',
    serviceType: 'Task View',
    endpointUrl: 'https://ecm.aws.ecmbpm.vn/api/v1/pscf/tasks/view',
    httpMethod: 'GET',
    authType: 'NONE',
    active: true
  },
  {
    id: 'ep_2',
    serviceName: 'LC VIEW',
    serviceType: 'Task View',
    endpointUrl: 'https://ecm.aws.ecmbpm.vn/api/v1/trade/lc/view',
    httpMethod: 'GET',
    authType: 'NONE',
    active: true
  },
  {
    id: 'ep_3',
    serviceName: 'TFE VIEW',
    serviceType: 'Task View',
    endpointUrl: 'https://ecm.aws.ecmbpm.vn/api/v1/trade/tfe/view',
    httpMethod: 'GET',
    authType: 'NONE',
    active: true
  },
  {
    id: 'ep_4',
    serviceName: 'SCF VIEW',
    serviceType: 'Task View',
    endpointUrl: 'https://ecm.aws.ecmbpm.vn/api/v1/scf/chain/view',
    httpMethod: 'GET',
    authType: 'NONE',
    active: true
  },
  {
    id: 'ep_5',
    serviceName: 'Retail Bio Task View',
    serviceType: 'Task View',
    endpointUrl: 'https://ecm.aws.ecmbpm.vn/api/v1/retail/bio/view',
    httpMethod: 'GET',
    authType: 'NONE',
    active: true
  },
  {
    id: 'ep_6',
    serviceName: 'BPDP View',
    serviceType: 'Task View',
    endpointUrl: 'https://ecm.aws.ecmbpm.vn/api/v1/bpdp/approval/view',
    httpMethod: 'GET',
    authType: 'NONE',
    active: true
  },
  {
    id: 'ep_7',
    serviceName: 'BG TaskView',
    serviceType: 'Task View',
    endpointUrl: 'https://ecm.aws.ecmbpm.vn/api/v1/bank-guarantee/view',
    httpMethod: 'GET',
    authType: 'NONE',
    active: true
  }
];

export const INITIAL_PROCESS_RBAC: ProcessRBACDefinition[] = [
  {
    processKey: 'NCLOS',
    processName: 'NCLOS – Thẩm định & Phê duyệt tín dụng',
    category: 'Tín dụng SME',
    roles: ['NCLOS ADMIN', 'NCLOS CA', 'NCLOS B CO', 'NCLOS SALE', 'NCLOS FA', 'NCLOS B KS2'],
    rolePermissions: [
      { role: 'NCLOS ADMIN', actions: ['VIEW', 'START', 'DEPLOY', 'TERMINATE'] },
      { role: 'NCLOS CA', actions: ['VIEW', 'START'] },
      { role: 'NCLOS B CO', actions: ['VIEW', 'START'] },
      { role: 'NCLOS SALE', actions: ['VIEW', 'START'] },
      { role: 'NCLOS B KS2', actions: ['VIEW'] },
      { role: 'NCLOS FA', actions: ['VIEW'] }
    ],
    totalElements: 33,
    totalQueues: 4
  },
  {
    processKey: 'SDD',
    processName: 'GIẢI NGÂN (SDD) – Vốn lưu động & dự án',
    category: 'Giải ngân & Khế ước',
    roles: ['NCLOS ADMIN', 'NCLOS CA', 'NCLOS B KS2', 'NCLOS SALE', 'NCLOS B TLCO'],
    rolePermissions: [
      { role: 'NCLOS ADMIN', actions: ['VIEW', 'START', 'DEPLOY', 'TERMINATE'] },
      { role: 'NCLOS CA', actions: ['VIEW', 'START'] },
      { role: 'NCLOS B KS2', actions: ['VIEW'] },
      { role: 'NCLOS SALE', actions: ['VIEW', 'START'] },
      { role: 'NCLOS B TLCO', actions: ['VIEW', 'START'] }
    ],
    totalElements: 26,
    totalQueues: 3
  },
  {
    processKey: 'PSCF',
    processName: 'PSCF – Chuỗi tài trợ ô tô sau giải ngân',
    category: 'Tài trợ chuỗi',
    roles: ['NCLOS ADMIN', 'NCLOS SALE', 'NCLOS B CO'],
    rolePermissions: [
      { role: 'NCLOS ADMIN', actions: ['VIEW', 'START', 'DEPLOY', 'TERMINATE'] },
      { role: 'NCLOS SALE', actions: ['VIEW', 'START'] },
      { role: 'NCLOS B CO', actions: ['VIEW'] }
    ],
    totalElements: 13,
    totalQueues: 2
  },
  {
    processKey: 'ISM',
    processName: 'ISM – Quản lý hạn mức tín dụng tập đoàn',
    category: 'Quản trị rủi ro',
    roles: ['NCLOS ADMIN', 'NCLOS CA'],
    rolePermissions: [
      { role: 'NCLOS ADMIN', actions: ['VIEW', 'START', 'DEPLOY', 'TERMINATE'] },
      { role: 'NCLOS CA', actions: ['VIEW'] }
    ],
    totalElements: 7,
    totalQueues: 1
  }
];

export const INITIAL_RBAC_ITEMS: RBACItem[] = [
  { 
    id: 'rbac_1', 
    processKey: 'NCLOS', 
    name: 'Tìm kiếm hồ sơ chung', 
    type: 'Queue', 
    elementType: 'Query · 0 element', 
    roles: ['NCLOS ADMIN'],
    rolePermissions: [
      { role: 'NCLOS ADMIN', actions: ['VIEW', 'EXECUTE', 'REASSIGN'] }
    ],
    filters: 0,
    queryExpression: 'status IN ("ACTIVE", "PENDING")',
    description: 'Hàng đợi tìm kiếm toàn bộ hồ sơ đang hoạt động trên hệ thống'
  },
  { 
    id: 'rbac_2', 
    processKey: 'NCLOS', 
    name: 'B CHUYEN GIA PHE DUYET', 
    type: 'Element', 
    elementType: 'bpmn:userTask', 
    roles: ['NCLOS ADMIN', 'NCLOS B CA'], 
    rolePermissions: [
      { role: 'NCLOS ADMIN', actions: ['VIEW', 'EXECUTE', 'REASSIGN', 'CANCEL'] },
      { role: 'NCLOS B CA', actions: ['VIEW', 'EXECUTE'] }
    ],
    filters: 1,
    filterRules: [
      { id: 'f_1', field: 'loanAmount', operator: '<=', value: '15000000000', expression: 'loanAmount <= 15000000000 VND' }
    ],
    description: 'Chuyên gia cấp cao phê duyệt hạn mức và lãi suất tín dụng đặc biệt'
  },
  { 
    id: 'rbac_3', 
    processKey: 'NCLOS', 
    name: 'B KIEM SOAT CAP 1', 
    type: 'Element', 
    elementType: 'bpmn:userTask', 
    roles: ['NCLOS ADMIN'], 
    rolePermissions: [
      { role: 'NCLOS ADMIN', actions: ['VIEW', 'EXECUTE', 'REASSIGN'] }
    ],
    filters: 0,
    description: 'Kiểm soát hồ sơ tuân thủ quy chuẩn tín dụng sơ bộ'
  },
  { 
    id: 'rbac_4', 
    processKey: 'NCLOS', 
    name: 'B KIEM SOAT CAP 2', 
    type: 'Element', 
    elementType: 'bpmn:userTask', 
    roles: ['NCLOS B KS2'], 
    rolePermissions: [
      { role: 'NCLOS B KS2', actions: ['VIEW', 'EXECUTE'] }
    ],
    filters: 0,
    description: 'Kiểm soát viên chuyên trách thẩm định pháp lý và điều kiện giải ngân'
  },
  { 
    id: 'rbac_5', 
    processKey: 'NCLOS', 
    name: 'B TEAM LEAD PHAN BO', 
    type: 'Element', 
    elementType: 'bpmn:userTask', 
    roles: ['NCLOS B TLCO'], 
    rolePermissions: [
      { role: 'NCLOS B TLCO', actions: ['VIEW', 'EXECUTE', 'REASSIGN'] }
    ],
    filters: 0,
    description: 'Trưởng nhóm thẩm định phân bổ hồ sơ cho chuyên viên theo tải công việc'
  },
  { 
    id: 'rbac_6', 
    processKey: 'NCLOS', 
    name: 'B THAM DINH 1', 
    type: 'Element', 
    elementType: 'bpmn:userTask', 
    roles: ['NCLOS B CO'], 
    rolePermissions: [
      { role: 'NCLOS B CO', actions: ['VIEW', 'EXECUTE'] }
    ],
    filters: 0,
    description: 'Thẩm định hồ sơ khách hàng, phân tích báo cáo tài chính và lưu chuyển tiền tệ'
  },
  { 
    id: 'rbac_7', 
    processKey: 'NCLOS', 
    name: 'B THAM DINH 2', 
    type: 'Element', 
    elementType: 'bpmn:userTask', 
    roles: ['NCLOS B CO'], 
    rolePermissions: [
      { role: 'NCLOS B CO', actions: ['VIEW', 'EXECUTE'] }
    ],
    filters: 0,
    description: 'Thẩm định tài sản bảo đảm và phương án kinh doanh dự kiến'
  },
  { 
    id: 'rbac_8', 
    processKey: 'NCLOS', 
    name: 'B THU KY HDTD', 
    type: 'Element', 
    elementType: 'bpmn:userTask', 
    roles: ['NCLOS B TK'], 
    rolePermissions: [
      { role: 'NCLOS B TK', actions: ['VIEW', 'EXECUTE'] }
    ],
    filters: 0,
    description: 'Thư ký Hội đồng tín dụng tổng hợp tờ trình và nghị quyết phê duyệt'
  },
  { 
    id: 'rbac_9', 
    processKey: 'NCLOS', 
    name: 'BO SUNG HO SO SME', 
    type: 'Element', 
    elementType: 'bpmn:userTask', 
    roles: ['NCLOS SALE'], 
    rolePermissions: [
      { role: 'NCLOS SALE', actions: ['VIEW', 'EXECUTE'] }
    ],
    filters: 0,
    description: 'Yêu cầu doanh nghiệp SME bổ sung tài liệu và chứng từ chứng minh tài chính'
  },
  { 
    id: 'rbac_10', 
    processKey: 'NCLOS', 
    name: 'CBBH NHAP THONG TIN', 
    type: 'Element', 
    elementType: 'bpmn:userTask', 
    roles: ['NCLOS SALE'], 
    rolePermissions: [
      { role: 'NCLOS SALE', actions: ['VIEW', 'EXECUTE'] }
    ],
    filters: 0,
    description: 'Cán bộ quản lý quan hệ khách hàng nhập liệu sơ bộ đề xuất vay'
  },
  { 
    id: 'rbac_11', 
    processKey: 'NCLOS', 
    name: 'HOAN THANH', 
    type: 'Element', 
    elementType: 'bpmn:userTask', 
    roles: ['NCLOS SALE', 'NCLOS ADMIN'], 
    rolePermissions: [
      { role: 'NCLOS SALE', actions: ['VIEW'] },
      { role: 'NCLOS ADMIN', actions: ['VIEW'] }
    ],
    filters: 0,
    description: 'Thông báo kết quả và đóng quy trình thẩm định'
  },
  { 
    id: 'rbac_12', 
    processKey: 'NCLOS', 
    name: 'PHE DUYET', 
    type: 'Element', 
    elementType: 'bpmn:userTask', 
    roles: ['NCLOS CA'], 
    rolePermissions: [
      { role: 'NCLOS CA', actions: ['VIEW', 'EXECUTE', 'CANCEL'] }
    ],
    filters: 0,
    description: 'Cấp có thẩm quyền phê duyệt phê duyệt cấp tín dụng chính thức'
  },
  { 
    id: 'rbac_13', 
    processKey: 'NCLOS', 
    name: 'PHE DUYET DE XUAT THUC DIA', 
    type: 'Element', 
    elementType: 'bpmn:userTask', 
    roles: ['NCLOS FA'], 
    rolePermissions: [
      { role: 'NCLOS FA', actions: ['VIEW', 'EXECUTE'] }
    ],
    filters: 0,
    description: 'Phê duyệt kế hoạch khảo sát thực tế cơ sở sản xuất kinh doanh'
  },
];

export const INITIAL_USERS: UserAccount[] = [
  { id: 'u_1', username: 'daohanh', fullName: 'Đào Hạnh (Admin)', email: 'daohanh.forwork@gmail.com', department: 'BPM Center of Excellence', roles: ['SUPER_ADMIN', 'NCLOS ADMIN'], status: 'ACTIVE', lastLogin: '19/05/2026 14:27' },
  { id: 'u_2', username: 'tambv', fullName: 'Bùi Văn Tâm', email: 'tambv@ecmbpm.vn', department: 'Khối Quản trị Tín dụng SME', roles: ['NCLOS CA', 'NCLOS ADMIN'], status: 'ACTIVE', lastLogin: '19/05/2026 14:15' },
  { id: 'u_3', username: 'lannt', fullName: 'Nguyễn Thị Lan', email: 'lannt@ecmbpm.vn', department: 'Phòng Thẩm định Tín dụng 1', roles: ['NCLOS B CO'], status: 'ACTIVE', lastLogin: '19/05/2026 13:50' },
  { id: 'u_4', username: 'minhhp', fullName: 'Hoàng Phúc Minh', email: 'minhhp@ecmbpm.vn', department: 'Phòng Kiểm soát Tín dụng', roles: ['NCLOS B KS2'], status: 'ACTIVE', lastLogin: '19/05/2026 12:40' },
  { id: 'u_5', username: 'tuandm', fullName: 'Đặng Minh Tuấn', email: 'tuandm@ecmbpm.vn', department: 'Khối Khách hàng Doanh nghiệp', roles: ['NCLOS SALE'], status: 'ACTIVE', lastLogin: '19/05/2026 14:02' },
  { id: 'u_6', username: 'ngocdt', fullName: 'Đỗ Thị Ngọc', email: 'ngocdt@ecmbpm.vn', department: 'Ban Thư ký Hội đồng Tín dụng', roles: ['NCLOS B TK'], status: 'ACTIVE', lastLogin: '18/05/2026 17:30' },
  { id: 'u_7', username: 'quangnv', fullName: 'Nguyễn Văn Quang', email: 'quangnv@ecmbpm.vn', department: 'Chi nhánh Sài Gòn', roles: ['NCLOS SALE'], status: 'LOCKED', lastLogin: '10/05/2026 08:20' },
  { id: 'u_8', username: 'thuyptt', fullName: 'Phạm Thị Thu Thủy', email: 'thuyptt@ecmbpm.vn', department: 'Chi nhánh Hà Nội', roles: ['NCLOS B CO'], status: 'LOCKED', lastLogin: '05/05/2026 16:00' },
];

export const INITIAL_ALLOCATION_RULES: AllocationRule[] = [
  {
    id: 'alloc_1',
    name: 'Phân bổ thẩm định theo tải công việc (Workload Balancing)',
    processKey: 'NCLOS',
    stepName: 'B THAM DINH 1',
    strategy: 'WORKLOAD_BALANCING',
    targetGroup: 'NCLOS B CO',
    maxActivePerUser: 5,
    autoEscalateHours: 4,
    active: true
  },
  {
    id: 'alloc_2',
    name: 'Phân bổ tiếp nhận hồ sơ vòng tròn (Round Robin)',
    processKey: 'SDD',
    stepName: 'TIEP NHAN HO SO',
    strategy: 'ROUND_ROBIN',
    targetGroup: 'NCLOS B TLCO',
    maxActivePerUser: 8,
    autoEscalateHours: 2,
    active: true
  },
  {
    id: 'alloc_3',
    name: 'Phân bổ thẩm định chuyên sâu theo kỹ năng (Skill-based)',
    processKey: 'SDD',
    stepName: 'KSV CSO PHE DUYET',
    strategy: 'SKILL_BASED',
    targetGroup: 'NCLOS CA',
    maxActivePerUser: 3,
    autoEscalateHours: 12,
    active: true
  }
];

export const INITIAL_RBAC_AUDIT_LOGS: RBACAuditLogEntry[] = [
  {
    id: 'audit_1001',
    timestamp: '19/05/2026 14:35:12',
    actor: 'tambv (Bùi Văn Tâm)',
    actorRole: 'NCLOS ADMIN',
    processKey: 'NCLOS',
    targetType: 'Element',
    targetName: 'B CHUYEN GIA PHE DUYET',
    actionType: 'ROLE_ASSIGNED',
    details: 'Gán vai trò [NCLOS B CA] với các quyền thực thi [VIEW, EXECUTE]',
    previousState: 'Roles: [NCLOS ADMIN]',
    newState: 'Roles: [NCLOS ADMIN, NCLOS B CA]'
  },
  {
    id: 'audit_1002',
    timestamp: '19/05/2026 14:22:45',
    actor: 'daohanh (Admin CoE)',
    actorRole: 'SUPER_ADMIN',
    processKey: 'NCLOS',
    targetType: 'Element',
    targetName: 'B CHUYEN GIA PHE DUYET',
    actionType: 'FILTER_MODIFIED',
    details: 'Cập nhật bộ lọc điều kiện thực thi: loanAmount <= 15000000000 VND',
    previousState: 'Filter: None',
    newState: 'Filter: loanAmount <= 15000000000 VND'
  },
  {
    id: 'audit_1003',
    timestamp: '19/05/2026 13:58:30',
    actor: 'tambv (Bùi Văn Tâm)',
    actorRole: 'NCLOS ADMIN',
    processKey: 'NCLOS',
    targetType: 'Queue',
    targetName: 'Hàng đợi hồ sơ VIP SME',
    actionType: 'QUEUE_CREATED',
    details: 'Tạo mới work queue lọc hồ sơ hạn mức >= 5,000,000,000 VND gán cho [NCLOS ADMIN, NCLOS CA]',
    newState: 'Queue: Hàng đợi hồ sơ VIP SME (amount >= 5B)'
  },
  {
    id: 'audit_1004',
    timestamp: '19/05/2026 12:45:10',
    actor: 'daohanh (Admin CoE)',
    actorRole: 'SUPER_ADMIN',
    processKey: 'SDD',
    targetType: 'Process',
    targetName: 'GIẢI NGÂN (SDD)',
    actionType: 'PROCESS_PERM_UPDATED',
    details: 'Cấp quyền [START, VIEW, DEPLOY] trên toàn bộ quy trình cho [NCLOS B TLCO]',
    previousState: 'Actions: [VIEW]',
    newState: 'Actions: [START, VIEW, DEPLOY]'
  },
  {
    id: 'audit_1005',
    timestamp: '19/05/2026 11:10:04',
    actor: 'tambv (Bùi Văn Tâm)',
    actorRole: 'NCLOS ADMIN',
    processKey: 'NCLOS',
    targetType: 'Element',
    targetName: 'PHE DUYET',
    actionType: 'ACTION_UPDATED',
    details: 'Bổ sung quyền [CANCEL] (Từ chối/hủy hồ sơ) cho vai trò [NCLOS CA]',
    previousState: 'Actions: [VIEW, EXECUTE]',
    newState: 'Actions: [VIEW, EXECUTE, CANCEL]'
  },
  {
    id: 'audit_1006',
    timestamp: '18/05/2026 16:30:20',
    actor: 'tambv (Bùi Văn Tâm)',
    actorRole: 'NCLOS ADMIN',
    processKey: 'NCLOS',
    targetType: 'Element',
    targetName: 'BO SUNG HO SO SME',
    actionType: 'ROLE_ASSIGNED',
    details: 'Phân quyền tiếp nhận bổ sung tài liệu cho vai trò [NCLOS SALE]',
    previousState: 'Roles: []',
    newState: 'Roles: [NCLOS SALE]'
  }
];
