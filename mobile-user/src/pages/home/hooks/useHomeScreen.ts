import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { useFacilities } from '../../../entities/facility';
import { useTicketSessions } from '../../../entities/ticket/model/useTicketSessions';
import { clubStore } from '../../../entities/club';
import { useAlert } from '../../../shared/contexts/AlertContext';
import { getBaseUrl } from '../../../shared/api/config';

export function useHomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useAlert();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('Khách');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    facilities,
    loading: facilitiesLoading,
    error: facilitiesError,
    refetch: refetchFacilities,
  } = useFacilities();

  const {
    sessions: ticketSessions,
    loading: ticketSessionsLoading,
    error: ticketSessionsError,
    refetch: refetchTicketSessions,
  } = useTicketSessions();

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
        token = (await SecureStore.getItemAsync('accessToken')) || '';
        name = (await SecureStore.getItemAsync('userName')) || '';
        avatar = (await SecureStore.getItemAsync('userAvatar')) || '';
      }

      if (token) {
        setIsAuthenticated(true);
        setUserName(name || 'Thành viên');
        setUserAvatar(avatar || null);

        try {
          const response = await fetch(`${getBaseUrl()}/auth/ping`, {
            headers: { Authorization: `Bearer ${token}` },
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

          if (response.status === 401) {
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
            return;
          }

          // Fetch full user profile to sync name and avatar with Profile Screen
          try {
            const { usersApi } = require('../../../shared/api/users');
            const profile = await usersApi.getProfile();
            if (profile && profile.fullName) {
              setUserName(profile.fullName);
              if (profile.avatarUrl) {
                setUserAvatar(profile.avatarUrl);
              }
              if (Platform.OS === 'web') {
                localStorage.setItem('userName', profile.fullName);
                if (profile.avatarUrl) localStorage.setItem('userAvatar', profile.avatarUrl);
              } else {
                await SecureStore.setItemAsync('userName', profile.fullName);
                if (profile.avatarUrl) await SecureStore.setItemAsync('userAvatar', profile.avatarUrl);
              }
            }
          } catch (profileErr) {
            console.log('Profile sync on Home warning:', profileErr);
          }
        } catch (e) {
          console.log('checkAuth ping network error, keeping local session');
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
      refetchTicketSessions();
    }, [refetchTicketSessions])
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.allSettled([
        checkAuth(),
        refetchFacilities(),
        refetchTicketSessions(),
        queryClient.invalidateQueries({ queryKey: ['systemVoucherBanners'] }),
        queryClient.invalidateQueries({ queryKey: ['wallet_balance'] }),
        queryClient.invalidateQueries({ queryKey: ['myVouchers'] }),
      ]);
    } catch (e) {
      console.log('Error refreshing home screen:', e);
    } finally {
      setRefreshing(false);
    }
  };

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
    ticketSessions,
    ticketSessionsLoading,
    ticketSessionsError,
    refreshing,
    onRefresh,
    handleFacilityPress,
    handleLoginPress,
    handleRegisterPress,
    handleAvatarPress,
    getGreeting,
  };
}
