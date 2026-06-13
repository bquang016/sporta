import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="booking/[facilityId]" options={{ headerShown: true, title: 'Chi tiết đặt sân' }} />
      <Stack.Screen name="profile/index" options={{ headerShown: true, title: 'Hồ sơ cá nhân' }} />
    </Stack>
  );
}
