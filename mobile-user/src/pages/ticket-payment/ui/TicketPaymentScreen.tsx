import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchSessionDetail, purchaseTicket } from '../../../entities/ticket/api/ticketApi';
import { TicketSession } from '../../../entities/ticket/model/ticket.types';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { AlertModal } from '../../../shared/ui';

export function TicketPaymentScreen() {
  const router = useRouter();
  const { id, quantity: quantityParam } = useLocalSearchParams();
  const sessionId = Array.isArray(id) ? id[0] : id;
  const quantity = Number(Array.isArray(quantityParam) ? quantityParam[0] : quantityParam) || 1;

  const [session, setSession] = useState<TicketSession | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('vnpay');
  
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const paymentMethods = [
    { id: 'vnpay', label: 'Mã QR Ngân Hàng (PayOS)', icon: 'qr-code', enabled: true },
    { id: 'momo', label: 'Ví điện tử MoMo', icon: 'account-balance-wallet', enabled: false },
    { id: 'card', label: 'Thẻ tín dụng / Ghi nợ', icon: 'credit-card', enabled: false },
  ];

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoadingSession(true);
      const data = await fetchSessionDetail(sessionId as string);
      setSession(data);
    } catch (err: any) {
      console.error('Failed to fetch session detail:', err);
      setErrorMessage(err.message || 'Không thể tải thông tin ca xé vé');
      setErrorModalVisible(true);
    } finally {
      setLoadingSession(false);
    }
  };

  const handlePayment = async () => {
    if (!session) return;

    try {
      setPurchasing(true);
      await purchaseTicket(session.id, quantity);
      
      // Navigate to My Tickets page after success
      router.replace('/my-tickets' as any);
    } catch (error: any) {
      console.error('Purchase ticket error:', error);
      if (error.status === 409 || (error.message && (error.message.includes('vé cuối cùng') || error.message.includes('chỉ còn')))) {
        setConflictModalVisible(true);
      } else {
        setErrorMessage(error.message || 'Không thể thực hiện thanh toán vé');
        setErrorModalVisible(true);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/ticket-sessions' as any);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  if (loadingSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang chuẩn bị thông tin thanh toán...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>Thanh toán mua vé</Text>
          <View style={styles.iconBtn} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin ca xé vé</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rawTotalPrice = session.pricePerTicket * quantity;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Thanh toán vé xé ({quantity} vé)</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Non-refundable Policy Warning */}
        <View style={styles.warningBox}>
          <MaterialIcons name="info" size={20} color={COLORS.amber} style={styles.warningIcon} />
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>Chính sách mua vé xé ({quantity} suất)</Text>
            <Text style={styles.warningText}>Vé xé mua theo suất chơi cá nhân. Sau khi thanh toán thành công, vé **không thể hủy và không được hoàn tiền**.</Text>
          </View>
        </View>

        {/* Ticket Details */}
        <Text style={styles.sectionTitle}>Thông tin vé lẻ</Text>
        <Card style={styles.detailCard}>
          <View style={styles.facilityInfo}>
            <View style={styles.facilityImageMock}>
              <MaterialIcons name="confirmation-number" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.facilityTextInfo}>
              <Text style={styles.facilityName}>{session.venueName}</Text>
              <Text style={styles.courtName}>Sân: {session.courtName}</Text>
              <Text style={styles.facilityAddress} numberOfLines={1}>
                <MaterialIcons name="location-on" size={14} color={COLORS.onSurfaceVariant} /> {session.venueAddress || session.venueLocation || 'Tại cụm sân'}
              </Text>
              <Text style={styles.facilityDate}>
                <MaterialIcons name="calendar-today" size={14} color={COLORS.onSurfaceVariant} /> {session.startTime} - {session.endTime} ({formatDate(session.playDate)})
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.slotItem}>
            <Text style={styles.slotName}>Số lượng: {String(quantity).padStart(2, '0')} Vé suất xé vé</Text>
            <Text style={styles.slotPrice}>{rawTotalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
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
              activeOpacity={0.8}
              disabled={!method.enabled}
            >
              <View style={styles.radioOuter}>
                {selectedMethod === method.id && <View style={styles.radioInner} />}
              </View>
              <MaterialIcons name={method.icon as any} size={24} color={COLORS.primary} style={styles.methodIcon} />
              <View>
                <Text style={styles.methodLabel}>{method.label}</Text>
                {!method.enabled && (
                  <Text style={{ fontSize: 12, color: COLORS.error, marginTop: 2 }}>Tạm bảo trì</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tiền vé ({quantity} vé)</Text>
            <Text style={styles.summaryValue}>{rawTotalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí phục vụ</Text>
            <Text style={styles.summaryValue}>0đ</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{rawTotalPrice.toLocaleString('vi-VN')}đ</Text>
          </View>
        </Card>
        
        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Button 
          title={`Thanh toán ${rawTotalPrice.toLocaleString('vi-VN')}đ & Nhận ${quantity} vé QR`} 
          onPress={handlePayment}
          style={{ width: '100%' }}
          disabled={purchasing}
          icon={purchasing ? <ActivityIndicator size="small" color={COLORS.onPrimary} /> : undefined}
        />
      </View>

      {/* Race Condition / Conflict Modal */}
      <AlertModal
        visible={conflictModalVisible}
        title="Đã hết vé lẻ"
        message="Rất tiếc, vé cuối cùng của trận đấu này vừa có người mua trước bạn một tích tắc!"
        buttonText="Quay lại danh sách"
        onConfirm={() => {
          setConflictModalVisible(false);
          router.replace('/ticket-sessions' as any);
        }}
      />

      {/* Error Modal */}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  errorText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.error,
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
    fontWeight: '800',
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
    fontWeight: '700',
  },
  warningText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    marginBottom: SPACING.sm,
    fontSize: 15,
    fontWeight: '700',
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
    backgroundColor: COLORS.primaryOpacity08,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityTextInfo: {
    flex: 1,
    gap: 2,
  },
  facilityName: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
  courtName: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  facilityAddress: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
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
  },
  slotName: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  slotPrice: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.primary,
    fontWeight: '800',
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
    backgroundColor: COLORS.primaryOpacity08,
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
    fontWeight: '700',
  },
  totalValue: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.primary,
    fontWeight: '800',
  },
  bottomBar: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
});
