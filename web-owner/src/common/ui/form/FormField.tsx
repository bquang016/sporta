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
  labelClassName?: string;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, helperText, error, required, disabled, id, className, children, labelClassName }, ref) => {
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
            className={cn(
              "select-none flex items-center gap-0.5",
              labelClassName || "text-xs font-semibold tracking-wider uppercase text-outline"
            )}
          >
            {label}
            {required && <span className="text-error font-bold" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative w-full">{children}</div>

        {error ? (
          <span
            className="text-xs text-error font-medium animate-fadeIn"
            role="alert"
          >
            {error}
          </span>
        ) : helperText ? (
          <span className="text-xs text-on-surface-variant font-medium">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
