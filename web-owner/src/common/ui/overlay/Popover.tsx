import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils';

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  placement = 'bottom-start',
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const placementClasses = {
    'bottom-start': 'top-full left-0 mt-2 origin-top-left',
    'bottom-end': 'top-full right-0 mt-2 origin-top-right',
    'top-start': 'bottom-full left-0 mb-2 origin-bottom-left',
    'top-end': 'bottom-full right-0 mb-2 origin-bottom-right',
  };

  return (
    <div ref={popoverRef} className="relative inline-block font-sans select-none" {...props}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="inline-flex cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-[90] min-w-[200px] bg-white border border-slate-100/90 rounded-2xl shadow-[0_12px_36px_rgba(6,78,59,0.12)] p-3 animate-fadeIn focus:outline-none',
            placementClasses[placement],
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

Popover.displayName = 'Popover';
export default Popover;
