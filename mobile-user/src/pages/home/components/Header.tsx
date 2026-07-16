import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '../../../shared/ui';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface HeaderProps {
  isAuthenticated: boolean;
  userName: string;
  userAvatar?: string | null;
  getGreeting: () => string;
  handleAvatarPress: () => void;
}

export function Header({ isAuthenticated, userName, userAvatar, getGreeting, handleAvatarPress }: HeaderProps) {
  return (
    <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8} style={styles.headerLeft}>
          <Avatar
            size="md"
            source={isAuthenticated && userAvatar ? userAvatar : null}
            fallbackIcon="person"
          />
          <View>
            <Text style={styles.greetingSmall}>{getGreeting()}</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Image
            source={require('../../../../assets/logo/logo-icon_1024x1024.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={{ position: 'relative' }}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => console.log('Notification pressed')}
              activeOpacity={0.7}
            >
              <View style={styles.notificationIconBg}>
                <MaterialIcons name="notifications-none" size={22} color={COLORS.onSurface} />
              </View>
            </TouchableOpacity>
            {isAuthenticated && <View style={styles.notificationBadge} />}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  greetingSmall: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.outline,
    textTransform: 'none',
  },
  userName: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerLogo: {
    width: 36,
    height: 36,
  },
  notificationButton: {
    padding: 0,
  },
  notificationIconBg: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
});
