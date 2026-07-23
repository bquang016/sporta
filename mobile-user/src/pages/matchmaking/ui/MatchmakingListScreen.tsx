import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { matchmakingApi, MatchRoom } from '../../../shared/api/matchmaking';
import { SelectClubSheet, UserClubItem } from '../components/SelectClubSheet';

// Available Sports with Emojis & Material Icons
const SPORTS_LIST = [
  { id: 'ALL', name: 'Tất cả', emoji: '🏆', iconName: 'emoji-events' },
  { id: '1', name: 'Bóng đá', emoji: '⚽', iconName: 'sports-soccer' },
  { id: '2', name: 'Bóng rổ', emoji: '🏀', iconName: 'sports-basketball' },
  { id: '3', name: 'Cầu lông', emoji: '🏸', iconName: 'sports-tennis' },
  { id: '4', name: 'Pickleball', emoji: '🏓', iconName: 'sports-cricket' },
  { id: '5', name: 'Tennis', emoji: '🎾', iconName: 'sports-tennis' },
];

const SPORT_FORMATS: Record<string, string[]> = {
  'Tất cả': ['Tất cả', '5v5', '7v7', '11v11', '3x3', 'Đơn', 'Đôi'],
  'Bóng đá': ['Tất cả', '5v5', '7v7', '11v11'],
  'Bóng rổ': ['Tất cả', '3x3', '5v5'],
  'Cầu lông': ['Tất cả', 'Đơn nam', 'Đôi nam', 'Đôi nam nữ'],
  'Pickleball': ['Tất cả', 'Đơn', 'Đôi'],
  'Tennis': ['Tất cả', 'Đơn', 'Đôi'],
};

// Mock User's Joined Clubs for testing multi-club sheet
const MOCK_USER_CLUBS: UserClubItem[] = [
  { id: 1, name: 'CLB Bóng đá Alpha', sportName: 'Bóng đá', sportEmoji: '⚽', crp: 120, memberCount: 15 },
  { id: 2, name: 'CLB Cầu lông SuperHit', sportName: 'Cầu lông', sportEmoji: '🏸', crp: 150, memberCount: 8 },
];

