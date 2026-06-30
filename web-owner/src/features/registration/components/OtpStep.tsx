// ─────────────────────────────────────────────────────────────────────────────
// Registration — Step 1b: OTP Verification
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useEffect } from 'react';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

interface OtpStepProps {
  email: string;
  otp: string[];
  onOtpChange: (val: string[]) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  countdown: number;
  isLoading: boolean;
  errorMsg: string;
}

export const OtpStep = ({
  email,
  otp,
  onOtpChange,
  onVerify,
  onResend,
  onBack,
  countdown,
  isLoading,
  errorMsg,
}: OtpStepProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    if (otp.every((d) => d !== '') && otp.length === 6) {
      onVerify();
    }
  }, [otp]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    onOtpChange(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      onOtpChange(newOtp);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = Array(6).fill('');
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      onOtpChange(newOtp);
      // Focus the next empty slot or last slot
      const nextEmpty = pastedData.length < 6 ? pastedData.length : 5;
      inputRefs.current[nextEmpty]?.focus();
    }
  };

  // Mask email for display: e.g. "tes***@gmail.com"
  const maskedEmail = (() => {
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;
    const visible = local.slice(0, 3);
    return `${visible}***@${domain}`;
  })();

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-fadeIn">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-brand-emerald uppercase tracking-wider mb-4 transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Quay lại
      </button>

      {/* Header */}
      <div className="text-center mb-5 lg:mb-6">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-brand-emerald/10 border-2 border-brand-emerald/20 text-brand-emerald flex items-center justify-center mx-auto mb-2 lg:mb-3">
          <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-base lg:text-lg font-black text-slate-800 tracking-tight">
          Nhập mã xác thực
        </h3>
        <p className="text-[10px] lg:text-[11px] text-slate-400 font-semibold mt-1 leading-relaxed">
          Mã OTP 6 số đã được gửi đến<br />
          <span className="text-brand-emerald font-black">{maskedEmail}</span>
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

      {/* OTP Input Grid */}
      <div className="flex justify-center gap-2 lg:gap-3 mb-5">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            id={`otp-input-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            disabled={isLoading}
            className={`
              w-10 h-12 lg:w-12 lg:h-14 text-center text-lg lg:text-xl font-black
              rounded-xl border-2 transition-all duration-200
              focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white
              disabled:bg-slate-100 disabled:cursor-not-allowed
              ${digit
                ? 'border-brand-emerald/40 bg-brand-emerald/5 text-slate-800'
                : 'border-slate-200 bg-slate-50/60 text-slate-700'
              }
            `}
          />
        ))}
      </div>

      {/* Countdown + Resend */}
      <div className="text-center mb-5">
        {countdown > 0 ? (
          <p className="text-[10px] text-slate-400 font-bold">
            Gửi lại mã sau{' '}
            <span className="text-brand-emerald font-black">{formatCountdown(countdown)}</span>
          </p>
        ) : (
          <button
            onClick={onResend}
            disabled={isLoading}
            className="text-[10px] font-black text-brand-emerald hover:underline uppercase tracking-wider cursor-pointer disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            Gửi lại mã OTP
          </button>
        )}
      </div>

      {/* Verify button */}
      <button
        id="register-verify-otp"
        onClick={onVerify}
        disabled={isLoading || otp.some((d) => d === '')}
        className="w-full bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-xs py-3 lg:py-3.5 rounded-xl shadow-md
                   transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer
                   disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" color="primary" />
            <span>Đang xác thực...</span>
          </>
        ) : (
          <span>Xác nhận mã OTP</span>
        )}
      </button>

      {/* Hint */}
      <p className="mt-3 text-center text-[9px] text-slate-400 font-semibold leading-relaxed">
        Mã OTP có hiệu lực trong 5 phút. Kiểm tra hộp thư spam nếu không nhận được.
      </p>
    </div>
  );
};
