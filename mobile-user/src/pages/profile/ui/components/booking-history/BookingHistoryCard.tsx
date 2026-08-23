import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../../shared/config/theme';
import { Button } from '../../../../../shared/ui';
import { BookingItem, getEffectiveBookingStatus } from '../../../../../shared/api/bookings';

interface BookingHistoryCardProps {
  booking: BookingItem;
  onPressCard: (booking: BookingItem) => void;
  onPressShowQR: (booking: BookingItem) => void;
  onPressCancel: (booking: BookingItem) => void;
  onPressReview?: (booking: BookingItem) => void;
}

export function BookingHistoryCard({
  booking,
  onPressCard,
  onPressShowQR,
  onPressCancel,
  onPressReview,
}: BookingHistoryCardProps) {
  const detail = booking.details?.[0];
  const effectiveStatus = getEffectiveBookingStatus(booking);
  const isConfirmed = effectiveStatus === 'CONFIRMED' || effectiveStatus === 'PENDING';
  const isCancelled = effectiveStatus === 'CANCELLED';
  const isCompleted = effectiveStatus === 'COMPLETED';

  const formatCurrency = (val: number) => {
    return val.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => onPressCard(booking)}
    >
      {/* Header Row: Venue & Status */}
      <View style={styles.cardHeader}>
        <View style={styles.venueRow}>
          <Image 
            source={{ uri: booking.venueAvatar || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&auto=format&fit=crop&q=80' }} 
            style={styles.venueAvatar} 
          />
          <View style={styles.venueInfo}>
            <Text style={styles.venueName} numberOfLines={1}>{booking.venueName}</Text>
            <Text style={styles.bookingCode}>{booking.bookingCode}</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={[
          styles.statusBadge, 
          isConfirmed && styles.statusBadgeConfirmed,
          isCancelled && styles.statusBadgeCancelled,
          isCompleted && styles.statusBadgeCompleted
        ]}>
          <MaterialIcons 
            name={isConfirmed ? 'check-circle' : isCancelled ? 'cancel' : 'task-alt'} 
            size={12} 
            color={isConfirmed ? COLORS.primary : isCancelled ? COLORS.error : '#2E7D32'} 
          />
          <Text style={[
            styles.statusText, 
            isConfirmed && styles.statusTextConfirmed,
            isCancelled && styles.statusTextCancelled,
            isCompleted && styles.statusTextCompleted
          ]}>
            {isConfirmed ? 'Sắp diễn ra' : isCancelled ? 'Đã hủy' : 'Đã hoàn thành'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Body Section: Court & Time */}
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialIcons name="sports-soccer" size={16} color={COLORS.primary} />
          <Text style={styles.courtNameText}>{detail?.courtName || booking.courtName}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="event" size={16} color={COLORS.onSurfaceVariant} />
          <Text style={styles.timeText}>
            {detail?.startTime} - {detail?.endTime} • Ngày {detail?.bookingDate}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.totalPriceLabel}>Tổng tiền:</Text>
          <Text style={styles.totalPriceValue}>{formatCurrency(booking.finalPrice)}</Text>
        </View>
      </View>

      {/* Actions Row */}
      <View style={styles.cardActions}>
        {isConfirmed && (
          <>
            <TouchableOpacity 
              style={styles.btnSecondary}
              activeOpacity={0.8}
              onPress={() => onPressCancel(booking)}
            >
              <MaterialIcons name="cancel" size={15} color={COLORS.error} />
              <Text 
                style={styles.btnSecondaryText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Hủy đặt sân
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnPrimary}
              activeOpacity={0.8}
              onPress={() => onPressShowQR(booking)}
            >
              <MaterialIcons name="qr-code-scanner" size={15} color={COLORS.white} />
              <Text 
                style={styles.btnPrimaryText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Xem QR / Check-in
              </Text>
            </TouchableOpacity>
          </>
        )}

        {isCompleted && (
          <>
            <TouchableOpacity 
              style={[styles.btnSecondary, { flex: 1 }]}
              activeOpacity={0.8}
              onPress={() => onPressCard(booking)}
            >
              <MaterialIcons name="receipt-long" size={16} color={COLORS.primary} />
              <Text 
                style={[styles.btnSecondaryText, { color: COLORS.primary }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Chi tiết
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnPrimary, { flex: 1 }]}
              activeOpacity={0.8}
              onPress={() => onPressReview ? onPressReview(booking) : onPressCard(booking)}
            >
              <MaterialIcons name="rate-review" size={16} color={COLORS.white} />
              <Text 
                style={styles.btnPrimaryText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                Đánh giá sân
              </Text>
            </TouchableOpacity>
          </>
        )}

        {isCancelled && (
          <TouchableOpacity 
            style={[styles.btnSecondary, { flex: 1 }]}
            activeOpacity={0.8}
            onPress={() => onPressCard(booking)}
          >
            <MaterialIcons name="replay" size={16} color={COLORS.primary} />
            <Text 
              style={[styles.btnSecondaryText, { color: COLORS.primary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              Đặt lại sân này
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    flex: 1,
  },
  venueAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  bookingCode: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  statusBadgeConfirmed: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  statusBadgeCancelled: {
    backgroundColor: COLORS.errorContainer,
  },
  statusBadgeCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '700',
  },
  statusTextConfirmed: {
    color: COLORS.primary,
  },
  statusTextCancelled: {
    color: COLORS.error,
  },
  statusTextCompleted: {
    color: '#2E7D32',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginVertical: SPACING.xs + 2,
  },
  cardBody: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  courtNameText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  timeText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  totalPriceLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  totalPriceValue: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    gap: 4,
  },
  btnSecondaryText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.error,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    gap: 4,
  },
  btnPrimaryText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
});
