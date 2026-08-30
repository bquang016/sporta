import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { CurrencyInput } from '../../../../components/ui/CurrencyInput';
import { Sliders, X, Check, DollarSign, Clock, Calendar, Sparkles } from 'lucide-react';
import type { CourtResponse } from '../../types';

interface MobileCourtConfigSheetProps {
  isOpen: boolean;
  onClose: () => void;
  court: CourtResponse | null;
  isBulkEdit?: boolean;
  selectedCount?: number;
  editName: string;
  setEditName: (name: string) => void;
  editPrice: string;
  setEditPrice: (p: string) => void;
  editOpStatus: 'ACTIVE' | 'MAINTENANCE';
  setEditOpStatus: (s: 'ACTIVE' | 'MAINTENANCE') => void;
  onSave: () => void;
}

export const MobileCourtConfigSheet: React.FC<MobileCourtConfigSheetProps> = ({
  isOpen,
  onClose,
  court,
  isBulkEdit = false,
  selectedCount = 0,
  editName,
  setEditName,
  editPrice,
  setEditPrice,
  editOpStatus,
  setEditOpStatus,
  onSave
}) => {
  const navigate = useNavigate();
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
            <h3 className="text-base font-black text-slate-800">
              {isBulkEdit ? `Cấu hình ${selectedCount} sân đã chọn` : `Cấu hình ${court?.name || 'sân'}`}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Thiết lập giá cơ bản và trạng thái hoạt động
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

        {/* Form Content */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1 pb-4">
          {/* Tên sân (Chỉ hiện khi sửa 1 sân) */}
          {!isBulkEdit && (
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                Tên sân
              </label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-brand-emerald focus:bg-white"
              />
            </div>
          )}

          {/* Đơn giá / ca */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
              Đơn giá cơ bản / ca chơi (VND)
            </label>
            <CurrencyInput
              value={parseFloat(editPrice) || 0}
              onChange={(val) => setEditPrice(val.toString())}
              className="w-full text-xs font-bold"
            />
          </div>

          {/* AI Pricing Recommendation Link */}
          <div 
            onClick={() => {
              onClose();
              navigate('/pricing');
            }}
            className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-brand-emerald shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-black text-slate-800 truncate">
                  Xem gợi ý giá thông minh từ AI
                </p>
                <p className="text-[9px] text-emerald-800 font-semibold truncate">
                  Tối ưu doanh thu cho các khung giờ vàng & ca vắng
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black text-brand-emerald shrink-0">
              Khám phá ➔
            </span>
          </div>

          {/* Trạng thái hoạt động */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
              Trạng thái sân
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'ACTIVE' as const, label: 'Hoạt động', color: 'bg-emerald-50 border-brand-emerald text-emerald-900', dot: 'bg-emerald-500' },
                { id: 'MAINTENANCE' as const, label: 'Bảo trì', color: 'bg-amber-50 border-amber-400 text-amber-900', dot: 'bg-amber-500' },
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setEditOpStatus(st.id)}
                  className={`touch-target py-2.5 px-2 rounded-2xl border text-[11px] font-black flex flex-col items-center justify-center gap-1 transition-all ${
                    editOpStatus === st.id
                      ? `${st.color} shadow-xs ring-1 ring-emerald-500/30`
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onSave}
            className="touch-target w-full py-3.5 bg-[#064e3b] active:bg-emerald-950 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5 min-h-[46px]"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Lưu cấu hình</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
export default MobileCourtConfigSheet;
