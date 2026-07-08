import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '../utils';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'p-5 border border-slate-100/90 bg-white rounded-3xl shadow-sm hover:shadow-[0_12px_36px_rgba(6,78,59,0.06)] transition-all duration-200 flex flex-col font-sans select-none',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-450">
          {title}
        </span>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-4 flex-wrap mt-auto">
        <span className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none">
          {value}
        </span>

        {trend && (
          <div
            className={cn(
              'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wide leading-none',
              trend.isPositive
                ? 'bg-emerald-50 text-brand-emerald border border-emerald-200/50'
                : 'bg-red-50 text-red-650 border border-red-200/50'
            )}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3 h-3 stroke-[3.5] flex-shrink-0" />
            ) : (
              <ArrowDownRight className="w-3 h-3 stroke-[3.5] flex-shrink-0" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
};

StatCard.displayName = 'StatCard';
export default StatCard;
