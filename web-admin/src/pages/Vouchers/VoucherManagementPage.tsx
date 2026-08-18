import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { voucherApi } from '../../api/voucherApi';
import type { Voucher } from '../../types/voucher.types';
import { VoucherTable } from './components/VoucherTable';
import { VoucherForm } from './VoucherForm';

export const VoucherManagementPage: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await voucherApi.getVouchers({});
      setVouchers(data.content);
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
  }, [view]);

  const handleDisable = async (id: string) => {
    try {
      await voucherApi.disableVoucher(id);
      fetchVouchers();
    } catch (err) {
      alert('Lỗi vô hiệu hóa');
    }
  };

  if (view === 'CREATE') {
    return <VoucherForm onBack={() => setView('LIST')} />;
  }

  if (view === 'EDIT' && editingId) {
    return <VoucherForm voucherId={editingId} onBack={() => setView('LIST')} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative flex flex-col flex-1 min-h-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-on-background">Mã khuyến mãi hệ thống</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Quản lý các chương trình ưu đãi chung cho toàn nền tảng Sporta</p>
        </div>
        <button 
          onClick={() => setView('CREATE')}
          className="inline-flex items-center gap-2 bg-brand-emerald text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo mã hệ thống</span>
        </button>
      </div>

      <VoucherTable 
        vouchers={vouchers}
        loading={loading}
        onDisable={handleDisable}
        onEdit={(id: string) => {
          setEditingId(id);
          setView('EDIT');
        }}
      />
    </div>
  );
};
