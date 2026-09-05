import React, { useState } from 'react';
import type { Pitch, PitchStatus } from '../../types';
import { 
  Radio, 
  ChevronDown, 
  SlidersHorizontal, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  X,
  Sparkles
} from 'lucide-react';

interface MobilePitchMonitorProps {
  currentPitches: Pitch[];
  isPitchesExpanded: boolean;
  setIsPitchesExpanded: (val: boolean) => void;
  onInitiateStatusChange: (pitch: Pitch, nextStatus: PitchStatus) => void;
}

type StatusFilter = 'all' | 'available' | 'busy' | 'maintenance';

export const MobilePitchMonitor: React.FC<MobilePitchMonitorProps> = ({
  currentPitches,
  isPitchesExpanded,
  setIsPitchesExpanded,
  onInitiateStatusChange
}) => {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [activePitchForAction, setActivePitchForAction] = useState<Pitch | null>(null);

  // Counts
  const counts = {
    all: currentPitches.length,
    available: currentPitches.filter(p => p.status === 'available').length,
    busy: currentPitches.filter(p => p.status === 'busy').length,
    maintenance: currentPitches.filter(p => p.status === 'maintenance').length,
  };

  const filteredPitches = currentPitches.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const displayPitches = isPitchesExpanded 
    ? filteredPitches 
    : filteredPitches.slice(0, 4);

  const getStatusBadge = (status: PitchStatus) => {
    switch (status) {
      case 'available':
        return {
          label: 'Trống',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500 animate-pulse',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        };
      case 'busy':
        return {
          label: 'Đang bận',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />
        };
      case 'maintenance':
        return {
          label: 'Bảo trì',
          bg: 'bg-red-50 text-red-800 border-red-200',
          dot: 'bg-red-500',
          icon: <Wrench className="w-3.5 h-3.5 text-red-600" />
        };
    }
  };

  return (
    <>
      <section className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#064e3b] flex items-center justify-center font-bold">
              <Radio className="w-4 h-4 text-[#064e3b] animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                Trạng thái sân trực tiếp
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Chạm vào sân để đổi trạng thái nhanh</p>
            </div>
          </div>

          <span className="text-[10px] font-black text-[#064e3b] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            {counts.available}/{counts.all} Sẵn sàng
          </span>
        </div>

        {/* Filter Chips Carousel (React Native style horizontal scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scroll-x-touch pb-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`touch-target shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              filter === 'all'
                ? 'bg-[#064e3b] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Tất cả</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${filter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('available')}
            className={`touch-target shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              filter === 'available'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Trống</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${filter === 'available' ? 'bg-white/20 text-white' : 'bg-emerald-200/60 text-emerald-800'}`}>
              {counts.available}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('busy')}
            className={`touch-target shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              filter === 'busy'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Đang bận</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${filter === 'busy' ? 'bg-white/20 text-white' : 'bg-amber-200/60 text-amber-800'}`}>
              {counts.busy}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('maintenance')}
            className={`touch-target shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              filter === 'maintenance'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-800 hover:bg-red-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Bảo trì</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${filter === 'maintenance' ? 'bg-white/20 text-white' : 'bg-red-200/60 text-red-800'}`}>
              {counts.maintenance}
            </span>
          </button>
        </div>

        {/* Pitches List */}
        <div className="space-y-2">
          {displayPitches.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Không có sân nào ở trạng thái này
            </div>
          ) : (
            displayPitches.map((p) => {
              const badge = getStatusBadge(p.status);
              return (
                <div
                  key={p.id}
                  onClick={() => setActivePitchForAction(p)}
                  className="p-3.5 rounded-2xl border border-slate-200/70 bg-white hover:border-slate-300 active:scale-[0.99] transition-all flex items-center justify-between gap-3 shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-700 text-xs shrink-0 border border-slate-200/60">
                      {p.name.replace(/Sân\s*/i, 'S')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-xs text-slate-800 truncate">{p.name}</h4>
                        <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {p.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Nhấn để cập nhật trạng thái
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-xl border ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Expand / Collapse Button */}
        {filteredPitches.length > 4 && (
          <button
            type="button"
            onClick={() => setIsPitchesExpanded(!isPitchesExpanded)}
            className="w-full pt-2 border-t border-slate-100 text-[11px] font-black text-[#064e3b] uppercase tracking-wider text-center flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <span>{isPitchesExpanded ? 'Thu gọn danh sách' : `Xem thêm ${filteredPitches.length - 4} sân khác`}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPitchesExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </section>

      {/* Quick Status Action Sheet Bottom Modal */}
      {activePitchForAction && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div 
            className="fixed inset-0"
            onClick={() => setActivePitchForAction(null)}
          />
          <div 
            className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] p-6 shadow-2xl z-10 animate-slideUp space-y-4"
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto" />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cập nhật trạng thái sân</span>
                <h3 className="text-base font-black text-slate-800 mt-0.5">{activePitchForAction.name} ({activePitchForAction.type})</h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePitchForAction(null)}
                className="touch-target w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {/* Option 1: Available */}
              <button
                type="button"
                onClick={() => {
                  onInitiateStatusChange(activePitchForAction, 'available');
                  setActivePitchForAction(null);
                }}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                  activePitchForAction.status === 'available'
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-emerald-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Sân trống (Sẵn sàng)</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Sân có thể nhận lịch đặt mới</p>
                  </div>
                </div>
                {activePitchForAction.status === 'available' && (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Hiện tại</span>
                )}
              </button>

              {/* Option 2: Busy */}
              <button
                type="button"
                onClick={() => {
                  onInitiateStatusChange(activePitchForAction, 'busy');
                  setActivePitchForAction(null);
                }}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                  activePitchForAction.status === 'busy'
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-amber-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Đang bận (Có khách thi đấu)</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Khách đang sử dụng sân</p>
                  </div>
                </div>
                {activePitchForAction.status === 'busy' && (
                  <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Hiện tại</span>
                )}
              </button>

              {/* Option 3: Maintenance */}
              <button
                type="button"
                onClick={() => {
                  onInitiateStatusChange(activePitchForAction, 'maintenance');
                  setActivePitchForAction(null);
                }}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                  activePitchForAction.status === 'maintenance'
                    ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-red-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Bảo trì (Tạm ngưng)</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Sửa chữa mặt cỏ, đèn chiếu sáng...</p>
                  </div>
                </div>
                {activePitchForAction.status === 'maintenance' && (
                  <span className="text-[10px] font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-full">Hiện tại</span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActivePitchForAction(null)}
              className="w-full py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs active:bg-slate-200 transition-colors"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default MobilePitchMonitor;
