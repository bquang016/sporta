import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface AuthCtaBannerProps {
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
}

export function AuthCtaBanner({ onLoginPress, onRegisterPress }: AuthCtaBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Text style={styles.title}>Đăng nhập để trải nghiệm đầy đủ</Text>
        <Text style={styles.description}>
          Đặt sân nhanh hơn, tham gia cộng đồng và nhận ưu đãi độc quyền dành cho thành viên.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={onLoginPress}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.registerButton]}
            onPress={onRegisterPress}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.primary, // Forest Green background
    borderRadius: BORDER_RADIUS.lg,  // 16px radius for large cards
    padding: SPACING.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    gap: SPACING.md,
    zIndex: 1,
  },
  title: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: TYPOGRAPHY.headlineMd.fontWeight,
    fontSize: 20,
    color: COLORS.onPrimary,
  },
  description: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontWeight: TYPOGRAPHY.bodyMd.fontWeight,
    fontSize: TYPOGRAPHY.bodyMd.fontSize,
    color: COLORS.onPrimary,
    opacity: 0.8,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: BORDER_RADIUS.default, // Standard 8px radius
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: COLORS.secondary, // Yellow brand Gold
  },
  loginButtonText: {
    color: COLORS.onSecondary, // Black text on yellow background
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: TYPOGRAPHY.labelMd.fontWeight,
    fontSize: TYPOGRAPHY.labelMd.fontSize,
  },
  registerButton: {
    borderWidth: 1,
    borderColor: COLORS.whiteOpacity30,
    backgroundColor: COLORS.whiteOpacity10,
  },
  registerButtonText: {
    color: COLORS.onPrimary,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: TYPOGRAPHY.labelMd.fontWeight,
    fontSize: TYPOGRAPHY.labelMd.fontSize,
  },
});
