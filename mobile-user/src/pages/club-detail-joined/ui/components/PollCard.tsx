import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { MatchPollVM, PollOptionVM, LineupVM, LineupMemberVM } from '../../../../entities/match/model/match.types';
import { useAlert } from '../../../../shared/contexts/AlertContext';
import { DevPollVoteModal } from './DevPollVoteModal';
import { EditLineupModal } from '../../../../features/matchmaking/ui/EditLineupModal';
import { UserAvatar } from '../../../../shared/ui/UserAvatar';

export interface PollVoter {
  userId: number;
  fullName?: string;
  name?: string;
  avatarUrl?: string;
  avatar?: string;
  elo?: number;
  role?: string;
}

export interface PollCardProps {
  polls: MatchPollVM[];
  isLeaderOrSubLeader: boolean;
  onVote: (pollId: number, optionId: number) => void;
  onClosePoll: (pollId: number) => void;
  onSplitInternalTeams: (pollId: number) => void;
  onFormGTLineup: (pollId: number) => void;
  onDeletePoll: (pollId: number) => void;
  onCreatePollPress: () => void;
  votingPollId?: number | null;
  members?: any[];
  onRefreshPolls?: () => void;
  isDevUser?: boolean;
}

export function PollCard({
  polls,
  isLeaderOrSubLeader,
  onVote,
  onClosePoll,
  onSplitInternalTeams,
  onFormGTLineup,
  onDeletePoll,
  onCreatePollPress,
  votingPollId,
  members = [],
  onRefreshPolls,
  isDevUser = false,
}: PollCardProps) {
  const { showAlert } = useAlert();
  const [expandedPollId, setExpandedPollId] = useState<number | null>(null);
  const [expandedOptionId, setExpandedOptionId] = useState<number | null>(null);
  const [isDevModalVisible, setIsDevModalVisible] = useState(false);

  // Edit Lineup Modal State
  const [isEditLineupModalVisible, setIsEditLineupModalVisible] = useState(false);
  const [editLineupMode, setEditLineupMode] = useState<'INTERNAL' | 'MATCHMAKING'>('MATCHMAKING');
  const [selectedGtLineup, setSelectedGtLineup] = useState<any>(null);
  const [selectedEditLineupA, setSelectedEditLineupA] = useState<any>(null);
  const [selectedEditLineupB, setSelectedEditLineupB] = useState<any>(null);

  const canShowDev = isDevUser || __DEV__;

  if (!polls || polls.length === 0) {
    return (
      <View style={styles.pollSection}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleCol}>
            <MaterialIcons name="how-to-vote" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Biểu quyết & Đội hình</Text>
          </View>

          {canShowDev && (
            <TouchableOpacity
              style={styles.devBtn}
              activeOpacity={0.8}
              onPress={() => setIsDevModalVisible(true)}
            >
              <Ionicons name="construct" size={12} color="#4338CA" />
              <Text style={styles.devBtnText}>DEV: Gán Vote</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <MaterialIcons name="poll" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có biểu quyết nào</Text>
          <Text style={styles.emptySubtitle}>
            Tạo biểu quyết để thống kê quân số, chia đội hình giao lưu nội bộ hoặc tuyển đội đi ghép trận (Đội GT).
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

        {/* DEV Panel Modal in Empty State */}
        <DevPollVoteModal
          visible={isDevModalVisible}
          onClose={() => setIsDevModalVisible(false)}
          polls={polls || []}
          members={members}
          onSuccess={() => {
            showAlert('Thành công', 'Đã gán vote DEV cho các thành viên thành công!');
            if (onRefreshPolls) onRefreshPolls();
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.pollSection}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleCol}>
          <MaterialIcons name="how-to-vote" size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle} numberOfLines={1}>Biểu quyết ({polls.length})</Text>
        </View>

        <View style={styles.headerRightActions}>
          {canShowDev && (
            <TouchableOpacity
              style={styles.devBtn}
              activeOpacity={0.8}
              onPress={() => setIsDevModalVisible(true)}
            >
              <Ionicons name="construct" size={11} color="#4338CA" />
              <Text style={styles.devBtnText}>DEV: Vote</Text>
            </TouchableOpacity>
          )}

          {isLeaderOrSubLeader && (
            <TouchableOpacity
              style={styles.headerCreateBtn}
              activeOpacity={0.8}
              onPress={onCreatePollPress}
            >
              <Ionicons name="add" size={15} color={COLORS.primary} />
              <Text style={styles.headerCreateBtnText}>Tạo mới</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {polls.map((poll) => {
        const isInternal = poll.pollType === 'INTERNAL';
        const isClosed = poll.status !== 'OPEN';
        const isVoting = votingPollId === poll.id;
        const totalVotes = poll.totalVotes || 0;

        const internalTeamsA = poll.lineups?.find((l) => l.lineupType === 'INTERNAL_A');
        const internalTeamsB = poll.lineups?.find((l) => l.lineupType === 'INTERNAL_B');
        const gtLineup = poll.lineups?.find((l) => l.lineupType === 'MATCHMAKING');

        return (
          <View key={poll.id} style={[styles.pollCard, isClosed && styles.pollCardClosed]}>
            {/* Top Bar: Type Badge & Status */}
            <View style={styles.pollTopRow}>
              <View style={[styles.typeBadge, isInternal ? styles.internalBadge : styles.matchmakingBadge]}>
                <Ionicons
                  name={isInternal ? 'people' : 'trophy'}
                  size={12}
                  color={isInternal ? '#0284C7' : '#D97706'}
                />
                <Text style={[styles.typeBadgeText, isInternal ? styles.internalText : styles.matchmakingText]}>
                  {isInternal ? 'Thi đấu nội bộ' : 'Thi đấu ghép trận'}
                </Text>
              </View>

              <View style={styles.pollStatusRow}>
                {isClosed ? (
                  <View style={styles.closedPill}>
                    <Ionicons name="lock-closed" size={11} color="#64748B" />
                    <Text style={styles.closedPillText}>
                      {poll.status === 'TEAM_FORMED' ? 'Đã chia đội' : 'Đã đóng'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.openPill}>
                    <View style={styles.openDot} />
                    <Text style={styles.openPillText}>Đang mở</Text>
                  </View>
                )}

                {isLeaderOrSubLeader && (
                  <TouchableOpacity
                    style={styles.deleteIconBtn}
                    onPress={() => onDeletePoll(poll.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Poll Title & Creator */}
            <Text style={styles.pollTitle}>{poll.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                Tạo bởi <Text style={{ fontWeight: '700' }}>{poll.creatorName}</Text>
              </Text>
              {poll.deadline && (
                <Text style={styles.metaText}>
                  • Hạn: <Text style={{ color: '#D97706', fontWeight: '700' }}>{poll.deadline}</Text>
                </Text>
              )}
            </View>

            {/* Matchmaking Progress towards max players */}
            {!isInternal && poll.maxPlayers && (
              <View style={styles.gtProgressBox}>
                <View style={styles.gtProgressHeader}>
                  <Text style={styles.gtProgressLabel}>Quân số đăng ký ghép trận:</Text>
                  <Text style={styles.gtProgressValue}>
                    {poll.joinVotesCount || 0} / {poll.maxPlayers} người
                  </Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(100, ((poll.joinVotesCount || 0) / poll.maxPlayers) * 100)}%`,
                        backgroundColor: (poll.joinVotesCount || 0) >= poll.maxPlayers ? '#10B981' : COLORS.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Options List */}
            <View style={styles.optionsContainer}>
              {poll.options?.map((opt) => {
                const isSelected = (poll.myVotedOptionIds && poll.myVotedOptionIds.length > 0)
                  ? poll.myVotedOptionIds.includes(opt.id)
                  : poll.myVoteOptionId === opt.id;
                const percent = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                const isOptionExpanded = expandedOptionId === opt.id;

                return (
                  <View key={opt.id} style={styles.optionWrapper}>
                    <TouchableOpacity
                      disabled={isClosed || isVoting}
                      activeOpacity={0.75}
                      onPress={() => onVote(poll.id, opt.id)}
                      style={[
                        styles.optionBtn,
                        isSelected && styles.optionBtnSelected,
                        opt.isJoinOption && styles.optionBtnJoin,
                      ]}
                    >
                      {/* Background fill */}
                      <View style={[styles.optionFill, { width: `${percent}%` }]} />

                      <View style={styles.optionContent}>
                        <View style={styles.optionLeft}>
                          <View
                            style={[
                              styles.radioCircle,
                              isSelected && styles.radioCircleSelected,
                              opt.isJoinOption && styles.radioCircleJoin,
                            ]}
                          >
                            {isSelected && <View style={styles.radioDot} />}
                          </View>
                          <Text
                            style={[
                              styles.optionLabel,
                              isSelected && styles.optionLabelSelected,
                              opt.isJoinOption && styles.optionLabelJoin,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </View>

                        <View style={styles.optionRight}>
                          <Text style={styles.voteCountText}>
                            {opt.voteCount} ({percent}%)
                          </Text>
                          {opt.voters && opt.voters.length > 0 && (
                            <TouchableOpacity
                              onPress={() => setExpandedOptionId(isOptionExpanded ? null : opt.id)}
                              style={styles.expandIconBtn}
                            >
                              <Ionicons
                                name={isOptionExpanded ? 'chevron-up' : 'chevron-down'}
                                size={16}
                                color="#64748B"
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Expanded Voter Avatars */}
                    {isOptionExpanded && opt.voters && opt.voters.length > 0 && (
                      <View style={styles.votersList}>
                        {opt.voters.map((voter) => (
                          <View key={voter.userId} style={styles.voterRow}>
                            <UserAvatar
                              uri={voter.avatarUrl}
                              name={voter.fullName}
                              size={32}
                            />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.voterName} numberOfLines={1}>
                                {voter.fullName}
                              </Text>
                              <Text style={styles.voterRole}>{voter.role || 'Thành viên'}</Text>
                            </View>
                            <View style={styles.voterEloPill}>
                              <Text style={styles.voterEloText}>{voter.elo} Elo</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* ── Compact Internal Split Result Display ── */}
            {isInternal && internalTeamsA && internalTeamsB && (
              <TouchableOpacity
                style={styles.compactInternalBanner}
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedEditLineupA(internalTeamsA);
                  setSelectedEditLineupB(internalTeamsB);
                  setEditLineupMode('INTERNAL');
                  setIsEditLineupModalVisible(true);
                }}
              >
                <View style={styles.compactInternalHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="git-branch" size={15} color="#0284C7" />
                    <Text style={styles.compactInternalTitle}>Đội hình 2 bên cân ELO</Text>
                  </View>
                  <View style={styles.compactViewActionInternal}>
                    <Text style={styles.compactViewActionTextInternal}>
                      {isLeaderOrSubLeader ? 'Xem & Hoán đổi' : 'Xem chi tiết'}
                    </Text>
                    <Ionicons name="chevron-forward" size={13} color="#0284C7" />
                  </View>
                </View>

                <View style={styles.compactInternalMatchupRow}>
                  {/* Team A */}
                  <View style={styles.compactInternalTeamA}>
                    <Text style={styles.compactInternalTeamName} numberOfLines={1}>
                      {internalTeamsA.name || 'Đội A'}
                    </Text>
                    <Text style={styles.compactInternalTeamElo}>⭐ {internalTeamsA.eloAvg || 1200} ELO • {internalTeamsA.members?.length || 0} người</Text>
                  </View>

                  <View style={styles.compactVsPill}>
                    <Text style={styles.compactVsPillText}>VS</Text>
                  </View>

                  {/* Team B */}
                  <View style={styles.compactInternalTeamB}>
                    <Text style={styles.compactInternalTeamName} numberOfLines={1}>
                      {internalTeamsB.name || 'Đội B'}
                    </Text>
                    <Text style={styles.compactInternalTeamElo}>⭐ {internalTeamsB.eloAvg || 1200} ELO • {internalTeamsB.members?.length || 0} người</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* ── Compact Matchmaking Lineup Display ── */}
            {!isInternal && gtLineup && (
              <TouchableOpacity
                style={styles.compactLineupBanner}
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedGtLineup(gtLineup);
                  setEditLineupMode('MATCHMAKING');
                  setIsEditLineupModalVisible(true);
                }}
              >
                <View style={styles.compactBannerLeft}>
                  <View style={styles.compactIconCircle}>
                    <Ionicons name="shield-checkmark" size={18} color="#059669" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.compactTitleRow}>
                      <Text style={styles.compactLineupName} numberOfLines={1}>
                        {gtLineup.name || 'Đội hình Ghép trận'}
                      </Text>
                      <View style={styles.compactEloBadge}>
                        <Ionicons name="star" size={10} color="#FFFFFF" />
                        <Text style={styles.compactEloText}>{gtLineup.eloAvg || 1200} ELO</Text>
                      </View>
                    </View>

                    {/* Avatar Stack + Count */}
                    <View style={styles.compactMetaRow}>
                      <View style={styles.compactAvatarStack}>
                        {gtLineup.members?.slice(0, 4).map((m: any, idx: number) => (
                          <UserAvatar
                            key={m.userId || idx}
                            uri={m.avatarUrl || m.avatar}
                            name={m.fullName || m.name}
                            size={22}
                            style={{ marginLeft: idx === 0 ? 0 : -6, zIndex: 10 - idx }}
                          />
                        ))}
                      </View>
                      <Text style={styles.compactCountText}>
                        {gtLineup.members?.length || 0} cầu thủ ra sân
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.compactViewAction}>
                  <Text style={styles.compactViewActionText}>
                    {isLeaderOrSubLeader ? 'Đổi người' : 'Chi tiết'}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color="#059669" />
                </View>
              </TouchableOpacity>
            )}

            {/* Admin Action Bar for this poll */}
            {isLeaderOrSubLeader && (
              <View style={styles.adminActionRow}>
                {!isClosed ? (
                  <>
                    <TouchableOpacity
                      style={styles.closeActionBtn}
                      activeOpacity={0.8}
                      onPress={() => onClosePoll(poll.id)}
                    >
                      <Ionicons name="stop-circle-outline" size={15} color="#475569" />
                      <Text style={styles.closeActionBtnText}>Đóng biểu quyết</Text>
                    </TouchableOpacity>

                    {isInternal && (
                      <TouchableOpacity
                        style={[
                          styles.splitActionBtn,
                          (poll.joinVotesCount || 0) < ((poll.minPlayers && poll.minPlayers > 2) ? poll.minPlayers : 2) && { opacity: 0.65 }
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                          const minReq = (poll.minPlayers && poll.minPlayers > 2) ? poll.minPlayers : 2;
                          const currentJoin = poll.joinVotesCount || 0;
                          if (currentJoin < minReq) {
                            showAlert(
                              'Chưa đủ thành viên',
                              `Cần tối thiểu ${minReq} thành viên chọn tham gia để chia 2 đội ra sân. Hiện tại mới có ${currentJoin} người.`
                            );
                            return;
                          }
                          onSplitInternalTeams(poll.id);
                        }}
                      >
                        <Ionicons name="git-branch-outline" size={15} color="#FFFFFF" />
                        <Text style={styles.splitActionBtnText}>Chia 2 đội cân sức</Text>
                      </TouchableOpacity>
                    )}

                    {!isInternal && (
                      <TouchableOpacity
                        style={[
                          styles.formGtActionBtn,
                          (poll.joinVotesCount || 0) < (poll.minPlayers || 1) && { opacity: 0.65 }
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                          const minReq = poll.minPlayers || 1;
                          const currentJoin = poll.joinVotesCount || 0;
                          if (currentJoin < minReq) {
                            showAlert(
                              'Chưa đủ thành viên',
                              `Cần tối thiểu ${minReq} thành viên chọn tham gia để chốt đội hình ra sân. Hiện tại mới có ${currentJoin} người.`
                            );
                            return;
                          }
                          onFormGTLineup(poll.id);
                        }}
                      >
                        <Ionicons name="trophy-outline" size={15} color="#FFFFFF" />
                        <Text style={styles.splitActionBtnText}>Chốt đội hình ra sân</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  isInternal && (
                    <TouchableOpacity
                      style={styles.reSplitActionBtn}
                      activeOpacity={0.8}
                      onPress={() => onSplitInternalTeams(poll.id)}
                    >
                      <Ionicons name="shuffle" size={15} color={COLORS.primary} />
                      <Text style={styles.reSplitActionBtnText}>Chia lại 2 đội</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}
          </View>
        );
      })}

      {/* DEV Panel Modal */}
      <DevPollVoteModal
        visible={isDevModalVisible}
        onClose={() => setIsDevModalVisible(false)}
        polls={polls}
        members={members}
        onSuccess={() => {
          showAlert('Thành công', 'Đã gán vote DEV cho các thành viên thành công!');
          if (onRefreshPolls) onRefreshPolls();
        }}
      />

      {/* Edit Lineup Modal */}
      <EditLineupModal
        visible={isEditLineupModalVisible}
        onClose={() => setIsEditLineupModalVisible(false)}
        mode={editLineupMode}
        lineup={selectedGtLineup}
        lineupA={selectedEditLineupA}
        lineupB={selectedEditLineupB}
        clubId={polls[0]?.clubId ? Number(polls[0].clubId) : 0}
        clubMembers={members}
        isLeaderOrSubLeader={isLeaderOrSubLeader}
        onSuccess={() => {
          if (onRefreshPolls) onRefreshPolls();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pollSection: {
    marginVertical: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  sectionTitleCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  devBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
  },
  devBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4338CA',
  },
  headerCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
  },
  headerCreateBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 4,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodySm,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  createPollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
  },
  createPollBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyNoticePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  emptyNoticeText: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
  },
  pollCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pollCardClosed: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  pollTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  internalBadge: {
    backgroundColor: '#E0F2FE',
  },
  matchmakingBadge: {
    backgroundColor: '#FEF3C7',
  },
  typeBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  internalText: {
    color: '#0369A1',
  },
  matchmakingText: {
    color: '#B45309',
  },
  pollStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  openPillText: {
    ...TYPOGRAPHY.caption,
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 11,
  },
  closedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  closedPillText: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontWeight: '600',
    fontSize: 11,
  },
  deleteIconBtn: {
    padding: 4,
  },
  pollTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontSize: 11.5,
  },
  gtProgressBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    marginBottom: SPACING.sm,
  },
  gtProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gtProgressLabel: {
    ...TYPOGRAPHY.caption,
    color: '#475569',
    fontWeight: '600',
  },
  gtProgressValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  optionsContainer: {
    gap: 8,
    marginVertical: 4,
  },
  optionWrapper: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  optionBtn: {
    position: 'relative',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 44,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  optionBtnSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(6, 78, 59, 0.04)',
  },
  optionBtnJoin: {
    borderColor: '#A7F3D0',
  },
  optionFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioCircleJoin: {
    borderColor: '#10B981',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.primary,
  },
  optionLabel: {
    ...TYPOGRAPHY.bodySm,
    color: '#334155',
    fontWeight: '600',
    fontSize: 13,
  },
  optionLabelSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  optionLabelJoin: {
    color: '#065F46',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voteCountText: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontWeight: '700',
  },
  expandIconBtn: {
    padding: 2,
  },
  votersList: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    gap: 6,
  },
  voterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voterAvatarWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  voterAvatar: {
    width: '100%',
    height: '100%',
  },
  voterAvatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voterAvatarText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  voterName: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: '#1E293B',
  },
  voterRole: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontSize: 10,
  },
  voterEloPill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  voterEloText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: '#334155',
    fontSize: 10.5,
  },
  lineupResultBox: {
    marginTop: SPACING.md,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  lineupResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  lineupResultTitle: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '800',
    color: '#0F172A',
  },
  teamsArenaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  teamBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    borderTopWidth: 3,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  teamBoxTitle: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  teamEloBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  teamEloText: {
    ...TYPOGRAPHY.caption,
    color: '#0369A1',
    fontWeight: '800',
    fontSize: 10.5,
  },
  teamCountText: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontSize: 10,
    marginBottom: 6,
  },
  compactInternalBanner: {
    marginTop: SPACING.md,
    backgroundColor: '#F0F9FF',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 12,
  },
  compactInternalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  compactInternalTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0369A1',
  },
  compactViewActionInternal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  compactViewActionTextInternal: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  compactInternalMatchupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    gap: 8,
  },
  compactInternalTeamA: {
    flex: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
    paddingLeft: 6,
  },
  compactInternalTeamB: {
    flex: 1,
    borderRightWidth: 3,
    borderRightColor: '#E11D48',
    paddingRight: 6,
    alignItems: 'flex-end',
  },
  compactInternalTeamName: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  compactInternalTeamElo: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  compactVsPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  compactVsPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  compactLineupBanner: {
    marginTop: SPACING.md,
    backgroundColor: '#F0FDF4',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  compactBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  compactIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  compactLineupName: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  compactEloBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  compactEloText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  compactMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    backgroundColor: '#CBD5E1',
  },
  compactCountText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
  },
  compactViewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
  },
  compactViewActionText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  adminActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  closeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  closeActionBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: '#475569',
    fontWeight: '700',
    fontSize: 11.5,
  },
  splitActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  formGtActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  splitActionBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11.5,
  },
  reSplitActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  reSplitActionBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 11.5,
  },
});
