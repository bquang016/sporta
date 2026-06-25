import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

export interface MyClubsRedirectProps {
  joinedCount: number;
  onPress: () => void;
}

export function MyClubsRedirect({ joinedCount, onPress }: MyClubsRedirectProps) {
  return (
    <TouchableOpacity 
      style={styles.myClubsCard} 
      activeOpacity={0.9} 
      onPress={onPress}
    >
      <View style={styles.myClubsLeft}>
        <View style={styles.myClubsIconContainer}>
          <MaterialIcons name="shield" size={24} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.myClubsTitle}>Câu lạc bộ của tôi</Text>
          <Text style={styles.myClubsSub}>Xem {joinedCount} câu lạc bộ bạn đã tham gia</Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={COLORS.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  myClubsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
    borderRadius: BORDER_RADIUS.lg, // 16px radius for large cards
    padding: SPACING.md,
    // Add subtle shadow for premium look
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  myClubsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  myClubsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myClubsTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
  },
  myClubsSub: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
});
