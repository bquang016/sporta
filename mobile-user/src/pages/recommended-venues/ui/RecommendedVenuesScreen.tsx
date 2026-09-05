import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { useRecommendedVenues } from '../hooks/useRecommendedVenues';
import { RecommendedVenue } from '../../../entities/facility/model/facility.types';
import { VenueDetailModal } from '../../../features/venue-detail';
import { recordRecommendationClick } from '../../../entities/facility/api/facilityApi';

const SPORTS = ['Tất cả', 'Bóng đá', 'Pickleball', 'Cầu lông', 'Tennis', 'Bóng rổ', 'Bóng chuyền'];

const getReasonConfig = (reasonType?: string) => {
  switch (reasonType) {
    case 'SPORT':
      return {
        icon: 'sports-soccer' as const,
        color: '#059669',
        bg: '#ECFDF5',
        border: '#A7F3D0',
      };
    case 'DISTANCE':
      return {
        icon: 'near-me' as const,
        color: '#0284C7',
        bg: '#F0F9FF',
        border: '#BAE6FD',
      };
    case 'PRICE':
      return {
        icon: 'savings' as const,
        color: '#D97706',
        bg: '#FFFBEB',
        border: '#FDE68A',
      };
    case 'HISTORY':
      return {
        icon: 'history' as const,
        color: '#7C3AED',
        bg: '#F5F3FF',
        border: '#DDD6FE',
      };
    case 'POPULARITY':
    default:
      return {
        icon: 'local-fire-department' as const,
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#FECACA',
      };
  }
};

const formatPrice = (price?: number | null) => {
  return `${Number(price || 0).toLocaleString('vi-VN')} VND`;
};

