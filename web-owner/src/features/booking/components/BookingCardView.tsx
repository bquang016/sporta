import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Dropdown } from '../../../components/ui/Dropdown';
import { useBookingMatrix } from '../hooks/useBookingMatrix';
import { formatPrice, type SlotStatus } from './mockData';
import { getSportLevelLabel } from '../../venue/hooks/useTicketSessions';
import { ticketService } from '../../venue/services/ticketService';
import { 
  Copy, 
  Check, 
  Users, 
  Award, 
  Tag, 
  Ticket, 
  Clock, 
  Plus, 
  Search,
  Phone,
  Layers,
  Calendar,
  AlertCircle
} from 'lucide-react';

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
    sportName,
    closingTime,
    searchTerm,
    setSearchTerm,
    currentDate,
    handlePrevDay,
    handleNextDay,
    handleToday,
    showKpis,
    setShowKpis,
    kpis,
    isBookingModalOpen,
    setIsBookingModalOpen,
    quickBookingData,
    setQuickBookingData,
    shiftOptions,
    selectedShiftId,
    handleShiftChange,
    handleQuickBookingSubmit,
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
      if (status === 'available' || status === 'locked') {
        if (current) {
          allBlocks.push(current);
          current = null;
        }
        continue;
      }
      
      const name = slot.customerName;
      const phone = slot.customerPhone;
      const tSessionId = slot.ticketSessionId;
      const isManual = slot.isManual;
      
      // Determine if it should group with the current block (manual slots are grouped if same bookingId or same customer & phone)
      const isSameGroup = current &&
        current.status === status &&
        (
          (status === 'matchmaking' && current.ticketSessionId === tSessionId) ||
          (status !== 'matchmaking' && slot.bookingId && current.bookingId && current.bookingId === slot.bookingId) ||
          (status !== 'matchmaking' && (!slot.bookingId || !current.bookingId) && current.customerName === name && current.customerPhone === phone && current.isManual === isManual)
        );
        
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
          customerPhone: phone,
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

  // Filter blocks by search term
  const displayedBlocks = searchTerm
    ? allBlocks.filter(b => 
        (b.facilityName && b.facilityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.customerName && b.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.customerPhone && b.customerPhone.includes(searchTerm)) ||
        (b.status === 'matchmaking' && 'xé vé ghép cặp'.includes(searchTerm.toLowerCase()))
      )
    : allBlocks;

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
      customerPhone: block.customerPhone,
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

  const onQuickBookingFormSubmit = async (e: React.FormEvent) => {
    await handleQuickBookingSubmit(e);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="w-full flex flex-col gap-5 min-h-0 select-none">
      {/* ─── 1. THẺ THỐNG KÊ KPI CARDS (DESKTOP & MOBILE) ─────────── */}
      {!isMobile ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all duration-300 overflow-hidden">
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

          <div 
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showKpis ? 'max-h-[300px] opacity-100 border-t border-slate-100 p-5 bg-slate-50/30' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      ) : (
        <div className="bg-white border-b border-slate-100 p-4 shadow-xs select-none flex justify-between items-center text-xs text-slate-500 font-bold mx-4 rounded-2xl">
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
      )}

      {/* ─── 2. THANH BỘ LỌC & NÚT ĐẶT SÂN NHANH ─────────────────── */}
      <div className={`bg-white p-4 rounded-2xl border border-slate-200/85 shadow-[0_4px_18px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-4 ${isMobile ? 'mx-4' : ''}`}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Ô Tìm kiếm sân hoặc khách */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-450 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm sân hoặc khách đặt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald w-64 transition-all font-sans"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 text-xs font-bold cursor-pointer"
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
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Đặt sân nhanh
          </button>
        </div>
      </div>

      {/* ─── 3. DANH SÁCH THẺ ĐẶT SÂN (CARD VIEW) ────────────────── */}
      {loading && displayedBlocks.length === 0 ? (
        <div className="flex justify-center items-center py-24 select-none bg-white rounded-2xl border border-slate-200/80">
          <div className="w-8 h-8 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : displayedBlocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 select-none p-6 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <Calendar className="w-8 h-8" />
          </div>
          <p className="text-sm font-black text-slate-700">
            {searchTerm ? 'Không tìm thấy lịch đặt nào khớp với tìm kiếm' : 'Không có lịch đặt sân nào trong ngày này'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {searchTerm ? 'Vui lòng thử từ khóa tìm kiếm khác' : 'Các sân đều đang trống hoặc chưa được đặt'}
          </p>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="mt-4 px-4 py-2 bg-brand-emerald text-white rounded-xl text-xs font-bold hover:bg-emerald-950 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Đặt sân ngay
          </button>
        </div>
      ) : (
        <div className={`grid gap-4 ${isMobile ? 'px-4 pb-28 grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {displayedBlocks.map((block, idx) => {
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
                    {block.customerPhone && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-semibold">Liên hệ</span>
                        <span className="text-slate-700 font-bold flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {block.customerPhone}
                        </span>
                      </div>
                    )}
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
      )}

      {/* ─── 4. MODAL: ĐẶT SÂN NHANH ───────────────────────────────── */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Đặt sân bóng nhanh" maxWidth="md">
        <form onSubmit={onQuickBookingFormSubmit} className="space-y-4 font-sans select-none">
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
                selectedBookingDetail.status === 'booked' && !selectedBookingDetail.isManual ? 'bg-emerald-600 text-white' :
                selectedBookingDetail.status === 'pending' || selectedBookingDetail.isManual ? 'bg-amber-400 text-amber-950' :
                selectedBookingDetail.status === 'matchmaking' ? 'bg-indigo-600 text-white bg-gradient-to-br from-indigo-600 to-purple-600' :
                'bg-red-500 text-white'
              }`}>
                {getStatusIcon(selectedBookingDetail.status, selectedBookingDetail.isManual)}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 flex-wrap">
                  {selectedBookingDetail.customerName}
                  {selectedBookingDetail.customerPhone ? (
                    <a href={`tel:${selectedBookingDetail.customerPhone}`} className="text-xs font-bold text-slate-500 lowercase flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 hover:bg-slate-200 hover:text-brand-emerald transition-colors">
                      <Phone className="w-3 h-3 text-slate-400" />
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
                <div className="flex gap-2 items-center mt-1">
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

      {/* ─── 6. MODAL: XÁC NHẬN HỦY ───────────────────────────────── */}
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
          <p className="text-xs text-slate-500 text-center leading-relaxed">
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
