import React from 'react';
import { useVenueWizard } from './VenueWizardContext';
import { LocationPickerMap } from '../LocationPickerMap';

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

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden select-none">
      {/* Form Area */}
      <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col bg-white border-r border-slate-200 overflow-y-auto px-6 py-5 space-y-5 matrix-scroll">
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

        {/* Coordinates indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Vĩ độ (Latitude)</label>
            <input
              type="text"
              readOnly
              value={latitude !== undefined ? latitude : 'Chưa định vị'}
              className="w-full text-xs font-bold text-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/60 focus:outline-none cursor-default"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Kinh độ (Longitude)</label>
            <input
              type="text"
              readOnly
              value={longitude !== undefined ? longitude : 'Chưa định vị'}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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

        <LocationPickerMap
          fullHeight
          initialLocation={{ lat: latitude || 21.0285, lng: longitude || 105.8542 }}
          initialAddress={location}
          onChange={(data) => {
            setLocation(data.address);
            setLatitude(data.lat);
            setLongitude(data.lng);
            setProvince(data.province);
            setDistrict(data.district);
            setWard(data.ward);
            setAddressDetail(data.addressDetail);
          }}
        />
      </div>
    </div>
  );
};
