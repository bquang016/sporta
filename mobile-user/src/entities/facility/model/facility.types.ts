// ─── Existing VenueResponse (for list) ───────────────────────────────────────

export interface VenueResponse {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  openingTime: string | null;   // "HH:mm:ss" from Java LocalTime
  closingTime: string | null;
  shiftDurationMinutes: number | null;
  coverImage: string | null;
  detailImages: string[];
  hasSurcharge: boolean;
  surchargeAmount: number | null;
  surchargeDescription: string | null;
  status: string;
  approvalStatus: string;
  hasPendingRevision: boolean;
  minPrice?: number;
  maxPrice?: number;
  sportName?: string | null;
  district?: string | null;
  // Điểm đánh giá (cache từ bảng venue_reviews)
  averageRating?: number;
  totalReviews?: number;
}

// ─── Recommended Venue (AI Matching) ──────────────────────────────────────────

export interface RecommendedVenue extends VenueResponse {
  matchScore: number; // 0 - 100
  recommendationReason: string;
  reasonType: 'SPORT' | 'DISTANCE' | 'PRICE' | 'POPULARITY' | 'HISTORY';
  distanceKm?: number | null;
  pastBookingCount?: number;
  availableSlotsCount?: number;
}

// ─── CourtPriceRule ───────────────────────────────────────────────────────────

export interface CourtPriceRule {
  id: string;
  courtId: string;
  ruleType: 'SHIFT' | 'DAY_OF_WEEK';
  startTime: string | null;       // "HH:mm:ss"
  endTime: string | null;
  customPrice: number | null;
  dayOfWeek: number | null;       // 1=Mon … 7=Sun
  percentageModifier: number | null;
  fixedModifier: number | null;
}

// ─── Court (public) ───────────────────────────────────────────────────────────

export interface Court {
  id: string;
  name: string;
  price: number;
  status: string;
  priceRules: CourtPriceRule[];
}

// ─── VenueDetail (with courts) ────────────────────────────────────────────────

export interface VenueDetail extends VenueResponse {
  ownerPhone: string | null;
  courts: Court[];
}

// ─── SlotInfo (schedule grid cell) ───────────────────────────────────────────

export interface SlotInfo {
  courtId: string;
  courtName: string;
  time: string;                   // "HH:mm"
  status: 'available' | 'booked' | 'locked' | 'matchmaking' | 'pending';
  price: number;
  isOwnerSplit?: boolean;
  ticketSessionId?: string;
  bookedSlots?: number;
  maxSlots?: number;
  sportLevel?: string;
  pricePerTicket?: number;
  customerName?: string;
}
