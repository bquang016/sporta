import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../../shared/config/theme';

interface PrivacyDangerGroupProps {
  privateMode: boolean;
  onTogglePrivateMode: (val: boolean) => void;
  onOpenDeleteModal: () => void;
}

export function PrivacyDangerGroup({
  privateMode,
  onTogglePrivateMode,
  onOpenDeleteModal,
}: PrivacyDangerGroupProps) {
  return (
    <>
      <Text style={styles.sectionGroupTitle}>3. Quyền Riêng Tư & Quản Lý</Text>

      <View style={styles.settingCard}>
        {/* Chế độ riêng tư */}
        <View style={styles.settingRow}>
          <View style={styles.iconBg}>
            <MaterialIcons name="security" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.settingRowTextCol}>
            <Text style={styles.settingLabel} numberOfLines={1}>Chế độ riêng tư</Text>
            <Text style={styles.settingSubtext} numberOfLines={2}>Ẩn thông tin cá nhân và lịch sử đá với thành viên khác trong CLB</Text>
          </View>
          <Switch
            value={privateMode}
            onValueChange={onTogglePrivateMode}
            trackColor={{ false: COLORS.surfaceContainerLow, true: COLORS.primaryOpacity30 }}
            thumbColor={privateMode ? COLORS.primary : COLORS.outline}
          />
        </View>

        <View style={styles.rowDivider} />

        {/* Yêu cầu xóa tài khoản */}
        <TouchableOpacity 
          style={styles.dangerRow} 
          activeOpacity={0.8}
          onPress={onOpenDeleteModal}
        >
          <View style={styles.dangerIconBg}>
            <MaterialIcons name="delete-forever" size={22} color={COLORS.error} />
          </View>
          <View style={styles.settingRowTextCol}>
            <Text style={styles.dangerLabel} numberOfLines={1}>Yêu cầu xóa tài khoản</Text>
            <Text style={styles.dangerSubtext} numberOfLines={1}>Xóa vĩnh viễn dữ liệu tài khoản cá nhân</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={COLORS.error} />
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
  settingSubtext: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginVertical: SPACING.xs,
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
});
