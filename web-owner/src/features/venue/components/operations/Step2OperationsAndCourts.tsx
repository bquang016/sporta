import React, { useState } from 'react';
import { useVenueWizard } from './VenueWizardContext';
import { useToast } from '../../../../components/ui/Toast';
import { CurrencyInput } from '../../../../components/ui/CurrencyInput';
import { Dropdown } from '../../../../components/ui/Dropdown';
import { Checkbox } from '../../../../components/ui/Checkbox';
import { AdvancedOperationsModal } from './AdvancedOperationsModal';
import type { CourtDraftDto } from '../../types';

export const Step2OperationsAndCourts = () => {
  const { showToast } = useToast();
  const {
    openingTime, setOpeningTime,
    closingTime, setClosingTime,
    shiftDurationMinutes, setShiftDurationMinutes,
    hasSurcharge, setHasSurcharge,
    surchargeAmount, setSurchargeAmount,
    surchargeDescription, setSurchargeDescription,
    courts, setCourts,
    loading
  } = useVenueWizard();

  const [courtPrefix, setCourtPrefix] = useState('Sân');
  const [courtQuantity, setCourtQuantity] = useState<number>(1);
  const [newCourtPrice, setNewCourtPrice] = useState<number>(100000);
  
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [showTooltipTemp, setShowTooltipTemp] = useState(false);

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

  const handleBulkAddCourts = () => {
    if (!courtPrefix.trim()) {
      showToast('warning', 'Vui lòng nhập tên/tiền tố sân');
      return;
    }
    if (newCourtPrice <= 0) {
      showToast('warning', 'Giá thuê sân phải là số lớn hơn 0');
      return;
    }
    if (courtQuantity < 1 || courtQuantity > 50) {
      showToast('warning', 'Số lượng sân phải từ 1 đến 50');
      return;
    }

    const newCourts: CourtDraftDto[] = [];
    const baseName = courtPrefix.trim();

    if (courtQuantity === 1) {
      if (courts.some(c => c.name.toLowerCase() === baseName.toLowerCase())) {
        showToast('warning', `Tên sân "${baseName}" đã tồn tại`);
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

    setCourts([...courts, ...newCourts]);
    showToast('success', `Đã thêm ${newCourts.length} sân vào danh sách`);
    
    // Auto-show tooltip to remind about advanced config
    setShowTooltipTemp(true);
    setTimeout(() => {
      setShowTooltipTemp(false);
    }, 3000);
  };

  const handleRemoveCourt = (index: number) => {
    const courtName = courts[index].name;
    setCourts(courts.filter((_, i) => i !== index));
    showToast('info', `Đã xóa ${courtName}`);
  };

  const formatVND = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VND';
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
      <div className={`space-y-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="space-y-0.5">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Cấu hình vận hành chung</h4>
          <p className="text-[9px] text-slate-400 font-bold">Thiết lập giờ mở/đóng cửa và phụ thu cho toàn bộ cụm sân.</p>
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
                  disabled={loading}
                  className="w-full text-xs font-bold text-slate-700 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Đóng cửa</label>
                <Dropdown
                  options={hourDropdownOptions}
                  value={closingTime}
                  onChange={setClosingTime}
                  disabled={loading}
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
                disabled={loading}
                className="w-full text-xs font-bold text-slate-700 rounded-xl"
              />
            </div>
          </div>

          {/* Phụ thu */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Phụ thu khẩn cấp</h5>
              <Checkbox checked={hasSurcharge} onChange={setHasSurcharge} disabled={loading} />
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
                    disabled={loading}
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
      <div className={`space-y-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="space-y-0.5">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Danh sách sân bãi</h4>
          <p className="text-[9px] text-slate-400 font-bold">Tạo hàng loạt các sân và áp dụng quy tắc giá (giờ vàng, cuối tuần).</p>
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
              disabled={loading}
              className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-brand-emerald"
            />
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Số lượng</label>
            <input
              type="number"
              min="1"
              max="50"
              value={courtQuantity}
              onChange={e => setCourtQuantity(parseInt(e.target.value) || 1)}
              disabled={loading}
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
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-[11px] py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
            >
              Tạo sân
            </button>
          </div>
        </div>

        {/* Danh sách */}
        {courts.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-400 font-semibold bg-white shadow-2xs mt-4">
            Chưa có sân nào được thêm. Vui lòng tạo sân ở form phía trên.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mt-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Đã tạo {courts.length} sân
              </span>
              <div className="relative group">
                <button
                  type="button"
                  onClick={openAdvancedConfig}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-[10px] uppercase rounded-xl transition-all shadow-md"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
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
                    key={court.id || index}
                    className={`border rounded-2xl p-4 flex flex-col gap-3 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group ${
                      hasRules ? 'bg-emerald-50/20 border-emerald-200' : 'bg-white border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="text-xs font-black text-slate-800">{court.name}</h5>
                        <p className="text-[10px] text-brand-emerald font-extrabold">{formatVND(court.price)}</p>
                      </div>
                      
                      {hasRules ? (
                        <div className="px-2.5 py-1 rounded-md bg-brand-emerald text-white text-[8px] font-black uppercase shadow-sm">
                          Đã cấu hình
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 rounded-md bg-orange-100 text-orange-600 text-[8px] font-black uppercase">
                          Chưa cấu hình
                        </div>
                      )}
                    </div>

                    {hasRules && (
                      <div className="text-[9px] font-bold text-emerald-700 bg-emerald-50 rounded-lg p-2 border border-emerald-100">
                        Áp dụng {court.priceRules?.length} quy tắc giá đặc biệt
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveCourt(index)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Xóa sân này"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
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
        onCourtsChange={(newCourts: CourtDraftDto[]) => setCourts(newCourts)}
        openingTime={openingTime}
        closingTime={closingTime}
        shiftDurationMinutes={shiftDurationMinutes}
      />
    </div>
  );
};
