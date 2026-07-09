import React from 'react';
import type { VenueInfo } from '../types';
import { LocationPickerMap } from '../../venue/components/LocationPickerMap';

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
  
  const updateField = (field: keyof VenueInfo, value: any) => {
    onVenueInfoChange({ ...venueInfo, [field]: value });
  };

  return (
    <div className="flex-1 flex min-h-[600px] overflow-hidden select-none animate-fadeIn border border-slate-200 rounded-2xl shadow-sm bg-white">
      {/* Form Area */}
      <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col bg-white border-r border-slate-200 overflow-y-auto px-6 py-5 space-y-5 matrix-scroll">
        <div className="space-y-1">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Bước 1: Thông tin cơ bản</h3>
          <p className="text-[10px] text-slate-400 font-semibold leading-normal">
            Nhập các thông tin giới thiệu chung và vị trí định vị cụm sân của bạn.
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
              value={venueInfo.addressDetail}
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
                value={venueInfo.ward}
                className="w-full text-[10px] font-bold text-slate-750 px-2 py-2 rounded-lg border border-slate-200 bg-slate-100/50 cursor-default truncate"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Quận / Huyện</label>
              <input
                type="text"
                readOnly
                placeholder="Chưa chọn"
                value={venueInfo.district}
                className="w-full text-[10px] font-bold text-slate-750 px-2 py-2 rounded-lg border border-slate-200 bg-slate-100/50 cursor-default truncate"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Tỉnh / TP</label>
              <input
                type="text"
                readOnly
                placeholder="Chưa chọn"
                value={venueInfo.province}
                className="w-full text-[10px] font-bold text-slate-750 px-2 py-2 rounded-lg border border-slate-200 bg-slate-100/50 cursor-default truncate"
              />
            </div>
          </div>
        </div>

        {/* Coordinates indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Vĩ độ (Latitude)</label>
            <input
              type="text"
              readOnly
              value={venueInfo.latitude !== undefined ? venueInfo.latitude : 'Chưa định vị'}
              className="w-full text-xs font-bold text-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/60 focus:outline-none cursor-default"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Kinh độ (Longitude)</label>
            <input
              type="text"
              readOnly
              value={venueInfo.longitude !== undefined ? venueInfo.longitude : 'Chưa định vị'}
              className="w-full text-xs font-bold text-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/60 focus:outline-none cursor-default"
            />
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

      {/* Map Area */}
      <div className="hidden lg:flex flex-col flex-1 relative bg-slate-100">
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
            onChange={(data) => {
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
            }}
          />
        </div>
      </div>
    </div>
  );
};
