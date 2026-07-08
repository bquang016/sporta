import React from 'react';
import { CheckCircle2, AlertTriangle, Trash2, LogOut } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '../buttons/Button';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'success' | 'danger' | 'warning' | 'logout';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'success',
}) => {
  const iconConfig = {
    success: {
      bg: 'bg-emerald-50 text-brand-emerald border-emerald-100',
      icon: <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />,
    },
    danger: {
      bg: 'bg-red-50 text-red-600 border-red-100',
      icon: <Trash2 className="w-6 h-6 stroke-[2.5]" />,
    },
    warning: {
      bg: 'bg-amber-50 text-amber-650 border-amber-100',
      icon: <AlertTriangle className="w-6 h-6 stroke-[2.5]" />,
    },
    logout: {
      bg: 'bg-red-50 text-red-600 border-red-100',
      icon: <LogOut className="w-6 h-6 stroke-[2.5]" />,
    },
  };

  const currentIcon = iconConfig[variant];

  const footer = (
    <div className="flex gap-3 w-full">
      <Button variant="ghost" onClick={onClose} className="flex-1">
        {cancelText}
      </Button>
      <button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className={`flex-1 font-sans font-black py-2.5 px-4 rounded-xl text-sm transition-all focus:outline-none cursor-pointer active:scale-95 duration-200 shadow-sm ${
          variant === 'success'
            ? 'bg-brand-emerald hover:bg-emerald-800 text-white'
            : variant === 'danger' || variant === 'logout'
            ? 'bg-red-650 hover:bg-red-750 text-white'
            : 'bg-brand-yellow hover:bg-yellow-400 text-brand-emerald border border-brand-yellow/30'
        }`}
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm" footer={footer}>
      <div className="flex flex-col items-center text-center py-2.5 space-y-4">
        {/* Icon Container */}
        <div
          className={`w-13 h-13 rounded-2xl border flex items-center justify-center ${currentIcon.bg} shadow-sm select-none`}
        >
          {currentIcon.icon}
        </div>
        <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-xs">{message}</p>
      </div>
    </Modal>
  );
};

ConfirmModal.displayName = 'ConfirmModal';
export default ConfirmModal;
