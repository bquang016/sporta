import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { NotificationApi } from '../api/notifications';
import { usersApi } from '../api/users';
import { NOTIFICATION_KEYS } from '../../features/notifications/model/useNotifications';
import { useIsLoggedIn } from './useIsLoggedIn';

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// On Android Expo Go (SDK 53+), importing expo-notifications crashes at module load due to side effects
const isExpoGoAndroid = isExpoGo && Platform.OS === 'android';

let Notifications: typeof import('expo-notifications') | null = null;
if (!isExpoGoAndroid) {
  try {
    Notifications = require('expo-notifications');
    Notifications?.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.warn('[PushNotifications] Failed to load expo-notifications:', e);
  }
}

const cleanText = (str?: string) => {
  if (!str) return '';
  return str
    .replace(/[😀-🙏🌀-🗿🚀-🛿🇠-🇿☀-⛿✀-➿🤀-🧿🀘-🃵🈀-🉰⎈-⑓⃐-⃿️⚽🎟️💬📩💵📍⚠️]/gu, '')
    .trim();
};

export async function showLocalNotification(title: string, body: string, data?: any) {
  if (!Notifications) {
    return;
  }
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
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const tokenRef = useRef<string | null>(null);
  const lastNotificationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    if (Notifications) {
      // Đăng ký nhận push token & thiết lập Android notification channel
      registerForPushNotificationsAsync()
        .then((token) => {
          if (token) {
            tokenRef.current = token;
          }
        })
        .catch((err) => {
          console.warn('[PushNotifications] Registration error:', err);
        });

      // Lắng nghe khi thông báo gửi tới lúc app đang chạy (Foreground)
      try {
        notificationListener.current = Notifications.addNotificationReceivedListener(() => {
          queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
        });
      } catch (e) {
        console.warn('[PushNotifications] addNotificationReceivedListener error:', e);
      }

      // Lắng nghe khi người dùng nhấn (tap) vào thông báo
      try {
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          handleNotificationNavigation(data);
        });
      } catch (e) {
        console.warn('[PushNotifications] addNotificationResponseReceivedListener error:', e);
      }
    }

    // Tự động kiểm tra thông báo mới để nổ Banner ngay cả khi chạy trên Expo Go
    const pollInterval = setInterval(async () => {
      try {
        const res = await NotificationApi.getNotifications(0, 1);
        if (res && res.content && res.content.length > 0) {
          const latest = res.content[0];
          if (lastNotificationIdRef.current === null) {
            lastNotificationIdRef.current = latest.id;
          } else if (latest.id > lastNotificationIdRef.current) {
            lastNotificationIdRef.current = latest.id;

            // Lấy profile để check cài đặt thông báo của user
            let shouldShow = true;
            try {
              const profile = await usersApi.getProfile();
              if (profile) {
                const isBooking = latest.type?.includes('BOOKING');
                const isMatchmake = latest.type?.includes('CLUB') || latest.type?.includes('MATCH');

                if (isBooking && profile.notifBooking === false) shouldShow = false;
                if (isMatchmake && profile.notifMatchmake === false) shouldShow = false;
              }
            } catch {
              console.warn('Could not fetch user profile to check notification flags');
            }

            if (shouldShow) {
              // Bắn banner thông báo nổi lên đỉnh màn hình
              await showLocalNotification(latest.title, latest.content, latest);
            }

            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
          }
        }
      } catch {
        // Silent catch for poll error
      }
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      if (notificationListener.current) {
        try {
          notificationListener.current.remove();
        } catch {}
      }
      if (responseListener.current) {
        try {
          responseListener.current.remove();
        } catch {}
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
  if (!Notifications || isExpoGo) {
    return null;
  }

  let token: string | null = null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Sporta Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1890FF',
      });
    }

    if (Device.isDevice) {
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
  } catch (error) {
    console.warn('[PushNotifications] Failed to complete push notification setup:', error);
  }

  return token;
}
