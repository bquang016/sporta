import { requestApi } from './apiClient';
import { PageResponse, NotificationVM } from './notifications';

export interface SocialNotificationVM extends NotificationVM {
  actorAvatar?: string;
  reactionType?: string;
}

export const SocialNotificationApi = {
  getSocialNotifications: async (page = 0, size = 20): Promise<PageResponse<SocialNotificationVM>> => {
    return requestApi(`/notifications/social?page=${page}&size=${size}`, {
      method: 'GET',
    });
  },

  getUnreadSocialCount: async (): Promise<number> => {
    try {
      const count = await requestApi('/notifications/social/unread-count', {
        method: 'GET',
      });
      return typeof count === 'number' ? count : 0;
    } catch {
      return 0;
    }
  },

  markAsRead: async (id: number): Promise<void> => {
    return requestApi(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async (): Promise<void> => {
    return requestApi('/notifications/social/read-all', {
      method: 'PUT',
    });
  },
};
