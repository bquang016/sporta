// ─────────────────────────────────────────────────────────────────────────────
// Registration Feature — Setup Wizard Page (Full-width, no branding panel)
// ─────────────────────────────────────────────────────────────────────────────

import logoHorizontal from '../../../assets/logo/light/logo-horizontal_1600x400px.svg';
import { useSetupWizard } from '../hooks/useSetupWizard';
import { SetupStepIndicator } from '../components/SetupStepIndicator';
import { PersonalInfoStep } from '../components/PersonalInfoStep';
import { VenueInfoStep } from '../components/VenueInfoStep';
import { CourtsStep } from '../components/CourtsStep';
import { ReviewStep } from '../components/ReviewStep';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { SETUP_STEPS } from '../types';

export const SetupPage = () => {
  const wizard = useSetupWizard();

  const isFirstStep = wizard.stepIndex === 0;
  const isLastStep = wizard.stepIndex === SETUP_STEPS.length - 1;

  return (
    <div className="min-h-[100dvh] font-sans flex flex-col select-none bg-surface-container-low">

      {/* ═══════════════════════════════════════════════════════════
       *  TOP BAR — Logo + Step Indicator
       * ═══════════════════════════════════════════════════════════ */}
      <header className="shrink-0 bg-white border-b border-slate-200/80 px-4 lg:px-8 py-3 lg:py-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <img src={logoHorizontal} alt="Sporta Logo" className="h-8 lg:h-9 w-auto object-contain" />
            <span className="text-[7px] lg:text-[8px] text-slate-400 font-bold uppercase tracking-widest self-end pb-0.5">
              Đăng ký
            </span>
          </div>

          {/* Step indicator */}
          <div className="flex-1">
            <SetupStepIndicator
              currentStep={wizard.currentStep}
              onStepClick={wizard.goToStep}
            />
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
       *  MAIN CONTENT — Centered form
       * ═══════════════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto matrix-scroll">
        {/* Decorative blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-[15%] -right-[15%] w-[55%] h-[55%] bg-brand-emerald/[0.02] rounded-full blur-[100px]" />
          <div className="absolute -bottom-[10%] -left-[10%] w-[45%] h-[45%] bg-brand-yellow/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
          {/* Error banner */}
          {wizard.errorMsg && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-600 flex items-center gap-2 animate-fadeIn">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{wizard.errorMsg}</span>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-[2px] bg-gradient-to-r from-brand-emerald via-brand-emerald to-brand-yellow" />

            <div className="p-5 lg:p-8">
              {/* Render active step */}
              {wizard.currentStep === 'personal' && (
                <PersonalInfoStep
                  personalInfo={wizard.personalInfo}
                  onPersonalInfoChange={wizard.setPersonalInfo}
                  isLoading={wizard.isLoading}
                />
              )}

              {wizard.currentStep === 'venue' && (
                <VenueInfoStep
                  venueInfo={wizard.venueInfo}
                  onVenueInfoChange={wizard.setVenueInfo}
                  isLoading={wizard.isLoading}
                />
              )}

              {wizard.currentStep === 'courts' && (
                <CourtsStep
                  courts={wizard.courts}
                  onCourtsChange={wizard.setCourts}
                  isLoading={wizard.isLoading}
                />
              )}

              {wizard.currentStep === 'review' && (
                <ReviewStep
                  personalInfo={wizard.personalInfo}
                  venueInfo={wizard.venueInfo}
                  courts={wizard.courts}
                  onGoToStep={wizard.goToStep}
                  isLoading={wizard.isLoading}
                />
              )}
            </div>
          </div>

          {/* ═══ Navigation buttons ═══ */}
          <div className="mt-5 flex items-center gap-3">
            {/* Back button */}
            {!isFirstStep && (
              <button
                type="button"
                onClick={wizard.prevStep}
                disabled={wizard.isLoading}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-black text-xs
                           hover:bg-slate-50 transition-all cursor-pointer
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Quay lại</span>
              </button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Next / Submit button */}
            {isLastStep ? (
              <button
                type="button"
                onClick={wizard.handleSubmit}
                disabled={wizard.isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-yellow hover:bg-yellow-400 text-primary font-black text-xs shadow-md
                           transition-all active:scale-[0.98] cursor-pointer
                           disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {wizard.isLoading ? (
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
            ) : (
              <button
                type="button"
                onClick={wizard.nextStep}
                disabled={wizard.isLoading}
                className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white font-black text-xs shadow-md
                           transition-all active:scale-[0.98] cursor-pointer
                           disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                <span>Tiếp theo</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Support footer */}
          <div className="mt-4 text-center text-[10px] text-slate-400 font-semibold">
            Cần hỗ trợ đăng ký?{' '}
            <a href="mailto:support@sporta.vn" className="text-brand-emerald font-black hover:underline">
              Liên hệ hỗ trợ
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SetupPage;
