import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface SecurityGroupProps {
  enableBiometrics: boolean;
  onOpenChangePasswordModal: () => void;
  onToggleBiometrics: (val: boolean) => void;
}

export function SecurityGroup({
  enableBiometrics,
  onOpenChangePasswordModal,
  onToggleBiometrics,
}: SecurityGroupProps) {
  return (
    <>
      <Text style={styles.sectionGroupTitle}>BẢO MẬT & ĐĂNG NHẬP</Text>

      <View style={styles.settingCard}>
        {/* Đổi mật khẩu */}
        <TouchableOpacity 
          style={styles.settingRow} 
          activeOpacity={0.7}
          onPress={onOpenChangePasswordModal}
        >
          <View style={[styles.iconBg, { backgroundColor: '#F0F3FF' }]}>
            <MaterialIcons name="lock-outline" size={20} color="#4338CA" />
          </View>
          <View style={styles.settingRowTextCol}>
            <Text style={styles.settingLabel}>Đổi mật khẩu</Text>
            <Text style={styles.settingSubtext}>Cập nhật mật khẩu bảo vệ tài khoản</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={COLORS.outline} />
        </TouchableOpacity>

        <View style={styles.rowDivider} />

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
});
