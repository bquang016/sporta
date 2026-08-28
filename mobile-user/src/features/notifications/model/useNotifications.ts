import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationApi, NotificationVM, PageResponse } from '../../../shared/api/notifications';

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  list: (page = 0, size = 20) => [...NOTIFICATION_KEYS.all, 'list', page, size] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, 'unread-count'] as const,
};

export function useNotifications(page = 0, size = 20, enabled = true) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(page, size),
    queryFn: () => NotificationApi.getNotifications(page, size),
    enabled,
    staleTime: 5000,
  });
}

export function useUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: () => NotificationApi.getUnreadCount(),
    enabled,
    refetchInterval: 10000, // Poll every 10s
    staleTime: 5000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => NotificationApi.markAsRead(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_KEYS.all });
      
      // Optimistic update list
      queryClient.setQueriesData<PageResponse<NotificationVM>>({ queryKey: NOTIFICATION_KEYS.all }, (oldData) => {
        if (!oldData || !oldData.content) return oldData;
        return {
          ...oldData,
          content: oldData.content.map((item) =>
            item.id === id ? { ...item, isRead: true } : item
          ),
        };
      });

      // Optimistic update unread count
      queryClient.setQueryData<number>(NOTIFICATION_KEYS.unreadCount(), (old) =>
        old && old > 0 ? old - 1 : 0
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_KEYS.all });

      // Optimistic update list
      queryClient.setQueriesData<PageResponse<NotificationVM>>({ queryKey: NOTIFICATION_KEYS.all }, (oldData) => {
        if (!oldData || !oldData.content) return oldData;
        return {
          ...oldData,
          content: oldData.content.map((item) => ({ ...item, isRead: true })),
        };
      });

      // Optimistic update unread count
      queryClient.setQueryData<number>(NOTIFICATION_KEYS.unreadCount(), () => 0);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
}
