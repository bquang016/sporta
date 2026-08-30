import React, { useState } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import type { CourtHeatmapDto, SlotHeatmapItem } from '../../types/dynamicPricing';
import { Layers, Info, Calendar, Clock, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

interface OccupancyHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtHeatmaps: CourtHeatmapDto[];
  formatVND: (n: number) => string;
}

const DOW_LABELS = [
  { val: 1, label: 'Thứ 2' },
  { val: 2, label: 'Thứ 3' },
  { val: 3, label: 'Thứ 4' },
  { val: 4, label: 'Thứ 5' },
  { val: 5, label: 'Thứ 6' },
  { val: 6, label: 'Thứ 7' },
  { val: 7, label: 'Chủ Nhật' },
];

export const OccupancyHeatmapModal: React.FC<OccupancyHeatmapModalProps> = ({
  isOpen,
  onClose,
  courtHeatmaps,
  formatVND,
}) => {
  const [selectedCourtId, setSelectedCourtId] = useState<string>(
    courtHeatmaps.length > 0 ? courtHeatmaps[0].courtId : ''
  );
  const [hoveredSlot, setHoveredSlot] = useState<{
    item: SlotHeatmapItem;
    dowLabel: string;
  } | null>(null);

  const currentCourt =
    courtHeatmaps.find((c) => c.courtId === selectedCourtId) ||
    (courtHeatmaps.length > 0 ? courtHeatmaps[0] : null);

  // Group slots by time
  const timeSlotKeys = Array.from(
    new Set(currentCourt?.slots.map((s) => `${s.startTime}-${s.endTime}`) || [])
  ).sort();

  const getHeatmapColor = (occupancyRate: number) => {
    if (occupancyRate === 0) return 'bg-slate-100/90 text-slate-400 border-slate-200/60';
    if (occupancyRate < 0.40) return 'bg-sky-50 text-sky-700 border-sky-200/80 font-medium';
    if (occupancyRate <= 0.70) return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
    if (occupancyRate <= 0.90) return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
    return 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl" title="Bản Đồ Nhiệt Tỷ Lệ Lấp Đầy & Nhu Cầu">
      <div className="p-5 space-y-5">
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
