import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { clubStore } from '../../../entities/club';
import { usersApi, UserProfileDto } from '../../../shared/api/users';

export function useProfile() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // State for logout modal
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      let token = '';
      if (Platform.OS === 'web') {
        token = localStorage.getItem('accessToken') || '';
      } else {
        token = await SecureStore.getItemAsync('accessToken') || '';
      }

      if (token) {
        setIsAuthenticated(true);
        // Fetch from API
        try {
          const profile = await usersApi.getProfile();
          setProfileData(profile);
        } catch (apiError) {
          console.error("Failed to fetch profile", apiError);
        }
      } else {
        setIsAuthenticated(false);
        setProfileData(null);
      }
    } catch (e) {
      setIsAuthenticated(false);
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const refreshProfile = async () => {
    await loadUserData();
  };

  const handleLoginPress = () => {
    router.push('/(auth)/login');
  };

  const requestLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const cancelLogout = () => {
    setIsLogoutModalVisible(false);
  };

  const confirmLogout = async () => {
    setIsLogoutModalVisible(false);
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
      setProfileData(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  return {
    isAuthenticated,
    profileData,
    userName: profileData?.fullName || '',
    userEmail: profileData?.email || '',
    userAvatar: profileData?.avatarUrl || null,
    isLoading,
    isLogoutModalVisible,
    refreshProfile,
    handleLoginPress,
    requestLogout,
    cancelLogout,
    confirmLogout,
  };
}
