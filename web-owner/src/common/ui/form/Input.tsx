import React from 'react';
import { cn } from '../utils';
import { FormField } from './FormField';
import type { FormFieldProps } from './FormField';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'>,
    Omit<FormFieldProps, 'children' | 'className'> {
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  fullWidth?: boolean;
  inputClassName?: string;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      required,
      disabled,
      prefixIcon,
      suffixIcon,
      fullWidth = true,
      id,
      className,
      inputClassName,
      wrapperClassName,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <FormField
        label={label}
        helperText={helperText}
        error={error}
        required={required}
        disabled={disabled}
        id={inputId}
        className={cn(fullWidth ? 'w-full' : 'w-auto', wrapperClassName)}
      >
        <div className="relative flex items-center w-full">
          {prefixIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-slate-400 pointer-events-none select-none">
              {prefixIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-2.5 font-sans text-sm font-normal text-slate-800 bg-white border border-slate-200 rounded-xl transition-all duration-200 outline-none',
              'placeholder-slate-400 hover:border-slate-300 focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white',
              'disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed',
              prefixIcon ? 'pl-11' : '',
              suffixIcon ? 'pr-11' : '',
              error ? 'border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-500/10' : '',
              inputClassName,
              className
            )}
            {...props}
          />
          {suffixIcon && (
            <div className="absolute right-3.5 flex items-center justify-center text-slate-400">
              {suffixIcon}
            </div>
          )}
        </div>
      </FormField>
    );
  }
);

Input.displayName = 'Input';
