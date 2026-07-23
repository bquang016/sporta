import { requestApi } from './apiClient';

export interface BookingItem {
  id: string;
  venueName: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
}

export interface VenueSuggestion {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  hourlyPrice: number;
  rating?: number;
}

export const getMyBookingsApi = async (): Promise<BookingItem[]> => {
  try {
    const res = await requestApi('/bookings/my', { method: 'GET' });
    return res;
  } catch (err) {
    console.log('Error fetching user bookings:', err);
    return [];
  }
};

export const getSuggestedVenuesApi = async (sportId?: number, lat?: number, lng?: number): Promise<VenueSuggestion[]> => {
  try {
    const res = await requestApi('/public/venues', { method: 'GET' });
    return res.map((v: any) => ({
      id: v.id,
      name: v.name,
      address: v.address || 'Hà Nội',
      latitude: v.latitude || 21.0368,
      longitude: v.longitude || 105.7905,
      hourlyPrice: v.minPrice || 300000,
      rating: v.rating || 4.8,
    }));
  } catch (err) {
    console.log('Error fetching suggested venues:', err);
    return [];
  }
};
