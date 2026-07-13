const BASE_URL = 'http://localhost:8387/api/v1';

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
  ticketSessionId?: string;
  bookedSlots?: number;
  maxSlots?: number;
  sportLevel?: string;
  pricePerTicket?: number;
  customerName?: string;
}

export const scheduleService = {
  async getSchedule(venueId: string, date: string): Promise<ApiSlotResponse[]> {
    const res = await fetch(`${BASE_URL}/public/venues/${venueId}/schedule?date=${date}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể tải lịch đặt sân của ngày này');
  }
};
