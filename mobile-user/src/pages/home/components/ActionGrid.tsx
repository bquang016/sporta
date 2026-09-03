import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface ActionGridProps {
  isAuthenticated: boolean;
}

interface ActionItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  route: string | null;
  isPrimary?: boolean;
}

const ACTIONS: ActionItem[] = [
  {
    id: 'book-court',
    icon: 'calendar-outline',
    title: 'Đặt sân ngay',
    subtitle: 'Tìm & giữ chỗ trong 30s',
    badge: 'NHANH',
    badgeColor: '#FED01B',
    route: '/search',
    isPrimary: true,
  },
  {
    id: 'match-matchmaking',
    icon: 'people-outline',
    title: 'Ghép kèo đá',
    subtitle: 'Tìm đối thủ & đồng đội',
    badge: 'HOT',
    badgeColor: '#EF4444',
    route: '/matchmaking',
    isPrimary: false,
  },
  {
    id: 'ticket-sessions',
    icon: 'ticket-outline',
    title: 'Sân chơi xé vé',
    subtitle: 'Tham gia kèo lẻ có sẵn',
    badge: 'TIẾT KIỆM',
    badgeColor: '#10B981',
    route: '/ticket-sessions',
    isPrimary: false,
  },
  {
    id: 'map-explore',
    icon: 'map-outline',
    title: 'Bản đồ sân',
    subtitle: 'Khám phá cụm sân gần bạn',
    badge: 'GPS',
    badgeColor: '#6366F1',
    route: '/map',
    isPrimary: false,
  },
];

export function ActionGrid({ isAuthenticated }: ActionGridProps) {
  const router = useRouter();

  const handlePress = (route: string | null) => {
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconBox}>
            <Ionicons name="flash-outline" size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.sectionTitle}>Dịch Vụ Nổi Bật</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {ACTIONS.map((action) => {
          if (action.isPrimary) {
            return (
              <TouchableOpacity
                key={action.id}
                style={styles.cardWrapper}
                onPress={() => handlePress(action.route)}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#064E3B', '#003527']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.tileCard, styles.tileCardPrimary]}
                >
                  <View style={styles.tileHeader}>
                    <View style={styles.iconCirclePrimary}>
                      <Ionicons name={action.icon} size={22} color="#FFFFFF" />
                    </View>
                    {action.badge && (
                      <View style={[styles.badge, { backgroundColor: action.badgeColor }]}>
                        <Text style={styles.badgeTextPrimary}>{action.badge}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.tileContent}>
                    <Text style={styles.titlePrimary}>{action.title}</Text>
                    <Text style={styles.subtitlePrimary} numberOfLines={1}>
                      {action.subtitle}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={action.id}
              style={styles.cardWrapper}
              onPress={() => handlePress(action.route)}
              activeOpacity={0.85}
            >
              <View style={styles.tileCard}>
                <View style={styles.tileHeader}>
                  <View style={styles.iconCircle}>
                    <Ionicons name={action.icon} size={22} color={COLORS.primary} />
                  </View>
                  {action.badge && (
                    <View style={[styles.badge, { backgroundColor: `${action.badgeColor}18` }]}>
                      <Text style={[styles.badgeText, { color: action.badgeColor }]}>
                        {action.badge}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.tileContent}>
                  <Text style={styles.title}>{action.title}</Text>
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {action.subtitle}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: SPACING.xs + 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.xs + 2,
  },
  cardWrapper: {
    width: '48.5%',
  },
  tileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md - 2,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: SPACING.sm,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  tileCardPrimary: {
    borderWidth: 0,
    shadowColor: '#064E3B',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCirclePrimary: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  badgeTextPrimary: {
    color: '#003527',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  tileContent: {
    gap: 2,
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
    fontSize: 14.5,
    letterSpacing: -0.2,
  },
  titlePrimary: {
    ...TYPOGRAPHY.titleMd,
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14.5,
    letterSpacing: -0.2,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
  },
  subtitlePrimary: {
    ...TYPOGRAPHY.bodyMd,
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
  },
});
