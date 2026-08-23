import React, { useState, useCallback, useMemo } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import { useClubs, ClubCard, getDefaultCover, getDefaultAvatar } from '../../../entities/club';
import { useDebounce } from '../../../shared/lib/useDebounce';
import {
  FilterModal,
  useClubFilters,
  filterClubs,
  ClubFilterState,
  DEFAULT_FILTERS,
} from '../../../features/clubs-filter';

export { ClubFilterState, DEFAULT_FILTERS };

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FEATURED_CARD_WIDTH = SCREEN_WIDTH * 0.78;

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

export function ClubsScreen() {
  const router = useRouter();
  const { clubs, joinedClubs, joinedIds, loading, refreshClubs } = useClubs();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [authModalAction, setAuthModalAction] = useState<string>('tham gia hoặc tạo câu lạc bộ');

  // Debounce search query to avoid spamming the API on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 350);

  // Hook managing filter draft, applied state, and active count
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

  // Filter explore clubs using pure function filterClubs
  const filteredClubs = useMemo(() => {
    return filterClubs(clubs, appliedFilters, searchQuery, joinedIds);
  }, [clubs, appliedFilters, searchQuery, joinedIds]);

  // Featured spotlight clubs (Max 5 items)
  const featuredClubs = useMemo(() => {
    const pool = clubs.length > 0 ? clubs : joinedClubs;
    return pool.slice(0, 5);
  }, [clubs, joinedClubs]);

  return (
    <View style={styles.container}>
      {/* 1. Header with Sporta Logo & "CLUB" badge */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          {/* Official Logo + CLUB Tag */}
          <View style={styles.headerBrandContainer}>
            <Image
              source={require('../../../../assets/logo/logo-horizontal_1600x400.png')}
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
            <View style={styles.clubBadgeContainer}>
              <Text style={styles.clubBadgeText}>CLUB</Text>
            </View>
          </View>

          {/* Create Club Button Top-Right */}
          <TouchableOpacity
            style={styles.createHeaderBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (handleRequireLogin('tạo câu lạc bộ')) return;
              router.push('/create-club');
            }}
          >
            <MaterialIcons name="add" size={17} color={COLORS.white} />
            <Text style={styles.createHeaderBtnText}>Tạo CLB</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar Row with Dedicated Filter Button */}
        <View style={styles.searchSection}>
          <View style={styles.searchBarRow}>
            <View
              style={[
                styles.searchContainer,
                isSearchFocused && styles.searchContainerFocused,
              ]}
            >
              <MaterialIcons name="search" size={22} color={COLORS.primary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm CLB, môn thể thao, khu vực..."
                placeholderTextColor={COLORS.outline}
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
                  <MaterialIcons name="cancel" size={18} color={COLORS.outline} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Dedicated 3-Lines Filter Button */}
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
                size={22}
                color={activeFilterCount > 0 ? COLORS.white : COLORS.primary}
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
                <MaterialIcons name="refresh" size={13} color="#EF4444" />
                <Text style={styles.clearAllFilterText}>Xóa tất cả ({activeFilterCount})</Text>
              </TouchableOpacity>

              {appliedFilters.sport !== 'all' && (
                <TouchableOpacity
                  style={styles.activeFilterTag}
                  activeOpacity={0.8}
                  onPress={() => removeAppliedFilter('sport')}
                >
                  <Text style={styles.activeFilterTagText}>
                    {appliedFilters.sport === 'football'
                      ? 'Bóng đá'
                      : appliedFilters.sport === 'badminton'
                      ? 'Cầu lông'
                      : appliedFilters.sport === 'pickleball'
                      ? 'Pickleball'
                      : 'Bóng rổ'}
                  </Text>
                  <MaterialIcons name="close" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              )}

              {appliedFilters.province !== 'all' && (
                <TouchableOpacity
                  style={styles.activeFilterTag}
                  activeOpacity={0.8}
                  onPress={() => removeAppliedFilter('province')}
                >
                  <Text style={styles.activeFilterTagText}>{appliedFilters.province}</Text>
                  <MaterialIcons name="close" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              )}

              {appliedFilters.ward !== 'all' && (
                <TouchableOpacity
                  style={styles.activeFilterTag}
                  activeOpacity={0.8}
                  onPress={() => removeAppliedFilter('ward')}
                >
                  <Text style={styles.activeFilterTagText}>{appliedFilters.ward}</Text>
                  <MaterialIcons name="close" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              )}

              {appliedFilters.memberCount !== 'all' && (
                <TouchableOpacity
                  style={styles.activeFilterTag}
                  activeOpacity={0.8}
                  onPress={() => removeAppliedFilter('memberCount')}
                >
                  <Text style={styles.activeFilterTagText}>
                    {appliedFilters.memberCount === 'under10'
                      ? '< 10 TV'
                      : appliedFilters.memberCount === '10to25'
                      ? '10 - 25 TV'
                      : appliedFilters.memberCount === 'above25'
                      ? '> 25 TV'
                      : 'Còn chỗ'}
                  </Text>
                  <MaterialIcons name="close" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              )}

              {appliedFilters.eloRange !== 'all' && (
                <TouchableOpacity
                  style={styles.activeFilterTag}
                  activeOpacity={0.8}
                  onPress={() => removeAppliedFilter('eloRange')}
                >
                  <Text style={styles.activeFilterTagText}>
                    {appliedFilters.eloRange === 'beginner'
                      ? 'Cơ bản'
                      : appliedFilters.eloRange === 'intermediate'
                      ? 'Phong trào'
                      : 'Bán chuyên'}
                  </Text>
                  <MaterialIcons name="close" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              )}

              {appliedFilters.privacy !== 'all' && (
                <TouchableOpacity
                  style={styles.activeFilterTag}
                  activeOpacity={0.8}
                  onPress={() => removeAppliedFilter('privacy')}
                >
                  <Text style={styles.activeFilterTagText}>
                    {appliedFilters.privacy === 'public' ? 'Công khai' : 'Riêng tư'}
                  </Text>
                  <MaterialIcons name="close" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>

      {/* 2. Main Scrollable Content */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
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
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Section 1: "CLB Của Bạn" Hub */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <MaterialIcons name="groups" size={19} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>CLB Của Bạn</Text>
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
              <MaterialIcons name="chevron-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {joinedClubs.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.joinedClubsCarousel}
            >
              {joinedClubs.map((club) => {
                const avatar = getDefaultAvatar(club.sport, club.avatarImage);
                return (
                  <TouchableOpacity
                    key={club.id}
                    style={styles.joinedClubCard}
                    activeOpacity={0.88}
                    onPress={() =>
                      router.push({
                        pathname: '/club-detail-joined/[id]',
                        params: { id: String(club.id) },
                      })
                    }
                  >
                    <View style={styles.joinedClubAvatarWrapper}>
                      <Image source={{ uri: avatar }} style={styles.joinedClubAvatar} />
                    </View>

                    <View style={styles.joinedClubInfo}>
                      <Text style={styles.joinedClubName} numberOfLines={1}>
                        {club.name}
                      </Text>
                      <View style={styles.joinedClubMetaRow}>
                        <MaterialIcons
                          name={getSportIcon(club.sport) as any}
                          size={12}
                          color={COLORS.primary}
                        />
                        <Text style={styles.joinedClubSportText}>{club.sport}</Text>
                        <Text style={styles.joinedClubDot}>•</Text>
                        <Text style={styles.joinedClubMemberCount}>
                          {club.members} thành viên
                        </Text>
                      </View>
                    </View>

                    <MaterialIcons name="chevron-right" size={18} color={COLORS.outline} />
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
                style={styles.emptyJoinedGradient}
              >
                <View style={styles.emptyJoinedIconCircle}>
                  <MaterialIcons name="group-add" size={24} color={COLORS.secondary} />
                </View>
                <View style={styles.emptyJoinedTextCol}>
                  <Text style={styles.emptyJoinedTitle}>Bạn chưa tham gia CLB nào</Text>
                  <Text style={styles.emptyJoinedDesc}>
                    Gia nhập CLB hoặc thành lập đội nhóm để ghép kèo & giao lưu ngay!
                  </Text>
                </View>
                <View style={styles.emptyJoinedActionBtn}>
                  <Text style={styles.emptyJoinedActionText}>Tạo ngay</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Section 2: "CLB Nổi Bật" Spotlight Carousel (Tối đa 5 câu lạc bộ) */}
        {featuredClubs.length > 0 && !searchQuery && activeFilterCount === 0 && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleWithIcon}>
                <MaterialIcons name="local-fire-department" size={20} color="#EA580C" />
                <Text style={styles.sectionTitle}>CLB Nổi Bật</Text>
              </View>
              <Text style={styles.sectionSubHint}>Cộng đồng thể thao tích cực</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredCarouselContent}
              decelerationRate="fast"
            >
              {featuredClubs.map((club) => {
                const isJoined = joinedIds.includes(club.id);
                const cover = getDefaultCover(club.sport, club.coverImage);
                const avatar = getDefaultAvatar(club.sport, club.avatarImage);

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
                      <Image source={{ uri: cover }} style={styles.featuredCoverImg} />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.featuredCoverGradient}
                      />

                      {/* Sport Badge Top Left */}
                      <View style={styles.featuredSportBadge}>
                        <MaterialIcons
                          name={getSportIcon(club.sport) as any}
                          size={12}
                          color={COLORS.white}
                        />
                        <Text style={styles.featuredSportBadgeText}>{club.sport}</Text>
                      </View>

                      {/* Joined Badge Top Right */}
                      {isJoined ? (
                        <View style={styles.joinedBadgePill}>
                          <MaterialIcons name="check-circle" size={12} color={COLORS.white} />
                          <Text style={styles.joinedBadgeText}>Đã tham gia</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Body Info */}
                    <View style={styles.featuredBody}>
                      <View style={styles.featuredAvatarRow}>
                        <View style={styles.featuredAvatarWrapper}>
                          <Image source={{ uri: avatar }} style={styles.featuredAvatarImg} />
                        </View>
                        <View style={styles.featuredTitleCol}>
                          <Text style={styles.featuredClubName} numberOfLines={1}>
                            {club.name}
                          </Text>
                          <View style={styles.areaRowInline}>
                            <MaterialIcons name="location-on" size={12} color={COLORS.outline} />
                            <Text style={styles.featuredAreaText} numberOfLines={1}>
                              {club.area || 'Toàn quốc'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.featuredFooterRow}>
                        <View style={styles.featuredMemberTag}>
                          <MaterialIcons name="people" size={13} color={COLORS.primary} />
                          <Text style={styles.featuredMemberText}>
                            {club.members}/{club.maxMembers} thành viên
                          </Text>
                        </View>

                        <View style={styles.featuredViewBtn}>
                          <Text style={styles.featuredViewBtnText}>
                            {isJoined ? 'Vào CLB' : 'Khám phá'}
                          </Text>
                          <MaterialIcons name="arrow-forward" size={13} color={COLORS.primary} />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Section 3: All Explore Clubs List */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <MaterialIcons name="explore" size={19} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>
                {searchQuery || activeFilterCount > 0
                  ? `Kết quả lọc (${filteredClubs.length})`
                  : `Khám Phá Câu Lạc Bộ (${filteredClubs.length})`}
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
              {filteredClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  onPress={() =>
                    router.push({
                      pathname: '/club-detail-explore/[id]',
                      params: { id: String(club.id) },
                    })
                  }
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyExploreCard}>
              <MaterialIcons name="group-off" size={54} color={COLORS.outlineVariant} />
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
                <MaterialIcons name="add" size={18} color={COLORS.white} />
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
              <MaterialIcons name="lock-outline" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.modalTitle}>Yêu cầu đăng nhập</Text>
            <Text style={styles.modalSubtitle}>
              Bạn cần đăng nhập tài khoản để {authModalAction}.
            </Text>
            <View style={styles.modalActions}>
              <Button
                title="Hủy"
                variant="outline"
                style={styles.modalCancelBtn}
                onPress={() => setIsAuthModalVisible(false)}
              />
              <Button
                title="Đăng nhập ngay"
                variant="primary"
                style={styles.modalConfirmBtn}
                onPress={() => {
                  setIsAuthModalVisible(false);
                  router.push('/(auth)/login');
                }}
              />
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
  headerSafeArea: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
    height: 56,
  },
  headerBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  headerLogoImage: {
    width: 120,
    height: 30,
  },
  clubBadgeContainer: {
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
  },
  clubBadgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  createHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  createHeaderBtnText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.white,
  },
  searchSection: {
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: SPACING.sm,
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
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
    paddingHorizontal: SPACING.md,
    height: 46,
    gap: 8,
  },
  searchContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13.5,
    color: COLORS.onSurface,
    padding: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  filterTriggerBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
  },
  filterTriggerBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterBadgeCount: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  filterBadgeCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.white,
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
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  clearAllFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryOpacity10,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 4.5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
  },
  activeFilterTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: 110,
    gap: SPACING.lg,
  },
  sectionBlock: {
    gap: SPACING.sm + 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 16,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '900',
    color: '#0F172A',
  },
  myClubsCountPill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.full,
  },
  myClubsCountText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.white,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  seeAllBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionSubHint: {
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  joinedClubsCarousel: {
    gap: 10,
    paddingVertical: 2,
  },
  joinedClubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    minWidth: 210,
    maxWidth: 240,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  joinedClubAvatarWrapper: {
    position: 'relative',
  },
  joinedClubAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  joinedClubInfo: {
    flex: 1,
    gap: 2,
  },
  joinedClubName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  joinedClubMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  joinedClubSportText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  joinedClubDot: {
    fontSize: 10,
    color: COLORS.outlineVariant,
  },
  joinedClubMemberCount: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  emptyJoinedBanner: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyJoinedGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  emptyJoinedIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyJoinedTextCol: {
    flex: 1,
    gap: 2,
  },
  emptyJoinedTitle: {
    fontSize: 14,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: COLORS.white,
  },
  emptyJoinedDesc: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
  },
  emptyJoinedActionBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  emptyJoinedActionText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: COLORS.primary,
  },
  featuredCarouselContent: {
    gap: 12,
    paddingVertical: 4,
  },
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  featuredCoverBox: {
    height: 105,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  featuredCoverImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredCoverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredSportBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  featuredSportBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.white,
  },
  joinedBadgePill: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(6, 78, 59, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  joinedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  featuredBody: {
    padding: 12,
    gap: 10,
  },
  featuredAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featuredAvatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  featuredAvatarImg: {
    width: '100%',
    height: '100%',
  },
  featuredTitleCol: {
    flex: 1,
    gap: 2,
  },
  featuredClubName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  areaRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  featuredAreaText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  featuredFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  featuredMemberTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  featuredMemberText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  featuredViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featuredViewBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.primary,
  },
  clubsVerticalList: {
    gap: 10,
  },
  emptyExploreCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  emptyExploreTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptyExploreSub: {
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  createNowEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 6,
  },
  createNowEmptyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.base,
  },
  modalTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13.5,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
  },
  modalConfirmBtn: {
    flex: 1.2,
  },
});

export default ClubsScreen;
