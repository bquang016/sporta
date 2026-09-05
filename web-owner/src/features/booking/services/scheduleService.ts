import { API_BASE_URL } from '../../../services/apiConfig';

const BASE_URL = API_BASE_URL;

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response, defaultError: string) => {
  if (res.status === 403) {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    throw new Error('Phiên đăng nhập đã hết hạn');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: null }));
    throw new Error(err.message || defaultError);
  }
  return res.json();
};

export interface ApiSlotResponse {
  courtId: string;
  courtName: string;
  time: string;           // "HH:mm"
  status: 'available' | 'booked' | 'locked' | 'matchmaking';
  price: number;
  bookingId?: string;
  isManual?: boolean;
  ticketSessionId?: string;
  bookedSlots?: number;
  maxSlots?: number;
  sportLevel?: string;
  pricePerTicket?: number;
  customerName?: string;
  customerPhone?: string;
}

export const scheduleService = {
  async getSchedule(venueId: string, date: string): Promise<ApiSlotResponse[]> {
    const res = await fetch(`${BASE_URL}/public/venues/${venueId}/schedule?date=${date}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể tải lịch đặt sân của ngày này');
  },

  async createBooking(request: {
    slots: {
      courtId: string;
      bookingDate: string;
      startTime: string;
      endTime: string;
    }[];
    paymentMethod: string;
    status?: 'CONFIRMED' | 'PENDING';
    isManual?: boolean;
    customerName?: string;
    customerPhone?: string;
  }): Promise<any> {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });
    return handleResponse(res, 'Không thể đặt sân');
  },

  async cancelBooking(bookingId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể hủy đơn đặt sân');
  },

  async getBookingById(bookingId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể tải thông tin đơn đặt sân');
  },

  async cancelTicketSession(sessionId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/owner/ticket-sessions/${sessionId}/cancel`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể hủy ca xé vé');
  }
};
