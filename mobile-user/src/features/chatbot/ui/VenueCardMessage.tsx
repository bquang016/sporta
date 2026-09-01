import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY, SPACING } from '../../../shared/config/theme';

interface VenueCardMessageProps {
  card: {
    id: string;
    name: string;
    image?: string | null;
    subtitle?: string;
    price?: number | null;
    rating?: number | null;
    totalReviews?: number | null;
    actionText?: string;
    type?: string;
  };
  onActionPress: (id: string, cardType?: string, action?: 'detail' | 'book') => void;
}

export const VenueCardMessage: React.FC<VenueCardMessageProps> = ({ card, onActionPress }) => {
  const isMatchRoom = card.type === 'match_room' || card.type === 'partner';
  const isClub = card.type === 'club';
  const isDraft = card.type === 'booking_draft';
  const isVenue = !isMatchRoom && !isClub && !isDraft;

  const getBadgeInfo = () => {
    if (isMatchRoom) {
      return { text: 'Kèo ghép đôi', icon: 'people' as const, bg: '#059669' };
    }
    if (isClub) {
      return { text: 'CLB Thể thao', icon: 'shield-checkmark' as const, bg: '#0284C7' };
    }
    if (isDraft) {
      return { text: 'Bản nháp đặt sân', icon: 'receipt' as const, bg: '#D97706' };
    }
    return { text: 'Gợi ý sân', icon: 'sparkles' as const, bg: 'rgba(6, 78, 59, 0.9)' };
  };

  const badge = getBadgeInfo();

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => onActionPress(card.id, card.type, 'detail')}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`Xem chi tiết ${card.name}`}
    >
      {/* ── Card Image Header ── */}
      {card.image ? (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: card.image }} style={styles.image} resizeMode="cover" />
          <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
            <Ionicons name={badge.icon} size={10} color={COLORS.white} style={{ marginRight: 3 }} />
            <Text style={styles.typeBadgeText}>{badge.text}</Text>
          </View>
          {isVenue && card.rating != null && card.rating > 0 && (card.totalReviews == null || card.totalReviews > 0) ? (
            <View style={styles.floatingRatingBadge}>
              <Ionicons name="star" size={10} color="#F59E0B" />
              <Text style={styles.floatingRatingText}>
                {Number(card.rating).toFixed(1)}
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={[styles.fallbackImageWrapper, { backgroundColor: isMatchRoom ? '#ECFDF5' : isClub ? '#F0F9FF' : COLORS.surfaceContainer }]}>
          <Ionicons 
            name={isMatchRoom ? "people" : isClub ? "shield" : "football"} 
            size={36} 
            color={isMatchRoom ? '#059669' : isClub ? '#0284C7' : COLORS.primary} 
          />
          <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
            <Ionicons name={badge.icon} size={10} color={COLORS.white} style={{ marginRight: 3 }} />
            <Text style={styles.typeBadgeText}>{badge.text}</Text>
          </View>
          {isVenue && card.rating != null && card.rating > 0 && (card.totalReviews == null || card.totalReviews > 0) ? (
            <View style={styles.floatingRatingBadge}>
              <Ionicons name="star" size={10} color="#F59E0B" />
              <Text style={styles.floatingRatingText}>
                {Number(card.rating).toFixed(1)}
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {/* ── Card Body Info ── */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{card.name}</Text>
        
        {card.subtitle ? (
          <View style={styles.subtitleRow}>
            <Ionicons 
              name={isMatchRoom || isClub ? "trophy-outline" : "location-sharp"} 
              size={12} 
              color={COLORS.outline} 
              style={{ marginRight: 4, marginTop: 1 }} 
            />
            <Text style={styles.subtitle} numberOfLines={2}>{card.subtitle}</Text>
          </View>
        ) : null}

        {card.price != null && card.price > 0 ? (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {isMatchRoom ? 'Tiền chia kèo:' : 'Giá tham khảo:'}
            </Text>
            <Text style={styles.priceValue}>
              {card.price.toLocaleString('vi-VN')} {isMatchRoom ? 'đ/đội' : 'đ/h'}
            </Text>
          </View>
        ) : null}

        {/* ── Action Buttons ── */}
        {isVenue ? (
          <View style={styles.venueActionsRow}>
            {/* View Detail Button */}
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => onActionPress(card.id, card.type, 'detail')}
              activeOpacity={0.8}
            >
              <Ionicons name="information-circle-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.detailButtonText}>Xem chi tiết</Text>
            </TouchableOpacity>

            {/* Book Now Button */}
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => onActionPress(card.id, card.type, 'book')}
              activeOpacity={0.85}
            >
              <Text style={styles.bookButtonText}>Đặt sân ngay</Text>
              <Ionicons name="arrow-forward" size={13} color={COLORS.onSecondary} style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>
        ) : card.actionText ? (
          <TouchableOpacity
            style={[
              styles.button, 
              isDraft ? styles.draftButton : isMatchRoom ? styles.matchButton : styles.actionButton
            ]}
            onPress={() => onActionPress(card.id, card.type, isMatchRoom || isDraft ? 'book' : 'detail')}
            activeOpacity={0.85}
          >
            <Text style={[
              styles.actionButtonText, 
              isDraft ? styles.draftButtonText : isMatchRoom ? styles.matchButtonText : styles.actionButtonText
            ]}>
              {card.actionText}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={14}
              color={isDraft || isMatchRoom ? COLORS.white : COLORS.onSecondary}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginVertical: SPACING.xs,
    marginLeft: 44, // Aligned with bot message bubble
    marginRight: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: 275,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 115,
    backgroundColor: COLORS.surfaceContainer,
  },
  fallbackImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: 7,
    left: 7,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  typeBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  floatingRatingBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: BORDER_RADIUS.full,
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  floatingRatingText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#B45309',
  },
  content: {
    padding: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14.5,
    color: COLORS.onSurface,
    fontWeight: '800',
    marginBottom: 4,
    lineHeight: 19,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.onSurfaceVariant,
    fontSize: 11.5,
    flex: 1,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryOpacity05,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 8,
  },
  priceLabel: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  priceValue: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.primary,
  },

  /* Dual Action Buttons for Venue Cards */
  venueActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  detailButtonText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bookButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.secondary, // Athletic Gold
  },
  bookButtonText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.onSecondary, // Deep Emerald
  },

  /* Single Full Width Buttons for Clubs / Match Rooms */
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: COLORS.secondary, // Athletic Gold
  },
  actionButtonText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.onSecondary, // Deep Emerald
  },
  matchButton: {
    backgroundColor: '#059669', // Emerald green
  },
  matchButtonText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.white,
  },
  draftButton: {
    backgroundColor: COLORS.primary,
  },
  draftButtonText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.white,
  },
});
