// ─────────────────────────────────────────────────────────────────────────────
// Setup Wizard — Step 2: Venue Info + Images
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState, useEffect } from 'react';
import type { VenueInfo } from '../types';
import { SPORT_TYPE_OPTIONS } from '../types';

interface VenueInfoStepProps {
  venueInfo: VenueInfo;
  onVenueInfoChange: (val: VenueInfo) => void;
  isLoading: boolean;
}

/* Icons */
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

/* Reusable input */
const InputField = ({
  id, label, icon, value, onChange, placeholder, disabled
}: {
  id: string; label: string; icon: React.ReactNode; value: string;
  onChange: (val: string) => void; placeholder: string; disabled?: boolean;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
      <input
        id={id} type="text" placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                   focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
        disabled={disabled}
      />
    </div>
  </div>
);

/* Reusable Select */
const SelectField = ({
  id, label, icon, value, onChange, options, placeholder, disabled
}: {
  id: string; label: string; icon: React.ReactNode; value: string;
  onChange: (val: string) => void; options: {code: number, name: string}[]; placeholder: string; disabled?: boolean;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
      <select
        id={id} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700
                   focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all appearance-none cursor-pointer"
        disabled={disabled || options.length === 0}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.code} value={opt.name}>{opt.name}</option>
        ))}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

export const VenueInfoStep = ({
  venueInfo,
  onVenueInfoChange,
  isLoading,
}: VenueInfoStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [provinces, setProvinces] = useState<{code: number, name: string}[]>([]);
  const [districts, setDistricts] = useState<{code: number, name: string}[]>([]);
  const [wards, setWards] = useState<{code: number, name: string}[]>([]);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);

  // Initial load for provinces
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => {
        setProvinces(data);
        // Pre-select if value exists
        if (venueInfo.province) {
          const p = data.find((x: any) => x.name === venueInfo.province);
          if (p) setSelectedProvinceCode(p.code);
        }
      })
      .catch(err => console.error("Failed to load provinces", err));
  }, []);

  // When province changes, fetch districts
  useEffect(() => {
    if (selectedProvinceCode) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvinceCode}?depth=2`)
        .then(res => res.json())
        .then(data => {
          setDistricts(data.districts || []);
          // Pre-select if value exists
          if (venueInfo.district) {
            const d = (data.districts || []).find((x: any) => x.name === venueInfo.district);
            if (d) setSelectedDistrictCode(d.code);
          }
        })
        .catch(err => console.error("Failed to load districts", err));
    } else {
      setDistricts([]);
    }
  }, [selectedProvinceCode]);

  // When district changes, fetch wards
  useEffect(() => {
    if (selectedDistrictCode) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrictCode}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards || []))
        .catch(err => console.error("Failed to load wards", err));
    } else {
      setWards([]);
    }
  }, [selectedDistrictCode]);

  const handleProvinceChange = (name: string) => {
    const p = provinces.find(x => x.name === name);
    if (p) {
      setSelectedProvinceCode(p.code);
      setSelectedDistrictCode(null);
      setWards([]);
      onVenueInfoChange({ ...venueInfo, province: name, district: '', ward: '' });
    }
  };

  const handleDistrictChange = (name: string) => {
    const d = districts.find(x => x.name === name);
    if (d) {
      setSelectedDistrictCode(d.code);
      onVenueInfoChange({ ...venueInfo, district: name, ward: '' });
    }
  };

  const handleWardChange = (name: string) => {
    onVenueInfoChange({ ...venueInfo, ward: name });
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

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 border-2 border-brand-emerald/20 text-brand-emerald flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-slate-800 tracking-tight">Thông tin cụm sân</h3>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
          Địa chỉ, loại sân và hình ảnh cụm sân của bạn
        </p>
      </div>

      <div className="space-y-4">
        {/* Venue name */}
        <InputField id="setup-venue-name" label="Tên cụm sân" icon={BuildingIcon}
          value={venueInfo.venueName}
          onChange={(val) => onVenueInfoChange({ ...venueInfo, venueName: val })}
          placeholder="Sân bóng Thành Công" disabled={isLoading} />

        {/* Address */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SelectField id="setup-province" label="Tỉnh / Thành phố" icon={LocationIcon}
            value={venueInfo.province}
            onChange={handleProvinceChange}
            options={provinces}
            placeholder="Chọn Tỉnh/Thành" disabled={isLoading || provinces.length === 0} />
            
          <SelectField id="setup-district" label="Quận / Huyện" icon={LocationIcon}
            value={venueInfo.district}
            onChange={handleDistrictChange}
            options={districts}
            placeholder="Chọn Quận/Huyện" disabled={isLoading || districts.length === 0 || !venueInfo.province} />
            
          <SelectField id="setup-ward" label="Phường / Xã" icon={LocationIcon}
            value={venueInfo.ward}
            onChange={handleWardChange}
            options={wards}
            placeholder="Chọn Phường/Xã" disabled={isLoading || wards.length === 0 || !venueInfo.district} />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="setup-description" className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
            Mô tả cụm sân
          </label>
          <textarea
            id="setup-description"
            placeholder="Mô tả về cụm sân, vị trí, đặc điểm nổi bật..."
            value={venueInfo.description}
            onChange={(e) => onVenueInfoChange({ ...venueInfo, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                       focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Sport types */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
            Loại sân
          </label>
          <div className="flex flex-wrap gap-2">
            {SPORT_TYPE_OPTIONS.map((sport) => {
              const isSelected = venueInfo.sportTypes.includes(sport.value);
              return (
                <button
                  key={sport.value} type="button"
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
          <label htmlFor="setup-court-count" className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
            Số lượng sân con
          </label>
          <div className="flex items-center gap-3">
            <button type="button"
              onClick={() => onVenueInfoChange({ ...venueInfo, subCourtCount: Math.max(1, venueInfo.subCourtCount - 1) })}
              disabled={isLoading || venueInfo.subCourtCount <= 1}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-black text-sm
                         flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >−</button>
            <input id="setup-court-count" type="number" min={1}
              value={venueInfo.subCourtCount}
              onChange={(e) => onVenueInfoChange({ ...venueInfo, subCourtCount: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-16 text-center py-2 rounded-xl border border-slate-200 bg-slate-50/60 font-black text-sm text-slate-700
                         focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10"
              disabled={isLoading} />
            <button type="button"
              onClick={() => onVenueInfoChange({ ...venueInfo, subCourtCount: venueInfo.subCourtCount + 1 })}
              disabled={isLoading}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-black text-sm
                         flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >+</button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Image upload */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
            Hình ảnh sân
          </label>
          <button type="button"
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
              JPG, PNG — tối đa 10 ảnh
            </span>
          </button>

          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

          {/* File previews */}
          {venueInfo.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {venueInfo.images.map((file, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden group aspect-square">
                  <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
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
  );
};
