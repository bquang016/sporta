import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface UserProfileActionsProps {
  friendStatus: 'none' | 'pending' | 'friend';
  onToggleFriend: () => void;
  onInviteMatch: () => void;
  onOpenChat: () => void;
}

export const UserProfileActions = React.memo(({
  friendStatus,
  onToggleFriend,
  onInviteMatch,
  onOpenChat,
}: UserProfileActionsProps) => {
  const renderFriendButtonText = () => {
    if (friendStatus === 'friend') return 'Bạn bè';
    if (friendStatus === 'pending') return 'Đã gửi lời';
    return 'Thêm bạn bè';
  };

  const renderFriendIcon = () => {
    if (friendStatus === 'friend') return 'checkmark-circle-outline' as const;
    if (friendStatus === 'pending') return 'time-outline' as const;
    return 'person-add-outline' as const;
  };

  return (
    <View style={styles.container}>
      {/* 1. Add Friend Button */}
      <TouchableOpacity
        style={[
          styles.actionItem,
          friendStatus === 'friend' && styles.actionItemActive,
          friendStatus === 'pending' && styles.actionItemPending,
        ]}
        activeOpacity={0.7}
        onPress={onToggleFriend}
      >
        <View style={styles.iconCircle}>
          <Ionicons
            name={renderFriendIcon()}
            size={22}
            color={friendStatus === 'none' ? COLORS.primary : COLORS.onSurface}
          />
        </View>
        <Text style={styles.actionText}>{renderFriendButtonText()}</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* 2. Invite to Match Button */}
      <TouchableOpacity style={styles.actionItem} activeOpacity={0.7} onPress={onInviteMatch}>
        <View style={styles.iconCircle}>
          <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
        </View>
        <Text style={styles.actionText}>Mời bạn</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider} />

      {/* 3. Chat Button (Requirement #2) */}
      <TouchableOpacity style={styles.actionItem} activeOpacity={0.7} onPress={onOpenChat}>
        <View style={styles.iconCircle}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.primary} />
        </View>
        <Text style={styles.actionText}>Trò chuyện</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.marginMobile,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.background,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.default,
  },
  actionItemActive: {
    backgroundColor: COLORS.primaryOpacity08,
  },
  actionItemPending: {
    backgroundColor: COLORS.surfaceContainerLow,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
});
