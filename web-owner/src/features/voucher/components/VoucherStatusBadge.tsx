import React from 'react';
import { VoucherStatus } from '../types/voucher.types';

interface VoucherStatusBadgeProps {
  status: VoucherStatus;
  isExpired: boolean;
}

export const VoucherStatusBadge: React.FC<VoucherStatusBadgeProps> = ({ status, isExpired }) => {
  if (isExpired && status !== VoucherStatus.DISABLED) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-700">
        Đã hết hạn
      </span>
    );
  }

  switch (status) {
    case VoucherStatus.ACTIVE:
      return (
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
          Đang hoạt động
        </span>
      );
    case VoucherStatus.DISABLED:
      return (
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700">
          Đã vô hiệu
        </span>
      );
    case VoucherStatus.EXPIRED:
      return (
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-700">
          Đã hết hạn
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700">
          {status}
        </span>
      );
  }
};
