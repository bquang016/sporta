import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../config/theme';

export interface CustomConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export const CustomConfirmModal = React.memo(({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
}: CustomConfirmModalProps) => {
  if (!visible) return null;

  const renderIcon = () => {
    switch (type) {
      case 'danger':
        return <Ionicons name="trash-outline" size={28} color={COLORS.error} />;
      case 'warning':
        return <Ionicons name="warning-outline" size={28} color="#D97706" />;
      case 'success':
        return <Ionicons name="checkmark-circle-outline" size={28} color="#10B981" />;
      default:
        return <Ionicons name="information-circle-outline" size={28} color={COLORS.primary} />;
    }
  };

  const getIconCircleBg = () => {
    switch (type) {
      case 'danger':
        return '#FEE2E2';
      case 'warning':
        return '#FEF3C7';
      case 'success':
        return '#D1FAE5';
      default:
        return COLORS.primaryOpacity10;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel || onConfirm}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: getIconCircleBg() }]}>
            {renderIcon()}
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actionsRow}>
            {onCancel ? (
              <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={onCancel}>
                <Text style={styles.cancelBtnText}>{cancelText}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                type === 'danger' && { backgroundColor: COLORS.error },
                type === 'warning' && { backgroundColor: '#D97706' },
                type === 'success' && { backgroundColor: '#10B981' },
              ]}
              activeOpacity={0.85}
              onPress={onConfirm}
            >
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  message: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  cancelBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    color: COLORS.onSurface,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
