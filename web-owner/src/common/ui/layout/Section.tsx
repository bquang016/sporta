import React from 'react';
import { cn } from '../utils';

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  action,
  className,
  ...props
}) => {
  return (
    <section
      className={cn(
        'w-full py-6 sm:py-8 font-sans border-b border-slate-100 last:border-b-0', // Enforces DESIGN.md 24px-32px padding vertical rhythms
        className
      )}
      {...props}
    >
      {/* Header element if title exists */}
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-4 mb-5 select-none">
          <div className="space-y-1">
            {title && (
              <h4 className="text-sm font-black text-slate-800 tracking-wider uppercase">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-xs font-semibold text-slate-450 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      {/* Main contents */}
      <div className="w-full">{children}</div>
    </section>
  );
};

Section.displayName = 'Section';
export default Section;
