import type { TicketSessionResponse, TicketSessionRequest, TicketCheckInResponse, TestTicketResponse } from '../types/ticket.types';

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

export const ticketService = {
  async getTodaySessions(venueId: string): Promise<TicketSessionResponse[]> {
    const res = await fetch(`${BASE_URL}/owner/ticket-sessions/today?venueId=${venueId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể lấy danh sách trận xé vé hôm nay');
  },

  async createSession(data: TicketSessionRequest): Promise<TicketSessionResponse> {
    const res = await fetch(`${BASE_URL}/owner/ticket-sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Lỗi khi tạo trận xé vé mới');
  },

  async checkInTicket(token: string): Promise<TicketCheckInResponse> {
    const res = await fetch(`${BASE_URL}/owner/tickets/check-in`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ token }),
    });
    return handleResponse(res, 'Quét check-in vé thất bại');
  },

  async getTestTickets(sessionId: string): Promise<TestTicketResponse[]> {
    const res = await fetch(`${BASE_URL}/owner/ticket-sessions/${sessionId}/test-tickets`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res, 'Không thể lấy danh sách vé thử nghiệm');
  }
};
