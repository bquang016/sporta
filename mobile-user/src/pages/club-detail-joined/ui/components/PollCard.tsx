import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

export interface PollData {
  id: string;
  title: string;
  closeTime: string;
  isClosed: boolean;
  votes: {
    join: string[];
    absent: string[];
  };
}

export interface PollCardProps {
  activePoll: PollData | null;
  userVote: 'join' | 'absent' | null;
  matchmadeTeams: { teamA: string[]; teamB: string[] } | null;
  onVote: (option: 'join' | 'absent') => void;
  onClosePoll: () => void;
  onStartMatchmaking: () => void;
  onDeletePoll: () => void;
  onCreatePollPress: () => void;
}

export function PollCard({
  activePoll,
  userVote,
  matchmadeTeams,
  onVote,
  onClosePoll,
  onStartMatchmaking,
  onDeletePoll,
  onCreatePollPress
}: PollCardProps) {
  if (!activePoll) {
    return (
      <View style={styles.pollSection}>
        <View style={styles.pollSectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialIcons name="how-to-vote" size={20} color={COLORS.primary} />
            <Text style={styles.pollSectionTitle}>Biểu quyết ghép trận</Text>
          </View>
        </View>
        <View style={styles.emptyPollCard}>
          <View style={styles.emptyIconCircle}>
            <MaterialIcons name="poll" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyPollTitle}>Chưa có biểu quyết nào</Text>
          <Text style={styles.emptyPollSubtitle}>
            Tạo biểu quyết để thống kê quân số, chia đội hình thi đấu hoặc giao lưu nội bộ.
          </Text>
          <TouchableOpacity
            style={styles.createPollBtn}
            activeOpacity={0.85}
            onPress={onCreatePollPress}
          >
            <MaterialIcons name="add-circle-outline" size={18} color={COLORS.white} />
            <Text style={styles.createPollBtnText}>Tạo biểu quyết mới</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalVotes = activePoll.votes.join.length + activePoll.votes.absent.length;
  const joinPercent = totalVotes > 0 ? Math.round((activePoll.votes.join.length / totalVotes) * 100) : 0;
  const absentPercent = totalVotes > 0 ? Math.round((activePoll.votes.absent.length / totalVotes) * 100) : 0;

  return (
    <View style={styles.pollSection}>
      <View style={styles.pollSectionHeader}>
        <View style={styles.sectionTitleRow}>
          <MaterialIcons name="how-to-vote" size={20} color={COLORS.primary} />
          <Text style={styles.pollSectionTitle}>Biểu quyết ghép trận</Text>
        </View>
        <TouchableOpacity 
          onPress={onDeletePoll} 
          style={styles.deletePollBtn} 
          activeOpacity={0.7}
        >
          <MaterialIcons name="delete-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={[styles.pollCard, activePoll.isClosed && styles.pollCardClosed]}>
        {/* Header with Title and Status */}
        <View style={styles.pollCardHeader}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.pollTitle}>{activePoll.title}</Text>
            <View style={styles.pollMetaRow}>
              <MaterialIcons 
                name="schedule" 
                size={14} 
                color={activePoll.isClosed ? COLORS.outline : COLORS.primary} 
              />
              <Text style={styles.pollMetaText}>
                {activePoll.isClosed 
                  ? `Đã đóng biểu quyết (${activePoll.closeTime})` 
                  : `Đóng biểu quyết lúc: ${activePoll.closeTime}`}
              </Text>
            </View>
          </View>

          <View style={[
            styles.statusBadge, 
            activePoll.isClosed ? styles.statusBadgeClosed : styles.statusBadgeActive
          ]}>
            <View style={[
              styles.statusDot, 
              activePoll.isClosed ? styles.statusDotClosed : styles.statusDotActive
            ]} />
            <Text style={[
              styles.statusBadgeText,
              activePoll.isClosed ? styles.statusBadgeTextClosed : styles.statusBadgeTextActive
            ]}>
              {activePoll.isClosed ? 'Đã đóng' : 'Đang mở'}
            </Text>
          </View>
        </View>

        {/* Option 1: Tham gia */}
        <TouchableOpacity
          style={[
            styles.pollOptionCard,
            userVote === 'join' && styles.pollOptionSelected,
            activePoll.isClosed && styles.pollOptionDisabled
          ]}
          activeOpacity={activePoll.isClosed ? 1 : 0.75}
          onPress={() => !activePoll.isClosed && onVote('join')}
        >
          <View style={styles.optionHeader}>
            <View style={styles.optionLeft}>
              <View style={[
                styles.radioCircle,
                userVote === 'join' && styles.radioCircleActive
              ]}>
                {userVote === 'join' && (
                  <MaterialIcons name="check" size={14} color={COLORS.white} />
                )}
              </View>
              <Text style={[
                styles.optionText,
                userVote === 'join' && styles.optionTextSelected
              ]}>
                Tham gia
              </Text>
            </View>
            <View style={styles.optionRight}>
              <Text style={styles.optionCount}>{activePoll.votes.join.length} người</Text>
              <Text style={styles.optionPercent}>({joinPercent}%)</Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[
              styles.progressBarFill, 
              { width: `${joinPercent}%` }
            ]} />
          </View>

          {/* Voter list chips */}
          {activePoll.votes.join.length > 0 && (
            <View style={styles.votersContainer}>
              <Text style={styles.voterLabel}>Danh sách tham gia ({activePoll.votes.join.length}):</Text>
              <View style={styles.voterChipsRow}>
                {activePoll.votes.join.map((voter, index) => (
                  <View key={index} style={styles.voterChip}>
                    <MaterialIcons name="person" size={12} color={COLORS.primary} />
                    <Text style={styles.voterChipText}>{voter}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Option 2: Vắng mặt */}
        <TouchableOpacity
          style={[
            styles.pollOptionCard,
            userVote === 'absent' && styles.pollOptionSelectedAbsent,
            activePoll.isClosed && styles.pollOptionDisabled
          ]}
          activeOpacity={activePoll.isClosed ? 1 : 0.75}
          onPress={() => !activePoll.isClosed && onVote('absent')}
        >
          <View style={styles.optionHeader}>
            <View style={styles.optionLeft}>
              <View style={[
                styles.radioCircle,
                userVote === 'absent' && styles.radioCircleActiveAbsent
              ]}>
                {userVote === 'absent' && (
                  <MaterialIcons name="check" size={14} color={COLORS.white} />
                )}
              </View>
              <Text style={[
                styles.optionText,
                userVote === 'absent' && styles.optionTextSelectedAbsent
              ]}>
                Vắng mặt
              </Text>
            </View>
            <View style={styles.optionRight}>
              <Text style={styles.optionCountAbsent}>{activePoll.votes.absent.length} người</Text>
              <Text style={styles.optionPercentAbsent}>({absentPercent}%)</Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[
              styles.progressBarFillAbsent, 
              { width: `${absentPercent}%` }
            ]} />
          </View>

          {/* Voter list chips */}
          {activePoll.votes.absent.length > 0 && (
            <View style={styles.votersContainer}>
              <Text style={styles.voterLabel}>Danh sách vắng ({activePoll.votes.absent.length}):</Text>
              <View style={styles.voterChipsRow}>
                {activePoll.votes.absent.map((voter, index) => (
                  <View key={index} style={[styles.voterChip, styles.voterChipAbsent]}>
                    <MaterialIcons name="person-outline" size={12} color={COLORS.onSurfaceVariant} />
                    <Text style={styles.voterChipTextAbsent}>{voter}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Matchmaking Results Cards (Team A vs Team B) */}
        {activePoll.isClosed && matchmadeTeams && (
          <View style={styles.confirmedTeamsContainer}>
            <View style={styles.confirmedTeamsHeader}>
              <MaterialIcons name="sports-kabaddi" size={20} color={COLORS.primary} />
              <Text style={styles.confirmedTeamsTitle}>Đội hình đã chia</Text>
              <View style={styles.totalPlayersBadge}>
                <Text style={styles.totalPlayersText}>
                  {matchmadeTeams.teamA.length + matchmadeTeams.teamB.length} cầu thủ
                </Text>
              </View>
            </View>

            <View style={styles.teamsSplitGrid}>
              {/* Team A */}
              <View style={styles.teamResultCol}>
                <View style={styles.teamResultBadgeA}>
                  <Text style={styles.teamResultBadgeTextA}>
                    ĐỘI A ({matchmadeTeams.teamA.length})
                  </Text>
                </View>
                <View style={styles.teamMembersContainer}>
                  {matchmadeTeams.teamA.map((p, idx) => (
                    <View key={idx} style={styles.teamMemberRow}>
                      <View style={styles.memberNumberBadgeA}>
                        <Text style={styles.memberNumberTextA}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.teamResultMember} numberOfLines={1}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* VS Divider */}
              <View style={styles.vsDivider}>
                <Text style={styles.vsText}>VS</Text>
              </View>

              {/* Team B */}
              <View style={styles.teamResultCol}>
                <View style={styles.teamResultBadgeB}>
                  <Text style={styles.teamResultBadgeTextB}>
                    ĐỘI B ({matchmadeTeams.teamB.length})
                  </Text>
                </View>
                <View style={styles.teamMembersContainer}>
                  {matchmadeTeams.teamB.map((p, idx) => (
                    <View key={idx} style={styles.teamMemberRow}>
                      <View style={styles.memberNumberBadgeB}>
                        <Text style={styles.memberNumberTextB}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.teamResultMember} numberOfLines={1}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Leader Control Actions */}
        <View style={styles.pollCardActions}>
          {!activePoll.isClosed ? (
            <TouchableOpacity
              style={styles.closePollActionBtn}
              activeOpacity={0.85}
              onPress={onClosePoll}
            >
              <MaterialIcons name="lock-outline" size={16} color={COLORS.white} />
              <Text style={styles.closePollActionText}>Đóng biểu quyết & Chuẩn bị chia đội</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.matchmakeActionBtn}
              activeOpacity={0.85}
              onPress={onStartMatchmaking}
            >
              <MaterialIcons name="shuffle" size={18} color={COLORS.white} />
              <Text style={styles.matchmakeActionText}>
                {matchmadeTeams ? 'Chia lại đội hình ngẫu nhiên' : 'Tự động chia đội ghép trận'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pollSection: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  pollSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  pollSectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  deletePollBtn: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.errorOpacity08 || '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPollCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primaryOpacity30,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity05,
    gap: SPACING.xs,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  emptyPollTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  emptyPollSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  createPollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs + 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createPollBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  pollCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  pollCardClosed: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderColor: COLORS.outlineVariant,
  },
  pollCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  pollTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  pollMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pollMetaText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 5,
  },
  statusBadgeActive: {
    backgroundColor: COLORS.primaryOpacity12,
  },
  statusBadgeClosed: {
    backgroundColor: COLORS.surfaceContainerHigh || '#e2e8f0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  statusDotActive: {
    backgroundColor: COLORS.primary,
  },
  statusDotClosed: {
    backgroundColor: COLORS.onSurfaceVariant,
  },
  statusBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextActive: {
    color: COLORS.primary,
  },
  statusBadgeTextClosed: {
    color: COLORS.onSurfaceVariant,
  },
  pollOptionCard: {
    backgroundColor: COLORS.surfaceContainerLowest || COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  pollOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity05,
  },
  pollOptionSelectedAbsent: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  pollOptionDisabled: {
    opacity: 0.9,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  radioCircleActiveAbsent: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  optionText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  optionTextSelectedAbsent: {
    fontWeight: '700',
    color: '#d97706',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionCount: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  optionPercent: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  optionCountAbsent: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    fontWeight: '700',
    color: '#d97706',
  },
  optionPercentAbsent: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  progressBarBg: {
    height: 7,
    backgroundColor: COLORS.surfaceContainerHigh || '#e2e8f0',
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  progressBarFillAbsent: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: BORDER_RADIUS.full,
  },
  votersContainer: {
    marginTop: SPACING.xs,
    gap: 4,
  },
  voterLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  voterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  voterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    gap: 3,
  },
  voterChipAbsent: {
    backgroundColor: COLORS.surfaceContainerHigh || '#f1f5f9',
  },
  voterChipText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  voterChipTextAbsent: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  confirmedTeamsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
    gap: SPACING.md,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmedTeamsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    paddingBottom: SPACING.xs + 2,
  },
  confirmedTeamsTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: COLORS.primary,
    flex: 1,
    marginLeft: 6,
  },
  totalPlayersBadge: {
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  totalPlayersText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  teamsSplitGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: SPACING.sm,
  },
  teamResultCol: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest || COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: 'hidden',
  },
  teamResultBadgeA: {
    backgroundColor: COLORS.primaryOpacity12,
    paddingVertical: 6,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryOpacity15,
  },
  teamResultBadgeTextA: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: COLORS.primary,
  },
  teamResultBadgeB: {
    backgroundColor: '#fef3c7',
    paddingVertical: 6,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  teamResultBadgeTextB: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#b45309',
  },
  teamMembersContainer: {
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  teamMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberNumberBadgeA: {
    width: 18,
    height: 18,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberNumberTextA: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  memberNumberBadgeB: {
    width: 18,
    height: 18,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberNumberTextB: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b45309',
  },
  teamResultMember: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurface,
    fontWeight: '600',
    flex: 1,
  },
  vsDivider: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  vsText: {
    fontSize: 12,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '900',
    color: COLORS.outline,
  },
  pollCardActions: {
    marginTop: 2,
  },
  closePollActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    backgroundColor: '#dc2626',
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs + 2,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  closePollActionText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  matchmakeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs + 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  matchmakeActionText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
