import React from 'react';
import { cn } from '../utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxW?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  centerContent?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxW = '7xl',
  centerContent = false,
  className,
  ...props
}) => {
  const maxWClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'w-full mx-auto px-5 sm:px-6 lg:px-8 font-sans', // px-5 is 20px margin mobile
        maxWClasses[maxW],
        centerContent && 'flex flex-col items-center justify-center',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Container.displayName = 'Container';
export default Container;
