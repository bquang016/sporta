import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Button } from '../../../../shared/ui';

export interface MemberItem {
  id: string | number;
  userId: number;
  name: string;
  role: string;
  elo: number;
  avatar: string;
  status?: string; // "APPROVED", "PENDING", "REJECTED"
}

export interface MembersModalProps {
  visible: boolean;
  onClose: () => void;
  membersCount: number;
  members: MemberItem[];
  onLeavePress: () => void;
  currentUserRole?: string;
  currentUserId?: number;
  onTransferLeadership?: (member: MemberItem) => void;
  onAssignSubLeader?: (member: MemberItem) => void;
  onDemoteSubLeader?: (member: MemberItem) => void;
  onKickMember?: (member: MemberItem) => void;
  onApproveMember?: (member: MemberItem) => void;
  onRejectMember?: (member: MemberItem) => void;
}

export function MembersModal({ 
  visible, 
  onClose, 
  membersCount, 
  members, 
  onLeavePress,
  currentUserRole,
  currentUserId,
  onTransferLeadership,
  onAssignSubLeader,
  onDemoteSubLeader,
  onKickMember,
  onApproveMember,
  onRejectMember
}: MembersModalProps) {
  const [selectedMemberForAction, setSelectedMemberForAction] = useState<MemberItem | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'pending'>('members');

  const approvedMembers = members.filter(m => m.status === 'APPROVED' || !m.status);
  const pendingMembers = members.filter(m => m.status === 'PENDING');
  const isLeadership = currentUserRole === 'Trưởng câu lạc bộ';

  const shouldShowMoreMenu = (member: MemberItem) => {
    if (Number(member.userId) === Number(currentUserId)) return false;
    if (member.role === 'Trưởng câu lạc bộ') return false;
    if (currentUserRole === 'Trưởng câu lạc bộ') return true;
    return false;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <View style={styles.fullScreenModalContainer}>
          <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
            <View style={styles.fullScreenModalHeader}>
              <TouchableOpacity 
                style={styles.closeModalButton} 
                activeOpacity={0.7} 
                onPress={onClose}
              >
                <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.fullScreenModalTitle}>
                {isLeadership ? 'Quản lý thành viên' : `Thành viên nhóm (${approvedMembers.length})`}
              </Text>
              <View style={styles.headerPlaceholder} />
            </View>

            {/* Leadership Segmented Tabs */}
            {isLeadership && (
              <View style={styles.tabContainer}>
                <TouchableOpacity 
                  style={[styles.tabItem, activeTab === 'members' && styles.tabItemActive]}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('members')}
                >
                  <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>
                    Thành viên ({approvedMembers.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.tabItem, activeTab === 'pending' && styles.tabItemActive]}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('pending')}
                >
                  <View style={styles.tabPendingRow}>
                    <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
                      Chờ duyệt ({pendingMembers.length})
                    </Text>
                    {pendingMembers.length > 0 && (
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{pendingMembers.length}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
          
          <View style={styles.contentContainer}>
            <ScrollView contentContainerStyle={styles.fullScreenModalScroll} showsVerticalScrollIndicator={false}>
              {/* Tab 1: Approved Members List */}
              {(activeTab === 'members' || !isLeadership) && (
                <View style={styles.modalMembersContainer}>
                  {approvedMembers.length > 0 ? (
                    approvedMembers.map((member) => (
                      <View key={member.id} style={styles.memberItem}>
                        <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName}>{member.name}</Text>
                          <View style={styles.memberMetaRow}>
                            <Text style={styles.memberRole}>{member.role}</Text>
                            <Text style={styles.memberDivider}>•</Text>
                            <View style={styles.memberEloContainer}>
                              <MaterialIcons name="star" size={10} color={COLORS.amberStar} style={{ marginRight: 2 }} />
                              <Text style={styles.memberElo}>{member.elo} Elo</Text>
                            </View>
                          </View>
                        </View>
                        
                        {shouldShowMoreMenu(member) && (
                          <TouchableOpacity 
                            style={styles.moreButton} 
                            activeOpacity={0.7}
                            onPress={() => setSelectedMemberForAction(member)}
                          >
                            <MaterialIcons name="more-vert" size={22} color={COLORS.onSurfaceVariant} />
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.chatButton} activeOpacity={0.7}>
                          <MaterialIcons name="chat-bubble-outline" size={18} color={COLORS.primary} />
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <MaterialIcons name="group-off" size={40} color={COLORS.outline} />
                      <Text style={styles.emptyText}>Chưa có thành viên nào trong nhóm</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Tab 2: Pending Approval Members List */}
              {isLeadership && activeTab === 'pending' && (
                <View style={styles.modalMembersContainer}>
                  {pendingMembers.length > 0 ? (
                    pendingMembers.map((member) => (
                      <View key={member.id} style={styles.pendingMemberItem}>
                        <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName}>{member.name}</Text>
                          <View style={styles.pendingBadgeTag}>
                            <MaterialIcons name="schedule" size={12} color={COLORS.amberStar} style={{ marginRight: 3 }} />
                            <Text style={styles.pendingBadgeTagText}>Chờ phê duyệt</Text>
                          </View>
                        </View>

                        <View style={styles.pendingActionsRow}>
                          <TouchableOpacity 
                            style={[styles.pendingBtn, styles.approveBtn]}
                            activeOpacity={0.8}
                            onPress={() => onApproveMember && onApproveMember(member)}
                          >
                            <MaterialIcons name="check" size={16} color={COLORS.white} />
                            <Text style={styles.approveBtnText}>Duyệt</Text>
                          </TouchableOpacity>

                          <TouchableOpacity 
                            style={[styles.pendingBtn, styles.rejectBtn]}
                            activeOpacity={0.8}
                            onPress={() => onRejectMember && onRejectMember(member)}
                          >
                            <MaterialIcons name="close" size={16} color={COLORS.error} />
                            <Text style={styles.rejectBtnText}>Từ chối</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <MaterialIcons name="check-circle-outline" size={44} color={COLORS.primary} />
                      <Text style={styles.emptyTitle}>Không có yêu cầu gia nhập</Text>
                      <Text style={styles.emptyText}>Hiện tại không có thành viên nào đang chờ phê duyệt.</Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
            <View style={styles.footer}>
              <Button
                variant="outline"
                title="Rời khỏi câu lạc bộ"
                icon="exit-to-app"
                style={styles.actionBtn}
                onPress={onLeavePress}
              />
            </View>
          </View>
        </View>

        {/* Custom Member Actions Bottom Sheet Modal */}
        <Modal
          visible={!!selectedMemberForAction}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedMemberForAction(null)}
        >
          <View style={styles.actionSheetOverlay}>
            <TouchableOpacity 
              style={styles.actionSheetCloseTouch} 
              activeOpacity={1} 
              onPress={() => setSelectedMemberForAction(null)} 
            />
            <View style={styles.actionSheetContent}>
              <View style={styles.actionSheetHeader}>
                <Text style={styles.actionSheetTitle}>Quản lý thành viên</Text>
                <Text style={styles.actionSheetSubtitle}>
                  {selectedMemberForAction?.name} ({selectedMemberForAction?.role})
                </Text>
              </View>
              <View style={styles.actionSheetOptions}>
                {currentUserRole === 'Trưởng câu lạc bộ' && (
                  <>
                    <TouchableOpacity 
                      style={styles.actionOptionItem} 
                      activeOpacity={0.7}
                      onPress={() => {
                        if (selectedMemberForAction && onTransferLeadership) {
                          onTransferLeadership(selectedMemberForAction);
                          setSelectedMemberForAction(null);
                        }
                      }}
                    >
                      <MaterialIcons name="stars" size={20} color={COLORS.primary} style={styles.optionIcon} />
                      <Text style={styles.optionText}>Chuyển quyền Trưởng câu lạc bộ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.actionOptionItem} 
                      activeOpacity={0.7}
                      onPress={() => {
                        if (selectedMemberForAction && onKickMember) {
                          onKickMember(selectedMemberForAction);
                          setSelectedMemberForAction(null);
                        }
                      }}
                    >
                      <MaterialIcons name="person-remove" size={20} color={COLORS.error} style={styles.optionIcon} />
                      <Text style={[styles.optionText, styles.dangerText]}>Đuổi khỏi câu lạc bộ</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity 
                  style={[styles.actionOptionItem, styles.cancelOptionItem]} 
                  activeOpacity={0.7}
                  onPress={() => setSelectedMemberForAction(null)}
                >
                  <Text style={styles.cancelOptionText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  contentContainer: {
    flex: 1,
  },
  fullScreenModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
    backgroundColor: COLORS.surface,
  },
  closeModalButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  fullScreenModalTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  tabItem: {
    flex: 1,
    paddingVertical: SPACING.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabPendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  badgeContainer: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '700',
  },
  fullScreenModalScroll: {
    padding: SPACING.marginMobile,
    paddingBottom: SPACING.xl,
  },
  modalMembersContainer: {
    borderRadius: BORDER_RADIUS.default,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  pendingMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  memberMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  memberRole: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  memberDivider: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginHorizontal: SPACING.xs + 2,
  },
  memberEloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberElo: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  pendingBadgeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  pendingBadgeTagText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.amberStar,
    fontWeight: '600',
  },
  pendingActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pendingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.md,
    gap: 2,
  },
  approveBtn: {
    backgroundColor: COLORS.primary,
  },
  approveBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  rejectBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  rejectBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.xs,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headlineSm,
    fontSize: 16,
    color: COLORS.onSurface,
    fontWeight: '700',
    marginTop: SPACING.xs,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
  chatButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity05,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  footer: {
    padding: SPACING.marginMobile,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.primaryOpacity08,
  },
  actionBtn: {
    width: '100%',
    height: 48,
    borderRadius: BORDER_RADIUS.default,
    borderColor: COLORS.error,
  },
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity50,
    justifyContent: 'flex-end',
  },
  actionSheetCloseTouch: {
    flex: 1,
  },
  actionSheetContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.marginMobile,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  actionSheetHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  actionSheetTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  actionSheetSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  actionSheetOptions: {
    paddingTop: SPACING.sm,
  },
  actionOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  optionIcon: {
    marginRight: SPACING.md,
  },
  optionText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  dangerText: {
    color: COLORS.error,
    fontWeight: '600',
  },
  cancelOptionItem: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.default,
  },
  cancelOptionText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '600',
  },
});
