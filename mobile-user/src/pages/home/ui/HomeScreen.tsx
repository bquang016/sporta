import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { SearchBar } from '../../../features/search-bar';
import { SportCategories } from '../../../features/sport-categories';
import { AuthCtaBanner } from '../../../features/auth-cta';
import { FacilityCard } from '../../../entities/facility';
import { TicketSessionCard } from '../../../features/ticket-sessions/ui/TicketSessionCard';

export function HomeScreen() {
  const {
    router,
    isAuthenticated,
    userName,
    userAvatar,
    facilities,
    facilitiesLoading,
    facilitiesError,
    ticketSessions,
    ticketSessionsLoading,
    ticketSessionsError,
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
          onPress={() => router.push('/search')}
          onFilterPress={() => router.push({ pathname: '/search', params: { openFilter: 'true' } })}
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
              <Text style={styles.sectionTitle}>Sân Chơi Xé Vé</Text>
              <TouchableOpacity
                onPress={() => router.push('/ticket-sessions' as any)}
                style={styles.seeMoreButton}
                activeOpacity={0.7}
              >
                <Text style={styles.seeMoreText}>Xem tất cả</Text>
                <MaterialIcons name="arrow-forward" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.matchList}>
              {ticketSessionsLoading ? (
                <Text style={styles.loadingText}>Đang tải danh sách ca xé vé...</Text>
              ) : ticketSessionsError ? (
                <Text style={[styles.loadingText, { color: COLORS.error }]}>{ticketSessionsError}</Text>
              ) : ticketSessions.length === 0 ? (
                <Text style={styles.loadingText}>Chưa có ca xé vé nào đang mở</Text>
              ) : (
                ticketSessions.slice(0, 4).map((session) => (
                  <TicketSessionCard
                    key={session.id}
                    session={session}
                    onPress={() => router.push(`/ticket-sessions/${session.id}` as any)}
                    onBuyPress={() => router.push(`/ticket-sessions/${session.id}` as any)}
                  />
                ))
              )}
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
