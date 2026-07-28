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
      activeOpacity={0.88} 
      onPress={onPress}
    >
      <View style={styles.myClubsLeft}>
        <View style={styles.myClubsIconContainer}>
          <MaterialIcons name="shield" size={22} color={COLORS.primary} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.myClubsTitle}>Câu lạc bộ của tôi</Text>
            {joinedCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{joinedCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.myClubsSub}>Xem danh sách câu lạc bộ bạn đã tham gia</Text>
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
    borderRadius: BORDER_RADIUS.lg, // 16px radius per spec
    padding: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  myClubsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  myClubsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full, // Circular 9999px icon enclosure per spec
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  myClubsTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  countBadge: {
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.base,
    paddingVertical: 1,
  },
  countText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSecondaryContainer,
  },
  myClubsSub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
});
