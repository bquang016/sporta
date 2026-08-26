import React, { useState } from 'react';
import { DonutChart } from './DonutChart';
import { BarChart } from './BarChart';
import type { CourtResponse, VenueStatisticsResponse, DateRangePreset } from '../../types';

interface OperationsOverviewTabProps {
  activeCourts: CourtResponse[];
  todayRevenue: number;
  totalBookingsCount: number;
  avgOccupancy: number;
  totalVenueSlots?: number;
  totalBookedSlots?: number;
  activeCount: number;
  maintCount: number;
  closedCount: number;
  totalOpCourts: number;
  statistics?: VenueStatisticsResponse | null;
  isLoadingStats?: boolean;
  dateRangePreset?: DateRangePreset;
  setDateRangePreset?: (p: DateRangePreset) => void;
  customFromDate?: string;
  setCustomFromDate?: (d: string) => void;
  customToDate?: string;
  setCustomToDate?: (d: string) => void;
  onRefresh?: () => void;
  getCourtOpStatus: (id: string) => 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
  getCourtDetails: (court: CourtResponse) => {
    name: string;
    price: number;
    surcharge: number;
    liveStatus: string;
    occupancy: number;
    performanceRevenue: number;
    bookedSlots?: number;
    totalSlots?: number;
    bookingCount?: number;
    isMaintenance: boolean;
  };
  formatVND: (n: number) => string;
  isMobile?: boolean;
}

