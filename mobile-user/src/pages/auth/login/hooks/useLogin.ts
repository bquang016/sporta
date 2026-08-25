import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import { loginApi, googleLoginApi } from '../../../../shared/api/auth';
import { useAlert } from '../../../../shared/contexts/AlertContext';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  
  const { showAlert } = useAlert();
  const router = useRouter();

  // Google Sign-In setup
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '109569873589-sqselp48lq4blv5f8g4icka0747tpbnt.apps.googleusercontent.com',
    webClientId: '109569873589-sqselp48lq4blv5f8g4icka0747tpbnt.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleBackendGoogleLogin(id_token);
      }
    } else if (response?.type === 'error') {
      const errorMsg = response.error?.message || 'Không thể đăng nhập Google.';
      showAlert('Lỗi đăng nhập Google', errorMsg);
    }
  }, [response]);

  const handleBackendGoogleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const response = await googleLoginApi(idToken);
      if (response.isNewUser) {
        const dummyPassword = `google_${Math.random().toString(36).substring(2, 11)}`;
        router.push({
          pathname: '/(auth)/personal-info',
          params: {
            registrationToken: response.registrationToken,
            email: response.email,
            password: dummyPassword,
            fullName: response.fullName,
          },
        });
      } else {
        if (Platform.OS === 'web') {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('userEmail', response.email);
          localStorage.setItem('userName', response.fullName);
        } else {
          await SecureStore.setItemAsync('accessToken', response.accessToken);
          await SecureStore.setItemAsync('userEmail', response.email);
          await SecureStore.setItemAsync('userName', response.fullName);
        }
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error(error);
      showAlert('Lỗi xác thực', error.message || 'Xác thực Google thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    promptAsync();
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      showAlert('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!password) {
      showAlert('Lỗi', 'Vui lòng nhập mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginApi(trimmedEmail, password);
      let realFullName = trimmedEmail.split('@')[0];
      realFullName = realFullName.charAt(0).toUpperCase() + realFullName.slice(1);
      let realAvatar: string | null = null;

      if (Platform.OS === 'web') {
        localStorage.setItem('accessToken', response.accessToken);
      } else {
        await SecureStore.setItemAsync('accessToken', response.accessToken);
      }

      // Sync real profile from backend
      try {
        const { usersApi } = require('../../../../shared/api/users');
        const profile = await usersApi.getProfile();
        if (profile && profile.fullName) {
          realFullName = profile.fullName;
          realAvatar = profile.avatarUrl || null;
        }
      } catch (err) {
        console.log('Profile sync on login warning:', err);
      }
      
      if (Platform.OS === 'web') {
        localStorage.setItem('userEmail', trimmedEmail);
        localStorage.setItem('userName', realFullName);
        if (realAvatar) {
          localStorage.setItem('userAvatar', realAvatar);
        } else {
          localStorage.removeItem('userAvatar');
        }
      } else {
        await SecureStore.setItemAsync('userEmail', trimmedEmail);
        await SecureStore.setItemAsync('userName', realFullName);
        if (realAvatar) {
          await SecureStore.setItemAsync('userAvatar', realAvatar);
        } else {
          await SecureStore.deleteItemAsync('userAvatar');
        }
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      showAlert('Lỗi', error.message || 'Email hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    isFocusedEmail,
    setIsFocusedEmail,
    isFocusedPassword,
    setIsFocusedPassword,
    handleGoogleLogin,
    handleLogin,
    router,
  };
}
