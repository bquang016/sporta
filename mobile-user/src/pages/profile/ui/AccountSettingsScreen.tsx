import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  TextInput, 
  Modal, 
  StatusBar,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import { Avatar } from '../../../shared/ui/Avatar/Avatar';
import { ConfirmModal } from '../../../shared/ui/Modal/ConfirmModal';
import { useAlert } from '../../../shared/contexts/AlertContext';

export function AccountSettingsScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();

  // Profile Info State
  const [avatarUri, setAvatarUri] = useState<string>('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80');
  const [fullName, setFullName] = useState<string>('Chủ Sân Sporta');
  const [phone, setPhone] = useState<string>('0988 123 456');
  const [email, setEmail] = useState<string>('owner@sporta.vn');
  const [dob, setDob] = useState<string>('15/08/1995');
  const [gender, setGender] = useState<string>('Nam');
  const [defaultAddress, setDefaultAddress] = useState<string>('Khương Thượng, Đống Đa, Hà Nội');

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
  const [isChangePasswordModal, setIsChangePasswordModal] = useState(false);
  const [isDeleteConfirmModal, setIsDeleteConfirmModal] = useState(false);

  // Form Inputs for Password Change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/profile' as any);
    }
  };

  // Avatar Picker Handler
  const handlePickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showAlert('Cần cấp quyền', 'Vui lòng cấp quyền truy cập thư viện ảnh để đổi ảnh đại diện.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
        showAlert('Thành công', 'Đã cập nhật ảnh đại diện mới thành công!');
      }
    } catch (err) {
      console.error('Error picking avatar:', err);
    }
  };

  const handleSaveProfile = () => {
    setIsEditProfileModal(false);
    showAlert('Thành công', 'Đã cập nhật thông tin cá nhân.');
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showAlert('Cảnh báo', 'Vui lòng nhập đầy đủ các trường thông tin mật khẩu.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Lỗi', 'Mật khẩu mới và mật khẩu xác nhận không trùng khớp.');
      return;
    }
    setIsChangePasswordModal(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showAlert('Thành công', 'Đổi mật khẩu tài khoản thành công! Vui lòng sử dụng mật khẩu mới cho lần đăng nhập sau.');
  };

  const handleDeleteAccount = () => {
    setIsDeleteConfirmModal(false);
    showAlert('Yêu cầu đã gửi', 'Yêu cầu xóa tài khoản của bạn đã được ghi nhận. Hệ thống sẽ xử lý và gửi phản hồi qua email trong vòng 24h.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={handleBackPress}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cài Đặt Tài Khoản</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ─── GROUP 1: Thông Tin Cá Nhân (Profile Information) ─── */}
        <Text style={styles.sectionGroupTitle}>1. Thông Tin Cá Nhân</Text>

        {/* Avatar Section */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarWrapper}>
            <Avatar size={90} source={avatarUri} />
            <TouchableOpacity 
              style={styles.cameraBadgeBtn}
              activeOpacity={0.85}
              onPress={handlePickAvatar}
            >
              <MaterialIcons name="camera-alt" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Chạm vào biểu tượng máy ảnh để đổi ảnh đại diện</Text>
        </View>

        {/* Profile Info Items Card */}
        <View style={styles.settingCard}>
          {/* Full Name */}
          <TouchableOpacity 
            style={styles.settingRow} 
            activeOpacity={0.7}
            onPress={() => setIsEditProfileModal(true)}
          >
            <View style={styles.iconBg}>
              <MaterialIcons name="person-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingRowTextCol}>
              <Text style={styles.settingLabel}>Họ và tên</Text>
              <Text style={styles.settingValue}>{fullName}</Text>
            </View>
            <MaterialIcons name="edit" size={18} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Phone */}
          <View style={styles.settingRow}>
            <View style={styles.iconBg}>
              <MaterialIcons name="phone-iphone" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingRowTextCol}>
              <Text style={styles.settingLabel}>Số điện thoại</Text>
              <Text style={styles.settingValue}>{phone}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={12} color={COLORS.primary} />
              <Text style={styles.verifiedBadgeText}>Đã xác thực OTP</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Email */}
          <View style={styles.settingRow}>
            <View style={styles.iconBg}>
              <MaterialIcons name="mail-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingRowTextCol}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingValue}>{email}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="check-circle" size={12} color={COLORS.primary} />
              <Text style={styles.verifiedBadgeText}>Xác thực</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* DOB & Gender */}
          <TouchableOpacity 
            style={styles.settingRow} 
            activeOpacity={0.7}
            onPress={() => setIsEditProfileModal(true)}
          >
            <View style={styles.iconBg}>
              <MaterialIcons name="cake" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingRowTextCol}>
              <Text style={styles.settingLabel}>Ngày sinh / Giới tính</Text>
              <Text style={styles.settingValue}>{dob} • {gender}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={COLORS.outline} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Default Location */}
          <TouchableOpacity 
            style={styles.settingRow} 
            activeOpacity={0.7}
            onPress={() => setIsEditProfileModal(true)}
          >
            <View style={styles.iconBg}>
              <MaterialIcons name="place" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingRowTextCol}>
              <Text style={styles.settingLabel}>Vị trí / Địa chỉ mặc định</Text>
              <Text style={styles.settingValue} numberOfLines={1}>{defaultAddress}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={COLORS.outline} />
          </TouchableOpacity>
        </View>

        {/* ─── GROUP 2: Bảo Mật & Đăng Nhập (Security & Account) ─── */}
        <Text style={styles.sectionGroupTitle}>2. Bảo Mật & Đăng Nhập</Text>

        <View style={styles.settingCard}>
          {/* Đổi mật khẩu */}
          <TouchableOpacity 
            style={styles.settingRow} 
            activeOpacity={0.7}
            onPress={() => setIsChangePasswordModal(true)}
          >
            <View style={styles.iconBg}>
              <MaterialIcons name="lock-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingRowTextCol}>
              <Text style={styles.settingLabel}>Đổi mật khẩu</Text>
              <Text style={styles.settingSubtext}>Cập nhật mật khẩu bảo vệ tài khoản</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={COLORS.outline} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Biometrics / FaceID */}
          <View style={styles.settingRow}>
            <View style={styles.iconBg}>
              <MaterialCommunityIcons name="fingerprint" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.settingRowTextCol}>
              <Text style={styles.settingLabel}>Xác thực 2 yếu tố / Sinh trắc học</Text>
              <Text style={styles.settingSubtext}>Đăng nhập nhanh bằng Vân tay / FaceID</Text>
            </View>
            <Switch
              value={enableBiometrics}
              onValueChange={setEnableBiometrics}
              trackColor={{ false: COLORS.surfaceContainerLow, true: COLORS.primaryOpacity30 }}
              thumbColor={enableBiometrics ? COLORS.primary : COLORS.outline}
            />
          </View>

          <View style={styles.rowDivider} />

          {/* Social Accounts Title Header */}
          <View style={styles.innerHeaderRow}>
            <MaterialIcons name="link" size={18} color={COLORS.primary} />
            <Text style={styles.innerHeaderTitle}>Liên kết tài khoản mạng xã hội</Text>
          </View>

          {/* Google */}
          <View style={styles.settingRowSub}>
            <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
            <Text style={styles.socialLabel}>Google</Text>
            <Switch
              value={linkGoogle}
              onValueChange={setLinkGoogle}
              trackColor={{ false: COLORS.surfaceContainerLow, true: COLORS.primaryOpacity30 }}
              thumbColor={linkGoogle ? COLORS.primary : COLORS.outline}
            />
          </View>

          {/* Facebook */}
          <View style={styles.settingRowSub}>
            <MaterialCommunityIcons name="facebook" size={20} color="#4267B2" />
            <Text style={styles.socialLabel}>Facebook</Text>
            <Switch
              value={linkFacebook}
              onValueChange={setLinkFacebook}
              trackColor={{ false: COLORS.surfaceContainerLow, true: COLORS.primaryOpacity30 }}
              thumbColor={linkFacebook ? COLORS.primary : COLORS.outline}
            />
          </View>

          {/* Apple ID */}
          <View style={styles.settingRowSub}>
            <MaterialCommunityIcons name="apple" size={20} color="#000000" />
            <Text style={styles.socialLabel}>Apple ID</Text>
            <Switch
              value={linkApple}
              onValueChange={setLinkApple}
              trackColor={{ false: COLORS.surfaceContainerLow, true: COLORS.primaryOpacity30 }}
              thumbColor={linkApple ? COLORS.primary : COLORS.outline}
            />
          </View>
        </View>

        {/* ─── GROUP 3: Cài Đặt Thông Báo (Notifications) ─── */}
        <Text style={styles.sectionGroupTitle}>3. Cài Đặt Thông Báo</Text>

        <View style={styles.settingCard}>
          {/* Thông báo lịch đặt sân */}
          <View style={styles.settingRow}>
            <View style={styles.iconBg}>
              <MaterialIcons name="event-available" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingRowTextCol}>
              <Text style={styles.settingLabel}>Thông báo lịch đặt sân</Text>
              <Text style={styles.settingSubtext}>Nhắc lịch sắp đá, cập nhật trạng thái đơn (Hủy, Đổi giờ...)</Text>
            </View>
            <Switch
              value={notifBooking}
              onValueChange={setNotifBooking}
              trackColor={{ false: COLORS.surfaceContainerLow, true: COLORS.primaryOpacity30 }}
              thumbColor={notifBooking ? COLORS.primary : COLORS.outline}
            />
          </View>

          <View style={styles.rowDivider} />

          {/* Thông báo khuyến mãi */}
          <View style={styles.settingRow}>
            <View style={styles.iconBg}>
              <MaterialIcons name="card-giftcard" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingRowTextCol}>
              <Text style={styles.settingLabel}>Thông báo khuyến mãi</Text>
              <Text style={styles.settingSubtext}>Nhận voucher mới và chương trình ưu đãi từ các chủ sân</Text>
            </View>
            <Switch
              value={notifPromo}
              onValueChange={setNotifPromo}
              trackColor={{ false: COLORS.surfaceContainerLow, true: COLORS.primaryOpacity30 }}
              thumbColor={notifPromo ? COLORS.primary : COLORS.outline}
            />
          </View>

          <View style={styles.rowDivider} />

          {/* Thông báo ghép trận / CLB */}
          <View style={styles.settingRow}>
            <View style={styles.iconBg}>
              <MaterialIcons name="groups" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingRowTextCol}>
              <Text style={styles.settingLabel}>Thông báo ghép trận & CLB</Text>
              <Text style={styles.settingSubtext}>Nhận thông báo khi có kèo giao hữu mới hoặc tin nhắn nhóm</Text>
            </View>
            <Switch
              value={notifMatchmake}
              onValueChange={setNotifMatchmake}
              trackColor={{ false: COLORS.surfaceContainerLow, true: COLORS.primaryOpacity30 }}
              thumbColor={notifMatchmake ? COLORS.primary : COLORS.outline}
            />
          </View>
        </View>

        {/* ─── GROUP 4: Quyền Riêng Tư & Quản Lý Tài Khoản (Privacy & Danger Zone) ─── */}
        <Text style={styles.sectionGroupTitle}>4. Quyền Riêng Tư & Quản Lý</Text>

        <View style={styles.settingCard}>
          {/* Chế độ riêng tư */}
          <View style={styles.settingRow}>
            <View style={styles.iconBg}>
              <MaterialIcons name="security" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingRowTextCol}>
              <Text style={styles.settingLabel}>Chế độ riêng tư</Text>
              <Text style={styles.settingSubtext}>Ẩn thông tin cá nhân và lịch sử đấu với thành viên khác trong CLB</Text>
            </View>
            <Switch
              value={privateMode}
              onValueChange={setPrivateMode}
              trackColor={{ false: COLORS.surfaceContainerLow, true: COLORS.primaryOpacity30 }}
              thumbColor={privateMode ? COLORS.primary : COLORS.outline}
            />
          </View>

          <View style={styles.rowDivider} />

          {/* Yêu cầu xóa tài khoản */}
          <TouchableOpacity 
            style={styles.dangerRow} 
            activeOpacity={0.8}
            onPress={() => setIsDeleteConfirmModal(true)}
          >
            <View style={styles.dangerIconBg}>
              <MaterialIcons name="delete-forever" size={22} color={COLORS.error} />
            </View>
            <View style={styles.settingRowTextCol}>
              <Text style={styles.dangerLabel}>Yêu cầu xóa tài khoản (Delete Account)</Text>
              <Text style={styles.dangerSubtext}>Xóa vĩnh viễn dữ liệu tài khoản cá nhân khỏi hệ thống</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={COLORS.error} />
          </TouchableOpacity>
        </View>

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
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={styles.modalHeaderSave}>Lưu</Text>
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

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput 
              style={styles.textInput} 
              value={email} 
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Nhập email" 
            />

            <Text style={styles.inputLabel}>Ngày sinh</Text>
            <TextInput 
              style={styles.textInput} 
              value={dob} 
              onChangeText={setDob}
              placeholder="DD/MM/YYYY" 
            />

            <Text style={styles.inputLabel}>Giới tính</Text>
            <TextInput 
              style={styles.textInput} 
              value={gender} 
              onChangeText={setGender}
              placeholder="Nam / Nữ / Khác" 
            />

            <Text style={styles.inputLabel}>Địa chỉ mặc định</Text>
            <TextInput 
              style={[styles.textInput, { height: 80 }]} 
              value={defaultAddress} 
              onChangeText={setDefaultAddress}
              multiline
              placeholder="Nhập địa chỉ mặc định" 
            />

            <Button
              title="Lưu thay đổi"
              variant="primary"
              style={{ marginTop: SPACING.lg }}
              onPress={handleSaveProfile}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

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

      {/* Delete Account App Modal */}
      <ConfirmModal
        visible={isDeleteConfirmModal}
        title="Yêu cầu xóa tài khoản?"
        message="Hành động này sẽ gửi yêu cầu xóa vĩnh viễn tài khoản cá nhân, toàn bộ lịch sử đặt sân và dữ liệu của bạn khỏi hệ thống Sporta. Bạn có chắc chắn muốn tiếp tục không?"
        confirmText="Xóa tài khoản"
        cancelText="Giữ tài khoản"
        confirmVariant="primary"
        icon="delete-forever"
        iconColor={COLORS.error}
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsDeleteConfirmModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    padding: SPACING.marginMobile,
    gap: SPACING.md,
  },
  sectionGroupTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SPACING.xs,
    marginLeft: 4,
  },
  avatarCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  cameraBadgeBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  avatarHint: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  settingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    gap: SPACING.md,
  },
  settingRowSub: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs + 2,
    paddingLeft: SPACING.md + 24,
  },
  socialLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurface,
    flex: 1,
    marginLeft: SPACING.xs,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryOpacity12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingRowTextCol: {
    flex: 1,
  },
  settingLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  settingValue: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  settingSubtext: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    gap: 3,
  },
  verifiedBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginVertical: SPACING.xs,
  },
  innerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  innerHeaderTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs + 2,
    gap: SPACING.md,
  },
  dangerIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.errorContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.error,
  },
  dangerSubtext: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.error,
    opacity: 0.8,
    marginTop: 2,
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
});
