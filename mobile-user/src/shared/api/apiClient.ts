import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// ─── Base URL ─────────────────────────────────────────────────────────────────

const getBaseUrl = (): string => {
  if (Platform.OS === 'web') return 'http://localhost:8387/api/v1';
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  return 'http://192.168.1.11:8387/api/v1';
};

export const BASE_URL = getBaseUrl();

// ─── Token helper ─────────────────────────────────────────────────────────────

let cachedToken: string | null = null;

export const clearCachedToken = () => {
  cachedToken = null;
};

const getToken = async (): Promise<string | null> => {
  if (cachedToken) return cachedToken;
  try {
    if (Platform.OS === 'web') {
      cachedToken = localStorage.getItem('accessToken');
    } else {
      cachedToken = await SecureStore.getItemAsync('accessToken');
    }
    return cachedToken;
  } catch {
    return null;
  }
};

// ─── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

/**
 * Wrapper dùng chung cho mọi API call.
 * - Tự động gắn `Authorization: Bearer <token>` nếu có token.
 * - Ném `ApiError` có `.status` khi response không OK.
 */
export const apiFetch = async <T = unknown>(
  path: string,
  options: RequestInit = {},
  requiresAuth = false,
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Xử lý báo lỗi hết hạn đăng nhập
    if (response.status === 401) {
      clearCachedToken();
      if (Platform.OS === 'web') {
        localStorage.removeItem('accessToken');
      } else {
        SecureStore.deleteItemAsync('accessToken').catch(() => {});
      }
      const { globalEvent } = require('../lib/eventEmitter');
      globalEvent.emit('auth:expired');
    }

    throw new ApiError(
      errorData.message || errorData.error || `HTTP ${response.status}`,
      response.status,
    );
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};
