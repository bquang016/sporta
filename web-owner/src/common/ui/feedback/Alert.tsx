import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { cn } from '../utils';

export type AlertVariant = 'success' | 'warning' | 'info' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  onClose,
  className,
  ...props
}) => {
  const variantConfigs = {
    success: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-250',
      iconColor: 'text-brand-emerald',
      icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 text-amber-900 border-amber-250',
      iconColor: 'text-amber-600',
      icon: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    },
    info: {
      bg: 'bg-sky-50 text-sky-850 border-sky-250',
      iconColor: 'text-sky-600',
      icon: <Info className="w-5 h-5 flex-shrink-0" />,
    },
    error: {
      bg: 'bg-red-50 text-red-800 border-red-250',
      iconColor: 'text-red-600',
      icon: <XCircle className="w-5 h-5 flex-shrink-0" />,
    },
  };

  const config = variantConfigs[variant];

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3.5 p-4 border rounded-2xl font-sans text-xs font-semibold leading-relaxed shadow-sm animate-fadeIn',
        config.bg,
        className
      )}
      {...props}
    >
      <div className={config.iconColor}>{config.icon}</div>
      <div className="flex-1 space-y-1">
        {title && (
          <h5 className="font-black text-slate-800 leading-snug uppercase tracking-wide">
            {title}
          </h5>
        )}
        <div className="text-slate-600">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-650 transition-colors p-0.5 hover:bg-black/5 rounded-md focus:outline-none"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

Alert.displayName = 'Alert';
export default Alert;
