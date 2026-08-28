import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../utils';

export interface StepItem {
  label: string;
  description?: string;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepItem[];
  activeStep: number;
  completedSteps?: number[];
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  completedSteps,
  onStepClick,
  orientation = 'horizontal',
  className,
  ...props
}) => {
  const isHorizontal = orientation === 'horizontal';

  // Helper to check if step is completed
  const isCompleted = (index: number) => {
    if (completedSteps) {
      return completedSteps.includes(index);
    }
    return index < activeStep;
  };

  const handleStepClick = (index: number) => {
    if (onStepClick && (index <= activeStep || isCompleted(index))) {
      onStepClick(index);
    }
  };

  return (
    <div
      className={cn(
        'flex w-full font-sans select-none',
        isHorizontal ? 'flex-row items-center justify-between' : 'flex-col space-y-4',
        className
      )}
      {...props}
    >
      {steps.map((step, index) => {
        const completed = isCompleted(index);
        const active = index === activeStep;
        const disabled = !onStepClick || (!completed && !active);

        return (
          <React.Fragment key={index}>
            {/* Step Element */}
            <div
              className={cn(
                'flex items-center gap-3 transition-all duration-200',
                isHorizontal ? 'flex-row flex-1 last:flex-none' : 'flex-row',
                !disabled && 'cursor-pointer hover:opacity-85'
              )}
              onClick={() => !disabled && handleStepClick(index)}
            >
              {/* Circle Indicator */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-200 flex-shrink-0',
                  completed
                    ? 'bg-brand-emerald border-brand-emerald text-white shadow-sm'
                    : active
                    ? 'bg-white border-brand-emerald text-brand-emerald ring-4 ring-brand-emerald/10 shadow-sm scale-105'
                    : 'bg-white border-slate-200 text-slate-400'
                )}
              >
                {completed ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Text Description */}
              <div className="flex flex-col text-left">
                <span
                  className={cn(
                    'text-xs font-black uppercase tracking-wider',
                    active ? 'text-slate-800' : completed ? 'text-slate-650' : 'text-slate-400'
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-[10px] font-semibold text-slate-400 leading-tight">
                    {step.description}
                  </span>
                )}
              </div>

              {/* Line connector for Horizontal mode */}
              {isHorizontal && index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4 rounded-full transition-colors duration-250',
                    isCompleted(index + 1) || completed ? 'bg-brand-emerald' : 'bg-slate-100'
                  )}
                />
              )}
            </div>

            {/* Line connector for Vertical mode */}
            {!isHorizontal && index < steps.length - 1 && (
              <div className="pl-4 ml-3.5 my-1.5 border-l-2 border-slate-100 h-6">
                <div
                  className={cn(
                    'h-full border-l-2 -ml-[2px] transition-colors duration-250',
                    isCompleted(index + 1) ? 'border-brand-emerald' : 'border-slate-100'
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

Stepper.displayName = 'Stepper';
export default Stepper;
