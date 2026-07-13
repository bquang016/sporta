import { useState, useMemo, useEffect, useCallback } from 'react';
import { generateTimes, type SlotStatus, type BookingSlot, type Facility } from '../components/mockData';
import { scheduleService } from '../services/scheduleService';
import { courtService } from '../../venue/services/courtService';
import type { CourtResponse } from '../../venue/types';

export const useBookingMatrix = (venueId: string | null, refreshCounter = 0) => {
  // ─── STATE QUẢN LÝ DỮ LIỆU LỊCH ĐẶT THỰC TẾ ───────────────────
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [rawCourts, setRawCourts] = useState<CourtResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ca cấu hình động từ sân
  const [shiftMinutes, setShiftMinutes] = useState(30);
  const [sportName, setSportName] = useState('');
  const [times, setTimes] = useState<string[]>([]);

  // Quản lý Ngày bằng Date object thực tế
  const [date, setDate] = useState<Date>(() => new Date());
  
  // Tìm kiếm & Lọc
  const [searchTerm, setSearchTerm] = useState('');
  
  // States cho Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showKpis, setShowKpis] = useState(false);

  // Tạo khung giờ động dựa trên chính sách chia ca của cụm sân
  const generateDynamicTimes = (duration: number): string[] => {
    const t: string[] = [];
    let currentMin = 6 * 60; // 06:00
    const endMin = 22 * 60;  // 22:00
    while (currentMin <= endMin) {
      const h = Math.floor(currentMin / 60);
      const m = currentMin % 60;
      t.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      currentMin += duration;
    }
    return t;
  };

  // Formatting date labels
  const formatDateLabel = (d: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

    if (d.toDateString() === today.toDateString()) {
      return `Hôm nay, ${dateStr}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
      return `Hôm qua, ${dateStr}`;
    } else if (d.toDateString() === tomorrow.toDateString()) {
      return `Ngày mai, ${dateStr}`;
    }
    return dateStr;
  };

  const getApiDateStr = (d: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const currentDate = useMemo(() => formatDateLabel(date), [date]);

  // Dữ liệu phục vụ cho Quick Booking
  const [quickBookingData, setQuickBookingData] = useState({
    facilityId: '',
    customerName: '',
    startTime: '08:00',
    endTime: '09:30',
    status: 'booked' as SlotStatus,
    bookingType: 'regular' as 'regular' | 'matchmaking',
    maxPlayers: 10,
    skillLevel: 'ALL'
  });

  // Dữ liệu phục vụ cho xem chi tiết
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<{
    facility: Facility;
    customerName: string;
    startTime: string;
    endTime: string;
    status: SlotStatus;
    slotIds: string[];
    price: number;
    bookingType?: 'regular' | 'matchmaking';
    maxPlayers?: number;
    skillLevel?: string;
    ticketSessionId?: string;
    bookedSlots?: number;
    maxSlots?: number;
    pricePerTicket?: number;
  } | null>(null);

  // Fetch dữ liệu thực tế từ API
  const fetchSchedule = useCallback(async () => {
    if (!venueId) return;
    setLoading(true);
    setError(null);
    try {
      const _ = refreshCounter;
      // 1. Fetch danh sách sân của cụm sân này
      const allCourts = await courtService.getCourts();
      const filteredCourts = allCourts.filter(c => c.venueId === venueId);
      setRawCourts(filteredCourts);

      if (filteredCourts.length > 0) {
        setQuickBookingData(prev => ({
          ...prev,
          facilityId: filteredCourts[0].id
        }));
      }

      // Tìm cụm sân hiện tại để xác định ca
      const venueList = await courtService.getVenues();
      const currentVenue = venueList.find(v => v.id === venueId);
      const venueShift = currentVenue?.shiftDurationMinutes || 30;
      setShiftMinutes(venueShift);
      setSportName(currentVenue?.sport?.name || '');
      
      const dynamicTimes = generateDynamicTimes(venueShift);
      setTimes(dynamicTimes);

      // 2. Fetch sơ đồ đặt sân ngày được chọn
      const dateStr = getApiDateStr(date);
      const apiSlots = await scheduleService.getSchedule(venueId, dateStr);

      const mapped: BookingSlot[] = apiSlots.map(s => ({
        id: `slot-${s.courtId}-${s.time}`,
        facilityId: s.courtId,
        time: s.time,
        status: s.status as SlotStatus,
        price: s.price,
        customerName: s.customerName,
        bookingType: s.status === 'matchmaking' ? 'matchmaking' : 'regular',
        ticketSessionId: s.ticketSessionId,
        bookedSlots: s.bookedSlots,
        maxSlots: s.maxSlots,
        skillLevel: s.sportLevel,
        pricePerTicket: s.pricePerTicket
      }));

      setSlots(mapped);
    } catch (err: any) {
      setError(err.message || 'Không thể tải lịch đặt sân');
    } finally {
      setLoading(false);
    }
  }, [venueId, date]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const getSlot = (facilityId: string, time: string): BookingSlot | undefined => {
    return slots.find(s => s.facilityId === facilityId && s.time === time);
  };

  /** Nhóm slot liên tiếp cùng trạng thái + cùng khách hàng thành các block đặt sân */
  const getBookingBlocksForRow = (facilityId: string) => {
    const blocks: {
      startTime: string;
      endTime: string;
      status: SlotStatus;
      customerName?: string;
      slotCount: number;
      ticketSessionId?: string;
    }[] = [];
    let current: {
      startTime: string;
      endTime: string;
      status: SlotStatus;
      customerName?: string;
      slotCount: number;
      ticketSessionId?: string;
    } | null = null;

    for (const time of times) {
      const slot = getSlot(facilityId, time);
      const status = slot?.status || 'available';
      const name = slot?.customerName;
      const tSessionId = slot?.ticketSessionId;

      if (status === 'available') {
        if (current) {
          blocks.push(current);
          current = null;
        }
        continue;
      }

      const matchesSearch = !searchTerm || (name && name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Gom nhóm: Cùng trạng thái, cùng khách hàng (nếu là booking thường), hoặc cùng ca xé vé
      const isSameGroup = current && 
        current.status === status && 
        (status === 'matchmaking' ? current.ticketSessionId === tSessionId : current.customerName === name);

      if (isSameGroup && current) {
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
          slotCount: 1,
          ticketSessionId: tSessionId
        };
      }
    }
    if (current) {
      blocks.push(current);
    }
    return blocks;
  };

  // Trả về toàn bộ sân của cụm sân hiện tại lọc theo từ khóa tìm kiếm sân
  const filteredFacilities = useMemo(() => {
    const mapped: Facility[] = rawCourts.map(c => ({
      id: c.id,
      name: c.name,
      type: '', // Sân đa môn, bỏ bóng đá cụ thể
      pricePerHour: c.price
    }));

    if (!searchTerm) return mapped;
    return mapped.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [rawCourts, searchTerm]);

  // Chỉ số KPIs
  const kpis = useMemo(() => {
    const totalSlotsPossible = Math.max(1, rawCourts.length * times.length);
    let bookedCount = 0;
    let pendingCount = 0;
    let maintenanceCount = 0;
    let totalRevenue = 0;
    let bookingBlockCount = 0;

    slots.forEach(slot => {
      const facility = rawCourts.find(f => f.id === slot.facilityId);
      if (!facility) return;

      if (slot.status === 'booked') {
        bookedCount++;
        totalRevenue += (facility.price * (shiftMinutes / 60));
      } else if (slot.status === 'pending') {
        pendingCount++;
      } else if (slot.status === 'maintenance') {
        maintenanceCount++;
      } else if (slot.status === 'matchmaking') {
        bookedCount++;
        if (slot.bookedSlots && slot.pricePerTicket) {
          totalRevenue += (slot.pricePerTicket / times.length);
        }
      }
    });

    rawCourts.forEach(f => {
      const blocks = getBookingBlocksForRow(f.id);
      bookingBlockCount += blocks.filter(b => b.status === 'booked' || b.status === 'pending' || b.status === 'matchmaking').length;
    });

    const occupancyRate = Math.round(((bookedCount + pendingCount + maintenanceCount) / totalSlotsPossible) * 100);
    const activeCourts = rawCourts.filter(f => {
      const facilitySlots = slots.filter(s => s.facilityId === f.id && s.status === 'maintenance');
      return facilitySlots.length < times.length / 2;
    }).length;

    return {
      occupancyRate,
      totalRevenue,
      bookingBlockCount,
      activeCourtsText: `${activeCourts}/${rawCourts.length}`
    };
  }, [slots, times, rawCourts, shiftMinutes]);

  const getCellStyle = (status: SlotStatus): string => {
    switch (status) {
      case 'available':
        return 'bg-slate-50 hover:bg-emerald-50/80 cursor-pointer transition-colors duration-150';
      case 'booked':
        return 'bg-gradient-to-r from-emerald-600 to-teal-800 text-white font-bold shadow-md border border-emerald-700/40 hover:brightness-105 transition-all';
      case 'pending':
        return 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-extrabold shadow-md border border-amber-500/40 hover:brightness-105 transition-all';
      case 'matchmaking':
        return 'bg-gradient-to-r from-indigo-600 to-purple-800 text-white font-bold shadow-md border border-indigo-700/40 hover:brightness-105 transition-all';
      case 'maintenance':
        return 'bg-stripes-red text-red-800 font-bold border border-red-200 hover:brightness-105 transition-all';
      case 'locked':
        return 'bg-slate-100 text-slate-400 border border-slate-200/50 cursor-not-allowed select-none opacity-60';
      default:
        return 'bg-white';
    }
  };

  const handlePrevDay = () => {
    setDate(prev => {
      const nextD = new Date(prev);
      nextD.setDate(nextD.getDate() - 1);
      return nextD;
    });
  };

  const handleNextDay = () => {
    setDate(prev => {
      const nextD = new Date(prev);
      nextD.setDate(nextD.getDate() + 1);
      return nextD;
    });
  };

  const handleToday = () => {
    setDate(new Date());
  };

  const handleCellClick = (facilityId: string, time: string, status: SlotStatus) => {
    if (status === 'locked') return; // Chặn click vào ca đã qua giờ
    const court = rawCourts.find(c => c.id === facilityId);
    if (!court) return;

    const facility: Facility = {
      id: court.id,
      name: court.name,
      type: '',
      pricePerHour: court.price
    };

    if (status === 'available') {
      const timeIdx = times.indexOf(time);
      const endT = timeIdx < times.length - 2 ? times[timeIdx + 2] : times[times.length - 1];
      setQuickBookingData({
        facilityId,
        customerName: '',
        startTime: time,
        endTime: endT,
        status: 'booked',
        bookingType: 'regular',
        maxPlayers: 10,
        skillLevel: 'ALL'
      });
      setIsBookingModalOpen(true);
    } else {
      const slot = getSlot(facilityId, time);
      if (!slot) return;

      const rowBlocks = getBookingBlocksForRow(facilityId);
      const block = rowBlocks.find(b => {
        const startIdx = times.indexOf(b.startTime);
        const endIdx = times.indexOf(b.endTime);
        const currentIdx = times.indexOf(time);
        
        if (status === 'matchmaking') {
          return currentIdx >= startIdx && currentIdx <= endIdx && b.status === status && b.ticketSessionId === slot.ticketSessionId;
        }
        return currentIdx >= startIdx && currentIdx <= endIdx && b.status === status && b.customerName === slot.customerName;
      });

      if (block) {
        const durationHours = (block.slotCount * shiftMinutes) / 60;
        const totalPrice = facility.pricePerHour * durationHours;

        const startIdx = times.indexOf(block.startTime);
        const endIdx = times.indexOf(block.endTime);
        const slotIds: string[] = [];
        for (let i = startIdx; i <= endIdx; i++) {
          const t = times[i];
          const s = getSlot(facilityId, t);
          if (s) slotIds.push(s.id);
        }

        setSelectedBookingDetail({
          facility,
          customerName: status === 'matchmaking' ? 'Ca xé vé ghép cặp' : (block.customerName || (block.status === 'maintenance' ? 'Lịch Bảo Trì' : 'Khách lẻ')),
          startTime: block.startTime,
          endTime: block.endTime,
          status: block.status,
          slotIds,
          price: status === 'matchmaking' ? (slot.pricePerTicket || 0) : totalPrice,
          bookingType: status === 'matchmaking' ? 'matchmaking' : 'regular',
          maxPlayers: slot.maxPlayers,
          skillLevel: slot.skillLevel,
          ticketSessionId: slot.ticketSessionId,
          bookedSlots: slot.bookedSlots,
          maxSlots: slot.maxSlots,
          pricePerTicket: slot.pricePerTicket
        });
        setIsDetailModalOpen(true);
      }
    }
  };

  const handleQuickBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBookingData.customerName.trim() && quickBookingData.status !== 'maintenance' && quickBookingData.bookingType !== 'matchmaking') {
      alert('Vui lòng nhập tên khách hàng hoặc tên đơn đặt!');
      return;
    }

    const startIdx = times.indexOf(quickBookingData.startTime);
    const endIdx = times.indexOf(quickBookingData.endTime);

    if (startIdx >= endIdx) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu!');
      return;
    }

    const facilityId = quickBookingData.facilityId;
    const name = quickBookingData.status === 'maintenance' ? undefined : quickBookingData.customerName;

    const newSlotsToAdd: BookingSlot[] = [];
    for (let i = startIdx; i < endIdx; i++) {
      const t = times[i];
      newSlotsToAdd.push({
        id: `slot-${facilityId}-${t}-${Date.now()}`,
        facilityId,
        time: t,
        status: quickBookingData.status,
        customerName: name,
        price: 0,
        bookingType: 'regular'
      });
    }

    const updatedSlots = slots.filter(s => {
      const inRange = s.facilityId === facilityId && times.indexOf(s.time) >= startIdx && times.indexOf(s.time) < endIdx;
      return !inRange;
    });

    setSlots([...updatedSlots, ...newSlotsToAdd]);
    setIsBookingModalOpen(false);
  };

  const handleCancelBooking = () => {
    if (!selectedBookingDetail) return;
    const slotIdsToRemove = selectedBookingDetail.slotIds;
    const updatedSlots = slots.filter(s => !slotIdsToRemove.includes(s.id));
    setSlots(updatedSlots);
    setIsDetailModalOpen(false);
    setSelectedBookingDetail(null);
  };

  const isBlockStart = (facilityId: string, time: string, status: SlotStatus, customerName?: string, ticketSessionId?: string): boolean => {
    if (status === 'available') return false;
    const idx = times.indexOf(time);
    if (idx === 0) return true;
    const prevTime = times[idx - 1];
    const prevSlot = getSlot(facilityId, prevTime);
    if (!prevSlot) return true;

    if (status === 'matchmaking') {
      return prevSlot.status !== status || prevSlot.ticketSessionId !== ticketSessionId;
    }
    return prevSlot.status !== status || prevSlot.customerName !== customerName;
  };

  const getBlockSpan = (facilityId: string, timeIndex: number, status: SlotStatus, customerName?: string, ticketSessionId?: string): number => {
    let count = 1;
    for (let i = timeIndex + 1; i < times.length; i++) {
      const nextSlot = getSlot(facilityId, times[i]);
      if (!nextSlot || nextSlot.status !== status) break;
      
      if (status === 'matchmaking') {
        if (nextSlot.ticketSessionId !== ticketSessionId) break;
      } else {
        if (nextSlot.customerName !== customerName) break;
      }
      count++;
    }
    return count;
  };

  const isInsideBlock = (facilityId: string, time: string, status: SlotStatus, customerName?: string, ticketSessionId?: string): boolean => {
    if (status === 'available') return false;
    return !isBlockStart(facilityId, time, status, customerName, ticketSessionId);
  };

  const handleConfirmDeposit = () => {
    if (!selectedBookingDetail) return;
    const ids = selectedBookingDetail.slotIds;
    const updated = slots.map(s => ids.includes(s.id) ? { ...s, status: 'booked' as SlotStatus } : s);
    setSlots(updated);
    setIsDetailModalOpen(false);
  };

  return {
    times,
    slots,
    setSlots,
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
    loading,
    error,
    fetchSchedule,
    shiftMinutes,
    sportName
  };
};
