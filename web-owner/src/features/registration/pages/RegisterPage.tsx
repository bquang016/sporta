// ─────────────────────────────────────────────────────────────────────────────
// Registration Feature — Main Page (Email + OTP + Success only)
// Layout mirrors LoginPage: branding panel (left) + form panel (right)
// ─────────────────────────────────────────────────────────────────────────────

import logoHorizontal from '../../../assets/logo/light/logo-horizontal_1600x400px.svg';
import logoVertical from '../../../assets/logo/light/logo-vertical_1200x1500.svg';
import { useRegistration } from '../hooks/useRegistration';
import { StepIndicator } from '../components/StepIndicator';
import { EmailStep } from '../components/EmailStep';
import { OtpStep } from '../components/OtpStep';
import { SuccessStep } from '../components/SuccessStep';

export const RegisterPage = () => {
  const reg = useRegistration();

  /* ================================================================
   *  RENDER
   * ================================================================ */
  return (
    <div className="h-[100dvh] font-sans flex flex-col lg:flex-row select-none overflow-hidden">

      {/* ═══════════════════════════════════════════════════════════
       *  LEFT — BRANDING PANEL
       *  Desktop: 45% width, full-height
       *  Mobile: compact shrink-0 header
       * ═══════════════════════════════════════════════════════════ */}
      <div
        className="shrink-0 lg:w-[45%]
                    bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900
                    text-white relative overflow-hidden
                    flex flex-col justify-between
                    px-5 py-4
                    lg:px-14 lg:py-12"
      >
        {/* ── Decorative: grid pattern ── */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="reg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#reg-grid)" />
          </svg>
        </div>

        {/* ── Decorative: glow orbs ── */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* ── Logo ── */}
        <div className="relative z-10 flex items-center gap-2.5">
          <img src={logoHorizontal} alt="Sporta Logo" className="h-10 lg:h-12 w-auto object-contain" />
          <span className="text-[8px] lg:text-[9px] text-white/40 font-bold uppercase tracking-widest block self-end pb-1">
            Owner Portal
          </span>
        </div>

        {/* ── Hero text ── */}
        <div className="relative z-10 mt-3 lg:mt-0">
          <h2 className="text-base lg:text-4xl font-black tracking-tight text-white leading-snug lg:leading-tight">
            Trở thành đối tác,<br className="hidden lg:block" />{' '}
            <span className="text-brand-yellow">phát triển</span> cùng Sporta
          </h2>
          <p className="hidden lg:block text-sm text-white/50 max-w-md font-medium leading-relaxed mt-3">
            Đăng ký cụm sân của bạn để tiếp cận hàng nghìn người chơi, quản lý đặt sân tự động và tối ưu doanh thu ngay hôm nay.
          </p>
        </div>

        {/* ── Vertical Logo Banner (Desktop only) ── */}
        <div className="relative z-10 hidden lg:flex items-center justify-center my-6 flex-1 max-h-[320px] overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4">
          <img
            src={logoVertical}
            alt="Sporta Vertical Poster"
            className="max-h-full max-w-full object-contain rounded-xl hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* ── Feature cards — DESKTOP ONLY ── */}
        <div className="relative z-10 hidden lg:grid grid-cols-3 gap-3 mt-0">
          {[
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              ),
              title: 'Nhiều người chơi',
              sub: 'Kết nối trực tiếp',
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              ),
              title: 'Tối ưu doanh thu',
              sub: 'Phân tích realtime',
            },
            {
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              ),
              title: 'An toàn & Minh bạch',
              sub: 'Hệ thống duyệt',
            },
          ].map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
              <div className="w-8 h-8 rounded-full bg-brand-yellow/15 text-brand-yellow flex items-center justify-center mx-auto mb-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{f.icon}</svg>
              </div>
              <p className="text-[9px] font-black text-white/70 uppercase tracking-wider">{f.title}</p>
              <p className="text-[8px] text-white/40 font-medium mt-0.5">{f.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Footer copyright — desktop only ── */}
        <div className="relative z-10 text-white/25 text-[9px] font-bold uppercase tracking-widest hidden lg:block">
          Sporta Owner Portal © 2026
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
       *  RIGHT — REGISTRATION FORM PANEL
       *  Desktop: flex-1 (55%)
       *  Mobile: flex-1, center content
       * ═══════════════════════════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col items-center justify-center bg-surface-container-low relative
                   px-5 py-4 lg:px-16 lg:py-8 min-h-0 overflow-hidden"
      >
        {/* ── Decorative: subtle glow blobs ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[15%] -right-[15%] w-[55%] h-[55%] bg-brand-emerald/[0.03] rounded-full blur-[80px]" />
          <div className="absolute -bottom-[10%] -left-[10%] w-[45%] h-[45%] bg-brand-yellow/[0.03] rounded-full blur-[80px]" />
        </div>

        {/* ── Form wrapper ── */}
        <div className="w-full max-w-[400px] relative z-10">

          {/* ── Step indicator (only for email/otp) ── */}
          {reg.currentStep !== 'success' && (
            <StepIndicator currentStep={reg.currentStep} />
          )}

          {/* ── Form Card ── */}
          <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-[1.5px] lg:h-[2px] bg-gradient-to-r from-brand-emerald via-brand-emerald to-brand-yellow" />

            <div className="p-5 lg:p-7">
              {/* Render active step */}
              {reg.currentStep === 'email' && (
                <EmailStep
                  email={reg.email}
                  onEmailChange={reg.setEmail}
                  onSubmit={reg.handleSendOtp}
                  isLoading={reg.isLoading}
                  errorMsg={reg.errorMsg}
                />
              )}

              {reg.currentStep === 'otp' && (
                <OtpStep
                  email={reg.email}
                  otp={reg.otp}
                  onOtpChange={reg.setOtp}
                  onVerify={reg.handleVerifyOtp}
                  onResend={reg.handleResendOtp}
                  onBack={reg.goBack}
                  countdown={reg.countdown}
                  isLoading={reg.isLoading}
                  errorMsg={reg.errorMsg}
                />
              )}

              {reg.currentStep === 'success' && (
                <SuccessStep />
              )}
            </div>
          </div>

          {/* ── Support footer ── */}
          <div className="mt-3 lg:mt-5 text-center text-[10px] text-slate-400 font-semibold">
            Cần hỗ trợ đăng ký?{' '}
            <a href="mailto:support@sporta.vn" className="text-brand-emerald font-black hover:underline">
              Liên hệ hỗ trợ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
