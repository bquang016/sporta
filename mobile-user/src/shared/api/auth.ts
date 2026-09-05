import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getBaseUrl } from './config';

export const loginApi = async (email: string, password: string) => {
  const response = await fetch(`${getBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Email hoặc mật khẩu không đúng');
  }

  return response.json();
};

export const sendOtp = async (email: string) => {
  const response = await fetch(`${getBaseUrl()}/auth/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gửi mã OTP thất bại');
  }

  return response.json();
};

export const verifyOtp = async (email: string, otp: string) => {
  const response = await fetch(`${getBaseUrl()}/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Mã OTP không hợp lệ');
  }

  return response.json();
};

export const registerUser = async (data: any) => {
  const response = await fetch(`${getBaseUrl()}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Đăng ký tài khoản thất bại');
  }

  return response.json();
};

export const googleLoginApi = async (idToken: string) => {
  const response = await fetch(`${getBaseUrl()}/auth/google-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Xác thực Google thất bại');
  }

  return response.json();
};

const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('accessToken');
    }
    return await SecureStore.getItemAsync('accessToken');
  } catch {
    return null;
  }
};

export const changePasswordApi = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
  const token = await getToken();
  const response = await fetch(`${getBaseUrl()}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      confirmPassword,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Đổi mật khẩu thất bại');
  }

  return response.json();
};

export const forgotPasswordSendOtpApi = async (email: string) => {
  const response = await fetch(`${getBaseUrl()}/auth/forgot-password/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gửi mã OTP thất bại');
  }

  return response.json();
};

export const forgotPasswordVerifyOtpApi = async (email: string, otp: string) => {
  const response = await fetch(`${getBaseUrl()}/auth/forgot-password/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Mã OTP không hợp lệ');
  }

  return response.json();
};

export const resetPasswordApi = async (resetToken: string, newPassword: string, confirmPassword: string) => {
  const response = await fetch(`${getBaseUrl()}/auth/forgot-password/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resetToken, newPassword, confirmPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Đặt lại mật khẩu thất bại');
  }

  return response.json();
};
