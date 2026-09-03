import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button, Card } from '../../../shared/ui';
import { useClubs, ClubDetailHeader } from '../../../entities/club';
import { MatchHistoryCard, MatchItem } from './components/MatchHistoryCard';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { InviteModal } from './components/InviteModal';
import { LeaveConfirmationModal } from './components/LeaveConfirmationModal';
import { MembersModal, MemberItem } from './components/MembersModal';
import { EditClubModal } from './components/EditClubModal';
import { CreatePollModal } from './components/CreatePollModal';
import { PollCard } from './components/PollCard';
import { MatchPollVM } from '../../../entities/match/model/match.types';
import {
  getClubMembersApi,
  getClubMatchPollsApi,
  createMatchPollApi,
  voteMatchPollApi,
  closeMatchPollApi,
  splitInternalTeamsApi,
  formMatchmakingLineupApi,
  deleteMatchPollApi,
  approveMemberApi,
  rejectMemberApi,
  getClubMatchesApi,
  CreateMatchPollPayload,
} from '../../../shared/api/clubs';
import { useAlert } from '../../../shared/contexts/AlertContext';

// Mock Members for Joined Clubs to look premium
const MOCK_MEMBERS: MemberItem[] = [
  { id: 'm-1', userId: 0, name: 'Nguyễn Văn Hùng', role: 'Trưởng nhóm', elo: 1540, avatar: '' },
  { id: 'm-2', userId: 0, name: 'Trần Thị Mai', role: 'Phó nhóm', elo: 1420, avatar: '' },
  { id: 'm-3', userId: 0, name: 'Phạm Minh Hoàng', role: 'Thành viên', elo: 1250, avatar: '' },
  { id: 'm-4', userId: 0, name: 'Lê Hoàng Sơn', role: 'Thành viên', elo: 1180, avatar: '' },
];

const MOCK_MATCH_HISTORY: MatchItem[] = [
  {
    id: 'h-1',
    opponentName: 'FC Cầu Giấy United',
    opponentAvatar: '',
    date: '20/06/2026',
    ourScore: 4,
    opponentScore: 2,
    result: 'win',
    location: 'Sân bóng Đại học Y',
  },
  {
    id: 'h-2',
    opponentName: 'Hà Đông Football Club',
    opponentAvatar: '',
    date: '14/06/2026',
    ourScore: 1,
    opponentScore: 3,
    result: 'lose',
    location: 'Sân bóng Bách Khoa',
  },
  {
    id: 'h-3',
    opponentName: 'Bách Khoa Football Club',
    opponentAvatar: '',
    date: '07/06/2026',
    ourScore: 2,
    opponentScore: 2,
    result: 'draw',
    location: 'Sân bóng Chu Văn An',
  },
];

