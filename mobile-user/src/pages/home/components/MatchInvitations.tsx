import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { useMatchmakingList } from '../../../features/matchmaking/model/useMatchmaking';

export function MatchInvitations() {
  const router = useRouter();
  const { rooms, loading } = useMatchmakingList();

  return (
    <View style={styles.section}>
      {/* ── Section Header ── */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBox}>
            <MaterialIcons name="groups" size={17} color={COLORS.primary} />
          </View>
          <View>
            <View style={styles.titleWithBadge}>
              <Text style={styles.sectionTitle}>Ghép kèo thể thao</Text>
              {rooms.length > 0 ? (
                <View style={styles.liveBadge}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.sectionSub}>
              {rooms.length > 0
                ? `🔥 ${rooms.length} trận đấu tìm đối thủ đang diễn ra!`
                : 'Sân chơi ghép cặp & kết nối thể thao'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/matchmaking' as any)}
          style={styles.seeAllButton}
          activeOpacity={0.75}
        >
          <Text style={styles.seeAllText}>Xem tất cả</Text>
          <MaterialIcons name="chevron-right" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Content Body ── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Đang tải danh sách kèo đấu...</Text>
        </View>
      ) : rooms.length === 0 ? (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIconCircle}>
            <MaterialIcons name="sports-soccer" size={26} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>Hiện tại chưa có kèo đấu nào</Text>
          <Text style={styles.emptySub}>
            Chưa có trận đấu nào đang tìm đối thủ. Hãy quay lại sau nhé!
          </Text>
          <TouchableOpacity
            style={styles.emptyActionBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/matchmaking/create' as any)}
          >
            <MaterialIcons name="add" size={16} color={COLORS.white} />
            <Text style={styles.emptyActionBtnText}>Tạo kèo ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollList}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: SPACING.xs + 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  livePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EF4444',
  },
  liveText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  sectionSub: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    marginTop: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  seeAllText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 11.5,
  },
  scrollList: {
    gap: SPACING.sm,
    paddingVertical: 4,
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
  loadingBox: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.onSurfaceVariant,
  },
  emptyBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    gap: 6,
    marginVertical: 4,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  emptySub: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 17,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 6,
  },
  emptyActionBtnText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
});