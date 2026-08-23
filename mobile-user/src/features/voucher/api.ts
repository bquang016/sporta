import { apiFetch } from '../../shared/api/apiClient';
import { Voucher, UserVoucher } from './types';

export const voucherApi = {
  getSystemVouchers: async (): Promise<Voucher[]> => {
    try {
      const data = await apiFetch<Voucher[]>('/public/vouchers/banners');
      return data || [];
    } catch (e) {
      console.log('Error fetching system voucher banners:', e);
      return [];
    }
  },

  getExploreVouchers: async (scope?: 'SYSTEM' | 'VENUE'): Promise<Voucher[]> => {
    try {
      const query = scope ? `?scope=${scope}` : '';
      const data = await apiFetch<Voucher[]>(`/public/vouchers/explore${query}`);
      return data || [];
    } catch (e) {
      console.log('Error fetching explore vouchers:', e);
      return [];
    }
  },

  getVenueVouchers: async (_venueId: string): Promise<Voucher[]> => {
    return [];
  },

  getMyVouchers: async (status?: 'ACTIVE' | 'USED' | 'EXPIRED'): Promise<UserVoucher[]> => {
    try {
      const query = status ? `?status=${status}` : '';
      const data = await apiFetch<UserVoucher[]>(`/user/vouchers${query}`, {}, true);
      return data || [];
    } catch (e) {
      console.log('Error fetching user vouchers:', e);
      return [];
    }
  },

  collectVoucher: async (voucherId: string): Promise<UserVoucher> => {
    return apiFetch<UserVoucher>('/user/vouchers/collect', {
      method: 'POST',
      body: JSON.stringify({ voucherId }),
    }, true);
  },

  collectVoucherByCode: async (code: string): Promise<UserVoucher> => {
    return apiFetch<UserVoucher>('/user/vouchers/collect-by-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }, true);
  },
};
