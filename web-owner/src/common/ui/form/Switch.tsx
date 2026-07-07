import React from 'react';
import { cn } from '../utils';
import { FormField } from './FormField';
import type { FormFieldProps } from './FormField';

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'>,
    Omit<FormFieldProps, 'children' | 'className'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelPosition?: 'left' | 'right';
  className?: string;
  wrapperClassName?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  helperText,
  error,
  required,
  disabled,
  checked,
  onChange,
  labelPosition = 'right',
  id,
  className,
  wrapperClassName,
  ...props
}) => {
  const switchId = id || props.name;

  const switchElement = (
    <button
      id={switchId}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-emerald/15',
        checked ? 'bg-brand-emerald' : 'bg-slate-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-250 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );

  // If no standard label, just render the switch element directly wrapped in FormField
  if (!label) {
    return (
      <FormField
        helperText={helperText}
        error={error}
        required={required}
        disabled={disabled}
        id={switchId}
        className={cn('w-auto', wrapperClassName)}
      >
        {switchElement}
      </FormField>
    );
  }

  // Render inline-flex for nice toggling row
  return (
    <div className={cn('flex flex-col gap-1 w-full font-sans', wrapperClassName)}>
      <label
        htmlFor={switchId}
        className={cn(
          'inline-flex items-center justify-between gap-3 cursor-pointer select-none text-sm font-semibold text-slate-700',
          disabled && 'opacity-60 cursor-not-allowed',
          labelPosition === 'right' ? 'flex-row-reverse justify-end' : 'flex-row'
        )}
      >
        <span>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
        {switchElement}
      </label>

      {error ? (
        <span className="text-xs text-red-650 font-medium animate-fadeIn" role="alert">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-xs text-slate-400 font-medium">{helperText}</span>
      ) : null}
    </div>
  );
};

Switch.displayName = 'Switch';
export default Switch;
