import { useState, useMemo, useEffect, useCallback } from 'react';
import { generateTimes, type SlotStatus, type BookingSlot, type Facility } from '../components/mockData';
import { scheduleService } from '../services/scheduleService';
import { courtService } from '../../venue/services/courtService';
import type { CourtResponse } from '../../venue/types';
import { useToast } from '../../../components/ui/Toast';

export const useBookingMatrix = (venueId: string | null, refreshCounter = 0) => {
  const { showToast } = useToast();

  // ─── STATE QUẢN LÝ DỮ LIỆU LỊCH ĐẶT THỰC TẾ ───────────────────
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [rawCourts, setRawCourts] = useState<CourtResponse[]>([]);
  const [currentVenue, setCurrentVenue] = useState<any>(null);
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ca cấu hình động từ sân
  const [shiftMinutes, setShiftMinutes] = useState(30);
  const [sportName, setSportName] = useState('');
  const [times, setTimes] = useState<string[]>([]);
  const [closingTime, setClosingTime] = useState('22:00');

  // Quản lý Ngày bằng Date object thực tế
  const [date, setDate] = useState<Date>(() => new Date());
  
  // Tìm kiếm & Lọc
  const [searchTerm, setSearchTerm] = useState('');
  
  // States cho Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showKpis, setShowKpis] = useState(false);

  // Tạo khung giờ động dựa trên chính sách chia ca của cụm sân
  // Tạo khung giờ động dựa trên chính sách chia ca và giờ hoạt động của cụm sân
  const generateDynamicTimes = (duration: number, opening?: string, closing?: string): string[] => {
    let startMin = 6 * 60; // Mặc định 06:00
    let endMin = 22 * 60;  // Mặc định 22:00

    if (opening) {
      const parts = opening.split(':');
      if (parts.length >= 2) {
        startMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      }
    }

    if (closing) {
      const parts = closing.split(':');
      if (parts.length >= 2) {
        endMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      }
    }

    const t: string[] = [];
    let currentMin = startMin;
    while (currentMin < endMin) {
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
    bookingId?: string;
    isManual?: boolean;
    bookedSlots?: number;
    maxSlots?: number;
    pricePerTicket?: number;
  } | null>(null);

  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

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
      setCurrentVenue(currentVenue || null);
      const venueShift = currentVenue?.shiftDurationMinutes || 30;
      setShiftMinutes(venueShift);
      setSportName(currentVenue?.sport?.name || '');
      
      const dynamicTimes = generateDynamicTimes(venueShift, currentVenue?.openingTime, currentVenue?.closingTime);
      setTimes(dynamicTimes);

      let closeStr = '22:00';
      if (currentVenue?.closingTime) {
        const parts = currentVenue.closingTime.split(':');
        if (parts.length >= 2) {
          closeStr = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        }
      }
      setClosingTime(closeStr);

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
        bookingId: s.bookingId,
        isManual: s.isManual,
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
  }, [venueId, date, refreshCounter]);

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
      isManual?: boolean;
    }[] = [];
    let current: {
      startTime: string;
      endTime: string;
      status: SlotStatus;
      customerName?: string;
      slotCount: number;
      ticketSessionId?: string;
      isManual?: boolean;
    } | null = null;

    for (const time of times) {
      const slot = getSlot(facilityId, time);
      const status = slot?.status || 'available';
      const name = slot?.customerName;
      const tSessionId = slot?.ticketSessionId;
      const isManual = slot?.isManual;

      if (status === 'available') {
        if (current) {
          blocks.push(current);
          current = null;
        }
        continue;
      }

      const matchesSearch = !searchTerm || (name && name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Gom nhóm: Cùng trạng thái, cùng khách hàng (nếu là booking thường), hoặc cùng ca xé vé
      // Tuyệt đối không gộp các ca đặt thủ công (isManual === true)
      const isSameGroup = current && 
        current.status === status && 
        !isManual &&
        !current.isManual &&
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
          ticketSessionId: tSessionId,
          isManual
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
      const duration = currentVenue?.shiftDurationMinutes || 30;
      const parseTimeToMinutesLocal = (t: string): number => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      const startMin = parseTimeToMinutesLocal(time);
      const endMin = startMin + duration;

      const formatMinutesToTime = (min: number) => {
        const h = Math.floor(min / 60);
        const m = min % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      };
      const endT = formatMinutesToTime(endMin);

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
      setSelectedShiftId(`${time}-${endT}`);
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
          facility,
          customerName: status === 'matchmaking' ? 'Ca xé vé ghép cặp' : (block.customerName || (block.status === 'maintenance' ? 'Lịch Bảo Trì' : 'Khách lẻ')),
          startTime: block.startTime,
          endTime: actualEndTime,
          status: block.status,
          slotIds,
          price: status === 'matchmaking' ? (slot.pricePerTicket || 0) : totalPrice,
          bookingType: status === 'matchmaking' ? 'matchmaking' : 'regular',
          maxPlayers: slot.maxPlayers,
          skillLevel: slot.skillLevel,
          ticketSessionId: slot.ticketSessionId,
          bookingId: slot.bookingId,
          isManual: slot.isManual,
          bookedSlots: slot.bookedSlots,
          maxSlots: slot.maxSlots,
          pricePerTicket: slot.pricePerTicket
        });
        setIsDetailModalOpen(true);
      }
    }
  };

  // Generate and filter available shifts for the quick booking form (Level 1 filtration)
  const shiftOptions = useMemo(() => {
    if (!currentVenue || !quickBookingData.facilityId) return [];

    const duration = currentVenue.shiftDurationMinutes || 30;
    const opening = currentVenue.openingTime || '06:00';
    const closing = currentVenue.closingTime || '22:00';

    let startMin = 6 * 60;
    let endMin = 22 * 60;

    const parseTimeToMinutesLocal = (t: string): number => {
      if (!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    if (opening) startMin = parseTimeToMinutesLocal(opening);
    if (closing) endMin = parseTimeToMinutesLocal(closing);

    const options = [];
    let currentMin = startMin;
    let shiftIndex = 1;

    const formatMinutesToTime = (min: number) => {
      const h = Math.floor(min / 60);
      const m = min % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    while (currentMin < endMin) {
      const nextMin = currentMin + duration;
      if (nextMin > endMin) break;

      const startTimeStr = formatMinutesToTime(currentMin);
      const endTimeStr = formatMinutesToTime(nextMin);

      // Check if court has any busy slot at this time (booked, pending, maintenance)
      // Level 1: Hide slots that are already booked, pending, or under maintenance from dropdown
      const matchingSlot = slots.find(s => s.facilityId === quickBookingData.facilityId && s.time === startTimeStr);
      const isAvailable = !matchingSlot || matchingSlot.status === 'available';

      if (isAvailable) {
        options.push({
          value: `${startTimeStr}-${endTimeStr}`,
          label: `Ca ${shiftIndex}: ${startTimeStr} - ${endTimeStr}`,
        });
      }

      currentMin = nextMin;
      shiftIndex++;
    }

    return options;
  }, [currentVenue, quickBookingData.facilityId, slots, times]);

  useEffect(() => {
    if (shiftOptions.length > 0) {
      const exists = shiftOptions.some(opt => opt.value === selectedShiftId);
      if (!exists) {
        setSelectedShiftId(shiftOptions[0].value);
        const [start, end] = shiftOptions[0].value.split('-');
        setQuickBookingData(prev => ({
          ...prev,
          startTime: start,
          endTime: end
        }));
      }
    } else {
      setSelectedShiftId('');
      setQuickBookingData(prev => ({
        ...prev,
        startTime: '',
        endTime: ''
      }));
    }
  }, [shiftOptions, selectedShiftId]);

  const handleShiftChange = (val: string) => {
    setSelectedShiftId(val);
    if (val) {
      const [start, end] = val.split('-');
      setQuickBookingData(prev => ({
        ...prev,
        startTime: start,
        endTime: end
      }));
    } else {
      setQuickBookingData(prev => ({
        ...prev,
        startTime: '',
        endTime: ''
      }));
    }
  };

  const handleQuickBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startIdx = times.indexOf(quickBookingData.startTime);
    let endIdx = times.indexOf(quickBookingData.endTime);
    if (endIdx === -1 && quickBookingData.endTime === closingTime) {
      endIdx = times.length;
    }

    if (startIdx >= endIdx) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu!');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const dateStr = getApiDateStr(date);
      const facilityId = quickBookingData.facilityId;
      
      // Build slots payload split by shiftDurationMinutes
      const slotsPayload = [];
      for (let i = startIdx; i < endIdx; i++) {
        const t = times[i];
        const nextT = i < times.length - 1 ? times[i + 1] : closingTime;
        slotsPayload.push({
          courtId: facilityId,
          bookingDate: dateStr,
          startTime: t,
          endTime: nextT
        });
      }

      await scheduleService.createBooking({
        slots: slotsPayload,
        paymentMethod: 'manual',
        status: 'CONFIRMED',
        isManual: true,
        customerName: 'CHỦ SÂN SPORTA'
      });

      showToast('success', 'Đặt sân thủ công thành công!');
      setIsBookingModalOpen(false);
      await fetchSchedule();
    } catch (err: any) {
      // Level 2: if conflict occurs (e.g. booked by someone else in the meantime), show transparent warning message
      alert(err.message || 'Lỗi khi đặt sân thủ công');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBookingDetail) return;

    setLoading(true);
    setError(null);
    try {
      if (selectedBookingDetail.status === 'matchmaking' && selectedBookingDetail.ticketSessionId) {
        // Cancel ticket session (xé vé)
        await scheduleService.cancelTicketSession(selectedBookingDetail.ticketSessionId);
        showToast('success', 'Hủy ca xé vé thành công!');
      } else if (selectedBookingDetail.bookingId) {
        // Cancel manual booking
        await scheduleService.cancelBooking(selectedBookingDetail.bookingId);
        showToast('success', 'Hủy lịch đặt sân thành công!');
      } else {
        throw new Error('Không thể xác định ID đặt sân để hủy');
      }

      setIsDetailModalOpen(false);
      setSelectedBookingDetail(null);
      await fetchSchedule();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi hủy lịch đặt sân');
    } finally {
      setLoading(false);
    }
  };

  const isBlockStart = (facilityId: string, time: string, status: SlotStatus, customerName?: string, ticketSessionId?: string): boolean => {
    if (status === 'available') return false;
    const slot = getSlot(facilityId, time);
    if (slot?.isManual) return true; // Lịch đặt thủ công luôn bắt đầu block mới

    const idx = times.indexOf(time);
    if (idx === 0) return true;
    const prevTime = times[idx - 1];
    const prevSlot = getSlot(facilityId, prevTime);
    if (!prevSlot) return true;
    if (prevSlot.isManual) return true; // Không gộp với lịch đặt thủ công trước đó

    if (status === 'matchmaking') {
      return prevSlot.status !== status || prevSlot.ticketSessionId !== ticketSessionId;
    }
    return prevSlot.status !== status || prevSlot.customerName !== customerName;
  };

  const getBlockSpan = (facilityId: string, timeIndex: number, status: SlotStatus, customerName?: string, ticketSessionId?: string): number => {
    const slot = getSlot(facilityId, times[timeIndex]);
    if (slot?.isManual) return 1; // Lịch đặt thủ công có độ rộng mặc định là 1 ca

    let count = 1;
    for (let i = timeIndex + 1; i < times.length; i++) {
      const nextSlot = getSlot(facilityId, times[i]);
      if (!nextSlot || nextSlot.status !== status) break;
      if (nextSlot.isManual) break; // Gặp lịch đặt thủ công thì dừng lại không gộp tiếp
      
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
    sportName,
    closingTime,
    shiftOptions,
    selectedShiftId,
    handleShiftChange,
    isConfirmCancelOpen,
    setIsConfirmCancelOpen
  };
};
