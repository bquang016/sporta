import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useMatchDetail } from '../../../../features/matchmaking/model/useMatchmaking';
import { getJoinedClubsApi } from '../../../../shared/api/clubs';

export function MatchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { room, loading, requestJoin, acceptRequest, rejectRequest, submitScore, confirmScore } = useMatchDetail(id as string);

  const [requesting, setRequesting] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);

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
        Alert.alert(
          'Chưa có CLB nào',
          'Bạn cần tạo hoặc tham gia ít nhất 1 CLB để gửi yêu cầu ghép trận.',
          [
            { text: 'Đóng', style: 'cancel' },
            {
              text: 'Đến trang CLB',
              onPress: () => router.push('/(tabs)/club' as any),
            },
          ]
        );
        return;
      }

      // RULE 1: Cùng 1 CLB không thể ghép chung 1 trận được (Lọc bỏ CLB Host)
      const validClubs = clubs.filter((c: any) => String(c.id) !== String(host.id));
      if (validClubs.length === 0) {
        Alert.alert(
          'Không thể xin ghép trận với chính mình',
          `CLB duy nhất của bạn là "${host.name}" (Chủ room). Cùng 1 CLB không thể ghép chung 1 trận đấu được. Vui lòng tham gia thêm CLB khác để xin ghép.`,
          [
            { text: 'Đã hiểu', style: 'cancel' },
            { text: 'Đến trang CLB', onPress: () => router.push('/(tabs)/club' as any) },
          ]
        );
        return;
      }

      setMyClubs(validClubs);
      setSelectedClubId(validClubs[0]?.id || null);
      setIsJoinModalVisible(true);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể nạp danh sách CLB của bạn');
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleConfirmSendRequest = async () => {
    if (!selectedClubId) {
      Alert.alert('Vui lòng chọn CLB', 'Bạn cần chọn CLB bạn đại diện để gửi yêu cầu.');
      return;
    }
    setRequesting(true);
    try {
      await requestJoin(String(selectedClubId), requestNote || 'CLB của chúng tôi muốn xin ghép trận!');
      setIsJoinModalVisible(false);
      Alert.alert('Đã gửi yêu cầu ghép trận! 🎉', 'Vui lòng chờ Chủ room (Bên A) phê duyệt.');
    } catch (e: any) {
      Alert.alert('Không thể gửi yêu cầu', e.message || 'Lỗi gửi yêu cầu');
    } finally {
      setRequesting(false);
    }
  };

  const openVoteModal = async () => {
    setLoadingClubs(true);
    try {
      const clubs = await getJoinedClubsApi();
      if (!clubs || clubs.length === 0) {
        Alert.alert('Chưa gia nhập CLB', 'Bạn chưa tham gia CLB nào để chia sẻ bài ghép kèo biểu quyết.');
        return;
      }
      setMyClubs(clubs);
      setVoteTargetClubId(clubs[0]?.id || null);
      setIsVoteModalVisible(true);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể lấy danh sách CLB của bạn');
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleSendVotePoll = () => {
    setVoteSending(true);
    setTimeout(() => {
      setVoteSending(false);
      setIsVoteModalVisible(false);
      Alert.alert(
        'Đã gửi bài biểu quyết thành công! 🗳️',
        `Bài ghép kèo trận đấu tại ${booking.facilityName} (${booking.startTime}) đã được chia sẻ vào nhóm thảo luận của CLB. Các thành viên có thể vào bỏ phiếu bình chọn ngay!`
      );
    }, 600);
  };

  const handleAcceptApplicant = async (reqId: string, clubName: string) => {
    const doAccept = async () => {
      try {
        await acceptRequest(reqId);
        if (Platform.OS === 'web') {
          window.alert(`Chốt trận thành công với CLB ${clubName}! ⚽ Trận đấu đã chuyển sang trạng thái MATCHED.`);
        } else {
          Alert.alert('Chốt trận thành công! ⚽', 'Trận đấu đã chuyển sang trạng thái MATCHED.');
        }
      } catch (err: any) {
        if (Platform.OS === 'web') {
          window.alert('Không thể chấp nhận: ' + (err.message || 'Lỗi hệ thống'));
        } else {
          Alert.alert('Lỗi', err.message || 'Không thể chấp nhận yêu cầu');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Bạn có chắc chắn muốn chọn CLB ${clubName} làm đối thủ thi đấu?`)) {
        await doAccept();
      }
    } else {
      Alert.alert(
        'Xác nhận chốt trận',
        `Bạn có chắc chắn muốn chọn CLB ${clubName} làm đối thủ thi đấu?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Chấp nhận',
            onPress: doAccept,
          },
        ]
      );
    }
  };

  const handleRejectApplicant = async (reqId: string, clubName: string) => {
    const doReject = async () => {
      try {
        await rejectRequest(reqId);
        if (Platform.OS === 'web') {
          window.alert(`Đã từ chối yêu cầu ghép trận từ CLB ${clubName}.`);
        } else {
          Alert.alert('Đã từ chối', `Đã từ chối yêu cầu từ CLB ${clubName}.`);
        }
      } catch (err: any) {
        if (Platform.OS === 'web') {
          window.alert('Không thể từ chối: ' + (err.message || 'Lỗi hệ thống'));
        } else {
          Alert.alert('Lỗi', err.message || 'Không thể từ chối yêu cầu');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Bạn có chắc chắn muốn từ chối yêu cầu ghép trận từ CLB ${clubName}?`)) {
        await doReject();
      }
    } else {
      Alert.alert(
        'Từ chối yêu cầu',
        `Bạn có chắc chắn muốn từ chối yêu cầu ghép trận từ CLB ${clubName}?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Từ chối',
            style: 'destructive',
            onPress: doReject,
          },
        ]
      );
    }
  };

  const handleQuickFinishMatch = async () => {
    setSimulating(true);
    try {
      let reqId = room.applicants[0]?.id;
      if (room.status === 'OPEN') {
        if (!reqId) {
          const newReq = await requestJoin('club-beta', 'Tự động ghép trận');
          reqId = newReq?.id;
        }
        if (reqId) {
          await acceptRequest(reqId);
        }
      }

      await submitScore('3', '2');
      await confirmScore();
      router.push(`/matchmaking/${room.id}/result` as any);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể kết thúc trận đấu');
    } finally {
      setSimulating(false);
    }
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
          <TouchableOpacity onPress={() => {}} style={styles.headerIconBtn}>
            <Ionicons name="share-social-outline" size={20} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.responsiveContainer}>
          {/* DEMO TEST SIMULATOR CARD */}
          <View style={styles.simCard}>
            <View style={styles.simHeader}>
              <Ionicons name="construct-outline" size={18} color="#92400E" />
              <Text style={styles.simTitle}>Thử Nghiệm Ghép Trận & Chốt Điểm CRP</Text>
            </View>
            <Text style={styles.simDesc}>
              Dành cho bạn test thử luồng tạo trận từ tài khoản khác & chốt ngay kết quả xem thưởng CRP (+/-):
            </Text>

            <View style={styles.simBtnGrid}>
              <TouchableOpacity
                disabled={simulating}
                style={styles.simBtnPrimary}
                onPress={async () => {
                  setSimulating(true);
                  try {
                    await requestJoin('club-beta', 'CLB Beta United xin ghép trận!');
                    Alert.alert('Đã gửi yêu cầu ghép trận từ CLB Beta United thành công! ⚽');
                  } finally {
                    setSimulating(false);
                  }
                }}
              >
                <Text style={styles.simBtnText}>1. Gửi request ghép trận từ CLB Beta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={simulating}
                style={styles.simBtnSecondary}
                onPress={async () => {
                  setSimulating(true);
                  try {
                    let reqId = room.applicants[0]?.id;
                    if (!reqId) {
                      const newReq = await requestJoin('club-beta', 'Tự động ghép trận');
                      reqId = newReq?.id;
                    }
                    if (reqId) await acceptRequest(reqId);
                    router.push(`/matchmaking/${room.id}/score` as any);
                  } finally {
                    setSimulating(false);
                  }
                }}
              >
                <Text style={styles.simBtnText}>2. Chốt đối thủ & Mở form Nhập tỷ số</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={simulating}
                style={styles.simBtnGold}
                onPress={handleQuickFinishMatch}
              >
                {simulating ? (
                  <ActivityIndicator color="#78350F" />
                ) : (
                  <Text style={styles.simBtnGoldText}>🏁 3. KẾT THÚC TRẬN ĐẤU & XEM ĐIỂM CRP (+/-) NGAY</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Stadium Hero Banner Card */}
          <View style={styles.heroCard}>
            <View style={styles.badgeRow}>
              <View style={[styles.typeBadge, isRanked ? styles.rankedBadge : styles.friendlyBadge]}>
                <Text style={[styles.typeText, isRanked ? styles.rankedText : styles.friendlyText]}>
                  {isRanked ? '🏆 Trận Xếp hạng (Tích CRP)' : '🤝 Trận Giao hữu'}
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
            <Text style={styles.courtSubtitle}>
              {booking.courtName} • {booking.sportName} ({booking.format})
            </Text>

            <View style={styles.timeBox}>
              <Ionicons name="time-outline" size={16} color={COLORS.white} />
              <Text style={styles.timeBoxText}>
                {booking.date} • {booking.startTime} - {booking.endTime}
              </Text>
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

          {/* Fee Split Card */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Chi Phí Sân & Quy Tắc Thắng Trả Ít Hơn</Text>
            <Text style={styles.subtext}>Tổng giá trị tiền sân: {booking.totalPrice.toLocaleString('vi-VN')}đ</Text>

            <View style={styles.feeSplitBox}>
              <View style={styles.feeSplitRow}>
                <Text style={styles.feeSplitLabel}>🏆 Đội Thắng chỉ trả ({minSharePercent}%):</Text>
                <Text style={styles.feeSplitValueHighlight}>~{minAmount.toLocaleString('vi-VN')}đ</Text>
              </View>

              <View style={styles.feeSplitRow}>
                <Text style={styles.feeSplitLabel}>❌ Đội Thua trả phần còn lại ({maxSharePercent}%):</Text>
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
              <Text style={styles.sectionTitle}>Danh Sách Yêu Cầu Ghép Trận ({room.applicants.length})</Text>

              {room.applicants.map((req) => {
                const canManage = !!room.permissions?.canManageApplicants;
                return (
                  <View key={req.id} style={styles.applicantCard}>
                    <View style={styles.applicantHeader}>
                      <View style={styles.applicantAvatar}>
                        <Text style={styles.applicantAvatarText}>{req.applicantClub.name?.charAt(0) || 'B'}</Text>
                      </View>

                      <View style={styles.applicantInfo}>
                        <Text style={styles.applicantName}>{req.applicantClub.name}</Text>
                        <Text style={styles.applicantMeta}>
                          {req.applicantClub.levelLabel} • {req.applicantClub.clubElo || 1200} Elo • {req.applicantClub.activeMemberCount || 10} thành viên
                        </Text>
                      </View>
                    </View>

                    {req.note && <Text style={styles.applicantNote}>"{req.note}"</Text>}

                    {req.status === 'PENDING' && (
                      canManage ? (
                        <View style={styles.applicantActionRow}>
                          <TouchableOpacity
                            onPress={() => handleRejectApplicant(req.id, req.applicantClub.name)}
                            style={styles.rejectBtn}
                          >
                            <Text style={styles.rejectBtnText}>Từ chối</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleAcceptApplicant(req.id, req.applicantClub.name)}
                            style={styles.acceptBtn}
                          >
                            <Text style={styles.acceptBtnText}>Chấp nhận</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.pendingStatusBadge}>
                          <Ionicons name="time-outline" size={14} color="#D97706" />
                          <Text style={styles.pendingStatusText}>Đang chờ Chủ room (Bên A) phê duyệt ⏳</Text>
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

      {/* Role-Based Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarInner}>
          {room.status === 'OPEN' && (
            isHost ? (
              <View style={styles.hostBottomBanner}>
                <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
                <Text style={styles.hostBottomBannerText}>
                  {room.applicants.length > 0
                    ? `Bạn là Chủ room • Có ${room.applicants.length} CLB xin ghép (Duyệt ở danh sách trên)`
                    : 'Bạn là Chủ room • Phòng ghép đang mở và chờ đối thủ ⚽'}
                </Text>
              </View>
            ) : hasSentRequest ? (
              <View style={styles.pendingBottomBanner}>
                <Ionicons name="time" size={18} color="#92400E" />
                <Text style={styles.pendingBottomBannerText}>
                  Đã gửi yêu cầu ghép trận (Đang chờ Chủ room duyệt ⏳)
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
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Text style={styles.actionBtnText}>Gửi yêu cầu ghép trận ngay</Text>
                    <Ionicons name="paper-plane-outline" size={18} color={COLORS.white} />
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
                <Ionicons name="trophy-outline" size={20} color={COLORS.white} />
                <Text style={styles.actionBtnText}>🏆 Nhập tỷ số trận đấu (Chủ room)</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.matchedWaitingBanner}>
                <Ionicons name="time" size={18} color="#0369A1" />
                <Text style={styles.matchedWaitingText}>
                  Trận đấu đã chốt • Đang chờ Chủ room ({room.hostClub.name}) nhập tỷ số ⚽
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
                <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
                <Text style={styles.actionBtnText}>🏆 Duyệt & Xác nhận tỷ số (Bên B)</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.pendingBottomBanner}>
                <Ionicons name="hourglass" size={18} color="#92400E" />
                <Text style={styles.pendingBottomBannerText}>
                  Đã gửi tỷ số • Đang chờ Bên B ({room.guestClub?.name || 'Đối thủ'}) duyệt & xác nhận ⏳
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
              <Ionicons name="ribbon-outline" size={20} color={COLORS.white} />
              <Text style={styles.actionBtnText}>Xem Kết Quả & Thưởng CRP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 1. SELECT CLUB BOTTOM SHEET MODAL (Rule 1 Enforced) */}
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
            {/* Grab Handle */}
            <View style={styles.grabHandle} />

            {/* Header */}
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

            {/* Target Opponent Info Banner */}
            <View style={styles.targetHostBanner}>
              <Ionicons name="sparkles" size={16} color={COLORS.primary} />
              <Text style={styles.targetHostText}>
                Thách đấu với Chủ room: <Text style={{ fontWeight: '900', color: COLORS.primary }}>{host.name}</Text> ({host.levelLabel})
              </Text>
            </View>

            <Text style={styles.sheetSectionLabel}>CHỌN CLB CỦA BẠN (CÙNG CLB KHÔNG THỂ GHÉP CÙNG KÈO):</Text>

            {/* List of valid clubs */}
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
                          <Text style={styles.eloBadgeText}>🏆 {club.clubElo || 1200} Elo</Text>
                        </View>
                        <View style={styles.memberBadge}>
                          <Text style={styles.memberBadgeText}>👥 {club.activeMemberCount || 10} thành viên</Text>
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
                    <Text style={styles.sheetSubmitText}>Gửi Yêu Cầu Ghép Trận</Text>
                    <Ionicons name="send" size={16} color={COLORS.white} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 2. SHARE TO CLUB FOR VOTING BOTTOM SHEET MODAL (Rule 2) */}
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
                  <Ionicons name="stats-chart" size={18} color={COLORS.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Chia Sẻ Vào CLB Để Biểu Quyết 🗳️</Text>
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
                ⚽ Kèo trận đấu: <Text style={{ fontWeight: '800', color: COLORS.primary }}>{booking.facilityName}</Text> ({booking.date} • {booking.startTime})
              </Text>
              <View style={styles.pollOptionBox}>
                <Text style={styles.pollOptionText}>✅ 1. Tham gia (Đồng ý đi ghép trận)</Text>
              </View>
              <View style={styles.pollOptionBox}>
                <Text style={styles.pollOptionText}>🤔 2. Phân vân / Cần xem lịch</Text>
              </View>
              <View style={styles.pollOptionBox}>
                <Text style={styles.pollOptionText}>❌ 3. Bận / Không đi được</Text>
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
                    <Text style={styles.voteSubmitText}>Đăng Biểu Quyết Ngay 🗳️</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  simCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    gap: 8,
  },
  simHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  simTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: '#92400E',
    fontSize: 15,
  },
  simDesc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11.5,
    color: '#78350F',
    lineHeight: 16,
  },
  simBtnGrid: {
    gap: 6,
    marginTop: 4,
  },
  simBtnPrimary: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  simBtnSecondary: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#0284C7',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  simBtnGold: {
    backgroundColor: '#F59E0B',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  simBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontWeight: '800',
    fontSize: 12,
  },
  simBtnGoldText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 13,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    gap: 8,
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
  courtSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
    marginTop: 4,
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
    gap: 6,
  },
  feeSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeSplitLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
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
  applicantCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
    gap: 8,
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  applicantAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applicantAvatarText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '800',
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  applicantMeta: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  applicantNote: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.onSurfaceVariant,
  },
  applicantActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outline,
    alignItems: 'center',
  },
  rejectBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  acceptBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
  },
  pendingStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  pendingStatusText: {
    ...TYPOGRAPHY.labelSm,
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
    paddingVertical: SPACING.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  hostBottomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(6, 78, 59, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.full,
  },
  hostBottomBannerText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '900',
    fontSize: 13.5,
  },
  pendingBottomBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.full,
  },
  pendingBottomBannerText: {
    ...TYPOGRAPHY.labelMd,
    color: '#92400E',
    fontWeight: '900',
    fontSize: 13.5,
  },
  matchedWaitingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#7DD3FC',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.full,
  },
  matchedWaitingText: {
    ...TYPOGRAPHY.labelMd,
    color: '#0369A1',
    fontWeight: '900',
    fontSize: 13.5,
  },
  confirmScoreActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    paddingVertical: 14,
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
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 14,
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
    gap: 8,
    backgroundColor: '#D97706',
    paddingVertical: 14,
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
    fontSize: 15,
  },
  // Bottom sheet & Social Vote styles
  voteBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  voteBannerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteBannerTitle: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    color: '#065F46',
    fontSize: 14,
  },
  voteBannerDesc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11.5,
    color: '#047857',
    lineHeight: 16,
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
