import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

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
      <Text style={styles.sectionGroupTitle}>QUYỀN RIÊNG TƯ & QUẢN LÝ</Text>

      <View style={styles.settingCard}>
        {/* Chế độ riêng tư */}
        <View style={styles.settingRow}>
          <View style={[styles.iconBg, { backgroundColor: '#F1F5F9' }]}>
            <MaterialIcons name="security" size={20} color="#334155" />
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
            <MaterialIcons name="delete-forever" size={22} color="#E11D48" />
          </View>
          <View style={styles.settingRowTextCol}>
            <Text style={styles.dangerLabel} numberOfLines={1}>Yêu cầu xóa tài khoản</Text>
            <Text style={styles.dangerSubtext} numberOfLines={1}>Xóa vĩnh viễn dữ liệu tài khoản cá nhân</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#E11D48" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionGroupTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: SPACING.xs,
    marginLeft: 4,
    marginBottom: 8,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingRowTextCol: {
    flex: 1,
    marginRight: 12,
    overflow: 'hidden',
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
    backgroundColor: '#F1F5F9',
    marginLeft: 68,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dangerIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dangerLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: '#E11D48',
  },
  dangerSubtext: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: '#E11D48',
    opacity: 0.8,
    marginTop: 2,
  },
});
