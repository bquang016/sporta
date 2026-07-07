import React from 'react';
import { cn } from '../utils';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  children?: React.ReactNode;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  children,
  className,
  ...props
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={cn(
        'flex items-center w-full font-sans select-none',
        isHorizontal ? 'flex-row my-4' : 'flex-col mx-4 h-auto self-stretch',
        className
      )}
      role="separator"
      aria-orientation={orientation}
      {...props}
    >
      {isHorizontal ? (
        <>
          <div className="flex-1 border-t border-slate-100/90" />
          {children && (
            <span className="px-3 text-xs font-semibold text-slate-400 whitespace-nowrap">
              {children}
            </span>
          )}
          <div className="flex-1 border-t border-slate-100/90" />
        </>
      ) : (
        <>
          <div className="flex-1 border-l border-slate-100/90" />
          {children && (
            <span className="py-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {children}
            </span>
          )}
          <div className="flex-1 border-l border-slate-100/90" />
        </>
      )}
    </div>
  );
};

Divider.displayName = 'Divider';
export default Divider;
