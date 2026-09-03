import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import {
  LeaderboardItem,
  SeasonRewardsInfo,
  getLeaderboardApi,
  getSeasonRewardsApi,
} from '../../../shared/api/leaderboard';
import { PodiumTopThree } from './components/PodiumTopThree';
import { LeaderboardItemCard } from './components/LeaderboardItemCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SPORTS = [
  { id: 0, name: 'Tất cả môn', icon: 'trophy-outline' },
  { id: 1, name: 'Bóng đá', icon: 'football-outline' },
  { id: 2, name: 'Cầu lông', icon: 'tennisball-outline' },
  { id: 3, name: 'Pickleball', icon: 'baseball-outline' },
  { id: 4, name: 'Bóng rổ', icon: 'basketball-outline' },
];

export function LeaderboardScreen() {
  const router = useRouter();

  const [selectedSportId, setSelectedSportId] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [rewardsInfo, setRewardsInfo] = useState<SeasonRewardsInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      const sportParam = selectedSportId > 0 ? selectedSportId : undefined;
      const [listRes, rewardsRes] = await Promise.all([
        getLeaderboardApi(sportParam),
        getSeasonRewardsApi().catch(() => null),
      ]);
      setLeaderboard(listRes || []);
      if (rewardsRes) {
        setRewardsInfo(rewardsRes);
      }
    } catch (error) {
      console.error('Lỗi lấy bảng xếp hạng:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSportId]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const topThree = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const restList = useMemo(() => leaderboard.slice(3), [leaderboard]);

  const userClub = useMemo(() => {
    return leaderboard.find((item) => item.isUserClub);
  }, [leaderboard]);

  const diffToTop3 = useMemo(() => {
    if (!userClub || userClub.rank <= 3 || leaderboard.length < 3) return null;
    const thirdCrp = leaderboard[2]?.crp || 0;
    return Math.max(1, thirdCrp - userClub.crp + 1);
  }, [userClub, leaderboard]);

  const handleClubPress = (club: LeaderboardItem) => {
    if (club.isUserClub) {
      router.push(`/club-detail-joined/${club.clubId}` as any);
    } else {
      router.push(`/club-detail-explore/${club.clubId}` as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* 1. Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/clubs'))}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back-ios-new" size={18} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Bảng Xếp Hạng CLB</Text>
          <Text style={styles.headerSubtitle}>
            {rewardsInfo?.seasonName || 'Mùa 1 - 2026 • Tranh Bá Thể Thao'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.rewardsHeaderBtn}
          onPress={() => router.push('/club-season-rewards' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="trophy" size={16} color="#D97706" />
          <Text style={styles.rewardsHeaderBtnText}>Phần Thưởng</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Main Scroll Content */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Season Prize Highlight Banner */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => router.push('/club-season-rewards' as any)}
          style={styles.bannerContainer}
        >
          <LinearGradient
            colors={['#004D40', '#065F46', '#047857']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerLeft}>
              <View style={styles.seasonTag}>
                <Ionicons name="flame" size={12} color="#FDE68A" />
                <Text style={styles.seasonTagText}>GIẢI ĐẤU MÙA 1 - 2026</Text>
              </View>
              <Text style={styles.bannerPrizeText}>
                Quỹ Thưởng: {rewardsInfo?.totalPrizePool || '38.500.000 VNĐ'}
              </Text>
              <Text style={styles.bannerCtaText}>
                Xem cơ chế cúp, vé sân & tài trợ ➜
              </Text>
            </View>

            <View style={styles.bannerRight}>
              <View style={styles.countdownBadge}>
                <Ionicons name="time-outline" size={13} color="#FDE68A" />
                <Text style={styles.countdownBadgeText}>
                  Còn {rewardsInfo?.daysRemaining ?? 18} ngày
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Sport Filter Chips Strip */}
        <View style={styles.filterStripWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {SPORTS.map((sport) => {
              const isSelected = selectedSportId === sport.id;
              return (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.sportChip,
                    isSelected && styles.sportChipActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedSportId(sport.id)}
                >
                  <Ionicons
                    name={sport.icon as any}
                    size={15}
                    color={isSelected ? '#FFFFFF' : '#475569'}
                  />
                  <Text
                    style={[
                      styles.sportChipText,
                      isSelected && styles.sportChipTextActive,
                    ]}
                  >
                    {sport.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Loading Spinner */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải bảng xếp hạng câu lạc bộ...</Text>
          </View>
        ) : leaderboard.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={56} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Chưa có dữ liệu xếp hạng</Text>
            <Text style={styles.emptySubtitle}>
              Các câu lạc bộ thuộc bộ môn này chưa có trận đấu tính điểm CRP. Hãy thi đấu ghép kèo để ghi danh trên bảng vàng!
            </Text>
          </View>
        ) : (
          <>
            {/* Top 3 Podium Component */}
            {topThree.length > 0 && (
              <PodiumTopThree
                topClubs={topThree}
                onClubPress={handleClubPress}
              />
            )}

            {/* Rest of the Leaderboard (Rank 4 -> N) */}
            {restList.length > 0 && (
              <View style={styles.restListSection}>
                <View style={styles.restListHeaderRow}>
                  <Text style={styles.restListTitle}>
                    Bảng Vàng Danh Dự
                  </Text>
                  <Text style={styles.restListCount}>
                    {leaderboard.length} Câu lạc bộ
                  </Text>
                </View>

                {restList.map((item) => (
                  <LeaderboardItemCard
                    key={item.clubId}
                    item={item}
                    onPress={handleClubPress}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* 3. Floating Sticky User Club Bar */}
      {userClub && (
        <View style={styles.stickyUserBarWrapper}>
          <TouchableOpacity
            style={styles.stickyUserBar}
            activeOpacity={0.88}
            onPress={() => handleClubPress(userClub)}
          >
            <View style={styles.stickyUserLeft}>
              <View style={styles.stickyUserRankPill}>
                <Text style={styles.stickyUserRankText}>#{userClub.rank}</Text>
              </View>
              <View style={styles.stickyUserTextWrap}>
                <Text style={styles.stickyUserClubName} numberOfLines={1}>
                  {userClub.clubName} (CLB của bạn)
                </Text>
                <Text style={styles.stickyUserSubText}>
                  {userClub.crp} CRP {diffToTop3 ? `• Cách Top 3: ${diffToTop3} CRP` : '• Đang trong Top 3!'}
                </Text>
              </View>
            </View>

            <View style={styles.stickyUserAction}>
              <Text style={styles.stickyUserActionText}>Chi tiết</Text>
              <MaterialIcons name="chevron-right" size={16} color="#059669" />
            </View>
          </TouchableOpacity>
        </View>
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
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  rewardsHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rewardsHeaderBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  bannerContainer: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#004D40',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
  },
  bannerLeft: {
    flex: 1,
  },
  seasonTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  seasonTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A7F3D0',
    letterSpacing: 0.6,
  },
  bannerPrizeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerCtaText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FDE68A',
    marginTop: 2,
  },
  bannerRight: {
    marginLeft: 12,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.4)',
  },
  countdownBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FDE68A',
  },
  filterStripWrap: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  filterScroll: {
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sportChipActive: {
    backgroundColor: '#004D40',
    borderColor: '#004D40',
  },
  sportChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },
  sportChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: SPACING.xl,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  restListSection: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
  },
  restListHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingHorizontal: 2,
  },
  restListTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  restListCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  stickyUserBarWrapper: {
    position: 'absolute',
    bottom: 12,
    left: SPACING.md,
    right: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  stickyUserBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  stickyUserLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  stickyUserRankPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyUserRankText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stickyUserTextWrap: {
    flex: 1,
  },
  stickyUserClubName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  stickyUserSubText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    marginTop: 1,
  },
  stickyUserAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stickyUserActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
});
