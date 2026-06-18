import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
}

export const Card = ({ children, elevated = false, className = '', ...props }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden ${elevated ? 'shadow-[0_8px_24px_rgba(6,78,59,0.08)]' : 'border border-surface-variant'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};