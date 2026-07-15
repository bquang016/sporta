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
  onKickMember
}: MembersModalProps) {
  const [selectedMemberForAction, setSelectedMemberForAction] = useState<MemberItem | null>(null);

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
              <Text style={styles.fullScreenModalTitle}>Thành viên nhóm ({membersCount})</Text>
              <View style={styles.headerPlaceholder} />
            </View>
          </SafeAreaView>
          
          <View style={styles.contentContainer}>
            <ScrollView contentContainerStyle={styles.fullScreenModalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.modalMembersContainer}>
                {members.map((member) => (
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
                ))}
              </View>
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
                      <MaterialIcons name="stars" size={22} color={COLORS.amberStar} style={styles.optionIcon} />
                      <Text style={styles.optionText}>Phân bổ thành Trưởng câu lạc bộ</Text>
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
                      <MaterialIcons name="person-remove" size={22} color={COLORS.error} style={styles.optionIcon} />
                      <Text style={[styles.optionText, styles.dangerText]}>Đuổi khỏi câu lạc bộ</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity 
                  style={[styles.actionOptionItem, styles.cancelOptionItem]} 
                  activeOpacity={0.7}
                  onPress={() => setSelectedMemberForAction(null)}
                >
                  <Text style={styles.cancelOptionText}>Hủy bỏ</Text>
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
    backgroundColor: COLORS.background,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
  },
  contentContainer: {
    flex: 1,
  },
  fullScreenModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    height: 64,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  closeModalButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  fullScreenModalTitle: {
    position: 'absolute',
    left: 60,
    right: 60,
    textAlign: 'center',
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  fullScreenModalScroll: {
    padding: SPACING.marginMobile,
    paddingBottom: SPACING.xl,
  },
  modalMembersContainer: {
    borderRadius: BORDER_RADIUS.default,
    overflow: 'hidden',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
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
