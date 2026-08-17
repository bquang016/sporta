import React from 'react';
import type { WithdrawalResponse } from '../model/wallet.types';
import { Clock, CheckCircle, XCircle, Landmark, Calendar } from 'lucide-react';

interface Props {
  withdrawals: WithdrawalResponse[];
  loading: boolean;
}

export const WithdrawalHistoryList: React.FC<Props> = ({ withdrawals, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-slate-200/50 animate-pulse rounded-2xl border border-slate-200/50" />
        ))}
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Clock size={32} />
        </div>
        <p className="text-sm font-black text-slate-700">Chưa có yêu cầu rút tiền</p>
        <p className="text-xs font-semibold text-slate-500 mt-2 max-w-sm mx-auto">Lịch sử các lần bạn yêu cầu rút tiền từ ví Sporta về tài khoản ngân hàng sẽ được lưu tại đây.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {withdrawals.map(w => (
        <div key={w.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              w.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
              w.status === 'PENDING' ? 'bg-yellow-50 text-yellow-500' : 'bg-red-50 text-red-600'
            }`}>
              <Landmark size={24} />
            </div>
            
            <div>
              <p className="text-sm font-black text-slate-700">Rút tiền về {w.bankCode}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-bold tracking-wider">
                  {w.bankAccountNumber}
                </span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{w.bankAccountName}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                <Calendar size={12} />
                {new Date(w.createdAt).toLocaleDateString('vi-VN')} {new Date(w.createdAt).toLocaleTimeString('vi-VN')}
              </div>
              {w.adminNote && w.status === 'REJECTED' && (
                <p className="text-xs font-semibold text-red-600 mt-2 bg-red-50 p-2 rounded-lg border border-red-100 flex items-start gap-1.5">
                  <XCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{w.adminNote}</span>
                </p>
              )}
              {w.status === 'COMPLETED' && w.transferProofUrl && (
                <div className="mt-3">
                  <a href={w.transferProofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-emerald hover:text-emerald-700 hover:underline bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-colors">
                    <CheckCircle size={14} /> Xem biên lai
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
            <p className="text-base font-black text-slate-800">
              {w.formattedAmount}
            </p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
              w.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
              w.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
            }`}>
              {w.status === 'COMPLETED' ? <CheckCircle size={12} /> : 
               w.status === 'PENDING' ? <Clock size={12} /> : <XCircle size={12} />}
              {w.status === 'COMPLETED' ? 'THÀNH CÔNG' : 
               w.status === 'PENDING' ? 'ĐANG XỬ LÝ' : 'BỊ TỪ CHỐI'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
