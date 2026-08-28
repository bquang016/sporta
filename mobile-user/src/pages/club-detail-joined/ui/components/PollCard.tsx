import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../../shared/config/theme';
import { Avatar } from '../../../../shared/ui';

export interface PollVoter {
  userId: number;
  name: string;
  avatar: string;
  elo: number;
  role: string;
}

export interface MatchmadeTeams {
  teamA: string[];
  teamB: string[];
  teamAPlayers?: PollVoter[];
  teamBPlayers?: PollVoter[];
  teamATotalElo?: number;
  teamBTotalElo?: number;
}

export interface PollData {
  id: string;
  title: string;
  closeTime: string;
  isClosed: boolean;
  votes: {
    join: string[];
    absent: string[];
  };
  joinedVoters?: PollVoter[];
  absentVoters?: PollVoter[];
  creatorId?: number;
  creatorName?: string;
}

export interface PollCardProps {
  activePoll: PollData | null;
  userVote: 'join' | 'absent' | null;
  matchmadeTeams: MatchmadeTeams | null;
  isLeaderOrSubLeader: boolean;
  onVote: (option: 'join' | 'absent') => void;
  onClosePoll: () => void;
  onReopenPoll?: () => void;
  onStartMatchmaking: () => void;
  onDeletePoll: () => void;
  onCreatePollPress: () => void;
}

