// ─────────────────────────────────────────────────────────────────────────────
// Setup Wizard — Step 1: Personal Info + CCCD Images
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState, useEffect } from 'react';
import type { PersonalInfo } from '../types';
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
} from '../../../services/provinceService';
import type { Province, District, Ward } from '../../../services/provinceService';

interface PersonalInfoStepProps {
  personalInfo: PersonalInfo;
  onPersonalInfoChange: (val: PersonalInfo) => void;
  isLoading: boolean;
}

export const PersonalInfoStep = ({
  personalInfo,
  onPersonalInfoChange,
  isLoading,
}: PersonalInfoStepProps) => {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // States for Vietnam Province Open API
  const [provinces, setProvinces] = useState<Province[]>([]);

  // Permanent Address dropdown states
  const [selectedPermProvince, setSelectedPermProvince] = useState<number | ''>('');
  const [permDistricts, setPermDistricts] = useState<District[]>([]);
  const [selectedPermDistrict, setSelectedPermDistrict] = useState<number | ''>('');
  const [permWards, setPermWards] = useState<Ward[]>([]);
  const [selectedPermWard, setSelectedPermWard] = useState<number | ''>('');
  const [permDetailAddress, setPermDetailAddress] = useState<string>('');

  // Load provinces on mount
  useEffect(() => {
    fetchProvinces().then((data) => setProvinces(data));
  }, []);

  // Load districts when permanent province changes
  useEffect(() => {
    if (selectedPermProvince) {
      fetchDistricts(Number(selectedPermProvince)).then((data) => setPermDistricts(data));
      setSelectedPermDistrict('');
      setPermWards([]);
      setSelectedPermWard('');
    } else {
      setPermDistricts([]);
      setPermWards([]);
    }
  }, [selectedPermProvince]);

  // Load wards when permanent district changes
  useEffect(() => {
    if (selectedPermDistrict) {
      fetchWards(Number(selectedPermDistrict)).then((data) => setPermWards(data));
      setSelectedPermWard('');
    } else {
      setPermWards([]);
    }
  }, [selectedPermDistrict]);

  // Sync permanent address string to personalInfo
  const updatePermanentAddress = (
    pCode: number | '',
    dCode: number | '',
    wCode: number | '',
    detail: string
  ) => {
    const provName = provinces.find((p) => p.code === Number(pCode))?.name || '';
    const distName = permDistricts.find((d) => d.code === Number(dCode))?.name || '';
    const wardName = permWards.find((w) => w.code === Number(wCode))?.name || '';

    const parts = [];
    if (detail.trim()) parts.push(detail.trim());
    if (wardName) parts.push(wardName);
    if (distName) parts.push(distName);
    if (provName) parts.push(provName);

    const fullAddr = parts.join(', ');
    onPersonalInfoChange({ ...personalInfo, permanentAddress: fullAddr });
  };

  const handleFrontImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onPersonalInfoChange({ ...personalInfo, idFrontImage: e.target.files[0] });
    }
  };

  const handleBackImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onPersonalInfoChange({ ...personalInfo, idBackImage: e.target.files[0] });
    }
  };

  const ImageUploadCard = ({
    label,
    file,
    onRemove,
    onClick,
  }: {
    label: string;
    file: File | null;
    onRemove: () => void;
    onClick: () => void;
  }) => (
    <div className="flex-1">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5 block">
        {label} <span className="text-red-500">*</span>
      </label>
      {file ? (
        <div className="relative rounded-xl border border-brand-emerald/20 bg-brand-emerald/5 overflow-hidden group aspect-[85/54] w-full">
          <img
            src={URL.createObjectURL(file)}
            alt={label}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={onRemove}
              className="bg-white/90 text-red-500 rounded-full p-2 hover:bg-white transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
            <p className="text-[8px] font-bold text-white truncate">{file.name}</p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onClick}
          disabled={isLoading}
          className="w-full aspect-[85/54] border-2 border-dashed border-slate-200 hover:border-brand-emerald/40 rounded-xl
                     flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer group
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center justify-center transition-colors">
            <svg className="w-5 h-5 text-slate-400 group-hover:text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-[9px] font-black text-slate-400 group-hover:text-brand-emerald uppercase tracking-wider transition-colors">
            Tải ảnh lên
          </span>
        </button>
      )}
    </div>
  );

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto h-full flex flex-col justify-center py-4">
      {/* Title */}
      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Thông tin cá nhân (Đối chiếu CCCD)</h3>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
          Vui lòng nhập chính xác thông tin cá nhân trùng khớp với Thẻ căn cước công dân
        </p>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        {/* Full name & Phone Number (Row 1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full name */}
          <div className="space-y-1.5">
            <label htmlFor="setup-fullname" className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="setup-fullname"
                type="text"
                placeholder="Nguyễn Văn A"
                value={personalInfo.fullName}
                onChange={(e) => onPersonalInfoChange({ ...personalInfo, fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                           focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label htmlFor="setup-phone-number" className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                id="setup-phone-number"
                type="tel"
                maxLength={10}
                placeholder="0912345678"
                value={personalInfo.phoneNumber}
                onChange={(e) => onPersonalInfoChange({ ...personalInfo, phoneNumber: e.target.value.replace(/\D/g, '') })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                           focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
                disabled={isLoading}
              />
            </div>
            {personalInfo.phoneNumber && !/^0\d{9}$/.test(personalInfo.phoneNumber) && (
              <p className="text-[9px] font-semibold text-amber-600 pl-0.5">Số điện thoại phải có đúng 10 chữ số bắt đầu bằng 0</p>
            )}
          </div>
        </div>

        {/* Gender & ID Number (Row 2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gender */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
              Giới tính <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Nam', 'Nữ', 'Khác'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onPersonalInfoChange({ ...personalInfo, gender: g })}
                  disabled={isLoading}
                  className={`py-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                    personalInfo.gender === g
                      ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald shadow-sm'
                      : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* ID Number */}
          <div className="space-y-1.5">
            <label htmlFor="setup-id-number" className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
              Số CCCD / CMND <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <input
                id="setup-id-number"
                type="text"
                maxLength={12}
                placeholder="012345678901"
                value={personalInfo.idNumber}
                onChange={(e) => onPersonalInfoChange({ ...personalInfo, idNumber: e.target.value.replace(/\D/g, '') })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                           focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
                disabled={isLoading}
              />
            </div>
            {personalInfo.idNumber && !/^(\d{12}|\d{9})$/.test(personalInfo.idNumber) && (
              <p className="text-[9px] font-semibold text-amber-600 pl-0.5">Số CCCD phải gồm đúng 12 chữ số (hoặc CMND 9 chữ số)</p>
            )}
          </div>
        </div>

        {/* Nationality & Hometown (Row 3 - Integrated with API provinces.open-api.vn) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nationality */}
          <div className="space-y-1.5">
            <label htmlFor="setup-nationality" className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
              Quốc tịch <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V11.4" />
                </svg>
              </div>
              <input
                id="setup-nationality"
                type="text"
                placeholder="Việt Nam"
                value={personalInfo.nationality || 'Việt Nam'}
                onChange={(e) => onPersonalInfoChange({ ...personalInfo, nationality: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                           focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Hometown (Quê quán - API Tỉnh/Thành) */}
          <div className="space-y-1.5">
            <label htmlFor="setup-hometown" className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
              Quê quán <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <select
                id="setup-hometown"
                value={personalInfo.hometown}
                onChange={(e) => onPersonalInfoChange({ ...personalInfo, hometown: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700
                           focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all appearance-none cursor-pointer"
                disabled={isLoading}
              >
                <option value="">-- Chọn Tỉnh / Thành phố quê quán --</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Permanent Address Section (Nơi thường trú - Cascading API provinces.open-api.vn) */}
        <div className="space-y-2 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-md bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </span>
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
              Nơi thường trú <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* Tỉnh / Thành phố */}
            <div>
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider pl-0.5 mb-1 block">Tỉnh / Thành phố</label>
              <select
                value={selectedPermProvince}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : '';
                  setSelectedPermProvince(val);
                  updatePermanentAddress(val, '', '', permDetailAddress);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-700 focus:outline-none focus:border-brand-emerald"
                disabled={isLoading}
              >
                <option value="">-- Chọn Tỉnh / Thành --</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quận / Huyện */}
            <div>
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider pl-0.5 mb-1 block">Quận / Huyện</label>
              <select
                value={selectedPermDistrict}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : '';
                  setSelectedPermDistrict(val);
                  updatePermanentAddress(selectedPermProvince, val, '', permDetailAddress);
                }}
                disabled={!selectedPermProvince || isLoading}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-700 focus:outline-none focus:border-brand-emerald disabled:opacity-50"
              >
                <option value="">-- Chọn Quận / Huyện --</option>
                {permDistricts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Phường / Xã */}
            <div>
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider pl-0.5 mb-1 block">Phường / Xã</label>
              <select
                value={selectedPermWard}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : '';
                  setSelectedPermWard(val);
                  updatePermanentAddress(selectedPermProvince, selectedPermDistrict, val, permDetailAddress);
                }}
                disabled={!selectedPermDistrict || isLoading}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-700 focus:outline-none focus:border-brand-emerald disabled:opacity-50"
              >
                <option value="">-- Chọn Phường / Xã --</option>
                {permWards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chi tiết số nhà, tên đường */}
          <div>
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider pl-0.5 mb-1 block">Số nhà, tên đường / xóm</label>
            <input
              type="text"
              placeholder="VD: Số 123 đường Nguyễn Trãi"
              value={permDetailAddress}
              onChange={(e) => {
                const val = e.target.value;
                setPermDetailAddress(val);
                updatePermanentAddress(selectedPermProvince, selectedPermDistrict, selectedPermWard, val);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-700 focus:outline-none focus:border-brand-emerald placeholder-slate-400"
              disabled={isLoading}
            />
          </div>

          {/* Result preview */}
          {personalInfo.permanentAddress && (
            <div className="mt-1 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold">
              <span className="text-slate-400 font-bold">Địa chỉ hoàn chỉnh:</span>
              <span className="text-brand-emerald font-bold">{personalInfo.permanentAddress}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 my-3" />

        {/* CCCD Images */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-md bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </span>
            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
              Ảnh CCCD / CMND <span className="text-red-500">*</span>
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
            <ImageUploadCard
              label="Mặt trước"
              file={personalInfo.idFrontImage}
              onRemove={() => onPersonalInfoChange({ ...personalInfo, idFrontImage: null })}
              onClick={() => frontInputRef.current?.click()}
            />
            <ImageUploadCard
              label="Mặt sau"
              file={personalInfo.idBackImage}
              onRemove={() => onPersonalInfoChange({ ...personalInfo, idBackImage: null })}
              onClick={() => backInputRef.current?.click()}
            />
          </div>

          <div className="text-center mt-3">
             <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider">Định dạng JPG, PNG — Kích thước chuẩn thẻ cứng</span>
          </div>

          <input ref={frontInputRef} type="file" accept="image/*" onChange={handleFrontImage} className="hidden" />
          <input ref={backInputRef} type="file" accept="image/*" onChange={handleBackImage} className="hidden" />
        </div>
      </div>
    </div>
  );
};
