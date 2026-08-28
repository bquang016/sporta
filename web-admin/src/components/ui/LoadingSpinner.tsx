import logoSvg from '@/assets/logo/light/logo-main_40x40px_small.svg';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  fullScreen = false
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4'
  };

  const colorClasses = {
    primary: 'border-brand-emerald/20 border-t-brand-emerald',
    secondary: 'border-brand-yellow/20 border-t-brand-yellow',
    white: 'border-white/20 border-t-white'
  };

  const spinner = (
    <div 
      className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999] select-none pointer-events-auto">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            {/* Pulsing glow background */}
            <div className="absolute w-24 h-24 rounded-full bg-brand-emerald/10 animate-ping opacity-75" />
            <img 
              src={logoSvg} 
              alt="Sporta Logo" 
              className="w-20 h-20 object-contain relative z-10 animate-pulse" 
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-4 h-4 border-2 border-brand-emerald/20 border-t-brand-emerald rounded-full animate-spin" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Đang tải dữ liệu...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return spinner;
};
export default LoadingSpinner;
