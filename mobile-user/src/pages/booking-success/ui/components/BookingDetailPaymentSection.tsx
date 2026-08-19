import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import type { BookingResponse } from '../../../../entities/booking/model/booking.types';

interface BookingDetailPaymentSectionProps {
  booking: BookingResponse;
}

export function BookingDetailPaymentSection({ booking }: BookingDetailPaymentSectionProps) {
  const detail = booking.details?.[0];
  const originalPrice = detail?.price || booking.totalPrice || 350000;
  const finalPrice = booking.finalPrice || originalPrice;

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + ' đ';
  };

  const handleCallVenuePhone = () => {
    if (booking.venuePhone) {
      Linking.openURL(`tel:${booking.venuePhone}`);
    } else {
      Linking.openURL('tel:19006868');
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Chi Tiết Thanh Toán & Liên Hệ</Text>

      <View style={styles.payRow}>
        <Text style={styles.payLabel}>Tiền thuê sân gốc:</Text>
        <Text style={styles.payVal}>{formatCurrency(originalPrice)}</Text>
      </View>

      <View style={styles.payRow}>
        <Text style={styles.payLabel}>Phương thức thanh toán:</Text>
        <Text style={styles.payVal}>{booking.paymentMethod || 'VNPay QR'}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.payRow}>
        <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
        <Text style={styles.totalVal}>{formatCurrency(finalPrice)}</Text>
      </View>

      <View style={styles.divider} />

      {/* Hotline Support & Contact Venue */}
      <View style={styles.hotlineRow}>
        <MaterialIcons name="phone-in-talk" size={18} color={COLORS.primary} />
        <View style={styles.hotlineTextCol}>
          <Text style={styles.hotlineTitle}>Hotline chủ sân hỗ trợ:</Text>
          <Text style={styles.hotlinePhone}>{booking.venuePhone || '1900 6868'}</Text>
        </View>
        <TouchableOpacity style={styles.callBtn} onPress={handleCallVenuePhone}>
          <MaterialIcons name="call" size={16} color={COLORS.white} />
          <Text style={styles.callBtnText}>Gọi chủ sân</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs + 2,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  payLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  payVal: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginVertical: SPACING.xs + 2,
  },
  totalLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  totalVal: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  hotlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    marginTop: 2,
  },
  hotlineTextCol: {
    flex: 1,
  },
  hotlineTitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  hotlinePhone: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '800',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  callBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '700',
  },
});
