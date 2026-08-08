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
import { getMyBookingsApi, BookingItem } from '../../../shared/api/bookings';
import { useAlert } from '../../../shared/contexts/AlertContext';

import { BookingTab, BookingFilterTabs } from './components/booking-history/BookingFilterTabs';
import { BookingHistoryCard } from './components/booking-history/BookingHistoryCard';
import { BookingQrModal } from './components/booking-history/BookingQrModal';

export function BookingHistoryScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState<BookingTab>('all');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [selectedQRBooking, setSelectedQRBooking] = useState<BookingItem | null>(null);
  const [selectedCancelBooking, setSelectedCancelBooking] = useState<BookingItem | null>(null);

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
    if (activeTab === 'upcoming') return b.status === 'CONFIRMED' || b.status === 'PENDING';
    if (activeTab === 'completed') return b.status === 'COMPLETED';
    if (activeTab === 'cancelled') return b.status === 'CANCELLED';
    return true;
  });

  // Calculate Tab Counts
  const counts: Record<BookingTab, number> = {
    all: bookings.length,
    upcoming: bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING').length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  const handleCancelConfirm = () => {
    if (!selectedCancelBooking) return;
    setBookings((prev) =>
      prev.map((b) => (b.id === selectedCancelBooking.id ? { ...b, status: 'CANCELLED' } : b))
    );
    setSelectedCancelBooking(null);
    showAlert('Thành công', 'Đơn đặt sân đã được hủy thành công.');
  };

  const handleCardPress = (booking: BookingItem) => {
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
        status: booking.status,
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn} 
            activeOpacity={0.7} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch Sử Đặt Sân</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {/* Reusable Filter Tabs Component */}
      <BookingFilterTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />

      {/* Booking Items List */}
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

      {/* Reusable App ConfirmModal */}
      <ConfirmModal
        visible={!!selectedCancelBooking}
        title="Xác nhận hủy đặt sân?"
        message={`Bạn có chắc chắn muốn hủy đơn đặt sân ${selectedCancelBooking?.bookingCode} tại ${selectedCancelBooking?.venueName} không?`}
        confirmText="Hủy đặt sân"
        cancelText="Giữ đơn"
        confirmVariant="primary"
        icon="warning"
        iconColor={COLORS.error}
        onConfirm={handleCancelConfirm}
        onCancel={() => setSelectedCancelBooking(null)}
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
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.marginMobile,
    paddingBottom: SPACING.xl * 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 16,
    color: COLORS.onSurface,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
  },
});
