// ─────────────────────────────────────────────────────────────────────────────
// Registration — Step 2: Personal Info + Venue Info Form
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef } from 'react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import type { PersonalInfo, VenueInfo } from '../types';
import { SPORT_TYPE_OPTIONS } from '../types';

interface InfoStepProps {
  personalInfo: PersonalInfo;
  onPersonalInfoChange: (val: PersonalInfo) => void;
  venueInfo: VenueInfo;
  onVenueInfoChange: (val: VenueInfo) => void;
  onSubmit: () => void;
  isLoading: boolean;
  errorMsg: string;
}

export const InfoStep = ({
  personalInfo,
  onPersonalInfoChange,
  venueInfo,
  onVenueInfoChange,
  onSubmit,
  isLoading,
  errorMsg,
}: InfoStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleSportToggle = (sportValue: string) => {
    const current = venueInfo.sportTypes;
    const updated = current.includes(sportValue)
      ? current.filter((s) => s !== sportValue)
      : [...current, sportValue];
    onVenueInfoChange({ ...venueInfo, sportTypes: updated });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onVenueInfoChange({ ...venueInfo, images: [...venueInfo.images, ...newFiles] });
    }
  };

  const removeFile = (index: number) => {
    const updated = venueInfo.images.filter((_, i) => i !== index);
    onVenueInfoChange({ ...venueInfo, images: updated });
  };

  /* Reusable input component for consistency */
  const InputField = ({
    id,
    label,
    icon,
    value,
    onChange,
    placeholder,
    type = 'text',
  }: {
    id: string;
    label: string;
    icon: React.ReactNode;
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    type?: string;
  }) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                     focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
          disabled={isLoading}
        />
      </div>
    </div>
  );

  /* ── Icons ── */
  const UserIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const IdCardIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  );

  const BuildingIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  const LocationIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-4 lg:mb-5">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-brand-emerald/10 border-2 border-brand-emerald/20 text-brand-emerald flex items-center justify-center mx-auto mb-2 lg:mb-3">
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-base lg:text-lg font-black text-slate-800 tracking-tight">
          Điền thông tin hồ sơ
        </h3>
        <p className="text-[10px] lg:text-[11px] text-slate-400 font-semibold mt-0.5">
          Thông tin cá nhân và cụm sân của bạn
        </p>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-600 flex items-center gap-2 animate-fadeIn">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ═══ SECTION 1: Personal Info ═══ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-md bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
              Thông tin cá nhân
            </h4>
          </div>
          <div className="space-y-3">
            <InputField
              id="reg-fullname"
              label="Họ và tên"
              icon={UserIcon}
              value={personalInfo.fullName}
              onChange={(val) => onPersonalInfoChange({ ...personalInfo, fullName: val })}
              placeholder="Nguyễn Văn A"
            />
            <InputField
              id="reg-id-number"
              label="Số CCCD / CMND"
              icon={IdCardIcon}
              value={personalInfo.idNumber}
              onChange={(val) => onPersonalInfoChange({ ...personalInfo, idNumber: val })}
              placeholder="012345678901"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* ═══ SECTION 2: Venue Info ═══ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-md bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
              Thông tin cụm sân
            </h4>
          </div>

          <div className="space-y-3">
            <InputField
              id="reg-venue-name"
              label="Tên cụm sân"
              icon={BuildingIcon}
              value={venueInfo.venueName}
              onChange={(val) => onVenueInfoChange({ ...venueInfo, venueName: val })}
              placeholder="Sân bóng Thành Công"
            />

            {/* Address row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InputField
                id="reg-province"
                label="Tỉnh / Thành phố"
                icon={LocationIcon}
                value={venueInfo.province}
                onChange={(val) => onVenueInfoChange({ ...venueInfo, province: val })}
                placeholder="TP. Hồ Chí Minh"
              />
              <InputField
                id="reg-district"
                label="Quận / Huyện"
                icon={LocationIcon}
                value={venueInfo.district}
                onChange={(val) => onVenueInfoChange({ ...venueInfo, district: val })}
                placeholder="Quận 7"
              />
              <InputField
                id="reg-ward"
                label="Phường / Xã"
                icon={LocationIcon}
                value={venueInfo.ward}
                onChange={(val) => onVenueInfoChange({ ...venueInfo, ward: val })}
                placeholder="Tân Phong"
              />
            </div>

            {/* Sport types — chip selector */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
                Loại sân
              </label>
              <div className="flex flex-wrap gap-2">
                {SPORT_TYPE_OPTIONS.map((sport) => {
                  const isSelected = venueInfo.sportTypes.includes(sport.value);
                  return (
                    <button
                      key={sport.value}
                      type="button"
                      onClick={() => handleSportToggle(sport.value)}
                      disabled={isLoading}
                      className={`
                        px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider
                        border transition-all duration-200 cursor-pointer
                        ${isSelected
                          ? 'bg-brand-emerald text-white border-brand-emerald shadow-sm shadow-brand-emerald/20'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-brand-emerald/40 hover:text-brand-emerald'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {sport.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-court count */}
            <div className="space-y-1.5">
              <label htmlFor="reg-court-count" className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
                Số lượng sân con
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onVenueInfoChange({
                      ...venueInfo,
                      subCourtCount: Math.max(1, venueInfo.subCourtCount - 1),
                    })
                  }
                  disabled={isLoading || venueInfo.subCourtCount <= 1}
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-black text-sm
                             flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <input
                  id="reg-court-count"
                  type="number"
                  min={1}
                  value={venueInfo.subCourtCount}
                  onChange={(e) =>
                    onVenueInfoChange({
                      ...venueInfo,
                      subCourtCount: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-16 text-center py-2 rounded-xl border border-slate-200 bg-slate-50/60 font-black text-sm text-slate-700
                             focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() =>
                    onVenueInfoChange({
                      ...venueInfo,
                      subCourtCount: venueInfo.subCourtCount + 1,
                    })
                  }
                  disabled={isLoading}
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-black text-sm
                             flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Image upload */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
                Hình ảnh sân / Giấy phép kinh doanh
              </label>

              {/* Upload area */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full border-2 border-dashed border-slate-200 hover:border-brand-emerald/40 rounded-xl p-4
                           flex flex-col items-center gap-1.5 transition-colors cursor-pointer group
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-brand-emerald/10 text-slate-400 group-hover:text-brand-emerald flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[9px] font-black text-slate-400 group-hover:text-brand-emerald uppercase tracking-wider transition-colors">
                  Nhấn để tải ảnh lên
                </span>
                <span className="text-[8px] text-slate-400 font-medium">
                  JPG, PNG, PDF — tối đa 10MB mỗi file
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              {/* File previews */}
              {venueInfo.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {venueInfo.images.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-brand-emerald/5 border border-brand-emerald/15 rounded-lg px-2.5 py-1.5"
                    >
                      <svg className="w-3 h-3 text-brand-emerald flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-[9px] font-bold text-slate-600 max-w-[100px] truncate">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-0.5"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          id="register-submit"
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-xs py-3 lg:py-3.5 rounded-xl shadow-md
                     transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer
                     disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="primary" />
              <span>Đang gửi hồ sơ...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Gửi hồ sơ đăng ký</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
