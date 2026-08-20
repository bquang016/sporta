import type { Voucher, CreateVoucherRequest, UpdateVoucherRequest, VoucherPageResponse, VoucherStatus } from '../types/voucher.types';

const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const BASE_URL = `http://${host}:8387/api/admin/vouchers`;

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const handleResponse = async <T>(res: Response, defaultError: string): Promise<T> => {
  if (res.status === 403) {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    throw new Error('Phiên đăng nhập đã hết hạn');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: null }));
    throw new Error(err.message || defaultError);
  }
  return res.json();
};

export const voucherApi = {
  getVouchers: async (params: {
    status?: VoucherStatus;
    keyword?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }): Promise<VoucherPageResponse> => {
    const url = new URL(BASE_URL);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<VoucherPageResponse>(res, 'Không thể tải danh sách mã khuyến mãi');
  },

  getVoucherById: async (id: string): Promise<Voucher> => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<Voucher>(res, 'Không thể tải chi tiết mã khuyến mãi');
  },

  createVoucher: async (data: CreateVoucherRequest): Promise<Voucher> => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Voucher>(res, 'Không thể tạo mã khuyến mãi');
  },

  updateVoucher: async (id: string, data: UpdateVoucherRequest): Promise<Voucher> => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Voucher>(res, 'Không thể cập nhật mã khuyến mãi');
  },

  disableVoucher: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/${id}/disable`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (res.status === 403) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      throw new Error('Phiên đăng nhập đã hết hạn');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: null }));
      throw new Error(err.message || 'Không thể vô hiệu hóa mã khuyến mãi');
    }
  },
};