export const OperationsOverviewTab = ({
  activeCourts,
  todayRevenue,
  totalBookingsCount,
  avgOccupancy,
  totalVenueSlots = 0,
  totalBookedSlots = 0,
  activeCount,
  maintCount,
  closedCount,
  totalOpCourts,
  statistics,
  isLoadingStats = false,
  dateRangePreset = 'today',
  setDateRangePreset,
  customFromDate = '',
  setCustomFromDate,
  customToDate = '',
  setCustomToDate,
  onRefresh,
  getCourtOpStatus,
  getCourtDetails,
  formatVND,
  isMobile: _isMobile = false
}: OperationsOverviewTabProps) => {
  const [sortField, setSortField] = useState<'occupancy' | 'revenue' | 'name' | 'bookedSlots'>('occupancy');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: 'occupancy' | 'revenue' | 'name' | 'bookedSlots') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Sort courts based on selected field
  const sortedCourts = [...activeCourts].sort((a, b) => {
    const detailsA = getCourtDetails(a);
    const detailsB = getCourtDetails(b);
    let valA: any;
    let valB: any;

    if (sortField === 'name') {
      valA = detailsA.name;
      valB = detailsB.name;
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else if (sortField === 'revenue') {
      valA = detailsA.performanceRevenue;
      valB = detailsB.performanceRevenue;
    } else if (sortField === 'bookedSlots') {
      valA = detailsA.bookedSlots || 0;
      valB = detailsB.bookedSlots || 0;
    } else {
      valA = detailsA.occupancy;
      valB = detailsB.occupancy;
    }

    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  // Find top performing court
  const topCourt = activeCourts.length > 0
    ? [...activeCourts].sort((a, b) => getCourtDetails(b).occupancy - getCourtDetails(a).occupancy)[0]
    : null;
  const topCourtDetails = topCourt ? getCourtDetails(topCourt) : null;

  // Format date range text for subtitle
  const formatDateVN = (dStr?: string) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  const hasData = totalBookingsCount > 0 || totalBookedSlots > 0 || todayRevenue > 0;

  // Time Filter Toolbar Component
  const renderTimeFilterBar = () => (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
      {/* Preset Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto select-none py-0.5">
        {[
          { key: 'today', label: 'Hôm nay' },
          { key: '7days', label: '7 ngày qua' },
          { key: '30days', label: '30 ngày qua' },
          { key: 'custom', label: 'Tùy chỉnh ngày' },
        ].map(pill => {
          const isActive = dateRangePreset === pill.key;
          return (
            <button
              key={pill.key}
              onClick={() => setDateRangePreset && setDateRangePreset(pill.key as DateRangePreset)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-brand-emerald text-white shadow-sm border-b border-emerald-950'
                  : 'bg-white text-slate-600 hover:bg-slate-100/80 border border-slate-200/60'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range Picker Inputs */}
      <div className="flex items-center gap-2">
        {dateRangePreset === 'custom' && (
          <div className="flex items-center gap-1.5 animate-fadeIn">
            <input
              type="date"
              value={customFromDate}
              onChange={e => setCustomFromDate && setCustomFromDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:border-brand-emerald"
            />
            <span className="text-slate-400 text-xs font-bold">-</span>
            <input
              type="date"
              value={customToDate}
              onChange={e => setCustomToDate && setCustomToDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:border-brand-emerald"
            />
          </div>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoadingStats}
            title="Làm mới thống kê"
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center flex-shrink-0"
          >
            <svg
              className={`w-4 h-4 text-slate-500 ${isLoadingStats ? 'animate-spin text-brand-emerald' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12 select-none animate-fadeIn">
      {/* 1. Time Range Filter Toolbar */}
      {renderTimeFilterBar()}

      {/* Date Range Description Label */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            Khoảng thời gian: {formatDateVN(statistics?.fromDate)} {statistics?.fromDate !== statistics?.toDate && `đến ${formatDateVN(statistics?.toDate)}`}
          </span>
        </div>
        {isLoadingStats && (
          <span className="text-[10px] text-brand-emerald font-extrabold flex items-center gap-1">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 14v1m8-8h-1M5 12H4m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            </svg>
            Đang đồng bộ dữ liệu...
          </span>
        )}
      </div>

      {/* 2. Top KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Doanh thu thực tế */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-850 to-teal-950 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between h-32 border border-emerald-800/40">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-emerald-200/80 uppercase tracking-wider">Doanh thu kỳ này</span>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-brand-yellow">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white">{formatVND(todayRevenue)}</h3>
            <p className="text-[10px] text-emerald-300/80 font-bold mt-0.5">Tiền thực thu từ đơn đặt</p>
          </div>
        </div>

        {/* Card 2: Hiệu suất lấp đầy */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tỉ lệ lấp đầy</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              avgOccupancy >= 70 ? 'bg-emerald-50 text-emerald-600' :
              avgOccupancy >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
            }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-800">{avgOccupancy}%</h3>
              <span className="text-[10px] font-bold text-slate-400">
                ({totalBookedSlots}/{totalVenueSlots} ca)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  avgOccupancy >= 70 ? 'bg-emerald-500' : avgOccupancy >= 40 ? 'bg-amber-400' : 'bg-slate-400'
                }`}
                style={{ width: `${Math.min(avgOccupancy, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Tổng đơn đặt lịch */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tổng đơn đặt lịch</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">{totalBookingsCount} <span className="text-xs font-bold text-slate-400">lượt</span></h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Xác nhận & Hoàn tất</p>
          </div>
        </div>

        {/* Card 4: Sân hoạt động năng nổ nhất */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sân dẫn đầu</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <div>
            {topCourtDetails && topCourtDetails.occupancy > 0 ? (
              <>
                <h3 className="text-sm font-black text-slate-800 truncate">{topCourtDetails.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-black text-emerald-600">Lấp đầy: {topCourtDetails.occupancy}%</span>
                  <span className="text-[9px] font-bold text-slate-400">({topCourtDetails.bookedSlots} ca)</span>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xs font-bold text-slate-400">Chưa có dữ liệu</h3>
                <p className="text-[9px] text-slate-300 font-bold mt-0.5">Chưa có lượt đặt</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Empty State or Visual Charts */}
      {!hasData ? (
        <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-3 my-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shadow-xs">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Chưa có dữ liệu vận hành</h4>
          <p className="text-xs text-slate-400 font-semibold max-w-md leading-relaxed">
            Chưa có lượt đặt sân nào được ghi nhận trong khoảng thời gian đã chọn ({formatDateVN(statistics?.fromDate)} - {formatDateVN(statistics?.toDate)}). Bạn có thể đổi mốc thời gian xem thống kê hoặc tạo thêm ưu đãi cho khách hàng.
          </p>
        </div>
      ) : (
        /* Charts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* SVG Donut Chart */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col items-center">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-6 text-center">
              Tỉ lệ Trạng thái Sân bãi trong Cụm sân
            </h4>
            <DonutChart
              activeCount={activeCount}
              maintCount={maintCount}
              closedCount={closedCount}
              totalCount={totalOpCourts}
            />
          </div>

          {/* Bar Chart */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 text-center">
              Hiệu quả Sân bãi (Doanh thu & Tỉ lệ lấp đầy)
            </h4>

            {activeCourts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-bold">
                Chưa có dữ liệu sân bãi
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <BarChart
                    courts={activeCourts}
                    getCourtOpStatus={getCourtOpStatus}
                    getCourtDetails={getCourtDetails}
                    formatVND={formatVND}
                  />
                </div>
                {/* Legend row */}
                <div className="flex items-center justify-center gap-5 mt-4 pt-3 border-t border-slate-100">
                  {[
                    { color: 'bg-emerald-500', label: 'Hoạt động' },
                    { color: 'bg-amber-400', label: 'Bảo trì' },
                    { color: 'bg-red-500', label: 'Đóng cửa' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                      <span className={`w-2 h-2 rounded-full ${l.color}`} />
                      {l.label}
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                    <div className="w-8 h-1.5 bg-slate-200 rounded-full" />
                    Tỉ lệ lấp đầy
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 4. Detailed Court Breakdown Table */}
      {activeCourts.length > 0 && (
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Chi tiết hiệu quả từng sân bãi
              </h4>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                Bảng phân bổ chi tiết lượt đặt, số ca sử dụng và doanh thu thực tế
              </p>
            </div>
            <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
              {activeCourts.length} sân trực thuộc
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th
                    onClick={() => handleSort('name')}
                    className="pb-3 px-3 cursor-pointer hover:text-slate-600 transition-all"
                  >
                    Tên sân {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="pb-3 px-3">Trạng thái</th>
                  <th
                    onClick={() => handleSort('bookedSlots')}
                    className="pb-3 px-3 text-center cursor-pointer hover:text-slate-600 transition-all"
                  >
                    Số ca đặt / Tổng ca {sortField === 'bookedSlots' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('occupancy')}
                    className="pb-3 px-3 cursor-pointer hover:text-slate-600 transition-all"
                  >
                    Tỉ lệ lấp đầy {sortField === 'occupancy' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('revenue')}
                    className="pb-3 px-3 text-right cursor-pointer hover:text-slate-600 transition-all"
                  >
                    Doanh thu {sortField === 'revenue' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sortedCourts.map(court => {
                  const details = getCourtDetails(court);
                  const opStatus = getCourtOpStatus(court.id);
                  const statusColor =
                    opStatus === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : opStatus === 'MAINTENANCE'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200';
                  const statusLabel =
                    opStatus === 'ACTIVE' ? 'Hoạt động' : opStatus === 'MAINTENANCE' ? 'Bảo trì' : 'Đóng cửa';

                  return (
                    <tr key={court.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-extrabold text-slate-800">
                        {details.name}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-600">
                        <span className="font-extrabold text-slate-800">{details.bookedSlots || 0}</span>
                        <span className="text-slate-400">/{details.totalSlots || 0} ca</span>
                      </td>
                      <td className="py-3 px-3 min-w-[140px]">
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                details.occupancy >= 70
                                  ? 'bg-emerald-500'
                                  : details.occupancy >= 40
                                  ? 'bg-amber-400'
                                  : 'bg-slate-400'
                              }`}
                              style={{ width: `${Math.min(details.occupancy, 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-black text-slate-700 min-w-[36px]">
                            {details.occupancy}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-brand-emerald">
                        {formatVND(details.performanceRevenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
