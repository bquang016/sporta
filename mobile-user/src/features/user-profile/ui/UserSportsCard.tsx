import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface SportStatItem {
  sportId: number;
  sportName: string;
  sportIcon?: string;
  level?: string;
  eloRating?: number;
  eloStatus?: 'UNVERIFIED' | 'CALIBRATING' | 'VERIFIED';
  levelLabel?: string;
  placementMatchesPlayed?: number;
  totalRankedMatches?: number;
  totalWins?: number;
  winRate?: number;
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
          <Text style={styles.emptyText}>Chưa có dữ liệu thể thao</Text>
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

  const getStatusBadgeConfig = (status?: string, played?: number) => {
    switch (status) {
      case 'VERIFIED':
        return {
          label: 'ĐÃ XÁC THỰC',
          iconLibrary: 'Ionicons',
          icon: 'shield-checkmark',
          bgColor: '#ECFDF5',
          textColor: '#059669',
          borderColor: '#A7F3D0',
        };
      case 'CALIBRATING':
        return {
          label: `PHÂN HẠNG ${played || 0}/5`,
          iconLibrary: 'MaterialCommunityIcons',
          icon: 'timer-sand',
          bgColor: '#FEF3C7',
          textColor: '#D97706',
          borderColor: '#FDE68A',
        };
      case 'UNVERIFIED':
      default:
        return {
          label: 'TỰ KHAI',
          iconLibrary: 'MaterialCommunityIcons',
          icon: 'shield-account-outline',
          bgColor: '#F1F5F9',
          textColor: '#64748B',
          borderColor: '#CBD5E1',
        };
    }
  };

  const sortedSports = React.useMemo(() => {
    if (!sports) return [];
    return [...sports].sort((a, b) => {
      const statusWeight = (s?: string) => (s === 'VERIFIED' ? 3 : s === 'CALIBRATING' ? 2 : 1);
      const diffStatus = statusWeight(b.eloStatus) - statusWeight(a.eloStatus);
      if (diffStatus !== 0) return diffStatus;

      const matchesA = a.totalRankedMatches ?? 0;
      const matchesB = b.totalRankedMatches ?? 0;
      if (matchesB !== matchesA) return matchesB - matchesA;

      const eloA = a.eloRating ?? 0;
      const eloB = b.eloRating ?? 0;
      if (eloB !== eloA) return eloB - eloA;

      const winsA = a.totalWins ?? 0;
      const winsB = b.totalWins ?? 0;
      return winsB - winsA;
    });
  }, [sports]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <Ionicons name="trophy-outline" size={17} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>HỒ SƠ BỘ MÔN & ELO</Text>
        </View>
        <View style={styles.hintBadge}>
          <Ionicons name="sparkles" size={10} color="#059669" />
          <Text style={styles.hintText}>Xếp theo thực lực</Text>
        </View>
      </View>

      <View style={styles.cardsList}>
        {sortedSports.map((item) => {
          const config = getSportIconConfig(item.sportName);
          const badge = getStatusBadgeConfig(item.eloStatus, item.placementMatchesPlayed);
          const elo = item.eloRating ?? 1500;
          const levelText = item.levelLabel || (item.level === 'GOOD' ? 'Khá' : item.level === 'WEAK' ? 'Yếu' : 'Trung bình');

          return (
            <View key={item.sportId} style={styles.sportCard}>
              <View style={styles.sportTopRow}>
                {/* Sport Icon & Name */}
                <View style={styles.sportLeftGroup}>
                  <View style={[styles.sportIconCircle, { backgroundColor: config.bgColor }]}>
                    {config.icon}
                  </View>
                  <View>
                    <View style={styles.sportNameRow}>
                      <Text style={styles.sportName}>{item.sportName}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bgColor, borderColor: badge.borderColor }]}>
                        {badge.iconLibrary === 'MaterialCommunityIcons' ? (
                          <MaterialCommunityIcons name={badge.icon as any} size={10} color={badge.textColor} />
                        ) : (
                          <Ionicons name={badge.icon as any} size={10} color={badge.textColor} />
                        )}
                        <Text style={[styles.statusBadgeText, { color: badge.textColor }]}>{badge.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.bookingCountText}>
                      Trình độ: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{levelText}</Text>
                      {item.bookingCount > 0 ? ` • ${item.bookingCount} lượt đặt sân` : ''}
                    </Text>
                  </View>
                </View>

                {/* Elo Rating Display */}
                <View style={styles.eloBox}>
                  <Text style={styles.eloValue}>{elo.toLocaleString()}</Text>
                  <Text style={styles.eloLabel}>Điểm Elo</Text>
                </View>
              </View>

              {/* Stats Footer Row */}
              <View style={styles.statsFooterRow}>
                <View style={styles.statFooterItem}>
                  <MaterialCommunityIcons name="trophy" size={13} color="#064E3B" />
                  <Text style={styles.statFooterText}>
                    {item.totalRankedMatches ?? 0} trận ({item.totalWins ?? 0} thắng)
                  </Text>
                </View>
                <View style={styles.statFooterItem}>
                  <Ionicons name="trending-up" size={13} color="#2563EB" />
                  <Text style={styles.statFooterText}>
                    Thắng {item.winRate ?? 0}%
                  </Text>
                </View>
                <View style={styles.statFooterItem}>
                  <Ionicons name="pie-chart-outline" size={13} color="#D97706" />
                  <Text style={styles.statFooterText}>
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
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  hintText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#059669',
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
  sportNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sportName: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  bookingCountText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  eloBox: {
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  eloValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  eloLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  statsFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statFooterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
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
