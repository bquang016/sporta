import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { getBaseUrl } from './config';

// ─── Base URL ─────────────────────────────────────────────────────────────────

export const BASE_URL = getBaseUrl();

// ─── Token helper ─────────────────────────────────────────────────────────────

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

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
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

// ─── Backward compatibility requestApi alias ───────────────────────────────────

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

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearCachedToken();
      try {
        const { globalEvent } = require('../lib/eventEmitter');
        globalEvent?.emit?.('auth:expired');
      } catch (e) {}
    }
    const errorText = await response.text();
    let parsedError;
    try {
      parsedError = JSON.parse(errorText);
    } catch (e) {
      parsedError = { message: errorText };
    }
    throw new Error(parsedError.message || parsedError.error || 'Đã xảy ra lỗi hệ thống');
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
// ─── Axios-compatible apiClient wrapper ──────────────────────────────────────
//
// matchmaking.ts and other files import { apiClient } and call apiClient.post(...)
// This wrapper bridges the fetch-based apiFetch to an axios-like interface so
// existing callers work without modification.
//
// Response shape mirrors axios: { data: T, status: number }
//

interface ApiResponse<T> {
  data: T;
  status: number;
}

const axiosLike = {
  get: async <T = any>(path: string, config?: { params?: Record<string, any>; requiresAuth?: boolean }): Promise<ApiResponse<T>> => {
    let url = path;
    if (config?.params) {
      const qs = new URLSearchParams(
        Object.entries(config.params).reduce<Record<string, string>>((acc, [k, v]) => {
          if (v !== undefined && v !== null) acc[k] = String(v);
          return acc;
        }, {})
      ).toString();
      if (qs) url = `${path}?${qs}`;
    }
    const data = await apiFetch<T>(url, { method: 'GET' }, config?.requiresAuth ?? true);
    return { data, status: 200 };
  },

  post: async <T = any>(path: string, body?: unknown, config?: { requiresAuth?: boolean }): Promise<ApiResponse<T>> => {
    const data = await apiFetch<T>(
      path,
      {
        method: 'POST',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      },
      config?.requiresAuth ?? true,
    );
    return { data, status: 200 };
  },

  put: async <T = any>(path: string, body?: unknown, config?: { requiresAuth?: boolean }): Promise<ApiResponse<T>> => {
    const data = await apiFetch<T>(
      path,
      {
        method: 'PUT',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      },
      config?.requiresAuth ?? true,
    );
    return { data, status: 200 };
  },

  patch: async <T = any>(path: string, body?: unknown, config?: { requiresAuth?: boolean }): Promise<ApiResponse<T>> => {
    const data = await apiFetch<T>(
      path,
      {
        method: 'PATCH',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      },
      config?.requiresAuth ?? true,
    );
    return { data, status: 200 };
  },

  delete: async <T = any>(path: string, config?: { requiresAuth?: boolean }): Promise<ApiResponse<T>> => {
    const data = await apiFetch<T>(path, { method: 'DELETE' }, config?.requiresAuth ?? true);
    return { data, status: 200 };
  },
};

export const apiClient = axiosLike;
