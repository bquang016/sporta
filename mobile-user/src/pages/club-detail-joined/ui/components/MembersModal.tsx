import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../../shared/config/theme';
import { Avatar } from '../../../../shared/ui';

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
  onTransferLeadership?: (member: MemberItem) => Promise<void> | void;
  onAssignSubLeader?: (member: MemberItem) => Promise<void> | void;
  onDemoteSubLeader?: (member: MemberItem) => Promise<void> | void;
  onKickMember?: (member: MemberItem) => Promise<void> | void;
  onApproveMember?: (member: MemberItem) => Promise<void> | void;
  onRejectMember?: (member: MemberItem) => Promise<void> | void;
  onRefreshMembers?: () => Promise<void> | void;
}

interface ConfirmDialogState {
  type: 'transfer' | 'assign' | 'demote' | 'kick' | 'approve' | 'reject' | 'leave' | 'leave_blocked';
  member?: MemberItem;
  title: string;
  message: string;
  confirmText: string;
  confirmVariant: 'primary' | 'danger' | 'warning' | 'info';
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  onConfirmAction?: () => Promise<void> | void;
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
  onRejectMember,
  onRefreshMembers,
}: MembersModalProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'pending'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedMemberForAction, setSelectedMemberForAction] = useState<MemberItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const approvedMembers = useMemo(
    () => members.filter((m) => m.status === 'APPROVED' || !m.status),
    [members]
  );
  const pendingMembers = useMemo(
    () => members.filter((m) => m.status === 'PENDING'),
    [members]
  );

  const isLeadership = currentUserRole === 'Trưởng câu lạc bộ';
  const isSubLeader = currentUserRole === 'Phó câu lạc bộ';

  // Filter approved members by search query and role filter
  const filteredApprovedMembers = useMemo(() => {
    return approvedMembers.filter((m) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.name?.toLowerCase().includes(q);
        const matchesRole = m.role?.toLowerCase().includes(q);
        if (!matchesName && !matchesRole) return false;
      }

      // 2. Role Filter
      if (roleFilter !== 'all') {
        if (roleFilter === 'leader' && m.role !== 'Trưởng câu lạc bộ') return false;
        if (roleFilter === 'subleader' && m.role !== 'Phó câu lạc bộ') return false;
        if (roleFilter === 'member' && m.role !== 'Thành viên') return false;
      }

      return true;
    });
  }, [approvedMembers, searchQuery, roleFilter]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const shouldShowMoreMenu = (member: MemberItem) => {
    if (Number(member.userId) === Number(currentUserId)) return false;
    if (member.role === 'Trưởng câu lạc bộ') return false;
    if (isLeadership) return true;
    if (isSubLeader && member.role === 'Thành viên') return true;
    return false;
  };

  // Trigger Confirmation for Transfer Leadership
  const handlePromptTransfer = (member: MemberItem) => {
    setSelectedMemberForAction(null);
    setConfirmDialog({
      type: 'transfer',
      member,
      title: 'Chuyển quyền Trưởng câu lạc bộ',
      message: `Bạn có chắc chắn muốn chuyển giao toàn bộ quyền Trưởng câu lạc bộ cho "${member.name}" không?\n\nSau khi chuyển, bạn sẽ trở thành Thành viên thường.`,
      confirmText: 'Chuyển quyền ngay',
      confirmVariant: 'warning',
      icon: 'stars',
      iconColor: '#F59E0B',
    });
  };

  // Trigger Confirmation for Assign Sub-Leader
  const handlePromptAssignSubLeader = (member: MemberItem) => {
    setSelectedMemberForAction(null);
    setConfirmDialog({
      type: 'assign',
      member,
      title: 'Bổ nhiệm Phó câu lạc bộ',
      message: `Bạn có chắc chắn muốn phong chức Phó câu lạc bộ cho "${member.name}" không? Phó câu lạc bộ có quyền duyệt đơn và trục xuất thành viên thường.`,
      confirmText: 'Bổ nhiệm',
      confirmVariant: 'info',
      icon: 'verified',
      iconColor: '#0284C7',
    });
  };

  // Trigger Confirmation for Demote Sub-Leader
  const handlePromptDemoteSubLeader = (member: MemberItem) => {
    setSelectedMemberForAction(null);
    setConfirmDialog({
      type: 'demote',
      member,
      title: 'Hạ chức Phó câu lạc bộ',
      message: `Bạn có chắc muốn hạ chức Phó câu lạc bộ của "${member.name}" xuống Thành viên thường không?`,
      confirmText: 'Hạ chức',
      confirmVariant: 'warning',
      icon: 'remove-circle-outline',
      iconColor: '#EA580C',
    });
  };

  // Trigger Confirmation for Kick Member
  const handlePromptKick = (member: MemberItem) => {
    setSelectedMemberForAction(null);
    setConfirmDialog({
      type: 'kick',
      member,
      title: 'Trục xuất thành viên',
      message: `Bạn có chắc chắn muốn đuổi "${member.name}" khỏi câu lạc bộ không? Hành động này sẽ xóa thành viên khỏi nhóm ngay lập tức.`,
      confirmText: 'Trục xuất',
      confirmVariant: 'danger',
      icon: 'person-remove',
      iconColor: '#EF4444',
    });
  };

  // Trigger Confirmation for Leaving Club
  const handlePromptLeaveClub = () => {
    onClose();
    setTimeout(() => {
      onLeavePress();
    }, 200);
  };

  // Execute Dialog Action
  const handleExecuteDialogConfirm = async () => {
    if (!confirmDialog) return;
    const { type, member, onConfirmAction } = confirmDialog;

    if (type === 'leave_blocked') {
      setConfirmDialog(null);
      return;
    }

    if (onConfirmAction) {
      onConfirmAction();
      return;
    }

    if (!member) {
      setConfirmDialog(null);
      return;
    }

    setIsSubmitting(true);

    try {
      if (type === 'transfer' && onTransferLeadership) {
        await onTransferLeadership(member);
        showToast('success', `Đã chuyển quyền Trưởng câu lạc bộ cho "${member.name}" thành công!`);
      } else if (type === 'assign' && onAssignSubLeader) {
        await onAssignSubLeader(member);
        showToast('success', `Đã bổ nhiệm "${member.name}" làm Phó câu lạc bộ!`);
      } else if (type === 'demote' && onDemoteSubLeader) {
        await onDemoteSubLeader(member);
        showToast('success', `Đã hạ chức "${member.name}" xuống Thành viên thường.`);
      } else if (type === 'kick' && onKickMember) {
        await onKickMember(member);
        showToast('success', `Đã đuổi "${member.name}" khỏi câu lạc bộ.`);
      } else if (type === 'approve' && onApproveMember) {
        await onApproveMember(member);
        showToast('success', `Đã duyệt "${member.name}" vào câu lạc bộ!`);
      } else if (type === 'reject' && onRejectMember) {
        await onRejectMember(member);
        showToast('success', `Đã từ chối yêu cầu của "${member.name}".`);
      }
      setConfirmDialog(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <View style={styles.container}>
          {/* Header */}
          <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.headerBackBtn}
                activeOpacity={0.7}
                onPress={onClose}
              >
                <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>

              <View style={styles.headerTitleCol}>
                <Text style={styles.headerTitle}>
                  {isLeadership ? 'Quản lý thành viên' : 'Danh sách thành viên'}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {approvedMembers.length} thành viên đang hoạt động
                </Text>
              </View>

              {onRefreshMembers ? (
                <TouchableOpacity
                  style={styles.refreshBtn}
                  activeOpacity={0.7}
                  onPress={onRefreshMembers}
                >
                  <MaterialIcons name="refresh" size={22} color={COLORS.primary} />
                </TouchableOpacity>
              ) : (
                <View style={{ width: 40 }} />
              )}
            </View>

            {/* Leadership / SubLeader Segmented Tabs */}
            {(isLeadership || isSubLeader) && (
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tabItem, activeTab === 'members' && styles.tabItemActive]}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('members')}
                >
                  <MaterialIcons
                    name="people"
                    size={16}
                    color={activeTab === 'members' ? COLORS.primary : '#64748B'}
                  />
                  <Text
                    style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}
                  >
                    Thành viên ({approvedMembers.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabItem, activeTab === 'pending' && styles.tabItemActive]}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('pending')}
                >
                  <MaterialIcons
                    name="person-add"
                    size={16}
                    color={activeTab === 'pending' ? COLORS.primary : '#64748B'}
                  />
                  <Text
                    style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}
                  >
                    Chờ duyệt
                  </Text>
                  {pendingMembers.length > 0 && (
                    <View style={styles.badgePill}>
                      <Text style={styles.badgePillText}>{pendingMembers.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <View
              style={[
                styles.toastContainer,
                toastMessage.type === 'success' ? styles.toastSuccess : styles.toastError,
              ]}
            >
              <MaterialIcons
                name={toastMessage.type === 'success' ? 'check-circle' : 'error'}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.toastText}>{toastMessage.text}</Text>
            </View>
          )}

          {/* Main Body */}
          <View style={styles.contentArea}>
            {/* ======================= TAB 1: MEMBERS LIST ======================= */}
            {activeTab === 'members' && (
              <>
                {/* Search Bar & Role Filter */}
                <View style={styles.searchSection}>
                  <View style={styles.searchBox}>
                    <MaterialIcons name="search" size={20} color="#94A3B8" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Tìm thành viên theo tên..."
                      placeholderTextColor="#94A3B8"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <MaterialIcons name="cancel" size={18} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Role filter chips */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.roleFilterRow}
                  >
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'leader', label: 'Trưởng CLB' },
                      { id: 'subleader', label: 'Phó CLB' },
                      { id: 'member', label: 'Thành viên' },
                    ].map((f) => (
                      <TouchableOpacity
                        key={f.id}
                        style={[
                          styles.roleChip,
                          roleFilter === f.id && styles.roleChipActive,
                        ]}
                        onPress={() => setRoleFilter(f.id)}
                      >
                        <Text
                          style={[
                            styles.roleChipText,
                            roleFilter === f.id && styles.roleChipTextActive,
                          ]}
                        >
                          {f.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Member Scroll List */}
                <ScrollView
                  contentContainerStyle={styles.membersScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredApprovedMembers.length > 0 ? (
                    filteredApprovedMembers.map((member) => {
                      const isMe = Number(member.userId) === Number(currentUserId);
                      const isLeaderRole = member.role === 'Trưởng câu lạc bộ';
                      const isSubLeaderRole = member.role === 'Phó câu lạc bộ';
                      const showMenu = shouldShowMoreMenu(member);

                      return (
                        <View key={member.id} style={styles.memberCard}>
                          {/* Avatar with Role Crown */}
                          <View style={styles.avatarWrapper}>
                            <Avatar
                              source={member.avatar}
                              size={44}
                              fallbackType="user"
                            />
                            {isLeaderRole && (
                              <View style={styles.crownBadgeLeader}>
                                <MaterialIcons name="stars" size={12} color="#FFFFFF" />
                              </View>
                            )}
                            {isSubLeaderRole && (
                              <View style={styles.crownBadgeSubLeader}>
                                <MaterialIcons name="verified" size={12} color="#FFFFFF" />
                              </View>
                            )}
                          </View>

                          {/* Member Information */}
                          <View style={styles.memberInfo}>
                            <View style={styles.memberNameRow}>
                              <Text style={styles.memberName} numberOfLines={1}>
                                {member.name}
                              </Text>
                              {isMe && (
                                <View style={styles.youBadge}>
                                  <Text style={styles.youBadgeText}>Bạn</Text>
                                </View>
                              )}
                            </View>

                            <View style={styles.metaRow}>
                              {/* Role Pill */}
                              <View
                                style={[
                                  styles.rolePill,
                                  isLeaderRole
                                    ? styles.rolePillLeader
                                    : isSubLeaderRole
                                    ? styles.rolePillSubLeader
                                    : styles.rolePillMember,
                                ]}
                              >
                                <MaterialIcons
                                  name={
                                    isLeaderRole
                                      ? 'stars'
                                      : isSubLeaderRole
                                      ? 'verified'
                                      : 'person'
                                  }
                                  size={12}
                                  color={
                                    isLeaderRole
                                      ? '#D97706'
                                      : isSubLeaderRole
                                      ? '#0284C7'
                                      : '#64748B'
                                  }
                                />
                                <Text
                                  style={[
                                    styles.rolePillText,
                                    isLeaderRole
                                      ? styles.rolePillTextLeader
                                      : isSubLeaderRole
                                      ? styles.rolePillTextSubLeader
                                      : styles.rolePillTextMember,
                                  ]}
                                >
                                  {member.role}
                                </Text>
                              </View>

                              {/* ELO Rating Badge */}
                              <View style={styles.eloPill}>
                                <MaterialIcons name="military-tech" size={13} color="#D97706" />
                                <Text style={styles.eloPillText}>{member.elo || 1200} ELO</Text>
                              </View>
                            </View>
                          </View>

                          {/* 3-Dots Action Button */}
                          {showMenu && (
                            <TouchableOpacity
                              style={styles.moreActionBtn}
                              activeOpacity={0.7}
                              onPress={() => setSelectedMemberForAction(member)}
                            >
                              <MaterialIcons name="more-vert" size={22} color="#64748B" />
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })
                  ) : (
                    <View style={styles.emptyState}>
                      <MaterialIcons name="group-off" size={44} color="#CBD5E1" />
                      <Text style={styles.emptyTitle}>Không tìm thấy thành viên</Text>
                      <Text style={styles.emptySubtitle}>
                        Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục khác.
                      </Text>
                    </View>
                  )}

                  {/* Sensible Leave Club Button at bottom of Members List */}
                  <View style={styles.leaveSection}>
                    <TouchableOpacity
                      style={styles.leaveClubBtn}
                      activeOpacity={0.8}
                      onPress={handlePromptLeaveClub}
                    >
                      <MaterialIcons name="logout" size={18} color="#EF4444" />
                      <Text style={styles.leaveClubBtnText}>
                        {isLeadership && approvedMembers.length <= 1
                          ? 'Giải tán câu lạc bộ'
                          : 'Rời khỏi câu lạc bộ'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}

            {/* ======================= TAB 2: PENDING APPROVALS ======================= */}
            {activeTab === 'pending' && (
              <ScrollView
                contentContainerStyle={styles.pendingScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {pendingMembers.length > 0 ? (
                  pendingMembers.map((member) => (
                    <View key={member.id} style={styles.pendingCard}>
                      <View style={styles.pendingCardHeader}>
                        <Avatar source={member.avatar} size={44} fallbackType="user" />
                        <View style={styles.pendingInfoCol}>
                          <Text style={styles.pendingName}>{member.name}</Text>
                          <View style={styles.pendingMetaRow}>
                            <View style={styles.eloPill}>
                              <MaterialIcons name="military-tech" size={13} color="#D97706" />
                              <Text style={styles.eloPillText}>{member.elo || 1200} ELO</Text>
                            </View>
                            <Text style={styles.pendingStatusText}>• Xin gia nhập CLB</Text>
                          </View>
                        </View>
                      </View>

                      {/* Approve / Reject Action Buttons */}
                      <View style={styles.pendingActionRow}>
                        <TouchableOpacity
                          style={styles.rejectBtn}
                          activeOpacity={0.8}
                          onPress={() => {
                            setConfirmDialog({
                              type: 'reject',
                              member,
                              title: 'Từ chối yêu cầu',
                              message: `Bạn có chắc muốn từ chối yêu cầu gia nhập của "${member.name}"?`,
                              confirmText: 'Từ chối',
                              confirmVariant: 'danger',
                              icon: 'close',
                              iconColor: '#EF4444',
                            });
                          }}
                        >
                          <MaterialIcons name="close" size={16} color="#EF4444" />
                          <Text style={styles.rejectBtnText}>Từ chối</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.approveBtn}
                          activeOpacity={0.85}
                          onPress={() => {
                            setConfirmDialog({
                              type: 'approve',
                              member,
                              title: 'Phê duyệt thành viên',
                              message: `Duyệt "${member.name}" gia nhập câu lạc bộ?`,
                              confirmText: 'Phê duyệt',
                              confirmVariant: 'primary',
                              icon: 'check',
                              iconColor: COLORS.primary,
                            });
                          }}
                        >
                          <MaterialIcons name="check" size={16} color="#FFFFFF" />
                          <Text style={styles.approveBtnText}>Phê duyệt</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <MaterialIcons name="how-to-reg" size={50} color="#CBD5E1" />
                    <Text style={styles.emptyTitle}>Không có yêu cầu chờ duyệt</Text>
                    <Text style={styles.emptySubtitle}>
                      Tất cả các thành viên đăng ký tham gia câu lạc bộ đã được xử lý.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>

          {/* ===================== IN-MODAL MEMBER ACTION SHEET ===================== */}
          {selectedMemberForAction && (
            <View style={styles.sheetOverlay}>
              <TouchableOpacity
                style={styles.sheetBackdrop}
                activeOpacity={1}
                onPress={() => setSelectedMemberForAction(null)}
              />

              <View style={styles.sheetContent}>
                {/* Drag bar */}
                <View style={styles.sheetDragBar} />

                {/* Member summary header */}
                <View style={styles.sheetMemberHeader}>
                  <Avatar source={selectedMemberForAction.avatar} size={40} fallbackType="user" />
                  <View style={styles.sheetMemberInfo}>
                    <Text style={styles.sheetMemberName}>{selectedMemberForAction.name}</Text>
                    <Text style={styles.sheetMemberRole}>
                      {selectedMemberForAction.role} • {selectedMemberForAction.elo || 1200} ELO
                    </Text>
                  </View>
                </View>

                {/* Action items */}
                <View style={styles.sheetOptions}>
                  {/* 1. Transfer Leadership (Leader only) */}
                  {isLeadership && (
                    <TouchableOpacity
                      style={styles.sheetOptionItem}
                      activeOpacity={0.7}
                      onPress={() => handlePromptTransfer(selectedMemberForAction)}
                    >
                      <View style={[styles.sheetIconCircle, { backgroundColor: '#FEF3C7' }]}>
                        <MaterialIcons name="stars" size={20} color="#D97706" />
                      </View>
                      <View style={styles.sheetTextCol}>
                        <Text style={styles.sheetOptionTitle}>Chuyển quyền Trưởng câu lạc bộ</Text>
                        <Text style={styles.sheetOptionSub}>
                          Chuyển giao toàn quyền quản trị cho thành viên này
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  )}

                  {/* 2. Assign / Demote Sub-Leader (Leader only) */}
                  {isLeadership && selectedMemberForAction.role === 'Thành viên' && (
                    <TouchableOpacity
                      style={styles.sheetOptionItem}
                      activeOpacity={0.7}
                      onPress={() => handlePromptAssignSubLeader(selectedMemberForAction)}
                    >
                      <View style={[styles.sheetIconCircle, { backgroundColor: '#E0F2FE' }]}>
                        <MaterialIcons name="verified" size={20} color="#0284C7" />
                      </View>
                      <View style={styles.sheetTextCol}>
                        <Text style={styles.sheetOptionTitle}>Bổ nhiệm Phó câu lạc bộ</Text>
                        <Text style={styles.sheetOptionSub}>
                          Cấp quyền quản lý thành viên và duyệt đơn
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  )}

                  {isLeadership &&
                    (selectedMemberForAction.role === 'Phó câu lạc bộ' ||
                      selectedMemberForAction.role === 'Phó nhóm') && (
                      <TouchableOpacity
                        style={styles.sheetOptionItem}
                        activeOpacity={0.7}
                        onPress={() => handlePromptDemoteSubLeader(selectedMemberForAction)}
                      >
                        <View style={[styles.sheetIconCircle, { backgroundColor: '#FFEDD5' }]}>
                          <MaterialIcons name="remove-circle-outline" size={20} color="#EA580C" />
                        </View>
                        <View style={styles.sheetTextCol}>
                          <Text style={styles.sheetOptionTitle}>Hạ chức Phó câu lạc bộ</Text>
                          <Text style={styles.sheetOptionSub}>
                            Chuyển vai trò về Thành viên thường
                          </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#94A3B8" />
                      </TouchableOpacity>
                    )}

                  {/* 3. Kick Member (Leader or Sub-leader on members) */}
                  <TouchableOpacity
                    style={[styles.sheetOptionItem, styles.sheetOptionItemDanger]}
                    activeOpacity={0.7}
                    onPress={() => handlePromptKick(selectedMemberForAction)}
                  >
                    <View style={[styles.sheetIconCircle, { backgroundColor: '#FEE2E2' }]}>
                      <MaterialIcons name="person-remove" size={20} color="#EF4444" />
                    </View>
                    <View style={styles.sheetTextCol}>
                      <Text style={[styles.sheetOptionTitle, { color: '#EF4444' }]}>
                        Đuổi khỏi câu lạc bộ
                      </Text>
                      <Text style={styles.sheetOptionSub}>Xóa thành viên này khỏi danh sách nhóm</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                {/* Cancel button */}
                <TouchableOpacity
                  style={styles.sheetCancelBtn}
                  activeOpacity={0.8}
                  onPress={() => setSelectedMemberForAction(null)}
                >
                  <Text style={styles.sheetCancelBtnText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ===================== IN-MODAL CONFIRMATION DIALOG ===================== */}
          {confirmDialog && (
            <View style={styles.dialogOverlay}>
              <TouchableOpacity
                style={styles.dialogBackdrop}
                activeOpacity={1}
                onPress={() => !isSubmitting && setConfirmDialog(null)}
              />

              <View style={styles.dialogCard}>
                {/* Icon Circle */}
                <View
                  style={[
                    styles.dialogIconCircle,
                    {
                      backgroundColor:
                        confirmDialog.confirmVariant === 'danger'
                          ? '#FEE2E2'
                          : confirmDialog.confirmVariant === 'warning'
                          ? '#FEF3C7'
                          : confirmDialog.confirmVariant === 'info'
                          ? '#E0F2FE'
                          : COLORS.primaryOpacity10,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={confirmDialog.icon}
                    size={30}
                    color={confirmDialog.iconColor}
                  />
                </View>

                {/* Title & Message */}
                <Text style={styles.dialogTitle}>{confirmDialog.title}</Text>
                <Text style={styles.dialogMessage}>{confirmDialog.message}</Text>

                {/* Actions */}
                <View style={styles.dialogActions}>
                  <TouchableOpacity
                    style={styles.dialogCancelBtn}
                    disabled={isSubmitting}
                    onPress={() => setConfirmDialog(null)}
                  >
                    <Text style={styles.dialogCancelBtnText}>
                      {confirmDialog.type === 'leave_blocked' ? 'Đóng' : 'Hủy'}
                    </Text>
                  </TouchableOpacity>

                  {confirmDialog.type !== 'leave_blocked' && (
                    <TouchableOpacity
                      style={[
                        styles.dialogConfirmBtn,
                        confirmDialog.confirmVariant === 'danger'
                          ? styles.dialogConfirmBtnDanger
                          : confirmDialog.confirmVariant === 'warning'
                          ? styles.dialogConfirmBtnWarning
                          : styles.dialogConfirmBtnPrimary,
                      ]}
                      disabled={isSubmitting}
                      onPress={handleExecuteDialogConfirm}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.dialogConfirmBtnText}>
                          {confirmDialog.confirmText}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSafeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 54,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryOpacity08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: -0.1,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '400',
    marginTop: 1,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryOpacity08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 3,
    borderRadius: 12,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  badgePill: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 5.5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toastSuccess: {
    backgroundColor: '#059669',
  },
  toastError: {
    backgroundColor: '#DC2626',
  },
  toastText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  contentArea: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 7,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    gap: 7,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '400',
    padding: 0,
  },
  roleFilterRow: {
    gap: 6,
  },
  roleChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleChipText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
  },
  membersScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 11,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    gap: 11,
  },
  avatarWrapper: {
    position: 'relative',
  },
  crownBadgeLeader: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#D97706',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  crownBadgeSubLeader: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0284C7',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
    gap: 3,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
    flexShrink: 1,
  },
  youBadge: {
    backgroundColor: COLORS.primaryOpacity15,
    paddingHorizontal: 5.5,
    paddingVertical: 1,
    borderRadius: 5,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    gap: 3,
  },
  rolePillLeader: {
    backgroundColor: '#FEF3C7',
  },
  rolePillSubLeader: {
    backgroundColor: '#E0F2FE',
  },
  rolePillMember: {
    backgroundColor: '#F1F5F9',
  },
  rolePillText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  rolePillTextLeader: {
    color: '#D97706',
  },
  rolePillTextSubLeader: {
    color: '#0284C7',
  },
  rolePillTextMember: {
    color: '#64748B',
  },
  eloPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    gap: 2,
  },
  eloPillText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#B45309',
  },
  moreActionBtn: {
    padding: 6,
    borderRadius: 8,
  },
  leaveSection: {
    marginTop: 14,
    marginBottom: 20,
    alignItems: 'center',
  },
  leaveClubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    width: '100%',
  },
  leaveClubBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  pendingScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  pendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    gap: 10,
  },
  pendingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pendingInfoCol: {
    flex: 1,
    gap: 2,
  },
  pendingName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  pendingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingStatusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '400',
  },
  pendingActionRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    gap: 4,
  },
  rejectBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#EF4444',
  },
  approveBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    gap: 4,
  },
  approveBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 45,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 26,
    lineHeight: 17,
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    gap: 12,
  },
  sheetDragBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 2,
  },
  sheetMemberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetMemberInfo: {
    flex: 1,
    gap: 1,
  },
  sheetMemberName: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  sheetMemberRole: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  sheetOptions: {
    gap: 7,
  },
  sheetOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sheetOptionItemDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  sheetIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTextCol: {
    flex: 1,
    gap: 1,
  },
  sheetOptionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  sheetOptionSub: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '400',
  },
  sheetCancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    marginTop: 2,
  },
  sheetCancelBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#475569',
  },
  dialogOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 2000,
  },
  dialogBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  dialogIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  dialogTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 12.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 2,
    fontWeight: '400',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 6,
  },
  dialogCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  dialogCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  dialogConfirmBtn: {
    flex: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  dialogConfirmBtnPrimary: {
    backgroundColor: COLORS.primary,
  },
  dialogConfirmBtnWarning: {
    backgroundColor: '#D97706',
  },
  dialogConfirmBtnDanger: {
    backgroundColor: '#DC2626',
  },
  dialogConfirmBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
