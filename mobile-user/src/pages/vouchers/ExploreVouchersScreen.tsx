import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../shared/config/theme';
import { voucherApi } from '../../features/voucher/api';
import { Voucher, VoucherScope, UserVoucher } from '../../features/voucher/types';
import { VoucherCard } from '../../features/voucher/ui/VoucherCard';
import { VoucherDetailModal } from '../../features/voucher/ui/VoucherDetailModal';
import { useIsLoggedIn } from '../../shared/hooks/useIsLoggedIn';
import { useAlert } from '../../shared/contexts/AlertContext';

export function ExploreVouchersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoggedIn } = useIsLoggedIn();
  const { showAlert, showConfirm } = useAlert();

  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'VENUE'>('SYSTEM');
  const [inputCode, setInputCode] = useState('');
  const [submittingCode, setSubmittingCode] = useState(false);
  const [collectingVoucherId, setCollectingVoucherId] = useState<string | null>(null);

  // Modal State
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 1. Fetch Explore Vouchers
  const {
    data: allVouchers = [],
    isLoading: loadingVouchers,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['exploreVouchers'],
    queryFn: () => voucherApi.getExploreVouchers(),
    staleTime: 15 * 1000,
  });

  // 2. Fetch User Collected Vouchers
  const { data: myVouchers = [] } = useQuery<UserVoucher[]>({
    queryKey: ['myVouchers'],
    queryFn: () => voucherApi.getMyVouchers(),
    enabled: isLoggedIn,
  });

  const isCollected = (voucherId: string) => {
    return myVouchers.some((uv) => uv.voucherId === voucherId);
  };

  const getExploreVoucherRank = (voucher: Voucher, collected: boolean): number => {
    const now = Date.now();
    const end = voucher.endDate ? new Date(voucher.endDate).getTime() : now + 1;
    const isExpired = voucher.isExpired || end < now;
    const isWithin24h = end + 24 * 60 * 60 * 1000 >= now;

    if (!isExpired) {
      // 1. Còn hạn / Chưa thu thập
      // 2. Còn hạn / Đã thu thập (có biểu tượng đóng dấu)
      return collected ? 2 : 1;
    } else {
      // Hết hạn: Sau 24h tự động biến mất
      if (!isWithin24h) return 999;
      // 3. Hết hạn / Đã thu thập (chỉ hiển thị bên ví)
      if (collected) return 999;
      // 4. Hết hạn / Chưa thu thập (chỉ hiển thị trong vòng 24h)
      return 4;
    }
  };

  // Split current tab vouchers into categorized explore states
  const { uncollectedActive, collectedActive, soldOutVouchers, uncollectedExpired, totalAvailable } = useMemo(() => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    const currentTabList = allVouchers.filter((v) => {
      if (activeTab === 'SYSTEM') {
        return v.voucherScope === VoucherScope.SYSTEM;
      } else {
        return v.voucherScope === VoucherScope.VENUE;
      }
    });

    const uncollectedAct: Voucher[] = [];
    const collectedAct: Voucher[] = [];
    const soldOutList: Voucher[] = [];
    const uncollectedExp: Voucher[] = [];

    currentTabList.forEach((v) => {
      const end = v.endDate ? new Date(v.endDate).getTime() : now + 1;
      const isExpired = v.isExpired || end < now;
      const isWithin24h = end + twentyFourHours >= now;
      const collected = isCollected(v.id);
      const isSoldOut = (v.totalQuantity !== undefined && v.totalQuantity > 0 && v.usedQuantity >= v.totalQuantity);

      if (isSoldOut) {
        soldOutList.push(v);
      } else if (!isExpired) {
        if (!collected) {
          uncollectedAct.push(v);
        } else {
          collectedAct.push(v);
        }
      } else {
        // Expired within 24h and uncollected
        if (isWithin24h && !collected) {
          uncollectedExp.push(v);
        }
      }
    });

    return {
      uncollectedActive: uncollectedAct,
      collectedActive: collectedAct,
      soldOutVouchers: soldOutList,
      uncollectedExpired: uncollectedExp,
      totalAvailable: uncollectedAct.length + collectedAct.length + soldOutList.length + uncollectedExp.length,
    };
  }, [allVouchers, activeTab, myVouchers]);

  const handleCollectVoucher = async (v: Voucher) => {
    if (!isLoggedIn) {
      showConfirm(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản để lưu mã khuyến mãi vào ví của bạn.',
        () => router.push('/(auth)/login'),
        undefined,
        'Đăng nhập',
        'Đóng',
        { type: 'info' }
      );
      return;
    }

    try {
      setCollectingVoucherId(v.id);
      await voucherApi.collectVoucher(v.id);
      queryClient.invalidateQueries({ queryKey: ['myVouchers'] });
      queryClient.invalidateQueries({ queryKey: ['exploreVouchers'] });

      const isUpcoming = v.startDate ? new Date(v.startDate).getTime() > Date.now() : false;
      if (isUpcoming) {
        showAlert(
          'Đã lưu trước mã',
          `Mã "${v.code}" đã được lưu vào ví thành công. Bạn có thể sử dụng khi chương trình bắt đầu.`,
          undefined,
          { type: 'warning' }
        );
      } else {
        showAlert(
          'Lưu mã thành công',
          `Đã thêm mã giảm giá "${v.code}" vào ví voucher của bạn!`,
          undefined,
          { type: 'success' }
        );
      }
    } catch (e: any) {
      showAlert(
        'Không thể lưu mã',
        e?.message || 'Không thể lưu voucher, vui lòng thử lại sau.',
        undefined,
        { type: 'error' }
      );
    } finally {
      setCollectingVoucherId(null);
    }
  };

  const handleApplyCode = async () => {
    if (!inputCode.trim()) return;
    if (!isLoggedIn) {
      showConfirm(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản để lưu mã khuyến mãi.',
        () => router.push('/(auth)/login'),
        undefined,
        'Đăng nhập',
        'Đóng',
        { type: 'info' }
      );
      return;
    }

    setSubmittingCode(true);
    try {
      const collected = await voucherApi.collectVoucherByCode(inputCode.trim());
      setInputCode('');
      queryClient.invalidateQueries({ queryKey: ['myVouchers'] });
      queryClient.invalidateQueries({ queryKey: ['exploreVouchers'] });

      const vCode = collected.voucherCode || inputCode.toUpperCase();
      showAlert(
        'Lưu mã thành công',
        `Mã khuyến mãi "${vCode}" đã được thêm vào ví của bạn!`,
        undefined,
        { type: 'success' }
      );
    } catch (e: any) {
      showAlert(
        'Thu thập thất bại',
        e?.message || 'Mã khuyến mãi không tồn tại hoặc đã hết lượt sử dụng.',
        undefined,
        { type: 'error' }
      );
    } finally {
      setSubmittingCode(false);
    }
  };

  const systemCount = allVouchers.filter((v) => v.voucherScope === VoucherScope.SYSTEM).length;
  const venueCount = allVouchers.filter((v) => v.voucherScope === VoucherScope.VENUE).length;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Săn Ưu Đãi & Voucher</Text>
          <Text style={styles.headerSubtitle}>Khám phá mã giảm giá toàn sàn và cụm sân</Text>
        </View>

        <TouchableOpacity
          style={styles.walletBtn}
          onPress={() => router.replace('/vouchers')}
          activeOpacity={0.8}
        >
          <Ionicons name="wallet-outline" size={18} color={COLORS.primary} />
          {myVouchers.length > 0 && (
            <View style={styles.walletBadge}>
              <Text style={styles.walletBadgeText}>{myVouchers.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Input Code Bar ── */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrap}>
          <Ionicons name="pricetag-outline" size={16} color={COLORS.primary} />
          <TextInput
            style={styles.inputField}
            placeholder="Nhập mã ưu đãi đặc biệt..."
            placeholderTextColor={COLORS.outline}
            value={inputCode}
            onChangeText={setInputCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.inputBtn,
            (!inputCode.trim() || submittingCode) && styles.inputBtnDisabled,
          ]}
          onPress={handleApplyCode}
          disabled={!inputCode.trim() || submittingCode}
          activeOpacity={0.85}
        >
          {submittingCode ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.inputBtnText}>Thu thập</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Tabs Navigation ── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'SYSTEM' && styles.tabItemActive]}
          onPress={() => setActiveTab('SYSTEM')}
          activeOpacity={0.85}
        >
          <MaterialIcons
            name="stars"
            size={16}
            color={activeTab === 'SYSTEM' ? COLORS.primary : COLORS.outline}
          />
          <Text
            style={[styles.tabLabel, activeTab === 'SYSTEM' && styles.tabLabelActive]}
          >
            Voucher Sporta ({systemCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'VENUE' && styles.tabItemActive]}
          onPress={() => setActiveTab('VENUE')}
          activeOpacity={0.85}
        >
          <Ionicons
            name="business-outline"
            size={15}
            color={activeTab === 'VENUE' ? COLORS.primary : COLORS.outline}
          />
          <Text
            style={[styles.tabLabel, activeTab === 'VENUE' && styles.tabLabelActive]}
          >
            Voucher Cụm Sân ({venueCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Voucher List By Sections ── */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {loadingVouchers && !isRefetching ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải danh sách ưu đãi...</Text>
          </View>
        ) : totalAvailable === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="ticket-outline" size={36} color={COLORS.outlineVariant} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có mã khuyến mãi nào</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'SYSTEM'
                ? 'Các chương trình ưu đãi toàn sàn sẽ sớm quay trở lại. Hãy theo dõi thường xuyên!'
                : 'Hiện chưa có mã ưu đãi từ các chủ sân. Hãy quay lại sau nhé!'}
            </Text>
          </View>
        ) : (
          <>
            {/* ── Section: Ưu đãi có thể lưu ── */}
            {uncollectedActive.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderBox}>
                  <View style={styles.sectionHeaderTitleRow}>
                    <View style={[styles.sectionIconBadge, { backgroundColor: '#ECFDF5' }]}>
                      <Ionicons name="gift-outline" size={14} color="#059669" />
                    </View>
                    <Text style={styles.sectionMainTitle}>Ưu đãi có thể lưu</Text>
                    <View style={[styles.sectionQuantityPill, { backgroundColor: '#D1FAE5' }]}>
                      <Text style={[styles.sectionQuantityText, { color: '#065F46' }]}>
                        {uncollectedActive.length} mã
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sectionDescription}>
                    Mã khuyến mãi đang mở. Lưu ngay vào ví để áp dụng giảm giá khi đặt sân.
                  </Text>
                </View>

                {uncollectedActive.map((voucher) => (
                  <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    isCollected={false}
                    onPress={() => {
                      setSelectedVoucher(voucher);
                      setModalVisible(true);
                    }}
                    onCollect={() => handleCollectVoucher(voucher)}
                    isCollecting={collectingVoucherId === voucher.id}
                    onUsePress={() => {
                      if (voucher.venueIds && voucher.venueIds.length > 0) {
                        router.push(`/booking/${voucher.venueIds[0]}`);
                      } else {
                        router.push('/search');
                      }
                    }}
                  />
                ))}
              </View>
            )}

            {/* ── Section: Đã thu thập ── */}
            {collectedActive.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderBox}>
                  <View style={styles.sectionHeaderTitleRow}>
                    <View style={[styles.sectionIconBadge, { backgroundColor: '#EFF6FF' }]}>
                      <Ionicons name="checkmark-done-circle-outline" size={15} color="#2563EB" />
                    </View>
                    <Text style={styles.sectionMainTitle}>Đã thu thập</Text>
                    <View style={[styles.sectionQuantityPill, { backgroundColor: '#DBEAFE' }]}>
                      <Text style={[styles.sectionQuantityText, { color: '#1E40AF' }]}>
                        {collectedActive.length} mã
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sectionDescription}>
                    Mã đã lưu trong ví và sẵn sàng sử dụng. Nhấn "Dùng ngay" để đặt sân.
                  </Text>
                </View>

                {collectedActive.map((voucher) => (
                  <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    isCollected={true}
                    onPress={() => {
                      setSelectedVoucher(voucher);
                      setModalVisible(true);
                    }}
                    onUsePress={() => {
                      if (voucher.venueIds && voucher.venueIds.length > 0) {
                        router.push(`/booking/${voucher.venueIds[0]}`);
                      } else {
                        router.push('/search');
                      }
                    }}
                  />
                ))}
              </View>
            )}

            {/* ── Section: Mã đã hết lượt ── */}
            {soldOutVouchers.length > 0 && (
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
                        {soldOutVouchers.length} mã
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sectionDescription}>
                    Các mã khuyến mãi đã đạt tối đa số lượt sử dụng trên hệ thống.
                  </Text>
                </View>

                {soldOutVouchers.map((voucher) => (
                  <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    isCollected={isCollected(voucher.id)}
                    onPress={() => {
                      setSelectedVoucher(voucher);
                      setModalVisible(true);
                    }}
                    onUsePress={() => {
                      if (voucher.venueIds && voucher.venueIds.length > 0) {
                        router.push(`/booking/${voucher.venueIds[0]}`);
                      } else {
                        router.push('/search');
                      }
                    }}
                  />
                ))}
              </View>
            )}

            {/* ── Section: Đã hết hạn ── */}
            {uncollectedExpired.length > 0 && (
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
                        {uncollectedExpired.length} mã
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.sectionDescription}>
                    Mã vừa kết thúc hiệu lực trong vòng 24 giờ qua. Sẽ tự động biến mất sau 24h.
                  </Text>
                </View>

                {uncollectedExpired.map((voucher) => (
                  <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    isCollected={false}
                    onPress={() => {
                      setSelectedVoucher(voucher);
                      setModalVisible(true);
                    }}
                    onUsePress={() => {
                      if (voucher.venueIds && voucher.venueIds.length > 0) {
                        router.push(`/booking/${voucher.venueIds[0]}`);
                      } else {
                        router.push('/search');
                      }
                    }}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Voucher Detail Modal */}
      <VoucherDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        voucher={selectedVoucher}
        isAuthenticated={isLoggedIn}
        isAlreadyCollected={selectedVoucher ? isCollected(selectedVoucher.id) : false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleLg,
    color: COLORS.onSurface,
    fontWeight: '900',
    fontSize: 16.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },
  walletBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 77, 64, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  walletBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 9,
    minWidth: 16,
    alignItems: 'center',
  },
  walletBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: 10,
    marginBottom: 6,
    padding: 6,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  inputWrap: {
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
    paddingVertical: 4,
  },
  inputBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBtnDisabled: {
    backgroundColor: COLORS.outlineVariant,
  },
  inputBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: 8,
    marginBottom: 10,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.md,
  },
  tabItemActive: {
    backgroundColor: 'rgba(0, 77, 64, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 77, 64, 0.15)',
  },
  tabLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.outline,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 40,
    paddingTop: 4,
  },
  centerBox: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING.xl,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: COLORS.outline,
    textAlign: 'center',
    lineHeight: 18,
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
});

export default ExploreVouchersScreen;
