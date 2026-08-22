import type { NotificationItem, NotificationPageResponse } from '../types/notification.types';

const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const BASE_URL = `http://${host}:8387/api/v1/notifications`;

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    throw new Error('Phiên đăng nhập đã hết hạn');
  }
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }
  return response.json();
}

export const notificationApi = {
  getNotifications: async (page = 0, size = 20): Promise<NotificationPageResponse> => {
    return fetchWithAuth<NotificationPageResponse>(`${BASE_URL}?page=${page}&size=${size}`);
  },

  getUnreadCount: async (): Promise<number> => {
    return fetchWithAuth<number>(`${BASE_URL}/unread-count`);
  },

  markAsRead: async (id: number): Promise<void> => {
    await fetchWithAuth<void>(`${BASE_URL}/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async (): Promise<void> => {
    await fetchWithAuth<void>(`${BASE_URL}/read-all`, {
      method: 'PUT',
    });
  },
};
