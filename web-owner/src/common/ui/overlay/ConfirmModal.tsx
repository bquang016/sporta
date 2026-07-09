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
      icon: <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />,
    },
    danger: {
      bg: 'bg-red-50 text-red-650 border-red-100',
      icon: <Trash2 className="w-8 h-8 stroke-[2.5]" />,
    },
    warning: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      icon: <AlertTriangle className="w-8 h-8 stroke-[2.5]" />,
    },
    logout: {
      bg: 'bg-red-50 text-red-650 border-red-100',
      icon: <LogOut className="w-8 h-8 stroke-[2.5]" />,
    },
  };

  const currentIcon = iconConfig[variant];

  const footer = (
    <div className="flex gap-3 w-full">
      <Button
        variant="outline"
        onClick={onClose}
        className="flex-1 font-bold text-xs min-h-[38px] border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        {cancelText}
      </Button>
      <Button
        variant={
          variant === 'success'
            ? 'secondary'
            : variant === 'danger' || variant === 'logout'
            ? 'danger'
            : 'primary'
        }
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className="flex-1 font-black text-xs min-h-[38px] uppercase tracking-wider"
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm" footer={footer}>
      <div className="flex flex-col items-center text-center py-4 space-y-4 select-none">
        {/* Icon Container */}
        <div
          className={`w-16 h-16 rounded-3xl border flex items-center justify-center ${currentIcon.bg} shadow-sm select-none`}
        >
          {currentIcon.icon}
        </div>
        <p className="text-xs text-slate-550 font-bold leading-relaxed max-w-xs">{message}</p>
      </div>
    </Modal>
  );
};

ConfirmModal.displayName = 'ConfirmModal';
export default ConfirmModal;
