import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { VenueInfo } from '../types';
import { LocationPickerMap } from '../../venue/components/LocationPickerMap';
import { Maximize2, MapPin, ArrowLeft, Check, Compass } from 'lucide-react';

interface VenueBasicStepProps {
  venueInfo: VenueInfo;
  onVenueInfoChange: (val: VenueInfo) => void;
  isLoading: boolean;
}

export const VenueBasicStep = ({
  venueInfo,
  onVenueInfoChange,
  isLoading
}: VenueBasicStepProps) => {
  const [isFullScreenMapOpen, setIsFullScreenMapOpen] = useState(false);

  const handleMapChange = useCallback((data: {
    lat: number;
    lng: number;
    address: string;
    province: string;
    district: string;
    ward: string;
    addressDetail: string;
  }) => {
    onVenueInfoChange({
      ...venueInfo,
      location: data.address,
      latitude: data.lat,
      longitude: data.lng,
      province: data.province,
      district: data.district,
      ward: data.ward,
      addressDetail: data.addressDetail
    });
  }, [venueInfo, onVenueInfoChange]);

  const updateField = (field: keyof VenueInfo, value: any) => {
    onVenueInfoChange({ ...venueInfo, [field]: value });
  };

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 select-none animate-fadeIn min-h-0">
      {/* Form Area */}
      <div className="w-full lg:w-[48%] xl:w-[45%] flex flex-col space-y-4">
        <div className="space-y-1">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Thông tin cơ bản cụm sân</h3>
          <p className="text-[10px] text-slate-400 font-semibold leading-normal">
            Nhập tên và định vị vị trí địa lý của cụm sân trên bản đồ.
          </p>
        </div>

        {/* Name input */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
            Tên cụm sân <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Sân Bóng Đại Học Y"
            value={venueInfo.name === 'Cụm sân chưa đặt tên' ? '' : venueInfo.name}
            onChange={(e) => updateField('name', e.target.value)}
            disabled={isLoading}
            className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-emerald-100"
          />
        </div>

        {/* ── MOBILE MAP SECTION (Visible only on mobile/tablet screens < lg) ── */}
        <div className="block lg:hidden space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Bản đồ vị trí</span>
            </label>
            <button
              type="button"
              onClick={() => setIsFullScreenMapOpen(true)}
              className="touch-target flex items-center gap-1 px-2.5 py-1 bg-emerald-50 active:bg-emerald-100 text-brand-emerald rounded-full border border-emerald-200/80 text-[10px] font-black transition-all cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Toàn màn hình</span>
            </button>
          </div>

          <div className="h-[280px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xs relative bg-slate-100">
            {!isFullScreenMapOpen && (
              <LocationPickerMap
                fullHeight
                hideConfirmBar
                initialLocation={{ lat: venueInfo.latitude || 21.0285, lng: venueInfo.longitude || 105.8542 }}
                initialAddress={venueInfo.location}
                onChange={handleMapChange}
              />
            )}
          </div>
        </div>

        {/* ── FULLSCREEN MAP MODAL ON MOBILE ── */}
        {isFullScreenMapOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[99999] bg-white flex flex-col animate-fadeIn font-sans select-none">
            {/* Top Navigation Bar */}
            <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs z-30">
              <button
                type="button"
                onClick={() => setIsFullScreenMapOpen(false)}
                className="touch-target flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 active:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>

              <div className="text-center px-2 min-w-0 flex-1">
                <h4 className="text-xs font-black text-slate-800 flex items-center justify-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>Định vị cụm sân</span>
                </h4>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {venueInfo.location || 'Kéo thả ghim tới vị trí sân'}
                </p>
              </div>

              {/* Spacer to keep title centered */}
              <div className="w-16" />
            </div>

            {/* Fullscreen Map Canvas */}
            <div className="flex-1 relative overflow-hidden bg-slate-100">
              <LocationPickerMap
                fullHeight
                hideConfirmBar
                initialLocation={{ lat: venueInfo.latitude || 21.0285, lng: venueInfo.longitude || 105.8542 }}
                initialAddress={venueInfo.location}
                onChange={handleMapChange}
              />
            </div>

            {/* Floating Bottom Details Card */}
            <div 
              className="flex-shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-3 shadow-lg z-30 space-y-2.5"
              style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-brand-emerald flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-100">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-800 truncate">{venueInfo.addressDetail || venueInfo.location || 'Chưa chọn toạ độ'}</p>
                  <p className="text-[10px] text-slate-500 font-semibold truncate">
                    {[venueInfo.ward, venueInfo.district, venueInfo.province].filter(Boolean).join(', ') || 'Kéo ghim hoặc gõ tìm kiếm để định vị'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFullScreenMapOpen(false)}
                className="touch-target w-full py-3 bg-brand-emerald hover:bg-emerald-900 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4 text-brand-yellow" />
                <span>Xác nhận & Sử dụng vị trí này</span>
              </button>
            </div>
          </div>,
          document.body
        )}

        {/* Structured Administrative Details Panel */}
        <div className="space-y-3.5 border border-slate-150 bg-slate-50/50 p-4 rounded-2xl">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-slate-800 uppercase tracking-wider">Chi tiết địa chỉ hành chính</span>
            <span className="text-[8px] font-extrabold text-brand-emerald bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 animate-pulse">
              Định vị từ Bản đồ
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Đường / Số nhà (Địa chỉ chi tiết)</label>
            <input
              type="text"
              readOnly
              placeholder="Vui lòng định vị trên bản đồ..."
              value={venueInfo.addressDetail || ''}
              className="w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/50 cursor-default"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Phường / Xã</label>
              <input
                type="text"
                readOnly
                placeholder="Chưa chọn"
                value={venueInfo.ward || ''}
                className="w-full text-[10px] font-bold text-slate-750 px-2 py-2 rounded-lg border border-slate-200 bg-slate-100/50 cursor-default truncate"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Quận / Huyện</label>
              <input
                type="text"
                readOnly
                placeholder="Chưa chọn"
                value={venueInfo.district || ''}
                className="w-full text-[10px] font-bold text-slate-750 px-2 py-2 rounded-lg border border-slate-200 bg-slate-100/50 cursor-default truncate"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Tỉnh / TP</label>
              <input
                type="text"
                readOnly
                placeholder="Chưa chọn"
                value={venueInfo.province || ''}
                className="w-full text-[10px] font-bold text-slate-750 px-2 py-2 rounded-lg border border-slate-200 bg-slate-100/50 cursor-default truncate"
              />
            </div>
          </div>
        </div>

        {/* Description textarea */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Mô tả cụm sân</label>
          <textarea
            rows={4}
            placeholder="Ví dụ: Cụm gồm 4 sân bóng đá cỏ nhân tạo 7 người, hệ thống chiếu sáng chuẩn chuyên nghiệp..."
            value={venueInfo.description}
            onChange={(e) => updateField('description', e.target.value)}
            disabled={isLoading}
            className="w-full text-xs font-semibold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-emerald-100 resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* ── DESKTOP MAP AREA (Visible on lg screens) ── */}
      <div className="hidden lg:flex flex-col flex-1 relative bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 min-h-[420px]">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-full shadow-sm border border-slate-200/80 flex items-center gap-1.5 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-brand-emerald" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-[9px] font-black text-slate-650 uppercase tracking-wider">Kéo thả pin chọn vị trí cụm sân</span>
        </div>

        <div className={isLoading ? "opacity-50 pointer-events-none h-full" : "h-full"}>
          <LocationPickerMap
            fullHeight
            initialLocation={{ lat: venueInfo.latitude || 21.0285, lng: venueInfo.longitude || 105.8542 }}
            initialAddress={venueInfo.location}
            onChange={handleMapChange}
          />
        </div>
      </div>
    </div>
  );
};
