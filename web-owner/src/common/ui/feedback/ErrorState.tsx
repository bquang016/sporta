import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../utils';
import { Button } from '../buttons/Button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: React.ReactNode;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Đã xảy ra lỗi',
  message = 'Không thể tải dữ liệu. Vui lòng kiểm tra kết nối mạng và thử lại.',
  onRetry,
  retryText = 'Thử lại',
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 min-h-[300px] border border-red-100 bg-red-50/10 rounded-3xl font-sans',
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center max-w-sm space-y-4">
        {/* Warning Icon Container */}
        <div className="w-13 h-13 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shadow-sm select-none">
          <AlertCircle className="w-6 h-6 stroke-[2.5]" />
        </div>

        {/* Text descriptions */}
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">
            {title}
          </h3>
          {message && (
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              {message}
            </p>
          )}
        </div>

        {/* Action Button */}
        {onRetry && (
          <div className="pt-2 select-none">
            <Button variant="danger" size="sm" onClick={onRetry}>
              {retryText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

ErrorState.displayName = 'ErrorState';
export default ErrorState;
