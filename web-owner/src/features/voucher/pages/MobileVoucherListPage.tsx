import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Ticket, 
  Copy, 
  Check, 
  Edit3, 
  Power, 
  Calendar, 
  Tag, 
  Building2, 
  Sparkles,
  Percent,
  Clock,
  Layers
} from 'lucide-react';
import type { Voucher, VoucherStatus } from '../types/voucher.types';
import { DiscountType } from '../types/voucher.types';

interface MobileVoucherListPageProps {
  vouchers: Voucher[];
  loading: boolean;
  keyword: string;
  onKeywordChange: (kw: string) => void;
  status?: VoucherStatus;
  onStatusChange: (st?: VoucherStatus) => void;
  onDisable: (id: string) => void;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export const MobileVoucherListPage: React.FC<MobileVoucherListPageProps> = ({
  vouchers,
  loading,
  keyword,
  onKeywordChange,
  status,
  onStatusChange,
  onDisable,
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeCount = vouchers.filter((v) => v.status === 'ACTIVE').length;
  const expiredCount = vouchers.filter((v) => v.status === 'EXPIRED' || v.status === 'DISABLED').length;

  return (
    <div
      className="font-sans min-h-dvh bg-slate-100/60 pb-28 select-none flex flex-col animate-fadeIn"
      style={{ touchAction: 'pan-y' }}
    >
      {/* ── 1. UNIFIED SPORTY-TECH LIQUID GLASS HEADER ── */}
      <header
        className="relative bg-gradient-to-b from-[#002b1f] via-[#064e3b] to-[#043d2e] text-white rounded-b-[2.5rem] shadow-xl overflow-hidden z-20 pb-5 transition-all"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        {/* Glow Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -left-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 px-4 space-y-3.5">
          {/* Top Bar: Back button, Title & Create Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="touch-target w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white transition-transform backdrop-blur-md shrink-0"
                title="Quay lại"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-brand-yellow uppercase tracking-wider">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Ưu đãi & Khuyến mãi</span>
                </div>
                <h1 className="text-lg font-black tracking-tight text-white mt-0.5 truncate">
                  Quản lý khuyến mãi
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/vouchers/create')}
              className="touch-target px-3 py-2 rounded-xl bg-brand-yellow active:bg-yellow-400 text-[#064e3b] text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-md active:scale-95 transition-transform shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tạo mã mới</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. WORKSPACE CONTENT ── */}
      <main className="px-4 pt-4 space-y-4">
        {/* KPI Strip */}
        <div className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-2xs grid grid-cols-3 divide-x divide-slate-100 text-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tổng số mã</span>
            <p className="text-sm font-black text-slate-900 mt-0.5">{totalElements || vouchers.length}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Đang chạy</span>
            <p className="text-sm font-black text-emerald-700 mt-0.5">{activeCount}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Đã tắt / Hết</span>
            <p className="text-sm font-black text-slate-500 mt-0.5">{expiredCount}</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Tìm theo tên hoặc mã voucher..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald shadow-2xs"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: undefined, label: 'Tất cả' },
            { id: 'ACTIVE' as const, label: 'Đang áp dụng' },
            { id: 'DISABLED' as const, label: 'Tạm dừng' },
            { id: 'EXPIRED' as const, label: 'Đã hết hạn' },
          ].map((chip) => {
            const isActive = status === chip.id;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => onStatusChange(chip.id)}
                className={`touch-target px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs font-black'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Vouchers List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-2xs space-y-2">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-brand-emerald rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Đang tải kho voucher...</p>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200 space-y-3">
              <Ticket className="w-8 h-8 text-slate-300 mx-auto" />
              <div>
                <p className="text-xs font-black text-slate-700">Không tìm thấy mã voucher nào</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Thử đổi từ khóa tìm kiếm hoặc tạo mã khuyến mãi mới</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/vouchers/create')}
                className="touch-target inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-emerald text-white text-xs font-black shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Tạo voucher ngay</span>
              </button>
            </div>
          ) : (
            vouchers.map((v) => {
              const isPercentage = v.discountType === DiscountType.PERCENTAGE;
              const isActive = v.status === 'ACTIVE';
              const isExpired = v.status === 'EXPIRED';

              const discountBadge = isPercentage 
                ? `GIẢM ${v.discountValue}%`
                : `GIẢM ${formatVND(v.discountValue)}`;

              const usedPercent = v.totalQuantity > 0 
                ? Math.round(((v.usedQuantity || 0) / v.totalQuantity) * 100)
                : 0;

              return (
                <div
                  key={v.id}
                  className={`bg-white rounded-3xl border transition-all shadow-2xs overflow-hidden ${
                    isActive ? 'border-emerald-300 ring-1 ring-emerald-500/20' : 'border-slate-200/80'
                  }`}
                >
                  {/* Top Header Strip with Coupon Punch Hole Effect */}
                  <div className="p-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-dashed border-slate-200 relative flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-brand-emerald text-white text-[10px] font-black uppercase tracking-wider">
                          {discountBadge}
                        </span>
                        <span className={`px-2 py-0.2 rounded-md text-[9px] font-black uppercase border ${
                          isActive ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {isActive ? 'Đang chạy' : isExpired ? 'Hết hạn' : 'Tạm dừng'}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight truncate pt-0.5">
                        {v.name}
                      </h3>
                    </div>

                    {/* Voucher Code Copy Pill */}
                    <button
                      type="button"
                      onClick={() => handleCopy(v.code)}
                      className="touch-target px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-mono font-black flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
                      title="Sao chép mã"
                    >
                      <span>{v.code}</span>
                      {copiedCode === v.code ? (
                        <Check className="w-3.5 h-3.5 text-brand-emerald stroke-[3]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">Đơn tối thiểu</span>
                        <span className="font-black text-slate-700">{formatVND(v.minOrderAmount || 0)}</span>
                      </div>
                      {isPercentage && v.maxDiscountAmount && v.maxDiscountAmount > 0 ? (
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px]">Giảm tối đa</span>
                          <span className="font-black text-slate-700">{formatVND(v.maxDiscountAmount)}</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-slate-400 font-bold block text-[10px]">Thời hạn</span>
                          <span className="font-black text-slate-700">
                            {new Date(v.endDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Usage Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Đã sử dụng {v.usedQuantity || 0}/{v.totalQuantity} lượt</span>
                        <span>{usedPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-emerald rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(3, usedPercent))}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => navigate(`/vouchers/${v.id}/edit`)}
                        className="touch-target px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>

                      {isActive && (
                        <button
                          type="button"
                          onClick={() => onDisable(v.id)}
                          className="touch-target px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1.5 active:scale-95"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>Dừng</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 pt-1 text-xs">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 0}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold disabled:opacity-40"
            >
              Trang trước
            </button>
            <span className="text-slate-500 font-bold">
              Trang {currentPage + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold disabled:opacity-40"
            >
              Trang sau
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
export default MobileVoucherListPage;
