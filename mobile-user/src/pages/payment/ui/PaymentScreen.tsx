import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { AlertModal } from '../../../shared/ui';
import { useCreateBooking } from '../../../entities/booking/model/useBooking';
import type { SlotInfo } from '../../../entities/facility/model/facility.types';
import { useAlert } from '../../../shared/contexts/AlertContext';
import { useQuery } from '@tanstack/react-query';
import { getWalletBalance, checkPaymentStatus } from '../../../features/wallet/api/walletApi';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

export function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { mutate: createBooking, loading } = useCreateBooking();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const [selectedMethod, setSelectedMethod] = useState('wallet');
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data: balanceData } = useQuery({
    queryKey: ['wallet_balance'],
    queryFn: getWalletBalance,
  });

  const paymentMethods = [
    { id: 'wallet', label: 'Ví Sporta', icon: 'account-balance-wallet', enabled: true },
    { id: 'dev', label: 'Thanh toán DEV (Auto Success)', icon: 'bug-report', enabled: true },
    { id: 'payos', label: 'Mã QR Ngân Hàng (PayOS)', icon: 'qr-code', enabled: true },
    { id: 'momo', label: 'Ví điện tử MoMo', icon: 'account-balance-wallet', enabled: false },
    { id: 'card', label: 'Thẻ tín dụng / Ghi nợ', icon: 'credit-card', enabled: false },
  ];

  // Parse params
  const venueId = params.venueId as string;
  const venueName = params.venueName as string;
  const venueLocation = params.venueLocation as string;
  const bookingDate = params.bookingDate as string; // YYYY-MM-DD
  const rawTotalPrice = Number(params.totalPrice) || 0;

  const selectedSlots: SlotInfo[] = useMemo(() => {
    try {
      if (params.slotsParam) {
        return JSON.parse(decodeURIComponent(params.slotsParam as string));
      }
    } catch (e) {
      console.error('Failed to parse slots', e);
    }
    return [];
  }, [params.slotsParam]);

  // Group slots for display
  // Mặc định mỗi slot 30 phút. 
  // Để đơn giản, ta hiển thị từng slot riêng biệt hoặc group nhẹ.
  // Trong phiên bản này, ta sẽ hiển thị từng slot đã chọn.
  const displaySlots = selectedSlots.map(slot => {
    // Tính endTime giả định (cộng thêm 30 phút từ time)
    const [h, m] = slot.time.split(':').map(Number);
    const date = new Date(2000, 0, 1, h, m);
    date.setMinutes(date.getMinutes() + 30);
    const endStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    
    return {
      ...slot,
      endTime: endStr,
    };
  });

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const hasEnoughBalance = (balanceData?.balance || 0) >= rawTotalPrice;
  const isWalletSelected = selectedMethod === 'wallet';
  const disablePaymentBtn = loading || (isWalletSelected && !hasEnoughBalance);

  const handlePayment = async () => {
    if (selectedSlots.length === 0) return;
    
    try {
      const requestPayload = {
        slots: displaySlots.map(slot => ({
          courtId: slot.courtId,
          bookingDate: bookingDate,
          startTime: `${slot.time}:00`,
          endTime: `${slot.endTime}:00`,
        })),
        paymentMethod: selectedMethod,
      };

      const result = await createBooking(requestPayload);

      const methodLabel = paymentMethods.find(m => m.id === selectedMethod)?.label || 'MoMo Wallet';
      const firstSlot = displaySlots[0];
      const lastSlot = displaySlots[displaySlots.length - 1];
      
      if (selectedMethod === 'payos' && result.checkoutUrl) {
        // Open PayOS browser
        const returnUrl = Linking.createURL('/payment/success');
        const browserResult = await WebBrowser.openAuthSessionAsync(result.checkoutUrl, returnUrl);
        
        // After browser closes, sync status
        if (browserResult.type === 'success' || browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
          try {
            if (result.orderCode) {
              const statusRes = await checkPaymentStatus(result.orderCode);
              if (statusRes.status === 'PAID' || statusRes.status === 'COMPLETED') {
                router.push({
                  pathname: '/booking/success' as any,
                  params: { bookingId: result.id }
                });
                return;
              } else {
                setErrorMessage("Thanh toán chưa hoàn tất hoặc đã bị hủy.");
                setErrorModalVisible(true);
                return;
              }
            }
          } catch (e) {
            console.log("Failed to sync payment status", e);
          }
        }
      } else {
        // DEV auto success or Wallet success
        router.push({
          pathname: '/booking/success' as any,
          params: { bookingId: result.id }
        });
      }
      
    } catch (error: any) {
      if (error.status === 409) {
        setConflictModalVisible(true);
      } else {
        setErrorMessage(error.message || 'Không thể tạo đơn đặt sân');
        setErrorModalVisible(true);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Thanh toán</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} bounces={false}>
        {/* Policy Warning */}
        <View style={styles.warningBox}>
          <MaterialIcons name="info" size={20} color={COLORS.amber} style={styles.warningIcon} />
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>Chính sách đặt sân</Text>
            <Text style={styles.warningText}>Thanh toán toàn bộ 100% tiền sân để giữ chỗ. Hủy sân trước 24h được hoàn 50%.</Text>
          </View>
        </View>

        {/* Booking Details */}
        <Text style={styles.sectionTitle}>Chi tiết đặt sân</Text>
        <Card style={styles.detailCard}>
          <View style={styles.facilityInfo}>
            <View style={styles.facilityImageMock}>
               <MaterialIcons name="sports-tennis" size={32} color={COLORS.onSurfaceVariant} />
            </View>
            <View style={styles.facilityTextInfo}>
              <Text style={styles.facilityName}>{venueName}</Text>
              <Text style={styles.facilityAddress} numberOfLines={2}>
                <MaterialIcons name="location-on" size={14} color={COLORS.onSurfaceVariant} /> {venueLocation}
              </Text>
              <Text style={styles.facilityDate}>
                <MaterialIcons name="calendar-today" size={14} color={COLORS.onSurfaceVariant} /> {formatDateString(bookingDate)}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {displaySlots.map((slot, index) => (
            <View key={`${slot.courtId}-${slot.time}`} style={styles.slotItem}>
              <View>
                <Text style={styles.slotName}>{slot.courtName}</Text>
                <Text style={styles.slotTime}>{slot.time} - {slot.endTime}</Text>
              </View>
              <Text style={styles.slotPrice}>{slot.price.toLocaleString('vi-VN')}đ</Text>
            </View>
          ))}
        </Card>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        <Card style={styles.methodsCard}>
          {paymentMethods.map((method, index) => (
            <TouchableOpacity 
              key={method.id} 
              style={[
                styles.methodItem, 
                index !== paymentMethods.length - 1 && styles.methodDivider,
                selectedMethod === method.id && styles.methodItemSelected,
                !method.enabled && { opacity: 0.5 }
              ]}
              onPress={() => method.enabled && setSelectedMethod(method.id)}
              disabled={!method.enabled}
            >
              <View style={styles.radioOuter}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
              <MaterialIcons name={method.icon as any} size={24} color={COLORS.primary} style={styles.methodIcon} />
              <View>
                <Text style={styles.methodLabel}>{method.label}</Text>
                {method.id === 'wallet' && (
                  <Text style={styles.walletBalanceText}>
                    Số dư: {balanceData?.formattedBalance || '0 VNĐ'}
                  </Text>
                )}
                {!method.enabled && (
                  <Text style={styles.disabledText}>Tạm bảo trì</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Summary & Promo */}
        <Card style={styles.summaryCard}>
          <View style={styles.promoRow}>
            <TextInput 
              style={styles.promoInput} 
              placeholder="Nhập mã khuyến mãi"
              placeholderTextColor={COLORS.outline}
            />
            <TouchableOpacity style={styles.promoApplyBtn}>
              <Text style={styles.promoApplyText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính ({displaySlots.length} khung giờ)</Text>
            <Text style={styles.summaryValue}>{rawTotalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Khuyến mãi</Text>
            <Text style={styles.summaryValue}>-0đ</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{rawTotalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
        </Card>
        
        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* Floating Bottom Button */}
      <View style={[styles.bottomBarWrapper, { bottom: insets.bottom > 0 ? insets.bottom : SPACING.lg }]}>
        <BlurView intensity={90} tint="light" style={styles.bottomBar}>
          {isWalletSelected && !hasEnoughBalance && (
            <View style={styles.insufficientBalanceWarning}>
              <MaterialIcons name="error-outline" size={16} color={COLORS.error} style={{ marginRight: 4 }} />
              <Text style={styles.insufficientBalanceText}>
                Số dư không đủ. Vui lòng nạp thêm tiền vào ví!
              </Text>
            </View>
          )}
          <Button 
            title={`Thanh toán ${rawTotalPrice.toLocaleString('vi-VN')}đ & Xác nhận`} 
            onPress={handlePayment}
            style={{ width: '100%' }}
            disabled={disablePaymentBtn}
            icon={loading ? <ActivityIndicator size="small" color={COLORS.onPrimary} /> : undefined}
          />
        </BlurView>
      </View>

      {/* Modals */}
      <AlertModal
        visible={conflictModalVisible}
        title="Sân đã được đặt"
        message="Rất tiếc, khung giờ này vừa có người nhanh tay hơn. Vui lòng chọn giờ khác!"
        buttonText="Quay lại"
        onConfirm={() => {
          setConflictModalVisible(false);
          router.back();
        }}
      />

      <AlertModal
        visible={errorModalVisible}
        title="Thất bại"
        message={errorMessage}
        buttonText="Đóng"
        onConfirm={() => setErrorModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
  },
  iconBtn: {
    padding: SPACING.xs,
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.amberOpacity10,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    marginBottom: SPACING.lg,
  },
  warningIcon: {
    marginRight: SPACING.sm,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.amber,
    marginBottom: SPACING.xs,
  },
  warningText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },
  detailCard: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 0,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  facilityInfo: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  facilityImageMock: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceVariant,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityTextInfo: {
    flex: 1,
  },
  facilityName: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  facilityAddress: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    marginBottom: 4,
  },
  facilityDate: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: SPACING.md,
  },
  slotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  slotName: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
  },
  slotTime: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
  },
  slotPrice: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary, // Emerald text for price
  },
  methodsCard: {
    padding: 0,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 0,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  methodItemSelected: {
    backgroundColor: COLORS.primaryOpacity08, // Light green highlight
  },
  methodDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  methodIcon: {
    marginRight: SPACING.sm,
  },
  methodLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
  },
  summaryCard: {
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderWidth: 0,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  promoRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
  },
  promoApplyBtn: {
    backgroundColor: COLORS.primaryFixed, // Mint green container from MD3
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.default,
  },
  promoApplyText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  summaryValue: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
  },
  totalValue: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.primary, // Emerald primary color
  },
  bottomBarWrapper: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomBar: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  walletBalanceText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    marginTop: 2,
  },
  disabledText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.error,
    marginTop: 2,
  },
  insufficientBalanceWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  insufficientBalanceText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.error,
  }
});
