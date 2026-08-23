import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getBaseUrl } from './config';

export const BASE_URL = getBaseUrl();

export const clearCachedToken = () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('accessToken');
  } else {
    SecureStore.deleteItemAsync('accessToken').catch(() => {});
  }
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

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const apiFetch = async <T = unknown>(
  path: string,
  options: RequestInit = {},
  requiresAuth = true,
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = await getToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const response = await fetch(BASE_URL + path, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401 && token) {
      clearCachedToken();
      if (Platform.OS === 'web') {
        localStorage.removeItem('accessToken');
      } else {
        SecureStore.deleteItemAsync('accessToken').catch(() => {});
      }
      try {
        const { globalEvent } = require('../lib/eventEmitter');
        globalEvent.emit('auth:expired');
      } catch (e) {}
    }

    throw new ApiError(
      errorData.message || errorData.error || ('HTTP ' + response.status),
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text || text.trim() === '') {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
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
    headers['Authorization'] = 'Bearer ' + token;
  }

  const response = await fetch(BASE_URL + endpoint, {
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

    if (response.status === 401 && token) {
      clearCachedToken();
      if (Platform.OS === 'web') {
        localStorage.removeItem('accessToken');
      } else {
        SecureStore.deleteItemAsync('accessToken').catch(() => {});
      }
      try {
        const { globalEvent } = require('../lib/eventEmitter');
        globalEvent.emit('auth:expired');
      } catch (e) {}
    }

    throw new Error(parsedError.message || parsedError.error || 'Đã xảy ra lỗi hệ thống');
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
