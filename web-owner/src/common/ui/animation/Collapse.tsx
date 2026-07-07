import React from 'react';
import { cn } from '../utils';

export interface CollapseProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
}

export const Collapse: React.FC<CollapseProps> = ({ isOpen, children, className, ...props }) => {
  return (
    <div
      className={cn(
        'transition-all duration-350 ease-out overflow-hidden',
        isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Collapse.displayName = 'Collapse';
export default Collapse;
