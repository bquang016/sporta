import { Platform } from 'react-native';

const BASE_URL = `${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.13:8386/api/v1'}/auth`;

export const loginApi = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to login');
  }

  return response.json();
};

export const sendOtp = async (email: string) => {
  const response = await fetch(`${BASE_URL}/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to send OTP');
  }

  return response.json();
};

export const verifyOtp = async (email: string, otp: string) => {
  const response = await fetch(`${BASE_URL}/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to verify OTP');
  }

  return response.json();
};

export const registerUser = async (data: any) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to register user');
  }

  return response.json();
};
