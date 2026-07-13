// ═══════════════════════════════════════════════════════════
// Mock Data cho Sơ đồ sân — Sporta Web-Owner
// ═══════════════════════════════════════════════════════════

export type SlotStatus = 'available' | 'booked' | 'pending' | 'maintenance' | 'matchmaking';

export interface BookingSlot {
  id: string;
  facilityId: string;
  time: string; // Format: "HH:mm"
  status: SlotStatus;
  customerName?: string;
  bookingId?: string;
  bookingType?: 'regular' | 'matchmaking';
  maxPlayers?: number;
  skillLevel?: string;
  price?: number;
  ticketSessionId?: string;
  bookedSlots?: number;
  maxSlots?: number;
  pricePerTicket?: number;
}

export interface Facility {
  id: string;
  name: string;
  type?: string;
  pricePerHour: number;
}

/** Nhóm các slot liên tiếp cùng trạng thái → "booking block" cho Gantt bar */
export interface BookingBlock {
  facilityId: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  customerName?: string;
  slotCount: number;
}

// ─── Facilities ──────────────────────────────────────────
export const MOCK_FACILITIES: Facility[] = [
  { id: 'f1', name: 'Sân 1', type: '5v5',  pricePerHour: 300000 },
  { id: 'f2', name: 'Sân 2', type: '5v5',  pricePerHour: 300000 },
  { id: 'f3', name: 'Sân 3', type: '7v7',  pricePerHour: 500000 },
  { id: 'f4', name: 'Sân 4', type: '7v7',  pricePerHour: 500000 },
  { id: 'f5', name: 'Sân 5', type: '11v11', pricePerHour: 800000 },
  { id: 'f6', name: 'Sân 6', type: '5v5',  pricePerHour: 350000 },
];

