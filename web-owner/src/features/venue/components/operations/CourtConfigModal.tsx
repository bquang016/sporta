import React, { useState } from 'react';
import { Modal } from '../../../../components/ui/Modal';
import { Dropdown } from '../../../../components/ui/Dropdown';
import type { DropdownOption } from '../../../../components/ui/Dropdown';
import { Checkbox } from '../../../../components/ui/Checkbox';

interface CourtConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  name: string;
  setName: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  opStatus: 'ACTIVE' | 'MAINTENANCE';
  setOpStatus: (val: 'ACTIVE' | 'MAINTENANCE') => void;
  formatVND: (amount: number) => string;
  
  // PROPS ĐỊNH GIÁ PHÂN TẦNG (TIERED PRICING)
  activeVenue?: any;
  hasShiftPricing: boolean;
  setHasShiftPricing: (val: boolean) => void;
  shiftPrices: Record<string, string>;
  setShiftPrice: (shiftKey: string, price: string) => void;
  removeShiftPrice: (shiftKey: string) => void;
  hasDayOfWeekPricing: boolean;
  setHasDayOfWeekPricing: (val: boolean) => void;
  selectedDayOfWeek: number;
  setSelectedDayOfWeek: (val: number) => void;
  dayPricingType: 'percentage' | 'fixed';
  setDayPricingType: (val: 'percentage' | 'fixed') => void;
  dayPricingValue: string;
  setDayPricingValue: (val: string) => void;

  isBulkEdit?: boolean;
  selectedCourtsCount?: number;
  configMode: 'shift' | 'day';
}

