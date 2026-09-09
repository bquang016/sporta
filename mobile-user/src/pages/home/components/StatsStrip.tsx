import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/config/theme';
import { getPlatformStatsApi, PlatformStatsDto } from '../../../shared/api/platformStats';

interface StatConfig {
  key: keyof PlatformStatsDto | 'verifiedVenues' | 'openMatchRooms' | 'todayTickets';
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  iconColor: string;
  iconBg: string;
  getValue: (stats: PlatformStatsDto | null) => string;
}

const STAT_CONFIGS: StatConfig[] = [
  {
    key: 'verifiedVenues',
    icon: 'shield-checkmark',
    label: 'Sân xác thực',
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    getValue: (stats) => {
      if (!stats) return '100+';
      if (stats.verifiedVenuesDisplay) return stats.verifiedVenuesDisplay;
      const count = stats.verifiedVenues ?? 0;
      return count >= 10 ? `${count}+` : `${count}`;
    },
  },
  {
    key: 'openMatchRooms',
    icon: 'people',
    label: 'Kèo chờ ghép',
    iconColor: '#0284C7',
    iconBg: '#F0F9FF',
    getValue: (stats) => {
      if (!stats) return '1.500+';
      if (stats.openMatchRoomsDisplay) return stats.openMatchRoomsDisplay;
      const count = stats.openMatchRooms ?? 0;
      return count >= 1000 ? `${(count / 1000).toFixed(1)}k+` : count >= 10 ? `${count}+` : `${count}`;
    },
  },
  {
    key: 'todayTickets',
    icon: 'ticket',
    label: 'Vé hôm nay',
    iconColor: '#D97706',
    iconBg: '#FFFBEB',
    getValue: (stats) => {
      if (!stats) return '350+';
      if (stats.todayTicketsDisplay) return stats.todayTicketsDisplay;
      const count = stats.todayTickets ?? 0;
      return count >= 10 ? `${count}+` : `${count}`;
    },
  },
];

export function StatsStrip() {
  const [stats, setStats] = useState<PlatformStatsDto | null>(null);

  useEffect(() => {
    let isMounted = true;
    getPlatformStatsApi()
      .then((res) => {
        if (isMounted && res) {
          setStats(res);
        }
      })
      .catch(() => {
        // Fallback gracefully to default metrics
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      {STAT_CONFIGS.map((config, index) => (
        <React.Fragment key={config.key}>
          <View style={styles.statItem}>
            <View style={[styles.iconBox, { backgroundColor: config.iconBg }]}>
              <Ionicons name={config.icon} size={14} color={config.iconColor} />
            </View>
            <View style={styles.textBox}>
              <Text style={styles.statValue} numberOfLines={1}>
                {config.getValue(stats)}
              </Text>
              <Text style={styles.statLabel} numberOfLines={1}>
                {config.label}
              </Text>
            </View>
          </View>
          {index < STAT_CONFIGS.length - 1 && <View style={styles.divider} />}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
    justifyContent: 'center',
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBox: {
    gap: 1,
    justifyContent: 'center',
  },
  statValue: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: -0.2,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 2,
  },
});
