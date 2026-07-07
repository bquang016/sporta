import React from 'react';
import { cn } from '../utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className,
  style,
  ...props
}) => {
  const isCircular = variant === 'circular';
  const isText = variant === 'text';

  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200/80',
        isCircular ? 'rounded-full' : isText ? 'rounded-md h-3 w-3/4 my-1.5' : 'rounded-2xl',
        className
      )}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
        ...style,
      }}
      {...props}
    />
  );
};

Skeleton.displayName = 'Skeleton';
export default Skeleton;
