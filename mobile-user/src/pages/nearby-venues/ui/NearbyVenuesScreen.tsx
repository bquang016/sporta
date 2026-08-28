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
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { useNearbyVenues, NearbyVenueItem } from '../hooks/useNearbyVenues';
import { VenueDetailModal } from '../../../features/venue-detail';

const SPORTS = ['Tất cả', 'Bóng đá', 'Pickleball', 'Cầu lông', 'Tennis', 'Bóng rổ', 'Bóng chuyền'];

export function NearbyVenuesScreen() {
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
    locationAddress,
    onRefresh,
    loadMore,
    selectedVenueId,
    selectedFacilityForModal,
    isVenueModalVisible,
    handleOpenVenueModal,
    handleCloseVenueModal,
  } = useNearbyVenues();

  const renderVenueCard = ({ item }: { item: NearbyVenueItem }) => {
    const hasRating = item.rating != null && item.rating > 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.92}
        onPress={() => handleOpenVenueModal(item)}
      >
        {/* ── Image & Badges ── */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Top Left: Sport Name */}
          <View style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{item.sport}</Text>
          </View>

          {/* Top Right: Distance Badge */}
          <View style={styles.distanceBadge}>
            <MaterialIcons name="near-me" size={12} color={COLORS.white} />
            <Text style={styles.distanceBadgeText}>{item.distance}</Text>
          </View>

          {/* Bottom Left: Rating */}
          <View style={styles.ratingBadge}>
            {hasRating ? (
              <>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingBadgeText}>{item.rating.toFixed(1)}</Text>
              </>
            ) : (
              <Text style={styles.newBadgeText}>Mới</Text>
            )}
          </View>
        </View>

        {/* ── Card Content ── */}
        <View style={styles.cardBody}>
          <View style={styles.nameRow}>
            <Text style={styles.venueName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>

          {/* Location / Address */}
          <View style={styles.metaRow}>
            <MaterialIcons name="location-on" size={14} color={COLORS.onSurfaceVariant} />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          {/* Operating Hours (if available) */}
          {item.openingTime ? (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={13} color={COLORS.primary} />
              <Text style={styles.hoursText}>
                {item.openingTime.slice(0, 5)} - {item.closingTime?.slice(0, 5) || '23:00'}
              </Text>
            </View>
          ) : null}

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Footer: Price & Action Buttons */}
          <View style={styles.footerRow}>
            <View style={styles.priceCol}>
              <Text style={styles.priceLabel}>Giá tham khảo</Text>
              <Text style={styles.priceValue}>
                {item.price}
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
                onPress={() => router.push(('/booking/' + item.id) as any)}
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
      {/* Location Banner */}
      <View style={styles.locationBanner}>
        <View style={styles.locationIconBox}>
          <MaterialIcons name="my-location" size={16} color={COLORS.primary} />
        </View>
        <View style={styles.locationTextBox}>
          <Text style={styles.locationBannerTitle}>Vị trí tìm kiếm</Text>
          <Text style={styles.locationBannerSub} numberOfLines={1}>
            {locationAddress || 'Đang xác định vị trí gần bạn...'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshLocBtn}
          onPress={() => onRefresh()}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Sport Category Filter Scroll */}
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
          Tìm thấy <Text style={styles.boldNum}>{filteredVenues.length}</Text> sân quanh bạn
        </Text>
        <Text style={styles.sortIndicator}>Gần nhất trước</Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.footerLoaderText}>Đang tải thêm sân...</Text>
        </View>
      );
    }
    if (!hasMore && displayedVenues.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <View style={styles.footerEndLine} />
          <Text style={styles.footerEndText}>Đã hiển thị tất cả {displayedVenues.length} sân</Text>
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
          <Text style={styles.emptyLoadingText}>Đang tìm các sân gần bạn nhất...</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <Ionicons name="navigate-outline" size={36} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>Không tìm thấy sân phù hợp</Text>
        <Text style={styles.emptySub}>
          {error || 'Hãy thử chuyển sang môn thể thao khác hoặc mở lại GPS để tìm kiếm chính xác hơn nhé!'}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => onRefresh()} activeOpacity={0.85}>
          <Text style={styles.retryBtnText}>Tải lại danh sách</Text>
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
          <Text style={styles.appBarTitle}>Sân Gần Bạn</Text>
          <Text style={styles.appBarSub}>Sắp xếp theo khoảng cách gần nhất</Text>
        </View>

        <TouchableOpacity
          style={styles.mapNavButton}
          onPress={() => router.push('/search')}
          activeOpacity={0.7}
        >
          <Ionicons name="map-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
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
  mapNavButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
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
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    gap: 10,
  },
  locationIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTextBox: {
    flex: 1,
  },
  locationBannerTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  locationBannerSub: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  refreshLocBtn: {
    padding: 6,
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
  sortIndicator: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.primary,
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
    height: 140,
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
  distanceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(4, 120, 87, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BORDER_RADIUS.full,
    gap: 3,
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  metaText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    flex: 1,
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
