import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { WithdrawalResponse } from '@/api/adminWithdrawalApi';

interface ReconciliationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: WithdrawalResponse | null;
}

export const ReconciliationDetailModal: React.FC<ReconciliationDetailModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const { showToast } = useToast();
  
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={record.status === 'PENDING' ? '3xl' : '2xl'}
      title={`Chi tiết rút tiền: ${record.ownerName}`}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1 select-none">
            {record.processedAt ? `Xử lý lúc: ${new Date(record.processedAt).toLocaleString('vi-VN')}` : 'Đang chờ xử lý'}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} size="sm" className="text-xs">
              Đóng
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className={`grid grid-cols-1 ${record.status === 'PENDING' ? 'md:grid-cols-2' : ''} gap-6 items-start`}>
          
          {/* Thông tin đối tác & Tài khoản */}
          <div className="space-y-4">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Đối tác thụ hưởng</h4>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500">Tên chủ sân: <span className="font-bold text-slate-800">{record.ownerName}</span></p>
                <p className="text-xs font-semibold text-slate-500">Ngày yêu cầu: <span className="font-bold text-slate-800">{new Date(record.createdAt).toLocaleString('vi-VN')}</span></p>
                <p className="text-xs font-semibold text-slate-500">Số tiền rút: <span className="font-black text-brand-emerald text-sm">{record.formattedAmount}</span></p>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tài khoản thanh toán</h4>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Ngân hàng nhận:</span>
                  <span className="font-bold text-slate-800">{record.bankCode}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 font-mono text-sm">{record.bankAccountNumber}</span>
                    <button onClick={() => handleCopy(record.bankAccountNumber, 'số tài khoản')} className="text-slate-400 hover:text-brand-emerald">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Chủ tài khoản:</span>
                  <span className="font-bold text-slate-800 uppercase">{record.bankAccountName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code (Chỉ hiện khi PENDING) */}
          {record.status === 'PENDING' && (
            <div className="flex flex-col items-center">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 self-start">VietQR Chuyển Khoản Nhanh</h4>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col items-center w-full text-center">
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl mb-3 shadow-inner">
                  <img src={vietQrUrl} alt="VietQR" className="w-48 h-48 object-contain rounded-xl select-none" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Quét QR chuyển tiền</p>
                  <p className="text-[9px] text-slate-400 font-medium leading-relaxed max-w-[220px]">
                    Mở app ngân hàng quét mã này để điền sẵn TK nhận, số tiền <span className="font-bold text-brand-emerald">{record.formattedAmount}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kết quả Xử lý (Chỉ hiện khi đã xử lý xong) */}
        {record.status !== 'PENDING' && (
          <div className="border-t border-slate-200 pt-6 mt-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Kết quả xử lý</h4>
            
            {record.status === 'COMPLETED' ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 rounded-full bg-white text-brand-emerald flex items-center justify-center border border-emerald-100 shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-800 mb-1">Đã Duyệt & Chuyển Khoản Thành Công</p>
                  <p className="text-xs text-emerald-600/80 mb-3">Lệnh rút tiền đã được xác nhận và số tiền đã được chuyển đến đối tác.</p>
                  {record.transferProofUrl && (
                    <div className="inline-flex items-center gap-2 bg-white border border-emerald-200 rounded-lg px-3 py-1.5 shadow-sm hover:shadow transition-shadow">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <a href={record.transferProofUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-700 hover:text-emerald-900">
                        Xem Ảnh Biên Lai Giao Dịch
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 rounded-full bg-white text-red-500 flex items-center justify-center border border-red-100 shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-800 mb-1">Đã Từ Chối & Hoàn Tiền</p>
                  <p className="text-xs text-red-600/80 mb-2">Lệnh rút tiền bị huỷ. Số dư đã được hoàn trả lại vào ví của Chủ sân.</p>
                  <div className="bg-white border border-red-200 rounded-lg p-3 inline-block min-w-[200px] shadow-sm">
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Lý do từ chối:</p>
                    <p className="text-xs font-semibold text-red-700">{record.adminNote}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
};
