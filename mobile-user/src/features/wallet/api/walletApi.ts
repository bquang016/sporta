import { apiFetch } from '../../../shared/api/apiClient';

export interface WalletBalanceResponse {
  balance: number;
  formattedBalance: string;
}

export interface TopUpRequest {
  amount: number;
}

export interface TopUpResponse {
  orderCode: number;
  checkoutUrl: string;
  qrCode: string;
  amount: number;
  message: string;
}

export interface WalletTransactionResponse {
  id: string;
  walletType: 'USER' | 'OWNER';
  transactionType: 'TOP_UP' | 'BOOKING_PAYMENT' | 'BOOKING_REFUND' | 'BOOKING_EARNING' | 'COMMISSION_DEDUCT' | 'WITHDRAWAL';
  amount?: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface PaymentTransactionResponse {
  id: string;
  orderCode: number;
  transactionType: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
}

export const getWalletBalance = (): Promise<WalletBalanceResponse> => {
  return apiFetch<WalletBalanceResponse>('/wallet/balance', {
    method: 'GET',
  }, true);
};

export const topUpWallet = (data: TopUpRequest): Promise<TopUpResponse> => {
  return apiFetch<TopUpResponse>('/wallet/top-up', {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
};

export const checkPaymentStatus = (orderCode: number): Promise<PaymentTransactionResponse> => {
  return apiFetch<PaymentTransactionResponse>(`/payments/${orderCode}`, {
    method: 'GET',
  }, true);
};

export const getWalletTransactions = (page = 0, size = 20): Promise<WalletTransactionResponse[]> => {
  return apiFetch<WalletTransactionResponse[]>(`/wallet/transactions?page=${page}&size=${size}`, {
    method: 'GET',
  }, true);
};

export const payBookingWithWallet = (data: any): Promise<any> => {
  return apiFetch<any>('/wallet/pay-booking', {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
};
