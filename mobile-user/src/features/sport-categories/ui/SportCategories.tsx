import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

export interface Category {
  id: string;
  name: string;
  iconType: 'material' | 'community';
  iconName: string;
  color: string;
}

const CATEGORIES: Category[] = [
  { id: 'soccer', name: 'Bóng đá', iconType: 'material', iconName: 'sports-soccer', color: COLORS.primary },
  { id: 'basketball', name: 'Bóng rổ', iconType: 'material', iconName: 'sports-basketball', color: '#E65100' },
  { id: 'badminton', name: 'Cầu lông', iconType: 'community', iconName: 'badminton', color: '#1565C0' },
  { id: 'pickleball', name: 'Pickleball', iconType: 'material', iconName: 'sports-tennis', color: COLORS.sportTeal },
];

interface SportCategoriesProps {
  onCategorySelect?: (categoryId: string) => void;
}

export function SportCategories({ onCategorySelect }: SportCategoriesProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={styles.chip}
          onPress={() => onCategorySelect?.(cat.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.chipIcon, { backgroundColor: `${cat.color}15` }]}>
            {cat.iconType === 'material' ? (
              <MaterialIcons name={cat.iconName as any} size={18} color={cat.color} />
            ) : (
              <MaterialCommunityIcons name={cat.iconName as any} size={18} color={cat.color} />
            )}
          </View>
          <Text style={styles.chipLabel}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    gap: SPACING.base,
    paddingVertical: SPACING.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  chipIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
  },
});
