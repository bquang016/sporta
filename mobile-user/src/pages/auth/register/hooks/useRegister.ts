import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import { sendOtp, googleLoginApi } from '../../../../shared/api/auth';
import { useAlert } from '../../../../shared/contexts/AlertContext';

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
      const res = await googleLoginApi(idToken);
      if (res.isNewUser) {
        const dummyPassword = `google_${Math.random().toString(36).substring(2, 11)}`;
        router.push({
          pathname: '/(auth)/personal-info',
          params: {
            registrationToken: res.registrationToken,
            email: res.email,
            password: dummyPassword,
            fullName: res.fullName,
          },
        });
      } else {
        if (Platform.OS === 'web') {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('userEmail', res.email);
          localStorage.setItem('userName', res.fullName);
        } else {
          await SecureStore.setItemAsync('accessToken', res.accessToken);
          await SecureStore.setItemAsync('userEmail', res.email);
          await SecureStore.setItemAsync('userName', res.fullName);
        }
        showAlert('Thành công', res.message, () => router.replace('/(tabs)'));
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
      const res = await sendOtp(trimmedEmail);
      if (res.otp) {
        showAlert('Mã OTP', `Mã OTP của bạn là: ${res.otp}`, () => {
          router.push({
            pathname: '/(auth)/otp-verify',
            params: { email: trimmedEmail, password },
          });
        });
      } else {
        showAlert('Thành công', 'Đã gửi mã OTP đến email của bạn.', () => {
          router.push({
            pathname: '/(auth)/otp-verify',
            params: { email: trimmedEmail, password },
          });
        });
      }
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
    router,
  };
}
