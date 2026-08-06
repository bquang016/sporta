import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import {
  matchmakingApi,
  MatchRoom,
  MatchApplication,
} from '../../../shared/api/matchmaking';
import { getSuggestedVenuesApi, VenueSuggestion } from '../../../shared/api/bookings';
import { usersApi } from '../../../shared/api/users';
import { getJoinedClubsApi } from '../../../shared/api/clubs';
import { Button, Card, AlertModal } from '../../../shared/ui';
import { ConfirmModal } from '../../../shared/ui/Modal/ConfirmModal';

export function MatchRoomDetailScreen({ route, navigation }: any) {
  const roomId = route?.params?.roomId ? Number(route.params.roomId) : 1;

  const [room, setRoom] = useState<MatchRoom | null>(null);
  const [applications, setApplications] = useState<MatchApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Logged-In User Profile & Joined Clubs
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [myUserClubs, setMyUserClubs] = useState<any[]>([]);
  const [myClubId, setMyClubId] = useState<number | null>(null);

  // Venue Selection Modal
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [suggestedVenues, setSuggestedVenues] = useState<VenueSuggestion[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<VenueSuggestion | null>(null);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [poll, setPoll] = useState<any | null>(null);

  // Cancel Confirmation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Edit Room Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [editMinElo, setEditMinElo] = useState('1200');
  const [editMaxElo, setEditMaxElo] = useState('1800');
  const [editAllowDifferentLevel, setEditAllowDifferentLevel] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const handleOpenEditModal = () => {
    if (!room) return;
    setEditMessage(room.message || '');
    setEditMinElo(String(room.minElo || 1200));
    setEditMaxElo(String(room.maxElo || 1800));
    setEditAllowDifferentLevel(!!room.allowDifferentLevel);
    setShowEditModal(true);
  };

  const handleSaveEditRoom = async () => {
    const activeUserId = myUserId || room?.creatorUserId || 1;
    try {
      setEditSaving(true);
      await matchmakingApi.updateMatchRoom(roomId, {
        message: editMessage,
        minElo: parseInt(editMinElo, 10) || 1200,
        maxElo: parseInt(editMaxElo, 10) || 1800,
        allowDifferentLevel: editAllowDifferentLevel,
      }, activeUserId);

      setShowEditModal(false);
      loadDetail();
      setAlertModalConfig({
        visible: true,
        title: 'Cập nhật thành công 🎉',
        message: 'Thông tin phòng ghép trận đã được cập nhật!',
        buttonText: 'Đã hiểu',
        onConfirm: () => setAlertModalConfig(prev => ({ ...prev, visible: false })),
      });
    } catch (err: any) {
      setAlertModalConfig({
        visible: true,
        title: 'Lỗi cập nhật ❌',
        message: err?.message || 'Không thể cập nhật phòng',
        buttonText: 'Đóng',
        onConfirm: () => setAlertModalConfig(prev => ({ ...prev, visible: false })),
      });
    } finally {
      setEditSaving(false);
    }
  };

  // Alert Modal State
  const [alertModalConfig, setAlertModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttonText?: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleVotePoll = async (isAttending: boolean) => {
    if (!myClubId) return;
    const activeUserId = myUserId || 1;
    try {
      const updatedPoll = await matchmakingApi.voteInternalPoll(roomId, myClubId, activeUserId, isAttending);
      setPoll(updatedPoll);
      setAlertModalConfig({
        visible: true,
        title: 'Đã biểu quyết 🗳️',
        message: isAttending ? 'Đã ghi nhận bạn THAM GIA kèo này!' : 'Đã ghi nhận bạn KHÔNG THAM GIA.',
        buttonText: 'Đã hiểu',
        onConfirm: () => setAlertModalConfig(prev => ({ ...prev, visible: false })),
      });
    } catch (err: any) {
      console.log('Error voting poll:', err);
    }
  };

  const loadDetail = async () => {
    try {
      setLoading(true);
      // 1. Fetch current logged-in user profile
      try {
        const profile = await usersApi.getProfile();
        if (profile?.id) setMyUserId(profile.id);
      } catch (e) {
        console.log('Profile fetch notice:', e);
      }

      // 2. Fetch match room detail
      const data = await matchmakingApi.getMatchRoomById(roomId);
      setRoom(data);

      // 3. Fetch applications for this room
      const apps = await matchmakingApi.getApplicationsForRoom(roomId);
      setApplications(apps);

      // 4. Fetch joined clubs for Side B selection & creator verification
      try {
        const joinedClubs = await getJoinedClubsApi();
        if (joinedClubs && Array.isArray(joinedClubs)) {
          setMyUserClubs(joinedClubs);
          const otherClub = joinedClubs.find((c: any) => Number(c.id) !== Number(data.creatorClubId));
          if (otherClub) setMyClubId(otherClub.id);
          else setMyClubId(null);
        } else {
          setMyUserClubs([]);
          setMyClubId(null);
        }
      } catch (e) {
        console.log('Clubs fetch notice:', e);
        setMyUserClubs([]);
        setMyClubId(null);
      }
    } catch (err) {
      console.log('Error loading room detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [roomId]);

  // ── Open Suggested Venues (Chỉ dành cho Chủ phòng Đội A) ─────────────────
  const handleOpenVenueSuggestions = async () => {
    if (!room) return;
    const isCreatorByUserId = myUserId !== null && Number(room.creatorUserId) === Number(myUserId);
    const isCreatorByClub = myUserClubs.some((c: any) => Number(c.id) === Number(room.creatorClubId));
    const isCreator = isCreatorByUserId || isCreatorByClub || (myUserId === null && (room.creatorUserId === 1 || myUserClubs.length === 0));

    if (!isCreator) {
      setAlertModalConfig({
        visible: true,
        title: 'Không có quyền ⚠️',
        message: 'Chỉ có Chủ phòng (Đội A) mới có quyền chọn Sân thi đấu từ danh sách gợi ý!',
        buttonText: 'Đã hiểu',
        onConfirm: () => setAlertModalConfig(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    try {
      setLoadingVenues(true);
      setShowVenueModal(true);
      const venues = await getSuggestedVenuesApi(room.sportId, room.latitude, room.longitude);
      if (venues && venues.length > 0) {
        setSuggestedVenues(venues);
      } else {
        setSuggestedVenues([
          { id: 'v1', name: 'Sân Bóng Chùa Hà - Sân 7A', address: 'Quận Cầu Giấy, Hà Nội', latitude: 21.0368, longitude: 105.7905, hourlyPrice: 500000, rating: 4.9 },
          { id: 'v2', name: 'Sân Bóng Đại Học Quốc Gia', address: '144 Xuân Thủy, Cầu Giấy, Hà Nội', latitude: 21.0375, longitude: 105.7830, hourlyPrice: 400000, rating: 4.7 },
          { id: 'v3', name: 'Trung Tâm Thể Thao Tuổi Trẻ', address: 'Hoàng Quốc Việt, Cầu Giấy', latitude: 21.0450, longitude: 105.7950, hourlyPrice: 450000, rating: 4.8 },
        ]);
      }
    } catch (err) {
      console.log('Error fetching venue suggestions:', err);
    } finally {
      setLoadingVenues(false);
    }
  };

  // ── Confirm Venue Choice (Chủ phòng Đội A) ────────────────────────────────
  const handleConfirmVenueSelection = async (venue: VenueSuggestion) => {
    setSelectedVenue(venue);
    setShowVenueModal(false);
    const activeUserId = myUserId || room?.creatorUserId || 1;
    
    try {
      await matchmakingApi.selectVenue(roomId, {
        courtId: venue.id ? String(venue.id) : undefined,
        courtName: venue.name,
        venueName: venue.address,
        hourlyPrice: venue.hourlyPrice,
      }, activeUserId);

      setAlertModalConfig({
        visible: true,
        title: 'Đã chốt sân thành công 🎉',
        message: `Chủ phòng đã chọn ${venue.name}.\nBảng tính giá tiền cưa đôi 50/50 đã được cập nhật tự động!`,
        buttonText: 'Xem chi tiết',
        onConfirm: () => {
          setAlertModalConfig(prev => ({ ...prev, visible: false }));
          loadDetail();
        },
      });
    } catch (err: any) {
      const errMsg = err?.message || 'Không thể chốt sân thi đấu';
      setAlertModalConfig({
        visible: true,
        title: 'Lỗi chọn sân ❌',
        message: errMsg,
        buttonText: 'Đóng',
        onConfirm: () => setAlertModalConfig(prev => ({ ...prev, visible: false })),
      });
    }
  };

  // ── Team B Apply to Match ─────────────────────────────────────────────────
  const handleApplyToMatch = async () => {
    if (isCreatorA) {
      setAlertModalConfig({
        visible: true,
        title: 'Thao tác không hợp lệ ⚠️',
        message: 'Bạn là Chủ phòng (Đội A) của trận đấu này nên không thể gửi yêu cầu ghép trận.',
        buttonText: 'Đã hiểu',
        onConfirm: () => setAlertModalConfig(prev => ({ ...prev, visible: false })),
      });
      return;
    }
    if (!myClubId) {
      setAlertModalConfig({
        visible: true,
        title: 'Chưa có Câu lạc bộ hợp lệ ⚠️',
        message: 'Bạn cần gia nhập hoặc tạo một Câu lạc bộ (khác với Đội A) để gửi yêu cầu ghép trận.',
        buttonText: 'Đã hiểu',
        onConfirm: () => setAlertModalConfig(prev => ({ ...prev, visible: false })),
      });
      return;
    }
    const activeUserId = myUserId || 2;
    try {
      await matchmakingApi.applyToMatchRoom(roomId, myClubId, activeUserId);
      setAlertModalConfig({
        visible: true,
        title: 'Đã gửi yêu cầu 🤝',
        message: 'Yêu cầu ghép trận đã được gửi tới Chủ phòng (Đội A). Vui lòng chờ Chủ phòng duyệt!',
        buttonText: 'Đã hiểu',
        onConfirm: () => {
          setAlertModalConfig(prev => ({ ...prev, visible: false }));
          loadDetail();
        },
      });
    } catch (err: any) {
      const errMsg = err?.message || 'Không thể gửi đơn xin ghép trận';
      setAlertModalConfig({
        visible: true,
        title: 'Lỗi gửi yêu cầu ❌',
        message: errMsg,
        buttonText: 'Thử lại',
        onConfirm: () => setAlertModalConfig(prev => ({ ...prev, visible: false })),
      });
    }
  };

  // ── Creator Accepts Applicant (Ghép Đội) ──────────────────────────────────
  const handleAcceptApplicant = async (app: MatchApplication) => {
    const activeUserId = myUserId || room?.creatorUserId || 1;
    try {
      await matchmakingApi.acceptApplication(roomId, app.id, activeUserId);
      setAlertModalConfig({
        visible: true,
        title: 'Đã chấp nhận ghép đội 🤝',
        message: `Hai bên (${room?.creatorClubName} vs ${app.applicantClubName}) đã đồng ý ghép trận!\n\n📍 Sân thi đấu: ${room?.courtName || room?.venueName || room?.area || 'Sân đã chọn'}.\nTiếp theo: Hai bên hoàn tất thanh toán nốt chi phí cưa đôi 50/50 để chốt đơn đặt sân chính thức!`,
        buttonText: 'Đã hiểu',
        onConfirm: () => {
          setAlertModalConfig(prev => ({ ...prev, visible: false }));
          loadDetail();
        },
      });
    } catch (err: any) {
      const errMsg = err?.message || 'Không thể chấp nhận yêu cầu';
      setAlertModalConfig({
        visible: true,
        title: 'Thao tác thất bại ❌',
        message: errMsg,
        buttonText: 'Đóng',
        onConfirm: () => setAlertModalConfig(prev => ({ ...prev, visible: false })),
      });
    }
  };

  // ── Cancel Room (Hủy phòng - Mất cọc) ────────────────────────────────────
  const handleConfirmCancelRoom = async () => {
    setShowCancelModal(false);
    const activeUserId = myUserId || room?.creatorUserId || 1;
    try {
      await matchmakingApi.cancelMatchRoom(roomId, activeUserId);
      setAlertModalConfig({
        visible: true,
        title: 'Đã hủy phòng ghép trận ❌',
        message: 'Phòng ghép trận đã bị hủy. Tiền cọc giữ chỗ (50.000đ) đã bị cấn trừ theo quy định.',
        buttonText: 'Quay lại danh sách',
        onConfirm: () => {
          setAlertModalConfig(prev => ({ ...prev, visible: false }));
          navigation?.goBack?.();
        },
      });
    } catch (err: any) {
      const errMsg = err?.message || 'Không thể hủy phòng';
      setAlertModalConfig({
        visible: true,
        title: 'Lỗi hủy phòng ❌',
        message: errMsg,
        buttonText: 'Đóng',
        onConfirm: () => setAlertModalConfig(prev => ({ ...prev, visible: false })),
      });
    }
  };

  if (loading || !room) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết phòng...</Text>
      </View>
    );
  }

  // ── Dynamic Role & Status Checks ──────────────────────────────────────────
  const isCreatorByUserId = myUserId !== null && Number(room.creatorUserId) === Number(myUserId);
  const isCreatorByClub = myUserClubs.some((c: any) => Number(c.id) === Number(room.creatorClubId));
  const isCreatorA = isCreatorByUserId || isCreatorByClub || (myUserId === null && (room.creatorUserId === 1 || myUserClubs.length === 0));

  const isCancelled = room.status === 'CANCELLED';
  const isExpired = room.status === 'EXPIRED';
  const isMatched = !isCancelled && !isExpired && room.matchedClubId != null && (
    room.status === 'MATCHED' || room.status === 'CONFIRMED' || room.status === 'PENDING_PAYMENT' || room.status === 'COMPLETED'
  );

  // Venue is chosen ONLY IF room is matched AND status is CONFIRMED/COMPLETED or explicitly selected
  const isVenueChosen = !isCancelled && !isExpired && isMatched && (
    room.status === 'CONFIRMED' || room.status === 'COMPLETED' || selectedVenue !== null
  );

  const totalVenuePrice = selectedVenue
    ? selectedVenue.hourlyPrice
    : room.priceSharePerTeam
    ? room.priceSharePerTeam * 2
    : 0;

  const priceShare = totalVenuePrice ? totalVenuePrice / 2 : 0;
  const depositAmount = room.depositAmount ?? 50000;
  const remainingTeamA = priceShare > depositAmount ? priceShare - depositAmount : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>

        {/* ── Header ────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.backBtn}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi Tiết Phòng Ghép Trận</Text>

          {/* Cancel & Edit Room Option for Creator if room is active */}
          {isCreatorA && !isCancelled && !isExpired ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity
                onPress={handleOpenEditModal}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="edit" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowCancelModal(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.cancelHeaderBtnText}>Hủy phòng</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* ── Status Banner ──────────────────────────────────────── */}
          <View style={[
            styles.statusBanner,
            isCancelled || isExpired
              ? styles.statusBannerCancelled
              : isVenueChosen
              ? styles.statusBannerConfirmed
              : isMatched
              ? styles.statusBannerMatched
              : styles.statusBannerOpen
          ]}>
            <MaterialIcons
              name={isCancelled || isExpired ? 'cancel' : isVenueChosen ? 'check-circle' : isMatched ? 'handshake' : 'groups'}
              size={20}
              color={isCancelled || isExpired ? COLORS.error : isVenueChosen ? COLORS.primary : isMatched ? COLORS.primary : COLORS.amber}
            />
            <Text style={[
              styles.statusBannerText,
              isCancelled || isExpired
                ? styles.statusBannerTextCancelled
                : isVenueChosen
                ? styles.statusBannerTextConfirmed
                : isMatched
                ? styles.statusBannerTextMatched
                : styles.statusBannerTextOpen
            ]}>
              {isCancelled
                ? 'Đã Hủy Phòng (Đã tịch thu tiền cọc) ❌'
                : isExpired
                ? 'Đã Hết Hạn ⚠️'
                : isVenueChosen
                ? 'Đã Chốt Sân & Giờ Thi Đấu ✅'
                : isMatched
                ? 'Đã Ghép Đội 🤝 — Chờ Hoàn Tất Thanh Toán Nốt (15 Phút)'
                : 'Đang Mở — Chờ Đội B Gửi Yêu Cầu Ghép'}
            </Text>
          </View>

          {/* ── VS Card (Matchup Display) ─────────────────────────── */}
          <Card style={styles.vsCard} padding="md">
            <Text style={styles.cardHeaderLabel}>TRẬN ĐẤU THỂ THAO</Text>
            
            <View style={styles.vsRow}>
              {/* Team A */}
              <View style={styles.teamColumn}>
                <View style={styles.teamAvatar}>
                  <Text style={styles.avatarText}>{room.creatorClubName?.charAt(0)}</Text>
                </View>
                <Text style={styles.teamName} numberOfLines={1}>{room.creatorClubName}</Text>
                <View style={styles.crpBadge}>
                  <MaterialIcons name="emoji-events" size={13} color={COLORS.secondary} />
                  <Text style={styles.crpText}>{room.creatorClubCrp ?? 120} CRP</Text>
                </View>
                <Text style={styles.roleTag}>ĐỘI A (CHỦ PHÒNG)</Text>
              </View>

              {/* VS Badge */}
              <View style={styles.vsBadgeCircle}>
                <Text style={styles.vsBadgeText}>VS</Text>
              </View>

              {/* Team B */}
              <View style={styles.teamColumn}>
                {isMatched ? (
                  <>
                    <View style={[styles.teamAvatar, { backgroundColor: COLORS.secondary }]}>
                      <Text style={[styles.avatarText, { color: COLORS.onSecondary }]}>
                        {room.matchedClubName ? room.matchedClubName.charAt(0) : 'B'}
                      </Text>
                    </View>
                    <Text style={styles.teamName} numberOfLines={1}>
                      {room.matchedClubName ?? 'Đội B'}
                    </Text>
                    <View style={styles.crpBadge}>
                      <MaterialIcons name="emoji-events" size={13} color={COLORS.secondary} />
                      <Text style={styles.crpText}>{room.matchedClubCrp ?? 100} CRP</Text>
                    </View>
                    <Text style={styles.roleTag}>ĐỘI B (ĐỐI THỦ)</Text>
                  </>
                ) : (
                  <>
                    <View style={[styles.teamAvatar, styles.emptyAvatar]}>
                      <MaterialIcons name="person-add" size={24} color={COLORS.outline} />
                    </View>
                    <Text style={[styles.teamName, { color: COLORS.outline }]} numberOfLines={1}>
                      Chờ Đội B
                    </Text>
                    <Text style={styles.emptySubText}>
                      {isCancelled ? 'Đã hủy' : 'Đang mở đăng ký'}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </Card>

          {/* ── General Match Parameters Card ──────────────────────── */}
          <Card style={styles.infoCard} padding="md">
            <Text style={styles.cardHeaderLabel}>THÔNG TIN THI ĐẤU</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <MaterialIcons name="sports" size={18} color={COLORS.primary} />
                <View>
                  <Text style={styles.infoItemLabel}>Môn & Thể thức</Text>
                  <Text style={styles.infoItemValue}>{room.sportName} ({room.format})</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons name="schedule" size={18} color={COLORS.primary} />
                <View>
                  <Text style={styles.infoItemLabel}>Thời gian dự kiến</Text>
                  <Text style={styles.infoItemValue}>
                    {new Date(room.expectedStartTime).toLocaleString('vi-VN')}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons name="location-on" size={18} color={COLORS.primary} />
                <View>
                  <Text style={styles.infoItemLabel}>Khu vực tìm sân</Text>
                  <Text style={styles.infoItemValue}>{room.area || 'Khu vực Cầu Giấy, Hà Nội'}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons name="grade" size={18} color={COLORS.primary} />
                <View>
                  <Text style={styles.infoItemLabel}>Yêu cầu Elo</Text>
                  <Text style={styles.infoItemValue}>
                    {room.minElo ?? 1000} – {room.maxElo ?? 2000} Elo
                  </Text>
                </View>
              </View>
            </View>

            {room.message ? (
              <View style={styles.messageBox}>
                <Text style={styles.messageTitle}>💬 Lời nhắn từ Đội A:</Text>
                <Text style={styles.messageContent}>"{room.message}"</Text>
              </View>
            ) : null}
          </Card>

          {/* ── STEP 1: BEFORE MATCHING (Unmatched State) ──────────── */}
          {!isMatched && !isCancelled && !isExpired && (
            <Card style={styles.stepCard} padding="md">
              <View style={styles.stepHeaderRow}>
                <MaterialIcons name="info" size={20} color={COLORS.primary} />
                <Text style={styles.stepTitle}>CHƯA CHỌN SÂN & CHI PHÍ</Text>
              </View>
              <Text style={styles.stepDesc}>
                Vị trí sân cụ thể và chi phí cưa đôi 5/5 sẽ được hiển thị ngay sau khi 2 bên chấp nhận ghép trận và Chủ phòng chốt Sân từ gợi ý hệ thống.
              </Text>

              {/* Poll Voting Box for Team B Members */}
              {!isCreatorA && myClubId && (
                <View style={{ backgroundColor: COLORS.surfaceContainerLow, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md, marginVertical: SPACING.xs, gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ ...TYPOGRAPHY.labelMd, color: COLORS.onSurface, fontWeight: '700' }}>🗳️ KHOẢO SÁT VOTE NỘI BỘ CLB B</Text>
                    <Text style={{ ...TYPOGRAPHY.labelSm, color: poll?.isUnlocked ? COLORS.primary : COLORS.amber, fontWeight: '800' }}>
                      {poll ? `${poll.currentYesVotes}/${poll.requiredVotes} người` : '3/5 người'}
                    </Text>
                  </View>
                  <Text style={{ ...TYPOGRAPHY.bodySm, color: COLORS.outline }}>
                    {poll?.isUnlocked 
                      ? '✅ Đã đủ số lượng tối thiểu! Thành viên có thể đại diện gửi yêu cầu.' 
                      : 'Cần tối thiểu 5 thành viên vote "Có mặt" để mở nút Xin tham gia cho thành viên bình thường (Chủ nhiệm CLB có thể gửi trực tiếp).'}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: SPACING.xs, marginTop: 4 }}>
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: COLORS.primary, paddingVertical: 8, borderRadius: BORDER_RADIUS.sm, alignItems: 'center' }}
                      onPress={() => handleVotePoll(true)}
                    >
                      <Text style={{ ...TYPOGRAPHY.labelSm, color: COLORS.onPrimary, fontWeight: '700' }}>👍 Tham gia (+1 Vote)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ flex: 1, backgroundColor: COLORS.surfaceContainerHigh, paddingVertical: 8, borderRadius: BORDER_RADIUS.sm, alignItems: 'center' }}
                      onPress={() => handleVotePoll(false)}
                    >
                      <Text style={{ ...TYPOGRAPHY.labelSm, color: COLORS.onSurfaceVariant, fontWeight: '700' }}>👎 Không tham gia</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Action Button for Team B Visitor */}
              {!isCreatorA && (
                <Button
                  variant="primary"
                  size="lg"
                  title="🤝 GỬI YÊU CẦU GHÉP TRẬN (ĐỘI B)"
                  icon="handshake"
                  onPress={handleApplyToMatch}
                  style={styles.actionCTA}
                />
              )}

              {/* Action Button for Creator: Cancel Room */}
              {isCreatorA && (
                <Button
                  variant="outline"
                  size="md"
                  title="HỦY PHÒNG GHÉP TRẬN (MẤT CỌC)"
                  icon="cancel"
                  onPress={() => setShowCancelModal(true)}
                  style={{ marginTop: SPACING.xs }}
                />
              )}
            </Card>
          )}

          {/* ── STEP 2: MATCHED & PENDING PAYMENT (Cửa sổ 15 phút thanh toán nốt) ── */}
          {isMatched && (room.status === 'PENDING_PAYMENT' || (!isVenueChosen && !isCancelled && !isExpired)) && (
            <Card style={styles.matchedWaitingCard} padding="md">
              <View style={styles.stepHeaderRow}>
                <MaterialIcons name="hourglass-top" size={22} color={COLORS.amber} />
                <Text style={styles.matchedTitle}>CỬA SỔ THANH TOÁN NỐT (15 PHÚT)</Text>
              </View>

              <View style={styles.bannerInfo}>
                <MaterialIcons name="timer" size={18} color={COLORS.amber} />
                <Text style={styles.bannerInfoText}>
                  Hai bên đã chốt kèo! Còn <Text style={{ fontWeight: '800' }}>15:00 phút</Text> để hoàn tất thanh toán phần tiền còn lại.
                </Text>
              </View>

              <View style={{ marginVertical: SPACING.xs, gap: 4 }}>
                <Text style={styles.splitLabel}>📍 Sân thi đấu: <Text style={{ fontWeight: '800', color: COLORS.onSurface }}>{room.courtName || room.venueName || 'Sân bóng Chùa Hà'}</Text></Text>
                <Text style={styles.splitLabel}>💰 Đội A (đã cọc {depositAmount.toLocaleString()}đ): <Text style={{ fontWeight: '800', color: COLORS.primary }}>Trả nốt {remainingTeamA.toLocaleString()} đ</Text></Text>
                <Text style={styles.splitLabel}>💰 Đội B (đối thủ): <Text style={{ fontWeight: '800', color: COLORS.primary }}>Thanh toán 50% ({priceShare.toLocaleString()} đ)</Text></Text>
              </View>

              <Button
                variant="primary"
                size="lg"
                title="💳 THANH TOÁN NỐT TIỀN SÂN (MOCK AUTO-SUCCESS)"
                icon="check-circle"
                onPress={async () => {
                  const activeUserId = myUserId || room?.creatorUserId || 1;
                  try {
                    await matchmakingApi.selectVenue(roomId, {
                      courtId: room.courtId ? String(room.courtId) : undefined,
                      courtName: room.courtName || 'Sân 1',
                      venueName: room.venueName || room.area || 'Sân bóng',
                      hourlyPrice: (room.priceSharePerTeam || 150000) * 2,
                    }, activeUserId);

                    setAlertModalConfig({
                      visible: true,
                      title: 'Thanh toán nốt thành công 🎉',
                      message: 'Đã hoàn tất thanh toán 100% tiền sân (Auto-success).\nTrận đấu đã chính thức được CHỐT KÈO và Sân đã đổi thành BOOKED!',
                      buttonText: 'Đã hiểu',
                      onConfirm: () => {
                        setAlertModalConfig(prev => ({ ...prev, visible: false }));
                        loadDetail();
                      },
                    });
                  } catch (err: any) {
                    setAlertModalConfig({
                      visible: true,
                      title: 'Lỗi thanh toán ❌',
                      message: err?.message || 'Không thể thanh toán nốt tiền sân.',
                      buttonText: 'Đóng',
                      onConfirm: () => setAlertModalConfig(prev => ({ ...prev, visible: false })),
                    });
                  }
                }}
                style={styles.actionCTA}
              />
            </Card>
          )}

          {/* ── STEP 3: VENUE CHOSEN & CONFIRMED ── */}
          {isVenueChosen && room.status === 'CONFIRMED' && !isCancelled && !isExpired && (
            <Card style={styles.confirmedVenueCard} padding="md">
              <View style={styles.stepHeaderRow}>
                <MaterialIcons name="check-circle" size={22} color={COLORS.primary} />
                <Text style={styles.confirmedTitle}>TRẬN ĐẤU ĐÃ CHÍNH THỨC CHỐT KÈO ✅</Text>
              </View>

              {/* Venue Info */}
              <View style={styles.chosenVenueBox}>
                <Text style={styles.chosenVenueName}>
                  {selectedVenue ? selectedVenue.name : room.courtName || 'Sân Bóng Chùa Hà - Sân 7A'}
                </Text>
                <Text style={styles.chosenVenueAddress}>
                  📍 {selectedVenue ? selectedVenue.address : room.venueName || 'Quận Cầu Giấy, Hà Nội'}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* Price Breakdown */}
              <Text style={styles.splitHeaderLabel}>CHI TIẾT THANH TOÁN CƯA ĐÔI 5/5 (ĐÃ HOÀN TẤT)</Text>
              <View style={styles.splitPriceCard}>
                <View style={styles.splitRow}>
                  <Text style={styles.splitLabel}>Tổng tiền sân thực tế:</Text>
                  <Text style={styles.splitVal}>{totalVenuePrice.toLocaleString()} đ</Text>
                </View>

                <View style={styles.splitRow}>
                  <Text style={styles.splitLabel}>Đội B đã thanh toán (50%):</Text>
                  <Text style={[styles.splitVal, { color: COLORS.primary, fontWeight: '800' }]}>
                    {priceShare.toLocaleString()} đ
                  </Text>
                </View>

                {room.flowType === 'DEPOSIT_HOLD' ? (
                  <View style={styles.splitRow}>
                    <Text style={styles.splitLabel}>
                      Đội A (đã cọc 50k & trả nốt 100k):
                    </Text>
                    <Text style={[styles.splitVal, { color: COLORS.secondary, fontWeight: '800' }]}>
                      Đã hoàn tất ({priceShare.toLocaleString()} đ)
                    </Text>
                  </View>
                ) : (
                  <View style={styles.splitRow}>
                    <Text style={styles.splitLabel}>Đội A (đã thanh toán 100%):</Text>
                    <Text style={[styles.splitVal, { color: COLORS.primary, fontWeight: '800' }]}>
                      Nhận lại {priceShare.toLocaleString()} đ từ Đội B
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          )}

          {/* ── Creator SECTION: Incoming Applications List ───────── */}
          {isCreatorA && !isMatched && !isCancelled && !isExpired && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeaderTitle}>
                DANH SÁCH ĐỘI B XIN GHÉP TRẬN ({applications.length})
              </Text>
              
              {applications.length === 0 ? (
                <Card padding="md" style={styles.emptyAppCard}>
                  <MaterialIcons name="person-search" size={32} color={COLORS.outline} />
                  <Text style={styles.emptyAppText}>
                    Chưa có đội nào gửi yêu cầu xin ghép trận.
                  </Text>
                </Card>
              ) : (
                applications.map((app) => (
                  <Card key={app.id} padding="md" style={styles.appItemCard}>
                    <View style={styles.appItemTop}>
                      <View style={styles.appClubInfo}>
                        <View style={[styles.teamAvatar, { width: 36, height: 36, borderRadius: 18 }]}>
                          <Text style={{ color: COLORS.onPrimary, fontWeight: '800' }}>
                            {app.applicantClubName.charAt(0)}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.appClubName}>{app.applicantClubName}</Text>
                          <Text style={styles.appRepresentative}>Đại diện: {app.applicantUserName}</Text>
                        </View>
                      </View>
                      <View style={styles.crpBadge}>
                        <MaterialIcons name="emoji-events" size={13} color={COLORS.secondary} />
                        <Text style={styles.crpText}>{app.applicantClubCrp ?? 100} CRP</Text>
                      </View>
                    </View>

                    <Button
                      variant="primary"
                      size="sm"
                      title="🤝 CHẤP NHẬN GHÉP TRẬN VỚI ĐỘI NÀY"
                      onPress={() => handleAcceptApplicant(app)}
                      style={{ marginTop: SPACING.xs }}
                    />
                  </Card>
                ))
              )}
            </View>
          )}
        </ScrollView>

        {/* ── Cancel Confirmation Modal ───────────────────────────── */}
        <ConfirmModal
          visible={showCancelModal}
          title="Hủy phòng ghép trận ⚠️"
          message="Bạn có chắc chắn muốn hủy phòng ghép trận này?\n\nLưu ý: Tiền cọc giữ chỗ (50.000đ) sẽ bị tịch thu và không được hoàn lại theo quy định hệ thống."
          confirmText="Hủy phòng (Mất cọc)"
          cancelText="Quay lại"
          icon="warning"
          iconColor={COLORS.error}
          onConfirm={handleConfirmCancelRoom}
          onCancel={() => setShowCancelModal(false)}
        />

        {/* ── Shared AlertModal for Notifications ───────────────── */}
        <AlertModal
          visible={alertModalConfig.visible}
          title={alertModalConfig.title}
          message={alertModalConfig.message}
          buttonText={alertModalConfig.buttonText}
          onConfirm={alertModalConfig.onConfirm}
        />

        {/* ── Suggested Venues Modal (CHỈ MỞ BỞI CHỦ PHÒNG) ──────── */}
        <Modal visible={showVenueModal} animationType="slide" onRequestClose={() => setShowVenueModal(false)}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.venueModalContainer}>
              <View style={styles.venueModalHeader}>
                <TouchableOpacity onPress={() => setShowVenueModal(false)}>
                  <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
                </TouchableOpacity>
                <Text style={styles.venueModalTitle}>Gợi Ý Sân Thi Đấu (Chủ phòng Đội A chọn)</Text>
                <View style={{ width: 24 }} />
              </View>

              {loadingVenues ? (
                <View style={styles.centerLoading}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : (
                <ScrollView contentContainerStyle={styles.venueListContent} showsVerticalScrollIndicator={false}>
                  {suggestedVenues.map((v) => (
                    <TouchableOpacity
                      key={v.id}
                      style={styles.venueItemCard}
                      onPress={() => handleConfirmVenueSelection(v)}
                      activeOpacity={0.85}
                    >
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text style={styles.venueItemTitle}>{v.name}</Text>
                        <Text style={styles.venueItemAddress}>📍 {v.address}</Text>
                        <Text style={styles.venueItemRating}>⭐ {v.rating} (Đánh giá tốt)</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Text style={styles.venuePrice}>{v.hourlyPrice.toLocaleString()} đ/giờ</Text>
                        <Text style={styles.venueSplitPrice}>Cưa đôi: {(v.hourlyPrice / 2).toLocaleString()} đ/đội</Text>
                        <Button
                          variant="primary"
                          size="sm"
                          title="CHỌN SÂN NÀY"
                          onPress={() => handleConfirmVenueSelection(v)}
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </SafeAreaView>
        {/* ── Edit Room Modal ────────────────────────────────────────── */}
        <Modal
          visible={showEditModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.cancelModalCard, { width: '90%', maxWidth: 400 }]}>
              <Text style={styles.cancelModalTitle}>Chỉnh sửa thông tin phòng ✏️</Text>
              
              <ScrollView style={{ maxHeight: 350, marginVertical: 12 }}>
                <Text style={{ ...TYPOGRAPHY.labelSm, color: COLORS.onSurfaceVariant, marginBottom: 4 }}>
                  Lời nhắn / Thông điệp tìm đối thủ:
                </Text>
                <TextInput
                  style={{
                    backgroundColor: COLORS.surfaceContainerLow,
                    borderWidth: 1,
                    borderColor: COLORS.outlineVariant,
                    borderRadius: BORDER_RADIUS.md,
                    padding: 10,
                    marginBottom: 12,
                    color: COLORS.onSurface,
                  }}
                  value={editMessage}
                  onChangeText={setEditMessage}
                  multiline
                  numberOfLines={3}
                  placeholder="Nhập thông điệp tìm đối thủ..."
                />

                <Text style={{ ...TYPOGRAPHY.labelSm, color: COLORS.onSurfaceVariant, marginBottom: 4 }}>
                  Khoảng Elo mong muốn (Tối thiểu - Tối đa):
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                  <TextInput
                    style={{
                      flex: 1,
                      backgroundColor: COLORS.surfaceContainerLow,
                      borderWidth: 1,
                      borderColor: COLORS.outlineVariant,
                      borderRadius: BORDER_RADIUS.md,
                      padding: 10,
                      color: COLORS.onSurface,
                    }}
                    value={editMinElo}
                    onChangeText={setEditMinElo}
                    keyboardType="numeric"
                    placeholder="Elo Min (1200)"
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      backgroundColor: COLORS.surfaceContainerLow,
                      borderWidth: 1,
                      borderColor: COLORS.outlineVariant,
                      borderRadius: BORDER_RADIUS.md,
                      padding: 10,
                      color: COLORS.onSurface,
                    }}
                    value={editMaxElo}
                    onChangeText={setEditMaxElo}
                    keyboardType="numeric"
                    placeholder="Elo Max (1800)"
                  />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ ...TYPOGRAPHY.labelMd, color: COLORS.onSurface }}>
                    Chấp nhận lệch trình Elo:
                  </Text>
                  <Switch
                    value={editAllowDifferentLevel}
                    onValueChange={setEditAllowDifferentLevel}
                    trackColor={{ false: COLORS.outlineVariant, true: COLORS.primary }}
                  />
                </View>
              </ScrollView>

              <View style={styles.cancelModalActions}>
                <TouchableOpacity
                  style={styles.cancelModalBackBtn}
                  onPress={() => setShowEditModal(false)}
                  disabled={editSaving}
                >
                  <Text style={styles.cancelModalBackText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cancelModalConfirmBtn, { backgroundColor: COLORS.primary }]}
                  onPress={handleSaveEditRoom}
                  disabled={editSaving}
                >
                  {editSaving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.cancelModalConfirmText}>Lưu thay đổi</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    flex: 1,
    textAlign: 'center',
  },
  cancelHeaderBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.error,
    fontWeight: '700',
  },

  content: {
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },

  // Status Banners
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  statusBannerOpen: {
    backgroundColor: COLORS.amberOpacity10,
    borderColor: COLORS.amber,
  },
  statusBannerMatched: {
    backgroundColor: COLORS.primaryOpacity10,
    borderColor: COLORS.primary,
  },
  statusBannerConfirmed: {
    backgroundColor: COLORS.primaryOpacity15,
    borderColor: COLORS.primary,
  },
  statusBannerCancelled: {
    backgroundColor: COLORS.errorContainer,
    borderColor: COLORS.error,
  },
  statusBannerText: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    flex: 1,
  },
  statusBannerTextOpen: { color: COLORS.amber },
  statusBannerTextMatched: { color: COLORS.primary },
  statusBannerTextConfirmed: { color: COLORS.primary },
  statusBannerTextCancelled: { color: COLORS.onErrorContainer },

  // VS Matchup Card
  vsCard: {
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  cardHeaderLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  teamAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyAvatar: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    borderStyle: 'dashed',
  },
  avatarText: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.onPrimary,
    fontWeight: '800',
  },
  teamName: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
    textAlign: 'center',
  },
  crpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  crpText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.secondary,
    fontWeight: '800',
  },
  roleTag: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 9,
    color: COLORS.outline,
    fontWeight: '700',
    marginTop: 2,
  },
  emptySubText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
    fontSize: 11,
  },
  vsBadgeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  vsBadgeText: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.onSecondary,
  },

  // Info Card
  infoCard: {
    gap: SPACING.md,
  },
  infoGrid: {
    gap: SPACING.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoItemLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
  },
  infoItemValue: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  messageBox: {
    backgroundColor: COLORS.primaryOpacity05,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
  },
  messageTitle: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '700',
  },
  messageContent: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    fontStyle: 'italic',
  },

  // Steps & Action Cards
  stepCard: {
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  stepTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  stepDesc: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
  },
  actionCTA: {
    marginTop: SPACING.xs,
  },

  matchedWaitingCard: {
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  matchedTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '800',
  },
  creatorActionBox: {
    gap: SPACING.sm,
  },
  creatorInstruction: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    lineHeight: 20,
  },
  visitorWaitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.amberOpacity10,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  visitorWaitText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.amber,
    flex: 1,
    fontWeight: '600',
  },

  confirmedVenueCard: {
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  confirmedTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '800',
  },
  chosenVenueBox: {
    gap: 4,
  },
  chosenVenueName: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.primary,
    fontWeight: '800',
  },
  chosenVenueAddress: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
  splitHeaderLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  splitPriceCard: {
    backgroundColor: COLORS.primaryOpacity05,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitLabel: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  splitVal: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
  },

  // Applications Section
  sectionContainer: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  sectionHeaderTitle: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyAppCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.lg,
  },
  emptyAppText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.outline,
    fontStyle: 'italic',
  },
  appItemCard: {
    gap: SPACING.xs,
  },
  appItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appClubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  appClubName: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  appRepresentative: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
  },

  // Venue Modal
  venueModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  venueModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  venueModalTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
  },
  venueListContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  venueItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  venueItemTitle: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  venueItemAddress: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.outline,
  },
  venueItemRating: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.amber,
    fontWeight: '700',
  },
  venuePrice: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.primary,
    fontWeight: '800',
  },
  venueSplitPrice: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.secondary,
    fontWeight: '700',
  },
});
