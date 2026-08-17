import type { VietQRBank } from '../model/wallet.types';

export const fetchVietQRBanks = async (): Promise<VietQRBank[]> => {
  try {
    const response = await fetch('https://api.vietqr.io/v2/banks');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.data) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching VietQR banks:', error);
    return [];
  }
};
