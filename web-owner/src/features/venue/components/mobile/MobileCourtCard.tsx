import React from 'react';
import type { CourtResponse } from '../../types';
import { 
  Settings2, 
  CheckSquare, 
  Square, 
  Sliders, 
  Power, 
  Wrench, 
  DollarSign,
  Activity
} from 'lucide-react';

interface MobileCourtCardProps {
  court: CourtResponse;
  sportName?: string;
  isSelected: boolean;
  onToggleSelect: (courtId: string) => void;
  onEditConfig: (court: CourtResponse) => void;
  onQuickToggleStatus: (court: CourtResponse) => void;
  formatVND: (amount: number) => string;
}

export const MobileCourtCard: React.FC<MobileCourtCardProps> = ({
  court,
  sportName,
  isSelected,
  onToggleSelect,
  onEditConfig,
  onQuickToggleStatus,
  formatVND
}) => {
  const getStatusBadge = () => {
    switch (court.status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 text-[10px] font-black">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Đang mở
          </span>
        );
      case 'MAINTENANCE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-black">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Đang bảo trì
          </span>
        );
    }
  };

  return (
    <div 
      className={`bg-white rounded-3xl p-4 border transition-all shadow-2xs ${
        isSelected 
          ? 'border-brand-emerald ring-2 ring-brand-emerald/20 bg-emerald-50/20' 
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Top Row: Checkbox, Name, Status */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => onToggleSelect(court.id)}
            className="touch-target text-slate-400 hover:text-brand-emerald active:scale-95 transition-transform shrink-0"
            title="Chọn sân"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-brand-emerald fill-emerald-50" />
            ) : (
              <Square className="w-5 h-5 text-slate-300" />
            )}
          </button>

          <div className="min-w-0">
            <h4 className="text-sm font-black text-slate-900 truncate tracking-tight">
              {court.name}
            </h4>
            <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-0.5">
              {sportName || 'Sân đấu'}
            </span>
          </div>
        </div>

        <div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Middle Row: Price and Features */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-2 mb-3">
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Đơn giá cơ bản</span>
          <p className="text-sm font-black text-slate-900 tracking-tight">
            {formatVND(court.price || 0)}
            <span className="text-[10px] font-bold text-slate-400 ml-1">/ ca</span>
          </p>
        </div>

        <div className="text-right space-y-0.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Trạng thái sân</span>
          <span className="text-[10px] font-black text-brand-emerald bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 inline-block">
            {court.status === 'ACTIVE' ? 'Sẵn sàng phục vụ' : 'Đang bảo trì'}
          </span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onQuickToggleStatus(court)}
          className={`touch-target flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-black transition-all active:scale-95 min-h-[40px] ${
            status === 'ACTIVE'
              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
          }`}
        >
          {status === 'ACTIVE' ? (
            <>
              <Wrench className="w-3.5 h-3.5" />
              <span>Chuyển bảo trì</span>
            </>
          ) : (
            <>
              <Power className="w-3.5 h-3.5" />
              <span>Mở hoạt động</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onEditConfig(court)}
          className="touch-target flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 active:bg-black text-white text-xs font-black transition-all active:scale-95 min-h-[40px] shadow-2xs"
        >
          <Sliders className="w-3.5 h-3.5 text-brand-yellow" />
          <span>Cấu hình giá</span>
        </button>
      </div>
    </div>
  );
};
export default MobileCourtCard;
