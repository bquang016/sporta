import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Linking, 
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui/Button';
import * as Clipboard from 'expo-clipboard';
import { ConfirmModal } from '../../../shared/ui/Modal/ConfirmModal';
import { fetchBookingById } from '../../../entities/booking/api/bookingApi';
import type { BookingResponse } from '../../../entities/booking/model/booking.types';
import { WriteReviewSheet } from '../../../features/venue-rating';

export function BookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const isFromHistory = params.fromHistory === 'true';
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const [showCopySuccessModal, setShowCopySuccessModal] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    if (!code) return;
    try {
      await Clipboard.setStringAsync(code);
    } catch (e) {
      console.error('Lỗi sao chép mã đơn:', e);
    }
    setCopiedCode(code);
    setShowCopySuccessModal(true);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  useEffect(() => {
    const loadBooking = async () => {
      try {
        if (!params.bookingId) {
          setLoading(false);
          return;
        }
        const id = params.bookingId as string;
        const result = await fetchBookingById(id);
        setBooking(result);
      } catch (e) {
        console.error('Lỗi khi tải thông tin đơn đặt sân', e);
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [params.bookingId]);

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const activeBooking: BookingResponse | null = booking || (params.bookingId ? {
    id: params.bookingId as string,
    bookingCode: (params.bookingCode as string) || `#SP${params.bookingId}`,
    venueName: (params.venueName as string) || 'Sân thể thao Sporta',
    venueLocation: (params.venueLocation as string) || '',
    venuePhone: (params.venuePhone as string) || '',
    courtName: (params.courtName as string) || 'Sân tiêu chuẩn',
    courtType: (params.courtType as string) || 'Sân tiêu chuẩn',
    totalPrice: Number(params.finalPrice) || 0,
    finalPrice: Number(params.finalPrice) || 0,
    status: (params.status as any) || 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentMethod: (params.paymentMethod as string) || 'payos',
    playerName: (params.playerName as string) || '',
    playerEmail: (params.playerEmail as string) || '',
    createdAt: new Date().toISOString(),
    details: [
      {
        courtName: (params.courtName as string) || 'Sân tiêu chuẩn',
        bookingDate: (params.bookingDate as string) || '',
        startTime: (params.startTime as string) || '',
        endTime: (params.endTime as string) || '',
        price: Number(params.finalPrice) || 0,
      }
    ]
  } : null);

  if (!activeBooking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <MaterialIcons name="error-outline" size={48} color={COLORS.outline} />
          <Text style={styles.title}>Không tìm thấy thông tin đơn đặt sân</Text>
          <Button title="Về trang chủ" onPress={() => router.replace('/(tabs)')} style={{ marginTop: SPACING.md }} />
        </View>
      </SafeAreaView>
    );
  }

  const details = activeBooking.details || [];
  const firstDetail = details[0];

  const formatDateStr = (rawDate?: string) => {
    if (!rawDate) return '';
    if (rawDate.includes('/')) return rawDate;
    if (rawDate.includes('-')) {
      const parts = rawDate.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return rawDate;
  };

  const formatTimeSlot = (t?: string) => {
    if (!t) return '00:00';
    return t.length >= 5 ? t.slice(0, 5) : t;
  };

  const dateStr = firstDetail?.bookingDate 
    ? formatDateStr(firstDetail.bookingDate) 
    : formatDateStr(params.bookingDate as string) || 'Hôm nay';

  const courtNames = Array.from(new Set(details.map(d => d.courtName).filter(Boolean))).join(', ') 
    || (params.courtName as string) 
    || activeBooking.courtName 
    || 'Sân tiêu chuẩn';

  const timesStr = details.length > 0
    ? details.map(d => `${formatTimeSlot(d.startTime)} - ${formatTimeSlot(d.endTime)} (${d.courtName || courtNames})`).join('\n')
    : `${formatTimeSlot(params.startTime as string)} - ${formatTimeSlot(params.endTime as string)} (${courtNames})`;

  const openGoogleMaps = (location: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || activeBooking.venueName)}`;
    Linking.openURL(url);
  };

  const formatCurrency = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + ' VNĐ';
  };

  const formatPaymentTime = (dateString?: string) => {
    if (!dateString) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      return `${hours}:${minutes} - ${day}/${month}/${year}`;
    }

    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${hours}:${minutes} - ${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  const getPaymentMethodDisplay = (method?: string) => {
    if (!method) return { label: 'Cổng thanh toán PayOS', icon: 'card-outline' };
    const m = method.toLowerCase();
    if (m === 'wallet') return { label: 'Ví Sporta', icon: 'wallet-outline' };
    if (m === 'payos' || m.includes('qr')) return { label: 'Cổng thanh toán PayOS (QR Code / Ngân hàng)', icon: 'qr-code-outline' };
    if (m === 'vnpay') return { label: 'Cổng thanh toán VNPay', icon: 'card-outline' };
    if (m === 'momo') return { label: 'Ví điện tử MoMo', icon: 'wallet-outline' };
    if (m === 'bank' || m === 'transfer') return { label: 'Chuyển khoản trực tiếp', icon: 'business-outline' };
    if (m === 'card') return { label: 'Thẻ ATM / Visa / Mastercard', icon: 'card-outline' };
    return { label: method, icon: 'checkmark-circle-outline' };
  };

  const paymentInfo = getPaymentMethodDisplay(activeBooking.paymentMethod);
  const isCancelled = activeBooking.status === 'CANCELLED';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header if navigating from Booking History */}
      {isFromHistory ? (
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi Tiết Đơn Đặt Sân</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>
      ) : null}

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Hero Success Header ── */}
        {!isFromHistory ? (
          <View style={styles.heroSection}>
            <View style={styles.successIconCircle}>
              <View style={styles.successIconInner}>
                <Ionicons name="checkmark" size={38} color={COLORS.white} />
              </View>
            </View>
            
            <Text style={styles.heroTitle}>Đặt sân thành công!</Text>
            <Text style={styles.heroSubtitle}>
              Cảm ơn bạn đã lựa chọn Sporta. Đơn đặt sân của bạn đã được xác nhận và giữ chỗ thành công.
            </Text>
          </View>
        ) : null}

        {/* ── Booking Code Ticket Pill ── */}
        <View style={styles.codeBadgeCard}>
          <View style={styles.codeLeft}>
            <Text style={styles.codeLabel}>MÃ ĐƠN ĐẶT SÂN</Text>
            <Text style={styles.codeText}>{activeBooking.bookingCode}</Text>
          </View>

          <TouchableOpacity
            style={[styles.copyBtn, copiedCode === activeBooking.bookingCode && styles.copyBtnActive]}
            onPress={() => handleCopyCode(activeBooking.bookingCode)}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={copiedCode === activeBooking.bookingCode ? "checkmark" : "copy-outline"} 
              size={15} 
              color={copiedCode === activeBooking.bookingCode ? COLORS.primary : COLORS.onSurface} 
            />
            <Text style={[styles.copyBtnText, copiedCode === activeBooking.bookingCode && styles.copyBtnTextActive]}>
              {copiedCode === activeBooking.bookingCode ? 'Đã chép' : 'Sao chép'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 2. Venue & Location Card ── */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="football" size={18} color={COLORS.primary} />
              <Text style={styles.cardHeaderTitle}>Thông tin sân thể thao</Text>
            </View>
            <View style={[styles.statusBadge, isCancelled && styles.statusBadgeCancelled]}>
              <Ionicons 
                name={isCancelled ? "close-circle" : "checkmark-circle"} 
                size={14} 
                color={isCancelled ? COLORS.error : COLORS.primary} 
              />
              <Text style={[styles.statusBadgeText, isCancelled && styles.statusBadgeTextCancelled]}>
                {isCancelled ? 'Đã hủy' : 'Đã xác nhận'}
              </Text>
            </View>
          </View>

          <Text style={styles.venueNameText}>{activeBooking.venueName}</Text>
          
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.outline} style={{ marginTop: 2 }} />
            <Text style={styles.addressText}>{activeBooking.venueLocation || 'Địa chỉ sân thể thao Sporta'}</Text>
          </View>

          <View style={styles.venueActionButtonsRow}>
            <TouchableOpacity 
              style={styles.directionsBtn} 
              activeOpacity={0.85}
              onPress={() => openGoogleMaps(activeBooking.venueLocation || activeBooking.venueName)}
            >
              <Ionicons name="navigate" size={15} color={COLORS.white} />
              <Text style={styles.directionsBtnText}>Chỉ đường Google Maps</Text>
            </TouchableOpacity>

            {activeBooking.venuePhone ? (
              <TouchableOpacity 
                style={styles.callVenueBtn} 
                activeOpacity={0.85}
                onPress={() => Linking.openURL(`tel:${activeBooking.venuePhone}`)}
              >
                <Ionicons name="call-outline" size={15} color={COLORS.primary} />
                <Text style={styles.callVenueBtnText}>Gọi chủ sân</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* ── 3. Booking Schedule & Court Details Card ── */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            <Text style={styles.cardHeaderTitle}>Chi tiết lịch đặt sân</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Loại sân / Sân số:</Text>
            <Text style={styles.infoValueBold}>{courtNames}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày đá:</Text>
            <Text style={styles.infoValueBold}>{dateStr}</Text>
          </View>

          <View style={styles.infoRowTop}>
            <Text style={styles.infoLabel}>Khung giờ đặt:</Text>
            <View style={styles.timesContainer}>
              {details.length > 0 ? (
                details.map((d, index) => (
                  <View key={index} style={styles.timePill}>
                    <Ionicons name="time-outline" size={13} color={COLORS.primary} />
                    <Text style={styles.timePillText}>
                      {formatTimeSlot(d.startTime)} - {formatTimeSlot(d.endTime)} ({d.courtName || courtNames})
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.timePill}>
                  <Ionicons name="time-outline" size={13} color={COLORS.primary} />
                  <Text style={styles.timePillText}>{timesStr}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ── 4. Customer Info (If available) ── */}
        {activeBooking.playerName || activeBooking.playerEmail ? (
          <View style={styles.sectionCard}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="person-outline" size={18} color={COLORS.primary} />
              <Text style={styles.cardHeaderTitle}>Thông tin người đặt</Text>
            </View>

            {activeBooking.playerName ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Khách hàng:</Text>
                <Text style={styles.infoValue}>{activeBooking.playerName}</Text>
              </View>
            ) : null}

            {activeBooking.playerEmail ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email / Liên hệ:</Text>
                <Text style={styles.infoValue}>{activeBooking.playerEmail}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* ── 5. Payment Details Card (Key Feature) ── */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
            <Text style={styles.cardHeaderTitle}>Thông tin thanh toán</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tiền thuê sân gốc:</Text>
            <Text style={styles.infoValue}>
              {formatCurrency(activeBooking.totalPrice || activeBooking.finalPrice || 0)}
            </Text>
          </View>

          {activeBooking.discountAmount && activeBooking.discountAmount > 0 ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Voucher giảm giá:</Text>
              <Text style={[styles.infoValue, { color: COLORS.error, fontWeight: '700' }]}>
                -{formatCurrency(activeBooking.discountAmount)}
              </Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.totalPaymentRow}>
            <View>
              <Text style={styles.totalPaymentLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalPaymentSub}>Đã bao gồm thuế & phí sân</Text>
            </View>
            <Text style={styles.totalPaymentValue}>
              {formatCurrency(activeBooking.finalPrice || activeBooking.totalPrice || 0)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Payment Method Badge */}
          <View style={styles.infoRowTop}>
            <Text style={styles.infoLabel}>Phương thức thanh toán:</Text>
            <View style={styles.paymentMethodGroup}>
              <View style={styles.paymentMethodPill}>
                <Ionicons name={paymentInfo.icon as any} size={15} color={COLORS.primary} />
                <Text style={styles.paymentMethodLabel}>{paymentInfo.label}</Text>
              </View>
              <View style={styles.paidStatusBadge}>
                <Ionicons name="checkmark-done" size={13} color="#059669" />
                <Text style={styles.paidStatusText}>Thanh toán thành công</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời gian thanh toán:</Text>
            <Text style={styles.infoValue}>{formatPaymentTime(activeBooking.createdAt)}</Text>
          </View>
        </View>

        {/* ── 6. Check-in Guidelines & Support Card ── */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.noticeTitle}>Hướng dẫn nhận sân</Text>
          </View>
          <Text style={styles.noticeText}>
            • Vui lòng có mặt tại sân trước 10-15 phút giờ đá.
          </Text>
          <Text style={styles.noticeText}>
            • Khi nhận sân, chỉ cần đọc mã đơn <Text style={{ fontWeight: '800', color: COLORS.primary }}>{activeBooking.bookingCode}</Text> cho quản lý sân để được hỗ trợ nhận sân nhanh chóng.
          </Text>

          <View style={styles.hotlineDivider} />

          <View style={styles.hotlineRow}>
            <View style={styles.hotlineLeft}>
              <Ionicons name="headset-outline" size={18} color={COLORS.primary} />
              <Text style={styles.hotlineText}>Hotline hỗ trợ Sporta 24/7: <Text style={styles.hotlineNum}>1900 6868</Text></Text>
            </View>
            <TouchableOpacity 
              style={styles.hotlineCallBtn} 
              activeOpacity={0.8}
              onPress={() => Linking.openURL('tel:19006868')}
            >
              <Text style={styles.hotlineCallBtnText}>Gọi ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 7. Rating Review Section for Completed Bookings ── */}
        {activeBooking.status === 'COMPLETED' ? (
          <View style={styles.reviewPromptCard}>
            <View style={styles.reviewPromptLeft}>
              <Ionicons name="star" size={24} color="#F59E0B" />
              <View style={styles.reviewPromptTextGroup}>
                <Text style={styles.reviewPromptTitle}>Đánh giá trải nghiệm sân</Text>
                <Text style={styles.reviewPromptSub}>Chia sẻ cảm nhận về cơ sở vật chất & dịch vụ</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.reviewPromptBtn}
              activeOpacity={0.85}
              onPress={() => setShowReviewSheet(true)}
            >
              <Ionicons name="create-outline" size={15} color={COLORS.white} />
              <Text style={styles.reviewPromptBtnText}>Viết đánh giá</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── 8. Cancellation Policy (If applicable) ── */}
        {!isCancelled && activeBooking.status !== 'COMPLETED' ? (
          <View style={styles.cancelPolicySection}>
            <TouchableOpacity 
              style={styles.cancelBookingBtn} 
              activeOpacity={0.85}
              onPress={() => setShowCancelConfirmModal(true)}
            >
              <Ionicons name="close-circle-outline" size={17} color={COLORS.error} />
              <Text style={styles.cancelBookingBtnText}>Yêu cầu hủy đặt sân</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      {/* ── Sticky Bottom Action Bar ── */}
      <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {activeBooking.status === 'COMPLETED' ? (
          <Button 
            title="Đánh giá sân ngay" 
            variant="secondary" 
            icon={<Ionicons name="star" size={18} color={COLORS.onSecondary} />}
            onPress={() => setShowReviewSheet(true)}
            style={styles.actionBtn}
          />
        ) : (
          <Button 
            title="Xem lịch sử đặt sân" 
            variant="primary" 
            icon={<Ionicons name="receipt-outline" size={18} color={COLORS.onPrimary} />}
            onPress={() => router.push('/(tabs)/bookings')}
            style={styles.actionBtn}
          />
        )}
        <Button 
          title="Về trang chủ" 
          variant="outline"
          icon={<Ionicons name="home-outline" size={18} color={COLORS.primary} />}
          onPress={() => router.replace('/(tabs)')}
          style={styles.actionBtn}
        />
      </View>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        visible={showCancelConfirmModal}
        title="Hủy đặt sân"
        message={`Bạn có chắc chắn muốn hủy đơn đặt sân ${activeBooking.bookingCode} tại "${activeBooking.venueName}" không?\n\nTiền thanh toán sẽ được hoàn lại ví/tài khoản theo đúng chính sách hoàn hủy của sân.`}
        confirmText="Xác nhận hủy"
        cancelText="Giữ lại đơn"
        confirmVariant="primary"
        icon="warning"
        iconColor={COLORS.error}
        onConfirm={() => {
          setShowCancelConfirmModal(false);
          if (booking) {
            setBooking({ ...booking, status: 'CANCELLED' });
          }
          setShowCancelSuccessModal(true);
        }}
        onCancel={() => setShowCancelConfirmModal(false)}
      />

      {/* Cancel Success Modal */}
      <ConfirmModal
        visible={showCancelSuccessModal}
        title="Hủy đặt sân thành công"
        message={`Đơn đặt sân ${activeBooking.bookingCode} tại "${activeBooking.venueName}" đã được cập nhật sang trạng thái Đã Hủy.\n\nTiền sẽ được tự động hoàn lại ví/tài khoản của bạn.`}
        confirmText="Đã hiểu"
        confirmVariant="primary"
        icon="check-circle"
        iconColor={COLORS.primary}
        onConfirm={() => {
          setShowCancelSuccessModal(false);
          router.replace('/(tabs)');
        }}
      />

      {/* Copy Code Toast Modal */}
      <ConfirmModal
        visible={showCopySuccessModal}
        useViewOverlay={true}
        title="Sao chép thành công"
        message={`Mã đơn hàng "${copiedCode || activeBooking.bookingCode}" đã được sao chép vào bộ nhớ tạm.`}
        confirmText="Đã hiểu"
        confirmVariant="primary"
        icon="check-circle"
        iconColor={COLORS.primary}
        onConfirm={() => setShowCopySuccessModal(false)}
      />

      {/* Review Modal */}
      <WriteReviewSheet
        visible={showReviewSheet}
        venueId={activeBooking.venueId || (booking as any)?.venueId || (params.venueId as string) || null}
        venueName={activeBooking.venueName}
        onClose={() => setShowReviewSheet(false)}
        onSuccess={() => {
          setShowReviewSheet(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9', // Fresh mint-tinted neutral background
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: 12,
  },
  
  /* Hero Section */
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primaryOpacity15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  successIconInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  heroTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13.5,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
  },

  /* Ticket Code Badge */
  codeBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primaryOpacity15,
    borderStyle: 'dashed',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  codeLeft: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  codeText: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    gap: 5,
  },
  copyBtnActive: {
    backgroundColor: COLORS.primaryOpacity10,
    borderColor: COLORS.primaryOpacity25,
  },
  copyBtnText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  copyBtnTextActive: {
    color: COLORS.primary,
  },

  /* Standard Section Card */
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardHeaderTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.primary,
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
  statusBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusBadgeTextCancelled: {
    color: COLORS.error,
  },
  venueNameText: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  addressText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
  },
  venueActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  directionsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  directionsBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.white,
  },
  callVenueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryOpacity10,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity25,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  callVenueBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primary,
  },

  /* Info Rows */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoRowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  infoLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  infoValue: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurface,
    textAlign: 'right',
  },
  infoValueBold: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'right',
  },
  timesContainer: {
    alignItems: 'flex-end',
    gap: 4,
    flex: 1,
    marginLeft: 10,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    gap: 5,
  },
  timePillText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 2,
  },

  /* Total Payment */
  totalPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalPaymentLabel: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  totalPaymentSub: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },
  totalPaymentValue: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },

  /* Payment Method Badges */
  paymentMethodGroup: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paymentMethodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    gap: 5,
  },
  paymentMethodLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  paidStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  paidStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#059669',
  },

  /* Notice Card */
  noticeCard: {
    backgroundColor: COLORS.primaryOpacity08,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
    gap: 6,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  noticeTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  noticeText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12.5,
    color: COLORS.onSurface,
    lineHeight: 18,
  },
  hotlineDivider: {
    height: 1,
    backgroundColor: COLORS.primaryOpacity15,
    marginVertical: 6,
  },
  hotlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hotlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  hotlineText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  hotlineNum: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  hotlineCallBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
  },
  hotlineCallBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },

  /* Cancellation Section */
  cancelPolicySection: {
    alignItems: 'center',
    marginTop: 4,
  },
  cancelBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  cancelBookingBtnText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12.5,
    color: COLORS.error,
    fontWeight: '700',
  },

  /* Review Prompt Card */
  reviewPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  reviewPromptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  reviewPromptTextGroup: {
    flex: 1,
    gap: 2,
  },
  reviewPromptTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  reviewPromptSub: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 15,
  },
  reviewPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  reviewPromptBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },

  /* Sticky Bottom Action Bar */
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  actionBtn: {
    width: '100%',
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    textAlign: 'center',
  },
});
