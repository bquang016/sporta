import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (checked: boolean) => void;
  label?: string;
  labelClassName?: string;
}

export const Checkbox = ({
  checked,
  onChange,
  disabled = false,
  className = '',
  label,
  labelClassName = '',
  id,
  ...props
}: CheckboxProps) => {
  const generatedId = id || `checkbox_${Math.random().toString(36).substring(2, 9)}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <label className={`inline-flex items-center gap-2 select-none cursor-pointer ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`}>
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          id={generatedId}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        {/* Custom Visual Checkbox Box */}
        <div
          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shadow-sm
            peer-focus-visible:ring-2 peer-focus-visible:ring-brand-emerald/30
            ${
              disabled
                ? 'bg-slate-100 border-slate-200 text-slate-300'
                : checked
                ? 'bg-brand-emerald border-brand-emerald text-white hover:bg-emerald-800 hover:border-emerald-800'
                : 'bg-white border-slate-300 text-transparent hover:border-slate-400'
            }`}
        >
          <svg
            className={`w-2.5 h-2.5 stroke-current transition-transform duration-200 ${
              checked ? 'scale-100' : 'scale-0'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      {label && (
        <span
          className={`text-slate-700 ${labelClassName}`}
        >
          {label}
        </span>
      )}
    </label>
  );
};
