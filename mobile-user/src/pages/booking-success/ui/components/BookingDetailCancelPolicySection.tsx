import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

interface BookingDetailCancelPolicySectionProps {
  isCancelled: boolean;
  onOpenCancelConfirm: () => void;
}

export function BookingDetailCancelPolicySection({
  isCancelled,
  onOpenCancelConfirm,
}: BookingDetailCancelPolicySectionProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Chính Sách Hủy Sân & Hoàn Tiền</Text>
      
      <View style={styles.policyItem}>
        <MaterialIcons name="check" size={16} color={COLORS.primary} />
        <Text style={styles.policyText}>Hủy trước 24 giờ: Hoàn lại 100% số tiền đã cọc/thanh toán.</Text>
      </View>

      <View style={styles.policyItem}>
        <MaterialIcons name="check" size={16} color={COLORS.primary} />
        <Text style={styles.policyText}>Hủy từ 12h đến 24h: Hoàn lại 50% số tiền.</Text>
      </View>

      <View style={styles.policyItem}>
        <MaterialIcons name="close" size={16} color={COLORS.error} />
        <Text style={styles.policyText}>Hủy dưới 12 giờ: Không hoàn tiền theo chính sách giữ sân.</Text>
      </View>

      {!isCancelled && (
        <TouchableOpacity 
          style={styles.cancelBtn}
          activeOpacity={0.8}
          onPress={onOpenCancelConfirm}
        >
          <MaterialIcons name="cancel" size={18} color={COLORS.white} />
          <Text style={styles.cancelBtnText}>Hủy đặt sân này</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs + 2,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  policyText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  cancelBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '800',
  },
});
