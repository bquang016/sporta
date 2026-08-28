// ─────────────────────────────────────────────────────────────────────────────
// Setup Wizard — Step 5: Review & Submit
// ─────────────────────────────────────────────────────────────────────────────

import type { PersonalInfo, VenueInfo, SubCourt, SetupStep } from '../types';
import { SPORT_TYPE_OPTIONS } from '../types';

interface ReviewStepProps {
  personalInfo: PersonalInfo;
  venueInfo: VenueInfo;
  courts: SubCourt[];
  onGoToStep: (step: SetupStep) => void;
  isLoading: boolean;
}

export const ReviewStep = ({
  personalInfo,
  venueInfo,
  courts,
  onGoToStep,
  isLoading,
}: ReviewStepProps) => {
  const getSportLabel = (value: string) =>
    SPORT_TYPE_OPTIONS.find((s) => s.value === value)?.label || value;

  const formatPrice = (price: number): string => {
    if (!price) return '0';
    return price.toLocaleString('vi-VN');
  };

  const SectionHeader = ({
    title,
    step,
    icon,
  }: {
    title: string;
    step: SetupStep;
    icon: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-brand-emerald/10 text-brand-emerald flex items-center justify-center">
          {icon}
        </span>
        <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{title}</h4>
      </div>
      <button
        type="button"
        onClick={() => onGoToStep(step)}
        disabled={isLoading}
        className="text-[9px] font-black text-brand-emerald hover:underline uppercase tracking-wider cursor-pointer disabled:text-slate-400"
      >
        Chỉnh sửa
      </button>
    </div>
  );

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-start gap-2 py-1">
      <span className="text-[10px] font-semibold text-slate-400 min-w-[80px] shrink-0">{label}</span>
      <span className="text-[10px] font-bold text-slate-700">{value || '—'}</span>
    </div>
  );

  return (
    <div className="animate-fadeIn space-y-5">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 border-2 border-brand-emerald/20 text-brand-emerald flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-slate-800 tracking-tight">Xem lại thông tin</h3>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
          Kiểm tra kỹ trước khi gửi hồ sơ đăng ký
        </p>
      </div>

      {/* ═══ Section 1: Personal ═══ */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <SectionHeader
          title="Thông tin cá nhân"
          step="personal"
          icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
        />
        <InfoRow label="Họ tên" value={personalInfo.fullName} />
        <InfoRow label="Số CCCD" value={personalInfo.idNumber} />
        <div className="flex items-center gap-2 py-1">
          <span className="text-[10px] font-semibold text-slate-400 min-w-[80px] shrink-0">Ảnh CCCD</span>
          <div className="flex gap-2">
            {personalInfo.idFrontImage && (
              <div className="flex items-center gap-1 bg-brand-emerald/5 border border-brand-emerald/15 rounded-md px-2 py-0.5">
                <svg className="w-3 h-3 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[9px] font-bold text-brand-emerald">Mặt trước</span>
              </div>
            )}
            {personalInfo.idBackImage && (
              <div className="flex items-center gap-1 bg-brand-emerald/5 border border-brand-emerald/15 rounded-md px-2 py-0.5">
                <svg className="w-3 h-3 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[9px] font-bold text-brand-emerald">Mặt sau</span>
              </div>
            )}
            {!personalInfo.idFrontImage && !personalInfo.idBackImage && (
              <span className="text-[10px] font-bold text-slate-400">Chưa tải ảnh</span>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Section 2: Venue Basic ═══ */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <SectionHeader
          title="Thông tin cơ bản"
          step="venue-basic"
          icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <InfoRow label="Tên sân" value={venueInfo.name} />
        <InfoRow label="Địa chỉ" value={venueInfo.location} />
        {venueInfo.description && <InfoRow label="Mô tả" value={venueInfo.description} />}
        <InfoRow label="Hình ảnh" value={`${venueInfo.detailImages.length + (venueInfo.coverImage ? 1 : 0)} ảnh`} />
      </div>

      {/* ═══ Section 3: Operating & Pricing ═══ */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <SectionHeader
          title="Vận hành & Phụ thu"
          step="venue-courts"
          icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <InfoRow label="Giờ hoạt động" value={`${venueInfo.openingTime} - ${venueInfo.closingTime}`} />
        <InfoRow label="Ca tiêu chuẩn" value={`${venueInfo.shiftDurationMinutes} phút`} />
        {venueInfo.hasSurcharge && (
          <InfoRow label="Phụ thu" value={`${formatPrice(venueInfo.surchargeAmount || 0)}₫ (${venueInfo.surchargeDescription})`} />
        )}
      </div>

      {/* ═══ Section 4: Courts ═══ */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <SectionHeader
          title="Sân trực thuộc"
          step="venue-courts"
          icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <InfoRow label="Môn thể thao" value={getSportLabel(venueInfo.sportId)} />
        <div className="space-y-3 mt-2">
          {courts.map((court, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-700">{court.name}</span>
                <span className="text-[9px] font-bold text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded-full">
                  {formatPrice(court.price)}₫ / ca cơ bản
                </span>
              </div>
              {court.priceRules && court.priceRules.length > 0 && (
                <div className="grid grid-cols-1 gap-1.5 mt-2 pt-2 border-t border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 mb-1">Quy tắc đặc biệt:</span>
                  {court.priceRules.map((rule, j) => (
                    <div key={j} className="flex items-center justify-between text-[9px]">
                      {rule.ruleType === 'SHIFT' ? (
                        <>
                          <span className="font-semibold text-slate-500">Khung giờ {rule.startTime}-{rule.endTime}</span>
                          <span className="font-black text-slate-700">{formatPrice(rule.customPrice || 0)}₫</span>
                        </>
                      ) : (
                        <>
                          <span className="font-semibold text-slate-500">Thứ {rule.dayOfWeek}</span>
                          <span className="font-black text-slate-700">
                            {rule.percentageModifier && rule.percentageModifier !== 1
                              ? `Tăng ${Math.round((rule.percentageModifier - 1) * 100)}%`
                              : `Cộng thêm ${formatPrice(rule.fixedModifier || 0)}₫`}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Section 5: Venue Policy ═══ */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <SectionHeader
          title="Chính sách của sân"
          step="venue-policy"
          icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <InfoRow label="Thanh toán" value="Thanh toán 100%" />
        <InfoRow label="Hủy miễn phí" value={venueInfo.freeCancellationHours === null ? 'Trước 12 tiếng' : `Trước ${venueInfo.freeCancellationHours} tiếng`} />
        <InfoRow label="Hoàn tiền" value={venueInfo.lateCancellationRefundRate === null ? 'Hoàn 70%' : `Hoàn ${venueInfo.lateCancellationRefundRate}%`} />
        <InfoRow label="Trời mưa" value={venueInfo.rainRescheduleAllowed ?? true ? 'Hỗ trợ đổi lịch' : 'Không hỗ trợ'} />
      </div>

      {/* Warning note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
        <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-[10px] text-amber-700 font-semibold leading-relaxed">
          Sau khi gửi, hồ sơ sẽ được Ban quản trị xem xét trong vòng <strong>24–48 giờ</strong>. Vui lòng đảm bảo thông tin chính xác.
        </p>
      </div>
    </div>
  );
};
