import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Input } from './Input';
import type { InputProps } from './Input';
import { IconButton } from './IconButton';

export interface SearchInputProps extends Omit<InputProps, 'prefixIcon' | 'suffixIcon'> {
  onClear?: () => void;
  onFilterClick?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, onFilterClick, className, inputClassName, ...props }, ref) => {
    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    const prefix = <Search className="w-4 h-4 text-slate-400" />;

    const suffix = (
      <div className="flex items-center gap-1">
        {hasValue && onClear && (
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onClear}
            aria-label="Xóa tìm kiếm"
            className="text-slate-400 hover:text-slate-650 p-1 w-7 h-7"
          >
            <X className="w-3.5 h-3.5" />
          </IconButton>
        )}
        {onFilterClick && (
          <IconButton
            variant="secondary"
            size="sm"
            onClick={onFilterClick}
            aria-label="Bộ lọc"
            className="bg-brand-emerald text-white hover:bg-emerald-800 p-1.5 w-8 h-8 rounded-full border-none shadow-sm -mr-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </IconButton>
        )}
      </div>
    );

    return (
      <Input
        ref={ref}
        value={value}
        onChange={onChange}
        prefixIcon={prefix}
        suffixIcon={suffix}
        inputClassName={cn(
          'rounded-full bg-white hover:bg-slate-50 border-slate-200 focus:border-brand-emerald focus:bg-white focus:ring-brand-emerald',
          onFilterClick && 'pr-13',
          inputClassName
        )}
        className={className}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
export default SearchInput;
