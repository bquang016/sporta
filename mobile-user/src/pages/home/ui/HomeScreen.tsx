import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { SearchBar } from '../../../features/search-bar';
import { FacilityCard } from '../../../entities/facility';
import { useHomeScreen } from '../hooks/useHomeScreen';
import { Header } from '../components/Header';
import { VoucherBannerCarousel } from '../components/VoucherBannerCarousel';
import { ActionGrid } from '../components/ActionGrid';
import { StatsStrip } from '../components/StatsStrip';
import { MatchInvitations } from '../components/MatchInvitations';
import { TicketSessionsSection } from '../components/TicketSessionsSection';

const HEADER_HEIGHT = 56;
const SEARCH_CONTAINER_HEIGHT = 60;

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    router,
    isAuthenticated,
    userName,
    userAvatar,
    facilities,
    facilitiesLoading,
    facilitiesError,
    ticketSessions,
    ticketSessionsLoading,
    ticketSessionsError,
    refreshing,
    onRefresh,
    handleFacilityPress,
    handleAvatarPress,
    getGreeting,
  } = useHomeScreen();

  // ─── Collapsible Top Bar Animation (Same pattern as SocialScreen) ───────────
  const COLLAPSE_HEIGHT = HEADER_HEIGHT;
  const TOTAL_TOP_BAR_HEIGHT = insets.top + HEADER_HEIGHT + SEARCH_CONTAINER_HEIGHT;

  const scrollAnim = useRef(new Animated.Value(0)).current;

  const clampedScrollAnim = useRef(
    Animated.diffClamp(scrollAnim, 0, COLLAPSE_HEIGHT)
  ).current;

  const topBarTranslateY = clampedScrollAnim.interpolate({
    inputRange: [0, COLLAPSE_HEIGHT],
    outputRange: [0, -COLLAPSE_HEIGHT],
    extrapolate: 'clamp',
  });

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      if (y <= 0) {
        scrollAnim.setValue(0);
      } else {
        scrollAnim.setValue(y);
      }
    },
    [scrollAnim]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* ── Fixed Status Bar Background (che kín notch, z-index 101) ── */}
      <View style={[styles.statusBarBackground, { height: insets.top }]} />

      {/* ── Collapsible Top Bar: Header (collapses) + SearchBar (stays sticky) ── */}
      <Animated.View
        style={[
          styles.topBar,
          {
            top: insets.top,
            transform: [{ translateY: topBarTranslateY }],
          },
        ]}
      >
        {/* Header row */}
        <Header
          isAuthenticated={isAuthenticated}
          userName={userName}
          userAvatar={userAvatar}
          getGreeting={getGreeting}
          handleAvatarPress={handleAvatarPress}
        />

        {/* Sticky SearchBar row */}
        <View style={styles.searchBarRow}>
          <SearchBar
            onPress={() => router.push('/search')}
            onFilterPress={() =>
              router.push({ pathname: '/search', params: { openFilter: 'true' } })
            }
          />
        </View>
      </Animated.View>

      {/* ── Main Scroll View ── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: TOTAL_TOP_BAR_HEIGHT + SPACING.xs },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressViewOffset={TOTAL_TOP_BAR_HEIGHT}
          />
        }
      >
        {/* 1. 16:9 Banner Quảng Cáo & Voucher Carousel */}
        <VoucherBannerCarousel />

        {/* 2. Callout đăng nhập nếu chưa đăng nhập */}
        {!isAuthenticated && (
          <View style={styles.guestCtaCard}>
            <View style={styles.guestCtaIconCircle}>
              <Ionicons name="gift-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.guestCtaTextCol}>
              <Text style={styles.guestCtaTitle}>Đăng nhập để nhận ưu đãi</Text>
              <Text style={styles.guestCtaSub}>
                Nhận voucher giảm 50K & lưu sân yêu thích
              </Text>
            </View>
            <TouchableOpacity
              style={styles.guestCtaBtn}
              activeOpacity={0.85}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.guestCtaBtnText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3. Dịch vụ nổi bật (Action Grid 2x2) */}
        <ActionGrid isAuthenticated={isAuthenticated} />

        {/* 4. Stats Strip (Thống kê Sporta hôm nay) */}
        <StatsStrip />

        {/* 5. Ghép kèo thể thao (Live Match Invitations) */}
        <MatchInvitations />

        {/* 6. Sân Gần Bạn (Facilities Nearby) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleRow}>
              <View style={styles.titleIconBox}>
                <Ionicons name="navigate-outline" size={17} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Sân Gần Bạn</Text>
                <Text style={styles.sectionSub}>Sân bãi chất lượng cao quanh khu vực bạn</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/search')}
              style={styles.seeAllButton}
              activeOpacity={0.75}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.facilitiesScrollList}
            decelerationRate="fast"
          >
            {facilitiesLoading ? (
              // Skeletons
              Array.from({ length: 3 }).map((_, idx) => (
                <View key={idx} style={styles.facilitySkeletonCard} />
              ))
            ) : facilitiesError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{facilitiesError}</Text>
              </View>
            ) : facilities.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="football-outline" size={28} color={COLORS.outlineVariant} />
                <Text style={styles.emptyText}>Chưa có sân nào trong khu vực</Text>
              </View>
            ) : (
              facilities.map((facility) => (
                <View key={facility.id} style={styles.facilityCardWrapper}>
                  <FacilityCard
                    facility={facility}
                    onPress={() => handleFacilityPress(facility.id)}
                    onBookPress={() => handleFacilityPress(facility.id)}
                  />
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {/* 7. Sân Chơi Xé Vé (Ticket Sessions) */}
        <TicketSessionsSection
          sessions={ticketSessions}
          loading={ticketSessionsLoading}
          error={ticketSessionsError}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    zIndex: 101,
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  searchBarRow: {
    height: SEARCH_CONTAINER_HEIGHT,
    paddingHorizontal: SPACING.marginMobile,
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: 120,
    gap: SPACING.md + 2,
  },
  guestCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md - 2,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    gap: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  guestCtaIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestCtaTextCol: {
    flex: 1,
    gap: 1,
  },
  guestCtaTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
    fontSize: 13.5,
  },
  guestCtaSub: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  guestCtaBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.md,
  },
  guestCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  section: {
    gap: SPACING.xs + 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  sectionSub: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginTop: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  seeAllText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 11.5,
  },
  facilitiesScrollList: {
    gap: SPACING.sm,
    paddingVertical: 4,
  },
  facilityCardWrapper: {
    width: 235,
  },
  facilitySkeletonCard: {
    width: 235,
    height: 200,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: BORDER_RADIUS.xl,
    opacity: 0.6,
  },
  errorBox: {
    padding: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
  },
  emptyBox: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.lg,
    width: 250,
  },
  emptyText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
});

export default HomeScreen;
