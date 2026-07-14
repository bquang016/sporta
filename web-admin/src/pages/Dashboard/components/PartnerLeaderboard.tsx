import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface PartnerData {
  id: string;
  courtName: string;
  ownerName: string;
  successfulBookings: number;
  totalGmv: number;
  commission: number; // actual platform commission
}

interface PartnerLeaderboardProps {
  data: PartnerData[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  timeFilter: string;
  onTimeFilterChange: (filter: string) => void;
}

export const PartnerLeaderboard: React.FC<PartnerLeaderboardProps> = ({
  data,
  isLoading = false,
  error = null,
  onRetry,
  timeFilter,
  onTimeFilterChange,
}) => {
  // Tie-breaker sorting logic:
  // 1. Sort by totalGmv desc
  // 2. If equal, sort by successfulBookings desc
  // 3. If equal, sort by courtName asc (alphabetical)
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      if (b.totalGmv !== a.totalGmv) {
        return b.totalGmv - a.totalGmv;
      }
      if (b.successfulBookings !== a.successfulBookings) {
        return b.successfulBookings - a.successfulBookings;
      }
      return a.courtName.localeCompare(b.courtName, 'vi');
    }).slice(0, 10); // Top 10 only
  }, [data]);

  // Helper to format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  // Helper to format general numbers
  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  // Render Top Rank visual styling helper
  const renderRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black text-sm shadow-[0_2px_8px_rgba(245,158,11,0.2)] animate-pulse">
            👑
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-400/10 text-slate-500 border border-slate-400/20 font-black text-sm shadow-[0_2px_8px_rgba(148,163,184,0.15)]">
            2
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/10 text-amber-800 border border-amber-700/20 font-black text-sm shadow-[0_2px_8px_rgba(180,83,9,0.15)]">
            3
          </div>
        );
      default:
        return (
          <span className="text-slate-400 font-bold text-sm pl-2">
            {rank}
          </span>
        );
    }
  };

  // Render Loading skeleton
  if (isLoading) {
    return (
      <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-9 w-32 bg-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3 w-1/3">
                <div className="w-7 h-7 bg-slate-200 rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Render Error state
  if (error) {
    return (
      <Card className="p-8 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] w-full flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-200/50 mb-4 animate-bounce">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-1">Lỗi tải danh sách xếp hạng</h3>
        <p className="text-xs text-slate-500 font-semibold mb-4 text-center max-w-sm">{error}</p>
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Thử lại
        </Button>
      </Card>
    );
  }

  // Render Empty state
  if (sortedData.length === 0) {
    return (
      <Card className="p-8 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] w-full flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 mb-4">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide mb-1">Chưa có dữ liệu xếp hạng</h3>
        <p className="text-xs text-slate-400 font-semibold text-center">Không tìm thấy thông tin xếp hạng doanh thu trong khoảng thời gian này.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-none shadow-[0_4px_16px_rgba(0,0,0,0.02)] w-full flex flex-col h-full bg-white">
      {/* Header section with Filter controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span>Bảng xếp hạng đối tác doanh thu cao nhất</span>
            <Badge variant="success" className="text-[10px] py-0.5">Top 10</Badge>
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Xếp hạng theo tổng GMV (Tiêu chí phụ: Số lượt đặt thành công).
          </p>
        </div>
        
        {/* Time filters */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl self-end sm:self-auto border border-slate-200/50">
          {[
            { id: 'this_month', label: 'Tháng này' },
            { id: 'last_month', label: 'Tháng trước' },
            { id: 'year', label: 'Cả năm' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => onTimeFilterChange(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                timeFilter === f.id
                  ? 'bg-white text-brand-emerald shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard data view (Desktop: Table, Mobile: Card Stack) */}
      <div className="flex-1 overflow-x-auto min-w-0 matrix-scroll">
        {/* Desktop View */}
        <table className="hidden md:table w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/50 sticky top-0 backdrop-blur-sm z-10 select-none">
            <tr>
              <th className="px-4 py-3.5 w-16 text-center">Hạng</th>
              <th className="px-4 py-3.5">Cụm Sân</th>
              <th className="px-4 py-3.5">Chủ Sân</th>
              <th className="px-4 py-3.5 text-center">Số Lượt Đặt Thành Công</th>
              <th className="px-4 py-3.5 text-right">Tổng GMV</th>
              <th className="px-4 py-3.5 text-right text-brand-emerald">Hoa Hồng Trích Xuất</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sortedData.map((item, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              return (
                <tr 
                  key={item.id} 
                  className={`group transition-all duration-200 ${
                    isTop3 ? 'hover:bg-slate-50/30' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center">
                      {renderRankBadge(rank)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-black text-slate-800 group-hover:text-brand-emerald transition-colors">
                      {item.courtName}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-600">
                    {item.ownerName}
                  </td>
                  <td className="px-4 py-4 text-center font-bold text-slate-700">
                    {formatNumber(item.successfulBookings)}
                  </td>
                  <td className="px-4 py-4 text-right font-black text-slate-800 font-mono">
                    {formatCurrency(item.totalGmv)}
                  </td>
                  <td className="px-4 py-4 text-right font-black text-brand-emerald font-mono bg-brand-emerald/5 group-hover:bg-brand-emerald/10 transition-colors">
                    {formatCurrency(item.commission)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {sortedData.map((item, idx) => {
            const rank = idx + 1;
            const isTop3 = rank <= 3;
            return (
              <div 
                key={item.id}
                className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-3 ${
                  isTop3 
                    ? 'border-amber-500/20 bg-amber-500/5 shadow-[0_4px_12px_rgba(245,158,11,0.03)]' 
                    : 'border-slate-100 bg-slate-50/30'
                }`}
              >
                {/* Header card info */}
                <div className="flex justify-between items-center border-b border-slate-200/40 pb-2">
                  <div className="flex items-center gap-3">
                    {renderRankBadge(rank)}
                    <div>
                      <h4 className="text-sm font-black text-slate-800">{item.courtName}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Chủ sân: {item.ownerName}</p>
                    </div>
                  </div>
                </div>

                {/* Body card stats */}
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 font-semibold">Lượt đặt</span>
                    <span className="font-bold text-slate-700">{formatNumber(item.successfulBookings)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 font-semibold">Tổng GMV</span>
                    <span className="font-bold text-slate-800 font-mono">{formatCurrency(item.totalGmv)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-brand-emerald font-black">Hoa hồng</span>
                    <span className="font-bold text-brand-emerald font-mono">{formatCurrency(item.commission)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
