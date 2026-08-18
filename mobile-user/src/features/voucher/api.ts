import { api } from '../../shared/api/apiClient';
import { Voucher, UserVoucher } from './types';

const BASE_URL = '/users/vouchers';

export const voucherApi = {
  getSystemVouchers: async () => {
    const response = await api.get<Voucher[]>(`/public/vouchers/banners`);
    return response.data;
  },

  getVenueVouchers: async (venueId: string) => {
    // Fallback since backend doesn't have it yet
    return [];
  },

  getMyVouchers: async (status?: 'ACTIVE' | 'USED' | 'EXPIRED') => {
    const response = await api.get<UserVoucher[]>(`/user/vouchers`, { params: { status } });
    return response.data;
  },

  collectVoucher: async (voucherId: string) => {
    const response = await api.post<UserVoucher>(`/user/vouchers/collect`, { voucherId });
    return response.data;
  },
};
