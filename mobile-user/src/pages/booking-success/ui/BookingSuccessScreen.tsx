import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator, 
  Modal, 
  TouchableOpacity, 
  Linking 
} from 'react-native';
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
  
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);

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

  if (!booking) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.title}>Không tìm thấy thông tin đặt sân</Text>
        <Button title="Về trang chủ" onPress={() => router.push('/')} style={{ marginTop: SPACING.md }} />
      </View>
    );
  }

  const details = booking.details || [];
  const firstDetail = details[0];
  const dateStr = firstDetail ? firstDetail.bookingDate.split('-').reverse().join('/') : ''; // DD/MM/YYYY
  
  // Nối các courtName nếu có nhiều court
  const courtNames = Array.from(new Set(details.map(d => d.courtName))).join(', ');
  
  // Gom nhóm thời gian
  const timesStr = details.map(d => `${d.startTime.slice(0, 5)} - ${d.endTime.slice(0, 5)}`).join('\n');

  const openGoogleMaps = (location: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || 'Sân thể thao Sporta')}`;
    Linking.openURL(url);
  };

  const formatCurrency = (amount: number) => {
    return (amount || 0).toLocaleString('vi-VN') + ' VNĐ';
  };

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
          <Text style={styles.qrId}>ID: {booking.bookingCode}</Text>
          {details.length > 1 && (
            <Text style={styles.qrSubId}>(Bao gồm {details.length} khung giờ)</Text>
          )}
        </Card>

        {/* Details List */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Sân thể thao</Text>
          <Text style={styles.detailValue}>{booking.venueName}</Text>
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
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.detailModalContainer}>
          {/* Modal Header */}
          <View style={styles.detailModalHeader}>
            <TouchableOpacity 
              onPress={() => setShowDetailModal(false)} 
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
              <Text style={styles.venueDetailName}>{booking.venueName}</Text>
              <Text style={styles.venueDetailAddress}>{booking.venueLocation || 'Địa chỉ sân thể thao Sporta'}</Text>
              
              <TouchableOpacity 
                style={styles.directionsBtn} 
                activeOpacity={0.85}
                onPress={() => openGoogleMaps(booking.venueLocation || booking.venueName)}
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

              <Text style={[styles.modalDetailLabel, { marginTop: 10, marginBottom: 6 }]}>Dịch vụ đi kèm:</Text>
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
                <Text style={styles.qrCodePillText}>{booking.bookingCode}</Text>
              </View>
            </View>

            {/* 4. Chi tiết thanh toán */}
            <View style={styles.detailSectionCard}>
              <Text style={styles.sectionHeaderTitle}>4. Chi tiết thanh toán</Text>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Giá tiền sân:</Text>
                <Text style={styles.modalDetailValue}>
                  {formatCurrency((booking.finalPrice || booking.totalPrice || 0) - 70000)}
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Giá dịch vụ đi kèm:</Text>
                <Text style={styles.modalDetailValue}>70.000 VNĐ</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Voucher giảm giá:</Text>
                <Text style={[styles.modalDetailValue, { color: COLORS.error }]}>-50.000 VNĐ (SP-SPORTA2026)</Text>
              </View>
              <View style={styles.modalDetailDivider} />
              <View style={styles.modalDetailRow}>
                <Text style={styles.totalPriceLabel}>Tổng thanh toán:</Text>
                <Text style={styles.totalPriceValue}>
                  {formatCurrency(booking.finalPrice || booking.totalPrice || 0)}
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Phương thức thanh toán:</Text>
                <Text style={styles.modalDetailValueBold}>
                  {booking.paymentMethod || 'VNPay QR'} (Thành công)
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Thời gian thanh toán:</Text>
                <Text style={styles.modalDetailValue}>Vừa xong</Text>
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
                  <Text style={styles.contactName}>Chủ sân: Quản lý {booking.venueName}</Text>
                  <Text style={styles.contactPhone}>{booking.venuePhone || '0988 123 456'}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.callBtn} 
                  activeOpacity={0.85}
                  onPress={() => Linking.openURL(`tel:${booking.venuePhone || '0988123456'}`)}
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

            {/* 6. Chính sách hủy sân & Đóng Modal */}
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
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Cancel Confirmation App Modal */}
      <ConfirmModal
        visible={showCancelConfirmModal}
        title="Hủy đặt sân"
        message={`Bạn có chắc chắn muốn hủy đơn đặt sân ${booking.bookingCode} tại "${booking.venueName}" không?\n\nTiền thanh toán sẽ được hoàn lại ví/tài khoản theo đúng chính sách hoàn hủy của sân.`}
        confirmText="Xác nhận hủy"
        cancelText="Giữ lại đơn"
        confirmVariant="primary"
        icon="warning"
        iconColor={COLORS.error}
        onConfirm={() => {
          setShowCancelConfirmModal(false);
          showAlert('Đã hủy đơn thành công', 'Đơn đặt sân của bạn đã được cập nhật sang trạng thái Đã Hủy.');
        }}
        onCancel={() => setShowCancelConfirmModal(false)}
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
