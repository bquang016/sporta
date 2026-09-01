import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
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

  const [hostImgError, setHostImgError] = useState<boolean>(false);
  const [guestImgError, setGuestImgError] = useState<boolean>(false);

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

  const host = room.hostClub;
  const guest = room.guestClub;
  const booking = room.booking;

  const hostAvatar = host.avatarUrl || host.logoUrl || (host as any).avatarImage;
  const guestAvatar = guest?.avatarUrl || guest?.logoUrl || (guest as any)?.avatarImage;

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
      'Kết quả đã được xác nhận chính thức bởi hai câu lạc bộ.',
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

  const outcome = result.outcome;
  const isDraw = outcome === 'DRAW';
  const winnerName = outcome === 'WIN_A' ? host.name : outcome === 'WIN_B' ? (guest?.name || 'Đội khách') : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn} activeOpacity={0.7}>
          <Ionicons name="close" size={20} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết Quả Trận Đấu</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.headerIconBtn} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={18} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveContainer}>
          {/* Top Trophy Hero Banner */}
          <View style={[styles.heroCard, isDraw ? styles.heroCardDraw : styles.heroCardWin]}>
            <View style={styles.trophyIconCircle}>
              <Ionicons name={isDraw ? 'swap-horizontal' : 'trophy'} size={32} color={isDraw ? '#B45309' : '#D97706'} />
            </View>

            <Text style={styles.outcomeTitle}>
              {isDraw ? 'BẤT PHÂN THẮNG BẠI' : `CHIẾN THẮNG: ${winnerName}`}
            </Text>
            <Text style={styles.outcomeSub}>
              {isRanked ? 'Trận đấu xếp hạng • Điểm CRP đã được cập nhật' : 'Trận đấu giao hữu • Kết quả đã được xác nhận'}
            </Text>

            {/* Big Final Scoreboard Display */}
            <View style={styles.scoreBoardCard}>
              {/* Host Club Col */}
              <View style={styles.teamScoreCol}>
                <View style={styles.avatarWrap}>
                  {hostAvatar && !hostImgError ? (
                    <Image
                      source={{ uri: hostAvatar }}
                      style={styles.clubAvatar}
                      resizeMode="cover"
                      onError={() => setHostImgError(true)}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarFallbackText}>{(host.name || 'A').charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  {outcome === 'WIN_A' && (
                    <View style={styles.winnerBadgePill}>
                      <Ionicons name="trophy" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <Text style={styles.teamHostName} numberOfLines={1}>
                  {host.name}
                </Text>
                <View style={styles.teamMetaPill}>
                  <Text style={styles.teamEloText}>{host.clubElo} Elo</Text>
                  <Text style={styles.teamLevelText}>• {host.levelLabel}</Text>
                </View>
              </View>

              {/* Digital Score Box in Center */}
              <View style={styles.finalScoreBadge}>
                <Text style={styles.finalScoreNum}>{result.finalScoreText}</Text>
                <View style={styles.finalBadgeTag}>
                  <Text style={styles.finalBadgeTagText}>CHUNG CUỘC</Text>
                </View>
              </View>

              {/* Guest Club Col */}
              <View style={styles.teamScoreCol}>
                <View style={styles.avatarWrap}>
                  {guestAvatar && !guestImgError ? (
                    <Image
                      source={{ uri: guestAvatar }}
                      style={styles.clubAvatar}
                      resizeMode="cover"
                      onError={() => setGuestImgError(true)}
                    />
                  ) : (
                    <View style={[styles.avatarFallback, { backgroundColor: '#0284C7' }]}>
                      <Text style={styles.avatarFallbackText}>{(guest?.name || 'B').charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  {outcome === 'WIN_B' && (
                    <View style={styles.winnerBadgePill}>
                      <Ionicons name="trophy" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <Text style={styles.teamGuestName} numberOfLines={1}>
                  {guest?.name || 'Đội bạn'}
                </Text>
                <View style={styles.teamMetaPill}>
                  <Text style={styles.teamEloText}>{guest?.clubElo || 1200} Elo</Text>
                  <Text style={styles.teamLevelText}>• {guest?.levelLabel || 'Trung bình'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* CRP Reward Section (For Ranked Match) */}
          {isRanked ? (
            <View style={styles.crpCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="ribbon" size={16} color="#D97706" />
                </View>
                <Text style={styles.crpCardTitle}>Biến Động Điểm CRP CLB</Text>
              </View>

              <View style={styles.crpMainRow}>
                <View style={styles.crpCol}>
                  <Text style={styles.crpClubLabel} numberOfLines={1}>{room.hostClub.name}</Text>
                  <Text style={getDeltaStyle(result.hostCrpDelta)}>
                    {formatCrpDelta(result.hostCrpDelta)} CRP
                  </Text>
                  <Text style={styles.crpBeforeAfter}>
                    {result.hostCrpBefore} → <Text style={{ fontWeight: '900', color: COLORS.onSurface }}>{result.hostCrpAfter}</Text>
                  </Text>
                </View>

                <View style={styles.crpDivider} />

                <View style={styles.crpCol}>
                  <Text style={styles.crpClubLabel} numberOfLines={1}>{room.guestClub?.name || 'Đội bạn'}</Text>
                  <Text style={getDeltaStyle(result.guestCrpDelta)}>
                    {formatCrpDelta(result.guestCrpDelta)} CRP
                  </Text>
                  <Text style={styles.crpBeforeAfter}>
                    {result.guestCrpBefore} → <Text style={{ fontWeight: '900', color: COLORS.onSurface }}>{result.guestCrpAfter}</Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowExplanation(true)}
                style={styles.whyBtn}
              >
                <Ionicons name="help-circle-outline" size={16} color={COLORS.primary} />
                <Text style={styles.whyBtnText}>Giải thích cách tính điểm này</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.friendlyNoteCard}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.friendlyNoteText}>
                Trận Giao hữu ghi nhận tỷ số giao lưu thể thao, không ảnh hưởng tới điểm CRP xếp hạng của hai CLB.
              </Text>
            </View>
          )}

          {/* Match Details Summary */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconCircle}>
                <Ionicons name="information-circle" size={16} color="#0284C7" />
              </View>
              <Text style={styles.sectionTitle}>Thông Tin Trận Đấu</Text>
            </View>

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
                <Text style={styles.infoValue}>{isRanked ? 'Trận Xếp hạng (CRP)' : 'Trận Giao hữu'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tiền sân:</Text>
                <Text style={styles.infoValue}>{room.booking.totalPrice.toLocaleString('vi-VN')}đ</Text>
              </View>
            </View>
          </View>

          {/* Bottom Action CTA */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.replace('/matchmaking' as any)}
            style={styles.backHomeBtn}
          >
            <Ionicons name="planet" size={18} color="#FFFFFF" />
            <Text style={styles.backHomeBtnText}>Quay Về Sàn Ghép Kèo</Text>
          </TouchableOpacity>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 16.5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#64748B',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  responsiveContainer: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    gap: SPACING.md,
  },
  heroCard: {
    padding: 20,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  heroCardWin: {
    backgroundColor: '#064E3B',
    shadowColor: '#064E3B',
  },
  heroCardDraw: {
    backgroundColor: '#78350F',
    shadowColor: '#78350F',
  },
  trophyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outcomeTitle: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '900',
    color: '#FDE68A',
    letterSpacing: 0.8,
    fontSize: 14,
    textAlign: 'center',
  },
  outcomeSub: {
    ...TYPOGRAPHY.bodySm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: -6,
  },
  scoreBoardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 12,
    width: '100%',
    marginTop: 4,
  },
  teamScoreCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  clubAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#E2E8F0',
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarFallbackText: {
    ...TYPOGRAPHY.titleMd,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  winnerBadgePill: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#F59E0B',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  teamHostName: {
    ...TYPOGRAPHY.titleSm,
    fontWeight: '800',
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 100,
  },
  teamGuestName: {
    ...TYPOGRAPHY.titleSm,
    fontWeight: '800',
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 100,
  },
  teamMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  teamEloText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FDE68A',
  },
  teamLevelText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  finalScoreBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginHorizontal: 4,
  },
  finalScoreNum: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  finalBadgeTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  finalBadgeTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FDE68A',
    letterSpacing: 0.5,
  },
  crpCard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crpCardTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 15.5,
  },
  crpMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
  },
  crpCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  crpClubLabel: {
    ...TYPOGRAPHY.titleSm,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 13,
  },
  crpDeltaPlus: {
    fontSize: 20,
    fontWeight: '900',
    color: '#15803D',
  },
  crpDeltaMinus: {
    fontSize: 20,
    fontWeight: '900',
    color: '#B91C1C',
  },
  crpDeltaZero: {
    fontSize: 20,
    fontWeight: '900',
    color: '#64748B',
  },
  crpBeforeAfter: {
    ...TYPOGRAPHY.bodySm,
    color: '#64748B',
    fontSize: 11.5,
  },
  crpDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#CBD5E1',
  },
  whyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
  },
  whyBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  friendlyNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E0F2FE',
    padding: 14,
    borderRadius: BORDER_RADIUS.xl,
  },
  friendlyNoteText: {
    ...TYPOGRAPHY.bodySm,
    color: '#0369A1',
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
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
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: '#64748B',
    fontSize: 12.5,
  },
  infoValue: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    fontWeight: '700',
    fontSize: 12.5,
    maxWidth: '65%',
    textAlign: 'right',
  },
  backHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  backHomeBtnText: {
    ...TYPOGRAPHY.titleSm,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14.5,
  },
});
