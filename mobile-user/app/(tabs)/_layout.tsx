import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../src/shared/config/theme';

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.outlineVariant,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderTopColor: 'rgba(0, 0, 0, 0.05)',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.03,
          shadowRadius: 12,
          height: 65,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Landing page',
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
          title: 'Hồ sơ cá nhân',
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
