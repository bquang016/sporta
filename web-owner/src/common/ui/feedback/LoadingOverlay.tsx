import React from 'react';
import { cn } from '../utils';

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive: boolean;
  text?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isActive,
  text = 'Đang tải...',
  fullScreen = false,
  className,
  ...props
}) => {
  if (!isActive) return null;

  return (
    <div
      className={cn(
        'z-[90] flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] transition-all duration-300 font-sans select-none animate-fadeIn',
        fullScreen ? 'fixed inset-0 z-[110]' : 'absolute inset-0',
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center space-y-3">
        {/* Spinner animation */}
        <div className="w-10 h-10 border-4 border-slate-100 border-t-brand-emerald rounded-full animate-spin shadow-sm" />
        {text && (
          <span className="text-xs font-black tracking-widest text-brand-emerald uppercase">
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

LoadingOverlay.displayName = 'LoadingOverlay';
export default LoadingOverlay;
