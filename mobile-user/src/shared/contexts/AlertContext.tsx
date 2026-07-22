import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import { ConfirmModal } from '../ui/Modal/ConfirmModal';

interface AlertOptions {
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
}

interface AlertContextType {
  showAlert: (title: string, message: string, onConfirm?: () => void) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void, confirmText?: string, cancelText?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [alertData, setAlertData] = useState<AlertOptions>({ title: '', message: '' });

  const showAlert = (title: string, message: string, onConfirm?: () => void) => {
    setAlertData({ title, message, onConfirm, isConfirm: false, confirmText: 'Đóng' });
    setVisible(true);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, onCancel?: () => void, confirmText = 'Xác nhận', cancelText = 'Hủy') => {
    setAlertData({ title, message, onConfirm, onCancel, confirmText, cancelText, isConfirm: true });
    setVisible(true);
  };

  const handleConfirm = () => {
    setVisible(false);
    if (alertData.onConfirm) {
      alertData.onConfirm();
    }
  };

  const handleCancel = () => {
    setVisible(false);
    if (alertData.onCancel) {
      alertData.onCancel();
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <ConfirmModal
        visible={visible}
        title={alertData.title}
        message={alertData.message}
        onConfirm={handleConfirm}
        onCancel={alertData.isConfirm ? handleCancel : undefined}
        confirmText={alertData.confirmText || "Đóng"}
        cancelText={alertData.cancelText}
        icon={alertData.isConfirm ? "help-outline" : "info-outline"}
        iconColor="#064E3B"
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    // Fallback if AlertProvider is not mounted (e.g. Metro cache issues on root layout)
    return {
      showAlert: (title: string, message: string, onConfirm?: () => void) => {
        if (Platform.OS === 'web') {
          window.alert(`${title}\n${message}`);
          if (onConfirm) onConfirm();
        } else {
          Alert.alert(title, message, [{ text: 'Đóng', onPress: onConfirm }]);
        }
      },
      showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void, confirmText = 'Xác nhận', cancelText = 'Hủy') => {
        if (Platform.OS === 'web') {
          if (window.confirm(`${title}\n${message}`)) {
            onConfirm();
          } else if (onCancel) {
            onCancel();
          }
        } else {
          Alert.alert(title, message, [
            { text: cancelText, style: 'cancel', onPress: onCancel },
            { text: confirmText, onPress: onConfirm }
          ]);
        }
      }
    };
  }
  return context;
};
