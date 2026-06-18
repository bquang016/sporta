import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'success' | 'danger' | 'warning' | 'logout';
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'success'
}: ConfirmModalProps) => {
  
  const iconConfig = {
    success: {
      bg: 'bg-emerald-50 text-brand-emerald border-emerald-100',
      svg: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      ),
      confirmBtn: 'secondary' as const
    },
    danger: {
      bg: 'bg-red-50 text-red-600 border-red-100',
      svg: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      confirmBtn: 'primary' as const // Danger actions usually map to primary yellow CTA, but let's make it a red danger button if possible, or primary. Let's customize standard button styles.
    },
    warning: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      svg: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      confirmBtn: 'primary' as const
    },
    logout: {
      bg: 'bg-red-50 text-red-600 border-red-100',
      svg: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      confirmBtn: 'primary' as const
    }
  };

  const currentIcon = iconConfig[variant];

  const footer = (
    <div className="flex gap-2 w-full">
      <Button
        variant="ghost"
        onClick={onClose}
        className="flex-1"
      >
        {cancelText}
      </Button>
      <button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className={`flex-1 font-bold py-2.5 px-4 rounded-xl text-sm transition-all focus:outline-none ${
          variant === 'success' ? 'bg-brand-emerald hover:bg-emerald-800 text-white' :
          variant === 'danger' || variant === 'logout' ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm' :
          'bg-brand-yellow hover:bg-yellow-400 text-brand-emerald shadow-sm'
        }`}
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={footer}
    >
      <div className="flex flex-col items-center text-center py-2 space-y-4">
        {/* Icon container */}
        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${currentIcon.bg} shadow-sm`}>
          {currentIcon.svg}
        </div>
        <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-xs">{message}</p>
      </div>
    </Modal>
  );
};
