import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Landmark, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Building2,
  Trash2,
  Check,
  ChevronRight,
  ReceiptText
} from 'lucide-react';
import type { 
  OwnerWalletResponse, 
  BankAccountResponse, 
  WithdrawalResponse, 
  WalletTransactionResponse,
  CreateBankAccountRequest,
  CreateWithdrawalRequest,
  VietQRBank
} from '../model/wallet.types';
import { AddBankAccountModal } from '../ui/AddBankAccountModal';
import { WithdrawalRequestModal } from '../ui/WithdrawalRequestModal';
import logoSvg from '../../../assets/logo/light/logo-main_40x40px_small.svg';

interface MobileWalletPageProps {
  balance: OwnerWalletResponse | null;
  loadingBalance: boolean;
  transactions: WalletTransactionResponse[];
  loadingTxns: boolean;
  withdrawals: WithdrawalResponse[];
  loadingWithdrawals: boolean;
  bankAccounts: BankAccountResponse[];
  loadingBanks: boolean;
  vietqrBanks: VietQRBank[];
  loadingVietQR: boolean;
  onRefreshAll: () => void;
  onAddBankAccount: (data: CreateBankAccountRequest) => Promise<void>;
  onDeleteBankAccount: (id: string) => Promise<void>;
  onSetDefaultBankAccount: (id: string) => Promise<void>;
  onCreateWithdrawal: (data: CreateWithdrawalRequest) => Promise<void>;
  txnPage: number;
  txnHasMore: boolean;
  txnNextPage: () => void;
  txnPrevPage: () => void;
}

