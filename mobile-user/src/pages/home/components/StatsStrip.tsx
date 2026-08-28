import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface StatItem {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}

const STATS: StatItem[] = [
  { icon: 'shield-checkmark-outline', value: '100+', label: 'Sân xác thực' },
  { icon: 'people-outline', value: '1.500+', label: 'Kèo chờ ghép' },
  { icon: 'ticket-outline', value: '350+', label: 'Vé hôm nay' },
];

export function StatsStrip() {
  return (
    <View style={styles.container}>
      {STATS.map((stat, index) => (
        <React.Fragment key={stat.label}>
          <View style={styles.statItem}>
            <View style={styles.iconBox}>
              <Ionicons name={stat.icon} size={15} color={COLORS.primary} />
            </View>
            <View style={styles.textBox}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          </View>
          {index < STATS.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBox: {
    gap: 1,
  },
  statValue: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '900',
    fontSize: 13,
    lineHeight: 16,
  },
  statLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
});
