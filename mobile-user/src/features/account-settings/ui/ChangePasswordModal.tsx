import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import { ConfirmModal } from '../../../shared/ui/Modal/ConfirmModal';
import { changePasswordApi } from '../../../shared/api/auth';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const insets = useSafeAreaInsets();
  const modalTopPadding = Platform.OS === 'ios' ? (insets.top > 0 ? insets.top : 47) : insets.top;

  const [saving, setSaving] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [oldPasswordError, setOldPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  // Friendly Warning Modal State
  const [warningModal, setWarningModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    iconColor: string;
    confirmText?: string;
  }>({
    visible: false,
    title: '',
    message: '',
    icon: 'warning',
    iconColor: '#F59E0B',
    confirmText: 'Đã hiểu',
  });

  const showFriendlyModal = (
    title: string,
    message: string,
    icon: keyof typeof MaterialIcons.glyphMap = 'warning',
    iconColor: string = '#F59E0B',
    confirmText: string = 'Đã hiểu'
  ) => {
    setWarningModal({
      visible: true,
      title,
      message,
      icon,
      iconColor,
      confirmText,
    });
  };

  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const criteriaMetCount = [hasMinLength, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  const getPasswordStrength = () => {
    if (!newPassword) return { label: '', color: COLORS.outlineVariant, percent: 0 };
    if (criteriaMetCount === 1) return { label: 'Yếu', color: '#EF4444', percent: 0.25 };
    if (criteriaMetCount === 2) return { label: 'Trung bình', color: '#F59E0B', percent: 0.5 };
    if (criteriaMetCount === 3) return { label: 'Khá', color: '#10B981', percent: 0.75 };
    if (criteriaMetCount === 4) return { label: 'Rất mạnh', color: COLORS.primary, percent: 1.0 };
    return { label: 'Yếu', color: '#EF4444', percent: 0.15 };
  };

  const strength = getPasswordStrength();

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setOldPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);
    setWarningModal(prev => ({ ...prev, visible: false }));
    onClose();
  };

  const handleChangePassword = async () => {
    setOldPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);

    let hasEmpty = false;
    if (!oldPassword.trim()) {
      setOldPasswordError('Vui lòng nhập mật khẩu hiện tại');
      hasEmpty = true;
    }
    if (!newPassword.trim()) {
      setNewPasswordError('Vui lòng nhập mật khẩu mới');
      hasEmpty = true;
    }
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Vui lòng nhập lại mật khẩu mới để xác nhận');
      hasEmpty = true;
    }

    if (hasEmpty) {
      showFriendlyModal('Thiếu thông tin', 'Vui lòng nhập đầy đủ các ô mật khẩu còn thiếu (đã báo đỏ).', 'info-outline', '#3B82F6', 'Nhập lại');
      return;
    }

    if (newPassword.length < 8) {
      setNewPasswordError('Mật khẩu mới phải có tối thiểu 8 ký tự');
      showFriendlyModal('Mật khẩu chưa đủ dài', 'Mật khẩu mới phải có tối thiểu 8 ký tự theo quy định bảo mật.', 'warning', '#F59E0B', 'Nhập lại');
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Xác nhận mật khẩu mới không trùng khớp');
      showFriendlyModal('Mật khẩu không khớp', 'Xác nhận mật khẩu mới không trùng khớp với mật khẩu mới đã nhập. Vui lòng kiểm tra và nhập lại chính xác!', 'warning', '#F59E0B', 'Thử lại');
      return;
    }

    setSaving(true);
    try {
      await changePasswordApi(oldPassword, newPassword, confirmPassword);
      showFriendlyModal(
        'Thành công',
        'Mật khẩu của bạn đã được thay đổi và cập nhật thành công!',
        'check-circle',
        COLORS.primary,
        'Hoàn tất'
      );
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.includes('hiện tại không chính xác') || errMsg.includes('mật khẩu hiện tại') || errMsg.includes('currentPassword')) {
        setOldPasswordError('Mật khẩu hiện tại không chính xác');
        showFriendlyModal('Sai mật khẩu hiện tại', 'Mật khẩu hiện tại bạn nhập không chính xác. Vui lòng kiểm tra lại mật khẩu cũ của bạn!', 'lock-reset', COLORS.error, 'Nhập lại');
      } else {
        showFriendlyModal('Đổi mật khẩu thất bại', errMsg || 'Không thể thay đổi mật khẩu lúc này. Vui lòng thử lại sau.', 'error-outline', COLORS.error, 'Đóng');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={[styles.modalHeaderSafeArea, { paddingTop: modalTopPadding }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.modalHeaderIconBtn}
          >
            <MaterialIcons name="close" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>Đổi Mật Khẩu</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <SafeAreaView style={styles.modalContainer} edges={['bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
          {/* 1. Mật khẩu hiện tại */}
          <Text style={[styles.inputLabel, !!oldPasswordError && styles.inputLabelError]}>
            Mật khẩu hiện tại (*)
          </Text>
          <View style={[styles.passwordInputContainer, !!oldPasswordError && styles.passwordInputContainerError]}>
            <TextInput
              style={styles.passwordTextInput}
              secureTextEntry={!showOldPassword}
              value={oldPassword}
              onChangeText={(val) => {
                setOldPassword(val);
                if (oldPasswordError) setOldPasswordError(null);
              }}
              placeholder="Nhập mật khẩu hiện tại"
              placeholderTextColor={COLORS.onSurfaceVariant}
            />
            <TouchableOpacity
              style={styles.eyeIconBtn}
              onPress={() => setShowOldPassword(!showOldPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name={showOldPassword ? 'visibility' : 'visibility-off'}
                size={22}
                color={oldPasswordError ? COLORS.error : COLORS.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
          {!!oldPasswordError && (
            <View style={styles.errorTextRow}>
              <MaterialIcons name="error-outline" size={14} color={COLORS.error} />
              <Text style={styles.errorText}>{oldPasswordError}</Text>
            </View>
          )}

          {/* 2. Mật khẩu mới */}
          <Text style={[styles.inputLabel, !!newPasswordError && styles.inputLabelError]}>
            Mật khẩu mới (*)
          </Text>
          <View style={[styles.passwordInputContainer, !!newPasswordError && styles.passwordInputContainerError]}>
            <TextInput
              style={styles.passwordTextInput}
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={(val) => {
                setNewPassword(val);
                if (newPasswordError) setNewPasswordError(null);
              }}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor={COLORS.onSurfaceVariant}
            />
            <TouchableOpacity
              style={styles.eyeIconBtn}
              onPress={() => setShowNewPassword(!showNewPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name={showNewPassword ? 'visibility' : 'visibility-off'}
                size={22}
                color={newPasswordError ? COLORS.error : COLORS.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
          {!!newPasswordError && (
            <View style={styles.errorTextRow}>
              <MaterialIcons name="error-outline" size={14} color={COLORS.error} />
              <Text style={styles.errorText}>{newPasswordError}</Text>
            </View>
          )}

          {/* 3. Thanh đo độ mạnh mật khẩu (Password Strength Bar) */}
          {newPassword.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthHeaderRow}>
                <Text style={styles.strengthTextLabel}>Độ mạnh mật khẩu:</Text>
                <Text style={[styles.strengthTextValue, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
              <View style={styles.strengthTrack}>
                <View
                  style={[
                    styles.strengthFill,
                    {
                      width: `${strength.percent * 100}%`,
                      backgroundColor: strength.color
                    }
                  ]}
                />
              </View>
            </View>
          )}

          {/* 4. Danh sách gợi ý điều kiện mật khẩu */}
          <View style={styles.criteriaContainer}>
            <Text style={styles.criteriaTitle}>Gợi ý điều kiện mật khẩu an toàn:</Text>

            <View style={styles.criteriaItem}>
              <MaterialIcons
                name={hasMinLength ? 'check-circle' : 'radio-button-unchecked'}
                size={18}
                color={hasMinLength ? '#10B981' : COLORS.onSurfaceVariant}
              />
              <Text style={[styles.criteriaText, hasMinLength && styles.criteriaTextMet]}>
                Tối thiểu 8 ký tự
              </Text>
            </View>

            <View style={styles.criteriaItem}>
              <MaterialIcons
                name={hasUpperCase ? 'check-circle' : 'radio-button-unchecked'}
                size={18}
                color={hasUpperCase ? '#10B981' : COLORS.onSurfaceVariant}
              />
              <Text style={[styles.criteriaText, hasUpperCase && styles.criteriaTextMet]}>
                Có ít nhất 1 chữ cái viết hoa (A-Z)
              </Text>
            </View>

            <View style={styles.criteriaItem}>
              <MaterialIcons
                name={hasNumber ? 'check-circle' : 'radio-button-unchecked'}
                size={18}
                color={hasNumber ? '#10B981' : COLORS.onSurfaceVariant}
              />
              <Text style={[styles.criteriaText, hasNumber && styles.criteriaTextMet]}>
                Có ít nhất 1 chữ số (0-9)
              </Text>
            </View>

            <View style={styles.criteriaItem}>
              <MaterialIcons
                name={hasSpecialChar ? 'check-circle' : 'radio-button-unchecked'}
                size={18}
                color={hasSpecialChar ? '#10B981' : COLORS.onSurfaceVariant}
              />
              <Text style={[styles.criteriaText, hasSpecialChar && styles.criteriaTextMet]}>
                Có ít nhất 1 ký tự đặc biệt (!@#$%...)
              </Text>
            </View>
          </View>

          {/* 5. Xác nhận mật khẩu mới */}
          <Text style={[styles.inputLabel, !!confirmPasswordError && styles.inputLabelError]}>
            Xác nhận mật khẩu mới (*)
          </Text>
          <View style={[styles.passwordInputContainer, !!confirmPasswordError && styles.passwordInputContainerError]}>
            <TextInput
              style={styles.passwordTextInput}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={(val) => {
                setConfirmPassword(val);
                if (confirmPasswordError) setConfirmPasswordError(null);
              }}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor={COLORS.onSurfaceVariant}
            />
            <TouchableOpacity
              style={styles.eyeIconBtn}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons
                name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                size={22}
                color={confirmPasswordError ? COLORS.error : COLORS.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
          {!!confirmPasswordError && (
            <View style={styles.errorTextRow}>
              <MaterialIcons name="error-outline" size={14} color={COLORS.error} />
              <Text style={styles.errorText}>{confirmPasswordError}</Text>
            </View>
          )}

          <Button
            title={saving ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
            variant="primary"
            disabled={saving}
            style={{ marginTop: SPACING.xl }}
            onPress={handleChangePassword}
          />
        </ScrollView>

        {/* Alert Overlay inside Change Password Modal */}
        <ConfirmModal
          visible={warningModal.visible}
          title={warningModal.title}
          message={warningModal.message}
          confirmText={warningModal.confirmText || 'Đóng'}
          confirmVariant="primary"
          icon={warningModal.icon}
          iconColor={warningModal.iconColor}
          useViewOverlay={true}
          onConfirm={() => {
            const isSuccess = warningModal.title === 'Thành công';
            setWarningModal((prev) => ({ ...prev, visible: false }));
            if (isSuccess) {
              handleClose();
            }
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeaderSafeArea: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderIconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
  },
  modalHeaderTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalScroll: {
    padding: SPACING.marginMobile,
  },
  inputLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  inputLabelError: {
    color: COLORS.error,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  passwordInputContainerError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  passwordTextInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
  },
  eyeIconBtn: {
    padding: SPACING.xs,
  },
  errorTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  errorText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.error,
  },
  strengthContainer: {
    marginTop: SPACING.md,
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  strengthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  strengthTextLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  strengthTextValue: {
    ...TYPOGRAPHY.labelMd,
  },
  strengthTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  criteriaContainer: {
    marginTop: SPACING.sm,
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  criteriaTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  criteriaText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  criteriaTextMet: {
    color: '#065F46',
    fontWeight: '500',
  },
});
