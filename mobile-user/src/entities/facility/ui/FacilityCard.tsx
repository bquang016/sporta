import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { Badge, Button } from '../../../shared/ui';

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
}

interface FacilityCardProps {
  facility: Facility;
  onPress?: () => void;
  onBookPress?: () => void;
}

export function FacilityCard({ facility, onPress, onBookPress }: FacilityCardProps) {
  const isWarning = facility.statusType === 'warning';
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: facility.imageUrl }} style={styles.image} resizeMode="cover" />
        <Badge 
          text={facility.status}
          variant={isWarning ? 'warning' : 'success_flat'}
          style={styles.badge}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {facility.name}
          </Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={14} color={COLORS.primary} />
            <Text style={styles.ratingText}>{facility.rating}</Text>
          </View>
        </View>
        
        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={16} color={COLORS.outline} />
          <Text style={styles.locationText} numberOfLines={1}>
            {facility.location}, {facility.distance}
          </Text>
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
            style={styles.bookButton}
            textStyle={styles.bookButtonText}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 288, // 72 * 4 in tailwind
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(191, 201, 195, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
    backgroundColor: COLORS.surfaceVariant,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.onSurface,
    flex: 1,
    marginRight: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.outline,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.outline,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  bookButtonText: {
    color: COLORS.onPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});
