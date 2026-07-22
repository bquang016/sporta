import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useFacilities } from '../../../entities/facility';
import { clubStore } from '../../../entities/club';
import { useAlert } from '../../../shared/contexts/AlertContext';

export function useHomeScreen() {
  const router = useRouter();
  const { showAlert, showConfirm } = useAlert();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('Khách');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
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
      let avatar = '';
      if (Platform.OS === 'web') {
        token = localStorage.getItem('accessToken') || '';
        name = localStorage.getItem('userName') || '';
        avatar = localStorage.getItem('userAvatar') || '';
      } else {
        token = await SecureStore.getItemAsync('accessToken') || '';
        name = await SecureStore.getItemAsync('userName') || '';
        avatar = await SecureStore.getItemAsync('userAvatar') || '';
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
                localStorage.removeItem('userAvatar');
              } else {
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('userName');
                await SecureStore.deleteItemAsync('userEmail');
                await SecureStore.deleteItemAsync('userAvatar');
              }
              showAlert('Tài khoản bị khóa', errorData.message);
              setIsAuthenticated(false);
              setUserName('Khách');
              setUserAvatar(null);
              return;
            }
          }
          
          if (!response.ok) throw new Error('Token không hợp lệ');

          setIsAuthenticated(true);
          setUserName(name || 'Thành viên');
          setUserAvatar(avatar || null);
        } catch (e) {
          if (Platform.OS === 'web') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userAvatar');
          } else {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('userName');
            await SecureStore.deleteItemAsync('userEmail');
            await SecureStore.deleteItemAsync('userAvatar');
          }
          setIsAuthenticated(false);
          setUserName('Khách');
          setUserAvatar(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserName('Khách');
        setUserAvatar(null);
      }
    } catch (e) {
      setIsAuthenticated(false);
      setUserName('Khách');
      setUserAvatar(null);
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
        localStorage.removeItem('userAvatar');
      } else {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('userName');
        await SecureStore.deleteItemAsync('userEmail');
        await SecureStore.deleteItemAsync('userAvatar');
      }
      setIsAuthenticated(false);
      setUserName('Khách');
      setUserAvatar(null);
      showAlert('Thành công', 'Đăng xuất thành công!');
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  const handleAvatarPress = () => {
    if (isAuthenticated) {
      router.push('/(tabs)/profile');
    } else {
      showConfirm(
        'Đăng nhập',
        'Bạn chưa đăng nhập. Bạn có muốn đăng nhập ngay?',
        handleLoginPress,
        undefined,
        'Đăng nhập',
        'Hủy'
      );
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
    userAvatar,
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
