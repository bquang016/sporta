import React from 'react';
import { ConfirmModal } from './Modal/ConfirmModal';

export interface CustomConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const CustomConfirmModal = React.memo(({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
}: CustomConfirmModalProps) => {
  return (
    <ConfirmModal
      visible={visible}
      title={title}
      message={message}
      type={type}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
});

export default CustomConfirmModal;
