import React from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '3/4';
  footer?: React.ReactNode;
  zIndex?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  footer,
  zIndex = 'z-[99999]'
}: ModalProps) => {
  useBodyScrollLock(isOpen);

  if (!isOpen || typeof document === 'undefined') return null;

  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
    '5xl': 'sm:max-w-5xl',
    '6xl': 'sm:max-w-6xl',
    '7xl': 'sm:max-w-7xl',
    '3/4': 'sm:max-w-[75vw] sm:w-11/12',
  };

  const modalRoot = document.body;

  return createPortal(
    <div className={`fixed inset-0 ${zIndex} flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans select-none`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fadeIn" 
        onClick={onClose} 
      />

      {/* Modal Card / Mobile Bottom Sheet */}
      <div 
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-t-[2.25rem] sm:rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.22)] z-10 border border-slate-100 flex flex-col max-h-[90dvh] sm:max-h-[85vh] overflow-hidden transition-all duration-300 animate-slideUp sm:animate-scaleUp`}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Mobile Pull / Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex justify-between items-center px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-2 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald shrink-0" />
            <span className="truncate">{title || 'Thông báo'}</span>
          </h3>
          <button 
            type="button"
            onClick={onClose} 
            className="touch-target w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors font-bold flex items-center justify-center text-xs shrink-0 active:scale-95"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1 matrix-scroll">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-2.5 sm:gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    modalRoot
  );
};
