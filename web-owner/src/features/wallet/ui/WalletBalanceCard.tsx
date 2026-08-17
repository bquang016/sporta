import React from 'react';
import type { OwnerWalletResponse, BankAccountResponse, WithdrawalResponse } from '../model/wallet.types';
import { CreditCard, TrendingUp, DollarSign, ArrowUpRight, Landmark, Plus, Clock, CheckCircle, XCircle, ArrowDownToLine, RefreshCw } from 'lucide-react';
import { Button } from '../../../common/ui/buttons/Button';

interface Props {
  wallet: OwnerWalletResponse | null;
  loading: boolean;
  bankAccounts: BankAccountResponse[];
  recentWithdrawals: WithdrawalResponse[];
  onRequestWithdrawal: () => void;
  onAddBankAccount: () => void;
  onViewAllTransactions: () => void;
  onViewAllWithdrawals: () => void;
  onRefresh: () => void;
}

export const WalletBalanceCard: React.FC<Props> = ({ 
  wallet, loading, bankAccounts, recentWithdrawals,
  onRequestWithdrawal, onAddBankAccount, onViewAllTransactions, onViewAllWithdrawals, onRefresh
}) => {
  const defaultBank = bankAccounts.find(a => a.isDefault) || bankAccounts[0];
  const pendingWithdrawals = recentWithdrawals.filter(w => w.status === 'PENDING');
  const pendingTotal = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <div className="space-y-6">
      {/* Main Balance Card - Premium Athletic Gradient Header */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md border-b-4 border-brand-yellow">
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute left-1/3 -bottom-10 w-40 h-40 bg-brand-yellow/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider backdrop-blur-sm">
                  SỐ DƯ KHẢ DỤNG
                </span>
                <button onClick={onRefresh} className="p-1 rounded-full hover:bg-white/20 transition-colors text-white/60 hover:text-white" title="Làm mới">
                  <RefreshCw size={14} />
                </button>
              </div>
              {loading ? (
                <div className="h-10 w-48 bg-white/10 animate-pulse rounded-lg mt-2" />
              ) : (
                <h2 className="text-3xl font-black tracking-tight mt-1">{wallet?.formattedBalance || '0 VNĐ'}</h2>
              )}
            </div>
            <div className="w-12 h-12 rounded-full bg-brand-yellow/15 flex items-center justify-center border border-brand-yellow/30 text-brand-yellow shadow-inner">
              <CreditCard size={24} />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-xs font-bold">
                <TrendingUp size={16} />
                <span>TỔNG DOANH THU</span>
              </div>
              {loading ? (
                <div className="h-6 w-24 bg-white/10 animate-pulse rounded-md" />
              ) : (
                <p className="text-sm font-black tracking-wide">{wallet?.formattedTotalEarned || '0 VNĐ'}</p>
              )}
            </div>
            
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-xs font-bold">
                <DollarSign size={16} />
                <span>CHIẾT KHẤU</span>
              </div>
              {loading ? (
                <div className="h-6 w-24 bg-white/10 animate-pulse rounded-md" />
              ) : (
                <p className="text-sm font-black tracking-wide">{wallet?.formattedTotalCommission || '0 VNĐ'}</p>
              )}
            </div>
            
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-2 text-brand-yellow text-xs font-bold">
                <Clock size={16} />
                <span>ĐANG CHỜ RÚT</span>
              </div>
              {loading ? (
                <div className="h-6 w-24 bg-white/10 animate-pulse rounded-md" />
              ) : (
                <p className="text-sm font-black text-brand-yellow tracking-wide">{pendingTotal > 0 ? formatVND(pendingTotal) : '—'}</p>
              )}
            </div>
          </div>

          {/* Quick action */}
          <button
            onClick={onRequestWithdrawal}
            disabled={loading || (wallet?.balance || 0) <= 0}
            className="w-full bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-xs px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
          >
            <ArrowDownToLine size={18} />
            YÊU CẦU RÚT TIỀN
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onViewAllTransactions}
          className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-brand-emerald/40 hover:bg-brand-emerald/5 transition-all text-left group shadow-sm"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-50 text-brand-emerald group-hover:bg-brand-emerald group-hover:text-white transition-colors">
            <ArrowUpRight size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-700">Lịch sử giao dịch</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Xem tất cả dòng tiền</p>
          </div>
        </button>
        <button
          onClick={onViewAllWithdrawals}
          className="flex flex-col gap-2 p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-brand-emerald/40 hover:bg-brand-emerald/5 transition-all text-left group shadow-sm"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-50 text-yellow-600 group-hover:bg-brand-yellow group-hover:text-yellow-900 transition-colors">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-700">Rút tiền</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{pendingWithdrawals.length > 0 ? `${pendingWithdrawals.length} đang chờ xử lý` : 'Xem lịch sử rút tiền'}</p>
          </div>
        </button>
      </div>

      {/* Default bank account preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Landmark size={16} />
            TÀI KHOẢN NHẬN TIỀN
          </h3>
          <button onClick={onAddBankAccount} className="text-xs font-black uppercase tracking-wider text-brand-emerald hover:underline flex items-center gap-1">
            <Plus size={14} />
            THÊM
          </button>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="text-center py-6">
            <div className="bg-slate-100 p-4 rounded-full mb-4 text-slate-400 inline-flex">
              <CreditCard size={32} />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-4">Chưa có tài khoản ngân hàng nào.</p>
            <Button onClick={onAddBankAccount} variant="outline" size="sm">Thêm tài khoản</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bankAccounts.slice(0, 2).map(account => (
              <div key={account.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${account.isDefault ? 'border-brand-emerald/40 bg-brand-emerald/5' : 'border-slate-200/80 bg-slate-50'}`}>
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                  {account.bankLogo ? (
                    <img src={account.bankLogo} alt={account.bankCode} className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-bold text-xs text-slate-500">{account.bankCode}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-700 truncate">{account.bankName}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{account.accountNumber}</p>
                </div>
                {account.isDefault && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-emerald bg-brand-emerald/10 px-2 py-1 rounded-full flex-shrink-0">
                    MẶC ĐỊNH
                  </span>
                )}
              </div>
            ))}
            {bankAccounts.length > 2 && (
              <p className="text-xs font-semibold text-center text-slate-500 pt-2">
                +{bankAccounts.length - 2} tài khoản khác
              </p>
            )}
          </div>
        )}
      </div>

      {/* Recent pending withdrawals */}
      {pendingWithdrawals.length > 0 && (
        <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-yellow-700 mb-4 flex items-center gap-2">
            <Clock size={16} />
            YÊU CẦU ĐANG CHỜ XỬ LÝ ({pendingWithdrawals.length})
          </h3>
          <div className="space-y-3">
            {pendingWithdrawals.slice(0, 3).map(w => (
              <div key={w.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-yellow-100">
                <div>
                  <p className="text-sm font-black text-slate-700">{w.formattedAmount}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{w.bankCode} • {w.bankAccountNumber}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-yellow-600">
                  <Clock size={14} />
                  CHỜ DUYỆT
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
