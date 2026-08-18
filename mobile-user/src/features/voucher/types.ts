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
  voucherScope: VoucherScope;
  status: VoucherStatus;
  bannerImageUrl: string | null;
  ownerId: string | null;
  createdAt: string;
  isExpired: boolean;
  venueNames: string[] | null;
}

export interface UserVoucher {
  id: string;
  voucherId: string;
  voucher: Voucher;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
  collectedAt: string;
  usedAt: string | null;
  bookingId: string | null;
}
