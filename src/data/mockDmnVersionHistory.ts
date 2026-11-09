import { DMNVersionSnapshot, DMNDecisionDefinition } from '../types/dmn';
import { INITIAL_DMN_DECISIONS } from './mockDmnData';

// Deep clone helper
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

// Historical decision v1.0 for creditScoreDMN
const creditScoreDMN_v1_0: DMNDecisionDefinition = {
  ...clone(INITIAL_DMN_DECISIONS[0]),
  version: 1,
  description: 'Phiên bản khởi tạo v1.0: Đánh giá điểm CIC và Thu nhập cơ bản (Hạn mức tối đa 1.5 tỷ VND)',
  rules: [
    {
      id: 'rule_1',
      ruleNumber: 1,
      inputEntries: {
        in_cic: '>= 700',
        in_income: '>= 40000000',
        in_dti: '<= 0.40',
        in_collateral: '"BẤT ĐỘNG SẢN"'
      },
      outputEntries: {
        out_result: 'APPROVED',
        out_limit: 1500000000,
        out_discount: 1.0,
        out_authority: 'AUTO_STP'
      },
      annotation: 'Khách hàng VIP Hạng A: Phê duyệt hạn mức 1.5 tỷ VND'
    },
    {
      id: 'rule_2',
      ruleNumber: 2,
      inputEntries: {
        in_cic: '>= 650',
        in_income: '>= 20000000',
        in_dti: '<= 0.50',
        in_collateral: '"PHƯƠNG TIỆN"'
      },
      outputEntries: {
        out_result: 'REFER',
        out_limit: 500000000,
        out_discount: 0.5,
        out_authority: 'TRƯỞNG PHÒNG TÍN DỤNG'
      },
      annotation: 'Hồ sơ tiêu chuẩn: Thẩm định viên xem xét duyệt hạn mức 500 triệu'
    },
    {
      id: 'rule_5',
      ruleNumber: 3,
      inputEntries: {
        in_cic: '< 580',
        in_income: '-',
        in_dti: '-',
        in_collateral: '-'
      },
      outputEntries: {
        out_result: 'REJECTED',
        out_limit: 0,
        out_discount: 0.0,
        out_authority: 'AUTO_STP'
      },
      annotation: 'Từ chối tự động do điểm CIC dưới 580'
    },
    {
      id: 'rule_6',
      ruleNumber: 4,
      inputEntries: {
        in_cic: '-',
        in_income: '< 8000000',
        in_dti: '-',
        in_collateral: '-'
      },
      outputEntries: {
        out_result: 'REJECTED',
        out_limit: 0,
        out_discount: 0.0,
        out_authority: 'AUTO_STP'
      },
      annotation: 'Từ chối tự động do thu nhập ròng dưới 8 triệu VND'
    }
  ]
};

// Historical decision v1.1 for creditScoreDMN
const creditScoreDMN_v1_1: DMNDecisionDefinition = {
  ...clone(INITIAL_DMN_DECISIONS[0]),
  version: 1,
  description: 'Phiên bản v1.1: Bổ sung phê duyệt cho tài sản Sổ Tiết Kiệm và nâng biên độ CIC',
  rules: [
    {
      id: 'rule_1',
      ruleNumber: 1,
      inputEntries: {
        in_cic: '>= 720',
        in_income: '>= 50000000',
        in_dti: '<= 0.35',
        in_collateral: '"BẤT ĐỘNG SẢN"'
      },
      outputEntries: {
        out_result: 'APPROVED',
        out_limit: 1800000000,
        out_discount: 1.2,
        out_authority: 'AUTO_STP'
      },
      annotation: 'Khách hàng VIP Hạng A+: Hạn mức 1.8 tỷ'
    },
    {
      id: 'rule_2',
      ruleNumber: 2,
      inputEntries: {
        in_cic: '>= 680',
        in_income: '>= 30000000',
        in_dti: '<= 0.45',
        in_collateral: '"SỔ TIẾT KIỆM"'
      },
      outputEntries: {
        out_result: 'APPROVED',
        out_limit: 800000000,
        out_discount: 0.8,
        out_authority: 'AUTO_STP'
      },
      annotation: 'Phê duyệt tài sản Sổ Tiết Kiệm 800 triệu'
    },
    {
      id: 'rule_3',
      ruleNumber: 3,
      inputEntries: {
        in_cic: '>= 640',
        in_income: '>= 15000000',
        in_dti: '<= 0.55',
        in_collateral: '"PHƯƠNG TIỆN"'
      },
      outputEntries: {
        out_result: 'REFER',
        out_limit: 500000000,
        out_discount: 0.5,
        out_authority: 'TRƯỞNG PHÒNG TÍN DỤNG'
      },
      annotation: 'Thẩm định hồ sơ phương tiện 500 triệu'
    },
    {
      id: 'rule_5',
      ruleNumber: 4,
      inputEntries: {
        in_cic: '< 600',
        in_income: '-',
        in_dti: '-',
        in_collateral: '-'
      },
      outputEntries: {
        out_result: 'REJECTED',
        out_limit: 0,
        out_discount: 0.0,
        out_authority: 'AUTO_STP'
      },
      annotation: 'Từ chối: Điểm CIC dưới 600'
    },
    {
      id: 'rule_6',
      ruleNumber: 5,
      inputEntries: {
        in_cic: '-',
        in_income: '< 10000000',
        in_dti: '-',
        in_collateral: '-'
      },
      outputEntries: {
        out_result: 'REJECTED',
        out_limit: 0,
        out_discount: 0.0,
        out_authority: 'AUTO_STP'
      },
      annotation: 'Từ chối: Thu nhập dưới 10 triệu VND'
    }
  ]
};

