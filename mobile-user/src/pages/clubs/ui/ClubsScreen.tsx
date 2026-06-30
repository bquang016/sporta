import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import { useClubs, ClubCard, SportsFilter } from '../../../entities/club';
import { MyClubsRedirect } from './components/MyClubsRedirect';

export function ClubsScreen() {
  const router = useRouter();
  const { clubs, joinedIds } = useClubs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredClubs = clubs.filter(club => {
    // 1. Show only clubs that user can join (not yet joined)
    const isJoined = joinedIds.includes(club.id);
    if (isJoined) return false;

    // 2. Filter by search query
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          club.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          club.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 3. Filter by selected sport
    const matchesSport = selectedSport === 'all' || 
      (selectedSport === 'football' && club.sport === 'Bóng đá') ||
      (selectedSport === 'basketball' && club.sport === 'Bóng rổ') ||
      (selectedSport === 'badminton' && club.sport === 'Cầu lông') ||
      (selectedSport === 'pickleball' && club.sport === 'Pickleball');

    return matchesSearch && matchesSport;
  });

  return (
    <View style={styles.container}>
      {/* Header wrapper to color the status bar and notch area white */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Câu lạc bộ</Text>
        </View>
      </SafeAreaView>

      {/* Search and Filters Section */}
      <View style={styles.filterSection}>
        {/* My Clubs section above search bar */}
        <MyClubsRedirect 
          joinedCount={joinedIds.length} 
          onPress={() => router.push('/my-clubs')}
        />

        {/* Search Bar at the top of filter section */}
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

        {/* Sports filter chips */}
        <SportsFilter 
          selectedSport={selectedSport} 
          onSelectSport={setSelectedSport} 
        />
      </View>

      {/* Clubs List */}
      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        {filteredClubs.length > 0 ? (
          filteredClubs.map((club) => (
            <ClubCard 
              key={club.id} 
              club={club}
              onPress={() => router.push({
                pathname: '/club-detail-explore/[id]',
                params: { id: club.id }
              })}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="group-off" size={48} color={COLORS.outline} />
            <Text style={styles.emptyText}>
              {joinedIds.length === clubs.length 
                ? 'Bạn đã tham gia tất cả các câu lạc bộ!'
                : 'Không tìm thấy câu lạc bộ phù hợp'}
            </Text>
          </View>
        )}
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
  headerTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    fontSize: 20,
    color: COLORS.primary,
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
  scrollList: {
    padding: SPACING.marginMobile,
    paddingBottom: 90, // Avoid overlap with bottom tabs
    gap: SPACING.md,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.base,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.outline,
  },
});

export default ClubsScreen;
