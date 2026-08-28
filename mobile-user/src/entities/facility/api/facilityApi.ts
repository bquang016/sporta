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

/**
 * @param date  Format: "YYYY-MM-DD"
 * @returns     Flat list of SlotInfo — one entry per (court × time) cell
 */
export const fetchVenueSchedule = (venueId: string, date: string): Promise<SlotInfo[]> =>
  apiFetch<SlotInfo[]>(`/public/venues/${venueId}/schedule?date=${date}`);

// ─── Recommendations (AI Matching) ──────────────────────────────────────────

export const fetchRecommendedVenues = (params?: {
  lat?: number;
  lng?: number;
  sportId?: number;
  limit?: number;
}): Promise<any[]> => {
  const query = new URLSearchParams();
  if (params?.lat != null) query.append('lat', String(params.lat));
  if (params?.lng != null) query.append('lng', String(params.lng));
  if (params?.sportId != null) query.append('sportId', String(params.sportId));
  if (params?.limit != null) query.append('limit', String(params.limit));
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiFetch<any[]>(`/public/venues/recommendations${queryString}`);
};

export const recordRecommendationClick = (venueId: string): Promise<void> =>
  apiFetch<void>(`/public/venues/recommendations/${venueId}/click`, { method: 'POST' });
