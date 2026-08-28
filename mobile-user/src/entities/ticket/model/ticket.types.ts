export type SportLevel = 'WEAK' | 'WEAK_AVERAGE' | 'AVERAGE' | 'AVERAGE_GOOD' | 'GOOD' | 'ALL';
export type TicketSessionStatus = 'OPEN' | 'FULL' | 'CANCELLED';
export type TicketStatus = 'UNUSED' | 'USED' | 'REFUNDED';

export interface TicketSession {
  id: string;
  venueId: string;
  venueName: string;
  venueAddress?: string;
  venueLocation?: string;
  coverImage?: string;
  latitude?: number;
  longitude?: number;
  sportName?: string;
  courtId: string;
  courtName: string;
  playDate: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  pricePerTicket: number;
  maxSlots: number;
  bookedSlots: number;
  sportLevel: SportLevel;
  status: TicketSessionStatus;
}

export interface UserTicket {
  ticketId: string;
  sessionId: string;
  venueId: string;
  venueName: string;
  venueAddress?: string;
  courtName: string;
  playDate: string;
  startTime: string;
  endTime: string;
  price: number;
  quantity?: number;
  totalPrice?: number;
  sportLevel: SportLevel;
  status: TicketStatus;
  qrCodeToken: string;
  shortCode: string;
  createdAt: string;
}

export interface TicketFilterState {
  radiusKm?: number; // 2, 5, 10, etc.
  timeSlot?: 'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING';
  sportLevel?: SportLevel;
  keyword?: string;
}
