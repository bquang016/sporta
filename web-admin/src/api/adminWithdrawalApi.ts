const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const BASE_URL = `http://${host}:8387/api/v1`;

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response, defaultError: string) => {
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

export interface WithdrawalResponse {
  id: string;
  ownerId: string;
  ownerName: string;
  amount: number;
  formattedAmount: string;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  adminNote?: string;
  processedAt?: string;
  createdAt: string;
  transferProofUrl?: string;
}

export const getWithdrawals = async (page = 0, size = 20, status?: string): Promise<WithdrawalResponse[]> => {
  let url = `${BASE_URL}/admin/withdrawals?page=${page}&size=${size}`;
  if (status) url += `&status=${status}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(res, 'Không thể lấy danh sách rút tiền');
};

export const approveWithdrawal = async (id: string, note?: string, transferProofUrl?: string): Promise<WithdrawalResponse> => {
  const res = await fetch(`${BASE_URL}/admin/withdrawals/${id}/approve`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ note, transferProofUrl }),
  });
  return handleResponse(res, 'Lỗi khi duyệt rút tiền');
};

export const rejectWithdrawal = async (id: string, note: string): Promise<WithdrawalResponse> => {
  const res = await fetch(`${BASE_URL}/admin/withdrawals/${id}/reject`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ note }),
  });
  return handleResponse(res, 'Lỗi khi từ chối rút tiền');
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'general');

  // getHeaders() có Content-Type: application/json, nhưng FormData thì trình duyệt tự tính Content-Type
  const token = localStorage.getItem('accessToken');
  const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

  const res = await fetch(`${BASE_URL}/upload/image`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await handleResponse(res, 'Lỗi khi tải ảnh lên');
  return data.imageUrl;
};
