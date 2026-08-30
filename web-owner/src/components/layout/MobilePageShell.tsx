import React from 'react';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────
// MobileHeader — Sticky header với safe-area iOS
// ─────────────────────────────────────────────────────────────
interface MobileHeaderProps {
  title: string;
  /** Hiện nút Back (←). Mặc định: true */
  showBack?: boolean;
  /** Override hành động Back (mặc định: navigate(-1)) */
  onBack?: () => void;
  /** Slot cho icon/button bên phải header */
  rightAction?: React.ReactNode;
  /** Variant màu sắc */
  variant?: 'white' | 'emerald' | 'transparent';
  /** Subtitle bên dưới title (optional) */
  subtitle?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = true,
  onBack,
  rightAction,
  variant = 'white',
  subtitle,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const bgClass = {
    white:       'bg-white/95 backdrop-blur-[20px] border-b border-surface-variant/60 shadow-[0_1px_12px_rgba(0,0,0,0.04)]',
    emerald:     'bg-brand-emerald',
    transparent: 'bg-transparent',
  }[variant];

  const textClass = variant === 'emerald' ? 'text-white' : 'text-on-surface';
  const subTextClass = variant === 'emerald' ? 'text-white/60' : 'text-outline';
  const iconClass = variant === 'emerald'
    ? 'text-white hover:bg-white/10 active:bg-white/20'
    : 'text-on-surface hover:bg-surface-container active:bg-surface-container-high';

  return (
    <header
      className={`sticky top-0 z-40 ${bgClass}`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center h-14 px-2 gap-1">
        {/* Back Button */}
        {showBack && (
          <button
            onClick={handleBack}
            aria-label="Quay lại"
            className={`touch-target rounded-xl transition-colors ${iconClass}`}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Title + Subtitle */}
        <div className="flex-1 min-w-0 px-1">
          <h1 className={`text-base font-black tracking-tight truncate ${textClass}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-[11px] font-medium truncate ${subTextClass}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Action Slot */}
        {rightAction && (
          <div className="flex items-center">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────────────────────
// MobilePageShell — Full page wrapper dùng chung cho mobile pages
// ─────────────────────────────────────────────────────────────
interface MobilePageShellProps {
  /** Nếu truyền title, sẽ tự render MobileHeader */
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  headerVariant?: 'white' | 'emerald' | 'transparent';
  /** Nếu true: không add horizontal padding (dùng cho full-bleed content) */
  noPadding?: boolean;
  children: React.ReactNode;
  /** Nếu truyền customHeader, sẽ bỏ qua title/showBack/... */
  customHeader?: React.ReactNode;
  /** Extra classes cho content wrapper */
  contentClassName?: string;
}

export const MobilePageShell: React.FC<MobilePageShellProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightAction,
  headerVariant = 'white',
  noPadding = false,
  children,
  customHeader,
  contentClassName = '',
}) => {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {/* Header */}
      {customHeader ?? (
        title && (
          <MobileHeader
            title={title}
            subtitle={subtitle}
            showBack={showBack}
            onBack={onBack}
            rightAction={rightAction}
            variant={headerVariant}
          />
        )
      )}

      {/* Scrollable Content */}
      <main
        className={`flex-1 ${noPadding ? '' : 'px-4'} ${contentClassName}`}
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {children}
      </main>
    </div>
  );
};
