import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  StatusBar,
  Image,
  Modal,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import { ConfirmModal } from '../../../shared/ui/Modal/ConfirmModal';
import { getMyBookingsApi, BookingItem } from '../../../shared/api/bookings';
import { useAlert } from '../../../shared/contexts/AlertContext';

export type BookingTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

const FILTER_TABS: { id: BookingTab; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'all', label: 'Tất cả', icon: 'list-alt' },
  { id: 'upcoming', label: 'Sắp diễn ra', icon: 'event' },
  { id: 'completed', label: 'Hoàn thành', icon: 'task-alt' },
  { id: 'cancelled', label: 'Đã hủy', icon: 'cancel' },
];

const MOCK_BOOKINGS: BookingItem[] = [
  {
    id: 'b-1',
    bookingCode: '#SP9A82X1',
    venueName: 'Sân bóng đá Chuyên Việt',
    venueAvatar: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&auto=format&fit=crop&q=80',
    venueLocation: 'Đại học Y Hà Nội, Khương Thượng, Đống Đa, Hà Nội',
    venuePhone: '0988123456',
    courtName: 'Sân 7 người (Sân A1)',
    courtType: 'Sân 7 người',
    totalPrice: 350000,
    finalPrice: 350000,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentMethod: 'VNPay QR',
    createdAt: '2026-07-28T14:30:00',
    details: [
      {
        courtName: 'Sân 7 người (Sân A1)',
        bookingDate: '30/07/2026',
        startTime: '18:00',
        endTime: '19:30',
        price: 350000,
      }
    ]
  },
  {
    id: 'b-2',
    bookingCode: '#SP7K21M4',
    venueName: 'CLB Pickleball Cầu Giấy',
    venueAvatar: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&auto=format&fit=crop&q=80',
    venueLocation: 'Số 1 Phạm Văn Đồng, Mai Dịch, Cầu Giấy, Hà Nội',
    venuePhone: '0977234567',
    courtName: 'Sân Pickleball 02',
    courtType: 'Sân tiêu chuẩn',
    totalPrice: 240000,
    finalPrice: 240000,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentMethod: 'MoMo Wallet',
    createdAt: '2026-07-20T09:15:00',
    details: [
      {
        courtName: 'Sân Pickleball 02',
        bookingDate: '22/07/2026',
        startTime: '17:00',
        endTime: '18:00',
        price: 240000,
      }
    ]
  },
  {
    id: 'b-3',
    bookingCode: '#SP3F99Y2',
    venueName: 'Nhà thi đấu Cầu lông Bách Khoa',
    venueAvatar: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=200&auto=format&fit=crop&q=80',
    venueLocation: 'Số 40 Tạ Quang Bửu, Bách Khoa, Hai Bà Trưng, Hà Nội',
    venuePhone: '0966345678',
    courtName: 'Sân Cầu lông B2',
    courtType: 'Sân thảm PVC',
    totalPrice: 180000,
    finalPrice: 180000,
    status: 'CANCELLED',
    paymentStatus: 'UNPAID',
    paymentMethod: 'Chuyển khoản ngân hàng',
    createdAt: '2026-07-15T11:00:00',
    details: [
      {
        courtName: 'Sân Cầu lông B2',
        bookingDate: '16/07/2026',
        startTime: '19:00',
        endTime: '20:00',
        price: 180000,
      }
    ]
  }
];

