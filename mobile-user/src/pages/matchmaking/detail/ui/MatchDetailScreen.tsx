import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useMatchDetail } from '../../../../features/matchmaking/model/useMatchmaking';
import { getJoinedClubsApi } from '../../../../shared/api/clubs';
import { MatchmakingService } from '../../../../shared/api/matchmaking';
import { createPostApi } from '../../../../shared/api/posts';
import { usersApi, UserProfileDto } from '../../../../shared/api/users';
import { CustomConfirmModal } from '../../../../shared/ui/CustomConfirmModal';
import { DevMatchTestPanel } from '../../../../features/matchmaking/ui/DevMatchTestPanel';
import { LineupPicker } from '../../../../features/matchmaking/ui/LineupPicker';
import { EditLineupModal } from '../../../../features/matchmaking/ui/EditLineupModal';
import { UserAvatar } from '../../../../shared/ui/UserAvatar';

interface ApplicantItemRowProps {
  req: any;
  canManage: boolean;
  onAccept: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
  onViewLineup: (lineup: any) => void;
}

function ApplicantItemRow({ req, canManage, onAccept, onReject, onViewLineup }: ApplicantItemRowProps) {
  const [imgError, setImgError] = useState<boolean>(false);
  const club = req.applicantClub;
  const avatarUri = club?.avatarUrl || club?.logoUrl || club?.avatarImage;

  return (
    <View style={styles.applicantCard}>
      <View style={styles.applicantHeader}>
        <View style={styles.applicantAvatarWrap}>
          {avatarUri && !imgError ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.applicantAvatarImg}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={styles.applicantAvatarFallback}>
              <Text style={styles.applicantAvatarText}>{(club?.name || 'B').charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>

        <View style={styles.applicantInfo}>
          <View style={styles.applicantNameRow}>
            <Text style={styles.applicantName} numberOfLines={1}>{club.name}</Text>
            <View style={styles.levelBadgeMini}>
              <Text style={styles.levelBadgeText}>{club.levelLabel || 'Cân bằng'}</Text>
            </View>
          </View>

          <View style={styles.applicantStatsRow}>
            <Ionicons name="trophy-outline" size={12} color="#D97706" />
            <Text style={styles.statTagText}>{club.clubElo || 1200} Elo</Text>
            <Text style={styles.statDot}>•</Text>
            <Ionicons name="people-outline" size={12} color="#0284C7" />
            <Text style={styles.statTagText}>{club.activeMemberCount || 10} thành viên</Text>
          </View>
        </View>
      </View>

      {req.lineup && (
        <TouchableOpacity
          style={styles.applicantLineupBox}
          activeOpacity={0.85}
          onPress={() => onViewLineup(req.lineup)}
        >
          <View style={styles.applicantLineupHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Ionicons name="shield-checkmark" size={15} color="#059669" />
              <Text style={styles.applicantLineupTitle} numberOfLines={1}>
                {req.lineup.name || 'Đội hình thách đấu'}
              </Text>
            </View>
            <View style={styles.applicantEloPill}>
              <Ionicons name="star" size={10} color="#FFFFFF" />
              <Text style={styles.applicantEloText}>{req.lineup.eloAvg || 1200} ELO</Text>
            </View>
          </View>

          <View style={styles.applicantLineupBottom}>
            <View style={styles.applicantAvatarStack}>
              {req.lineup.members?.slice(0, 4).map((m: any, idx: number) => (
                <UserAvatar
                  key={m.userId || idx}
                  uri={m.avatarUrl || m.avatar}
                  name={m.fullName || m.name}
                  size={22}
                  style={{ marginLeft: idx === 0 ? 0 : -6, zIndex: 10 - idx }}
                />
              ))}
            </View>
            <Text style={styles.applicantLineupCountText}>
              {req.lineup.members?.length || req.lineup.memberCount || 0} cầu thủ ra sân
            </Text>
            <View style={styles.applicantViewAction}>
              <Text style={styles.applicantViewActionText}>Xem đội hình</Text>
              <Ionicons name="chevron-forward" size={12} color="#059669" />
            </View>
          </View>
        </TouchableOpacity>
      )}

      {req.note && (
        <View style={styles.applicantNoteBox}>
          <Ionicons name="chatbubble-ellipses-outline" size={13} color="#64748B" />
          <Text style={styles.applicantNoteText}>"{req.note}"</Text>
        </View>
      )}

      {req.status === 'PENDING' && (
        canManage ? (
          <View style={styles.applicantActionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onReject(req.id, club.name)}
              style={styles.rejectBtn}
            >
              <Ionicons name="close-circle-outline" size={15} color="#DC2626" />
              <Text style={styles.rejectBtnText}>Từ chối</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onAccept(req.id, club.name)}
              style={styles.acceptBtn}
            >
              <Ionicons name="checkmark-circle" size={15} color="#FFFFFF" />
              <Text style={styles.acceptBtnText}>Chấp nhận ghép</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pendingStatusBadge}>
            <Ionicons name="time-outline" size={14} color="#92400E" />
            <Text style={styles.pendingStatusText}>Đang chờ Chủ room phê duyệt</Text>
          </View>
        )
      )}
    </View>
  );
}

