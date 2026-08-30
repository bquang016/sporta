import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { NotificationApi } from '../api/notifications';
import { NOTIFICATION_KEYS } from '../../features/notifications/model/useNotifications';
import { useIsLoggedIn } from './useIsLoggedIn';

// Cấu hình cách hiển thị thông báo khi ứng dụng đang ở foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const cleanText = (str?: string) => {
  if (!str) return '';
  return str
    .replace(/[😀-🙏🌀-🗿🚀-🛿🇠-🇿☀-⛿✀-➿🤀-🧿🀘-🃵🈀-🉰⎈-⑓⃐-⃿️⚽🎟️💬📩💵📍⚠️]/gu, '')
    .trim();
};

export async function showLocalNotification(title: string, body: string, data?: any) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: cleanText(title),
        body: cleanText(body),
        data: data || {},
        sound: true,
      },
      trigger: null, // Phát thông báo nổ banner lập tức!
    });
  } catch (err) {
    console.warn('Failed to display local notification banner:', err);
  }
}

export function usePushNotifications() {
  const { isLoggedIn } = useIsLoggedIn();
  const router = useRouter();
  const queryClient = useQueryClient();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const tokenRef = useRef<string | null>(null);
  const lastNotificationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Đăng ký nhận push token & thiết lập Android notification channel
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        tokenRef.current = token;
      }
    });

    // Lắng nghe khi thông báo gửi tới lúc app đang chạy (Foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    });

    // Lắng nghe khi người dùng nhấn (tap) vào thông báo
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      handleNotificationNavigation(data);
    });

    // Tự động kiểm tra thông báo mới để nổ Banner ngay cả khi chạy npx expo start -c trên Expo Go
    const pollInterval = setInterval(async () => {
      try {
        const res = await NotificationApi.getNotifications(0, 1);
        if (res && res.content && res.content.length > 0) {
          const latest = res.content[0];
          if (lastNotificationIdRef.current === null) {
            lastNotificationIdRef.current = latest.id;
          } else if (latest.id > lastNotificationIdRef.current) {
            lastNotificationIdRef.current = latest.id;
            // Bắn banner thông báo nổi lên đỉnh màn hình
            await showLocalNotification(latest.title, latest.content, latest);
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
          }
        }
      } catch (err) {
        // Silent catch for poll error
      }
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isLoggedIn, queryClient]);

  const handleNotificationNavigation = (data: any) => {
    if (!data) return;

    // Chuyển hướng màn hình dựa theo payload 'type' hoặc 'referenceId'
    if (data.type === 'BOOKING' || data.type === 'TICKET_SESSION') {
      router.push('/(tabs)/history');
    } else if (data.type === 'POST' || data.type === 'COMMUNITY') {
      router.push('/(tabs)/social');
    } else {
      // Mặc định mở tab cá nhân hoặc trang chính
      router.push('/(tabs)');
    }
  };

  return {
    unregisterPushNotifications: async () => {
      if (tokenRef.current) {
        try {
          await NotificationApi.removeDeviceToken(tokenRef.current);
          tokenRef.current = null;
        } catch (error) {
          console.error('Failed to unregister push token:', error);
        }
      }
    },
  };
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Sporta Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1890FF',
    });
  }

  if (Device.isDevice || Platform.OS === 'android') {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted for push notifications!');
      return null;
    }

    try {
      if (Platform.OS === 'android') {
        const tokenResponse = await Notifications.getDevicePushTokenAsync();
        token = tokenResponse.data;
      } else {
        const expoToken = await Notifications.getExpoPushTokenAsync();
        token = expoToken.data;
      }
    } catch (e) {
      try {
        const fallbackToken = await Notifications.getDevicePushTokenAsync();
        token = fallbackToken.data;
      } catch (err) {
        try {
          const expoFallback = await Notifications.getExpoPushTokenAsync();
          token = expoFallback.data;
        } catch (finalErr) {
          console.warn('Could not retrieve push token:', finalErr);
        }
      }
    }

    if (token) {
      try {
        const deviceType = Platform.OS.toUpperCase();
        await NotificationApi.registerDeviceToken(token, deviceType);
      } catch (err) {
        console.error('Error registering device token with backend:', err);
      }
    }
  } else {
    console.log('Push notifications require a physical device for remote notifications');
  }

  return token;
}
