export interface VenueResponse {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  openingTime: string | null;
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
}
