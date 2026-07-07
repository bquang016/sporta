import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  onClose?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md';
}

export const Tag: React.FC<TagProps> = ({
  children,
  onClose,
  variant = 'outline',
  size = 'sm',
  className,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-brand-emerald text-white border-brand-emerald',
    secondary: 'bg-brand-yellow text-brand-emerald border-brand-yellow/30',
    outline: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100/50',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-[10px] tracking-wide font-black',
    md: 'px-3 py-1.5 text-xs tracking-wide font-black',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border rounded-xl uppercase select-none font-sans leading-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-0.5 rounded-full hover:bg-black/10 focus:outline-none transition-colors"
          aria-label="Remove tag"
        >
          <X className="w-2.5 h-2.5 stroke-[3]" />
        </button>
      )}
    </span>
  );
};

Tag.displayName = 'Tag';
export default Tag;
