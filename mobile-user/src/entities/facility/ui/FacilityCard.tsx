import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';

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
}

interface FacilityCardProps {
  facility: Facility;
  style?: any;
  onPress?: () => void;
  onBookPress?: () => void;
}

export function FacilityCard({ facility, style, onPress, onBookPress }: FacilityCardProps) {
  const isWarning = facility.statusType === 'warning';
  
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: facility.imageUrl }} style={styles.image} resizeMode="cover" />
        
        {/* Status Badge sang trọng không dùng emoji */}
        <View style={styles.badgeContainer}>
          <View style={[styles.statusDot, { backgroundColor: isWarning ? COLORS.error : '#10B981' }]} />
          <Text style={[styles.badgeText, { color: isWarning ? COLORS.errorText : COLORS.primary }]}>
            {facility.status}
          </Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {facility.name}
          </Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={14} color="#D97706" />
            <Text style={styles.ratingText}>{facility.rating}</Text>
          </View>
        </View>
        
        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={14} color={COLORS.outline} />
          <Text style={styles.locationText} numberOfLines={1}>
            {facility.location}
          </Text>
        </View>
        
        {/* Hiển thị khoảng cách cách bạn ...km */}
        <View style={styles.distanceRow}>
          <MaterialIcons name="near-me" size={12} color={COLORS.primary} />
          <Text style={styles.distanceText}>Cách bạn {facility.distance}</Text>
        </View>
        
        <View style={styles.footerRow}>
          <Text style={styles.price}>
            {facility.price}
            <Text style={styles.priceUnit}>/h</Text>
          </Text>
          <Button
            variant="primary"
            size="sm"
            title="Đặt ngay"
            onPress={onBookPress}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 240, // Kích thước hợp lý để hiện ứng cuộn hé lộ card sau (peek effect)
    backgroundColor: COLORS.surface,
    borderRadius: 20, // Bo tròn hơn (was 16px)
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  imageContainer: {
    height: 135, // Tỷ lệ chiều cao/chiều rộng cân đối hơn cho card 240
    position: 'relative',
    backgroundColor: COLORS.surfaceVariant,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 6,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '700',
    fontSize: 11,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: TYPOGRAPHY.headlineMd.fontWeight,
    fontSize: 16,
    color: COLORS.onSurface,
    flex: 1,
    marginRight: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(217, 119, 6, 0.08)', // Container màu hổ phách nhạt
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  ratingText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontWeight: '700',
    fontSize: 12,
    color: '#D97706', // Sao vàng hổ phách nổi bật
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 12,
    color: COLORS.outline,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  distanceText: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  price: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: TYPOGRAPHY.headlineMd.fontWeight,
    fontSize: 16,
    color: COLORS.primary,
  },
  priceUnit: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 12,
    color: COLORS.outline,
  },
});
