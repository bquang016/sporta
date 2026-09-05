import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { MatchPollVM } from '../../../../entities/match/model/match.types';
import { devAssignVotesApi, getClubMembersApi } from '../../../../shared/api/clubs';
import { Button } from '../../../../shared/ui';

export interface DevMemberItem {
  id: string | number;
  userId: number;
  name: string;
  role: string;
  elo?: number;
  avatar?: string;
}

export interface DevPollVoteModalProps {
  visible: boolean;
  onClose: () => void;
  polls: MatchPollVM[];
  members?: DevMemberItem[];
  onSuccess: () => void;
}

export function DevPollVoteModal({
  visible,
  onClose,
  polls,
  members = [],
  onSuccess,
}: DevPollVoteModalProps) {
  const [selectedPollId, setSelectedPollId] = useState<number | null>(() => {
    return polls.length > 0 ? polls[0].id : null;
  });

  const activePoll = useMemo(() => {
    return polls.find((p) => p.id === selectedPollId) || polls[0] || null;
  }, [polls, selectedPollId]);

  const [internalMembers, setInternalMembers] = useState<DevMemberItem[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  React.useEffect(() => {
    if (visible && activePoll?.clubId) {
      setLoadingMembers(true);
      getClubMembersApi(Number(activePoll.clubId))
        .then((data) => {
          if (Array.isArray(data)) {
            const mapped: DevMemberItem[] = data.map((m: any) => ({
              id: m.id,
              userId: Number(m.userId),
              name: m.name || 'Thành viên',
              role: m.role || 'Thành viên',
              elo: m.elo || (1000 + (Number(m.userId) % 300) + 150),
              avatar: m.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
            }));
            setInternalMembers(mapped);
          }
        })
        .catch((err) => console.error('[DevPollVoteModal] Lỗi tải thành viên:', err))
        .finally(() => setLoadingMembers(false));
    }
  }, [visible, activePoll?.clubId]);

  const activeMembers = internalMembers.length > 0 ? internalMembers : members;

  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(() => {
    return activePoll && activePoll.options && activePoll.options.length > 0
      ? activePoll.options[0].id
      : null;
  });

  // Sync selectedOptionId when activePoll changes
  React.useEffect(() => {
    if (activePoll && activePoll.options && activePoll.options.length > 0) {
      if (!activePoll.options.some((o) => o.id === selectedOptionId)) {
        setSelectedOptionId(activePoll.options[0].id);
      }
    }
  }, [activePoll]);

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map each member to their current voted option in activePoll
  const memberVoteMap = useMemo(() => {
    const map = new Map<number, string>();
    if (!activePoll || !activePoll.options) return map;

    for (const opt of activePoll.options) {
      if (opt.voters) {
        for (const v of opt.voters) {
          map.set(v.userId, opt.label);
        }
      }
    }
    return map;
  }, [activePoll]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return activeMembers;
    const q = searchQuery.toLowerCase().trim();
    return activeMembers.filter((m) => m.name.toLowerCase().includes(q));
  }, [activeMembers, searchQuery]);

  const handleToggleMember = (userId: number) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const handleSelectRandom = (count: number) => {
    const shuffled = [...activeMembers].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, count).map((m) => m.userId);
    setSelectedUserIds(picked);
  };

  const handleSelectAll = () => {
    setSelectedUserIds(activeMembers.map((m) => m.userId));
  };

  const handleDeselectAll = () => {
    setSelectedUserIds([]);
  };

  const handleAssign = async () => {
    if (!activePoll || !selectedOptionId || selectedUserIds.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await devAssignVotesApi(activePoll.id, {
        userIds: selectedUserIds,
        optionId: selectedOptionId,
        clearExisting: false,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.devBadge}>
                <Ionicons name="construct" size={13} color="#FFFFFF" />
                <Text style={styles.devBadgeText}>DEV PANEL</Text>
              </View>
              <Text style={styles.modalTitle}>Gán Vote Tự Do</Text>
            </View>

            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Step 1: Select Poll */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                1. Chọn Biểu quyết ({polls.length})
              </Text>
              {polls.length === 0 ? (
                <Text style={styles.emptyText}>Chưa có biểu quyết nào trong CLB</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pollScroll}>
                  {polls.map((poll) => {
                    const isSelected = (activePoll?.id === poll.id);
                    return (
                      <TouchableOpacity
                        key={poll.id}
                        style={[styles.pollCard, isSelected && styles.pollCardSelected]}
                        activeOpacity={0.8}
                        onPress={() => setSelectedPollId(poll.id)}
                      >
                        <View style={styles.pollCardTop}>
                          <Text style={[styles.pollCardType, isSelected && styles.pollCardTypeSelected]}>
                            {poll.pollType === 'MATCHMAKING' ? 'Ghép trận' : 'Nội bộ'}
                          </Text>
                          <Text style={styles.pollCardCount}>
                            {poll.joinVotesCount || 0}/{poll.maxPlayers || poll.minPlayers || '?'} người
                          </Text>
                        </View>
                        <Text style={[styles.pollCardTitle, isSelected && styles.pollCardTitleSelected]} numberOfLines={1}>
                          {poll.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Step 2: Select Option */}
            {activePoll && activePoll.options && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>2. Chọn Lựa chọn muốn gán</Text>
                <View style={styles.optionsRow}>
                  {activePoll.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    const isYes = opt.label.toLowerCase() === 'có';
                    const isNo = opt.label.toLowerCase() === 'không';

                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.optionPill,
                          isSelected && styles.optionPillSelected,
                          isYes && isSelected && { backgroundColor: '#10B981', borderColor: '#10B981' },
                          isNo && isSelected && { backgroundColor: '#EF4444', borderColor: '#EF4444' },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setSelectedOptionId(opt.id)}
                      >
                        <Ionicons
                          name={isSelected ? 'checkmark-circle' : 'radio-button-off'}
                          size={15}
                          color={isSelected ? '#FFFFFF' : '#64748B'}
                        />
                        <Text
                          style={[
                            styles.optionPillText,
                            isSelected && styles.optionPillTextSelected,
                          ]}
                        >
                          {opt.label} ({opt.voteCount || 0})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Step 3: Select Members */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>
                  3. Chọn Thành viên ({selectedUserIds.length}/{activeMembers.length})
                </Text>
                {loadingMembers && <ActivityIndicator size="small" color="#6366F1" />}
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActionsRow}>
                <TouchableOpacity
                  style={styles.quickActionBtn}
                  onPress={() => handleSelectRandom(5)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickActionBtnText}>+5 ngẫu nhiên</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionBtn}
                  onPress={() => handleSelectRandom(10)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickActionBtnText}>+10 ngẫu nhiên</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionBtn}
                  onPress={handleSelectAll}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickActionBtnText}>Tất cả</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickActionBtn, styles.quickActionBtnClear]}
                  onPress={handleDeselectAll}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickActionBtnText, styles.quickActionBtnClearText]}>Bỏ chọn</Text>
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={15} color="#94A3B8" />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Tìm thành viên theo tên..."
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Members List */}
              <View style={styles.membersList}>
                {filteredMembers.map((member) => {
                  const isChecked = selectedUserIds.includes(member.userId);
                  const currentVote = memberVoteMap.get(member.userId);

                  return (
                    <TouchableOpacity
                      key={member.userId}
                      style={[styles.memberRow, isChecked && styles.memberRowChecked]}
                      activeOpacity={0.7}
                      onPress={() => handleToggleMember(member.userId)}
                    >
                      <Image
                        source={{
                          uri: member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
                        }}
                        style={styles.memberAvatar}
                      />

                      <View style={styles.memberInfo}>
                        <View style={styles.memberNameRow}>
                          <Text style={styles.memberName} numberOfLines={1}>
                            {member.name}
                          </Text>
                          {member.role !== 'Thành viên' && (
                            <View style={styles.roleTag}>
                              <Text style={styles.roleTagText}>{member.role}</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.memberMetaRow}>
                          {member.elo ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                              <Ionicons name="star" size={11} color="#D97706" />
                              <Text style={styles.memberElo}>{member.elo} ELO</Text>
                            </View>
                          ) : null}

                          {currentVote ? (
                            <Text style={[styles.memberVoteStatus, currentVote.toLowerCase() === 'có' ? styles.voteYes : styles.voteOther]}>
                              Đã vote: {currentVote}
                            </Text>
                          ) : (
                            <Text style={styles.memberNoVote}>Chưa vote</Text>
                          )}
                        </View>
                      </View>

                      {/* Checkbox */}
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.modalFooter}>
            <Button
              title={`Gán vote (${selectedUserIds.length} thành viên)`}
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={selectedUserIds.length === 0 || !selectedOptionId || isSubmitting}
              onPress={handleAssign}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    height: '90%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  devBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6366F1',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  devBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalTitle: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
    flexShrink: 1,
  },
  scrollBody: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyText: {
    ...TYPOGRAPHY.bodySm,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  pollScroll: {
    flexDirection: 'row',
  },
  pollCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    marginRight: 8,
    width: 170,
  },
  pollCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  pollCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pollCardType: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  pollCardTypeSelected: {
    color: '#6366F1',
  },
  pollCardCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  pollCardTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  pollCardTitleSelected: {
    color: '#4338CA',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  optionPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionPillText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  optionPillTextSelected: {
    color: '#FFFFFF',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  quickActionBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  quickActionBtnClear: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  quickActionBtnClearText: {
    color: '#EF4444',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
    padding: 0,
  },
  membersList: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  memberRowChecked: {
    backgroundColor: '#F0FDF4',
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  roleTag: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#4338CA',
  },
  memberMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 1,
  },
  memberElo: {
    ...TYPOGRAPHY.caption,
    fontSize: 10.5,
    color: '#D97706',
    fontWeight: '600',
  },
  memberVoteStatus: {
    ...TYPOGRAPHY.caption,
    fontSize: 10.5,
    fontWeight: '700',
  },
  voteYes: {
    color: '#10B981',
  },
  voteOther: {
    color: '#6366F1',
  },
  memberNoVote: {
    ...TYPOGRAPHY.caption,
    fontSize: 10.5,
    color: '#94A3B8',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modalFooter: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.md + 4 : SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  submitBtn: {
    width: '100%',
  },
});
