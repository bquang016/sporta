import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { clubStore } from '../../../entities/club';
import { usersApi, UserProfileDto } from '../../../shared/api/users';
import {
  getCachedUserSession,
  loadNativeUserSessionAsync,
  saveUserSession,
  clearUserSession,
} from '../../../shared/lib/userSession';

export function useProfile() {
  const router = useRouter();
  const initialSession = getCachedUserSession();
  
  const [isAuthenticated, setIsAuthenticated] = useState(initialSession.isAuthenticated);
  const [cachedName, setCachedName] = useState(initialSession.userName || '');
  const [cachedEmail, setCachedEmail] = useState(initialSession.userEmail || '');
  const [cachedAvatar, setCachedAvatar] = useState<string | null>(initialSession.userAvatar || null);
  const [profileData, setProfileData] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // State for logout modal
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const session = await loadNativeUserSessionAsync();

      if (session.isAuthenticated && session.accessToken) {
        setIsAuthenticated(true);
        if (session.userName) setCachedName(session.userName);
        if (session.userEmail) setCachedEmail(session.userEmail);
        if (session.userAvatar) setCachedAvatar(session.userAvatar);

        // Fetch fresh data from API
        try {
          const profile = await usersApi.getProfile();
          if (profile) {
            setProfileData(profile);
            const freshName = profile.fullName || session.userName;
            const freshEmail = profile.email || session.userEmail;
            const freshAvatar = profile.avatarUrl || null;
            
            if (freshName) setCachedName(freshName);
            if (freshEmail) setCachedEmail(freshEmail);
            setCachedAvatar(freshAvatar);

            await saveUserSession({
              userName: freshName,
              userEmail: freshEmail,
              userAvatar: freshAvatar,
            });
          }
        } catch (apiError: any) {
          console.error("Failed to fetch profile", apiError);
          if (apiError?.status === 401) {
            await clearUserSession();
            setIsAuthenticated(false);
            setProfileData(null);
          }
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
      await clearUserSession();
      setIsAuthenticated(false);
      setProfileData(null);
      setCachedAvatar(null);
      setCachedName('');
      setCachedEmail('');
      router.replace('/(auth)/login');
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  return {
    isAuthenticated,
    profileData,
    userName: profileData?.fullName || cachedName || '',
    userEmail: profileData?.email || cachedEmail || '',
    userAvatar: profileData?.avatarUrl || cachedAvatar || null,
    isLoading,
    isLogoutModalVisible,
    refreshProfile,
    handleLoginPress,
    requestLogout,
    cancelLogout,
    confirmLogout,
  };
}
