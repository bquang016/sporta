export interface VenueImageDto {
  id: number;
  imageUrl: string;
}

export interface VenueResponse {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  province?: string;
  district?: string;
  ward?: string;
  addressDetail?: string;
  description: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
  // TRẠNG THÁI MỚI
  approvalStatus: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  hasPendingRevision?: boolean;

  latitude?: number;
  longitude?: number;
  openingTime?: string;
  closingTime?: string;
  sport?: {
    id: number;
    name: string;
  };
  coverImage?: string;
  images?: VenueImageDto[];
  shiftDurationMinutes: number;
  
  // TÍNH NĂNG MỚI: PHỤ THU
  hasSurcharge: boolean;
  surchargeAmount?: number;
  surchargeDescription?: string;

  minPrice?: number;
  maxPrice?: number;

  createdAt: string;
  updatedAt: string;
}

export interface VenueRequest {
  name: string;
  location: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  description: string;
  latitude?: number;
  longitude?: number;
  openingTime: string;
  closingTime: string;
  sportId: number;
  coverImage: string;
  detailImages: string[];
  shiftDurationMinutes: number;
  
  // TÍNH NĂNG MỚI: PHỤ THU
  hasSurcharge: boolean;
  surchargeAmount?: number;
  surchargeDescription?: string;
}

export interface CourtResponse {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  price: number;
  venueId: string;
  venueName: string;
  status: 'ACTIVE' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
}

export interface CourtRequest {
  name: string;
  price: number;
  venueId: string;
  status: 'ACTIVE' | 'MAINTENANCE';
}

export interface CourtPriceRuleRequest {
  ruleType: 'SHIFT' | 'DAY_OF_WEEK';
  startTime?: string;
  endTime?: string;
  customPrice?: number;
  dayOfWeek?: number;
  percentageModifier?: number;
  fixedModifier?: number;
}

export interface CourtPriceRuleResponse {
  id: string;
  courtId: string;
  ruleType: 'SHIFT' | 'DAY_OF_WEEK';
  startTime?: string;
  endTime?: string;
  customPrice?: number;
  dayOfWeek?: number;
  percentageModifier?: number;
  fixedModifier?: number;
}

export interface CourtDraftDto {
  id?: string;
  name: string;
  price: number;
  status?: 'ACTIVE' | 'MAINTENANCE';
  priceRules?: CourtPriceRuleRequest[];
}

export interface VenueDraftRequest {
  name?: string;
  location?: string;
  province?: string;
  district?: string;
  ward?: string;
  addressDetail?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  openingTime?: string;
  closingTime?: string;
  sportId?: number;
  coverImage?: string;
  detailImages?: string[];
  hasSurcharge?: boolean;
  surchargeAmount?: number;
  surchargeDescription?: string;
  courts?: CourtDraftDto[];
}

export interface CourtStatisticsDto {
  courtId: string;
  courtName: string;
  courtStatus: 'ACTIVE' | 'MAINTENANCE';
  price: number;
  totalSlots: number;
  bookedSlots: number;
  occupancyRate: number;
  revenue: number;
  bookingCount: number;
}

export interface VenueStatisticsResponse {
  venueId: string;
  venueName: string;
  fromDate: string;
  toDate: string;
  totalRevenue: number;
  totalBookings: number;
  totalVenueSlots: number;
  totalBookedSlots: number;
  averageOccupancy: number;
  activeCourtsCount: number;
  maintenanceCourtsCount: number;
  totalCourtsCount: number;
  courtStats: CourtStatisticsDto[];
}

export type DateRangePreset = 'today' | '7days' | '30days' | 'custom';