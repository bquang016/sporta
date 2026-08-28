import React from 'react';
import { cn } from '../utils';
import { FormField } from './FormField';
import type { FormFieldProps } from './FormField';

export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps
  extends Omit<FormFieldProps, 'children' | 'className'> {
  options: RadioOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  name: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  wrapperClassName?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  helperText,
  error,
  required,
  disabled,
  options,
  value,
  onChange,
  name,
  orientation = 'vertical',
  className,
  wrapperClassName,
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <FormField
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      disabled={disabled}
      className={cn('w-full', wrapperClassName)}
    >
      <div
        className={cn(
          'flex font-sans gap-4',
          isHorizontal ? 'flex-row flex-wrap items-center' : 'flex-col justify-start',
          className
        )}
        role="radiogroup"
        aria-label={typeof label === 'string' ? label : undefined}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          const isOptDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              className={cn(
                'inline-flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-700 select-none transition-opacity duration-150',
                isOptDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                disabled={isOptDisabled}
                onChange={() => !isOptDisabled && onChange?.(option.value)}
                className="sr-only"
              />
              {/* Custom Radio Circle */}
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0',
                  isSelected
                    ? 'border-brand-emerald bg-white scale-100 ring-4 ring-brand-emerald/5'
                    : 'border-slate-200 bg-white hover:border-slate-350'
                )}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-fadeIn" />
                )}
              </div>
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </FormField>
  );
};

RadioGroup.displayName = 'RadioGroup';
export default RadioGroup;
