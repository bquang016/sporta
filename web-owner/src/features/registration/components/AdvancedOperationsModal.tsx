import React, { useState } from 'react';
import type { SubCourt, CourtPriceRuleRequest } from '../types';
import { useToast } from '../../../components/ui/Toast';
import { Dropdown } from '../../../components/ui/Dropdown';
import { CurrencyInput } from '../../../components/ui/CurrencyInput';
import { Checkbox } from '../../../components/ui/Checkbox';

const parseTimeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
};

interface AdvancedOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: SubCourt[];
  onCourtsChange: (val: SubCourt[]) => void;
  openingTime: string;
  closingTime: string;
  shiftDurationMinutes: number;
}

export const AdvancedOperationsModal = ({
  isOpen,
  onClose,
  courts,
  onCourtsChange,
  openingTime,
  closingTime,
  shiftDurationMinutes,
}: AdvancedOperationsModalProps) => {
  const { showToast } = useToast();

  const [ruleType, setRuleType] = useState<'SHIFT' | 'DAY_OF_WEEK'>('SHIFT');
  
  // SHIFT fields
  const [selectedShiftSlot, setSelectedShiftSlot] = useState('');
  const [customPrice, setCustomPrice] = useState<number>(150000);

  // DAY_OF_WEEK fields
  const [dayOfWeek, setDayOfWeek] = useState('6');
  const [modifierType, setModifierType] = useState<'percentage' | 'fixed'>('percentage');
  const [modifierValue, setModifierValue] = useState<number>(20);

  // Target courts selection
  const [selectedCourtIndices, setSelectedCourtIndices] = useState<number[]>([]);

  if (!isOpen) return null;

  const DAYS_OF_WEEK = [
    { value: '1', label: 'Thứ Hai' },
    { value: '2', label: 'Thứ Ba' },
    { value: '3', label: 'Thứ Tư' },
    { value: '4', label: 'Thứ Năm' },
    { value: '5', label: 'Thứ Sáu' },
    { value: '6', label: 'Thứ Bảy' },
    { value: '7', label: 'Chủ Nhật' }
  ];

  const generateShiftSlots = () => {
    if (!shiftDurationMinutes || !openingTime || !closingTime) return [];
    const openMin = parseTimeToMinutes(openingTime);
    const closeMin = parseTimeToMinutes(closingTime);
    const totalOp = closeMin - openMin;
    if (totalOp <= 0 || totalOp % shiftDurationMinutes !== 0) return [];
    
    const slots = [];
    const formatTimeStr = (min: number): string => {
      const h = Math.floor(min / 60).toString().padStart(2, '0');
      const m = (min % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };
    
    for (let current = openMin; current < closeMin; current += shiftDurationMinutes) {
      const start = formatTimeStr(current);
      const end = formatTimeStr(current + shiftDurationMinutes);
      slots.push({ value: `${start}-${end}`, label: `${start} - ${end}` });
    }
    return slots;
  };

  const shiftSlots = generateShiftSlots();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCourtIndices(courts.map((_, i) => i));
    } else {
      setSelectedCourtIndices([]);
    }
  };

  const toggleCourtSelection = (index: number) => {
    if (selectedCourtIndices.includes(index)) {
      setSelectedCourtIndices(selectedCourtIndices.filter(i => i !== index));
    } else {
      setSelectedCourtIndices([...selectedCourtIndices, index]);
    }
  };

  const handleApplyRules = () => {
    if (selectedCourtIndices.length === 0) {
      showToast('warning', 'Vui lòng chọn ít nhất một sân để áp dụng');
      return;
    }

    let newRule: CourtPriceRuleRequest;

    if (ruleType === 'SHIFT') {
      if (!selectedShiftSlot) {
        showToast('warning', 'Vui lòng chọn ca giờ áp dụng');
        return;
      }
      if (customPrice <= 0) {
        showToast('warning', 'Giá thuê phải lớn hơn 0');
        return;
      }
      const [start, end] = selectedShiftSlot.split('-');
      newRule = { ruleType: 'SHIFT', startTime: start, endTime: end, customPrice };
    } else {
      if (modifierValue <= 0) {
        showToast('warning', 'Giá trị điều chỉnh phải lớn hơn 0');
        return;
      }
      const dayNum = parseInt(dayOfWeek);
      let percentageModifier = 1.0;
      let fixedModifier = 0.0;
      if (modifierType === 'percentage') {
        percentageModifier = 1.0 + (modifierValue / 100);
      } else {
        fixedModifier = modifierValue;
      }
      newRule = { ruleType: 'DAY_OF_WEEK', dayOfWeek: dayNum, percentageModifier, fixedModifier };
    }

    const updatedCourts = courts.map((c, idx) => {
      if (selectedCourtIndices.includes(idx)) {
        // Prevent duplicate exact shift rule
        const rules = c.priceRules || [];
        if (ruleType === 'SHIFT') {
          const [start, end] = selectedShiftSlot.split('-');
          const exists = rules.some(r => r.ruleType === 'SHIFT' && r.startTime?.startsWith(start) && r.endTime?.startsWith(end));
          if (exists) return c; // skip adding duplicate
        }
        return { ...c, priceRules: [...rules, newRule] };
      }
      return c;
    });

    onCourtsChange(updatedCourts);
    showToast('success', `Đã áp dụng quy tắc giá cho ${selectedCourtIndices.length} sân!`);
    
    // Clear selection so they can do another operation if needed
    setSelectedCourtIndices([]);
    // onClose(); // Actually let's NOT close it so they can add multiple rules easily!
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider">Cài đặt nâng cao</h3>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">Tạo quy tắc giá và áp dụng hàng loạt</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Rule Config */}
          <div className="space-y-4 border border-slate-200/80 rounded-2xl p-4 bg-slate-50/30">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Tạo quy tắc giá đặc biệt</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRuleType('SHIFT')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                    ruleType === 'SHIFT' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Theo ca giờ
                </button>
                <button
                  type="button"
                  onClick={() => setRuleType('DAY_OF_WEEK')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                    ruleType === 'DAY_OF_WEEK' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Theo thứ ngày
                </button>
              </div>
            </div>

            {ruleType === 'SHIFT' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Chọn ca giờ áp dụng</label>
                  {shiftSlots.length === 0 ? (
                    <div className="text-[9px] font-bold text-red-500 bg-red-50/50 p-2.5 rounded-lg">
                      Vui lòng thiết lập thời lượng ca hợp lệ ở màn hình chính.
                    </div>
                  ) : (
                    <Dropdown
                      options={[{ value: '', label: 'Chọn ca giờ...' }, ...shiftSlots]}
                      value={selectedShiftSlot}
                      onChange={setSelectedShiftSlot}
                      className="w-full text-xs font-bold text-slate-700 rounded-xl"
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giá thuê thay thế (VND)</label>
                  <CurrencyInput
                    value={customPrice}
                    onChange={setCustomPrice}
                    placeholder="Ví dụ: 150.000"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Áp dụng ngày</label>
                  <Dropdown
                    options={DAYS_OF_WEEK}
                    value={dayOfWeek}
                    onChange={setDayOfWeek}
                    className="w-full text-xs font-bold text-slate-700 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Kiểu thay đổi</label>
                  <Dropdown
                    options={[
                      { value: 'percentage', label: 'Tăng % (%)' },
                      { value: 'fixed',      label: 'Cộng thêm (+)' }
                    ]}
                    value={modifierType}
                    onChange={val => setModifierType(val as 'percentage' | 'fixed')}
                    className="w-full text-xs font-bold text-slate-700 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giá trị</label>
                  {modifierType === 'percentage' ? (
                    <input
                      type="number"
                      placeholder="Ví dụ: 20"
                      value={modifierValue}
                      onChange={e => setModifierValue(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-emerald"
                    />
                  ) : (
                    <CurrencyInput
                      value={modifierValue}
                      onChange={setModifierValue}
                      placeholder="Ví dụ: 30.000"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Target Courts Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Chọn sân áp dụng quy tắc này</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500">Chọn tất cả</span>
                <Checkbox 
                  checked={selectedCourtIndices.length === courts.length && courts.length > 0}
                  onChange={handleSelectAll}
                />
              </div>
            </div>

            {courts.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-semibold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Chưa có sân nào. Vui lòng tạo sân trước.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {courts.map((court, idx) => (
                  <div 
                    key={idx}
                    onClick={() => toggleCourtSelection(idx)}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedCourtIndices.includes(idx) 
                        ? 'border-brand-emerald bg-emerald-50/50' 
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <span className="text-[11px] font-black text-slate-700">{court.name}</span>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                      selectedCourtIndices.includes(idx) ? 'bg-brand-emerald border-brand-emerald' : 'border-slate-300'
                    }`}>
                      {selectedCourtIndices.includes(idx) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleApplyRules}
            disabled={courts.length === 0}
            className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Tạo quy tắc & Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};
