import React from 'react';
import { Button } from '@/components/ui/Button';
import { Dropdown, type DropdownOption } from '@/components/ui/Dropdown';
import { DatePicker } from '@/components/ui/DatePicker';

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

  // Options for Cụm sân dropdown
  const clusterOptions: DropdownOption[] = [
    { value: '', label: 'Tất cả cụm sân' },
    ...uniqueClusters.map(c => ({ value: c, label: c }))
  ];

  // Options for Trạng thái dropdown
  const statusOptions: DropdownOption[] = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'SUCCESS', label: 'Thành công' },
    { value: 'REFUNDING', label: 'Đang hoàn tiền' },
    { value: 'REFUNDED', label: 'Đã hoàn tiền' },
    { value: 'FAILED', label: 'Thất bại' },
    { value: 'PENDING', label: 'Đang chờ' }
  ];

  return (
    <div className="p-5 border-b border-slate-200/80 bg-slate-50/70 flex-shrink-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
        
        {/* Input Tìm kiếm (4 cols) */}
        <div className="lg:col-span-4 space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider pl-0.5">Tìm kiếm nhanh</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Mã TRX, khách hàng, số điện thoại, sân..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-2.5 w-full bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald transition-all pr-9 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Cụm sân (3 cols) */}
        <div className="lg:col-span-3 space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider pl-0.5">Cụm sân</label>
          <Dropdown
            options={clusterOptions}
            value={selectedCluster}
            onChange={setSelectedCluster}
            placeholder="Tất cả cụm sân"
            className="w-full shadow-2xs"
          />
        </div>

        {/* Dropdown Trạng thái (2 cols) */}
        <div className="lg:col-span-2 space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider pl-0.5">Trạng thái</label>
          <Dropdown
            options={statusOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
            placeholder="Tất cả trạng thái"
            className="w-full shadow-2xs"
          />
        </div>

        {/* DatePicker Khoảng Ngày (3 cols) */}
        <div className="lg:col-span-3 flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider pl-0.5">Từ ngày</label>
            <DatePicker
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Từ ngày"
              className="shadow-2xs"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider pl-0.5">Đến ngày</label>
            <DatePicker
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Đến ngày"
              className="shadow-2xs"
            />
          </div>
        </div>

      </div>

      {/* Nút Xóa Lọc Active Filter Bar */}
      {hasActiveFilters && (
        <div className="mt-3.5 pt-3 border-t border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Đang lọc theo:</span>
            {searchQuery && <span className="bg-emerald-50 text-brand-emerald px-2 py-0.5 rounded-md font-bold text-[11px]">Từ khóa: "{searchQuery}"</span>}
            {selectedCluster && <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[11px]">{selectedCluster}</span>}
            {selectedStatus && <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[11px]">{selectedStatus}</span>}
            {(startDate || endDate) && <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[11px]">{startDate || '...'} → {endDate || '...'}</span>}
          </div>
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
            className="text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 py-1 px-3 border border-red-200/60"
          >
            Xóa tất cả bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
};
