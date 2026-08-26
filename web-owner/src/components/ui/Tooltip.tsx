import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export const Tooltip = ({
  content,
  children,
  position = 'top',
  className = ''
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses: Record<string, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-slate-900 border-x-transparent border-b-transparent',
    'top-left': 'top-full left-4 -mt-1 border-t-slate-900 border-x-transparent border-b-transparent',
    'top-right': 'top-full right-4 -mt-1 border-t-slate-900 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-slate-900 border-x-transparent border-t-transparent',
    'bottom-left': 'bottom-full left-4 -mb-1 border-b-slate-900 border-x-transparent border-t-transparent',
    'bottom-right': 'bottom-full right-4 -mb-1 border-b-slate-900 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-slate-900 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-slate-900 border-y-transparent border-l-transparent'
  };

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={`absolute z-[100] px-3.5 py-2.5 text-[11px] font-medium text-slate-100 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl pointer-events-none transition-all duration-200 scale-100 origin-center border border-white/10 ${positionClasses[position]} w-max min-w-[180px] max-w-[280px] sm:max-w-xs whitespace-normal break-words text-left leading-relaxed ${className}`}
        >
          <div>{content}</div>
          <div className={`absolute border-4 ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
};
export default Tooltip;
