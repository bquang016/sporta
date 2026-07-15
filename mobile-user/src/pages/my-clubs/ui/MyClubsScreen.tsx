import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import { useClubs, ClubCard, SportsFilter } from '../../../entities/club';

export function MyClubsScreen() {
  const router = useRouter();
  const { clubs, joinedIds, loading, joinedClubs, refreshClubs } = useClubs();
  const [selectedSport, setSelectedSport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let sportId: number | undefined;
      if (selectedSport === 'football') sportId = 1;
      else if (selectedSport === 'badminton') sportId = 2;
      else if (selectedSport === 'pickleball') sportId = 3;
      else if (selectedSport === 'basketball') sportId = 4;

      refreshClubs(sportId, searchQuery);
    }, [selectedSport, searchQuery])
  );

  const filteredJoinedClubs = joinedClubs.filter(club => {
    // Filter by search query
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          club.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          club.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by selected sport
    const matchesSport = selectedSport === 'all' || 
      (selectedSport === 'football' && club.sport === 'Bóng đá') ||
      (selectedSport === 'basketball' && club.sport === 'Bóng rổ') ||
      (selectedSport === 'badminton' && club.sport === 'Cầu lông') ||
      (selectedSport === 'pickleball' && club.sport === 'Pickleball');

    return matchesSearch && matchesSport;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Header wrapper to color the status bar and notch area white */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={() => router.replace('/(tabs)/clubs')}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            Câu lạc bộ của tôi
          </Text>
          <Button
            variant="primary"
            size="sm"
            icon="add"
            title="Tạo CLB"
            textStyle={styles.createBtnText}
            style={styles.createBtn}
            onPress={() => router.push('/create-club')}
          />
        </View>
      </SafeAreaView>

      {/* Sports Filter Section */}
      <View style={styles.filterSection}>
        {/* Search Bar */}
        <View style={[
          styles.searchContainer,
          isSearchFocused && styles.searchContainerFocused
        ]}>
          <MaterialIcons name="search" size={20} color={COLORS.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên CLB hoặc môn thể thao..."
            placeholderTextColor={COLORS.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="cancel" size={20} color={COLORS.outline} />
            </TouchableOpacity>
          ) : null}
        </View>

        <SportsFilter 
          selectedSport={selectedSport} 
          onSelectSport={setSelectedSport} 
        />
      </View>

      {/* Clubs List */}
      <ScrollView 
        contentContainerStyle={styles.scrollList} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              let sportId: number | undefined;
              if (selectedSport === 'football') sportId = 1;
              else if (selectedSport === 'badminton') sportId = 2;
              else if (selectedSport === 'pickleball') sportId = 3;
              else if (selectedSport === 'basketball') sportId = 4;
              refreshClubs(sportId, searchQuery);
            }}
            colors={[COLORS.primary]}
          />
        }
      >
        {filteredJoinedClubs.length > 0 ? (
          filteredJoinedClubs.map((club) => (
            <ClubCard 
              key={club.id} 
              club={club}
              onPress={() => router.push({
                pathname: '/club-detail-joined/[id]',
                params: { id: club.id }
              })}
            />
          ))
        ) : joinedClubs.length > 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="group-off" size={64} color={COLORS.outline} />
            <Text style={styles.emptyTitle}>Không tìm thấy câu lạc bộ</Text>
            <Text style={styles.emptyText}>
              Thử đổi bộ lọc môn thể thao khác để tìm câu lạc bộ bạn đã tham gia.
            </Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="group-off" size={64} color={COLORS.outline} />
            <Text style={styles.emptyTitle}>Chưa tham gia câu lạc bộ nào</Text>
            <Text style={styles.emptyText}>
              Hãy khám phá các câu lạc bộ thể thao tuyệt vời xung quanh bạn để bắt đầu giao lưu luyện tập.
            </Text>
            <Button
              variant="primary"
              title="Khám phá ngay"
              icon="search"
              style={styles.exploreBtn}
              onPress={() => router.back()}
            />
          </View>
        ) }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    height: 64,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    position: 'absolute',
    left: 60,
    right: 80,
    textAlign: 'center',
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
  },
  createBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 0,
    height: 32,
    borderRadius: BORDER_RADIUS.default,
  },
  createBtnText: {
    ...TYPOGRAPHY.labelSm,
  },
  scrollList: {
    padding: SPACING.marginMobile,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.base,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.onSurface,
    marginTop: SPACING.base,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.base,
  },
  exploreBtn: {
    width: '80%',
    borderRadius: BORDER_RADIUS.default,
  },
  filterSection: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    gap: SPACING.base,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
    paddingHorizontal: SPACING.sm,
    height: 44,
    gap: SPACING.base,
  },
  searchContainerFocused: {
    borderColor: COLORS.primary,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurface,
    padding: 0,
  },
});

export default MyClubsScreen;
