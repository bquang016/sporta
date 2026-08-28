import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from './Input';
import type { InputProps } from './Input';
import { cn } from '../utils';

export interface DatePickerProps extends Omit<InputProps, 'type' | 'prefixIcon' | 'onChange'> {
  value: string; // YYYY-MM-DD
  onChange?: (e: { target: { value: string } }) => void;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, value, onChange, labelClassName, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [currentYear, setCurrentYear] = useState(() => {
      const d = value ? new Date(value) : new Date();
      return isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
    });
    const [currentMonth, setCurrentMonth] = useState(() => {
      const d = value ? new Date(value) : new Date();
      return isNaN(d.getTime()) ? new Date().getMonth() : d.getMonth();
    });

    useEffect(() => {
      if (value) {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          setCurrentYear(d.getFullYear());
          setCurrentMonth(d.getMonth());
        }
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

    const getDisplayValue = () => {
      if (!value) return '';
      const parts = value.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return value;
    };

    const handlePrevMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
    };

    const handleNextMonth = () => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
    };

    const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y: number, m: number) => {
      const day = new Date(y, m, 1).getDay(); // 0 is Sunday, 1 is Monday...
      return day === 0 ? 6 : day - 1; // Align Mon = 0, Sun = 6
    };

    const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayIdx = getFirstDayOfMonth(currentYear, currentMonth);

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    const daysCells = [];

    // Prev month padding
    for (let i = firstDayIdx - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      daysCells.push({
        day: d,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      daysCells.push({
        day: d,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
      });
    }

    // Next month padding to keep it at 42 cells (6 rows)
    const remaining = 42 - daysCells.length;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    for (let d = 1; d <= remaining; d++) {
      daysCells.push({
        day: d,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
    }

    const handleSelectDay = (cell: { day: number; month: number; year: number }) => {
      const mm = String(cell.month + 1).padStart(2, '0');
      const dd = String(cell.day).padStart(2, '0');
      const dateStr = `${cell.year}-${mm}-${dd}`;
      if (onChange) {
        onChange({ target: { value: dateStr } } as any);
      }
      setIsOpen(false);
    };

    return (
      <div className="relative w-full" ref={containerRef}>
        <Input
          ref={ref}
          readOnly
          value={getDisplayValue()}
          onClick={() => setIsOpen(prev => !prev)}
          prefixIcon={<CalendarIcon className="w-4 h-4 text-slate-400" />}
          className={cn("cursor-pointer bg-slate-50", className)}
          inputClassName="cursor-pointer"
          labelClassName={labelClassName}
          {...props}
        />
        {isOpen && (
          <div className="absolute left-0 right-0 sm:right-auto z-50 mt-1.5 w-full sm:w-[280px] bg-white border border-slate-200/80 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-4 select-none font-sans">
            {/* Header */}
            <div className="flex items-center justify-between mb-3.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border border-slate-100"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Tháng {currentMonth + 1}, {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border border-slate-100"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                <span key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {day}
                </span>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {daysCells.map((cell, idx) => {
                const mm = String(cell.month + 1).padStart(2, '0');
                const dd = String(cell.day).padStart(2, '0');
                const dateStr = `${cell.year}-${mm}-${dd}`;
                const isSelected = dateStr === value;
                const isToday = (() => {
                  const today = new Date();
                  return today.getDate() === cell.day && today.getMonth() === cell.month && today.getFullYear() === cell.year;
                })();

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDay(cell)}
                    className={cn(
                      "aspect-square flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer",
                      cell.isCurrentMonth ? "text-slate-700" : "text-slate-350",
                      isToday && !isSelected && "border border-brand-emerald text-brand-emerald bg-emerald-50/20",
                      isSelected
                        ? "bg-brand-emerald text-white font-black shadow-[0_4px_12px_rgba(6,78,59,0.15)]"
                        : "hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {cell.day}
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

DatePicker.displayName = 'DatePicker';
export default DatePicker;
