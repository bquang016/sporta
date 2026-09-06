import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { MapVenue } from '../../../entities/facility/model/useMapFacilities';

interface MapFacilityCardProps {
  venue: MapVenue;
  onClose: () => void;
  onBook: (venueId: string) => void;
  onDirections?: (venue: MapVenue) => void;
}

export const MapFacilityCard = memo(
  ({ venue, onClose, onBook, onDirections }: MapFacilityCardProps) => {
    const insets = useSafeAreaInsets();
    const bottomPosition = Math.max(insets.bottom, 16) + 68;

    const translateY = useRef(new Animated.Value(300)).current;

    const closeCard = () => {
      Animated.timing(translateY, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    };

    useEffect(() => {
      translateY.setValue(300);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }, [venue.id]);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return gestureState.dy > 10;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 50 || gestureState.vy > 0.5) {
            closeCard();
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 8,
            }).start();
          }
        },
      })
    ).current;

    const formatVND = (price?: number | null) => `${Number(price || 0).toLocaleString('vi-VN')} VND`;

    const priceDisplay =
      venue.maxPrice > venue.minPrice && venue.maxPrice > 0
        ? `${formatVND(venue.minPrice)} – ${formatVND(venue.maxPrice)}/h`
        : `${formatVND(venue.minPrice || 0)}/h`;

    const hasRating = venue.rating != null && venue.rating > 0;
    const isWarning = venue.status === 'INACTIVE' || venue.status === 'Đóng cửa';

    return (
      <Animated.View
        style={[
          styles.container,
          { bottom: bottomPosition, transform: [{ translateY }] },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={closeCard} activeOpacity={0.7}>
          <MaterialIcons name="close" size={18} color={COLORS.onSurfaceVariant} />
        </TouchableOpacity>

        {/* Card Header & Image */}
        <View style={styles.cardHeader}>
          <Image
            source={
              venue.coverImage && venue.coverImage.trim()
                ? { uri: venue.coverImage.trim() }
                : require('../../../../assets/auth/football_stadium_hero.jpg')
            }
            style={styles.coverImage}
            resizeMode="cover"
          />

          {/* Sport Badge */}
          {venue.sportName ? (
            <View style={styles.sportBadge}>
              <Text style={styles.sportBadgeText}>{venue.sportName}</Text>
            </View>
          ) : null}

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            {hasRating ? (
              <>
                <Ionicons name="star" size={11} color="#F59E0B" />
                <Text style={styles.ratingBadgeText}>{venue.rating.toFixed(1)}</Text>
              </>
            ) : (
              <Text style={styles.newBadgeText}>Mới</Text>
            )}
          </View>
        </View>

        {/* Info Body */}
        <View style={styles.content}>
          <Text style={styles.venueName} numberOfLines={1}>
            {venue.name}
          </Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={13} color={COLORS.outline} />
            <Text style={styles.locationText} numberOfLines={1}>
              {venue.location || 'Hà Nội'}
            </Text>
          </View>

          {/* Price & Action Row */}
          <View style={styles.footerRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Giá thuê từ</Text>
              <Text style={styles.priceValue}>{priceDisplay}</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() => onBook(venue.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.detailBtnText}>Chi tiết</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() => onBook(venue.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.bookBtnText}>Đặt ngay</Text>
                <Ionicons name="arrow-forward" size={12} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }
);

MapFacilityCard.displayName = 'MapFacilityCard';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    zIndex: 100,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    height: 120,
    position: 'relative',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  sportBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  sportBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
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
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    gap: 3,
  },
  ratingBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#B45309',
  },
  newBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
  },
  content: {
    padding: SPACING.md,
    gap: 4,
  },
  venueName: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    fontSize: 15,
    color: COLORS.onSurface,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.outline,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  priceContainer: {
    gap: 1,
  },
  priceLabel: {
    fontSize: 9.5,
    color: COLORS.outline,
  },
  priceValue: {
    fontSize: 13.5,
    fontWeight: '900',
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6.5,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  detailBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  bookBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.white,
  },
});
