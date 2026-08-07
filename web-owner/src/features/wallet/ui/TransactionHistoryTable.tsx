import React from 'react';
import { WalletTransactionResponse } from '../model/wallet.types';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface Props {
  transactions: WalletTransactionResponse[];
  loading: boolean;
}

export const TransactionHistoryTable: React.FC<Props> = ({ transactions, loading }) => {
  if (loading) {
    return <div className="animate-pulse h-64 bg-surface-container rounded-xl"></div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-surface-container rounded-xl border border-outline-variant/30">
        <p className="text-on-surface-variant">Chưa có giao dịch nào.</p>
      </div>
    );
  }

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="px-6 py-4 font-semibold">Loại giao dịch</th>
              <th className="px-6 py-4 font-semibold">Số tiền</th>
              <th className="px-6 py-4 font-semibold">Mô tả</th>
              <th className="px-6 py-4 font-semibold">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {transactions.map((txn) => {
              const isEarning = txn.transactionType === 'BOOKING_EARNING';
              return (
                <tr key={txn.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${isEarning ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {isEarning ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <span className="font-medium text-on-surface">
                        {isEarning ? 'Cộng doanh thu' : txn.transactionType === 'COMMISSION_DEDUCT' ? 'Phí nền tảng' : 'Rút tiền'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${isEarning ? 'text-emerald-600' : 'text-on-surface'}`}>
                      {isEarning ? '+' : '-'}{formatVND(txn.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant max-w-[200px] truncate" title={txn.description}>
                    {txn.description}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {formatDate(txn.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
