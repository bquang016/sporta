import React from 'react';
import { cn } from '../utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không tìm thấy dữ liệu',
  description,
  icon,
  action,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 min-h-[300px] border border-dashed border-slate-200 bg-slate-50/30 rounded-3xl font-sans',
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center max-w-sm space-y-4">
        {icon ? (
          <div className="text-slate-350 select-none">{icon}</div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200/50 shadow-sm select-none">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
        )}

        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              {description}
            </p>
          )}
        </div>

        {action && <div className="pt-2 select-none">{action}</div>}
      </div>
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
export default EmptyState;
