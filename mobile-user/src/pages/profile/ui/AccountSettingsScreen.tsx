import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import { CalendarPicker } from '../../../shared/ui/CalendarPicker/CalendarPicker';
import { ConfirmModal } from '../../../shared/ui/Modal/ConfirmModal';
import { ProvincePickerModal, ProvinceItem } from '../../create-club/ui/components/ProvincePickerModal';
import { usersApi } from '../../../shared/api/users';
import { changePasswordApi } from '../../../shared/api/auth';
import { useAlert } from '../../../shared/contexts/AlertContext';

import { SecurityGroup } from './components/settings/SecurityGroup';
import { NotificationGroup } from './components/settings/NotificationGroup';
import { PrivacyDangerGroup } from './components/settings/PrivacyDangerGroup';

export function AccountSettingsScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();

  // Loading & Saving state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Real Profile Info State
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [dob, setDob] = useState<string>(''); // YYYY-MM-DD
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | string>('MALE');
  const [defaultAddress, setDefaultAddress] = useState<string>('');

  // Notification Toggles State
  const [notifBooking, setNotifBooking] = useState(true);
  const [notifPromo, setNotifPromo] = useState(true);
  const [notifMatchmake, setNotifMatchmake] = useState(true);

  // Security & Account Toggles State
  const [linkGoogle, setLinkGoogle] = useState(true);
  const [linkFacebook, setLinkFacebook] = useState(true);
  const [linkApple, setLinkApple] = useState(false);
  const [enableBiometrics, setEnableBiometrics] = useState(true);

  // Privacy Toggle State
  const [privateMode, setPrivateMode] = useState(false);

  // Modals State
  const [isEditProfileModal, setIsEditProfileModal] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isChangePasswordModal, setIsChangePasswordModal] = useState(false);
  const [isDeleteConfirmModal, setIsDeleteConfirmModal] = useState(false);

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

  // Provinces API State
  const [provinces, setProvinces] = useState<ProvinceItem[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [isProvinceModalVisible, setIsProvinceModalVisible] = useState(false);

  // Form Inputs for Password Change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch Real User Profile from Database
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getProfile();
      if (data) {
        setFullName(data.fullName || '');
        setEmail(data.email || '');
        setPhone(data.phoneNumber || '');
        setAvatarUri(data.avatarUrl || null);
        setGender(data.gender || 'MALE');
        setDob(data.dateOfBirth ? String(data.dateOfBirth) : '');
        setDefaultAddress(data.location || '');

        setNotifBooking(data.notifBooking ?? true);
        setNotifPromo(data.notifPromo ?? true);
        setNotifMatchmake(data.notifMatchmake ?? true);
        setLinkGoogle(data.linkGoogle ?? true);
        setLinkFacebook(data.linkFacebook ?? true);
        setLinkApple(data.linkApple ?? false);
        setEnableBiometrics(data.enableBiometrics ?? true);
        setPrivateMode(data.privateMode ?? false);
      }
    } catch (err: any) {
      console.warn('Lỗi tải thông tin cá nhân từ CSDL:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Provinces API
  const fetchProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const response = await fetch('https://provinces.open-api.vn/api/v2/p/');
      if (response.ok) {
        const data = await response.json();
        setProvinces(data);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách tỉnh thành:', err);
    } finally {
      setLoadingProvinces(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchProvinces();
  }, []);

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

  // Instant Setting Switch Toggle Persistence to DB
  const handleToggleSetting = async (key: string, value: boolean) => {
    try {
      await usersApi.updateProfile({ [key]: value });
    } catch (err: any) {
      showFriendlyModal('Không thể lưu', 'Không thể cập nhật cài đặt vào CSDL lúc này.', 'error-outline', COLORS.error, 'Thử lại');
    }
  };

  // Upload Avatar & Save URL to Database
  const handlePickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showFriendlyModal('Cần cấp quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh để đổi ảnh đại diện.', 'info-outline', '#3B82F6');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        setAvatarUri(selectedUri);
        
        setSaving(true);
        try {
          const updated = await usersApi.updateProfile({}, selectedUri);
          if (updated && updated.avatarUrl) {
            setAvatarUri(updated.avatarUrl);
          }
          showFriendlyModal('Thành công', 'Đã tải lên và lưu ảnh đại diện mới vào CSDL thành công!', 'check-circle', COLORS.primary, 'Tuyệt vời');
        } catch (apiErr: any) {
          showFriendlyModal('Lỗi tải ảnh', apiErr.message || 'Không thể lưu ảnh đại diện vào CSDL.', 'error-outline', COLORS.error, 'Đóng');
        } finally {
          setSaving(false);
        }
      }
    } catch (err) {
      console.error('Error picking avatar:', err);
    }
  };

  // Save Full Profile Changes into MySQL Database
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await usersApi.updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phone.trim(),
        gender: gender as any,
        dateOfBirth: dob.trim(),
        location: defaultAddress.trim(),
      });

      if (updated) {
        setFullName(updated.fullName || fullName);
        setPhone(updated.phoneNumber || phone);
        setGender(updated.gender || gender);
        setDob(updated.dateOfBirth ? String(updated.dateOfBirth) : dob);
        setDefaultAddress(updated.location || defaultAddress);
        if (updated.avatarUrl) setAvatarUri(updated.avatarUrl);
      }

      setIsEditProfileModal(false);
      showFriendlyModal('Thành công', 'Đã cập nhật và lưu toàn bộ thông tin cá nhân vào CSDL thành công!', 'check-circle', COLORS.primary, 'Tuyệt vời');
    } catch (err: any) {
      showFriendlyModal('Lưu thất bại', err.message || 'Cập nhật thông tin thất bại.', 'error-outline', COLORS.error, 'Thử lại');
    } finally {
      setSaving(false);
    }
  };

  // Real Password Change via Auth API
  const handleChangePassword = async () => {
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showFriendlyModal('Thiếu thông tin', 'Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới.', 'info-outline', '#3B82F6', 'Nhập lại');
      return;
    }

    if (newPassword !== confirmPassword) {
      showFriendlyModal('Mật khẩu không khớp', 'Xác nhận mật khẩu mới không trùng khớp với mật khẩu mới đã nhập. Vui lòng kiểm tra và nhập lại chính xác!', 'warning', '#F59E0B', 'Thử lại');
      return;
    }

    setSaving(true);
    try {
      await changePasswordApi(oldPassword, newPassword, confirmPassword);
      setIsChangePasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showFriendlyModal('Thành công', 'Mật khẩu của bạn đã được thay đổi và cập nhật trong CSDL thành công!', 'check-circle', COLORS.primary, 'Hoàn tất');
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.includes('hiện tại không chính xác') || errMsg.includes('mật khẩu hiện tại') || errMsg.includes('currentPassword')) {
        showFriendlyModal('Sai mật khẩu hiện tại', 'Mật khẩu hiện tại bạn nhập không chính xác. Vui lòng kiểm tra lại mật khẩu cũ của bạn!', 'lock-reset', COLORS.error, 'Nhập lại');
      } else {
        showFriendlyModal('Đổi mật khẩu thất bại', errMsg || 'Không thể thay đổi mật khẩu lúc này. Vui lòng thử lại sau.', 'error-outline', COLORS.error, 'Đóng');
      }
    } finally {
      setSaving(false);
    }
  };

  const getGenderLabel = (g: string) => {
    if (g === 'FEMALE' || g === 'Nữ') return 'Nữ';
    if (g === 'OTHER' || g === 'Khác') return 'Khác';
    return 'Nam';
  };

  const formatDisplayDob = (d: string) => {
    if (!d) return 'Chưa cập nhật';
    if (d.includes('-')) {
      const parts = d.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return d;
  };

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải cài đặt tài khoản từ CSDL...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cài Đặt Tài Khoản</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Security & Accounts Group Sub-component */}
        <SecurityGroup
          enableBiometrics={enableBiometrics}
          linkGoogle={linkGoogle}
          linkFacebook={linkFacebook}
          linkApple={linkApple}
          onOpenChangePasswordModal={() => setIsChangePasswordModal(true)}
          onToggleBiometrics={(val) => { setEnableBiometrics(val); handleToggleSetting('enableBiometrics', val); }}
          onToggleGoogle={(val) => { setLinkGoogle(val); handleToggleSetting('linkGoogle', val); }}
          onToggleFacebook={(val) => { setLinkFacebook(val); handleToggleSetting('linkFacebook', val); }}
          onToggleApple={(val) => { setLinkApple(val); handleToggleSetting('linkApple', val); }}
        />

        {/* Section 3: Notification Settings Sub-component */}
        <NotificationGroup
          notifBooking={notifBooking}
          notifPromo={notifPromo}
          notifMatchmake={notifMatchmake}
          onToggleBooking={(val) => { setNotifBooking(val); handleToggleSetting('notifBooking', val); }}
          onTogglePromo={(val) => { setNotifPromo(val); handleToggleSetting('notifPromo', val); }}
          onToggleMatchmake={(val) => { setNotifMatchmake(val); handleToggleSetting('notifMatchmake', val); }}
        />

        {/* Section 4: Privacy & Danger Zone Sub-component */}
        <PrivacyDangerGroup
          privateMode={privateMode}
          onTogglePrivateMode={(val) => { setPrivateMode(val); handleToggleSetting('privateMode', val); }}
          onOpenDeleteModal={() => setIsDeleteConfirmModal(true)}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditProfileModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsEditProfileModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditProfileModal(false)}>
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Sửa Thông Tin Cá Nhân</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.modalHeaderSave}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.inputLabel}>Họ và tên</Text>
            <TextInput 
              style={styles.textInput} 
              value={fullName} 
              onChangeText={setFullName}
              placeholder="Nhập họ và tên" 
            />

            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <TextInput 
              style={styles.textInput} 
              value={phone} 
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Nhập số điện thoại" 
            />

            <Text style={styles.inputLabel}>Email (Cố định tài khoản)</Text>
            <TextInput 
              style={[styles.textInput, { backgroundColor: COLORS.surfaceContainerLow, color: COLORS.onSurfaceVariant }]} 
              value={email} 
              editable={false}
              placeholder="Email" 
            />

            <Text style={styles.inputLabel}>Giới tính</Text>
            <View style={styles.genderOptionsRow}>
              {[
                { key: 'MALE', label: '♂ Nam' },
                { key: 'FEMALE', label: '♀ Nữ' },
                { key: 'OTHER', label: '⚧ Khác' }
              ].map(item => {
                const isSelected = gender === item.key || (gender === 'Nam' && item.key === 'MALE') || (gender === 'Nữ' && item.key === 'FEMALE');
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.genderChip, isSelected && styles.genderChipSelected]}
                    activeOpacity={0.8}
                    onPress={() => setGender(item.key)}
                  >
                    <Text style={[styles.genderChipText, isSelected && styles.genderChipTextSelected]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Ngày sinh</Text>
            <TouchableOpacity 
              style={styles.datePickerTrigger}
              activeOpacity={0.8}
              onPress={() => setIsCalendarOpen(true)}
            >
              <MaterialIcons name="event" size={20} color={COLORS.primary} />
              <Text style={styles.datePickerTriggerText}>
                {dob ? formatDisplayDob(dob) : 'Chọn ngày sinh...'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Vị trí / Tỉnh Thành</Text>
            <TouchableOpacity 
              style={styles.datePickerTrigger}
              activeOpacity={0.8}
              onPress={() => setIsProvinceModalVisible(true)}
            >
              <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
              <Text style={styles.datePickerTriggerText} numberOfLines={1}>
                {defaultAddress || 'Chọn tỉnh thành / khu vực...'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>

            <Button
              title={saving ? "Đang lưu..." : "Lưu thay đổi"}
              variant="primary"
              disabled={saving}
              style={{ marginTop: SPACING.xl }}
              onPress={handleSaveProfile}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Calendar Picker Component Reused */}
      <CalendarPicker
        visible={isCalendarOpen}
        selectedDate={dob ? new Date(dob) : new Date(1995, 7, 15)}
        onConfirm={(date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          setDob(`${year}-${month}-${day}`);
        }}
        onClose={() => setIsCalendarOpen(false)}
      />

      {/* Province Picker Modal Component Reused */}
      <ProvincePickerModal
        visible={isProvinceModalVisible}
        onClose={() => setIsProvinceModalVisible(false)}
        provinces={provinces}
        loading={loadingProvinces}
        onSelectProvince={(name) => {
          setDefaultAddress(name);
        }}
      />

      {/* Change Password Modal */}
      <Modal
        visible={isChangePasswordModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsChangePasswordModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsChangePasswordModal(false)}>
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Đổi Mật Khẩu</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
            <TextInput 
              style={styles.textInput} 
              secureTextEntry
              value={oldPassword} 
              onChangeText={setOldPassword}
              placeholder="Nhập mật khẩu hiện tại" 
            />

            <Text style={styles.inputLabel}>Mật khẩu mới</Text>
            <TextInput 
              style={styles.textInput} 
              secureTextEntry
              value={newPassword} 
              onChangeText={setNewPassword}
              placeholder="Nhập mật khẩu mới" 
            />

            <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
            <TextInput 
              style={styles.textInput} 
              secureTextEntry
              value={confirmPassword} 
              onChangeText={setConfirmPassword}
              placeholder="Nhập lại mật khẩu mới" 
            />

            <Button
              title="Xác nhận đổi mật khẩu"
              variant="primary"
              style={{ marginTop: SPACING.xl }}
              onPress={handleChangePassword}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Confirm Modal Reused */}
      <ConfirmModal
        visible={isDeleteConfirmModal}
        title="Yêu cầu xóa tài khoản?"
        message="Hành động này sẽ gửi yêu cầu xóa vĩnh viễn tài khoản cá nhân khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục không?"
        confirmText="Xóa tài khoản"
        cancelText="Giữ tài khoản"
        confirmVariant="primary"
        icon="delete-forever"
        iconColor={COLORS.error}
        onConfirm={() => setIsDeleteConfirmModal(false)}
        onCancel={() => setIsDeleteConfirmModal(false)}
      />

      <ConfirmModal
        visible={warningModal.visible}
        title={warningModal.title}
        message={warningModal.message}
        confirmText={warningModal.confirmText || 'Đóng'}
        confirmVariant="primary"
        icon={warningModal.icon}
        iconColor={warningModal.iconColor}
        onConfirm={() => setWarningModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.marginMobile,
    gap: SPACING.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  modalHeaderTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalHeaderSave: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '800',
  },
  modalScroll: {
    padding: SPACING.marginMobile,
    paddingBottom: SPACING.xl * 2,
  },
  inputLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '700',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  genderOptionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  genderChipSelected: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primaryContainer,
  },
  genderChipText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  genderChipTextSelected: {
    color: COLORS.white,
    fontWeight: '800',
  },
  datePickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    gap: SPACING.xs,
  },
  datePickerTriggerText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
});
