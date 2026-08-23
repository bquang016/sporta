// ─────────────────────────────────────────────────────────────────────────────
// Setup Wizard — Main Progress Indicator (Top Bar)
// ─────────────────────────────────────────────────────────────────────────────

import { type SetupStep, MAIN_STEPS } from '../types';

interface SetupMainStepIndicatorProps {
  currentStep: SetupStep;
}

export const SetupMainStepIndicator = ({ currentStep }: SetupMainStepIndicatorProps) => {
  const activeIndex = MAIN_STEPS.findIndex((s) => s.subSteps.includes(currentStep));

  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-3xl mx-auto">
      {MAIN_STEPS.map((step, i) => {
        const isCompleted = i < activeIndex;
        const isActive = i === activeIndex;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-initial">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5 min-w-[60px] relative z-10">
              <div
                className={`
                  w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center
                  text-[10px] lg:text-[11px] font-black transition-all duration-300
                  ${isCompleted
                    ? 'bg-brand-emerald text-white shadow-sm shadow-brand-emerald/20'
                    : isActive
                      ? 'bg-brand-emerald text-white shadow-md shadow-brand-emerald/25 ring-2 ring-brand-emerald/10'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={`
                  text-[8px] lg:text-[9px] font-black uppercase tracking-wider text-center leading-tight whitespace-nowrap
                  ${isActive ? 'text-brand-emerald' : isCompleted ? 'text-brand-emerald/60' : 'text-slate-400'}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < MAIN_STEPS.length - 1 && (
              <div className="flex-1 mx-2 lg:mx-3 -mt-4 lg:-mt-5">
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
