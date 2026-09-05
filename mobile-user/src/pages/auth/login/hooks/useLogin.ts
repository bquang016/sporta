import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import { loginApi, googleLoginApi } from '../../../../shared/api/auth';
import { useAlert } from '../../../../shared/contexts/AlertContext';
import { saveUserSession } from '../../../../shared/lib/userSession';

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
      const idToken = response.params?.id_token || (response as any).authentication?.idToken;
      if (idToken) {
        handleBackendGoogleLogin(idToken);
      }
    } else if (response?.type === 'error') {
      const errorMsg = (response?.error as any)?.message || 'Không thể đăng nhập Google.';
      showAlert('Lỗi đăng nhập Google', errorMsg);
    }
  }, [response]);

  const handleBackendGoogleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const res = await googleLoginApi(idToken);
      if (res.isNewUser) {
        router.push({
          pathname: '/(auth)/personal-info',
          params: {
            registrationToken: res.registrationToken,
            email: res.email,
            fullName: res.fullName,
            avatarUrl: res.avatarUrl,
          },
        });
      } else {
        let realFullName = res.fullName;
        let realAvatar: string | null = res.avatarUrl || null;
        try {
          const { usersApi } = require('../../../../shared/api/users');
          const profile = await usersApi.getProfile();
          if (profile && profile.fullName) {
            realFullName = profile.fullName;
            realAvatar = profile.avatarUrl || null;
          }
        } catch (profileErr) {
          console.log('Profile sync on Google Login warning:', profileErr);
        }

        await saveUserSession({
          accessToken: res.accessToken,
          userEmail: res.email,
          userName: realFullName,
          userAvatar: realAvatar,
        });

        if (res.mustChangePassword) {
          router.replace('/(auth)/set-password');
        } else {
          router.replace('/(tabs)');
        }
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
      
      await saveUserSession({
        accessToken: response.accessToken,
        userEmail: trimmedEmail,
        userName: realFullName,
        userAvatar: realAvatar,
      });

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
