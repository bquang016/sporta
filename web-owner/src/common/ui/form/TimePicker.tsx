import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Input } from './Input';
import type { InputProps } from './Input';
import { cn } from '../utils';

export interface TimePickerProps extends Omit<InputProps, 'type' | 'prefixIcon' | 'onChange'> {
  value: string; // HH:MM
  onChange?: (e: { target: { value: string } }) => void;
}

export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const hourContainerRef = useRef<HTMLDivElement>(null);
    const minuteContainerRef = useRef<HTMLDivElement>(null);

    const [selectedHour, setSelectedHour] = useState('08');
    const [selectedMinute, setSelectedMinute] = useState('00');

    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

    useEffect(() => {
      if (value && value.includes(':')) {
        const [h, m] = value.split(':');
        setSelectedHour(h || '08');
        setSelectedMinute(m || '00');
      }
    }, [value]);

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Scroll active items into view when opened
    useEffect(() => {
      if (isOpen) {
        setTimeout(() => {
          if (hourContainerRef.current) {
            const active = hourContainerRef.current.querySelector('[data-selected="true"]');
            active?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
          }
          if (minuteContainerRef.current) {
            const active = minuteContainerRef.current.querySelector('[data-selected="true"]');
            active?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
          }
        }, 10);
      }
    }, [isOpen]);

    const handleHourSelect = (h: string) => {
      setSelectedHour(h);
      const newValue = `${h}:${selectedMinute}`;
      if (onChange) {
        onChange({ target: { value: newValue } } as any);
      }
    };

    const handleMinuteSelect = (m: string) => {
      setSelectedMinute(m);
      const newValue = `${selectedHour}:${m}`;
      if (onChange) {
        onChange({ target: { value: newValue } } as any);
      }
    };

    return (
      <div className="relative w-full" ref={containerRef}>
        <Input
          ref={ref}
          readOnly
          value={value || ''}
          onClick={() => setIsOpen(prev => !prev)}
          prefixIcon={<Clock className="w-4 h-4 text-slate-400" />}
          className={cn("cursor-pointer bg-slate-50", className)}
          inputClassName="cursor-pointer"
          {...props}
        />
        {isOpen && (
          <div className="absolute left-0 z-50 mt-1.5 w-44 bg-white border border-slate-200/80 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-2 grid grid-cols-2 gap-1 font-sans">
            {/* Hours Column */}
            <div 
              ref={hourContainerRef}
              className="flex flex-col max-h-48 overflow-y-auto matrix-scroll pr-1 scroll-smooth"
            >
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center py-1 sticky top-0 bg-white z-10">Giờ</span>
              {hours.map((h) => {
                const isSelected = h === selectedHour;
                return (
                  <button
                    key={h}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => handleHourSelect(h)}
                    className={cn(
                      "py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center flex-shrink-0",
                      isSelected
                        ? "bg-brand-emerald text-white font-black shadow-[0_2px_8px_rgba(6,78,59,0.15)]"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            {/* Minutes Column */}
            <div 
              ref={minuteContainerRef}
              className="flex flex-col max-h-48 overflow-y-auto matrix-scroll pl-1 border-l border-slate-100 scroll-smooth"
            >
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center py-1 sticky top-0 bg-white z-10">Phút</span>
              {minutes.map((m) => {
                const isSelected = m === selectedMinute;
                return (
                  <button
                    key={m}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => handleMinuteSelect(m)}
                    className={cn(
                      "py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center flex-shrink-0",
                      isSelected
                        ? "bg-brand-emerald text-white font-black shadow-[0_2px_8px_rgba(6,78,59,0.15)]"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

TimePicker.displayName = 'TimePicker';
export default TimePicker;
