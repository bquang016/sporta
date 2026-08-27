export type PaymentMethod = 'MOMO' | 'VNPAY' | 'BANK_TRANSFER' | 'PAYOS' | 'WALLET' | 'DEV' | 'CASH' | string;
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'REFUNDING' | 'REFUNDED' | 'PENDING';

export interface AdminTransaction {
  id: string;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  facilityCluster: string;
  courtName: string;
  sportType: string;
  bookingDate: string;
  bookingSlot: string;
  amount: number;
  commissionAmount?: number;
  ownerAmount?: number;
  refundAmount?: number;
  refundRate?: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  createdAt: string;
  reason?: string;
}

export const getAdminTransactions = async (): Promise<AdminTransaction[]> => {
  const token = localStorage.getItem('accessToken');
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  const response = await fetch(`http://${host}:8387/api/v1/admin/transactions`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách giao dịch');
  }

  return response.json();
};
