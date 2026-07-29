import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { fetchBookingById } from '../../../entities/booking/api/bookingApi';
import type { BookingResponse } from '../../../entities/booking/model/booking.types';

export function BookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
          style={styles.actionBtn}
        />
        <Button 
          title="Về trang chủ" 
          variant="outline"
          onPress={() => router.push('/(tabs)')}
          style={styles.actionBtn}
        />
      </View>
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
});
