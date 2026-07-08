import React from 'react';
import { cn } from '../utils';

export interface FadeProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
}

export const Fade: React.FC<FadeProps> = ({ isOpen, children, className, ...props }) => {
  return (
    <div
      className={cn(
        'transition-opacity duration-300 ease-out',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Fade.displayName = 'Fade';
export default Fade;
