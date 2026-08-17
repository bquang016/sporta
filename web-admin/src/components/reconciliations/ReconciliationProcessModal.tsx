import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { uploadImage } from '@/api/adminWithdrawalApi';
import type { WithdrawalResponse } from '@/api/adminWithdrawalApi';

interface ReconciliationProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: WithdrawalResponse | null;
  onApprove: (id: string, proofUrl: string, note?: string) => void;
  onReject: (id: string, reason: string) => void;
}

type ActionType = 'APPROVE' | 'REJECT' | null;

export const ReconciliationProcessModal: React.FC<ReconciliationProcessModalProps> = ({
  isOpen,
  onClose,
  record,
  onApprove,
  onReject
}) => {
  const { showToast } = useToast();
  
  const [actionType, setActionType] = useState<ActionType>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActionType(null);
      setProofUrl('');
      setRejectReason('');
      setIsProcessing(false);
    }
  }, [isOpen, record]);

  if (!record) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', `Đã sao chép ${label}!`);
  };

  const getVietQRBankCode = (bankName: string) => {
    const uppercaseName = bankName.toUpperCase();
    if (uppercaseName.includes('MB') || uppercaseName.includes('MILITARY')) return 'MB';
    if (uppercaseName.includes('TECHCOMBANK') || uppercaseName.includes('TCB')) return 'TCB';
    if (uppercaseName.includes('VIETCOMBANK') || uppercaseName.includes('VCB')) return 'VCB';
    if (uppercaseName.includes('BIDV')) return 'BIDV';
    if (uppercaseName.includes('VIETINBANK') || uppercaseName.includes('CTG')) return 'ICB';
    if (uppercaseName.includes('ACB')) return 'ACB';
    if (uppercaseName.includes('VPBANK') || uppercaseName.includes('VPB')) return 'VPB';
    if (uppercaseName.includes('SACOMBANK')) return 'STB';
    return bankName.substring(0, 5).toUpperCase(); // Fallback
  };

  const bankCode = getVietQRBankCode(record.bankCode);
  const transferMessage = `Thanh toan rut tien ${record.ownerName}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9 ]/g, '');
  const vietQrUrl = `https://img.vietqr.io/image/${bankCode}-${record.bankAccountNumber}-compact2.jpg?amount=${record.amount}&addInfo=${encodeURIComponent(transferMessage)}&accountName=${encodeURIComponent(record.bankAccountName)}`;

  const handleSubmit = () => {
    if (actionType === 'APPROVE') {
      if (!proofUrl.trim()) {
        showToast('error', 'Vui lòng cung cấp link ảnh chụp biên lai chuyển khoản');
        return;
      }
      setIsProcessing(true);
      onApprove(record.id, proofUrl, '');
    } else if (actionType === 'REJECT') {
      if (!rejectReason.trim()) {
        showToast('error', 'Vui lòng nhập lý do từ chối');
        return;
      }
      setIsProcessing(true);
      onReject(record.id, rejectReason);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      setProofUrl(url);
      showToast('success', 'Tải ảnh lên thành công!');
    } catch (error: any) {
      showToast('error', error.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={`Xử lý rút tiền: ${record.ownerName}`}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" onClick={onClose} size="sm" className="text-xs">
            Hủy bỏ
          </Button>
          {actionType && (
            <Button
              variant={actionType === 'APPROVE' ? 'secondary' : 'danger'}
              size="sm"
              onClick={handleSubmit}
              disabled={isProcessing}
              className={`text-xs font-bold ${actionType === 'APPROVE' ? 'bg-brand-emerald text-white' : ''}`}
            >
              {isProcessing ? 'Đang xử lý...' : (actionType === 'APPROVE' ? 'Xác nhận Duyệt' : 'Xác nhận Từ chối')}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* Tóm tắt giao dịch */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Số tiền rút</p>
            <p className="font-black text-brand-emerald text-lg">{record.formattedAmount}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tài khoản nhận</p>
            <p className="text-xs font-bold text-slate-800">{record.bankCode} - {record.bankAccountNumber}</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase">{record.bankAccountName}</p>
          </div>
        </div>

        {/* Chọn hành động */}
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Vui lòng chọn hướng xử lý</h4>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${actionType === 'APPROVE' ? 'border-brand-emerald bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}`}
              onClick={() => setActionType('APPROVE')}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${actionType === 'APPROVE' ? 'border-brand-emerald bg-brand-emerald' : 'border-slate-300'}`}>
                  {actionType === 'APPROVE' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-bold text-emerald-800">Duyệt lệnh</p>
              </div>
              <p className="text-[10px] text-slate-500 ml-6">Đã chuyển khoản thành công và có biên lai.</p>
            </div>

            <div 
              className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${actionType === 'REJECT' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-red-200'}`}
              onClick={() => setActionType('REJECT')}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${actionType === 'REJECT' ? 'border-red-500 bg-red-500' : 'border-slate-300'}`}>
                  {actionType === 'REJECT' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-bold text-red-800">Từ chối lệnh</p>
              </div>
              <p className="text-[10px] text-slate-500 ml-6">Lệnh không hợp lệ hoặc lỗi ngân hàng.</p>
            </div>
          </div>
        </div>

        {/* Nội dung chi tiết theo hành động */}
        <div className="min-h-[220px]">
          {actionType === 'APPROVE' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2 block">Cung cấp bằng chứng</label>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    Vui lòng sử dụng ứng dụng ngân hàng quét mã QR bên cạnh để chuyển số tiền <strong className="text-brand-emerald">{record.formattedAmount}</strong>. Sau khi chuyển thành công, tải ảnh lên hoặc dán link ảnh biên lai vào ô dưới đây.
                  </p>
                  
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="text-xs shrink-0 flex items-center gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      {isUploading ? 'Đang tải...' : 'Tải ảnh lên'}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <input
                      type="text"
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      placeholder="Hoặc dán URL ảnh biên lai..."
                      className="flex-1 w-full border-emerald-200 rounded-lg text-xs px-3 py-2 bg-white focus:ring-emerald-500 focus:border-emerald-500 shadow-sm min-w-0"
                    />
                  </div>
                  
                  {proofUrl && (
                    <div className="mt-3 relative inline-block rounded-xl overflow-hidden border border-emerald-100 shadow-sm group">
                      <img src={proofUrl} alt="Preview" className="h-32 object-contain bg-slate-50" />
                      <button 
                        onClick={() => setProofUrl('')} 
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-slate-500 hover:text-red-500 hover:bg-white transition-colors"
                        title="Xóa ảnh"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}
                  
                  <p className="text-[9px] text-emerald-600/70 italic mt-1.5">*Bắt buộc: Cung cấp ảnh chụp màn hình chuyển khoản thành công.</p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">VietQR</h4>
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl shadow-inner mb-2">
                  <img src={vietQrUrl} alt="VietQR" className="w-36 h-36 object-contain rounded-xl select-none" />
                </div>
                <div className="mt-1 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 w-full flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-500 font-bold truncate">ND: {transferMessage}</span>
                  <button onClick={() => handleCopy(transferMessage, 'nội dung')} className="text-[9px] font-black text-brand-emerald uppercase tracking-wider pl-1.5">Copy</button>
                </div>
              </div>
            </div>
          )}

          {actionType === 'REJECT' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-2 block">Lý do từ chối</label>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Khi bị từ chối, lệnh rút tiền này sẽ bị huỷ bỏ và số tiền sẽ được tự động hoàn trả lại vào ví của Chủ sân. Việc nhập lý do là bắt buộc.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Sai thông tin ngân hàng thụ hưởng, ngân hàng bảo trì..."
                className="w-full border-red-200 rounded-xl text-xs px-3 py-2.5 bg-white focus:ring-red-500 focus:border-red-500 shadow-sm min-h-[100px]"
              />
            </div>
          )}

          {!actionType && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <p className="text-xs font-semibold">Vui lòng chọn 1 trong 2 hành động bên trên để tiếp tục</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
