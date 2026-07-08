import React from 'react';
import { cn } from '../utils';
import type { StackSpacing } from './Stack';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  spacing?: StackSpacing;
  inline?: boolean;
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  wrap = 'nowrap',
  spacing = 0,
  inline = false,
  className,
  ...props
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
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

  const wrapClasses = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse',
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
    xs: 'gap-1',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  return (
    <div
      className={cn(
        inline ? 'inline-flex' : 'flex',
        directionClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        wrapClasses[wrap],
        spacing ? gapClasses[spacing] : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Flex.displayName = 'Flex';
export default Flex;
