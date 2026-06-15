import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';

interface AuthCtaBannerProps {
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
}

export function AuthCtaBanner({ onLoginPress, onRegisterPress }: AuthCtaBannerProps) {
  return (
    <View style={styles.banner}>
      {/* Absolute background blur circle */}
      <View style={styles.backgroundCircle} />
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
    backgroundColor: COLORS.primaryContainer,
    borderRadius: BORDER_RADIUS.xxxl,
    padding: SPACING.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundCircle: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 96,
    height: 96,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    gap: SPACING.md,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },
  description: {
    fontSize: 14,
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
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: COLORS.secondaryContainer,
  },
  loginButtonText: {
    color: COLORS.onSecondaryContainer,
    fontWeight: '700',
    fontSize: 14,
  },
  registerButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  registerButtonText: {
    color: COLORS.onPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
});
