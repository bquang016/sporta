import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRight className="w-3.5 h-3.5 text-slate-350" />,
  className,
  ...props
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center font-sans text-xs font-semibold select-none', className)}
      {...props}
    >
      <ol className="flex items-center flex-wrap gap-2 text-slate-450">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={item.label + idx} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="flex items-center gap-1.5 hover:text-brand-emerald transition-colors font-bold"
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </a>
              ) : (
                <span className={cn('flex items-center gap-1.5 font-bold', isLast ? 'text-slate-800 font-black' : '')}>
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}

              {!isLast && <span className="flex items-center justify-center">{separator}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumb.displayName = 'Breadcrumb';
export default Breadcrumb;
