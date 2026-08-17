import React, { useState } from 'react';
import type { BankAccountResponse, CreateWithdrawalRequest } from '../model/wallet.types';
import { Button, Modal } from '../../../common/ui';
import { AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWithdrawalRequest) => Promise<void>;
  bankAccounts: BankAccountResponse[];
  maxAmount: number;
}

export const WithdrawalRequestModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, bankAccounts, maxAmount }) => {
  const defaultAccount = bankAccounts.find(a => a.isDefault) || bankAccounts[0];
  const [selectedAccountId, setSelectedAccountId] = useState<string>(defaultAccount?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bankAccounts.length === 0) {
      setError('Vui lòng thêm tài khoản ngân hàng trước khi rút tiền');
      return;
    }

    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (numAmount < 50000) {
      setError('Số tiền rút tối thiểu là 50.000 VNĐ');
      return;
    }

    if (numAmount > maxAmount) {
      setError('Số tiền rút vượt quá số dư khả dụng');
      return;
    }

    const selectedAccount = bankAccounts.find(a => a.id === selectedAccountId);
    if (!selectedAccount) {
      setError('Vui lòng chọn tài khoản nhận tiền');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        amount: numAmount,
        bankCode: selectedAccount.bankCode,
        bankAccountNumber: selectedAccount.accountNumber,
        bankAccountName: selectedAccount.accountName,
      });
      setAmount('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo yêu cầu rút tiền');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ cho phép nhập số
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      setAmount('');
      return;
    }
    // Format dạng tiền tệ hiển thị (chỉ dùng cho UI state)
    const num = parseInt(val, 10);
    if (num > maxAmount) {
      setAmount(maxAmount.toString());
    } else {
      setAmount(num.toString());
    }
  };

  const formatVND = (num: number | string) => {
    if (!num) return '';
    const n = typeof num === 'string' ? parseInt(num, 10) : num;
    return new Intl.NumberFormat('vi-VN').format(n);
  };

  const footer = (
    bankAccounts.length > 0 ? (
      <div className="w-full">
        <Button type="submit" form="withdraw-form" variant="primary" fullWidth loading={isSubmitting}>
          Tạo yêu cầu rút tiền
        </Button>
        <p className="text-center text-[10px] font-semibold text-slate-500 mt-3">
          Yêu cầu rút tiền sẽ được admin xử lý trong vòng 24h làm việc.
        </p>
      </div>
    ) : (
      <Button variant="primary" fullWidth onClick={onClose}>
        Đóng và sang tab Tài khoản
      </Button>
    )
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Yêu cầu rút tiền"
      maxWidth="md"
      footer={footer}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {bankAccounts.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-full inline-flex mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="font-black text-lg text-slate-800 mb-2">Chưa có tài khoản nhận tiền</h3>
          <p className="text-slate-500 text-sm font-semibold mb-6">Bạn cần thêm ít nhất một tài khoản ngân hàng để có thể thực hiện rút tiền.</p>
        </div>
      ) : (
        <form id="withdraw-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Số tiền cần rút */}
          <div className="space-y-2">
            <div className="flex justify-between items-end mb-1">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Số tiền cần rút</label>
              <span className="text-xs font-semibold text-slate-500">
                Khả dụng: <span className="font-black text-emerald-600">{formatVND(maxAmount)}đ</span>
              </span>
            </div>
            <div className="relative">
              <input 
                type="text" 
                className="w-full border border-slate-200 rounded-2xl p-4 pr-14 bg-slate-50 focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none transition-all font-black text-xl text-slate-800"
                placeholder="0"
                value={amount ? formatVND(amount) : ''}
                onChange={handleAmountChange}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-400">
                VNĐ
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setAmount(maxAmount.toString())} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-bold">Tất cả</button>
              <button type="button" onClick={() => setAmount(Math.min(1000000, maxAmount).toString())} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-bold">1M</button>
              <button type="button" onClick={() => setAmount(Math.min(5000000, maxAmount).toString())} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-bold">5M</button>
            </div>
          </div>

          {/* Chọn tài khoản nhận tiền */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600">Tài khoản nhận tiền</label>
            
            <div className="space-y-3 max-h-48 overflow-y-auto p-1 matrix-scroll">
              {bankAccounts.map((account) => (
                <label 
                  key={account.id}
                  className={`flex items-center p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedAccountId === account.id 
                      ? 'border-brand-emerald bg-brand-emerald/5 ring-1 ring-brand-emerald shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 bg-white shadow-xxs'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="bankAccount" 
                    className="hidden" 
                    checked={selectedAccountId === account.id}
                    onChange={() => setSelectedAccountId(account.id)}
                  />
                  
                  <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-1 mr-3 flex-shrink-0">
                    {account.bankLogo ? (
                      <img src={account.bankLogo} alt={account.bankCode} className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-black text-xs text-slate-400">{account.bankCode}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-black text-sm text-slate-800 leading-tight">{account.bankName}</p>
                    <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">{account.accountNumber}</p>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedAccountId === account.id ? 'border-brand-emerald bg-brand-emerald' : 'border-slate-300'
                  }`}>
                    {selectedAccountId === account.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
