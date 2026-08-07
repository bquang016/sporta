import React from 'react';
import { WithdrawalResponse } from '../model/wallet.types';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  withdrawals: WithdrawalResponse[];
  loading: boolean;
}

export const WithdrawalHistoryList: React.FC<Props> = ({ withdrawals, loading }) => {
  if (loading) {
    return <div className="animate-pulse h-64 bg-surface-container rounded-xl"></div>;
  }

  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-12 bg-surface-container rounded-xl border border-outline-variant/30">
        <p className="text-on-surface-variant">Chưa có yêu cầu rút tiền nào.</p>
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
            <Clock size={12} />
            Đang xử lý
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} />
            Thành công
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            <XCircle size={12} />
            Bị từ chối
          </span>
        );
      default:
        return <span>{status}</span>;
    }
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
    <div className="space-y-4">
      {withdrawals.map((w) => (
        <div key={w.id} className="bg-surface p-5 rounded-xl border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-outline-variant/60 transition-colors shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-on-surface">{w.formattedAmount}</h3>
              {getStatusDisplay(w.status)}
            </div>
            <div className="text-sm text-on-surface-variant space-y-1">
              <p>Ngân hàng: <span className="font-medium text-on-surface">{w.bankCode}</span></p>
              <p>STK: <span className="font-medium text-on-surface">{w.bankAccountNumber}</span> - {w.bankAccountName}</p>
            </div>
          </div>
          
          <div className="text-left md:text-right text-sm">
            <p className="text-on-surface-variant mb-1">Thời gian yêu cầu:</p>
            <p className="font-medium text-on-surface">{formatDate(w.createdAt)}</p>
            {w.status === 'REJECTED' && w.adminNote && (
              <p className="text-red-600 mt-2 max-w-xs truncate" title={w.adminNote}>
                Lý do: {w.adminNote}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
