import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { clubStore } from '../../../entities/club';

export function useProfile() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('Khách');
  const [userEmail, setUserEmail] = useState('');
  
  // State for logout modal
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const getApiUrl = () => {
    if (Platform.OS === 'web') return 'http://localhost:8387/api/v1';
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
    return 'http://localhost:8387/api/v1';
  };

  const loadUserData = async () => {
    try {
      let token = '';
      let name = '';
      let email = '';
      if (Platform.OS === 'web') {
        token = localStorage.getItem('accessToken') || '';
        name = localStorage.getItem('userName') || '';
        email = localStorage.getItem('userEmail') || '';
      } else {
        token = await SecureStore.getItemAsync('accessToken') || '';
        name = await SecureStore.getItemAsync('userName') || '';
        email = await SecureStore.getItemAsync('userEmail') || '';
      }

      if (token) {
        setIsAuthenticated(true);
        setUserName(name || 'Thành viên');
        setUserEmail(email || 'Chưa cập nhật email');
      } else {
        setIsAuthenticated(false);
        setUserName('Khách');
        setUserEmail('');
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

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
      setUserName('Khách');
      setUserEmail('');
      router.replace('/(auth)/login');
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  return {
    isAuthenticated,
    userName,
    userEmail,
    isLogoutModalVisible,
    handleLoginPress,
    requestLogout,
    cancelLogout,
    confirmLogout,
  };
}
