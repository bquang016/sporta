// ─────────────────────────────────────────────────────────────────────────────
// Setup Wizard — Step 2: Venue Info + Images (Refactored to match VenueFormScreen)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef } from 'react';
import type { VenueInfo } from '../types';
import { LocationPickerMap } from '../../venue/components/LocationPickerMap';
import { Dropdown } from '../../../components/ui/Dropdown';

interface VenueInfoStepProps {
  venueInfo: VenueInfo;
  onVenueInfoChange: (val: VenueInfo) => void;
  isLoading: boolean;
}

export const VenueInfoStep = ({
  venueInfo,
  onVenueInfoChange,
  isLoading,
}: VenueInfoStepProps) => {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

  const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2).toString().padStart(2, '0');
    const minutes = (i % 2 === 0 ? '00' : '30');
    return `${hours}:${minutes}`;
  });
  const hourDropdownOptions = TIME_OPTIONS.map(t => ({ value: t, label: t }));

  const SPORT_OPTIONS = [
    { value: '1', label: 'Bóng đá' },
    { value: '2', label: 'Cầu lông' },
    { value: '3', label: 'Pickleball' },
    { value: '4', label: 'Bóng rổ' }
  ];

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onVenueInfoChange({ ...venueInfo, coverImage: file });
    }
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onVenueInfoChange({ 
        ...venueInfo, 
        detailImages: [...venueInfo.detailImages, ...Array.from(files)] 
      });
    }
  };

  const removeDetailImage = (index: number) => {
    const updated = venueInfo.detailImages.filter((_, i) => i !== index);
    onVenueInfoChange({ ...venueInfo, detailImages: updated });
  };

  const getDurationWarning = (): string | null => {
    if (!venueInfo.openingTime || !venueInfo.closingTime || !venueInfo.shiftDurationMinutes) return null;
    try {
      const [openH, openM] = venueInfo.openingTime.split(':').map(Number);
      const [closeH, closeM] = venueInfo.closingTime.split(':').map(Number);
      if (isNaN(openH) || isNaN(openM) || isNaN(closeH) || isNaN(closeM)) return null;

      let totalMin = (closeH * 60 + closeM) - (openH * 60 + openM);
      if (totalMin <= 0) {
        totalMin += 24 * 60;
      }

      if (totalMin % venueInfo.shiftDurationMinutes !== 0) {
        return 'Cảnh báo: Thời gian đóng/mở cửa không khớp với thời lượng ca, sẽ có ca bị dư/thiếu giờ';
      }
    } catch (e) {
      // ignore
    }
    return null;
  };
  const durationWarning = getDurationWarning();

  return (
    <div className="animate-fadeIn flex flex-col md:flex-row gap-6 min-h-[600px]">
      
      {/* LEFT PANEL: Form */}
      <div className="flex-1 flex flex-col space-y-6">
        <div className="text-left">
          <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 border-2 border-brand-emerald/20 text-brand-emerald flex items-center justify-center mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Thông tin cụm sân</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
            Điền đầy đủ thông tin để hoàn tất hồ sơ đăng ký cụm sân của bạn
          </p>
        </div>

        {/* ① Tên cụm sân */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
            Tên cụm sân <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: Cụm Sân Thể Thao Cầu Giấy"
            value={venueInfo.name}
            onChange={e => onVenueInfoChange({ ...venueInfo, name: e.target.value })}
            disabled={isLoading}
            className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-brand-emerald transition-all"
          />
        </div>

        {/* ② Môn thể thao */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
            Môn thể thao chính <span className="text-red-500">*</span>
          </label>
          <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
            <Dropdown
              options={SPORT_OPTIONS}
              value={venueInfo.sportId}
              onChange={val => onVenueInfoChange({ ...venueInfo, sportId: val })}
              placeholder="Chọn môn thể thao chính"
              className="w-full"
            />
          </div>
        </div>

        {/* ③ Giờ mở / đóng cửa */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
            Thời gian hoạt động
          </label>
          <div className={`grid grid-cols-2 gap-3 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 block">Mở cửa</span>
              <Dropdown
                options={hourDropdownOptions}
                value={venueInfo.openingTime}
                onChange={val => onVenueInfoChange({ ...venueInfo, openingTime: val })}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 block">Đóng cửa</span>
              <Dropdown
                options={hourDropdownOptions}
                value={venueInfo.closingTime}
                onChange={val => onVenueInfoChange({ ...venueInfo, closingTime: val })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* ③.5 Thời lượng ca */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
            Thời lượng ca (phút) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            placeholder="VD: 30"
            value={venueInfo.shiftDurationMinutes || ''}
            onChange={e => {
              const val = parseInt(e.target.value);
              onVenueInfoChange({ ...venueInfo, shiftDurationMinutes: isNaN(val) ? 30 : val });
            }}
            disabled={isLoading}
            className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-brand-emerald transition-all"
          />
          {durationWarning && (
            <p className="text-[10px] text-amber-600 font-bold flex items-start gap-1 bg-amber-50 border border-amber-100 p-2 rounded-lg leading-normal mt-1 animate-fadeIn">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{durationWarning}</span>
            </p>
          )}
        </div>

        {/* ④ Địa chỉ (Text input cho mobile) */}
        <div className="space-y-1.5 md:hidden">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
            Địa chỉ cụm sân <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập địa chỉ cụm sân..."
              value={venueInfo.location}
              onChange={e => onVenueInfoChange({ ...venueInfo, location: e.target.value })}
              disabled={isLoading}
              className="w-full text-xs font-bold text-slate-700 pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-brand-emerald transition-all"
            />
            <svg className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* ⑤ Mô tả */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
            Giới thiệu & Tiện ích
          </label>
          <textarea
            placeholder="Mô tả các dịch vụ, tiện ích, bãi đậu xe, phòng tắm, trà nước..."
            value={venueInfo.description}
            onChange={e => onVenueInfoChange({ ...venueInfo, description: e.target.value })}
            disabled={isLoading}
            className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-emerald-100 h-20 resize-none transition-all"
          />
        </div>

        {/* ⑥ Phụ thu */}
        <div className="space-y-3 pt-3 pb-2 border-t border-b border-slate-100">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={venueInfo.hasSurcharge}
                onChange={(e) => onVenueInfoChange({ ...venueInfo, hasSurcharge: e.target.checked })}
                disabled={isLoading}
                className="w-4 h-4 text-brand-emerald rounded border-slate-300 focus:ring-brand-emerald cursor-pointer"
              />
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider group-hover:text-slate-800 transition-colors">
              Áp dụng Phụ thu chung (VD: Trà đá, Dọn dẹp...)
            </span>
          </label>

          {venueInfo.hasSurcharge && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  Số tiền phụ thu (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="VD: 20000"
                  value={venueInfo.surchargeAmount || ''}
                  onChange={(e) => onVenueInfoChange({ ...venueInfo, surchargeAmount: Number(e.target.value) })}
                  disabled={isLoading}
                  className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-emerald-100 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                  Mô tả phụ thu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Phí dọn dẹp sân bãi"
                  value={venueInfo.surchargeDescription}
                  onChange={(e) => onVenueInfoChange({ ...venueInfo, surchargeDescription: e.target.value })}
                  disabled={isLoading}
                  className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-emerald-100 bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* ⑦ Ảnh bìa */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
            Ảnh bìa cụm sân
          </label>
          <div className="flex gap-4 items-start">
            <div className="w-28 h-20 bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl overflow-hidden relative flex-shrink-0 flex items-center justify-center">
              {venueInfo.coverImage ? (
                <img src={URL.createObjectURL(venueInfo.coverImage)} alt="Cover preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-5 h-5 text-slate-350" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>

            <div className="flex-1">
              <input type="file" accept="image/*" ref={coverInputRef} onChange={handleCoverChange} className="hidden" />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-brand-emerald border border-emerald-150 font-extrabold text-[9px] px-3 py-2 rounded-xl active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Tải ảnh bìa lên
              </button>
            </div>
          </div>
        </div>

        {/* ⑧ Ảnh chi tiết */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
              Ảnh chi tiết
            </label>
            <span className="text-[9px] text-slate-400 font-bold">{venueInfo.detailImages.length} ảnh</span>
          </div>

          <input type="file" accept="image/*" multiple ref={detailInputRef} onChange={handleDetailChange} className="hidden" />
          <button
            type="button"
            onClick={() => detailInputRef.current?.click()}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 font-extrabold text-[9px] px-3.5 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5 text-slate-450" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Thêm ảnh chi tiết
          </button>

          {venueInfo.detailImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {venueInfo.detailImages.map((file, index) => (
                <div key={index} className="aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden relative group">
                  <img src={URL.createObjectURL(file)} alt={`Detail ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeDetailImage(index)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer"
                    title="Xóa ảnh"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Map (Hidden on mobile) */}
      <div className="hidden md:flex flex-col flex-1 relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200 min-h-[500px]">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200/80 flex items-center gap-1.5 pointer-events-none">
          <svg className="w-3 h-3 text-brand-emerald" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider">Chọn vị trí trên bản đồ</span>
        </div>

        <div className="absolute top-16 left-4 right-4 z-20">
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập địa chỉ cụm sân..."
              value={venueInfo.location}
              onChange={e => onVenueInfoChange({ ...venueInfo, location: e.target.value })}
              disabled={isLoading}
              className="w-full text-xs font-bold text-slate-700 pl-9 pr-3.5 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-brand-emerald transition-all"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className={isLoading ? "opacity-50 pointer-events-none h-full" : "h-full"}>
          <LocationPickerMap
            fullHeight
            initialLocation={{ lat: venueInfo.latitude || 21.028511, lng: venueInfo.longitude || 105.804817 }}
            initialAddress={venueInfo.location}
            onChange={(data) => {
              onVenueInfoChange({ 
                ...venueInfo, 
                location: data.address, 
                latitude: data.lat, 
                longitude: data.lng 
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
