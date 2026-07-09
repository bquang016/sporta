import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../utils';
import { Input } from './Input';
import type { InputProps } from './Input';
import { IconButton } from '../buttons/IconButton';

export interface NumberInputProps extends Omit<InputProps, 'type' | 'prefixIcon' | 'suffixIcon'> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onNumberChange?: (val: number) => void;
  showControls?: boolean;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onNumberChange,
      min,
      max,
      step = 1,
      showControls = true,
      disabled,
      className,
      inputClassName,
      ...props
    },
    ref
  ) => {
    const currentValue = value !== undefined ? value : 0;

    const handleStep = (direction: 'up' | 'down') => {
      if (disabled) return;
      let nextValue = direction === 'up' ? currentValue + step : currentValue - step;

      if (min !== undefined && nextValue < min) {
        nextValue = min;
      }
      if (max !== undefined && nextValue > max) {
        nextValue = max;
      }

      onNumberChange?.(nextValue);
    };

    const prefix = showControls && (
      <IconButton
        variant="ghost"
        size="sm"
        disabled={disabled || (min !== undefined && currentValue <= min)}
        onClick={() => handleStep('down')}
        aria-label="Decrease value"
        className="w-7 h-7 hover:bg-slate-100 rounded-lg text-slate-500"
      >
        <Minus className="w-3.5 h-3.5" />
      </IconButton>
    );

    const suffix = showControls && (
      <IconButton
        variant="ghost"
        size="sm"
        disabled={disabled || (max !== undefined && currentValue >= max)}
        onClick={() => handleStep('up')}
        aria-label="Increase value"
        className="w-7 h-7 hover:bg-slate-100 rounded-lg text-slate-500"
      >
        <Plus className="w-3.5 h-3.5" />
      </IconButton>
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        onNumberChange?.(val);
      }
    };

    return (
      <Input
        ref={ref}
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        prefixIcon={prefix}
        suffixIcon={suffix}
        inputClassName={cn(
          'text-center appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          showControls && 'px-11',
          inputClassName
        )}
        className={className}
        min={min}
        max={max}
        step={step}
        {...props}
      />
    );
  }
);

NumberInput.displayName = 'NumberInput';
export default NumberInput;
