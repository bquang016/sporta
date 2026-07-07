import React from 'react';
import { cn } from '../utils';

export interface FormFieldProps {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, helperText, error, required, disabled, id, className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-1.5 w-full text-left font-sans',
          disabled && 'opacity-60 pointer-events-none',
          className
        )}
      >
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold tracking-wider uppercase text-slate-500 select-none flex items-center gap-0.5"
          >
            {label}
            {required && <span className="text-red-500 font-bold" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative w-full">{children}</div>

        {error ? (
          <span
            className="text-xs text-red-600 font-medium animate-fadeIn"
            role="alert"
          >
            {error}
          </span>
        ) : helperText ? (
          <span className="text-xs text-slate-400 font-medium">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
