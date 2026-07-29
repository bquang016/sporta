import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { JoinedClubItem } from '../../../entities/user';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface UserClubsCardProps {
  clubs?: JoinedClubItem[];
  onClubPress?: (club: JoinedClubItem) => void;
}

export const UserClubsCard = React.memo(({ clubs, onClubPress }: UserClubsCardProps) => {
  if (!clubs || clubs.length === 0) return null;

  return (
    <View style={styles.card}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="people" size={20} color={COLORS.primary} />
          <Text style={styles.title}>Các câu lạc bộ đã tham gia</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{clubs.length}</Text>
          </View>
        </View>
      </View>

      {/* Clubs List */}
      <View style={styles.list}>
        {clubs.map((club, index) => (
          <TouchableOpacity
            key={club.id}
            style={[styles.clubItem, index < clubs.length - 1 && styles.itemBorder]}
            activeOpacity={0.7}
            onPress={() => onClubPress?.(club)}
          >
            {/* Club Logo */}
            <Image source={{ uri: club.logoUrl }} style={styles.clubLogo} />

            {/* Club Information */}
            <View style={styles.clubInfo}>
              <Text style={styles.clubName} numberOfLines={1}>
                {club.name}
              </Text>
              
              <View style={styles.metaRow}>
                <View style={styles.sportBadge}>
                  <Text style={styles.sportBadgeText}>{club.sportName}</Text>
                </View>
                <Text style={styles.roleText}>• {club.roleInClub}</Text>
              </View>

              <Text style={styles.memberCountText}>
                {club.memberCount} thành viên {club.joinedDate ? `• Tham gia ${club.joinedDate}` : ''}
              </Text>
            </View>

            {/* Chevron Action */}
            <View style={styles.actionCircle}>
              <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
            </View>
          </TouchableOpacity>
        ))}
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
  header: {
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  countBadge: {
    backgroundColor: COLORS.primaryOpacity08,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '800',
  },
  list: {
    gap: 4,
  },
  clubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  clubLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceDim,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  clubInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  clubName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sportBadge: {
    backgroundColor: COLORS.primaryOpacity10,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  sportBadgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 10,
    color: COLORS.primary,
  },
  roleText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  memberCountText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
  actionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
