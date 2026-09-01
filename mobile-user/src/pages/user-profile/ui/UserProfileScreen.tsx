import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useUserProfile,
  UserProfileHeader,
  UserSportsCard,
  UserPhysicalCard,
  UserClubsCard,
} from '../../../features/user-profile';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/config/theme';

export function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const userId = params.id || '1';

  const {
    profile,
    isLoading,
    genderLabel,
    joinedYearLabel,
  } = useUserProfile(userId);

  const handleShareProfile = async () => {
    if (!profile) return;
    try {
      await Share.share({
        message: `Xem hồ sơ thể thao của ${profile.fullName} trên ứng dụng Sporta!`,
      });
    } catch {
      // ignore
    }
  };

  const handleClubPress = (club: any) => {
    if (club.clubId) {
      router.push(`/club-detail-explore/${club.clubId}` as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Top Header Navigation Bar ── */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {profile?.fullName || 'Hồ sơ người chơi'}
        </Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={handleShareProfile}>
            <Ionicons name="share-social-outline" size={20} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading || !profile ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải hồ sơ người chơi...</Text>
        </View>
      ) : (
        /* ── Main ScrollView ── */
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* 1. Integrated Profile Header */}
          <UserProfileHeader
            profile={profile}
            genderLabel={genderLabel}
            joinedYearLabel={joinedYearLabel}
          />

          {/* 2. Sports Summary Cards */}
          <UserSportsCard sports={profile.sports} />

          {/* 3. Physical Stats Card */}
          <UserPhysicalCard
            height={profile.height}
            weight={profile.weight}
          />

          {/* 4. Joined Clubs Card */}
          <UserClubsCard clubs={profile.joinedClubs} onClubPress={handleClubPress} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});
