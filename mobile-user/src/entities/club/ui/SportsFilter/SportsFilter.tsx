import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

export const SPORTS = [
  { id: 'all', name: 'Tất cả' },
  { id: 'football', name: 'Bóng đá', value: 'Bóng đá' },
  { id: 'basketball', name: 'Bóng rổ', value: 'Bóng rổ' },
  { id: 'badminton', name: 'Cầu lông', value: 'Cầu lông' },
  { id: 'pickleball', name: 'Pickleball', value: 'Pickleball' },
];

export interface SportsFilterProps {
  selectedSport: string;
  onSelectSport: (sportId: string) => void;
}

export function SportsFilter({ selectedSport, onSelectSport }: SportsFilterProps) {
  return (
    <View style={styles.chipsOuterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.chipsContainer}
      >
        {SPORTS.map((sport) => {
          const isActive = selectedSport === sport.id;
          return (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.sportChip,
                isActive && styles.sportChipActive
              ]}
              activeOpacity={0.8}
              onPress={() => onSelectSport(sport.id)}
            >
              <Text style={[
                styles.sportChipText,
                isActive && styles.sportChipTextActive
              ]}>
                {sport.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chipsOuterContainer: {
    marginHorizontal: -SPACING.marginMobile,
  },
  chipsContainer: {
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: SPACING.sm,
    gap: SPACING.base,
  },
  sportChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 3,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity08,
  },
  sportChipActive: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primaryContainer,
  },
  sportChipText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  sportChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
