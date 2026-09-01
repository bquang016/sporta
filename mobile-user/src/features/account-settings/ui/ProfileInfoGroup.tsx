import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Avatar } from '../../../shared/ui/Avatar/Avatar';

interface ProfileInfoGroupProps {
  avatarUri: string | null;
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  defaultAddress: string;
  saving: boolean;
  onPickAvatar: () => void;
  onOpenEditModal: () => void;
  formatDisplayDob: (dob: string) => string;
  getGenderLabel: (gender: string) => string;
}

export function ProfileInfoGroup({
  avatarUri,
  fullName,
  phone,
  email,
  dob,
  gender,
  defaultAddress,
  saving,
  onPickAvatar,
  onOpenEditModal,
  formatDisplayDob,
  getGenderLabel,
}: ProfileInfoGroupProps) {
  return (
    <>
      <Text style={styles.sectionGroupTitle}>1. Thông Tin Cá Nhân</Text>

      {/* Avatar Section */}
      <View style={styles.avatarCard}>
        <View style={styles.avatarWrapper}>
          <Avatar size={90} source={avatarUri} />
          <TouchableOpacity 
            style={styles.cameraBadgeBtn}
            activeOpacity={0.85}
            onPress={onPickAvatar}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <MaterialIcons name="camera-alt" size={18} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.avatarHint}>Chạm vào máy ảnh để chọn và lưu ảnh đại diện mới vào CSDL</Text>
      </View>

      {/* Profile Info Items Card */}
      <View style={styles.settingCard}>
        {/* Full Name */}
        <TouchableOpacity 
          style={styles.settingRow} 
          activeOpacity={0.7}
          onPress={onOpenEditModal}
        >
          <View style={styles.iconBg}>
            <MaterialIcons name="person-outline" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingRowTextCol}>
            <Text style={styles.settingLabel} numberOfLines={1}>Họ và tên</Text>
            <Text style={styles.settingValue} numberOfLines={1}>{fullName || 'Chưa cập nhật'}</Text>
          </View>
          <MaterialIcons name="edit" size={18} color={COLORS.onSurfaceVariant} />
        </TouchableOpacity>

        <View style={styles.rowDivider} />

        {/* Phone */}
        <TouchableOpacity 
          style={styles.settingRow} 
          activeOpacity={0.7}
          onPress={onOpenEditModal}
        >
          <View style={styles.iconBg}>
            <MaterialIcons name="phone-iphone" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingRowTextCol}>
            <Text style={styles.settingLabel} numberOfLines={1}>Số điện thoại</Text>
            <Text style={styles.settingValue} numberOfLines={1}>{phone || 'Chưa cập nhật SĐT'}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={12} color={COLORS.primary} />
            <Text style={styles.verifiedBadgeText}>Đã xác thực</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.rowDivider} />

        {/* Email */}
        <View style={styles.settingRow}>
          <View style={styles.iconBg}>
            <MaterialIcons name="mail-outline" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingRowTextCol}>
            <Text style={styles.settingLabel} numberOfLines={1}>Email</Text>
            <Text style={styles.settingValue} numberOfLines={1}>{email || 'Chưa cập nhật'}</Text>
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
          onPress={onOpenEditModal}
        >
          <View style={styles.iconBg}>
            <MaterialIcons name="cake" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingRowTextCol}>
            <Text style={styles.settingLabel} numberOfLines={1}>Ngày sinh / Giới tính</Text>
            <Text style={styles.settingValue} numberOfLines={1}>{formatDisplayDob(dob)} • {getGenderLabel(gender)}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={COLORS.outline} />
        </TouchableOpacity>

        <View style={styles.rowDivider} />

        {/* Default Location */}
        <TouchableOpacity 
          style={styles.settingRow} 
          activeOpacity={0.7}
          onPress={onOpenEditModal}
        >
          <View style={styles.iconBg}>
            <MaterialIcons name="place" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingRowTextCol}>
            <Text style={styles.settingLabel} numberOfLines={1}>Vị trí / Địa chỉ mặc định</Text>
            <Text style={styles.settingValue} numberOfLines={1}>{defaultAddress || 'Chưa cập nhật khu vực'}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={COLORS.outline} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
});
