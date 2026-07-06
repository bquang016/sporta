// ─────────────────────────────────────────────────────────────────────────────
// Setup Wizard — Step 4: Courts + Pricing Slots
// ─────────────────────────────────────────────────────────────────────────────

import type { SubCourt, PricingSlot } from '../types';
import { SPORT_TYPE_OPTIONS, DEFAULT_PRICING_SLOTS } from '../types';

interface CourtsStepProps {
  courts: SubCourt[];
  onCourtsChange: (val: SubCourt[]) => void;
  isLoading: boolean;
}

export const CourtsStep = ({
  courts,
  onCourtsChange,
  isLoading,
}: CourtsStepProps) => {
  const addCourt = () => {
    onCourtsChange([
      ...courts,
      {
        name: `Sân ${courts.length + 1}`,
        sportType: '',
        pricingSlots: DEFAULT_PRICING_SLOTS.map((s) => ({ ...s })),
      },
    ]);
  };

  const removeCourt = (index: number) => {
    if (courts.length <= 1) return;
    onCourtsChange(courts.filter((_, i) => i !== index));
  };

  const updateCourt = (index: number, field: keyof SubCourt, value: any) => {
    const updated = [...courts];
    updated[index] = { ...updated[index], [field]: value };
    onCourtsChange(updated);
  };

  const updatePricingSlot = (courtIndex: number, slotIndex: number, field: keyof PricingSlot, value: any) => {
    const updated = [...courts];
    const slots = [...updated[courtIndex].pricingSlots];
    slots[slotIndex] = { ...slots[slotIndex], [field]: value };
    updated[courtIndex] = { ...updated[courtIndex], pricingSlots: slots };
    onCourtsChange(updated);
  };

  const formatPrice = (price: number): string => {
    if (!price) return '';
    return price.toLocaleString('vi-VN');
  };

  const parsePrice = (value: string): number => {
    const cleaned = value.replace(/[^\d]/g, '');
    return parseInt(cleaned) || 0;
  };

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 border-2 border-brand-emerald/20 text-brand-emerald flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-slate-800 tracking-tight">Sân con & Bảng giá</h3>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
          Khai báo từng sân con và thiết lập giá theo khung giờ
        </p>
      </div>

      {/* Court list */}
      <div className="space-y-4">
        {courts.map((court, courtIdx) => (
          <div
            key={courtIdx}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
          >
            {/* Court header */}
            <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-brand-emerald text-white text-[10px] font-black flex items-center justify-center">
                  {courtIdx + 1}
                </span>
                <input
                  type="text"
                  value={court.name}
                  onChange={(e) => updateCourt(courtIdx, 'name', e.target.value)}
                  className="bg-transparent font-bold text-xs text-slate-700 border-none outline-none focus:text-brand-emerald w-32"
                  disabled={isLoading}
                  placeholder="Tên sân"
                />
              </div>
              {courts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCourt(courtIdx)}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            <div className="p-4 space-y-3">
              {/* Sport type select */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  Loại thể thao
                </label>
                <select
                  value={court.sportType}
                  onChange={(e) => updateCourt(courtIdx, 'sportType', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700
                             focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 cursor-pointer"
                  disabled={isLoading}
                >
                  <option value="">— Chọn loại thể thao —</option>
                  {SPORT_TYPE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Pricing table */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  Giá theo khung giờ (VNĐ)
                </label>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-[8px] font-black text-slate-500 uppercase tracking-wider">
                        <th className="text-left px-3 py-2">Khung giờ</th>
                        <th className="text-left px-3 py-2">Thời gian</th>
                        <th className="text-right px-3 py-2">Giá (VNĐ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {court.pricingSlots.map((slot, slotIdx) => (
                        <tr key={slotIdx} className="border-t border-slate-100">
                          <td className="px-3 py-2">
                            <span className="text-[10px] font-black text-slate-700">{slot.label}</span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {slot.startTime} – {slot.endTime}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={formatPrice(slot.price)}
                              onChange={(e) => updatePricingSlot(courtIdx, slotIdx, 'price', parsePrice(e.target.value))}
                              placeholder="0"
                              className="w-full text-right px-2 py-1 rounded-lg border border-slate-200 bg-slate-50/60 font-bold text-[11px] text-slate-700
                                         focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald/10"
                              disabled={isLoading}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add court button */}
      <button
        type="button"
        onClick={addCourt}
        disabled={isLoading}
        className="w-full border-2 border-dashed border-slate-200 hover:border-brand-emerald/40 rounded-xl py-3
                   flex items-center justify-center gap-2 transition-colors cursor-pointer group
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4 text-slate-400 group-hover:text-brand-emerald transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-[10px] font-black text-slate-400 group-hover:text-brand-emerald uppercase tracking-wider transition-colors">
          Thêm sân con
        </span>
      </button>
    </div>
  );
};
