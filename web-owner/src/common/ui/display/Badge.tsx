import React from 'react';
import { cn } from '../utils';

export type BadgeVariant =
  | 'draft'
  | 'pending'
  | 'active'
  | 'rejected'
  | 'warning'
  | 'success'
  | 'danger'
  | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  size = 'sm',
  className,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
    pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    active: 'bg-emerald-50 text-brand-emerald border-emerald-150',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    success: 'bg-emerald-50 text-brand-emerald border-emerald-150',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-sky-50 text-sky-850 border-sky-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] tracking-wide font-black',
    md: 'px-2.5 py-1 text-xs tracking-wide font-black',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-sans border rounded-full uppercase leading-none select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
export default Badge;
