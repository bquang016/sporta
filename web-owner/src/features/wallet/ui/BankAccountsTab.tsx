import React from 'react';
import type { BankAccountResponse } from '../model/wallet.types';
import { Button } from '../../../common/ui/buttons/Button';
import { Plus, Trash2, CheckCircle, CreditCard, Landmark } from 'lucide-react';

interface Props {
  bankAccounts: BankAccountResponse[];
  loading: boolean;
  onAddAccount: () => void;
  onDeleteAccount: (id: string) => void;
  onSetDefaultAccount: (id: string) => void;
}

export const BankAccountsTab: React.FC<Props> = ({ bankAccounts, loading, onAddAccount, onDeleteAccount, onSetDefaultAccount }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <div key={i} className="h-32 bg-slate-200/50 animate-pulse rounded-2xl border border-slate-200/50" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-800">Tài khoản ngân hàng</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Quản lý các tài khoản để nhận tiền rút từ ví</p>
        </div>
        <Button onClick={onAddAccount} prefixIcon={<Plus size={18} />}>
          Thêm tài khoản
        </Button>
      </div>

      {bankAccounts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Landmark size={32} />
          </div>
          <p className="text-sm font-black text-slate-700">Chưa có tài khoản nào</p>
          <p className="text-xs font-semibold text-slate-500 mt-2 max-w-sm mx-auto mb-6">Bạn cần thêm ít nhất một tài khoản ngân hàng để có thể rút tiền doanh thu.</p>
          <Button onClick={onAddAccount} prefixIcon={<Plus size={18} />}>Thêm ngay</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankAccounts.map(account => (
            <div key={account.id} className={`bg-white p-6 rounded-2xl border transition-all relative group shadow-sm flex flex-col h-full ${
              account.isDefault ? 'border-brand-emerald bg-brand-emerald/5' : 'border-slate-200 hover:border-slate-300'
            }`}>
              {account.isDefault && (
                <div className="absolute top-0 right-0 bg-brand-emerald text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-2xl">
                  MẶC ĐỊNH
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-4 mt-2 flex-1">
                <div className="w-16 h-16 bg-white rounded-xl border border-slate-200/50 flex items-center justify-center overflow-hidden flex-shrink-0 p-2 shadow-xxs">
                  {account.bankLogo ? (
                    <img src={account.bankLogo} alt={account.bankCode} className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-black text-lg text-slate-400">{account.bankCode}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800">{account.bankName}</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{account.bankCode}</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/50 flex flex-col gap-3">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">SỐ TÀI KHOẢN</p>
                  <p className="text-base font-mono text-slate-800 font-bold tracking-wider">{account.accountNumber}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase">{account.accountName}</p>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  {!account.isDefault ? (
                    <button
                      onClick={() => onSetDefaultAccount(account.id)}
                      className="text-[11px] font-bold text-brand-emerald hover:text-emerald-700 uppercase tracking-wider transition-colors flex items-center gap-1"
                    >
                      <CheckCircle size={14} /> Đặt làm mặc định
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này không?')) {
                        onDeleteAccount(account.id);
                      }
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Xóa tài khoản"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
