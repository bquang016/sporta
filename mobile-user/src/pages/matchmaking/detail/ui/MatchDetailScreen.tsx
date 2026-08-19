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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useMatchDetail } from '../../../../features/matchmaking/model/useMatchmaking';
import { getJoinedClubsApi } from '../../../../shared/api/clubs';
import { CustomConfirmModal } from '../../../../shared/ui/CustomConfirmModal';

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

  // Club selector modal states for Side B
  const [isJoinModalVisible, setIsJoinModalVisible] = useState<boolean>(false);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string | number | null>(null);
  const [requestNote, setRequestNote] = useState<string>('');
  const [loadingClubs, setLoadingClubs] = useState<boolean>(false);

  // Vote Share Modal states for Rule 2
  const [isVoteModalVisible, setIsVoteModalVisible] = useState<boolean>(false);
  const [voteTargetClubId, setVoteTargetClubId] = useState<string | number | null>(null);
  const [voteSending, setVoteSending] = useState<boolean>(false);

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
  const hasSentRequest = room.applicants?.some((req: any) =>
    myClubs.some((c: any) => String(c.id) === String(req.applicantClub?.id))
  ) || (room.myRequest && room.myRequest.status === 'PENDING');

  const openJoinModal = async () => {
    setLoadingClubs(true);
    try {
      const clubs = await getJoinedClubsApi();
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

      const validClubs = clubs.filter((c: any) => String(c.id) !== String(host.id));
      if (validClubs.length === 0) {
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

      setMyClubs(validClubs);
      setSelectedClubId(validClubs[0]?.id || null);
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
    setRequesting(true);
    try {
      await requestJoin(String(selectedClubId), requestNote || 'CLB của chúng tôi muốn xin ghép trận!');
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi Tiết Bài Ghép Kèo</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.headerIconBtn}>
            <Ionicons name="refresh-outline" size={18} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.responsiveContainer}>
          {/* Stadium Hero Banner Card - Enriched */}
          <View style={styles.heroCard}>
            <View style={styles.badgeRow}>
              <View style={[styles.typeBadge, isRanked ? styles.rankedBadge : styles.friendlyBadge]}>
                <Ionicons
                  name={isRanked ? 'trophy' : 'people'}
                  size={13}
                  color={isRanked ? '#92400E' : '#075985'}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.typeText, isRanked ? styles.rankedText : styles.friendlyText]}>
                  {isRanked ? 'Trận Xếp hạng (Tích CRP)' : 'Trận Giao hữu'}
                </Text>
              </View>
              {room.balanceLabel && (
                <View style={styles.balanceBadge}>
                  <Ionicons name="flash" size={12} color={COLORS.white} />
                  <Text style={styles.balanceText}>{room.balanceLabel}</Text>
                </View>
              )}
            </View>

            <Text style={styles.venueTitle} numberOfLines={1}>{booking.facilityName}</Text>

            {/* Address & Host Info */}
            <View style={styles.heroMetaGroup}>
              {booking.address && (
                <View style={styles.heroMetaRow}>
                  <Ionicons name="location-outline" size={14} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.heroMetaText} numberOfLines={1}>{booking.address}</Text>
                </View>
              )}
              <View style={styles.heroMetaRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color="rgba(255, 255, 255, 0.9)" />
                <Text style={styles.heroMetaText}>Chủ room: <Text style={{ fontWeight: '900', color: COLORS.white }}>{host.name}</Text></Text>
              </View>
            </View>

            {/* Time Box */}
            <View style={styles.timeBox}>
              <Ionicons name="calendar-outline" size={15} color={COLORS.white} />
              <Text style={styles.timeBoxText}>
                {booking.date} • {booking.startTime} - {booking.endTime}
              </Text>
            </View>

            {/* Format & Total Fee Info Chips */}
            <View style={styles.heroChipRow}>
              <View style={styles.heroChip}>
                <Ionicons name="fitness-outline" size={13} color={COLORS.white} />
                <Text style={styles.heroChipText}>{booking.courtName} ({booking.format})</Text>
              </View>
              <View style={styles.heroChipGold}>
                <Ionicons name="cash-outline" size={13} color="#78350F" />
                <Text style={styles.heroChipGoldText}>Tiền sân: {booking.totalPrice.toLocaleString('vi-VN')}đ</Text>
              </View>
            </View>
          </View>

          {/* Versus Battle Card */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Đối Đầu & Trình Độ CLB</Text>

            <View style={styles.vsRow}>
              {/* Host Club */}
              <View style={styles.vsClubCol}>
                <View style={styles.clubAvatarHost}>
                  <Text style={styles.clubAvatarText}>{host.name.charAt(4) || 'A'}</Text>
                </View>
                <Text style={styles.vsClubName} numberOfLines={1}>{host.name}</Text>
                <View style={styles.vsLevelTag}>
                  <Text style={styles.vsLevelText}>{host.levelLabel}</Text>
                </View>
                <Text style={styles.vsEloText}>{host.clubElo} Elo</Text>
                <Text style={styles.vsCrpText}>• {host.crp} CRP</Text>
              </View>

              <View style={styles.vsBadgeCircle}>
                <Text style={styles.vsText}>VS</Text>
              </View>

              {/* Guest Club */}
              {guest ? (
                <View style={styles.vsClubCol}>
                  <View style={styles.clubAvatarGuest}>
                    <Text style={styles.clubAvatarText}>{guest.name.charAt(4) || 'B'}</Text>
                  </View>
                  <Text style={styles.vsClubName} numberOfLines={1}>{guest.name}</Text>
                  <View style={styles.vsLevelTag}>
                    <Text style={styles.vsLevelText}>{guest.levelLabel}</Text>
                  </View>
                  <Text style={styles.vsEloText}>{guest.clubElo} Elo</Text>
                  <Text style={styles.vsCrpText}>• {guest.crp} CRP</Text>
                </View>
              ) : (
                <View style={styles.vsClubCol}>
                  <View style={styles.emptyGuestAvatar}>
                    <Ionicons name="person-add-outline" size={22} color={COLORS.outline} />
                  </View>
                  <Text style={styles.emptyGuestName}>Đang tìm đối thủ...</Text>
                  <Text style={styles.emptyGuestSub}>Trình độ: {room.desiredLevels.join(', ')}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Fee Split Card - Fixed Overflow */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Chi Phí Sân & Quy Tắc Thắng Trả Ít Hơn</Text>
            <Text style={styles.subtext}>Tổng giá trị tiền sân: {booking.totalPrice.toLocaleString('vi-VN')}đ</Text>

            <View style={styles.feeSplitBox}>
              <View style={styles.feeSplitRow}>
                <View style={styles.feeSplitLabelGroup}>
                  <Ionicons name="trophy" size={15} color="#15803D" />
                  <Text style={styles.feeSplitLabel} numberOfLines={1}>
                    Đội Thắng chỉ trả ({minSharePercent}%):
                  </Text>
                </View>
                <Text style={styles.feeSplitValueHighlight}>~{minAmount.toLocaleString('vi-VN')}đ</Text>
              </View>

              <View style={styles.feeSplitRow}>
                <View style={styles.feeSplitLabelGroup}>
                  <Ionicons name="alert-circle" size={15} color="#B91C1C" />
                  <Text style={styles.feeSplitLabel} numberOfLines={1}>
                    Đội Thua trả phần còn lại ({maxSharePercent}%):
                  </Text>
                </View>
                <Text style={styles.feeSplitValue}>~{maxAmount.toLocaleString('vi-VN')}đ</Text>
              </View>

              <View style={styles.paymentNoteBox}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
                <Text style={styles.paymentNoteText}>
                  Đội đối thủ sẽ <Text style={{ fontWeight: '800' }}>thanh toán trực tiếp</Text> khoản tiền sân ngoài đời cho Chủ sân theo kết quả trận đấu.
                </Text>
              </View>
            </View>
          </View>

          {/* Host Note */}
          {room.note && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Lời Nhắn Từ Chủ Room</Text>
              <Text style={styles.noteText}>"{room.note}"</Text>
            </View>
          )}

          {/* Applicants List */}
          {room.status === 'OPEN' && room.applicants.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.applicantSectionHeader}>
                <View style={styles.applicantHeaderTitleRow}>
                  <Ionicons name="people-circle-outline" size={22} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>Danh Sách Yêu Cầu Ghép Trận ({room.applicants.length})</Text>
                </View>
                <Text style={styles.applicantSubHint}>Chủ room chọn đối thủ phù hợp nhất để chốt trận</Text>
              </View>

              {room.applicants.map((req: any) => {
                const canManage = !!room.permissions?.canManageApplicants;
                return (
                  <View key={req.id} style={styles.applicantCardNew}>
                    <View style={styles.applicantHeaderNew}>
                      {/* Club Avatar */}
                      <View style={styles.applicantAvatarNew}>
                        <Text style={styles.applicantAvatarTextNew}>{req.applicantClub.name?.charAt(0) || 'B'}</Text>
                      </View>

                      <View style={styles.applicantInfoNew}>
                        <View style={styles.applicantNameRow}>
                          <Text style={styles.applicantNameNew} numberOfLines={1}>{req.applicantClub.name}</Text>
                          <View style={styles.levelBadgeMini}>
                            <Text style={styles.levelBadgeText}>{req.applicantClub.levelLabel || 'Cân bằng'}</Text>
                          </View>
                        </View>

                        <View style={styles.applicantStatsRow}>
                          <View style={styles.statTag}>
                            <Ionicons name="trophy-outline" size={12} color="#D97706" />
                            <Text style={styles.statTagText}>{req.applicantClub.clubElo || 1200} Elo</Text>
                          </View>

                          <View style={styles.statTag}>
                            <Ionicons name="people-outline" size={12} color={COLORS.primary} />
                            <Text style={styles.statTagText}>{req.applicantClub.activeMemberCount || 10} TV</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {req.note && (
                      <View style={styles.applicantNoteBox}>
                        <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLORS.onSurfaceVariant} />
                        <Text style={styles.applicantNoteText}>"{req.note}"</Text>
                      </View>
                    )}

                    {req.status === 'PENDING' && (
                      canManage ? (
                        <View style={styles.applicantActionRowNew}>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleRejectApplicant(req.id, req.applicantClub.name)}
                            style={styles.rejectBtnNew}
                          >
                            <Ionicons name="close-circle-outline" size={15} color="#DC2626" />
                            <Text style={styles.rejectBtnTextNew} numberOfLines={1}>Từ chối</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => handleAcceptApplicant(req.id, req.applicantClub.name)}
                            style={styles.acceptBtnNew}
                          >
                            <Ionicons name="checkmark-circle-outline" size={15} color={COLORS.white} />
                            <Text style={styles.acceptBtnTextNew} numberOfLines={1}>Chấp nhận</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.pendingStatusBadgeNew}>
                          <Ionicons name="hourglass-outline" size={14} color="#92400E" />
                          <Text style={styles.pendingStatusTextNew} numberOfLines={1}>Đang chờ Chủ room (Bên A) phê duyệt</Text>
                        </View>
                      )
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Role-Based Bottom Bar - Compact & Tidy Alignment */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarInner}>
          {room.status === 'OPEN' && (
            isHost ? (
              <View style={styles.hostBottomBanner}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                <Text style={styles.hostBottomBannerText} numberOfLines={1}>
                  {room.applicants.length > 0
                    ? `Bạn là Chủ room • ${room.applicants.length} CLB xin ghép (Xem trên)`
                    : 'Bạn là Chủ room • Phòng ghép đang mở'}
                </Text>
              </View>
            ) : hasSentRequest ? (
              <View style={styles.pendingBottomBanner}>
                <Ionicons name="time-outline" size={16} color="#92400E" />
                <Text style={styles.pendingBottomBannerText} numberOfLines={1}>
                  Đã gửi yêu cầu ghép trận (Đang chờ duyệt)
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                disabled={requesting || loadingClubs}
                activeOpacity={0.88}
                onPress={openJoinModal}
                style={styles.actionBtn}
              >
                {requesting || loadingClubs ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="paper-plane-outline" size={16} color={COLORS.white} />
                    <Text style={styles.actionBtnText} numberOfLines={1}>Gửi yêu cầu ghép trận ngay</Text>
                  </>
                )}
              </TouchableOpacity>
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
                <Ionicons name="trophy-outline" size={16} color={COLORS.white} />
                <Text style={styles.actionBtnText} numberOfLines={1}>Nhập tỷ số trận đấu (Chủ room)</Text>
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
                <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.white} />
                <Text style={styles.actionBtnText} numberOfLines={1}>Duyệt & Xác nhận tỷ số (Bên B)</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.pendingBottomBanner}>
                <Ionicons name="hourglass-outline" size={16} color="#92400E" />
                <Text style={styles.pendingBottomBannerText} numberOfLines={1}>
                  Đã gửi tỷ số • Chờ Bên B ({room.guestClub?.name || 'Đối thủ'}) duyệt
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
              <Ionicons name="ribbon-outline" size={16} color={COLORS.white} />
              <Text style={styles.actionBtnText} numberOfLines={1}>Xem Kết Quả & Thưởng CRP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 1. SELECT CLUB BOTTOM SHEET MODAL */}
      <Modal
        visible={isJoinModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsJoinModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsJoinModalVisible(false)}
          style={styles.modalOverlay}
        >
          <TouchableOpacity activeOpacity={1} style={styles.bottomSheetContainer}>
            <View style={styles.grabHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <View style={styles.headerIconBadge}>
                  <Ionicons name="shield-checkmark" size={18} color={COLORS.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Chọn CLB Đại Diện Thách Đấu</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsJoinModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View style={styles.targetHostBanner}>
              <Ionicons name="sparkles-outline" size={16} color={COLORS.primary} />
              <Text style={styles.targetHostText}>
                Thách đấu với Chủ room: <Text style={{ fontWeight: '900', color: COLORS.primary }}>{host.name}</Text> ({host.levelLabel})
              </Text>
            </View>

            <Text style={styles.sheetSectionLabel}>CHỌN CLB CỦA BẠN (CÙNG CLB KHÔNG THỂ GHÉP CÙNG KÈO):</Text>

            <ScrollView style={styles.clubListScroll} showsVerticalScrollIndicator={false}>
              {myClubs.map((club) => {
                const isSelected = String(selectedClubId) === String(club.id);
                return (
                  <TouchableOpacity
                    key={club.id}
                    activeOpacity={0.88}
                    onPress={() => setSelectedClubId(club.id)}
                    style={[styles.clubCardItem, isSelected && styles.clubCardItemActive]}
                  >
                    <View style={styles.clubAvatarCircle}>
                      <Text style={styles.clubAvatarLetter}>{club.name?.charAt(0) || 'C'}</Text>
                    </View>

                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={[styles.clubCardName, isSelected && styles.clubCardNameActive]}>
                        {club.name}
                      </Text>
                      <View style={styles.clubMetaRow}>
                        <View style={styles.eloBadge}>
                          <Ionicons name="trophy-outline" size={10} color="#92400E" style={{ marginRight: 2 }} />
                          <Text style={styles.eloBadgeText}>{club.clubElo || 1200} Elo</Text>
                        </View>
                        <View style={styles.memberBadge}>
                          <Ionicons name="people-outline" size={10} color="#0369A1" style={{ marginRight: 2 }} />
                          <Text style={styles.memberBadgeText}>{club.activeMemberCount || 10} thành viên</Text>
                        </View>
                      </View>
                    </View>

                    <View style={[styles.radioOuterRing, isSelected && styles.radioOuterRingActive]}>
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.sheetSectionLabel}>LỜI NHẮN GỬI CHỦ ROOM (TÙY CHỌN):</Text>
            <TextInput
              style={styles.sheetTextInput}
              placeholder="VD: CLB mình muốn giao lưu vui vẻ, thi đấu 2 hiệp 30 phút..."
              placeholderTextColor={COLORS.outline}
              value={requestNote}
              onChangeText={setRequestNote}
              multiline
              numberOfLines={2}
            />

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
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="send-outline" size={15} color={COLORS.white} />
                    <Text style={styles.sheetSubmitText}>Gửi Yêu Cầu Ghép Trận</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 2. SHARE TO CLUB FOR VOTING BOTTOM SHEET MODAL */}
      <Modal
        visible={isVoteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVoteModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsVoteModalVisible(false)}
          style={styles.modalOverlay}
        >
          <TouchableOpacity activeOpacity={1} style={styles.bottomSheetContainer}>
            <View style={styles.grabHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <View style={styles.voteIconBadge}>
                  <Ionicons name="stats-chart-outline" size={18} color={COLORS.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Chia Sẻ Vào CLB Để Biểu Quyết</Text>
                  <Text style={styles.modalSubtitle}>Đăng khảo sát ý kiến các thành viên trước khi chốt đi trận đấu</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setIsVoteModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={COLORS.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetSectionLabel}>CHỌN CLB CỦA BẠN ĐỂ GỬI BÌNH CHỌN:</Text>
            <ScrollView style={{ maxHeight: 150 }} showsVerticalScrollIndicator={false}>
              {myClubs.map((club) => {
                const isSelected = String(voteTargetClubId) === String(club.id);
                return (
                  <TouchableOpacity
                    key={club.id}
                    activeOpacity={0.88}
                    onPress={() => setVoteTargetClubId(club.id)}
                    style={[styles.clubCardItem, isSelected && styles.clubCardItemActive]}
                  >
                    <View style={styles.clubAvatarCircle}>
                      <Text style={styles.clubAvatarLetter}>{club.name?.charAt(0) || 'C'}</Text>
                    </View>
                    <Text style={[styles.clubCardName, { flex: 1 }, isSelected && styles.clubCardNameActive]}>
                      {club.name}
                    </Text>
                    <View style={[styles.radioOuterRing, isSelected && styles.radioOuterRingActive]}>
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.sheetSectionLabel}>XEM TRƯỚC NỘI DUNG BIỂU QUYẾT (POLL):</Text>
            <View style={styles.pollPreviewCard}>
              <Text style={styles.pollPreviewQuestion}>
                Kèo trận đấu: <Text style={{ fontWeight: '800', color: COLORS.primary }}>{booking.facilityName}</Text> ({booking.date} • {booking.startTime})
              </Text>
              <View style={styles.pollOptionBox}>
                <Ionicons name="checkmark-circle-outline" size={14} color="#16A34A" />
                <Text style={styles.pollOptionText}>1. Tham gia (Đồng ý đi ghép trận)</Text>
              </View>
              <View style={styles.pollOptionBox}>
                <Ionicons name="help-circle-outline" size={14} color="#D97706" />
                <Text style={styles.pollOptionText}>2. Phân vân / Cần xem lịch</Text>
              </View>
              <View style={styles.pollOptionBox}>
                <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
                <Text style={styles.pollOptionText}>3. Bận / Không đi được</Text>
              </View>
            </View>

            <View style={styles.sheetActionRow}>
              <TouchableOpacity
                onPress={() => setIsVoteModalVisible(false)}
                style={styles.sheetCancelBtn}
              >
                <Text style={styles.sheetCancelText}>Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={voteSending || !voteTargetClubId}
                onPress={handleSendVotePoll}
                style={[styles.voteSubmitBtn, (!voteTargetClubId || voteSending) && { opacity: 0.6 }]}
              >
                {voteSending ? (
                  <ActivityIndicator color={COLORS.onSecondary} size="small" />
                ) : (
                  <>
                    <Ionicons name="stats-chart" size={15} color={COLORS.onSecondary} />
                    <Text style={styles.voteSubmitText}>Đăng Biểu Quyết Ngay</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Project Custom Confirm / Alert Modal */}
      <CustomConfirmModal {...modalConfig} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  headerInner: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: 10,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 17,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  scrollContent: {
    padding: SPACING.marginMobile,
    paddingBottom: 110,
  },
  responsiveContainer: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    gap: SPACING.md,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  rankedBadge: {
    backgroundColor: '#FEF3C7',
  },
  friendlyBadge: {
    backgroundColor: '#E0F2FE',
  },
  typeText: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '800',
    fontSize: 11,
  },
  rankedText: {
    color: '#92400E',
  },
  friendlyText: {
    color: '#075985',
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  balanceText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 11,
  },
  venueTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontWeight: '900',
    color: COLORS.white,
    fontSize: 22,
  },
  heroMetaGroup: {
    gap: 4,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroMetaText: {
    ...TYPOGRAPHY.bodyMd,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12.5,
    flex: 1,
  },
  heroChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  heroChipText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 11.5,
  },
  heroChipGold: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  heroChipGoldText: {
    ...TYPOGRAPHY.labelSm,
    color: '#78350F',
    fontWeight: '800',
    fontSize: 11.5,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
  },
  timeBoxText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.08)',
    gap: SPACING.sm,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 16,
  },
  subtext: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: 4,
  },
  vsClubCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  clubAvatarHost: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  clubAvatarGuest: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0284C7',
  },
  clubAvatarText: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.white,
    fontWeight: '800',
  },
  vsClubName: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
    fontSize: 13,
  },
  vsLevelTag: {
    backgroundColor: 'rgba(6, 78, 59, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vsLevelText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 10,
  },
  vsEloText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  vsCrpText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  vsBadgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  vsText: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '900',
    color: COLORS.outline,
    fontSize: 12,
  },
  emptyGuestAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyGuestName: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
  },
  emptyGuestSub: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    color: COLORS.outline,
  },
  feeSplitBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: 8,
  },
  feeSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  feeSplitLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  feeSplitLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  feeSplitValue: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    color: '#B91C1C',
  },
  feeSplitValueHighlight: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    color: '#15803D',
    fontSize: 15,
  },
  paymentNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
    padding: 8,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 4,
  },
  paymentNoteText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11.5,
    color: COLORS.primary,
    flex: 1,
    lineHeight: 16,
  },
  noteText: {
    ...TYPOGRAPHY.bodyMd,
    fontStyle: 'italic',
    color: COLORS.onSurfaceVariant,
  },
  applicantSectionHeader: {
    gap: 2,
    marginBottom: 8,
  },
  applicantHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  applicantSubHint: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  applicantCardNew: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(6, 78, 59, 0.12)',
    padding: SPACING.md,
    gap: 10,
    marginTop: 8,
  },
  applicantHeaderNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  applicantAvatarNew: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: 'rgba(6, 78, 59, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applicantAvatarTextNew: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 17,
  },
  applicantInfoNew: {
    flex: 1,
    gap: 3,
  },
  applicantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  applicantNameNew: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    color: COLORS.onSurface,
    fontSize: 14.5,
    flex: 1,
  },
  levelBadgeMini: {
    backgroundColor: 'rgba(6, 78, 59, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  levelBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  applicantStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  statTagText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  applicantNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  applicantNoteText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11.5,
    fontStyle: 'italic',
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  applicantActionRowNew: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  rejectBtnNew: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectBtnTextNew: {
    ...TYPOGRAPHY.labelMd,
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 12.5,
  },
  acceptBtnNew: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptBtnTextNew: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 12.5,
  },
  pendingStatusBadgeNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  pendingStatusTextNew: {
    ...TYPOGRAPHY.labelMd,
    color: '#92400E',
    fontWeight: '800',
    fontSize: 11.5,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  bottomBarInner: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  hostBottomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 78, 59, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.full,
  },
  hostBottomBannerText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 12.5,
    flexShrink: 1,
  },
  pendingBottomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.full,
  },
  pendingBottomBannerText: {
    ...TYPOGRAPHY.labelMd,
    color: '#92400E',
    fontWeight: '900',
    fontSize: 12.5,
    flexShrink: 1,
  },
  matchedWaitingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#7DD3FC',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BORDER_RADIUS.full,
  },
  matchedWaitingText: {
    ...TYPOGRAPHY.labelMd,
    color: '#0369A1',
    fontWeight: '900',
    fontSize: 12.5,
    flexShrink: 1,
  },
  confirmScoreActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  scoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  resultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  actionBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 13.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: SPACING.lg,
    paddingBottom: 36,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  grabHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    color: COLORS.onSurface,
    fontSize: 16.5,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetHostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.default,
  },
  targetHostText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12.5,
    color: COLORS.onSurface,
  },
  sheetSectionLabel: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '900',
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    letterSpacing: 0.6,
    marginTop: 4,
  },
  clubListScroll: {
    maxHeight: 220,
  },
  clubCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  clubCardItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(6, 78, 59, 0.04)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  clubAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  clubAvatarLetter: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 18,
  },
  clubCardName: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 14,
  },
  clubCardNameActive: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  clubMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eloBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  eloBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: '#92400E',
    fontWeight: '800',
    fontSize: 10.5,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  memberBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: '#0369A1',
    fontWeight: '800',
    fontSize: 10.5,
  },
  radioOuterRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterRingActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  radioInnerDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: COLORS.secondary,
  },
  sheetTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    fontSize: 13,
    color: COLORS.onSurface,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  sheetActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  sheetCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  sheetCancelText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    fontWeight: '800',
    fontSize: 14,
  },
  sheetSubmitBtn: {
    flex: 1.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sheetSubmitText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 14,
  },
  pollPreviewCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    gap: 8,
  },
  pollPreviewQuestion: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12.5,
    color: '#78350F',
    lineHeight: 18,
  },
  pollOptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#FCD34D',
    padding: 8,
    borderRadius: BORDER_RADIUS.sm,
  },
  pollOptionText: {
    ...TYPOGRAPHY.labelSm,
    color: '#92400E',
    fontWeight: '700',
    fontSize: 11.5,
  },
  voteSubmitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  voteSubmitText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSecondary,
    fontWeight: '900',
    fontSize: 14.5,
  },
});
