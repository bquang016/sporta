import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import type { BookingResponse } from '../../../../entities/booking/model/booking.types';

interface BookingDetailVenueCardProps {
  booking: BookingResponse;
}

export function BookingDetailVenueCard({ booking }: BookingDetailVenueCardProps) {
  const detail = booking.details?.[0];
  const isCancelled = booking.status === 'CANCELLED';

  const handleOpenGoogleMaps = () => {
    if (booking.venueLocation) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.venueLocation)}`;
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.venueInfo}>
          <Text style={styles.venueName}>{booking.venueName || 'Sân bóng Sporta'}</Text>
          <Text style={styles.courtName}>{detail?.courtName || booking.courtName || 'Sân tiêu chuẩn'}</Text>
        </View>
        <View style={[styles.statusBadge, isCancelled && styles.statusBadgeCancelled]}>
          <MaterialIcons 
            name={isCancelled ? "cancel" : "check-circle"} 
            size={14} 
            color={isCancelled ? COLORS.error : COLORS.primary} 
          />
          <Text style={[styles.statusText, isCancelled && styles.statusTextCancelled]}>
            {isCancelled ? 'Đã hủy' : 'Đã xác nhận'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Address & Google Maps button */}
      <View style={styles.locationRow}>
        <MaterialIcons name="place" size={18} color={COLORS.primary} />
        <Text style={styles.locationText} numberOfLines={2}>
          {booking.venueLocation || 'Khương Thượng, Đống Đa, Hà Nội'}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.mapsBtn} 
        activeOpacity={0.8}
        onPress={handleOpenGoogleMaps}
      >
        <MaterialIcons name="directions" size={18} color={COLORS.primary} />
        <Text style={styles.mapsBtnText}>Chỉ đường Google Maps</Text>
      </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  courtName: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurface,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  statusBadgeCancelled: {
    backgroundColor: COLORS.errorContainer,
  },
  statusText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '700',
  },
  statusTextCancelled: {
    color: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginVertical: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  locationText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryOpacity10,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  mapsBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
