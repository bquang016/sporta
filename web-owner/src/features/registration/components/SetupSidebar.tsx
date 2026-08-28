// ─────────────────────────────────────────────────────────────────────────────
// Setup Wizard — Sidebar (Sub-steps Navigation)
// ─────────────────────────────────────────────────────────────────────────────

import { MAIN_STEPS, SETUP_STEPS, type SetupStep } from '../types';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

interface SetupSidebarProps {
  currentStep: SetupStep;
  onStepClick: (step: SetupStep) => void;
  onPrev: () => void;
  onNext: () => void;
  isLoading: boolean;
  isFirstStep: boolean;
}

export const SetupSidebar = ({ currentStep, onStepClick, onPrev, onNext, isLoading, isFirstStep }: SetupSidebarProps) => {
  const activeMainIndex = MAIN_STEPS.findIndex((s) => s.subSteps.includes(currentStep));
  const activeMainStep = MAIN_STEPS[activeMainIndex];

  // We only show sidebar if there are sub-steps for the current main step
  if (!activeMainStep || activeMainStep.subSteps.length <= 1) {
    return null;
  }

  const globalCurrentIndex = SETUP_STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className="w-[240px] shrink-0 border-r border-slate-200/80 bg-slate-50/50 py-6 hidden md:flex flex-col relative">
      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 px-6 shrink-0">
        {activeMainStep.label}
      </h3>
      
      <div className="flex flex-col relative mt-2 flex-1 overflow-y-auto overflow-x-hidden">
        {/* Subtle vertical line connecting all steps */}
        <div className="absolute left-[37px] top-4 bottom-4 w-[2px] bg-slate-200 -z-10" />

        {activeMainStep.subSteps.map((subStepKey, idx) => {
          const stepDef = SETUP_STEPS.find(s => s.key === subStepKey);
          if (!stepDef) return null;

          const isActive = currentStep === subStepKey;
          const globalThisIndex = SETUP_STEPS.findIndex(s => s.key === subStepKey);
          const isCompleted = globalThisIndex < globalCurrentIndex;
          const isClickable = isCompleted || isActive; // Can only go back or stay

          return (
            <div
              key={subStepKey}
              onClick={() => isClickable && onStepClick(subStepKey)}
              className={`
                flex items-center gap-4 transition-all duration-200 group pl-6 py-3.5
                ${isActive ? 'bg-white border-y border-l border-slate-200/80 rounded-l-2xl shadow-[-4px_0_10px_rgba(0,0,0,0.02)] relative -mr-[1px] z-10' : 'border border-transparent pr-4'}
                ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
              `}
            >
              {/* Circle */}
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-[2px] transition-colors bg-white
                  ${isActive
                    ? 'border-brand-emerald text-brand-emerald shadow-md shadow-brand-emerald/10'
                    : isCompleted
                      ? 'border-brand-emerald text-brand-emerald'
                      : 'border-slate-200 text-slate-400'
                  }
                `}
              >
                {isCompleted && !isActive ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-[12px] font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-[13px] font-bold tracking-wide transition-colors leading-tight
                  ${isActive
                    ? 'text-brand-emerald'
                    : isCompleted
                      ? 'text-slate-700 group-hover:text-brand-emerald'
                      : 'text-slate-500'
                  }
                `}
              >
                {stepDef.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="px-6 pt-6 mt-4 border-t border-slate-200/80 shrink-0 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={isLoading || isFirstStep}
          className={`
            flex items-center justify-center gap-1 flex-1 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-[11px] transition-all
            ${isFirstStep ? 'opacity-50 cursor-not-allowed text-slate-400' : 'text-slate-600 hover:bg-slate-50 cursor-pointer shadow-sm'}
          `}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={isLoading}
          className="flex items-center justify-center gap-1 flex-1 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-800 text-white font-bold text-[11px] shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" color="white" />
          ) : (
            <>
              Tiếp theo
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

