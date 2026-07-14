import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { useBookingMatrix } from '../hooks/useBookingMatrix';
import { formatPrice, type SlotStatus } from './mockData';
import { getSportLevelLabel } from '../../venue/hooks/useTicketSessions';
import { Copy, Check, Users, Award, Ticket, Clock } from 'lucide-react';
import { ticketService } from '../../venue/services/ticketService';

interface BookingCardViewProps {
  isMobile: boolean;
  venueId: string;
  refreshCounter: number;
  onRefresh?: () => void;
}

export const BookingCardView: React.FC<BookingCardViewProps> = ({
  isMobile,
  venueId,
  refreshCounter,
  onRefresh
}) => {
  const {
    slots,
    filteredFacilities,
    shiftMinutes,
    selectedBookingDetail,
    setSelectedBookingDetail,
    isDetailModalOpen,
    setIsDetailModalOpen,
    isConfirmCancelOpen,
    setIsConfirmCancelOpen,
    handleCancelBooking,
    handleConfirmDeposit,
    loading
  } = useBookingMatrix(venueId, refreshCounter);

  // Group slots into blocks chronologically per facility
  const allBlocks: any[] = [];
  
  for (const facility of filteredFacilities) {
    const facilitySlots = slots.filter(s => s.facilityId === facility.id);
    facilitySlots.sort((a, b) => a.time.localeCompare(b.time));
    
    let current: any = null;
    
    for (const slot of facilitySlots) {
      const status = slot.status;
      if (status === 'available') {
        if (current) {
          allBlocks.push(current);
          current = null;
        }
        continue;
      }
      
      const name = slot.customerName;
      const tSessionId = slot.ticketSessionId;
      const isManual = slot.isManual;
      
      // Determine if it should group with the current block (manual slots are never grouped)
      const isSameGroup = current &&
        current.status === status &&
        !isManual &&
        !current.isManual &&
        (status === 'matchmaking' ? current.ticketSessionId === tSessionId : current.customerName === name);
        
      if (isSameGroup && current) {
        current.endTime = slot.time;
        current.slotCount++;
        current.slotIds.push(slot.id);
      } else {
        if (current) {
          allBlocks.push(current);
        }
        current = {
          facilityId: facility.id,
          facilityName: facility.name,
          facilityPrice: facility.pricePerHour,
          startTime: slot.time,
          endTime: slot.time,
          status,
          customerName: name,
          slotCount: 1,
          slotIds: [slot.id],
          ticketSessionId: tSessionId,
          bookingId: slot.bookingId,
          isManual,
          bookedSlots: slot.bookedSlots,
          maxSlots: slot.maxSlots,
          skillLevel: slot.skillLevel,
          pricePerTicket: slot.pricePerTicket
        };
      }
    }
    if (current) {
      allBlocks.push(current);
    }
  }
  
  // Sort blocks chronologically by start time
  allBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getStatusDetails = (status: SlotStatus, isManual?: boolean) => {
    switch (status) {
      case 'booked':
        return {
          label: isManual ? 'Đặt thủ công' : 'Đã đặt',
          bg: isManual ? 'bg-amber-50 text-amber-800 border-amber-200/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
          accent: isManual ? 'border-l-amber-500' : 'border-l-emerald-600',
          iconBg: isManual ? 'bg-amber-400 text-amber-950' : 'bg-emerald-600 text-white',
          dot: isManual ? 'bg-amber-500' : 'bg-emerald-500'
        };
      case 'pending':
        return {
          label: 'Đặt thủ công',
          bg: 'bg-amber-50 text-amber-850 border-amber-250/50',
          accent: 'border-l-amber-500',
          iconBg: 'bg-amber-400 text-amber-950',
          dot: 'bg-amber-500'
        };
      case 'matchmaking':
        return {
          label: 'Ca xé vé ghép',
          bg: 'bg-indigo-50 text-indigo-750 border-indigo-250/50 bg-gradient-to-r from-indigo-50 to-purple-50',
          accent: 'border-l-indigo-600',
          iconBg: 'bg-indigo-600 text-white bg-gradient-to-br from-indigo-600 to-purple-600',
          dot: 'bg-indigo-500'
        };
      case 'maintenance':
        return {
          label: 'Bảo trì',
          bg: 'bg-red-50 text-red-700 border-red-200/50',
          accent: 'border-l-red-500',
          iconBg: 'bg-red-500 text-white',
          dot: 'bg-red-500'
        };
      default:
        return {
          label: 'Trống',
          bg: 'bg-slate-50 text-slate-600 border-slate-200/50',
          accent: 'border-l-slate-400',
          iconBg: 'bg-slate-300 text-slate-700',
          dot: 'bg-slate-400'
        };
    }
  };

  const getStatusIcon = (status: SlotStatus, isManual?: boolean) => {
    if (status === 'matchmaking') {
      return (
        <svg className="w-5 h-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      );
    }
    if (status === 'booked' && !isManual) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    }
    if (status === 'pending' || isManual) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (status === 'maintenance') {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01" />
        </svg>
      );
    }
    return null;
  };

  const handleCardClick = (block: any) => {
    const parseTimeToMinutesLocal = (t: string): number => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const formatMinutesToTime = (min: number) => {
      const h = Math.floor(min / 60) % 24;
      const m = min % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };
    const startMin = parseTimeToMinutesLocal(block.startTime);
    const actualEndMin = startMin + block.slotCount * shiftMinutes;
    const actualEndTime = formatMinutesToTime(actualEndMin);

    setSelectedBookingDetail({
      facility: {
        id: block.facilityId,
        name: block.facilityName,
        type: '',
        pricePerHour: block.facilityPrice
      },
      customerName: block.status === 'matchmaking' ? 'Ca xé vé ghép cặp' : (block.customerName || (block.status === 'maintenance' ? 'Lịch Bảo Trì' : 'Khách lẻ')),
      startTime: block.startTime,
      endTime: actualEndTime,
      status: block.status,
      slotIds: block.slotIds,
      price: block.status === 'matchmaking' ? (block.pricePerTicket || 0) : (block.facilityPrice * (block.slotCount * shiftMinutes) / 60),
      bookingType: block.status === 'matchmaking' ? 'matchmaking' : 'regular',
      ticketSessionId: block.ticketSessionId,
      bookingId: block.bookingId,
      isManual: block.isManual,
      bookedSlots: block.bookedSlots,
      maxSlots: block.maxSlots,
      pricePerTicket: block.pricePerTicket,
      skillLevel: block.skillLevel
    });
    setIsDetailModalOpen(true);
  };

  const handleCancelClick = async () => {
    setIsConfirmCancelOpen(false);
    await handleCancelBooking();
    if (onRefresh) onRefresh();
  };

  if (loading && allBlocks.length === 0) {
    return (
      <div className="flex justify-center items-center py-24 select-none">
        <div className="w-8 h-8 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (allBlocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 select-none">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-black text-slate-500">Hôm nay không có lịch đặt sân nào</p>
        <p className="text-xs text-slate-400 mt-1">Các sân đều trống hoặc chưa được cập nhật</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className={`grid gap-4 ${isMobile ? 'px-4 pb-28 grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {allBlocks.map((block, idx) => {
          const details = getStatusDetails(block.status, block.isManual);
          const durationMins = block.slotCount * shiftMinutes;
          const hours = Math.floor(durationMins / 60);
          const mins = durationMins % 60;
          const durationStr = hours > 0 ? `${hours}h${mins > 0 ? mins : ''}` : `${mins} phút`;
          const totalPrice = block.status === 'matchmaking' 
            ? (block.pricePerTicket || 0)
            : (block.facilityPrice * (durationMins / 60));

          return (
            <div
              key={idx}
              onClick={() => handleCardClick(block)}
              className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] p-4 border-l-4 ${details.accent} hover:shadow-lg hover:border-slate-350 transition-all duration-200 cursor-pointer flex flex-col justify-between group`}
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${details.iconBg} shadow-sm`}>
                      {getStatusIcon(block.status, block.isManual)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-800 truncate group-hover:text-brand-emerald transition-colors">
                        {block.status === 'matchmaking' ? 'Ca xé vé ghép cặp' : (block.customerName || (block.status === 'maintenance' ? 'Lịch Bảo Trì Sân' : 'Khách lẻ'))}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {block.facilityName}
                        {block.status === 'matchmaking' && ` • ${block.bookedSlots || 0}/${block.maxSlots || 10} người`}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold border ${details.bg} flex-shrink-0`}>
                    {details.label}
                  </span>
                </div>

                {/* Body info */}
                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Khung giờ</span>
                    <span className="text-brand-emerald font-black">{block.startTime} – {block.endTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Thời lượng</span>
                    <span className="text-slate-700 font-bold">{durationStr}</span>
                  </div>
                  {block.status !== 'maintenance' && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-semibold">
                        {block.status === 'matchmaking' ? 'Giá vé' : 'Thành tiền'}
                      </span>
                      <span className="text-slate-800 font-black">{formatPrice(totalPrice)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-2.5 border-t border-slate-50 flex justify-end">
                <span className="text-[10px] font-bold text-brand-emerald hover:text-emerald-950 flex items-center gap-1 transition-colors">
                  Xem chi tiết lịch
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── MODAL: CHI TIẾT ĐẶT SÂN ─────────────────────────────── */}
      <Modal isOpen={isDetailModalOpen && !!selectedBookingDetail} onClose={() => setIsDetailModalOpen(false)} title="Thông tin lịch đặt" maxWidth="sm">
        {selectedBookingDetail && (
          <div className="space-y-4 font-sans select-none">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedBookingDetail.status === 'booked' && !selectedBookingDetail.isManual ? 'bg-emerald-600 text-white' :
                selectedBookingDetail.status === 'pending' || selectedBookingDetail.isManual ? 'bg-amber-400 text-amber-950' :
                selectedBookingDetail.status === 'matchmaking' ? 'bg-indigo-600 text-white bg-gradient-to-br from-indigo-600 to-purple-600' :
                'bg-red-500 text-white'
              }`}>
                {getStatusIcon(selectedBookingDetail.status, selectedBookingDetail.isManual)}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">
                  {selectedBookingDetail.customerName}
                </h4>
                <div className="flex gap-2 items-center mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-extrabold uppercase tracking-wide">
                    {selectedBookingDetail.facility.name}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide border ${
                    getStatusDetails(selectedBookingDetail.status, selectedBookingDetail.isManual).bg
                  }`}>
                    {getStatusDetails(selectedBookingDetail.status, selectedBookingDetail.isManual).label}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border border-slate-100 p-3.5 rounded-2xl bg-white shadow-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="font-semibold text-slate-400">Khung giờ đặt</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {selectedBookingDetail.startTime} - {selectedBookingDetail.endTime}
                </span>
              </div>

              {selectedBookingDetail.status === 'matchmaking' ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="font-semibold text-slate-400">Trình độ yêu cầu</span>
                    <span className="font-bold text-indigo-750 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-indigo-500" />
                      {getSportLevelLabel(selectedBookingDetail.skillLevel || 'ALL')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="font-semibold text-slate-400">Số slot đã bán</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {selectedBookingDetail.bookedSlots} / {selectedBookingDetail.maxSlots} người
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-slate-400">Giá vé / Người</span>
                    <span className="font-black text-brand-emerald text-sm">
                      {formatPrice(selectedBookingDetail.pricePerTicket || 0)}
                    </span>
                  </div>

                  <TestTicketsSection sessionId={selectedBookingDetail.ticketSessionId} />
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="font-semibold text-slate-400">Giá thuê sân</span>
                    <span className="font-bold text-slate-700">{formatPrice(selectedBookingDetail.facility.pricePerHour)}/h</span>
                  </div>
                  {selectedBookingDetail.status !== 'maintenance' && (
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold text-slate-400">Tổng tạm tính</span>
                      <span className="font-black text-slate-850 text-sm">{formatPrice(selectedBookingDetail.price)}</span>
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
              onClick={handleCancelClick} 
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
    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 select-none font-sans">
      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
        <Ticket className="w-3.5 h-3.5 text-slate-400" />
        Vé test dùng để check-in thủ công
      </h5>
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-brand-emerald border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tickets.length === 0 ? (
        <p className="text-[10px] text-slate-400 font-semibold italic text-center py-2 font-sans">Không có vé test nào cho ca này</p>
      ) : (
        <div className="space-y-1.5 max-h-36 overflow-y-auto font-sans">
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
