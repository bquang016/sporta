import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useMatchDetail } from '../../../../features/matchmaking/model/useMatchmaking';
import { ScoreInputForm } from '../../../../features/matchmaking/ui/ScoreInputForm';
import { CustomConfirmModal } from '../../../../shared/ui/CustomConfirmModal';
import { DevMatchTestPanel } from '../../../../features/matchmaking/ui/DevMatchTestPanel';
import { usersApi, UserProfileDto } from '../../../../shared/api/users';

function isMatchTimeStarted(dateStr?: string, startTimeStr?: string): boolean {
  if (!dateStr || !startTimeStr) return true;
  try {
    const timeParts = startTimeStr.split(':');
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;

    const numbers = dateStr.match(/\d+/g);
    if (!numbers || numbers.length < 3) return true;

    let year = 0;
    let month = 0;
    let day = 0;
    if (numbers[0].length === 4) {
      year = parseInt(numbers[0], 10);
      month = parseInt(numbers[1], 10) - 1;
      day = parseInt(numbers[2], 10);
    } else if (numbers[2].length === 4) {
      day = parseInt(numbers[0], 10);
      month = parseInt(numbers[1], 10) - 1;
      year = parseInt(numbers[2], 10);
    } else {
      return true;
    }

    const matchStart = new Date(year, month, day, hours, minutes);
    return new Date().getTime() >= matchStart.getTime();
  } catch {
    return true;
  }
}

