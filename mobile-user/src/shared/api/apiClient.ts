import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const getBaseUrl = () => {
  if (Platform.OS === 'web') return 'http://localhost:8387/api/v1';
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  // Fallback to local Spring Boot backend address
  return 'http://localhost:8387/api/v1';
};

const getToken = async (): Promise<string> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('accessToken') || '';
  }
  try {
    return (await SecureStore.getItemAsync('accessToken')) || '';
  } catch (error) {
    return '';
  }
};

export const requestApi = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${getBaseUrl()}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedError;
    try {
      parsedError = JSON.parse(errorText);
    } catch (e) {
      parsedError = { message: errorText };
    }
    throw new Error(parsedError.message || parsedError.error || 'Đã xảy ra lỗi hệ thống');
  }

  // Handle No Content (204)
  if (response.status === 204) {
    return null;
  }

  // Check if response has content before parsing JSON
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
