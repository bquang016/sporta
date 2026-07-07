import React from 'react';
import { cn } from '../utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'line' | 'pill';
  fullWidth?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  fullWidth = false,
  className,
  ...props
}) => {
  const isLine = variant === 'line';

  return (
    <div
      className={cn(
        'flex border-slate-100 font-sans w-full select-none overflow-x-auto matrix-scroll',
        isLine ? 'border-b' : '',
        className
      )}
      {...props}
    >
      <div
        role="tablist"
        aria-orientation="horizontal"
        className={cn(
          'flex min-w-full',
          fullWidth ? 'justify-between' : 'justify-start gap-1',
          !isLine ? 'p-1 bg-slate-50 border border-slate-200/50 rounded-2xl' : ''
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const isDisabled = tab.disabled;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange(tab.id)}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-200 focus:outline-none whitespace-nowrap',
                fullWidth ? 'flex-1' : '',
                isDisabled && 'opacity-40 cursor-not-allowed',

                // Line styles
                isLine && isActive
                  ? 'text-brand-emerald border-b-2 border-brand-emerald scale-[1.01]'
                  : isLine && !isActive
                  ? 'text-slate-400 border-b-2 border-transparent hover:text-slate-600'
                  : '',

                // Pill styles
                !isLine && isActive
                  ? 'bg-brand-emerald text-white rounded-xl shadow-sm'
                  : !isLine && !isActive
                  ? 'text-slate-550 rounded-xl hover:bg-slate-100/50'
                  : ''
              )}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

Tabs.displayName = 'Tabs';
export default Tabs;
