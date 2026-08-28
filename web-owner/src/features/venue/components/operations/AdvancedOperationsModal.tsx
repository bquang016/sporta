import React, { useState, useEffect } from 'react';
import type { CourtDraftDto } from '../../types';
import { Modal } from '../../../../components/ui/Modal';
import { useToast } from '../../../../components/ui/Toast';
import { Dropdown } from '../../../../components/ui/Dropdown';
import { CurrencyInput } from '../../../../components/ui/CurrencyInput';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { Clock, Calendar, Check, Plus, Trash2, Layers, AlertCircle, Tag, CheckCircle2 } from 'lucide-react';

const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

interface AdvancedOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courts: CourtDraftDto[];
  onCourtsChange: (val: CourtDraftDto[]) => void;
  openingTime: string;
  closingTime: string;
  shiftDurationMinutes?: number;
}

export const AdvancedOperationsModal = ({
  isOpen,
  onClose,
  courts,
  onCourtsChange,
  openingTime,
  closingTime,
  shiftDurationMinutes = 60,
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

  const DAYS_OF_WEEK = [
    { value: '1', label: 'Thứ Hai' },
    { value: '2', label: 'Thứ Ba' },
    { value: '3', label: 'Thứ Tư' },
    { value: '4', label: 'Thứ Năm' },
    { value: '5', label: 'Thứ Sáu' },
    { value: '6', label: 'Thứ Bảy' },
    { value: '7', label: 'Chủ Nhật' }
  ];

  // Generate shift slots accurately without blocking remainder mismatches
  const generateShiftSlots = () => {
    if (!shiftDurationMinutes || !openingTime || !closingTime) return [];
    const openMin = parseTimeToMinutes(openingTime);
    let closeMin = parseTimeToMinutes(closingTime);
    if (closeMin <= openMin) {
      closeMin += 24 * 60; // Closing next day / midnight
    }
    
    const slots: { value: string; label: string }[] = [];
    const formatTimeStr = (min: number): string => {
      const totalMin = min % (24 * 60);
      const h = Math.floor(totalMin / 60).toString().padStart(2, '0');
      const m = (totalMin % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };
    
    let shiftCount = 1;
    for (let current = openMin; current + shiftDurationMinutes <= closeMin; current += shiftDurationMinutes) {
      const start = formatTimeStr(current);
      const end = formatTimeStr(current + shiftDurationMinutes);
      slots.push({ 
        value: `${start}-${end}`, 
        label: `Ca ${shiftCount}: ${start} - ${end}` 
      });
      shiftCount++;
    }
    return slots;
  };

  const shiftSlots = generateShiftSlots();

  // Auto-select first slot when slots change
  useEffect(() => {
    if (shiftSlots.length > 0 && !selectedShiftSlot) {
      setSelectedShiftSlot(shiftSlots[0].value);
    }
  }, [shiftSlots, selectedShiftSlot]);

  // Pre-select all courts by default when opening if none selected
  useEffect(() => {
    if (isOpen && courts.length > 0 && selectedCourtIndices.length === 0) {
      setSelectedCourtIndices(courts.map((_, i) => i));
    }
  }, [isOpen, courts]);

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

  const formatVND = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + ' đ';
  };

  const handleApplyRules = () => {
    if (selectedCourtIndices.length === 0) {
      showToast('warning', 'Vui lòng chọn ít nhất một sân để áp dụng quy tắc giá');
      return;
    }

    let newRule: any;

    if (ruleType === 'SHIFT') {
      if (!selectedShiftSlot) {
        showToast('warning', 'Vui lòng chọn ca giờ áp dụng');
        return;
      }
      if (customPrice <= 0) {
        showToast('warning', 'Giá thuê thay thế phải lớn hơn 0');
        return;
      }
      const [start, end] = selectedShiftSlot.split('-');
      newRule = { ruleType: 'SHIFT', startTime: start, endTime: end, customPrice };
    } else {
      if (modifierValue <= 0) {
        showToast('warning', 'Giá trị điều chỉnh phải lớn hơn 0');
        return;
      }
      const dayNum = parseInt(dayOfWeek, 10);
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
        const rules = c.priceRules || [];
        // Replace or prevent exact duplicate rule
        if (ruleType === 'SHIFT') {
          const [start, end] = selectedShiftSlot.split('-');
          const filtered = rules.filter(
            r => !(r.ruleType === 'SHIFT' && r.startTime?.startsWith(start) && r.endTime?.startsWith(end))
          );
          return { ...c, priceRules: [...filtered, newRule] };
        } else {
          const dayNum = parseInt(dayOfWeek, 10);
          const filtered = rules.filter(
            r => !(r.ruleType === 'DAY_OF_WEEK' && r.dayOfWeek === dayNum)
          );
          return { ...c, priceRules: [...filtered, newRule] };
        }
      }
      return c;
    });

    onCourtsChange(updatedCourts);
    showToast('success', `Đã áp dụng quy tắc giá thành công cho ${selectedCourtIndices.length} sân!`);
  };

  const handleRemoveSingleRule = (courtIndex: number, ruleIndex: number) => {
    const updated = courts.map((c, idx) => {
      if (idx === courtIndex) {
        const newRules = (c.priceRules || []).filter((_, rIdx) => rIdx !== ruleIndex);
        return { ...c, priceRules: newRules };
      }
      return c;
    });
    onCourtsChange(updated);
    showToast('info', 'Đã xóa quy tắc giá');
  };

  const getDayLabel = (d?: number) => {
    const found = DAYS_OF_WEEK.find(item => item.value === String(d));
    return found ? found.label : `Thứ ${d}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cài đặt giá nâng cao & Quy tắc ca"
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full select-none font-sans">
          <span className="text-[11px] font-bold text-slate-500">
            Đã chọn: <span className="text-brand-emerald font-black">{selectedCourtIndices.length}/{courts.length}</span> sân
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleApplyRules}
              disabled={courts.length === 0 || selectedCourtIndices.length === 0}
              className="px-5 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Áp dụng quy tắc
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 select-none font-sans text-left">
        {/* ─── 1. BỘ CHỌN LOẠI QUY TẮC ────────────────────────────── */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-emerald" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">Loại quy tắc giá</span>
            </div>
            
            <div className="flex bg-slate-200/70 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setRuleType('SHIFT')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  ruleType === 'SHIFT' 
                    ? 'bg-brand-emerald text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Theo ca giờ
              </button>
              <button
                type="button"
                onClick={() => setRuleType('DAY_OF_WEEK')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  ruleType === 'DAY_OF_WEEK' 
                    ? 'bg-brand-emerald text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Theo thứ ngày
              </button>
            </div>
          </div>

          {/* Form theo ca giờ */}
          {ruleType === 'SHIFT' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Chọn ca giờ áp dụng
                </label>
                {shiftSlots.length === 0 ? (
                  <div className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                    Vui lòng kiểm tra lại giờ mở/đóng cửa và thời lượng ca ở màn hình chính.
                  </div>
                ) : (
                  <Dropdown
                    options={shiftSlots}
                    value={selectedShiftSlot}
                    onChange={setSelectedShiftSlot}
                    className="w-full text-xs font-bold text-slate-700 rounded-xl"
                  />
                )}
                <span className="text-[10px] text-slate-400 font-medium block">
                  Áp dụng giá cố định cho khung giờ vàng hoặc ca đặc biệt.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Giá thuê thay thế cho ca này (VND)
                </label>
                <CurrencyInput
                  value={customPrice}
                  onChange={val => setCustomPrice(val || 0)}
                  placeholder="Ví dụ: 150.000"
                />
                <span className="text-[10px] text-slate-400 font-medium block">
                  Giá mới sẽ ghi đè giá cơ bản trong ca này.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Áp dụng ngày
                  </label>
                  <Dropdown
                    options={DAYS_OF_WEEK}
                    value={dayOfWeek}
                    onChange={setDayOfWeek}
                    className="w-full text-xs font-bold text-slate-700 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Kiểu điều chỉnh
                  </label>
                  <Dropdown
                    options={[
                      { value: 'percentage', label: 'Tăng theo % (+%)' },
                      { value: 'fixed',      label: 'Cộng thêm tiền (+đ)' }
                    ]}
                    value={modifierType}
                    onChange={val => setModifierType(val as 'percentage' | 'fixed')}
                    className="w-full text-xs font-bold text-slate-700 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    {modifierType === 'percentage' ? 'Giá trị tăng (%)' : 'Số tiền cộng thêm (VND)'}
                  </label>
                  {modifierType === 'percentage' ? (
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="200"
                        placeholder="20"
                        value={modifierValue || ''}
                        onChange={e => setModifierValue(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">%</span>
                    </div>
                  ) : (
                    <CurrencyInput
                      value={modifierValue}
                      onChange={val => setModifierValue(val || 0)}
                      placeholder="30.000"
                    />
                  )}
                </div>
              </div>

              <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60 text-[11px] font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Quy tắc: Vào tất cả các ngày <strong>{getDayLabel(parseInt(dayOfWeek, 10))}</strong>, giá sân sẽ{' '}
                  <strong>{modifierType === 'percentage' ? `tăng ${modifierValue}%` : `cộng thêm ${formatVND(modifierValue)}`}</strong>{' '}
                  so với giá niêm yết.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ─── 2. DANH SÁCH SÂN ĐƯỢC CHỌN ─────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                Chọn sân áp dụng ({selectedCourtIndices.length}/{courts.length})
              </span>
            </div>

            <Checkbox 
              checked={selectedCourtIndices.length === courts.length && courts.length > 0}
              onChange={handleSelectAll}
              label={`Chọn tất cả (${courts.length} sân)`}
              labelClassName="text-xs font-bold text-slate-700 cursor-pointer"
            />
          </div>

          {courts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Chưa có sân nào trong danh sách. Vui lòng tạo sân ở màn hình trước.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto matrix-scroll pr-1">
              {courts.map((court, idx) => {
                const isSelected = selectedCourtIndices.includes(idx);
                const rules = court.priceRules || [];

                return (
                  <div
                    key={idx}
                    onClick={() => toggleCourtSelection(idx)}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected 
                        ? 'border-brand-emerald bg-emerald-50/40 shadow-xs' 
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-slate-800 block">{court.name}</span>
                        <span className="text-[10px] font-bold text-slate-500">Giá gốc: {formatVND(court.price)}</span>
                      </div>

                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-brand-emerald border-brand-emerald text-white' : 'border-slate-300 bg-slate-50'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Existing Rules on this court */}
                    {rules.length > 0 && (
                      <div className="space-y-1 pt-1.5 border-t border-slate-150/70" onClick={e => e.stopPropagation()}>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block">
                          Đã có {rules.length} quy tắc:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {rules.map((r, rIdx) => (
                            <span
                              key={rIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[9px] font-bold text-slate-700 shadow-2xs"
                            >
                              {r.ruleType === 'SHIFT' 
                                ? `${r.startTime}-${r.endTime}: ${formatVND(r.customPrice || 0)}`
                                : `${getDayLabel(r.dayOfWeek)}: ${r.percentageModifier && r.percentageModifier !== 1 ? `+${Math.round((r.percentageModifier - 1) * 100)}%` : `+${formatVND(r.fixedModifier || 0)}`}`}
                              <button
                                type="button"
                                onClick={() => handleRemoveSingleRule(idx, rIdx)}
                                className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                                title="Xóa quy tắc này"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
