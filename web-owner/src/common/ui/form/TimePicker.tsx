import React from 'react';
import { Clock } from 'lucide-react';
import { Input } from './Input';
import type { InputProps } from './Input';

export interface TimePickerProps extends Omit<InputProps, 'type' | 'prefixIcon'> {}

export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="time"
        prefixIcon={<Clock className="w-4 h-4 text-slate-400" />}
        className={className}
        {...props}
      />
    );
  }
);

TimePicker.displayName = 'TimePicker';
export default TimePicker;
