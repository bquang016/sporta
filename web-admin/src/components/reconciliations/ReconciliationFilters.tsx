import React from 'react';
import { Button } from '@/components/ui/Button';

interface ReconciliationFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedCycle: string;
  setSelectedCycle: (val: string) => void;
  uniqueCycles: string[];
}

export const ReconciliationFilters: React.FC<ReconciliationFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedCycle,
  setSelectedCycle,
  uniqueCycles
}) => {
  const hasActiveFilters = searchQuery || selectedStatus || selectedCycle;

  return (
    <div className="p-4 border-b border-outline-variant/10 bg-slate-50/50 flex-shrink-0">
      <div className="flex flex-wrap gap-3 items-end">
        
        {/* Tìm kiếm */}
        <div className="flex-1 min-w-[240px] space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tìm kiếm đối tác</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Tên chủ sân, tên sân, số tài khoản..."
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

        {/* Lọc Trạng thái */}
        <div className="w-44 space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Trạng thái đối soát</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-brand-emerald cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chưa đối soát (Chờ chuyển)</option>
            <option value="PAID_OUT">Đã đối soát (Đã thanh toán)</option>
          </select>
        </div>

        {/* Lọc Chu kỳ */}
        <div className="w-56 space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Chu kỳ đối soát</label>
          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-brand-emerald cursor-pointer"
          >
            <option value="">Tất cả chu kỳ</option>
            {uniqueCycles.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Nút Xóa Lọc */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('');
              setSelectedCycle('');
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
