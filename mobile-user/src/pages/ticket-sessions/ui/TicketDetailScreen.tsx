import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchSessionDetail } from '../../../entities/ticket/api/ticketApi';
import { TicketSession, SportLevel } from '../../../entities/ticket/model/ticket.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

export function TicketDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const sessionId = Array.isArray(id) ? id[0] : id;

  const [session, setSession] = useState<TicketSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSessionDetail(sessionId as string);
      setSession(data);
    } catch (err: any) {
      console.error('Failed to fetch session detail:', err);
      setError(err.message || 'Không thể tải thông tin ca xé vé');
    } finally {
      setLoading(false);
    }
  };

  const getSportLevelLabel = (level?: SportLevel) => {
    switch (level) {
      case 'WEAK': return 'Mới chơi';
      case 'WEAK_AVERAGE': return 'Yếu - Trung bình';
      case 'AVERAGE': return 'Trung bình';
      case 'AVERAGE_GOOD': return 'Bán chuyên';
      case 'GOOD': return 'Chuyên nghiệp';
      default: return 'Tất cả trình độ';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin ca xé vé...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi Tiết Ca Xé Vé</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error || 'Không tìm thấy thông tin ca xé vé'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadSession}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const remainingSlots = session ? session.maxSlots - session.bookedSlots : 0;
  const isFull = remainingSlots <= 0 || session?.status === 'FULL';
  const totalPrice = session ? session.pricePerTicket * quantity : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Hero Banner */}
        <View style={styles.heroWrapper}>
          {session.coverImage ? (
            <Image source={{ uri: session.coverImage }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroFallback}>
              <MaterialIcons name="sports-tennis" size={64} color={COLORS.primary} />
            </View>
          )}

          {/* Floating Back Button */}
          <TouchableOpacity onPress={() => router.back()} style={styles.floatingBackBtn} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>

        {/* Content Details */}
        <View style={styles.body}>
          {/* Title & Badge */}
          <View style={styles.titleRow}>
            <View style={styles.titleCol}>
              <Text style={styles.venueName}>{session.venueName}</Text>
              <Text style={styles.courtName}>Sân: <Text style={styles.courtNameBold}>{session.courtName}</Text></Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{getSportLevelLabel(session.sportLevel)}</Text>
            </View>
          </View>

          {/* Address card */}
          <View style={styles.infoCard}>
            <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
            <Text style={styles.infoCardText}>
              {session.venueAddress || session.venueLocation || 'Địa điểm cụm sân'}
            </Text>
          </View>

          {/* Time & Date Card */}
          <View style={styles.infoCard}>
            <MaterialIcons name="event" size={20} color={COLORS.primary} />
            <View style={styles.infoCardTextCol}>
              <Text style={styles.infoCardTitle}>Giờ & Ngày chơi</Text>
              <Text style={styles.infoCardValue}>
                {session.startTime} - {session.endTime} • {formatDate(session.playDate)}
              </Text>
            </View>
          </View>

          {/* Slot availability progress */}
          <View style={styles.slotCard}>
            <View style={styles.slotHeader}>
              <Text style={styles.slotTitle}>Số slot còn trống</Text>
              <Text style={[styles.slotBadgeText, isFull ? styles.slotBadgeFull : styles.slotBadgeAvailable]}>
                {isFull ? 'HẾT SLOT' : `Còn ${remainingSlots}/${session.maxSlots} vé`}
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${Math.min(100, (session.bookedSlots / session.maxSlots) * 100)}%` },
                  isFull && { backgroundColor: COLORS.error }
                ]} 
              />
            </View>
          </View>

          {/* Quantity Selector Card */}
          {!isFull && (
            <View style={styles.quantityCard}>
              <View style={styles.quantityInfoCol}>
                <Text style={styles.quantityTitle}>Số lượng vé đặt</Text>
                <Text style={styles.quantitySub}>Đặt cho bạn và bạn bè đi cùng</Text>
              </View>
              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={[styles.counterBtn, quantity <= 1 && styles.counterBtnDisabled]}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="remove" size={18} color={quantity <= 1 ? COLORS.outline : COLORS.primary} />
                </TouchableOpacity>

                <Text style={styles.counterValue}>{quantity}</Text>

                <TouchableOpacity
                  style={[styles.counterBtn, quantity >= remainingSlots && styles.counterBtnDisabled]}
                  onPress={() => setQuantity((q) => Math.min(remainingSlots, q + 1))}
                  disabled={quantity >= remainingSlots}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="add" size={18} color={quantity >= remainingSlots ? COLORS.outline : COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Quy định & Hướng dẫn */}
          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>Quy định ca xé vé</Text>
            <View style={styles.ruleItem}>
              <MaterialIcons name="check-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.ruleText}>Có thể mua nhiều vé cùng lúc cho bạn bè đi cùng.</Text>
            </View>
            <View style={styles.ruleItem}>
              <MaterialIcons name="qr-code-scanner" size={16} color={COLORS.primary} />
              <Text style={styles.ruleText}>Mỗi vé sẽ được cấp 01 Mã QR & mã ShortCode riêng biệt để check-in độc lập.</Text>
            </View>
            <View style={styles.ruleItem}>
              <MaterialIcons name="do-not-disturb" size={16} color={COLORS.amber} />
              <Text style={styles.ruleText}>Lưu ý: Vé xé sau khi mua không được hủy và không hoàn tiền.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceCol}>
          <Text style={styles.priceLabel}>Tổng tiền ({quantity} vé)</Text>
          <Text style={styles.priceValue}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
        </View>

        <TouchableOpacity
          style={[styles.buyBtn, isFull && styles.buyBtnDisabled]}
          onPress={() => router.push({ pathname: '/ticket-payment/[id]', params: { id: session.id, quantity: String(quantity) } } as any)}
          disabled={isFull}
          activeOpacity={0.85}
        >
          <Text style={[styles.buyBtnText, isFull && styles.buyBtnTextDisabled]}>
            {isFull ? 'Hết vé' : 'Mua vé ngay'}
          </Text>
          {!isFull && <MaterialIcons name="arrow-forward" size={18} color={COLORS.onSecondary} />}
        </TouchableOpacity>
      </View>
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
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  retryBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroWrapper: {
    height: 220,
    position: 'relative',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primaryOpacity08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingBackBtn: {
    position: 'absolute',
    top: 44,
    left: SPACING.md,
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  body: {
    padding: SPACING.md,
    gap: SPACING.md,
    marginTop: -20,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  titleCol: {
    flex: 1,
    gap: 4,
  },
  venueName: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  courtName: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  courtNameBold: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  levelBadge: {
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  levelBadgeText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerLow,
  },
  infoCardText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    flex: 1,
    fontSize: 13,
  },
  infoCardTextCol: {
    flex: 1,
    gap: 2,
  },
  infoCardTitle: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  infoCardValue: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '700',
    fontSize: 14,
  },
  slotCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerLow,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: '700',
  },
  slotBadgeText: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    fontSize: 13,
  },
  slotBadgeAvailable: {
    color: COLORS.primary,
  },
  slotBadgeFull: {
    color: COLORS.error,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  rulesCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  rulesTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  ruleText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    flex: 1,
  },
  quantityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerLow,
  },
  quantityInfoCol: {
    gap: 2,
    flex: 1,
  },
  quantityTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontSize: 14,
    fontWeight: '700',
  },
  quantitySub: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  counterBtnDisabled: {
    backgroundColor: COLORS.surfaceContainerHigh,
    elevation: 0,
  },
  counterValue: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.primary,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  priceCol: {
    gap: 2,
  },
  priceLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
  },
  priceValue: {
    ...TYPOGRAPHY.titleLg,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 18,
  },
  priceUnit: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '400',
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.secondary, // Dynamic Athletic Yellow
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
  },
  buyBtnDisabled: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  buyBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSecondary,
    fontWeight: '800',
    fontSize: 15,
  },
  buyBtnTextDisabled: {
    color: COLORS.outline,
  },
});
