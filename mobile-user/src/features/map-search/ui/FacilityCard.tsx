import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button, Badge } from '../../../shared/ui';
import { MapVenue } from '../../../entities/facility/model/useMapFacilities';

interface MapFacilityCardProps {
  venue: MapVenue;
  onClose: () => void;
  onBook: (venueId: string) => void;
  onDirections: (venue: MapVenue) => void;
}

const StarRating = ({ rating }: { rating: number }) => (
  <View style={styles.ratingRow}>
    {[1, 2, 3, 4, 5].map((star) => (
      <MaterialIcons
        key={star}
        name={star <= Math.round(rating) ? 'star' : 'star-border'}
        size={14}
        color={COLORS.secondary}
      />
    ))}
    <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
  </View>
);

export const MapFacilityCard = memo(
  ({ venue, onClose, onBook, onDirections }: MapFacilityCardProps) => {
    const priceDisplay =
      venue.minPrice > 0
        ? venue.maxPrice > venue.minPrice
          ? `${Math.round(venue.minPrice / 1000)}k – ${Math.round(venue.maxPrice / 1000)}k/h`
          : `${Math.round(venue.minPrice / 1000)}k/h`
        : 'Liên hệ';

    return (
      <View style={styles.container}>
        {/* Drag indicator */}
        <View style={styles.dragHandle} />

        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <MaterialIcons name="close" size={18} color={COLORS.onSurfaceVariant} />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Cover image */}
          {venue.coverImage ? (
            <Image
              source={{ uri: venue.coverImage }}
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <MaterialIcons name="sports" size={32} color={COLORS.outline} />
            </View>
          )}

          {/* Info section */}
          <View style={styles.info}>
            {/* Badge + Rating */}
            <View style={styles.topRow}>
              <Badge
                text={venue.sportName}
                variant="default"
                style={styles.sportBadge}
              />
              <StarRating rating={venue.rating} />
            </View>

            {/* Name */}
            <Text style={styles.venueName} numberOfLines={2}>
              {venue.name}
            </Text>

            {/* Location */}
            <View style={styles.locationRow}>
              <MaterialIcons
                name="location-on"
                size={13}
                color={COLORS.outline}
              />
              <Text style={styles.locationText} numberOfLines={1}>
                {venue.location}
              </Text>
            </View>

            {/* Price */}
            <View style={styles.priceRow}>
              <MaterialIcons
                name="payments"
                size={14}
                color={COLORS.primary}
              />
              <Text style={styles.priceLabel}>Giá: </Text>
              <Text style={styles.priceValue}>{priceDisplay}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                variant="outline"
                title="Đường đi"
                icon="directions"
                style={styles.actionBtn}
                onPress={() => onDirections(venue)}
              />
              <Button
                variant="primary"
                title="Đặt sân ngay"
                icon="event-available"
                style={[styles.actionBtn, styles.bookBtn]}
                onPress={() => onBook(venue.id)}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
);

MapFacilityCard.displayName = 'MapFacilityCard';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: SPACING.marginMobile,
    right: SPACING.marginMobile,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
    alignSelf: 'center',
    marginTop: SPACING.base,
    marginBottom: SPACING.xs,
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.base,
    right: SPACING.base,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  coverImage: {
    width: 90,
    height: 100,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.surfaceVariant,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: SPACING.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sportBadge: {
    paddingHorizontal: SPACING.base,
    paddingVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  ratingNumber: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontWeight: TYPOGRAPHY.labelSm.fontWeight,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginLeft: 2,
  },
  venueName: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: '700' as const,
    fontSize: 15,
    color: COLORS.onSurface,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 11,
    color: COLORS.outline,
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  priceLabel: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  priceValue: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: '700' as const,
    fontSize: 13,
    color: COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.base,
    marginTop: SPACING.xs,
  },
  actionBtn: {
    flex: 1,
    height: 36,
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
  },
});
