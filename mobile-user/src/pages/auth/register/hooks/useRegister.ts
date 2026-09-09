import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { sendOtp, googleLoginApi, facebookLoginApi } from '../../../../shared/api/auth';
import { useAlert } from '../../../../shared/contexts/AlertContext';
import { saveUserSession } from '../../../../shared/lib/userSession';
import { promptFacebookAuth } from '../../../../shared/lib/facebookAuth';

WebBrowser.maybeCompleteAuthSession();

export function useRegister() {
  const { showAlert } = useAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [isFocusedConfirm, setIsFocusedConfirm] = useState(false);

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

  const handleBackendFacebookLogin = async (accessToken: string) => {
    setLoading(true);
    try {
      const res = await facebookLoginApi(accessToken);
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
          console.log('Profile sync on Facebook Login warning:', profileErr);
        }

        await saveUserSession({
          accessToken: res.accessToken,
          userEmail: res.email,
          userName: realFullName,
          userAvatar: realAvatar,
          userRole: res.role,
        });

        if (res.mustChangePassword) {
          router.replace('/(auth)/set-password');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      console.error(error);
      showAlert('Lỗi xác thực', error.message || 'Xác thực Facebook thất bại.');
    } finally {
      setLoading(false);
    }
  };

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
        let realAvatar: string | null = null;
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
          userRole: res.role,
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

  const handleGoogleRegister = () => {
    promptAsync();
  };

  const handleFacebookRegister = async () => {
    try {
      const accessToken = await promptFacebookAuth();
      if (accessToken) {
        await handleBackendFacebookLogin(accessToken);
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('hủy')) {
        console.error('[Facebook Auth Register] Error:', err);
        showAlert('Lỗi Facebook', err.message || 'Đăng ký Facebook thất bại.');
      }
    }
  };

  const handleRegister = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      showAlert('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!password || password.length < 6) {
      showAlert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(trimmedEmail);
      showAlert('Thành công', 'Đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư.', () => {
        router.push({
          pathname: '/(auth)/otp-verify',
          params: { email: trimmedEmail, password },
        });
      });
    } catch (error: any) {
      showAlert('Lỗi', error.message || 'Email này đã tồn tại hoặc có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    isFocusedEmail,
    setIsFocusedEmail,
    isFocusedPassword,
    setIsFocusedPassword,
    isFocusedConfirm,
    setIsFocusedConfirm,
    handleRegister,
    handleGoogleRegister,
    handleFacebookRegister,
    router,
  };
}