export const MobileWalletPage: React.FC<MobileWalletPageProps> = ({
  balance,
  loadingBalance,
  transactions,
  loadingTxns,
  withdrawals,
  loadingWithdrawals,
  bankAccounts,
  loadingBanks,
  vietqrBanks,
  loadingVietQR,
  onRefreshAll,
  onAddBankAccount,
  onDeleteBankAccount,
  onSetDefaultBankAccount,
  onCreateWithdrawal,
  txnPage,
  txnHasMore,
  txnNextPage,
  txnPrevPage,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'txns' | 'withdrawals' | 'banks'>('txns');
  const [showBalance, setShowBalance] = useState(true);
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshAll();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'APPROVED':
      case 'SUCCESS':
        return { label: 'Thành công', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'PENDING':
      case 'PROCESSING':
        return { label: 'Đang xử lý', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'REJECTED':
      case 'FAILED':
      case 'CANCELLED':
        return { label: 'Thất bại', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: status || 'Khác', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div
      className="font-sans min-h-dvh bg-slate-100/60 pb-28 select-none flex flex-col animate-fadeIn"
      style={{ touchAction: 'pan-y' }}
    >
      {/* ── 1. UNIFIED SPORTY-TECH LIQUID GLASS HEADER ── */}
      <header
        className="relative bg-gradient-to-b from-[#002b1f] via-[#064e3b] to-[#043d2e] text-white rounded-b-[2.5rem] shadow-xl overflow-hidden z-20 pb-5 transition-all"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        {/* Glow Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -left-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 px-4 space-y-3.5">
          {/* Top Bar: Back button & Full-width Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="touch-target w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white transition-transform backdrop-blur-md shrink-0"
                title="Quay lại"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-brand-yellow uppercase tracking-wider">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Tài chính & Doanh thu</span>
                </div>
                <h1 className="text-lg font-black tracking-tight text-white mt-0.5 truncate">
                  Ví của tôi
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="touch-target w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 flex items-center justify-center text-white transition-transform backdrop-blur-md shrink-0"
              title="Làm mới dữ liệu ví"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. DIGITAL WALLET CARD ── */}
      <main className="px-4 pt-4 space-y-4">
        <div className="bg-gradient-to-tr from-[#002b1f] via-[#064e3b] to-[#0b6e54] text-white rounded-3xl p-5 shadow-xl border border-emerald-700/60 relative overflow-hidden">
          {/* Subtle Glows */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-300/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            {/* Top row: Brand & Hide Balance Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-md p-0.5">
                  <img src={logoSvg} alt="Sporta" className="w-full h-full object-contain" />
                </div>
                <span className="text-xs font-black tracking-wider text-white/90">
                  VÍ CỦA TÔI
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="touch-target p-1.5 text-white/70 hover:text-white transition-colors"
                title={showBalance ? 'Ẩn số dư' : 'Hiện số dư'}
              >
                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            {/* Balance Amount Display */}
            <div>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider block">
                Số dư khả dụng
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-brand-yellow">
                  {showBalance ? (
                    loadingBalance ? (
                      <span className="text-white/60 text-lg">Đang tải...</span>
                    ) : (
                      balance?.formattedBalance || formatVND(balance?.balance || 0)
                    )
                  ) : (
                    '•••••••• VNĐ'
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15">
              <button
                type="button"
                onClick={() => {
                  if (bankAccounts.length === 0) {
                    setActiveTab('banks');
                    setIsAddBankModalOpen(true);
                  } else {
                    setIsWithdrawModalOpen(true);
                  }
                }}
                className="touch-target py-2.5 px-3 rounded-2xl bg-brand-yellow active:bg-yellow-400 text-[#064e3b] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                <span>Rút tiền</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddBankModalOpen(true)}
                className="touch-target py-2.5 px-3 rounded-2xl bg-white/15 hover:bg-white/20 active:scale-95 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 backdrop-blur-md transition-transform"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Thêm ngân hàng</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 3. 3-SEGMENTED TABS BAR ── */}
        <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
          {[
            { id: 'txns' as const, label: 'Lịch sử GD', icon: <ReceiptText className="w-3.5 h-3.5" /> },
            { id: 'withdrawals' as const, label: 'Rút tiền', icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
            { id: 'banks' as const, label: 'Ngân hàng', icon: <Landmark className="w-3.5 h-3.5" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`touch-target py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── 4. TAB CONTENTS ── */}

        {/* TAB 1: TRANSACTIONS LIST */}
        {activeTab === 'txns' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-bold">
              <span>Biến động số dư gần nhất</span>
              <span>{transactions.length} giao dịch</span>
            </div>

            {loadingTxns ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-2xs space-y-2">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-brand-emerald rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">Đang tải lịch sử giao dịch...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200 space-y-2">
                <ReceiptText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Chưa có giao dịch nào</p>
                <p className="text-[10px] text-slate-400">Doanh thu từ các đơn đặt sân sẽ hiển thị tại đây</p>
              </div>
            ) : (
              transactions.map((tx) => {
                const isIncome = tx.amount > 0 || tx.transactionType === 'BOOKING_PAYMENT' || tx.transactionType === 'DEPOSIT';
                const badge = getStatusBadge('SUCCESS');

                return (
                  <div
                    key={tx.id}
                    className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {isIncome ? <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" /> : <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {tx.description || (isIncome ? 'Doanh thu đặt sân' : 'Rút tiền về tài khoản')}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            Mã: {tx.referenceId || tx.id?.substring(0, 8)} • {new Date(tx.createdAt).toLocaleDateString('vi-VN')} {new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-black block ${
                          isIncome ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {isIncome ? `+${formatVND(Math.abs(tx.amount))}` : `-${formatVND(Math.abs(tx.amount))}`}
                        </span>
                        <span className={`inline-block px-2 py-0.2 rounded-full text-[9px] font-black border uppercase mt-1 ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination Controls */}
            {transactions.length > 0 && (
              <div className="flex items-center justify-between px-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={txnPrevPage}
                  disabled={txnPage <= 1}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold disabled:opacity-40"
                >
                  Trang trước
                </button>
                <span className="text-slate-500 font-bold">Trang {txnPage}</span>
                <button
                  type="button"
                  onClick={txnNextPage}
                  disabled={!txnHasMore}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold disabled:opacity-40"
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WITHDRAWALS LIST */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-bold">
              <span>Lịch sử yêu cầu rút tiền</span>
              <span>{withdrawals.length} yêu cầu</span>
            </div>

            {loadingWithdrawals ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-2xs space-y-2">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-brand-emerald rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">Đang tải yêu cầu rút tiền...</p>
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200 space-y-2">
                <ArrowUpRight className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Chưa có yêu cầu rút tiền nào</p>
                <p className="text-[10px] text-slate-400">Bấm nút "Rút tiền" ở trên để tạo lệnh rút về ngân hàng</p>
              </div>
            ) : (
              withdrawals.map((w) => {
                const badge = getStatusBadge(w.status);

                return (
                  <div
                    key={w.id}
                    className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 font-bold">
                          <Landmark className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {w.bankCode || 'Ngân hàng nhận'}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            Số TK: {w.bankAccountNumber || '••••'} • {w.bankAccountName || 'Chủ sân'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-rose-600 block">
                          -{w.formattedAmount || formatVND(w.amount)}
                        </span>
                        <span className={`inline-block px-2 py-0.2 rounded-full text-[9px] font-black border uppercase mt-1 ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-100">
                      <span>Mã: {w.id?.substring(0, 8)}</span>
                      <span>{new Date(w.createdAt).toLocaleDateString('vi-VN')} {new Date(w.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: SAVED BANK ACCOUNTS */}
        {activeTab === 'banks' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-slate-500 font-bold">Tài khoản nhận tiền ({bankAccounts.length})</span>
              <button
                type="button"
                onClick={() => setIsAddBankModalOpen(true)}
                className="text-xs font-black text-brand-emerald flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm tài khoản</span>
              </button>
            </div>

            {loadingBanks ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-2xs space-y-2">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-brand-emerald rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">Đang tải danh sách ngân hàng...</p>
              </div>
            ) : bankAccounts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200 space-y-3">
                <Landmark className="w-8 h-8 text-slate-300 mx-auto" />
                <div>
                  <p className="text-xs font-black text-slate-700">Chưa liên kết tài khoản ngân hàng</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Vui lòng thêm tài khoản để nhận tiền doanh thu</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddBankModalOpen(true)}
                  className="touch-target inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-emerald text-white text-xs font-black shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm tài khoản ngay</span>
                </button>
              </div>
            ) : (
              bankAccounts.map((b) => (
                <div
                  key={b.id}
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-2xs space-y-3 relative ${
                    b.isDefault ? 'border-brand-emerald ring-1 ring-emerald-500/20' : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-brand-emerald flex items-center justify-center shrink-0">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {b.bankName}
                          </h4>
                          {b.isDefault && (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-black uppercase">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-mono font-black text-slate-800 tracking-wider mt-0.5">
                          {b.accountNumber}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                          {b.accountName}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteBankAccount(b.id)}
                      className="touch-target w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors shrink-0"
                      title="Xóa tài khoản"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {!b.isDefault && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onSetDefaultBankAccount(b.id)}
                        className="touch-target text-[10px] font-black text-brand-emerald hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Đặt làm tài khoản mặc định</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* ── 5. MODALS (BOTTOM SHEETS) ── */}
      <AddBankAccountModal
        isOpen={isAddBankModalOpen}
        onClose={() => setIsAddBankModalOpen(false)}
        onSubmit={onAddBankAccount}
        banks={vietqrBanks}
        loadingBanks={loadingVietQR}
      />

      <WithdrawalRequestModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onSubmit={onCreateWithdrawal}
        maxAmount={balance?.balance || 0}
        bankAccounts={bankAccounts}
      />
    </div>
  );
};
export default MobileWalletPage;