export function ClubDetailJoinedScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clubs, joinedClubs, leaveClub, deleteClub, transferLeadership, refreshClubs, assignSubLeader, demoteSubLeader, removeMember } = useClubs();
  const { showAlert, showConfirm } = useAlert();

  // Custom Leave Confirmation Modal State
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [isDeleteLeaveMode, setIsDeleteLeaveMode] = useState(false);
  
  // Custom Members Modal State
  const [isMembersModalVisible, setIsMembersModalVisible] = useState(false);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string>('');

  // Custom Invite Modal State
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Custom Edit & History Modals State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);

  // Poll & Matchmaking States (v2.0)
  const [matchPolls, setMatchPolls] = useState<MatchPollVM[]>([]);
  const [votingPollId, setVotingPollId] = useState<number | null>(null);
  const [isCreatePollModalVisible, setIsCreatePollModalVisible] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);

  const club = joinedClubs.find(c => String(c.id) === String(id)) || clubs.find(c => String(c.id) === String(id));

  // Determine current user role
  const currentUserRole = (club?.userStatus === 'ADMIN' || (currentUserId && Number(club?.creatorId) === Number(currentUserId)))
    ? 'Trưởng câu lạc bộ'
    : (club?.userStatus === 'SUB_LEADER' ? 'Phó câu lạc bộ' : 'Thành viên');

  const approvedMembers = members.filter(m => m.status === 'APPROVED' || !m.status);
  const pendingMembers = members.filter(m => m.status === 'PENDING');

  // Load current user ID from JWT Token
  useEffect(() => {
    const base64Decode = (str: string): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let buffer = '';
      const cleaned = str.replace(/=+$/, '').replace(/-/g, '+').replace(/_/g, '/');
      let bc = 0, bs = 0;
      for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned.charAt(i);
        const idx = chars.indexOf(char);
        if (idx === -1) continue;
        bs = bc % 4 ? bs * 64 + idx : idx;
        if (bc++ % 4) {
          buffer += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)));
        }
      }
      return buffer;
    };

    const decodeJwt = (token: string): any => {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const decoded = base64Decode(parts[1]);
        return JSON.parse(decodeURIComponent(
          decoded.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        ));
      } catch (e) {
        return null;
      }
    };

    const loadUserId = async () => {
      try {
        let token = '';
        if (Platform.OS === 'web') {
          token = localStorage.getItem('accessToken') || '';
        } else {
          token = await SecureStore.getItemAsync('accessToken') || '';
        }
        if (token) {
          const payload = decodeJwt(token);
          if (payload && payload.userId) {
            setCurrentUserId(Number(payload.userId));
            console.log('[ClubDetailJoinedScreen] Loaded currentUserId from JWT:', payload.userId);
          }
        }
      } catch (e) {
        console.error('Lỗi giải mã token lấy userId:', e);
      }
    };
    loadUserId();
  }, []);

  const fetchMembers = async () => {
    if (!club) return;
    setLoadingMembers(true);
    try {
      const data = await getClubMembersApi(Number(club.id));
      const mapped: MemberItem[] = (data || []).map(m => {
        // ELO ảo: random từ 1200 - 1500 nếu elo null hoặc = 1200
        const virtualElo = m.elo && m.elo !== 1200 ? m.elo : (1000 + (Number(m.userId) % 300) + 150);
        
        let roleText = m.role;
        if (m.role === 'Trưởng nhóm' || m.role === 'ADMIN' || m.role === 'Trưởng câu lạc bộ') {
          roleText = 'Trưởng câu lạc bộ';
        } else if (m.role === 'Phó nhóm' || m.role === 'SUB_LEADER' || m.role === 'Phó câu lạc bộ') {
          roleText = 'Phó câu lạc bộ';
        } else {
          roleText = 'Thành viên';
        }

        return {
          id: m.id,
          userId: Number(m.userId),
          name: m.name,
          role: roleText,
          elo: virtualElo,
          avatar: m.avatar || "",
          status: m.status || 'APPROVED'
        };
      });
      setMembers(mapped);
    } catch (err) {
      console.error('Lỗi tải thành viên:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (isMembersModalVisible) {
      fetchMembers();
    }
  }, [isMembersModalVisible]);

  const fetchClubPolls = async () => {
    if (!club) return;
    try {
      const data = await getClubMatchPollsApi(Number(club.id));
      if (Array.isArray(data)) {
        setMatchPolls(data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách biểu quyết:', err);
    }
  };

  const [realMatches, setRealMatches] = useState<MatchItem[]>([]);

  const fetchMatches = async () => {
    if (!club) return;
    try {
      const data = await getClubMatchesApi(Number(club.id));
      if (Array.isArray(data)) {
        const formatted: MatchItem[] = data.map((m: any) => ({
          id: String(m.id || Math.random()),
          opponentName: m.opponentName || 'Đối thủ',
          opponentAvatar: m.opponentAvatar || '',
          date: m.date || '',
          ourScore: m.ourScore || 0,
          opponentScore: m.opponentScore || 0,
          result: (m.result ? String(m.result).toLowerCase() : 'win') as 'win' | 'lose' | 'draw',
          location: m.location || 'Chưa cập nhật sân',
        }));
        setRealMatches(formatted);
      }
    } catch (err) {
      console.warn('Lỗi tải lịch sử trận đấu:', err);
    }
  };

  useEffect(() => {
    if (club?.id) {
      fetchClubPolls();
      fetchMatches();
    }
  }, [club?.id]);

  const handleTransferLeadership = async (member: MemberItem) => {
    if (!club) return;
    await transferLeadership(club.id, member.userId);
    await Promise.all([fetchMembers(), refreshClubs()]);
  };

  const handleAssignSubLeader = async (member: MemberItem) => {
    if (!club) return;
    await assignSubLeader(club.id, member.userId);
    await Promise.all([fetchMembers(), refreshClubs()]);
  };

  const handleDemoteSubLeader = async (member: MemberItem) => {
    if (!club) return;
    await demoteSubLeader(club.id, member.userId);
    await Promise.all([fetchMembers(), refreshClubs()]);
  };

  const handleKickMember = async (member: MemberItem) => {
    if (!club) return;
    await removeMember(club.id, member.userId);
    await Promise.all([fetchMembers(), refreshClubs()]);
  };

  const handleApproveMember = async (member: MemberItem) => {
    if (!club) return;
    await approveMemberApi(Number(club.id), member.userId);
    await Promise.all([fetchMembers(), refreshClubs()]);
  };

  const handleRejectMember = async (member: MemberItem) => {
    if (!club) return;
    await rejectMemberApi(Number(club.id), member.userId);
    await Promise.all([fetchMembers(), refreshClubs()]);
  };

  if (!club) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết câu lạc bộ</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Không tìm thấy câu lạc bộ này</Text>
          <Button title="Quay lại" onPress={() => router.back()} style={styles.errorBtn} />
        </View>
      </SafeAreaView>
    );
  }

  const handleNativeShare = async () => {
    try {
      const shareUrl = `https://sporta.vn/clubs/join/${club.id}`;
      await Share.share({
        message: `Tham gia câu lạc bộ "${club.name}" cùng mình trên Sporta nhé! Đường dẫn tham gia: ${shareUrl}`,
        url: shareUrl,
        title: `Mời gia nhập CLB ${club.name}`
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const handleCreatePoll = async (payload: CreateMatchPollPayload) => {
    if (!club) return;
    try {
      await createMatchPollApi(Number(club.id), payload);
      await fetchClubPolls();
      setIsCreatePollModalVisible(false);
      showAlert('Thành công', 'Đã tạo biểu quyết mới thành công!');
    } catch (err: any) {
      showAlert('Lỗi', err.message || 'Không thể tạo biểu quyết mới.');
    }
  };

  const handleVote = async (pollId: number, optionId: number) => {
    setVotingPollId(pollId);
    try {
      await voteMatchPollApi(pollId, optionId);
      await fetchClubPolls();
    } catch (err: any) {
      showAlert('Lỗi', err.message || 'Lỗi khi biểu quyết.');
    } finally {
      setVotingPollId(null);
    }
  };

  const handleClosePoll = async (pollId: number) => {
    try {
      await closeMatchPollApi(pollId);
      await fetchClubPolls();
      showAlert('Thành công', 'Đã đóng biểu quyết.');
    } catch (err: any) {
      showAlert('Lỗi', err.message || 'Không thể đóng biểu quyết.');
    }
  };

  const handleSplitInternalTeams = async (pollId: number) => {
    try {
      await splitInternalTeamsApi(pollId);
      await fetchClubPolls();
      showAlert('Thành công', 'Đã tự động chia 2 đội thi đấu cân sức!');
    } catch (err: any) {
      showAlert('Lỗi', err.message || 'Không thể chia đội hình.');
    }
  };

  const handleFormGTLineup = async (pollId: number) => {
    try {
      await formMatchmakingLineupApi(pollId);
      await fetchClubPolls();
      showAlert('Thành công', 'Đã chốt danh sách đội hình thi đấu!');
    } catch (err: any) {
      showAlert('Lỗi', err.message || 'Không thể chốt đội hình.');
    }
  };

  const handleDeletePoll = async (pollId: number) => {
    try {
      await deleteMatchPollApi(pollId);
      await fetchClubPolls();
      showAlert('Thành công', 'Đã xóa biểu quyết.');
    } catch (err: any) {
      showAlert('Lỗi', err.message || 'Không thể xóa biểu quyết.');
    }
  };

  const handleLeavePress = () => {
    const numMembers = members.length;
    
    if (numMembers >= 2 && currentUserRole === 'Trưởng câu lạc bộ') {
      showAlert(
        'Không thể rời nhóm',
        'Bạn là Trưởng câu lạc bộ. Bạn bắt buộc phải chuyển quyền Trưởng câu lạc bộ cho một thành viên khác trước khi rời khỏi câu lạc bộ.'
      );
      return;
    }

    if (numMembers <= 1) {
      setIsDeleteLeaveMode(true);
    } else {
      setIsDeleteLeaveMode(false);
    }

    setIsMembersModalVisible(false);
    setIsLeaveModalVisible(true);
  };

  const handleConfirmLeave = async () => {
    if (!club) return;
    setIsLeaveModalVisible(false);
    setIsMembersModalVisible(false);
    try {
      if (isDeleteLeaveMode) {
        console.log('[ClubDetail] Last member (leader) leaving, deleting club:', club.id);
        await deleteClub(club.id);
        showAlert('Thành công', 'Đã giải tán câu lạc bộ thành công.', () => router.replace('/(tabs)/clubs'));
      } else {
        console.log('[ClubDetail] Leaving club:', club.id);
        await leaveClub(club.id);
        showAlert('Thành công', 'Bạn đã rời câu lạc bộ thành công.', () => router.replace('/(tabs)/clubs'));
      }
    } catch (err: any) {
      showAlert('Lỗi', err.message || 'Thực hiện hành động thất bại.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Header wrapper to color the status bar and notch area white */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {club.name}
          </Text>
          {currentUserRole === 'Trưởng câu lạc bộ' ? (
            <TouchableOpacity 
              style={styles.editHeaderButton}
              activeOpacity={0.8}
              onPress={() => setIsEditModalVisible(true)}
            >
              <MaterialIcons name="edit" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerPlaceholder} />
          )}
        </View>
      </SafeAreaView>

      {/* Main Content */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Reusable Club detail header */}
        <ClubDetailHeader 
          club={club} 
          hideMembersMeta={true} 
          isLeadership={currentUserRole === 'Trưởng câu lạc bộ'}
          userRole={currentUserRole}
          onEditPress={() => setIsEditModalVisible(true)}
          showDescription={true}
        />

        {/* Info Section */}
        <View style={styles.infoSection}>
          {/* Action buttons row */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.rowActionBtn} 
              activeOpacity={0.7} 
              onPress={() => setIsInviteModalVisible(true)}
            >
              <MaterialIcons name="share" size={18} color={COLORS.primary} />
              <Text style={styles.actionBtnText} numberOfLines={1}>Mời bạn</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.rowActionBtn} 
              activeOpacity={0.7} 
              onPress={() => setIsMembersModalVisible(true)}
            >
              <MaterialIcons name="people" size={18} color={COLORS.primary} />
              <Text style={styles.actionBtnText} numberOfLines={1}>Thành viên</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.rowActionBtn} 
              activeOpacity={0.7} 
              onPress={() => setIsHistoryModalVisible(true)}
            >
              <MaterialIcons name="history" size={18} color={COLORS.primary} />
              <Text style={styles.actionBtnText} numberOfLines={1}>Lịch sử</Text>
            </TouchableOpacity>

            {currentUserRole === 'Trưởng câu lạc bộ' && (
              <TouchableOpacity 
                style={[styles.rowActionBtn, styles.rowActionBtnEdit]} 
                activeOpacity={0.7} 
                onPress={() => setIsEditModalVisible(true)}
              >
                <MaterialIcons name="tune" size={18} color={COLORS.primary} />
                <Text style={styles.actionBtnText} numberOfLines={1}>Cài đặt CLB</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Banner Yêu cầu gia nhập (dành cho Trưởng câu lạc bộ) */}
          {currentUserRole === 'Trưởng câu lạc bộ' && pendingMembers.length > 0 && (
            <TouchableOpacity 
              style={styles.pendingBanner}
              activeOpacity={0.85}
              onPress={() => setIsMembersModalVisible(true)}
            >
              <View style={styles.pendingBannerContent}>
                <View style={styles.pendingBadgeIcon}>
                  <MaterialIcons name="person-add" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.pendingBannerTextContainer}>
                  <Text style={styles.pendingBannerTitle}>Yêu cầu gia nhập mới</Text>
                  <Text style={styles.pendingBannerSubtitle}>
                    Có {pendingMembers.length} người đang chờ bạn phê duyệt
                  </Text>
                </View>
              </View>
              <View style={styles.pendingBannerActionBtn}>
                <Text style={styles.pendingBannerActionText}>Duyệt ngay</Text>
                <MaterialIcons name="chevron-right" size={18} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          )}

          {/* Poll / Matchmaking Section (v2.0) */}
          <PollCard 
            polls={matchPolls}
            votingPollId={votingPollId}
            isLeaderOrSubLeader={currentUserRole === 'Trưởng câu lạc bộ' || currentUserRole === 'Phó câu lạc bộ'}
            onVote={handleVote}
            onClosePoll={handleClosePoll}
            onSplitInternalTeams={handleSplitInternalTeams}
            onFormGTLineup={handleFormGTLineup}
            onDeletePoll={handleDeletePoll}
            onCreatePollPress={() => setIsCreatePollModalVisible(true)}
          />
        </View>
      </ScrollView>

      {/* Custom Leave Confirmation Modal */}
      <LeaveConfirmationModal 
        visible={isLeaveModalVisible}
        onClose={() => setIsLeaveModalVisible(false)}
        onConfirm={handleConfirmLeave}
        clubName={club.name}
        isDelete={isDeleteLeaveMode}
      />

      {/* Group Members Full Screen Modal */}
      <MembersModal 
        visible={isMembersModalVisible}
        onClose={() => setIsMembersModalVisible(false)}
        membersCount={approvedMembers.length > 0 ? approvedMembers.length : club.members}
        members={members}
        onLeavePress={handleLeavePress}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
        onTransferLeadership={handleTransferLeadership}
        onAssignSubLeader={handleAssignSubLeader}
        onDemoteSubLeader={handleDemoteSubLeader}
        onKickMember={handleKickMember}
        onApproveMember={handleApproveMember}
        onRejectMember={handleRejectMember}
        onRefreshMembers={fetchMembers}
      />

      {/* Invite Friend Modal */}
      <InviteModal 
        visible={isInviteModalVisible}
        onClose={() => setIsInviteModalVisible(false)}
        club={club}
        onShare={handleNativeShare}
        copied={copied}
        onCopy={handleCopyLink}
      />

      {/* Create Poll Modal (v2.0) */}
      <CreatePollModal 
        visible={isCreatePollModalVisible}
        onClose={() => setIsCreatePollModalVisible(false)}
        onSubmit={handleCreatePoll}
        clubSportName={club.sport}
      />

      {/* Match History Full Screen Modal */}
      <MatchHistoryModal 
        visible={isHistoryModalVisible}
        onClose={() => setIsHistoryModalVisible(false)}
        club={club}
        matches={realMatches.length > 0 ? realMatches : MOCK_MATCH_HISTORY}
        isLeadership={currentUserRole === 'Trưởng câu lạc bộ'}
        onRefreshMatches={fetchMatches}
      />

      {/* Edit Club Modal (Dành riêng cho Trưởng câu lạc bộ) */}
      {currentUserRole === 'Trưởng câu lạc bộ' && (
        <EditClubModal 
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          club={club}
          onSuccess={async () => {
            await Promise.all([fetchMembers(), refreshClubs()]);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    height: 64,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    position: 'absolute',
    left: 60,
    right: 60,
    textAlign: 'center',
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  editHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scroll: {
    flex: 1,
  },
  infoSection: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  bioCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primaryOpacity05,
    borderColor: COLORS.primaryOpacity15,
    borderRadius: BORDER_RADIUS.lg,
  },
  bioHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  editBioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs + 4,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity08 || COLORS.surfaceContainerLow,
    gap: 3,
  },
  editBioText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: SPACING.base,
    marginTop: 0,
  },
  description: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 0,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.md,
  },
  rowActionBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
    backgroundColor: COLORS.surface,
    gap: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  rowActionBtnEdit: {
    borderColor: '#fde68a',
    backgroundColor: '#fefce8',
  },
  actionBtnText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryOpacity08,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  pendingBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  pendingBadgeIcon: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingBannerTextContainer: {
    flex: 1,
  },
  pendingBannerTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  pendingBannerSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  pendingBannerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.md,
    gap: 2,
  },
  pendingBannerActionText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.base,
  },
  errorText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  errorBtn: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
});

export default ClubDetailJoinedScreen;
