import React, { useState, useMemo } from 'react';
import type { CreateBankAccountRequest, VietQRBank } from '../model/wallet.types';
import { Button, Modal, Input, FormField } from '../../../common/ui';
import { Search } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBankAccountRequest) => Promise<void>;
  banks: VietQRBank[];
  loadingBanks: boolean;
}

export const AddBankAccountModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, banks, loadingBanks }) => {
  const [selectedBank, setSelectedBank] = useState<VietQRBank | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) return banks;
    const lowerQuery = searchQuery.toLowerCase();
    return banks.filter(b => 
      b.name.toLowerCase().includes(lowerQuery) || 
      b.shortName.toLowerCase().includes(lowerQuery) ||
      b.code.toLowerCase().includes(lowerQuery)
    );
  }, [banks, searchQuery]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBank) {
      setError('Vui lòng chọn ngân hàng');
      return;
    }
    if (!accountNumber.trim()) {
      setError('Vui lòng nhập số tài khoản');
      return;
    }
    if (!accountName.trim()) {
      setError('Vui lòng nhập tên chủ tài khoản');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        bankCode: selectedBank.code,
        bankName: selectedBank.shortName,
        bankLogo: selectedBank.logo,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim().toUpperCase(),
      });
      // Reset form
      setSelectedBank(null);
      setAccountNumber('');
      setAccountName('');
      setSearchQuery('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi thêm tài khoản');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy bỏ</Button>
      <Button type="submit" form="add-bank-form" variant="primary" loading={isSubmitting}>Lưu tài khoản</Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm tài khoản nhận tiền"
      maxWidth="md"
      footer={footer}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form id="add-bank-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Chọn ngân hàng */}
        <FormField label="Ngân hàng">
          {!selectedBank ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 focus-within:border-brand-emerald focus-within:ring-1 focus-within:ring-brand-emerald transition-all">
              <div className="flex items-center px-3 py-2 border-b border-slate-200">
                <Search size={18} className="text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm ngân hàng..."
                  className="w-full bg-transparent border-none outline-none text-sm p-1 placeholder:text-slate-400 text-slate-700"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {loadingBanks ? (
                  <div className="p-4 text-center text-sm text-slate-500">Đang tải danh sách ngân hàng...</div>
                ) : filteredBanks.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">Không tìm thấy ngân hàng phù hợp</div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {filteredBanks.map(bank => (
                      <li 
                        key={bank.id}
                        className="p-3 hover:bg-slate-100 cursor-pointer flex items-center gap-3 transition-colors"
                        onClick={() => setSelectedBank(bank)}
                      >
                        <img src={bank.logo} alt={bank.code} className="w-8 h-8 object-contain bg-white rounded border border-slate-200 p-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-slate-700">{bank.shortName}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{bank.name}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 border border-brand-emerald bg-brand-emerald/5 rounded-xl">
              <div className="flex items-center gap-3">
                <img src={selectedBank.logo} alt={selectedBank.code} className="w-10 h-10 object-contain bg-white rounded-lg border border-slate-200 p-1" />
                <div>
                  <p className="font-bold text-slate-800">{selectedBank.shortName}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{selectedBank.name}</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedBank(null)}
                className="text-xs font-semibold text-brand-emerald hover:underline p-2"
              >
                Thay đổi
              </button>
            </div>
          )}
        </FormField>

        {/* Số tài khoản */}
        <Input 
          label="Số tài khoản"
          placeholder="Ví dụ: 1903456789"
          value={accountNumber}
          onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
          maxLength={20}
          inputClassName="font-mono"
        />

        {/* Tên chủ tài khoản */}
        <Input 
          label="Tên chủ tài khoản"
          placeholder="Ví dụ: NGUYEN VAN A"
          value={accountName}
          onChange={e => setAccountName(e.target.value.toUpperCase())}
          inputClassName="uppercase"
          helperText={<span className="flex items-start gap-1">
            <span className="text-brand-yellow font-bold text-lg leading-3">*</span>
            Vui lòng nhập chính xác tên chủ tài khoản viết hoa không dấu để đảm bảo giao dịch không bị gián đoạn.
          </span>}
        />
      </form>
    </Modal>
  );
};
