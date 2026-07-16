import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { SearchBar } from '../../../features/search-bar';
import { SportCategories } from '../../../features/sport-categories';
import { AuthCtaBanner } from '../../../features/auth-cta';
import { FacilityCard } from '../../../entities/facility';
import { MatchCard, Match } from '../../../entities/match';

import { useHomeScreen } from '../hooks/useHomeScreen';
import { Header } from '../components/Header';
import { PromoCarousel } from '../components/PromoCarousel';
import { ActionGrid } from '../components/ActionGrid';
import { MatchInvitations } from '../components/MatchInvitations';
import { FadeInSection } from '../components/AnimationHelpers';

const HOT_MATCHES: Match[] = [
  {
    id: 'match-1',
    title: 'Sân Green Field',
    time: '18:00 - 20:00 • Hôm nay',
    elo: 'Bán chuyên',
    eloType: 'gold',
    sportIcon: 'sports-soccer',
    joinedCount: 7,
    maxCount: 10,
    statusText: 'Còn 3 chỗ',
    statusType: 'active',
    location: '12 Duy Tân, Cầu Giấy',
    distance: '2.5km',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c29jY2VyfGVufDB8fDB8fHww',
  },
  {
    id: 'match-2',
    title: 'Hoop Heaven Park',
    time: '20:30 - 22:30 • Hôm nay',
    elo: 'Trung bình',
    eloType: 'silver',
    sportIcon: 'sports-basketball',
    joinedCount: 12,
    maxCount: 12,
    statusText: 'HẾT CHỖ',
    statusType: 'full',
    location: '34 Lê Văn Lương, Thanh Xuân',
    distance: '3.1km',
    imageUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'match-3',
    title: 'Sân CMC Đại học',
    time: '17:00 - 19:00 • Ngày mai',
    elo: 'Yếu',
    eloType: 'silver',
    sportIcon: 'sports-tennis',
    joinedCount: 3,
    maxCount: 4,
    statusText: 'Còn 1 chỗ',
    statusType: 'active',
    location: 'Đại học Quốc Gia, Cầu Giấy',
    distance: '1.8km',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=150&auto=format&fit=crop&q=80',
  },
];

export function HomeScreen() {
  const {
    isAuthenticated,
    userName,
    userAvatar,
    facilities,
    facilitiesLoading,
    facilitiesError,
    handleFacilityPress,
    handleLoginPress,
    handleRegisterPress,
    handleAvatarPress,
    getGreeting,
  } = useHomeScreen();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* ── Header ── */}
      <Header
        isAuthenticated={isAuthenticated}
        userName={userName}
        userAvatar={userAvatar}
        getGreeting={getGreeting}
        handleAvatarPress={handleAvatarPress}
      />

      {/* ── Scrollable Content ── */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Search Bar */}
        <SearchBar
          onPress={() => useHomeScreen().router.push('/search')}
          onFilterPress={() => useHomeScreen().router.push({ pathname: '/search', params: { openFilter: 'true' } })}
        />

        {/* Sport Categories — compact chips */}
        <SportCategories onCategorySelect={(id) => console.log('Select category:', id)} />

        {/* Auth CTA Banner (Only show if guest) */}
        {!isAuthenticated && (
          <FadeInSection delay={100}>
            <AuthCtaBanner onLoginPress={handleLoginPress} onRegisterPress={handleRegisterPress} />
          </FadeInSection>
        )}

        {/* ── Bảng tin khuyến mãi, lịch trình, sự kiện chạy ngang ── */}
        <FadeInSection delay={150}>
          <PromoCarousel />
        </FadeInSection>

        {/* ── Bắt đầu ngay - Action Grid ── */}
        <FadeInSection delay={200}>
          <ActionGrid isAuthenticated={isAuthenticated} />
        </FadeInSection>

        {/* ── Ghép kèo đá (kèm button Ghép kèo nhanh tích hợp) ── */}
        <FadeInSection delay={250}>
          <MatchInvitations />
        </FadeInSection>

        {/* ── Sân gần bạn ── */}
        <FadeInSection delay={300}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sân gần bạn</Text>
              <TouchableOpacity
                onPress={() => console.log('See more')}
                style={styles.seeMoreButton}
                activeOpacity={0.7}
              >
                <Text style={styles.seeMoreText}>Xem thêm</Text>
                <MaterialIcons name="arrow-forward" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
              decelerationRate="fast"
            >
              {facilitiesLoading ? (
                <Text style={styles.loadingText}>Đang tải danh sách sân...</Text>
              ) : facilitiesError ? (
                <Text style={[styles.loadingText, { color: COLORS.error }]}>{facilitiesError}</Text>
              ) : facilities.length === 0 ? (
                <Text style={styles.loadingText}>Chưa có sân nào</Text>
              ) : (
                facilities.map((facility) => (
                  <View key={facility.id} style={styles.cardContainer}>
                    <FacilityCard
                      facility={facility}
                      onPress={() => handleFacilityPress(facility.id)}
                      onBookPress={() => handleFacilityPress(facility.id)}
                    />
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </FadeInSection>

        {/* ── Sân chơi xé vé ── */}
        <FadeInSection delay={350}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isAuthenticated ? 'Sân Chơi Xé Vé' : 'Trận đấu hot'}
              </Text>
              <TouchableOpacity
                onPress={() => console.log('See all matches')}
                style={styles.seeMoreButton}
                activeOpacity={0.7}
              >
                <Text style={styles.seeMoreText}>Xem tất cả</Text>
                <MaterialIcons name="arrow-forward" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.matchList}>
              {HOT_MATCHES.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onPress={() => console.log('View match detail:', match.id)}
                  onJoinPress={() => console.log('Join match:', match.id)}
                />
              ))}
            </View>
          </View>
        </FadeInSection>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.sm,
    paddingBottom: 110,
    gap: SPACING.md,
  },
  section: {
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  seeMoreText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity06,
  },
  filterDropdownText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
  },
  horizontalScroll: {
    paddingRight: SPACING.marginMobile,
    gap: SPACING.sm,
  },
  cardContainer: {
    marginVertical: SPACING.xs,
  },
  matchList: {
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    padding: SPACING.md,
  },
});

export default HomeScreen;
