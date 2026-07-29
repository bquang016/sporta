import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface UnfriendConfirmModalProps {
  visible: boolean;
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const UnfriendConfirmModal = React.memo(({
  visible,
  userName,
  onConfirm,
  onCancel,
}: UnfriendConfirmModalProps) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="person-remove-outline" size={28} color={COLORS.error} />
          </View>

          <Text style={styles.title}>Hủy kết bạn?</Text>
          <Text style={styles.message}>
            Bạn có chắc chắn muốn hủy kết bạn với <Text style={styles.boldName}>{userName}</Text>? Cả hai sẽ không còn thấy các cập nhật trực tiếp của nhau trên Bảng tin.
          </Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>Bỏ qua</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.8} onPress={onConfirm}>
              <Text style={styles.confirmBtnText}>Hủy kết bạn</Text>
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2', // light red tint
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
  },
  message: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  boldName: {
    fontWeight: '700',
    color: COLORS.onSurface,
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
    backgroundColor: COLORS.error,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
