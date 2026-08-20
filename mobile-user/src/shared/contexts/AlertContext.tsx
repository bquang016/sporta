import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import { ConfirmModal } from '../ui/Modal/ConfirmModal';
import { MaterialIcons } from '@expo/vector-icons';

interface AlertOptions {
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

interface AlertContextType {
  showAlert: (
    title: string, 
    message: string, 
    onConfirm?: () => void,
    options?: {
      icon?: keyof typeof MaterialIcons.glyphMap;
      iconColor?: string;
      confirmText?: string;
    }
  ) => void;
  showConfirm: (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void, 
    confirmText?: string, 
    cancelText?: string,
    options?: {
      icon?: keyof typeof MaterialIcons.glyphMap;
      iconColor?: string;
      confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    }
  ) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

const getAutoIconConfig = (title: string, isConfirm?: boolean) => {
  const lowerTitle = (title || '').toLowerCase();
  if (lowerTitle.includes('lỗi') || lowerTitle.includes('thất bại') || lowerTitle.includes('error') || lowerTitle.includes('cần cấp quyền')) {
    return { icon: 'error-outline' as const, iconColor: '#DC2626' };
  }
  if (lowerTitle.includes('cảnh báo') || lowerTitle.includes('chú ý') || lowerTitle.includes('warning')) {
    return { icon: 'warning-amber' as const, iconColor: '#F59E0B' };
  }
  if (lowerTitle.includes('thành công') || lowerTitle.includes('hoàn tất') || lowerTitle.includes('success')) {
    return { icon: 'check-circle-outline' as const, iconColor: '#059669' };
  }
  if (isConfirm) {
    return { icon: 'help-outline' as const, iconColor: '#064E3B' };
  }
  return { icon: 'info-outline' as const, iconColor: '#064E3B' };
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [alertData, setAlertData] = useState<AlertOptions>({ title: '', message: '' });

  const showAlert = (
    title: string, 
    message: string, 
    onConfirm?: () => void,
    options?: {
      icon?: keyof typeof MaterialIcons.glyphMap;
      iconColor?: string;
      confirmText?: string;
    }
  ) => {
    const autoCfg = getAutoIconConfig(title, false);
    setAlertData({ 
      title, 
      message, 
      onConfirm, 
      isConfirm: false, 
      confirmText: options?.confirmText || 'Đóng',
      icon: options?.icon || autoCfg.icon,
      iconColor: options?.iconColor || autoCfg.iconColor,
      confirmVariant: 'primary'
    });
    setVisible(true);
  };

  const showConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void, 
    confirmText = 'Xác nhận', 
    cancelText = 'Hủy',
    options?: {
      icon?: keyof typeof MaterialIcons.glyphMap;
      iconColor?: string;
      confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    }
  ) => {
    const autoCfg = getAutoIconConfig(title, true);
    setAlertData({ 
      title, 
      message, 
      onConfirm, 
      onCancel, 
      confirmText, 
      cancelText, 
      isConfirm: true,
      icon: options?.icon || autoCfg.icon,
      iconColor: options?.iconColor || autoCfg.iconColor,
      confirmVariant: options?.confirmVariant || 'primary'
    });
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
        confirmVariant={alertData.confirmVariant || 'primary'}
        icon={alertData.icon}
        iconColor={alertData.iconColor}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    // Fallback if AlertProvider is not mounted
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

