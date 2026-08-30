import React, { useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { 
  useOwnerBalance, 
  useOwnerTransactions, 
  useWithdrawalHistory, 
  useBankAccounts,
  useVietQRBanks
} from './hooks/useWallet';
import { createWithdrawal, addBankAccount, deleteBankAccount, setDefaultBankAccount } from './api/walletApi';
import { WalletBalanceCard } from './ui/WalletBalanceCard';
import { TransactionHistoryTable } from './ui/TransactionHistoryTable';
import { WithdrawalHistoryList } from './ui/WithdrawalHistoryList';
import { BankAccountsTab } from './ui/BankAccountsTab';
import { AddBankAccountModal } from './ui/AddBankAccountModal';
import { WithdrawalRequestModal } from './ui/WithdrawalRequestModal';
import { MobileWalletPage } from './pages/MobileWalletPage';
import { ArrowRightLeft, Landmark, LayoutDashboard } from 'lucide-react';
import type { CreateBankAccountRequest, CreateWithdrawalRequest } from './model/wallet.types';

export const WalletPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'overview' | 'withdrawals' | 'bank_accounts'>('overview');
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const { balance, loading: loadingBalance, refetch: refetchBalance } = useOwnerBalance();
  const { transactions, loading: loadingTxns, refetch: refetchTxns, page: txnPage, nextPage: txnNextPage, prevPage: txnPrevPage, hasMore: txnHasMore } = useOwnerTransactions();
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

  const handleSetDefaultBankAccount = async (id: string) => {
    await setDefaultBankAccount(id);
    refetchBankAccounts();
  };

  const handleCreateWithdrawal = async (data: CreateWithdrawalRequest) => {
    await createWithdrawal(data);
    refetchBalance();
    refetchTxns();
    refetchWithdrawals();
  };

  const handleRefreshAll = () => {
    refetchBalance();
    refetchTxns();
    refetchWithdrawals();
    refetchBankAccounts();
  };

  // ═══ MOBILE VIEW ═══
  if (isMobile) {
    return (
      <MobileWalletPage
        balance={balance}
        loadingBalance={loadingBalance}
        transactions={transactions}
        loadingTxns={loadingTxns}
        withdrawals={withdrawals}
        loadingWithdrawals={loadingWithdrawals}
        bankAccounts={bankAccounts}
        loadingBanks={loadingBanks}
        vietqrBanks={vietqrBanks}
        loadingVietQR={loadingVietQR}
        onRefreshAll={handleRefreshAll}
        onAddBankAccount={handleAddBankAccount}
        onDeleteBankAccount={handleDeleteBankAccount}
        onSetDefaultBankAccount={handleSetDefaultBankAccount}
        onCreateWithdrawal={handleCreateWithdrawal}
        txnPage={txnPage}
        txnHasMore={txnHasMore}
        txnNextPage={txnNextPage}
        txnPrevPage={txnPrevPage}
      />
    );
  }

  const tabs = [
    { key: 'overview' as const, icon: <LayoutDashboard size={16} />, label: 'Tổng quan' },
    { key: 'withdrawals' as const, icon: <ArrowRightLeft size={16} />, label: 'Rút tiền' },
    { key: 'bank_accounts' as const, icon: <Landmark size={16} />, label: 'Tài khoản ngân hàng' },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 select-none animate-fadeIn pb-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">Ví của tôi</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Quản lý doanh thu, giao dịch và tài khoản ngân hàng của bạn</p>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* LEFT: Sidebar — Wallet balance & quick actions */}
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 hide-scrollbar">
          <WalletBalanceCard
            wallet={balance}
            loading={loadingBalance}
            bankAccounts={bankAccounts}
            recentWithdrawals={withdrawals}
            onRequestWithdrawal={() => {
              if (bankAccounts.length === 0) {
                setActiveTab('bank_accounts');
                setTimeout(() => setIsAddBankModalOpen(true), 100);
              } else {
                setIsWithdrawModalOpen(true);
              }
            }}
            onAddBankAccount={() => setIsAddBankModalOpen(true)}
            onViewAllTransactions={() => setActiveTab('overview')}
            onViewAllWithdrawals={() => setActiveTab('withdrawals')}
            onRefresh={handleRefreshAll}
          />
        </div>

        {/* RIGHT: Main content area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/80 border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          {/* Tab navigation */}
          <div className="flex items-center bg-white border-b border-slate-200 p-2 gap-2 flex-shrink-0">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  activeTab === tab.key
                    ? 'bg-brand-emerald text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content (scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 matrix-scroll bg-slate-50">
            {activeTab === 'overview' && (
              <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-800">Lịch sử dòng tiền</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Tất cả giao dịch ra vào ví của bạn</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-200 px-4 py-2 rounded-full">
                    {transactions.length} giao dịch
                  </span>
                </div>
                <TransactionHistoryTable 
                  transactions={transactions} 
                  loading={loadingTxns}
                  page={txnPage}
                  hasMore={txnHasMore}
                  onNextPage={txnNextPage}
                  onPrevPage={txnPrevPage}
                />
              </div>
            )}

            {activeTab === 'withdrawals' && (
              <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-800">Yêu cầu rút tiền</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Lịch sử và trạng thái rút tiền</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-200 px-4 py-2 rounded-full">
                    {withdrawals.length} yêu cầu
                  </span>
                </div>
                <WithdrawalHistoryList withdrawals={withdrawals} loading={loadingWithdrawals} />
              </div>
            )}

            {activeTab === 'bank_accounts' && (
              <div className="max-w-4xl">
                <BankAccountsTab
                  bankAccounts={bankAccounts}
                  loading={loadingBanks}
                  onAddAccount={() => setIsAddBankModalOpen(true)}
                  onDeleteAccount={handleDeleteBankAccount}
                  onSetDefaultAccount={handleSetDefaultBankAccount}
                />
              </div>
            )}
          </div>
        </div>
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
