import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

export const SPORTS = [
  { id: 'all', name: 'Tất cả', icon: 'grid-view' },
  { id: 'football', name: 'Bóng đá', value: 'Bóng đá', icon: 'sports-soccer' },
  { id: 'badminton', name: 'Cầu lông', value: 'Cầu lông', icon: 'sports-cricket' },
  { id: 'pickleball', name: 'Pickleball', value: 'Pickleball', icon: 'sports-tennis' },
  { id: 'basketball', name: 'Bóng rổ', value: 'Bóng rổ', icon: 'sports-basketball' },
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
              <MaterialIcons 
                name={sport.icon as any} 
                size={16} 
                color={isActive ? COLORS.white : COLORS.primary} 
              />
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
    paddingBottom: SPACING.sm + 2,
    gap: SPACING.xs + 2,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 3,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
    gap: 6,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sportChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sportChipText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  sportChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
