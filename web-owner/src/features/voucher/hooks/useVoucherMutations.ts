import { useState } from 'react';
import { voucherApi } from '../services/voucherApi';
import type { CreateVoucherRequest, UpdateVoucherRequest } from '../types/voucher.types';

export function useVoucherMutations() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVoucher = async (data: CreateVoucherRequest) => {
    try {
      setSubmitting(true);
      setError(null);
      await voucherApi.createVoucher(data);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi tạo mã khuyến mãi';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const updateVoucher = async (id: string, data: UpdateVoucherRequest) => {
    try {
      setSubmitting(true);
      setError(null);
      await voucherApi.updateVoucher(id, data);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi cập nhật mã khuyến mãi';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    createVoucher,
    updateVoucher,
    submitting,
    error,
  };
}
