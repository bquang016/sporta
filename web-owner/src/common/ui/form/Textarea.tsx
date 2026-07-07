import React from 'react';
import { cn } from '../utils';
import { FormField } from './FormField';
import type { FormFieldProps } from './FormField';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<FormFieldProps, 'children' | 'className'> {
  fullWidth?: boolean;
  textareaClassName?: string;
  wrapperClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      required,
      disabled,
      fullWidth = true,
      id,
      className,
      textareaClassName,
      wrapperClassName,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || props.name;

    return (
      <FormField
        label={label}
        helperText={helperText}
        error={error}
        required={required}
        disabled={disabled}
        id={textareaId}
        className={cn(fullWidth ? 'w-full' : 'w-auto', wrapperClassName)}
      >
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          rows={rows}
          className={cn(
            'w-full px-4 py-3 font-sans text-sm font-normal text-slate-800 bg-white border border-slate-200 rounded-xl transition-all duration-200 outline-none resize-y',
            'placeholder-slate-400 hover:border-slate-300 focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 focus:bg-white',
            'disabled:bg-slate-50 disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed',
            error ? 'border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-500/10' : '',
            textareaClassName,
            className
          )}
          {...props}
        />
      </FormField>
    );
  }
);

Textarea.displayName = 'Textarea';
