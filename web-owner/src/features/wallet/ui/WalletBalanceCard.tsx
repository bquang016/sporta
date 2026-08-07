import React from 'react';
import { OwnerWalletResponse } from '../model/wallet.types';
import { CreditCard, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '../../../common/ui/buttons/Button';

interface Props {
  wallet: OwnerWalletResponse | null;
  loading: boolean;
  onRequestWithdrawal: () => void;
}

export const WalletBalanceCard: React.FC<Props> = ({ wallet, loading, onRequestWithdrawal }) => {
  return (
    <div className="bg-inverse-surface text-inverse-on-surface rounded-2xl p-6 shadow-sm overflow-hidden relative">
      {/* Decorative background circle */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-inverse-on-surface/70 text-sm font-medium mb-1">Số dư khả dụng</p>
            {loading ? (
              <div className="h-10 w-48 bg-white/10 animate-pulse rounded-lg" />
            ) : (
              <h2 className="text-4xl font-bold tracking-tight">{wallet?.formattedBalance || '0 VNĐ'}</h2>
            )}
          </div>
          <div className="bg-brand-emerald text-white p-3 rounded-full">
            <CreditCard size={24} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-inverse-on-surface/70 text-sm mb-1">
              <TrendingUp size={16} />
              <span>Tổng doanh thu</span>
            </div>
            {loading ? (
              <div className="h-6 w-24 bg-white/10 animate-pulse rounded-md" />
            ) : (
              <p className="text-lg font-semibold">{wallet?.formattedTotalEarned || '0 VNĐ'}</p>
            )}
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 text-inverse-on-surface/70 text-sm mb-1">
              <DollarSign size={16} />
              <span>Đã chiết khấu</span>
            </div>
            {loading ? (
              <div className="h-6 w-24 bg-white/10 animate-pulse rounded-md" />
            ) : (
              <p className="text-lg font-semibold">{wallet?.formattedTotalCommission || '0 VNĐ'}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="primary" 
            onClick={onRequestWithdrawal}
            disabled={loading || (wallet?.balance || 0) <= 0}
          >
            Yêu cầu rút tiền
          </Button>
        </div>
      </div>
    </div>
  );
};
