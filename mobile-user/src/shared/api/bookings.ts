import { requestApi } from './apiClient';

export interface BookingDetailItem {
  id?: string;
  courtId?: string;
  courtName?: string;
  courtType?: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:mm:ss
  endTime: string;     // HH:mm:ss
  price: number;
}

export interface BookingItem {
  id: string;
  bookingCode: string;
  venueId?: string;
  venueName: string;
  venueAvatar?: string;
  venueLocation: string;
  venuePhone?: string;
  courtName?: string;
  courtType?: string;
  totalPrice: number;
  finalPrice: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  paymentStatus?: 'PAID' | 'UNPAID';
  paymentMethod: string;
  createdAt?: string;
  details?: BookingDetailItem[];
}

export const getMyBookingsApi = async (): Promise<BookingItem[]> => {
  return requestApi('/bookings/my', { method: 'GET' });
};

export const cancelBookingApi = async (id: string): Promise<any> => {
  return requestApi(`/bookings/${id}/cancel`, { method: 'POST' });
};

export const getEffectiveBookingStatus = (booking: BookingItem): 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED' => {
  if (booking.status === 'CANCELLED') return 'CANCELLED';
  if (booking.status === 'COMPLETED') return 'COMPLETED';

  const detail = booking.details?.[0];
  if (detail?.bookingDate && detail?.endTime) {
    try {
      const [year, month, day] = detail.bookingDate.split('-').map(Number);
      const [hours, minutes] = detail.endTime.split(':').map(Number);
      const endDateTime = new Date(year, month - 1, day, hours, minutes || 0);
      if (new Date() >= endDateTime) {
        return 'COMPLETED';
      }
    } catch {
      // Fallback
    }
  }

  return booking.status;
};


