import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  disabled?: boolean;
  direction?: 'down' | 'up';
}

export const Dropdown = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn một tùy chọn',
  className = '',
  menuClassName = '',
  disabled = false,
  direction = 'down'
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 border rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-all text-left focus:outline-none focus:ring-1 focus:ring-brand-emerald disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed ${
          isOpen ? 'border-brand-emerald ring-1 ring-brand-emerald' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <span className="text-slate-400 flex-shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute left-0 right-0 z-50 max-h-60 overflow-y-auto bg-white border border-slate-200/80 rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] matrix-scroll focus:outline-none ${
            direction === 'up' ? 'bottom-full mb-1.5' : 'mt-1.5'
          } ${menuClassName}`}
        >
          <div className="py-1">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center font-bold">Không có tùy chọn nào</div>
            ) : (
              options.map(option => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs text-left font-bold transition-colors ${
                      isSelected
                        ? 'bg-brand-emerald text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                    <span className="truncate flex-1">{option.label}</span>
                    {option.suffix && <span className="flex-shrink-0">{option.suffix}</span>}
                    {isSelected && (
                      <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
