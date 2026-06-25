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
          <Text style={styles.pollSectionTitle}>Biểu quyết ghép trận</Text>
        </View>
        <View style={styles.emptyPollCard}>
          <MaterialIcons name="poll" size={40} color={COLORS.primaryOpacity40} style={styles.emptyPollIcon} />
          <Text style={styles.emptyPollTitle}>Chưa có biểu quyết nào</Text>
          <Text style={styles.emptyPollSubtitle}>
            Tạo biểu quyết để thống kê số lượng thành viên tham gia ghép trận.
          </Text>
          <TouchableOpacity
            style={styles.createPollBtn}
            activeOpacity={0.8}
            onPress={onCreatePollPress}
          >
            <MaterialIcons name="add" size={18} color={COLORS.white} />
            <Text style={styles.createPollBtnText}>Tạo biểu quyết mới</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const totalVotes = activePoll.votes.join.length + activePoll.votes.absent.length;
  const joinPercent = totalVotes > 0 ? (activePoll.votes.join.length / totalVotes) * 100 : 0;
  const absentPercent = totalVotes > 0 ? (activePoll.votes.absent.length / totalVotes) * 100 : 0;

  return (
    <View style={styles.pollSection}>
      <View style={styles.pollSectionHeader}>
        <Text style={styles.pollSectionTitle}>Biểu quyết ghép trận</Text>
        <TouchableOpacity onPress={onDeletePoll} style={styles.deletePollBtn} activeOpacity={0.7}>
          <MaterialIcons name="delete-outline" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={[styles.pollCard, activePoll.isClosed && styles.pollCardClosed]}>
        <View style={styles.pollCardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pollTitle}>{activePoll.title}</Text>
            <View style={styles.pollMetaRow}>
              <MaterialIcons name="access-time" size={14} color={COLORS.onSurfaceVariant} />
              <Text style={styles.pollMetaText}>
                {activePoll.isClosed 
                  ? `Đã đóng lúc ${activePoll.closeTime}` 
                  : `Đóng lúc ${activePoll.closeTime}`}
              </Text>
            </View>
          </View>
          <View style={[
            styles.statusBadge, 
            activePoll.isClosed ? styles.statusBadgeClosed : styles.statusBadgeActive
          ]}>
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
          activeOpacity={activePoll.isClosed ? 1 : 0.7}
          onPress={() => !activePoll.isClosed && onVote('join')}
        >
          <View style={styles.optionHeader}>
            <View style={styles.optionLeft}>
              <MaterialIcons 
                name={userVote === 'join' ? "check-circle" : "radio-button-unchecked"} 
                size={20} 
                color={userVote === 'join' ? COLORS.primary : COLORS.onSurfaceVariant} 
              />
              <Text style={styles.optionText}>Tham gia</Text>
            </View>
            <Text style={styles.optionCount}>{activePoll.votes.join.length} phiếu</Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[
              styles.progressBarFill, 
              { width: `${joinPercent}%` }
            ]} />
          </View>

          {/* Voter list */}
          {activePoll.votes.join.length > 0 && (
            <View style={styles.votersContainer}>
              <Text style={styles.voterLabel}>Danh sách:</Text>
              <View style={styles.voterChipsRow}>
                {activePoll.votes.join.map((voter, index) => (
                  <View key={index} style={styles.voterChip}>
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
            userVote === 'absent' && styles.pollOptionSelected,
            activePoll.isClosed && styles.pollOptionDisabled
          ]}
          activeOpacity={activePoll.isClosed ? 1 : 0.7}
          onPress={() => !activePoll.isClosed && onVote('absent')}
        >
          <View style={styles.optionHeader}>
            <View style={styles.optionLeft}>
              <MaterialIcons 
                name={userVote === 'absent' ? "check-circle" : "radio-button-unchecked"} 
                size={20} 
                color={userVote === 'absent' ? COLORS.primary : COLORS.onSurfaceVariant} 
              />
              <Text style={styles.optionText}>Vắng mặt</Text>
            </View>
            <Text style={styles.optionCount}>{activePoll.votes.absent.length} phiếu</Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[
              styles.progressBarFill, 
              { 
                backgroundColor: COLORS.onSurfaceVariant,
                width: `${absentPercent}%` 
              }
            ]} />
          </View>

          {/* Voter list */}
          {activePoll.votes.absent.length > 0 && (
            <View style={styles.votersContainer}>
              <Text style={styles.voterLabel}>Danh sách:</Text>
              <View style={styles.voterChipsRow}>
                {activePoll.votes.absent.map((voter, index) => (
                  <View key={index} style={[styles.voterChip, styles.voterChipAbsent]}>
                    <Text style={styles.voterChipText}>{voter}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Matchmaking results if they are confirmed */}
        {activePoll.isClosed && matchmadeTeams && (
          <View style={styles.confirmedTeamsContainer}>
            <View style={styles.confirmedTeamsHeader}>
              <MaterialIcons name="sports-kabaddi" size={20} color={COLORS.primary} />
              <Text style={styles.confirmedTeamsTitle}>Đội hình đã chia</Text>
            </View>
            <View style={styles.teamsSplitGrid}>
              <View style={styles.teamResultCol}>
                <Text style={[styles.teamResultTitle, { color: COLORS.primary }]}>Đội A ({matchmadeTeams.teamA.length})</Text>
                {matchmadeTeams.teamA.map((p, idx) => (
                  <Text key={idx} style={styles.teamResultMember}>• {p}</Text>
                ))}
              </View>
              <View style={styles.teamResultCol}>
                <Text style={[styles.teamResultTitle, { color: COLORS.amber }]}>Đội B ({matchmadeTeams.teamB.length})</Text>
                {matchmadeTeams.teamB.map((p, idx) => (
                  <Text key={idx} style={styles.teamResultMember}>• {p}</Text>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Leader Actions */}
        <View style={styles.pollCardActions}>
          {!activePoll.isClosed ? (
            <TouchableOpacity
              style={styles.closePollActionBtn}
              activeOpacity={0.8}
              onPress={onClosePoll}
            >
              <MaterialIcons name="lock-outline" size={16} color={COLORS.white} />
              <Text style={styles.closePollActionText}>Đóng biểu quyết</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.matchmakeActionBtn}
              activeOpacity={0.8}
              onPress={onStartMatchmaking}
            >
              <MaterialIcons name="shuffle" size={16} color={COLORS.white} />
              <Text style={styles.matchmakeActionText}>
                {matchmadeTeams ? 'Chia lại đội hình' : 'Ghép trận & Chia đội'}
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
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.primaryOpacity08,
  },
  pollSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pollSectionTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
  },
  deletePollBtn: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.errorOpacity08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPollCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primaryOpacity30,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity05,
  },
  emptyPollIcon: {
    marginBottom: SPACING.sm,
  },
  emptyPollTitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  emptyPollSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  createPollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs + 2,
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
    borderColor: COLORS.primaryOpacity10,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
    gap: SPACING.md,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pollCardClosed: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderColor: COLORS.blackOpacity05,
  },
  pollCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryOpacity06,
    paddingBottom: SPACING.sm,
  },
  pollTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  pollMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pollMetaText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  statusBadge: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusBadgeActive: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  statusBadgeClosed: {
    backgroundColor: COLORS.grayOpacity10,
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
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
  },
  pollOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryOpacity05,
  },
  pollOptionDisabled: {
    opacity: 0.85,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  optionText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
  },
  optionCount: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  votersContainer: {
    marginTop: SPACING.xs,
  },
  voterLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  voterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
  },
  voterChip: {
    backgroundColor: COLORS.primaryOpacity06,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  voterChipAbsent: {
    backgroundColor: COLORS.grayOpacity10,
  },
  voterChipText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  confirmedTeamsContainer: {
    marginTop: SPACING.base,
    backgroundColor: COLORS.primaryOpacity05,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity08,
  },
  confirmedTeamsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryOpacity08,
    paddingBottom: SPACING.xs + 2,
    marginBottom: SPACING.base,
  },
  confirmedTeamsTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  teamsSplitGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  teamResultCol: {
    flex: 1,
  },
  teamResultTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  teamResultMember: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  pollCardActions: {
    marginTop: SPACING.xs,
  },
  closePollActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.default,
    gap: SPACING.xs + 2,
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
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    gap: SPACING.xs + 2,
  },
  matchmakeActionText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
