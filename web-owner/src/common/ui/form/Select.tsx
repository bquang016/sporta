import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils';
import { FormField } from './FormField';
import type { FormFieldProps } from './FormField';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'prefix'>,
    Omit<FormFieldProps, 'children' | 'className'> {
  options?: SelectOption[];
  prefixIcon?: React.ReactNode;
  fullWidth?: boolean;
  selectClassName?: string;
  wrapperClassName?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      required,
      disabled,
      options,
      prefixIcon,
      fullWidth = true,
      id,
      className,
      selectClassName,
      wrapperClassName,
      placeholder,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name;

    return (
      <FormField
        label={label}
        helperText={helperText}
        error={error}
        required={required}
        disabled={disabled}
        id={selectId}
        className={cn(fullWidth ? 'w-full' : 'w-auto', wrapperClassName)}
      >
        <div className="relative flex items-center w-full">
          {prefixIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-outline-variant pointer-events-none select-none">
              {prefixIcon}
            </div>
          )}
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-2.5 pr-10 font-sans text-sm font-normal text-on-surface bg-white border border-outline-variant rounded-xl transition-all duration-200 outline-none appearance-none cursor-pointer',
              'placeholder-outline hover:border-outline focus:border-primary focus:ring-2 focus:ring-primary/10 focus:bg-white',
              'disabled:bg-surface-container-low disabled:border-outline-variant/50 disabled:text-outline-variant disabled:cursor-not-allowed',
              prefixIcon ? 'pl-11' : '',
              error ? 'border-error hover:border-error focus:border-error focus:ring-error/10' : '',
              selectClassName,
              className
            )}
            defaultValue={props.defaultValue ?? ""}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled} className="text-on-surface">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3.5 flex items-center justify-center text-outline-variant pointer-events-none select-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </FormField>
    );
  }
);

Select.displayName = 'Select';
