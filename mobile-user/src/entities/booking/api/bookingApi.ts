import { apiFetch } from '../../../shared/api/apiClient';
import { CreateBookingRequest, BookingResponse } from '../model/booking.types';

/** POST /api/v1/bookings — tạo đặt sân mới (cần JWT) */
export const createBooking = (data: CreateBookingRequest): Promise<BookingResponse> =>
  apiFetch<BookingResponse>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  }, true /* requiresAuth */);

/** GET /api/v1/bookings/{id} — chi tiết đơn đặt sân (cần JWT) */
export const fetchBookingById = (bookingId: string): Promise<BookingResponse> =>
  apiFetch<BookingResponse>(`/bookings/${bookingId}`, {}, true);

/** GET /api/v1/bookings/my — lịch sử đặt sân của user (cần JWT) */
export const fetchMyBookings = (): Promise<BookingResponse[]> =>
  apiFetch<BookingResponse[]>('/bookings/my', {}, true);
