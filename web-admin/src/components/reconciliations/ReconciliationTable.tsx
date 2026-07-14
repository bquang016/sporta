import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export interface ReconciliationRecord {
  id: string;
  ownerName: string;
  ownerEmail: string;
  facilityCluster: string;
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;
  cycle: string;
  grossAmount: number;
  commissionRate: number; // e.g. 0.10 for 10%
  commissionAmount: number;
  netPayoutAmount: number;
  status: 'PENDING' | 'PAID_OUT';
  reconciledAt?: string;
  reconciledBy?: string;
}

interface ReconciliationTableProps {
  records: ReconciliationRecord[];
  onViewDetails: (record: ReconciliationRecord) => void;
  onConfirmReconcile: (record: ReconciliationRecord) => void;
  formatCurrency: (val: number) => string;
}

export const ReconciliationTable: React.FC<ReconciliationTableProps> = ({
  records,
  onViewDetails,
  onConfirmReconcile,
  formatCurrency
}) => {
  const { showToast } = useToast();

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', `Đã sao chép ${type} vào clipboard!`);
  };

  const getStatusBadge = (status: 'PENDING' | 'PAID_OUT') => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Chưa đối soát</Badge>;
      case 'PAID_OUT':
        return <Badge variant="success">Đã thanh toán</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/50 sticky top-0 backdrop-blur-sm z-10 select-none">
          <tr>
            <th className="px-6 py-3.5">Cụm sân & Chủ sân</th>
            <th className="px-6 py-3.5">Tài khoản Ngân hàng</th>
            <th className="px-6 py-3.5">Chu kỳ đối soát</th>
            <th className="px-6 py-3.5 text-right">Doanh thu Online</th>
            <th className="px-6 py-3.5 text-right">Hoa hồng (Sporta)</th>
            <th className="px-6 py-3.5 text-right font-black">Số dư thực nhận</th>
            <th className="px-6 py-3.5 text-center">Trạng thái</th>
            <th className="px-6 py-3.5 text-center w-40">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {records.map((rec) => (
            <tr key={rec.id} className="hover:bg-slate-50/40 transition-colors">
              
              {/* Cụm sân & Chủ sân */}
              <td className="px-6 py-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-slate-800">{rec.facilityCluster}</span>
                  <span className="text-xs text-slate-400 font-medium">{rec.ownerName} ({rec.ownerEmail})</span>
                </div>
              </td>

              {/* Tài khoản Ngân hàng */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 group">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-800 font-mono">{rec.bankAccountNo}</span>
                    <span className="text-xs text-slate-400 font-medium">
                      {rec.bankName} - <span className="uppercase">{rec.bankAccountName}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(rec.bankAccountNo, 'số tài khoản')}
                    className="p-1 rounded bg-slate-50 hover:bg-slate-150 text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                    title="Sao chép số tài khoản"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </td>

              {/* Chu kỳ đối soát */}
              <td className="px-6 py-4 font-bold text-slate-600">
                {rec.cycle}
              </td>

              {/* Doanh thu Online */}
              <td className="px-6 py-4 text-right text-slate-600 font-medium">
                {formatCurrency(rec.grossAmount)}
              </td>

              {/* Hoa hồng hệ thống */}
              <td className="px-6 py-4 text-right text-red-500 font-medium">
                -{formatCurrency(rec.commissionAmount)}
                <span className="text-xs text-slate-400 font-bold block">({(rec.commissionRate * 100).toFixed(0)}%)</span>
              </td>

              {/* Số dư thực nhận */}
              <td className="px-6 py-4 text-right font-black text-brand-emerald">
                {formatCurrency(rec.netPayoutAmount)}
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
                  
                  {rec.status === 'PENDING' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onConfirmReconcile(rec)}
                      className="bg-brand-emerald hover:bg-emerald-800 text-white font-bold py-1.5 px-3 rounded-lg shadow-sm text-xs"
                    >
                      Thanh toán
                    </Button>
                  ) : (
                    <div className="px-3 py-1.5 text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 rounded-lg cursor-not-allowed select-none">
                      Đã xong
                    </div>
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
