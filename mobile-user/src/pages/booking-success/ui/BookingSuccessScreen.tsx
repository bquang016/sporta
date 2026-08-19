import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Modal, 
  TouchableOpacity, 
  Linking,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { ConfirmModal } from '../../../shared/ui/Modal/ConfirmModal';
import { useAlert } from '../../../shared/contexts/AlertContext';
import { fetchBookingById } from '../../../entities/booking/api/bookingApi';
import type { BookingResponse } from '../../../entities/booking/model/booking.types';

export function BookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const modalTopPadding = Platform.OS === 'ios' ? (insets.top > 0 ? insets.top : 47) : insets.top;
  
  const isFromHistory = params.fromHistory === 'true';
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(isFromHistory);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);

  useEffect(() => {
    if (isFromHistory) {
      setShowDetailModal(true);
    }
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
  }, [params.bookingId, isFromHistory]);

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
    venueName: (params.venueName as string) || 'Sân thể thao',
    venueLocation: (params.venueLocation as string) || '',
    venuePhone: (params.venuePhone as string) || '',
    courtName: (params.courtName as string) || 'Sân tiêu chuẩn',
    courtType: (params.courtType as string) || 'Sân tiêu chuẩn',
    totalPrice: Number(params.finalPrice) || 0,
    finalPrice: Number(params.finalPrice) || 0,
    status: (params.status as any) || 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentMethod: (params.paymentMethod as string) || 'VNPay QR',
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
          <Button title="Về trang chủ" onPress={() => router.push('/(tabs)')} style={{ marginTop: SPACING.md }} />
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
    : formatDateStr(params.bookingDate as string) || '30/07/2026';

  const courtNames = Array.from(new Set(details.map(d => d.courtName).filter(Boolean))).join(', ') 
    || (params.courtName as string) 
    || 'Sân tiêu chuẩn';

  const timesStr = details.length > 0
    ? details.map(d => `${formatTimeSlot(d.startTime)} - ${formatTimeSlot(d.endTime)}`).join('\n')
    : `${formatTimeSlot(params.startTime as string)} - ${formatTimeSlot(params.endTime as string)}`;

  const openGoogleMaps = (location: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || 'Sân thể thao Sporta')}`;
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

  // Render Direct Detail Screen synchronously when coming from Booking History (no delay/flash)
  if (isFromHistory) {
    return (
      <SafeAreaView style={styles.detailModalContainer}>
        {/* Header */}
        <View style={styles.detailModalHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.detailModalHeaderTitle}>Chi Tiết Đơn Đặt Sân</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.detailModalScroll} showsVerticalScrollIndicator={false}>
          {/* 1. Thông tin sân */}
          <View style={styles.detailSectionCard}>
            <Text style={styles.sectionHeaderTitle}>1. Thông tin sân</Text>
            <Text style={styles.venueDetailName}>{activeBooking.venueName}</Text>
            <Text style={styles.venueDetailAddress}>{activeBooking.venueLocation || 'Địa chỉ sân thể thao Sporta'}</Text>
            
            <TouchableOpacity 
              style={styles.directionsBtn} 
              activeOpacity={0.85}
              onPress={() => openGoogleMaps(activeBooking.venueLocation || activeBooking.venueName)}
            >
              <MaterialIcons name="directions" size={18} color={COLORS.white} />
              <Text style={styles.directionsBtnText}>Chỉ đường (Google Maps)</Text>
            </TouchableOpacity>
          </View>

          {/* 2. Thông tin lịch đặt */}
          <View style={styles.detailSectionCard}>
            <Text style={styles.sectionHeaderTitle}>2. Thông tin lịch đặt</Text>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Loại sân / Sân số:</Text>
              <Text style={styles.modalDetailValueBold}>{courtNames || 'Sân tiêu chuẩn'}</Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Ngày đá:</Text>
              <Text style={styles.modalDetailValueBold}>{dateStr}</Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Khung giờ:</Text>
              <Text style={styles.modalDetailValueBold}>{timesStr.replace(/\n/g, ', ')}</Text>
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
              <Text style={styles.qrCodePillText}>{activeBooking.bookingCode}</Text>
            </View>
          </View>

          {/* 4. Chi tiết thanh toán */}
          <View style={styles.detailSectionCard}>
            <Text style={styles.sectionHeaderTitle}>4. Chi tiết thanh toán</Text>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Giá tiền sân:</Text>
              <Text style={styles.modalDetailValue}>
                {formatCurrency(activeBooking.finalPrice || activeBooking.totalPrice || 0)}
              </Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Voucher giảm giá:</Text>
              {activeBooking.discountAmount && activeBooking.discountAmount > 0 ? (
                <Text style={[styles.modalDetailValue, { color: COLORS.error }]}>
                  -{formatCurrency(activeBooking.discountAmount)}
                </Text>
              ) : (
                <Text style={[styles.modalDetailValue, { color: COLORS.onSurfaceVariant }]}>
                  Chưa áp dụng
                </Text>
              )}
            </View>
            <View style={styles.modalDetailDivider} />
            <View style={styles.modalDetailRow}>
              <Text style={styles.totalPriceLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalPriceValue}>
                {formatCurrency(activeBooking.finalPrice || activeBooking.totalPrice || 0)}
              </Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Phương thức thanh toán:</Text>
              <Text style={styles.modalDetailValueBold}>
                {activeBooking.paymentMethod || 'VNPay QR'} (Thành công)
              </Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Thời gian thanh toán:</Text>
              <Text style={styles.modalDetailValue}>{formatPaymentTime(activeBooking.createdAt)}</Text>
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
                <Text style={styles.contactName}>Chủ sân: Quản lý {activeBooking.venueName}</Text>
                <Text style={styles.contactPhone}>{activeBooking.venuePhone || '0988 123 456'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.callBtn} 
                activeOpacity={0.85}
                onPress={() => Linking.openURL(`tel:${activeBooking.venuePhone || '0988123456'}`)}
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

          {/* 6. Chính sách hủy sân & Đóng Modal (Chỉ hiện với đơn chưa hủy/hoàn thành) */}
          {activeBooking.status !== 'CANCELLED' && activeBooking.status !== 'COMPLETED' && (
            <View style={styles.detailSectionCard}>
              <Text style={styles.sectionHeaderTitle}>6. Chính sách hủy sân</Text>
              <Text style={styles.policyText}>• Hủy trước 12h: Hoàn tiền 100% về ví/tài khoản.</Text>
              <Text style={styles.policyText}>• Hủy từ 4h - 12h: Hoàn tiền 50% tổng giá trị đơn.</Text>
              <Text style={styles.policyText}>• Hủy dưới 4h trước giờ đá: Không áp dụng hoàn tiền.</Text>

              <TouchableOpacity 
                style={styles.cancelBookingBigBtn}
                activeOpacity={0.85}
                onPress={() => setShowCancelConfirmModal(true)}
              >
                <MaterialIcons name="cancel" size={20} color={COLORS.white} />
                <Text style={styles.cancelBookingBigBtnText}>Hủy Đặt Sân Này</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

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

        {/* Friendly Cancellation Success App Modal */}
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
            router.back();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <MaterialIcons name="check-circle" size={80} color={COLORS.primary} />
        </View>
        
        <Text style={styles.title}>Đặt sân thành công!</Text>
        <Text style={styles.subtitle}>
          Sân của bạn đã được xác nhận. Vui lòng đưa mã QR này khi đến sân.
        </Text>

        <Card style={styles.qrCard}>
          <View style={styles.qrImageMock}>
            <MaterialIcons name="qr-code-2" size={120} color={COLORS.onSurface} />
          </View>
          <Text style={styles.qrId}>ID: {activeBooking.bookingCode}</Text>
          {details.length > 1 && (
            <Text style={styles.qrSubId}>(Bao gồm {details.length} khung giờ)</Text>
          )}
        </Card>

        {/* Details List */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Sân thể thao</Text>
          <Text style={styles.detailValue}>{activeBooking.venueName}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ngày</Text>
          <Text style={styles.detailValue}>{dateStr}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Thời gian</Text>
          <Text style={styles.detailValueMulti}>{timesStr}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Sân số</Text>
          <Text style={styles.detailValue}>{courtNames}</Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.bottomActions}>
        <Button 
          title="Xem chi tiết đơn hàng" 
          variant="primary" 
          icon={<MaterialIcons name="receipt" size={20} color={COLORS.onSecondary} />}
          onPress={() => setShowDetailModal(true)}
          style={styles.actionBtn}
        />
        <Button 
          title="Về trang chủ" 
          variant="outline"
          onPress={() => router.push('/(tabs)')}
          style={styles.actionBtn}
        />
      </View>

      {/* Full 6-Section Booking Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setShowDetailModal(false);
          if (isFromHistory) {
            router.back();
          }
        }}
      >
        <View style={[styles.detailModalHeaderSafeArea, { paddingTop: modalTopPadding }]}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
          {/* Modal Header */}
          <View style={styles.detailModalHeader}>
            <TouchableOpacity 
              onPress={() => {
                setShowDetailModal(false);
                if (isFromHistory) {
                  router.back();
                }
              }} 
              style={styles.backButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.detailModalHeaderTitle}>Chi Tiết Đơn Đặt Sân</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </View>

        <SafeAreaView style={styles.detailModalContainer} edges={['bottom', 'left', 'right']}>

          <ScrollView 
            contentContainerStyle={styles.detailModalScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Thông tin sân */}
            <View style={styles.detailSectionCard}>
              <Text style={styles.sectionHeaderTitle}>1. Thông tin sân</Text>
              <Text style={styles.venueDetailName}>{activeBooking.venueName}</Text>
              <Text style={styles.venueDetailAddress}>{activeBooking.venueLocation || 'Địa chỉ sân thể thao Sporta'}</Text>
              
              <TouchableOpacity 
                style={styles.directionsBtn} 
                activeOpacity={0.85}
                onPress={() => openGoogleMaps(activeBooking.venueLocation || activeBooking.venueName)}
              >
                <MaterialIcons name="directions" size={18} color={COLORS.white} />
                <Text style={styles.directionsBtnText}>Chỉ đường (Google Maps)</Text>
              </TouchableOpacity>
            </View>

            {/* 2. Thông tin lịch đặt */}
            <View style={styles.detailSectionCard}>
              <Text style={styles.sectionHeaderTitle}>2. Thông tin lịch đặt</Text>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Loại sân / Sân số:</Text>
                <Text style={styles.modalDetailValueBold}>{courtNames || 'Sân tiêu chuẩn'}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Ngày đá:</Text>
                <Text style={styles.modalDetailValueBold}>{dateStr}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Khung giờ:</Text>
                <Text style={styles.modalDetailValueBold}>{timesStr.replace(/\n/g, ', ')}</Text>
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
                <Text style={styles.qrCodePillText}>{activeBooking.bookingCode}</Text>
              </View>
            </View>

            {/* 4. Chi tiết thanh toán */}
            <View style={styles.detailSectionCard}>
              <Text style={styles.sectionHeaderTitle}>4. Chi tiết thanh toán</Text>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Giá tiền sân:</Text>
                <Text style={styles.modalDetailValue}>
                  {formatCurrency(activeBooking.finalPrice || activeBooking.totalPrice || 0)}
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Voucher giảm giá:</Text>
                {activeBooking.discountAmount && activeBooking.discountAmount > 0 ? (
                  <Text style={[styles.modalDetailValue, { color: COLORS.error }]}>
                    -{formatCurrency(activeBooking.discountAmount)}
                  </Text>
                ) : (
                  <Text style={[styles.modalDetailValue, { color: COLORS.onSurfaceVariant }]}>
                    Chưa áp dụng
                  </Text>
                )}
              </View>
              <View style={styles.modalDetailDivider} />
              <View style={styles.modalDetailRow}>
                <Text style={styles.totalPriceLabel}>Tổng thanh toán:</Text>
                <Text style={styles.totalPriceValue}>
                  {formatCurrency(activeBooking.finalPrice || activeBooking.totalPrice || 0)}
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Phương thức thanh toán:</Text>
                <Text style={styles.modalDetailValueBold}>
                  {activeBooking.paymentMethod || 'VNPay QR'} (Thành công)
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Thời gian thanh toán:</Text>
                <Text style={styles.modalDetailValue}>{formatPaymentTime(activeBooking.createdAt)}</Text>
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
                  <Text style={styles.contactName}>Chủ sân: Quản lý {activeBooking.venueName}</Text>
                  <Text style={styles.contactPhone}>{activeBooking.venuePhone || '0988 123 456'}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.callBtn} 
                  activeOpacity={0.85}
                  onPress={() => Linking.openURL(`tel:${activeBooking.venuePhone || '0988123456'}`)}
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

            {/* 6. Chính sách hủy sân & Đóng Modal (Chỉ hiện với đơn chưa hủy/hoàn thành) */}
            {activeBooking.status !== 'CANCELLED' && activeBooking.status !== 'COMPLETED' && (
              <View style={styles.detailSectionCard}>
                <Text style={styles.sectionHeaderTitle}>6. Chính sách hủy sân</Text>
                <Text style={styles.policyText}>• Hủy trước 12h: Hoàn tiền 100% về ví/tài khoản.</Text>
                <Text style={styles.policyText}>• Hủy từ 4h - 12h: Hoàn tiền 50% tổng giá trị đơn.</Text>
                <Text style={styles.policyText}>• Hủy dưới 4h trước giờ đá: Không áp dụng hoàn tiền.</Text>

                <TouchableOpacity 
                  style={styles.cancelBookingBigBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    setShowDetailModal(false);
                    setTimeout(() => setShowCancelConfirmModal(true), 350);
                  }}
                >
                  <MaterialIcons name="cancel" size={20} color={COLORS.white} />
                  <Text style={styles.cancelBookingBigBtnText}>Hủy Đặt Sân Này</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Cancel Confirmation App Modal */}
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

      {/* Cancellation Success App Modal */}
      <ConfirmModal
        visible={showCancelSuccessModal}
        title="Hủy đặt sân thành công"
        message={`Đơn đặt sân ${activeBooking.bookingCode} tại "${activeBooking.venueName}" đã được cập nhật sang trạng thái Đã Hủy.\n\nTiền sẽ được tự động hoàn lại ví/tài khoản của bạn.`}
        confirmText="Đã hiểu"
        confirmVariant="primary"
        icon="check-circle"
        iconColor={COLORS.primary}
        onConfirm={() => setShowCancelSuccessModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  qrCard: {
    width: '100%',
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.xl,
    borderWidth: 0,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  qrImageMock: {
    width: 180,
    height: 180,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  qrId: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
  },
  qrSubId: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
  detailRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  detailLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  detailValue: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    flex: 1,
    textAlign: 'right',
  },
  detailValueMulti: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    flex: 1,
    textAlign: 'right',
    lineHeight: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
  bottomActions: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    gap: SPACING.md,
  },
  actionBtn: {
    width: '100%',
  },

  /* Detail Modal Styles */
  detailModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  detailModalHeaderSafeArea: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  detailModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerPlaceholder: {
    width: 40,
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
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalDetailLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  modalDetailValue: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurface,
  },
  modalDetailValueBold: {
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
  modalDetailDivider: {
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
