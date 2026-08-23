import { requestApi } from './apiClient';

export type SupportTicketStatusType = 
  | 'NEW'
  | 'IN_PROGRESS'
  | 'PENDING_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED';

export interface SupportTicketItem {
  id: string;
  ticketCode: string;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone?: string;
  ticketType: string;
  bookingCode?: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: SupportTicketStatusType;
  adminNote?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface CreateSupportTicketPayload {
  ticketType: string;
  bookingCode?: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export const createSupportTicketApi = async (data: CreateSupportTicketPayload): Promise<SupportTicketItem> => {
  return requestApi('/support-tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getMySupportTicketsApi = async (): Promise<SupportTicketItem[]> => {
  return requestApi('/support-tickets/my', {
    method: 'GET',
  });
};

export const confirmResolvedTicketApi = async (id: string): Promise<SupportTicketItem> => {
  return requestApi(`/support-tickets/${id}/confirm-resolved`, {
    method: 'POST',
  });
};

export const reopenTicketApi = async (id: string, reason?: string): Promise<SupportTicketItem> => {
  return requestApi(`/support-tickets/${id}/reopen`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};

export const cancelTicketApi = async (id: string): Promise<SupportTicketItem> => {
  return requestApi(`/support-tickets/${id}/cancel`, {
    method: 'POST',
  });
};

export const replyTicketApi = async (
  id: string,
  payload: { message: string; imageUrl?: string }
): Promise<SupportTicketItem> => {
  return requestApi(`/support-tickets/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
