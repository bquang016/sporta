import { apiFetch } from '../../../shared/api/apiClient';
import { TicketSession, UserTicket, TicketFilterState, PurchaseTicketPayload } from '../model/ticket.types';

/** GET /api/v1/ticket-sessions — lấy danh sách ca xé vé khả dụng theo bộ lọc */
export const fetchAvailableSessions = (filters?: TicketFilterState): Promise<TicketSession[]> => {
  const params = new URLSearchParams();
  if (filters?.radiusKm) params.append('radiusKm', String(filters.radiusKm));
  if (filters?.timeSlot && filters.timeSlot !== 'ALL') params.append('timeSlot', filters.timeSlot);
  if (filters?.sportLevel && filters.sportLevel !== 'ALL') params.append('sportLevel', filters.sportLevel);
  if (filters?.keyword) params.append('keyword', filters.keyword);

  const queryString = params.toString();
  const endpoint = `/ticket-sessions${queryString ? `?${queryString}` : ''}`;
  return apiFetch<TicketSession[]>(endpoint, { method: 'GET' }, false);
};

/** GET /api/v1/ticket-sessions/{id} — chi tiết ca xé vé */
export const fetchSessionDetail = (sessionId: string): Promise<TicketSession> => {
  return apiFetch<TicketSession>(`/ticket-sessions/${sessionId}`, { method: 'GET' }, false);
};

/** POST /api/v1/ticket-sessions/{id}/purchase — mua vé xé (hỗ trợ mua số lượng, chọn paymentMethod, voucher) (cần JWT) */
export const purchaseTicket = (
  sessionId: string, 
  payloadOrQuantity: PurchaseTicketPayload | number = 1
): Promise<UserTicket> => {
  const payload: PurchaseTicketPayload = typeof payloadOrQuantity === 'number'
    ? { quantity: payloadOrQuantity, paymentMethod: 'payos' }
    : payloadOrQuantity;

  return apiFetch<UserTicket>(`/ticket-sessions/${sessionId}/purchase`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true);
};

/** GET /api/v1/user/tickets — lấy danh sách vé của tôi (cần JWT) */
export const fetchMyTickets = (): Promise<UserTicket[]> => {
  return apiFetch<UserTicket[]>('/user/tickets', { method: 'GET' }, true);
};

/** GET /api/v1/user/tickets/{id} — lấy chi tiết vé của tôi (cần JWT) */
export const fetchTicketDetail = (ticketId: string): Promise<UserTicket> => {
  return apiFetch<UserTicket>(`/user/tickets/${ticketId}`, { method: 'GET' }, true);
};
