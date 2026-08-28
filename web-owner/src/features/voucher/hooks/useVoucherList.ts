import { useState, useEffect, useCallback } from 'react';
import { voucherApi } from '../services/voucherApi';
import { VoucherStatus } from '../types/voucher.types';
import type { Voucher, VoucherPageResponse } from '../types/voucher.types';
import { useToast } from '../../../common/ui';

interface UseVoucherListProps {
  initialStatus?: VoucherStatus;
  initialSize?: number;
}

export function useVoucherList({ initialStatus, initialSize = 10 }: UseVoucherListProps = {}) {
  const [data, setData] = useState<VoucherPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [status, setStatus] = useState<VoucherStatus | undefined>(initialStatus);
  const [keyword, setKeyword] = useState<string>('');
  const [page, setPage] = useState(0);

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await voucherApi.getVouchers({
        status,
        keyword: keyword.trim() || undefined,
        page,
        size: initialSize,
      });
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi tải danh sách mã khuyến mãi');
    } finally {
      setLoading(false);
    }
  }, [status, keyword, page, initialSize]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleStatusChange = (newStatus?: VoucherStatus) => {
    setStatus(newStatus);
    setPage(0); // Reset page on filter change
  };

  const handleSearch = (newKeyword: string) => {
    setKeyword(newKeyword);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const { showToast } = useToast();

  const disableVoucher = async (id: string) => {
    try {
      await voucherApi.disableVoucher(id);
      fetchVouchers();
      showToast('success', 'Vô hiệu hóa mã thành công');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi vô hiệu hóa';
      showToast('error', msg);
      return false;
    }
  };

  return {
    vouchers: data?.content || [],
    totalElements: data?.totalElements || 0,
    totalPages: data?.totalPages || 0,
    currentPage: page,
    status,
    keyword,
    loading,
    error,
    handleStatusChange,
    handleSearch,
    handlePageChange,
    disableVoucher,
    refresh: fetchVouchers,
  };
}