// Historical decision v0.9 for pricingMatrixDMN
const pricingMatrixDMN_v0_9: DMNDecisionDefinition = {
  ...clone(INITIAL_DMN_DECISIONS[1]),
  version: 0,
  description: 'Bản thảo v0.9: Biểu lãi suất cơ bản ban đầu áp dụng kỳ hạn <= 12 tháng',
  rules: [
    {
      id: 'pm_1',
      ruleNumber: 1,
      inputEntries: {
        in_tenor: '<= 12',
        in_tier: '"DIAMOND"'
      },
      outputEntries: {
        out_base_rate: 6.8,
        out_spread: 1.2,
        out_total_rate: 8.0
      },
      annotation: 'Lãi suất ban đầu Diamond'
    },
    {
      id: 'pm_2',
      ruleNumber: 2,
      inputEntries: {
        in_tenor: '<= 12',
        in_tier: '"GOLD"'
      },
      outputEntries: {
        out_base_rate: 6.8,
        out_spread: 2.0,
        out_total_rate: 8.8
      },
      annotation: 'Lãi suất ban đầu Gold'
    }
  ]
};

// Initial version history dictionary mapped by decision key
export const INITIAL_DMN_VERSION_HISTORY: Record<string, DMNVersionSnapshot[]> = {
  creditScoreDMN: [
    {
      id: 'snap_cs_v2_0',
      decisionKey: 'creditScoreDMN',
      versionTag: 'v2.0',
      versionNumber: 2,
      createdAt: '2026-11-04T10:00:00Z',
      author: {
        name: 'Lê Hoàng Long',
        role: 'Chief Risk Officer (CRO)',
        email: 'long.lh@bank.vn'
      },
      summary: 'Ban hành chính thức ma trận tín dụng v2.0: Cấp hạn mức VIP STP 2 Tỷ và chuẩn hóa nợ xấu',
      decision: clone(INITIAL_DMN_DECISIONS[0]),
      isCurrent: true
    },
    {
      id: 'snap_cs_v1_1',
      decisionKey: 'creditScoreDMN',
      versionTag: 'v1.1',
      versionNumber: 1.1,
      createdAt: '2026-10-28T14:15:00Z',
      author: {
        name: 'Nguyễn Thị Mai',
        role: 'Senior Credit Risk Specialist',
        email: 'mai.nt@bank.vn'
      },
      summary: 'Tối ưu quy tắc phân luồng, bổ sung điều kiện Tài sản bảo đảm Sổ tiết kiệm 800 Triệu',
      decision: creditScoreDMN_v1_1,
      isCurrent: false
    },
    {
      id: 'snap_cs_v1_0',
      decisionKey: 'creditScoreDMN',
      versionTag: 'v1.0',
      versionNumber: 1,
      createdAt: '2026-10-18T08:30:00Z',
      author: {
        name: 'Trần Văn Hoàng',
        role: 'BPM Lead Architect',
        email: 'hoang.tv@bank.vn'
      },
      summary: 'Khởi tạo bảng quyết định DMN chấm điểm tín dụng CIC và thu nhập phiên bản v1.0',
      decision: creditScoreDMN_v1_0,
      isCurrent: false
    }
  ],
  pricingMatrixDMN: [
    {
      id: 'snap_pm_v1_0',
      decisionKey: 'pricingMatrixDMN',
      versionTag: 'v1.0',
      versionNumber: 1,
      createdAt: '2026-11-01T09:00:00Z',
      author: {
        name: 'Phạm Minh Đức',
        role: 'Treasury & Pricing Lead',
        email: 'duc.pm@bank.vn'
      },
      summary: 'Hoàn thiện bảng định giá lãi suất cơ sở và biên độ rủi ro theo 4 phân khúc doanh nghiệp',
      decision: clone(INITIAL_DMN_DECISIONS[1]),
      isCurrent: true
    },
    {
      id: 'snap_pm_v0_9',
      decisionKey: 'pricingMatrixDMN',
      versionTag: 'v0.9',
      versionNumber: 0.9,
      createdAt: '2026-10-15T11:20:00Z',
      author: {
        name: 'Vũ Thanh Hằng',
        role: 'Pricing Analyst',
        email: 'hang.vt@bank.vn'
      },
      summary: 'Bản thảo ban đầu: Thử nghiệm định giá lãi suất kỳ hạn ngắn 12 tháng',
      decision: pricingMatrixDMN_v0_9,
      isCurrent: false
    }
  ],
  autoApprovalEligibilityDMN: [
    {
      id: 'snap_aa_v1_0',
      decisionKey: 'autoApprovalEligibilityDMN',
      versionTag: 'v1.0',
      versionNumber: 1,
      createdAt: '2026-11-03T16:45:00Z',
      author: {
        name: 'Nguyễn Quốc Bảo',
        role: 'Digital Lending Product Owner',
        email: 'bao.nq@bank.vn'
      },
      summary: 'Quy chuẩn phân luồng phê duyệt tự động thẳng STP tích hợp dữ liệu sinh trắc học BCA',
      decision: clone(INITIAL_DMN_DECISIONS[2]),
      isCurrent: true
    }
  ]
};
