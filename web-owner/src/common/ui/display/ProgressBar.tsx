import React from 'react';
import { cn } from '../utils';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'yellow' | 'blue' | 'red';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = false,
  size = 'md',
  color = 'emerald',
  className,
  ...props
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    emerald: 'bg-brand-emerald',
    yellow: 'bg-brand-yellow',
    blue: 'bg-sky-500',
    red: 'bg-red-500',
  };

  return (
    <div className={cn('w-full font-sans select-none', className)} {...props}>
      <div className="flex items-center justify-between gap-4 mb-1">
        {showLabel && (
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Tiến trình
          </span>
        )}
        {showLabel && (
          <span className="text-xs font-black text-slate-800">
            {Math.round(clampedValue)}%
          </span>
        )}
      </div>
      {/* Outer Rail */}
      <div className={cn('w-full bg-slate-100 border border-slate-200/40 rounded-full overflow-hidden', heightClasses[size])}>
        {/* Filled Track */}
        <div
          className={cn('h-full rounded-full transition-all duration-300 ease-out', colorClasses[color])}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';
export default ProgressBar;
