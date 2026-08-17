import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { MaterialIcons } from '@expo/vector-icons';
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
        Chỉ những lịch đặt sân <Text style={{ fontWeight: '700', color: COLORS.primary }}>đã thanh toán thành công</Text> mới được sử dụng để đăng tìm đối thủ.
      </Text>

      <View style={styles.bookingList}>
        {bookings.map((booking) => {
          const isSelected = selectedBookingId === booking.id;

          return (
            <TouchableOpacity
              key={booking.id}
              activeOpacity={0.8}
              onPress={() => onSelectBooking(booking)}
              style={[styles.bookingCard, isSelected && styles.bookingCardSelected]}
            >
              <View style={styles.bookingHeader}>
                <View style={styles.badgePaid}>
                  <MaterialIcons name="check-circle" size={14} color={COLORS.white} />
                  <Text style={styles.paidText}>ĐÃ THANH TOÁN</Text>
                </View>
                <Text style={styles.sportBadge}>{booking.sportName} • {booking.format}</Text>
              </View>

              <Text style={styles.facilityName}>{booking.facilityName}</Text>

              <View style={styles.infoRow}>
                <MaterialIcons name="event" size={14} color={COLORS.onSurfaceVariant} />
                <Text style={styles.infoText}>{booking.date} • {booking.startTime} - {booking.endTime}</Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons name="meeting-room" size={14} color={COLORS.onSurfaceVariant} />
                <Text style={styles.infoText}>{booking.courtName}</Text>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.priceText}>
                  Tổng tiền: <Text style={{ fontWeight: '800', color: COLORS.primary }}>{booking.totalPrice.toLocaleString('vi-VN')}đ</Text>
                </Text>

                {isSelected ? (
                  <View style={styles.selectedBtn}>
                    <MaterialIcons name="check" size={16} color={COLORS.white} />
                    <Text style={styles.selectedBtnText}>Đã chọn</Text>
                  </View>
                ) : (
                  <Text style={styles.selectText}>Chọn sân này</Text>
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
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    gap: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  subtext: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  bookingList: {
    gap: SPACING.sm,
  },
  bookingCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 6,
  },
  bookingCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(6, 78, 59, 0.04)',
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paidText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 9,
  },
  sportBadge: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  facilityName: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '700',
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
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  priceText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurface,
  },
  selectText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  selectedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  selectedBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 11,
  },
});
