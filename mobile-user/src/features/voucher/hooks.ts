import { useState, useCallback } from 'react';
import { voucherApi } from './api';
import { Voucher, UserVoucher } from './types';

export const useMyVouchers = (status?: 'ACTIVE' | 'USED' | 'EXPIRED') => {
  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await voucherApi.getMyVouchers(status);
      setVouchers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách mã khuyến mãi');
    } finally {
      setLoading(false);
    }
  }, [status]);

  return { vouchers, loading, error, fetchVouchers };
};

export const useCollectVoucher = () => {
  const [loading, setLoading] = useState(false);

  const collectVoucher = async (voucherId: string, onSuccess?: () => void, onError?: (msg: string) => void) => {
    setLoading(true);
    try {
      await voucherApi.collectVoucher(voucherId);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (onError) onError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return { collectVoucher, loading };
};
