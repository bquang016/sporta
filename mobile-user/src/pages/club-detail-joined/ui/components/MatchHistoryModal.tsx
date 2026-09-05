import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Club } from '../../../../entities/club';
import { MatchHistoryCard, MatchItem } from './MatchHistoryCard';

export interface MatchHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  club: Club;
  matches: MatchItem[];
  onRefreshMatches?: () => void;
}

type FilterType = 'ALL' | 'WIN' | 'DRAW' | 'LOSE';

export function MatchHistoryModal({ 
  visible, 
  onClose, 
  club, 
  matches,
  onRefreshMatches,
}: MatchHistoryModalProps) {
  const [filter, setFilter] = useState<FilterType>('ALL');

  const totalMatches = matches.length;
  const winsCount = matches.filter(m => m.result === 'win').length;
  const lossesCount = matches.filter(m => m.result === 'lose').length;
  const drawsCount = matches.filter(m => m.result === 'draw').length;
  const winRate = totalMatches > 0 ? Math.round((winsCount / totalMatches) * 100) : 0;

  // Filtered matches
  const filteredMatches = useMemo(() => {
    if (filter === 'WIN') return matches.filter(m => m.result === 'win');
    if (filter === 'LOSE') return matches.filter(m => m.result === 'lose');
    if (filter === 'DRAW') return matches.filter(m => m.result === 'draw');
    return matches;
  }, [matches, filter]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <View style={styles.fullScreenModalContainer}>
          {/* Header */}
          <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
            <View style={styles.fullScreenModalHeader}>
              <TouchableOpacity 
                style={styles.closeModalButton} 
                activeOpacity={0.7} 
                onPress={onClose}
              >
                <MaterialIcons name="arrow-back" size={22} color={COLORS.onSurface} />
              </TouchableOpacity>
              <Text style={styles.fullScreenModalTitle}>Lịch sử đối đầu CLB</Text>
              <View style={styles.headerPlaceholder}>
                {onRefreshMatches && (
                  <TouchableOpacity onPress={onRefreshMatches} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </SafeAreaView>
          
          <View style={styles.contentContainer}>
            <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
              {/* Performance Overview Banner */}
              <View style={styles.heroOverviewCard}>
                <View style={styles.winRateBox}>
                  <View style={styles.winRateCircle}>
                    <Text style={styles.winRatePercent}>{winRate}%</Text>
                    <Text style={styles.winRateLabel}>Thắng</Text>
                  </View>
                  <View style={styles.winRateMeta}>
                    <Text style={styles.clubTitleText} numberOfLines={1}>{club.name}</Text>
                    <Text style={styles.rankLevelSub}>
                      Điểm CLB: <Text style={styles.crpBold}>{club.crp || 0} CRP</Text> • Hạng: {club.levelLabel || 'TB'}
                    </Text>
                  </View>
                </View>

                <View style={styles.statsBarRow}>
                  <View style={styles.statCol}>
                    <Text style={styles.statNum}>{totalMatches}</Text>
                    <Text style={styles.statName}>Tổng trận</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statCol}>
                    <Text style={[styles.statNum, { color: '#059669' }]}>{winsCount}</Text>
                    <Text style={styles.statName}>Thắng</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statCol}>
                    <Text style={[styles.statNum, { color: '#64748B' }]}>{drawsCount}</Text>
                    <Text style={styles.statName}>Hòa</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statCol}>
                    <Text style={[styles.statNum, { color: '#EF4444' }]}>{lossesCount}</Text>
                    <Text style={styles.statName}>Thua</Text>
                  </View>
                </View>
              </View>

              {/* Filter Chips */}
              <View style={styles.filterRow}>
                <TouchableOpacity 
                  style={[styles.filterChip, filter === 'ALL' && styles.filterChipActive]}
                  onPress={() => setFilter('ALL')}
                >
                  <Text style={[styles.filterChipText, filter === 'ALL' && styles.filterChipTextActive]}>
                    Tất cả ({totalMatches})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.filterChip, filter === 'WIN' && styles.filterChipActiveWin]}
                  onPress={() => setFilter('WIN')}
                >
                  <Text style={[styles.filterChipText, filter === 'WIN' && styles.filterChipTextWin]}>
                    Thắng ({winsCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.filterChip, filter === 'DRAW' && styles.filterChipActive]}
                  onPress={() => setFilter('DRAW')}
                >
                  <Text style={[styles.filterChipText, filter === 'DRAW' && styles.filterChipTextActive]}>
                    Hòa ({drawsCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.filterChip, filter === 'LOSE' && styles.filterChipActiveLoss]}
                  onPress={() => setFilter('LOSE')}
                >
                  <Text style={[styles.filterChipText, filter === 'LOSE' && styles.filterChipTextLoss]}>
                    Thua ({lossesCount})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Matches List */}
              {filteredMatches.length > 0 ? (
                <View style={styles.historyList}>
                  {filteredMatches.map((match) => (
                    <MatchHistoryCard 
                      key={match.id}
                      match={match}
                      club={club}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <FontAwesome5 name="futbol" size={40} color="#CBD5E1" />
                  <Text style={styles.emptyTitle}>Chưa có trận đấu nào</Text>
                  <Text style={styles.emptySub}>
                    {filter !== 'ALL' 
                      ? 'Không có trận đấu nào phù hợp với bộ lọc đã chọn.'
                      : 'Các trận đấu xếp hạng giao hữu giữa các câu lạc bộ sẽ tự động được ghi nhận và tính điểm CRP tại đây.'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  fullScreenModalHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  closeModalButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  fullScreenModalTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  headerPlaceholder: {
    width: 36,
    alignItems: 'flex-end',
  },
  refreshBtn: {
    padding: 6,
  },
  contentContainer: {
    flex: 1,
  },
  scrollBody: {
    padding: 16,
    gap: 12,
  },
  heroOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  winRateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  winRateCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EFF6FF',
    borderWidth: 3,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  winRatePercent: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  winRateLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  winRateMeta: {
    flex: 1,
    gap: 2,
  },
  clubTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  rankLevelSub: {
    fontSize: 12,
    color: '#64748B',
  },
  crpBold: {
    fontWeight: '800',
    color: '#2563EB',
  },
  statsBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statName: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  filterChipActiveWin: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  filterChipActiveLoss: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#1D4ED8',
  },
  filterChipTextWin: {
    color: '#059669',
  },
  filterChipTextLoss: {
    color: '#DC2626',
  },
  historyList: {
    gap: 2,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
