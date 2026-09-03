import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, StatusBar, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button, Avatar } from '../../../shared/ui';
import { useClubs, ClubDetailHeader } from '../../../entities/club';
import { InviteModal } from './components/InviteModal';
import { LeaveConfirmationModal } from './components/LeaveConfirmationModal';
import { MembersModal, MemberItem } from './components/MembersModal';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { MatchItem } from './components/MatchHistoryCard';
import { ClubInfoModal } from './components/ClubInfoModal';
import { EditClubModal } from './components/EditClubModal';
import { CreatePollModal } from './components/CreatePollModal';
import { PollCard } from './components/PollCard';
import { MatchPollVM } from '../../../entities/match/model/match.types';
import {
  getClubByIdApi,
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
import { usersApi, UserProfileDto } from '../../../shared/api/users';

export function ClubDetailJoinedScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clubs, joinedClubs, leaveClub, deleteClub, transferLeadership, refreshClubs, assignSubLeader, demoteSubLeader, removeMember } = useClubs();
  const { showAlert } = useAlert();

  // Authoritative Club state from API (with fresh CRP & Member-calculated Average ELO)
  const [authoritativeClub, setAuthoritativeClub] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  const [isDeleteLeaveMode, setIsDeleteLeaveMode] = useState(false);
  const [isMembersModalVisible, setIsMembersModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Members State
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Poll & Matchmaking States
  const [matchPolls, setMatchPolls] = useState<MatchPollVM[]>([]);
  const [votingPollId, setVotingPollId] = useState<number | null>(null);
  const [isCreatePollModalVisible, setIsCreatePollModalVisible] = useState(false);

  // Club Matches State
  const [clubMatches, setClubMatches] = useState<MatchItem[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfileDto | null>(null);

  useEffect(() => {
    usersApi.getProfile().then(setCurrentUserProfile).catch(() => {});
  }, []);

  const isDevUser = __DEV__ || !!currentUserProfile?.isDevTester || currentUserProfile?.role === 'ADMIN' || currentUserProfile?.role === 'SUPER_ADMIN';

  const baseClub = joinedClubs.find(c => String(c.id) === String(id)) || clubs.find(c => String(c.id) === String(id));
  const club = authoritativeClub || baseClub;

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
          }
        }
      } catch (e) {
        console.error('Lỗi giải mã token lấy userId:', e);
      }
    };
    loadUserId();
  }, []);

  // Fetch Club authoritative info
  const numericClubId = id ? (typeof id === 'string' ? parseInt(id.replace('club-', ''), 10) : Number(id)) : 0;

  const fetchClubDetails = async () => {
    if (!numericClubId || isNaN(numericClubId)) return;
    try {
      const data = await getClubByIdApi(numericClubId);
      if (data) {
        setAuthoritativeClub(data);
      }
    } catch (err) {
      console.warn('Lỗi tải chi tiết CLB:', err);
    }
  };

  const fetchMembers = async () => {
    if (!numericClubId || isNaN(numericClubId)) return;
    setLoadingMembers(true);
    try {
      const data = await getClubMembersApi(numericClubId);
      const mapped: MemberItem[] = (data || []).map(m => {
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
          name: m.name || m.fullName || 'Thành viên',
          role: roleText,
          elo: m.elo || 1200,
          avatar: m.avatar || m.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
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

  const fetchClubPolls = async () => {
    if (!numericClubId || isNaN(numericClubId)) return;
    try {
      const data = await getClubMatchPollsApi(numericClubId);
      if (Array.isArray(data)) {
        setMatchPolls(data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách biểu quyết:', err);
    }
  };

  const fetchMatches = async () => {
    if (!numericClubId || isNaN(numericClubId)) return;
    setLoadingMatches(true);
    try {
      const data = await getClubMatchesApi(numericClubId);
      if (Array.isArray(data)) {
        const formatted: MatchItem[] = data.map((m: any) => ({
          id: String(m.id || Math.random()),
          matchId: m.matchId,
          opponentClubId: m.opponentClubId,
          opponentName: m.opponentName || 'CLB Đối thủ',
          opponentAvatar: m.opponentAvatar || 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=100&auto=format&fit=crop&q=80',
          date: m.date || '',
          ourScore: m.ourScore || 0,
          opponentScore: m.opponentScore || 0,
          scoreText: m.scoreText || `${m.ourScore || 0} - ${m.opponentScore || 0}`,
          result: (m.result ? String(m.result).toLowerCase() : 'draw') as 'win' | 'lose' | 'draw',
          crpDelta: m.crpDelta,
          location: m.location || 'Sân bóng Sporta',
          matchType: m.matchType || 'Giao hữu Xếp Hạng CLB',
        }));
        setClubMatches(formatted);
      }
    } catch (err) {
      console.warn('Lỗi tải lịch sử trận đấu CLB:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const loadAllData = async () => {
    if (!id) return;
    await Promise.all([
      fetchClubDetails(),
      fetchClubPolls(),
      fetchMembers(),
      fetchMatches(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (id) {
      loadAllData();
      const interval = setInterval(() => {
        fetchClubDetails();
        fetchClubPolls();
        fetchMembers();
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [id, numericClubId]);

  const handleNativeShare = async () => {
    if (!club) return;
    try {
      const shareUrl = `https://sporta.vn/clubs/join/${club.id}`;
      await Share.share({
        message: `Tham gia câu lạc bộ "${club.name}" cùng mình trên Sporta nhé! Đường dẫn: ${shareUrl}`,
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

  const handleOpenCreatePoll = () => {
    if (currentUserRole !== 'Trưởng câu lạc bộ' && currentUserRole !== 'Phó câu lạc bộ') {
      showAlert('Quyền hạn', 'Chỉ Trưởng hoặc Phó câu lạc bộ mới có quyền tạo biểu quyết thi đấu.');
      return;
    }
    setIsCreatePollModalVisible(true);
  };

  const handleCreatePoll = async (payload: CreateMatchPollPayload) => {
    if (!club) return;
    if (currentUserRole !== 'Trưởng câu lạc bộ' && currentUserRole !== 'Phó câu lạc bộ') {
      showAlert('Quyền hạn', 'Chỉ Trưởng hoặc Phó câu lạc bộ mới có quyền tạo biểu quyết thi đấu.');
      return;
    }
    try {
      await createMatchPollApi(Number(club.id), payload);
      setIsCreatePollModalVisible(false);
      await fetchClubPolls();
      setTimeout(() => {
        showAlert('Thành công', 'Đã tạo biểu quyết mới thành công!');
      }, 350);
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

  const handleTransferLeadership = async (member: MemberItem) => {
    if (!club) return;
    await transferLeadership(club.id, member.userId);
    await Promise.all([fetchMembers(), fetchClubDetails(), refreshClubs()]);
  };

  const handleAssignSubLeader = async (member: MemberItem) => {
    if (!club) return;
    await assignSubLeader(club.id, member.userId);
    await Promise.all([fetchMembers(), fetchClubDetails(), refreshClubs()]);
  };

  const handleDemoteSubLeader = async (member: MemberItem) => {
    if (!club) return;
    await demoteSubLeader(club.id, member.userId);
    await Promise.all([fetchMembers(), fetchClubDetails(), refreshClubs()]);
  };

  const handleKickMember = async (member: MemberItem) => {
    if (!club) return;
    await removeMember(club.id, member.userId);
    await Promise.all([fetchMembers(), fetchClubDetails(), refreshClubs()]);
  };

  const handleApproveMember = async (member: MemberItem) => {
    if (!club) return;
    await approveMemberApi(Number(club.id), member.userId);
    await Promise.all([fetchMembers(), fetchClubDetails(), refreshClubs()]);
  };

  const handleRejectMember = async (member: MemberItem) => {
    if (!club) return;
    await rejectMemberApi(Number(club.id), member.userId);
    await Promise.all([fetchMembers(), fetchClubDetails(), refreshClubs()]);
  };

  const handleLeavePress = () => {
    const numMembers = approvedMembers.length;
    if (currentUserRole === 'Trưởng câu lạc bộ') {
      if (numMembers >= 2) {
        showAlert(
          'Không thể rời nhóm',
          'Bạn là Trưởng câu lạc bộ. Bạn bắt buộc phải chuyển quyền Trưởng câu lạc bộ cho một thành viên khác trước khi rời khỏi câu lạc bộ.'
        );
        return;
      }
      setIsDeleteLeaveMode(true);
      setIsLeaveModalVisible(true);
      return;
    }

    // Phó câu lạc bộ và Thành viên thường có thể tự do rời CLB
    setIsDeleteLeaveMode(false);
    setIsLeaveModalVisible(true);
  };

  const handleConfirmLeave = async () => {
    if (!club) return;
    setIsLeaveModalVisible(false);
    setIsMembersModalVisible(false);
    setIsInfoModalVisible(false);
    try {
      if (isDeleteLeaveMode) {
        await deleteClub(club.id);
      } else {
        await leaveClub(club.id);
      }
      router.replace('/(tabs)/clubs');
    } catch (err: any) {
      showAlert('Lỗi', err.message || 'Thao tác thất bại.');
    }
  };

  if (!club) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerIconBtn} 
            activeOpacity={0.7} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={22} color={COLORS.onSurface} />
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

  // Calculate Match Statistics for Card Summary
  const totalMatches = clubMatches.length;
  const winsCount = clubMatches.filter(m => m.result === 'win').length;
  const lossesCount = clubMatches.filter(m => m.result === 'lose').length;
  const drawsCount = clubMatches.filter(m => m.result === 'draw').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* 1. CLEAN TOP BAR (Back, Title, Info 'i', Share, Settings) */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerIconBtn} 
            activeOpacity={0.7} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {club.name}
          </Text>

          <View style={styles.headerRightActions}>
            {/* Info 'i' Button */}
            <TouchableOpacity 
              style={styles.headerIconBtn}
              activeOpacity={0.7}
              onPress={() => setIsInfoModalVisible(true)}
            >
              <Ionicons name="information-circle-outline" size={21} color={COLORS.primary} />
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity 
              style={styles.headerIconBtn} 
              activeOpacity={0.7}
              onPress={handleNativeShare}
            >
              <Ionicons name="share-social-outline" size={20} color={COLORS.onSurface} />
            </TouchableOpacity>

            {/* Settings Button (Only for Leader) */}
            {currentUserRole === 'Trưởng câu lạc bộ' && (
              <TouchableOpacity 
                style={styles.headerIconBtn}
                activeOpacity={0.8}
                onPress={() => setIsEditModalVisible(true)}
              >
                <MaterialIcons name="tune" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Main Content ScrollView */}
      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* 2. HERO HEADER (Clean cover, avatar, role badge, status tags) */}
        <ClubDetailHeader 
          club={club} 
          isLeadership={currentUserRole === 'Trưởng câu lạc bộ'}
          userRole={currentUserRole}
        />

        {/* 3. PERFORMANCE METRICS STACK (Calculated Real CRP & Member Average ELO) */}
        <View style={styles.metricsContainer}>
          {/* Card 1: Điểm Xếp Hạng CLB (CRP) -> Nhấn để xem BXH */}
          <TouchableOpacity 
            style={styles.metricCard}
            activeOpacity={0.85}
            onPress={() => router.push('/leaderboard' as any)}
          >
            <View style={styles.metricCardHeader}>
              <View style={[styles.metricIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <FontAwesome5 name="trophy" size={15} color="#2563EB" />
              </View>
              <Text style={styles.metricCardLabel}>Điểm CLB (CRP)</Text>
            </View>
            <Text style={[styles.metricMainValue, { color: '#2563EB' }]}>
              {club.crp !== undefined ? `${club.crp}` : '0'}<Text style={styles.metricUnit}> CRP</Text>
            </Text>
            <View style={styles.metricFooterRow}>
              <MaterialIcons name="leaderboard" size={13} color="#2563EB" />
              <Text style={[styles.metricFooterText, { color: '#2563EB', fontWeight: '700' }]}>
                Xem BXH & Phần Thưởng ➜
              </Text>
            </View>
          </TouchableOpacity>

          {/* Card 2: Elo Trung Bình CLB (Toàn bộ thành viên) */}
          <View style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <View style={[styles.metricIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <MaterialIcons name="stars" size={18} color="#D97706" />
              </View>
              <Text style={styles.metricCardLabel}>Elo Trung Bình</Text>
            </View>
            <Text style={[styles.metricMainValue, { color: '#D97706' }]}>
              {club.averageElo || club.elo || 1200}<Text style={styles.metricUnit}> Elo</Text>
            </Text>
            <View style={styles.metricFooterRow}>
              <MaterialIcons name="bolt" size={13} color="#D97706" />
              <Text style={[styles.metricFooterText, { color: '#B45309', fontWeight: '700' }]}>
                Trình độ: {club.levelLabel || 'Trung bình'}
              </Text>
            </View>
          </View>
        </View>

        {/* 4. MODULAR NAVIGATION CARDS (Sub-views mở Modal chuyên biệt) */}
        <View style={styles.subCardsSection}>
          {/* Sub Card 1: Thành viên CLB */}
          <TouchableOpacity 
            style={styles.navCard}
            activeOpacity={0.8}
            onPress={() => setIsMembersModalVisible(true)}
          >
            <View style={styles.navCardLeft}>
              <View style={[styles.navCardIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="people" size={20} color="#059669" />
              </View>
              <View style={styles.navCardInfo}>
                <View style={styles.navCardTitleRow}>
                  <Text style={styles.navCardTitle}>Thành viên CLB</Text>
                  {pendingMembers.length > 0 && (
                    <View style={styles.pendingDotBadge}>
                      <Text style={styles.pendingDotText}>+{pendingMembers.length} chờ</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.navCardSub}>
                  {approvedMembers.length} / {club.maxMembers || 50} thành viên chính thức
                </Text>
              </View>
            </View>

            <View style={styles.navCardRight}>
              {/* Mini Avatar Stack */}
              <View style={styles.avatarStack}>
                {approvedMembers.slice(0, 3).map((m, idx) => (
                  <View key={m.id || idx} style={[styles.stackAvatarWrapper, { marginLeft: idx > 0 ? -10 : 0 }]}>
                    <Avatar size={24} source={m.avatar} />
                  </View>
                ))}
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
            </View>
          </TouchableOpacity>

          {/* Sub Card 2: Lịch sử đối đầu CLB */}
          <TouchableOpacity 
            style={styles.navCard}
            activeOpacity={0.8}
            onPress={() => setIsHistoryModalVisible(true)}
          >
            <View style={styles.navCardLeft}>
              <View style={[styles.navCardIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="trophy" size={18} color="#2563EB" />
              </View>
              <View style={styles.navCardInfo}>
                <Text style={styles.navCardTitle}>Lịch sử đối đầu CLB</Text>
                <Text style={styles.navCardSub}>
                  {totalMatches > 0 
                    ? `Phong độ: ${winsCount} Thắng - ${drawsCount} Hòa - ${lossesCount} Thua`
                    : 'Chưa có dữ liệu thi đấu xếp hạng'}
                </Text>
              </View>
            </View>

            <View style={styles.navCardRight}>
              <View style={styles.matchesCountBadge}>
                <Text style={styles.matchesCountText}>{totalMatches} trận</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 5. MAIN CORE SECTION: BIỂU QUYẾT & ĐỘI HÌNH RA SÂN */}
        <View style={styles.corePollsSection}>
          {/* Pending Requests Banner for Leadership */}
          {(currentUserRole === 'Trưởng câu lạc bộ' || currentUserRole === 'Phó câu lạc bộ') && pendingMembers.length > 0 && (
            <TouchableOpacity 
              style={styles.pendingActionBanner}
              activeOpacity={0.85}
              onPress={() => setIsMembersModalVisible(true)}
            >
              <View style={styles.pendingActionLeft}>
                <View style={styles.pendingAlertIcon}>
                  <Ionicons name="person-add" size={18} color="#D97706" />
                </View>
                <View>
                  <Text style={styles.pendingAlertTitle}>Yêu cầu gia nhập mới</Text>
                  <Text style={styles.pendingAlertSub}>
                    Có {pendingMembers.length} người đang chờ bạn phê duyệt
                  </Text>
                </View>
              </View>
              <View style={styles.pendingDuyetBtn}>
                <Text style={styles.pendingDuyetText}>Duyệt ngay</Text>
                <MaterialIcons name="chevron-right" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}

          {/* PollCard component */}
          <PollCard 
            polls={matchPolls}
            votingPollId={votingPollId}
            isLeaderOrSubLeader={currentUserRole === 'Trưởng câu lạc bộ' || currentUserRole === 'Phó câu lạc bộ'}
            onVote={handleVote}
            onClosePoll={handleClosePoll}
            onSplitInternalTeams={handleSplitInternalTeams}
            onFormGTLineup={handleFormGTLineup}
            onDeletePoll={handleDeletePoll}
            onCreatePollPress={handleOpenCreatePoll}
            members={members}
            onRefreshPolls={fetchClubPolls}
            isDevUser={isDevUser}
          />
        </View>
      </ScrollView>

      {/* 6. DEDICATED MODALS */}
      <ClubInfoModal
        visible={isInfoModalVisible}
        club={club}
        onClose={() => setIsInfoModalVisible(false)}
        onLeavePress={handleLeavePress}
        isSoleMember={approvedMembers.length <= 1}
      />

      <MembersModal 
        visible={isMembersModalVisible}
        membersCount={approvedMembers.length}
        members={members}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
        onClose={() => setIsMembersModalVisible(false)}
        onTransferLeadership={handleTransferLeadership}
        onAssignSubLeader={handleAssignSubLeader}
        onDemoteSubLeader={handleDemoteSubLeader}
        onKickMember={handleKickMember}
        onApproveMember={handleApproveMember}
        onRejectMember={handleRejectMember}
        onRefreshMembers={fetchMembers}
        onLeavePress={handleLeavePress}
      />

      <MatchHistoryModal 
        visible={isHistoryModalVisible}
        club={club}
        matches={clubMatches}
        onClose={() => setIsHistoryModalVisible(false)}
        onRefreshMatches={fetchMatches}
      />

      <InviteModal 
        visible={isInviteModalVisible}
        club={club}
        copied={copied}
        onCopy={handleCopyLink}
        onShare={handleNativeShare}
        onClose={() => setIsInviteModalVisible(false)}
      />

      <EditClubModal 
        visible={isEditModalVisible}
        club={club}
        onClose={() => setIsEditModalVisible(false)}
        onSuccess={() => {
          setIsEditModalVisible(false);
          fetchClubDetails();
          refreshClubs();
        }}
      />

      <CreatePollModal 
        visible={isCreatePollModalVisible}
        onClose={() => setIsCreatePollModalVisible(false)}
        onSubmit={handleCreatePoll}
        clubSportName={club.sport}
      />

      <LeaveConfirmationModal 
        visible={isLeaveModalVisible}
        clubName={club.name}
        isDelete={isDeleteLeaveMode}
        onConfirm={handleConfirmLeave}
        onClose={() => setIsLeaveModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
    zIndex: 10,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerPlaceholder: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  errorText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.error,
    textAlign: 'center',
  },
  errorBtn: {
    marginTop: 12,
    minWidth: 140,
  },

  /* 3. METRICS CARDS */
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  metricIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metricMainValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metricFooterText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  /* 4. MODULAR NAVIGATION CARDS */
  subCardsSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  navCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  navCardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navCardInfo: {
    flex: 1,
  },
  navCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navCardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  pendingDotBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingDotText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  navCardSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  navCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackAvatarWrapper: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 14,
  },
  matchesCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  matchesCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },

  /* 5. MAIN CORE POLLS SECTION */
  corePollsSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 28,
  },
  pendingActionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 12,
  },
  pendingActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  pendingAlertIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingAlertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  pendingAlertSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
  },
  pendingDuyetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#D97706',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  pendingDuyetText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
