import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { voucherApi } from '../services/voucherApi';
import type { CreateVoucherRequest, UpdateVoucherRequest, Voucher } from '../types/voucher.types';

export function useVoucherMutations() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const createVoucher = async (data: CreateVoucherRequest) => {
    try {
      setSubmitting(true);
      setError(null);
      await voucherApi.createVoucher(data);
      alert('Tạo mã khuyến mãi thành công');
      navigate('/vouchers'); // Go back to list
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi tạo mã khuyến mãi');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateVoucher = async (id: string, data: UpdateVoucherRequest) => {
    try {
      setSubmitting(true);
      setError(null);
      await voucherApi.updateVoucher(id, data);
      alert('Cập nhật mã khuyến mãi thành công');
      navigate('/vouchers');
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi cập nhật mã khuyến mãi');
      return false;
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
