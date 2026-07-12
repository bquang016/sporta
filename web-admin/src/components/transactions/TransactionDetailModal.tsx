import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

type PaymentMethod = 'MOMO' | 'VNPAY' | 'BANK_TRANSFER';
type TransactionStatus = 'SUCCESS' | 'FAILED' | 'REFUNDING' | 'REFUNDED';

interface Transaction {
  id: string;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  facilityCluster: string;
  courtName: string;
  sportType: string;
  bookingDate: string;
  bookingSlot: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  createdAt: string;
  reason?: string;
  updatedAt?: string;
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTx: Transaction | null;
  formatCurrency: (val: number) => string;
  getStatusBadge: (status: TransactionStatus) => React.ReactNode;
  getPaymentMethodBadge: (method: PaymentMethod) => React.ReactNode;
  onRefundRequest: () => void;
  onRefundComplete: () => void;
  onRefundReject: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  selectedTx,
  formatCurrency,
  getStatusBadge,
  getPaymentMethodBadge,
  onRefundRequest,
  onRefundComplete,
  onRefundReject
}) => {
  if (!selectedTx) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title="Thông Tin Chi Tiết Giao Dịch Đặt Sân"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1 select-none">
            {selectedTx.updatedAt && `Cập nhật cuối: ${new Date(selectedTx.updatedAt).toLocaleString('vi-VN')}`}
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Đóng
            </Button>
            
            {/* Supreme Admin Actions */}
            {selectedTx.status === 'SUCCESS' && (
              <Button
                variant="primary"
                onClick={onRefundRequest}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Yêu cầu hoàn tiền
              </Button>
            )}
            
            {selectedTx.status === 'REFUNDING' && (
              <>
                <Button
                  variant="ghost"
                  onClick={onRefundReject}
                  className="border-red-300 text-red-600 hover:bg-red-50 font-bold"
                >
                  Từ chối hoàn tiền
                </Button>
                <Button
                  variant="secondary"
                  onClick={onRefundComplete}
                  className="bg-brand-emerald text-white font-bold"
                >
                  Xác nhận đã hoàn tiền
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Split grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Customer & Court info */}
          <div className="space-y-4">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thông tin khách hàng</h4>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500">Họ và tên: <span className="font-bold text-slate-800">{selectedTx.playerName}</span></p>
                <p className="text-xs font-semibold text-slate-500">Địa chỉ Email: <span className="font-mono font-bold text-slate-700">{selectedTx.playerEmail}</span></p>
                <p className="text-xs font-semibold text-slate-500">Số điện thoại: <span className="font-bold text-slate-700">{selectedTx.playerPhone}</span></p>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thông tin sân bãi</h4>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500">Cụm sân bãi: <span className="font-bold text-slate-800">{selectedTx.facilityCluster}</span></p>
                <p className="text-xs font-semibold text-slate-500">Sân cụ thể: <span className="font-bold text-slate-800">{selectedTx.courtName}</span></p>
                <p className="text-xs font-semibold text-slate-500">Môn thể thao: <span className="font-bold text-brand-emerald">{selectedTx.sportType}</span></p>
                <p className="text-xs font-semibold text-slate-500">Khung giờ đặt: <span className="font-bold text-slate-800">{selectedTx.bookingSlot}</span></p>
                <p className="text-xs font-semibold text-slate-500">Ngày chơi bóng: <span className="font-bold text-slate-800">{new Date(selectedTx.bookingDate).toLocaleDateString('vi-VN')}</span></p>
              </div>
            </div>
          </div>

          {/* Right Column: Financial details & timeline */}
          <div className="space-y-4">
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chi tiết giao dịch</h4>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Mã giao dịch:</span>
                  <span className="font-black text-slate-800 text-xs font-mono">#{selectedTx.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Phương thức:</span>
                  <span>{getPaymentMethodBadge(selectedTx.paymentMethod)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Giá trị thanh toán:</span>
                  <span className="font-black text-slate-800 text-sm">{formatCurrency(selectedTx.amount)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/50 pt-2">
                  <span className="text-xs font-bold text-slate-500">Trạng thái hiện tại:</span>
                  <span>{getStatusBadge(selectedTx.status)}</span>
                </div>
              </div>
            </div>

            {/* Timeline / Reason Box */}
            {(selectedTx.reason || selectedTx.updatedAt) && (
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ghi chú & Lịch sử giải quyết</h4>
                <div className="bg-red-50/30 border border-dashed border-red-100 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-red-800">Lịch sử sự vụ:</p>
                  <p className="text-xs text-slate-600 leading-normal font-semibold">
                    {selectedTx.reason}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Warning text block */}
        {selectedTx.status === 'SUCCESS' && (
          <div className="bg-yellow-50/50 border border-dashed border-yellow-200 rounded-2xl p-4 flex gap-3 items-start select-none">
            <span className="text-lg mt-0.5">⚖️</span>
            <div className="space-y-1">
              <h5 className="text-xs font-black text-amber-800 uppercase tracking-wider">Hỗ trợ tranh chấp & Hoàn trả tiền</h5>
              <p className="text-[10px] text-slate-500 font-bold leading-normal">
                Là Quản trị viên, bạn có quyền tối cao hủy đặt sân và chuyển giao dịch sang trạng thái Hoàn tiền nếu xảy ra khiếu nại chưa được giải quyết giữa chủ sân và người đặt.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
