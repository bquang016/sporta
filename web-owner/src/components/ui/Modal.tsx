import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '3/4';
  footer?: React.ReactNode;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  footer
}: ModalProps) => {
  // Disable body scroll when modal is open
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

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    '3/4': 'max-w-[75vw] w-11/12',
  };

  const modalRoot = document.body;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div 
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-3xl shadow-[0_24px_48px_rgba(0,0,0,0.16)] z-10 border border-slate-100/80 flex flex-col max-h-[85vh] overflow-hidden transition-all duration-300 scale-100`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald"></span>
            {title || 'Thông báo'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors font-bold p-1 rounded-lg hover:bg-slate-50 focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1 matrix-scroll">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    modalRoot
  );
};
