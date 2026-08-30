import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useVenueWizard } from './VenueWizardContext';
import { LocationPickerMap } from '../LocationPickerMap';
import { Maximize2, MapPin, ArrowLeft, Check, Compass } from 'lucide-react';

export const Step1BasicInfo = () => {
  const {
    name,
    setName,
    location,
    setLocation,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    description,
    setDescription,
    province,
    setProvince,
    district,
    setDistrict,
    ward,
    setWard,
    addressDetail,
    setAddressDetail,
    isPureEditMode
  } = useVenueWizard();

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
    setLocation(data.address);
    setLatitude(data.lat);
    setLongitude(data.lng);
    setProvince(data.province);
    setDistrict(data.district);
    setWard(data.ward);
    setAddressDetail(data.addressDetail);
  }, [setLocation, setLatitude, setLongitude, setProvince, setDistrict, setWard, setAddressDetail]);

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden select-none">
      {/* Form Area */}
      <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col bg-white border-r border-slate-200 overflow-y-auto px-5 py-4 space-y-4 matrix-scroll">
        <div className="space-y-1">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Bước 1: Thông tin cơ bản</h3>
          <p className="text-[10px] text-slate-400 font-semibold leading-normal">
            Nhập các thông tin giới thiệu chung và vị trí định vị cụm sân của bạn.
          </p>
        </div>

        {isPureEditMode && (
          <div className="bg-amber-50 border border-amber-200 text-amber-850 p-3.5 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[10px] text-amber-800 uppercase tracking-wider">
              <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Chú ý duyệt thông tin
            </div>
            <p className="text-[10px] text-amber-700 font-semibold leading-normal">
              Việc chỉnh sửa các trường nhạy cảm như <strong className="text-amber-900 font-black">Tên cụm sân</strong> hoặc <strong className="text-amber-900 font-black">Vị trí/Địa chỉ</strong> sẽ cần được Ban quản trị duyệt lại. Trong thời gian chờ duyệt, cụm sân vẫn hoạt động bình thường với tên và địa chỉ hiện tại.
            </p>
          </div>
        )}

        {/* Name input */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
            Tên cụm sân <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ví dụ: Sân Bóng Đại Học Y"
            value={name === 'Cụm sân chưa đặt tên' ? '' : name}
            onChange={(e) => setName(e.target.value)}
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
              className="touch-target flex items-center gap-1 px-2.5 py-1 bg-emerald-50 active:bg-emerald-100 text-brand-emerald rounded-full border border-emerald-200/80 text-[10px] font-black transition-all"
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
                initialLocation={{ lat: latitude || 21.0285, lng: longitude || 105.8542 }}
                initialAddress={location}
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
                className="touch-target flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 active:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-all"
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
                  {location || 'Kéo thả ghim tới vị trí sân'}
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
                initialLocation={{ lat: latitude || 21.0285, lng: longitude || 105.8542 }}
                initialAddress={location}
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
                  <p className="text-xs font-black text-slate-800 truncate">{addressDetail || location || 'Chưa chọn toạ độ'}</p>
                  <p className="text-[10px] text-slate-500 font-semibold truncate">
                    {[ward, district, province].filter(Boolean).join(', ') || 'Kéo ghim hoặc gõ tìm kiếm để định vị'}
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
              value={addressDetail}
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
                value={ward}
                className="w-full text-[10px] font-bold text-slate-750 px-2 py-2 rounded-lg border border-slate-200 bg-slate-100/50 cursor-default truncate"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Quận / Huyện</label>
              <input
                type="text"
                readOnly
                placeholder="Chưa chọn"
                value={district}
                className="w-full text-[10px] font-bold text-slate-750 px-2 py-2 rounded-lg border border-slate-200 bg-slate-100/50 cursor-default truncate"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Tỉnh / TP</label>
              <input
                type="text"
                readOnly
                placeholder="Chưa chọn"
                value={province}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs font-semibold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-emerald-100 resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* ── DESKTOP MAP AREA (Visible on lg screens) ── */}
      <div className="hidden lg:flex flex-col flex-1 relative bg-slate-100">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-full shadow-sm border border-slate-200/80 flex items-center gap-1.5 pointer-events-none">
          <svg className="w-3.5 h-3.5 text-brand-emerald" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-[9px] font-black text-slate-650 uppercase tracking-wider">Kéo thả pin chọn vị trí cụm sân</span>
        </div>

        <LocationPickerMap
          fullHeight
          initialLocation={{ lat: latitude || 21.0285, lng: longitude || 105.8542 }}
          initialAddress={location}
          onChange={handleMapChange}
        />
      </div>
    </div>
  );
};
