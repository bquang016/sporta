import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '../../../../components/ui/Modal';
import { useIsMobile } from '../../../../hooks/useIsMobile';
import { useBodyScrollLock } from '../../../../hooks/useBodyScrollLock';
import type { CourtHeatmapDto, SlotHeatmapItem } from '../../types/dynamicPricing';
import { 
  Layers, 
  Info, 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  ChevronRight,
  Flame
} from 'lucide-react';

interface OccupancyHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtHeatmaps: CourtHeatmapDto[];
  formatVND: (n: number) => string;
}

const DOW_LABELS = [
  { val: 1, label: 'Thứ 2', short: 'T2' },
  { val: 2, label: 'Thứ 3', short: 'T3' },
  { val: 3, label: 'Thứ 4', short: 'T4' },
  { val: 4, label: 'Thứ 5', short: 'T5' },
  { val: 5, label: 'Thứ 6', short: 'T6' },
  { val: 6, label: 'Thứ 7', short: 'T7' },
  { val: 7, label: 'Chủ Nhật', short: 'CN' },
];

export const OccupancyHeatmapModal: React.FC<OccupancyHeatmapModalProps> = ({
  isOpen,
  onClose,
  courtHeatmaps,
  formatVND,
}) => {
  useBodyScrollLock(isOpen);
  const isMobile = useIsMobile();
  const [selectedCourtId, setSelectedCourtId] = useState<string>(
    courtHeatmaps.length > 0 ? courtHeatmaps[0].courtId : ''
  );
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(1);
  const [hoveredSlot, setHoveredSlot] = useState<{
    item: SlotHeatmapItem;
    dowLabel: string;
  } | null>(null);

  const currentCourt =
    courtHeatmaps.find((c) => c.courtId === selectedCourtId) ||
    (courtHeatmaps.length > 0 ? courtHeatmaps[0] : null);

  // Group slots by time (for desktop matrix)
  const timeSlotKeys = Array.from(
    new Set(currentCourt?.slots.map((s) => `${s.startTime}-${s.endTime}`) || [])
  ).sort();

  // Slots for the selected day (for mobile timeline)
  const mobileDaySlots = (currentCourt?.slots || [])
    .filter((s) => s.dayOfWeek === selectedDayOfWeek)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const getHeatmapColor = (occupancyRate: number) => {
    if (occupancyRate === 0) return 'bg-slate-100/90 text-slate-400 border-slate-200/60';
    if (occupancyRate < 0.40) return 'bg-sky-50 text-sky-700 border-sky-200/80 font-medium';
    if (occupancyRate <= 0.70) return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
    if (occupancyRate <= 0.90) return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
    return 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold';
  };

  const getStatusBadge = (occupancyRate: number) => {
    if (occupancyRate === 0) return { label: 'Trống 0%', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    if (occupancyRate < 0.40) return { label: 'Vắng khách', color: 'bg-sky-50 text-sky-700 border-sky-200' };
    if (occupancyRate <= 0.70) return { label: 'Ổn định', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
    if (occupancyRate <= 0.90) return { label: 'Đông khách', color: 'bg-amber-50 text-amber-800 border-amber-300' };
    return { label: 'Giờ vàng', color: 'bg-rose-50 text-rose-800 border-rose-300' };
  };

  if (!isOpen) return null;

  // ══════════════════════════════════════════════════════════
  // 📱 MOBILE CUSTOM BOTTOM SHEET
  // ══════════════════════════════════════════════════════════
  if (isMobile && typeof document !== 'undefined') {
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-end justify-center font-sans select-none animate-fadeIn">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose} 
        />

        {/* Bottom Sheet Modal */}
        <div 
          className="relative w-full bg-white rounded-t-[2.25rem] shadow-2xl z-10 flex flex-col max-h-[90dvh] overflow-hidden animate-slideUp"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
        >
          {/* Drag Handle */}
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-2 shrink-0" />

          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-brand-emerald uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-brand-emerald" />
                <span>Bản Đồ Nhiệt</span>
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight mt-0.5">
                Tỷ Lệ Lấp Đầy & Nhu Cầu
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="touch-target w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold active:scale-95 text-xs"
            >
              ✕
            </button>
          </div>

          {/* Court Selector Pills */}
          {courtHeatmaps.length > 1 && (
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Sân:
              </span>
              {courtHeatmaps.map((c) => (
                <button
                  key={c.courtId}
                  type="button"
                  onClick={() => setSelectedCourtId(c.courtId)}
                  className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    (selectedCourtId === c.courtId || (!selectedCourtId && currentCourt?.courtId === c.courtId))
                      ? 'bg-brand-emerald text-white shadow-xs font-black'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {c.courtName}
                </button>
              ))}
            </div>
          )}

          {/* 7-Day Tab Bar */}
          <div className="grid grid-cols-7 gap-1 px-4 py-2 bg-slate-50/80 border-b border-slate-100 shrink-0">
            {DOW_LABELS.map((d) => {
              const isActive = selectedDayOfWeek === d.val;
              return (
                <button
                  key={d.val}
                  type="button"
                  onClick={() => setSelectedDayOfWeek(d.val)}
                  className={`touch-target py-2 rounded-xl text-center transition-all flex flex-col items-center justify-center ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm font-black'
                      : 'text-slate-500 hover:text-slate-800 font-bold text-xs'
                  }`}
                >
                  <span className="text-[11px]">{d.short}</span>
                </button>
              );
            })}
          </div>

          {/* Day Shift Timeline Cards List */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 matrix-scroll">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
              <span>{DOW_LABELS.find(d => d.val === selectedDayOfWeek)?.label} • {currentCourt?.courtName}</span>
              <span>{mobileDaySlots.length} khung giờ</span>
            </div>

            {mobileDaySlots.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <Clock className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Không có dữ liệu ca chơi</p>
                <p className="text-[10px] text-slate-400">Vui lòng kiểm tra giờ mở cửa của cụm sân</p>
              </div>
            ) : (
              mobileDaySlots.map((slot, idx) => {
                const orPercent = Math.round(slot.occupancyRate * 100);
                const badge = getStatusBadge(slot.occupancyRate);
                const isSurge = slot.suggestedPrice && slot.suggestedPrice > slot.currentPrice;
                const isDiscount = slot.suggestedPrice && slot.suggestedPrice < slot.currentPrice;

                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2.5 shadow-2xs"
                  >
                    {/* Top row: Time & Occupancy Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${badge.color}`}>
                        {orPercent}% • {badge.label}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          orPercent > 70 ? 'bg-rose-500' : orPercent >= 40 ? 'bg-emerald-500' : orPercent > 0 ? 'bg-sky-500' : 'bg-slate-300'
                        }`}
                        style={{ width: `${Math.max(4, orPercent)}%` }}
                      />
                    </div>

                    {/* Bottom: Bookings Count & Price Comparison */}
                    <div className="flex items-center justify-between text-xs pt-0.5 border-t border-slate-200/50">
                      <span className="text-[10px] text-slate-400 font-bold">
                        Đã đặt {slot.bookedCount}/{slot.activeWeeks || 6} tuần
                      </span>

                      <div className="flex items-center gap-2 text-right">
                        <span className="text-slate-500 font-bold text-[11px]">
                          {formatVND(slot.currentPrice)}
                        </span>
                        {slot.suggestedPrice && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-300">➔</span>
                            <span className={`font-black text-xs flex items-center gap-0.5 ${isSurge ? 'text-rose-600' : isDiscount ? 'text-emerald-700' : 'text-slate-700'}`}>
                              <Sparkles className="w-2.5 h-2.5" />
                              {formatVND(slot.suggestedPrice)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Legend Mini Strip */}
          <div className="px-5 pt-2 border-t border-slate-100 flex items-center justify-around text-[10px] text-slate-500 font-bold shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> &lt;40% Vắng
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 40-70% Ổn định
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;70% Giờ vàng
            </span>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ══════════════════════════════════════════════════════════
  // 💻 DESKTOP MATRIX MODAL (PRESERVED 100%)
  // ══════════════════════════════════════════════════════════
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl" title="Bản Đồ Nhiệt Tỷ Lệ Lấp Đầy & Nhu Cầu">
      <div className="p-5 space-y-5 font-sans select-none">
        {/* Court Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 shrink-0">
            <Layers className="w-4 h-4 text-slate-400" /> Chọn sân:
          </span>
          {courtHeatmaps.map((c) => (
            <button
              key={c.courtId}
              onClick={() => {
                setSelectedCourtId(c.courtId);
                setHoveredSlot(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                (selectedCourtId === c.courtId || (!selectedCourtId && currentCourt?.courtId === c.courtId))
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.courtName}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between flex-wrap gap-3 p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 border border-slate-200/70">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Mức độ lấp đầy:</span>
          </div>

          <div className="flex items-center flex-wrap gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-200" />
              <span>0% (Trống)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-sky-50 border border-sky-200" />
              <span>&lt;40% (Vắng)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-50 border border-emerald-300" />
              <span>40-70% (Ổn định)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-300" />
              <span>70-90% (Đông)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-100 border border-rose-300" />
              <span>&gt;90% (Cao điểm)</span>
            </div>
          </div>
        </div>

        {/* Hovered Slot Detail Card (Dynamic Interactive Inspector) */}
        {hoveredSlot ? (
          <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-4 animate-fadeIn text-xs shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <Calendar className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="font-bold text-sm text-white">
                  {hoveredSlot.dowLabel} ({hoveredSlot.item.startTime} - {hoveredSlot.item.endTime})
                </span>
                <span className="text-slate-400 block text-[11px] mt-0.5">
                  Đã đặt {hoveredSlot.item.bookedCount}/{hoveredSlot.item.activeWeeks} tuần qua • Tỷ lệ {Math.round(hoveredSlot.item.occupancyRate * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-[10px] text-slate-400 block">Giá cơ sở</span>
                <span className="font-semibold text-slate-200">{formatVND(hoveredSlot.item.currentPrice)}</span>
              </div>
              {hoveredSlot.item.suggestedPrice && (
                <div className="pl-3 border-l border-white/20">
                  <span className="text-[10px] text-emerald-300 block">AI Đề xuất</span>
                  <span className="font-black text-sm text-emerald-400">
                    {formatVND(hoveredSlot.item.suggestedPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Rê chuột vào từng ô khung giờ để xem chi tiết lịch sử đặt sân và mức giá đề xuất</span>
          </div>
        )}

        {/* Heatmap Grid */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <th className="p-3 font-bold text-left border-r border-slate-200 min-w-[110px] text-slate-600">
                  Khung Giờ
                </th>
                {DOW_LABELS.map((d) => (
                  <th key={d.val} className="p-3 font-bold border-r border-slate-200 min-w-[90px] text-slate-700">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlotKeys.map((slotKey) => {
                const [start, end] = slotKey.split('-');
                return (
                  <tr key={slotKey} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-2.5 text-left font-semibold text-slate-700 bg-slate-50/60 border-r border-slate-200">
                      {start} - {end}
                    </td>

                    {DOW_LABELS.map((d) => {
                      const item = currentCourt?.slots.find(
                        (s) => s.dayOfWeek === d.val && s.startTime === start
                      );

                      if (!item) {
                        return (
                          <td key={d.val} className="p-2 border-r border-slate-100 text-slate-300">
                            -
                          </td>
                        );
                      }

                      const orPercent = Math.round(item.occupancyRate * 100);
                      const colorClass = getHeatmapColor(item.occupancyRate);

                      return (
                        <td
                          key={d.val}
                          className="p-1 border-r border-slate-100"
                          onMouseEnter={() => setHoveredSlot({ item, dowLabel: d.label })}
                        >
                          <div
                            className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer hover:shadow-sm ${colorClass}`}
                          >
                            <span className="text-xs">{orPercent}%</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
export default OccupancyHeatmapModal;
