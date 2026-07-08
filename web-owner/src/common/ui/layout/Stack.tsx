import React from 'react';
import { cn } from '../utils';

export type StackSpacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  spacing?: StackSpacing;
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'col',
  spacing = 4,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  ...props
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  const gapClasses: Record<StackSpacing, string> = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
    16: 'gap-16',
    // Custom aliases from design system (DESIGN.md)
    xs: 'gap-1', // 4px
    sm: 'gap-3', // 12px
    md: 'gap-4', // 16px
    lg: 'gap-6', // 24px
    xl: 'gap-8', // 32px
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  return (
    <div
      className={cn(
        'flex',
        directionClasses[direction],
        gapClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Stack.displayName = 'Stack';
export default Stack;
