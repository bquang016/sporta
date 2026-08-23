import { useState, useEffect, useCallback } from 'react';
import type { NotificationItem } from '../types/notification.types';
import { notificationApi } from '../services/notificationApi';

export function useOwnerNotifications(pollInterval = 15000) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const [listRes, countRes] = await Promise.all([
        notificationApi.getNotifications(0, 30),
        notificationApi.getUnreadCount(),
      ]);

      setNotifications(listRes.content || []);
      setUnreadCount(typeof countRes === 'number' ? countRes : 0);
    } catch (e) {
      console.error('Lỗi lấy thông báo chủ sân:', e);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, pollInterval);
    return () => clearInterval(timer);
  }, [fetchNotifications, pollInterval]);

  const markAsRead = async (id: number) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(item => (item.id === id ? { ...item, isRead: true, read: true } : item))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      await notificationApi.markAsRead(id);
    } catch (e) {
      console.error('Lỗi đánh dấu đã đọc:', e);
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(item => ({ ...item, isRead: true, read: true }))
      );
      setUnreadCount(0);

      await notificationApi.markAllAsRead();
    } catch (e) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', e);
      fetchNotifications();
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
