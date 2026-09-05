import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Ionicons } from '@expo/vector-icons';
import { BookingSummaryVM } from '../../../entities/match/model/match.types';

interface PaidBookingPickerProps {
  bookings: BookingSummaryVM[];
  selectedBookingId?: string;
  onSelectBooking: (booking: BookingSummaryVM) => void;
  selectedSportName?: string;
  stepNumber?: number;
}

export function PaidBookingPicker({ bookings, selectedBookingId, onSelectBooking, selectedSportName, stepNumber = 3 }: PaidBookingPickerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.sectionIconCircle}>
          <Ionicons name="calendar" size={16} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{stepNumber}. Chọn Sân Đã Đặt</Text>
          <Text style={styles.subtext}>
            Chỉ những lịch sân <Text style={{ fontWeight: '800', color: COLORS.primary }}>đã thanh toán thành công (CONFIRMED)</Text> mới có thể dùng để tạo kèo.
          </Text>
        </View>
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="calendar-outline" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>
            {selectedSportName
              ? `Chưa có đơn đặt sân môn ${selectedSportName}`
              : 'Bạn chưa có đơn đặt sân nào'}
          </Text>
          <Text style={styles.emptySub}>
            {selectedSportName
              ? `Hệ thống tự động lọc các đơn sân thuộc môn ${selectedSportName}. Hãy đặt sân trước để có thể đăng bài tìm đối thủ.`
              : 'Để tạo bài đăng tìm đối thủ ghép trận, bạn cần tìm sân và hoàn tất đặt sân trước.'}
          </Text>
        </View>
      ) : (
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
                    <Ionicons name="checkmark-circle" size={13} color="#FFFFFF" />
                    <Text style={styles.paidText}>ĐÃ THANH TOÁN</Text>
                  </View>
                  <View style={styles.sportBadge}>
                    <Text style={styles.sportBadgeText}>{booking.sportName} • {booking.format}</Text>
                  </View>
                </View>

                <Text style={styles.facilityName} numberOfLines={1}>
                  {booking.facilityName}
                </Text>

                <View style={styles.infoBlock}>
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={14} color="#0284C7" />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {booking.date} • <Text style={{ fontWeight: '800', color: COLORS.onSurface }}>{booking.startTime} - {booking.endTime}</Text>
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={14} color="#059669" />
                    <Text style={styles.infoText} numberOfLines={1}>{booking.courtName}</Text>
                  </View>
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.priceLabel}>
                    Tiền sân: <Text style={styles.priceValue}>{booking.totalPrice.toLocaleString('vi-VN')}đ</Text>
                  </Text>

                  <View style={[styles.selectBtn, isSelected && styles.selectBtnSelected]}>
                    {isSelected ? (
                      <>
                        <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                        <Text style={styles.selectBtnTextSelected}>Đã chọn</Text>
                      </>
                    ) : (
                      <Text style={styles.selectBtnText}>Chọn sân</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 15.5,
  },
  subtext: {
    ...TYPOGRAPHY.bodyMd,
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  bookingList: {
    gap: 8,
  },
  bookingCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
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
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: BORDER_RADIUS.full,
  },
  paidText: {
    ...TYPOGRAPHY.labelSm,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 9.5,
  },
  sportBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  sportBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  facilityName: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 14.5,
  },
  infoBlock: {
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  priceLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: '#64748B',
  },
  priceValue: {
    fontWeight: '900',
    color: COLORS.primary,
    fontSize: 13.5,
  },
  selectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  selectBtnSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: '#475569',
    fontWeight: '700',
    fontSize: 11.5,
  },
  selectBtnTextSelected: {
    ...TYPOGRAPHY.labelSm,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11.5,
  },
  emptyContainer: {
    padding: SPACING.md,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 13.5,
    textAlign: 'center',
  },
  emptySub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
});
