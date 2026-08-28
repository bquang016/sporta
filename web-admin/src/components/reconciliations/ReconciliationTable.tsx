import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { WithdrawalResponse } from '@/api/adminWithdrawalApi';

interface ReconciliationTableProps {
  records: WithdrawalResponse[];
  onViewDetails: (record: WithdrawalResponse) => void;
  onConfirmReconcile: (record: WithdrawalResponse) => void;
}

export const ReconciliationTable: React.FC<ReconciliationTableProps> = ({
  records,
  onViewDetails,
  onConfirmReconcile
}) => {
  const { showToast } = useToast();

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', `Đã sao chép ${type} vào clipboard!`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Chưa đối soát</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Đã thanh toán</Badge>;
      case 'REJECTED':
        return <Badge variant="error">Đã từ chối</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/50 sticky top-0 backdrop-blur-sm z-10 select-none">
          <tr>
            <th className="px-6 py-3.5">Chủ sân</th>
            <th className="px-6 py-3.5">Tài khoản Ngân hàng</th>
            <th className="px-6 py-3.5">Ngày yêu cầu</th>
            <th className="px-6 py-3.5 text-right font-black">Số tiền rút</th>
            <th className="px-6 py-3.5 text-center">Trạng thái</th>
            <th className="px-6 py-3.5 text-center w-40">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {records.map((rec) => (
            <tr key={rec.id} className="hover:bg-slate-50/40 transition-colors">
              
              {/* Chủ sân */}
              <td className="px-6 py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-800">{rec.ownerName}</span>
                </div>
              </td>

              {/* Tài khoản Ngân hàng */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 group">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-800 font-mono">{rec.bankAccountNumber}</span>
                    <span className="text-xs text-slate-400 font-medium">
                      {rec.bankCode} - <span className="uppercase">{rec.bankAccountName}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(rec.bankAccountNumber, 'số tài khoản')}
                    className="p-1 rounded bg-slate-50 hover:bg-slate-150 text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                    title="Sao chép số tài khoản"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </td>

              {/* Ngày yêu cầu */}
              <td className="px-6 py-4 text-slate-600 font-medium">
                {formatDate(rec.createdAt)}
              </td>

              {/* Số dư thực nhận */}
              <td className="px-6 py-4 text-right font-black text-brand-emerald">
                {rec.formattedAmount}
              </td>

              {/* Trạng thái */}
              <td className="px-6 py-4 text-center">
                {getStatusBadge(rec.status)}
              </td>

              {/* Thao tác */}
              <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(rec)}
                    className="text-slate-600 hover:bg-slate-100 hover:text-slate-800 font-bold py-1.5 px-3 rounded-lg border border-slate-200 shadow-sm text-xs"
                  >
                    Chi tiết
                  </Button>
                  
                  {rec.status === 'PENDING' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onConfirmReconcile(rec)}
                      className="bg-brand-emerald hover:bg-emerald-800 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm text-xs"
                    >
                      Xử lý
                    </Button>
                  )}
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
