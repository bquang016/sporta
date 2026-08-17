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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useMatchDetail } from '../../../../features/matchmaking/model/useMatchmaking';

export function MatchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { room, loading, requestJoin, acceptRequest, submitScore, confirmScore } = useMatchDetail(id as string);

  const [requesting, setRequesting] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);

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

  const handleSendRequest = async () => {
    setRequesting(true);
    try {
      await requestJoin('club-beta', 'CLB Beta United mong muốn ghép trận!');
      Alert.alert('Đã gửi yêu cầu ghép trận! 🎉', 'Vui lòng chờ Chủ room chấp nhận.');
    } catch (e: any) {
      Alert.alert('Không thể gửi yêu cầu', e.message || 'Lỗi gửi yêu cầu');
    } finally {
      setRequesting(false);
    }
  };

  const handleAcceptApplicant = async (reqId: string, clubName: string) => {
    Alert.alert(
      'Xác nhận chốt trận',
      `Bạn có chắc chắn muốn chọn CLB ${clubName} làm đối thủ thi đấu?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chấp nhận',
          onPress: async () => {
            await acceptRequest(reqId);
            Alert.alert('Chốt trận thành công! ⚽', 'Trận đấu đã chuyển sang trạng thái MATCHED.');
          },
        },
      ]
    );
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Bài Ghép Kèo</Text>
        <TouchableOpacity onPress={() => {}} style={styles.headerIconBtn}>
          <Ionicons name="share-social-outline" size={20} color={COLORS.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                <Ionicons name="flash" size={12} color={COLORS.primary} />
                <Text style={styles.balanceText}>{room.balanceLabel}</Text>
              </View>
            )}
          </View>

          <Text style={styles.venueTitle}>{booking.facilityName}</Text>
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
          <Text style={styles.sectionTitle}>Chi Phí Sân & Tỉ Lệ Chia</Text>
          <Text style={styles.subtext}>Tổng giá trị tiền sân: {booking.totalPrice.toLocaleString('vi-VN')}đ</Text>

          <View style={styles.feeSplitBox}>
            <View style={styles.feeSplitRow}>
              <Text style={styles.feeSplitLabel}>Chủ sân ({host.name}):</Text>
              <Text style={styles.feeSplitValue}>{room.hostSharePercent}%</Text>
            </View>

            <View style={styles.feeSplitRow}>
              <Text style={styles.feeSplitLabel}>Đối thủ cần trả trực tiếp:</Text>
              <Text style={styles.feeSplitValueHighlight}>
                {room.guestSharePercent}% (~{room.guestShareAmount.toLocaleString('vi-VN')}đ)
              </Text>
            </View>

            <View style={styles.paymentNoteBox}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.paymentNoteText}>
                Đội đối thủ sẽ <Text style={{ fontWeight: '800' }}>thanh toán trực tiếp</Text> cho Chủ sân khi gặp nhau thi đấu.
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

            {room.applicants.map((req) => (
              <View key={req.id} style={styles.applicantCard}>
                <View style={styles.applicantHeader}>
                  <View style={styles.applicantAvatar}>
                    <Text style={styles.applicantAvatarText}>{req.applicantClub.name.charAt(4)}</Text>
                  </View>

                  <View style={styles.applicantInfo}>
                    <Text style={styles.applicantName}>{req.applicantClub.name}</Text>
                    <Text style={styles.applicantMeta}>
                      {req.applicantClub.levelLabel} • {req.applicantClub.clubElo} Elo • {req.applicantClub.activeMemberCount} thành viên
                    </Text>
                  </View>
                </View>

                {req.note && <Text style={styles.applicantNote}>"{req.note}"</Text>}

                {req.status === 'PENDING' && (
                  <View style={styles.applicantActionRow}>
                    <TouchableOpacity
                      onPress={() => Alert.alert('Đã từ chối')}
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
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Role-Based Bottom Bar */}
      <View style={styles.bottomBar}>
        {room.status === 'OPEN' && (
          <TouchableOpacity
            disabled={requesting}
            activeOpacity={0.88}
            onPress={handleSendRequest}
            style={styles.actionBtn}
          >
            {requesting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.actionBtnText}>Gửi yêu cầu ghép trận ngay</Text>
                <Ionicons name="paper-plane-outline" size={18} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
        )}

        {(room.status === 'MATCHED' || room.status === 'SCORE_PENDING' || room.status === 'SCORE_CONFIRMING') && (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push(`/matchmaking/${room.id}/score` as any)}
            style={styles.scoreBtn}
          >
            <Ionicons name="trophy-outline" size={20} color={COLORS.white} />
            <Text style={styles.actionBtnText}>
              {room.status === 'MATCHED' ? 'Nhập tỷ số trận đấu' : 'Xem & Xác nhận tỷ số'}
            </Text>
          </TouchableOpacity>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
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
    gap: SPACING.md,
    paddingBottom: 110,
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
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
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
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  feeSplitValueHighlight: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    color: COLORS.primary,
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
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
});
