// ─────────────────────────────────────────────────────────────────────────────
// Setup Wizard — Step 1: Personal Info + CCCD Images
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef } from 'react';
import type { PersonalInfo } from '../types';

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
        {label}
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
    <div className="animate-fadeIn max-w-3xl mx-auto h-full flex flex-col justify-center min-h-[400px]">

      {/* Form fields */}
      <div className="space-y-4">
        {/* Full name */}
        <div className="space-y-1.5">
          <label htmlFor="setup-fullname" className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
            Họ và tên
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

        {/* ID Number */}
        <div className="space-y-1.5">
          <label htmlFor="setup-id-number" className="text-[9px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
            Số CCCD / CMND
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
              placeholder="012345678901"
              value={personalInfo.idNumber}
              onChange={(e) => onPersonalInfoChange({ ...personalInfo, idNumber: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-700 placeholder-slate-400
                         focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white transition-all"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 my-4" />

        {/* CCCD Images */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-md bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </span>
            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
              Ảnh CCCD / CMND
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
