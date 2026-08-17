import type { 
  OwnerWalletResponse, 
  WalletTransactionResponse, 
  WithdrawalResponse, 
  CreateWithdrawalRequest,
  BankAccountResponse,
  CreateBankAccountRequest
} from '../model/wallet.types';

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

export const getOwnerBalance = async (): Promise<OwnerWalletResponse> => {
  const res = await fetch(`${BASE_URL}/owner/wallet/balance`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(res, 'Không thể lấy thông tin ví');
};

export const getOwnerTransactions = async (page = 0, size = 20): Promise<WalletTransactionResponse[]> => {
  const res = await fetch(`${BASE_URL}/owner/wallet/transactions?page=${page}&size=${size}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(res, 'Không thể lấy lịch sử giao dịch');
};

export const createWithdrawal = async (request: CreateWithdrawalRequest): Promise<WithdrawalResponse> => {
  const res = await fetch(`${BASE_URL}/owner/wallet/withdraw`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(request),
  });
  return handleResponse(res, 'Lỗi khi tạo yêu cầu rút tiền');
};

export const getMyWithdrawals = async (page = 0, size = 20): Promise<WithdrawalResponse[]> => {
  const res = await fetch(`${BASE_URL}/owner/wallet/withdrawals?page=${page}&size=${size}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(res, 'Không thể lấy lịch sử rút tiền');
};

export const getBankAccounts = async (): Promise<BankAccountResponse[]> => {
  const res = await fetch(`${BASE_URL}/owner/wallet/bank-accounts`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(res, 'Không thể lấy danh sách tài khoản ngân hàng');
};

export const addBankAccount = async (request: CreateBankAccountRequest): Promise<BankAccountResponse> => {
  const res = await fetch(`${BASE_URL}/owner/wallet/bank-accounts`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(request),
  });
  return handleResponse(res, 'Lỗi khi thêm tài khoản ngân hàng');
};

export const deleteBankAccount = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/owner/wallet/bank-accounts/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: null }));
    throw new Error(err.message || 'Lỗi khi xóa tài khoản ngân hàng');
  }
};

export const setDefaultBankAccount = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE_URL}/owner/wallet/bank-accounts/${id}/default`, {
    method: 'PUT',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: null }));
    throw new Error(err.message || 'Lỗi khi thiết lập tài khoản mặc định');
  }
};
