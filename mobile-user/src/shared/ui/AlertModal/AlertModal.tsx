import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Button } from '../Button';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../config/theme';

export interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onConfirm: () => void;
}

export function AlertModal({ visible, title, message, buttonText = 'Đóng', onConfirm }: AlertModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onConfirm}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <Button 
            title={buttonText} 
            onPress={onConfirm} 
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
