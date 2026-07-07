import React from 'react';
import { cn } from '../utils';

export interface InfoRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  labelClassName?: string;
  valueClassName?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  labelClassName,
  valueClassName,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-2.5 border-b border-slate-100/70 font-sans text-xs font-semibold text-slate-700 last:border-b-0',
        className
      )}
      {...props}
    >
      <span className={cn('text-slate-450 uppercase font-black tracking-wider', labelClassName)}>
        {label}
      </span>
      <span className={cn('text-slate-800 text-right leading-relaxed', valueClassName)}>
        {value}
      </span>
    </div>
  );
};

InfoRow.displayName = 'InfoRow';
export default InfoRow;