export function RecommendedVenuesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    filteredVenues,
    displayedVenues,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    error,
    selectedSport,
    setSelectedSport,
    onRefresh,
    loadMore,
    selectedVenueId,
    selectedFacilityForModal,
    isVenueModalVisible,
    handleOpenVenueModal,
    handleCloseVenueModal,
  } = useRecommendedVenues();

  const handleBookNow = (venue: RecommendedVenue) => {
    recordRecommendationClick(venue.id).catch(() => {});
    router.push(('/booking/' + venue.id) as any);
  };

  const renderVenueCard = ({ item }: { item: RecommendedVenue }) => {
    const reasonConfig = getReasonConfig(item.reasonType);
    const hasRating = item.averageRating != null && item.averageRating > 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.92}
        onPress={() => handleOpenVenueModal(item)}
      >
        {/* ── Image & Header Badges ── */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                item.coverImage ||
                '',
            }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Top Left: Sport Name */}
          {item.sportName ? (
            <View style={styles.sportBadge}>
              <Text style={styles.sportBadgeText}>{item.sportName}</Text>
            </View>
          ) : null}

          {/* Top Right: AI Match Score */}
          <LinearGradient
            colors={['rgba(6, 78, 59, 0.95)', 'rgba(4, 120, 87, 0.92)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.matchScoreBadge}
          >
            <Ionicons name="sparkles" size={10} color="#FDE047" />
            <Text style={styles.matchScoreText}>{item.matchScore || 95}% phù hợp</Text>
          </LinearGradient>

          {/* Bottom Left: Star Rating */}
          <View style={styles.ratingBadge}>
            {hasRating ? (
              <>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingBadgeText}>{item.averageRating!.toFixed(1)}</Text>
              </>
            ) : (
              <Text style={styles.newBadgeText}>Mới</Text>
            )}
          </View>
        </View>

        {/* ── Card Content ── */}
        <View style={styles.cardBody}>
          {/* AI Reason Tag */}
          <View
            style={[
              styles.reasonChip,
              {
                backgroundColor: reasonConfig.bg,
                borderColor: reasonConfig.border,
              },
            ]}
          >
            <MaterialIcons
              name={reasonConfig.icon}
              size={13}
              color={reasonConfig.color}
            />
            <Text
              style={[styles.reasonChipText, { color: reasonConfig.color }]}
              numberOfLines={1}
            >
              {item.recommendationReason || 'Gợi ý từ Sporta AI'}
            </Text>
          </View>

          {/* Venue Name */}
          <Text style={styles.venueName} numberOfLines={1}>
            {item.name}
          </Text>

          {/* Location & Distance Combined Row */}
          <View style={styles.metaRow}>
            <View style={styles.locationCol}>
              <MaterialIcons name="location-on" size={14} color={COLORS.onSurfaceVariant} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.district || item.location || 'Hà Nội'}
              </Text>
            </View>

            {item.distanceKm != null && (
              <View style={styles.distanceCol}>
                <Text style={styles.dotSeparator}>•</Text>
                <MaterialIcons name="near-me" size={12} color={COLORS.primary} />
                <Text style={styles.distanceText}>{item.distanceKm} km</Text>
              </View>
            )}
          </View>

          {/* Operating Hours */}
          {item.openingTime ? (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={13} color={COLORS.primary} />
              <Text style={styles.hoursText}>
                {String(item.openingTime).slice(0, 5)} - {String(item.closingTime || '23:00').slice(0, 5)}
              </Text>
            </View>
          ) : null}

          {/* Card Divider */}
          <View style={styles.cardDivider} />

          {/* Footer: Price & Actions */}
          <View style={styles.footerRow}>
            <View style={styles.priceCol}>
              <Text style={styles.priceLabel}>Giá chỉ từ</Text>
              <Text style={styles.priceValue}>
                {formatPrice(item.minPrice)}
                <Text style={styles.priceUnit}>/h</Text>
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => handleOpenVenueModal(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.detailButtonText}>Chi tiết</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleBookNow(item)}
                activeOpacity={0.85}
              >
                <Text style={styles.bookButtonText}>Đặt sân</Text>
                <Ionicons name="arrow-forward" size={13} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* AI Header Hero Card */}
      <LinearGradient
        colors={['#064E3B', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBanner}
      >
        <View style={styles.heroLeft}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={12} color="#FDE047" />
            <Text style={styles.heroBadgeText}>SPORTA HYBRID AI</Text>
          </View>
          <Text style={styles.heroTitle}>Gợi Ý Thông Minh Dành Riêng Cho Bạn</Text>
          <Text style={styles.heroSub}>
            Tối ưu hóa theo vị trí địa lý, tần suất chơi và các cụm sân chất lượng được cộng đồng tin chọn.
          </Text>
        </View>
      </LinearGradient>

      {/* Sport Category Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={SPORTS}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterScroll}
        renderItem={({ item: sport }) => {
          const isSelected = selectedSport === sport;
          return (
            <TouchableOpacity
              key={sport}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => setSelectedSport(sport)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {sport}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.resultsCountRow}>
        <Text style={styles.resultsCountText}>
          Tìm thấy <Text style={styles.boldNum}>{filteredVenues.length}</Text> sân đề xuất phù hợp
        </Text>
        <Text style={styles.aiTag}>✨ AI Matching</Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.footerLoaderText}>Đang tải thêm sân gợi ý...</Text>
        </View>
      );
    }
    if (!hasMore && displayedVenues.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <View style={styles.footerEndLine} />
          <Text style={styles.footerEndText}>Đã hiển thị tất cả {displayedVenues.length} gợi ý tối ưu</Text>
          <View style={styles.footerEndLine} />
        </View>
      );
    }
    return <View style={{ height: 24 }} />;
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyLoadingText}>Đang phân tích sở thích & gợi ý sân phù hợp...</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <Ionicons name="sparkles-outline" size={36} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>Chưa tìm thấy sân gợi ý</Text>
        <Text style={styles.emptySub}>
          {error || 'Hãy đặt sân hoặc tham gia ghép kèo nhiều hơn để AI hiểu thói quen của bạn nhé!'}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => onRefresh()} activeOpacity={0.85}>
          <Text style={styles.retryBtnText}>Tải lại dữ liệu</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* ── Top App Bar ── */}
      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.onSurface} />
        </TouchableOpacity>

        <View style={styles.appBarCenter}>
          <Text style={styles.appBarTitle}>Gợi Ý Sân Cho Bạn</Text>
          <Text style={styles.appBarSub}>Đề xuất dựa trên AI & sở thích cá nhân</Text>
        </View>

        <View style={styles.aiPillBadge}>
          <Ionicons name="sparkles" size={13} color="#F59E0B" />
          <Text style={styles.aiPillText}>AI</Text>
        </View>
      </View>

      {/* ── Venue List with Infinite Scroll ── */}
      <FlatList
        data={displayedVenues}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderVenueCard}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />

      {/* ── Floating Venue Detail Modal ── */}
      <VenueDetailModal
        visible={isVenueModalVisible}
        venueId={selectedVenueId}
        initialFacility={selectedFacilityForModal}
        onClose={handleCloseVenueModal}
        onBookNow={(venueId) => {
          handleCloseVenueModal();
          router.push(('/booking/' + venueId) as any);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  appBarTitle: {
    ...TYPOGRAPHY.titleLg,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  appBarSub: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  aiPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  aiPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  listHeader: {
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    gap: 12,
  },
  heroBanner: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  heroLeft: {
    gap: 5,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: BORDER_RADIUS.full,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FDE047',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: 2,
  },
  heroSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 17,
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6.5,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  resultsCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  resultsCountText: {
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
  },
  boldNum: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  aiTag: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  /* Card Styles */
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    height: 145,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  sportBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BORDER_RADIUS.full,
  },
  sportBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  matchScoreBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  matchScoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BORDER_RADIUS.full,
    gap: 3,
  },
  ratingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  cardBody: {
    padding: SPACING.md,
    gap: 6,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    gap: 4,
  },
  reasonChipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  venueName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 1,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  dotSeparator: {
    fontSize: 10,
    color: '#CBD5E1',
    marginHorizontal: 2,
  },
  distanceCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  hoursText: {
    fontSize: 11.5,
    color: COLORS.primary,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  priceCol: {
    gap: 1,
  },
  priceLabel: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7.5,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  bookButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  footerEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: 10,
  },
  footerEndLine: {
    height: 1,
    width: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerEndText: {
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyLoadingText: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  emptySub: {
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 8,
  },
  retryBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.white,
  },
});
