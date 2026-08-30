import React from 'react';
import { createPortal } from 'react-dom';
import { Power, X, Check, Building2, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { VenueResponse } from '../../types';

interface MobileVenueStatusSheetProps {
  isOpen: boolean;
  onClose: () => void;
  venue: VenueResponse | null;
  onSelectStatus: (status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED') => void;
}

export const MobileVenueStatusSheet: React.FC<MobileVenueStatusSheetProps> = ({
  isOpen,
  onClose,
  venue,
  onSelectStatus
}) => {
  if (!isOpen || typeof document === 'undefined' || !venue) return null;

  const currentStatus = venue.status || 'ACTIVE';

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
            <h3 className="text-base font-black text-slate-800">Trạng thái vận hành cơ sở</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{venue.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1 pb-4">
          {/* Active Option */}
          <button
            type="button"
            onClick={() => onSelectStatus('ACTIVE')}
            className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all active:scale-[0.98] ${
              currentStatus === 'ACTIVE'
                ? 'bg-emerald-50 border-brand-emerald shadow-xs ring-1 ring-brand-emerald/30'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900">Đang hoạt động (Mở đón khách)</h4>
                {currentStatus === 'ACTIVE' && (
                  <div className="w-5 h-5 rounded-full bg-brand-emerald text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                Người dùng trên ứng dụng Sporta có thể tìm kiếm, xem lịch và đặt sân bình thường.
              </p>
            </div>
          </button>

          {/* Maintenance Option */}
          <button
            type="button"
            onClick={() => onSelectStatus('MAINTENANCE')}
            className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all active:scale-[0.98] ${
              currentStatus === 'MAINTENANCE'
                ? 'bg-amber-50 border-amber-400 shadow-xs ring-1 ring-amber-400/30'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-black">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900">Tạm ngưng nhận khách / Bảo trì</h4>
                {currentStatus === 'MAINTENANCE' && (
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                Tạm dừng nhận lịch đặt online mới. Khách hàng sẽ thấy nhãn cơ sở đang tạm nghỉ bảo trì.
              </p>
            </div>
          </button>

          {/* Closed Option */}
          <button
            type="button"
            onClick={() => onSelectStatus('CLOSED')}
            className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all active:scale-[0.98] ${
              currentStatus === 'CLOSED'
                ? 'bg-red-50 border-red-400 shadow-xs ring-1 ring-red-400/30'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 font-black">
              <Power className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900">Đóng cửa khẩn cấp</h4>
                {currentStatus === 'CLOSED' && (
                  <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                Đóng cửa toàn bộ cụm sân. Các ca đã đặt sẽ cần xử lý giải quyết.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
export default MobileVenueStatusSheet;
