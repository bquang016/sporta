import React from 'react';
import { createPortal } from 'react-dom';
import { CurrencyInput } from '../../../../components/ui/CurrencyInput';
import { Zap, X, Check } from 'lucide-react';

interface MobileBulkSurchargeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  surchargeAmount: number;
  setSurchargeAmount: (val: number) => void;
  onApply: () => void;
}

export const MobileBulkSurchargeSheet: React.FC<MobileBulkSurchargeSheetProps> = ({
  isOpen,
  onClose,
  selectedCount,
  surchargeAmount,
  setSurchargeAmount,
  onApply
}) => {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div 
        className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] p-6 shadow-2xl z-10 max-h-[80dvh] flex flex-col animate-slideUp font-sans"
        style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Sheet Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
              <span>Áp phụ phí cho {selectedCount} sân</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Cộng thêm số tiền này vào tất cả các ca đặt của các sân được chọn
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Surcharge Amount Input */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1 pb-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
              Mức phụ phí (VND / ca)
            </label>
            <CurrencyInput
              value={surchargeAmount}
              onChange={setSurchargeAmount}
              className="w-full text-sm font-bold"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-[11px] text-amber-900 font-medium">
            💡 <strong>Lưu ý:</strong> Mức phụ phí này sẽ được tính kèm theo khi khách đặt sân hoặc chủ sân tạo ca xé vé ghép cặp.
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onApply}
            className="touch-target w-full py-3.5 bg-brand-yellow active:bg-yellow-400 text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5 min-h-[46px]"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Xác nhận áp phụ phí</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
export default MobileBulkSurchargeSheet;
