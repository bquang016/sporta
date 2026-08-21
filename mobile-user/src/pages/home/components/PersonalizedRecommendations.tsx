import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { RecommendedVenue } from '../../../entities/facility';
import { recordRecommendationClick } from '../../../entities/facility/api/facilityApi';

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
            <View style={styles.titleIconBox}>
              <Ionicons name="sparkles" size={16} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Gợi Ý Cho Bạn</Text>
              <Text style={styles.sectionSub}>Đang phân tích sở thích & vị trí...</Text>
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
    return null;
  }

  const handleCardPress = (venue: RecommendedVenue) => {
    recordRecommendationClick(venue.id).catch(() => {});
    onVenuePress(venue.id);
  };

  const formatPrice = (price?: number | null) => {
    if (!price || price <= 0) return 'Liên hệ';
    return `${price.toLocaleString('vi-VN')}đ`;
  };

  const getReasonConfig = (reasonType?: string) => {
    switch (reasonType) {
      case 'HISTORY':
        return {
          icon: 'history' as const,
          color: '#991B1B',
          bg: '#FEF2F2',
          border: '#FEE2E2',
        };
      case 'SPORT':
        return {
          icon: 'sports-soccer' as const,
          color: '#065F46',
          bg: '#ECFDF5',
          border: '#D1FAE5',
        };
      case 'DISTANCE':
        return {
          icon: 'near-me' as const,
          color: '#1D4ED8',
          bg: '#EFF6FF',
          border: '#DBEAFE',
        };
      case 'PRICE':
        return {
          icon: 'local-offer' as const,
          color: '#92400E',
          bg: '#FFFBEB',
          border: '#FEF3C7',
        };
      case 'POPULARITY':
      default:
        return {
          icon: 'local-fire-department' as const,
          color: '#374151',
          bg: '#F3F4F6',
          border: '#E5E7EB',
        };
    }
  };

  const cleanReasonText = (text?: string) => {
    if (!text) return 'Sân thể thao chất lượng cao';
    return text
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/gu, '')
      .trim();
  };

  return (
    <View style={styles.section}>
      {/* ── Section Header ── */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBox}>
            <Ionicons name="sparkles" size={16} color={COLORS.primary} />
          </View>
          <View>
            <View style={styles.titleWithBadge}>
              <Text style={styles.sectionTitle}>Gợi Ý Cho Bạn</Text>
              <View style={styles.smartBadge}>
                <Ionicons name="flash" size={10} color={COLORS.primary} />
                <Text style={styles.smartBadgeText}>AI MATCH</Text>
              </View>
            </View>
            <Text style={styles.sectionSub}>Đề xuất thông minh theo môn sở trường & cự ly</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onSeeAllPress}
          style={styles.seeAllButton}
          activeOpacity={0.75}
        >
          <Text style={styles.seeAllText}>Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Horizontal Scroll List ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
        decelerationRate="fast"
      >
        {venues.map((venue) => {
          const reasonConfig = getReasonConfig(venue.reasonType);
          const coverUrl =
            venue.coverImage ||
            'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&auto=format&fit=crop&q=80';

          return (
            <TouchableOpacity
              key={venue.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => handleCardPress(venue)}
            >
              {/* ── Image Container ── */}
              <View style={styles.imageContainer}>
                <Image source={{ uri: coverUrl }} style={styles.image} resizeMode="cover" />

                {/* Subtle Image Bottom Shadow */}
                <LinearGradient
                  colors={['transparent', 'rgba(0, 0, 0, 0.45)']}
                  style={styles.imageGradient}
                />

                {/* Badge Top Left: Sport Name */}
                {venue.sportName ? (
                  <View style={styles.sportBadge}>
                    <Text style={styles.sportBadgeText}>{venue.sportName}</Text>
                  </View>
                ) : null}

                {/* Badge Top Right: AI Match Score */}
                <LinearGradient
                  colors={['rgba(6, 78, 59, 0.95)', 'rgba(4, 120, 87, 0.92)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.matchScoreBadge}
                >
                  <Ionicons name="sparkles" size={10} color="#FDE047" />
                  <Text style={styles.matchScoreText}>{venue.matchScore || 95}% Phù hợp</Text>
                </LinearGradient>
              </View>

              {/* ── Card Content ── */}
              <View style={styles.content}>
                {/* Reason Tag Chip (Badge tinh tế, trang nhã) */}
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
                    {cleanReasonText(venue.recommendationReason)}
                  </Text>
                </View>

                {/* Venue Name */}
                <Text style={styles.name} numberOfLines={1}>
                  {venue.name}
                </Text>

                {/* Location & Distance Combined Row */}
                <View style={styles.metaRow}>
                  <View style={styles.locationCol}>
                    <MaterialIcons name="location-on" size={13} color="#94A3B8" />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {venue.district || venue.location || 'Hà Nội'}
                    </Text>
                  </View>

                  {venue.distanceKm != null && (
                    <View style={styles.distanceCol}>
                      <Text style={styles.dotSeparator}>•</Text>
                      <MaterialIcons name="near-me" size={11} color={COLORS.primary} />
                      <Text style={styles.distanceText}>{venue.distanceKm} km</Text>
                    </View>
                  )}
                </View>

                {/* Card Divider */}
                <View style={styles.cardDivider} />

                {/* Footer Row: Price + CTA Button */}
                <View style={styles.footerRow}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Giá chỉ từ</Text>
                    <Text style={styles.price}>
                      {formatPrice(venue.minPrice)}
                      <Text style={styles.priceUnit}>/h</Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleCardPress(venue)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.bookButtonText}>Đặt sân</Text>
                    <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
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
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  smartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 2,
  },
  smartBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.3,
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
  scrollList: {
    gap: 12,
    paddingVertical: 4,
  },
  card: {
    width: 242,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.07)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    height: 136,
    position: 'relative',
    backgroundColor: COLORS.surfaceVariant,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 48,
  },
  sportBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sportBadgeText: {
    fontWeight: '700',
    fontSize: 10.5,
    color: '#1E293B',
    letterSpacing: 0.1,
  },
  matchScoreBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    gap: 3.5,
    borderWidth: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  matchScoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 6,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  reasonChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginTop: 2,
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
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
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
    fontSize: 11.5,
    color: COLORS.primary,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginTop: 4,
    marginBottom: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  price: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.2,
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 1,
  },
  bookButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skeletonCard: {
    width: 242,
    height: 250,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 18,
    opacity: 0.6,
  },
});

