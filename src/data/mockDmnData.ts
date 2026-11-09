import { DMNDecisionDefinition } from '../types/dmn';

export const INITIAL_DMN_DECISIONS: DMNDecisionDefinition[] = [
  {
    id: 'dec_credit_scoring',
    key: 'creditScoreDMN',
    name: 'Đánh Giá Điểm Tín Dụng & Hạn Mức Tối Đa (SME & Retail)',
    hitPolicy: 'FIRST',
    description: 'Quy tắc ma trận chấm điểm CIC, DTI và tính toán hạn mức phê duyệt tự động (STP)',
    version: 2,
    engine: 'Camunda',
    inputs: [
      {
        id: 'in_cic',
        label: 'Điểm Tín Dụng CIC',
        expression: 'cicScore',
        typeRef: 'number',
        description: 'Điểm trả về từ cổng quốc gia CIC (0 - 850)'
      },
      {
        id: 'in_income',
        label: 'Thu Nhập Hàng Tháng (VND)',
        expression: 'monthlyIncome',
        typeRef: 'number',
        description: 'Thu nhập ròng sau thuế chứng minh được'
      },
      {
        id: 'in_dti',
        label: 'Tỷ Lệ DTI (Nợ / Thu Nhập)',
        expression: 'debtToIncomeRatio',
        typeRef: 'number',
        description: 'Tổng nghĩa vụ nợ hàng tháng chia thu nhập'
      },
      {
        id: 'in_collateral',
        label: 'Tài Sản Bảo Đảm',
        expression: 'collateralType',
        typeRef: 'string',
        allowedValues: ['BẤT ĐỘNG SẢN', 'SỔ TIẾT KIỆM', 'PHƯƠNG TIỆN', 'TÍN CHẤP']
      }
    ],
    outputs: [
      {
        id: 'out_result',
        label: 'Kết Quả Thẩm Định',
        name: 'decisionResult',
        typeRef: 'string',
        allowedValues: ['APPROVED', 'REFER', 'REJECTED']
      },
      {
        id: 'out_limit',
        label: 'Hạn Mức Đề Xuất (VND)',
        name: 'maxLoanLimitVND',
        typeRef: 'number'
      },
      {
        id: 'out_discount',
        label: 'Ưu Đãi Lãi Suất (%)',
        name: 'interestDiscountPct',
        typeRef: 'number'
      },
      {
        id: 'out_authority',
        label: 'Cấp Thẩm Quyền Phê Duyệt',
        name: 'approvalAuthority',
        typeRef: 'string',
        allowedValues: ['AUTO_STP', 'TRƯỞNG PHÒNG TÍN DỤNG', 'HỘI ĐỒNG TÍN DỤNG']
      }
    ],
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
          out_limit: 2000000000,
          out_discount: 1.5,
          out_authority: 'AUTO_STP'
        },
        annotation: 'Khách hàng VIP Hạng A+: Đạt chuẩn phê duyệt tự động thẳng STP không cần hội đồng'
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
          out_limit: 1000000000,
          out_discount: 1.0,
          out_authority: 'AUTO_STP'
        },
        annotation: 'Khách hàng chuẩn có TSĐB thanh khoản cao: Phê duyệt nhanh giải ngân 2h'
      },
      {
        id: 'rule_3',
        ruleNumber: 3,
        inputEntries: {
          in_cic: '>= 650',
          in_income: '>= 20000000',
          in_dti: '<= 0.50',
          in_collateral: '"BẤT ĐỘNG SẢN"'
        },
        outputEntries: {
          out_result: 'APPROVED',
          out_limit: 800000000,
          out_discount: 0.5,
          out_authority: 'TRƯỞNG PHÒNG TÍN DỤNG'
        },
        annotation: 'Khách hàng nhóm chuẩn: Trưởng phòng tín dụng thẩm định và phê duyệt'
      },
      {
        id: 'rule_4',
        ruleNumber: 4,
        inputEntries: {
          in_cic: '>= 600',
          in_income: '>= 15000000',
          in_dti: '<= 0.55',
          in_collateral: '"PHƯƠNG TIỆN"'
        },
        outputEntries: {
          out_result: 'REFER',
          out_limit: 400000000,
          out_discount: 0.0,
          out_authority: 'TRƯỞNG PHÒNG TÍN DỤNG'
        },
        annotation: 'DTI tiệm cận ngưỡng trần: Yêu cầu bổ sung sao kê tài khoản 6 tháng gần nhất'
      },
      {
        id: 'rule_5',
        ruleNumber: 5,
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
        annotation: 'Từ chối tự động: Điểm tín dụng CIC dưới mức xếp hạng an toàn quy định của NHNN'
      },
      {
        id: 'rule_6',
        ruleNumber: 6,
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
        annotation: 'Từ chối: Thu nhập không đạt ngưỡng tối thiểu quy định gói vay SME'
      }
    ]
  },
  {
    id: 'dec_pricing_matrix',
    key: 'pricingMatrixDMN',
    name: 'Ma Trận Định Giá Lãi Suất Tín Dụng SME (Pricing Matrix)',
    hitPolicy: 'UNIQUE',
    description: 'Xác định biên độ lãi suất cơ sở dựa trên xếp hạng phân khúc và kỳ hạn vay',
    version: 1,
    engine: 'Camunda',
    inputs: [
      {
        id: 'in_tenor',
        label: 'Kỳ Hạn Vay (Tháng)',
        expression: 'loanTenorMonths',
        typeRef: 'number',
        description: 'Thời hạn cam kết hợp đồng tín dụng'
      },
      {
        id: 'in_tier',
        label: 'Phân Khúc Doanh Nghiệp',
        expression: 'customerTier',
        typeRef: 'string',
        allowedValues: ['DIAMOND', 'GOLD', 'SILVER', 'STANDARD']
      }
    ],
    outputs: [
      {
        id: 'out_base_rate',
        label: 'Lãi Suất Cơ Sở (%/năm)',
        name: 'baseInterestRate',
        typeRef: 'number'
      },
      {
        id: 'out_spread',
        label: 'Biên Độ Cộng Thêm (%)',
        name: 'spreadPct',
        typeRef: 'number'
      },
      {
        id: 'out_total_rate',
        label: 'Lãi Suất Áp Dụng Cuối (%/năm)',
        name: 'finalInterestRate',
        typeRef: 'number'
      }
    ],
    rules: [
      {
        id: 'pm_1',
        ruleNumber: 1,
        inputEntries: {
          in_tenor: '<= 12',
          in_tier: '"DIAMOND"'
        },
        outputEntries: {
          out_base_rate: 6.5,
          out_spread: 1.0,
          out_total_rate: 7.5
        },
        annotation: 'Ngắn hạn Diamond: Lãi suất cạnh tranh nhất thị trường'
      },
      {
        id: 'pm_2',
        ruleNumber: 2,
        inputEntries: {
          in_tenor: '<= 12',
          in_tier: '"GOLD"'
        },
        outputEntries: {
          out_base_rate: 6.5,
          out_spread: 1.8,
          out_total_rate: 8.3
        },
        annotation: 'Ngắn hạn Gold: Biên độ tiêu chuẩn ưu đãi'
      },
      {
        id: 'pm_3',
        ruleNumber: 3,
        inputEntries: {
          in_tenor: '> 12',
          in_tier: '"DIAMOND"'
        },
        outputEntries: {
          out_base_rate: 7.2,
          out_spread: 1.5,
          out_total_rate: 8.7
        },
        annotation: 'Trung dài hạn Diamond: Áp dụng lãi suất thả nổi điều chỉnh 3 tháng/lần'
      },
      {
        id: 'pm_4',
        ruleNumber: 4,
        inputEntries: {
          in_tenor: '> 12',
          in_tier: '"STANDARD"'
        },
        outputEntries: {
          out_base_rate: 7.2,
          out_spread: 3.2,
          out_total_rate: 10.4
        },
        annotation: 'Trung dài hạn Standard: Bù đắp chi phí vốn và rủi ro thời gian'
      }
    ]
  },
  {
    id: 'dec_auto_approval',
    key: 'autoApprovalEligibilityDMN',
    name: 'Bộ Lọc Phê Duyệt Nhanh STP (Straight-Through Processing)',
    hitPolicy: 'FIRST',
    description: 'Quy tắc phân luồng hồ sơ tự động duyệt thẳng không cần can thiệp thủ công',
    version: 1,
    engine: 'Camunda',
    inputs: [
      {
        id: 'in_bad_debt',
        label: 'Có Nợ Xấu Lịch Sử 3 Năm',
        expression: 'hasCicBadDebt',
        typeRef: 'boolean'
      },
      {
        id: 'in_bio',
        label: 'Xác Thực Sinh Trắc BCA',
        expression: 'kycBiometricPassed',
        typeRef: 'boolean'
      },
      {
        id: 'in_amount',
        label: 'Số Tiền Đề Xuất (VND)',
        expression: 'loanAmountVND',
        typeRef: 'number'
      }
    ],
    outputs: [
      {
        id: 'out_stp',
        label: 'Đủ Tiêu Chuẩn Duyệt STP',
        name: 'eligibleForSTP',
        typeRef: 'boolean'
      },
      {
        id: 'out_queue',
        label: 'Hàng Đợi Điều Phối',
        name: 'routingQueue',
        typeRef: 'string'
      }
    ],
    rules: [
      {
        id: 'stp_1',
        ruleNumber: 1,
        inputEntries: {
          in_bad_debt: 'false',
          in_bio: 'true',
          in_amount: '<= 100000000'
        },
        outputEntries: {
          out_stp: true,
          out_queue: '"AUTO_DISBURSEMENT_QUEUE"'
        },
        annotation: 'Hồ sơ tiêu dùng dưới 100 triệu xác thực sinh trắc thành công: Duyệt tự động'
      },
      {
        id: 'stp_2',
        ruleNumber: 2,
        inputEntries: {
          in_bad_debt: 'true',
          in_bio: '-',
          in_amount: '-'
        },
        outputEntries: {
          out_stp: false,
          out_queue: '"REJECT_QUEUE"'
        },
        annotation: 'Có nợ xấu nhóm 2-5: Chuyển hàng đợi từ chối'
      },
      {
        id: 'stp_3',
        ruleNumber: 3,
        inputEntries: {
          in_bad_debt: '-',
          in_bio: '-',
          in_amount: '-'
        },
        outputEntries: {
          out_stp: false,
          out_queue: '"MANUAL_UNDERWRITING_QUEUE"'
        },
        annotation: 'Các trường hợp còn lại: Chuyển thẩm định viên xử lý thủ công'
      }
    ]
  }
];
