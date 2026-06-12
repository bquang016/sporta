import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2A5C43' }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Trang chủ', 
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="social" 
        options={{ 
          title: 'Cộng đồng', 
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-group" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="bookings" 
        options={{ 
          title: 'Lịch đặt', 
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="calendar-check" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="wallet" 
        options={{ 
          title: 'Ví Sporta', 
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="wallet" size={24} color={color} /> 
        }} 
      />
    </Tabs>
  );
}
