import { apiFetch } from '../../../shared/api/apiClient';
import { VenueResponse, VenueDetail, SlotInfo } from '../model/facility.types';

// ─── List (existing) ──────────────────────────────────────────────────────────

export const fetchActiveFacilities = (): Promise<VenueResponse[]> =>
  apiFetch<VenueResponse[]>('/public/venues');

export interface VenueSearchCriteriaDTO {
  keyword?: string;
  sportIds?: number[];
  province?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  userLat?: number;
  userLng?: number;
  radiusKm?: number;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
}

export const searchVenues = (criteria: VenueSearchCriteriaDTO): Promise<VenueResponse[]> =>
  apiFetch<VenueResponse[]>('/public/venues/search', {
    method: 'POST',
    body: JSON.stringify(criteria),
  });

// ─── Detail (venue + courts + priceRules) ─────────────────────────────────────

export const fetchVenueDetail = (venueId: string): Promise<VenueDetail> =>
  apiFetch<VenueDetail>(`/public/venues/${venueId}`);

// ─── Schedule (slot grid for one date) ───────────────────────────────────────

/**
 * @param date  Format: "YYYY-MM-DD"
 * @returns     Flat list of SlotInfo — one entry per (court × time) cell
 */
export const fetchVenueSchedule = (venueId: string, date: string): Promise<SlotInfo[]> =>
  apiFetch<SlotInfo[]>(`/public/venues/${venueId}/schedule?date=${date}`);
