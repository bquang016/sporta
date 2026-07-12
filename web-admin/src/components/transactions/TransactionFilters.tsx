import React from 'react';
import { Button } from '@/components/ui/Button';

interface TransactionFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCluster: string;
  setSelectedCluster: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  uniqueClusters: string[];
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCluster,
  setSelectedCluster,
  selectedStatus,
  setSelectedStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  uniqueClusters
}) => {
  const hasActiveFilters = searchQuery || selectedCluster || selectedStatus || startDate || endDate;

  return (
    <div className="p-4 border-b border-outline-variant/10 bg-slate-50/50 flex-shrink-0">
      <div className="flex flex-wrap gap-3 items-end">
        
        {/* Input Tìm kiếm */}
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tìm kiếm nhanh</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Mã TRX, khách hàng, sân..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 w-full bg-white border border-slate-200 rounded-xl text-xs font-semibold text-on-surface placeholder:text-slate-400 outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 transition-all pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Select Cụm sân */}
        <div className="w-52 space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Cụm sân</label>
          <select
            value={selectedCluster}
            onChange={(e) => setSelectedCluster(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-brand-emerald cursor-pointer"
          >
            <option value="">Tất cả cụm sân</option>
            {uniqueClusters.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Select Trạng thái */}
        <div className="w-40 space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Trạng thái</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-brand-emerald cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="SUCCESS">Thành công</option>
            <option value="REFUNDING">Đang hoàn tiền</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
            <option value="FAILED">Thất bại</option>
          </select>
        </div>

        {/* Lọc Khoảng Ngày */}
        <div className="flex gap-2 items-center">
          <div className="w-32 space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Từ ngày chơi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-brand-emerald cursor-pointer"
            />
          </div>
          <span className="text-slate-400 text-xs font-bold pt-5">đến</span>
          <div className="w-32 space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Đến ngày chơi</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-brand-emerald cursor-pointer"
            />
          </div>
        </div>

        {/* Nút Xóa Lọc */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCluster('');
              setSelectedStatus('');
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 border-slate-200 py-2 hover:bg-slate-100 flex-shrink-0"
          >
            Xóa tất cả bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
};
