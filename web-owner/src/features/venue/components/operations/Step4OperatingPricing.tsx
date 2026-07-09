import React, { useState } from 'react';
import { useVenueWizard } from './VenueWizardContext';
import { useToast } from '../../../../components/ui/Toast';
import { Dropdown } from '../../../../components/ui/Dropdown';
import type { CourtPriceRuleRequest } from '../../types';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { CurrencyInput } from '../../../../components/ui/CurrencyInput';

const parseTimeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export const Step4OperatingPricing = () => {
  const { showToast } = useToast();
  const {
    openingTime,
    setOpeningTime,
    closingTime,
    setClosingTime,
    shiftDurationMinutes,
    setShiftDurationMinutes,
    hasSurcharge,
    setHasSurcharge,
    surchargeAmount,
    setSurchargeAmount,
    surchargeDescription,
    setSurchargeDescription,
    courts,
    setCourts
  } = useVenueWizard();

  const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2).toString().padStart(2, '0');
    const minutes = (i % 2 === 0 ? '00' : '30');
    return `${hours}:${minutes}`;
  });
  const hourDropdownOptions = TIME_OPTIONS.map(t => ({ value: t, label: t }));

  const SHIFT_DURATIONS = [
    { value: '', label: 'Chọn thời lượng...' },
    { value: '30', label: '30 phút' },
    { value: '60', label: '1 tiếng (60 phút)' },
    { value: '90', label: '90 phút' },
    { value: '120', label: '2 tiếng (120 phút)' }
  ];

  const DAYS_OF_WEEK = [
    { value: '1', label: 'Thứ Hai' },
    { value: '2', label: 'Thứ Ba' },
    { value: '3', label: 'Thứ Tư' },
    { value: '4', label: 'Thứ Năm' },
    { value: '5', label: 'Thứ Sáu' },
    { value: '6', label: 'Thứ Bảy' },
    { value: '7', label: 'Chủ Nhật' }
  ];

  // Price Rule Form state
  const [selectedCourtIndex, setSelectedCourtIndex] = useState<number>(0);
  const [ruleType, setRuleType] = useState<'SHIFT' | 'DAY_OF_WEEK'>('SHIFT');
  
  // SHIFT fields
  const [selectedShiftSlot, setSelectedShiftSlot] = useState('');
  const [customPrice, setCustomPrice] = useState<number>(150000);

  // Helper to generate non-overlapping shift slots
  const generateShiftSlots = () => {
    if (!shiftDurationMinutes) return [];
    
    const openMin = parseTimeToMinutes(openingTime);
    const closeMin = parseTimeToMinutes(closingTime);
    const totalOp = closeMin - openMin;
    
    if (totalOp <= 0 || totalOp % shiftDurationMinutes !== 0) {
      return [];
    }
    
    const slots = [];
    const formatTimeStr = (min: number): string => {
      const h = Math.floor(min / 60).toString().padStart(2, '0');
      const m = (min % 60).toString().padStart(2, '0');
      return `${h}:${m}`;
    };
    
    for (let current = openMin; current < closeMin; current += shiftDurationMinutes) {
      const start = formatTimeStr(current);
      const end = formatTimeStr(current + shiftDurationMinutes);
      slots.push({
        value: `${start}-${end}`,
        label: `${start} - ${end}`
      });
    }
    return slots;
  };

  const shiftSlots = generateShiftSlots();

  // Reactive validation on dropdown changes
  React.useEffect(() => {
    const openMin = parseTimeToMinutes(openingTime);
    const closeMin = parseTimeToMinutes(closingTime);
    
    if (closeMin <= openMin) {
      showToast('error', 'Giờ đóng cửa phải lớn hơn giờ mở cửa!');
      return;
    }
    
    if (shiftDurationMinutes) {
      const totalOp = closeMin - openMin;
      if (totalOp % shiftDurationMinutes !== 0) {
        showToast('warning', `Tổng thời lượng mở cửa (${totalOp} phút) không chia hết cho ca thuê (${shiftDurationMinutes} phút)! Vui lòng điều chỉnh lại.`);
      }
    }
  }, [openingTime, closingTime, shiftDurationMinutes]);

  // DAY OF WEEK fields
  const [dayOfWeek, setDayOfWeek] = useState('6'); // Default Saturday
  const [modifierType, setModifierType] = useState<'percentage' | 'fixed'>('percentage');
  const [modifierValue, setModifierValue] = useState<number>(20); // e.g. 20% increase or 20000 VND

  const activeCourt = courts[selectedCourtIndex] || null;

  const handleAddPriceRule = () => {
    if (selectedCourtIndex < 0 || selectedCourtIndex >= courts.length) {
      showToast('warning', 'Vui lòng chọn sân cần cấu hình');
      return;
    }

    let newRule: CourtPriceRuleRequest;

    if (ruleType === 'SHIFT') {
      if (!selectedShiftSlot) {
        showToast('warning', 'Vui lòng chọn ca giờ áp dụng');
        return;
      }

      const [start, end] = selectedShiftSlot.split('-');

      if (customPrice <= 0) {
        showToast('warning', 'Giá thuê phải lớn hơn 0');
        return;
      }

      // Check if this exact slot already exists
      const existingRules = activeCourt.priceRules || [];
      const exists = existingRules.some(r => {
        if (r.ruleType !== 'SHIFT') return false;
        const rStart = r.startTime ? r.startTime.substring(0, 5) : '';
        const rEnd = r.endTime ? r.endTime.substring(0, 5) : '';
        return rStart === start && rEnd === end;
      });

      if (exists) {
        showToast('warning', `Ca giờ ${start} - ${end} đã được cấu hình giá đặc biệt!`);
        return;
      }

      newRule = {
        ruleType: 'SHIFT',
        startTime: start,
        endTime: end,
        customPrice
      };
    } else {
      if (modifierValue <= 0) {
        showToast('warning', 'Giá trị điều chỉnh phải lớn hơn 0');
        return;
      }

      const dayNum = parseInt(dayOfWeek);
      
      // Calculate modifier values
      let percentageModifier = 1.0;
      let fixedModifier = 0.0;
      if (modifierType === 'percentage') {
        percentageModifier = 1.0 + (modifierValue / 100); // e.g. +20% -> 1.2
      } else {
        fixedModifier = modifierValue; // e.g. +20000 VND
      }

      newRule = {
        ruleType: 'DAY_OF_WEEK',
        dayOfWeek: dayNum,
        percentageModifier,
        fixedModifier
      };
    }

    // Add rule to current court
    setCourts(prev => prev.map((c, idx) => {
      if (idx === selectedCourtIndex) {
        const rules = c.priceRules || [];
        return {
          ...c,
          priceRules: [...rules, newRule]
        };
      }
      return c;
    }));

    showToast('success', 'Đã thêm quy tắc giá thành công!');
  };

  const handleRemovePriceRule = (ruleIndex: number) => {
    setCourts(prev => prev.map((c, idx) => {
      if (idx === selectedCourtIndex) {
        const rules = c.priceRules || [];
        return {
          ...c,
          priceRules: rules.filter((_, i) => i !== ruleIndex)
        };
      }
      return c;
    }));
    showToast('info', 'Đã xóa quy tắc giá');
  };

  const formatVND = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VND';
  };

  const getDayLabel = (dayNum?: number) => {
    const found = DAYS_OF_WEEK.find(d => d.value === String(dayNum));
    return found ? found.label : `Thứ ${dayNum}`;
  };

  return (
    <div className="flex-grow overflow-y-auto px-8 py-6 select-none max-w-6xl mx-auto w-full font-sans">
      <div className="space-y-1 mb-5">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Bước 4: Vận hành & Cấu hình giá</h3>
        <p className="text-[10px] text-slate-400 font-semibold leading-normal">
          Thiết lập giờ mở/đóng cửa, thời lượng mỗi ca, phụ thu khẩn cấp và bảng giá phân tầng theo khung giờ/ngày trong tuần.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Operating Hours & Surcharge (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Operating Hours Box */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5">
              Khung giờ hoạt động
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giờ mở cửa</label>
                <Dropdown
                  options={hourDropdownOptions}
                  value={openingTime}
                  onChange={setOpeningTime}
                  className="w-full text-xs font-bold text-slate-700 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giờ đóng cửa</label>
                <Dropdown
                  options={hourDropdownOptions}
                  value={closingTime}
                  onChange={setClosingTime}
                  className="w-full text-xs font-bold text-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                Thời lượng mỗi ca thuê <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={SHIFT_DURATIONS}
                value={shiftDurationMinutes ? String(shiftDurationMinutes) : ''}
                onChange={val => setShiftDurationMinutes(val ? parseInt(val) : undefined)}
                className="w-full text-xs font-bold text-slate-700 rounded-xl"
              />
            </div>
          </div>

          {/* Surcharge Box */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Phụ thu cố định cụm sân
              </h4>
              <Checkbox
                checked={hasSurcharge}
                onChange={setHasSurcharge}
              />
            </div>

            {hasSurcharge && (
              <div className="space-y-4 animate-slideDown">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Số tiền phụ thu (VND)</label>
                  <CurrencyInput
                    value={surchargeAmount || 0}
                    onChange={val => setSurchargeAmount(val || undefined)}
                    placeholder="Ví dụ: 50.000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Lý do phụ thu</label>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: Phụ thu thêm phí dọn dẹp và chiếu sáng đèn đêm sau 18:00..."
                    value={surchargeDescription}
                    onChange={e => setSurchargeDescription(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-brand-emerald resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Court Price Rules (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-5">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5">
            Cấu hình giá chi tiết theo sân
          </h4>

          {courts.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-400 font-semibold">
              Vui lòng quay lại Bước 2 để đăng ký ít nhất một sân trực thuộc trước khi cấu hình giá chi tiết.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Select Court tab list */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Chọn sân để cài đặt giá</label>
                <div className="flex flex-wrap gap-2">
                  {courts.map((court, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedCourtIndex(idx)}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        selectedCourtIndex === idx
                          ? 'bg-emerald-50 border-emerald-150 text-brand-emerald shadow-2xs'
                          : 'bg-slate-50 border-slate-150 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {court.name} (Gốc: {formatVND(court.price)})
                    </button>
                  ))}
                </div>
              </div>

              {activeCourt && (
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/20 space-y-4">
                  {/* Form to add a rule */}
                  <div className="space-y-3 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-3xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Thêm quy tắc giá đặc biệt</span>
                      
                      {/* Rule Type Selector */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setRuleType('SHIFT')}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                            ruleType === 'SHIFT' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-450'
                          }`}
                        >
                          Theo ca giờ
                        </button>
                        <button
                          type="button"
                          onClick={() => setRuleType('DAY_OF_WEEK')}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                            ruleType === 'DAY_OF_WEEK' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-450'
                          }`}
                        >
                          Theo thứ ngày
                        </button>
                      </div>
                    </div>

                    {ruleType === 'SHIFT' ? (
                      /* SHIFT fields */
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Chọn ca giờ áp dụng</label>
                          {shiftSlots.length === 0 ? (
                            <div className="text-[9px] font-bold text-red-500 bg-red-50/50 border border-red-100 p-2.5 rounded-lg select-none">
                              Vui lòng thiết lập thời lượng ca hợp lệ để hiển thị các ca giờ.
                            </div>
                          ) : (
                            <Dropdown
                              options={[
                                { value: '', label: 'Chọn ca giờ...' },
                                ...shiftSlots
                              ]}
                              value={selectedShiftSlot}
                              onChange={setSelectedShiftSlot}
                              className="w-full text-xs font-bold text-slate-700 rounded-lg py-1.5"
                            />
                          )}
                        </div>
                        <div className="space-y-1 sm:col-span-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Giá thuê thay thế (VND)</label>
                          <CurrencyInput
                            value={customPrice}
                            onChange={setCustomPrice}
                            placeholder="Ví dụ: 150.000"
                          />
                        </div>
                      </div>
                    ) : (
                      /* DAY OF WEEK fields */
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Áp dụng ngày</label>
                          <Dropdown
                            options={DAYS_OF_WEEK}
                            value={dayOfWeek}
                            onChange={setDayOfWeek}
                            className="w-full text-xs font-bold text-slate-700 rounded-lg py-1.5"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Kiểu thay đổi</label>
                          <Dropdown
                            options={[
                              { value: 'percentage', label: 'Tăng % (%)' },
                              { value: 'fixed',      label: 'Cộng thêm tiền (+)' }
                            ]}
                            value={modifierType}
                            onChange={val => setModifierType(val as 'percentage' | 'fixed')}
                            className="w-full text-xs font-bold text-slate-700 rounded-lg py-1.5"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Giá trị (+ hoặc %)</label>
                          {modifierType === 'percentage' ? (
                            <input
                              type="number"
                              placeholder="Ví dụ: 20 (% tăng thêm)"
                              value={modifierValue}
                              onChange={e => setModifierValue(parseFloat(e.target.value) || 0)}
                              className="w-full text-xs font-bold text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-brand-emerald"
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

                    <button
                      type="button"
                      onClick={handleAddPriceRule}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-brand-emerald border border-emerald-150 font-extrabold text-[9px] rounded-lg cursor-pointer uppercase tracking-wider transition-all"
                    >
                      Thêm quy tắc
                    </button>
                  </div>

                  {/* List of current court rules */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      Các quy tắc áp dụng cho {activeCourt.name}
                    </span>

                    {(!activeCourt.priceRules || activeCourt.priceRules.length === 0) ? (
                      <div className="text-center py-5 text-xs text-slate-350 font-semibold bg-white border border-slate-100 rounded-2xl">
                        Sân này đang áp dụng giá thuê cơ bản gốc.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {activeCourt.priceRules.map((rule, ruleIdx) => (
                          <div
                            key={ruleIdx}
                            className="bg-white border border-slate-200/60 rounded-xl px-3 py-2 flex items-center justify-between shadow-3xs text-xs font-semibold text-slate-700"
                          >
                            <div className="flex items-center gap-2">
                              {rule.ruleType === 'SHIFT' ? (
                                <>
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase">Khung giờ</span>
                                  <span>{rule.startTime?.substring(0, 5)} - {rule.endTime?.substring(0, 5)}: </span>
                                  <span className="text-brand-emerald font-black">{formatVND(rule.customPrice || 0)} / ca</span>
                                </>
                              ) : (
                                <>
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[8px] font-black uppercase">Ngày thứ</span>
                                  <span>{getDayLabel(rule.dayOfWeek)}: </span>
                                  <span className="text-brand-emerald font-black">
                                    {rule.percentageModifier && rule.percentageModifier !== 1
                                      ? `Tăng ${Math.round((rule.percentageModifier - 1) * 100)}%`
                                      : `Cộng thêm ${formatVND(rule.fixedModifier || 0)}`}
                                  </span>
                                </>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePriceRule(ruleIdx)}
                              className="p-1 rounded bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 hover:text-red-700 cursor-pointer transition-all"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
