import React from 'react';
import { Search, Filter } from 'lucide-react';
import { VoucherStatus } from '../types/voucher.types';

interface VoucherFilterBarProps {
  keyword: string;
  onKeywordChange: (kw: string) => void;
  status: VoucherStatus | undefined;
  onStatusChange: (status?: VoucherStatus) => void;
}

export const VoucherFilterBar: React.FC<VoucherFilterBarProps> = ({
  keyword,
  onKeywordChange,
  status,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
          placeholder="Tìm kiếm theo mã hoặc tên..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </div>
      <div className="relative min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter className="h-4 w-4 text-gray-400" />
        </div>
        <select
          className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={status || ''}
          onChange={(e) => {
            const val = e.target.value;
            onStatusChange(val ? (val as VoucherStatus) : undefined);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value={VoucherStatus.ACTIVE}>Đang hoạt động</option>
          <option value={VoucherStatus.DISABLED}>Đã vô hiệu</option>
          <option value={VoucherStatus.EXPIRED}>Đã hết hạn</option>
        </select>
      </div>
    </div>
  );
};
