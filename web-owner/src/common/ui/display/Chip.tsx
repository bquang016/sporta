import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../utils';

export interface ChipProps extends React.HTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  disabled?: boolean;
  showIcon?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  selected = false,
  disabled = false,
  showIcon = false,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-black uppercase tracking-wider transition-all duration-205 focus:outline-none font-sans cursor-pointer select-none active:scale-95',
        selected
          ? 'bg-brand-emerald border-brand-emerald text-white shadow-sm ring-4 ring-brand-emerald/10'
          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-50',
        disabled && 'opacity-55 cursor-not-allowed active:scale-100 hover:bg-white border-slate-200',
        className
      )}
      {...props}
    >
      {selected && showIcon && <Check className="w-3.5 h-3.5 stroke-[3.5] animate-fadeIn" />}
      <span>{children}</span>
    </button>
  );
};

Chip.displayName = 'Chip';
export default Chip;
