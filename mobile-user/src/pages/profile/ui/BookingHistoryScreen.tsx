import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { ConfirmModal } from '../../../shared/ui/Modal/ConfirmModal';
import { getMyBookingsApi, getEffectiveBookingStatus, BookingItem, CancelBookingResponseData } from '../../../shared/api/bookings';
import { useAlert } from '../../../shared/contexts/AlertContext';

import { BookingTab, BookingFilterTabs } from './components/booking-history/BookingFilterTabs';
import { BookingHistoryCard } from './components/booking-history/BookingHistoryCard';
import { BookingQrModal } from './components/booking-history/BookingQrModal';
import { CancellationPreviewModal } from '../../../features/booking/ui/CancellationPreviewModal';
import { WriteReviewSheet } from '../../../features/venue-rating';

interface BookingHistoryScreenProps {
  showHeader?: boolean;
}

export function BookingHistoryScreen({ showHeader = true }: BookingHistoryScreenProps) {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState<BookingTab>('all');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [selectedQRBooking, setSelectedQRBooking] = useState<BookingItem | null>(null);
  const [selectedCancelBooking, setSelectedCancelBooking] = useState<BookingItem | null>(null);
  const [cancelSuccessData, setCancelSuccessData] = useState<CancelBookingResponseData | null>(null);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<BookingItem | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getMyBookingsApi();
      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter Bookings by Tab
  const filteredBookings = bookings.filter((b) => {
    const status = getEffectiveBookingStatus(b);
    if (activeTab === 'upcoming') return status === 'CONFIRMED' || status === 'PENDING';
    if (activeTab === 'completed') return status === 'COMPLETED';
    if (activeTab === 'cancelled') return status === 'CANCELLED';
    return true;
  });

  // Calculate Tab Counts
  const counts: Record<BookingTab, number> = {
    all: bookings.length,
    upcoming: bookings.filter((b) => {
      const s = getEffectiveBookingStatus(b);
      return s === 'CONFIRMED' || s === 'PENDING';
    }).length,
    completed: bookings.filter((b) => getEffectiveBookingStatus(b) === 'COMPLETED').length,
    cancelled: bookings.filter((b) => getEffectiveBookingStatus(b) === 'CANCELLED').length,
  };

  const handleCancelSuccess = (result: CancelBookingResponseData) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === result.bookingId
          ? {
              ...b,
              status: 'CANCELLED',
              refundAmount: result.refundAmount,
              refundRate: result.refundRate,
              cancelledAt: result.cancelledAt,
            }
          : b
      )
    );
    setSelectedCancelBooking(null);
    setCancelSuccessData(result);
  };

  const handleCardPress = (booking: BookingItem) => {
    const effectiveStatus = getEffectiveBookingStatus(booking);
    router.push({
      pathname: '/booking/success' as any,
      params: {
        bookingId: booking.id,
        fromHistory: 'true',
        bookingCode: booking.bookingCode,
        venueName: booking.venueName,
        venueLocation: booking.venueLocation,
        venuePhone: booking.venuePhone,
        courtName: booking.details?.[0]?.courtName || booking.courtName,
        bookingDate: booking.details?.[0]?.bookingDate,
        startTime: booking.details?.[0]?.startTime,
        endTime: booking.details?.[0]?.endTime,
        finalPrice: booking.finalPrice,
        paymentMethod: booking.paymentMethod,
        status: effectiveStatus,
      },
    });
  };

  const formatVND = (val?: number) => {
    if (!val) return '0 đ';
    return val.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header (optional) */}
      {showHeader && (
        <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backBtn} 
              activeOpacity={0.7} 
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.onSurface} />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Lịch sử đặt sân</Text>
            
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      )}

      {/* Top Filter Tabs */}
      <BookingFilterTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        counts={counts} 
      />

      {/* List content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={fetchBookings} 
            colors={[COLORS.primary]} 
          />
        }
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={64} color={COLORS.outline} />
            <Text style={styles.emptyTitle}>Chưa có đơn đặt sân nào</Text>
            <Text style={styles.emptySubtitle}>Các đơn đặt sân thuộc danh mục này sẽ xuất hiện tại đây.</Text>
          </View>
        ) : (
          filteredBookings.map((b) => (
            <BookingHistoryCard
              key={b.id}
              booking={b}
              onPressCard={handleCardPress}
              onPressShowQR={(item) => setSelectedQRBooking(item)}
              onPressCancel={(item) => setSelectedCancelBooking(item)}
              onPressReview={(item) => setSelectedReviewBooking(item)}
            />
          ))
        )}
      </ScrollView>

      {/* Reusable QR Modal Component */}
      <BookingQrModal
        visible={!!selectedQRBooking}
        booking={selectedQRBooking}
        onClose={() => setSelectedQRBooking(null)}
      />

      {/* Dedicated Cancellation Preview & Refund Modal */}
      <CancellationPreviewModal
        visible={!!selectedCancelBooking}
        booking={selectedCancelBooking}
        onClose={() => setSelectedCancelBooking(null)}
        onSuccess={handleCancelSuccess}
      />

      {/* Cancellation Success App Modal */}
      <ConfirmModal
        visible={!!cancelSuccessData}
        title="Hủy đặt sân thành công"
        message={
          cancelSuccessData?.refundAmount && cancelSuccessData.refundAmount > 0
            ? `${cancelSuccessData.message}\n\nSố dư ví Sporta hiện tại: ${formatVND(cancelSuccessData.userWalletBalance)}`
            : cancelSuccessData?.message || 'Đơn đặt sân đã được hủy thành công.'
        }
        confirmText="Xem Ví Sporta"
        cancelText="Đóng"
        confirmVariant="primary"
        icon="check-circle"
        iconColor={COLORS.primary}
        onConfirm={() => {
          setCancelSuccessData(null);
          router.push('/wallet' as any);
        }}
        onCancel={() => setCancelSuccessData(null)}
      />

      {/* Review Modal */}
      <WriteReviewSheet
        visible={!!selectedReviewBooking}
        venueId={selectedReviewBooking?.venueId || null}
        venueName={selectedReviewBooking?.venueName}
        onClose={() => setSelectedReviewBooking(null)}
        onSuccess={() => {
          setSelectedReviewBooking(null);
          showAlert('Thành công', 'Đánh giá của bạn đã được đăng thành công!');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  scrollContent: {
    padding: SPACING.marginMobile,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: SPACING.sm,
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: SPACING.sm,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});
