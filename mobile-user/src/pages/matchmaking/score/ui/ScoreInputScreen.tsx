import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useMatchDetail } from '../../../../features/matchmaking/model/useMatchmaking';
import { ScoreInputForm } from '../../../../features/matchmaking/ui/ScoreInputForm';
import { CustomConfirmModal } from '../../../../shared/ui/CustomConfirmModal';
import { DevMatchTestPanel } from '../../../../features/matchmaking/ui/DevMatchTestPanel';
import { UserAvatar } from '../../../../shared/ui/UserAvatar';
import { usersApi, UserProfileDto, isDevUser } from '../../../../shared/api/users';

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
  const { room, loading, refetch, submitScore, confirmScore, disagreeScore } = useMatchDetail(id as string);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfileDto | null>(null);

  // Dispute Modal state
  const [isDisputeModalVisible, setIsDisputeModalVisible] = useState<boolean>(false);
  const [disputeReasonCode, setDisputeReasonCode] = useState<string>('INCORRECT_SCORE');
  const [disputeDescription, setDisputeDescription] = useState<string>('');
  const [disputeLoading, setDisputeLoading] = useState<boolean>(false);

  useEffect(() => {
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
      onCancel: () => setModalConfig((prev) => ({ ...prev, visible: false })),
    });
  };

  if (loading || !room) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin trận đấu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmitScore = async (hostScore: number | string, guestScore: number | string, details?: string) => {
    setSubmitting(true);
    try {
      await submitScore(hostScore, guestScore, details);
      showAlert(
        'Đã gửi tỷ số',
        'Tỷ số đã được gửi tới đối thủ. Kết quả sẽ được ghi nhận sau khi đối thủ xác nhận.',
        'success',
        () => refetch()
      );
    } catch (e: any) {
      showAlert('Lỗi', e.message || 'Không thể gửi tỷ số', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmScore = async () => {
    showConfirm(
      'Xác nhận kết quả',
      'Bạn đồng ý với tỷ số này và muốn chốt kết quả trận đấu?',
      async () => {
        setSubmitting(true);
        try {
          await confirmScore();
          showAlert(
            'Thành công',
            'Kết quả trận đấu đã được xác nhận.',
            'success',
            () => router.replace(`/matchmaking/${room.id}/result` as any)
          );
        } catch (e: any) {
          showAlert('Lỗi', e.message || 'Không thể xác nhận kết quả', 'danger');
        } finally {
          setSubmitting(false);
        }
      },
      'success',
      'Xác nhận',
      'Quay lại'
    );
  };

  const handleSubmitDispute = async () => {
    if (!disagreeScore) return;
    setDisputeLoading(true);
    try {
      await disagreeScore(disputeReasonCode, disputeDescription);
      setIsDisputeModalVisible(false);
      showAlert(
        'Đã gửi phản hồi',
        'Khiếu nại về tỷ số đã được ghi nhận.',
        'warning',
        () => refetch()
      );
    } catch (e: any) {
      showAlert('Lỗi', e.message || 'Không thể gửi khiếu nại', 'danger');
    } finally {
      setDisputeLoading(false);
    }
  };

  const submission = room.scoreSubmission;
  const host = room.hostClub;
  const guest = room.guestClub;
  const hostAvatarUri = host?.avatarUrl || host?.logoUrl || (host as any)?.avatarImage;
  const guestAvatarUri = guest?.avatarUrl || guest?.logoUrl || (guest as any)?.avatarImage;

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
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhập tỷ số trận đấu</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.headerIconBtn} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveContainer}>
          {/* [DEV] Tester Control Panel */}
          {isDevUser(currentUser) && (
            <DevMatchTestPanel room={room} onRefresh={refetch} />
          )}

          {/* Match Summary Card */}
          <View style={styles.matchSummaryCard}>
            <View style={styles.summaryTopRow}>
              <View style={styles.sportBadge}>
                <Text style={styles.sportBadgeText}>{room.booking.sportName} • {room.booking.format}</Text>
              </View>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {room.matchType === 'RANKED' ? 'Xếp hạng CRP' : 'Giao hữu'}
                </Text>
              </View>
            </View>

            <Text style={styles.venueName} numberOfLines={1}>{room.booking.facilityName}</Text>
            <Text style={styles.venueTime}>
              {room.booking.date} • {room.booking.startTime} - {room.booking.endTime}
            </Text>

            <View style={styles.teamsDividerRow}>
              <View style={styles.teamColMini}>
                <UserAvatar uri={hostAvatarUri} name={host.name} size={28} />
                <Text style={styles.teamNameMini} numberOfLines={1}>{host.name}</Text>
              </View>

              <Text style={styles.vsLabel}>vs</Text>

              <View style={[styles.teamColMini, { justifyContent: 'flex-end' }]}>
                <Text style={[styles.teamNameMini, { textAlign: 'right' }]} numberOfLines={1}>
                  {guest?.name || 'Đội bạn'}
                </Text>
                <UserAvatar uri={guestAvatarUri} name={guest?.name || 'B'} size={28} />
              </View>
            </View>
          </View>

          {/* STATE A: MATCHED & Not Submitted Yet */}
          {room.status === 'MATCHED' && !submission && (
            (!isDevUser(currentUser) && !isMatchTimeStarted(room.booking.date, room.booking.startTime)) ? (
              <View style={styles.cardInfo}>
                <Ionicons name="time-outline" size={24} color="#D97706" />
                <Text style={styles.cardInfoTitle}>Chưa đến giờ thi đấu</Text>
                <Text style={styles.cardInfoSub}>
                  Trận đấu diễn ra lúc {room.booking.date} ({room.booking.startTime}). Bạn có thể cập nhật tỷ số sau khi trận đấu bắt đầu.
                </Text>
              </View>
            ) : (room.permissions?.canEnterScore || isDevUser(currentUser)) ? (
              <ScoreInputForm room={room} onSubmitScore={handleSubmitScore} loading={submitting} />
            ) : (
              <View style={styles.cardInfo}>
                <Ionicons name="hourglass-outline" size={24} color="#0284C7" />
                <Text style={styles.cardInfoTitle}>Đang chờ chủ nhà nhập tỷ số</Text>
                <Text style={styles.cardInfoSub}>
                  Đại diện {room.hostClub.name} sẽ nhập tỷ số trận đấu. Sau khi gửi, bạn sẽ nhận được thông báo để xác nhận.
                </Text>
              </View>
            )
          )}

          {/* STATE B: SCORE_CONFIRMING (Submission exists) */}
          {(room.status === 'SCORE_CONFIRMING' || submission) && room.status !== 'RESULT_FINAL' && room.status !== 'DISPUTED' && (
            <View style={styles.confirmCard}>
              <Text style={styles.confirmHeading}>Xác nhận kết quả</Text>
              <Text style={styles.confirmSubtitle}>
                Chủ nhà ({room.hostClub.name}) đã gửi kết quả trận đấu:
              </Text>

              {/* Clean Score Box */}
              <View style={styles.cleanScoreBox}>
                <View style={styles.scoreSide}>
                  <Text style={styles.scoreClubName} numberOfLines={1}>{host.name}</Text>
                  <Text style={styles.scoreDigit}>{submission?.hostScore ?? 0}</Text>
                </View>

                <Text style={styles.scoreDash}>-</Text>

                <View style={styles.scoreSide}>
                  <Text style={styles.scoreClubName} numberOfLines={1}>{guest?.name || 'Đội bạn'}</Text>
                  <Text style={styles.scoreDigit}>{submission?.guestScore ?? 0}</Text>
                </View>
              </View>

              {submission?.rawScoreDetails ? (
                <Text style={styles.scoreDetailNote}>{submission.rawScoreDetails}</Text>
              ) : null}

              {/* Guest Actions */}
              {room.permissions?.canConfirmScore ? (
                <View style={styles.actionButtonGroup}>
                  <TouchableOpacity
                    disabled={submitting}
                    onPress={handleConfirmScore}
                    style={styles.btnPrimary}
                    activeOpacity={0.85}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.btnPrimaryText}>Xác nhận kết quả</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={submitting}
                    onPress={() => setIsDisputeModalVisible(true)}
                    style={styles.btnSecondary}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.btnSecondaryText}>Báo sai tỷ số</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.waitingBadge}>
                  <Ionicons name="time-outline" size={14} color="#64748B" />
                  <Text style={styles.waitingBadgeText}>
                    Đang chờ {room.guestClub?.name || 'đối thủ'} xác nhận
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* STATE C: DISPUTED */}
          {room.status === 'DISPUTED' && (
            <View style={styles.cardInfo}>
              <Ionicons name="alert-circle-outline" size={24} color="#DC2626" />
              <Text style={[styles.cardInfoTitle, { color: '#DC2626' }]}>Trận đấu có khiếu nại</Text>
              <Text style={styles.cardInfoSub}>
                Kết quả trận đấu đang được hai bên phản hồi lại. Vui lòng liên hệ ban quản trị nếu cần hỗ trợ.
              </Text>
            </View>
          )}

          {/* STATE D: RESULT_FINAL */}
          {room.status === 'RESULT_FINAL' && (
            <View style={styles.cardInfo}>
              <Ionicons name="checkmark-circle-outline" size={28} color="#059669" />
              <Text style={[styles.cardInfoTitle, { color: '#059669' }]}>Trận đấu đã hoàn tất</Text>
              <Text style={styles.cardInfoSub}>
                Kết quả và điểm số đã được ghi nhận chính thức.
              </Text>
              <TouchableOpacity
                style={styles.btnPrimaryCompact}
                onPress={() => router.replace(`/matchmaking/${room.id}/result` as any)}
              >
                <Text style={styles.btnPrimaryText}>Xem chi tiết kết quả</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Dispute Modal */}
      <Modal
        visible={isDisputeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDisputeModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsDisputeModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Báo sai tỷ số</Text>
                <Text style={styles.modalSubtitle}>Chọn lý do tỷ số không chính xác:</Text>

                <View style={styles.reasonOptionGroup}>
                  {[
                    { code: 'INCORRECT_SCORE', label: 'Tỷ số bị nhập sai' },
                    { code: 'WRONG_LINEUP', label: 'Sai đội hình thi đấu' },
                    { code: 'OTHER', label: 'Lý do khác' },
                  ].map((r) => (
                    <TouchableOpacity
                      key={r.code}
                      style={[styles.reasonOption, disputeReasonCode === r.code && styles.reasonOptionActive]}
                      onPress={() => setDisputeReasonCode(r.code)}
                    >
                      <Text style={[styles.reasonOptionText, disputeReasonCode === r.code && styles.reasonOptionTextActive]}>
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.modalInput}
                  placeholder="Ghi chú chi tiết (không bắt buộc)..."
                  placeholderTextColor="#94A3B8"
                  value={disputeDescription}
                  onChangeText={setDisputeDescription}
                  multiline
                  numberOfLines={2}
                />

                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    onPress={() => setIsDisputeModalVisible(false)}
                    style={styles.modalCancelBtn}
                  >
                    <Text style={styles.modalCancelText}>Hủy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={disputeLoading}
                    onPress={handleSubmitDispute}
                    style={styles.modalConfirmBtn}
                  >
                    {disputeLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.modalConfirmText}>Gửi báo cáo</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

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
    paddingVertical: 12,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
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
    fontSize: 13,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  responsiveContainer: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    gap: SPACING.md,
  },
  matchSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sportBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sportBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  typeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  venueName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  venueTime: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: '#64748B',
  },
  teamsDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6,
  },
  teamColMini: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamNameMini: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  vsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    paddingHorizontal: 8,
  },
  cardInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 6,
  },
  cardInfoTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  cardInfoSub: {
    ...TYPOGRAPHY.caption,
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  confirmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  confirmHeading: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  confirmSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: '#64748B',
  },
  cleanScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    gap: 16,
  },
  scoreSide: {
    alignItems: 'center',
    minWidth: 80,
  },
  scoreClubName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 2,
  },
  scoreDigit: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  scoreDash: {
    fontSize: 20,
    fontWeight: '700',
    color: '#94A3B8',
  },
  scoreDetailNote: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  actionButtonGroup: {
    gap: 8,
    marginTop: 4,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryCompact: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    marginTop: 6,
  },
  btnPrimaryText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnSecondary: {
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  waitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  waitingBadgeText: {
    fontSize: 12,
    color: '#64748B',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  reasonOptionGroup: {
    gap: 6,
  },
  reasonOption: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonOptionActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  reasonOptionText: {
    fontSize: 12.5,
    color: '#334155',
  },
  reasonOptionTextActive: {
    color: '#DC2626',
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    fontSize: 12.5,
    minHeight: 48,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 13,
    color: '#64748B',
  },
  modalConfirmBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
