// ─────────────────────────────────────────────────────────────────────────────
// Registration Feature — Setup Wizard Page (Full-width, no branding panel)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import logoHorizontal from '../../../assets/logo/light/logo-horizontal_1600x400px.svg';
import { useSetupWizard } from '../hooks/useSetupWizard';
import { SetupMainStepIndicator } from '../components/SetupMainStepIndicator';
import { SetupSidebar } from '../components/SetupSidebar';
import { PersonalInfoStep } from '../components/PersonalInfoStep';
import { VenueBasicStep } from '../components/VenueBasicStep';
import { VenueSportModal } from '../components/VenueSportModal';
import { VenueCourtsStep } from '../components/VenueCourtsStep';
import { VenueImagesStep } from '../components/VenueImagesStep';
import { VenuePolicyStep } from '../components/VenuePolicyStep';
import { ReviewStep } from '../components/ReviewStep';
import { ContractModal } from '../components/ContractModal';
import { OtpSignatureModal } from '../components/OtpSignatureModal';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { SETUP_STEPS } from '../types';

export const SetupPage = () => {
  const wizard = useSetupWizard();

  const isFirstStep = wizard.stepIndex === 0;
  const isLastStep = wizard.stepIndex === SETUP_STEPS.length - 1;

  const [isSportModalOpen, setIsSportModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const handleNextAction = () => {
    if (wizard.currentStep === 'venue-basic') {
      setIsSportModalOpen(true);
    } else {
      wizard.nextStep();
    }
  };

  return (
    <div className="h-[100dvh] font-sans flex flex-col select-none bg-surface-container-low overflow-hidden">

      {/* ═══════════════════════════════════════════════════════════
       *  TOP BAR — Logo + Step Indicator
       * ═══════════════════════════════════════════════════════════ */}
      <header className="shrink-0 bg-white border-b border-slate-200/80 px-4 lg:px-8 py-2 lg:py-2.5 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <img src={logoHorizontal} alt="Sporta Logo" className="h-8 lg:h-9 w-auto object-contain" />
            <span className="text-[7px] lg:text-[8px] text-slate-400 font-bold uppercase tracking-widest self-end pb-0.5">
              Đăng ký
            </span>
          </div>

          {/* Step indicator */}
          <div className="flex-1">
            <SetupMainStepIndicator
              currentStep={wizard.currentStep}
            />
          </div>

        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
       *  PROGRESS BAR
       * ═══════════════════════════════════════════════════════════ */}
      <div className="w-full h-1 bg-slate-100 shrink-0 relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-emerald to-brand-yellow transition-all duration-1000 ease-out rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"
          style={{ width: `${((wizard.stepIndex + 1) / SETUP_STEPS.length) * 100}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
       *  MAIN CONTENT — Centered form
       * ═══════════════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-hidden relative flex flex-col p-4 lg:p-8">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-[15%] -right-[15%] w-[55%] h-[55%] bg-brand-emerald/[0.02] rounded-full blur-[100px]" />
          <div className="absolute -bottom-[10%] -left-[10%] w-[45%] h-[45%] bg-brand-yellow/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="mx-auto w-full max-w-5xl flex-1 flex flex-col min-h-0 transition-all duration-300">
          {/* Error banner */}
          {wizard.errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-600 flex items-center gap-2 animate-fadeIn shrink-0">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{wizard.errorMsg}</span>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg overflow-hidden flex-1 flex flex-col md:flex-row min-h-0">
            {/* Gradient accent bar (top edge of card) */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-emerald via-brand-emerald to-brand-yellow z-10" />

            {/* Left Sidebar (Inside Card) */}
            <SetupSidebar 
              currentStep={wizard.currentStep} 
              onStepClick={wizard.goToStep} 
              onPrev={wizard.prevStep}
              onNext={handleNextAction}
              isLoading={wizard.isLoading}
              isFirstStep={isFirstStep}
            />

            {/* Right Form Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Scrollable form content */}
              <div className="flex-1 overflow-y-auto p-5 lg:p-8 matrix-scroll">
                {wizard.currentStep === 'personal' && (
                  <PersonalInfoStep
                    personalInfo={wizard.personalInfo}
                    onPersonalInfoChange={wizard.setPersonalInfo}
                    isLoading={wizard.isLoading}
                  />
                )}

                {wizard.currentStep === 'venue-basic' && (
                  <VenueBasicStep
                    venueInfo={wizard.venueInfo}
                    onVenueInfoChange={wizard.setVenueInfo}
                    isLoading={wizard.isLoading}
                  />
                )}

                {wizard.currentStep === 'venue-courts' && (
                  <VenueCourtsStep
                    venueInfo={wizard.venueInfo}
                    onVenueInfoChange={wizard.setVenueInfo}
                    courts={wizard.courts}
                    onCourtsChange={wizard.setCourts}
                    isLoading={wizard.isLoading}
                  />
                )}

                {wizard.currentStep === 'venue-images' && (
                  <VenueImagesStep
                    venueInfo={wizard.venueInfo}
                    onVenueInfoChange={wizard.setVenueInfo}
                    isLoading={wizard.isLoading}
                  />
                )}



                {wizard.currentStep === 'venue-policy' && (
                  <VenuePolicyStep
                    venueInfo={wizard.venueInfo}
                    onVenueInfoChange={wizard.setVenueInfo}
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

              {/* Sticky Footer Buttons inside the card */}
              <div className={`border-t border-slate-100 p-5 lg:px-8 bg-white shrink-0 items-center justify-between ${isLastStep ? 'flex' : 'flex md:hidden'}`}>
                {/* Back button */}
                <div className="flex-1">
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
                </div>

                {/* Next / Submit button */}
                {isLastStep ? (
                  !wizard.isContractSigned ? (
                    <button
                      type="button"
                      onClick={() => setIsContractModalOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs shadow-md
                                 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Mở hợp đồng</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsContractModalOpen(true)}
                        disabled={wizard.isLoading}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Xem lại Hợp đồng</span>
                      </button>

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
                            <span>Đang gửi duyệt...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Gửi yêu cầu phê duyệt</span>
                          </>
                        )}
                      </button>
                    </div>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={handleNextAction}
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
            </div>
          </div>

          {/* Floating Support Button */}
          <a
            href="https://web.facebook.com/inhnguyen.940991/"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-[#0084FF] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 hover:-translate-y-1 transition-all z-50 group"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            
            {/* Tooltip */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg">
              Cần hỗ trợ đăng ký?
              {/* Arrow pointing right */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 border-[6px] border-transparent border-l-slate-800" />
            </div>
          </a>

          <VenueSportModal 
            isOpen={isSportModalOpen}
            onConfirm={() => {
              setIsSportModalOpen(false);
              wizard.nextStep();
            }}
            venueInfo={wizard.venueInfo}
            onVenueInfoChange={wizard.setVenueInfo}
            isLoading={wizard.isLoading}
          />
          
          <ContractModal
            isOpen={isContractModalOpen}
            onClose={() => setIsContractModalOpen(false)}
            personalInfo={wizard.personalInfo}
            venueInfo={wizard.venueInfo}
            isAgreedToTerms={wizard.isAgreedToTerms}
            setIsAgreedToTerms={wizard.setIsAgreedToTerms}
            isContractSigned={wizard.isContractSigned}
            signatureData={wizard.signatureData}
            onOpenOtp={() => setIsOtpModalOpen(true)}
          />
          
          <OtpSignatureModal
            isOpen={isOtpModalOpen}
            email={wizard.email}
            onClose={() => setIsOtpModalOpen(false)}
            onSuccess={(signatureData) => {
              wizard.setIsContractSigned(true);
              wizard.setSignatureData(signatureData);
              setIsOtpModalOpen(false);
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default SetupPage;
