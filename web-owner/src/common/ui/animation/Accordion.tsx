import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultActiveIds?: string[];
  activeIds?: string[];
  onChange?: (activeIds: string[]) => void;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultActiveIds = [],
  activeIds: controlledActiveIds,
  onChange,
  className,
  ...props
}) => {
  const [localActiveIds, setLocalActiveIds] = useState<string[]>(defaultActiveIds);

  const isControlled = controlledActiveIds !== undefined;
  const currentActiveIds = isControlled ? controlledActiveIds : localActiveIds;

  const handleToggle = (itemId: string) => {
    let nextActiveIds: string[];

    if (allowMultiple) {
      nextActiveIds = currentActiveIds.includes(itemId)
        ? currentActiveIds.filter((id) => id !== itemId)
        : [...currentActiveIds, itemId];
    } else {
      nextActiveIds = currentActiveIds.includes(itemId) ? [] : [itemId];
    }

    if (!isControlled) {
      setLocalActiveIds(nextActiveIds);
    }
    onChange?.(nextActiveIds);
  };

  return (
    <div
      className={cn('divide-y divide-slate-100 border border-slate-100 bg-white rounded-3xl overflow-hidden font-sans select-none shadow-sm', className)}
      {...props}
    >
      {items.map((item) => {
        const isOpen = currentActiveIds.includes(item.id);
        const isDisabled = item.disabled;

        return (
          <div key={item.id} className={cn('flex flex-col w-full', isOpen && 'bg-slate-50/10')}>
            {/* Header Trigger */}
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => handleToggle(item.id)}
              className={cn(
                'flex items-center justify-between w-full px-6 py-4.5 text-left font-black uppercase text-xs tracking-wider text-slate-700 transition-colors focus:outline-none',
                isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50/40'
              )}
            >
              <span>{item.title}</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-slate-400 stroke-[2.5] transition-transform duration-250 ease-out',
                  isOpen && 'transform rotate-180 text-brand-emerald'
                )}
              />
            </button>

            {/* Collapsible Panel */}
            <div
              className={cn(
                'transition-all duration-350 ease-out overflow-hidden',
                isOpen ? 'max-h-[1000px] border-t border-slate-100/60' : 'max-h-0'
              )}
            >
              <div className="px-6 py-5 text-sm font-semibold text-slate-600 leading-relaxed bg-white">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

Accordion.displayName = 'Accordion';
export default Accordion;
