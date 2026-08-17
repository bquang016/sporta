import { useState, useEffect, useCallback } from 'react';
import { 
  getOwnerBalance, 
  getOwnerTransactions, 
  createWithdrawal, 
  getMyWithdrawals,
  getBankAccounts,
  addBankAccount,
  deleteBankAccount,
  setDefaultBankAccount
} from '../api/walletApi';
import { fetchVietQRBanks } from '../api/vietqrApi';
import type { 
  OwnerWalletResponse, 
  WalletTransactionResponse, 
  WithdrawalResponse, 
  CreateWithdrawalRequest,
  BankAccountResponse,
  CreateBankAccountRequest,
  VietQRBank
} from '../model/wallet.types';

export const useOwnerBalance = () => {
  const [balance, setBalance] = useState<OwnerWalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOwnerBalance();
      setBalance(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải thông tin ví');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, error, refetch: fetchBalance };
};

export const useOwnerTransactions = () => {
  const [transactions, setTransactions] = useState<WalletTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const size = 6;

  const fetchTransactions = useCallback(async (p = page) => {
    try {
      setLoading(true);
      const data = await getOwnerTransactions(p, size);
      setTransactions(data);
      setHasMore(data.length === size);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchTransactions(page);
  }, [page, fetchTransactions]);

  const nextPage = () => {
    if (hasMore) setPage(p => p + 1);
  };

  const prevPage = () => {
    if (page > 0) setPage(p => p - 1);
  };

  return { transactions, loading, error, refetch: fetchTransactions, page, nextPage, prevPage, hasMore };
};

export const useWithdrawalHistory = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawals = useCallback(async (page = 0, size = 20) => {
    try {
      setLoading(true);
      const data = await getMyWithdrawals(page, size);
      setWithdrawals(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải lịch sử rút tiền');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  return { withdrawals, loading, error, refetch: fetchWithdrawals };
};

export const useBankAccounts = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBankAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBankAccounts();
      setBankAccounts(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải tài khoản ngân hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  return { bankAccounts, loading, error, refetch: fetchBankAccounts };
};

export const useVietQRBanks = () => {
  const [banks, setBanks] = useState<VietQRBank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      const data = await fetchVietQRBanks();
      setBanks(data);
      setLoading(false);
    };
    fetchBanks();
  }, []);

  return { banks, loading };
};
