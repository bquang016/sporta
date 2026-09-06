import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Modal,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../../../shared/ui';
import { useClubs, ClubCard, getDefaultCover, getDefaultAvatar, getSafeCoverSource, Club } from '../../../entities/club';
import { useDebounce } from '../../../shared/lib/useDebounce';
import { getEloLevelLabel } from '../../../shared/lib/utils/elo';
import { getLeaderboardApi, LeaderboardItem } from '../../../shared/api/leaderboard';
import {
  FilterModal,
  useClubFilters,
  filterClubs,
  ClubFilterState,
  DEFAULT_FILTERS,
} from '../../../features/clubs-filter';

export { ClubFilterState, DEFAULT_FILTERS };

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FEATURED_CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 310);
const JOINED_HERO_CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 340);
const PAGE_SIZE = 6;

const getSportIcon = (sportName?: string) => {
  switch (sportName?.toLowerCase()) {
    case 'bóng đá':
      return 'sports-soccer';
    case 'cầu lông':
      return 'sports-tennis';
    case 'pickleball':
      return 'sports-tennis';
    case 'bóng rổ':
      return 'sports-basketball';
    case 'tennis':
      return 'sports-baseball';
    default:
      return 'sports';
  }
};

interface HighlightReason {
  tag: string;
  bgColor: string;
  textColor: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const getHighlightReason = (club: Club, index: number): HighlightReason => {
  if (index === 0 && (club.crp || 0) > 0) {
    return {
      tag: `Top 1 • ${club.crp} CRP`,
      bgColor: '#FEF3C7',
      textColor: '#B45309',
      icon: 'trophy',
    };
  }
  const elo = club.averageElo || club.elo || 1200;
  if (elo >= 1800) {
    return {
      tag: `Bán chuyên • ${elo} Elo`,
      bgColor: '#EDE9FE',
      textColor: '#6D28D9',
      icon: 'diamond',
    };
  }
  if ((club.rankedWins || 0) >= 4) {
    return {
      tag: `Chuỗi ${club.rankedWins} thắng`,
      bgColor: '#FFEDD5',
      textColor: '#C2410C',
      icon: 'flame',
    };
  }
  const remaining = (club.maxMembers || 30) - (club.members || 0);
  if (remaining > 0 && remaining <= 8) {
    return {
      tag: `Còn ${remaining} chỗ`,
      bgColor: '#ECFDF5',
      textColor: '#047857',
      icon: 'flash',
    };
  }
  if ((club.members || 0) >= 10) {
    return {
      tag: 'Cộng đồng sôi nổi',
      bgColor: '#E0F2FE',
      textColor: '#0369A1',
      icon: 'people',
    };
  }
  return {
    tag: 'CLB Triển vọng',
    bgColor: '#F1F5F9',
    textColor: '#334155',
    icon: 'star',
  };
};

export function ClubsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { clubs, joinedClubs, joinedIds, loading, refreshClubs } = useClubs();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [authModalAction, setAuthModalAction] = useState<string>('tham gia hoặc tạo câu lạc bộ');

  // Progressive Lazy Loading State
  const [displayedLimit, setDisplayedLimit] = useState<number>(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Leaderboard Top Preview State
  const [topClub, setTopClub] = useState<LeaderboardItem | null>(null);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 350);

  // Filter manager hook
  const {
    filters,
    appliedFilters,
    isFilterModalVisible,
    activeFilterCount,
    openModal,
    closeModal,
    applyFilters,
    resetFilters,
    setFilterField,
    clearProvince,
    clearWard,
    removeAppliedFilter,
  } = useClubFilters();

  // Reset pagination on search or filter change
  useEffect(() => {
    setDisplayedLimit(PAGE_SIZE);
  }, [debouncedSearchQuery, appliedFilters]);

