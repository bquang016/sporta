export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT'
}

export enum VoucherScope {
  SYSTEM = 'SYSTEM',
  VENUE = 'VENUE'
}

export enum VoucherStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  EXPIRED = 'EXPIRED'
}

export interface Voucher {
  id: string;
  name: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  startDate: string;
  endDate: string;
  totalQuantity: number;
  usedQuantity: number;
  collectedQuantity?: number;
  remainingQuantity?: number;
  voucherScope: VoucherScope;
  status: VoucherStatus;
  bannerImageUrl: string | null;
  ownerId: string | null;
  createdAt: string;
  maxUsagePerUser?: number;
  isExpired: boolean;
  venueIds?: string[] | null;
  venueNames: string[] | null;
}

export interface UserVoucher {
  id: string;
  voucherId: string;
  voucherName?: string;
  voucherCode?: string;
  discountType?: DiscountType;
  discountValue?: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number;
  voucherScope?: VoucherScope;
  startDate?: string;
  endDate?: string;
  status: 'COLLECTED' | 'ACTIVE' | 'USED' | 'EXPIRED';
  collectedAt: string;
  usedAt?: string | null;
  isUsable?: boolean;
  reasonIfNotUsable?: string | null;
  venueIds?: string[] | null;
  venueNames?: string[] | null;
  ownerId?: string | null;
  bannerImageUrl?: string | null;
  totalQuantity?: number;
  usedQuantity?: number;
  remainingQuantity?: number;
  bookingId?: string | null;
  voucher?: Voucher;
}
