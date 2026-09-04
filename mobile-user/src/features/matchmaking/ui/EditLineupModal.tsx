import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import {
  addLineupMemberApi,
  removeLineupMemberApi,
  swapLineupMembersApi,
  getClubMembersApi,
  getLineupDetailApi,
} from '../../../shared/api/clubs';
import { useAlert } from '../../../shared/contexts/AlertContext';
import { UserAvatar } from '../../../shared/ui/UserAvatar';
import { getEloLevelLabel } from '../../../shared/lib/utils/elo';

export interface EditLineupModalProps {
  visible: boolean;
  onClose: () => void;
  mode?: 'INTERNAL' | 'MATCHMAKING';
  lineup?: any;
  lineupA?: any;
  lineupB?: any;
  clubId?: number;
  clubMembers?: any[];
  isLeaderOrSubLeader?: boolean;
  onSuccess?: () => void;
}

export function EditLineupModal({
  visible,
  onClose,
  mode = 'MATCHMAKING',
  lineup,
  lineupA,
  lineupB,
  clubId,
  clubMembers = [],
  isLeaderOrSubLeader = true,
  onSuccess = () => {},
}: EditLineupModalProps) {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Local states for live updates
  const [currentLineup, setCurrentLineup] = useState<any>(lineup);
  const [currentLineupA, setCurrentLineupA] = useState<any>(lineupA);
  const [currentLineupB, setCurrentLineupB] = useState<any>(lineupB);
  const [allClubMembers, setAllClubMembers] = useState<any[]>(clubMembers);

  // Internal tab switch (Team A vs Team B or Both)
  const [activeInternalTab, setActiveInternalTab] = useState<'ALL' | 'A' | 'B'>('ALL');

  // Internal swap selection state
  const [selectedUserA, setSelectedUserA] = useState<number | null>(null);
  const [selectedUserB, setSelectedUserB] = useState<number | null>(null);

  // Matchmaking add member picker state
  const [isAddingMember, setIsAddingMember] = useState<boolean>(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState<string>('');

  // Sync props to state
  useEffect(() => {
    setCurrentLineup(lineup);
    setCurrentLineupA(lineupA);
    setCurrentLineupB(lineupB);
    setSelectedUserA(null);
    setSelectedUserB(null);
    setIsAddingMember(false);
  }, [lineup, lineupA, lineupB, visible]);

  const effectiveClubId = clubId || currentLineup?.clubId || currentLineupA?.clubId;

  // Load club members if empty
  useEffect(() => {
    if (visible && effectiveClubId) {
      if (!allClubMembers || allClubMembers.length === 0) {
        setLoading(true);
        getClubMembersApi(effectiveClubId)
          .then((data) => {
            if (Array.isArray(data)) {
              setAllClubMembers(data);
            }
          })
          .catch((err) => console.error('Lỗi tải thành viên CLB:', err))
          .finally(() => setLoading(false));
      }
    }
  }, [visible, effectiveClubId]);

  // Refresh current lineup data
  const refreshCurrentData = async () => {
    try {
      if (mode === 'MATCHMAKING' && currentLineup?.id) {
        const detail = await getLineupDetailApi(currentLineup.id);
        setCurrentLineup(detail);
      } else if (mode === 'INTERNAL') {
        if (currentLineupA?.id) {
          const detailA = await getLineupDetailApi(currentLineupA.id);
          setCurrentLineupA(detailA);
        }
        if (currentLineupB?.id) {
          const detailB = await getLineupDetailApi(currentLineupB.id);
          setCurrentLineupB(detailB);
        }
      }
      onSuccess();
    } catch (e) {
      console.error('Lỗi làm mới dữ liệu đội hình:', e);
    }
  };

  // Available club members to add (not currently in the GT lineup)
  const availableMembersToAdd = useMemo(() => {
    if (!currentLineup || !currentLineup.members) return allClubMembers;
    const existingUserIds = new Set(currentLineup.members.map((m: any) => Number(m.userId)));
    let filtered = allClubMembers.filter((m) => !existingUserIds.has(Number(m.userId)));
    if (searchMemberQuery.trim()) {
      const q = searchMemberQuery.toLowerCase().trim();
      filtered = filtered.filter((m) => (m.name || '').toLowerCase().includes(q));
    }
    return filtered;
  }, [allClubMembers, currentLineup, searchMemberQuery]);

  // Remove member from GT Lineup
  const handleRemoveMember = async (userId: number, memberName: string) => {
    if (!currentLineup?.id) return;
    try {
      setActionLoading(true);
      await removeLineupMemberApi(currentLineup.id, userId);
      showAlert('Thành công', `Đã xóa ${memberName} khỏi đội hình ra sân.`, undefined, { type: 'success' });
      await refreshCurrentData();
    } catch (e: any) {
      showAlert('Lỗi', e.message || 'Không thể xóa thành viên khỏi đội hình', undefined, { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Add member to GT Lineup
  const handleAddMember = async (userId: number, memberName: string) => {
    if (!currentLineup?.id) return;
    try {
      setActionLoading(true);
      await addLineupMemberApi(currentLineup.id, userId);
      showAlert('Thành công', `Đã thêm ${memberName} vào đội hình ra sân.`, undefined, { type: 'success' });
      setIsAddingMember(false);
      await refreshCurrentData();
    } catch (e: any) {
      showAlert('Lỗi', e.message || 'Không thể thêm thành viên vào đội hình', undefined, { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Swap members between Team A and Team B
  const handleSwapInternalMembers = async () => {
    if (!currentLineupA?.id || !currentLineupB?.id) return;
    if (!selectedUserA || !selectedUserB) {
      showAlert('Chưa chọn đủ thành viên', 'Vui lòng chọn 1 thành viên từ Đội A và 1 thành viên từ Đội B để hoán đổi.', undefined, { type: 'warning' });
      return;
    }

    try {
      setActionLoading(true);
      await swapLineupMembersApi({
        sourceLineupId: currentLineupA.id,
        targetLineupId: currentLineupB.id,
        userIdA: selectedUserA,
        userIdB: selectedUserB,
      });

      showAlert('Thành công', 'Đã hoán đổi vị trí 2 thành viên thành công!', undefined, { type: 'success' });
      setSelectedUserA(null);
      setSelectedUserB(null);
      await refreshCurrentData();
    } catch (e: any) {
      showAlert('Lỗi hoán đổi', e.message || 'Không thể hoán đổi thành viên', undefined, { type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const eloDiff = useMemo(() => {
    if (mode !== 'INTERNAL' || !currentLineupA || !currentLineupB) return 0;
    const eloA = currentLineupA.eloAvg || 1200;
    const eloB = currentLineupB.eloAvg || 1200;
    return Math.abs(eloA - eloB);
  }, [mode, currentLineupA, currentLineupB]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitleRow}>
              <View style={styles.headerIconWrap}>
                <Ionicons
                  name={mode === 'INTERNAL' ? 'git-branch' : 'shield-checkmark'}
                  size={18}
                  color={COLORS.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {mode === 'INTERNAL' ? 'Chi Tiết 2 Đội Thi Đấu Nội Bộ' : 'Chi Tiết Đội Hình Ra Sân'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {mode === 'INTERNAL'
                    ? 'Danh sách phân bổ 2 đội hình cân bằng theo điểm ELO'
                    : 'Danh sách cầu thủ chính thức đại diện CLB đi ghép trận'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải chi tiết đội hình...</Text>
            </View>
          ) : mode === 'MATCHMAKING' ? (
            /* ── MATCHMAKING LINEUP VIEW & EDIT ── */
            <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
              {/* Hero Banner */}
              <View style={styles.heroCard}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroTitleWrap}>
                    <Ionicons name="trophy" size={18} color="#059669" />
                    <Text style={styles.heroLineupName} numberOfLines={1}>
                      {currentLineup?.name || 'Đội hình Ghép trận'}
                    </Text>
                  </View>
                  <View style={styles.heroEloBadge}>
                    <Ionicons name="star" size={12} color="#FFFFFF" />
                    <Text style={styles.heroEloText}>ELO: {currentLineup?.eloAvg || 1200}</Text>
                  </View>
                </View>

                <View style={styles.heroStatsRow}>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatLabel}>Quân số</Text>
                    <Text style={styles.heroStatValue}>{currentLineup?.members?.length || 0} cầu thủ</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatLabel}>Trạng thái</Text>
                    <Text style={[styles.heroStatValue, { color: '#059669' }]}>Sẵn sàng thi đấu</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatLabel}>Hạng ELO</Text>
                    <Text style={styles.heroStatValue}>{getEloLevelLabel(currentLineup?.eloAvg)}</Text>
                  </View>
                </View>
              </View>

              {/* Members List Header */}
              <View style={styles.sectionHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.sectionHeading}>Danh sách cầu thủ ({currentLineup?.members?.length || 0})</Text>
                </View>

                {isLeaderOrSubLeader && !isAddingMember && (
                  <TouchableOpacity
                    style={styles.addMemberBtn}
                    activeOpacity={0.8}
                    onPress={() => setIsAddingMember(true)}
                  >
                    <Ionicons name="person-add" size={13} color={COLORS.primary} />
                    <Text style={styles.addMemberBtnText}>Thêm cầu thủ</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Add Member Drawer */}
              {isAddingMember && (
                <View style={styles.addMemberDrawer}>
                  <View style={styles.drawerHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="add-circle" size={16} color="#166534" />
                      <Text style={styles.drawerTitle}>Chọn thành viên trong CLB để thêm</Text>
                    </View>
                    <TouchableOpacity onPress={() => setIsAddingMember(false)} activeOpacity={0.7}>
                      <Ionicons name="close-circle" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>

                  {availableMembersToAdd.length === 0 ? (
                    <Text style={styles.emptyDrawerText}>Tất cả thành viên trong CLB đã có mặt trong đội hình.</Text>
                  ) : (
                    <View style={styles.drawerList}>
                      {availableMembersToAdd.map((member: any) => (
                        <TouchableOpacity
                          key={member.userId || member.id}
                          style={styles.drawerItemRow}
                          activeOpacity={0.8}
                          disabled={actionLoading}
                          onPress={() => handleAddMember(Number(member.userId), member.name || 'cầu thủ')}
                        >
                          <UserAvatar
                            uri={member.avatarUrl || member.avatar}
                            name={member.name}
                            size={30}
                          />
                          <View style={styles.drawerInfo}>
                            <Text style={styles.drawerName} numberOfLines={1}>
                              {member.name}
                            </Text>
                            <Text style={styles.drawerRole}>{member.role || 'Thành viên'} • {member.elo || 1200} ELO</Text>
                          </View>
                          <View style={styles.addPlusBtn}>
                            <Ionicons name="add" size={15} color="#FFFFFF" />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Members Detailed Cards */}
              {(!currentLineup?.members || currentLineup.members.length === 0) ? (
                <View style={styles.emptyMembersBox}>
                  <Text style={styles.emptyMembersText}>Chưa có thành viên nào trong đội hình.</Text>
                </View>
              ) : (
                <View style={styles.membersDetailedList}>
                  {currentLineup.members.map((m: any, idx: number) => (
                    <View key={m.userId || idx} style={styles.memberCard}>
                      <View style={styles.memberCardLeft}>
                        <UserAvatar
                          uri={m.avatarUrl || m.avatar}
                          name={m.fullName || m.name}
                          size={40}
                          showBadge
                          badgeText={idx + 1}
                        />

                        <View style={styles.memberCardMeta}>
                          <View style={styles.memberNameRow}>
                            <Text style={styles.memberCardName} numberOfLines={1}>
                              {m.fullName || m.name || 'Cầu thủ'}
                            </Text>
                            {m.roleInLineup && (
                              <View style={styles.roleInLineupBadge}>
                                <Text style={styles.roleInLineupText}>{m.roleInLineup}</Text>
                              </View>
                            )}
                          </View>

                          <View style={styles.memberSubMetaRow}>
                            <View style={styles.eloCardBadge}>
                              <Ionicons name="star" size={10} color="#B45309" />
                              <Text style={styles.eloCardText}>{m.elo || 1200} ELO</Text>
                            </View>
                            <Text style={styles.memberStatusActiveText}>Đã sẵn sàng</Text>
                          </View>
                        </View>
                      </View>

                      {isLeaderOrSubLeader && (
                        <TouchableOpacity
                          style={styles.memberRemoveBtn}
                          activeOpacity={0.7}
                          disabled={actionLoading}
                          onPress={() => handleRemoveMember(Number(m.userId), m.fullName || m.name || 'cầu thủ')}
                        >
                          <Ionicons name="person-remove-outline" size={13} color="#EF4444" />
                          <Text style={styles.memberRemoveBtnText}>Bớt</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          ) : (
            /* ── INTERNAL 2-TEAM VIEW & SWAP ── */
            <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
              {/* Internal Hero Matchup */}
              <View style={styles.internalHeroCard}>
                <View style={styles.internalHeroTeamsRow}>
                  {/* Team A Summary */}
                  <View style={[styles.heroTeamSide, { borderLeftColor: '#0284C7', borderLeftWidth: 3 }]}>
                    <Text style={[styles.heroTeamSideTitle, { color: '#0284C7' }]}>
                      {currentLineupA?.name || 'Đội A'}
                    </Text>
                    <Text style={styles.heroTeamSideElo}>⭐ {currentLineupA?.eloAvg || 1200} ELO</Text>
                    <Text style={styles.heroTeamSideCount}>{currentLineupA?.members?.length || 0} người</Text>
                  </View>

                  <View style={styles.vsBadgeCircle}>
                    <Text style={styles.vsBadgeText}>VS</Text>
                  </View>

                  {/* Team B Summary */}
                  <View style={[styles.heroTeamSide, { borderRightColor: '#E11D48', borderRightWidth: 3, alignItems: 'flex-end' }]}>
                    <Text style={[styles.heroTeamSideTitle, { color: '#E11D48' }]}>
                      {currentLineupB?.name || 'Đội B'}
                    </Text>
                    <Text style={styles.heroTeamSideElo}>⭐ {currentLineupB?.eloAvg || 1200} ELO</Text>
                    <Text style={styles.heroTeamSideCount}>{currentLineupB?.members?.length || 0} người</Text>
                  </View>
                </View>

                <View style={styles.balanceBarWrap}>
                  <Ionicons name="git-compare" size={13} color="#059669" />
                  <Text style={styles.balanceBarText}>
                    Chênh lệch: <Text style={{ fontWeight: '800' }}>{eloDiff} ELO</Text> ({eloDiff <= 30 ? 'Cân bằng hoàn hảo' : 'Tương đối cân sức'})
                  </Text>
                </View>
              </View>

              {/* Instructions if Admin */}
              {isLeaderOrSubLeader && (
                <View style={styles.swapInstructionBox}>
                  <Ionicons name="shuffle" size={15} color="#0284C7" />
                  <Text style={styles.swapInstructionText}>
                    Chọn 1 cầu thủ ở <Text style={{ fontWeight: '700', color: '#0284C7' }}>Đội A</Text> và 1 cầu thủ ở <Text style={{ fontWeight: '700', color: '#E11D48' }}>Đội B</Text> để hoán đổi vị trí.
                  </Text>
                </View>
              )}

              {/* 2 Teams Arena Lists */}
              <View style={styles.twoTeamsArena}>
                {/* Team A Column */}
                <View style={styles.teamCol}>
                  <View style={[styles.teamColHeader, { borderTopColor: '#0284C7' }]}>
                    <Text style={styles.teamColTitle}>{currentLineupA?.name || 'Đội A'}</Text>
                    <View style={styles.teamColEloBadge}>
                      <Ionicons name="star" size={10} color="#0369A1" />
                      <Text style={styles.teamColEloText}>{currentLineupA?.eloAvg || 1200} ELO</Text>
                    </View>
                  </View>

                  <View style={styles.teamColList}>
                    {currentLineupA?.members?.map((m: any) => {
                      const isSelected = selectedUserA === Number(m.userId);
                      return (
                        <TouchableOpacity
                          key={m.userId}
                          disabled={!isLeaderOrSubLeader}
                          style={[styles.swapMemberCard, isSelected && styles.swapMemberCardSelectedA]}
                          activeOpacity={0.8}
                          onPress={() => setSelectedUserA(isSelected ? null : Number(m.userId))}
                        >
                          <UserAvatar
                            uri={m.avatarUrl || m.avatar}
                            name={m.fullName || m.name}
                            size={28}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.swapName} numberOfLines={1}>{m.fullName || m.name}</Text>
                            <Text style={styles.swapElo}>{m.elo || 1200} ELO</Text>
                          </View>
                          {isSelected && <Ionicons name="checkmark-circle" size={16} color="#0284C7" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Team B Column */}
                <View style={styles.teamCol}>
                  <View style={[styles.teamColHeader, { borderTopColor: '#E11D48' }]}>
                    <Text style={styles.teamColTitle}>{currentLineupB?.name || 'Đội B'}</Text>
                    <View style={[styles.teamColEloBadge, { backgroundColor: '#FFE4E6' }]}>
                      <Ionicons name="star" size={10} color="#BE123C" />
                      <Text style={[styles.teamColEloText, { color: '#BE123C' }]}>{currentLineupB?.eloAvg || 1200} ELO</Text>
                    </View>
                  </View>

                  <View style={styles.teamColList}>
                    {currentLineupB?.members?.map((m: any) => {
                      const isSelected = selectedUserB === Number(m.userId);
                      return (
                        <TouchableOpacity
                          key={m.userId}
                          disabled={!isLeaderOrSubLeader}
                          style={[styles.swapMemberCard, isSelected && styles.swapMemberCardSelectedB]}
                          activeOpacity={0.8}
                          onPress={() => setSelectedUserB(isSelected ? null : Number(m.userId))}
                        >
                          <UserAvatar
                            uri={m.avatarUrl || m.avatar}
                            name={m.fullName || m.name}
                            size={28}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.swapName} numberOfLines={1}>{m.fullName || m.name}</Text>
                            <Text style={styles.swapElo}>{m.elo || 1200} ELO</Text>
                          </View>
                          {isSelected && <Ionicons name="checkmark-circle" size={16} color="#E11D48" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Swap Action Button */}
              {isLeaderOrSubLeader && (
                <TouchableOpacity
                  style={[
                    styles.swapActionBtn,
                    (!selectedUserA || !selectedUserB) && styles.swapActionBtnDisabled,
                  ]}
                  disabled={!selectedUserA || !selectedUserB || actionLoading}
                  activeOpacity={0.85}
                  onPress={handleSwapInternalMembers}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" />
                      <Text style={styles.swapActionBtnText}>
                        Hoán đổi 2 cầu thủ đã chọn
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </ScrollView>
          )}

          {/* Footer Close */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.doneBtn} activeOpacity={0.8} onPress={onClose}>
              <Text style={styles.doneBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontSize: 13,
  },
  scrollBody: {
    padding: SPACING.md,
  },
  heroCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  heroLineupName: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
  },
  heroEloBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  heroEloText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  heroStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  heroStatLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 2,
  },
  heroStatValue: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeading: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#334155',
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
  },
  addMemberBtnText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  membersDetailedList: {
    gap: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    padding: 10,
  },
  memberCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarWrap: {
    position: 'relative',
  },
  memberCardAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#CBD5E1',
  },
  avatarNumberBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  avatarNumberText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  memberCardMeta: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  memberCardName: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  roleInLineupBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleInLineupText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  memberSubMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eloCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  eloCardText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B45309',
  },
  memberStatusActiveText: {
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '600',
  },
  memberRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.sm,
  },
  memberRemoveBtnText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  emptyMembersBox: {
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  emptyMembersText: {
    ...TYPOGRAPHY.caption,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  addMemberDrawer: {
    marginBottom: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  drawerTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12.5,
    fontWeight: '800',
    color: '#166534',
  },
  emptyDrawerText: {
    ...TYPOGRAPHY.caption,
    color: '#15803D',
    fontStyle: 'italic',
  },
  drawerList: {
    gap: 6,
    maxHeight: 180,
  },
  drawerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    borderRadius: BORDER_RADIUS.md,
    padding: 8,
    gap: 8,
  },
  drawerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
  },
  drawerInfo: {
    flex: 1,
  },
  drawerName: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  drawerRole: {
    ...TYPOGRAPHY.caption,
    fontSize: 10.5,
    color: '#64748B',
  },
  addPlusBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  internalHeroCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    marginBottom: 12,
  },
  internalHeroTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTeamSide: {
    flex: 1,
    paddingHorizontal: 8,
  },
  heroTeamSideTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13.5,
    fontWeight: '800',
  },
  heroTeamSideElo: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  heroTeamSideCount: {
    ...TYPOGRAPHY.caption,
    fontSize: 10.5,
    color: '#64748B',
  },
  vsBadgeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  balanceBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  balanceBarText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    color: '#059669',
  },
  swapInstructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    marginBottom: 12,
  },
  swapInstructionText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    color: '#0369A1',
    flex: 1,
    lineHeight: 15,
  },
  twoTeamsArena: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  teamCol: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  teamColHeader: {
    padding: 8,
    borderTopWidth: 3,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  teamColTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  teamColEloBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  teamColEloText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#0369A1',
  },
  teamColList: {
    padding: 6,
    gap: 6,
  },
  swapMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.md,
    padding: 6,
    gap: 6,
  },
  swapMemberCardSelectedA: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  swapMemberCardSelectedB: {
    borderColor: '#E11D48',
    backgroundColor: '#FFF1F2',
  },
  swapAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
  },
  swapName: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  swapElo: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: '#64748B',
  },
  swapActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: 8,
  },
  swapActionBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  swapActionBtnText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalFooter: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  doneBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  doneBtnText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});
