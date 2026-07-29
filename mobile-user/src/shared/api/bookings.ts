import { requestApi } from './apiClient';
import { matchmakingApi } from './matchmaking';

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
    if (!Array.isArray(res)) return [];

    let usedBookingIds: string[] = [];
    try {
      usedBookingIds = await matchmakingApi.getUsedBookingIds();
    } catch (e) {
      console.log('Error fetching used booking IDs:', e);
    }

    const now = new Date();

    const mapped: BookingItem[] = res
      .map((b: any) => {
        const firstDetail = b.details && b.details.length > 0 ? b.details[0] : null;
        const courtName = firstDetail?.courtName || 'Sân tiêu chuẩn';
        const date = firstDetail?.bookingDate || (b.createdAt ? b.createdAt.split('T')[0] : '');
        const rawStart = firstDetail?.startTime || '18:00';
        const rawEnd = firstDetail?.endTime || '19:30';
        const startTime = rawStart.length >= 5 ? rawStart.substring(0, 5) : rawStart;
        const endTime = rawEnd.length >= 5 ? rawEnd.substring(0, 5) : rawEnd;

        return {
          id: String(b.id),
          venueName: b.venueName || 'Sân bóng',
          courtName,
          date,
          startTime,
          endTime,
          totalPrice: b.totalPrice || b.finalPrice || 0,
          status: b.status || 'CONFIRMED',
        };
      })
      .filter((item: BookingItem) => {
        // 1. Không hiển thị sân đã được dùng cho phòng ghép trận khác
        if (usedBookingIds.includes(item.id)) return false;

        // 2. Không hiển thị sân đã quá giờ đá (quá khứ)
        if (item.date && item.startTime) {
          try {
            const bookingStart = new Date(`${item.date}T${item.startTime}:00`);
            if (bookingStart <= now) return false;
          } catch {
            // ignore date parse errors
          }
        }
        return true;
      });

    return mapped;
  } catch (err) {
    console.log('Error fetching user bookings:', err);
    return [];
  }
};

export const getSuggestedVenuesApi = async (sportId?: number, lat?: number, lng?: number): Promise<VenueSuggestion[]> => {
  try {
    const res = await requestApi('/public/venues', { method: 'GET' });
    if (!Array.isArray(res)) return [];
    return res.map((v: any) => ({
      id: String(v.id),
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
