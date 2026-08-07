import { useState, useEffect, useCallback } from 'react';
import { 
  getOwnerBalance, 
  getOwnerTransactions, 
  createWithdrawal, 
  getMyWithdrawals,
  getBankAccounts,
  addBankAccount,
  deleteBankAccount
} from '../api/walletApi';
import { fetchVietQRBanks } from '../api/vietqrApi';
import { 
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

  const fetchTransactions = useCallback(async (page = 0, size = 20) => {
    try {
      setLoading(true);
      const data = await getOwnerTransactions(page, size);
      setTransactions(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi tải lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
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
