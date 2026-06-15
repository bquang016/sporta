import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';

export interface Category {
  id: string;
  name: string;
  iconType: 'material' | 'community';
  iconName: string;
}

const CATEGORIES: Category[] = [
  { id: 'soccer', name: 'Bóng đá', iconType: 'material', iconName: 'sports-soccer' },
  { id: 'basketball', name: 'Bóng rổ', iconType: 'material', iconName: 'sports-basketball' },
  { id: 'badminton', name: 'Cầu lông', iconType: 'community', iconName: 'badminton' },
  { id: 'pickleball', name: 'Pickleball', iconType: 'material', iconName: 'sports-tennis' },
];

interface SportCategoriesProps {
  onCategorySelect?: (categoryId: string) => void;
}

export function SportCategories({ onCategorySelect }: SportCategoriesProps) {
  return (
    <View style={styles.grid}>
      {CATEGORIES.map((cat) => (
        <TouchableOpacity 
          key={cat.id} 
          style={styles.item}
          onPress={() => onCategorySelect?.(cat.id)}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            {cat.iconType === 'material' ? (
              <MaterialIcons name={cat.iconName as any} size={28} color={COLORS.primary} />
            ) : (
              <MaterialCommunityIcons name={cat.iconName as any} size={28} color={COLORS.primary} />
            )}
          </View>
          <Text style={styles.label}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  item: {
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(45, 106, 79, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
});
