import React, { useEffect, useState } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
}

export const CurrencyInput = ({
  value,
  onChange,
  className = '',
  ...props
}: CurrencyInputProps) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format value to thousand dotted string
  const formatNumber = (num: number): string => {
    if (num === 0) return '';
    if (isNaN(num)) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parse dotted string to number
  const parseNumber = (str: string): number => {
    const cleanStr = str.replace(/\./g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : num;
  };

  // Sync state with parent value
  useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    
    // Only allow digits and dots
    const cleanVal = rawVal.replace(/[^0-9.]/g, '');
    
    // Parse numeric value
    const numericVal = parseNumber(cleanVal);
    
    // Update local state formatting
    setDisplayValue(formatNumber(numericVal));
    
    // Call parent handler
    onChange(numericVal);
  };

  return (
    <div className="relative flex items-center w-full">
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        className={`w-full text-xs font-bold text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-emerald-100 pr-12 transition-all ${className}`}
        {...props}
      />
      <span className="absolute right-4 text-[9px] font-black text-slate-400 select-none pointer-events-none uppercase tracking-wider">
        VND
      </span>
    </div>
  );
};
