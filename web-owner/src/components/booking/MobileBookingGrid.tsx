import React, { useMemo, useState, useRef } from 'react';
import { 
  MOCK_FACILITIES, 
  generateTimes, 
  formatPrice, 
  type SlotStatus, 
  type BookingSlot, 
  type Facility,
  MOCK_SLOTS
} from './mockData';
import { Modal } from '../ui/Modal';

// We define SESSIONS with start times for scrolling
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

export const MobileBookingGrid = () => {
  const allTimes = useMemo(() => generateTimes(), []);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // ─── STATES QUẢN LÝ DỮ LIỆU ──────────────────────────────
  const [slots, setSlots] = useState<BookingSlot[]>(MOCK_SLOTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourtType, setSelectedCourtType] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState<string>('Hôm nay, 11/06/2026');
  const [activeSession, setActiveSession] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  
  // States cho Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Form states
  const [quickBookingData, setQuickBookingData] = useState({
    facilityId: MOCK_FACILITIES[0].id,
    customerName: '',
    startTime: '08:00',
    endTime: '09:30',
    status: 'booked' as SlotStatus
  });

  // Detail state
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<{
    facility: Facility;
    customerName: string;
    startTime: string;
    endTime: string;
    status: SlotStatus;
    slotIds: string[];
    price: number;
  } | null>(null);

  // ─── HELPERS LẤY TRẠNG THÁI SLOT ──────────────────────────
  const getSlot = (facilityId: string, time: string): BookingSlot | undefined => {
    return slots.find(s => s.facilityId === facilityId && s.time === time);
  };



  const getBookingBlocksForRow = (facilityId: string) => {
    const blocks: { startTime: string; endTime: string; status: SlotStatus; customerName?: string; slotCount: number }[] = [];
    let current: { startTime: string; endTime: string; status: SlotStatus; customerName?: string; slotCount: number } | null = null;

    for (const time of allTimes) {
      const slot = getSlot(facilityId, time);
      const status = slot?.status || 'available';
      const name = slot?.customerName;

      if (status === 'available') {
        if (current) {
          blocks.push(current);
          current = null;
        }
        continue;
      }

      const matchesSearch = !searchTerm || (name && name.toLowerCase().includes(searchTerm.toLowerCase()));

      if (current && current.status === status && current.customerName === name) {
        current.endTime = time;
        current.slotCount++;
      } else {
        if (current) {
          blocks.push(current);
        }
        current = { 
          startTime: time, 
          endTime: time, 
          status, 
          customerName: matchesSearch ? name : undefined, 
          slotCount: 1 
        };
      }
    }
    if (current) {
      blocks.push(current);
    }
    return blocks;
  };

  // ─── FILTER FACILITIES THEO LOẠI SÂN ────────────────────
  const filteredFacilities = useMemo(() => {
    if (selectedCourtType === 'all') return MOCK_FACILITIES;
    return MOCK_FACILITIES.filter(f => f.type === selectedCourtType);
  }, [selectedCourtType]);

  // ─── TÍNH TOÁN KPI CARDS ĐỘNG CHO MOBILE ───────────────────
  const kpis = useMemo(() => {
    const totalSlotsPossible = MOCK_FACILITIES.length * allTimes.length;
    let bookedCount = 0;
    let pendingCount = 0;
    let maintenanceCount = 0;
    let totalRevenue = 0;
    let bookingBlockCount = 0;

    slots.forEach(slot => {
      const facility = MOCK_FACILITIES.find(f => f.id === slot.facilityId);
      if (!facility) return;

      if (slot.status === 'booked') {
        bookedCount++;
        totalRevenue += (facility.pricePerHour * 0.5);
      } else if (slot.status === 'pending') {
        pendingCount++;
      } else if (slot.status === 'maintenance') {
        maintenanceCount++;
      }
    });

    MOCK_FACILITIES.forEach(f => {
      const blocks = getBookingBlocksForRow(f.id);
      bookingBlockCount += blocks.filter(b => b.status === 'booked' || b.status === 'pending').length;
    });

    const occupancyRate = Math.round(((bookedCount + pendingCount + maintenanceCount) / totalSlotsPossible) * 100);
    const activeCourts = MOCK_FACILITIES.filter(f => {
      const facilitySlots = slots.filter(s => s.facilityId === f.id && s.status === 'maintenance');
      return facilitySlots.length < allTimes.length / 2;
    }).length;

    return {
      occupancyRate,
      totalRevenue,
      bookingBlockCount,
      activeCourtsText: `${activeCourts}/${MOCK_FACILITIES.length}`
    };
  }, [slots, allTimes, searchTerm]);

  // ─── ĐIỀU HƯỚNG NGÀY GIẢ LẬP ────────────────────────────────
  const handlePrevDay = () => {
    setCurrentDate('Hôm qua, 10/06/2026');
  };
  const handleNextDay = () => {
    setCurrentDate('Ngày mai, 12/06/2026');
  };
  const handleToday = () => {
    setCurrentDate('Hôm nay, 11/06/2026');
  };

  // ─── SMOOTH SCROLL SHORTCUT ──────────────────────────────
  const scrollToSession = (session: 'morning' | 'afternoon' | 'evening') => {
    setActiveSession(session);
    const targetTime = SESSIONS[session].time;
    const container = scrollContainerRef.current;
    const target = document.getElementById(`m-col-${targetTime}`);
    if (container && target) {
      const offset = target.offsetLeft - container.offsetLeft;
      container.scrollTo({ left: offset, behavior: 'smooth' });
    }
  };

  // ─── CLICK VÀO Ô TRÊN GRID ─────────────────────────────────
  const handleCellClick = (facilityId: string, time: string, status: SlotStatus) => {
    const facility = MOCK_FACILITIES.find(f => f.id === facilityId);
    if (!facility) return;

    if (status === 'available') {
      const timeIdx = allTimes.indexOf(time);
      const endT = timeIdx < allTimes.length - 2 ? allTimes[timeIdx + 2] : allTimes[allTimes.length - 1]; // default 1 hour
      setQuickBookingData({
        facilityId,
        customerName: '',
        startTime: time,
        endTime: endT,
        status: 'booked'
      });
      setIsBookingModalOpen(true);
    } else {
      const slot = getSlot(facilityId, time);
      if (!slot) return;

      const rowBlocks = getBookingBlocksForRow(facilityId);
      const block = rowBlocks.find(b => {
        const startIdx = allTimes.indexOf(b.startTime);
        const endIdx = allTimes.indexOf(b.endTime);
        const currentIdx = allTimes.indexOf(time);
        return currentIdx >= startIdx && currentIdx <= endIdx && b.status === status && b.customerName === slot.customerName;
      });

      if (block) {
        const durationHours = (block.slotCount * 30) / 60;
        const totalPrice = facility.pricePerHour * durationHours;

        const startIdx = allTimes.indexOf(block.startTime);
        const endIdx = allTimes.indexOf(block.endTime);
        const slotIds: string[] = [];
        for (let i = startIdx; i <= endIdx; i++) {
          const t = allTimes[i];
          const s = getSlot(facilityId, t);
          if (s) slotIds.push(s.id);
        }

        setSelectedBookingDetail({
          facility,
          customerName: block.customerName || (block.status === 'maintenance' ? 'Lịch Bảo Trì' : 'Khách vãng lai'),
          startTime: block.startTime,
          endTime: block.endTime,
          status: block.status,
          slotIds,
          price: totalPrice
        });
        setIsDetailModalOpen(true);
      }
    }
  };

  // ─── XỬ LÝ ĐẶT SÂN NHANH ───────────────────────────────────
  const handleQuickBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBookingData.customerName.trim() && quickBookingData.status !== 'maintenance') {
      alert('Vui lòng nhập tên khách hàng hoặc tên đơn đặt!');
      return;
    }

    const startIdx = allTimes.indexOf(quickBookingData.startTime);
    const endIdx = allTimes.indexOf(quickBookingData.endTime);

    if (startIdx >= endIdx) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu!');
      return;
    }

    const facilityId = quickBookingData.facilityId;
    const name = quickBookingData.status === 'maintenance' ? undefined : quickBookingData.customerName;

    let isOverlapped = false;
    for (let i = startIdx; i < endIdx; i++) {
      const t = allTimes[i];
      const existingSlot = getSlot(facilityId, t);
      if (existingSlot && existingSlot.status !== 'available') {
        isOverlapped = true;
        break;
      }
    }

    if (isOverlapped) {
      alert('Khung giờ này đã có sân được đặt hoặc đang bảo trì! Vui lòng chọn khung giờ khác.');
      return;
    }

    const newSlotsToAdd: BookingSlot[] = [];
    for (let i = startIdx; i < endIdx; i++) {
      const t = allTimes[i];
      newSlotsToAdd.push({
        id: `mslot-${facilityId}-${t}-${Date.now()}`,
        facilityId,
        time: t,
        status: quickBookingData.status,
        customerName: name
      });
    }

    const updatedSlots = slots.filter(s => {
      const inRange = s.facilityId === facilityId && allTimes.indexOf(s.time) >= startIdx && allTimes.indexOf(s.time) < endIdx;
      return !inRange;
    });

    setSlots([...updatedSlots, ...newSlotsToAdd]);
    setIsBookingModalOpen(false);
    setQuickBookingData({
      facilityId: MOCK_FACILITIES[0].id,
      customerName: '',
      startTime: '08:00',
      endTime: '09:30',
      status: 'booked'
    });
  };

  // ─── XỬ LÝ HỦY LỊCH ĐẶT ─────────────────────────────────────
  const handleCancelBooking = () => {
    if (!selectedBookingDetail) return;
    const slotIdsToRemove = selectedBookingDetail.slotIds;
    const updatedSlots = slots.filter(s => !slotIdsToRemove.includes(s.id));
    setSlots(updatedSlots);
    setIsDetailModalOpen(false);
    setSelectedBookingDetail(null);
  };

  // ─── KIỂM TRA LƯỚI BLOCK START & SPAN CHO BẢNG ───────────────
  const isBlockStart = (facilityId: string, time: string, status: SlotStatus, customerName?: string): boolean => {
    if (status === 'available') return false;
    const idx = allTimes.indexOf(time);
    if (idx === 0) return true;
    const prevTime = allTimes[idx - 1];
    const prevSlot = getSlot(facilityId, prevTime);
    if (!prevSlot) return true;
    return prevSlot.status !== status || prevSlot.customerName !== customerName;
  };

  const getBlockSpan = (facilityId: string, timeIndex: number, status: SlotStatus, customerName?: string): number => {
    let count = 1;
    for (let i = timeIndex + 1; i < allTimes.length; i++) {
      const nextSlot = getSlot(facilityId, allTimes[i]);
      if (!nextSlot || nextSlot.status !== status || nextSlot.customerName !== customerName) break;
      count++;
    }
    return count;
  };

  const isInsideBlock = (facilityId: string, time: string, status: SlotStatus, customerName?: string): boolean => {
    if (status === 'available') return false;
    return !isBlockStart(facilityId, time, status, customerName);
  };

  const getCompactText = (name: string | undefined, status: SlotStatus, span: number) => {
    if (status === 'maintenance') return span > 1 ? 'BẢO TRÌ' : 'BT';
    if (!name) return '';
    if (span === 1) return name.substring(0, 3) + '..';
    if (span === 2) return name.substring(0, 8) + (name.length > 8 ? '..' : '');
    return name;
  };

  const getMobileCellStyle = (status: SlotStatus): string => {
    switch (status) {
      case 'available':
        return 'bg-slate-50 active:bg-emerald-50/50 cursor-pointer transition-colors duration-150';
      case 'booked':
        return 'bg-gradient-to-r from-emerald-600 to-teal-800 text-white font-bold shadow-sm border border-emerald-700/40 hover:brightness-105 transition-all';
      case 'pending':
        return 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-extrabold shadow-sm border border-amber-500/40 hover:brightness-105 transition-all';
      case 'maintenance':
        return 'bg-stripes-red text-red-800 font-bold border border-red-200 hover:brightness-105 transition-all';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="flex flex-col w-full min-h-full pb-36 relative select-none">
      
      <style>{`
        .bg-stripes-red {
          background-image: repeating-linear-gradient(45deg, #fee2e2, #fee2e2 8px, #fecaca 8px, #fecaca 16px);
        }
        .mobile-matrix-scroll::-webkit-scrollbar { display: none; }
        .mobile-matrix-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ─── 1. BỘ CHỌN BUỔI (JUMP KEYS) ───────── */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200/50">
          {(Object.keys(SESSIONS) as Array<keyof typeof SESSIONS>).map((key) => {
            const active = activeSession === key;
            return (
              <button
                key={key}
                onClick={() => scrollToSession(key)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  active 
                    ? 'bg-brand-emerald text-white shadow-md shadow-emerald-950/15' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {key === 'morning' && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728A9 9 0 115.636 5.636a9 9 0 0112.728 12.728z" />
                  </svg>
                )}
                {key === 'afternoon' && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                )}
                {key === 'evening' && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
                <span>{SESSIONS[key].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 2. THÀNH KPI COMPACT CHO MOBILE ─── */}
      <div className="px-4 mt-1">
        <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex items-center justify-between gap-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-slate-500 font-bold w-full">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-brand-emerald flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Lấp đầy: <span className="text-slate-800 font-black">{kpis.occupancyRate}%</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Doanh thu: <span className="text-slate-800 font-black">{formatPrice(kpis.totalRevenue)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H9m1.414-1.414A2 2 0 1114 3.586V5h-3.586M9 11h6m-6 4h6" />
              </svg>
              Lượt đặt: <span className="text-slate-800 font-black">{kpis.bookingBlockCount}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Hoạt động: <span className="text-slate-800 font-black">{kpis.activeCourtsText}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. ĐIỀU HƯỚNG NGÀY & TÌM KIẾM CHO MOBILE ─── */}
      <div className="px-4 mt-3 space-y-2.5">
        
        {/* Điều hướng ngày */}
        <div className="flex items-center justify-between border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
          <button onClick={handlePrevDay} className="px-3 py-2 text-slate-500 hover:bg-slate-200 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={handleToday} className="flex-1 py-2 text-xs font-bold text-slate-700 bg-white border-x border-slate-200 hover:bg-slate-50">
            {currentDate}
          </button>
          <button onClick={handleNextDay} className="px-3 py-2 text-slate-500 hover:bg-slate-200 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Tìm kiếm & Lọc loại sân */}
        <div className="grid grid-cols-1 gap-2.5">
          <div className="relative">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm khách đặt sân..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald font-medium placeholder-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex bg-slate-100 rounded-xl p-1 gap-1 border border-slate-200/50">
            <button
              onClick={() => setSelectedCourtType('all')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all text-center ${selectedCourtType === 'all' ? 'bg-white text-brand-emerald shadow-sm' : 'text-slate-500'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedCourtType('5v5')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all text-center ${selectedCourtType === '5v5' ? 'bg-white text-brand-emerald shadow-sm' : 'text-slate-500'}`}
            >
              Sân 5
            </button>
            <button
              onClick={() => setSelectedCourtType('7v7')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all text-center ${selectedCourtType === '7v7' ? 'bg-white text-brand-emerald shadow-sm' : 'text-slate-500'}`}
            >
              Sân 7
            </button>
            <button
              onClick={() => setSelectedCourtType('11v11')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all text-center ${selectedCourtType === '11v11' ? 'bg-white text-brand-emerald shadow-sm' : 'text-slate-500'}`}
            >
              Sân 11
            </button>
          </div>
        </div>

      </div>

      {/* ─── 4. LƯỚI MA TRẬN CUỘN LIÊN TỤC ─── */}
      <div className="px-4 py-2 mt-2 overflow-hidden">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_24px_rgba(0,0,0,0.02)] overflow-hidden">
          
          <div ref={scrollContainerRef} className="mobile-matrix-scroll overflow-x-auto touch-pan-x overscroll-x-contain">
            <div className="min-w-max">
              <table className="border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800">
                    <th 
                      style={{ position: 'sticky', left: 0, zIndex: 30 }}
                      className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider px-2 h-10 w-16 text-center border-r border-slate-800"
                    >
                      Sân
                    </th>
                    {allTimes.map((time) => {
                      const isHour = time.endsWith(':00');
                      return (
                        <th 
                          key={time} 
                          id={`m-col-${time}`}
                          className={`text-[9px] font-extrabold px-1 h-10 w-16 text-center border-r border-slate-800/40 ${
                            isHour ? 'bg-slate-900 text-brand-yellow' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div>{time.split(':')[0]}h</div>
                          <div className="text-[7px] opacity-70 font-bold">{time.split(':')[1]}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredFacilities.map((facility) => {
                    return (
                      <tr key={facility.id} className="border-b border-slate-100 last:border-0">
                        {/* Sticky yard column */}
                        <td 
                          style={{ position: 'sticky', left: 0, zIndex: 20 }}
                          className="bg-slate-900 text-white font-black text-center text-xs h-14 w-16 border-r border-slate-800 shadow-[2px_0_8px_rgba(0,0,0,0.1)]"
                        >
                          <div className="text-slate-100 truncate px-0.5">{facility.name.replace('Sân ', '')}</div>
                          <div className="text-[7px] text-brand-yellow tracking-tighter uppercase font-bold">{facility.type}</div>
                        </td>

                        {/* Booking slots cells */}
                        {allTimes.map((time, colIdx) => {
                          const slot = getSlot(facility.id, time);
                          const status = slot?.status || 'available';
                          const isHourBorder = time.endsWith(':00');

                          if (isInsideBlock(facility.id, time, status, slot?.customerName)) {
                            return null;
                          }

                          const span = status !== 'available' ? getBlockSpan(facility.id, colIdx, status, slot?.customerName) : 1;

                          return (
                            <td
                              key={`${facility.id}-${time}`}
                              colSpan={span}
                              onClick={() => handleCellClick(facility.id, time, status)}
                              className={`h-14 p-0 border-b border-slate-100 transition-all ${
                                isHourBorder ? 'border-l border-l-slate-200' : ''
                              } ${status === 'available' ? 'border-r border-r-slate-100 bg-slate-50/50 active:bg-emerald-500/10' : ''}`}
                            >
                              {status === 'available' ? (
                                <div className="h-full w-full flex items-center justify-center cursor-pointer">
                                  <span className="text-[10px] text-slate-300 font-bold">+</span>
                                </div>
                              ) : (
                                <div className={`h-10 mx-0.5 rounded-lg flex items-center justify-between px-1.5 gap-1 shadow-sm ${getMobileCellStyle(status)}`}>
                                  <span className="text-[9px] font-black truncate leading-tight">
                                    {getCompactText(slot?.customerName, status, span)}
                                  </span>
                                  <span className="text-[7px] font-extrabold opacity-75 whitespace-nowrap bg-black/10 px-0.5 py-0.2 rounded">
                                    {span * 30}p
                                  </span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>

      {/* ─── Chú thích màu sắc (Legend) ─── */}
      <div className="flex items-center justify-center gap-3 py-2 mt-1 flex-wrap px-4">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200"></div>
          <span className="text-[9px] font-bold text-slate-500">Trống</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded bg-brand-emerald"></div>
          <span className="text-[9px] font-bold text-slate-500">Đã đặt</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded bg-amber-400"></div>
          <span className="text-[9px] font-bold text-slate-500">Đang giữ</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded bg-red-500"></div>
          <span className="text-[9px] font-bold text-slate-500">Bảo trì</span>
        </div>
      </div>

      {/* ─── 5. MODALS CHO MOBILE ─── */}
      
      {/* MODAL ĐẶT SÂN NHANH */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Đặt sân bóng nhanh"
        maxWidth="sm"
      >
        <form onSubmit={handleQuickBookingSubmit} className="space-y-4">
          {/* Chọn sân */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Chọn Sân</label>
            <select
              value={quickBookingData.facilityId}
              onChange={(e) => setQuickBookingData({...quickBookingData, facilityId: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none"
            >
              {MOCK_FACILITIES.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.type})</option>
              ))}
            </select>
          </div>

          {/* Tên khách hàng */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tên khách hàng</label>
            <input
              type="text"
              placeholder="Nhập tên khách..."
              value={quickBookingData.customerName}
              onChange={(e) => setQuickBookingData({...quickBookingData, customerName: e.target.value})}
              disabled={quickBookingData.status === 'maintenance'}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none disabled:bg-slate-100"
            />
          </div>

          {/* Khung giờ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bắt đầu</label>
              <select
                value={quickBookingData.startTime}
                onChange={(e) => setQuickBookingData({...quickBookingData, startTime: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none"
              >
                {allTimes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kết thúc</label>
              <select
                value={quickBookingData.endTime}
                onChange={(e) => setQuickBookingData({...quickBookingData, endTime: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none"
              >
                {allTimes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Trạng thái đặt</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setQuickBookingData({...quickBookingData, status: 'booked'})}
                className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                  quickBookingData.status === 'booked' 
                    ? 'bg-brand-emerald text-white border-brand-emerald' 
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                Đã đặt
              </button>
              <button
                type="button"
                onClick={() => setQuickBookingData({...quickBookingData, status: 'pending'})}
                className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                  quickBookingData.status === 'pending' 
                    ? 'bg-amber-400 text-amber-950 border-amber-400' 
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                Đang giữ
              </button>
              <button
                type="button"
                onClick={() => setQuickBookingData({...quickBookingData, status: 'maintenance', customerName: ''})}
                className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                  quickBookingData.status === 'maintenance' 
                    ? 'bg-red-500 text-white border-red-500' 
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                Bảo trì
              </button>
            </div>
          </div>

          {/* Nút gửi */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-brand-emerald hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Xác nhận đặt lịch
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL CHI TIẾT ĐẶT SÂN */}
      <Modal
        isOpen={isDetailModalOpen && !!selectedBookingDetail}
        onClose={() => setIsDetailModalOpen(false)}
        title="Thông tin lịch đặt"
        maxWidth="sm"
      >
        {selectedBookingDetail && (
          <div className="space-y-4">
            
            {/* Profile header */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                selectedBookingDetail.status === 'booked' ? 'bg-emerald-600 text-white' :
                selectedBookingDetail.status === 'pending' ? 'bg-amber-400 text-amber-950' :
                'bg-red-500 text-white'
              }`}>
                {selectedBookingDetail.status === 'booked' && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                )}
                {selectedBookingDetail.status === 'pending' && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                {selectedBookingDetail.status === 'maintenance' && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-slate-800 truncate">{selectedBookingDetail.customerName}</h4>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1 inline-block ${
                  selectedBookingDetail.status === 'booked' ? 'bg-emerald-100 text-emerald-800' :
                  selectedBookingDetail.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedBookingDetail.status === 'booked' ? 'Đã đặt' : selectedBookingDetail.status === 'pending' ? 'Đang giữ' : 'Bảo trì'}
                </span>
              </div>
            </div>

            {/* Table details */}
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-400">Sân bóng</span>
                <span className="font-black text-slate-800">{selectedBookingDetail.facility.name} ({selectedBookingDetail.facility.type})</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-400">Thời gian</span>
                <span className="font-black text-brand-emerald">{selectedBookingDetail.startTime} – {selectedBookingDetail.endTime}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-400">Giá thuê</span>
                <span className="font-bold text-slate-700">{formatPrice(selectedBookingDetail.facility.pricePerHour)}/h</span>
              </div>
              {selectedBookingDetail.status !== 'maintenance' && (
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-slate-400">Tổng tạm tính</span>
                  <span className="font-black text-slate-800 text-xs">{formatPrice(selectedBookingDetail.price)}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              {selectedBookingDetail.status === 'pending' && (
                <button
                  onClick={() => {
                    const ids = selectedBookingDetail.slotIds;
                    const updated = slots.map(s => ids.includes(s.id) ? { ...s, status: 'booked' as SlotStatus } : s);
                    setSlots(updated);
                    setIsDetailModalOpen(false);
                  }}
                  className="w-full bg-brand-emerald hover:bg-emerald-950 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Xác nhận đã đặt cọc
                </button>
              )}
              
              <button
                onClick={handleCancelBooking}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                {selectedBookingDetail.status === 'maintenance' ? 'Hủy lịch bảo trì' : 'Hủy lịch đặt sân này'}
              </button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
};
