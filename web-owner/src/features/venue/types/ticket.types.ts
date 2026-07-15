export type SportLevel = 'WEAK' | 'WEAK_AVERAGE' | 'AVERAGE' | 'AVERAGE_GOOD' | 'GOOD' | 'ALL';

export type TicketSessionStatus = 'OPEN' | 'FULL' | 'CANCELLED';

export interface TicketSessionResponse {
  id: string;
  venueId: string;
  venueName: string;
  courtId: string;
  courtName: string;
  playDate: string;
  startTime: string;
  endTime: string;
  pricePerTicket: number;
  maxSlots: number;
  bookedSlots: number;
  sportLevel: SportLevel;
  status: TicketSessionStatus;
}

export interface TicketSessionRequest {
  venueId: string;
  courtId: string;
  playDate: string;
  startTime: string;
  endTime: string;
  pricePerTicket: number;
  maxSlots: number;
  sportLevel: SportLevel;
}

export interface TicketCheckInResponse {
  ticketId: string;
  customerName: string;
  courtName: string;
  startTime: string;
  endTime: string;
  playDate: string;
  sportLevel: SportLevel;
  status: 'USED';
}

export interface TestTicketResponse {
  ticketId: string;
  customerName: string;
  qrCodeToken: string;
  shortCode: string;
}
