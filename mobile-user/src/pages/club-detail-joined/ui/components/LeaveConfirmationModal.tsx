import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

export interface LeaveConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clubName: string;
}

export function LeaveConfirmationModal({ visible, onClose, onConfirm, clubName }: LeaveConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.alertModalContent}>
          <MaterialIcons 
            name="warning-amber" 
            size={48} 
            color={COLORS.error} 
            style={styles.modalAlertIcon}
          />
          <Text style={styles.alertModalTitle}>Rời câu lạc bộ</Text>
          <Text style={styles.alertModalMessage}>
            Bạn có chắc chắn muốn rời khỏi câu lạc bộ "{clubName}" không?
          </Text>
          <View style={styles.alertModalActions}>
            <TouchableOpacity
              style={[styles.alertModalBtn, styles.alertCancelBtn]}
              activeOpacity={0.7}
              onPress={onClose}
            >
              <Text style={styles.alertCancelText}>Hủy bỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.alertModalBtn, styles.alertConfirmBtn]}
              activeOpacity={0.7}
              onPress={onConfirm}
            >
              <Text style={styles.alertConfirmText}>Đồng ý rời</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  alertModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalAlertIcon: {
    marginBottom: SPACING.md,
  },
  alertModalTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  alertModalMessage: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  alertModalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
  },
  alertModalBtn: {
    flex: 1,
    height: 44,
    borderRadius: BORDER_RADIUS.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCancelBtn: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  alertCancelText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
  },
  alertConfirmBtn: {
    backgroundColor: COLORS.error,
  },
  alertConfirmText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
  },
});
