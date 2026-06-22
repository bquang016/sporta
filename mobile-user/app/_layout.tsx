import React, { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { 
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold 
} from '@expo-google-fonts/hanken-grotesk';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'HankenGrotesk-Regular': HankenGrotesk_400Regular,
    'HankenGrotesk-Medium': HankenGrotesk_500Medium,
    'HankenGrotesk-SemiBold': HankenGrotesk_600SemiBold,
    'HankenGrotesk-Bold': HankenGrotesk_700Bold,
    'HankenGrotesk-ExtraBold': HankenGrotesk_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="search" />
      <Stack.Screen name="booking/[facilityId]" options={{ headerShown: true, title: 'Chi tiết đặt sân' }} />
      <Stack.Screen name="profile/index" options={{ headerShown: true, title: 'Hồ sơ cá nhân' }} />
    </Stack>
  );
}
