import React from 'react';
import type { WalletTransactionResponse } from '../model/wallet.types';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '../../../common/ui';

interface Props {
  transactions: WalletTransactionResponse[];
  loading: boolean;
  page?: number;
  hasMore?: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('vi-VN', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

export const TransactionHistoryTable: React.FC<Props> = ({ transactions, loading, page = 0, hasMore = false, onNextPage, onPrevPage }) => {
  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-slate-200/50 animate-pulse rounded-2xl border border-slate-200/50" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ArrowRightLeft size={32} />
        </div>
        <p className="text-sm font-black text-slate-700">Chưa có giao dịch nào</p>
        <p className="text-xs font-semibold text-slate-500 mt-2 max-w-sm mx-auto">Các giao dịch nhận tiền từ khách hàng hoặc rút tiền sẽ hiển thị tại đây.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {transactions.map(txn => {
          const isDebit = txn.transactionType === 'BOOKING_REFUND' || 
                          txn.transactionType === 'WITHDRAWAL' || 
                          txn.transactionType === 'COMMISSION_DEDUCT';
          const isPositive = !isDebit;

          const badgeLabel = 
            txn.transactionType === 'BOOKING_PAYMENT' || txn.transactionType === 'BOOKING_EARNING' ? 'Doanh thu sân' :
            txn.transactionType === 'WITHDRAWAL' ? 'Rút tiền' :
            txn.transactionType === 'COMMISSION_DEDUCT' ? 'Chiết khấu sàn' : 'Khấu trừ hoàn tiền';

          const iconBg = 
            txn.transactionType === 'BOOKING_REFUND' ? 'bg-red-50 text-red-600' :
            txn.transactionType === 'WITHDRAWAL' ? 'bg-amber-50 text-amber-600' :
            txn.transactionType === 'COMMISSION_DEDUCT' ? 'bg-slate-100 text-slate-600' :
            'bg-emerald-50 text-emerald-600';

          const amountColor = 
            txn.transactionType === 'BOOKING_REFUND' ? 'text-red-600' :
            txn.transactionType === 'WITHDRAWAL' ? 'text-amber-600' :
            txn.transactionType === 'COMMISSION_DEDUCT' ? 'text-slate-600' :
            'text-emerald-600';

          return (
            <div key={txn.id} className={`bg-white hover:bg-slate-50 p-5 rounded-2xl border border-slate-200/80 transition-colors flex items-center justify-between group cursor-default shadow-sm ${loading ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                  {isPositive ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-700 group-hover:text-emerald-700 transition-colors">
                    {txn.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      txn.transactionType === 'BOOKING_REFUND' ? 'text-red-700 bg-red-100' :
                      txn.transactionType === 'WITHDRAWAL' ? 'text-amber-700 bg-amber-100' :
                      txn.transactionType === 'COMMISSION_DEDUCT' ? 'text-slate-600 bg-slate-100' :
                      'text-emerald-700 bg-emerald-100'
                    }`}>
                      {badgeLabel}
                    </span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Calendar size={12} />
                      {formatDate(txn.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-base font-black ${amountColor}`}>
                  {isPositive ? '+' : '-'}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(txn.amount))}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <CheckCircle size={14} className={isDebit ? "text-slate-400" : "text-emerald-500"} />
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isDebit ? "text-slate-500" : "text-emerald-600"}`}>
                    Thành công
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(page > 0 || hasMore) && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevPage}
            disabled={page === 0 || loading}
          >
            Trang trước
          </Button>
          <span className="text-xs font-bold text-slate-500 uppercase">Trang {page + 1}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!hasMore || loading}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
};
