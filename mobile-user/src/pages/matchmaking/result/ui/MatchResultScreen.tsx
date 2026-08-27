import React, { useState, useCallback } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useMatchDetail } from '../../../../features/matchmaking/model/useMatchmaking';
import { MockMatchmakingRepository } from '../../../../features/matchmaking/model/mockMatchmakingRepository';
import { CrpExplanationSheet } from '../../../../features/matchmaking/ui/CrpExplanationSheet';

export function MatchResultScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { room, loading, refetch } = useMatchDetail(id as string);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        refetch();
      }
    }, [id, refetch])
  );

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
    finalScoreText: room.scoreSubmission ? `${room.scoreSubmission.hostScore} - ${room.scoreSubmission.guestScore}` : '3 - 2',
    hostCrpBefore: room.hostClub.crp,
    hostCrpDelta: room.matchType === 'RANKED' ? 14 : 0,
    hostCrpAfter: room.hostClub.crp + (room.matchType === 'RANKED' ? 14 : 0),
    guestCrpBefore: room.guestClub?.crp || 140,
    guestCrpDelta: room.matchType === 'RANKED' ? -7 : 0,
    guestCrpAfter: (room.guestClub?.crp || 140) + (room.matchType === 'RANKED' ? -7 : 0),
    explanation: [
      `Elo tương đương (${room.hostClub.clubElo} vs ${room.guestClub?.clubElo || 1200})`,
      'Kết quả đã được xác nhận chính thức.',
    ],
    confirmedAt: 'Vừa xong',
  };

  const isRanked = room.matchType === 'RANKED';
  const preview = MockMatchmakingRepository.getRankingPreview(room);

  const formatCrpDelta = (delta: number) => {
    if (delta > 0) return `+${delta}`;
    if (delta === 0) return `0`;
    return `${delta}`;
  };

  const getDeltaStyle = (delta: number) => {
    if (delta > 0) return styles.crpDeltaPlus;
    if (delta < 0) return styles.crpDeltaMinus;
    return styles.crpDeltaZero;
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace((room ? `/matchmaking/${room.id}` : '/matchmaking') as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn}>
          <Ionicons name="close" size={20} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết Quả Trận Đấu</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.headerIconBtn}>
          <Ionicons name="refresh-outline" size={18} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.responsiveContainer}>
          {/* Top Trophy Hero Banner */}
          <View style={styles.heroCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="trophy" size={40} color="#D97706" />
            </View>

            <Text style={styles.outcomeTitle}>KẾT QUẢ ĐÃ ĐƯỢC XÁC NHẬN</Text>

            {/* Big Final Score Display */}
            <View style={styles.scoreBoardCard}>
              <View style={styles.teamScoreCol}>
                <Text style={styles.teamHostName} numberOfLines={1}>
                  {room.hostClub.name}
                </Text>
                <Text style={styles.winnerBadgeText}>Chủ Room (Bên A)</Text>
              </View>

              <View style={styles.finalScoreBadge}>
                <Text style={styles.finalScoreNum}>{result.finalScoreText}</Text>
              </View>

              <View style={styles.teamScoreCol}>
                <Text style={styles.teamGuestName} numberOfLines={1}>
                  {room.guestClub?.name || 'Đội bạn'}
                </Text>
                <Text style={styles.guestBadgeText}>Đối Thủ (Bên B)</Text>
              </View>
            </View>
          </View>

          {/* CRP Reward Section (For Ranked Match) */}
          {isRanked ? (
            <View style={styles.crpCard}>
              <Text style={styles.crpCardTitle}>Cập Nhật Thành Tích CRP CLB</Text>

              <View style={styles.crpMainRow}>
                <View style={styles.crpCol}>
                  <Text style={styles.crpClubLabel} numberOfLines={1}>{room.hostClub.name}</Text>
                  <Text style={getDeltaStyle(result.hostCrpDelta)}>
                    {formatCrpDelta(result.hostCrpDelta)} CRP
                  </Text>
                  <Text style={styles.crpBeforeAfter}>
                    {result.hostCrpBefore} → <Text style={{ fontWeight: '900' }}>{result.hostCrpAfter}</Text>
                  </Text>
                </View>

                <View style={styles.crpDivider} />

                <View style={styles.crpCol}>
                  <Text style={styles.crpClubLabel} numberOfLines={1}>{room.guestClub?.name || 'Đội bạn'}</Text>
                  <Text style={getDeltaStyle(result.guestCrpDelta)}>
                    {formatCrpDelta(result.guestCrpDelta)} CRP
                  </Text>
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

            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sân thi đấu:</Text>
                <Text style={styles.infoValue}>{room.booking.facilityName} ({room.booking.courtName})</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Thời gian:</Text>
                <Text style={styles.infoValue}>{room.booking.date} • {room.booking.startTime} - {room.booking.endTime}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Loại trận:</Text>
                <Text style={styles.infoValue}>{isRanked ? 'Trận Xếp hạng' : 'Trận Giao hữu'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tiền sân:</Text>
                <Text style={styles.infoValue}>{room.booking.totalPrice.toLocaleString('vi-VN')}đ</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CRP Explanation Sheet Modal */}
      {preview && (
        <CrpExplanationSheet
          visible={showExplanation}
          preview={preview}
          onClose={() => setShowExplanation(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
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
    paddingBottom: 40,
  },
  responsiveContainer: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    gap: SPACING.md,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outcomeTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.8,
    fontSize: 15,
  },
  scoreBoardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    width: '100%',
    marginTop: 4,
  },
  teamScoreCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  teamHostName: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13.5,
  },
  winnerBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.secondary,
    fontWeight: '800',
    fontSize: 10.5,
  },
  teamGuestName: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13.5,
  },
  guestBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
    fontSize: 10.5,
  },
  finalScoreBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: 8,
  },
  finalScoreNum: {
    ...TYPOGRAPHY.headlineXl,
    fontWeight: '900',
    color: COLORS.onSecondary,
    fontSize: 22,
  },
  crpCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.08)',
    gap: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  crpCardTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    color: COLORS.onSurface,
    fontSize: 15.5,
  },
  crpMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  crpCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  crpClubLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontWeight: '800',
    fontSize: 13,
  },
  crpDeltaPlus: {
    ...TYPOGRAPHY.headlineXl,
    fontWeight: '900',
    color: '#15803D',
    fontSize: 24,
  },
  crpDeltaMinus: {
    ...TYPOGRAPHY.headlineXl,
    fontWeight: '900',
    color: '#B91C1C',
    fontSize: 24,
  },
  crpDeltaZero: {
    ...TYPOGRAPHY.headlineXl,
    fontWeight: '900',
    color: '#64748B',
    fontSize: 24,
  },
  crpBeforeAfter: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
  },
  crpDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.outlineVariant,
    marginHorizontal: 8,
  },
  whyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  whyBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 12.5,
  },
  friendlyNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.12)',
  },
  friendlyNoteText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12.5,
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
    gap: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 15.5,
  },
  infoGrid: {
    gap: 8,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12.5,
  },
  infoValue: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontWeight: '800',
    fontSize: 12.5,
  },
});
