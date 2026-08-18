export const DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT'
} as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export const VoucherScope = {
  SYSTEM: 'SYSTEM',
  VENUE: 'VENUE'
} as const;
export type VoucherScope = (typeof VoucherScope)[keyof typeof VoucherScope];

export const VoucherStatus = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
  EXPIRED: 'EXPIRED'
} as const;
export type VoucherStatus = (typeof VoucherStatus)[keyof typeof VoucherStatus];

export interface Voucher {
  id: string;
  name: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  maxUsagePerUser: number;
  startDate: string;
  endDate: string;
  totalQuantity: number;
  collectedQuantity: number;
  usedQuantity: number;
  voucherScope: VoucherScope;
  status: VoucherStatus;
  bannerImageUrl: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
  
  remainingQuantity: number;
  usageRate: number;
  conversionRate: number;
  isExpired: boolean;
  venueIds: string[] | null;
  venueNames: string[] | null;
}

export interface CreateVoucherRequest {
  name: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount: number;
  startDate: string;
  endDate: string;
  totalQuantity: number;
  bannerImageUrl: string;
}

export interface UpdateVoucherRequest {
  name?: string;
  totalQuantity?: number;
  endDate?: string;
  bannerImageUrl?: string;
}

export interface VoucherPageResponse {
  content: Voucher[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
