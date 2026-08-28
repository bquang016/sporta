import React, { useState, useEffect } from 'react';
import { Plus, Ticket } from 'lucide-react';
import { voucherApi } from '../../api/voucherApi';
import { VoucherStatus } from '../../types/voucher.types';
import type { VoucherPageResponse } from '../../types/voucher.types';
import { VoucherTable } from './components/VoucherTable';
import { VoucherFilterBar } from './components/VoucherFilterBar';
import { VoucherForm } from './VoucherForm';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';

export const VoucherManagementPage: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [data, setData] = useState<VoucherPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [status, setStatus] = useState<VoucherStatus | undefined>(undefined);
  const [keyword, setKeyword] = useState<string>('');
  const [page, setPage] = useState(0);
  const size = 10;
  
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await voucherApi.getVouchers({
        status,
        keyword: keyword.trim() || undefined,
        page,
        size
      });
      setData(res as VoucherPageResponse);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'LIST') {
      fetchVouchers();
    }
  }, [view, status, keyword, page]);

  const handleStatusChange = (newStatus?: VoucherStatus) => {
    setStatus(newStatus);
    setPage(0);
  };

  const handleSearch = (newKeyword: string) => {
    setKeyword(newKeyword);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDisable = async (id: string) => {
    try {
      await voucherApi.disableVoucher(id);
      fetchVouchers();
      showToast('success', 'Đã vô hiệu hóa mã khuyến mãi');
    } catch (err) {
      showToast('error', 'Lỗi vô hiệu hóa');
    }
  };

  if (view === 'CREATE') {
    return <VoucherForm onBack={() => setView('LIST')} />;
  }

  if (view === 'EDIT' && editingId) {
    return <VoucherForm voucherId={editingId} onBack={() => setView('LIST')} />;
  }

  const vouchers = data?.content || [];
  const totalElements = data?.totalElements || 0;

  return (
    <div className="space-y-6 animate-fadeIn py-6 max-w-7xl mx-auto flex flex-col flex-1 min-h-0 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mã khuyến mãi hệ thống</h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">Quản lý các chương trình ưu đãi chung cho toàn nền tảng Sporta</p>
          </div>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setView('CREATE')}
          prefixIcon={<Plus className="w-5 h-5" />}
        >
          Tạo mã mới
        </Button>
      </div>

      <VoucherFilterBar 
        keyword={keyword}
        onKeywordChange={handleSearch}
        status={status}
        onStatusChange={handleStatusChange}
      />

      <VoucherTable 
        vouchers={vouchers}
        loading={loading}
        onDisable={handleDisable}
        onEdit={(id: string) => {
          setEditingId(id);
          setView('EDIT');
        }}
      />

      {totalElements > 0 && (
        <div className="mt-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-center">
          <Pagination 
            currentPage={page + 1}
            totalItems={totalElements}
            pageSize={size}
            onPageChange={(p) => handlePageChange(p - 1)}
          />
        </div>
      )}
    </div>
  );
};
