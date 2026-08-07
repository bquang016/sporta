import React, { useState, useMemo } from 'react';
import { CreateBankAccountRequest, VietQRBank } from '../model/wallet.types';
import { Button } from '../../../common/ui/buttons/Button';
import { X, Search } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-outline-variant/30 bg-surface-container-low">
          <h2 className="text-xl font-bold text-on-surface">Thêm tài khoản nhận tiền</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-outline-variant/20 text-on-surface-variant transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form id="add-bank-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Chọn ngân hàng */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface">Ngân hàng</label>
              
              {!selectedBank ? (
                <div className="border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest focus-within:border-brand-emerald focus-within:ring-1 focus-within:ring-brand-emerald transition-all">
                  <div className="flex items-center px-3 py-2 border-b border-outline-variant/30">
                    <Search size={18} className="text-on-surface-variant mr-2" />
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm ngân hàng..."
                      className="w-full bg-transparent border-none outline-none text-sm p-1"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {loadingBanks ? (
                      <div className="p-4 text-center text-sm text-on-surface-variant">Đang tải danh sách ngân hàng...</div>
                    ) : filteredBanks.length === 0 ? (
                      <div className="p-4 text-center text-sm text-on-surface-variant">Không tìm thấy ngân hàng phù hợp</div>
                    ) : (
                      <ul className="divide-y divide-outline-variant/10">
                        {filteredBanks.map(bank => (
                          <li 
                            key={bank.id}
                            className="p-3 hover:bg-surface-container-low cursor-pointer flex items-center gap-3 transition-colors"
                            onClick={() => setSelectedBank(bank)}
                          >
                            <img src={bank.logo} alt={bank.code} className="w-8 h-8 object-contain bg-white rounded border border-outline-variant/20 p-0.5" />
                            <div>
                              <p className="font-semibold text-sm text-on-surface">{bank.shortName}</p>
                              <p className="text-xs text-on-surface-variant line-clamp-1">{bank.name}</p>
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
                    <img src={selectedBank.logo} alt={selectedBank.code} className="w-10 h-10 object-contain bg-white rounded-lg border border-outline-variant/20 p-1" />
                    <div>
                      <p className="font-bold text-on-surface">{selectedBank.shortName}</p>
                      <p className="text-xs text-on-surface-variant line-clamp-1">{selectedBank.name}</p>
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
            </div>

            {/* Số tài khoản */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface">Số tài khoản</label>
              <input 
                type="text" 
                className="w-full border border-outline-variant rounded-xl p-3 bg-surface-container-lowest focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none transition-all font-mono"
                placeholder="Ví dụ: 1903456789"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))} // Chỉ cho nhập số
                maxLength={20}
              />
            </div>

            {/* Tên chủ tài khoản */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface">Tên chủ tài khoản</label>
              <input 
                type="text" 
                className="w-full border border-outline-variant rounded-xl p-3 bg-surface-container-lowest focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none transition-all uppercase"
                placeholder="Ví dụ: NGUYEN VAN A"
                value={accountName}
                onChange={e => setAccountName(e.target.value.toUpperCase())}
              />
              <p className="text-xs text-on-surface-variant flex items-start gap-1 mt-1">
                <span className="text-brand-yellow font-bold text-lg leading-3">*</span>
                Vui lòng nhập chính xác tên chủ tài khoản viết hoa không dấu để đảm bảo giao dịch không bị gián đoạn.
              </p>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-outline-variant/30 bg-surface-container-lowest flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy bỏ</Button>
          <Button type="submit" form="add-bank-form" variant="primary" loading={isSubmitting}>Lưu tài khoản</Button>
        </div>
      </div>
    </div>
  );
};
