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
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  useUserProfile,
  UserProfileHeader,
  UserSportsCard,
  SportDetailModal,
  UserPhysicalCard,
  UserClubsCard,
  UnfriendConfirmModal,
  InviteOptionsModal,
  InviteClubModal,
  InviteMatchModal,
  MockChatModal,
} from '../../../features/user-profile';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../shared/config/theme';

export function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const userId = params.id || 'quanluu08';

  const {
    profile,
    friendStatus,
    unfriendModalVisible,
    inviteOptionsModalVisible,
    inviteClubModalVisible,
    inviteMatchModalVisible,
    chatModalVisible,
    selectedSportDetail,
    pendingMatchInvite,
    genderAgeLabel,
    handleToggleFriend,
    confirmUnfriend,
    cancelUnfriend,
    openInviteOptions,
    closeInviteOptions,
    openInviteClub,
    closeInviteClub,
    openInviteMatch,
    closeInviteMatch,
    openSportDetail,
    closeSportDetail,
    sendMatchInviteToChat,
    openChat,
    closeChat,
  } = useUserProfile(userId);

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Xem hồ sơ thể thao của ${profile.fullName} (${profile.username}) trên ứng dụng Sporta!`,
      });
    } catch {
      // ignore
    }
  };

  const handleMorePress = () => {
    Alert.alert(
      profile.fullName,
      'Tùy chọn tương tác người dùng',
      [
        { text: 'Chia sẻ hồ sơ', onPress: handleShareProfile },
        { text: 'Báo cáo tài khoản', style: 'destructive' },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleClubPress = (club: any) => {
    Alert.alert(
      club.name,
      `Chức vụ: ${club.roleInClub}\nSố thành viên: ${club.memberCount} người\nMôn: ${club.sportName}`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* ── Top Header Navigation Bar ── */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {profile.fullName}
        </Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={handleShareProfile}>
            <Ionicons name="share-social-outline" size={20} color={COLORS.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={handleMorePress}>
            <MaterialIcons name="more-vert" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main ScrollView ── */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* 1. Integrated Profile Header */}
        <UserProfileHeader
          profile={profile}
          genderAgeLabel={genderAgeLabel}
          friendStatus={friendStatus}
          onToggleFriend={handleToggleFriend}
          onOpenInviteOptions={openInviteOptions}
          onOpenChat={openChat}
        />

        {/* 2. Sports Summary Cards */}
        <UserSportsCard
          sportsProfiles={profile.sportsProfiles}
          onSelectSport={openSportDetail}
        />

        {/* 3. Physical Stats Card */}
        <UserPhysicalCard profile={profile} />

        {/* 4. Joined Clubs Card */}
        <UserClubsCard clubs={profile.joinedClubs} onClubPress={handleClubPress} />

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Sub Modals ── */}
      <SportDetailModal
        visible={!!selectedSportDetail}
        sport={selectedSportDetail}
        onClose={closeSportDetail}
      />

      <UnfriendConfirmModal
        visible={unfriendModalVisible}
        userName={profile.fullName}
        onConfirm={confirmUnfriend}
        onCancel={cancelUnfriend}
      />

      <InviteOptionsModal
        visible={inviteOptionsModalVisible}
        userName={profile.fullName}
        onSelectInviteClub={openInviteClub}
        onSelectInviteMatch={openInviteMatch}
        onClose={closeInviteOptions}
      />

      <InviteClubModal
        visible={inviteClubModalVisible}
        profile={profile}
        onClose={closeInviteClub}
      />

      <InviteMatchModal
        visible={inviteMatchModalVisible}
        profile={profile}
        onClose={closeInviteMatch}
        onSendInviteToChat={sendMatchInviteToChat}
      />

      <MockChatModal
        visible={chatModalVisible}
        profile={profile}
        initialMatchInvite={pendingMatchInvite}
        onClose={closeChat}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  backButton: {
    padding: 4,
    marginRight: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.onSurface,
    flex: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default UserProfileScreen;
