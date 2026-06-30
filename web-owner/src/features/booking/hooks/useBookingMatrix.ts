import { useState, useMemo } from 'react';
import { 
  MOCK_FACILITIES, 
  generateTimes, 
  formatPrice, 
  type SlotStatus, 
  type BookingSlot, 
  type Facility,
  MOCK_SLOTS
} from '../components/mockData';

export const useBookingMatrix = () => {
  const times = useMemo(() => generateTimes(), []);
  
  // ─── STATE QUẢN LÝ DỮ LIỆU LỊCH ĐẶT ───────────────────────
  const [slots, setSlots] = useState<BookingSlot[]>(MOCK_SLOTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourtType, setSelectedCourtType] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState<string>('Hôm nay, 11/06/2026');
  
  // States cho Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showKpis, setShowKpis] = useState(false);
  
  // Dữ liệu phục vụ cho Quick Booking
  const [quickBookingData, setQuickBookingData] = useState({
    facilityId: MOCK_FACILITIES[0].id,
    customerName: '',
    startTime: '08:00',
    endTime: '09:30',
    status: 'booked' as SlotStatus,
    bookingType: 'regular' as 'regular' | 'matchmaking',
    maxPlayers: 10,
    skillLevel: 'Trung bình'
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
  } | null>(null);

  const getSlot = (facilityId: string, time: string): BookingSlot | undefined => {
    return slots.find(s => s.facilityId === facilityId && s.time === time);
  };

  /** Nhóm slot liên tiếp cùng trạng thái + cùng khách hàng thành các block đặt sân */
  const getBookingBlocksForRow = (facilityId: string) => {
    const blocks: { startTime: string; endTime: string; status: SlotStatus; customerName?: string; slotCount: number }[] = [];
    let current: { startTime: string; endTime: string; status: SlotStatus; customerName?: string; slotCount: number } | null = null;

    for (const time of times) {
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

      // Lọc theo từ khóa tìm kiếm nếu có
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

  // ─── BỘ LỌC FACILITIES CHỌN THEO LOẠI SÂN ────────────────────
  const filteredFacilities = useMemo(() => {
    if (selectedCourtType === 'all') return MOCK_FACILITIES;
    return MOCK_FACILITIES.filter(f => f.type === selectedCourtType);
  }, [selectedCourtType]);

  // ─── TÍNH TOÁN CÁC CHỈ SỐ KPI ĐỘNG ─────────────────────────
  const kpis = useMemo(() => {
    const totalSlotsPossible = MOCK_FACILITIES.length * times.length;
    let bookedCount = 0;
    let pendingCount = 0;
    let maintenanceCount = 0;
    let totalRevenue = 0;
    let bookingBlockCount = 0;

    // Duyệt qua tất cả slots để tính toán
    slots.forEach(slot => {
      const facility = MOCK_FACILITIES.find(f => f.id === slot.facilityId);
      if (!facility) return;

      if (slot.status === 'booked') {
        bookedCount++;
        totalRevenue += (facility.pricePerHour * 0.5); // Mỗi slot 30 phút = 0.5h
      } else if (slot.status === 'pending') {
        pendingCount++;
      } else if (slot.status === 'maintenance') {
        maintenanceCount++;
      }
    });

    // Tính số lượng block đặt sân thực tế (lượt đặt)
    MOCK_FACILITIES.forEach(f => {
      const blocks = getBookingBlocksForRow(f.id);
      bookingBlockCount += blocks.filter(b => b.status === 'booked' || b.status === 'pending').length;
    });

    const occupancyRate = Math.round(((bookedCount + pendingCount + maintenanceCount) / totalSlotsPossible) * 100);
    const activeCourts = MOCK_FACILITIES.filter(f => {
      const facilitySlots = slots.filter(s => s.facilityId === f.id && s.status === 'maintenance');
      return facilitySlots.length < times.length / 2; // Ít hơn 50% thời gian bảo trì
    }).length;

    return {
      occupancyRate,
      totalRevenue,
      bookingBlockCount,
      activeCourtsText: `${activeCourts}/${MOCK_FACILITIES.length}`
    };
  }, [slots, times]);

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
      default:
        return 'bg-white';
    }
  };

  const handlePrevDay = () => setCurrentDate('Hôm qua, 10/06/2026');
  const handleNextDay = () => setCurrentDate('Ngày mai, 12/06/2026');
  const handleToday = () => setCurrentDate('Hôm nay, 11/06/2026');

  const handleCellClick = (facilityId: string, time: string, status: SlotStatus) => {
    const facility = MOCK_FACILITIES.find(f => f.id === facilityId);
    if (!facility) return;

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
        skillLevel: 'Trung bình'
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
        return currentIdx >= startIdx && currentIdx <= endIdx && b.status === status && b.customerName === slot.customerName;
      });

      if (block) {
        const durationHours = (block.slotCount * 30) / 60;
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
          customerName: block.customerName || (block.status === 'maintenance' ? 'Lịch Bảo Trì' : (block.status === 'matchmaking' ? 'Trận ghép xé vé' : 'Khách vãng lai')),
          startTime: block.startTime,
          endTime: block.endTime,
          status: block.status,
          slotIds,
          price: totalPrice,
          bookingType: slot.bookingType || (block.status === 'matchmaking' ? 'matchmaking' : 'regular'),
          maxPlayers: slot.maxPlayers,
          skillLevel: slot.skillLevel
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

    const newSlotsToAdd: BookingSlot[] = [];
    const facilityId = quickBookingData.facilityId;
    const name = quickBookingData.status === 'maintenance' ? undefined : quickBookingData.customerName;

    let isOverlapped = false;
    for (let i = startIdx; i < endIdx; i++) {
      const t = times[i];
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

    for (let i = startIdx; i < endIdx; i++) {
      const t = times[i];
      newSlotsToAdd.push({
        id: `slot-${facilityId}-${t}-${Date.now()}`,
        facilityId,
        time: t,
        status: quickBookingData.bookingType === 'matchmaking' ? 'matchmaking' : quickBookingData.status,
        customerName: quickBookingData.bookingType === 'matchmaking' ? (quickBookingData.customerName.trim() || 'Trận ghép xé vé') : name,
        bookingType: quickBookingData.bookingType,
        maxPlayers: quickBookingData.bookingType === 'matchmaking' ? quickBookingData.maxPlayers : undefined,
        skillLevel: quickBookingData.bookingType === 'matchmaking' ? quickBookingData.skillLevel : undefined
      });
    }

    const updatedSlots = slots.filter(s => {
      const inRange = s.facilityId === facilityId && times.indexOf(s.time) >= startIdx && times.indexOf(s.time) < endIdx;
      return !inRange;
    });

    setSlots([...updatedSlots, ...newSlotsToAdd]);
    setIsBookingModalOpen(false);
    setQuickBookingData({
      facilityId: MOCK_FACILITIES[0].id,
      customerName: '',
      startTime: '08:00',
      endTime: '09:30',
      status: 'booked',
      bookingType: 'regular',
      maxPlayers: 10,
      skillLevel: 'Trung bình'
    });
  };

  const handleCancelBooking = () => {
    if (!selectedBookingDetail) return;
    
    const slotIdsToRemove = selectedBookingDetail.slotIds;
    const updatedSlots = slots.filter(s => !slotIdsToRemove.includes(s.id));
    
    setSlots(updatedSlots);
    setIsDetailModalOpen(false);
    setSelectedBookingDetail(null);
  };

  const isBlockStart = (facilityId: string, time: string, status: SlotStatus, customerName?: string): boolean => {
    if (status === 'available') return false;
    const idx = times.indexOf(time);
    if (idx === 0) return true;
    const prevTime = times[idx - 1];
    const prevSlot = getSlot(facilityId, prevTime);
    if (!prevSlot) return true;
    return prevSlot.status !== status || prevSlot.customerName !== customerName;
  };

  const getBlockSpan = (facilityId: string, timeIndex: number, status: SlotStatus, customerName?: string): number => {
    let count = 1;
    for (let i = timeIndex + 1; i < times.length; i++) {
      const nextSlot = getSlot(facilityId, times[i]);
      if (!nextSlot || nextSlot.status !== status || nextSlot.customerName !== customerName) break;
      count++;
    }
    return count;
  };

  const isInsideBlock = (facilityId: string, time: string, status: SlotStatus, customerName?: string): boolean => {
    if (status === 'available') return false;
    return !isBlockStart(facilityId, time, status, customerName);
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
    selectedCourtType,
    setSelectedCourtType,
    currentDate,
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
    handleConfirmDeposit
  };
};
