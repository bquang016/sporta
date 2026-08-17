import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useMatchDetail } from '../../../../features/matchmaking/model/useMatchmaking';
import { MockMatchmakingRepository } from '../../../../features/matchmaking/model/mockMatchmakingRepository';
import { CrpExplanationSheet } from '../../../../features/matchmaking/ui/CrpExplanationSheet';

export function MatchResultScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { room, loading } = useMatchDetail(id as string);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  if (loading || !room) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang nạp kết quả trận đấu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const result = room.result || {
    matchId: room.id,
    outcome: 'WIN_A',
    finalScoreText: '3 - 2',
    hostCrpBefore: room.hostClub.crp,
    hostCrpDelta: room.matchType === 'RANKED' ? 14.2 : 0,
    hostCrpAfter: room.hostClub.crp + (room.matchType === 'RANKED' ? 14.2 : 0),
    guestCrpBefore: 142,
    guestCrpDelta: room.matchType === 'RANKED' ? -6.5 : 0,
    guestCrpAfter: 135.5,
    explanation: [
      `Elo tương đương (${room.hostClub.clubElo} vs ${room.guestClub?.clubElo || 1760})`,
      'Thắng sát nút nhận +14.2 CRP',
      'Đã áp dụng cơ chế Positive-sum & Anti-farming',
    ],
    confirmedAt: 'Vừa xong',
  };

  const isRanked = room.matchType === 'RANKED';
  const preview = MockMatchmakingRepository.getRankingPreview(room);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
          <Ionicons name="close" size={20} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết Quả Trận Đấu</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Trophy Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="trophy" size={42} color="#D97706" />
          </View>

          <Text style={styles.outcomeTitle}>KẾT QUẢ ĐÃ ĐƯỢC XÁC NHẬN</Text>
          <View style={[styles.typeBadge, isRanked ? styles.rankedBadge : styles.friendlyBadge]}>
            <Text style={[styles.typeText, isRanked ? styles.rankedText : styles.friendlyText]}>
              {isRanked ? '🏆 Trận Xếp hạng (Tích lũy CRP)' : '🤝 Trận Giao hữu'}
            </Text>
          </View>

          {/* Big Final Score */}
          <View style={styles.scoreBox}>
            <Text style={styles.teamHostName}>{room.hostClub.name}</Text>
            <Text style={styles.finalScoreNum}>{result.finalScoreText}</Text>
            <Text style={styles.teamGuestName}>{room.guestClub?.name || 'Đội bạn'}</Text>
          </View>
        </View>

        {/* CRP Reward Section (For Ranked Match) */}
        {isRanked ? (
          <View style={styles.crpCard}>
            <Text style={styles.crpCardTitle}>Cập Nhật Thành Tích CRP CLB</Text>

            <View style={styles.crpMainRow}>
              <View style={styles.crpCol}>
                <Text style={styles.crpClubLabel}>{room.hostClub.name}</Text>
                <Text style={styles.crpDeltaPlus}>+{result.hostCrpDelta} CRP</Text>
                <Text style={styles.crpBeforeAfter}>
                  {result.hostCrpBefore} → <Text style={{ fontWeight: '900' }}>{result.hostCrpAfter}</Text>
                </Text>
              </View>

              <View style={styles.crpDivider} />

              <View style={styles.crpCol}>
                <Text style={styles.crpClubLabel}>{room.guestClub?.name || 'Đội bạn'}</Text>
                <Text style={styles.crpDeltaMinus}>{result.guestCrpDelta} CRP</Text>
                <Text style={styles.crpBeforeAfter}>
                  {result.guestCrpBefore} → <Text style={{ fontWeight: '900' }}>{result.guestCrpAfter}</Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowExplanation(true)}
              style={styles.whyBtn}
            >
              <Ionicons name="help-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.whyBtnText}>Vì sao nhận được số điểm này?</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.friendlyNoteCard}>
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.friendlyNoteText}>
              Trận Giao hữu ghi nhận tỷ số giao lưu, không làm thay đổi điểm CRP xếp hạng của hai CLB.
            </Text>
          </View>
        )}

        {/* Match Details Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông Tin Sân & Chi Phí</Text>

          <View style={styles.infoLine}>
            <Ionicons name="location-outline" size={16} color={COLORS.onSurfaceVariant} />
            <Text style={styles.infoText}>{room.booking.facilityName} ({room.booking.courtName})</Text>
          </View>

          <View style={styles.infoLine}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.onSurfaceVariant} />
            <Text style={styles.infoText}>{room.booking.date} • {room.booking.startTime} - {room.booking.endTime}</Text>
          </View>

          <View style={styles.infoLine}>
            <Ionicons name="cash-outline" size={16} color={COLORS.onSurfaceVariant} />
            <Text style={styles.infoText}>
              Tỉ lệ chia: Chủ sân {room.hostSharePercent}% — Đối thủ {room.guestSharePercent}% (~{room.guestShareAmount.toLocaleString('vi-VN')}đ)
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/matchmaking' as any)}
          style={styles.backListBtn}
        >
          <Text style={styles.backListBtnText}>Quay về Danh sách Matchmaking</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* CRP Explanation Sheet Modal */}
      <CrpExplanationSheet
        visible={showExplanation}
        onClose={() => setShowExplanation(false)}
        preview={preview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 17,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  scrollContent: {
    padding: SPACING.marginMobile,
    gap: SPACING.md,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.08)',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FCD34D',
    marginBottom: 4,
  },
  outcomeTitle: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    letterSpacing: 1,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  rankedBadge: {
    backgroundColor: '#FEF3C7',
  },
  friendlyBadge: {
    backgroundColor: '#E0F2FE',
  },
  typeText: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '800',
    fontSize: 11,
  },
  rankedText: {
    color: '#92400E',
  },
  friendlyText: {
    color: '#075985',
  },
  scoreBox: {
    alignItems: 'center',
    marginVertical: 8,
    gap: 4,
  },
  teamHostName: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  finalScoreNum: {
    ...TYPOGRAPHY.headlineXl,
    fontWeight: '900',
    color: COLORS.primary,
    fontSize: 48,
    letterSpacing: 2,
  },
  teamGuestName: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  crpCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  crpCardTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    color: '#92400E',
  },
  crpMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 4,
  },
  crpCol: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  crpClubLabel: {
    ...TYPOGRAPHY.labelMd,
    color: '#78350F',
    fontWeight: '800',
    fontSize: 12,
  },
  crpDeltaPlus: {
    ...TYPOGRAPHY.headlineMd,
    fontWeight: '900',
    color: '#15803D',
    fontSize: 24,
  },
  crpDeltaMinus: {
    ...TYPOGRAPHY.headlineMd,
    fontWeight: '900',
    color: '#B91C1C',
    fontSize: 24,
  },
  crpBeforeAfter: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: '#78350F',
  },
  crpDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#FCD34D',
  },
  whyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  whyBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  friendlyNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
  },
  friendlyNoteText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.primary,
    flex: 1,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.08)',
    gap: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  backListBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  backListBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 14,
  },
});
