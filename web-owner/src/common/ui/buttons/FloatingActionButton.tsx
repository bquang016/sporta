import React from 'react';
import { cn } from '../utils';
import { IconButton } from './IconButton';
import type { IconButtonProps } from './IconButton';

export type FABPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'custom';

export interface FloatingActionButtonProps extends Omit<IconButtonProps, 'isRound'> {
  position?: FABPosition;
}

export const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ position = 'bottom-right', className, ...props }, ref) => {
    const positionClasses = {
      'bottom-right': 'fixed bottom-6 right-6',
      'bottom-left': 'fixed bottom-6 left-6',
      'top-right': 'fixed top-6 right-6',
      'top-left': 'fixed top-6 left-6',
      custom: '',
    };

    return (
      <IconButton
        ref={ref}
        isRound={true}
        className={cn(
          positionClasses[position],
          // soft diffused shadow (15% opacity of Deep Emerald) with a large blur radius
          'shadow-[0_12px_36px_rgba(6,78,59,0.18)] hover:shadow-[0_16px_40px_rgba(6,78,59,0.22)] active:scale-95 border-none z-50 transition-all duration-200',
          className
        )}
        {...props}
      />
    );
  }
);

FloatingActionButton.displayName = 'FloatingActionButton';
export default FloatingActionButton;
