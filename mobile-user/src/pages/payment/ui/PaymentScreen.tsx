import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { AlertModal } from '../../../shared/ui';
import { useCreateBooking } from '../../../entities/booking/model/useBooking';
import type { SlotInfo } from '../../../entities/facility/model/facility.types';
import { useAlert } from '../../../shared/contexts/AlertContext';

export function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { mutate: createBooking, loading } = useCreateBooking();
  const { showAlert } = useAlert();

  const [selectedMethod, setSelectedMethod] = useState('momo');
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const paymentMethods = [
    { id: 'momo', label: 'Ví điện tử Momo', icon: 'account-balance-wallet' },
    { id: 'vnpay', label: 'VNPay QR', icon: 'qr-code' },
    { id: 'card', label: 'Thẻ tín dụng / Ghi nợ', icon: 'credit-card' },
    { id: 'bank', label: 'Chuyển khoản ngân hàng', icon: 'account-balance' },
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
      
      router.push({
        pathname: '/booking/success' as any,
        params: {
          bookingId: result.id
        }
      });
      
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

      <ScrollView style={styles.content}>
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
                selectedMethod === method.id && styles.methodItemSelected
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <View style={styles.radioOuter}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
              <MaterialIcons name={method.icon as any} size={24} color={COLORS.primary} style={styles.methodIcon} />
              <Text style={styles.methodLabel}>{method.label}</Text>
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

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Button 
          title={`Thanh toán ${rawTotalPrice.toLocaleString('vi-VN')}đ & Xác nhận`} 
          onPress={handlePayment}
          style={{ width: '100%' }}
          disabled={loading}
          icon={loading ? <ActivityIndicator size="small" color={COLORS.onPrimary} /> : undefined}
        />
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
    color: COLORS.onSurface,
  },
  methodsCard: {
    padding: 0,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
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
  bottomBar: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
});
