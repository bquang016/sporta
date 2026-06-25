// ─────────────────────────────────────────────────────────────────────────────
// Setup Wizard — Step 3: Amenities
// ─────────────────────────────────────────────────────────────────────────────

import { AMENITY_OPTIONS } from '../types';

interface AmenitiesStepProps {
  amenities: string[];
  onAmenitiesChange: (val: string[]) => void;
  isLoading: boolean;
}

export const AmenitiesStep = ({
  amenities,
  onAmenitiesChange,
  isLoading,
}: AmenitiesStepProps) => {
  const handleToggle = (key: string) => {
    const updated = amenities.includes(key)
      ? amenities.filter((a) => a !== key)
      : [...amenities, key];
    onAmenitiesChange(updated);
  };

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 border-2 border-brand-emerald/20 text-brand-emerald flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-slate-800 tracking-tight">Tiện ích sân</h3>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
          Chọn các tiện ích có sẵn tại cụm sân (không bắt buộc)
        </p>
      </div>

      {/* Amenity grid */}
      <div className="grid grid-cols-2 gap-3">
        {AMENITY_OPTIONS.map((amenity) => {
          const isSelected = amenities.includes(amenity.key);
          return (
            <button
              key={amenity.key}
              type="button"
              onClick={() => handleToggle(amenity.key)}
              disabled={isLoading}
              className={`
                relative flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left
                ${isSelected
                  ? 'border-brand-emerald bg-brand-emerald/5 shadow-sm shadow-brand-emerald/10'
                  : 'border-slate-200 bg-white hover:border-brand-emerald/30 hover:bg-slate-50'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {/* Check indicator */}
              <div
                className={`
                  w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all
                  ${isSelected
                    ? 'bg-brand-emerald text-white'
                    : 'border-2 border-slate-300'
                  }
                `}
              >
                {isSelected && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Icon + Label */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg flex-shrink-0">{amenity.icon}</span>
                <span
                  className={`text-xs font-bold truncate ${isSelected ? 'text-brand-emerald' : 'text-slate-600'}`}
                >
                  {amenity.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info note */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
        <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
          Bạn có thể cập nhật tiện ích bất cứ lúc nào sau khi tài khoản được duyệt. Việc liệt kê đầy đủ giúp tăng tỷ lệ đặt sân.
        </p>
      </div>
    </div>
  );
};
