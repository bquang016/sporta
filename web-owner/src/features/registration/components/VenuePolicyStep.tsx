// ─────────────────────────────────────────────────────────────────────────────
// Registration — Setup Step 4: Venue Policy
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import type { VenueInfo } from '../types';

interface VenuePolicyStepProps {
  venueInfo: VenueInfo;
  onVenueInfoChange: (info: VenueInfo) => void;
  isLoading: boolean;
}

export const VenuePolicyStep = ({
  venueInfo,
  onVenueInfoChange,
  isLoading,
}: VenuePolicyStepProps) => {

  const addRule = () => {
    onVenueInfoChange({
      ...venueInfo,
      generalRules: [...venueInfo.generalRules, ''],
    });
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...venueInfo.generalRules];
    newRules[index] = value;
    onVenueInfoChange({
      ...venueInfo,
      generalRules: newRules,
    });
  };

  const removeRule = (index: number) => {
    const newRules = [...venueInfo.generalRules];
    newRules.splice(index, 1);
    onVenueInfoChange({
      ...venueInfo,
      generalRules: newRules,
    });
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h3 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">
          Chính sách của sân
        </h3>
        <p className="text-xs lg:text-sm text-slate-500 font-medium mt-1.5 leading-relaxed max-w-2xl">
          Cung cấp các quy định chung và chính sách hủy lịch để người chơi nắm rõ trước khi đặt sân.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:gap-8">
        {/* Cancellation Policy */}
        <div className="bg-slate-50/50 rounded-2xl p-5 lg:p-6 border border-slate-200/60">
          <label className="block text-sm font-black text-slate-800 mb-2">
            Chính sách hủy lịch <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-slate-500 mb-4 font-medium">
            Ví dụ: Hủy trước 24h hoàn 100%, trước 12h hoàn 50%, sau 12h không hoàn tiền.
          </p>
          <textarea
            value={venueInfo.cancellationPolicy || ''}
            onChange={(e) => onVenueInfoChange({ ...venueInfo, cancellationPolicy: e.target.value })}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400
                       focus:outline-none focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all min-h-[100px] resize-y"
            placeholder="Nhập chính sách hủy lịch của bạn..."
          />
        </div>

        {/* General Rules */}
        <div className="bg-slate-50/50 rounded-2xl p-5 lg:p-6 border border-slate-200/60">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-black text-slate-800">
              Quy định chung <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addRule}
              disabled={isLoading}
              className="text-[11px] font-black text-brand-emerald hover:bg-brand-emerald/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
              Thêm quy định
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mb-4 font-medium">
            Ví dụ: Không hút thuốc, bắt buộc đi giày thể thao...
          </p>

          <div className="flex flex-col gap-3">
            {venueInfo.generalRules.map((rule, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200/60 text-slate-500 flex items-center justify-center shrink-0 text-[10px] font-bold">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => updateRule(index, e.target.value)}
                  disabled={isLoading}
                  placeholder={`Nhập quy định thứ ${index + 1}...`}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400
                             focus:outline-none focus:border-brand-emerald focus:ring-4 focus:ring-brand-emerald/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  disabled={isLoading}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            
            {venueInfo.generalRules.length === 0 && (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-xs font-semibold text-slate-400 mb-2">Chưa có quy định nào</p>
                <button
                  type="button"
                  onClick={addRule}
                  disabled={isLoading}
                  className="text-xs font-black text-brand-emerald hover:underline"
                >
                  Bấm vào đây để thêm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
