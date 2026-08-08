// ─── Request ──────────────────────────────────────────────────────────────────

export interface BookingSlotRequest {
  courtId: string;
  bookingDate: string;    // "YYYY-MM-DD"
  startTime: string;      // "HH:mm:ss"
  endTime: string;        // "HH:mm:ss"
}

export interface CreateBookingRequest {
  slots: BookingSlotRequest[];
  paymentMethod: string;  // "momo" | "vnpay" | "card" | "bank"
}

// ─── Response ─────────────────────────────────────────────────────────────────

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface BookingResponse {
  id: string;
  bookingCode: string;    // "SP-A3K9-X2"

  courtId?: string;
  courtName: string;
  courtType?: string;
  venueId?: string;
  venueName: string;
  venueLocation: string;
  venuePhone?: string | null;

  totalPrice: number;
  discountAmount?: number;
  finalPrice: number;
  
  details: BookingDetailResponse[];
  
  paymentMethod: string;
  paymentStatus?: string;
  status: BookingStatus;

  playerName?: string;
  playerEmail?: string;
  createdAt: string;
}

// ─── UI Selection type (used in BookingDetailScreen) ─────────────────────────

export interface SelectedSlot {
  courtId: string;
  courtName: string;
  time: string;      // "HH:mm"
  price: number;
}

export interface BookingDetailResponse {
  id?: string;
  courtId?: string;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  price: number;
}
