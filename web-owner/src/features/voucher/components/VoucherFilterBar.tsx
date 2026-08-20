import React from 'react';
import { VoucherStatus } from '../types/voucher.types';
import { SearchInput } from '../../../common/ui';
import { Dropdown } from '../../../components/ui/Dropdown';
import { Filter } from 'lucide-react';

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
      <div className="flex-1">
        <SearchInput
          placeholder="Tìm kiếm theo mã hoặc tên..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-[240px]">
        <Dropdown
          value={status || ''}
          onChange={(val) => {
            onStatusChange(val ? (val as VoucherStatus) : undefined);
          }}
          options={[
            { value: '', label: 'Tất cả trạng thái', icon: <Filter className="w-4 h-4 text-slate-400" /> },
            { value: VoucherStatus.ACTIVE, label: 'Đang hoạt động' },
            { value: VoucherStatus.DISABLED, label: 'Đã vô hiệu' },
            { value: VoucherStatus.EXPIRED, label: 'Đã hết hạn' },
          ]}
        />
      </div>
    </div>
  );
};
