import React, { useEffect, useState } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { 
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold 
} from '@expo-google-fonts/hanken-grotesk';

import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/shared/api/queryClient';
import { AlertProvider } from '../src/shared/contexts/AlertContext';
import { ChatbotFAB } from '../src/features/chatbot/ui/ChatbotFAB';
import { ChatbotBottomSheet } from '../src/features/chatbot/ui/ChatbotBottomSheet';
import { AuthRequiredModal } from '../src/shared/ui/AuthRequiredModal';
import { loadNativeUserSessionAsync } from '../src/shared/lib/userSession';

// Complete auth session if returning from web browser popup
WebBrowser.maybeCompleteAuthSession();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

import { usePushNotifications } from '../src/shared/hooks/usePushNotifications';

function PushNotificationManager() {
  usePushNotifications();
  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'HankenGrotesk-Regular': HankenGrotesk_400Regular,
    'HankenGrotesk-Medium': HankenGrotesk_500Medium,
    'HankenGrotesk-SemiBold': HankenGrotesk_600SemiBold,
    'HankenGrotesk-Bold': HankenGrotesk_700Bold,
    'HankenGrotesk-ExtraBold': HankenGrotesk_800ExtraBold,
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);

  const handleOpenChat = async () => {
    const session = await loadNativeUserSessionAsync();
    if (!session.isAuthenticated) {
      setAuthModalVisible(true);
      return;
    }
    setIsChatOpen(true);
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        input::-ms-reveal,
        input::-ms-clear {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <PushNotificationManager />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="search" />
          <Stack.Screen name="booking/[facilityId]" options={{ headerShown: false }} />
          <Stack.Screen name="profile/index" options={{ headerShown: true, title: 'Hồ sơ cá nhân' }} />
          <Stack.Screen name="my-clubs/index" options={{ headerShown: false }} />
          <Stack.Screen name="create-club/index" options={{ headerShown: false }} />
          <Stack.Screen name="club-detail-explore/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="club-detail-joined/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="nearby-venues/index" options={{ headerShown: false }} />
          <Stack.Screen name="recommended-venues/index" options={{ headerShown: false }} />
        </Stack>
        <ChatbotFAB onPress={handleOpenChat} />
        <ChatbotBottomSheet visible={isChatOpen} onClose={() => setIsChatOpen(false)} />
        <AuthRequiredModal
          visible={authModalVisible}
          onClose={() => setAuthModalVisible(false)}
          actionTitle="Đăng nhập để chat cùng AI"
          actionDescription="Trợ lý ảo Sporta AI hỗ trợ tìm sân, ghép kèo và giải đáp mọi thắc mắc dành riêng cho bạn."
          actionIcon="chatbubble-ellipses-outline"
        />
      </AlertProvider>
    </QueryClientProvider>
  );
}


