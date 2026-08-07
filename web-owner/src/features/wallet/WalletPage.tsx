import React, { useState } from 'react';
import { 
  useOwnerBalance, 
  useOwnerTransactions, 
  useWithdrawalHistory, 
  useBankAccounts,
  useVietQRBanks
} from './hooks/useWallet';
import { createWithdrawal, addBankAccount, deleteBankAccount } from './api/walletApi';
import { WalletBalanceCard } from './ui/WalletBalanceCard';
import { TransactionHistoryTable } from './ui/TransactionHistoryTable';
import { WithdrawalHistoryList } from './ui/WithdrawalHistoryList';
import { BankAccountsTab } from './ui/BankAccountsTab';
import { AddBankAccountModal } from './ui/AddBankAccountModal';
import { WithdrawalRequestModal } from './ui/WithdrawalRequestModal';
import { Wallet, ArrowRightLeft, Landmark } from 'lucide-react';
import { CreateBankAccountRequest, CreateWithdrawalRequest } from './model/wallet.types';

export const WalletPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'withdrawals' | 'bank_accounts'>('overview');
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const { balance, loading: loadingBalance, refetch: refetchBalance } = useOwnerBalance();
  const { transactions, loading: loadingTxns, refetch: refetchTxns } = useOwnerTransactions();
  const { withdrawals, loading: loadingWithdrawals, refetch: refetchWithdrawals } = useWithdrawalHistory();
  const { bankAccounts, loading: loadingBanks, refetch: refetchBankAccounts } = useBankAccounts();
  const { banks: vietqrBanks, loading: loadingVietQR } = useVietQRBanks();

  const handleAddBankAccount = async (data: CreateBankAccountRequest) => {
    await addBankAccount(data);
    refetchBankAccounts();
  };

  const handleDeleteBankAccount = async (id: string) => {
    await deleteBankAccount(id);
    refetchBankAccounts();
  };

  const handleCreateWithdrawal = async (data: CreateWithdrawalRequest) => {
    await createWithdrawal(data);
    refetchBalance();
    refetchTxns();
    refetchWithdrawals();
    setActiveTab('withdrawals');
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-headline-lg font-bold text-on-background mb-2">Ví của tôi</h1>
        <p className="text-body-md text-on-surface-variant">Quản lý doanh thu, lịch sử giao dịch và tài khoản ngân hàng của bạn.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar border-b border-outline-variant/30 mb-8 pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'overview' 
              ? 'border-brand-emerald text-brand-emerald' 
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Wallet size={18} />
          Tổng quan Ví
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'withdrawals' 
              ? 'border-brand-emerald text-brand-emerald' 
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <ArrowRightLeft size={18} />
          Lịch sử rút tiền
        </button>
        <button
          onClick={() => setActiveTab('bank_accounts')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'bank_accounts' 
              ? 'border-brand-emerald text-brand-emerald' 
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Landmark size={18} />
          Tài khoản nhận tiền
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <WalletBalanceCard 
              wallet={balance} 
              loading={loadingBalance} 
              onRequestWithdrawal={() => {
                if (bankAccounts.length === 0) {
                  // Navigate to bank accounts tab if none exist
                  setActiveTab('bank_accounts');
                  setTimeout(() => setIsAddBankModalOpen(true), 100);
                } else {
                  setIsWithdrawModalOpen(true);
                }
              }} 
            />
            
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-4">Lịch sử dòng tiền</h2>
              <TransactionHistoryTable transactions={transactions} loading={loadingTxns} />
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-on-surface mb-4">Yêu cầu rút tiền gần đây</h2>
            <WithdrawalHistoryList withdrawals={withdrawals} loading={loadingWithdrawals} />
          </div>
        )}

        {activeTab === 'bank_accounts' && (
          <BankAccountsTab 
            bankAccounts={bankAccounts} 
            loading={loadingBanks} 
            onAddAccount={() => setIsAddBankModalOpen(true)}
            onDeleteAccount={handleDeleteBankAccount}
          />
        )}
      </div>

      {/* Modals */}
      <AddBankAccountModal 
        isOpen={isAddBankModalOpen} 
        onClose={() => setIsAddBankModalOpen(false)} 
        onSubmit={handleAddBankAccount}
        banks={vietqrBanks}
        loadingBanks={loadingVietQR}
      />

      <WithdrawalRequestModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onSubmit={handleCreateWithdrawal}
        bankAccounts={bankAccounts}
        maxAmount={balance?.balance || 0}
      />
    </div>
  );
};
