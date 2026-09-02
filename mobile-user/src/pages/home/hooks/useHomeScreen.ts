import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { useFacilities, Facility, RecommendedVenue } from '../../../entities/facility';
import { fetchRecommendedVenues } from '../../../entities/facility/api/facilityApi';
import { useTicketSessions } from '../../../entities/ticket/model/useTicketSessions';
import { clubStore } from '../../../entities/club';
import { useAlert } from '../../../shared/contexts/AlertContext';
import { getBaseUrl } from '../../../shared/api/config';
import {
  getCachedUserSession,
  loadNativeUserSessionAsync,
  saveUserSession,
  clearUserSession,
} from '../../../shared/lib/userSession';

export function useHomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useAlert();
  
  const initialSession = getCachedUserSession();
  const [isAuthenticated, setIsAuthenticated] = useState(initialSession.isAuthenticated);
  const [userName, setUserName] = useState(initialSession.userName || 'Khách');
  const [userAvatar, setUserAvatar] = useState<string | null>(initialSession.userAvatar);
  const [refreshing, setRefreshing] = useState(false);

  const [recommendedVenues, setRecommendedVenues] = useState<RecommendedVenue[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setRecommendedLoading(true);
      setRecommendedError(null);
      let lat = 21.0285;
      let lng = 105.8542;
      try {
        const Location = require('expo-location');
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (loc && loc.coords) {
            lat = loc.coords.latitude;
            lng = loc.coords.longitude;
          }
        }
      } catch (_) {}

      const data = await fetchRecommendedVenues({ lat, lng, limit: 6 });
      setRecommendedVenues(data || []);
    } catch (e: any) {
      console.log('Error fetching recommendations:', e);
      setRecommendedError(e.message || 'Lỗi tải gợi ý sân');
    } finally {
      setRecommendedLoading(false);
    }
  }, []);

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
      const session = await loadNativeUserSessionAsync();

      if (session.isAuthenticated && session.accessToken) {
        setIsAuthenticated(true);
        setUserName(session.userName || 'Thành viên');
        setUserAvatar(session.userAvatar || null);

        try {
          const response = await fetch(`${getBaseUrl()}/auth/ping`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          });

          if (response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            if (errorData.message && errorData.message.includes('đã bị khóa')) {
              await clearUserSession();
              showAlert('Tài khoản bị khóa', errorData.message);
              setIsAuthenticated(false);
              setUserName('Khách');
              setUserAvatar(null);
              return;
            }
          }

          if (response.status === 401) {
            await clearUserSession();
            setIsAuthenticated(false);
            setUserName('Khách');
            setUserAvatar(null);
            return;
          }

          // Fetch full user profile to sync name and avatar with Profile Screen
          try {
            const { usersApi } = require('../../../shared/api/users');
            const profile = await usersApi.getProfile();
            if (profile) {
              const freshName = profile.fullName || session.userName || 'Thành viên';
              const freshAvatar = profile.avatarUrl || null;
              
              setUserName(freshName);
              setUserAvatar(freshAvatar);
              
              await saveUserSession({
                userName: freshName,
                userAvatar: freshAvatar,
                userEmail: profile.email || session.userEmail,
              });
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
      fetchRecommendations();
    }, [refetchTicketSessions, fetchRecommendations])
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.allSettled([
        checkAuth(),
        refetchFacilities(),
        refetchTicketSessions(),
        fetchRecommendations(),
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

  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [selectedFacilityForModal, setSelectedFacilityForModal] = useState<Facility | null>(null);
  const [isVenueModalVisible, setIsVenueModalVisible] = useState(false);

  const handleFacilityPress = (id: string) => {
    const venueIdStr = String(id);
    const found = facilities.find(f => String(f.id) === venueIdStr) || null;
    setSelectedVenueId(venueIdStr);
    setSelectedFacilityForModal(found);
    setIsVenueModalVisible(true);
  };

  const handleCloseVenueModal = () => {
    setIsVenueModalVisible(false);
  };

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
    recommendedVenues,
    recommendedLoading,
    recommendedError,
    ticketSessions,
    ticketSessionsLoading,
    ticketSessionsError,
    refreshing,
    onRefresh,
    handleFacilityPress,
    selectedVenueId,
    selectedFacilityForModal,
    isVenueModalVisible,
    handleCloseVenueModal,
    handleLoginPress,
    handleRegisterPress,
    handleAvatarPress,
    getGreeting,
  };
}
