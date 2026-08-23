import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ConfirmModal } from '../ui/Modal/ConfirmModal';

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
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

interface AlertExtraOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  confirmText?: string;
}

interface ConfirmExtraOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

interface AlertContextType {
  showAlert: (
    title: string,
    message: string,
    onConfirm?: () => void,
    options?: AlertExtraOptions
  ) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string,
    options?: ConfirmExtraOptions
  ) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [alertData, setAlertData] = useState<AlertOptions>({ title: '', message: '' });

  const getSmartIcon = (opts: AlertOptions): { icon: keyof typeof MaterialIcons.glyphMap; color: string } => {
    if (opts.icon && opts.iconColor) {
      return { icon: opts.icon, color: opts.iconColor };
    }
    const t = opts.type;
    const lowerTitle = (opts.title || '').toLowerCase();

    if (t === 'success' || lowerTitle.includes('thành công') || lowerTitle.includes('hoàn tất')) {
      return { icon: 'check-circle', color: '#10B981' };
    }
    if (
      t === 'error' ||
      lowerTitle.includes('lỗi') ||
      lowerTitle.includes('thất bại') ||
      lowerTitle.includes('không thể') ||
      lowerTitle.includes('hết hạn') ||
      lowerTitle.includes('cần cấp quyền')
    ) {
      return { icon: 'error-outline', color: '#EF4444' };
    }
    if (
      t === 'warning' ||
      lowerTitle.includes('cảnh báo') ||
      lowerTitle.includes('chú ý') ||
      lowerTitle.includes('lưu ý') ||
      lowerTitle.includes('chưa đến')
    ) {
      return { icon: 'warning-amber', color: '#F59E0B' };
    }
    if (opts.isConfirm) {
      return { icon: 'help-outline', color: '#064E3B' };
    }
    return { icon: 'info-outline', color: '#064E3B' };
  };

  const showAlert = (
    title: string,
    message: string,
    onConfirm?: () => void,
    options?: AlertExtraOptions
  ) => {
    setAlertData({
      title,
      message,
      onConfirm,
      isConfirm: false,
      confirmText: options?.confirmText || 'Đóng',
      type: options?.type,
      icon: options?.icon,
      iconColor: options?.iconColor,
      confirmVariant: 'primary',
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
    options?: ConfirmExtraOptions
  ) => {
    setAlertData({
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      isConfirm: true,
      type: options?.type,
      icon: options?.icon,
      iconColor: options?.iconColor,
      confirmVariant: options?.confirmVariant || 'primary',
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

  const { icon, color } = getSmartIcon(alertData);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <ConfirmModal
        visible={visible}
        title={alertData.title}
        message={alertData.message}
        onConfirm={handleConfirm}
        onCancel={alertData.isConfirm ? handleCancel : undefined}
        confirmText={alertData.confirmText || 'Đóng'}
        cancelText={alertData.cancelText}
        confirmVariant={alertData.confirmVariant || 'primary'}
        icon={icon}
        iconColor={color}
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