import React from 'react';
import { cn } from '../utils';

export type SlideDirection = 'up' | 'down' | 'left' | 'right';

export interface SlideProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  direction?: SlideDirection;
}

export const Slide: React.FC<SlideProps> = ({
  isOpen,
  direction = 'up',
  children,
  className,
  ...props
}) => {
  const getDirectionClasses = () => {
    switch (direction) {
      case 'up':
        return isOpen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none';
      case 'down':
        return isOpen ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0 pointer-events-none';
      case 'left':
        return isOpen ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0 pointer-events-none';
      case 'right':
        return isOpen ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0 pointer-events-none';
    }
  };

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out transform',
        getDirectionClasses(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Slide.displayName = 'Slide';
export default Slide;