const generateShifts = (open?: string, close?: string, duration?: number) => {
  if (!open || !close || !duration) return [];
  const shifts = [];
  try {
    const [openH, openM] = open.split(':').map(Number);
    const [closeH, closeM] = close.split(':').map(Number);
    
    let currentMinutes = openH * 60 + openM;
    let closeMinutes = closeH * 60 + closeM;
    if (closeMinutes <= currentMinutes) {
      closeMinutes += 24 * 60; // qua đêm
    }
    
    while (currentMinutes + duration <= closeMinutes) {
      const startH = Math.floor(currentMinutes / 60) % 24;
      const startM = currentMinutes % 60;
      const endH = Math.floor((currentMinutes + duration) / 60) % 24;
      const endM = (currentMinutes + duration) % 60;
      
      const startTimeStr = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`;
      const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
      const shiftKey = `${startTimeStr}-${endTimeStr}`;
      
      shifts.push({
        startTime: startTimeStr,
        endTime: endTimeStr,
        shiftKey,
        label: `${startTimeStr} - ${endTimeStr}`
      });
      
      currentMinutes += duration;
    }
  } catch (e) {
    // ignore
  }
  return shifts;
};

export const CourtConfigModal = ({
  isOpen,
  onClose,
  onSave,
  name,
  setName,
  price,
  setPrice,
  opStatus,
  setOpStatus,
  formatVND,
  activeVenue,
  hasShiftPricing,
  setHasShiftPricing,
  shiftPrices,
  setShiftPrice,
  removeShiftPrice,
  hasDayOfWeekPricing,
  setHasDayOfWeekPricing,
  selectedDayOfWeek,
  setSelectedDayOfWeek,
  dayPricingType,
  setDayPricingType,
  dayPricingValue,
  setDayPricingValue,
  isBulkEdit = false,
  selectedCourtsCount = 0,
  configMode
}: CourtConfigModalProps) => {
  const statusOptions: DropdownOption[] = [
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'MAINTENANCE', label: 'Bảo trì' }
  ];

  const dayOptions: DropdownOption[] = [
    { value: '1', label: 'Thứ 2' },
    { value: '2', label: 'Thứ 3' },
    { value: '3', label: 'Thứ 4' },
    { value: '4', label: 'Thứ 5' },
    { value: '5', label: 'Thứ 6' },
    { value: '6', label: 'Thứ 7' },
    { value: '7', label: 'Chủ Nhật' }
  ];

  const modifierTypeOptions = [
    { value: 'percentage', label: 'Tỷ lệ phần trăm (%)' },
    { value: 'fixed', label: 'Số tiền cố định (VNĐ)' }
  ];

  const shifts = generateShifts(
    activeVenue?.openingTime,
    activeVenue?.closingTime,
    activeVenue?.shiftDurationMinutes
  );

  const availableShifts = shifts.filter(s => !(s.shiftKey in shiftPrices));

  const basePriceNum = parseFloat(price) || 0;

  // Tính giá trị Live Preview
  const getLivePreview = (): string => {
    if (!dayPricingValue) return '';
    const valNum = parseFloat(dayPricingValue);
    if (isNaN(valNum) || valNum <= 0) return '';

    const dayName = dayOptions.find(d => Number(d.value) === selectedDayOfWeek)?.label || 'Chọn thứ';
    if (dayPricingType === 'percentage') {
      const calculated = basePriceNum * valNum;
      const statusText = valNum > 1 ? 'tăng thành' : valNum < 1 ? 'giảm còn' : 'giữ nguyên';
      return `💡 Vào ngày ${dayName}, mức giá cho tất cả các ca sẽ ${statusText} ${formatVND(calculated)} / ca (Hệ số ${valNum}x)`;
    } else {
      const calculated = basePriceNum + valNum;
      return `💡 Vào ngày ${dayName}, mức giá cho tất cả các ca sẽ tăng thành ${formatVND(calculated)} / ca (Cộng thêm +${formatVND(valNum)})`;
    }
  };

  const livePreview = getLivePreview();
  const [tempSelectedShift, setTempSelectedShift] = useState("");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isBulkEdit ? (configMode === 'shift' ? `Cấu hình Giá gốc & Ca hàng loạt (${selectedCourtsCount} sân)` : `Cấu hình Giá theo Thứ hàng loạt (${selectedCourtsCount} sân)`) : (configMode === 'shift' ? "Cấu hình Giá gốc & Ca" : "Cấu hình Giá theo Thứ")}
      maxWidth="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-extrabold text-xs cursor-pointer active:scale-95 transition-all"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onSave}
            className="bg-brand-yellow hover:bg-yellow-400 text-primary border-b-2 border-yellow-600 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Lưu cấu hình
          </button>
        </>
      }
    >
      <div className="space-y-6 text-left pr-1">
        {isBulkEdit && (
          <div className="bg-emerald-50 border border-emerald-250 rounded-2xl p-4 flex gap-3 items-start animate-fadeIn">
            <svg className="w-5 h-5 text-brand-emerald flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-[11px] font-bold text-emerald-800 space-y-1">
              <p>Chế độ: Cấu hình hàng loạt (Bulk Edit)</p>
              <p className="font-semibold text-emerald-700 leading-relaxed">
                Các quy tắc định giá bên dưới sẽ được áp dụng đồng thời cho <strong>{selectedCourtsCount} sân lẻ</strong> đang được chọn. Tên hiển thị của từng sân vẫn được giữ nguyên.
              </p>
            </div>
          </div>
        )}

        {/* ── CẤU HÌNH GIÁ GỐC & THÔNG TIN CƠ BẢN (CHỈ HIỂN THỊ KHI Ở CHẾ ĐỘ SHIFT) ── */}
        {configMode === 'shift' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tên sân */}
              {!isBulkEdit && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Tên sân bãi</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full text-xs font-bold text-slate-755 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald"
                  />
                </div>
              )}

              {/* Trạng thái vận hành */}
              <div className={`space-y-1 ${isBulkEdit ? 'md:col-span-2' : ''}`}>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Trạng thái vận hành</label>
                <Dropdown
                  options={statusOptions}
                  value={opStatus}
                  onChange={val => setOpStatus(val as 'ACTIVE' | 'MAINTENANCE')}
                  placeholder="Chọn trạng thái"
                  className="w-full"
                />
              </div>
            </div>

            {/* Giá mặc định */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Giá thuê mặc định (VND/h)</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full text-xs font-bold text-slate-755 px-3.5 py-2.5 pr-14 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald focus:ring-1"
                />
                <span className="absolute right-3.5 text-[10px] font-extrabold text-slate-400">VND/h</span>
              </div>
              {price && !isNaN(parseFloat(price)) && (
                <p className="text-[9px] text-brand-emerald font-black">Hiển thị: {formatVND(parseFloat(price))}</p>
              )}
            </div>
          </div>
        )}

        {/* ── CẤU HÌNH CHI TIẾT TỪNG CHẾ ĐỘ ── */}
        <div className="pt-5 border-t border-slate-100">
          
          {/* CẤU HÌNH THEO CA (SHIFT PRICING) */}
          {configMode === 'shift' && (
            <div className={`border rounded-3xl p-5 bg-slate-50/20 transition-all space-y-4 flex flex-col justify-between ${hasShiftPricing ? 'border-blue-200 shadow-[0_4px_20px_rgba(59,130,246,0.04)] bg-blue-50/5' : 'border-slate-200/80 hover:border-slate-350'}`}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${hasShiftPricing ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Định giá riêng theo Ca</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">Đặt mức giá riêng biệt cho từng khung giờ/ca thuê</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-150/80 p-3.5 rounded-2xl flex items-center justify-between shadow-sm select-none">
                  <span className="text-[11px] font-black text-slate-655 uppercase tracking-wider">Kích hoạt giá theo ca</span>
                  <Checkbox checked={hasShiftPricing} onChange={setHasShiftPricing} />
                </div>

                {hasShiftPricing && (
                  <div className="space-y-4 animate-fadeIn">
                    <p className="text-[10px] text-slate-450 font-bold leading-relaxed bg-blue-50/30 border border-blue-100/50 p-3 rounded-2xl">
                      Chỉ cấu hình giá riêng cho các ca cần thiết. Các ca còn lại sẽ tự động áp dụng giá mặc định.
                    </p>
                    
                    {Object.keys(shiftPrices).length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl text-[10px] text-slate-400 font-bold bg-white">
                        Chưa có ca nào được cấu hình giá riêng.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(shiftPrices).map(([shiftKey, val]) => {
                          const shiftObj = shifts.find(s => s.shiftKey === shiftKey) || { label: shiftKey, shiftKey };
                          return (
                            <div key={shiftKey} className="bg-white border border-slate-150 rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-sm hover:border-blue-305 transition-colors">
                              <div className="flex-grow text-left">
                                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider mb-0.5">Ca hoạt động</span>
                                <span className="text-xs font-bold text-slate-700">{shiftObj.label}</span>
                              </div>
                              <div className="w-28 relative flex items-center">
                                <input
                                  type="number"
                                  placeholder={price || '0'}
                                  value={val}
                                  onChange={e => setShiftPrice(shiftKey, e.target.value)}
                                  className="w-full text-right pr-9 text-xs font-bold text-slate-755 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/10"
                                />
                                <span className="absolute right-2 text-[9px] font-extrabold text-slate-400">đ/ca</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeShiftPrice(shiftKey)}
                                className="w-8 h-8 rounded-xl border border-red-100 hover:bg-red-55 text-red-500 flex items-center justify-center cursor-pointer transition-colors font-bold text-xs"
                                title="Xóa cấu hình ca này"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Nút thêm ca */}
                    {availableShifts.length > 0 && (
                      <div className="flex gap-2">
                        <Dropdown
                          options={availableShifts.map(s => ({ value: s.shiftKey, label: s.label }))}
                          value={tempSelectedShift}
                          onChange={setTempSelectedShift}
                          placeholder="Chọn ca cần thêm..."
                          className="flex-grow"
                          direction="up"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (tempSelectedShift) {
                              setShiftPrice(tempSelectedShift, "");
                              setTempSelectedShift("");
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl transition-all cursor-pointer border-b-2 border-blue-800"
                        >
                          + Thêm ca
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CẤU HÌNH THEO NGÀY TRONG TUẦN (DAY OF WEEK PRICING) */}
          {configMode === 'day' && (
            <div className={`border rounded-3xl p-5 bg-slate-50/20 transition-all space-y-4 flex flex-col justify-between ${hasDayOfWeekPricing ? 'border-emerald-250 shadow-[0_4px_20px_rgba(16,185,129,0.04)] bg-emerald-50/5' : 'border-slate-200/80 hover:border-slate-350'}`}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${hasDayOfWeekPricing ? 'bg-emerald-100 text-brand-emerald' : 'bg-slate-100 text-slate-500'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Định giá theo thứ tự ngày</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">Tăng/giảm giá cho các ngày cuối tuần hoặc ngày đặc biệt</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-150/80 p-3.5 rounded-2xl flex items-center justify-between shadow-sm select-none">
                  <span className="text-[11px] font-black text-slate-655 uppercase tracking-wider">Kích hoạt điều chỉnh theo thứ</span>
                  <Checkbox checked={hasDayOfWeekPricing} onChange={setHasDayOfWeekPricing} />
                </div>

                {hasDayOfWeekPricing && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Chọn ngày */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Chọn ngày áp dụng</span>
                        <Dropdown
                          options={dayOptions}
                          value={selectedDayOfWeek.toString()}
                          onChange={val => setSelectedDayOfWeek(Number(val))}
                          className="w-full"
                        />
                      </div>

                      {/* Chọn kiểu điều chỉnh */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Kiểu tăng/giảm</span>
                        <Dropdown
                          options={modifierTypeOptions}
                          value={dayPricingType}
                          onChange={val => setDayPricingType(val as 'percentage' | 'fixed')}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Giá trị */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                        {dayPricingType === 'percentage' ? 'Hệ số nhân điều chỉnh (Ví dụ: 1.2 = tăng 20%)' : 'Mức tiền điều chỉnh cộng thêm (VNĐ)'}
                      </span>
                      <input
                        type="number"
                        step={dayPricingType === 'percentage' ? '0.1' : '5000'}
                        placeholder={dayPricingType === 'percentage' ? '1.2' : '20000'}
                        value={dayPricingValue}
                        onChange={e => setDayPricingValue(e.target.value)}
                        className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-emerald focus:border-brand-emerald bg-white shadow-sm"
                      />
                    </div>

                    {/* Live Preview */}
                    {livePreview && (
                      <div className="bg-amber-55/10 border border-amber-200/50 p-3 rounded-2xl animate-fadeIn flex gap-2.5 items-start">
                        <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[10px] text-amber-700 font-extrabold leading-relaxed italic">
                          {livePreview}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </Modal>
  );
};
