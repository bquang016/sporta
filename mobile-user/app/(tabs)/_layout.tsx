import React from 'react';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Trang chủ' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Lịch đặt' }} />
      <Tabs.Screen name="social" options={{ title: 'Cộng đồng' }} />
      <Tabs.Screen name="wallet" options={{ title: 'Ví cá nhân' }} />
    </Tabs>
  );
}
