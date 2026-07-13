import React, { useRef, useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Dropdown } from '../../../components/ui/Dropdown';
import { formatPrice } from './mockData';
import { useBookingMatrix } from '../hooks/useBookingMatrix';
import { isPastSlot } from '../../../utils/timeUtils';
import { ticketService } from '../../venue/services/ticketService';
import { getSportLevelLabel } from '../../venue/hooks/useTicketSessions';
import { Copy, Check, Users, Award, Tag, Ticket, Clock } from 'lucide-react';

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
    sportName
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

      {/* KPIs Summary */}
      <div className="bg-white border-b border-slate-100 p-4 shadow-xs select-none flex justify-between items-center text-xs text-slate-500 font-bold">
        <span className="flex items-center gap-1">
          Tỷ lệ: <span className="text-slate-800 font-black">{kpis.occupancyRate}%</span>
        </span>
        <span className="w-px h-3 bg-slate-200"></span>
        <span className="flex items-center gap-1">
          Doanh thu: <span className="text-brand-emerald font-black">{formatPrice(kpis.totalRevenue)}</span>
        </span>
        <span className="w-px h-3 bg-slate-200"></span>
        <span className="flex items-center gap-1">
          Sân: <span className="text-slate-800 font-black">{kpis.activeCourtsText}</span>
        </span>
      </div>

      {/* Date Switcher & Search */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <button onClick={handlePrevDay} className="p-1 text-slate-500 hover:bg-slate-150 rounded-lg cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-xs font-black text-slate-700">{currentDate}</span>
          <button onClick={handleNextDay} className="p-1 text-slate-500 hover:bg-slate-150 rounded-lg cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="w-4 h-4 text-slate-450 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm sân hoặc khách đặt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 border border-slate-200 bg-white rounded-xl text-xs font-medium placeholder-slate-400 outline-none focus:border-brand-emerald"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-655 font-bold text-xs">✕</button>
          )}
        </div>
      </div>

      {/* Toggle Session tabs */}
      <div className="px-4 select-none">
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200/50">
          {(Object.keys(SESSIONS) as Array<keyof typeof SESSIONS>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveSession(key)}
              className={`flex-1 py-1.5 rounded-xl text-center text-xs font-black transition-all cursor-pointer ${
                activeSession === key ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              {SESSIONS[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <div className="px-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden select-none">
          <div className="matrix-scroll overflow-x-auto w-full" ref={scrollContainerRef}>
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  <th className="sticky left-0 z-30 bg-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-wider h-11 border-b border-r border-slate-300 px-3 text-center min-w-[90px]">
                    Sân
                  </th>
                  {times.map(t => (
                    <th key={t} className={`h-11 text-[10px] font-black text-slate-600 tracking-wider px-1 text-center min-w-[70px] border-b border-slate-200 ${t.endsWith(':00') ? 'bg-slate-100 text-slate-850' : 'bg-slate-50'}`}>
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFacilities.map(facility => (
                  <tr key={facility.id} className="border-b border-slate-150">
                    <td className="sticky left-0 z-20 bg-slate-100 text-slate-800 text-xs font-black px-2 py-3.5 text-center border-r border-slate-200 shadow-sm min-w-[90px]">
                      <span className="block">{facility.name}</span>
                      <span className="block text-[8px] text-brand-emerald/80 uppercase tracking-widest mt-0.5">{sportName || 'Sân đấu'}</span>
                    </td>
                    {times.map((time, colIdx) => {
                      const slot = slots.find(s => s.facilityId === facility.id && s.time === time);
                      const status = slot?.status || 'available';
                      const isHourBorder = time.endsWith(':00');

                      if (isInsideBlock(facility.id, time, status, slot?.customerName, slot?.ticketSessionId)) {
                        return null;
                      }

                      const span = status !== 'available' ? getBlockSpan(facility.id, colIdx, status, slot?.customerName, slot?.ticketSessionId) : 1;
                      const isPast = isPastSlot(date, time);

                      return (
                        <td
                          key={`${facility.id}-${time}`}
                          colSpan={span}
                          onClick={() => handleCellClick(facility.id, time, status)}
                          className={`p-0 text-center h-12 transition-all ${isHourBorder ? 'border-l border-slate-300' : ''} ${
                            isPast ? 'opacity-40 bg-slate-100 pointer-events-none select-none' : ''
                          }`}
                        >
                          {status === 'available' ? (
                            <div className="w-full h-full hover:bg-emerald-50/50 flex items-center justify-center text-emerald-600/0 hover:text-emerald-500 font-extrabold text-xs transition-colors duration-150">
                              +
                            </div>
                          ) : (
                            <div className={`h-9 mx-0.5 rounded-lg flex items-center justify-center text-center px-1 py-1 overflow-hidden shadow-xs border ${getCellStyle(status)}`}>
                              <span className="text-[8px] font-black leading-tight truncate uppercase tracking-wide">
                                {status === 'matchmaking' 
                                  ? `🎫 XÉ VÉ (${slot?.bookedSlots}/${slot?.maxSlots})` 
                                  : (slot?.customerName || (status === 'maintenance' ? 'BẢO TRÌ' : ''))}
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
        <form onSubmit={handleQuickBookingSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">Chọn Sân</label>
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
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">Tên khách hàng</label>
            <input
              type="text"
              placeholder="Nhập tên khách..."
              value={quickBookingData.customerName}
              onChange={(e) => setQuickBookingData({...quickBookingData, customerName: e.target.value})}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">Giờ bắt đầu</label>
              <Dropdown
                options={allTimes.map(t => ({ value: t, label: t }))}
                value={quickBookingData.startTime}
                onChange={(val) => setQuickBookingData({...quickBookingData, startTime: val})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">Giờ kết thúc</label>
              <Dropdown
                options={allTimes.map(t => ({ value: t, label: t }))}
                value={quickBookingData.endTime}
                onChange={(val) => setQuickBookingData({...quickBookingData, endTime: val})}
              />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full bg-brand-emerald hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer">
              Xác nhận đặt lịch
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CHI TIẾT ĐẶT SÂN */}
      <Modal isOpen={isDetailModalOpen && !!selectedBookingDetail} onClose={() => setIsDetailModalOpen(false)} title="Thông tin lịch đặt" maxWidth="sm">
        {selectedBookingDetail && (
          <div className="space-y-4 font-sans select-none">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                selectedBookingDetail.status === 'booked' ? 'bg-emerald-600 text-white' :
                selectedBookingDetail.status === 'pending' ? 'bg-amber-400 text-amber-950' :
                selectedBookingDetail.status === 'matchmaking' ? 'bg-indigo-600 text-white bg-gradient-to-br from-indigo-600 to-purple-600' :
                'bg-red-500 text-white'
              }`}>
                {selectedBookingDetail.status === 'booked' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                {selectedBookingDetail.status === 'pending' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {selectedBookingDetail.status === 'matchmaking' && <svg className="w-4 h-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
                {selectedBookingDetail.status === 'maintenance' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-slate-800 truncate uppercase tracking-tight">{selectedBookingDetail.customerName}</h4>
                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md mt-0.5 inline-block uppercase tracking-wider ${
                  selectedBookingDetail.status === 'booked' ? 'bg-emerald-100 text-emerald-800' :
                  selectedBookingDetail.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  selectedBookingDetail.status === 'matchmaking' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                  selectedBookingDetail.status === 'locked' ? 'bg-slate-150 text-slate-700' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedBookingDetail.status === 'booked' ? 'Đã đặt' :
                   selectedBookingDetail.status === 'pending' ? 'Đang giữ' :
                   selectedBookingDetail.status === 'matchmaking' ? 'Ca xé vé ghép' :
                   selectedBookingDetail.status === 'locked' ? 'Đã quá giờ' :
                   selectedBookingDetail.status === 'maintenance' ? 'Bảo trì' : 'Không xác định'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-450">Sân bóng</span>
                <span className="font-black text-slate-800">{selectedBookingDetail.facility.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-455">Thời gian</span>
                <span className="font-black text-brand-emerald">{selectedBookingDetail.startTime} – {selectedBookingDetail.endTime}</span>
              </div>
              
              {selectedBookingDetail.status === 'matchmaking' ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-455 flex items-center gap-1"><Users className="w-3 h-3 text-slate-400" /> Số lượng vé</span>
                    <span className="font-black text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      {selectedBookingDetail.bookedSlots || 0} / {selectedBookingDetail.maxSlots || 10} slots
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-455 flex items-center gap-1"><Award className="w-3 h-3 text-slate-400" /> Trình độ</span>
                    <span className="font-black text-slate-700">{getSportLevelLabel(selectedBookingDetail.skillLevel || 'ALL')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-455 flex items-center gap-1"><Tag className="w-3 h-3 text-slate-400" /> Giá vé</span>
                    <span className="font-black text-brand-emerald text-xs">{formatPrice(selectedBookingDetail.pricePerTicket || 0)}</span>
                  </div>
                  
                  {/* Inline Test Tickets Section */}
                  <TestTicketsSection sessionId={selectedBookingDetail.ticketSessionId} />
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-455">Giá thuê</span>
                    <span className="font-bold text-slate-700">{formatPrice(selectedBookingDetail.facility.pricePerHour)}/h</span>
                  </div>
                  {selectedBookingDetail.status !== 'maintenance' && (
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold text-slate-455">Tổng tạm tính</span>
                      <span className="font-black text-slate-800 text-xs">{formatPrice(selectedBookingDetail.price)}</span>
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
              {(selectedBookingDetail.status === 'booked' || selectedBookingDetail.status === 'pending') && (
                <button onClick={handleCancelBooking} className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer">
                  Hủy lịch đặt
                </button>
              )}
            </div>
          </div>
        )}
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
