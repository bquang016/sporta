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
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useMatchmakingList, useMyMatches } from '../../../../features/matchmaking/model/useMatchmaking';
import { MatchCard } from '../../../../features/matchmaking/ui/MatchCard';
import { MatchmakingSortOption } from '../../../../entities/match/model/match.types';

export function MatchmakingListScreen() {
  const router = useRouter();

  // Tab State: 'ALL_ROOMS' (Sàn Chợ tìm đối thủ) | 'MY_MATCHES' (Trận đấu của tôi)
  const [activeTab, setActiveTab] = useState<'ALL_ROOMS' | 'MY_MATCHES'>('ALL_ROOMS');

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

  const currentRooms = activeTab === 'ALL_ROOMS' ? publicRooms : sortedMyRooms;
  const isLoading = activeTab === 'ALL_ROOMS' ? publicLoading : myLoading;

  const sports = [
    { id: undefined, name: 'Tất cả môn', icon: 'grid-outline' },
    { id: 'football', name: 'Bóng đá', icon: 'football-outline' },
    { id: 'badminton', name: 'Cầu lông', icon: 'tennisball-outline' },
    { id: 'basketball', name: 'Bóng rổ', icon: 'basketball-outline' },
  ];

  const matchTypes = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'RANKED', label: 'Xếp hạng (CRP)' },
    { id: 'FRIENDLY', label: 'Giao hữu' },
  ];

  const sortOptions: { id: MatchmakingSortOption; label: string }[] = [
    { id: 'BALANCE_FIRST', label: 'Cân kèo nhất' },
    { id: 'HIGHEST_CRP', label: 'CRP cao nhất' },
    { id: 'NEAREST', label: 'Gần tôi' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.onSurface} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Ghép Kèo Matchmaking</Text>
            <View style={styles.headerBadgeContainer}>
              <View style={styles.liveDot} />
              <Text style={styles.headerBadgeText}>
                {activeTab === 'ALL_ROOMS' ? `${publicRooms.length} phòng tìm đối thủ` : `${sortedMyRooms.length} trận đấu của tôi`}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => (activeTab === 'ALL_ROOMS' ? refetchPublic() : refetchMyMatches())}
            style={styles.headerIconBtn}
          >
            <Ionicons name="refresh-outline" size={18} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>

        {/* Top Segmented Tab Switcher - Fixed Overflow */}
        <View style={styles.tabBarContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setActiveTab('ALL_ROOMS')}
            style={[styles.tabBtn, activeTab === 'ALL_ROOMS' && styles.tabBtnActive]}
          >
            <Ionicons
              name="planet-outline"
              size={15}
              color={activeTab === 'ALL_ROOMS' ? COLORS.primary : COLORS.onSurfaceVariant}
            />
            <Text
              style={[styles.tabBtnText, activeTab === 'ALL_ROOMS' && styles.tabBtnTextActive]}
              numberOfLines={1}
            >
              Sàn Tìm Đối Thủ
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setActiveTab('MY_MATCHES');
              refetchMyMatches();
            }}
            style={[styles.tabBtn, activeTab === 'MY_MATCHES' && styles.tabBtnActive]}
          >
            <Ionicons
              name="calendar-outline"
              size={15}
              color={activeTab === 'MY_MATCHES' ? COLORS.primary : COLORS.onSurfaceVariant}
            />
            <Text
              style={[styles.tabBtnText, activeTab === 'MY_MATCHES' && styles.tabBtnTextActive]}
              numberOfLines={1}
            >
              Trận Đấu Của Tôi
            </Text>
            {sortedMyRooms.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeNum}>{sortedMyRooms.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Responsive Middle Wrapper */}
      <View style={styles.responsiveWrapper}>
        {activeTab === 'ALL_ROOMS' && (
          <>
            {/* Sport Category Horizontal Pills */}
            <View style={styles.sportBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sportScroll}>
                {sports.map((sp) => {
                  const isSelected = filters.sportId === sp.id;
                  return (
                    <TouchableOpacity
                      key={sp.id || 'all'}
                      activeOpacity={0.8}
                      onPress={() => setFilters({ ...filters, sportId: sp.id })}
                      style={[styles.sportPill, isSelected && styles.sportPillActive]}
                    >
                      <Ionicons
                        name={sp.icon as any}
                        size={15}
                        color={isSelected ? COLORS.white : COLORS.onSurfaceVariant}
                      />
                      <Text style={[styles.sportPillText, isSelected && styles.sportPillTextActive]}>
                        {sp.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Filter & Sort Bar */}
            <View style={styles.filterBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {matchTypes.map((mt) => {
                  const isSelected = (filters.matchType || 'ALL') === mt.id;
                  return (
                    <TouchableOpacity
                      key={mt.id}
                      onPress={() => setFilters({ ...filters, matchType: mt.id as any })}
                      style={[styles.filterChip, isSelected && styles.filterChipActive]}
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
                    >
                      <Text style={[styles.sortChipText, isSelected && styles.sortChipTextActive]}>
                        {so.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </>
        )}

        {/* Main Content List */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang cập nhật danh sách bài ghép...</Text>
          </View>
        ) : currentRooms.length === 0 ? (
          <View style={styles.centerContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons
                name={activeTab === 'ALL_ROOMS' ? 'people-outline' : 'calendar-outline'}
                size={40}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'ALL_ROOMS' ? 'Chưa có bài tìm đối thủ phù hợp' : 'Bạn chưa có trận đấu nào'}
            </Text>
            <Text style={styles.emptySub}>
              {activeTab === 'ALL_ROOMS'
                ? 'Hãy là người đầu tiên tạo bài ghép kèo cho môn thể thao này!'
                : 'Tạo phòng hoặc gửi yêu cầu ghép trận để bắt đầu tham gia thi đấu!'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/matchmaking/create' as any)}
              style={styles.emptyCta}
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
              <Text style={styles.emptyCtaText}>Đăng bài tìm đối thủ ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={currentRooms}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
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

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => router.push('/matchmaking/create' as any)}
        style={styles.fab}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
        <Text style={styles.fabText}>Tạo bài mới</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  headerInner: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: 10,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
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
    gap: 4,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  headerBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 10.5,
  },
  tabBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: 8,
    gap: 8,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(6, 78, 59, 0.09)',
    borderColor: COLORS.primary,
  },
  tabBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12.5,
    flexShrink: 1,
  },
  tabBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  tabBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.full,
  },
  tabBadgeNum: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 10,
  },
  responsiveWrapper: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  sportBar: {
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  sportScroll: {
    paddingHorizontal: SPACING.marginMobile,
    gap: 8,
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  sportPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sportPillText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
  },
  sportPillTextActive: {
    color: COLORS.white,
    fontWeight: '800',
  },
  filterBar: {
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
  },
  filterScroll: {
    paddingHorizontal: SPACING.marginMobile,
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
  },
  filterChipActive: {
    backgroundColor: 'rgba(6, 78, 59, 0.12)',
  },
  filterChipText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  vDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.outlineVariant,
    marginHorizontal: 4,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
  },
  sortChipActive: {
    backgroundColor: '#FEF3C7',
  },
  sortChipText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  sortChipTextActive: {
    color: '#92400E',
    fontWeight: '800',
  },
  listContent: {
    padding: SPACING.marginMobile,
    paddingBottom: 90,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.xl,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
    fontSize: 16,
  },
  emptySub: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyCtaText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: SPACING.marginMobile,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
});
