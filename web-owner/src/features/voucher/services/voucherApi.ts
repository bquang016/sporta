import type { Voucher, CreateVoucherRequest, UpdateVoucherRequest, VoucherPageResponse, VoucherStatus } from '../types/voucher.types';

const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const BASE_URL = `http://${host}:8387/api/owner/vouchers`;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // In a real app, you would add auth headers here
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export const voucherApi = {
  getVouchers: async (params: {
    status?: VoucherStatus;
    keyword?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }) => {
    const url = new URL(BASE_URL);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
    return fetchWithAuth(url.toString());
  },

  getVoucherById: async (id: string) => {
    return fetchWithAuth(`${BASE_URL}/${id}`);
  },

  createVoucher: async (data: CreateVoucherRequest) => {
    return fetchWithAuth(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateVoucher: async (id: string, data: UpdateVoucherRequest) => {
    return fetchWithAuth(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  disableVoucher: async (id: string) => {
    return fetchWithAuth(`${BASE_URL}/${id}/disable`, {
      method: 'PATCH',
    });
  },
};
