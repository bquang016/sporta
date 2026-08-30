import React, { useState } from 'react';
import type { VenueInfo, SubCourt } from '../types';
import { useToast } from '../../../components/ui/Toast';
import { CurrencyInput } from '../../../components/ui/CurrencyInput';
import { Dropdown } from '../../../components/ui/Dropdown';
import { Checkbox } from '../../../components/ui/Checkbox';
import { AdvancedOperationsModal } from './AdvancedOperationsModal';
import { Plus, Trash2, Settings, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface VenueCourtsStepProps {
  venueInfo: VenueInfo;
  onVenueInfoChange: (val: VenueInfo) => void;
  courts: SubCourt[];
  onCourtsChange: (val: SubCourt[]) => void;
  isLoading: boolean;
}

export const VenueCourtsStep = ({
  venueInfo,
  onVenueInfoChange,
  courts,
  onCourtsChange,
  isLoading
}: VenueCourtsStepProps) => {
  const { showToast } = useToast();

  const [courtPrefix, setCourtPrefix] = useState('Sân');
  const [courtQuantity, setCourtQuantity] = useState<number>(0);
  const [newCourtPrice, setNewCourtPrice] = useState<number>(100000);
  
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [showTooltipTemp, setShowTooltipTemp] = useState(false);

  const {
    openingTime,
    closingTime,
    shiftDurationMinutes,
    hasSurcharge,
    surchargeAmount,
    surchargeDescription,
  } = venueInfo;

  const setOpeningTime = (val: string) => onVenueInfoChange({ ...venueInfo, openingTime: val });
  const setClosingTime = (val: string) => onVenueInfoChange({ ...venueInfo, closingTime: val });
  const setShiftDurationMinutes = (val?: number) => onVenueInfoChange({ ...venueInfo, shiftDurationMinutes: val || 0 });
  const setHasSurcharge = (val: boolean) => onVenueInfoChange({ ...venueInfo, hasSurcharge: val });
  const setSurchargeAmount = (val?: number) => onVenueInfoChange({ ...venueInfo, surchargeAmount: val });
  const setSurchargeDescription = (val: string) => onVenueInfoChange({ ...venueInfo, surchargeDescription: val });

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

  const DAYS_MAP: Record<number, string> = {
    1: 'Thứ 2',
    2: 'Thứ 3',
    3: 'Thứ 4',
    4: 'Thứ 5',
    5: 'Thứ 6',
    6: 'Thứ 7',
    7: 'Chủ Nhật'
  };

  const handleBulkAddCourts = () => {
    if (!courtPrefix.trim()) {
      showToast('warning', 'Vui lòng nhập tên/tiền tố sân');
      return;
    }
    if (newCourtPrice <= 0) {
      showToast('warning', 'Giá thuê sân phải là số lớn hơn 0');
      return;
    }
    if (courtQuantity < 1) {
      showToast('warning', 'Vui lòng nhập số lượng sân cần tạo (tối thiểu 1 sân)');
      return;
    }
    if (courtQuantity > 50) {
      showToast('warning', 'Số lượng sân tạo mỗi lần tối đa là 50');
      return;
    }

    const newCourts: SubCourt[] = [];
    const baseName = courtPrefix.trim();

    if (courtQuantity === 1) {
      if (courts.some(c => c.name.toLowerCase() === baseName.toLowerCase())) {
        showToast('warning', `Tên sân "${baseName}" đã tồn tại trong danh sách`);
        return;
      }
      newCourts.push({
        name: baseName,
        price: newCourtPrice,
        status: 'ACTIVE',
        priceRules: []
      });
    } else {
      let added = 0;
      let counter = 1;
      while (added < courtQuantity) {
        const potentialName = `${baseName} ${counter}`;
        const exists = courts.some(c => c.name.toLowerCase() === potentialName.toLowerCase()) || 
                       newCourts.some(c => c.name.toLowerCase() === potentialName.toLowerCase());
        
        if (!exists) {
          newCourts.push({
            name: potentialName,
            price: newCourtPrice,
            status: 'ACTIVE',
            priceRules: []
          });
          added++;
        }
        counter++;
        if (counter > 1000) break; // safety fallback
      }
    }

    onCourtsChange([...courts, ...newCourts]);
    // Fallback số lượng về 0 sau khi thêm để tránh double click / tạo nhầm
    setCourtQuantity(0);
    showToast('success', `Đã thêm ${newCourts.length} sân vào danh sách`);
    
    // Auto-show tooltip to remind about advanced config
    setShowTooltipTemp(true);
    setTimeout(() => {
      setShowTooltipTemp(false);
    }, 3000);
  };

  const handleRemoveCourt = (index: number) => {
    const courtName = courts[index].name;
    onCourtsChange(courts.filter((_, i) => i !== index));
    showToast('info', `Đã xóa ${courtName}`);
  };

  const handleRemoveRuleFromCourt = (courtIndex: number, ruleIndex: number) => {
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

  const formatVND = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + ' đ';
  };

  const openAdvancedConfig = () => {
    if (!shiftDurationMinutes || !openingTime || !closingTime) {
      showToast('warning', 'Vui lòng thiết lập cấu hình vận hành (giờ mở/đóng cửa, thời lượng ca) trước khi cài đặt nâng cao.');
      return;
    }
    setIsAdvancedModalOpen(true);
  };

  return (
    <div className="flex-grow overflow-y-auto px-8 py-6 space-y-8 select-none max-w-4xl mx-auto w-full font-sans animate-fadeIn">

      {/* 1. Cấu hình vận hành cơ bản */}
      <div className={`space-y-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="space-y-0.5">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Cấu hình vận hành chung</h4>
          <p className="text-[10px] text-slate-500 font-bold">Thiết lập giờ mở/đóng cửa và phụ thu cho toàn bộ cụm sân.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 border border-slate-100 rounded-3xl p-5 shadow-xs">
          {/* Giờ hoạt động */}
          <div className="space-y-5">
            <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">Khung giờ hoạt động</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Mở cửa</label>
                <Dropdown
                  options={hourDropdownOptions}
                  value={openingTime}
                  onChange={setOpeningTime}
                  disabled={isLoading}
                  className="w-full text-xs font-bold text-slate-700 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Đóng cửa</label>
                <Dropdown
                  options={hourDropdownOptions}
                  value={closingTime}
                  onChange={setClosingTime}
                  disabled={isLoading}
                  className="w-full text-xs font-bold text-slate-700 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Thời lượng 1 ca</label>
              <Dropdown
                options={SHIFT_DURATIONS}
                value={shiftDurationMinutes ? String(shiftDurationMinutes) : ''}
                onChange={val => setShiftDurationMinutes(val ? parseInt(val) : undefined)}
                disabled={isLoading}
                className="w-full text-xs font-bold text-slate-700 rounded-xl"
              />
            </div>
          </div>

          {/* Phụ thu */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Phụ thu khẩn cấp</h5>
              <Checkbox checked={hasSurcharge} onChange={setHasSurcharge} disabled={isLoading} />
            </div>

            {hasSurcharge ? (
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
                  <input
                    type="text"
                    placeholder="Ví dụ: Dọn dẹp sau 18:00..."
                    value={surchargeDescription}
                    onChange={e => setSurchargeDescription(e.target.value)}
                    disabled={isLoading}
                    className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-emerald"
                  />
                </div>
              </div>
            ) : (
              <div className="text-[10px] font-bold text-slate-400 bg-slate-100/50 p-3 rounded-xl border border-dashed border-slate-200 h-24 flex items-center justify-center">
                Không có phụ thu nào được áp dụng
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-slate-100" />

      {/* 2. Form thêm sân & Danh sách */}
      <div className={`space-y-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="space-y-0.5">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Danh sách sân bãi</h4>
          <p className="text-[10px] text-slate-400 font-bold">Tạo các sân và áp dụng quy tắc giá (giờ vàng, cuối tuần).</p>
        </div>

        {/* Form thêm */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs items-end">
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Tên tiền tố</label>
            <input
              type="text"
              placeholder="VD: Sân"
              value={courtPrefix}
              onChange={e => setCourtPrefix(e.target.value)}
              disabled={isLoading}
              className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-brand-emerald"
            />
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Số lượng sân</label>
            <input
              type="number"
              min="0"
              max="50"
              placeholder="0"
              value={courtQuantity === 0 ? '' : courtQuantity}
              onChange={e => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                setCourtQuantity(isNaN(val) ? 0 : Math.max(0, Math.min(50, val)));
              }}
              disabled={isLoading}
              className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-brand-emerald"
            />
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Giá cơ bản / ca</label>
            <CurrencyInput
              value={newCourtPrice}
              onChange={val => setNewCourtPrice(val || 0)}
              placeholder="100.000"
            />
          </div>
          <div className="md:col-span-1">
            <button
              type="button"
              onClick={handleBulkAddCourts}
              disabled={isLoading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-[11px] py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Tạo sân
            </button>
          </div>
        </div>

        {/* Danh sách */}
        {courts.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-400 font-semibold bg-white shadow-2xs mt-4">
            Chưa có sân nào được thêm. Vui lòng nhập số lượng và bấm Tạo sân ở form phía trên.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mt-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Đã tạo <strong className="text-brand-emerald">{courts.length}</strong> sân
              </span>
              <div className="relative group">
                <button
                  type="button"
                  onClick={openAdvancedConfig}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-[10px] uppercase rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Cài đặt nâng cao
                </button>
                {/* Tooltip */}
                <div className={`absolute right-0 bottom-full mb-2 w-48 p-2.5 bg-slate-800 text-white text-[10px] font-bold rounded-xl transition-all shadow-lg text-center leading-relaxed z-10 pointer-events-none ${
                  showTooltipTemp ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
                }`}>
                  Tạo quy tắc giá đặc biệt (giờ vàng, cuối tuần) và áp dụng cho nhiều sân cùng lúc
                  {/* Arrow pointing down */}
                  <div className="absolute top-full right-8 -mt-[1px] border-[6px] border-transparent border-t-slate-800" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courts.map((court, index) => {
                const hasRules = court.priceRules && court.priceRules.length > 0;
                
                return (
                  <div
                    key={index}
                    className={`border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group ${
                      hasRules ? 'bg-emerald-50/20 border-emerald-200' : 'bg-white border-slate-200/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between pr-8">
                        <div>
                          <h5 className="text-xs font-black text-slate-800">{court.name}</h5>
                          <p className="text-[10px] text-brand-emerald font-extrabold">{formatVND(court.price)} / ca</p>
                        </div>
                        
                        {hasRules ? (
                          <div className="px-2 py-0.5 rounded-md bg-brand-emerald text-white text-[8px] font-black uppercase shadow-sm">
                            {court.priceRules?.length} quy tắc
                          </div>
                        ) : (
                          <div className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[8px] font-black uppercase">
                            Giá cơ bản
                          </div>
                        )}
                      </div>

                      {/* Display active rules with individual remove option */}
                      {hasRules && (
                        <div className="mt-2.5 space-y-1 pt-2 border-t border-emerald-150/60">
                          <div className="flex flex-wrap gap-1">
                            {court.priceRules?.map((r, rIdx) => (
                              <span
                                key={rIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-[9px] font-bold text-emerald-800 shadow-2xs"
                              >
                                {r.ruleType === 'SHIFT' 
                                  ? `Ca ${r.startTime}-${r.endTime}: ${formatVND(r.customPrice || 0)}`
                                  : `${r.dayOfWeek ? (DAYS_MAP[r.dayOfWeek] || `Thứ ${r.dayOfWeek}`) : 'Theo ngày'}: ${r.percentageModifier && r.percentageModifier !== 1 ? `+${Math.round((r.percentageModifier - 1) * 100)}%` : `+${formatVND(r.fixedModifier || 0)}`}`}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRuleFromCourt(index, rIdx)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer font-bold"
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

                    <button
                      type="button"
                      onClick={() => handleRemoveCourt(index)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Xóa sân này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AdvancedOperationsModal 
        isOpen={isAdvancedModalOpen}
        onClose={() => setIsAdvancedModalOpen(false)}
        courts={courts}
        onCourtsChange={onCourtsChange}
        openingTime={openingTime}
        closingTime={closingTime}
        shiftDurationMinutes={shiftDurationMinutes}
      />
    </div>
  );
};
