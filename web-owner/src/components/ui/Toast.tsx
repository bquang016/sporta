import React, { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE TOAST ITEM (internal)
// ─────────────────────────────────────────────────────────────────────────────

interface SingleToastProps {
  item: ToastItem;
  onDismiss: (id: string) => void;
  index: number;
}

const SingleToast = ({ item, onDismiss, index }: SingleToastProps) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Trigger enter animation
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });

    // Progress bar countdown
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / item.duration) * 100);
      setProgress(remaining);
    }, 50);

    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, item.duration);

    return () => {
      cancelAnimationFrame(frame);
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(item.id), 280);
  };

  const bgMap: Record<ToastType, string> = {
    success: 'bg-emerald-500 border-emerald-400/30 shadow-emerald-500/20',
    error:   'bg-red-500 border-red-400/30 shadow-red-500/20',
    warning: 'bg-amber-500 border-amber-400/30 shadow-amber-500/20',
    info:    'bg-sky-500 border-sky-400/30 shadow-sky-500/20',
  };

  const progressMap: Record<ToastType, string> = {
    success: 'bg-white/40',
    error:   'bg-white/40',
    warning: 'bg-white/40',
    info:    'bg-white/40',
  };

  const IconSuccess = () => (
    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );

  const IconError = () => (
    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const IconWarning = () => (
    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );

  const IconInfo = () => (
    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const icons: Record<ToastType, React.ReactNode> = {
    success: <IconSuccess />,
    error:   <IconError />,
    warning: <IconWarning />,
    info:    <IconInfo />,
  };

  const translateY = leaving
    ? 'translate-y-[-16px] opacity-0'
    : visible
    ? 'translate-y-0 opacity-100'
    : 'translate-y-4 opacity-0';

  return (
    <div
      className={`
        relative overflow-hidden min-w-[280px] max-w-[360px]
        border rounded-2xl shadow-xl backdrop-blur-md
        flex items-start gap-3 select-none
        transition-all duration-300 ease-out
        ${bgMap[item.type]}
        ${translateY}
      `}
      style={{ transitionDelay: visible ? '0ms' : `${index * 40}ms` }}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          className={`h-full ${progressMap[item.type]} transition-none`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start gap-3 p-4 pr-3 w-full">
        {/* Icon */}
        <span className="flex-shrink-0 bg-white/15 rounded-lg p-1.5 flex items-center justify-center mt-0.5">
          {icons[item.type]}
        </span>

        {/* Message */}
        <span className="flex-1 text-[11px] font-black tracking-tight leading-relaxed text-white uppercase">
          {item.message}
        </span>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/15 active:bg-white/25 transition-all text-white/70 hover:text-white mt-0.5 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TOAST PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => {
      // Max 4 visible at a time (remove oldest if exceeded)
      const next = [...prev, { id, message, type, duration }];
      return next.length > 4 ? next.slice(next.length - 4) : next;
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none"
        >
          {toasts.map((item, index) => (
            <div key={item.id} className="pointer-events-auto">
              <SingleToast
                item={item}
                onDismiss={dismissToast}
                index={index}
              />
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback for components used outside ToastProvider (backward compat)
    return {
      showToast: (type, message) => console.warn(`[Toast] ${type}: ${message}`),
      dismissToast: () => {},
    };
  }
  return ctx;
};

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY STANDALONE TOAST (backward compatible - used via direct render)
// ─────────────────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose?: () => void;
  duration?: number;
}

export const Toast = ({ message, type = 'success', onClose, duration = 4000 }: ToastProps) => {
  useEffect(() => {
    if (!duration || !onClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgMap: Record<ToastType, string> = {
    success: 'bg-emerald-500/90 border-emerald-400/30 shadow-emerald-500/10',
    error:   'bg-red-500/90 border-red-400/30 shadow-red-500/10',
    warning: 'bg-amber-500/90 border-amber-400/30 shadow-amber-500/10',
    info:    'bg-sky-500/90 border-sky-400/30 shadow-sky-500/10',
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md flex items-center gap-3 select-none animate-fadeIn ${bgMap[type]}`}
      style={{ animationDuration: '300ms' }}
    >
      <span className="flex-shrink-0 bg-white/10 rounded-lg p-1.5 flex items-center justify-center">
        {type === 'success' ? (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : type === 'warning' ? (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : type === 'info' ? (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </span>
      <span className="text-[11px] font-black tracking-tight leading-normal uppercase text-white">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded-lg hover:bg-white/10 active:bg-white/20 transition-all text-white/70 hover:text-white cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
