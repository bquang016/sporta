import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../utils';
import { IconButton } from '../buttons/IconButton';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: React.ReactNode;
  backHref?: string;
  onBackClick?: () => void;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backHref,
  onBackClick,
  actions,
  className,
  ...props
}) => {
  const hasBackAction = !!backHref || !!onBackClick;

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else if (backHref) {
      window.location.href = backHref;
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-center justify-between gap-4 py-5 border-b border-slate-100 font-sans select-none',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {hasBackAction && (
          <IconButton
            variant="ghost"
            size="sm"
            onClick={handleBack}
            aria-label="Quay lại"
            className="text-slate-500 hover:text-slate-800 p-1 w-9 h-9"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </IconButton>
        )}
        <div className="space-y-0.5">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 leading-tight tracking-tight uppercase">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">{actions}</div>}
    </div>
  );
};

PageHeader.displayName = 'PageHeader';
export default PageHeader;
