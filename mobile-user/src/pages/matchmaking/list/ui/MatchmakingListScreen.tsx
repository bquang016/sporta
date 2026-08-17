import React from 'react';
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
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useMatchmakingList } from '../../../../features/matchmaking/model/useMatchmaking';
import { MatchCard } from '../../../../features/matchmaking/ui/MatchCard';
import { MatchmakingSortOption } from '../../../../entities/match/model/match.types';

export function MatchmakingListScreen() {
  const router = useRouter();
  const { rooms, loading, filters, setFilters, sortOption, setSortOption } = useMatchmakingList();

  const sports = [
    { id: undefined, name: 'Tất cả môn', icon: 'grid-outline' },
    { id: 'football', name: 'Bóng đá', icon: 'football-outline' },
    { id: 'badminton', name: 'Cầu lông', icon: 'tennisball-outline' },
    { id: 'basketball', name: 'Bóng rổ', icon: 'basketball-outline' },
  ];

  const matchTypes = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'RANKED', label: '🏆 Xếp hạng (CRP)' },
    { id: 'FRIENDLY', label: '🤝 Giao hữu' },
  ];

  const sortOptions: { id: MatchmakingSortOption; label: string }[] = [
    { id: 'BALANCE_FIRST', label: '⚡ Cân kèo nhất' },
    { id: 'HIGHEST_CRP', label: '🏆 CRP cao nhất' },
    { id: 'NEAREST', label: '📍 Gần tôi' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Top Header Bar (Social Style) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.onSurface} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Ghép Kèo Tìm Đối Thủ</Text>
          <View style={styles.headerBadgeContainer}>
            <View style={styles.liveDot} />
            <Text style={styles.headerBadgeText}>{rooms.length} trận đang mở</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/matchmaking/create' as any)}
          style={styles.createHeaderBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={18} color={COLORS.white} />
          <Text style={styles.createHeaderBtnText}>Đăng bài</Text>
        </TouchableOpacity>
      </View>

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

      {/* Main Content List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang cập nhật bài viết mới...</Text>
        </View>
      ) : rooms.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="people-outline" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có bài tìm đối thủ phù hợp</Text>
          <Text style={styles.emptySub}>Hãy là người đầu tiên tạo bài ghép kèo cho môn thể thao này!</Text>

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
          data={rooms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <MatchCard
              room={item}
              onPress={() => router.push(`/matchmaking/${item.id}` as any)}
            />
          )}
        />
      )}

      {/* Floating Action Button (Social Style FAB) */}
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
  headerTitleContainer: {
    alignItems: 'center',
    gap: 2,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 17,
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
  createHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createHeaderBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
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
