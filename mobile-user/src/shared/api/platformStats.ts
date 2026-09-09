import { apiFetch } from './apiClient';

export interface PlatformStatsDto {
  verifiedVenues: number;
  openMatchRooms: number;
  todayTickets: number;
  verifiedVenuesDisplay?: string;
  openMatchRoomsDisplay?: string;
  todayTicketsDisplay?: string;
}

export const getPlatformStatsApi = async (): Promise<PlatformStatsDto> => {
  return apiFetch<PlatformStatsDto>('/public/venues/stats', { method: 'GET' }, false);
};
