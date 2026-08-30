import React, { useRef, useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Dropdown } from '../../../components/ui/Dropdown';
import { formatPrice } from './mockData';
import { useBookingMatrix } from '../hooks/useBookingMatrix';
import { isPastSlot } from '../../../utils/timeUtils';
import { ticketService } from '../../venue/services/ticketService';
import { getSportLevelLabel } from '../../venue/hooks/useTicketSessions';
import { Copy, Check, Users, Award, Tag, Ticket, Clock, Phone } from 'lucide-react';

const SESSIONS = {
  morning: {
    label: 'Sáng',
    time: '06:00'
  },
  afternoon: {
    label: 'Chiều',
    time: '12:00'
  },
  evening: {
    label: 'Tối',
    time: '17:00'
  }
};

interface MobileBookingGridProps {
  venueId: string;
  refreshCounter: number;
}

export const MobileBookingGrid: React.FC<MobileBookingGridProps> = ({ venueId, refreshCounter }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    times: allTimes,
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
    setSelectedBookingDetail,
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

  const [activeSession, setActiveSession] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  const times = allTimes.filter(t => {
    const hr = parseInt(t.split(':')[0]);
    if (activeSession === 'morning') return hr >= 6 && hr < 12;
    if (activeSession === 'afternoon') return hr >= 12 && hr < 17;
    return hr >= 17 && hr <= 22;
  });

  return (
    <div className="w-full flex flex-col gap-4 min-h-0 select-none pb-24">
      
      {/* ─── STYLE ĐỊNH NGHĨA SỌC BẢO TRÌ & SCROLLBAR ──────────────── */}
      <style>{`
        .bg-stripes-red {
          background-image: repeating-linear-gradient(45deg, #fee2e2, #fee2e2 6px, #fecaca 6px, #fecaca 12px);
        }
      `}</style>

      {/* KPIs Summary Cards */}
      <div className="px-4">
        <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="space-y-0.5">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Lấp đầy</span>
            <p className="text-sm font-black text-slate-800 tracking-tight">{kpis.occupancyRate}%</p>
          </div>
          <div className="space-y-0.5 border-x border-slate-100 px-2">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Doanh thu</span>
            <p className="text-sm font-black text-brand-emerald tracking-tight truncate">{formatPrice(kpis.totalRevenue)}</p>
          </div>
          <div className="space-y-0.5 pl-1">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Sân mở</span>
            <p className="text-sm font-black text-slate-800 tracking-tight">{kpis.activeCourtsText}</p>
          </div>
        </div>
      </div>

      {/* Date Switcher & Search Bar */}
      <div className="px-4 space-y-2.5">
        <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs">
          <button 
            type="button"
            onClick={handlePrevDay} 
            className="touch-target w-9 h-9 flex items-center justify-center text-slate-600 active:bg-slate-100 rounded-xl transition-transform active:scale-95"
            aria-label="Ngày trước"
          >
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-800">{currentDate}</span>
            <button
              type="button"
              onClick={handleToday}
              className="touch-target px-2 py-0.5 bg-emerald-50 active:bg-emerald-100 text-[#064e3b] text-[9px] font-black uppercase rounded-lg border border-emerald-200 transition-all active:scale-95"
            >
              Hôm nay
            </button>
          </div>

          <button 
            type="button"
            onClick={handleNextDay} 
            className="touch-target w-9 h-9 flex items-center justify-center text-slate-600 active:bg-slate-100 rounded-xl transition-transform active:scale-95"
            aria-label="Ngày sau"
          >
            <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm sân hoặc tên khách đặt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-brand-emerald shadow-2xs"
          />
          {searchTerm && (
            <button 
              type="button"
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Toggle Session tabs */}
      <div className="px-4 select-none">
        <div className="bg-slate-200/70 p-1 rounded-2xl flex gap-1 border border-slate-200/50 shadow-inner">
          {(Object.keys(SESSIONS) as Array<keyof typeof SESSIONS>).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSession(key)}
              className={`flex-1 py-1.5 rounded-xl text-center text-xs font-black transition-all cursor-pointer ${
                activeSession === key 
                  ? 'bg-white text-[#064e3b] shadow-xs scale-[1.02]' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {SESSIONS[key].label}
            </button>
          ))}
        </div>
      </div>


      {/* Grid Container */}
      <div className="px-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden select-none">
          <div className="matrix-scroll overflow-x-auto w-full" ref={scrollContainerRef}>
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  <th className="sticky left-0 z-30 bg-slate-100 text-slate-800 text-[10px] font-black uppercase tracking-wider h-11 border-b border-r-2 border-slate-200 px-3 text-center min-w-[105px] shadow-[2px_0_6px_rgba(0,0,0,0.04)]">
                    Sân đấu
                  </th>
                  {times.map(t => (
                    <th 
                      key={t} 
                      className={`h-11 text-[11px] font-black text-slate-700 tracking-wider px-1 text-center min-w-[96px] border-b border-slate-200 ${
                        t.endsWith(':00') ? 'bg-slate-100/90 text-slate-900 border-l border-slate-300' : 'bg-slate-50'
                      }`}
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFacilities.map(facility => (
                  <tr key={facility.id} className="border-b border-slate-150">
                    <td className="sticky left-0 z-20 bg-white text-slate-900 text-xs font-black px-2.5 py-3 text-center border-r-2 border-slate-200 shadow-[2px_0_6px_rgba(0,0,0,0.04)] min-w-[105px]">
                      <span className="block text-slate-900 font-black">{facility.name}</span>
                      <span className="inline-block text-[8px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded mt-0.5 uppercase tracking-wide">
                        {sportName || 'Sân đấu'}
                      </span>
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
                            className={`p-0 text-center h-14 border-r border-slate-200 bg-stripes-past opacity-55 pointer-events-none select-none ${
                              isHourBorder ? 'border-l border-slate-300' : ''
                            }`}
                          />
                        );
                      }

                      return (
                        <td
                          key={`${facility.id}-${time}`}
                          colSpan={span}
                          onClick={() => handleCellClick(facility.id, time, status)}
                          className={`p-1 text-center h-14 transition-all cursor-pointer ${
                            isHourBorder ? 'border-l border-slate-300' : 'border-r border-slate-100'
                          } ${isPast ? 'opacity-60' : ''}`}
                        >
                          {status === 'available' ? (
                            <div className="w-full h-full rounded-xl border border-dashed border-emerald-300/80 bg-emerald-50/30 hover:bg-emerald-50 flex items-center justify-center text-emerald-700 font-extrabold text-[10px] transition-all duration-150 active:scale-95">
                              + Đặt
                            </div>
                          ) : status === 'matchmaking' ? (
                            <div className="h-full w-full rounded-xl flex flex-col items-center justify-center text-center px-1.5 py-1 overflow-hidden shadow-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white active:scale-95 transition-transform">
                              <span className="text-[9px] font-black leading-tight truncate uppercase tracking-wider flex items-center gap-1">
                                <Ticket className="w-3 h-3" />
                                Xé vé ({slot?.bookedSlots || 0}/{slot?.maxSlots || 10})
                              </span>
                              <span className="text-[8px] text-indigo-100 font-bold mt-0.5">
                                {formatPrice(slot?.price || 0)}
                              </span>
                            </div>
                          ) : status === 'booked' ? (
                            <div className="h-full w-full rounded-xl flex flex-col items-center justify-center text-center px-1.5 py-1 overflow-hidden shadow-xs bg-[#064e3b] text-white border border-emerald-800 active:scale-95 transition-transform">
                              <span className="text-[10px] font-black leading-tight truncate uppercase tracking-tight">
                                {slot?.customerName || 'Đã đặt'}
                              </span>
                              <span className="text-[8px] text-emerald-200 font-medium mt-0.5">
                                Đặt qua App
                              </span>
                            </div>
                          ) : status === 'pending' ? (
                            <div className="h-full w-full rounded-xl flex flex-col items-center justify-center text-center px-1.5 py-1 overflow-hidden shadow-xs bg-amber-400 text-amber-950 border border-amber-500 active:scale-95 transition-transform">
                              <span className="text-[10px] font-black leading-tight truncate uppercase tracking-tight">
                                {slot?.customerName || 'Khách lẻ'}
                              </span>
                              <span className="text-[8px] text-amber-900 font-bold mt-0.5">
                                Đặt thủ công
                              </span>
                            </div>
                          ) : (
                            <div className="h-full w-full rounded-xl flex items-center justify-center text-center px-1.5 py-1 overflow-hidden shadow-xs bg-stripes-red border border-red-200 text-red-800">
                              <span className="text-[9px] font-black uppercase tracking-wider">
                                BẢO TRÌ
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
        </div>
      </div>


      {/* MODAL: ĐẶT SÂN NHANH */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Đặt sân nhanh" maxWidth="md">
        <form onSubmit={handleQuickBookingSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1.5">Chọn sân</label>
            <Dropdown
              options={filteredFacilities.map(f => ({
                value: f.id,
                label: f.name
              }))}
              value={quickBookingData.facilityId}
              onChange={(val) => setQuickBookingData({...quickBookingData, facilityId: val})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1.5">Giá sân</label>
            <div className="px-3.5 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 text-xs font-bold text-slate-800 flex items-center justify-between h-11 select-none">
              <span>Đơn giá áp dụng:</span>
              <span className="text-brand-emerald font-black text-sm">
                {formatPrice(slots.find(s => s.facilityId === quickBookingData.facilityId && s.time === quickBookingData.startTime)?.price || 0)} / ca
              </span>
            </div>
          </div>

          <div className="pt-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-2">Thông tin khách đặt (Tùy chọn)</label>
            <div className="grid grid-cols-1 gap-2.5">
              <input
                type="text"
                placeholder="Tên khách hàng"
                value={quickBookingData.customerName}
                onChange={(e) => setQuickBookingData({...quickBookingData, customerName: e.target.value})}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-emerald h-11"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={quickBookingData.customerPhone}
                onChange={(e) => setQuickBookingData({...quickBookingData, customerPhone: e.target.value})}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-emerald h-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1.5">Chọn ca chơi</label>
            {shiftOptions.length > 0 ? (
              <Dropdown
                options={shiftOptions}
                value={selectedShiftId}
                onChange={handleShiftChange}
                className="w-full text-xs font-bold font-sans"
              />
            ) : (
              <div className="text-xs text-red-500 font-bold border border-red-200 bg-red-50 p-3 rounded-2xl">
                Không còn ca trống nào trong ngày của sân này.
              </div>
            )}
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              className="touch-target w-full bg-[#064e3b] active:bg-emerald-950 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md min-h-[44px]"
            >
              Xác nhận đặt lịch
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CHI TIẾT ĐẶT SÂN */}
      <Modal isOpen={isDetailModalOpen && !!selectedBookingDetail} onClose={() => setIsDetailModalOpen(false)} title="Thông tin lịch đặt" maxWidth="sm">
        {selectedBookingDetail && (
          <div className="space-y-4 font-sans select-none pt-1">
            <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                selectedBookingDetail.status === 'booked' ? 'bg-[#064e3b] text-white' :
                selectedBookingDetail.status === 'pending' ? 'bg-amber-400 text-amber-950' :
                selectedBookingDetail.status === 'matchmaking' ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white' :
                'bg-red-500 text-white'
              }`}>
                {selectedBookingDetail.status === 'booked' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                {selectedBookingDetail.status === 'pending' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {selectedBookingDetail.status === 'matchmaking' && <svg className="w-5 h-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
                {selectedBookingDetail.status === 'maintenance' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-slate-800 truncate uppercase tracking-tight flex items-center justify-between gap-2">
                  <span>{selectedBookingDetail.customerName}</span>
                  {selectedBookingDetail.customerPhone && (
                    <a href={`tel:${selectedBookingDetail.customerPhone}`} className="text-[10px] font-bold text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 hover:bg-slate-200">
                      <Phone className="w-2.5 h-2.5 text-slate-400" />
                      {selectedBookingDetail.customerPhone}
                    </a>
                  )}
                </h4>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md mt-1 inline-block uppercase tracking-wider ${
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
                <span className="font-bold text-slate-400">Sân bóng</span>
                <span className="font-black text-slate-800">{selectedBookingDetail.facility.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-bold text-slate-400">Thời gian</span>
                <div className="text-right flex flex-col items-end">
                  <span className="font-black text-brand-emerald">{selectedBookingDetail.startTime} – {selectedBookingDetail.endTime}</span>
                  {selectedBookingDetail.status !== 'maintenance' && selectedBookingDetail.status !== 'matchmaking' && (
                    <span className="text-[9px] font-bold text-slate-400 mt-0.5 bg-slate-100 px-1.5 py-0.5 rounded">
                      {selectedBookingDetail.slotIds.length} ca x {shiftMinutes}p
                    </span>
                  )}
                </div>
              </div>
              
              {selectedBookingDetail.status === 'matchmaking' ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-bold text-slate-400 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Số lượng vé</span>
                    <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                      {selectedBookingDetail.bookedSlots || 0} / {selectedBookingDetail.maxSlots || 10} slots
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-bold text-slate-400 flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Trình độ</span>
                    <span className="font-black text-slate-700">{getSportLevelLabel(selectedBookingDetail.skillLevel || 'ALL')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-bold text-slate-400 flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Giá vé</span>
                    <span className="font-black text-brand-emerald text-sm">{formatPrice(selectedBookingDetail.pricePerTicket || 0)}</span>
                  </div>
                  
                  {/* Inline Test Tickets Section */}
                  <TestTicketsSection sessionId={selectedBookingDetail.ticketSessionId} />
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-bold text-slate-400">Đơn giá / ca</span>
                    <span className="font-bold text-slate-700">{formatPrice(selectedBookingDetail.price / Math.max(1, selectedBookingDetail.slotIds.length))}</span>
                  </div>
                  {selectedBookingDetail.status !== 'maintenance' && (
                    <div className="flex justify-between items-center py-2.5 bg-emerald-50/70 px-3 rounded-2xl border border-emerald-100 mt-1">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Tổng cộng</span>
                      <span className="font-black text-brand-emerald text-base">{formatPrice(selectedBookingDetail.price)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="pt-2 space-y-2">
              {selectedBookingDetail.status === 'pending' && (
                <button 
                  type="button"
                  onClick={handleConfirmDeposit} 
                  className="touch-target w-full bg-[#064e3b] active:bg-emerald-950 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md min-h-[44px]"
                >
                  Xác nhận đã đặt cọc
                </button>
              )}
              {(selectedBookingDetail.status === 'matchmaking' || 
                ((selectedBookingDetail.status === 'booked' || selectedBookingDetail.status === 'pending') && selectedBookingDetail.isManual)) ? (
                <button 
                  type="button"
                  onClick={() => setIsConfirmCancelOpen(true)} 
                  className="touch-target w-full bg-red-50 hover:bg-red-100 text-red-600 font-black py-3 rounded-2xl text-xs uppercase tracking-wider transition-all active:scale-95 border border-red-200 min-h-[44px]"
                >
                  {selectedBookingDetail.status === 'matchmaking' ? 'Hủy ca xé vé này' : 'Hủy lịch đặt'}
                </button>
              ) : (
                (selectedBookingDetail.status === 'booked' || selectedBookingDetail.status === 'pending') && (
                  <div className="p-3 bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-extrabold rounded-2xl text-center uppercase tracking-wider">
                    Không thể hủy lịch đặt của khách đặt qua App
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </Modal>


      {/* MODAL XÁC NHẬN HỦY */}
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
          <p className="text-xs text-slate-550 text-center leading-relaxed">
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
    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 select-none">
      <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
        <Ticket className="w-3 h-3 text-slate-400" />
        Vé test để nhập thủ công
      </h5>
      {loading ? (
        <div className="flex justify-center py-2">
          <div className="w-4 h-4 border-2 border-brand-emerald border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tickets.length === 0 ? (
        <p className="text-[9px] text-slate-400 font-semibold italic text-center py-1">Không có vé test nào</p>
      ) : (
        <div className="space-y-1 max-h-28 overflow-y-auto">
          {tickets.map(t => (
            <div key={t.ticketId} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-150">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-bold text-slate-700 block truncate">{t.customerName}</span>
                <span className="text-[8px] font-extrabold text-indigo-650 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 uppercase tracking-wider font-mono">
                  Mã: {t.shortCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(t.shortCode, t.ticketId)}
                className={`text-[8px] font-black px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                  copiedId === t.ticketId
                    ? 'bg-emerald-50 text-brand-emerald border-emerald-150'
                    : 'bg-white text-slate-550 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {copiedId === t.ticketId ? 'Đã copy' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
