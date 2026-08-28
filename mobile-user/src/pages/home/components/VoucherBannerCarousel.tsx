import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { voucherApi } from '../../../features/voucher/api';
import { Voucher, DiscountType, VoucherScope, VoucherStatus } from '../../../features/voucher/types';
import { VoucherDetailModal } from '../../../features/voucher/ui/VoucherDetailModal';
import { useIsLoggedIn } from '../../../shared/hooks/useIsLoggedIn';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = SPACING.marginMobile;
const CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
// Strict 16:9 aspect ratio
const CARD_HEIGHT = Math.round(CARD_WIDTH * (9 / 16));

interface FallbackBanner {
  id: string;
  isFallback: true;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  code: string;
  discountText: string;
  imageUrl: string;
  gradientColors: readonly [string, string, ...string[]];
  targetRoute?: string;
  voucherData?: Partial<Voucher>;
}

const DEFAULT_FEATURED_BANNERS: FallbackBanner[] = [
  {
    id: 'promo-welcome-50k',
    isFallback: true,
    title: 'Chào bạn mới · Giảm 50.000đ',
    subtitle: 'Nhập SPORTA50 khi đặt sân bóng đá, cầu lông, pickleball',
    badge: 'TÂN THỦ',
    badgeColor: '#FED01B',
    code: 'SPORTA50',
    discountText: 'GIẢM 50K',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80',
    gradientColors: ['rgba(6, 78, 59, 0.2)', 'rgba(0, 33, 23, 0.88)'],
    targetRoute: '/vouchers/explore',
    voucherData: {
      id: 'mock-sporta50',
      name: 'Chào bạn mới · Giảm 50.000đ',
      code: 'SPORTA50',
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 50000,
      minOrderAmount: 200000,
      maxDiscountAmount: 50000,
      maxUsagePerUser: 1,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      totalQuantity: 1000,
      collectedQuantity: 120,
      usedQuantity: 45,
      voucherScope: VoucherScope.SYSTEM,
      status: VoucherStatus.ACTIVE,
      bannerImageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'promo-summer-cup',
    isFallback: true,
    title: 'Siêu Giải Đấu Sporta Cup 2026',
    subtitle: 'Tổng giải thưởng 50 triệu đồng · Đăng ký thi đấu ngay!',
    badge: 'GIẢI ĐẤU',
    badgeColor: '#10B981',
    code: 'SPORTACUP',
    discountText: 'HOT EVENT',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80',
    gradientColors: ['rgba(30, 58, 138, 0.2)', 'rgba(15, 23, 42, 0.88)'],
    targetRoute: '/clubs',
  },
  {
    id: 'promo-happy-hour',
    isFallback: true,
    title: 'Giờ Vàng Thể Thao · Giảm 20%',
    subtitle: 'Khung giờ 14:00 - 17:00 các ngày trong tuần tại mọi cụm sân',
    badge: 'GIỜ VÀNG',
    badgeColor: '#F59E0B',
    code: 'GIOVANG20',
    discountText: 'GIẢM 20%',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&auto=format&fit=crop&q=80',
    gradientColors: ['rgba(180, 83, 9, 0.2)', 'rgba(67, 20, 7, 0.88)'],
    targetRoute: '/vouchers/explore',
    voucherData: {
      id: 'mock-giovang20',
      name: 'Giờ Vàng Thể Thao · Giảm 20%',
      code: 'GIOVANG20',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      minOrderAmount: 150000,
      maxDiscountAmount: 40000,
      maxUsagePerUser: 2,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
      totalQuantity: 500,
      collectedQuantity: 80,
      usedQuantity: 30,
      voucherScope: VoucherScope.SYSTEM,
      status: VoucherStatus.ACTIVE,
      bannerImageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&auto=format&fit=crop&q=80',
    },
  },
];

function formatVoucherDiscount(v: Voucher): string {
  if (v.discountType === DiscountType.PERCENTAGE) {
    return `GIẢM ${v.discountValue}%`;
  }
  const valK = Math.round(v.discountValue / 1000);
  return `GIẢM ${valK}K`;
}

function formatEndDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return `HSD: ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  } catch {
    return '';
  }
}

interface VoucherBannerCarouselProps {
  onVoucherPress?: (voucher: Voucher) => void;
}

export function VoucherBannerCarousel({ onVoucherPress }: VoucherBannerCarouselProps) {
  const router = useRouter();
  const { isLoggedIn } = useIsLoggedIn();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Modal State
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: serverVouchers = [] } = useQuery({
    queryKey: ['systemVoucherBanners'],
    queryFn: () => voucherApi.getSystemVouchers(),
    staleTime: 30 * 1000,
    refetchOnMount: true,
  });

  // Keep max 10 banner items (newest first from backend query)
  const displayItems: Array<Voucher | FallbackBanner> = [
    ...serverVouchers.slice(0, 10),
    ...(serverVouchers.length === 0 ? DEFAULT_FEATURED_BANNERS : []),
  ];

  // Auto scroll every 5s
  useEffect(() => {
    if (displayItems.length <= 1) return;
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % displayItems.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * CARD_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeIndex, displayItems.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / CARD_WIDTH);
    if (index !== activeIndex && index >= 0 && index < displayItems.length) {
      setActiveIndex(index);
    }
  };

  const { data: myVouchers = [] } = useQuery({
    queryKey: ['myVouchers'],
    queryFn: () => voucherApi.getMyVouchers(),
    enabled: isLoggedIn,
  });

  const handlePressItem = (item: Voucher | FallbackBanner) => {
    if ('isFallback' in item) {
      if (item.voucherData) {
        setSelectedVoucher(item.voucherData as Voucher);
        setModalVisible(true);
      } else if (item.targetRoute) {
        router.push(item.targetRoute as any);
      }
    } else {
      if (onVoucherPress) {
        onVoucherPress(item);
      } else {
        setSelectedVoucher(item);
        setModalVisible(true);
      }
    }
  };

  const isSelectedVoucherCollected = selectedVoucher 
    ? myVouchers.some(uv => uv.voucherId === selectedVoucher.id)
    : false;

  return (
    <View style={styles.container}>
      {/* ── Banner Carousel ── */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {displayItems.map((item, index) => {
          const isVoucher = !('isFallback' in item);
          const bannerImage = isVoucher
            ? item.bannerImageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80'
            : item.imageUrl;

          const title = isVoucher ? item.name : item.title;
          const subtitle = isVoucher
            ? `Áp dụng giảm tối đa ${item.maxDiscountAmount ? Math.round(item.maxDiscountAmount / 1000) + 'k' : 'không giới hạn'} · Đơn từ ${Math.round(item.minOrderAmount / 1000)}k`
            : item.subtitle;

          const isSoldOut = isVoucher && item.totalQuantity > 0 && item.usedQuantity >= item.totalQuantity;
          const isUpcoming = isVoucher && item.startDate ? new Date(item.startDate).getTime() > Date.now() : false;

          const badgeLabel = isSoldOut
            ? 'HẾT LƯỢT DÙNG'
            : isUpcoming
            ? 'SẮP DIỄN RA'
            : isVoucher
            ? 'VOUCHER HỆ THỐNG'
            : item.badge;

          const discountPill = isVoucher ? formatVoucherDiscount(item) : item.discountText;
          const codeText = isVoucher ? item.code : item.code;
          const expiryText = isVoucher ? formatEndDate(item.endDate) : 'Áp dụng toàn quốc';

          return (
            <TouchableOpacity
              key={item.id || `banner-${index}`}
              activeOpacity={0.92}
              style={styles.slide}
              onPress={() => handlePressItem(item)}
            >
              <ImageBackground
                source={{ uri: bannerImage }}
                style={[styles.cardImageBackground, isSoldOut && styles.cardImageBackgroundSoldOut]}
                imageStyle={styles.cardImage}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={
                    isSoldOut
                      ? ['rgba(15, 23, 42, 0.4)', 'rgba(30, 41, 59, 0.75)', 'rgba(15, 23, 42, 0.95)']
                      : ['rgba(0,0,0,0.15)', 'rgba(6, 78, 59, 0.45)', 'rgba(0, 33, 23, 0.92)']
                  }
                  locations={[0, 0.45, 1]}
                  style={styles.gradientOverlay}
                >
                  {/* Top Row: Category Badge & Discount Pill */}
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.badgeWrapper,
                        isSoldOut && styles.badgeWrapperSoldOut,
                        isUpcoming && styles.badgeWrapperUpcoming,
                      ]}
                    >
                      <View
                        style={[
                          styles.badgePulseDot,
                          isSoldOut && { backgroundColor: '#94A3B8' },
                          isUpcoming && { backgroundColor: '#F59E0B' },
                        ]}
                      />
                      <Text style={styles.badgeText}>{badgeLabel}</Text>
                    </View>

                    <View style={[styles.discountPill, isSoldOut && styles.discountPillSoldOut]}>
                      <MaterialIcons name="local-offer" size={13} color={isSoldOut ? '#FFFFFF' : '#003527'} />
                      <Text style={[styles.discountPillText, isSoldOut && { color: '#FFFFFF' }]}>
                        {discountPill}
                      </Text>
                    </View>
                  </View>

                  {/* Bottom Row: Title, Subtitle, Code & CTA */}
                  <View style={styles.cardBody}>
                    <Text style={styles.title} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text style={styles.subtitle} numberOfLines={1}>
                      {isSoldOut ? 'Mã khuyến mãi này đã hết lượt sử dụng trên hệ thống' : subtitle}
                    </Text>

                    <View style={styles.footerRow}>
                      <View style={[styles.codeTag, isSoldOut && styles.codeTagSoldOut]}>
                        <Ionicons
                          name="pricetag-outline"
                          size={12}
                          color={isSoldOut ? '#64748B' : COLORS.primary}
                        />
                        <Text style={[styles.codeText, isSoldOut && { color: '#64748B' }]}>
                          {codeText}
                        </Text>
                        <Text style={styles.expiryText}>• {expiryText}</Text>
                      </View>

                      <View
                        style={[
                          styles.ctaButton,
                          isSoldOut && styles.ctaButtonSoldOut,
                        ]}
                      >
                        <Text
                          style={[
                            styles.ctaButtonText,
                            isSoldOut && { color: '#64748B' },
                          ]}
                        >
                          {isSoldOut ? 'Đã hết' : isUpcoming ? 'Lưu trước' : 'Xem chi tiết'}
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={12}
                          color={isSoldOut ? '#64748B' : '#003527'}
                        />
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Pagination Indicator Dots */}
      {displayItems.length > 1 && (
        <View style={styles.paginationContainer}>
          {displayItems.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.paginationDot,
                activeIndex === idx ? styles.paginationDotActive : styles.paginationDotInactive,
              ]}
            />
          ))}
        </View>
      )}

      {/* ── Sleek Explore Voucher Banner Strip ── */}
      <TouchableOpacity
        style={styles.exploreBannerCard}
        onPress={() => router.push('/vouchers/explore')}
        activeOpacity={0.88}
      >
        <LinearGradient
          colors={['#004D40', '#00261C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.exploreBannerGradient}
        >
          {/* Left Icon Pill */}
          <View style={styles.exploreIconBox}>
            <MaterialIcons name="local-fire-department" size={20} color="#FED01B" />
          </View>

          {/* Center Info Text */}
          <View style={styles.exploreTextBox}>
            <View style={styles.exploreTagRow}>
              <Text style={styles.exploreHeading}>Kho Voucher & Ưu Đãi</Text>
              <View style={styles.hotBadge}>
                <Text style={styles.hotBadgeText}>HOT</Text>
              </View>
            </View>
            <Text style={styles.exploreSubheading} numberOfLines={1}>
              Săn mã giảm giá Sporta & Cụm sân
            </Text>
          </View>

          {/* Right Action Button */}
          <View style={styles.exploreActionBtn}>
            <Text style={styles.exploreActionText}>Săn mã</Text>
            <Ionicons name="arrow-forward" size={13} color="#003527" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Voucher Detail Modal */}
      <VoucherDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        voucher={selectedVoucher}
        isAuthenticated={isLoggedIn}
        isAlreadyCollected={isSelectedVoucherCollected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    gap: 8,
  },
  scrollContent: {
    gap: 0,
  },
  slide: {
    width: CARD_WIDTH,
  },
  cardImageBackground: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceContainerLow,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  cardImageBackgroundSoldOut: {
    opacity: 0.85,
  },
  cardImage: {
    borderRadius: BORDER_RADIUS.xl,
  },
  gradientOverlay: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgeWrapperSoldOut: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderColor: '#94A3B8',
  },
  badgeWrapperUpcoming: {
    backgroundColor: 'rgba(180, 83, 9, 0.65)',
    borderColor: '#F59E0B',
  },
  badgePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  discountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  discountPillSoldOut: {
    backgroundColor: '#475569',
  },
  discountPillText: {
    color: '#003527',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  cardBody: {
    gap: 3,
  },
  title: {
    ...TYPOGRAPHY.titleLg,
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 17,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 11.5,
    lineHeight: 15,
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  codeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BORDER_RADIUS.md,
  },
  codeTagSoldOut: {
    backgroundColor: '#E2E8F0',
  },
  codeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  expiryText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '600',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  ctaButtonSoldOut: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonText: {
    color: '#003527',
    fontSize: 11,
    fontWeight: '800',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    gap: 5,
  },
  paginationDot: {
    height: 4,
    borderRadius: 2,
  },
  paginationDotActive: {
    width: 22,
    backgroundColor: COLORS.primary,
  },
  paginationDotInactive: {
    width: 5,
    backgroundColor: COLORS.outlineVariant,
  },
  exploreBannerCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginTop: 2,
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  exploreBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    gap: 10,
  },
  exploreIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exploreTextBox: {
    flex: 1,
    gap: 1.5,
  },
  exploreTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exploreHeading: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  hotBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  hotBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  exploreSubheading: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 11,
    fontWeight: '500',
  },
  exploreActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FED01B',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: BORDER_RADIUS.full,
  },
  exploreActionText: {
    color: '#003527',
    fontSize: 11,
    fontWeight: '900',
  },
});

