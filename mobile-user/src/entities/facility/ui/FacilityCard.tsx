import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
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
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 288,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg, // 16px radius for large cards
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
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
    fontSize: 18,
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
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontWeight: TYPOGRAPHY.labelSm.fontWeight,
    fontSize: 12,
    color: COLORS.primary,
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