export function PollCard({
  activePoll,
  userVote,
  matchmadeTeams,
  isLeaderOrSubLeader,
  onVote,
  onClosePoll,
  onReopenPoll,
  onStartMatchmaking,
  onDeletePoll,
  onCreatePollPress,
}: PollCardProps) {
  const [expandedSection, setExpandedSection] = useState<'join' | 'absent' | null>(null);

  if (!activePoll) {
    return (
      <View style={styles.pollSection}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleCol}>
            <MaterialIcons name="how-to-vote" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Biểu quyết ghép trận</Text>
          </View>
        </View>

        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <MaterialIcons name="poll" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có biểu quyết nào</Text>
          <Text style={styles.emptySubtitle}>
            Tạo biểu quyết để thống kê quân số, chia đội hình thi đấu hoặc bình chọn lịch giao lưu nội bộ.
          </Text>
          {isLeaderOrSubLeader ? (
            <TouchableOpacity
              style={styles.createPollBtn}
              activeOpacity={0.85}
              onPress={onCreatePollPress}
            >
              <MaterialIcons name="add-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.createPollBtnText}>Tạo biểu quyết mới</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyNoticePill}>
              <Text style={styles.emptyNoticeText}>Chờ Ban quản trị tạo biểu quyết mới</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  const joinCount = activePoll.joinedVoters ? activePoll.joinedVoters.length : activePoll.votes.join.length;
  const absentCount = activePoll.absentVoters ? activePoll.absentVoters.length : activePoll.votes.absent.length;
  const totalVotes = joinCount + absentCount;
  const joinPercent = totalVotes > 0 ? Math.round((joinCount / totalVotes) * 100) : 0;
  const absentPercent = totalVotes > 0 ? Math.round((absentCount / totalVotes) * 100) : 0;

  // Joined voters list
  const joinedList: PollVoter[] = activePoll.joinedVoters || activePoll.votes.join.map((name, i) => ({
    userId: i,
    name,
    avatar: '',
    elo: 1200,
    role: 'Thành viên',
  }));

  // Absent voters list
  const absentList: PollVoter[] = activePoll.absentVoters || activePoll.votes.absent.map((name, i) => ({
    userId: i,
    name,
    avatar: '',
    elo: 1200,
    role: 'Thành viên',
  }));

  // Average ELO calculation for teams
  const teamAPlayers = matchmadeTeams?.teamAPlayers || (matchmadeTeams?.teamA || []).map((name, i) => ({
    userId: i,
    name,
    avatar: '',
    elo: 1200,
    role: 'Thành viên',
  }));

  const teamBPlayers = matchmadeTeams?.teamBPlayers || (matchmadeTeams?.teamB || []).map((name, i) => ({
    userId: i,
    name,
    avatar: '',
    elo: 1200,
    role: 'Thành viên',
  }));

  const avgEloA = teamAPlayers.length > 0
    ? Math.round(teamAPlayers.reduce((sum, p) => sum + (p.elo || 1200), 0) / teamAPlayers.length)
    : 0;

  const avgEloB = teamBPlayers.length > 0
    ? Math.round(teamBPlayers.reduce((sum, p) => sum + (p.elo || 1200), 0) / teamBPlayers.length)
    : 0;

  return (
    <View style={styles.pollSection}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleCol}>
          <MaterialIcons name="how-to-vote" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Biểu quyết ghép trận</Text>
        </View>

        {isLeaderOrSubLeader && (
          <TouchableOpacity
            onPress={onDeletePoll}
            style={styles.deleteBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Poll Card */}
      <View style={[styles.pollCard, activePoll.isClosed && styles.pollCardClosed]}>
        {/* Top Meta Bar */}
        <View style={styles.cardTopRow}>
          <View style={[
            styles.statusPill,
            activePoll.isClosed ? styles.statusPillClosed : styles.statusPillActive,
          ]}>
            <View style={[
              styles.statusDot,
              activePoll.isClosed ? styles.statusDotClosed : styles.statusDotActive,
            ]} />
            <Text style={[
              styles.statusText,
              activePoll.isClosed ? styles.statusTextClosed : styles.statusTextActive,
            ]}>
              {activePoll.isClosed ? 'Đã chốt sổ' : 'Đang bình chọn'}
            </Text>
          </View>

          <View style={styles.deadlineContainer}>
            <MaterialIcons
              name="schedule"
              size={13}
              color={activePoll.isClosed ? '#94A3B8' : COLORS.primary}
            />
            <Text style={styles.deadlineText}>
              {activePoll.isClosed ? `Đã đóng (${activePoll.closeTime})` : `Hạn: ${activePoll.closeTime}`}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.pollTitle}>{activePoll.title}</Text>

        {/* ================= OPTION 1: THAM GIA ================= */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            userVote === 'join' && styles.optionCardActiveJoin,
            activePoll.isClosed && styles.optionCardDisabled,
          ]}
          activeOpacity={activePoll.isClosed ? 1 : 0.75}
          onPress={() => !activePoll.isClosed && onVote('join')}
        >
          <View style={styles.optionHeader}>
            <View style={styles.optionLeft}>
              <View style={[
                styles.radioCircle,
                userVote === 'join' && styles.radioCircleActiveJoin,
              ]}>
                {userVote === 'join' && (
                  <MaterialIcons name="check" size={13} color="#FFFFFF" />
                )}
              </View>
              <Text style={[
                styles.optionLabel,
                userVote === 'join' && styles.optionLabelActiveJoin,
              ]}>
                Tham gia thi đấu
              </Text>
            </View>

            <View style={styles.optionRight}>
              <Text style={styles.optionCountText}>{joinCount} người</Text>
              <Text style={styles.optionPercentText}>({joinPercent}%)</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFillJoin, { width: `${joinPercent}%` }]} />
          </View>

          {/* Voter Avatar Stack & Summary */}
          {joinedList.length > 0 && (
            <View style={styles.votersRow}>
              <View style={styles.avatarStack}>
                {joinedList.slice(0, 5).map((voter, idx) => (
                  <View key={voter.userId || idx} style={[styles.stackedAvatar, { left: idx * 18, zIndex: 10 - idx }]}>
                    <Avatar source={voter.avatar} size={24} fallbackIcon="person" />
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.expandVotersBtn}
                activeOpacity={0.7}
                onPress={() => setExpandedSection(expandedSection === 'join' ? null : 'join')}
              >
                <Text style={styles.expandVotersText}>
                  {expandedSection === 'join' ? 'Ẩn bớt' : `Xem tất cả ${joinedList.length} người`}
                </Text>
                <MaterialIcons
                  name={expandedSection === 'join' ? 'expand-less' : 'expand-more'}
                  size={16}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Expanded Voters List */}
          {expandedSection === 'join' && joinedList.length > 0 && (
            <View style={styles.expandedVotersList}>
              {joinedList.map((v, i) => (
                <View key={v.userId || i} style={styles.expandedVoterItem}>
                  <Avatar source={v.avatar} size={26} fallbackIcon="person" />
                  <Text style={styles.expandedVoterName} numberOfLines={1}>{v.name}</Text>
                  <View style={styles.voterEloBadge}>
                    <Text style={styles.voterEloText}>{v.elo || 1200} ELO</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* ================= OPTION 2: VẮNG MẶT ================= */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            userVote === 'absent' && styles.optionCardActiveAbsent,
            activePoll.isClosed && styles.optionCardDisabled,
          ]}
          activeOpacity={activePoll.isClosed ? 1 : 0.75}
          onPress={() => !activePoll.isClosed && onVote('absent')}
        >
          <View style={styles.optionHeader}>
            <View style={styles.optionLeft}>
              <View style={[
                styles.radioCircle,
                userVote === 'absent' && styles.radioCircleActiveAbsent,
              ]}>
                {userVote === 'absent' && (
                  <MaterialIcons name="close" size={13} color="#FFFFFF" />
                )}
              </View>
              <Text style={[
                styles.optionLabel,
                userVote === 'absent' && styles.optionLabelActiveAbsent,
              ]}>
                Bận / Vắng mặt
              </Text>
            </View>

            <View style={styles.optionRight}>
              <Text style={styles.optionCountText}>{absentCount} người</Text>
              <Text style={styles.optionPercentText}>({absentPercent}%)</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFillAbsent, { width: `${absentPercent}%` }]} />
          </View>

          {/* Voter Avatar Stack & Summary */}
          {absentList.length > 0 && (
            <View style={styles.votersRow}>
              <View style={styles.avatarStack}>
                {absentList.slice(0, 4).map((voter, idx) => (
                  <View key={voter.userId || idx} style={[styles.stackedAvatar, { left: idx * 18, zIndex: 10 - idx }]}>
                    <Avatar source={voter.avatar} size={24} fallbackIcon="person" />
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.expandVotersBtn}
                activeOpacity={0.7}
                onPress={() => setExpandedSection(expandedSection === 'absent' ? null : 'absent')}
              >
                <Text style={[styles.expandVotersText, { color: '#64748B' }]}>
                  {expandedSection === 'absent' ? 'Ẩn bớt' : `Xem ${absentList.length} người`}
                </Text>
                <MaterialIcons
                  name={expandedSection === 'absent' ? 'expand-less' : 'expand-more'}
                  size={16}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Expanded Voters List */}
          {expandedSection === 'absent' && absentList.length > 0 && (
            <View style={styles.expandedVotersList}>
              {absentList.map((v, i) => (
                <View key={v.userId || i} style={styles.expandedVoterItem}>
                  <Avatar source={v.avatar} size={26} fallbackIcon="person" />
                  <Text style={styles.expandedVoterName} numberOfLines={1}>{v.name}</Text>
                  <Text style={styles.absentReasonText}>• Vắng</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        {/* ================= MATCHMAKING SPLIT ROSTER (WHEN CLOSED) ================= */}
        {activePoll.isClosed && matchmadeTeams && (
          <View style={styles.matchupCard}>
            <View style={styles.matchupHeader}>
              <MaterialIcons name="sports-kabaddi" size={18} color={COLORS.primary} />
              <Text style={styles.matchupTitle}>Đội hình thi đấu đã chia</Text>
              <View style={styles.playerCountBadge}>
                <Text style={styles.playerCountText}>
                  {teamAPlayers.length + teamBPlayers.length} cầu thủ
                </Text>
              </View>
            </View>

            <View style={styles.teamsSplitRow}>
              {/* Team A Card */}
              <View style={styles.teamCol}>
                <View style={styles.teamBadgeA}>
                  <Text style={styles.teamBadgeTextA}>ĐỘI XANH ({teamAPlayers.length})</Text>
                  <Text style={styles.teamAvgEloText}>Avg {avgEloA} ELO</Text>
                </View>
                <View style={styles.playerList}>
                  {teamAPlayers.map((p, idx) => (
                    <View key={idx} style={styles.playerRow}>
                      <Avatar source={p.avatar} size={22} fallbackIcon="person" />
                      <Text style={styles.playerName} numberOfLines={1}>{p.name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* VS Divider */}
              <View style={styles.vsCircle}>
                <Text style={styles.vsText}>VS</Text>
              </View>

              {/* Team B Card */}
              <View style={styles.teamCol}>
                <View style={styles.teamBadgeB}>
                  <Text style={styles.teamBadgeTextB}>ĐỘI CAM ({teamBPlayers.length})</Text>
                  <Text style={styles.teamAvgEloText}>Avg {avgEloB} ELO</Text>
                </View>
                <View style={styles.playerList}>
                  {teamBPlayers.map((p, idx) => (
                    <View key={idx} style={styles.playerRow}>
                      <Avatar source={p.avatar} size={22} fallbackIcon="person" />
                      <Text style={styles.playerName} numberOfLines={1}>{p.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ================= CONTROLS FOR LEADER / SUB-LEADER ================= */}
        {isLeaderOrSubLeader && (
          <View style={styles.controlActionRow}>
            {!activePoll.isClosed ? (
              <TouchableOpacity
                style={styles.closePollBtn}
                activeOpacity={0.85}
                onPress={onClosePoll}
              >
                <MaterialIcons name="lock-outline" size={16} color="#FFFFFF" />
                <Text style={styles.closePollBtnText}>Chốt danh sách & Chia đội</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.closedActionsGroup}>
                <TouchableOpacity
                  style={styles.reshuffleBtn}
                  activeOpacity={0.85}
                  onPress={onStartMatchmaking}
                >
                  <MaterialIcons name="shuffle" size={16} color="#FFFFFF" />
                  <Text style={styles.reshuffleBtnText}>
                    {matchmadeTeams ? 'Chia lại đội hình' : 'Tự động chia đội'}
                  </Text>
                </TouchableOpacity>

                {onReopenPoll && (
                  <TouchableOpacity
                    style={styles.reopenBtn}
                    activeOpacity={0.8}
                    onPress={onReopenPoll}
                  >
                    <MaterialIcons name="lock-open" size={16} color={COLORS.primary} />
                    <Text style={styles.reopenBtnText}>Mở lại</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pollSection: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EDF5',
    gap: 8,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  createPollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
    marginTop: 4,
  },
  createPollBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyNoticePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  emptyNoticeText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  pollCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  pollCardClosed: {
    backgroundColor: '#FAFBFD',
    borderColor: '#E2E8F0',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  statusPillActive: {
    backgroundColor: '#ECFDF5',
  },
  statusPillClosed: {
    backgroundColor: '#F1F5F9',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotClosed: {
    backgroundColor: '#94A3B8',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#059669',
  },
  statusTextClosed: {
    color: '#64748B',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '400',
  },
  pollTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 20,
  },
  optionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    gap: 8,
  },
  optionCardActiveJoin: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  optionCardActiveAbsent: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  optionCardDisabled: {
    opacity: 0.95,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActiveJoin: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  radioCircleActiveAbsent: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  optionLabel: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#334155',
  },
  optionLabelActiveJoin: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  optionLabelActiveAbsent: {
    color: '#B45309',
    fontWeight: '600',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionCountText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  optionPercentText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '400',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFillJoin: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressBarFillAbsent: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  votersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  avatarStack: {
    flexDirection: 'row',
    height: 24,
    minWidth: 100,
    position: 'relative',
  },
  stackedAvatar: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 12,
  },
  expandVotersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  expandVotersText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: COLORS.primary,
  },
  expandedVotersList: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
    gap: 6,
  },
  expandedVoterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandedVoterName: {
    flex: 1,
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '500',
  },
  voterEloBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  voterEloText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#B45309',
  },
  absentReasonText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '400',
  },
  matchupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  matchupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  matchupTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  playerCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  playerCountText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  teamsSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamCol: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    gap: 6,
  },
  teamBadgeA: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  teamBadgeTextA: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#0284C7',
  },
  teamBadgeB: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  teamBadgeTextB: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#D97706',
  },
  teamAvgEloText: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '400',
    marginTop: 1,
  },
  playerList: {
    gap: 4,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerName: {
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  vsCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  controlActionRow: {
    marginTop: 2,
  },
  closePollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  closePollBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closedActionsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  reshuffleBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  reshuffleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reopenBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  reopenBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
