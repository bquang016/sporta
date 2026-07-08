// ─────────────────────────────────────────────────────────────────────────────
// Setup Wizard — Step Progress Indicator (5 steps, horizontal)
// ─────────────────────────────────────────────────────────────────────────────

import type { SetupStep } from '../types';
import { SETUP_STEPS } from '../types';

interface SetupStepIndicatorProps {
  currentStep: SetupStep;
  onStepClick?: (step: SetupStep) => void;
}

export const SetupStepIndicator = ({ currentStep, onStepClick }: SetupStepIndicatorProps) => {
  const activeIndex = SETUP_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-0 w-full">
      {SETUP_STEPS.map((step, i) => {
        const isCompleted = i < activeIndex;
        const isActive = i === activeIndex;
        const isClickable = isCompleted && onStepClick;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-initial">
            {/* Step circle + label */}
            <div
              className={`flex flex-col items-center gap-1.5 min-w-[48px] ${isClickable ? 'cursor-pointer' : ''}`}
              onClick={() => isClickable && onStepClick(step.key)}
            >
              <div
                className={`
                  w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center
                  text-[9px] lg:text-[10px] font-black transition-all duration-300
                  ${isCompleted
                    ? 'bg-brand-emerald text-white shadow-md shadow-brand-emerald/20'
                    : isActive
                      ? 'bg-brand-emerald text-white shadow-lg shadow-brand-emerald/25 ring-4 ring-brand-emerald/10'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={`
                  text-[6px] lg:text-[7.5px] font-black uppercase tracking-wider text-center leading-tight
                  ${isActive ? 'text-brand-emerald' : isCompleted ? 'text-brand-emerald/60' : 'text-slate-400'}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < SETUP_STEPS.length - 1 && (
              <div className="flex-1 mx-1 lg:mx-1.5">
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
