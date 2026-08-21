import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { RecommendedVenue } from '../../../entities/facility';
import { recordRecommendationClick } from '../../../entities/facility/api/facilityApi';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(270, width * 0.72);

export interface PersonalizedRecommendationsProps {
  venues: RecommendedVenue[];
  loading: boolean;
  error?: string | null;
  onVenuePress: (venueId: string) => void;
  onSeeAllPress: () => void;
}

export function PersonalizedRecommendations({
  venues,
  loading,
  error,
  onVenuePress,
  onSeeAllPress,
}: PersonalizedRecommendationsProps) {
  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleRow}>
            <View style={styles.aiIconBadge}>
              <MaterialIcons name="auto-awesome" size={17} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Gợi Ý Dành Riêng Cho Bạn</Text>
              <Text style={styles.sectionSub}>AI phân tích thói quen & vị trí của bạn</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollList}
        >
          {Array.from({ length: 3 }).map((_, idx) => (
            <View key={idx} style={styles.skeletonCard} />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (error || !venues || venues.length === 0) {
    return null; // Không hiển thị nếu không có dữ liệu để giữ Home luôn sạch đẹp
  }

  const handleCardPress = (venue: RecommendedVenue) => {
    // Record impression click metric asynchronously
    try {
      recordRecommendationClick(venue.id);
    } catch (_) {}
    onVenuePress(venue.id);
  };

  const formatPrice = (price?: number | null) => {
    if (!price || price <= 0) return 'Đang cập nhật';
    return `${price.toLocaleString('vi-VN')}đ/h`;
  };

  const getReasonBadgeStyle = (reasonType?: string) => {
    switch (reasonType) {
      case 'HISTORY':
        return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', icon: 'whatshot' };
      case 'SPORT':
        return { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A', icon: 'sports-soccer' };
      case 'DISTANCE':
        return { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB', icon: 'near-me' };
      case 'PRICE':
        return { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', icon: 'local-offer' };
      default:
        return { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', icon: 'star' };
    }
  };

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={styles.aiIconBadge}>
            <MaterialIcons name="auto-awesome" size={17} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.titleWithSparkle}>
              <Text style={styles.sectionTitle}>Gợi Ý Dành Riêng Cho Bạn</Text>
              <View style={styles.smartPill}>
                <Text style={styles.smartPillText}>AI MATCH</Text>
              </View>
            </View>
            <Text style={styles.sectionSub}>Phân tích theo môn sở trường & cự ly gần</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onSeeAllPress}
          style={styles.seeAllButton}
          activeOpacity={0.75}
        >
          <Text style={styles.seeAllText}>Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
        decelerationRate="fast"
      >
        {venues.map((venue) => {
          const badgeStyle = getReasonBadgeStyle(venue.reasonType);
          const coverUrl = venue.coverImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&auto=format&fit=crop&q=80';

          return (
            <TouchableOpacity
              key={venue.id}
              style={styles.card}
              activeOpacity={0.88}
              onPress={() => handleCardPress(venue)}
            >
              {/* Cover Image + Badges */}
              <View style={styles.imageContainer}>
                <Image source={{ uri: coverUrl }} style={styles.coverImage} resizeMode="cover" />
                <View style={styles.imageOverlayGradient} />

                {/* Match Score Badge (Top Right) */}
                <View style={styles.matchScoreBadge}>
                  <MaterialIcons name="auto-awesome" size={12} color="#FFFFFF" />
                  <Text style={styles.matchScoreText}>{venue.matchScore || 95}% Phù hợp</Text>
                </View>

                {/* Sport Type Badge (Top Left) */}
                {venue.sportName ? (
                  <View style={styles.sportBadge}>
                    <Text style={styles.sportBadgeText}>{venue.sportName}</Text>
                  </View>
                ) : null}
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                {/* AI Reason Tag */}
                <View
                  style={[
                    styles.reasonTagPill,
                    { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border },
                  ]}
                >
                  <MaterialIcons
                    name={badgeStyle.icon as any}
                    size={12}
                    color={badgeStyle.text}
                  />
                  <Text
                    style={[styles.reasonTagText, { color: badgeStyle.text }]}
                    numberOfLines={1}
                  >
                    {venue.recommendationReason || 'Sân bóng chất lượng cao'}
                  </Text>
                </View>

                {/* Venue Name */}
                <Text style={styles.venueName} numberOfLines={1}>
                  {venue.name}
                </Text>

                {/* Location & Distance */}
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={13} color="#64748B" />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {venue.district || venue.location || 'Hà Nội'}
                    {venue.distanceKm != null ? ` • ${venue.distanceKm} km` : ''}
                  </Text>
                </View>

                {/* Bottom Row: Price + Book Button */}
                <View style={styles.cardFooter}>
                  <View style={styles.priceCol}>
                    <Text style={styles.priceLabel}>Giá từ</Text>
                    <Text style={styles.priceValue}>
                      {formatPrice(venue.minPrice)}
                    </Text>
                  </View>

                  <View style={styles.bookNowBtn}>
                    <Text style={styles.bookNowText}>Đặt ngay</Text>
                    <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginVertical: SPACING.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    marginBottom: SPACING.xs + 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#064E3B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  titleWithSparkle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  smartPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  smartPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.3,
  },
  sectionSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  seeAllText: {
    fontSize: 12.5,
    color: COLORS.primary,
    fontWeight: '500',
  },
  scrollList: {
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: 6,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 125,
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
  },
  matchScoreBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 78, 59, 0.92)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  matchScoreText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sportBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  sportBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E293B',
  },
  cardBody: {
    padding: 10,
    gap: 5,
  },
  reasonTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  reasonTagText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  venueName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceCol: {
    gap: 1,
  },
  priceLabel: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '400',
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  bookNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 6,
    gap: 3,
  },
  bookNowText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skeletonCard: {
    width: CARD_WIDTH,
    height: 220,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },
});
