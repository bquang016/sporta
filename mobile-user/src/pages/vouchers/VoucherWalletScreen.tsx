import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../shared/config/theme';
import { useMyVouchers } from '../../features/voucher/hooks';
import { voucherApi } from '../../features/voucher/api';
import { VoucherCard } from '../../features/voucher/ui/VoucherCard';
import { VoucherDetailModal } from '../../features/voucher/ui/VoucherDetailModal';
import { UserVoucher } from '../../features/voucher/types';
import { useIsLoggedIn } from '../../shared/hooks/useIsLoggedIn';
import { useAlert } from '../../shared/contexts/AlertContext';

type TabType = 'ALL' | 'ACTIVE' | 'USED' | 'EXPIRED';

export function VoucherWalletScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoggedIn } = useIsLoggedIn();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const { vouchers, loading, error, fetchVouchers } = useMyVouchers();
  const [refreshing, setRefreshing] = useState(false);

  // Input code state
  const [inputCode, setInputCode] = useState('');
  const [collectingCode, setCollectingCode] = useState(false);

  // Modal State
  const [selectedUserVoucher, setSelectedUserVoucher] = useState<UserVoucher | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVouchers();
    setRefreshing(false);
  };

  const handleCollectByCode = async () => {
    if (!inputCode.trim()) return;
    setCollectingCode(true);
    try {
      const newUv = await voucherApi.collectVoucherByCode(inputCode.trim());
      setInputCode('');
      await fetchVouchers();
      queryClient.invalidateQueries({ queryKey: ['myVouchers'] });

      const vStartDate = newUv.startDate || newUv.voucher?.startDate;
      const isUpcoming = vStartDate ? new Date(vStartDate).getTime() > Date.now() : false;

      if (isUpcoming) {
        showAlert(
          'Đã lưu mã',
          `Mã "${newUv.voucherCode || inputCode.trim().toUpperCase()}" đã được lưu vào ví thành công. Lưu ý: Mã sẽ bắt đầu có hiệu lực từ ${new Date(vStartDate!).toLocaleDateString('vi-VN')}.`,
          undefined,
          { type: 'warning' }
        );
      } else {
        showAlert(
          'Thành công',
          `Đã lưu mã "${newUv.voucherCode || inputCode.trim().toUpperCase()}" vào ví voucher của bạn!`,
          undefined,
          { type: 'success' }
        );
      }
    } catch (err: any) {
      showAlert(
        'Không thể lưu mã',
        err.message || 'Mã khuyến mãi không hợp lệ hoặc đã hết lượt.',
        undefined,
        { type: 'error' }
      );
    } finally {
      setCollectingCode(false);
    }
  };

  const handleCardPress = (item: UserVoucher) => {
    setSelectedUserVoucher(item);
    setModalVisible(true);
  };

  // Group user vouchers into categorized sections
  const { activeCollected, soldOutCollected, expiredCollected, usedCollected, totalCount } = useMemo(() => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    const act: UserVoucher[] = [];
    const soldOut: UserVoucher[] = [];
    const exp: UserVoucher[] = [];
    const used: UserVoucher[] = [];

    vouchers.forEach((uv) => {
      const end = uv.endDate ? new Date(uv.endDate).getTime() : now + 1;
      const isExpired = uv.status === 'EXPIRED' || end < now;
      const isWithin24h = end + twentyFourHours >= now;
      const totalQ = uv.totalQuantity ?? uv.voucher?.totalQuantity ?? 0;
      const usedQ = uv.usedQuantity ?? uv.voucher?.usedQuantity ?? 0;
      const isSoldOut = totalQ > 0 && usedQ >= totalQ;

      if (uv.status === 'USED') {
        used.push(uv);
      } else if (isSoldOut) {
        soldOut.push(uv);
      } else if (!isExpired && uv.status === 'COLLECTED') {
        act.push(uv);
      } else if (isExpired && isWithin24h) {
        // Expired within 24h
        exp.push(uv);
      }
      // Note: Expired > 24h is completely excluded
    });

    return {
      activeCollected: act,
      soldOutCollected: soldOut,
      expiredCollected: exp,
      usedCollected: used,
      totalCount: act.length + soldOut.length + exp.length + used.length,
    };
  }, [vouchers]);

  const showActiveSection = (activeTab === 'ALL' || activeTab === 'ACTIVE') && activeCollected.length > 0;
  const showSoldOutSection = (activeTab === 'ALL' || activeTab === 'ACTIVE' || activeTab === 'EXPIRED') && soldOutCollected.length > 0;
  const showExpiredSection = (activeTab === 'ALL' || activeTab === 'EXPIRED') && expiredCollected.length > 0;
  const showUsedSection = (activeTab === 'ALL' || activeTab === 'USED') && usedCollected.length > 0;

  const currentTabCount = useMemo(() => {
    if (activeTab === 'ALL') return totalCount;
    if (activeTab === 'ACTIVE') return activeCollected.length + soldOutCollected.length;
    if (activeTab === 'EXPIRED') return expiredCollected.length;
    if (activeTab === 'USED') return usedCollected.length;
    return 0;
  }, [activeTab, totalCount, activeCollected, soldOutCollected, expiredCollected, usedCollected]);

  const renderTab = (type: TabType, label: string, iconName: keyof typeof Ionicons.glyphMap) => {
    const isActive = activeTab === type;
    return (
      <TouchableOpacity
        style={[styles.tab, isActive && styles.activeTab]}
        onPress={() => setActiveTab(type)}
        activeOpacity={0.75}
      >
        <Ionicons
          name={iconName}
          size={16}
          color={isActive ? COLORS.primary : COLORS.onSurfaceVariant}
        />
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={22} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ví Voucher & Ưu Đãi</Text>
        <TouchableOpacity
          style={styles.rightActionBtn}
          onPress={() => router.replace('/vouchers/explore')}
          activeOpacity={0.75}
        >
          <Ionicons name="sparkles-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Enter Voucher Code Input Bar ── */}
      <View style={styles.inputCard}>
        <View style={styles.inputWrapper}>
          <Ionicons name="pricetag-outline" size={17} color={COLORS.primary} />
          <TextInput
            style={styles.inputField}
            placeholder="Nhập mã voucher (VD: SPORTA50)..."
            placeholderTextColor={COLORS.outline}
            value={inputCode}
            onChangeText={setInputCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.inputSubmitBtn,
            (!inputCode.trim() || collectingCode) && styles.inputSubmitBtnDisabled,
          ]}
          onPress={handleCollectByCode}
          disabled={!inputCode.trim() || collectingCode}
          activeOpacity={0.8}
        >
          {collectingCode ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.inputSubmitBtnText}>Lưu mã</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Summary Tip Banner ── */}
      <View style={styles.tipBanner}>
        <View style={styles.tipIconWrap}>
          <Ionicons name="gift-outline" size={18} color={COLORS.primary} />
        </View>
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>Áp dụng voucher khi đặt sân</Text>
          <Text style={styles.tipSub}>
            Chọn voucher tại bước xác nhận đặt sân để nhận ưu đãi giảm giá tốt nhất!
          </Text>
        </View>
      </View>

      {/* ── Tabs Bar ── */}
      <View style={styles.tabsContainer}>
        {renderTab('ALL', 'Tất cả', 'apps-outline')}
        {renderTab('ACTIVE', 'Có hiệu lực', 'ticket-outline')}
        {renderTab('EXPIRED', 'Hết hạn', 'time-outline')}
        {renderTab('USED', 'Đã dùng', 'checkmark-done-circle-outline')}
      </View>

      {/* ── Content Body By Sections ── */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingSubtitle}>Đang tải ví voucher...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchVouchers} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : currentTabCount === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="ticket-outline" size={54} color={COLORS.outlineVariant} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có mã khuyến mãi nào</Text>
          <Text style={styles.emptySub}>
            {activeTab === 'ACTIVE'
              ? 'Lưu mã từ banner trang chủ hoặc săn ưu đãi từ các sân để nhận giảm giá.'
              : activeTab === 'USED'
                ? 'Bạn chưa sử dụng mã giảm giá nào gần đây.'
                : activeTab === 'EXPIRED'
                  ? 'Không có mã nào bị hết hạn trong 24 giờ qua.'
                  : 'Ví voucher của bạn hiện đang trống. Hãy săn ngay ưu đãi hot!'}
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.replace('/vouchers/explore')}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={16} color="#003527" />
            <Text style={styles.exploreBtnText}>Săn ưu đãi ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* ── Section: Đã thu thập ── */}
          {showActiveSection && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderBox}>
                <View style={styles.sectionHeaderTitleRow}>
                  <View style={[styles.sectionIconBadge, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="checkmark-done-circle-outline" size={15} color="#2563EB" />
                  </View>
                  <Text style={styles.sectionMainTitle}>Đã thu thập</Text>
                  <View style={[styles.sectionQuantityPill, { backgroundColor: '#DBEAFE' }]}>
                    <Text style={[styles.sectionQuantityText, { color: '#1E40AF' }]}>
                      {activeCollected.length} mã
                    </Text>
                  </View>
                </View>
                <Text style={styles.sectionDescription}>
                  Mã đang có hiệu lực trong ví. Sẵn sàng áp dụng khi thanh toán đặt sân.
                </Text>
              </View>

              {activeCollected.map((item) => (
                <VoucherCard
                  key={item.id}
                  userVoucher={item}
                  isCollected={true}
                  onPress={() => handleCardPress(item)}
                  onUsePress={() => {
                    if (item.venueIds && item.venueIds.length > 0) {
                      router.push(`/booking/${item.venueIds[0]}`);
                    } else {
                      router.push('/search');
                    }
                  }}
                />
              ))}
            </View>
          )}

          {/* ── Section: Mã đã hết lượt ── */}
          {showSoldOutSection && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderBox}>
                <View style={styles.sectionHeaderTitleRow}>
                  <View style={[styles.sectionIconBadge, { backgroundColor: '#FEF2F2' }]}>
                    <Ionicons name="alert-circle-outline" size={15} color="#DC2626" />
                  </View>
                  <Text style={[styles.sectionMainTitle, { color: COLORS.onSurfaceVariant }]}>
                    Mã đã hết lượt
                  </Text>
                  <View style={[styles.sectionQuantityPill, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={[styles.sectionQuantityText, { color: '#991B1B' }]}>
                      {soldOutCollected.length} mã
                    </Text>
                  </View>
                </View>
                <Text style={styles.sectionDescription}>
                  Mã trong ví đã đạt tối đa số lượt sử dụng trên hệ thống.
                </Text>
              </View>

              {soldOutCollected.map((item) => (
                <VoucherCard
                  key={item.id}
                  userVoucher={item}
                  isCollected={true}
                  onPress={() => handleCardPress(item)}
                  onUsePress={() => {
                    if (item.venueIds && item.venueIds.length > 0) {
                      router.push(`/booking/${item.venueIds[0]}`);
                    } else {
                      router.push('/search');
                    }
                  }}
                />
              ))}
            </View>
          )}

          {/* ── Section: Đã hết hạn ── */}
          {showExpiredSection && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderBox}>
                <View style={styles.sectionHeaderTitleRow}>
                  <View style={[styles.sectionIconBadge, { backgroundColor: '#F1F5F9' }]}>
                    <Ionicons name="time-outline" size={14} color="#64748B" />
                  </View>
                  <Text style={[styles.sectionMainTitle, { color: COLORS.onSurfaceVariant }]}>
                    Đã hết hạn
                  </Text>
                  <View style={[styles.sectionQuantityPill, { backgroundColor: '#E2E8F0' }]}>
                    <Text style={[styles.sectionQuantityText, { color: '#475569' }]}>
                      {expiredCollected.length} mã
                    </Text>
                  </View>
                </View>
                <Text style={styles.sectionDescription}>
                  Mã đã kết thúc hiệu lực trong 24 giờ qua. Sẽ tự động biến mất khỏi ví sau 24h.
                </Text>
              </View>

              {expiredCollected.map((item) => (
                <VoucherCard
                  key={item.id}
                  userVoucher={item}
                  isCollected={true}
                  onPress={() => handleCardPress(item)}
                  onUsePress={() => {
                    if (item.venueIds && item.venueIds.length > 0) {
                      router.push(`/booking/${item.venueIds[0]}`);
                    } else {
                      router.push('/search');
                    }
                  }}
                />
              ))}
            </View>
          )}

          {/* ── Section: Đã sử dụng ── */}
          {showUsedSection && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderBox}>
                <View style={styles.sectionHeaderTitleRow}>
                  <View style={[styles.sectionIconBadge, { backgroundColor: '#F1F5F9' }]}>
                    <Ionicons name="receipt-outline" size={14} color="#64748B" />
                  </View>
                  <Text style={[styles.sectionMainTitle, { color: COLORS.onSurfaceVariant }]}>
                    Mã đã sử dụng
                  </Text>
                  <View style={[styles.sectionQuantityPill, { backgroundColor: '#E2E8F0' }]}>
                    <Text style={[styles.sectionQuantityText, { color: '#475569' }]}>
                      {usedCollected.length} mã
                    </Text>
                  </View>
                </View>
                <Text style={styles.sectionDescription}>
                  Các mã khuyến mãi bạn đã áp dụng thành công cho đơn đặt sân.
                </Text>
              </View>

              {usedCollected.map((item) => (
                <VoucherCard
                  key={item.id}
                  userVoucher={item}
                  isCollected={true}
                  onPress={() => handleCardPress(item)}
                  onUsePress={() => {
                    if (item.venueIds && item.venueIds.length > 0) {
                      router.push(`/booking/${item.venueIds[0]}`);
                    } else {
                      router.push('/search');
                    }
                  }}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ── Voucher Detail Modal ── */}
      <VoucherDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        userVoucher={selectedUserVoucher}
        isAuthenticated={isLoggedIn}
        isAlreadyCollected={true}
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
    paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    color: COLORS.onSurface,
    fontSize: 16.5,
  },
  rightActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    padding: 6,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
    paddingVertical: 6,
  },
  inputSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputSubmitBtnDisabled: {
    backgroundColor: COLORS.outlineVariant,
  },
  inputSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 77, 64, 0.06)',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    padding: 10,
    borderRadius: BORDER_RADIUS.lg,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 77, 64, 0.12)',
  },
  tipIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  tipSub: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    lineHeight: 15,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12.5,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: SPACING.md,
  },
  sectionHeaderBox: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    marginBottom: 10,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionMainTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: COLORS.onSurface,
    flex: 1,
    letterSpacing: -0.2,
  },
  sectionQuantityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  sectionQuantityText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  sectionDescription: {
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
    lineHeight: 16,
    paddingLeft: 34,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.sm,
    fontSize: 13,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
    fontSize: 15,
  },
  emptySub: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.outline,
    marginTop: 4,
    textAlign: 'center',
    fontSize: 12.5,
    lineHeight: 18,
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.error,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 100,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exploreBtnText: {
    color: '#003527',
    fontSize: 13,
    fontWeight: '800',
  },
});