// ─── Slots ────────────────────────────────────────────────
export const MOCK_SLOTS: BookingSlot[] = [
  // Sân 1 — 2 block booked
  { id: 's01', facilityId: 'f1', time: '07:00', status: 'booked', customerName: 'Nguyễn Văn A' },
  { id: 's02', facilityId: 'f1', time: '07:30', status: 'booked', customerName: 'Nguyễn Văn A' },
  { id: 's03', facilityId: 'f1', time: '08:00', status: 'booked', customerName: 'Nguyễn Văn A' },
  { id: 's04', facilityId: 'f1', time: '17:00', status: 'booked', customerName: 'Trần Bình' },
  { id: 's05', facilityId: 'f1', time: '17:30', status: 'booked', customerName: 'Trần Bình' },
  { id: 's06', facilityId: 'f1', time: '18:00', status: 'booked', customerName: 'Trần Bình' },
  { id: 's07', facilityId: 'f1', time: '18:30', status: 'booked', customerName: 'Trần Bình' },

  // Sân 2 — pending + booked
  { id: 's10', facilityId: 'f2', time: '09:00', status: 'pending', customerName: 'Lê Hoàng' },
  { id: 's11', facilityId: 'f2', time: '09:30', status: 'pending', customerName: 'Lê Hoàng' },
  { id: 's12', facilityId: 'f2', time: '19:00', status: 'booked', customerName: 'Phạm Duy' },
  { id: 's13', facilityId: 'f2', time: '19:30', status: 'booked', customerName: 'Phạm Duy' },
  { id: 's14', facilityId: 'f2', time: '20:00', status: 'booked', customerName: 'Phạm Duy' },

  // Sân 3 — booked morning + maintenance
  { id: 's20', facilityId: 'f3', time: '06:00', status: 'booked', customerName: 'Đội Tân Phú' },
  { id: 's21', facilityId: 'f3', time: '06:30', status: 'booked', customerName: 'Đội Tân Phú' },
  { id: 's22', facilityId: 'f3', time: '07:00', status: 'booked', customerName: 'Đội Tân Phú' },
  { id: 's23', facilityId: 'f3', time: '07:30', status: 'booked', customerName: 'Đội Tân Phú' },
  { id: 's24', facilityId: 'f3', time: '14:00', status: 'maintenance' },
  { id: 's25', facilityId: 'f3', time: '14:30', status: 'maintenance' },
  { id: 's26', facilityId: 'f3', time: '15:00', status: 'maintenance' },
  { id: 's27', facilityId: 'f3', time: '20:00', status: 'pending', customerName: 'Ngô Quang' },
  { id: 's28', facilityId: 'f3', time: '20:30', status: 'pending', customerName: 'Ngô Quang' },

  // Sân 4 — evening block
  { id: 's30', facilityId: 'f4', time: '18:00', status: 'booked', customerName: 'Đội FC Q7' },
  { id: 's31', facilityId: 'f4', time: '18:30', status: 'booked', customerName: 'Đội FC Q7' },
  { id: 's32', facilityId: 'f4', time: '19:00', status: 'booked', customerName: 'Đội FC Q7' },
  { id: 's33', facilityId: 'f4', time: '19:30', status: 'booked', customerName: 'Đội FC Q7' },
  { id: 's34', facilityId: 'f4', time: '20:00', status: 'booked', customerName: 'Đội FC Q7' },
  { id: 's35', facilityId: 'f4', time: '20:30', status: 'booked', customerName: 'Đội FC Q7' },

  // Sân 5 — scattered
  { id: 's40', facilityId: 'f5', time: '08:00', status: 'pending', customerName: 'Công ty ABC' },
  { id: 's41', facilityId: 'f5', time: '08:30', status: 'pending', customerName: 'Công ty ABC' },
  { id: 's42', facilityId: 'f5', time: '09:00', status: 'pending', customerName: 'Công ty ABC' },
  { id: 's43', facilityId: 'f5', time: '09:30', status: 'pending', customerName: 'Công ty ABC' },
  { id: 's44', facilityId: 'f5', time: '16:00', status: 'booked', customerName: 'Nguyễn Thanh' },
  { id: 's45', facilityId: 'f5', time: '16:30', status: 'booked', customerName: 'Nguyễn Thanh' },

  // Sân 6
  { id: 's50', facilityId: 'f6', time: '10:00', status: 'booked', customerName: 'Võ Minh' },
  { id: 's51', facilityId: 'f6', time: '10:30', status: 'booked', customerName: 'Võ Minh' },
  { id: 's52', facilityId: 'f6', time: '11:00', status: 'booked', customerName: 'Võ Minh' },
  { id: 's53', facilityId: 'f6', time: '15:00', status: 'maintenance' },
  { id: 's54', facilityId: 'f6', time: '15:30', status: 'maintenance' },
];

// ─── Helpers ──────────────────────────────────────────────
export const generateTimes = (): string[] => {
  const t: string[] = [];
  for (let h = 6; h <= 22; h++) {
    t.push(`${h.toString().padStart(2, '0')}:00`);
    if (h !== 22) t.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return t;
};

export const getSlot = (facilityId: string, time: string): BookingSlot | undefined => {
  return MOCK_SLOTS.find(s => s.facilityId === facilityId && s.time === time);
};

export const getSlotStatus = (facilityId: string, time: string): SlotStatus => {
  return getSlot(facilityId, time)?.status || 'available';
};

/** Nhóm slot liên tiếp cùng trạng thái + cùng khách thành 1 block (cho Gantt bars) */
export const getBookingBlocks = (facilityId: string): BookingBlock[] => {
  const times = generateTimes();
  const blocks: BookingBlock[] = [];
  let current: BookingBlock | null = null;

  for (const time of times) {
    const slot = getSlot(facilityId, time);
    const status = slot?.status || 'available';

    if (status === 'available') {
      if (current) { blocks.push(current); current = null; }
      continue;
    }

    const name = slot?.customerName;
    if (current && current.status === status && current.customerName === name) {
      current.endTime = time;
      current.slotCount++;
    } else {
      if (current) blocks.push(current);
      current = { facilityId, startTime: time, endTime: time, status, customerName: name, slotCount: 1 };
    }
  }
  if (current) blocks.push(current);
  return blocks;
};

/** Format giá tiền VNĐ */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};
