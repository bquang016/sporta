import React from 'react';
import { DonutChart } from './DonutChart';
import { BarChart } from './BarChart';
import type { CourtResponse } from '../../types';

interface OperationsOverviewTabProps {
  activeCourts: CourtResponse[];
  todayRevenue: number;
  totalBookingsCount: number;
  avgOccupancy: number;
  activeCount: number;
  maintCount: number;
  closedCount: number;
  totalOpCourts: number;
  getCourtOpStatus: (id: string) => 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
  getCourtDetails: (court: CourtResponse) => {
    name: string;
    price: number;
    surcharge: number;
    liveStatus: string;
    occupancy: number;
    performanceRevenue: number;
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
  activeCount,
  maintCount,
  closedCount,
  totalOpCourts,
  getCourtOpStatus,
  getCourtDetails,
  formatVND,
  isMobile = false
}: OperationsOverviewTabProps) => {
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {[
            { label: 'Doanh thu hôm nay', value: formatVND(todayRevenue) },
            { label: 'Hiệu suất lấp đầy', value: `${avgOccupancy}%` },
          ].map(card => (
            <div key={card.label} className="bg-white border border-slate-200/60 rounded-3xl p-4 shadow-sm flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase">{card.label}</span>
                <h4 className="text-base font-black text-slate-800">{card.value}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {/* Mobile Donut Chart */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider text-center">Trạng thái hoạt động</h3>
            <DonutChart
              activeCount={activeCount}
              maintCount={maintCount}
              closedCount={closedCount}
              totalCount={totalOpCourts}
              isMobile
            />
          </div>

          {/* Mobile Bar Chart */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider text-center">Doanh thu ước tính sân bãi</h3>
            <BarChart
              courts={activeCourts}
              getCourtOpStatus={getCourtOpStatus}
              getCourtDetails={getCourtDetails}
              formatVND={formatVND}
              isMobile
            />
          </div>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="space-y-6 pb-6 select-none">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Doanh thu hôm nay',
            value: formatVND(todayRevenue),
            icon: (
              <svg className="w-5 h-5 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            bgIcon: 'bg-emerald-50',
          },
          {
            label: 'Hiệu suất lấp đầy',
            value: `${avgOccupancy}%`,
            icon: (
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ),
            bgIcon: 'bg-blue-50',
          },
          {
            label: 'Tổng đơn đặt lịch',
            value: `${totalBookingsCount} đơn`,
            icon: (
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ),
            bgIcon: 'bg-slate-100',
          },
        ].map(card => (
          <div key={card.label} className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{card.label}</p>
              <h3 className="text-xl font-black text-slate-800">{card.value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-2xl ${card.bgIcon} flex items-center justify-center`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* SVG Donut Chart */}
        <div className="bg-white border border-slate-250/60 rounded-3xl p-6 shadow-sm flex flex-col items-center">
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
        <div className="bg-white border border-slate-250/60 rounded-3xl p-6 shadow-sm flex flex-col">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 text-center">
            Hiệu quả Sân bãi (Doanh thu ước tính / ngày)
          </h4>

          {activeCourts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-bold">
              Chưa có dữ liệu thống kê sân bãi
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
              <span className="text-[8px] text-slate-400 text-center font-bold mt-2 uppercase tracking-widest">
                Danh sách các sân bãi trong cụm sân
              </span>
            </>
          )}
        </div>
      </div>

      {/* Per-court occupancy detail table */}
      {activeCourts.length > 0 && (
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">Chi tiết từng sân bãi</h4>
          <div className="space-y-3">
            {activeCourts.map(court => {
              const details = getCourtDetails(court);
              const opStatus = getCourtOpStatus(court.id);
              const statusColor =
                opStatus === 'ACTIVE' ? 'bg-emerald-500' :
                opStatus === 'MAINTENANCE' ? 'bg-amber-400' : 'bg-red-500';
              const statusLabel =
                opStatus === 'ACTIVE' ? 'Hoạt động' : opStatus === 'MAINTENANCE' ? 'Bảo trì' : 'Đóng cửa';
              return (
                <div key={court.id} className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-extrabold text-slate-800 truncate">{details.name}</span>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span className="text-[10px] font-black text-slate-500">{details.occupancy}%</span>
                        <span className="text-[10px] font-black text-brand-emerald">{formatVND(details.performanceRevenue)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${statusColor}`}
                        style={{ width: `${details.occupancy}%`, opacity: opStatus !== 'ACTIVE' ? 0.4 : 1 }}
                      />
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border flex-shrink-0 ${
                    opStatus === 'ACTIVE' ? 'bg-emerald-50 text-brand-emerald border-emerald-100' :
                    opStatus === 'MAINTENANCE' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-red-50 text-red-500 border-red-100'
                  }`}>{statusLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
