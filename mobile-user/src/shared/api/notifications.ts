import { requestApi } from './apiClient';

export interface NotificationVM {
  id: number;
  title: string;
  content: string;
  type: string;
  referenceId?: string | null;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const NotificationApi = {
  getNotifications: async (page = 0, size = 20): Promise<PageResponse<NotificationVM>> => {
    return requestApi('/notifications?page=' + page + '&size=' + size, {
      method: 'GET',
    });
  },

  getUnreadCount: async (): Promise<number> => {
    return requestApi('/notifications/unread-count', {
      method: 'GET',
    });
  },

  markAsRead: async (id: number): Promise<void> => {
    return requestApi('/notifications/' + id + '/read', {
      method: 'PUT',
    });
  },

  markAllAsRead: async (): Promise<void> => {
    return requestApi('/notifications/read-all', {
      method: 'PUT',
    });
  },

  registerDeviceToken: async (token: string, deviceType: string): Promise<void> => {
    return requestApi('/notifications/device-token', {
      method: 'POST',
      body: JSON.stringify({ token, deviceType }),
    });
  },

  removeDeviceToken: async (token: string): Promise<void> => {
    return requestApi('/notifications/device-token?token=' + encodeURIComponent(token), {
      method: 'DELETE',
    });
  },
};
