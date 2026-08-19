import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { useMatchmakingList } from '../../../features/matchmaking/model/useMatchmaking';

export function MatchInvitations() {
  const router = useRouter();
  const { rooms } = useMatchmakingList();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Ghép kèo nhanh</Text>
          <View style={styles.liveDot} />
        </View>
        <TouchableOpacity
          onPress={() => router.push('/matchmaking' as any)}
          style={styles.seeMoreButton}
          activeOpacity={0.7}
        >
          <Text style={styles.seeMoreText}>Tất cả</Text>
          <MaterialIcons name="arrow-forward" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionSubtitle}>
        🔥 {rooms.length} trận đấu tìm đối thủ đang diễn ra!
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.invitationScroll}
        decelerationRate="fast"
      >
        {rooms.map((room) => {
          const isRanked = room.matchType === 'RANKED';
          return (
            <TouchableOpacity
              key={room.id}
              activeOpacity={0.88}
              onPress={() => router.push(`/matchmaking/${room.id}` as any)}
              style={styles.cardContainer}
            >
              <View style={styles.cardContent}>
                {/* Header Badge */}
                <View style={styles.cardHeader}>
                  <View style={[styles.typeBadge, isRanked ? styles.rankedBadge : styles.friendlyBadge]}>
                    <Text style={[styles.typeText, isRanked ? styles.rankedText : styles.friendlyText]}>
                      {isRanked ? '🏆 Xếp hạng' : '🤝 Giao hữu'}
                    </Text>
                  </View>
                  {room.balanceLabel && (
                    <Text style={styles.balanceText}>{room.balanceLabel}</Text>
                  )}
                </View>

                {/* Host Club & Elo */}
                <View style={styles.clubInfo}>
                  <Text style={styles.clubName} numberOfLines={1}>
                    {room.hostClub.name}
                  </Text>
                  <View style={styles.eloRow}>
                    <View style={styles.levelTag}>
                      <Text style={styles.levelText}>{room.hostClub.levelLabel}</Text>
                    </View>
                    <Text style={styles.eloText}>{room.hostClub.clubElo} Elo</Text>
                    <Text style={styles.crpText}>• {room.hostClub.crp} CRP</Text>
                  </View>
                </View>

                {/* Time & Venue */}
                <View style={styles.detailRow}>
                  <MaterialIcons name="location-on" size={13} color={COLORS.onSurfaceVariant} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {room.booking.facilityName}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialIcons name="schedule" size={13} color={COLORS.onSurfaceVariant} />
                  <Text style={styles.detailText}>
                    {room.booking.date} • {room.booking.startTime}
                  </Text>
                </View>

                {/* Fee Split */}
                <View style={styles.feeBox}>
                  <Text style={styles.feeLabel}>B trả ({room.guestSharePercent}%):</Text>
                  <Text style={styles.feeValue}>
                    ~{room.guestShareAmount.toLocaleString('vi-VN')}đ
                  </Text>
                </View>

                <View style={styles.joinBtn}>
                  <Text style={styles.joinBtnText}>Xem & Ghép kèo</Text>
                  <MaterialIcons name="arrow-forward" size={14} color={COLORS.white} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: SPACING.base,
    marginVertical: SPACING.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#10B981',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  seeMoreText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '700',
  },
  invitationScroll: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  cardContainer: {
    width: 215,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xl,
  },
  rankedBadge: {
    backgroundColor: '#FEF3C7',
  },
  friendlyBadge: {
    backgroundColor: '#E0F2FE',
  },
  typeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    fontWeight: '700',
  },
  rankedText: {
    color: '#92400E',
  },
  friendlyText: {
    color: '#075985',
  },
  balanceText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  clubInfo: {
    gap: 2,
  },
  clubName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  eloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  levelTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  levelText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
  },
  eloText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  crpText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  feeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  feeLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
  },
  feeValue: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    paddingVertical: 7,
  },
  joinBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
});
