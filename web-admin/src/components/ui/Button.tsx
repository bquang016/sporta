import React from 'react';
import { cn } from '../../utils/cn';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      prefixIcon,
      suffixIcon,
      disabled,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans rounded-xl font-bold transition-all duration-200 focus:outline-none select-none active:scale-[0.98]';

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-brand-yellow text-brand-emerald hover:bg-yellow-400 active:bg-yellow-500 border border-brand-yellow/30 shadow-sm font-black',
      secondary:
        'bg-brand-emerald text-white hover:bg-emerald-800 active:bg-emerald-950 border border-brand-emerald shadow-sm',
      outline:
        'bg-transparent text-brand-emerald border border-brand-emerald/30 hover:bg-brand-emerald/5',
      ghost:
        'bg-transparent text-brand-emerald hover:bg-brand-emerald/5 border border-transparent',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-red-600 shadow-sm',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-600 shadow-sm',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3.5 py-2 text-xs min-h-[36px]',
      md: 'px-5 py-2.5 text-sm min-h-[44px]', // Fits 44pt touch targets requirement
      lg: 'px-7 py-3.5 text-base min-h-[50px]',
    };

    const isInteractionDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isInteractionDisabled}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth ? 'w-full' : 'w-auto',
          isInteractionDisabled && 'opacity-50 cursor-not-allowed active:scale-100',
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && prefixIcon && (
          <span className="inline-flex mr-2 flex-shrink-0">{prefixIcon}</span>
        )}

        <span>{children}</span>

        {!loading && suffixIcon && (
          <span className="inline-flex ml-2 flex-shrink-0">{suffixIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
