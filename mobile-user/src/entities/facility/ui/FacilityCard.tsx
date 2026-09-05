import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

export interface Facility {
  id: string;
  name: string;
  rating: number;
  location: string;
  distance: string;
  price: string;
  status: string;
  statusType: 'success' | 'warning';
  imageUrl: string;
  sport?: string;
  area?: string;
  priceCategory?: string;
  latitude?: number | null;
  longitude?: number | null;
  openingTime?: string | null;
  closingTime?: string | null;
}

interface FacilityCardProps {
  facility: Facility;
  style?: any;
  onPress?: () => void;
  onBookPress?: () => void;
}

export function FacilityCard({ facility, style, onPress, onBookPress }: FacilityCardProps) {
  const isWarning = facility.statusType === 'warning' || facility.status === 'Đóng cửa';
  const hasRating = facility.rating != null && facility.rating > 0;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* ── Image & Overlay Badges ── */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              facility.imageUrl ||
              '',
          }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Top Left: Sport Name */}
        {facility.sport ? (
          <View style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{facility.sport}</Text>
          </View>
        ) : null}

        {/* Top Right: Distance */}
        {facility.distance && facility.distance !== '-- km' ? (
          <View style={styles.distanceBadge}>
            <MaterialIcons name="near-me" size={11} color={COLORS.white} />
            <Text style={styles.distanceBadgeText}>{facility.distance}</Text>
          </View>
        ) : null}

        {/* Bottom Left: Star Rating or Mới */}
        <View style={styles.ratingBadge}>
          {hasRating ? (
            <>
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text style={styles.ratingBadgeText}>{facility.rating.toFixed(1)}</Text>
            </>
          ) : (
            <Text style={styles.newBadgeText}>Mới</Text>
          )}
        </View>

        {/* Bottom Right: Status Dot */}
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isWarning ? COLORS.error : '#10B981' },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: isWarning ? COLORS.errorText : '#065F46' },
            ]}
          >
            {facility.status}
          </Text>
        </View>
      </View>

      {/* ── Card Content Body ── */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {facility.name}
        </Text>

        {/* Location Row */}
        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={13} color={COLORS.outline} />
          <Text style={styles.locationText} numberOfLines={1}>
            {facility.location || facility.area || 'Hà Nội'}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Footer: Price & Quick Action */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Giá từ</Text>
            <Text style={styles.price}>
              {facility.price}
              <Text style={styles.priceUnit}>/h</Text>
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.detailBtn}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <Text style={styles.detailBtnText}>Chi tiết</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookBtn}
              onPress={onBookPress || onPress}
              activeOpacity={0.85}
            >
              <Text style={styles.bookBtnText}>Đặt ngay</Text>
              <Ionicons name="arrow-forward" size={12} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
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
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  sportBadgeText: {
    fontSize: 10.5,
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
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    gap: 3,
  },
  distanceBadgeText: {
    fontSize: 10.5,
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
  statusBadge: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: SPACING.md,
    gap: 4,
  },
  name: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    fontSize: 15,
    color: COLORS.onSurface,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.outline,
    flex: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    gap: 1,
  },
  priceLabel: {
    fontSize: 9.5,
    color: COLORS.outline,
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.outline,
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
