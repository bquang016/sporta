import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PublicUserProfileResponse } from '../../../shared/api/users';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface UserProfileHeaderProps {
  profile: PublicUserProfileResponse;
  genderLabel: string;
  joinedYearLabel: string;
}

export const UserProfileHeader = React.memo(({
  profile,
  genderLabel,
  joinedYearLabel,
}: UserProfileHeaderProps) => {
  return (
    <View style={styles.container}>
      {/* ── Avatar & Main Info Row ── */}
      <View style={styles.profileMainRow}>
        {/* Avatar with Glow & Border */}
        <View style={styles.avatarWrapper}>
          <Image
            source={
              profile.avatarUrl && typeof profile.avatarUrl === 'string' && !profile.avatarUrl.startsWith('blob:')
                ? { uri: profile.avatarUrl }
                : require('../../../../assets/player/player_699x699.png')
            }
            style={styles.avatarImage}
          />
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
          </View>
        </View>

        {/* User Details */}
        <View style={styles.infoColumn}>
          <View style={styles.nameRow}>
            <Text style={styles.fullName} numberOfLines={1}>
              {profile.fullName || 'Người dùng Sporta'}
            </Text>
            <Ionicons name="checkmark-circle" size={17} color="#2563EB" style={{ marginLeft: 4 }} />
          </View>

          {/* Quick Badges Row (Gender & Role) */}
          <View style={styles.badgesRow}>
            {/* Gender Badge */}
            <View style={styles.genderBadge}>
              <Text style={styles.genderBadgeText}>{genderLabel}</Text>
            </View>

            {/* Member Since Year */}
            <View style={styles.yearBadge}>
              <Ionicons name="calendar-outline" size={12} color="#64748B" />
              <Text style={styles.yearBadgeText}>Gia nhập {joinedYearLabel}</Text>
            </View>
          </View>

          {/* Sports Level Badges */}
          {profile.sports && profile.sports.length > 0 && (
            <View style={styles.sportBadgesRow}>
              {profile.sports.map(sport => (
                <View key={sport.sportId} style={styles.sportLevelBadge}>
                   <Ionicons name="trophy-outline" size={12} color="#D97706" />
                   <Text style={styles.sportLevelBadgeText}>
                     {sport.sportName}: {sport.level || 'Chưa xác định'}
                   </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* ── Public Stats Grid (Lượt đặt sân & Điểm uy tín) ── */}
      {!profile.privateMode && (
        <View style={styles.statsGrid}>
          {/* Total Bookings Stat */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="football-outline" size={18} color="#2563EB" />
            </View>
            <View style={styles.statTextBox}>
              <Text style={styles.statValue}>
                {profile.totalBookings || 0}
              </Text>
              <Text style={styles.statLabel}>Lượt đặt sân</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          {/* Clubs Joined Count */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FDF4FF' }]}>
              <Ionicons name="people-outline" size={18} color="#A855F7" />
            </View>
            <View style={styles.statTextBox}>
              <Text style={[styles.statValue, { color: '#9333EA' }]}>
                {(profile.joinedClubs || []).length}
              </Text>
              <Text style={styles.statLabel}>CLB tham gia</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  profileMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: '#3B82F6',
    backgroundColor: '#F1F5F9',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  infoColumn: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  fullName: {
    ...TYPOGRAPHY.titleLg,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  genderBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  genderBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  yearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  yearBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextBox: {
    alignItems: 'flex-start',
  },
  statValue: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
  },
  statLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  sportBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  sportLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFCE8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#FEF08A',
    gap: 4,
  },
  sportLevelBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '700',
    color: '#A16207',
  },
});
