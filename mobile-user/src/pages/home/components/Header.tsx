import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../../shared/ui';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface HeaderProps {
  isAuthenticated: boolean;
  userName: string;
  userAvatar?: string | null;
  unreadNotificationsCount?: number;
  getGreeting: () => string;
  handleAvatarPress: () => void;
  onNotificationPress?: () => void;
}

export function Header({
  isAuthenticated,
  userName,
  userAvatar,
  unreadNotificationsCount = 0,
  getGreeting,
  handleAvatarPress,
  onNotificationPress,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      {/* Left: Avatar + Greeting */}
      <TouchableOpacity
        onPress={handleAvatarPress}
        activeOpacity={0.8}
        style={styles.headerLeft}
      >
        <View style={styles.avatarBorder}>
          <Avatar
            size="md"
            source={isAuthenticated && userAvatar ? userAvatar : null}
            fallbackType="user"
          />
        </View>
        <View style={styles.greetingWrapper}>
          <Text style={styles.greetingSmall}>{getGreeting()}</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {isAuthenticated ? userName : 'Đăng nhập ngay'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Right: Logo + Notification */}
      <View style={styles.headerRight}>
        <Image
          source={require('../../../../assets/logo/logo-horizontal_1600x400.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />

        {/* Notification button with red number badge */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
          activeOpacity={0.75}
        >
          <Ionicons name="notifications-outline" size={21} color={COLORS.onSurface} />
          {isAuthenticated && unreadNotificationsCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    backgroundColor: COLORS.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  avatarBorder: {
    borderWidth: 2,
    borderColor: COLORS.primaryFixedDim,
    borderRadius: BORDER_RADIUS.full,
    padding: 1,
  },
  greetingWrapper: {
    justifyContent: 'center',
    flex: 1,
  },
  greetingSmall: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
    fontSize: 11,
    fontWeight: '600',
  },
  userName: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: -0.2,
    marginTop: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerLogo: {
    width: 90,
    height: 24,
  },
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
    zIndex: 10,
    elevation: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 12,
  },
});
