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
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  paymentStatus?: 'PAID' | 'UNPAID';
  paymentMethod: string;
  createdAt?: string;
  details?: BookingDetailItem[];
}

export const getMyBookingsApi = async (): Promise<BookingItem[]> => {
  return requestApi('/bookings/my', { method: 'GET' });
};
