import { apiFetch } from '../../../shared/api/apiClient';
import { VenueResponse, VenueDetail, SlotInfo } from '../model/facility.types';

// ─── List (existing) ──────────────────────────────────────────────────────────

export const fetchActiveFacilities = (): Promise<VenueResponse[]> =>
  apiFetch<VenueResponse[]>('/public/venues');

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
