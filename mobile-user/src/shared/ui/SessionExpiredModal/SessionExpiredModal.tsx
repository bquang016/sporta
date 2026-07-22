import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { globalEvent } from '../../lib/eventEmitter';
import { Button } from '../Button';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../config/theme';

export function SessionExpiredModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = globalEvent.on('auth:expired', () => {
      setVisible(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogin = () => {
    setVisible(false);
    // Điều hướng về màn hình đăng nhập, xóa các màn hình trước đó
    router.replace('/(auth)');
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      // Prevent dismissing by tapping outside or hardware back button
      onRequestClose={() => {}} 
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Phiên đăng nhập hết hạn</Text>
          <Text style={styles.message}>
            Thời gian đăng nhập của bạn đã kết thúc để đảm bảo bảo mật. Vui lòng đăng nhập lại để tiếp tục sử dụng ứng dụng.
          </Text>
          <Button 
            title="Đăng nhập lại" 
            onPress={handleLogin} 
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.marginMobile,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    width: '100%',
  },
});
