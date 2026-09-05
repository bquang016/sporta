import { useState, useEffect } from 'react';
import { usersApi } from '../../../shared/api/users';
import { useAlert } from '../../../shared/contexts/AlertContext';
import { COLORS } from '../../../shared/config/theme';

export function useAccountSettings() {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);

  // Notification Toggles State
  const [notifBooking, setNotifBooking] = useState(true);
  const [notifPromo, setNotifPromo] = useState(true);
  const [notifMatchmake, setNotifMatchmake] = useState(true);

  // Security & Account Toggles State
  const [enableBiometrics, setEnableBiometrics] = useState(true);

  // Privacy Toggle State
  const [privateMode, setPrivateMode] = useState(false);

  // Modals State
  const [isChangePasswordModal, setIsChangePasswordModal] = useState(false);
  const [isDeleteConfirmModal, setIsDeleteConfirmModal] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getProfile();
      if (data) {
        setNotifBooking(data.notifBooking ?? true);
        setNotifPromo(data.notifPromo ?? true);
        setNotifMatchmake(data.notifMatchmake ?? true);
        setEnableBiometrics(data.enableBiometrics ?? true);
        setPrivateMode(data.privateMode ?? false);
      }
    } catch (err: any) {
      console.warn('Lỗi tải thông tin cá nhân từ CSDL:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleToggleSetting = async (key: string, value: boolean) => {
    try {
      await usersApi.updateProfile({ [key]: value });
    } catch (err: any) {
      showAlert('Không thể lưu cài đặt lúc này, vui lòng thử lại sau', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await usersApi.deleteAccount();
      // Sau khi xoá thành công, gọi globalEvent để logout
      const { globalEvent } = require('../../../shared/lib/eventEmitter');
      globalEvent.emit('auth:expired');
    } catch (err: any) {
      showAlert('Không thể xóa tài khoản lúc này. Vui lòng thử lại.', 'error');
    }
  };

  return {
    loading,
    notifBooking,
    notifPromo,
    notifMatchmake,
    enableBiometrics,
    privateMode,
    isChangePasswordModal,
    isDeleteConfirmModal,
    setIsChangePasswordModal,
    setIsDeleteConfirmModal,
    setNotifBooking,
    setNotifPromo,
    setNotifMatchmake,
    setEnableBiometrics,
    setPrivateMode,
    handleToggleSetting,
    handleDeleteAccount,
  };
}
