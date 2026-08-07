import React from 'react';
import { BankAccountResponse } from '../model/wallet.types';
import { Button } from '../../../common/ui/buttons/Button';
import { Plus, Trash2, CheckCircle, CreditCard } from 'lucide-react';

interface Props {
  bankAccounts: BankAccountResponse[];
  loading: boolean;
  onAddAccount: () => void;
  onDeleteAccount: (id: string) => void;
}

export const BankAccountsTab: React.FC<Props> = ({ bankAccounts, loading, onAddAccount, onDeleteAccount }) => {
  if (loading) {
    return <div className="animate-pulse h-64 bg-surface-container rounded-xl"></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Tài khoản nhận tiền</h2>
          <p className="text-sm text-on-surface-variant">Quản lý các tài khoản ngân hàng để rút tiền doanh thu.</p>
        </div>
        <Button onClick={onAddAccount} prefixIcon={<Plus size={18} />}>
          Thêm tài khoản
        </Button>
      </div>

      {bankAccounts.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col items-center justify-center">
          <div className="bg-surface-container p-4 rounded-full mb-4 text-on-surface-variant">
            <CreditCard size={48} />
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-2">Chưa có tài khoản nào</h3>
          <p className="text-on-surface-variant mb-6 max-w-md">
            Thêm tài khoản ngân hàng của bạn để có thể thực hiện rút tiền từ ví doanh thu một cách nhanh chóng.
          </p>
          <Button onClick={onAddAccount} variant="outline">
            Thêm tài khoản ngay
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankAccounts.map((account) => (
            <div 
              key={account.id} 
              className={`relative p-5 rounded-xl border transition-all ${
                account.isDefault 
                  ? 'border-brand-emerald bg-brand-emerald/5 shadow-sm' 
                  : 'border-outline-variant/30 bg-surface hover:border-outline-variant/60'
              }`}
            >
              {account.isDefault && (
                <div className="absolute top-4 right-4 text-brand-emerald flex items-center gap-1 text-xs font-bold">
                  <CheckCircle size={14} />
                  MẶC ĐỊNH
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-lg border border-outline-variant/30 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                  {account.bankLogo ? (
                    <img src={account.bankLogo} alt={account.bankCode} className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-bold text-on-surface-variant">{account.bankCode}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-on-surface line-clamp-1" title={account.bankName}>{account.bankName}</h3>
                  <p className="text-sm font-medium text-on-surface-variant">{account.bankCode}</p>
                </div>
              </div>
              
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20 mb-4">
                <p className="text-xs text-on-surface-variant mb-1">Số tài khoản</p>
                <p className="font-mono font-bold text-lg text-on-surface tracking-wider">{account.accountNumber}</p>
                <p className="text-sm font-medium text-on-surface mt-1 uppercase">{account.accountName}</p>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  prefixIcon={<Trash2 size={16} />}
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này không?')) {
                      onDeleteAccount(account.id);
                    }
                  }}
                >
                  Xóa tài khoản
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
