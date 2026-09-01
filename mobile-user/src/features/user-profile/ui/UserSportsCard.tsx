import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface SportStatItem {
  sportId: number;
  sportName: string;
  sportIcon?: string;
  bookingCount: number;
  percentage: number;
}

interface UserSportsCardProps {
  sports?: SportStatItem[];
}

export const UserSportsCard = React.memo(({ sports }: UserSportsCardProps) => {
  if (!sports || sports.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>HỒ SƠ BỘ MÔN THỂ THAO</Text>
        <View style={styles.emptyCard}>
          <Ionicons name="fitness-outline" size={28} color="#94A3B8" />
          <Text style={styles.emptyText}>Chưa có dữ liệu đặt sân thể thao</Text>
        </View>
      </View>
    );
  }

  const getSportIconConfig = (name: string) => {
    switch (name) {
      case 'Bóng đá':
      case 'Đá bóng':
        return {
          icon: <Ionicons name="football" size={20} color="#2563EB" />,
          bgColor: '#EFF6FF',
          barColor: '#2563EB',
        };
      case 'Cầu lông':
      case 'Đánh cầu':
        return {
          icon: <MaterialCommunityIcons name="badminton" size={20} color="#0284C7" />,
          bgColor: '#F0F9FF',
          barColor: '#0284C7',
        };
      case 'Tennis':
        return {
          icon: <MaterialCommunityIcons name="tennis" size={20} color="#059669" />,
          bgColor: '#ECFDF5',
          barColor: '#059669',
        };
      case 'Bóng rổ':
        return {
          icon: <Ionicons name="basketball" size={20} color="#EA580C" />,
          bgColor: '#FFF7ED',
          barColor: '#EA580C',
        };
      case 'Pickleball':
      default:
        return {
          icon: <Ionicons name="tennisball" size={20} color="#D97706" />,
          bgColor: '#FEFCE8',
          barColor: '#D97706',
        };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="trophy-outline" size={18} color={COLORS.primary} />
        <Text style={styles.sectionTitle}>HỒ SƠ BỘ MÔN THỂ THAO</Text>
      </View>

      <View style={styles.cardsList}>
        {sports.map((item) => {
          const config = getSportIconConfig(item.sportName);
          return (
            <View key={item.sportId} style={styles.sportCard}>
              <View style={styles.sportTopRow}>
                {/* Sport Icon & Name */}
                <View style={styles.sportLeftGroup}>
                  <View style={[styles.sportIconCircle, { backgroundColor: config.bgColor }]}>
                    {config.icon}
                  </View>
                  <View>
                    <Text style={styles.sportName}>{item.sportName}</Text>
                    <Text style={styles.bookingCountText}>
                      {item.bookingCount} lượt đặt sân
                    </Text>
                  </View>
                </View>

                {/* Percentage Tag */}
                <View style={[styles.percentageBadge, { backgroundColor: config.bgColor }]}>
                  <Text style={[styles.percentageText, { color: config.barColor }]}>
                    {item.percentage}% hoạt động
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, Math.max(8, item.percentage))}%`,
                      backgroundColor: config.barColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },
  cardsList: {
    gap: 10,
  },
  sportCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  sportTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sportLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sportIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportName: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  bookingCountText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  percentageText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyCard: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    ...TYPOGRAPHY.bodySm,
    color: '#94A3B8',
    fontSize: 13,
  },
});
