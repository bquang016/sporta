import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/shared/config/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  // Calculate dynamic bottom padding and height to prevent overlapping with iOS Home Indicator
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 12;
  const tabHeight = 60 + bottomPadding;

  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.onSurfaceVariant, // High contrast color for readability
        tabBarStyle: {
          backgroundColor: COLORS.surface, // Solid premium white background
          borderTopColor: 'rgba(0, 0, 0, 0.08)',
          borderTopWidth: 1,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 16,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          fontFamily: 'HankenGrotesk-SemiBold',
        }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="map" 
        options={{ 
          title: 'Bản đồ',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="map" size={24} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="social" 
        options={{ 
          title: 'Cộng đồng',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="groups" size={24} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="clubs" 
        options={{ 
          title: 'Câu lạc bộ',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="shield" size={24} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Cá nhân',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="bookings" 
        options={{ 
          href: null,
        }} 
      />
      <Tabs.Screen 
        name="wallet" 
        options={{ 
          href: null,
        }} 
      />
    </Tabs>
  );
}

