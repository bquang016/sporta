import React from 'react';
import { cn } from '../utils';

export interface KeyValueProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  inline?: boolean;
}

export const KeyValue: React.FC<KeyValueProps> = ({
  label,
  value,
  inline = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'font-sans text-xs font-semibold',
        inline ? 'flex items-center justify-between gap-3' : 'flex flex-col gap-0.5',
        className
      )}
      {...props}
    >
      <span className="text-slate-450 uppercase font-black tracking-wider leading-none">
        {label}
      </span>
      <span className="text-slate-800 font-bold leading-normal">
        {value}
      </span>
    </div>
  );
};

KeyValue.displayName = 'KeyValue';
export default KeyValue;
