// ─────────────────────────────────────────────────────────────────────────────
// Registration — Step Progress Indicator
// ─────────────────────────────────────────────────────────────────────────────

import type { RegistrationStep } from '../types';

interface StepIndicatorProps {
  currentStep: RegistrationStep;
}

const STEPS = [
  { key: 'email' as const, label: 'Xác thực Email', altKey: 'otp' as const },
  { key: 'info' as const, label: 'Thông tin hồ sơ' },
  { key: 'success' as const, label: 'Hoàn tất' },
];

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const getStepIndex = (step: RegistrationStep): number => {
    if (step === 'email' || step === 'otp') return 0;
    if (step === 'info') return 1;
    return 2; // success
  };

  const activeIndex = getStepIndex(currentStep);

  return (
    <div className="flex items-center justify-center gap-0 w-full mb-5 lg:mb-7">
      {STEPS.map((step, i) => {
        const isCompleted = i < activeIndex;
        const isActive = i === activeIndex;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-initial">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
              <div
                className={`
                  w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center
                  text-[10px] lg:text-[11px] font-black transition-all duration-300
                  ${isCompleted
                    ? 'bg-brand-emerald text-white shadow-md shadow-brand-emerald/20'
                    : isActive
                      ? 'bg-brand-emerald text-white shadow-lg shadow-brand-emerald/25 ring-4 ring-brand-emerald/10'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={`
                  text-[8px] lg:text-[9px] font-black uppercase tracking-wider text-center leading-tight
                  ${isActive ? 'text-brand-emerald' : isCompleted ? 'text-brand-emerald/60' : 'text-slate-400'}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-2 lg:mx-3">
                <div
                  className={`
                    h-[2px] rounded-full transition-all duration-500
                    ${i < activeIndex ? 'bg-brand-emerald' : 'bg-slate-200'}
                  `}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
