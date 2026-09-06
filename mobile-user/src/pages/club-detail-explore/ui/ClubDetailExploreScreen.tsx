import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
  Platform,
  Share,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button, Avatar } from '../../../shared/ui';
import { useClubs, ClubDetailHeader, Club } from '../../../entities/club';
import { getClubByIdApi, getClubMembersApi, getClubMatchesApi } from '../../../shared/api/clubs';
import { ClubInfoModal } from '../../club-detail-joined/ui/components/ClubInfoModal';
import { MembersModal, MemberItem } from '../../club-detail-joined/ui/components/MembersModal';
import { MatchHistoryModal } from '../../club-detail-joined/ui/components/MatchHistoryModal';
import { MatchItem } from '../../club-detail-joined/ui/components/MatchHistoryCard';

export function ClubDetailExploreScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clubs, joinedClubs, joinClub } = useClubs();

  const [authoritativeClub, setAuthoritativeClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Sub-Modals
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [isMembersModalVisible, setIsMembersModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);

  // Members & Matches data
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Join Action Alert Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalIcon, setModalIcon] = useState<'check-circle' | 'mail-outline' | 'shield' | 'info'>('check-circle');
  const [isJoinSuccess, setIsJoinSuccess] = useState(false);

  // Require Auth Modal State
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [joining, setJoining] = useState(false);

  const cachedClub =
    joinedClubs.find((c) => String(c.id) === String(id)) ||
    clubs.find((c) => String(c.id) === String(id));

  const club = authoritativeClub || cachedClub;

  const fetchClubDetails = async (showLoading = true) => {
    if (!id) return;
    const numId = Number(id);
    if (isNaN(numId)) return;

    if (showLoading) setLoading(true);
    try {
      const data = await getClubByIdApi(numId);
      setAuthoritativeClub(data);

      // If club is public, load members & matches preview
      if (!data.isPrivate) {
        loadMembers(numId);
        loadMatches(numId);
      }
    } catch (err) {
      console.warn('Failed to fetch club detail:', err);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMembers = async (clubId: number) => {
    setLoadingMembers(true);
    try {
      const res = await getClubMembersApi(clubId);
      if (Array.isArray(res)) {
        const mapped: MemberItem[] = res.map((m: any) => {
          let roleText = 'Thành viên';
          const r = String(m.role || m.roleCode || '').toUpperCase();
          if (r === 'ADMIN' || r === 'TRƯỞNG CÂU LẠC BỘ' || r === 'TRƯỞNG NHÓM' || m.role === 'Trưởng câu lạc bộ' || m.role === 'Trưởng nhóm') {
            roleText = 'Trưởng câu lạc bộ';
          } else if (r === 'SUB_LEADER' || r === 'PHÓ CÂU LẠC BỘ' || r === 'PHÓ NHÓM' || m.role === 'Phó câu lạc bộ' || m.role === 'Phó nhóm') {
            roleText = 'Phó câu lạc bộ';
          }

          return {
            id: m.id || m.userId,
            userId: m.userId,
            name: m.fullName || m.name || 'Thành viên',
            role: roleText,
            elo: m.elo || 1200,
            avatar: m.avatar || m.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
            status: m.status || 'APPROVED',
          };
        });
        setMembers(mapped);
      }
    } catch (e) {
      console.warn('Failed to load members preview:', e);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadMatches = async (clubId: number) => {
    setLoadingMatches(true);
    try {
      const res = await getClubMatchesApi(clubId);
      if (Array.isArray(res)) {
        const mapped: MatchItem[] = res.map((m: any) => ({
          id: String(m.id || m.matchId),
          matchId: m.matchId || String(m.id),
          opponentClubId: m.opponentClubId,
          opponentName: m.opponentName || m.opponentClubName || 'Đối thủ',
          opponentAvatar: m.opponentAvatar,
          date: m.date || m.matchDate || '',
          ourScore: m.ourScore ?? m.homeScore ?? 0,
          opponentScore: m.opponentScore ?? m.awayScore ?? 0,
          scoreText: m.score || m.scoreText || `${m.ourScore ?? m.homeScore ?? 0} - ${m.opponentScore ?? m.awayScore ?? 0}`,
          result: m.result === 'win' ? 'win' : (m.result === 'lose' ? 'lose' : 'draw'),
          crpDelta: m.crpDelta,
          location: m.location || m.venueName || 'Sân bãi',
        }));
        setMatches(mapped);
      }
    } catch (e) {
      console.warn('Failed to load matches preview:', e);
    } finally {
      setLoadingMatches(false);
    }
  };

  useEffect(() => {
    fetchClubDetails(true);
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchClubDetails(false);
  };

  const handleShare = async () => {
    if (!club) return;
    try {
      await Share.share({
        message: `Khám phá câu lạc bộ thể thao "${club.name}" trên Sporta!`,
        url: `https://sporta.vn/clubs/${club.id}`,
      });
    } catch (e) {
      console.log('Error sharing:', e);
    }
  };

  const handleJoinPress = async () => {
    if (!club) return;

    let token = '';
    if (Platform.OS === 'web') {
      token = localStorage.getItem('accessToken') || '';
    } else {
      token = (await SecureStore.getItemAsync('accessToken')) || '';
    }

    if (!token) {
      setIsAuthModalVisible(true);
      return;
    }

    setJoining(true);
    try {
      await joinClub(club.id);
      setIsJoinSuccess(true);
      if (club.isPrivate) {
        setModalTitle('Đã gửi yêu cầu');
        setModalMessage(`Đã gửi yêu cầu tham gia câu lạc bộ "${club.name}" tới Trưởng CLB.`);
        setModalIcon('mail-outline');
      } else {
        setModalTitle('Tham gia thành công');
        setModalMessage(`Bạn đã chính thức gia nhập câu lạc bộ "${club.name}"!`);
        setModalIcon('check-circle');
      }
      setIsModalVisible(true);
      fetchClubDetails(false);
    } catch (error: any) {
      setIsJoinSuccess(false);
      const msg = error.message || 'Đã xảy ra lỗi khi tham gia câu lạc bộ.';
      if (msg.includes('Elo') || msg.includes('xác minh') || msg.includes('VERIFIED')) {
        setModalTitle('Chưa đủ điều kiện Elo');
        setModalIcon('shield');
      } else {
        setModalTitle('Không thể tham gia');
        setModalIcon('info');
      }
      setModalMessage(msg);
      setIsModalVisible(true);
    } finally {
      setJoining(false);
    }
  };

  if (loading && !club) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.iconCircleBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết câu lạc bộ</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu câu lạc bộ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!club) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.iconCircleBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết câu lạc bộ</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingBox}>
          <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorTitle}>Không tìm thấy câu lạc bộ này</Text>
          <Button title="Quay lại" onPress={() => router.back()} style={{ marginTop: 12 }} />
        </View>
      </SafeAreaView>
    );
  }

  // Calculate Match Stats preview
  const winsCount = matches.filter(m => m.result === 'win').length;
  const lossesCount = matches.filter(m => m.result === 'lose').length;
  const drawsCount = matches.filter(m => m.result === 'draw').length;
  const totalMatchesCount = matches.length;
  const winRate = totalMatchesCount > 0 ? Math.round((winsCount / totalMatchesCount) * 100) : 0;

  // Membership status determination
  const isAlreadyMember = club.userStatus === 'ADMIN' || club.userStatus === 'SUB_LEADER' || club.userStatus === 'MEMBER';
  const isPendingMember = club.userStatus === 'PENDING';
  const roleText = isAlreadyMember 
    ? (club.userStatus === 'ADMIN' ? 'Trưởng câu lạc bộ' : (club.userStatus === 'SUB_LEADER' ? 'Phó câu lạc bộ' : 'Thành viên'))
    : 'Khách';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Header Top Bar */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.headerBar}>
          <TouchableOpacity 
            style={styles.iconCircleBtn} 
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {club.name}
          </Text>

          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.iconCircleBtn, styles.infoIconBtn]}
              activeOpacity={0.7}
              onPress={() => setIsInfoModalVisible(true)}
            >
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.iconCircleBtn} 
              activeOpacity={0.7}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={19} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* 2. Hero Cover & Header Profile */}
        <ClubDetailHeader
          club={club}
          userRole={roleText}
        />

        {/* 3. Metrics Cards (2 Equal Columns Grid) */}
        <View style={styles.metricsGrid}>
          {/* Card 1: CRP Rank Score */}
          <View style={[styles.metricCard, styles.metricCardCrp]}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="trophy" size={16} color="#D97706" />
              </View>
              <Text style={styles.metricLabel}>Điểm CRP CLB</Text>
            </View>
            <Text style={[styles.metricValue, { color: '#B45309' }]}>
              {club.crp || 0}
            </Text>
            <View style={styles.metricFooterRow}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{club.levelLabel || 'Chưa xếp hạng'}</Text>
              </View>
              <Text style={styles.metricSubText}>
                {club.rankedWins || 0}W / {club.finalMatches || 0} Trận
              </Text>
            </View>
          </View>

          {/* Card 2: Weighted Member Average ELO */}
          <View style={[styles.metricCard, styles.metricCardElo]}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <MaterialIcons name="stars" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.metricLabel}>ELO trung bình</Text>
            </View>
            <Text style={[styles.metricValue, { color: COLORS.primary }]}>
              {club.averageElo || club.elo || 1000}
            </Text>
            <View style={styles.metricFooterRow}>
              <View style={[styles.levelBadge, { backgroundColor: '#DBEAFE' }]}>
                <Text style={[styles.levelBadgeText, { color: '#1E40AF' }]}>
                  {club.levelLabel || 'CLB Cơ bản'}
                </Text>
              </View>
              <Text style={styles.metricSubText}>Toàn bộ TV</Text>
            </View>
          </View>
        </View>

        {/* 4. Sub-Navigation Cards (Members & Match History) */}
        <View style={styles.subCardsGrid}>
          {/* A. Thành viên CLB Card */}
          {club.isPrivate ? (
            /* Locked State for Private Club */
            <View style={[styles.subCard, styles.subCardLocked]}>
              <View style={styles.subCardTopRow}>
                <View style={[styles.subCardIconWrap, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="lock-closed" size={18} color="#DC2626" />
                </View>
                <View style={styles.lockedPill}>
                  <Text style={styles.lockedPillText}>Riêng tư</Text>
                </View>
              </View>
              <Text style={styles.subCardTitle}>Thành viên CLB</Text>
              <Text style={styles.lockedSubCardNote}>
                Danh sách thành viên được ẩn do câu lạc bộ đặt chế độ riêng tư.
              </Text>
            </View>
          ) : (
            /* Active State for Public Club */
            <TouchableOpacity 
              style={styles.subCard}
              activeOpacity={0.85}
              onPress={() => setIsMembersModalVisible(true)}
            >
              <View style={styles.subCardTopRow}>
                <View style={[styles.subCardIconWrap, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="people" size={18} color={COLORS.primary} />
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </View>
              <Text style={styles.subCardTitle}>Thành viên CLB</Text>
              <Text style={styles.subCardDesc}>
                {club.members}/{club.maxMembers} thành viên đã tham gia
              </Text>

              {/* Mini Avatar Stack */}
              <View style={styles.avatarStackRow}>
                {members.slice(0, 4).map((m, idx) => (
                  <View 
                    key={m.id || idx} 
                    style={[styles.stackAvatarWrapper, { marginLeft: idx === 0 ? 0 : -8, zIndex: 10 - idx }]}
                  >
                    <Avatar size={24} source={m.avatar} fallbackType="user" />
                  </View>
                ))}
                {members.length > 4 && (
                  <View style={[styles.stackMoreCircle, { zIndex: 5 }]}>
                    <Text style={styles.stackMoreText}>+{members.length - 4}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* B. Lịch sử đối đầu CLB Card */}
          {club.isPrivate ? (
            /* Locked State for Private Club */
            <View style={[styles.subCard, styles.subCardLocked]}>
              <View style={styles.subCardTopRow}>
                <View style={[styles.subCardIconWrap, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="lock-closed" size={18} color="#DC2626" />
                </View>
                <View style={styles.lockedPill}>
                  <Text style={styles.lockedPillText}>Riêng tư</Text>
                </View>
              </View>
              <Text style={styles.subCardTitle}>Lịch sử đối đầu</Text>
              <Text style={styles.lockedSubCardNote}>
                Lịch sử đối đầu được ẩn do câu lạc bộ đặt chế độ riêng tư.
              </Text>
            </View>
          ) : (
            /* Active State for Public Club */
            <TouchableOpacity 
              style={styles.subCard}
              activeOpacity={0.85}
              onPress={() => setIsHistoryModalVisible(true)}
            >
              <View style={styles.subCardTopRow}>
                <View style={[styles.subCardIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="trophy-outline" size={18} color="#D97706" />
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </View>
              <Text style={styles.subCardTitle}>Lịch sử đối đầu</Text>
              <Text style={styles.subCardDesc}>
                {totalMatchesCount > 0 ? `${winRate}% tỷ lệ thắng` : 'Chưa có trận giao hữu'}
              </Text>

              <View style={styles.matchStatsRow}>
                <Text style={[styles.matchStatBadge, { color: '#059669', backgroundColor: '#ECFDF5' }]}>
                  {winsCount} thắng
                </Text>
                <Text style={[styles.matchStatBadge, { color: '#64748B', backgroundColor: '#F1F5F9' }]}>
                  {drawsCount} hòa
                </Text>
                <Text style={[styles.matchStatBadge, { color: '#EF4444', backgroundColor: '#FEF2F2' }]}>
                  {lossesCount} thua
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* 5. Requirements & Elo Eligibility Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="shield-checkmark" size={18} color="#D97706" />
            <Text style={styles.sectionHeaderTitle}>Điều kiện tham gia câu lạc bộ</Text>
          </View>

          <View style={styles.requirementBox}>
            <View style={styles.reqBadgeRow}>
              <View style={[
                styles.eloBadgePill, 
                (club.minEloRequired && club.minEloRequired > 0) ? styles.eloBadgePillRequired : styles.eloBadgePillFree
              ]}>
                <MaterialIcons 
                  name="stars" 
                  size={14} 
                  color={(club.minEloRequired && club.minEloRequired > 0) ? '#D97706' : '#059669'} 
                />
                <Text style={[
                  styles.eloBadgePillText,
                  (club.minEloRequired && club.minEloRequired > 0) ? { color: '#B45309' } : { color: '#059669' }
                ]}>
                  {(club.minEloRequired && club.minEloRequired > 0) ? `≥ ${club.minEloRequired} Elo` : 'Mọi trình độ (Tự do)'}
                </Text>
              </View>

              <View style={[
                styles.privacyModePill,
                club.isPrivate ? styles.privacyModePillPrivate : styles.privacyModePillPublic
              ]}>
                <Ionicons 
                  name={club.isPrivate ? "lock-closed" : "globe-outline"} 
                  size={12} 
                  color={club.isPrivate ? "#DC2626" : "#059669"} 
                />
                <Text style={[
                  styles.privacyModePillText,
                  club.isPrivate ? { color: '#DC2626' } : { color: '#059669' }
                ]}>
                  {club.isPrivate ? 'Xét duyệt đơn' : 'Tự do gia nhập'}
                </Text>
              </View>
            </View>

            <View style={styles.requirementExplanationRow}>
              <Ionicons name="information-circle-outline" size={15} color="#64748B" style={{ marginTop: 1.5 }} />
              <Text style={styles.requirementExplanation}>
                {(club.minEloRequired && club.minEloRequired > 0)
                  ? `Yêu cầu thành viên phải có điểm Elo đã xác minh (hoàn thành tối thiểu 5 trận đấu xếp hạng) và đạt từ ${club.minEloRequired} Elo trở lên.`
                  : `Câu lạc bộ mở cửa chào đón tất cả các vận động viên và người chơi yêu thích môn ${club.sport || 'thể thao'} tham gia giao lưu, rèn luyện.`}
              </Text>
            </View>
          </View>
        </View>

        {/* 6. Club Description & About Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="information-circle" size={18} color={COLORS.primary} />
            <Text style={styles.sectionHeaderTitle}>Giới thiệu & Hoạt động</Text>
          </View>

          <Text style={styles.descriptionContent}>
            {club.description || 'Câu lạc bộ thể thao sinh hoạt thường xuyên, giao lưu gắn kết tinh thần thể thao và nâng cao trình độ thi đấu.'}
          </Text>

          <View style={styles.divider} />

          {/* Activity Info Row */}
          <View style={styles.infoMetaGrid}>
            <View style={styles.infoMetaItem}>
              <Ionicons name="location-outline" size={16} color={COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoMetaLabel}>Khu vực</Text>
                <Text style={styles.infoMetaVal}>{club.area || 'Toàn quốc'}</Text>
              </View>
            </View>

            <View style={styles.infoMetaItem}>
              <Ionicons name="time-outline" size={16} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoMetaLabel}>Lịch sinh hoạt</Text>
                <Text style={styles.infoMetaVal}>{club.activityLevel || 'Hàng tuần'}</Text>
              </View>
            </View>
          </View>

          {/* Founder row */}
          <View style={styles.founderRow}>
            <View style={styles.founderAvatarWrap}>
              <MaterialIcons name="person" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.founderName}>{club.creatorName || 'Chủ nhiệm CLB'}</Text>
              <Text style={styles.founderRole}>Người sáng lập câu lạc bộ</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 7. Sticky Bottom Action Footer */}
      <SafeAreaView style={styles.footerSafeArea} edges={['bottom']}>
        <View style={styles.footerContainer}>
          {isAlreadyMember ? (
            <TouchableOpacity
              style={styles.joinedActionBtn}
              activeOpacity={0.85}
              onPress={() => router.replace(`/club-detail-joined/${club.id}`)}
            >
              <Ionicons name="enter-outline" size={19} color="#FFFFFF" />
              <Text style={styles.joinedActionBtnText}>Vào trang sinh hoạt CLB</Text>
            </TouchableOpacity>
          ) : isPendingMember ? (
            <TouchableOpacity
              style={styles.pendingActionBtn}
              activeOpacity={1}
              disabled={true}
            >
              <Ionicons name="hourglass-outline" size={18} color="#92400E" />
              <Text style={styles.pendingActionBtnText}>Đã gửi yêu cầu (Đang chờ duyệt)</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.joinActionBtn, joining && styles.joinActionBtnDisabled]}
              activeOpacity={0.85}
              disabled={joining}
              onPress={handleJoinPress}
            >
              {joining ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons 
                    name={club.isPrivate ? "mail-outline" : "person-add"} 
                    size={18} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.joinActionBtnText}>
                    {club.isPrivate ? 'Gửi yêu cầu tham gia' : 'Tham gia câu lạc bộ'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* Floating Info Modal */}
      <ClubInfoModal
        visible={isInfoModalVisible}
        onClose={() => setIsInfoModalVisible(false)}
        club={club}
        showLeaveButton={false}
      />

      {/* Members Modal (Public Club Only) */}
      {!club.isPrivate && (
        <MembersModal
          visible={isMembersModalVisible}
          onClose={() => setIsMembersModalVisible(false)}
          membersCount={club.members || members.length}
          members={members}
          onLeavePress={() => {}}
          currentUserRole="Khách"
          onRefreshMembers={() => loadMembers(Number(club.id))}
        />
      )}

      {/* Match History Modal (Public Club Only) */}
      {!club.isPrivate && (
        <MatchHistoryModal
          visible={isHistoryModalVisible}
          onClose={() => setIsHistoryModalVisible(false)}
          club={club}
          matches={matches}
          onRefreshMatches={() => loadMatches(Number(club.id))}
        />
      )}

      {/* Result Alert Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIsModalVisible(false);
          if (isJoinSuccess && !club.isPrivate) {
            router.replace(`/club-detail-joined/${club.id}`);
          }
        }}
      >
        <View style={styles.alertModalOverlay}>
          <View style={styles.alertModalBox}>
            <MaterialIcons
              name={modalIcon === 'shield' ? 'security' : (modalIcon === 'check-circle' ? 'check-circle' : 'info')}
              size={48}
              color={
                modalIcon === 'check-circle'
                  ? '#059669'
                  : modalIcon === 'shield'
                  ? '#D97706'
                  : '#EF4444'
              }
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.alertModalTitleText}>{modalTitle}</Text>
            <Text style={styles.alertModalMessageText}>{modalMessage}</Text>
            <Button
              variant="primary"
              title={isJoinSuccess ? 'Hoàn tất' : 'Đã hiểu'}
              style={{ width: '100%', height: 44, marginTop: 8 }}
              onPress={() => {
                setIsModalVisible(false);
                if (isJoinSuccess && !club.isPrivate) {
                  router.replace(`/club-detail-joined/${club.id}`);
                }
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Auth Modal */}
      <Modal
        visible={isAuthModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAuthModalVisible(false)}
      >
        <View style={styles.alertModalOverlay}>
          <View style={styles.alertModalBox}>
            <View style={styles.lockIconCircle}>
              <Ionicons name="lock-closed" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.alertModalTitleText}>Yêu cầu đăng nhập</Text>
            <Text style={styles.alertModalMessageText}>
              Bạn cần đăng nhập tài khoản để tham gia câu lạc bộ này.
            </Text>
            <View style={styles.authModalActions}>
              <Button
                title="Hủy"
                variant="outline"
                style={{ flex: 1, height: 44 }}
                onPress={() => setIsAuthModalVisible(false)}
              />
              <Button
                title="Đăng nhập"
                variant="primary"
                style={{ flex: 1.2, height: 44 }}
                onPress={() => {
                  setIsAuthModalVisible(false);
                  router.push('/(auth)/login');
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    borderBottomColor: '#E2E8F0',
  },
  headerBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIconBtn: {
    backgroundColor: '#EFF6FF',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 12,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '800',
  },

  /* Metrics Grid */
  metricsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  metricCardCrp: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  metricCardElo: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  metricFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  metricSubText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },

  /* Sub-Navigation Cards */
  subCardsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  subCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  subCardLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.9,
  },
  subCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subCardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  subCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  subCardDesc: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  lockedSubCardNote: {
    fontSize: 10.5,
    color: '#94A3B8',
    lineHeight: 14,
    marginTop: 2,
  },
  avatarStackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stackAvatarWrapper: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 12,
  },
  stackMoreCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  stackMoreText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
  },
  matchStatsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  matchStatBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },

  /* Section Cards */
  sectionCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  requirementBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  reqBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eloBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eloBadgePillRequired: {
    backgroundColor: '#FEF3C7',
  },
  eloBadgePillFree: {
    backgroundColor: '#ECFDF5',
  },
  eloBadgePillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  privacyModePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  privacyModePillPrivate: {
    backgroundColor: '#FEE2E2',
  },
  privacyModePillPublic: {
    backgroundColor: '#ECFDF5',
  },
  privacyModePillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  requirementExplanationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  requirementExplanation: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  descriptionContent: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  infoMetaGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  infoMetaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoMetaLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  infoMetaVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  founderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  founderAvatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  founderName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  founderRole: {
    fontSize: 11,
    color: '#64748B',
  },

  /* Sticky Footer */
  footerSafeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  joinActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  joinActionBtnDisabled: {
    opacity: 0.65,
  },
  joinActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  joinedActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    height: 48,
    borderRadius: 12,
  },
  joinedActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  pendingActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingActionBtnText: {
    color: '#92400E',
    fontSize: 13.5,
    fontWeight: '800',
  },

  /* Alert / Auth Modal Overlays */
  alertModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertModalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  lockIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertModalTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  alertModalMessageText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  authModalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
});

export default ClubDetailExploreScreen;
