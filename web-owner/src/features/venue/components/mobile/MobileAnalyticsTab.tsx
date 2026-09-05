import React from 'react';
import type { VenueResponse, CourtResponse } from '../../types';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Clock, 
  Users, 
  Activity,
  Sparkles
} from 'lucide-react';

interface MobileAnalyticsTabProps {
  activeVenue: VenueResponse | null;
  courts: CourtResponse[];
  todayRevenue: number;
  totalBookingsCount: number;
  avgOccupancy: number;
  totalVenueSlots: number;
  totalBookedSlots: number;
  statistics: any;
  isLoadingStats?: boolean;
  dateRangePreset: 'today' | '7days' | '30days' | 'custom';
  setDateRangePreset: (preset: any) => void;
  customFromDate: string;
  setCustomFromDate: (d: string) => void;
  customToDate: string;
  setCustomToDate: (d: string) => void;
  onRefresh?: () => void;
  formatVND: (n: number) => string;
}

export const MobileAnalyticsTab: React.FC<MobileAnalyticsTabProps> = ({
  activeVenue,
  courts,
  todayRevenue,
  totalBookingsCount,
  avgOccupancy,
  totalVenueSlots,
  totalBookedSlots,
  statistics,
  isLoadingStats: _isLoadingStats,
  dateRangePreset,
  setDateRangePreset,
  customFromDate,
  setCustomFromDate,
  customToDate,
  setCustomToDate,
  onRefresh: _onRefresh,
  formatVND
}) => {
  // Chart points from statistics or fallback
  const chartData = statistics?.revenueByDay || [
    { label: 'T2', value: todayRevenue * 0.7 },
    { label: 'T3', value: todayRevenue * 0.85 },
    { label: 'T4', value: todayRevenue * 0.6 },
    { label: 'T5', value: todayRevenue * 0.9 },
    { label: 'T6', value: todayRevenue * 1.15 },
    { label: 'T7', value: todayRevenue * 1.4 },
    { label: 'CN', value: todayRevenue * 1.5 },
  ];

  const maxValue = Math.max(...chartData.map((d: any) => d.value || 0), 1000000);

  return (
    <div className="space-y-4 px-4 pb-8 select-none">
      {/* 1. Date Range Switcher */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-1">
        {[
          { id: 'today', label: 'Hôm nay' },
          { id: '7days', label: '7 ngày' },
          { id: '30days', label: '30 ngày' },
          { id: 'custom', label: 'Tùy chọn' },
        ].map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => setDateRangePreset(p.id)}
            className={`touch-target flex-1 py-1.5 rounded-xl text-center text-[10px] font-black uppercase tracking-wider transition-all ${
              dateRangePreset === p.id
                ? 'bg-[#064e3b] text-white shadow-xs scale-102'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {dateRangePreset === 'custom' && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2">
          <input
            type="date"
            value={customFromDate}
            onChange={e => setCustomFromDate(e.target.value)}
            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
          />
          <span className="text-xs font-bold text-slate-400">➔</span>
          <input
            type="date"
            value={customToDate}
            onChange={e => setCustomToDate(e.target.value)}
            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
          />
        </div>
      )}

      {/* 2. Primary KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Doanh thu */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Doanh thu</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-brand-emerald flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-brand-emerald tracking-tight truncate">
            {formatVND(todayRevenue)}
          </p>
          <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            Tăng trưởng ổn định
          </span>
        </div>

        {/* Tỷ lệ lấp đầy */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lấp đầy sân</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-800 tracking-tight">
            {avgOccupancy}%
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div 
              className="bg-brand-emerald h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(avgOccupancy, 100)}%` }} 
            />
          </div>
        </div>

        {/* Lượt đặt */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lượt đặt sân</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-800 tracking-tight">
            {totalBookingsCount} <span className="text-xs font-normal text-slate-400">lượt</span>
          </p>
          <span className="text-[9px] text-slate-400 font-bold block">
            {totalBookedSlots} ca đã chốt
          </span>
        </div>

        {/* Tổng ca phục vụ */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Năng lực phục vụ</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-800 tracking-tight">
            {totalVenueSlots} <span className="text-xs font-normal text-slate-400">ca</span>
          </p>
          <span className="text-[9px] text-slate-400 font-bold block">
            {courts.filter(c => c.venueId === activeVenue?.id).length} sân trực thuộc
          </span>
        </div>
      </div>

      {/* 3. Revenue Trend Chart (Responsive Bar Graph) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Biểu đồ doanh thu</h4>
            <p className="text-[10px] text-slate-400 font-medium">Theo dõi biến động dòng tiền theo ca chơi</p>
          </div>
          <span className="text-[10px] font-extrabold text-brand-emerald bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
            VND
          </span>
        </div>

        {/* Bar Chart Container */}
        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
          {chartData.map((point: any, idx: number) => {
            const heightPercent = Math.max(Math.min((point.value / maxValue) * 100, 100), 8);
            const isHighest = point.value === maxValue;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="relative w-full flex flex-col items-center">
                  <span className="text-[8px] font-extrabold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                    {Math.round(point.value / 1000)}k
                  </span>
                  <div
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                      isHighest
                        ? 'bg-brand-yellow border-t-2 border-yellow-500 shadow-xs'
                        : 'bg-[#064e3b] hover:bg-emerald-800'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-slate-600">{point.label}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#064e3b]" />
            Doanh thu chuẩn
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-brand-yellow" />
            Đạt đỉnh (Peak)
          </span>
        </div>
      </div>
    </div>
  );
};
export default MobileAnalyticsTab;
