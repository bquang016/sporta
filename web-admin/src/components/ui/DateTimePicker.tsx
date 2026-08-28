import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Input } from './Input';
import type { InputProps } from './Input';
import { cn } from '../../utils/cn';

export interface DateTimePickerProps extends Omit<InputProps, 'type' | 'prefixIcon' | 'onChange'> {
  value: string; // YYYY-MM-DDTHH:mm
  onChange?: (e: { target: { value: string } }) => void;
  direction?: 'up' | 'down' | 'auto';
}

export const DateTimePicker = React.forwardRef<HTMLInputElement, DateTimePickerProps>(
  ({ className, value, onChange, labelClassName, direction = 'auto', ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const [calculatedDirection, setCalculatedDirection] = useState<'up' | 'down'>('down');

    // Initial parsing
    const initialDate = value ? new Date(value) : new Date();
    const [currentYear, setCurrentYear] = useState(() => isNaN(initialDate.getTime()) ? new Date().getFullYear() : initialDate.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(() => isNaN(initialDate.getTime()) ? new Date().getMonth() : initialDate.getMonth());
    
    const [selectedDate, setSelectedDate] = useState<string>(() => {
      if (!value) return '';
      return value.includes('T') ? value.split('T')[0] : value;
    });

    const [selectedHour, setSelectedHour] = useState<string>(() => {
      if (!value) return '00';
      if (value.includes('T')) {
        const timePart = value.split('T')[1];
        return timePart.split(':')[0];
      }
      return '00';
    });

    const [selectedMinute, setSelectedMinute] = useState<string>(() => {
      if (!value) return '00';
      if (value.includes('T')) {
        const timePart = value.split('T')[1];
        return timePart.split(':')[1] || '00';
      }
      return '00';
    });

    const [view, setView] = useState<'date' | 'time'>('date');

    useEffect(() => {
      if (value) {
        if (value.includes('T')) {
          const [datePart, timePart] = value.split('T');
          setSelectedDate(datePart);
          const [h, m] = timePart.split(':');
          setSelectedHour(h || '00');
          setSelectedMinute(m || '00');
          
          const d = new Date(datePart);
          if (!isNaN(d.getTime())) {
            setCurrentYear(d.getFullYear());
            setCurrentMonth(d.getMonth());
          }
        } else {
          setSelectedDate(value);
        }
      }
    }, [value]);

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

    useEffect(() => {
      if (isOpen && direction === 'auto' && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow < 350 && rect.top > 350) {
          setCalculatedDirection('up');
        } else {
          setCalculatedDirection('down');
        }
      } else if (direction !== 'auto') {
        setCalculatedDirection(direction);
      }
    }, [isOpen, direction]);

    const getDisplayValue = () => {
      if (!selectedDate) return '';
      const dateParts = selectedDate.split('-');
      const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : selectedDate;
      if (selectedHour && selectedMinute) {
        return `${formattedDate} ${selectedHour}:${selectedMinute}`;
      }
      return formattedDate;
    };

    const triggerChange = (date: string, hour: string, minute: string) => {
      if (!date) return;
      const newValue = `${date}T${hour}:${minute}`;
      if (onChange) {
        onChange({ target: { value: newValue } } as any);
      }
    };

    const handleSelectDay = (dateStr: string) => {
      setSelectedDate(dateStr);
      triggerChange(dateStr, selectedHour, selectedMinute);
      setView('time');
    };

    const handleHourSelect = (h: string) => {
      // Allow single digit for manual entry, pad with 0
      const formattedH = h.length === 1 ? `0${h}` : h;
      setSelectedHour(formattedH);
      triggerChange(selectedDate, formattedH, selectedMinute);
    };

    const handleMinuteSelect = (m: string) => {
      const formattedM = m.length === 1 ? `0${m}` : m;
      setSelectedMinute(formattedM);
      triggerChange(selectedDate, selectedHour, formattedM);
    };

    // Calendar logic
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
      const day = new Date(y, m, 1).getDay();
      return day === 0 ? 6 : day - 1; 
    };

    const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayIdx = getFirstDayOfMonth(currentYear, currentMonth);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    const daysCells = [];
    for (let i = firstDayIdx - 1; i >= 0; i--) {
      daysCells.push({ day: daysInPrevMonth - i, month: prevMonth, year: prevYear, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      daysCells.push({ day: d, month: currentMonth, year: currentYear, isCurrentMonth: true });
    }
    const remaining = 42 - daysCells.length;
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    for (let d = 1; d <= remaining; d++) {
      daysCells.push({ day: d, month: nextMonth, year: nextYear, isCurrentMonth: false });
    }

    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')); // Steps of 5 mins

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
          <div 
            ref={popupRef}
            className={cn(
              "absolute left-0 right-0 sm:right-auto z-50 w-full sm:w-[320px] bg-white border border-slate-200/80 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-4 select-none font-sans",
              calculatedDirection === 'up' ? "bottom-full mb-1.5" : "mt-1.5"
            )}
          >
            
            {/* View Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setView('date')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-colors",
                  view === 'date' ? "bg-white text-brand-emerald shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <CalendarIcon className="w-3.5 h-3.5" /> Ngày
              </button>
              <button
                type="button"
                onClick={() => setView('time')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-colors",
                  view === 'time' ? "bg-white text-brand-emerald shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Clock className="w-3.5 h-3.5" /> Giờ
              </button>
            </div>

            {view === 'date' && (
              <div className="animate-fadeIn">
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
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                    <span key={day} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {day}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {daysCells.map((cell, idx) => {
                    const mm = String(cell.month + 1).padStart(2, '0');
                    const dd = String(cell.day).padStart(2, '0');
                    const dateStr = `${cell.year}-${mm}-${dd}`;
                    const isSelected = dateStr === selectedDate;
                    
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectDay(dateStr)}
                        className={cn(
                          "aspect-square flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer",
                          cell.isCurrentMonth ? "text-slate-700" : "text-slate-350",
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

            {view === 'time' && (
              <div className="grid grid-cols-2 gap-2 animate-fadeIn h-[240px]">
                {/* Hours */}
                <div className="flex flex-col overflow-y-auto matrix-scroll pr-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-1.5 sticky top-0 bg-white z-10 border-b border-slate-100 mb-1">Giờ</span>
                  <div className="mb-2 px-1">
                    <input 
                      type="number" 
                      min={0} max={23} 
                      value={selectedHour}
                      onChange={(e) => {
                        let val = parseInt(e.target.value);
                        if (isNaN(val)) return;
                        if (val > 23) val = 23;
                        if (val < 0) val = 0;
                        handleHourSelect(val.toString());
                      }}
                      className="w-full text-center py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald"
                      placeholder="Nhập giờ"
                    />
                  </div>
                  {hours.map((h) => {
                    const isSelected = h === selectedHour;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleHourSelect(h)}
                        className={cn(
                          "py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex-shrink-0 mb-0.5",
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
                {/* Minutes */}
                <div className="flex flex-col overflow-y-auto matrix-scroll pl-1 border-l border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-1.5 sticky top-0 bg-white z-10 border-b border-slate-100 mb-1">Phút</span>
                  <div className="mb-2 px-1">
                    <input 
                      type="number" 
                      min={0} max={59} 
                      value={selectedMinute}
                      onChange={(e) => {
                        let val = parseInt(e.target.value);
                        if (isNaN(val)) return;
                        if (val > 59) val = 59;
                        if (val < 0) val = 0;
                        handleMinuteSelect(val.toString());
                      }}
                      className="w-full text-center py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald"
                      placeholder="Nhập phút"
                    />
                  </div>
                  {minutes.map((m) => {
                    const isSelected = m === selectedMinute;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleMinuteSelect(m)}
                        className={cn(
                          "py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex-shrink-0 mb-0.5",
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
            
            {view === 'time' && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Xong
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

DateTimePicker.displayName = 'DateTimePicker';
export default DateTimePicker;
