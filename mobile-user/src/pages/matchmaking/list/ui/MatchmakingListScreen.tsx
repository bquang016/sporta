import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useMatchmakingList, useMyMatches } from '../../../../features/matchmaking/model/useMatchmaking';
import { MatchCard } from '../../../../features/matchmaking/ui/MatchCard';
import { MatchmakingSortOption } from '../../../../entities/match/model/match.types';
import { AuthRequiredModal } from '../../../../shared/ui/AuthRequiredModal';
import { loadNativeUserSessionAsync } from '../../../../shared/lib/userSession';

export function MatchmakingListScreen() {
  const router = useRouter();

  // Tab State: 'ALL_ROOMS' (Sàn Chợ tìm đối thủ) | 'MY_MATCHES' (Trận đấu của tôi)
  const [activeTab, setActiveTab] = useState<'ALL_ROOMS' | 'MY_MATCHES'>('ALL_ROOMS');
  const [authModalVisible, setAuthModalVisible] = useState(false);

  // Sub-filter for "Trận đấu của tôi"
  const [myMatchFilter, setMyMatchFilter] = useState<'ALL' | 'ACTION_REQUIRED' | 'UPCOMING' | 'SEEKING' | 'FINISHED'>('ALL');

  // Hooks (100% Real Backend Data)
  const {
    rooms: publicRooms,
    loading: publicLoading,
    filters,
    setFilters,
    sortOption,
    setSortOption,
    refetch: refetchPublic,
  } = useMatchmakingList();

  const {
    rooms: myRooms,
    loading: myLoading,
    refetch: refetchMyMatches,
  } = useMyMatches();

  // Real-time auto-refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'ALL_ROOMS') {
        refetchPublic();
      } else {
        refetchMyMatches();
      }
    }, [activeTab, refetchPublic, refetchMyMatches])
  );

  // Sort "Trận đấu của tôi" descending by createdAt / ID so the latest matches appear at the top
  const sortedMyRooms = useMemo(() => {
    return [...myRooms].sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) {
        return timeB - timeA;
      }
      const idA = parseInt(String(a.id), 10) || 0;
      const idB = parseInt(String(b.id), 10) || 0;
      return idB - idA;
    });
  }, [myRooms]);

  // Action required count (Score confirming, score pending, disputed, or open with applicants)
  const actionRequiredCount = useMemo(() => {
    return sortedMyRooms.filter((r) => {
      const isConfirming = r.status === 'SCORE_CONFIRMING' || r.status === 'SCORE_PENDING' || r.status === 'DISPUTED';
      const hasApplicants = r.status === 'OPEN' && r.applicants && r.applicants.length > 0;
      return isConfirming || hasApplicants;
    }).length;
  }, [sortedMyRooms]);

  // Filtered "Trận đấu của tôi"
  const filteredMyRooms = useMemo(() => {
    if (myMatchFilter === 'ALL') return sortedMyRooms;
    if (myMatchFilter === 'ACTION_REQUIRED') {
      return sortedMyRooms.filter((r) => {
        const isConfirming = r.status === 'SCORE_CONFIRMING' || r.status === 'SCORE_PENDING' || r.status === 'DISPUTED';
        const hasApplicants = r.status === 'OPEN' && r.applicants && r.applicants.length > 0;
        return isConfirming || hasApplicants;
      });
    }
    if (myMatchFilter === 'UPCOMING') {
      return sortedMyRooms.filter((r) => r.status === 'MATCHED');
    }
    if (myMatchFilter === 'SEEKING') {
      return sortedMyRooms.filter((r) => r.status === 'OPEN');
    }
    if (myMatchFilter === 'FINISHED') {
      return sortedMyRooms.filter((r) => r.status === 'RESULT_FINAL');
    }
    return sortedMyRooms;
  }, [sortedMyRooms, myMatchFilter]);

  const currentRooms = activeTab === 'ALL_ROOMS' ? publicRooms : filteredMyRooms;
  const isLoading = activeTab === 'ALL_ROOMS' ? publicLoading : myLoading;

  const sports = [
    { id: undefined, name: 'Tất cả môn', icon: 'apps-outline', lib: 'ionicons' },
    { id: '1', name: 'Bóng đá', icon: 'football-outline', lib: 'ionicons' },
    { id: '2', name: 'Cầu lông', icon: 'badminton', lib: 'material' },
    { id: '3', name: 'Pickleball', icon: 'tennisball-outline', lib: 'ionicons' },
    { id: '4', name: 'Bóng rổ', icon: 'basketball-outline', lib: 'ionicons' },
  ];

  const matchTypes = [
    { id: 'ALL', label: 'Tất cả kèo' },
    { id: 'RANKED', label: 'Xếp hạng CRP' },
    { id: 'FRIENDLY', label: 'Giao hữu' },
  ];

  const sortOptions: { id: MatchmakingSortOption; label: string; icon: any }[] = [
    { id: 'BALANCE_FIRST', label: 'Cân kèo nhất', icon: 'flash' },
    { id: 'HIGHEST_CRP', label: 'CRP cao nhất', icon: 'trophy' },
    { id: 'NEAREST', label: 'Gần tôi nhất', icon: 'navigate' },
  ];

  const myMatchStatusTabs: { id: typeof myMatchFilter; label: string; icon: any; count?: number }[] = [
    { id: 'ALL', label: 'Tất cả', icon: 'layers-outline', count: sortedMyRooms.length },
    { id: 'ACTION_REQUIRED', label: 'Cần xử lý', icon: 'time-outline', count: actionRequiredCount },
    { id: 'UPCOMING', label: 'Sắp đấu', icon: 'shield-checkmark-outline' },
    { id: 'SEEKING', label: 'Tìm đối thủ', icon: 'search-outline' },
    { id: 'FINISHED', label: 'Đã hoàn thành', icon: 'trophy-outline' },
  ];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── 1. Top Header Bar ── */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={COLORS.onSurface} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Sàn ghép kèo thể thao</Text>
            <View style={styles.headerBadgeContainer}>
              <View style={styles.liveDot} />
              <Text style={styles.headerBadgeText}>
                {activeTab === 'ALL_ROOMS'
                  ? `${publicRooms.length} kèo đang mở`
                  : `${sortedMyRooms.length} trận đấu của tôi`}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => (activeTab === 'ALL_ROOMS' ? refetchPublic() : refetchMyMatches())}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={18} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>

        {/* ── 2. Segmented Tabs: Sàn Tìm Kèo vs Trận Của Tôi ── */}
        <View style={styles.tabBarContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('ALL_ROOMS')}
            style={[styles.tabBtn, activeTab === 'ALL_ROOMS' && styles.tabBtnActive]}
          >
            <Ionicons
              name="flame"
              size={16}
              color={activeTab === 'ALL_ROOMS' ? COLORS.primary : '#64748B'}
            />
            <Text style={[styles.tabBtnText, activeTab === 'ALL_ROOMS' && styles.tabBtnTextActive]}>
              Sàn Tìm Đối Thủ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={async () => {
              const session = await loadNativeUserSessionAsync();
              if (!session.isAuthenticated) {
                setAuthModalVisible(true);
                return;
              }
              setActiveTab('MY_MATCHES');
              refetchMyMatches();
            }}
            style={[styles.tabBtn, activeTab === 'MY_MATCHES' && styles.tabBtnActive]}
          >
            <Ionicons
              name="calendar"
              size={15}
              color={activeTab === 'MY_MATCHES' ? COLORS.primary : '#64748B'}
            />
            <Text style={[styles.tabBtnText, activeTab === 'MY_MATCHES' && styles.tabBtnTextActive]}>
              Trận Đấu Của Tôi
            </Text>
            {sortedMyRooms.length > 0 && (
              <View style={[styles.tabBadge, actionRequiredCount > 0 && styles.tabBadgeAction]}>
                <Text style={styles.tabBadgeNum}>
                  {actionRequiredCount > 0 ? `${actionRequiredCount}!` : sortedMyRooms.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 3. Controls & Content List ── */}
      <View style={styles.mainContainer}>
        {activeTab === 'ALL_ROOMS' ? (
          <View style={styles.filterSection}>
            {/* Sport Category Horizontal Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sportScroll}
            >
              {sports.map((sp) => {
                const isSelected = filters.sportId === sp.id;
                return (
                  <TouchableOpacity
                    key={sp.id || 'all'}
                    activeOpacity={0.8}
                    onPress={() => setFilters({ ...filters, sportId: sp.id })}
                    style={[styles.sportPill, isSelected && styles.sportPillActive]}
                  >
                    {sp.lib === 'material' ? (
                      <MaterialCommunityIcons
                        name="badminton"
                        size={15}
                        color={isSelected ? '#FFFFFF' : '#64748B'}
                      />
                    ) : (
                      <Ionicons
                        name={sp.icon as any}
                        size={15}
                        color={isSelected ? '#FFFFFF' : '#64748B'}
                      />
                    )}
                    <Text style={[styles.sportPillText, isSelected && styles.sportPillTextActive]}>
                      {sp.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Match Type & Sort Combined Filter Bar */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subFilterScroll}
            >
              {matchTypes.map((mt) => {
                const isSelected = (filters.matchType || 'ALL') === mt.id;
                return (
                  <TouchableOpacity
                    key={mt.id}
                    onPress={() => setFilters({ ...filters, matchType: mt.id as any })}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                      {mt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.vDivider} />

              {sortOptions.map((so) => {
                const isSelected = sortOption === so.id;
                return (
                  <TouchableOpacity
                    key={so.id}
                    onPress={() => setSortOption(so.id)}
                    style={[styles.sortChip, isSelected && styles.sortChipActive]}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={so.icon}
                      size={12}
                      color={isSelected ? COLORS.primary : '#64748B'}
                    />
                    <Text style={[styles.sortChipText, isSelected && styles.sortChipTextActive]}>
                      {so.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          /* Sub-status filter bar for "Trận Đấu Của Tôi" */
          <View style={styles.myMatchFilterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.myMatchFilterScroll}
            >
              {myMatchStatusTabs.map((tab) => {
                const isSelected = myMatchFilter === tab.id;
                const isActionReq = tab.id === 'ACTION_REQUIRED' && (tab.count || 0) > 0;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    activeOpacity={0.8}
                    onPress={() => setMyMatchFilter(tab.id)}
                    style={[
                      styles.myMatchFilterPill,
                      isSelected && styles.myMatchFilterPillActive,
                      isActionReq && !isSelected && styles.myMatchFilterPillAction,
                    ]}
                  >
                    <Ionicons
                      name={tab.icon}
                      size={13}
                      color={isSelected ? '#FFFFFF' : isActionReq ? '#EA580C' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.myMatchFilterText,
                        isSelected && styles.myMatchFilterTextActive,
                        isActionReq && !isSelected && styles.myMatchFilterTextAction,
                      ]}
                    >
                      {tab.label}
                    </Text>
                    {tab.id === 'ACTION_REQUIRED' && (tab.count || 0) > 0 && (
                      <View style={[styles.myMatchCountBadge, isSelected && styles.myMatchCountBadgeActive]}>
                        <Text style={[styles.myMatchCountText, isSelected && styles.myMatchCountTextActive]}>
                          {tab.count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── 4. Main Content List or Empty States ── */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang cập nhật danh sách kèo đấu...</Text>
          </View>
        ) : currentRooms.length === 0 ? (
          <View style={styles.centerContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons
                name={activeTab === 'ALL_ROOMS' ? 'people-outline' : 'calendar-outline'}
                size={44}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'ALL_ROOMS'
                ? 'Chưa có bài tìm đối thủ phù hợp'
                : myMatchFilter === 'ACTION_REQUIRED'
                ? 'Không có trận đấu nào cần xử lý'
                : myMatchFilter === 'UPCOMING'
                ? 'Chưa có trận đấu nào sắp diễn ra'
                : myMatchFilter === 'SEEKING'
                ? 'Chưa có bài tìm đối thủ nào đang mở'
                : myMatchFilter === 'FINISHED'
                ? 'Chưa có trận đấu nào đã hoàn thành'
                : 'Bạn chưa tham gia trận đấu nào'}
            </Text>
            <Text style={styles.emptySub}>
              {activeTab === 'ALL_ROOMS'
                ? 'Hãy là đội đầu tiên tạo bài ghép kèo cho môn thể thao này để tìm đối thủ xứng tầm!'
                : myMatchFilter === 'ACTION_REQUIRED'
                ? 'Tất cả các trận đấu của bạn đều đã được cập nhật hoặc xác nhận đầy đủ!'
                : 'Tạo phòng hoặc gửi yêu cầu ghép trận để bắt đầu so tài và tính điểm xếp hạng!'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={async () => {
                const session = await loadNativeUserSessionAsync();
                if (!session.isAuthenticated) {
                  setAuthModalVisible(true);
                  return;
                }
                router.push('/matchmaking/create' as any);
              }}
              style={styles.emptyCta}
            >
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.emptyCtaText}>Tạo bài ghép kèo ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={currentRooms}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={() => (activeTab === 'ALL_ROOMS' ? refetchPublic() : refetchMyMatches())}
            refreshing={isLoading}
            renderItem={({ item }) => (
              <MatchCard
                room={item}
                isMyMatchView={activeTab === 'MY_MATCHES'}
                onPress={() => router.push(`/matchmaking/${item.id}` as any)}
              />
            )}
          />
        )}
      </View>

      {/* ── 5. Floating Action Button (FAB) ── */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={async () => {
          const session = await loadNativeUserSessionAsync();
          if (!session.isAuthenticated) {
            setAuthModalVisible(true);
            return;
          }
          router.push('/matchmaking/create' as any);
        }}
        style={styles.fab}
      >
        <Ionicons name="add" size={22} color="#FFFFFF" />
        <Text style={styles.fabText}>Tạo bài mới</Text>
      </TouchableOpacity>

      {/* Auth Required Guard */}
      <AuthRequiredModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        actionTitle="Đăng nhập để ghép kèo thi đấu"
        actionDescription="Vui lòng đăng nhập tài khoản Sporta để tạo bài tìm đối thủ, xem trận đấu của bạn hoặc gửi yêu cầu ghép trận."
        actionIcon="trophy"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    gap: 2,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 16.5,
  },
  headerBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  headerBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  tabBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: 8,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    borderColor: COLORS.primary,
  },
  tabBtnText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  tabBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BORDER_RADIUS.full,
  },
  tabBadgeAction: {
    backgroundColor: '#EA580C',
  },
  tabBadgeNum: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  myMatchFilterSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
  },
  myMatchFilterScroll: {
    paddingHorizontal: SPACING.md,
    gap: 6,
    alignItems: 'center',
  },
  myMatchFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  myMatchFilterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  myMatchFilterPillAction: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  myMatchFilterText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  myMatchFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  myMatchFilterTextAction: {
    color: '#EA580C',
    fontWeight: '800',
  },
  myMatchCountBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  myMatchCountBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  myMatchCountText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  myMatchCountTextActive: {
    color: COLORS.primary,
  },
  mainContainer: {
    flex: 1,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 8,
    gap: 8,
  },
  sportScroll: {
    paddingHorizontal: SPACING.md,
    gap: 6,
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sportPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sportPillText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  sportPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  subFilterScroll: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    borderColor: COLORS.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  vDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortChipActive: {
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    borderColor: COLORS.primary,
  },
  sortChipText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: 6,
    paddingBottom: 90,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#64748B',
    fontSize: 13,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    fontSize: 16,
  },
  emptySub: {
    ...TYPOGRAPHY.bodySm,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    fontSize: 12.5,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyCtaText: {
    ...TYPOGRAPHY.labelMd,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    ...TYPOGRAPHY.labelMd,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13.5,
  },
});
