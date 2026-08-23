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
          <MaterialIcons name="groups" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.myClubsTitle}>Câu lạc bộ của tôi</Text>
            {joinedCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{joinedCount} đã tham gia</Text>
              </View>
            )}
          </View>
          <Text style={styles.myClubsSub}>Quản lý câu lạc bộ và lịch sinh hoạt của bạn</Text>
        </View>
      </View>
      <View style={styles.arrowCircle}>
        <MaterialIcons name="chevron-right" size={20} color={COLORS.primary} />
      </View>
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
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
    borderRadius: BORDER_RADIUS.full,
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
    flexWrap: 'wrap',
  },
  myClubsTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  countBadge: {
    backgroundColor: COLORS.primaryOpacity12,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  countText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  myClubsSub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity08,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
