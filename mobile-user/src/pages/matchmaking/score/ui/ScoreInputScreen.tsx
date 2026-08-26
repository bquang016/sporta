import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useMatchDetail } from '../../../../features/matchmaking/model/useMatchmaking';
import { ScoreInputForm } from '../../../../features/matchmaking/ui/ScoreInputForm';
import { CustomConfirmModal } from '../../../../shared/ui/CustomConfirmModal';

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
  const { room, loading, submitScore, confirmScore } = useMatchDetail(id as string);

  const [submitting, setSubmitting] = useState<boolean>(false);

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
          <Text style={styles.loadingText}>Đang tải trang nhập tỷ số...</Text>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảng Điểm Trận Đấu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.responsiveContainer}>
          {/* Stadium Header Info Card */}
          <View style={styles.stadiumCard}>
            <View style={styles.stadiumBadgeRow}>
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveTagText}>CẬP NHẬT TỶ SỐ SÂN BÃI</Text>
              </View>
              <Text style={styles.stadiumSport}>{room.booking.sportName} • {room.booking.format}</Text>
            </View>

            <Text style={styles.stadiumName} numberOfLines={1}>{room.booking.facilityName}</Text>
            <Text style={styles.stadiumTime}>{room.booking.date} • {room.booking.startTime} - {room.booking.endTime}</Text>

            <View style={styles.teamVsRow}>
              <Text style={styles.teamVsName} numberOfLines={1}>{room.hostClub.name}</Text>
              <View style={styles.vsBadge}><Text style={styles.vsText}>VS</Text></View>
              <Text style={styles.teamVsName} numberOfLines={1}>{room.guestClub?.name || 'Đội bạn'}</Text>
            </View>
          </View>

          {/* Form Nhập tỷ số - CHỈ CHỦ ROOM (BÊN A) ĐƯỢC NHẬP */}
          {room.status === 'MATCHED' && !submission && (
            !isMatchTimeStarted(room.booking.date, room.booking.startTime) ? (
              <View style={styles.confirmCard}>
                <Ionicons name="time-outline" size={36} color="#D97706" />
                <Text style={styles.confirmTitle}>CHƯA ĐẾN GIỜ THI ĐẤU</Text>
                <Text style={styles.confirmSub}>
                  Trận đấu diễn ra vào lúc <Text style={{ fontWeight: '800', color: COLORS.primary }}>{room.booking.date} • {room.booking.startTime}</Text>. Bạn chỉ có thể cập nhật tỷ số sau khi trận đấu bắt đầu.
                </Text>
              </View>
            ) : room.permissions?.canEnterScore ? (
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
                <Ionicons name="trophy-outline" size={24} color={COLORS.primary} />
                <Text style={styles.confirmTitle}>XÁC NHẬN KẾT QUẢ TRẬN ĐẤU</Text>
              </View>
              <Text style={styles.confirmSub}>
                Đại diện Chủ room <Text style={{ fontWeight: '800', color: COLORS.primary }}>{room.hostClub.name}</Text> đã đề xuất tỷ số:
              </Text>

              {/* Score Display Box */}
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
                  >
                    {submitting ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <>
                        <View style={styles.trophyIconBg}>
                          <Ionicons name="trophy" size={18} color={COLORS.secondary} />
                        </View>
                        <Text style={styles.confirmScoreText}>DUYỆT & XÁC NHẬN TỶ SỐ TRẬN ĐẤU</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.waitingGuestBox}>
                  <Ionicons name="time-outline" size={20} color="#92400E" />
                  <Text style={styles.waitingGuestText}>
                    Tỷ số đã được gửi thành công! Đang chờ đối thủ Bên B ({room.guestClub?.name || 'Đối thủ'}) phê duyệt & xác nhận.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Project Custom Alert / Confirm Modal */}
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
    paddingBottom: 40,
  },
  responsiveContainer: {
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
    gap: SPACING.md,
  },
  stadiumCard: {
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
  stadiumBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
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
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 10,
  },
  stadiumSport: {
    ...TYPOGRAPHY.labelSm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '700',
  },
  stadiumName: {
    ...TYPOGRAPHY.headlineMd,
    fontWeight: '900',
    color: COLORS.white,
    fontSize: 19,
  },
  stadiumTime: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  teamVsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: 4,
  },
  teamVsName: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    color: COLORS.white,
    fontSize: 13,
    flex: 1,
    textAlign: 'center',
  },
  vsBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    marginHorizontal: 6,
  },
  vsText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSecondary,
    fontWeight: '900',
    fontSize: 10,
  },
  confirmCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.08)',
    gap: SPACING.sm,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '900',
    color: COLORS.onSurface,
    fontSize: 16,
  },
  confirmSub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
  scoreboardBox: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  scoreboardText: {
    ...TYPOGRAPHY.headlineXl,
    fontWeight: '900',
    color: COLORS.primary,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: 2,
  },
  scoreboardDetails: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
    fontWeight: '700',
    fontSize: 12,
  },
  confirmQuestion: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    fontSize: 12.5,
    marginBottom: 8,
  },
  confirmBtnRow: {
    width: '100%',
    marginTop: 8,
  },
  confirmScoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  trophyIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(254, 208, 27, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmScoreText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 13.5,
    letterSpacing: 0.4,
  },
  waitingGuestBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    padding: 12,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: 8,
    width: '100%',
  },
  waitingGuestText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12.5,
    color: '#78350F',
    flex: 1,
    lineHeight: 18,
  },
});
