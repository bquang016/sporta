import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import type { BookingResponse } from '../../../../entities/booking/model/booking.types';

interface BookingDetailQrSectionProps {
  booking: BookingResponse;
}

export function BookingDetailQrSection({ booking }: BookingDetailQrSectionProps) {
  const detail = booking.details?.[0];

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Mã Đối Soát Check-in</Text>
      <Text style={styles.sectionSubtitle}>Đưa mã QR này cho quản lý sân khi nhận sân</Text>

      <View style={styles.qrWrapper}>
        <Image 
          source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${booking.bookingCode}` }} 
          style={styles.qrImage}
        />
      </View>

      <Text style={styles.bookingCode}>{booking.bookingCode}</Text>

      <View style={styles.timeBox}>
        <View style={styles.timeRow}>
          <MaterialIcons name="event" size={18} color={COLORS.primary} />
          <Text style={styles.timeLabel}>Ngày đá:</Text>
          <Text style={styles.timeVal}>{detail?.bookingDate || '30/07/2026'}</Text>
        </View>
        <View style={styles.timeRow}>
          <MaterialIcons name="schedule" size={18} color={COLORS.primary} />
          <Text style={styles.timeLabel}>Khung giờ:</Text>
          <Text style={styles.timeVal}>{detail?.startTime} - {detail?.endTime}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  qrWrapper: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: SPACING.xs,
  },
  qrImage: {
    width: 160,
    height: 160,
  },
  bookingCode: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  timeBox: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    width: '100%',
    gap: SPACING.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  timeLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  timeVal: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
});
