import React from 'react';
import { cn } from '../utils';

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: 'emerald' | 'yellow' | 'blue' | 'red';
  indeterminate?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  size = 'md',
  showLabel = false,
  color = 'emerald',
  indeterminate = false,
  className,
  ...props
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const sizeDimensions = {
    sm: { box: 36, stroke: 3, radius: 15 },
    md: { box: 60, stroke: 5, radius: 24 },
    lg: { box: 80, stroke: 6, radius: 32 },
  };

  const currentSize = sizeDimensions[size];
  const circumference = 2 * Math.PI * currentSize.radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  const colorClasses = {
    emerald: 'stroke-brand-emerald text-brand-emerald',
    yellow: 'stroke-brand-yellow text-brand-emerald',
    blue: 'stroke-sky-500 text-sky-500',
    red: 'stroke-red-500 text-red-500',
  };

  return (
    <div
      className={cn('inline-flex flex-col items-center justify-center font-sans select-none', className)}
      {...props}
    >
      <div className="relative inline-flex items-center justify-center">
        {/* SVG Progress Circle */}
        <svg
          width={currentSize.box}
          height={currentSize.box}
          viewBox={`0 0 ${currentSize.box} ${currentSize.box}`}
          className={cn('-rotate-90', indeterminate && 'animate-spin')}
        >
          {/* Background circle */}
          <circle
            className="stroke-slate-100/90"
            strokeWidth={currentSize.stroke}
            fill="transparent"
            r={currentSize.radius}
            cx={currentSize.box / 2}
            cy={currentSize.box / 2}
          />
          {/* Progress circle */}
          <circle
            className={cn('transition-all duration-300 ease-in-out', colorClasses[color])}
            strokeWidth={currentSize.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={indeterminate ? circumference * 0.75 : strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={currentSize.radius}
            cx={currentSize.box / 2}
            cy={currentSize.box / 2}
          />
        </svg>

        {/* Optional Value text centered */}
        {!indeterminate && showLabel && size !== 'sm' && (
          <span className="absolute text-xs font-black text-slate-800">
            {Math.round(clampedValue)}%
          </span>
        )}
      </div>
    </div>
  );
};

CircularProgress.displayName = 'CircularProgress';
export default CircularProgress;