  // Fetch top leaderboard preview
  useEffect(() => {
    let isMounted = true;
    getLeaderboardApi(undefined, undefined, 0, 1)
      .then((items) => {
        if (isMounted && items && items.length > 0) {
          setTopClub(items[0]);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const checkAndFetch = async () => {
        let token = '';
        if (Platform.OS === 'web') {
          token = localStorage.getItem('accessToken') || '';
        } else {
          token = (await SecureStore.getItemAsync('accessToken')) || '';
        }

        if (isMounted) {
          setIsAuthenticated(!!token);
        }

        let sportId: number | undefined;
        if (appliedFilters.sport === 'football') sportId = 1;
        else if (appliedFilters.sport === 'badminton') sportId = 2;
        else if (appliedFilters.sport === 'pickleball') sportId = 3;
        else if (appliedFilters.sport === 'basketball') sportId = 4;

        refreshClubs(sportId, debouncedSearchQuery);
      };

      checkAndFetch();

      return () => {
        isMounted = false;
      };
    }, [appliedFilters.sport, debouncedSearchQuery])
  );

  const handleRequireLogin = (actionName: string): boolean => {
    if (!isAuthenticated) {
      setAuthModalAction(actionName);
      setIsAuthModalVisible(true);
      return true;
    }
    return false;
  };

  const handleMyClubsPress = () => {
    if (handleRequireLogin('xem câu lạc bộ của bạn')) return;
    router.push('/my-clubs');
  };

  // Filter explore clubs
  const filteredClubs = useMemo(() => {
    return filterClubs(clubs, appliedFilters, searchQuery, joinedIds);
  }, [clubs, appliedFilters, searchQuery, joinedIds]);

  // Progressive batch chunk
  const displayedClubs = useMemo(() => {
    return filteredClubs.slice(0, displayedLimit);
  }, [filteredClubs, displayedLimit]);

  const handleLoadMore = () => {
    if (isLoadingMore || displayedLimit >= filteredClubs.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayedLimit((prev) => prev + PAGE_SIZE);
      setIsLoadingMore(false);
    }, 250);
  };

  // Featured spotlight clubs
  const featuredClubs = useMemo(() => {
    const pool = clubs.length > 0 ? clubs : joinedClubs;
    return pool.slice(0, 5);
  }, [clubs, joinedClubs]);

  const isFilteringOrSearching = !!searchQuery || activeFilterCount > 0;

  return (
    <View style={styles.container}>
      {/* 1. Header with Sporta Logo & Search & Filter */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerTopBar}>
          <View style={styles.headerBrandContainer}>
            <Image
              source={require('../../../../assets/logo/logo-horizontal_1600x400.png')}
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
            <View style={styles.clubBadgeContainer}>
              <Text style={styles.clubBadgeText}>CLUBS</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.createHeaderBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (handleRequireLogin('tạo câu lạc bộ')) return;
              router.push('/create-club');
            }}
          >
            <MaterialIcons name="add" size={17} color="#FFFFFF" />
            <Text style={styles.createHeaderBtnText}>Tạo CLB</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar Row */}
        <View style={styles.searchSection}>
          <View style={styles.searchBarRow}>
            <View
              style={[
                styles.searchContainer,
                isSearchFocused && styles.searchContainerFocused,
              ]}
            >
              <MaterialIcons name="search" size={20} color="#064E3B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm CLB, môn thể thao, khu vực..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {searchQuery ? (
                <TouchableOpacity
                  style={styles.clearSearchBtn}
                  activeOpacity={0.7}
                  onPress={() => setSearchQuery('')}
                >
                  <MaterialIcons name="cancel" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.filterTriggerBtn,
                activeFilterCount > 0 && styles.filterTriggerBtnActive,
              ]}
              activeOpacity={0.8}
              onPress={openModal}
            >
              <MaterialIcons
                name="tune"
                size={20}
                color={activeFilterCount > 0 ? '#FFFFFF' : '#064E3B'}
              />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadgeCount}>
                  <Text style={styles.filterBadgeCountText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Active Filter Tags Quick Strip */}
          {activeFilterCount > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeFiltersRow}
            >
              <TouchableOpacity
                style={styles.clearAllFilterChip}
                onPress={resetFilters}
              >
                <MaterialIcons name="refresh" size={12} color="#EF4444" />
                <Text style={styles.clearAllFilterText}>Xóa tất cả ({activeFilterCount})</Text>
              </TouchableOpacity>

              {appliedFilters.sport !== 'all' && (
                <TouchableOpacity
                  style={styles.activeFilterTag}
                  activeOpacity={0.8}
                  onPress={() => removeAppliedFilter('sport')}
                >
                  <Text style={styles.activeFilterTagText} numberOfLines={1}>
                    {appliedFilters.sport === 'football'
                      ? 'Bóng đá'
                      : appliedFilters.sport === 'badminton'
                      ? 'Cầu lông'
                      : appliedFilters.sport === 'pickleball'
                      ? 'Pickleball'
                      : 'Bóng rổ'}
                  </Text>
                  <MaterialIcons name="close" size={13} color="#064E3B" />
                </TouchableOpacity>
              )}

              {appliedFilters.province !== 'all' && (
                <TouchableOpacity
                  style={styles.activeFilterTag}
                  activeOpacity={0.8}
                  onPress={() => removeAppliedFilter('province')}
                >
                  <Text style={styles.activeFilterTagText} numberOfLines={1}>
                    {appliedFilters.province}
                  </Text>
                  <MaterialIcons name="close" size={13} color="#064E3B" />
                </TouchableOpacity>
              )}

              {appliedFilters.eloRange !== 'all' && (
                <TouchableOpacity
                  style={styles.activeFilterTag}
                  activeOpacity={0.8}
                  onPress={() => removeAppliedFilter('eloRange')}
                >
                  <Text style={styles.activeFilterTagText} numberOfLines={1}>
                    {appliedFilters.eloRange === 'weak'
                      ? 'Yếu (< 900)'
                      : appliedFilters.eloRange === 'weak_avg'
                      ? 'TB - Yếu'
                      : appliedFilters.eloRange === 'average'
                      ? 'Trung bình'
                      : appliedFilters.eloRange === 'avg_good'
                      ? 'TB - Khá'
                      : appliedFilters.eloRange === 'semi_pro'
                      ? 'Bán chuyên'
                      : appliedFilters.eloRange === 'pro'
                      ? 'Chuyên nghiệp'
                      : 'Trình độ'}
                  </Text>
                  <MaterialIcons name="close" size={13} color="#064E3B" />
                </TouchableOpacity>
              )}

              {appliedFilters.privacy !== 'all' && (
                <TouchableOpacity
                  style={styles.activeFilterTag}
                  activeOpacity={0.8}
                  onPress={() => removeAppliedFilter('privacy')}
                >
                  <Text style={styles.activeFilterTagText} numberOfLines={1}>
                    {appliedFilters.privacy === 'public' ? 'Công khai' : 'Riêng tư'}
                  </Text>
                  <MaterialIcons name="close" size={13} color="#064E3B" />
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>
      </View>

      {/* 2. Main Scrollable Content */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              let sportId: number | undefined;
              if (appliedFilters.sport === 'football') sportId = 1;
              else if (appliedFilters.sport === 'badminton') sportId = 2;
              else if (appliedFilters.sport === 'pickleball') sportId = 3;
              else if (appliedFilters.sport === 'basketball') sportId = 4;
              refreshClubs(sportId, searchQuery);
            }}
            colors={['#064E3B']}
          />
        }
      >
        {/* SECTION 1: "CLB CỦA BẠN" (PREMIUM HERO HUB) */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <View style={styles.sectionIconBadge}>
                <MaterialIcons name="groups" size={17} color="#064E3B" />
              </View>
              <Text style={styles.sectionTitle}>CLB của bạn</Text>
              {joinedClubs.length > 0 && (
                <View style={styles.myClubsCountPill}>
                  <Text style={styles.myClubsCountText}>{joinedClubs.length}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleMyClubsPress}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAllBtnText}>Quản lý CLB</Text>
              <MaterialIcons name="chevron-right" size={16} color="#064E3B" />
            </TouchableOpacity>
          </View>

          {joinedClubs.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.joinedHeroCarousel}
              decelerationRate="fast"
            >
              {joinedClubs.map((club) => {
                const elo = club.averageElo || club.elo || 1350;
                const levelLabel = club.levelLabel || getEloLevelLabel(elo);
                const isCreator = club.userStatus === 'CREATOR' || club.creatorId != null;

                return (
                  <TouchableOpacity
                    key={club.id}
                    style={styles.joinedHeroCard}
                    activeOpacity={0.9}
                    onPress={() =>
                      router.push({
                        pathname: '/club-detail-joined/[id]',
                        params: { id: String(club.id) },
                      })
                    }
                  >
                    {/* Top Row: Avatar + Info + Role Badge */}
                    <View style={styles.joinedHeroTopRow}>
                      <View style={styles.joinedHeroAvatarWrapper}>
                        <Avatar source={club.avatarImage} fallbackType="club" size={48} />
                        <View style={styles.joinedHeroSportDot}>
                          <MaterialIcons
                            name={getSportIcon(club.sport) as any}
                            size={11}
                            color="#064E3B"
                          />
                        </View>
                      </View>

                      <View style={styles.joinedHeroInfoCol}>
                        <View style={styles.joinedHeroNameRow}>
                          <Text style={styles.joinedHeroName} numberOfLines={1}>
                            {club.name}
                          </Text>
                        </View>

                        <View style={styles.joinedHeroMetaRow}>
                          <View
                            style={[
                              styles.joinedRoleBadge,
                              isCreator ? styles.roleBadgeCreator : styles.roleBadgeMember,
                            ]}
                          >
                            <Ionicons
                              name={isCreator ? 'star' : 'shield-checkmark'}
                              size={10}
                              color={isCreator ? '#B45309' : '#1D4ED8'}
                            />
                            <Text
                              style={[
                                styles.joinedRoleBadgeText,
                                isCreator ? styles.roleBadgeTextCreator : styles.roleBadgeTextMember,
                              ]}
                              numberOfLines={1}
                            >
                              {isCreator ? 'Chủ nhiệm' : 'Thành viên'}
                            </Text>
                          </View>
                          <Text style={styles.joinedHeroSportText} numberOfLines={1}>
                            {club.sport}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Middle: Key Stats Badges Grid */}
                    <View style={styles.joinedHeroStatsRow}>
                      <View style={styles.joinedHeroStatBox}>
                        <View style={styles.statIconValueRow}>
                          <Ionicons name="flash" size={11} color="#059669" />
                          <Text style={styles.joinedHeroStatValue} numberOfLines={1}>{elo} Elo</Text>
                        </View>
                        <Text style={styles.joinedHeroStatSub} numberOfLines={1}>{levelLabel}</Text>
                      </View>

                      <View style={styles.joinedHeroStatDivider} />

                      <View style={styles.joinedHeroStatBox}>
                        <View style={styles.statIconValueRow}>
                          <Ionicons name="trophy" size={11} color="#D97706" />
                          <Text style={[styles.joinedHeroStatValue, { color: '#B45309' }]} numberOfLines={1}>
                            {club.crp || 0} CRP
                          </Text>
                        </View>
                        <Text style={styles.joinedHeroStatSub} numberOfLines={1}>Điểm mùa</Text>
                      </View>

                      <View style={styles.joinedHeroStatDivider} />

                      <View style={styles.joinedHeroStatBox}>
                        <View style={styles.statIconValueRow}>
                          <Ionicons name="people" size={11} color="#2563EB" />
                          <Text style={[styles.joinedHeroStatValue, { color: '#1D4ED8' }]} numberOfLines={1}>
                            {club.members}/{club.maxMembers}
                          </Text>
                        </View>
                        <Text style={styles.joinedHeroStatSub} numberOfLines={1}>Thành viên</Text>
                      </View>
                    </View>

                    {/* Bottom CTA Row */}
                    <View style={styles.joinedHeroFooterRow}>
                      <View style={styles.joinedHeroStatusIndicator}>
                        <View style={styles.activeDot} />
                        <Text style={styles.joinedHeroStatusText} numberOfLines={1}>
                          {club.area || 'Đang hoạt động'}
                        </Text>
                      </View>

                      <View style={styles.joinedHeroCtaBtn}>
                        <Text style={styles.joinedHeroCtaText}>Phòng điều hành</Text>
                        <MaterialIcons name="arrow-forward" size={12} color="#064E3B" />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <TouchableOpacity
              style={styles.emptyJoinedBanner}
              activeOpacity={0.88}
              onPress={() => {
                if (handleRequireLogin('tạo hoặc tham gia câu lạc bộ')) return;
                router.push('/create-club');
              }}
            >
              <LinearGradient
                colors={['#064E3B', '#022C22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyJoinedGradient}
              >
                <View style={styles.emptyJoinedIconCircle}>
                  <Ionicons name="shield" size={24} color="#FDE68A" />
                </View>
                <View style={styles.emptyJoinedTextCol}>
                  <Text style={styles.emptyJoinedTitle}>Bạn chưa tham gia CLB nào</Text>
                  <Text style={styles.emptyJoinedDesc}>
                    Thành lập đội nhóm hoặc gia nhập CLB để đua top CRP & giao lưu ngay!
                  </Text>
                </View>
                <View style={styles.emptyJoinedActionBtn}>
                  <Text style={styles.emptyJoinedActionText}>Tạo CLB</Text>
                  <MaterialIcons name="add-circle" size={14} color="#064E3B" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* SECTION 2: ĐẤU TRƯỜNG TRANH BÁ CLB (SEASON TOURNAMENT LEADERBOARD WIDGET) */}
        {!isFilteringOrSearching && (
          <View style={styles.sectionBlock}>
            <TouchableOpacity
              style={styles.tournamentBanner}
              activeOpacity={0.92}
              onPress={() => router.push('/leaderboard' as any)}
            >
              <LinearGradient
                colors={['#064E3B', '#0F766E', '#065F46']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tournamentGradient}
              >
                {/* Header: Live Badge & Season Title */}
                <View style={styles.tournamentTopRow}>
                  <View style={styles.tournamentSeasonPill}>
                    <View style={styles.livePulseDot} />
                    <Text style={styles.tournamentSeasonPillText} numberOfLines={1}>
                      TRANH BÁ MÙA 1 - 2026
                    </Text>
                  </View>
                  <View style={styles.tournamentRewardsPill}>
                    <Ionicons name="gift" size={11} color="#FDE68A" />
                    <Text style={styles.tournamentRewardsPillText} numberOfLines={1}>
                      Quỹ 18.5 Triệu
                    </Text>
                  </View>
                </View>

                {/* Big Title & Teaser */}
                <View style={styles.tournamentMainContent}>
                  <Text style={styles.tournamentTitle} numberOfLines={2}>
                    Đua Top CRP • Nhận cúp vàng & 20 vé sân 0đ
                  </Text>
                  <Text style={styles.tournamentSubtitle} numberOfLines={2}>
                    {topClub
                      ? `CLB "${topClub.clubName}" đang dẫn đầu với ${topClub.crp} CRP. CLB của bạn xếp thứ mấy?`
                      : 'Cạnh tranh điểm thưởng sau mỗi trận thắng để đưa CLB lên đỉnh vinh quang!'}
                  </Text>
                </View>

                {/* Footer Action Strip */}
                <View style={styles.tournamentFooterRow}>
                  <View style={styles.tournamentTopRankRow}>
                    <Ionicons name="trophy" size={13} color="#FDE68A" />
                    <Text style={styles.tournamentTopRankText} numberOfLines={1}>
                      Top 1: Cúp vàng + 5.000.000đ + Spotlight
                    </Text>
                  </View>

                  <View style={styles.tournamentCtaBadge}>
                    <Text style={styles.tournamentCtaBadgeText}>Bảng vàng</Text>
                    <Ionicons name="arrow-forward-circle" size={14} color="#064E3B" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* SECTION 3: "CLB NỔI BẬT" (FEATURED SPOTLIGHT CAROUSEL) */}
        {featuredClubs.length > 0 && !isFilteringOrSearching && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithIcon}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#FFEDD5' }]}>
                  <MaterialIcons name="local-fire-department" size={17} color="#EA580C" />
                </View>
                <Text style={styles.sectionTitle}>CLB nổi bật</Text>
              </View>
              <Text style={styles.sectionSubHint}>Tuyển chọn theo thành tích</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredCarouselContent}
              decelerationRate="fast"
            >
              {featuredClubs.map((club, index) => {
                const isJoined = joinedIds.includes(club.id);
                const coverSource = getSafeCoverSource(club.sport, club.coverImage);
                const elo = club.averageElo || club.elo || 1350;
                const highlight = getHighlightReason(club, index);

                return (
                  <TouchableOpacity
                    key={club.id}
                    style={styles.featuredCard}
                    activeOpacity={0.9}
                    onPress={() => {
                      if (isJoined) {
                        router.push({
                          pathname: '/club-detail-joined/[id]',
                          params: { id: String(club.id) },
                        });
                      } else {
                        router.push({
                          pathname: '/club-detail-explore/[id]',
                          params: { id: String(club.id) },
                        });
                      }
                    }}
                  >
                    {/* Cover Banner */}
                    <View style={styles.featuredCoverBox}>
                      <Image source={coverSource} style={styles.featuredCoverImg} />
                      <LinearGradient
                        colors={['transparent', 'rgba(15, 23, 42, 0.75)']}
                        style={styles.featuredCoverGradient}
                      />

                      {/* Prominent Highlight Reason Tag Top Left */}
                      <View
                        style={[
                          styles.featuredHighlightTag,
                          { backgroundColor: highlight.bgColor },
                        ]}
                      >
                        <Ionicons
                          name={highlight.icon}
                          size={10}
                          color={highlight.textColor}
                        />
                        <Text
                          style={[
                            styles.featuredHighlightTagText,
                            { color: highlight.textColor },
                          ]}
                          numberOfLines={1}
                        >
                          {highlight.tag}
                        </Text>
                      </View>

                      {/* Sport Badge Top Right */}
                      <View style={styles.featuredSportBadge}>
                        <MaterialIcons
                          name={getSportIcon(club.sport) as any}
                          size={11}
                          color="#FFFFFF"
                        />
                        <Text style={styles.featuredSportBadgeText} numberOfLines={1}>{club.sport}</Text>
                      </View>

                      {/* Joined Badge */}
                      {isJoined ? (
                        <View style={styles.joinedBadgePill}>
                          <MaterialIcons name="check-circle" size={11} color="#FFFFFF" />
                          <Text style={styles.joinedBadgeText}>Đã tham gia</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Body Info */}
                    <View style={styles.featuredBody}>
                      <View style={styles.featuredAvatarRow}>
                        <View style={styles.featuredAvatarWrapper}>
                          <Avatar source={club.avatarImage} fallbackType="club" size={40} />
                        </View>
                        <View style={styles.featuredTitleCol}>
                          <Text style={styles.featuredClubName} numberOfLines={1}>
                            {club.name}
                          </Text>
                          <View style={styles.areaRowInline}>
                            <MaterialIcons name="location-on" size={11} color="#64748B" />
                            <Text style={styles.featuredAreaText} numberOfLines={1}>
                              {club.area || 'Toàn quốc'}
                            </Text>
                            <Text style={styles.dotDivider}>•</Text>
                            <Text style={styles.featuredEloText}>{elo} Elo</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.featuredFooterRow}>
                        <View style={styles.featuredMemberTag}>
                          <Ionicons name="people" size={12} color="#064E3B" />
                          <Text style={styles.featuredMemberText}>
                            {club.members}/{club.maxMembers} TV
                          </Text>
                        </View>

                        <View style={styles.featuredViewBtn}>
                          <Text style={styles.featuredViewBtnText}>
                            {isJoined ? 'Vào CLB' : 'Khám phá'}
                          </Text>
                          <MaterialIcons name="arrow-forward" size={12} color="#064E3B" />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* SECTION 4: "KHÁM PHÁ CÂU LẠC BỘ" (PROGRESSIVE LAZY LOADED FEED) */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#ECFDF5' }]}>
                <MaterialIcons name="explore" size={17} color="#064E3B" />
              </View>
              <Text style={styles.sectionTitle}>
                {isFilteringOrSearching
                  ? `Kết quả lọc (${filteredClubs.length})`
                  : `Khám phá câu lạc bộ (${filteredClubs.length})`}
              </Text>
            </View>
            {activeFilterCount > 0 && (
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.resetFilterText}>Xoá lọc ({activeFilterCount})</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredClubs.length > 0 ? (
            <View style={styles.clubsVerticalList}>
              {displayedClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  onPress={() => {
                    const isJoined = joinedIds.includes(club.id);
                    if (isJoined) {
                      router.push({
                        pathname: '/club-detail-joined/[id]',
                        params: { id: String(club.id) },
                      });
                    } else {
                      router.push({
                        pathname: '/club-detail-explore/[id]',
                        params: { id: String(club.id) },
                      });
                    }
                  }}
                />
              ))}

              {/* Progressive Load More Action Button */}
              {displayedLimit < filteredClubs.length ? (
                <TouchableOpacity
                  style={styles.loadMoreBtn}
                  activeOpacity={0.8}
                  onPress={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <ActivityIndicator size="small" color="#064E3B" />
                  ) : (
                    <>
                      <Text style={styles.loadMoreBtnText}>
                        Xem thêm {filteredClubs.length - displayedLimit} câu lạc bộ khác
                      </Text>
                      <Ionicons name="chevron-down" size={15} color="#064E3B" />
                    </>
                  )}
                </TouchableOpacity>
              ) : filteredClubs.length > PAGE_SIZE ? (
                <View style={styles.allLoadedBox}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.allLoadedText}>
                    Đã hiển thị tất cả {filteredClubs.length} câu lạc bộ
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.emptyExploreCard}>
              <MaterialIcons name="group-off" size={44} color="#CBD5E1" />
              <Text style={styles.emptyExploreTitle}>
                {joinedIds.length > 0 && joinedIds.length === clubs.length
                  ? 'Bạn đã tham gia tất cả các câu lạc bộ!'
                  : 'Không tìm thấy câu lạc bộ phù hợp'}
              </Text>
              <Text style={styles.emptyExploreSub}>
                Hãy thử thay đổi tiêu chí lọc hoặc tìm kiếm với từ khóa khác.
              </Text>
              <TouchableOpacity
                style={styles.createNowEmptyBtn}
                activeOpacity={0.85}
                onPress={() => {
                  if (handleRequireLogin('tạo câu lạc bộ')) return;
                  router.push('/create-club');
                }}
              >
                <MaterialIcons name="add" size={17} color="#FFFFFF" />
                <Text style={styles.createNowEmptyBtnText}>Thành lập CLB mới</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 3. Filter Modal (Full Slide Sheet) */}
      <FilterModal
        visible={isFilterModalVisible}
        filters={filters}
        onClose={closeModal}
        onApply={applyFilters}
        onReset={resetFilters}
        onSelectField={setFilterField}
        onSelectProvince={(name, code) => {
          setFilterField('province', name);
          setFilterField('provinceCode', code);
          setFilterField('ward', 'all');
        }}
        onSelectWard={(name) => setFilterField('ward', name)}
        onClearProvince={clearProvince}
        onClearWard={clearWard}
      />

      {/* Require Login Modal */}
      <Modal
        visible={isAuthModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAuthModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconCircle}>
              <MaterialIcons name="lock-outline" size={34} color="#064E3B" />
            </View>
            <Text style={styles.modalTitle}>Yêu cầu đăng nhập</Text>
            <Text style={styles.modalSubtitle}>
              Bạn cần đăng nhập tài khoản để {authModalAction}.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsAuthModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Để sau</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalLoginBtn}
                onPress={() => {
                  setIsAuthModalVisible(false);
                  router.push('/auth/login' as any);
                }}
              >
                <Text style={styles.modalLoginText}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoImage: {
    width: 105,
    height: 28,
  },
  clubBadgeContainer: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  clubBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  createHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 4,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  createHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 13,
    paddingHorizontal: 11,
    height: 40,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 7,
  },
  searchContainerFocused: {
    borderColor: '#064E3B',
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 2,
  },
  filterTriggerBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  filterTriggerBtnActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  filterBadgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  filterBadgeCountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  clearAllFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
    gap: 3,
  },
  clearAllFilterText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#EF4444',
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 3,
    maxWidth: 160,
  },
  activeFilterTagText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#064E3B',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  sectionBlock: {
    marginTop: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sectionIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubHint: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  myClubsCountPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  myClubsCountText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#064E3B',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  seeAllBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#064E3B',
  },
  resetFilterText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EF4444',
  },

  /* SECTION 1: HERO JOINED CLUBS CAROUSEL */
  joinedHeroCarousel: {
    paddingHorizontal: 16,
    gap: 12,
  },
  joinedHeroCard: {
    width: JOINED_HERO_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  joinedHeroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  joinedHeroAvatarWrapper: {
    position: 'relative',
  },
  joinedHeroSportDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  joinedHeroInfoCol: {
    flex: 1,
    gap: 3,
  },
  joinedHeroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  joinedHeroName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  joinedHeroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  joinedRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    gap: 2.5,
  },
  roleBadgeCreator: {
    backgroundColor: '#FEF3C7',
  },
  roleBadgeMember: {
    backgroundColor: '#EFF6FF',
  },
  joinedRoleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  roleBadgeTextCreator: {
    color: '#B45309',
  },
  roleBadgeTextMember: {
    color: '#1D4ED8',
  },
  joinedHeroSportText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  joinedHeroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 11,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  joinedHeroStatBox: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
    paddingHorizontal: 2,
  },
  statIconValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  joinedHeroStatValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  joinedHeroStatSub: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '500',
  },
  joinedHeroStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  joinedHeroFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  joinedHeroStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  joinedHeroStatusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  joinedHeroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 7,
    gap: 2,
  },
  joinedHeroCtaText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#064E3B',
  },

  /* Empty Joined Banner */
  emptyJoinedBanner: {
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyJoinedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  emptyJoinedIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyJoinedTextCol: {
    flex: 1,
    gap: 2,
  },
  emptyJoinedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyJoinedDesc: {
    fontSize: 11,
    color: '#D1FAE5',
    lineHeight: 15,
  },
  emptyJoinedActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 3,
  },
  emptyJoinedActionText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#064E3B',
  },

  /* SECTION 2: TOURNAMENT LEADERBOARD WIDGET */
  tournamentBanner: {
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  tournamentGradient: {
    padding: 14,
    gap: 8,
  },
  tournamentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tournamentSeasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
    gap: 4,
    flexShrink: 1,
  },
  livePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FDE68A',
  },
  tournamentSeasonPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FDE68A',
    letterSpacing: 0.4,
  },
  tournamentRewardsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
    gap: 3,
    flexShrink: 0,
  },
  tournamentRewardsPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tournamentMainContent: {
    gap: 2,
  },
  tournamentTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  tournamentSubtitle: {
    fontSize: 11.5,
    color: '#CCFBF1',
    lineHeight: 16,
  },
  tournamentFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    gap: 8,
  },
  tournamentTopRankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  tournamentTopRankText: {
    fontSize: 10.5,
    color: '#FEF08A',
    fontWeight: '600',
  },
  tournamentCtaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    gap: 3,
    flexShrink: 0,
  },
  tournamentCtaBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#064E3B',
  },

  /* SECTION 3: SPOTLIGHT FEATURED CAROUSEL */
  featuredCarouselContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  featuredCoverBox: {
    height: 105,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  featuredCoverImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredCoverGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '75%',
  },
  featuredHighlightTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    gap: 3,
    maxWidth: '58%',
    elevation: 2,
  },
  featuredHighlightTagText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  featuredSportBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 7,
    gap: 2.5,
    maxWidth: '38%',
  },
  featuredSportBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  joinedBadgePill: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    gap: 2,
  },
  joinedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  featuredBody: {
    padding: 11,
    gap: 8,
  },
  featuredAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  featuredAvatarWrapper: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  featuredTitleCol: {
    flex: 1,
    gap: 2,
  },
  featuredClubName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  areaRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featuredAreaText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
    flexShrink: 1,
  },
  dotDivider: {
    color: '#CBD5E1',
    fontSize: 9,
  },
  featuredEloText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
    flexShrink: 0,
  },
  featuredFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  featuredMemberTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featuredMemberText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  featuredViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  featuredViewBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#064E3B',
  },

  /* SECTION 4: EXPLORE VERTICAL LIST */
  clubsVerticalList: {
    paddingHorizontal: 16,
    gap: 2,
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 5,
    marginTop: 4,
    marginBottom: 8,
  },
  loadMoreBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#064E3B',
  },
  allLoadedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 5,
  },
  allLoadedText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyExploreCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  emptyExploreTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptyExploreSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },
  createNowEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 11,
    gap: 5,
    marginTop: 4,
  },
  createNowEmptyBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },

  /* Auth Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  modalLoginBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: '#064E3B',
    alignItems: 'center',
  },
  modalLoginText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
