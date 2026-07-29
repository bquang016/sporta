import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PublicUserProfile } from '../../../entities/user';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface UserProfileHeaderProps {
  profile: PublicUserProfile;
  genderAgeLabel: string;
  friendStatus: 'none' | 'pending' | 'friend';
  onToggleFriend: () => void;
  onOpenInviteOptions: () => void;
  onOpenChat: () => void;
}

export const UserProfileHeader = React.memo(({
  profile,
  genderAgeLabel,
  friendStatus,
  onToggleFriend,
  onOpenInviteOptions,
  onOpenChat,
}: UserProfileHeaderProps) => {
  const renderFriendBtnConfig = () => {
    if (friendStatus === 'friend') {
      return {
        label: 'Bạn bè',
        icon: 'checkmark-circle-outline' as const,
        style: styles.friendBtnActive,
        textStyle: styles.friendBtnActiveText,
      };
    }
    if (friendStatus === 'pending') {
      return {
        label: 'Đã gửi lời',
        icon: 'time-outline' as const,
        style: styles.friendBtnPending,
        textStyle: styles.friendBtnPendingText,
      };
    }
    return {
      label: 'Thêm bạn',
      icon: 'person-add-outline' as const,
      style: styles.friendBtnAdd,
      textStyle: styles.friendBtnAddText,
    };
  };

  const friendBtn = renderFriendBtnConfig();

  return (
    <View style={styles.container}>
      {/* ── Avatar & Info Layout ── */}
      <View style={styles.profileMainRow}>
        {/* Avatar Container with Border and Badges */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
          {profile.sportaPoints && (
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>{profile.sportaPoints}</Text>
            </View>
          )}
        </View>

        {/* User Info Column */}
        <View style={styles.infoColumn}>
          <View style={styles.nameRow}>
            <Text style={styles.fullName}>{profile.fullName}</Text>
            {profile.isVerified && (
              <Ionicons name="checkmark-circle" size={18} color="#3B82F6" style={{ marginLeft: 4 }} />
            )}
          </View>

          <Text style={styles.genderAgeText}>{genderAgeLabel}</Text>
          <Text style={styles.usernameText}>{profile.username}</Text>
        </View>
      </View>

      {/* ── Bio Section ── */}
      {profile.bio ? (
        <View style={styles.bioContainer}>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>
      ) : null}

      {/* ── Integrated Compact Action Buttons Row (Nằm ngang hàng ngay dưới thông tin profile) ── */}
      <View style={styles.actionsRow}>
        {/* 1. Add / Pending / Friend Button */}
        <TouchableOpacity
          style={[styles.actionBtn, friendBtn.style]}
          activeOpacity={0.8}
          onPress={onToggleFriend}
        >
          <Ionicons name={friendBtn.icon} size={16} color={friendBtn.textStyle.color} />
          <Text style={[styles.actionBtnText, friendBtn.textStyle]}>{friendBtn.label}</Text>
        </TouchableOpacity>

        {/* 2. Invite Button (Opens Options Modal) */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnOutline]}
          activeOpacity={0.8}
          onPress={onOpenInviteOptions}
        >
          <Ionicons name="mail-outline" size={16} color={COLORS.primary} />
          <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Mời bạn</Text>
        </TouchableOpacity>

        {/* 3. Chat Button */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnOutline]}
          activeOpacity={0.8}
          onPress={onOpenChat}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.primary} />
          <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Trò chuyện</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.md,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.background,
  },
  profileMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    width: 76,
    height: 76,
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceDim,
  },
  pointsBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#10B981',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  pointsText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  fullName: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  genderAgeText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  usernameText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.grayText,
    marginTop: 2,
  },
  bioContainer: {
    marginTop: SPACING.sm,
  },
  bioText: {
    ...TYPOGRAPHY.bodyLg,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.default,
    gap: 5,
  },
  actionBtnOutline: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  actionBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    fontWeight: '700',
  },
  friendBtnAdd: {
    backgroundColor: COLORS.primary,
  },
  friendBtnAddText: {
    color: '#FFFFFF',
  },
  friendBtnPending: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  friendBtnPendingText: {
    color: COLORS.onSurfaceVariant,
  },
  friendBtnActive: {
    backgroundColor: COLORS.primaryOpacity10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  friendBtnActiveText: {
    color: COLORS.primary,
  },
});
