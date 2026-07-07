import React from 'react';
import { cn } from '../utils';

export interface DescriptionListItem {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  items: DescriptionListItem[];
  cols?: 1 | 2 | 3;
}

export const DescriptionList: React.FC<DescriptionListProps> = ({
  items,
  cols = 1,
  className,
  ...props
}) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2 gap-x-6',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6',
  };

  return (
    <dl
      className={cn(
        'grid gap-y-4 font-sans text-xs font-semibold text-slate-700',
        colClasses[cols],
        className
      )}
      {...props}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-2 border-b border-slate-100/50 last:border-b-0"
        >
          <dt className="text-slate-450 uppercase font-black tracking-wider flex-shrink-0">
            {item.label}
          </dt>
          <dd className="text-slate-800 text-left sm:text-right leading-relaxed font-bold">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

DescriptionList.displayName = 'DescriptionList';
export default DescriptionList;
