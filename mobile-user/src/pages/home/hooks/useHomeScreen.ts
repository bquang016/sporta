import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useFacilities } from '../../../entities/facility';
import { clubStore } from '../../../entities/club';

export function useHomeScreen() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('Khách');
  const { facilities, loading: facilitiesLoading, error: facilitiesError } = useFacilities();

  const getApiUrl = () => {
    if (Platform.OS === 'web') return 'http://localhost:8387/api/v1';
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
    return 'http://localhost:8387/api/v1';
  };

  const checkAuth = async () => {
    try {
      let token = '';
      let name = '';
      if (Platform.OS === 'web') {
        token = localStorage.getItem('accessToken') || '';
        name = localStorage.getItem('userName') || '';
      } else {
        token = await SecureStore.getItemAsync('accessToken') || '';
        name = await SecureStore.getItemAsync('userName') || '';
      }

      if (token) {
        try {
          const response = await fetch(`${getApiUrl()}/auth/ping`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            if (errorData.message && errorData.message.includes('đã bị khóa')) {
              if (Platform.OS === 'web') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userName');
                localStorage.removeItem('userEmail');
                window.alert(errorData.message);
              } else {
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('userName');
                await SecureStore.deleteItemAsync('userEmail');
                Alert.alert('Tài khoản bị khóa', errorData.message);
              }
              setIsAuthenticated(false);
              setUserName('Khách');
              return;
            }
          }
          
          if (!response.ok) throw new Error('Token không hợp lệ');

          setIsAuthenticated(true);
          setUserName(name || 'Thành viên');
        } catch (e) {
          if (Platform.OS === 'web') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
          } else {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('userName');
            await SecureStore.deleteItemAsync('userEmail');
          }
          setIsAuthenticated(false);
          setUserName('Khách');
        }
      } else {
        setIsAuthenticated(false);
        setUserName('Khách');
      }
    } catch (e) {
      setIsAuthenticated(false);
      setUserName('Khách');
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [])
  );

  const handleFacilityPress = (id: string) => router.push(`/booking/${id}`);
  const handleLoginPress = () => router.push('/(auth)/login');
  const handleRegisterPress = () => router.push('/(auth)/register');

  const handleLogout = async () => {
    try {
      clubStore.reset();
      if (Platform.OS === 'web') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
      } else {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('userName');
        await SecureStore.deleteItemAsync('userEmail');
      }
      setIsAuthenticated(false);
      setUserName('Khách');
      if (Platform.OS !== 'web') {
        Alert.alert('Thành công', 'Đăng xuất thành công!');
      } else {
        window.alert('Đăng xuất thành công!');
      }
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  const handleAvatarPress = () => {
    if (isAuthenticated) {
      if (Platform.OS === 'web') {
        const confirmLogout = window.confirm(`Xin chào, ${userName}! Bạn có muốn đăng xuất tài khoản không?`);
        if (confirmLogout) handleLogout();
      } else {
        Alert.alert('Tài khoản', `Xin chào, ${userName}! Bạn có muốn đăng xuất không?`, [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng xuất', style: 'destructive', onPress: handleLogout }
        ]);
      }
    } else {
      if (Platform.OS === 'web') {
        if (window.confirm('Bạn chưa đăng nhập. Bạn có muốn đăng nhập không?')) handleLoginPress();
      } else {
        Alert.alert('Đăng nhập', 'Bạn chưa đăng nhập. Bạn có muốn đăng nhập ngay?', [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: handleLoginPress }
        ]);
      }
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return {
    router,
    isAuthenticated,
    userName,
    facilities,
    facilitiesLoading,
    facilitiesError,
    handleFacilityPress,
    handleLoginPress,
    handleRegisterPress,
    handleAvatarPress,
    getGreeting,
  };
}
