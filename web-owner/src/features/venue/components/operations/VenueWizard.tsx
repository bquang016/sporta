import React from 'react';
import { VenueWizardProvider, useVenueWizard } from './VenueWizardContext';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Facilities } from './Step2Facilities';
import { Step3Images } from './Step3Images';
import { Step4OperatingPricing } from './Step4OperatingPricing';
import { Step5Summary } from './Step5Summary';
import type { VenueResponse } from '../../types';
import { Button } from '../../../../components/ui/Button';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';

interface VenueWizardProps {
  onClose: () => void;
  initialVenue?: VenueResponse | null;
  initialCourts?: any[];
}

const WizardInner = ({ onClose }: { onClose: () => void }) => {
  const {
    step,
    setStep,
    loading,
    saveDraft,
    submitForApproval,
    venueId
  } = useVenueWizard();

  const STEPS_CONFIG = [
    { number: 1, label: 'Thông tin cơ bản' },
    { number: 2, label: 'Khai báo sân' },
    { number: 3, label: 'Tải ảnh' },
    { number: 4, label: 'Vận hành & Giá' },
    { number: 5, label: 'Xác nhận' }
  ];

  const handleNext = async () => {
    // Before moving from step 1, if venueId is null, we must auto-save draft to create it
    if (step === 1) {
      const savedId = await saveDraft(true);
      if (!savedId) return; // name validation failed
    } else {
      // Auto-save draft on transitions to prevent data loss
      await saveDraft(true);
    }
    
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    const success = await submitForApproval();
    if (success) {
      onClose();
    }
  };

  const renderStepComponent = () => {
    switch (step) {
      case 1: return <Step1BasicInfo />;
      case 2: return <Step2Facilities />;
      case 3: return <Step3Images />;
      case 4: return <Step4OperatingPricing />;
      case 5: return <Step5Summary />;
      default: return <Step1BasicInfo />;
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50 font-sans z-10 animate-fadeIn select-none">
      
      {/* ── TOP HEADER BAR ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between shadow-3xs z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-1.5 font-bold text-xs border border-slate-200 bg-slate-50 hover:bg-slate-100"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </Button>
          <div className="hidden sm:block w-px h-5 bg-slate-200" />
          <div className="hidden sm:block">
            <h1 className="text-sm font-black text-slate-800 leading-tight">
              {venueId ? 'Cập nhật bản nháp cụm sân' : 'Tạo cụm sân mới'}
            </h1>
          </div>
        </div>

        {/* Stepper progress indicator */}
        <div className="hidden md:flex items-center gap-2 max-w-xl flex-1 justify-center px-4">
          {STEPS_CONFIG.map((s, index) => {
            const isCompleted = step > s.number;
            const isActive = step === s.number;
            
            return (
              <React.Fragment key={s.number}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                      isCompleted
                        ? 'bg-brand-emerald border-brand-emerald text-white shadow-2xs'
                        : isActive
                        ? 'bg-slate-800 border-slate-800 text-white shadow-2xs scale-105'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.number
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider transition-all ${
                      isActive ? 'text-slate-800' : isCompleted ? 'text-brand-emerald' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {index < STEPS_CONFIG.length - 1 && (
                  <div
                    className={`h-0.5 w-12 rounded transition-all ${
                      isCompleted ? 'bg-brand-emerald' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Action button header side */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-750 hover:bg-slate-50 border-slate-200"
          >
            Hủy
          </Button>
          
          <button
            type="button"
            onClick={() => saveDraft(false)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 border border-amber-200/50 disabled:opacity-60"
          >
            {loading ? <LoadingSpinner size="sm" color="primary" /> : null}
            Lưu nháp
          </button>

          {step === 5 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSubmit}
              disabled={loading}
              className="font-bold text-xs flex items-center gap-1.5 border-b-2 border-emerald-950"
            >
              {loading && <LoadingSpinner size="sm" color="white" />}
              Gửi duyệt
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNext}
              disabled={loading}
              className="font-bold text-xs flex items-center gap-1.5 border-b-2 border-emerald-950"
            >
              Tiếp theo
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <svg className="w-3.5 h-3.5 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ── MOBILE STEP INDICATOR ────────────────────────────────────────────── */}
      <div className="flex md:hidden flex-shrink-0 bg-slate-100 border-b border-slate-200 px-5 py-2.5 items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
        <span>Bước {step} / 5</span>
        <span className="text-slate-800">{STEPS_CONFIG[step - 1].label}</span>
      </div>

      {/* ── CONTENT AREA ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden bg-slate-50">
        {renderStepComponent()}
      </div>

    </div>
  );
};

export const VenueWizard = ({ onClose, initialVenue, initialCourts }: VenueWizardProps) => {
  return (
    <VenueWizardProvider onClose={onClose} initialVenue={initialVenue} initialCourts={initialCourts}>
      <WizardInner onClose={onClose} />
    </VenueWizardProvider>
  );
};
export default VenueWizard;
