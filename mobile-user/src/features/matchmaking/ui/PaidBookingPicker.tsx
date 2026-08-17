import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { BookingSummaryVM } from '../../../entities/match/model/match.types';

interface PaidBookingPickerProps {
  bookings: BookingSummaryVM[];
  selectedBookingId?: string;
  onSelectBooking: (booking: BookingSummaryVM) => void;
}

export function PaidBookingPicker({ bookings, selectedBookingId, onSelectBooking }: PaidBookingPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Chọn sân đã đặt (PAID)</Text>
      <Text style={styles.subtext}>
        Chỉ những lịch đặt sân <Text style={{ fontWeight: '800', color: COLORS.primary }}>đã thanh toán thành công</Text> mới được chọn để đăng tìm đối thủ.
      </Text>

      <View style={styles.bookingList}>
        {bookings.map((booking) => {
          const isSelected = selectedBookingId === booking.id;

          return (
            <TouchableOpacity
              key={booking.id}
              activeOpacity={0.88}
              onPress={() => onSelectBooking(booking)}
              style={[styles.bookingCard, isSelected && styles.bookingCardSelected]}
            >
              <View style={styles.bookingHeader}>
                <View style={styles.badgePaid}>
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.white} />
                  <Text style={styles.paidText}>ĐÃ THANH TOÁN</Text>
                </View>
                <Text style={styles.sportBadge}>{booking.sportName} • {booking.format}</Text>
              </View>

              <Text style={styles.facilityName} numberOfLines={1}>
                {booking.facilityName}
              </Text>

              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={15} color={COLORS.onSurfaceVariant} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {booking.date} • <Text style={{ fontWeight: '700', color: COLORS.onSurface }}>{booking.startTime} - {booking.endTime}</Text>
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={15} color={COLORS.onSurfaceVariant} />
                <Text style={styles.infoText} numberOfLines={1}>{booking.courtName}</Text>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.priceText}>
                  Tiền sân: <Text style={{ fontWeight: '900', color: COLORS.primary, fontSize: 14 }}>{booking.totalPrice.toLocaleString('vi-VN')}đ</Text>
                </Text>

                {isSelected ? (
                  <View style={styles.selectedBtn}>
                    <Ionicons name="checkmark" size={14} color={COLORS.white} />
                    <Text style={styles.selectedBtnText}>Đã chọn</Text>
                  </View>
                ) : (
                  <View style={styles.unselectedBtn}>
                    <Text style={styles.selectText}>Chọn sân này</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.08)',
    gap: SPACING.sm,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 16,
  },
  subtext: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  bookingList: {
    gap: SPACING.sm,
    marginTop: 4,
  },
  bookingCard: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    gap: 8,
  },
  bookingCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(6, 78, 59, 0.05)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgePaid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  paidText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 9.5,
  },
  sportBadge: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '600',
  },
  facilityName: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  priceText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurface,
  },
  unselectedBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  selectText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  selectedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  selectedBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 11.5,
  },
});