export function MatchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { room, loading, refetch, requestJoin, acceptRequest, rejectRequest } = useMatchDetail(id as string);

  // Auto-refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (id) {
        refetch();
      }
    }, [id, refetch])
  );

  const [requesting, setRequesting] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfileDto | null>(null);

  useFocusEffect(
    useCallback(() => {
      usersApi.getProfile().then(setCurrentUser).catch(() => {});
    }, [])
  );

  // Club selector modal states for Side B
  const [isJoinModalVisible, setIsJoinModalVisible] = useState<boolean>(false);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string | number | null>(null);
  const [selectedLineup, setSelectedLineup] = useState<any | null>(null);
  const [requestNote, setRequestNote] = useState<string>('');
  const [loadingClubs, setLoadingClubs] = useState<boolean>(false);

  // Vote Share Modal states
  const [isVoteModalVisible, setIsVoteModalVisible] = useState<boolean>(false);
  const [voteTargetClubId, setVoteTargetClubId] = useState<string | number | null>(null);
  const [voteSending, setVoteSending] = useState<boolean>(false);
  const [sharing, setSharing] = useState<boolean>(false);

  // Lineup Detail Modal states
  const [viewingLineup, setViewingLineup] = useState<any | null>(null);
  const [viewingLineupIsEditable, setViewingLineupIsEditable] = useState<boolean>(false);
  const [isLineupDetailModalVisible, setIsLineupDetailModalVisible] = useState<boolean>(false);

  const handleOpenLineupDetail = (lineup: any, isEditable = false) => {
    setViewingLineup(lineup);
    setViewingLineupIsEditable(isEditable);
    setIsLineupDetailModalVisible(true);
  };

  // Custom Modal Alert / Confirm State
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'danger' | 'success';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirm = (
    title: string,
    message: string,
    onConfirmAction: () => void,
    type: 'info' | 'warning' | 'danger' | 'success' = 'info',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy'
  ) => {
    setModalConfig({
      visible: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      onConfirm: () => {
        setModalConfig((prev) => ({ ...prev, visible: false }));
        onConfirmAction();
      },
      onCancel: () => {
        setModalConfig((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  const showAlert = (
    title: string,
    message: string,
    type: 'info' | 'warning' | 'danger' | 'success' = 'info',
    onClose?: () => void
  ) => {
    setModalConfig({
      visible: true,
      title,
      message,
      type,
      confirmText: 'Đóng',
      onConfirm: () => {
        setModalConfig((prev) => ({ ...prev, visible: false }));
        if (onClose) onClose();
      },
    });
  };

  React.useEffect(() => {
    let isMounted = true;
    getJoinedClubsApi()
      .then((clubs) => {
        if (isMounted && clubs) {
          setMyClubs(clubs);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !room) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang nạp dữ liệu trận đấu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isRanked = room.matchType === 'RANKED';
  const host = room.hostClub;
  const guest = room.guestClub;
  const booking = room.booking;

  const isHost = !room.permissions?.canRequestJoin;
  const pendingApplicants = (room.applicants || []).filter((req: any) => req.status === 'PENDING');
  const hasSentPendingRequest = pendingApplicants.some((req: any) =>
    myClubs.some((c: any) => String(c.id) === String(req.applicantClub?.id))
  ) || (room.myRequest && room.myRequest.status === 'PENDING');
  const isRejectedRequest = room.myRequest && room.myRequest.status === 'REJECTED' && !hasSentPendingRequest;

  const openJoinModal = async () => {
    setLoadingClubs(true);
    try {
      let clubs: any[] = [];
      try {
        clubs = await MatchmakingService.getEligibleClubs(room.booking.sportId);
      } catch {
        clubs = [];
      }

      if (!clubs || clubs.length === 0) {
        const joined = await getJoinedClubsApi();
        if (joined && joined.length > 0) {
          clubs = joined.map((c: any) => ({
            id: String(c.id),
            name: c.name,
            sportId: c.sportId ? String(c.sportId) : (c.sport && typeof c.sport === 'object' && c.sport.id ? String(c.sport.id) : '1'),
            sportName: c.sportName || (typeof c.sport === 'string' ? c.sport : (c.sport && c.sport.name ? c.sport.name : 'Bóng đá')),
            logoUrl: c.avatarImage,
            avatarUrl: c.avatarImage,
            activeMemberCount: c.members ?? c.activeMemberCount ?? c.memberCount ?? 1,
            isEligibleForMatchmaking: true,
            clubElo: c.elo || 1200,
            levelLabel: c.levelLabel || 'TB',
            crp: c.crp || 0,
            userStatus: c.userStatus,
            isLeaderOrSubLeader: c.userStatus === 'ADMIN' || c.userStatus === 'SUB_LEADER',
          }));
        }
      }

      if (!clubs || clubs.length === 0) {
        showConfirm(
          'Chưa có CLB nào',
          'Bạn cần tạo hoặc tham gia ít nhất 1 CLB để gửi yêu cầu ghép trận.',
          () => router.push('/(tabs)/club' as any),
          'info',
          'Đến trang CLB',
          'Đóng'
        );
        return;
      }

      const notHostClubs = clubs.filter((c: any) => String(c.id) !== String(host.id));
      if (notHostClubs.length === 0) {
        showConfirm(
          'Không thể ghép trận với chính mình',
          `CLB duy nhất của bạn là "${host.name}" (Chủ room). Cùng 1 CLB không thể ghép chung 1 trận đấu được. Vui lòng tham gia thêm CLB khác để xin ghép.`,
          () => router.push('/(tabs)/club' as any),
          'warning',
          'Đến trang CLB',
          'Đã hiểu'
        );
        return;
      }

      const sameSportClubs = notHostClubs.filter((c: any) => {
        if (!host.sportId && !host.sportName && !booking.sportName) return true;
        const hostSportId = String(host.sportId || booking.sportId || '');
        const hostSportName = (host.sportName || booking.sportName || '').toLowerCase().trim();
        const clubSportId = String(c.sportId || '');
        const clubSportName = (c.sportName || (typeof c.sport === 'string' ? c.sport : (c.sport && c.sport.name ? c.sport.name : ''))).toLowerCase().trim();

        if (hostSportId && clubSportId && hostSportId === clubSportId) return true;
        if (hostSportName && clubSportName && (hostSportName.includes(clubSportName) || clubSportName.includes(hostSportName))) return true;
        return currentUser?.isDevTester || false;
      });

      if (sameSportClubs.length === 0) {
        showConfirm(
          'Khác môn thể thao',
          `Bài đăng ghép trận thuộc môn "${booking.sportName || host.sportName || 'Thể thao'}". Bạn chưa có CLB nào thuộc môn này để xin ghép trận.`,
          () => router.push('/(tabs)/club' as any),
          'warning',
          'Tạo/Tham gia CLB',
          'Đã hiểu'
        );
        return;
      }

      const leaderClubs = sameSportClubs.filter((c: any) =>
        c.isLeaderOrSubLeader || c.userStatus === 'ADMIN' || c.userStatus === 'SUB_LEADER' || currentUser?.isDevTester
      );

      if (leaderClubs.length === 0) {
        showConfirm(
          'Chưa có quyền Trưởng/Phó nhóm',
          `Chỉ Trưởng nhóm hoặc Phó nhóm mới có quyền đại diện CLB gửi yêu cầu ghép trận. Bạn hiện là thành viên thường trong các CLB môn ${booking.sportName || host.sportName || ''}.`,
          () => router.push('/(tabs)/club' as any),
          'warning',
          'Đến trang CLB',
          'Đã hiểu'
        );
        return;
      }

      setMyClubs(leaderClubs);
      setSelectedClubId(leaderClubs[0]?.id || null);
      setSelectedLineup(null);
      setIsJoinModalVisible(true);
    } catch (e: any) {
      showAlert('Lỗi', e.message || 'Không thể nạp danh sách CLB của bạn', 'danger');
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleConfirmSendRequest = async () => {
    if (!selectedClubId) {
      showAlert('Vui lòng chọn CLB', 'Bạn cần chọn CLB bạn đại diện để gửi yêu cầu.', 'warning');
      return;
    }
    if (!selectedLineup?.id) {
      showAlert(
        'Chưa chọn đội hình ra sân',
        'CLB của bạn cần chọn một Đội hình ra sân (Lineup) đủ quân số để tham gia thách đấu. Bạn có thể tạo biểu quyết chốt đội hình trong mục Quản lý CLB.',
        'warning'
      );
      return;
    }
    setRequesting(true);
    try {
      await requestJoin(
        String(selectedClubId),
        requestNote || 'CLB của chúng tôi muốn xin ghép trận!',
        Number(selectedLineup.id)
      );
      setIsJoinModalVisible(false);
      await refetch();
      showAlert('Đã gửi yêu cầu ghép trận', 'Vui lòng chờ Chủ room (Bên A) phê duyệt.', 'success');
    } catch (e: any) {
      showAlert('Không thể gửi yêu cầu', e.message || 'Lỗi gửi yêu cầu', 'danger');
    } finally {
      setRequesting(false);
    }
  };

  const handleSendVotePoll = () => {
    setVoteSending(true);
    setTimeout(() => {
      setVoteSending(false);
      setIsVoteModalVisible(false);
      showAlert(
        'Đã gửi bài biểu quyết thành công',
        `Bài ghép kèo trận đấu tại ${booking.facilityName} (${booking.startTime}) đã được chia sẻ vào nhóm thảo luận của CLB. Các thành viên có thể vào bỏ phiếu bình chọn ngay!`,
        'success'
      );
    }, 600);
  };

  const handleAcceptApplicant = (reqId: string, clubName: string) => {
    showConfirm(
      'Xác nhận chốt trận',
      `Bạn có chắc chắn muốn chọn CLB "${clubName}" làm đối thủ thi đấu chính thức cho trận đấu này?`,
      async () => {
        try {
          await acceptRequest(reqId);
          await refetch();
          showAlert('Chốt trận thành công', 'Trận đấu đã chuyển sang trạng thái MATCHED.', 'success');
        } catch (err: any) {
          showAlert('Lỗi', err.message || 'Không thể chấp nhận yêu cầu', 'danger');
        }
      },
      'success',
      'Chấp nhận ghép',
      'Hủy'
    );
  };

  const handleRejectApplicant = (reqId: string, clubName: string) => {
    showConfirm(
      'Từ chối yêu cầu ghép',
      `Bạn có chắc chắn muốn từ chối yêu cầu ghép trận từ CLB "${clubName}"?`,
      async () => {
        try {
          await rejectRequest(reqId);
          await refetch();
          showAlert('Đã từ chối', `Đã từ chối yêu cầu ghép từ CLB "${clubName}".`, 'info');
        } catch (err: any) {
          showAlert('Lỗi', err.message || 'Không thể từ chối yêu cầu', 'danger');
        }
      },
      'warning',
      'Từ chối',
      'Quay lại'
    );
  };

  const minSharePercent = Math.min(room.hostSharePercent, room.guestSharePercent);
  const maxSharePercent = Math.max(room.hostSharePercent, room.guestSharePercent);
  const minAmount = Math.round((booking.totalPrice * minSharePercent) / 100);
  const maxAmount = booking.totalPrice - minAmount;

  const handleShareToCommunity = async () => {
    if (!room) return;
    showConfirm(
      'Chia sẻ lên Bảng tin',
      `Bạn có muốn chia sẻ thông tin kèo đấu tại "${booking.facilityName}" lên mục Săn kèo của Bảng tin Cộng đồng không?`,
      async () => {
        setSharing(true);
        try {
          await createPostApi({
            content: `Kèo ghép trận ${booking.sportName || 'thể thao'} tại ${booking.facilityName} - ${booking.courtName}! Cần tìm đối thủ giao lưu vui vẻ hoặc tranh hạng!`,
            type: 'MATCH_FINDING',
            audience: 'PUBLIC',
            matchRoomId: String(room.id),
            sportName: booking.sportName || 'Pickleball',
            venueName: `${booking.facilityName} - ${booking.courtName}`,
            timeSlot: `${booking.date} • ${booking.startTime} - ${booking.endTime}`,
            playDate: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            targetLevel: room.desiredLevels && room.desiredLevels.length > 0 ? room.desiredLevels.join(', ') : 'Tương đương',
            slotsNeeded: 1,
            memberFee: `Chia ${room.hostSharePercent}% / ${room.guestSharePercent}% (~${maxAmount.toLocaleString()}đ)`,
            memberFeeAmount: maxAmount,
            currency: 'VND',
          });
          showAlert(
            'Đã chia sẻ thành công',
            'Bài viết ghép kèo đã được đăng lên Bảng tin Cộng đồng!',
            'success',
            () => router.push('/(tabs)/social' as any)
          );
        } catch (err: any) {
          showAlert('Không thể chia sẻ', err.message || 'Lỗi khi tạo bài viết trên Cộng đồng', 'danger');
        } finally {
          setSharing(false);
        }
      },
      'info',
      'Chia sẻ ngay',
      'Để sau'
    );
  };

  const handleCancelRoomPress = () => {
    showConfirm(
      'Hủy phòng ghép kèo',
      'Bạn có chắc chắn muốn hủy phòng ghép kèo này? Sân bạn đã đặt vẫn được giữ nguyên và thuộc quyền sử dụng của bạn.',
      async () => {
        try {
          setRequesting(true);
          await MatchmakingService.cancelRoom(room.id);
          showAlert(
            'Đã hủy phòng ghép',
            'Phòng ghép kèo đã được đóng. Sân bạn đã đặt vẫn thuộc quyền sử dụng của bạn!',
            'success'
          );
          refetch();
        } catch (err: any) {
          showAlert('Lỗi', err.message || 'Không thể hủy phòng ghép kèo', 'danger');
        } finally {
          setRequesting(false);
        }
      },
      'danger',
      'Xác nhận hủy',
      'Quay lại'
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/matchmaking');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── 1. Header Bar ── */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi Tiết Kèo Đấu</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              onPress={handleShareToCommunity}
              style={styles.headerIconBtn}
              disabled={sharing}
              activeOpacity={0.7}
            >
              {sharing ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons name="share-social-outline" size={19} color={COLORS.primary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => refetch()} style={styles.headerIconBtn} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={18} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveContainer}>
          {/* ── [DEV] Tester Control Panel ── */}
          {(currentUser?.isDevTester || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
            <DevMatchTestPanel room={room} onRefresh={refetch} />
          )}

          {/* ── 2. Stadium Hero Card ── */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={[styles.typeBadge, isRanked ? styles.rankedBadge : styles.friendlyBadge]}>
                <Ionicons
                  name={isRanked ? 'trophy' : 'people'}
                  size={12}
                  color={isRanked ? '#FDE68A' : '#BAE6FD'}
                />
                <Text style={[styles.typeText, isRanked ? styles.rankedText : styles.friendlyText]}>
                  {isRanked ? 'Xếp hạng CRP' : 'Trận Giao hữu'}
                </Text>
              </View>

              {room.balanceLabel && (
                <View style={styles.balanceBadge}>
                  <Ionicons name="flash" size={12} color="#F59E0B" />
                  <Text style={styles.balanceText}>{room.balanceLabel}</Text>
                </View>
              )}
            </View>

            <Text style={styles.venueTitle} numberOfLines={1}>{booking.facilityName}</Text>

            {booking.address && (
              <View style={styles.heroMetaRow}>
                <Ionicons name="location" size={13} color="rgba(255, 255, 255, 0.75)" />
                <Text style={styles.heroMetaText} numberOfLines={1}>{booking.address}</Text>
              </View>
            )}

            {/* Time Box Highlight */}
            <View style={styles.timeBox}>
              <Ionicons name="time" size={15} color="#FFFFFF" />
              <Text style={styles.timeBoxText}>
                {booking.date} • <Text style={{ fontWeight: '900' }}>{booking.startTime} - {booking.endTime}</Text>
              </Text>
            </View>

            {/* Chip row: Court format & Total fee */}
            <View style={styles.heroChipRow}>
              <View style={styles.heroChip}>
                <Ionicons name="football-outline" size={13} color="#FFFFFF" />
                <Text style={styles.heroChipText}>{booking.courtName} ({booking.format})</Text>
              </View>
              <View style={styles.heroChipGold}>
                <Ionicons name="cash-outline" size={13} color="#FDE68A" />
                <Text style={styles.heroChipGoldText}>Tiền sân: {booking.totalPrice.toLocaleString('vi-VN')}đ</Text>
              </View>
            </View>
          </View>

          {/* ── 3. Versus Battle Arena Card ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconCircle}>
                <Ionicons name="flame" size={16} color="#EA580C" />
              </View>
              <Text style={styles.sectionTitle}>Tương Quan Đối Đầu</Text>
            </View>

            <View style={styles.vsRow}>
              {/* Host Club */}
              <View style={styles.vsClubCol}>
                <View style={styles.clubAvatarWrap}>
                  {(host.avatarUrl || host.logoUrl || (host as any).avatarImage) ? (
                    <Image
                      source={{ uri: host.avatarUrl || host.logoUrl || (host as any).avatarImage }}
                      style={styles.clubAvatarImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.clubAvatarHost}>
                      <Text style={styles.clubAvatarText}>{(host.name || 'A').charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={styles.hostBadgeDot}>
                    <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={styles.vsClubName} numberOfLines={1}>{host.name}</Text>
                <View style={styles.vsLevelTag}>
                  <Text style={styles.vsLevelText}>{host.levelLabel}</Text>
                </View>
                <Text style={styles.vsEloText}>{host.clubElo} Elo <Text style={styles.vsCrpText}>• {host.crp} CRP</Text></Text>
              </View>

              {/* Center VS Emblem */}
              <View style={styles.vsCenterCol}>
                <View style={styles.vsCircle}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
              </View>

              {/* Guest Club or Seeking slot */}
              {guest ? (
                <View style={styles.vsClubCol}>
                  <View style={styles.clubAvatarWrap}>
                    {(guest.avatarUrl || guest.logoUrl || (guest as any)?.avatarImage) ? (
                      <Image
                        source={{ uri: guest.avatarUrl || guest.logoUrl || (guest as any)?.avatarImage }}
                        style={styles.clubAvatarImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.clubAvatarHost, { backgroundColor: '#0284C7' }]}>
                        <Text style={styles.clubAvatarText}>{(guest.name || 'B').charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.vsClubName} numberOfLines={1}>{guest.name}</Text>
                  <View style={[styles.vsLevelTag, { backgroundColor: '#E0F2FE' }]}>
                    <Text style={[styles.vsLevelText, { color: '#0369A1' }]}>{guest.levelLabel}</Text>
                  </View>
                  <Text style={styles.vsEloText}>{guest.clubElo} Elo <Text style={styles.vsCrpText}>• {guest.crp} CRP</Text></Text>
                </View>
              ) : (
                <View style={styles.vsClubCol}>
                  <View style={styles.emptyGuestAvatar}>
                    <Ionicons name="person-add-outline" size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.emptyGuestName}>Đang tìm đối thủ</Text>
                  <View style={styles.seekingLevelTag}>
                    <Text style={styles.seekingLevelText} numberOfLines={1}>
                      Trình độ: {room.desiredLevels && room.desiredLevels.length > 0 ? room.desiredLevels.join(', ') : 'Tương đương'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* ── 3.1. Match Lineups Card (v2.0) ── */}
          {(room.hostLineup || room.guestLineup) && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconCircle, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="people" size={16} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Đội Hình Ra Sân</Text>
                  <Text style={styles.subtext}>
                    Chạm vào đội hình để xem chi tiết danh sách cầu thủ & ELO
                  </Text>
                </View>
              </View>

              <View style={styles.lineupArenaRow}>
                {/* Host Lineup */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => room.hostLineup && handleOpenLineupDetail(room.hostLineup, isHost)}
                  style={[styles.lineupTeamCol, { borderTopColor: '#059669' }]}
                >
                  <View style={styles.lineupTeamTop}>
                    <Text style={styles.lineupTeamName} numberOfLines={1}>
                      {room.hostLineup?.name || 'Chủ phòng'}
                    </Text>
                    <View style={styles.lineupEloBadge}>
                      <Ionicons name="star" size={10} color="#059669" />
                      <Text style={styles.lineupEloText}>
                        {room.hostLineup?.eloAvg || host.clubElo} ELO
                      </Text>
                    </View>
                  </View>

                  <View style={styles.lineupInteractiveRow}>
                    <View style={styles.lineupAvatarStack}>
                      {room.hostLineup?.members?.slice(0, 4).map((m: any, idx: number) => (
                        <UserAvatar
                          key={m.userId || idx}
                          uri={m.avatarUrl || m.avatar}
                          name={m.fullName || m.name}
                          size={22}
                          style={{ marginLeft: idx === 0 ? 0 : -6, zIndex: 10 - idx }}
                        />
                      ))}
                    </View>
                    <Text style={styles.lineupMemberCount}>
                      {room.hostLineup?.memberCount || room.hostLineup?.members?.length || 0} cầu thủ
                    </Text>
                  </View>

                  <View style={styles.lineupActionPill}>
                    <Text style={styles.lineupActionPillText}>
                      {isHost ? 'Chi tiết / Đổi người' : 'Xem chi tiết'}
                    </Text>
                    <Ionicons name="chevron-forward" size={11} color="#059669" />
                  </View>
                </TouchableOpacity>

                {/* Guest Lineup or Waiting */}
                {room.guestLineup ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleOpenLineupDetail(room.guestLineup, false)}
                    style={[styles.lineupTeamCol, { borderTopColor: '#0284C7' }]}
                  >
                    <View style={styles.lineupTeamTop}>
                      <Text style={styles.lineupTeamName} numberOfLines={1}>
                        {room.guestLineup.name}
                      </Text>
                      <View style={[styles.lineupEloBadge, { backgroundColor: '#E0F2FE' }]}>
                        <Ionicons name="star" size={10} color="#0284C7" />
                        <Text style={[styles.lineupEloText, { color: '#0284C7' }]}>
                          {room.guestLineup.eloAvg} ELO
                        </Text>
                      </View>
                    </View>

                    <View style={styles.lineupInteractiveRow}>
                      <View style={styles.lineupAvatarStack}>
                        {room.guestLineup.members?.slice(0, 4).map((m: any, idx: number) => (
                          <UserAvatar
                            key={m.userId || idx}
                            uri={m.avatarUrl || m.avatar}
                            name={m.fullName || m.name}
                            size={22}
                            style={{ marginLeft: idx === 0 ? 0 : -6, zIndex: 10 - idx }}
                          />
                        ))}
                      </View>
                      <Text style={styles.lineupMemberCount}>
                        {room.guestLineup.memberCount || room.guestLineup.members?.length || 0} cầu thủ
                      </Text>
                    </View>

                    <View style={[styles.lineupActionPill, { backgroundColor: '#E0F2FE' }]}>
                      <Text style={[styles.lineupActionPillText, { color: '#0284C7' }]}>
                        Xem chi tiết
                      </Text>
                      <Ionicons name="chevron-forward" size={11} color="#0284C7" />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.lineupTeamCol, { borderTopColor: '#CBD5E1', justifyContent: 'center' }]}>
                    <View style={styles.lineupWaitingBox}>
                      <Ionicons name="time-outline" size={22} color="#94A3B8" />
                      <Text style={styles.lineupWaitingTitle}>Chờ đối thủ</Text>
                      <Text style={styles.lineupWaitingSubtitle}>
                        Chưa chốt đội hình đối thủ
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Lineup Balance Bar */}
              {room.hostLineup && room.guestLineup && (
                <View style={styles.lineupBalanceBar}>
                  <Ionicons name="git-compare-outline" size={14} color="#D97706" />
                  <Text style={styles.lineupBalanceText}>
                    Chênh lệch: {Math.abs((room.hostLineup.eloAvg || 0) - (room.guestLineup.eloAvg || 0))} ELO
                    {room.balanceLabel ? ` • ${room.balanceLabel}` : ''}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ── 4. Fee Split Rule Card ── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconCircle}>
                <Ionicons name="wallet-outline" size={16} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Quy Tắc Chia Tiền Sân</Text>
                <Text style={styles.subtext}>Tổng tiền sân: {booking.totalPrice.toLocaleString('vi-VN')}đ</Text>
              </View>
            </View>

            <View style={styles.feeSplitBox}>
              <View style={styles.feeSplitRow}>
                <View style={styles.feeSplitLabelGroup}>
                  <Ionicons name="trophy" size={15} color="#15803D" />
                  <Text style={styles.feeSplitLabel}>Đội Thắng chỉ trả ({minSharePercent}%):</Text>
                </View>
                <Text style={styles.feeSplitValueWin}>~{minAmount.toLocaleString('vi-VN')}đ</Text>
              </View>

              <View style={styles.feeSplitRow}>
                <View style={styles.feeSplitLabelGroup}>
                  <Ionicons name="alert-circle" size={15} color="#B91C1C" />
                  <Text style={styles.feeSplitLabel}>Đội Thua trả ({maxSharePercent}%):</Text>
                </View>
                <Text style={styles.feeSplitValueLose}>~{maxAmount.toLocaleString('vi-VN')}đ</Text>
              </View>

              <View style={styles.paymentNoteBox}>
                <Ionicons name="information-circle-outline" size={15} color={COLORS.primary} />
                <Text style={styles.paymentNoteText}>
                  Đội đối thủ sẽ <Text style={{ fontWeight: '800' }}>thanh toán trực tiếp</Text> phần tiền sân tương ứng ngoài đời cho Chủ sân theo kết quả trận.
                </Text>
              </View>
            </View>
          </View>

          {/* ── 5. Host Note (If any) ── */}
          {room.note && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#0284C7" />
                </View>
                <Text style={styles.sectionTitle}>Lời Nhắn Từ Chủ Room</Text>
              </View>
              <Text style={styles.noteText}>"{room.note}"</Text>
            </View>
          )}

          {/* ── 6. Applicants Section (For Host Approval) ── */}
          {room.status === 'OPEN' && pendingApplicants.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="people" size={16} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Đơn Xin Ghép Trận ({pendingApplicants.length})</Text>
                  <Text style={styles.subtext}>Chủ room chọn đối thủ phù hợp nhất để chốt kèo</Text>
                </View>
              </View>

              {pendingApplicants.map((req: any) => {
                const canManage = !!room.permissions?.canManageApplicants;
                return (
                  <ApplicantItemRow
                    key={req.id}
                    req={req}
                    canManage={canManage}
                    onAccept={handleAcceptApplicant}
                    onReject={handleRejectApplicant}
                    onViewLineup={(lineup) => handleOpenLineupDetail(lineup, false)}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── 7. Role-Based Bottom Bar ── */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarInner}>
          {room.status === 'OPEN' && (
            isHost ? (
              <View style={{ gap: 8 }}>
                <View style={styles.hostBottomBanner}>
                  <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                  <Text style={styles.hostBottomBannerText} numberOfLines={1}>
                    {pendingApplicants.length > 0
                      ? `Bạn là Chủ room • ${pendingApplicants.length} CLB xin ghép (Xem trên)`
                      : 'Bạn là Chủ room • Kèo đang mở tìm đối thủ'}
                  </Text>
                </View>
                <TouchableOpacity
                  disabled={requesting}
                  activeOpacity={0.85}
                  onPress={handleCancelRoomPress}
                  style={styles.cancelRoomBtn}
                >
                  <Ionicons name="close-circle-outline" size={15} color="#DC2626" />
                  <Text style={styles.cancelRoomBtnText}>Hủy phòng ghép kèo</Text>
                </TouchableOpacity>
              </View>
            ) : hasSentPendingRequest ? (
              <View style={styles.pendingBottomBanner}>
                <Ionicons name="time-outline" size={16} color="#92400E" />
                <Text style={styles.pendingBottomBannerText} numberOfLines={1}>
                  Đã gửi yêu cầu ghép trận (Đang chờ duyệt)
                </Text>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {isRejectedRequest && (
                  <View style={styles.rejectedBanner}>
                    <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                    <Text style={styles.rejectedBannerText}>
                      Đơn xin ghép từ CLB "{room.myRequest?.applicantClub?.name || 'của bạn'}" đã bị từ chối. Bạn có thể chọn CLB khác để gửi lại!
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  disabled={requesting || loadingClubs}
                  activeOpacity={0.88}
                  onPress={openJoinModal}
                  style={styles.actionBtn}
                >
                  {requesting || loadingClubs ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>
                        {isRejectedRequest ? 'Gửi Lại Yêu Cầu Ghép Trận' : 'Gửi yêu cầu ghép trận ngay'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )
          )}

          {/* Status MATCHED: Host enters score, Side B waits */}
          {room.status === 'MATCHED' && (
            room.permissions?.canEnterScore ? (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.push(`/matchmaking/${room.id}/score` as any)}
                style={styles.scoreBtn}
              >
                <Ionicons name="trophy" size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Nhập tỷ số trận đấu (Chủ room)</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.matchedWaitingBanner}>
                <Ionicons name="time-outline" size={16} color="#0369A1" />
                <Text style={styles.matchedWaitingText} numberOfLines={1}>
                  Trận đã chốt • Chờ Chủ room ({room.hostClub.name}) nhập tỷ số
                </Text>
              </View>
            )
          )}

          {/* Status SCORE_CONFIRMING or SCORE_PENDING: Side B approves, Host waits */}
          {(room.status === 'SCORE_CONFIRMING' || room.status === 'SCORE_PENDING') && (
            room.permissions?.canConfirmScore ? (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.push(`/matchmaking/${room.id}/score` as any)}
                style={styles.confirmScoreActionBtn}
              >
                <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Duyệt & Xác nhận tỷ số (Bên B)</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.pendingBottomBanner}>
                <Ionicons name="hourglass-outline" size={16} color="#92400E" />
                <Text style={styles.pendingBottomBannerText} numberOfLines={1}>
                  Đã gửi tỷ số • Chờ Bên B duyệt
                </Text>
              </View>
            )
          )}

          {room.status === 'RESULT_FINAL' && (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push(`/matchmaking/${room.id}/result` as any)}
              style={styles.resultBtn}
            >
              <Ionicons name="ribbon" size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Xem Kết Quả & Thưởng CRP</Text>
            </TouchableOpacity>
          )}

          {/* Status EXPIRED */}
          {room.status === 'EXPIRED' && (
            <View style={styles.statusNoticeBanner}>
              <Ionicons name="time-outline" size={20} color="#64748B" />
              <View style={{ flex: 1 }}>
                <Text style={styles.statusNoticeTitle}>
                  {room.statusLabel || (isHost ? 'Kèo đấu đã quá hạn' : 'Không tìm được đối thủ')}
                </Text>
                <Text style={styles.statusNoticeSub}>
                  {isHost
                    ? 'Kèo đấu đã quá giờ tìm đối thủ. Sân đã đặt vẫn thuộc quyền sử dụng của bạn.'
                    : 'Phòng ghép trận này đã hết hạn mà không tìm được đối thủ.'}
                </Text>
              </View>
            </View>
          )}

          {/* Status CANCELLED */}
          {room.status === 'CANCELLED' && (
            <View style={[styles.statusNoticeBanner, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusNoticeTitle, { color: '#DC2626' }]}>Kèo đấu đã bị hủy</Text>
                <Text style={[styles.statusNoticeSub, { color: '#7F1D1D' }]}>
                  {room.cancellationReason
                    ? `Lý do: ${room.cancellationReason}`
                    : 'Phòng ghép kèo đã được đóng. Sân đã đặt vẫn thuộc quyền sở hữu của chủ phòng.'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* ── 8. Join Match Modal ── */}
      <Modal
        visible={isJoinModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsJoinModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              setIsJoinModalVisible(false);
            }}
            style={styles.modalOverlay}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.bottomSheetContainer}>
                <View style={styles.grabHandle} />

                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>Chọn CLB Đại Diện Thách Đấu</Text>
                    <Text style={styles.modalSubtitle}>Gửi yêu cầu ghép kèo tới Chủ room</Text>
                  </View>
                  <TouchableOpacity onPress={() => setIsJoinModalVisible(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalBodyScroll}
                  contentContainerStyle={styles.modalBodyScrollContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.targetHostBanner}>
                    <View style={styles.targetHostIconCircle}>
                      <Ionicons name="shield-checkmark" size={15} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.targetHostLabel}>Đối thủ thách đấu:</Text>
                      <Text style={styles.targetHostName} numberOfLines={1}>
                        {host.name} <Text style={styles.targetHostLevel}>({host.levelLabel} • {host.clubElo} Elo)</Text>
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.sheetSectionLabel}>1. CHỌN CLB BẠN ĐẠI DIỆN:</Text>

                  <View style={styles.clubListContainer}>
                    {myClubs.map((club) => {
                      const isSelected = String(selectedClubId) === String(club.id);
                      const clubAvatar = club.avatarUrl || club.logoUrl || (club as any).avatarImage;
                      return (
                        <TouchableOpacity
                          key={club.id}
                          activeOpacity={0.88}
                          onPress={() => {
                            if (String(selectedClubId) !== String(club.id)) {
                              setSelectedClubId(club.id);
                              setSelectedLineup(null);
                            }
                          }}
                          style={[styles.clubCardItem, isSelected && styles.clubCardItemActive]}
                        >
                          <View style={styles.modalClubAvatarWrap}>
                            {clubAvatar ? (
                              <Image source={{ uri: clubAvatar }} style={styles.modalClubAvatarImg} resizeMode="cover" />
                            ) : (
                              <View style={styles.clubAvatarCircle}>
                                <Text style={styles.clubAvatarLetter}>{(club.name || 'C').charAt(0).toUpperCase()}</Text>
                              </View>
                            )}
                          </View>

                          <View style={{ flex: 1, gap: 2 }}>
                            <Text style={[styles.clubCardName, isSelected && styles.clubCardNameActive]} numberOfLines={1}>
                              {club.name}
                            </Text>
                            <View style={styles.clubCardMetaRow}>
                              <Ionicons name="trophy-outline" size={11} color="#D97706" />
                              <Text style={styles.clubCardMetaText}>{club.clubElo || 1200} Elo</Text>
                              <Text style={styles.metaDot}>•</Text>
                              <Ionicons name="people-outline" size={11} color="#0284C7" />
                              <Text style={styles.clubCardMetaText}>{club.activeMemberCount || 10} TV</Text>
                              <Text style={styles.metaDot}>•</Text>
                              <Text style={styles.clubCardLevelText}>{club.levelLabel || 'TB'}</Text>
                            </View>
                          </View>

                          <View style={[styles.radioOuterRing, isSelected && styles.radioOuterRingActive]}>
                            {isSelected && <View style={styles.radioInnerDot} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Section 2: Choose Lineup */}
                  {selectedClubId && (
                    <View style={{ marginTop: SPACING.md }}>
                      <LineupPicker
                        clubId={selectedClubId}
                        clubName={myClubs.find((c) => String(c.id) === String(selectedClubId))?.name}
                        sportId={room.booking?.sportId || host.sportId}
                        selectedLineupId={selectedLineup?.id}
                        onSelectLineup={setSelectedLineup}
                        onNavigateToClub={() => {
                          setIsJoinModalVisible(false);
                          router.push(`/club/${selectedClubId}` as any);
                        }}
                        stepNumber={2}
                      />
                    </View>
                  )}

                  <Text style={[styles.sheetSectionLabel, { marginTop: SPACING.lg }]}>3. LỜI NHẮN GỬI CHỦ ROOM (TÙY CHỌN):</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.sheetTextInput}
                      placeholder="VD: CLB mình muốn giao lưu vui vẻ, fair-play..."
                      placeholderTextColor="#94A3B8"
                      value={requestNote}
                      onChangeText={setRequestNote}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </ScrollView>

                <View style={styles.sheetActionRow}>
                  <TouchableOpacity
                    onPress={() => setIsJoinModalVisible(false)}
                    style={styles.sheetCancelBtn}
                  >
                    <Text style={styles.sheetCancelText}>Hủy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={requesting || !selectedClubId}
                    onPress={handleConfirmSendRequest}
                    style={[styles.sheetSubmitBtn, (!selectedClubId || requesting) && { opacity: 0.6 }]}
                  >
                    {requesting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="paper-plane" size={15} color="#FFFFFF" />
                        <Text style={styles.sheetSubmitText}>Gửi Yêu Cầu Ghép</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Confirm / Alert Modal */}
      <CustomConfirmModal {...modalConfig} />

      {/* Edit / Inspect Lineup Modal */}
      <EditLineupModal
        visible={isLineupDetailModalVisible}
        lineup={viewingLineup}
        onClose={() => setIsLineupDetailModalVisible(false)}
        isLeaderOrSubLeader={viewingLineupIsEditable}
        mode="MATCHMAKING"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerInner: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 16.5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#64748B',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 110,
  },
  responsiveContainer: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    gap: SPACING.md,
  },
  heroCard: {
    backgroundColor: '#064E3B',
    padding: 16,
    borderRadius: BORDER_RADIUS.xl,
    gap: 10,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  rankedBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
  },
  friendlyBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
  },
  typeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '800',
  },
  rankedText: {
    color: '#FDE68A',
  },
  friendlyText: {
    color: '#BAE6FD',
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  balanceText: {
    ...TYPOGRAPHY.labelSm,
    color: '#FDE68A',
    fontWeight: '800',
    fontSize: 11,
  },
  venueTitle: {
    ...TYPOGRAPHY.titleLg,
    fontWeight: '900',
    color: '#FFFFFF',
    fontSize: 19,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroMetaText: {
    ...TYPOGRAPHY.bodySm,
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12.5,
    flex: 1,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  timeBoxText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#FFFFFF',
    fontSize: 13,
  },
  heroChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.sm,
  },
  heroChipText: {
    ...TYPOGRAPHY.labelSm,
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  heroChipGold: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.sm,
  },
  heroChipGoldText: {
    ...TYPOGRAPHY.labelSm,
    color: '#FDE68A',
    fontSize: 11.5,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 15.5,
  },
  subtext: {
    ...TYPOGRAPHY.bodyMd,
    color: '#64748B',
    fontSize: 12,
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  vsClubCol: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  clubAvatarWrap: {
    position: 'relative',
    marginBottom: 2,
  },
  clubAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#E2E8F0',
  },
  clubAvatarHost: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  clubAvatarText: {
    ...TYPOGRAPHY.titleMd,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  hostBadgeDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  vsClubName: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    maxWidth: 110,
  },
  vsLevelTag: {
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  vsLevelText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontSize: 10.5,
    fontWeight: '800',
  },
  vsEloText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  vsCrpText: {
    color: '#64748B',
    fontWeight: '500',
  },
  vsCenterCol: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  vsText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  emptyGuestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 78, 59, 0.04)',
    marginBottom: 2,
  },
  emptyGuestName: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    fontWeight: '700',
    fontSize: 12,
  },
  seekingLevelTag: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  seekingLevelText: {
    ...TYPOGRAPHY.labelSm,
    color: '#6D28D9',
    fontWeight: '700',
    fontSize: 10,
    maxWidth: 100,
  },
  feeSplitBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  feeSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeSplitLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feeSplitLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  feeSplitValueWin: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    color: '#15803D',
    fontSize: 14,
  },
  feeSplitValueLose: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    color: '#B91C1C',
    fontSize: 14,
  },
  paymentNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentNoteText: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 11.5,
    color: '#475569',
    flex: 1,
    lineHeight: 16,
  },
  noteText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#475569',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  applicantCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  applicantAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  applicantAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
  },
  applicantAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicantAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
  },
  applicantInfo: {
    flex: 1,
    gap: 3,
  },
  applicantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  applicantName: {
    ...TYPOGRAPHY.titleSm,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 13.5,
    flexShrink: 1,
  },
  levelBadgeMini: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BORDER_RADIUS.sm,
  },
  levelBadgeText: {
    color: '#6D28D9',
    fontSize: 10,
    fontWeight: '700',
  },
  applicantStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statTagText: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  statDot: {
    color: '#CBD5E1',
    fontSize: 10,
  },
  applicantNoteBox: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  applicantNoteText: {
    ...TYPOGRAPHY.bodySm,
    color: '#475569',
    fontSize: 12,
    fontStyle: 'italic',
  },
  applicantActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  rejectBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  acceptBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  pendingStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  pendingStatusText: {
    ...TYPOGRAPHY.labelSm,
    color: '#B45309',
    fontWeight: '700',
    fontSize: 11.5,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    paddingBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomBarInner: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  hostBottomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.xl,
  },
  hostBottomBannerText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  cancelRoomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BORDER_RADIUS.xl,
  },
  cancelRoomBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  statusNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusNoticeTitle: {
    ...TYPOGRAPHY.labelMd,
    color: '#334155',
    fontWeight: '800',
    fontSize: 13,
  },
  statusNoticeSub: {
    ...TYPOGRAPHY.bodySm,
    color: '#64748B',
    fontSize: 11.5,
    marginTop: 2,
  },
  pendingBottomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.xl,
  },
  pendingBottomBannerText: {
    ...TYPOGRAPHY.labelMd,
    color: '#B45309',
    fontWeight: '800',
    fontSize: 13,
  },
  rejectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  rejectedBannerText: {
    ...TYPOGRAPHY.labelSm,
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 11.5,
    flex: 1,
  },
  matchedWaitingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.xl,
  },
  matchedWaitingText: {
    ...TYPOGRAPHY.labelMd,
    color: '#0369A1',
    fontWeight: '800',
    fontSize: 13,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: {
    ...TYPOGRAPHY.titleSm,
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14.5,
  },
  scoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.xl,
  },
  confirmScoreActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.xl,
  },
  resultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.xl,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    maxHeight: '90%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  grabHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    color: COLORS.onSurface,
    fontSize: 16,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.bodySm,
    color: '#64748B',
    fontSize: 11.5,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBodyScroll: {
    maxHeight: 380,
  },
  modalBodyScrollContent: {
    paddingVertical: 10,
    gap: 8,
  },
  targetHostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
    padding: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.12)',
  },
  targetHostIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(6, 78, 59, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetHostLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  targetHostName: {
    ...TYPOGRAPHY.titleSm,
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  targetHostLevel: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  sheetSectionLabel: {
    ...TYPOGRAPHY.labelSm,
    color: '#475569',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 2,
  },
  clubListContainer: {
    gap: 8,
  },
  clubCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  clubCardItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(6, 78, 59, 0.04)',
  },
  modalClubAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalClubAvatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  clubAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubAvatarLetter: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  clubCardName: {
    ...TYPOGRAPHY.titleSm,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 13,
  },
  clubCardNameActive: {
    color: COLORS.primary,
  },
  clubCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clubCardMetaText: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  metaDot: {
    color: '#CBD5E1',
    fontSize: 10,
  },
  clubCardLevelText: {
    ...TYPOGRAPHY.labelSm,
    color: '#6D28D9',
    fontSize: 10.5,
    fontWeight: '700',
  },
  radioOuterRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterRingActive: {
    borderColor: COLORS.primary,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sheetTextInput: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.onSurface,
    fontSize: 12.5,
    minHeight: 65,
    textAlignVertical: 'top',
  },
  sheetActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sheetCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  sheetCancelText: {
    ...TYPOGRAPHY.labelMd,
    color: '#64748B',
    fontWeight: '700',
    fontSize: 13,
  },
  sheetSubmitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  sheetSubmitText: {
    ...TYPOGRAPHY.labelMd,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  applicantLineupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 4,
  },
  applicantLineupText: {
    ...TYPOGRAPHY.caption,
    color: '#065F46',
    fontSize: 11,
  },
  lineupArenaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  lineupTeamCol: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 3,
    padding: 10,
  },
  lineupTeamTop: {
    marginBottom: 4,
  },
  lineupTeamName: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 13,
    marginBottom: 4,
  },
  lineupEloBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lineupEloText: {
    ...TYPOGRAPHY.caption,
    color: '#059669',
    fontWeight: '800',
    fontSize: 10.5,
  },
  lineupMemberCount: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontSize: 10.5,
    marginBottom: 8,
  },
  lineupMembersList: {
    gap: 6,
  },
  lineupMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  lineupMemberAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lineupAvatarImg: {
    width: '100%',
    height: '100%',
  },
  lineupAvatarText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  lineupMemberName: {
    flex: 1,
    ...TYPOGRAPHY.caption,
    color: '#1E293B',
    fontWeight: '600',
    fontSize: 11,
  },
  lineupMemberElo: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontWeight: '700',
    fontSize: 10,
  },
  lineupWaitingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  lineupWaitingTitle: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2,
  },
  lineupWaitingSubtitle: {
    ...TYPOGRAPHY.caption,
    color: '#94A3B8',
    textAlign: 'center',
  },
  lineupBalanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    marginTop: 10,
  },
  lineupBalanceText: {
    ...TYPOGRAPHY.caption,
    color: '#B45309',
    fontWeight: '700',
  },
  lineupInteractiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  lineupAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lineupActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 6,
  },
  lineupActionPillText: {
    ...TYPOGRAPHY.caption,
    color: '#059669',
    fontWeight: '700',
    fontSize: 10.5,
  },
  applicantLineupBox: {
    marginTop: 6,
    backgroundColor: '#F0FDF4',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 8,
  },
  applicantLineupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  applicantLineupTitle: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  applicantEloPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  applicantEloText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  applicantLineupBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  applicantAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicantLineupCountText: {
    flex: 1,
    ...TYPOGRAPHY.caption,
    color: '#475569',
    fontSize: 10.5,
  },
  applicantViewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  applicantViewActionText: {
    ...TYPOGRAPHY.caption,
    color: '#059669',
    fontWeight: '700',
    fontSize: 11,
  },
});
