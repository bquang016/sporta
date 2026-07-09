import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../utils';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: DrawerPosition;
  size?: DrawerSize;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  position = 'right',
  size = 'md',
  title,
  children,
  footer,
  className,
}) => {
  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'left-0 top-0 h-full border-r animate-slide-in-left';
      case 'right':
        return 'right-0 top-0 h-full border-l animate-slide-in-right';
      case 'top':
        return 'top-0 left-0 w-full border-b animate-slide-in-top';
      case 'bottom':
        return 'bottom-0 left-0 w-full border-t animate-slide-in-bottom';
    }
  };

  const getSizeClasses = () => {
    const isVertical = position === 'left' || position === 'right';

    if (isVertical) {
      switch (size) {
        case 'sm':
          return 'w-full max-w-xs';
        case 'md':
          return 'w-full max-w-md';
        case 'lg':
          return 'w-full max-w-lg';
        case 'xl':
          return 'w-full max-w-xl';
        case 'full':
          return 'w-screen h-screen';
      }
    } else {
      switch (size) {
        case 'sm':
          return 'h-[30vh]';
        case 'md':
          return 'h-[50vh]';
        case 'lg':
          return 'h-[70vh]';
        case 'xl':
          return 'h-[85vh]';
        case 'full':
          return 'w-screen h-screen';
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex font-sans overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed bg-white shadow-2xl flex flex-col z-10 border-slate-100/80 transition-transform duration-300 ease-out focus:outline-none',
          getPositionClasses(),
          getSizeClasses(),
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 flex-shrink-0">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-emerald"></span>
            {title || 'Danh mục'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors font-bold p-1 rounded-lg hover:bg-slate-50 focus:outline-none"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable contents */}
        <div className="flex-1 overflow-y-auto px-6 py-5 matrix-scroll">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-150 bg-slate-50/50 flex justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

Drawer.displayName = 'Drawer';
export default Drawer;
