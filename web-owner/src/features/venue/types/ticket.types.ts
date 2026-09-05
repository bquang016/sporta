export type SportLevel = 'WEAK' | 'WEAK_AVERAGE' | 'AVERAGE' | 'AVERAGE_GOOD' | 'GOOD' | 'PRO' | 'ALL';

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
  hasHostTeam?: boolean;
  hostTeamName?: string;
  hostTeamLevel?: SportLevel;
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
  hasHostTeam?: boolean;
  hostTeamName?: string;
  hostTeamLevel?: SportLevel;
}

export interface TicketCheckInResponse {
  ticketId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAvatar?: string;
  venueName?: string;
  courtName: string;
  shortCode?: string;
  startTime: string;
  endTime: string;
  playDate: string;
  checkInTime?: string;
  sportLevel: SportLevel;
  quantity?: number;
  status: 'USED';
}

export interface TestTicketResponse {
  ticketId: string;
  customerName: string;
  qrCodeToken: string;
  shortCode: string;
}
