import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui';
import { useClubs, ClubCard, SportsFilter } from '../../../entities/club';
import { MyClubsRedirect } from './components/MyClubsRedirect';

export function ClubsScreen() {
  const router = useRouter();
  const { clubs, joinedIds, loading, refreshClubs } = useClubs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [authModalAction, setAuthModalAction] = useState<string>('tham gia hoặc tạo câu lạc bộ');

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
        if (selectedSport === 'football') sportId = 1;
        else if (selectedSport === 'badminton') sportId = 2;
        else if (selectedSport === 'pickleball') sportId = 3;
        else if (selectedSport === 'basketball') sportId = 4;

        refreshClubs(sportId, searchQuery);
      };

      checkAndFetch();

      return () => {
        isMounted = false;
      };
    }, [selectedSport, searchQuery])
  );

  const handleRequireLogin = (actionName: string): boolean => {
    if (!isAuthenticated) {
      setAuthModalAction(actionName);
      setIsAuthModalVisible(true);
      return true; // Require login triggered
    }
    return false; // User is logged in
  };

  const handleMyClubsPress = () => {
    if (handleRequireLogin('xem câu lạc bộ của bạn')) return;
    router.push('/my-clubs');
  };

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
          onPress={handleMyClubsPress}
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
              {joinedIds.length > 0 && joinedIds.length === clubs.length 
                ? 'Bạn đã tham gia tất cả các câu lạc bộ!'
                : 'Không tìm thấy câu lạc bộ phù hợp'}
            </Text>
          </View>
        )}
      </ScrollView>

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
  createHeaderBtn: {
    paddingHorizontal: SPACING.sm,
    height: 36,
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
  authPromptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl * 2,
    gap: SPACING.md,
  },
  authIconCircle: {
    width: 96,
    height: 96,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  authTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  authSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  loginBtn: {
    width: '100%',
    maxWidth: 280,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
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