export function MatchmakingListScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const insets = useSafeAreaInsets();

  // FAB pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const [rooms, setRooms] = useState<MatchRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAID_100' | 'DEPOSIT_HOLD'>('ALL');
  
  // Filters
  const [selectedSport, setSelectedSport] = useState('Tất cả');
  const [selectedFormat, setSelectedFormat] = useState('Tất cả');
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);

  // Multi-Club Sheet State
  const [showClubSheet, setShowClubSheet] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await matchmakingApi.getOpenMatchRooms();
      setRooms(data);
    } catch (error) {
      console.log('Error fetching match rooms:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoomPress = () => {
    if (MOCK_USER_CLUBS.length >= 2) {
      setShowClubSheet(true);
    } else {
      const defaultClub = MOCK_USER_CLUBS[0];
      navigation?.navigate('CreateMatchRoom', { club: defaultClub });
    }
  };

  const handleSelectClubToCreate = (club: UserClubItem) => {
    navigation?.navigate('CreateMatchRoom', { club });
  };

  const filteredRooms = rooms.filter(room => {
    if (selectedSport !== 'Tất cả' && room.sportName !== selectedSport) return false;
    if (activeTab !== 'ALL' && room.flowType !== activeTab) return false;
    if (selectedFormat !== 'Tất cả' && room.format !== selectedFormat) return false;
    if (selectedRadius !== null && room.distanceKm && room.distanceKm > selectedRadius) return false;
    return true;
  });

  const availableFormats = SPORT_FORMATS[selectedSport] || ['Tất cả'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Top Header — clean, no button to avoid clipping */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => navigation?.goBack?.()}
              activeOpacity={0.7}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Phòng Chờ Giao Hữu</Text>
              <Text style={styles.subTitle}>Ghép trận 5/5 & Đua top CRP</Text>
            </View>
          </View>
        </View>

        {/* Main Flow Tabs */}
        <View style={styles.tabBarWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'ALL' && styles.activeTabItem]}
              onPress={() => setActiveTab('ALL')}
            >
              <Text style={[styles.tabText, activeTab === 'ALL' && styles.activeTabText]}>Tất cả ({rooms.length})</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'PAID_100' && styles.activeTabItem]}
              onPress={() => setActiveTab('PAID_100')}
            >
              <Text style={[styles.tabText, activeTab === 'PAID_100' && styles.activeTabText]}>Đã chốt sân (100%)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'DEPOSIT_HOLD' && styles.activeTabItem]}
              onPress={() => setActiveTab('DEPOSIT_HOLD')}
            >
              <Text style={[styles.tabText, activeTab === 'DEPOSIT_HOLD' && styles.activeTabText]}>Ghép cọc giữ chỗ</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Filter Section: Sport Category Pills & Sub-Filters */}
        <View style={styles.filtersSection}>
          {/* Sport Category Icon Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sportChipRow}>
            {SPORTS_LIST.map((s) => {
              const isSelected = selectedSport === s.name;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.sportPill, isSelected && styles.activeSportPill]}
                  onPress={() => {
                    setSelectedSport(s.name);
                    setSelectedFormat('Tất cả');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.sportIconCircle, isSelected && styles.activeSportIconCircle]}>
                    <Text style={styles.sportEmoji}>{s.emoji}</Text>
                  </View>
                  <Text style={[styles.sportPillLabel, isSelected && styles.activeSportPillLabel]}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Radius & Format Sub-Filters (Clean & Airy Layout) */}
          <View style={styles.subFilterBox}>
            {/* Radius Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subFilterRow}>
              <Text style={styles.filterGroupLabel}>Bán kính:</Text>
              {[
                { label: 'Tất cả', value: null },
                { label: '1 km', value: 1 },
                { label: '3 km', value: 3 },
                { label: '5 km', value: 5 },
                { label: '10 km', value: 10 },
              ].map((r) => (
                <TouchableOpacity
                  key={r.label}
                  style={[styles.filterChip, selectedRadius === r.value && styles.activeFilterChip]}
                  onPress={() => setSelectedRadius(r.value)}
                >
                  <Text style={[styles.filterChipText, selectedRadius === r.value && styles.activeFilterChipText]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Format Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subFilterRow}>
              <Text style={styles.filterGroupLabel}>Thể thức:</Text>
              {availableFormats.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, selectedFormat === f && styles.activeFilterChip]}
                  onPress={() => setSelectedFormat(f)}
                >
                  <Text style={[styles.filterChipText, selectedFormat === f && styles.activeFilterChipText]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Match Rooms List */}
        {loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchRooms();
                }}
              />
            }
          >
            {filteredRooms.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBg}>
                  <MaterialIcons name="sports-soccer" size={48} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyTitle}>Chưa có phòng giao hữu nào</Text>
                <Text style={styles.emptySubtitle}>
                  Không tìm thấy phòng {selectedSport !== 'Tất cả' ? selectedSport : ''} phù hợp với bộ lọc hiện tại.
                </Text>
              </View>
            ) : (
              filteredRooms.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={styles.card}
                  activeOpacity={0.9}
                  onPress={() => navigation?.navigate('MatchRoomDetail', { roomId: room.id })}
                >
                  {/* Top Bar of Card */}
                  <View style={styles.cardHeader}>
                    <View style={styles.clubInfoRow}>
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{room.creatorClubName?.charAt(0)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.clubName} numberOfLines={1}>{room.creatorClubName}</Text>
                        <View style={styles.crpBadge}>
                          <MaterialIcons name="emoji-events" size={14} color={COLORS.secondary} />
                          <Text style={styles.crpText}>{room.creatorClubCrp ?? 100} CRP</Text>
                        </View>
                      </View>
                    </View>

                    <View style={[styles.badgePill, room.flowType === 'PAID_100' ? styles.badgePaid : styles.badgeHold]}>
                      <Text style={[styles.badgeText, room.flowType === 'PAID_100' ? styles.badgePaidText : styles.badgeHoldText]}>
                        {room.flowType === 'PAID_100' ? 'Đã Chốt Sân (100%)' : 'Cọc Hold Giữ Chỗ'}
                      </Text>
                    </View>
                  </View>

                  {/* Details Container */}
                  <View style={styles.detailsBox}>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="sports" size={16} color={COLORS.primary} />
                      <Text style={styles.detailText}>
                        Môn: <Text style={styles.boldText}>{room.sportName}</Text> ({room.format})
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialIcons name="schedule" size={16} color={COLORS.primary} />
                      <Text style={styles.detailText}>
                        {new Date(room.expectedStartTime).toLocaleString('vi-VN')}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialIcons name="location-on" size={16} color={COLORS.primary} />
                      <Text style={styles.detailText} numberOfLines={1}>
                        {room.venueName ? `${room.venueName} (${room.courtName})` : room.area}
                      </Text>
                    </View>

                    {room.distanceKm && (
                      <View style={styles.detailRow}>
                        <MaterialIcons name="near-me" size={16} color={COLORS.primary} />
                        <Text style={[styles.detailText, { color: COLORS.primary, fontWeight: '700' }]}>
                          Cách bạn: {room.distanceKm} km
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Footer of Card */}
                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.priceLabel}>Chi phí cưa đôi 5/5</Text>
                      <Text style={styles.priceAmount}>
                        {room.priceSharePerTeam ? `${room.priceSharePerTeam.toLocaleString()} đ/đội` : 'Thỏa thuận'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.ctaBtn}
                      activeOpacity={0.8}
                      onPress={() => navigation?.navigate('MatchRoomDetail', { roomId: room.id })}
                    >
                      <Text style={styles.ctaBtnText}>Xem Chi Tiết</Text>
                      <MaterialIcons name="arrow-forward" size={14} color={COLORS.onSecondary} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}

        {/* Multi-Club Sheet */}
        <SelectClubSheet
          visible={showClubSheet}
          onClose={() => setShowClubSheet(false)}
          onSelectClub={handleSelectClubToCreate}
        />

        {/* FAB — Floating Action Button: Tạo Phòng */}
        <Animated.View
          style={[
            styles.fab,
            { bottom: insets.bottom + 20, transform: [{ scale: pulseAnim }] },
          ]}
          pointerEvents="box-none"
        >
          {/* Pulsing halo ring behind FAB */}
          <Animated.View
            style={[
              styles.fabHalo,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({ inputRange: [1, 1.12], outputRange: [0.35, 0] }),
              },
            ]}
          />
          <TouchableOpacity
            style={styles.fabBtn}
            onPress={handleCreateRoomPress}
            activeOpacity={0.85}
          >
            <MaterialIcons name="add" size={26} color={COLORS.onSecondary} />
            <Text style={styles.fabText}>Tạo Phòng</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  backButton: {
    paddingRight: 4,
  },
  title: {
    fontFamily: TYPOGRAPHY.headlineLgMobile.fontFamily,
    fontSize: TYPOGRAPHY.headlineLgMobile.fontSize,
    fontWeight: TYPOGRAPHY.headlineLgMobile.fontWeight,
    color: COLORS.onSurface,
  },
  subTitle: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: TYPOGRAPHY.labelSm.fontSize,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  fabHalo: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
  },
  fabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 11,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
  fabText: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSecondary,
    letterSpacing: 0.3,
  },
  tabBarWrapper: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  tabContainer: {
    paddingHorizontal: SPACING.marginMobile,
    gap: SPACING.xs,
  },
  tabItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  activeTabItem: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  activeTabText: {
    color: COLORS.onPrimary,
    fontWeight: '700',
  },
  filtersSection: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  sportChipRow: {
    paddingHorizontal: SPACING.marginMobile,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  activeSportPill: {
    backgroundColor: COLORS.primaryOpacity10,
    borderColor: COLORS.primary,
  },
  sportIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSportIconCircle: {
    backgroundColor: COLORS.primary,
  },
  sportEmoji: {
    fontSize: 14,
  },
  sportPillLabel: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  activeSportPillLabel: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  subFilterBox: {
    gap: SPACING.xs,
  },
  subFilterRow: {
    paddingHorizontal: SPACING.marginMobile,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  filterGroupLabel: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.outline,
    marginRight: 4,
  },
  filterChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primaryOpacity10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  activeFilterChipText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    paddingBottom: 100,  // Extra space so FAB doesn't cover last card
    gap: SPACING.md,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontSize: TYPOGRAPHY.headlineMd.fontSize,
    fontWeight: TYPOGRAPHY.headlineMd.fontWeight,
    color: COLORS.onSurface,
  },
  emptySubtitle: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: TYPOGRAPHY.bodyMd.fontSize,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg, // 16px radius
    padding: SPACING.md, // 16px padding
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clubInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.onPrimary,
    fontWeight: '800',
    fontSize: 18,
  },
  clubName: {
    fontFamily: TYPOGRAPHY.titleMd.fontFamily,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  crpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  crpText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  badgePill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  badgePaid: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  badgeHold: {
    backgroundColor: COLORS.secondaryOpacity20,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  badgePaidText: {
    color: COLORS.primary,
  },
  badgeHoldText: {
    color: COLORS.onSecondaryContainer,
  },
  detailsBox: {
    backgroundColor: COLORS.surfaceContainerLow,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default, // 8px
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs,
  },
  priceLabel: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 12,
    color: COLORS.outline,
  },
  priceAmount: {
    fontFamily: TYPOGRAPHY.titleMd.fontFamily,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.secondary, // Athletic Yellow
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
  },
  ctaBtnText: {
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontSize: 13,
    color: COLORS.onSecondary,
    fontWeight: '800',
  },
});
