import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Dropdown } from '../../../components/ui/Dropdown';
import { formatPrice } from './mockData';
import { useBookingMatrix } from '../hooks/useBookingMatrix';
import { isPastSlot } from '../../../utils/timeUtils';
import { ticketService } from '../../venue/services/ticketService';
import { getSportLevelLabel } from '../../venue/hooks/useTicketSessions';
import { Copy, Check, Users, Award, Tag, Ticket, Clock, Calendar } from 'lucide-react';

interface DesktopBookingGridProps {
  venueId: string;
  refreshCounter: number;
}

export const DesktopBookingGrid: React.FC<DesktopBookingGridProps> = ({ venueId, refreshCounter }) => {
  const {
    times,
    slots,
    searchTerm,
    setSearchTerm,
    currentDate,
    date,
    isBookingModalOpen,
    setIsBookingModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    showKpis,
    setShowKpis,
    quickBookingData,
    setQuickBookingData,
    selectedBookingDetail,
    filteredFacilities,
    kpis,
    getCellStyle,
    handlePrevDay,
    handleNextDay,
    handleToday,
    handleCellClick,
    handleQuickBookingSubmit,
    handleCancelBooking,
    isBlockStart,
    getBlockSpan,
    isInsideBlock,
    handleConfirmDeposit,
    shiftMinutes,
    sportName,
    closingTime,
    shiftOptions,
    selectedShiftId,
    handleShiftChange,
    isConfirmCancelOpen,
    setIsConfirmCancelOpen
  } = useBookingMatrix(venueId, refreshCounter);

  return (
    <div className="w-full flex flex-col gap-5 min-h-0">
      
      {/* ─── STYLE ĐỊNH NGHĨA SỌC BẢO TRÌ & SCROLLBAR ──────────────── */}
      <style>{`
        .bg-stripes-red {
          background-image: repeating-linear-gradient(45deg, #fee2e2, #fee2e2 8px, #fecaca 8px, #fecaca 16px);
        }
        .matrix-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .matrix-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 8px; }
        .matrix-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 999px; border: 2px solid #f1f5f9; }
        .matrix-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
        .matrix-scroll::-webkit-scrollbar-corner { background: #f1f5f9; }
        .matrix-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 #f1f5f9; }
      `}</style>

      {/* ─── 1. THẺ THỐNG KÊ KPI CARDS ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all duration-300 overflow-hidden">
        {/* Toggleable Header */}
        <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-4 select-none">
          {showKpis ? (
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
              Báo cáo hiệu suất hoạt động hôm nay
            </h3>
          ) : (
            <div className="flex items-center gap-6 text-xs text-slate-500 font-bold">
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Tỷ lệ lấp đầy: <span className="text-slate-800 font-black">{kpis.occupancyRate}%</span>
              </span>
              <span className="w-px h-3.5 bg-slate-200"></span>
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Doanh thu hôm nay: <span className="text-slate-800 font-black">{formatPrice(kpis.totalRevenue)}</span>
              </span>
              <span className="w-px h-3.5 bg-slate-200"></span>
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9m1.414-1.414A2 2 0 1114 3.586V5h-3.586M9 11h6m-6 4h6" />
                </svg>
                Lượt đặt sân: <span className="text-slate-800 font-black">{kpis.bookingBlockCount} lượt</span>
              </span>
              <span className="w-px h-3.5 bg-slate-200"></span>
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Sân hoạt động: <span className="text-slate-800 font-black">{kpis.activeCourtsText} sân</span>
              </span>
            </div>
          )}
          <button 
            onClick={() => setShowKpis(!showKpis)}
            className="flex items-center gap-1.5 text-xs font-black text-brand-emerald hover:text-emerald-950 transition-colors focus:outline-none cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${showKpis ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
            {showKpis ? 'Thu gọn thống kê' : 'Chi tiết thống kê'}
          </button>
        </div>

        {/* Collapsible Cards Grid Container */}
        <div 
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            showKpis ? 'max-h-[300px] opacity-100 border-t border-slate-100 p-5 bg-slate-50/30' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI: Tỷ lệ lấp đầy */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ lấp đầy</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-brand-emerald">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{kpis.occupancyRate}%</div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-brand-emerald h-full rounded-full" style={{ width: `${kpis.occupancyRate}%` }}></div>
                </div>
              </div>
            </div>

            {/* KPI: Doanh thu dự kiến */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doanh thu hôm nay</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{formatPrice(kpis.totalRevenue)}</div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  Tăng 12% so với hôm qua
                </span>
              </div>
            </div>

            {/* KPI: Tổng lượt đặt */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng lượt đặt</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9m1.414-1.414A2 2 0 1114 3.586V5h-3.586M9 11h6m-6 4h6" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{kpis.bookingBlockCount} lượt</div>
                <span className="text-[10px] text-slate-400 font-medium block mt-2">Đã tối ưu hóa lịch trống</span>
              </div>
            </div>

            {/* KPI: Sân đang hoạt động */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sân hoạt động</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{kpis.activeCourtsText} sân</div>
                <span className="text-[10px] text-slate-400 font-medium block mt-2">Sẵn sàng phục vụ khách</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. THANH BỘ LỌC FILTER TOOLBAR ──────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/85 shadow-[0_4px_18px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Ô Tìm kiếm sân hoặc khách */}
          <div className="relative">
            <svg className="w-4 h-4 text-slate-450 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm sân hoặc khách đặt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald w-64 font-medium placeholder-slate-400 transition-all font-sans"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Chọn ngày & Nút đặt nhanh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
            <button onClick={handlePrevDay} className="px-3 py-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={handleToday} className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border-x border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
              {currentDate}
            </button>
            <button onClick={handleNextDay} className="px-3 py-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-1.5 bg-brand-emerald text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-emerald-950 hover:shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Đặt sân nhanh
          </button>
        </div>
      </div>

      {/* ─── 3. BẢNG MA TRẬN ĐẶT SÂN (FORM MA TRẬN GỘP KHỐI TRUYỀN THỐNG) ─── */}
      <div className="matrix-scroll overflow-x-auto overflow-y-visible rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.06)] select-none">
        <table className="border-collapse w-full">
          <thead>
            <tr className="sticky top-0 z-30">
              <th
                style={{ position: 'sticky', left: 0, zIndex: 40, minWidth: 160 }}
                className="h-12 bg-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider border-b border-r border-slate-350 text-center"
              >
                Sân bóng
              </th>
              
              {times.map((time) => {
                const isHour = time.endsWith(':00');
                return (
                  <th
                    key={time}
                    style={{ minWidth: 84 }}
                    className={`h-12 text-[11px] font-extrabold tracking-wider px-1 border-b text-center border-slate-250 ${
                      isHour
                        ? 'bg-slate-100 text-slate-800 border-r border-r-slate-300'
                        : 'bg-slate-50 text-slate-600 border-r border-r-slate-200'
                    }`}
                  >
                    {time}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredFacilities.map((facility) => (
              <tr key={facility.id} className="group/row hover:bg-slate-50/30">
                <td
                  style={{ position: 'sticky', left: 0, zIndex: 20, minWidth: 160 }}
                  className="h-13 bg-slate-100 text-slate-800 border-b border-r border-slate-200 shadow-[4px_0_12px_rgba(0,0,0,0.02)] text-center font-bold"
                >
                  <div className="flex flex-col items-center justify-center px-3">
                    <span className="text-sm font-black text-slate-800">{facility.name}</span>
                    <span className="text-[10px] text-brand-emerald font-bold uppercase tracking-wider mt-0.5">{sportName || 'Sân đấu'}</span>
                  </div>
                </td>

                {times.map((time, colIdx) => {
                  const slot = slots.find(s => s.facilityId === facility.id && s.time === time);
                  const status = slot?.status || 'available';
                  const isHourBorder = time.endsWith(':00');

                  if (isInsideBlock(facility.id, time, status, slot?.customerName, slot?.ticketSessionId, slot?.bookingId, slot?.customerPhone)) {
                    return null;
                  }

                  const span = status !== 'available' ? getBlockSpan(facility.id, colIdx, status, slot?.customerName, slot?.ticketSessionId, slot?.bookingId, slot?.customerPhone) : 1;
                  const isPast = isPastSlot(date, time);
                  const isLocked = status === 'locked' || (status === 'available' && isPast);

                  if (isLocked) {
                    return (
                      <td
                        key={`${facility.id}-${time}`}
                        colSpan={span}
                        style={{ minWidth: span > 1 ? undefined : 84 }}
                        className={`h-13 p-0 border-b border-slate-200/70 border-r border-r-slate-250 bg-stripes-past opacity-55 pointer-events-none select-none ${
                          isHourBorder ? 'border-l-2 border-l-slate-400/80' : ''
                        }`}
                      />
                    );
                  }

                  return (
                    <td
                      key={`${facility.id}-${time}`}
                      colSpan={span}
                      onClick={() => handleCellClick(facility.id, time, status)}
                      style={{ minWidth: span > 1 ? undefined : 84 }}
                      className={`h-13 p-0 border-b border-slate-200/70 transition-all cursor-pointer ${
                        isHourBorder ? 'border-l-2 border-l-slate-400/80' : ''
                      } ${status === 'available' ? 'border-r border-r-slate-350' : ''} ${
                        isPast ? 'opacity-60' : ''
                      }`}
                    >
                      {status === 'available' ? (
                        <div className={`h-full w-full flex items-center justify-center ${getCellStyle(status)} group`}>
                          <span className="w-6 h-6 rounded-full flex items-center justify-center bg-emerald-500/0 text-emerald-600 font-black text-base opacity-0 group-hover:opacity-100 group-hover:bg-emerald-500/10 transition-all duration-150">
                            +
                          </span>
                        </div>
                      ) : (
                        <div className={`h-10 mx-1 rounded-xl flex items-center justify-between px-3 gap-2 shadow-sm ${getCellStyle(status)}`}>
                          <div className="flex items-center gap-1.5 min-w-0">
                            {status === 'booked' && (
                              <svg className="w-3.5 h-3.5 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            )}
                            {status === 'pending' && (
                              <svg className="w-3.5 h-3.5 text-amber-950/70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {status === 'matchmaking' && (
                              <svg className="w-3.5 h-3.5 text-white/90 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                              </svg>
                            )}
                            {status === 'maintenance' && (
                              <svg className="w-3.5 h-3.5 text-red-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01" />
                              </svg>
                            )}
                            <span className="text-xs font-black truncate uppercase tracking-wide">
                              {status === 'matchmaking' 
                                ? `🎫 XÉ VÉ (${slot?.bookedSlots}/${slot?.maxSlots})`
                                : (slot?.customerName || (status === 'maintenance' ? 'BẢO TRÌ' : ''))}
                            </span>
                          </div>
                          <span className="text-[9px] font-extrabold opacity-75 whitespace-nowrap bg-black/10 px-1.5 py-0.5 rounded">
                            {span * shiftMinutes}p
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── 4. MODAL: ĐẶT SÂN NHANH ───────────────────────────────── */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Đặt sân bóng nhanh" maxWidth="md">
        <form onSubmit={handleQuickBookingSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chọn Sân</label>
            <Dropdown
              options={filteredFacilities.map(f => ({
                value: f.id,
                label: `${f.name} (${formatPrice(f.pricePerHour)}/h)`
              }))}
              value={quickBookingData.facilityId}
              onChange={(val) => setQuickBookingData({...quickBookingData, facilityId: val})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Chọn ca chơi</label>
            {shiftOptions.length > 0 ? (
              <Dropdown
                options={shiftOptions}
                value={selectedShiftId}
                onChange={handleShiftChange}
                className="w-full text-xs font-medium font-sans"
              />
            ) : (
              <div className="text-xs text-red-500 font-bold border border-red-200 bg-red-50 p-3 rounded-xl">
                Không còn ca trống nào trong ngày của sân này.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Giá sân</label>
              <div className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-black text-slate-700 flex items-center h-10 select-none">
                {formatPrice(slots.find(s => s.facilityId === quickBookingData.facilityId && s.time === quickBookingData.startTime)?.price || 0)} / ca
              </div>
            </div>
            <div className="col-span-2 mt-2">
              <div className="h-[1px] w-full bg-slate-100 mb-4"></div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Thông tin khách hàng (Tùy chọn)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Tên khách hàng"
                    value={quickBookingData.customerName}
                    onChange={(e) => setQuickBookingData({...quickBookingData, customerName: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald h-10"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Số điện thoại"
                    value={quickBookingData.customerPhone}
                    onChange={(e) => setQuickBookingData({...quickBookingData, customerPhone: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald h-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full bg-brand-emerald hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer">
              Xác nhận đặt lịch
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── 5. MODAL: CHI TIẾT ĐẶT SÂN ─────────────────────────────── */}
      <Modal isOpen={isDetailModalOpen && !!selectedBookingDetail} onClose={() => setIsDetailModalOpen(false)} title="Thông tin lịch đặt" maxWidth="sm">
        {selectedBookingDetail && (
          <div className="space-y-4 font-sans select-none">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedBookingDetail.status === 'booked' ? 'bg-emerald-600 text-white' :
                selectedBookingDetail.status === 'pending' ? 'bg-amber-400 text-amber-950' :
                selectedBookingDetail.status === 'matchmaking' ? 'bg-indigo-600 text-white bg-gradient-to-br from-indigo-600 to-purple-600' :
                'bg-red-500 text-white'
              }`}>
                {selectedBookingDetail.status === 'booked' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                {selectedBookingDetail.status === 'pending' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {selectedBookingDetail.status === 'matchmaking' && <svg className="w-5 h-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
                {selectedBookingDetail.status === 'maintenance' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  {selectedBookingDetail.customerName}
                  {selectedBookingDetail.customerPhone ? (
                    <a href={`tel:${selectedBookingDetail.customerPhone}`} className="text-xs font-bold text-slate-500 lowercase flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 hover:bg-slate-200 hover:text-brand-emerald transition-colors">
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {selectedBookingDetail.customerPhone}
                    </a>
                  ) : (
                    !selectedBookingDetail.isManual && (
                      <span className="text-xs font-bold text-slate-400 lowercase flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 italic">
                        Chưa cập nhật SĐT
                      </span>
                    )
                  )}
                </h4>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md mt-1 inline-block uppercase tracking-wider ${
                  selectedBookingDetail.status === 'booked' ? 'bg-emerald-100 text-emerald-800' :
                  selectedBookingDetail.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  selectedBookingDetail.status === 'matchmaking' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                  selectedBookingDetail.status === 'locked' ? 'bg-slate-150 text-slate-700' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedBookingDetail.status === 'booked' ? 'Đã đặt' :
                   selectedBookingDetail.status === 'pending' ? 'Đặt thủ công' :
                   selectedBookingDetail.status === 'matchmaking' ? 'Ca xé vé ghép' :
                   selectedBookingDetail.status === 'locked' ? 'Đã quá giờ' :
                   selectedBookingDetail.status === 'maintenance' ? 'Bảo trì' : 'Không xác định'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-400">Sân bóng</span>
                <span className="font-black text-slate-800">{selectedBookingDetail.facility.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-400">Thời gian</span>
                <div className="text-right flex flex-col items-end">
                  <span className="font-black text-brand-emerald">{selectedBookingDetail.startTime} – {selectedBookingDetail.endTime}</span>
                  {selectedBookingDetail.status !== 'maintenance' && selectedBookingDetail.status !== 'matchmaking' && (
                    <span className="text-[10px] font-bold text-slate-400 mt-0.5 bg-slate-100 px-1.5 py-0.5 rounded">
                      {selectedBookingDetail.slotIds.length} ca x {shiftMinutes}p
                    </span>
                  )}
                </div>
              </div>
              
              {selectedBookingDetail.status === 'matchmaking' ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400" /> Số lượng vé</span>
                    <span className="font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {selectedBookingDetail.bookedSlots || 0} / {selectedBookingDetail.maxSlots || 10} slots
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-400 flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-slate-400" /> Trình độ yêu cầu</span>
                    <span className="font-black text-slate-700">{getSportLevelLabel(selectedBookingDetail.skillLevel || 'ALL')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-400 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-slate-400" /> Giá vé/người</span>
                    <span className="font-black text-brand-emerald text-sm">{formatPrice(selectedBookingDetail.pricePerTicket || 0)}</span>
                  </div>
                  
                  {/* Inline Test Tickets Section */}
                  <TestTicketsSection sessionId={selectedBookingDetail.ticketSessionId} />
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-400">Đơn giá / ca</span>
                    <span className="font-bold text-slate-700">{formatPrice(selectedBookingDetail.price / Math.max(1, selectedBookingDetail.slotIds.length))}</span>
                  </div>
                  {selectedBookingDetail.status !== 'maintenance' && (
                    <div className="flex justify-between items-center py-2 bg-emerald-50/50 px-3 -mx-3 rounded-xl border border-emerald-100/50 mt-1">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Tổng cộng</span>
                      <span className="font-black text-brand-emerald text-base">{formatPrice(selectedBookingDetail.price)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="pt-2 space-y-2">
              {selectedBookingDetail.status === 'pending' && (
                <button onClick={handleConfirmDeposit} className="w-full bg-brand-emerald hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer">
                  Xác nhận đã đặt cọc
                </button>
              )}
              {(selectedBookingDetail.status === 'matchmaking' || 
                ((selectedBookingDetail.status === 'booked' || selectedBookingDetail.status === 'pending') && selectedBookingDetail.isManual)) ? (
                <button onClick={() => setIsConfirmCancelOpen(true)} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer border border-red-100">
                  {selectedBookingDetail.status === 'matchmaking' ? 'Hủy ca xé vé này' : 'Hủy lịch đặt sân này'}
                </button>
              ) : (
                (selectedBookingDetail.status === 'booked' || selectedBookingDetail.status === 'pending') && (
                  <div className="p-3 bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-extrabold rounded-xl text-center uppercase tracking-wider">
                    Không thể hủy lịch đặt của khách đặt qua App
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ─── 5.1. MODAL XÁC NHẬN HỦY ───────────────────────────────── */}
      <Modal 
        isOpen={isConfirmCancelOpen} 
        onClose={() => setIsConfirmCancelOpen(false)} 
        title="Xác nhận hủy lịch" 
        maxWidth="sm"
        footer={
          <div className="flex gap-2 justify-end w-full select-none font-sans">
            <button 
              type="button"
              onClick={() => setIsConfirmCancelOpen(false)} 
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Quay lại
            </button>
            <button 
              type="button"
              onClick={async () => {
                setIsConfirmCancelOpen(false);
                await handleCancelBooking();
              }} 
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors cursor-pointer border border-red-200"
            >
              Đồng ý hủy
            </button>
          </div>
        }
      >
        <div className="space-y-3 font-sans text-left select-none">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-3 mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h4 className="text-sm font-black text-slate-800 text-center uppercase tracking-tight">Bạn có chắc chắn muốn hủy?</h4>
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            Hành động này sẽ giải phóng khung giờ chơi và không thể hoàn tác. Các bên liên quan sẽ nhận được thông báo.
          </p>
        </div>
      </Modal>
    </div>
  );
};

// ═══ Subcomponent hiển thị danh sách vé test trong chi tiết đặt sân ═══
const TestTicketsSection: React.FC<{ sessionId?: string }> = ({ sessionId }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const list = await ticketService.getTestTickets(sessionId);
        setTickets(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [sessionId]);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!sessionId) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 select-none">
      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
        <Ticket className="w-3.5 h-3.5 text-slate-400" />
        Vé test dùng để check-in thủ công
      </h5>
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-brand-emerald border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tickets.length === 0 ? (
        <p className="text-[10px] text-slate-400 font-semibold italic text-center py-2">Không có vé test nào cho ca này</p>
      ) : (
        <div className="space-y-1.5 max-h-36 overflow-y-auto">
          {tickets.map(t => (
            <div key={t.ticketId} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150/70">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-700 block">{t.customerName}</span>
                <span className="text-[9px] font-extrabold text-indigo-650 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 uppercase tracking-wider font-mono">
                  Mã: {t.shortCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(t.shortCode, t.ticketId)}
                className={`text-[9px] font-extrabold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 uppercase tracking-wider ${
                  copiedId === t.ticketId
                    ? 'bg-emerald-50 text-brand-emerald border-emerald-150'
                    : 'bg-white text-slate-550 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {copiedId === t.ticketId ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Đã copy
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy mã
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
