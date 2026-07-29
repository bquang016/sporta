import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PublicUserProfile } from '../../../entities/user';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface UserPhysicalCardProps {
  profile: PublicUserProfile;
}

export const UserPhysicalCard = React.memo(({ profile }: UserPhysicalCardProps) => {
  const formatJoinedDate = (isoString?: string) => {
    if (!isoString) return 'Tháng 1/2024';
    try {
      const date = new Date(isoString);
      return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch {
      return 'Tháng 1/2024';
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Chỉ số thể hình & Thông tin VĐV</Text>

      <View style={styles.grid}>
        {/* Height */}
        <View style={styles.statItem}>
          <Ionicons name="resize-outline" size={18} color={COLORS.primary} />
          <View style={styles.statTextGroup}>
            <Text style={styles.statLabel}>Chiều cao</Text>
            <Text style={styles.statValue}>{profile.height ? `${profile.height} cm` : '178 cm'}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.colDivider} />

        {/* Weight */}
        <View style={styles.statItem}>
          <Ionicons name="fitness-outline" size={18} color={COLORS.primary} />
          <View style={styles.statTextGroup}>
            <Text style={styles.statLabel}>Cân nặng</Text>
            <Text style={styles.statValue}>{profile.weight ? `${profile.weight} kg` : '72 kg'}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.colDivider} />

        {/* Member Since */}
        <View style={styles.statItem}>
          <Ionicons name="ribbon-outline" size={18} color={COLORS.primary} />
          <View style={styles.statTextGroup}>
            <Text style={styles.statLabel}>Tham gia</Text>
            <Text style={styles.statValue}>{formatJoinedDate(profile.createdAt)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.marginMobile,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  title: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statTextGroup: {
    justifyContent: 'center',
  },
  statLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
  statValue: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 2,
  },
  colDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.surfaceContainerHigh,
    marginHorizontal: 4,
  },
});