export function BookingHistoryScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState<BookingTab>('all');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [selectedQRBooking, setSelectedQRBooking] = useState<BookingItem | null>(null);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<BookingItem | null>(null);
  const [selectedDetailBooking, setSelectedDetailBooking] = useState<BookingItem | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<BookingItem | null>(null);
  const [rating, setRating] = useState(5);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getMyBookingsApi();
      if (Array.isArray(data) && data.length > 0) {
        setBookings(data);
      } else {
        setBookings(MOCK_BOOKINGS);
      }
    } catch (err) {
      console.warn('Lỗi tải lịch sử đặt sân, sử dụng dữ liệu mẫu:', err);
      setBookings(MOCK_BOOKINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/profile' as any);
    }
  };

  // Categorize booking into tabs
  const getBookingCategory = (b: BookingItem | null): 'upcoming' | 'completed' | 'cancelled' => {
    if (!b) return 'completed';
    if (b.status === 'CANCELLED') return 'cancelled';

    const detail = b.details && b.details.length > 0 ? b.details[0] : null;
    if (!detail || !detail.bookingDate) return 'completed';

    // Parse date in format DD/MM/YYYY or YYYY-MM-DD
    let playDateStr = detail.bookingDate;
    if (playDateStr.includes('/')) {
      const parts = playDateStr.split('/');
      if (parts.length === 3) {
        playDateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    const fullTimeStr = `${playDateStr}T${detail.endTime || '23:59:59'}`;
    const playDateTime = new Date(fullTimeStr).getTime();
    const nowTime = new Date().getTime();

    if (isNaN(playDateTime) || playDateTime >= nowTime) {
      return 'upcoming';
    } else {
      return 'completed';
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'all') return true;
    return getBookingCategory(b) === activeTab;
  });

  const getStatusTag = (category: 'upcoming' | 'completed' | 'cancelled') => {
    switch (category) {
      case 'upcoming':
        return {
          label: 'Sắp diễn ra',
          bg: COLORS.primaryOpacity15,
          text: COLORS.primary,
        };
      case 'completed':
        return {
          label: 'Hoàn thành',
          bg: COLORS.surfaceContainerLow,
          text: COLORS.onSurfaceVariant,
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          bg: COLORS.errorContainer,
          text: COLORS.error,
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VNĐ';
  };

  // Handlers for Quick Actions
  const handleCancelBooking = (booking: BookingItem) => {
    setCancellingBooking(booking);
  };

  const handleConfirmCancel = () => {
    if (!cancellingBooking) return;
    const targetId = cancellingBooking.id;
    setBookings(prev => prev.map(b => b.id === targetId ? { ...b, status: 'CANCELLED' } : b));
    setCancellingBooking(null);
    showAlert('Đã hủy đơn thành công', 'Đơn đặt sân của bạn đã được cập nhật sang trạng thái Đã Hủy.');
  };

  const handleRebook = (booking: BookingItem) => {
    router.push('/(tabs)/search' as any);
  };

  const handleSubmitReview = () => {
    showAlert('Cảm ơn bạn', 'Đánh giá của bạn đã được ghi nhận thành công!');
    setSelectedReviewBooking(null);
  };

  const openGoogleMaps = (location: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={handleBackPress}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch Sử Đặt Sân</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      {/* Filter Tabs Bar */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabsContainer}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabChip,
                  isActive && styles.tabChipActive
                ]}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.id)}
              >
                <MaterialIcons 
                  name={tab.icon} 
                  size={16} 
                  color={isActive ? COLORS.white : COLORS.onSurfaceVariant} 
                />
                <Text style={[
                  styles.tabChipText,
                  isActive && styles.tabChipTextActive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Bookings List */}
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
        {filteredBookings.length > 0 ? (
          filteredBookings.map((b) => {
            const category = getBookingCategory(b);
            const statusTag = getStatusTag(category);
            const detail = b.details && b.details.length > 0 ? b.details[0] : null;

            const timeStr = detail 
              ? `${detail.startTime?.substring(0, 5)} - ${detail.endTime?.substring(0, 5)} | ${detail.bookingDate}`
              : 'Thời gian chưa cập nhật';

            const courtFullTitle = `${b.venueName} - ${detail?.courtName || b.courtName || 'Sân tiêu chuẩn'}`;

            return (
              <TouchableOpacity 
                key={b.id} 
                style={styles.bookingCard}
                activeOpacity={0.9}
                onPress={() => setSelectedDetailBooking(b)}
              >
                {/* Header Row: Venue Avatar, Name & Status Tag */}
                <View style={styles.cardHeaderRow}>
                  {/* Venue Avatar */}
                  <Image 
                    source={{ 
                      uri: b.venueAvatar || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&auto=format&fit=crop&q=80' 
                    }} 
                    style={styles.venueAvatar} 
                  />

                  {/* Name & Type */}
                  <View style={styles.venueInfoCol}>
                    <Text style={styles.venueTitle} numberOfLines={2}>
                      {courtFullTitle}
                    </Text>
                  </View>

                  {/* Status Tag */}
                  <View style={[styles.statusTag, { backgroundColor: statusTag.bg }]}>
                    <Text style={[styles.statusTagText, { color: statusTag.text }]}>
                      {statusTag.label}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.cardDivider} />

                {/* Quick Info Rows */}
                <View style={styles.cardBody}>
                  {/* Mã đơn */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mã đặt sân:</Text>
                    <Text style={styles.bookingCodeValue}>{b.bookingCode}</Text>
                  </View>

                  {/* Thời gian */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Thời gian:</Text>
                    <Text style={styles.infoValue}>{timeStr}</Text>
                  </View>

                  {/* Tổng tiền & Trạng thái thanh toán */}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Thanh toán:</Text>
                    <Text style={styles.paymentValue}>
                      {formatCurrency(b.finalPrice || b.totalPrice)} - {b.status === 'CANCELLED' ? 'Đã hủy' : 'Đã thanh toán'}
                    </Text>
                  </View>
                </View>

                {/* Quick Action Buttons */}
                <View style={styles.cardFooterActions}>
                  {category === 'upcoming' && (
                    <>
                      <TouchableOpacity 
                        style={styles.primaryActionBtn}
                        activeOpacity={0.85}
                        onPress={(e) => {
                          e.stopPropagation();
                          setSelectedQRBooking(b);
                        }}
                      >
                        <MaterialIcons name="qr-code-scanner" size={16} color={COLORS.white} />
                        <Text style={styles.primaryActionBtnText}>Xem mã QR / Check-in</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.cancelActionBtn}
                        activeOpacity={0.85}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleCancelBooking(b);
                        }}
                      >
                        <Text style={styles.cancelActionBtnText}>Hủy đặt sân</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {category === 'completed' && (
                    <>
                      <TouchableOpacity 
                        style={styles.primaryActionBtn}
                        activeOpacity={0.85}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRebook(b);
                        }}
                      >
                        <MaterialIcons name="replay" size={16} color={COLORS.white} />
                        <Text style={styles.primaryActionBtnText}>Đặt lại</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.outlineActionBtn}
                        activeOpacity={0.85}
                        onPress={(e) => {
                          e.stopPropagation();
                          setSelectedReviewBooking(b);
                        }}
                      >
                        <MaterialIcons name="star-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.outlineActionBtnText}>Đánh giá sân</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {category === 'cancelled' && (
                    <TouchableOpacity 
                      style={styles.primaryActionBtn}
                      activeOpacity={0.85}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRebook(b);
                      }}
                    >
                      <MaterialIcons name="replay" size={16} color={COLORS.white} />
                      <Text style={styles.primaryActionBtnText}>Đặt lại sân này</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={64} color={COLORS.outline} />
            <Text style={styles.emptyTitle}>Chưa có đơn đặt sân nào</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'all' 
                ? 'Bạn chưa thực hiện đơn đặt sân nào trên ứng dụng Sporta.'
                : `Không tìm thấy đơn đặt sân thuộc mục "${FILTER_TABS.find(t => t.id === activeTab)?.label}".`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Full Booking Details Modal */}
      <Modal
        visible={!!selectedDetailBooking}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedDetailBooking(null)}
      >
        <SafeAreaView style={styles.detailModalContainer}>
          {/* Header */}
          <View style={styles.detailModalHeader}>
            <TouchableOpacity 
              onPress={() => setSelectedDetailBooking(null)} 
              style={styles.backButton}
            >
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.detailModalHeaderTitle}>Chi Tiết Đơn Đặt Sân</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <ScrollView 
            contentContainerStyle={styles.detailModalScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Thông tin sân */}
            <View style={styles.detailSectionCard}>
              <Text style={styles.sectionHeaderTitle}>1. Thông tin sân</Text>
              <Text style={styles.venueDetailName}>{selectedDetailBooking?.venueName}</Text>
              <Text style={styles.venueDetailAddress}>{selectedDetailBooking?.venueLocation}</Text>
              
              <TouchableOpacity 
                style={styles.directionsBtn} 
                activeOpacity={0.85}
                onPress={() => openGoogleMaps(selectedDetailBooking?.venueLocation || '')}
              >
                <MaterialIcons name="directions" size={18} color={COLORS.white} />
                <Text style={styles.directionsBtnText}>Chỉ đường (Google Maps)</Text>
              </TouchableOpacity>
            </View>

            {/* 2. Thông tin lịch đặt */}
            <View style={styles.detailSectionCard}>
              <Text style={styles.sectionHeaderTitle}>2. Thông tin lịch đặt</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Loại sân:</Text>
                <Text style={styles.detailValueBold}>
                  {selectedDetailBooking?.details?.[0]?.courtName || selectedDetailBooking?.courtName || 'Sân 7 người (Sân A1)'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ngày & Khung giờ:</Text>
                <Text style={styles.detailValueBold}>
                  {selectedDetailBooking?.details?.[0]?.startTime?.substring(0, 5)} - {selectedDetailBooking?.details?.[0]?.endTime?.substring(0, 5)} | {selectedDetailBooking?.details?.[0]?.bookingDate}
                </Text>
              </View>
              
              <Text style={[styles.detailLabel, { marginTop: 10, marginBottom: 6 }]}>Các dịch vụ đi kèm:</Text>
              <View style={styles.serviceItemRow}>
                <Text style={styles.serviceText}>• Nước suối tinh khiết (x4 chai)</Text>
                <Text style={styles.servicePrice}>40.000đ</Text>
              </View>
              <View style={styles.serviceItemRow}>
                <Text style={styles.serviceText}>• Thuê bộ áo bib thi đấu (x1 bộ)</Text>
                <Text style={styles.servicePrice}>30.000đ</Text>
              </View>
            </View>

            {/* 3. Mã Check-in / QR Code */}
            <View style={styles.detailSectionCardCenter}>
              <Text style={styles.sectionHeaderTitleCenter}>3. Mã Check-in / QR Code</Text>
              <Text style={styles.qrCodeSubText}>Đưa mã này cho chủ sân quét hoặc đối soát khi đến sân</Text>
              
              <View style={styles.qrCodeBox}>
                <MaterialIcons name="qr-code-2" size={160} color={COLORS.primary} />
              </View>
              
              <View style={styles.qrCodePill}>
                <Text style={styles.qrCodePillText}>{selectedDetailBooking?.bookingCode}</Text>
              </View>
            </View>

            {/* 4. Chi tiết thanh toán */}
            <View style={styles.detailSectionCard}>
              <Text style={styles.sectionHeaderTitle}>4. Chi tiết thanh toán</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Giá tiền sân:</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency((selectedDetailBooking?.totalPrice || 350000) - 70000)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Giá dịch vụ đi kèm:</Text>
                <Text style={styles.detailValue}>70.000 VNĐ</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Voucher giảm giá:</Text>
                <Text style={[styles.detailValue, { color: COLORS.error }]}>-50.000 VNĐ (SP-SPORTA2026)</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.totalPriceLabel}>Tổng thanh toán:</Text>
                <Text style={styles.totalPriceValue}>
                  {formatCurrency(selectedDetailBooking?.finalPrice || selectedDetailBooking?.totalPrice || 0)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phương thức thanh toán:</Text>
                <Text style={styles.detailValueBold}>
                  {selectedDetailBooking?.paymentMethod || 'VNPay QR'} (Thành công)
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Thời gian thanh toán:</Text>
                <Text style={styles.detailValue}>28/07/2026 14:30:15</Text>
              </View>
            </View>

            {/* 5. Thông tin liên hệ chủ sân / Hotline */}
            <View style={styles.detailSectionCard}>
              <Text style={styles.sectionHeaderTitle}>5. Liên hệ chủ sân & Support</Text>
              
              <View style={styles.contactRow}>
                <View style={styles.contactIconBg}>
                  <MaterialIcons name="person" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>Chủ sân: Nguyễn Văn Hùng</Text>
                  <Text style={styles.contactPhone}>0988 123 456</Text>
                </View>
                <TouchableOpacity 
                  style={styles.callBtn} 
                  activeOpacity={0.85}
                  onPress={() => Linking.openURL('tel:0988123456')}
                >
                  <MaterialIcons name="phone" size={16} color={COLORS.white} />
                  <Text style={styles.callBtnText}>Gọi chủ sân</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.contactRow, { marginTop: 12 }]}>
                <View style={styles.contactIconBg}>
                  <MaterialIcons name="headset-mic" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>Hotline hỗ trợ Sporta</Text>
                  <Text style={styles.contactPhone}>1900 6868 (24/7)</Text>
                </View>
                <TouchableOpacity 
                  style={styles.callBtnOutline} 
                  activeOpacity={0.85}
                  onPress={() => Linking.openURL('tel:19006868')}
                >
                  <MaterialIcons name="phone-in-talk" size={16} color={COLORS.primary} />
                  <Text style={styles.callBtnOutlineText}>Gọi Hotline</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 6. Chính sách hủy sân & Nút Hủy sân */}
            <View style={styles.detailSectionCard}>
              <Text style={styles.sectionHeaderTitle}>6. Chính sách hủy sân</Text>
              <Text style={styles.policyText}>• Hủy trước 12h: Hoàn tiền 100% về ví/tài khoản.</Text>
              <Text style={styles.policyText}>• Hủy từ 4h - 12h: Hoàn tiền 50% tổng giá trị đơn.</Text>
              <Text style={styles.policyText}>• Hủy dưới 4h trước giờ đá: Không áp dụng hoàn tiền.</Text>

              {getBookingCategory(selectedDetailBooking) === 'upcoming' && (
                <TouchableOpacity 
                  style={styles.cancelBookingBigBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    const b = selectedDetailBooking;
                    setSelectedDetailBooking(null);
                    setTimeout(() => {
                      if (b) handleCancelBooking(b);
                    }, 350);
                  }}
                >
                  <MaterialIcons name="cancel" size={20} color={COLORS.white} />
                  <Text style={styles.cancelBookingBigBtnText}>Hủy Đặt Sân Này</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* QR Code / Check-in Modal */}
      <Modal
        visible={!!selectedQRBooking}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedQRBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalCard}>
            <TouchableOpacity 
              style={styles.closeModalIcon}
              onPress={() => setSelectedQRBooking(null)}
            >
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>

            <Text style={styles.qrModalTitle}>Mã Check-in Sân</Text>
            <Text style={styles.qrModalSub}>Đưa mã này cho chủ sân quét khi đến sân thi đấu</Text>

            {/* QR Mock Image */}
            <View style={styles.qrImageWrapper}>
              <MaterialIcons name="qr-code-2" size={180} color={COLORS.primary} />
            </View>

            <View style={styles.qrCodeBadge}>
              <Text style={styles.qrCodeText}>{selectedQRBooking?.bookingCode}</Text>
            </View>

            <Text style={styles.qrVenueName}>{selectedQRBooking?.venueName}</Text>
            <Text style={styles.qrCourtName}>{selectedQRBooking?.details?.[0]?.courtName || selectedQRBooking?.courtName}</Text>

            <Button
              title="Đóng mã"
              variant="outline"
              style={styles.qrCloseBtn}
              onPress={() => setSelectedQRBooking(null)}
            />
          </View>
        </View>
      </Modal>

      {/* Review Modal */}
      <Modal
        visible={!!selectedReviewBooking}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReviewBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reviewModalCard}>
            <TouchableOpacity 
              style={styles.closeModalIcon}
              onPress={() => setSelectedReviewBooking(null)}
            >
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>

            <Text style={styles.reviewModalTitle}>Đánh giá trải nghiệm</Text>
            <Text style={styles.reviewVenueName}>{selectedReviewBooking?.venueName}</Text>

            {/* Star Rating */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <MaterialIcons 
                    name={star <= rating ? "star" : "star-border"} 
                    size={36} 
                    color={COLORS.amberStar} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Gửi đánh giá"
              variant="primary"
              style={styles.reviewSubmitBtn}
              onPress={handleSubmitReview}
            />
          </View>
        </View>
      </Modal>

      {/* Cancel Confirmation App Modal */}
      <ConfirmModal
        visible={!!cancellingBooking}
        title="Hủy đặt sân"
        message={`Bạn có chắc chắn muốn hủy đơn đặt sân ${cancellingBooking?.bookingCode} tại "${cancellingBooking?.venueName}" không?\n\nTiền thanh toán sẽ được hoàn lại ví/tài khoản theo đúng chính sách hoàn hủy của sân.`}
        confirmText="Xác nhận hủy"
        cancelText="Giữ lại đơn"
        confirmVariant="primary"
        icon="warning"
        iconColor={COLORS.error}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancellingBooking(null)}
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
  backButton: {
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
  headerPlaceholder: {
    width: 40,
  },
  filterSection: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    paddingVertical: SPACING.sm,
  },
  tabsContainer: {
    paddingHorizontal: SPACING.marginMobile,
    gap: SPACING.base,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity08,
    gap: SPACING.xs,
  },
  tabChipActive: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primaryContainer,
  },
  tabChipText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  tabChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.marginMobile,
    paddingBottom: SPACING.xl * 2,
    gap: SPACING.md,
  },
  bookingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg, // 16px radius per DESIGN_web_owner.md
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  venueAvatar: {
    width: 46,
    height: 46,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
  },
  venueInfoCol: {
    flex: 1,
  },
  venueTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '700',
    color: COLORS.onSurface,
    lineHeight: 19,
  },
  statusTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  statusTagText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginVertical: SPACING.sm + 2,
  },
  cardBody: {
    gap: SPACING.xs + 2,
    marginBottom: SPACING.sm + 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  bookingCodeValue: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  infoValue: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  paymentValue: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cardFooterActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: SPACING.xs + 3,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  primaryActionBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '700',
  },
  cancelActionBtn: {
    paddingVertical: SPACING.xs + 3,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorOpacity08 || COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelActionBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '700',
  },
  outlineActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs + 3,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity30,
    backgroundColor: COLORS.primaryOpacity08,
    gap: 4,
  },
  outlineActionBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: SPACING.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.onSurface,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  emptySub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  qrModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    position: 'relative',
  },
  closeModalIcon: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  qrModalTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: SPACING.xs,
  },
  qrModalSub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
    textAlign: 'center',
  },
  qrImageWrapper: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  qrCodeBadge: {
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.xs,
  },
  qrCodeText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  qrVenueName: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  qrCourtName: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  qrCloseBtn: {
    marginTop: SPACING.lg,
    width: '100%',
  },
  reviewModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    position: 'relative',
  },
  reviewModalTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  reviewVenueName: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginVertical: SPACING.lg,
  },
  reviewSubmitBtn: {
    width: '100%',
  },

  /* Detail Modal Styles */
  detailModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  detailModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  detailModalHeaderTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  detailModalScroll: {
    padding: SPACING.marginMobile,
    gap: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  detailSectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
    gap: SPACING.xs + 2,
  },
  detailSectionCardCenter: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sectionHeaderTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  sectionHeaderTitleCenter: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
  },
  venueDetailName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  venueDetailAddress: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs + 3,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  directionsBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  detailValue: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurface,
  },
  detailValueBold: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  serviceItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: SPACING.xs,
  },
  serviceText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurface,
  },
  servicePrice: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  qrCodeSubText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
  qrCodeBox: {
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginVertical: SPACING.xs,
  },
  qrCodePill: {
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  qrCodePillText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    marginVertical: 4,
  },
  totalPriceLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  totalPriceValue: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  contactIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryOpacity12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactName: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  contactPhone: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  callBtnText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '700',
  },
  callBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity08,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity30,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  callBtnOutlineText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  policyText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
  },
  cancelBookingBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  cancelBookingBigBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '700',
  },
});
