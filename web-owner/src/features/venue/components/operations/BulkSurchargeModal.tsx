import React from 'react';
import { Modal } from '../../../../components/ui/Modal';

interface BulkSurchargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  surchargeAmount: string;
  setSurchargeAmount: (val: string) => void;
  surchargeCourtIds: string[];
  handleApplySurcharge: () => void;
  formatVND: (amount: number) => string;
}

export const BulkSurchargeModal = ({
  isOpen,
  onClose,
  surchargeAmount,
  setSurchargeAmount,
  surchargeCourtIds,
  handleApplySurcharge,
  formatVND
}: BulkSurchargeModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title="Cấu hình phụ phí hàng loạt" maxWidth="sm"
      footer={
        <>
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs cursor-pointer active:scale-95 transition-all">
            Huỷ
          </button>
          <button type="button" onClick={handleApplySurcharge}
            className="bg-brand-yellow hover:bg-yellow-400 text-primary border-b-2 border-yellow-600 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer">
            Áp dụng
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500 font-bold select-none leading-relaxed">
          Nhập số tiền phụ phí (VND/giờ) sẽ được áp dụng cho {surchargeCourtIds.length} sân đang được chọn.
        </p>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block select-none">Mức phụ phí thêm (VND)</label>
          <div className="relative flex items-center">
            <input type="number" value={surchargeAmount} onChange={e => setSurchargeAmount(e.target.value)}
              className="w-full text-xs font-bold text-slate-755 px-3.5 py-2.5 pr-12 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald"
              min={0} placeholder="VD: 50000" />
            <span className="absolute right-3.5 text-[10px] font-extrabold text-slate-400 select-none">VND</span>
          </div>
          {surchargeAmount && !isNaN(parseFloat(surchargeAmount)) && (
            <p className="text-[9px] text-brand-emerald font-black select-none">
              Quy đổi: +{formatVND(parseFloat(surchargeAmount))} phụ thu / giờ
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
