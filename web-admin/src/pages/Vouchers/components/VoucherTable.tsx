import React, { useState } from 'react';
import { Edit2, Ban, Eye, Ticket, Calendar, TrendingUp, AlertTriangle, Hash, Percent, Banknote } from 'lucide-react';
import { VoucherStatus, DiscountType } from '../../../types/voucher.types';
import type { Voucher } from '../../../types/voucher.types';
import { VoucherStatusBadge } from './VoucherStatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface VoucherTableProps {
  vouchers: Voucher[];
  onDisable: (id: string) => void;
  onEdit: (id: string) => void;
  loading: boolean;
}

export const VoucherTable: React.FC<VoucherTableProps> = ({ vouchers, onDisable, onEdit, loading }) => {
  const [disableId, setDisableId] = useState<string | null>(null);
  const [detailVoucher, setDetailVoucher] = useState<Voucher | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDiscount = (v: Voucher) => {
    if (v.discountType === DiscountType.FIXED_AMOUNT) {
      return formatCurrency(v.discountValue);
    }
    return `${v.discountValue}%${v.maxDiscountAmount ? ` (Tối đa ${formatCurrency(v.maxDiscountAmount)})` : ''}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading && vouchers.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-slate-200/50 animate-pulse rounded-2xl border border-slate-200/50" />
        ))}
      </div>
    );
  }

  if (vouchers.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Ticket size={32} />
        </div>
        <p className="text-sm font-black text-slate-700">Chưa có mã khuyến mãi nào</p>
        <p className="text-xs font-semibold text-slate-500 mt-2 max-w-sm mx-auto">Bạn có thể tạo mã khuyến mãi mới để thu hút thêm khách hàng đặt lịch.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vouchers.map((v) => {
        const usagePercentage = Math.min(100, Math.round((v.usedQuantity / v.totalQuantity) * 100)) || 0;
        const isAlmostRunOut = usagePercentage >= 80;

        return (
          <div key={v.id} className={`bg-white hover:bg-slate-50 p-5 rounded-2xl border border-slate-200/80 transition-colors flex flex-col md:flex-row gap-6 shadow-sm group ${loading ? 'opacity-50' : ''}`}>
            
            {/* Left: Basic Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                {v.bannerImageUrl ? (
                  <div className="w-16 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex-shrink-0 bg-slate-100">
                    <img src={v.bannerImageUrl} alt={v.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <Ticket className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">{v.code}</h3>
                    <VoucherStatusBadge status={v.status} isExpired={v.isExpired} />
                  </div>
                  <p className="text-sm font-bold text-slate-500 mt-1">{v.name}</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Giảm {formatDiscount(v)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      • Đơn từ {formatCurrency(v.minOrderAmount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(v.startDate)} - {formatDate(v.endDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle: Progress Bar */}
            <div className="flex-1 md:max-w-xs flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Lượt sử dụng
                  </p>
                  <p className="text-sm font-black text-slate-700 mt-0.5">
                    {v.usedQuantity} <span className="text-xs font-semibold text-slate-400">/ {v.totalQuantity}</span>
                  </p>
                </div>
                <span className={`text-xs font-black ${isAlmostRunOut ? 'text-red-500' : 'text-emerald-500'}`}>
                  {usagePercentage}%
                </span>
              </div>
              
              {/* Custom Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${isAlmostRunOut ? 'bg-red-500' : 'bg-brand-emerald'}`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
              {isAlmostRunOut && (
                <p className="text-[10px] font-bold text-red-500 mt-1.5">Sắp hết lượt sử dụng!</p>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex md:flex-col items-center justify-end gap-2 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
              <button 
                onClick={() => setDetailVoucher(v)}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-colors"
              >
                <Eye className="w-4 h-4" /> Chi tiết
              </button>
              <button 
                onClick={() => onEdit(v.id)} 
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-brand-emerald text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-emerald-100"
              >
                <Edit2 className="w-4 h-4" /> Sửa
              </button>
              {v.status === VoucherStatus.ACTIVE && !v.isExpired && (
                <button 
                  onClick={() => setDisableId(v.id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-black uppercase tracking-wider rounded-xl transition-colors border border-red-100"
                >
                  <Ban className="w-4 h-4" /> Vô hiệu
                </button>
              )}
            </div>
            
          </div>
        );
      })}

      {/* Disable Confirm Modal */}
      <Modal
        isOpen={!!disableId}
        onClose={() => setDisableId(null)}
        title="Vô hiệu hóa mã khuyến mãi"
        maxWidth="sm"
      >
        <div className="py-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
          </div>
          <p className="text-sm font-bold text-slate-700">Bạn có chắc muốn vô hiệu hóa mã này?</p>
          <p className="text-xs text-slate-500 mt-2">Hành động này không thể hoàn tác và khách hàng sẽ không thể sử dụng mã này nữa.</p>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" fullWidth onClick={() => setDisableId(null)}>Hủy bỏ</Button>
            <Button 
              variant="danger" 
              fullWidth 
              onClick={() => {
                if (disableId) {
                  onDisable(disableId);
                  setDisableId(null);
                }
              }}
            >
              Vô hiệu hóa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailVoucher}
        onClose={() => setDetailVoucher(null)}
        title="Chi tiết mã khuyến mãi"
        maxWidth="md"
      >
        {detailVoucher && (
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase">{detailVoucher.code}</h2>
                <p className="text-sm font-bold text-slate-500 mt-1">{detailVoucher.name}</p>
              </div>
              <VoucherStatusBadge status={detailVoucher.status} isExpired={detailVoucher.isExpired} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <Percent className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Mức giảm</span>
                </div>
                <p className="text-base font-black text-emerald-600">{formatDiscount(detailVoucher)}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                  <Banknote className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Đơn tối thiểu</span>
                </div>
                <p className="text-base font-black text-slate-700">{formatCurrency(detailVoucher.minOrderAmount)}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Thời gian áp dụng</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 relative">
                <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-slate-200"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-4 h-4 rounded-full border-[4px] border-emerald-100 bg-emerald-500 shadow-sm"></div>
                  <p className="text-sm font-bold text-slate-700">{formatDate(detailVoucher.startDate)}</p>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-4 h-4 rounded-full border-[4px] border-rose-100 bg-rose-500 shadow-sm"></div>
                  <p className="text-sm font-bold text-slate-700">{formatDate(detailVoucher.endDate)}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <Hash className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Lượt sử dụng</span>
                </div>
                <p className="text-sm font-black text-slate-700">
                  {detailVoucher.usedQuantity} <span className="text-slate-400 font-semibold text-xs">/ {detailVoucher.totalQuantity}</span>
                </p>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${Math.round((detailVoucher.usedQuantity / detailVoucher.totalQuantity) * 100) >= 80 ? 'bg-red-500' : 'bg-brand-emerald'}`} 
                  style={{ width: `${Math.min(100, Math.round((detailVoucher.usedQuantity / detailVoucher.totalQuantity) * 100))}%` }}
                />
              </div>
              <p className="text-xs font-bold text-slate-500 mt-3 text-center border-t border-slate-200 pt-3">
                Đã được lưu: <span className="text-slate-800">{detailVoucher.collectedQuantity} lượt</span>
              </p>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
