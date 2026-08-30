import React from 'react';
import { createPortal } from 'react-dom';
import { CurrencyInput } from '../../../../components/ui/CurrencyInput';
import { Plus, X, Layers, Power, Wrench } from 'lucide-react';

interface MobileAddCourtSheetProps {
  isOpen: boolean;
  onClose: () => void;
  courtName: string;
  setCourtName: (name: string) => void;
  courtPrice: string;
  setCourtPrice: (p: string) => void;
  courtStatus: 'ACTIVE' | 'MAINTENANCE';
  setCourtStatus: (s: 'ACTIVE' | 'MAINTENANCE') => void;
  validationErrors?: Record<string, string>;
  onSubmit: () => void;
}

export const MobileAddCourtSheet: React.FC<MobileAddCourtSheetProps> = ({
  isOpen,
  onClose,
  courtName,
  setCourtName,
  courtPrice,
  setCourtPrice,
  courtStatus,
  setCourtStatus,
  validationErrors = {},
  onSubmit
}) => {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div 
        className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] p-6 shadow-2xl z-10 max-h-[85dvh] flex flex-col animate-slideUp font-sans"
        style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Sheet Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-800">Thêm sân lẻ mới</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Tạo sân bóng và thiết lập bảng giá cơ bản</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1 pb-4">
          {/* Tên sân */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
              Tên sân lẻ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Sân 1 (VIP), Sân 2..."
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-brand-emerald focus:bg-white"
            />
            {validationErrors.name && (
              <p className="text-[10px] text-red-500 font-bold mt-1">{validationErrors.name}</p>
            )}
          </div>

          {/* Đơn giá / ca */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
              Đơn giá / ca chơi cơ bản (VND) <span className="text-red-500">*</span>
            </label>
            <CurrencyInput
              value={parseFloat(courtPrice) || 0}
              onChange={(val) => setCourtPrice(val.toString())}
              className="w-full text-xs font-bold"
            />
            {validationErrors.price && (
              <p className="text-[10px] text-red-500 font-bold mt-1">{validationErrors.price}</p>
            )}
          </div>

          {/* Trạng thái ban đầu */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
              Trạng thái ban đầu
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCourtStatus('ACTIVE')}
                className={`touch-target py-2.5 px-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  courtStatus === 'ACTIVE'
                    ? 'bg-emerald-50 border-brand-emerald text-emerald-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Mở hoạt động</span>
              </button>

              <button
                type="button"
                onClick={() => setCourtStatus('MAINTENANCE')}
                className={`touch-target py-2.5 px-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  courtStatus === 'MAINTENANCE'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Tạm bảo trì</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onSubmit}
            className="touch-target w-full py-3.5 bg-brand-emerald active:bg-emerald-950 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5 min-h-[46px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Xác nhận thêm sân</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
export default MobileAddCourtSheet;