export function ScoreInputScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { room, loading, refetch, submitScore, confirmScore } = useMatchDetail(id as string);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfileDto | null>(null);

  React.useEffect(() => {
    usersApi.getProfile().then(setCurrentUser).catch(() => {});
  }, []);

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
      confirmText: 'Đã hiểu',
      onConfirm: () => {
        setModalConfig((prev) => ({ ...prev, visible: false }));
        if (onClose) onClose();
      },
    });
  };

  if (loading || !room) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải bảng điểm...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmitScore = async (hostScore: number | string, guestScore: number | string, details?: string) => {
    setSubmitting(true);
    try {
      await submitScore(hostScore, guestScore, details);
      showAlert(
        'Đã gửi tỷ số trận đấu',
        'Tỷ số đã được gửi tới đối thủ (Bên B). Trận đấu sẽ chính thức hoàn tất sau khi Bên B phê duyệt và xác nhận.',
        'success',
        () => router.replace(`/matchmaking/${room.id}` as any)
      );
    } catch (e: any) {
      showAlert('Lỗi', e.message || 'Không thể gửi tỷ số', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmScore = async () => {
    setSubmitting(true);
    try {
      await confirmScore();
      showAlert(
        'Hoàn tất trận đấu',
        'Kết quả đã được xác nhận và cập nhật điểm CRP.',
        'success',
        () => router.replace(`/matchmaking/${room.id}/result` as any)
      );
    } catch (e: any) {
      showAlert('Lỗi', e.message || 'Không thể xác nhận kết quả', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const submission = room.scoreSubmission;
  const host = room.hostClub;
  const guest = room.guestClub;
  const hostAvatar = host.avatarUrl || host.logoUrl || (host as any).avatarImage;
  const guestAvatar = guest?.avatarUrl || guest?.logoUrl || (guest as any)?.avatarImage;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace((room ? `/matchmaking/${room.id}` : '/matchmaking') as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảng Điểm Trận Đấu</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveContainer}>
          {/* ── [DEV] Tester Control Panel ── */}
          {(currentUser?.isDevTester || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') && (
            <DevMatchTestPanel room={room} onRefresh={refetch} />
          )}

          {/* Match Info Summary Card */}
          <View style={styles.stadiumCard}>
            <View style={styles.stadiumBadgeRow}>
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveTagText}>TỶ SỐ TRỰC TIẾP</Text>
              </View>
              <Text style={styles.stadiumSport}>{room.booking.sportName} • {room.booking.format}</Text>
            </View>

            <Text style={styles.stadiumName} numberOfLines={1}>{room.booking.facilityName}</Text>
            <Text style={styles.stadiumTime}>{room.booking.date} • {room.booking.startTime} - {room.booking.endTime}</Text>

            <View style={styles.teamVsRow}>
              <View style={styles.teamVsCol}>
                <View style={styles.teamAvatarWrap}>
                  {hostAvatar ? (
                    <Image source={{ uri: hostAvatar }} style={styles.teamAvatar} resizeMode="cover" />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarText}>{(host.name || 'A').charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.teamVsName} numberOfLines={1}>{host.name}</Text>
              </View>

              <View style={styles.vsBadge}><Text style={styles.vsText}>VS</Text></View>

              <View style={styles.teamVsCol}>
                <View style={styles.teamAvatarWrap}>
                  {guestAvatar ? (
                    <Image source={{ uri: guestAvatar }} style={styles.teamAvatar} resizeMode="cover" />
                  ) : (
                    <View style={[styles.avatarFallback, { backgroundColor: '#0284C7' }]}>
                      <Text style={styles.avatarText}>{(guest?.name || 'B').charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.teamVsName} numberOfLines={1}>{guest?.name || 'Đội bạn'}</Text>
              </View>
            </View>
          </View>

          {/* Form Nhập tỷ số - CHỈ CHỦ ROOM (BÊN A) ĐƯỢC NHẬP */}
          {room.status === 'MATCHED' && !submission && (
            (!currentUser?.isDevTester && !isMatchTimeStarted(room.booking.date, room.booking.startTime)) ? (
              <View style={styles.confirmCard}>
                <Ionicons name="time-outline" size={36} color="#D97706" />
                <Text style={styles.confirmTitle}>CHƯA ĐẾN GIỜ THI ĐẤU</Text>
                <Text style={styles.confirmSub}>
                  Trận đấu diễn ra vào lúc <Text style={{ fontWeight: '800', color: COLORS.primary }}>{room.booking.date} • {room.booking.startTime}</Text>. Bạn chỉ có thể cập nhật tỷ số sau khi trận đấu bắt đầu.
                </Text>
              </View>
            ) : (room.permissions?.canEnterScore || currentUser?.isDevTester) ? (
              <ScoreInputForm room={room} onSubmitScore={handleSubmitScore} />
            ) : (
              <View style={styles.confirmCard}>
                <Ionicons name="time-outline" size={36} color={COLORS.primary} />
                <Text style={styles.confirmTitle}>ĐANG CHỜ CHỦ ROOM NHẬP TỶ SỐ</Text>
                <Text style={styles.confirmSub}>
                  Chủ room đại diện <Text style={{ fontWeight: '800', color: COLORS.primary }}>{room.hostClub.name}</Text> chịu trách nhiệm nhập và gửi tỷ số trận đấu. Sau khi Chủ room gửi, bạn (Bên B) sẽ thực hiện phê duyệt.
                </Text>
              </View>
            )
          )}

          {/* View Phê Duyệt / Xác nhận Tỷ số */}
          {(room.status === 'SCORE_CONFIRMING' || submission) && (
            <View style={styles.confirmCard}>
              <View style={styles.confirmHeader}>
                <Ionicons name="trophy" size={24} color="#D97706" />
                <Text style={styles.confirmTitle}>XÁC NHẬN KẾT QUẢ TRẬN ĐẤU</Text>
              </View>
              <Text style={styles.confirmSub}>
                Đại diện Chủ room <Text style={{ fontWeight: '800', color: COLORS.primary }}>{room.hostClub.name}</Text> đã đề xuất tỷ số:
              </Text>

              {/* Scoreboard Box */}
              <View style={styles.scoreboardBox}>
                <Text style={styles.scoreboardText}>
                  {submission?.hostScore ?? 3} — {submission?.guestScore ?? 2}
                </Text>
                {submission?.rawScoreDetails && (
                  <Text style={styles.scoreboardDetails}>{submission.rawScoreDetails}</Text>
                )}
              </View>

              {room.permissions?.canConfirmScore ? (
                <View style={styles.confirmBtnRow}>
                  <Text style={styles.confirmQuestion}>Bạn là đại diện Bên B ({room.guestClub?.name}). Bấm nút bên dưới để duyệt kết quả và tính điểm CRP:</Text>
                  <TouchableOpacity
                    disabled={submitting}
                    onPress={handleConfirmScore}
                    style={styles.confirmScoreBtn}
                    activeOpacity={0.88}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                        <Text style={styles.confirmScoreText}>DUYỆT & XÁC NHẬN TỶ SỐ</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.waitingGuestBox}>
                  <Ionicons name="hourglass-outline" size={18} color="#B45309" />
                  <Text style={styles.waitingGuestText}>
                    Đã gửi tỷ số • Đang chờ Bên B ({room.guestClub?.name || 'Đối thủ'}) xác nhận
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Project Custom Confirm / Alert Modal */}
      <CustomConfirmModal {...modalConfig} />
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
    paddingBottom: 40,
  },
  responsiveContainer: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    gap: SPACING.md,
  },
  stadiumCard: {
    backgroundColor: '#064E3B',
    padding: 16,
    borderRadius: BORDER_RADIUS.xl,
    gap: 8,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  stadiumBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveTagText: {
    ...TYPOGRAPHY.labelSm,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 10,
  },
  stadiumSport: {
    ...TYPOGRAPHY.labelSm,
    color: '#FDE68A',
    fontWeight: '700',
    fontSize: 11,
  },
  stadiumName: {
    ...TYPOGRAPHY.titleLg,
    fontWeight: '900',
    color: '#FFFFFF',
    fontSize: 18,
  },
  stadiumTime: {
    ...TYPOGRAPHY.bodyMd,
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12.5,
  },
  teamVsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
  },
  teamVsCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamAvatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  teamAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  teamVsName: {
    ...TYPOGRAPHY.titleSm,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12.5,
    flex: 1,
  },
  vsBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginHorizontal: 8,
  },
  vsText: {
    color: '#FDE68A',
    fontWeight: '900',
    fontSize: 11,
  },
  confirmCard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 16,
    textAlign: 'center',
  },
  confirmSub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  scoreboardBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 4,
  },
  scoreboardText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  scoreboardDetails: {
    ...TYPOGRAPHY.bodySm,
    color: '#64748B',
    fontSize: 11.5,
    marginTop: 4,
  },
  confirmBtnRow: {
    width: '100%',
    gap: 8,
    marginTop: 4,
  },
  confirmQuestion: {
    ...TYPOGRAPHY.bodySm,
    color: '#475569',
    textAlign: 'center',
    fontSize: 12,
  },
  confirmScoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmScoreText: {
    ...TYPOGRAPHY.titleSm,
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  waitingGuestBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
    justifyContent: 'center',
  },
  waitingGuestText: {
    ...TYPOGRAPHY.labelMd,
    color: '#B45309',
    fontWeight: '700',
    fontSize: 12,
  },
});
