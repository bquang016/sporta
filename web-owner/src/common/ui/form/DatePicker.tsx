import React from 'react';
import { Calendar } from 'lucide-react';
import { Input } from './Input';
import type { InputProps } from './Input';

export interface DatePickerProps extends Omit<InputProps, 'type' | 'prefixIcon'> {}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="date"
        prefixIcon={<Calendar className="w-4 h-4 text-slate-400" />}
        className={className}
        {...props}
      />
    );
  }
);

DatePicker.displayName = 'DatePicker';
export default DatePicker;
