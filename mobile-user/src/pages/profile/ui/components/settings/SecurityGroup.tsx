import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../../shared/config/theme';

interface SecurityGroupProps {
  enableBiometrics: boolean;
  linkGoogle: boolean;
  linkFacebook: boolean;
  linkApple: boolean;
  onOpenChangePasswordModal: () => void;
  onToggleBiometrics: (val: boolean) => void;
  onToggleGoogle: (val: boolean) => void;
  onToggleFacebook: (val: boolean) => void;
  onToggleApple: (val: boolean) => void;
}

export function SecurityGroup({
  enableBiometrics,
  linkGoogle,
  linkFacebook,
  linkApple,
  onOpenChangePasswordModal,
  onToggleBiometrics,
  onToggleGoogle,
  onToggleFacebook,
  onToggleApple,
}: SecurityGroupProps) {
  return (
    <>
      <Text style={styles.sectionGroupTitle}>1. Bảo Mật & Đăng Nhập</Text>

      <View style={styles.settingCard}>
        {/* Đổi mật khẩu */}
        <TouchableOpacity 
          style={styles.settingRow} 
          activeOpacity={0.7}
          onPress={onOpenChangePasswordModal}
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
            <Text style={styles.settingLabel} numberOfLines={1}>Xác thực 2 yếu tố / Sinh trắc học</Text>
            <Text style={styles.settingSubtext} numberOfLines={1}>Đăng nhập nhanh bằng Vân tay / FaceID</Text>
          </View>
          <Switch
            value={enableBiometrics}
            onValueChange={onToggleBiometrics}
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
            onValueChange={onToggleGoogle}
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
            onValueChange={onToggleFacebook}
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
            onValueChange={onToggleApple}
            trackColor={{ false: COLORS.surfaceContainerLow, true: COLORS.primaryOpacity30 }}
            thumbColor={linkApple ? COLORS.primary : COLORS.outline}
          />
        </View>
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
});
