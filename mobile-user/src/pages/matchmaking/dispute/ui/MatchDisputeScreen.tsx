import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useMatchDetail } from '../../../../features/matchmaking/model/useMatchmaking';
import { MatchmakingApiRepository } from '../../../../shared/api/matchmaking';
import { DisputeDetailVM } from '../../../../entities/match/model/match.types';
import { uploadImageApi } from '../../../../shared/api/upload';
import { UserAvatar } from '../../../../shared/ui/UserAvatar';
import { CustomConfirmModal } from '../../../../shared/ui/CustomConfirmModal';
import { usersApi, UserProfileDto } from '../../../../shared/api/users';

const DISPUTE_REASONS = [
  { code: 'INCORRECT_SCORE', label: 'Tỷ số bị nhập sai', icon: 'calculator-outline' },
  { code: 'WRONG_LINEUP', label: 'Sai đội hình thi đấu', icon: 'people-outline' },
  { code: 'NO_SHOW', label: 'Đối thủ vắng mặt / Bỏ trận', icon: 'walk-outline' },
  { code: 'CHEATING', label: 'Gian lận / Vi phạm điều lệ', icon: 'warning-outline' },
  { code: 'OTHER', label: 'Lý do khác', icon: 'ellipsis-horizontal-outline' },
];

export function MatchDisputeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { room, loading: roomLoading, refetch: refetchRoom, disagreeScore } = useMatchDetail(id as string);

  const [disputeDetail, setDisputeDetail] = useState<DisputeDetailVM | null>(null);
  const [loadingDispute, setLoadingDispute] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfileDto | null>(null);

  // Form State (for filing new dispute by Guest)
  const [selectedReason, setSelectedReason] = useState<string>('INCORRECT_SCORE');
  const [description, setDescription] = useState<string>('');
  const [evidenceUri, setEvidenceUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State (for counter-evidence by Host)
  const [counterNote, setCounterNote] = useState<string>('');
  const [counterEvidenceUri, setCounterEvidenceUri] = useState<string | null>(null);
  const [submittingCounter, setSubmittingCounter] = useState<boolean>(false);

  // Modal alert
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'danger' | 'success';
    confirmText?: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showAlert = (title: string, message: string, type: 'info' | 'warning' | 'danger' | 'success' = 'info', onClose?: () => void) => {
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

  const fetchDispute = useCallback(async () => {
    if (!id) return;
    setLoadingDispute(true);
    try {
      const data = await MatchmakingApiRepository.getDisputeDetail(id as string);
      setDisputeDetail(data);
    } catch {
      setDisputeDetail(null);
    } finally {
      setLoadingDispute(false);
    }
  }, [id]);

  useEffect(() => {
    usersApi.getProfile().then(setCurrentUser).catch(() => {});
    fetchDispute();
  }, [fetchDispute]);

  const handlePickImage = async (forCounter = false) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showAlert('Quyền truy cập', 'Cần cấp quyền truy cập thư viện ảnh để đính kèm bằng chứng.', 'warning');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selected = result.assets[0].uri;
      if (forCounter) {
        setCounterEvidenceUri(selected);
      } else {
        setEvidenceUri(selected);
      }
    }
  };

  const handleTakePhoto = async (forCounter = false) => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      showAlert('Quyền truy cập', 'Cần cấp quyền camera để chụp ảnh bằng chứng.', 'warning');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selected = result.assets[0].uri;
      if (forCounter) {
        setCounterEvidenceUri(selected);
      } else {
        setEvidenceUri(selected);
      }
    }
  };

  // 1. Submit Dispute by Guest B
  const handleSubmitDispute = async () => {
    if (!description.trim()) {
      showAlert('Thiếu thông tin', 'Vui lòng nhập mô tả chi tiết lý do khiếu nại để Admin đối chiếu.', 'warning');
      return;
    }

    setSubmitting(true);
    let uploadedUrl: string | undefined = undefined;

    try {
      if (evidenceUri) {
        setUploadingImage(true);
        uploadedUrl = await uploadImageApi(evidenceUri, 'general');
      }

      await disagreeScore(selectedReason, description.trim(), uploadedUrl);
      showAlert(
        'Đã gửi khiếu nại thành công',
        'Khiếu nại đã được chuyển thành Ticket cho Ban Quản Trị. Trận đấu đang tạm thời đóng băng điểm số. Bên A có 24 giờ để gửi bằng chứng đối chất.',
        'success',
        () => {
          refetchRoom();
          fetchDispute();
        }
      );
    } catch (e: any) {
      showAlert('Lỗi', e.message || 'Không thể gửi khiếu nại lúc này.', 'danger');
    } finally {
      setUploadingImage(false);
      setSubmitting(false);
    }
  };

  // 2. Submit Counter Evidence by Host A
  const handleSubmitCounterEvidence = async () => {
    if (!counterEvidenceUri) {
      showAlert('Thiếu bằng chứng', 'Vui lòng chụp hoặc chọn ảnh minh chứng đối chất của bạn.', 'warning');
      return;
    }

    setSubmittingCounter(true);
    try {
      setUploadingImage(true);
      const uploadedUrl = await uploadImageApi(counterEvidenceUri, 'general');
      await MatchmakingApiRepository.submitDisputeEvidence(id as string, uploadedUrl, counterNote.trim() || undefined);

      showAlert(
        'Đã gửi bằng chứng đối chất',
        'Bằng chứng của bạn đã được lưu và gửi tới Ban Quản Trị để đối chiếu phân xử.',
        'success',
        () => {
          refetchRoom();
          fetchDispute();
        }
      );
    } catch (e: any) {
      showAlert('Lỗi', e.message || 'Không thể gửi bằng chứng đối chất.', 'danger');
    } finally {
      setUploadingImage(false);
      setSubmittingCounter(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace((room ? `/matchmaking/${room.id}/score` : '/matchmaking') as any);
    }
  };

  if (roomLoading || !room) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin tranh chấp...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const host = room.hostClub;
  const guest = room.guestClub;
  const submission = room.scoreSubmission;
  const hostAvatarUri = host?.avatarUrl || host?.logoUrl || (host as any)?.avatarImage;
  const guestAvatarUri = guest?.avatarUrl || guest?.logoUrl || (guest as any)?.avatarImage;

  const isDisputed = room.status === 'DISPUTED' || Boolean(disputeDetail);
  const canSubmitHost = disputeDetail?.canSubmitHostEvidence;

  // Compute Remaining Hours for Deadline
  const getRemainingHours = () => {
    if (!disputeDetail?.counterEvidenceDeadline) return '24 giờ';
    try {
      const deadline = new Date(disputeDetail.counterEvidenceDeadline).getTime();
      const now = new Date().getTime();
      const diffMs = deadline - now;
      if (diffMs <= 0) return 'Đã hết hạn';
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours} giờ ${mins} phút`;
    } catch {
      return '24 giờ';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Khiếu nại & Phân xử tỷ số</Text>
        <TouchableOpacity onPress={() => { refetchRoom(); fetchDispute(); }} style={styles.headerIconBtn} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.responsiveContainer}>

            {/* Match Summary Card */}
            <View style={styles.matchSummaryCard}>
              <View style={styles.summaryTopRow}>
                <View style={styles.sportBadge}>
                  <Text style={styles.sportBadgeText}>{room.booking.sportName} • {room.booking.format}</Text>
                </View>
                <View style={[styles.statusBadge, isDisputed ? styles.statusDisputed : styles.statusConfirming]}>
                  <Text style={[styles.statusBadgeText, isDisputed ? styles.statusDisputedText : styles.statusConfirmingText]}>
                    {isDisputed ? 'Đang phân xử' : 'Chờ xác nhận'}
                  </Text>
                </View>
              </View>

              <Text style={styles.venueName} numberOfLines={1}>{room.booking.facilityName}</Text>
              <Text style={styles.venueTime}>
                {room.booking.date} • {room.booking.startTime} - {room.booking.endTime}
              </Text>

              {/* Submitted Score Summary Box */}
              <View style={styles.scoreRowMini}>
                <View style={styles.teamMini}>
                  <UserAvatar uri={hostAvatarUri} name={host.name} size={24} />
                  <Text style={styles.teamNameMini} numberOfLines={1}>{host.name}</Text>
                  <Text style={styles.scoreDigitMini}>{submission?.hostScore ?? 0}</Text>
                </View>
                <Text style={styles.vsDash}>-</Text>
                <View style={[styles.teamMini, { justifyContent: 'flex-end' }]}>
                  <Text style={styles.scoreDigitMini}>{submission?.guestScore ?? 0}</Text>
                  <Text style={[styles.teamNameMini, { textAlign: 'right' }]} numberOfLines={1}>
                    {guest?.name || 'Đội bạn'}
                  </Text>
                  <UserAvatar uri={guestAvatarUri} name={guest?.name || 'B'} size={24} />
                </View>
              </View>
            </View>

            {/* FREEZE WARNING BANNER */}
            <View style={styles.freezeNotice}>
              <Ionicons name="shield-outline" size={20} color="#0369A1" />
              <View style={{ flex: 1 }}>
                <Text style={styles.freezeNoticeTitle}>Đóng băng điểm số an toàn</Text>
                <Text style={styles.freezeNoticeSub}>
                  Khi trận đấu có khiếu nại, điểm ELO và CRP được đóng băng cho đến khi Ban Quản Trị kiểm tra và ra phán quyết chính thức.
                </Text>
              </View>
            </View>

            {/* CASE 1: MATCH ALREADY DISPUTED (Viewing existing dispute / Host Counter Evidence) */}
            {isDisputed && disputeDetail ? (
              <View style={styles.card}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <Text style={styles.sectionTitle}>Thông tin khiếu nại</Text>
                  <View style={styles.disputeStatusTag}>
                    <Text style={styles.disputeStatusTagText}>{disputeDetail.status === 'RESOLVED' ? 'Đã giải quyết' : 'Đang xử lý'}</Text>
                  </View>
                </View>

                {/* Dispute Details by Disputer */}
                <View style={styles.disputeInfoBox}>
                  <Text style={styles.infoLabel}>Bên khiếu nại:</Text>
                  <Text style={styles.infoValue}>CLB {disputeDetail.openedByClubName || guest?.name || 'Bên B'}</Text>

                  <Text style={[styles.infoLabel, { marginTop: 8 }]}>Lý do khiếu nại:</Text>
                  <Text style={styles.infoValueHighlight}>
                    {DISPUTE_REASONS.find((r) => r.code === disputeDetail.reasonCode)?.label || disputeDetail.reasonCode}
                  </Text>

                  {disputeDetail.description ? (
                    <>
                      <Text style={[styles.infoLabel, { marginTop: 8 }]}>Nội dung chi tiết:</Text>
                      <Text style={styles.infoValue}>{disputeDetail.description}</Text>
                    </>
                  ) : null}

                  {disputeDetail.guestEvidenceImageUrl ? (
                    <View style={{ marginTop: 10 }}>
                      <Text style={styles.infoLabel}>Ảnh minh chứng từ Bên B:</Text>
                      <Image source={{ uri: disputeDetail.guestEvidenceImageUrl }} style={styles.evidenceImagePreview} resizeMode="cover" />
                    </View>
                  ) : null}
                </View>

                {/* 24-HOUR COUNTDOWN & HOST COUNTER-EVIDENCE SECTION */}
                {disputeDetail.status === 'OPEN' && (
                  <View style={styles.counterSection}>
                    <View style={styles.deadlineBox}>
                      <Ionicons name="timer-outline" size={20} color="#B45309" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.deadlineTitle}>Thời hạn gửi bằng chứng đối chất:</Text>
                        <Text style={styles.deadlineTimer}>{getRemainingHours()}</Text>
                        <Text style={styles.deadlineSub}>
                          Nếu quá 24h Chủ nhà không gửi bằng chứng đối chất, Bên B sẽ được mặc định xử thắng 3-0 và Bên A bị trừ 10 CRP.
                        </Text>
                      </View>
                    </View>

                    {/* If Host already submitted evidence */}
                    {disputeDetail.hostHasSubmittedEvidence ? (
                      <View style={styles.submittedEvidenceBox}>
                        <View style={styles.submittedEvidenceHeader}>
                          <Ionicons name="checkmark-circle" size={18} color="#059669" />
                          <Text style={styles.submittedEvidenceTitle}>Chủ nhà đã gửi bằng chứng đối chất</Text>
                        </View>
                        {disputeDetail.hostEvidenceImageUrl && (
                          <Image source={{ uri: disputeDetail.hostEvidenceImageUrl }} style={styles.evidenceImagePreview} resizeMode="cover" />
                        )}
                        <Text style={styles.submittedEvidenceSub}>
                          Cả hai bên đã cung cấp đầy đủ thông tin. Ban Quản Trị đang tiến hành đối chiếu phân xử tại hệ thống Admin.
                        </Text>
                      </View>
                    ) : canSubmitHost ? (
                      /* Host Counter Evidence Form */
                      <View style={styles.counterFormBox}>
                        <Text style={styles.formHeading}>Gửi bằng chứng đối chất (Dành cho Chủ nhà A)</Text>

                        <TextInput
                          style={styles.textInput}
                          placeholder="Nhập giải trình hoặc ghi chú phản bác của bạn..."
                          placeholderTextColor="#94A3B8"
                          value={counterNote}
                          onChangeText={setCounterNote}
                          multiline
                          numberOfLines={3}
                        />

                        {counterEvidenceUri ? (
                          <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: counterEvidenceUri }} style={styles.pickedImagePreview} />
                            <TouchableOpacity
                              style={styles.removeImageBtn}
                              onPress={() => setCounterEvidenceUri(null)}
                            >
                              <Ionicons name="close-circle" size={22} color="#DC2626" />
                              <Text style={styles.removeImageText}>Xóa ảnh</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View style={styles.pickImageRow}>
                            <TouchableOpacity
                              style={styles.pickBtn}
                              onPress={() => handlePickImage(true)}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="images-outline" size={18} color="#0284C7" />
                              <Text style={styles.pickBtnText}>Chọn từ thư viện</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.pickBtn}
                              onPress={() => handleTakePhoto(true)}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="camera-outline" size={18} color="#0284C7" />
                              <Text style={styles.pickBtnText}>Chụp ảnh mới</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        <TouchableOpacity
                          disabled={submittingCounter || uploadingImage}
                          onPress={handleSubmitCounterEvidence}
                          style={styles.submitBtn}
                          activeOpacity={0.85}
                        >
                          {submittingCounter || uploadingImage ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                          ) : (
                            <Text style={styles.submitBtnText}>Gửi Bằng Chứng Đối Chất</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.waitingForHostBadge}>
                        <Ionicons name="hourglass-outline" size={16} color="#64748B" />
                        <Text style={styles.waitingForHostText}>
                          Đang chờ Chủ nhà gửi bằng chứng đối chất trong 24 giờ.
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* If Dispute is RESOLVED */}
                {disputeDetail.status === 'RESOLVED' && (
                  <View style={styles.resolvedBox}>
                    <Ionicons name="ribbon" size={24} color="#059669" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resolvedTitle}>Đã có phán quyết từ Admin</Text>
                      <Text style={styles.resolvedScore}>{disputeDetail.resolvedResultJson || '3 - 0'}</Text>
                      <Text style={styles.resolvedNote}>{disputeDetail.resolutionNote || 'Trận đấu đã hoàn tất phân xử.'}</Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              /* CASE 2: FILING A NEW DISPUTE (Guest B) */
              <View style={styles.card}>
                <Text style={styles.cardHeading}>Báo sai tỷ số & Khiếu nại trận đấu</Text>
                <Text style={styles.cardSubtitle}>
                  Chọn lý do khiếu nại và cung cấp ảnh chụp bằng chứng để Admin phân xử công tâm:
                </Text>

                {/* Reason Selection */}
                <Text style={styles.fieldLabel}>Lý do khiếu nại:</Text>
                <View style={styles.reasonList}>
                  {DISPUTE_REASONS.map((r) => {
                    const isSelected = selectedReason === r.code;
                    return (
                      <TouchableOpacity
                        key={r.code}
                        style={[styles.reasonCard, isSelected && styles.reasonCardActive]}
                        onPress={() => setSelectedReason(r.code)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={r.icon as any}
                          size={18}
                          color={isSelected ? '#DC2626' : '#64748B'}
                        />
                        <Text style={[styles.reasonCardText, isSelected && styles.reasonCardTextActive]}>
                          {r.label}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={18} color="#DC2626" style={{ marginLeft: 'auto' }} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Description input */}
                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Mô tả chi tiết sự việc:</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập diễn biến, tỷ số thực tế hoặc lý do cụ thể..."
                  placeholderTextColor="#94A3B8"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />

                {/* Photo Evidence Picker */}
                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Ảnh minh chứng (khuyên dùng):</Text>
                {evidenceUri ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: evidenceUri }} style={styles.pickedImagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => setEvidenceUri(null)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                      <Text style={styles.removeImageText}>Xóa ảnh này</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.pickImageRow}>
                    <TouchableOpacity
                      style={styles.pickBtn}
                      onPress={() => handlePickImage(false)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="images-outline" size={18} color="#0284C7" />
                      <Text style={styles.pickBtnText}>Thư viện ảnh</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.pickBtn}
                      onPress={() => handleTakePhoto(false)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="camera-outline" size={18} color="#0284C7" />
                      <Text style={styles.pickBtnText}>Chụp ảnh</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Penalty Warning Note */}
                <View style={styles.penaltyNotice}>
                  <Ionicons name="information-circle-outline" size={16} color="#DC2626" />
                  <Text style={styles.penaltyNoticeText}>
                    Lưu ý: Báo cáo sai sự thật hoặc tố cáo ác ý có thể bị phạt trừ 10 điểm CRP và xử phạt CLB.
                  </Text>
                </View>

                {/* Submit Action */}
                <TouchableOpacity
                  disabled={submitting || uploadingImage}
                  onPress={handleSubmitDispute}
                  style={styles.submitDangerBtn}
                  activeOpacity={0.85}
                >
                  {submitting || uploadingImage ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Gửi Khiếu Nại Lên Admin</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusDisputed: {
    backgroundColor: '#FEF2F2',
  },
  statusDisputedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  statusConfirming: {
    backgroundColor: '#FEF3C7',
  },
  statusConfirmingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  venueName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  venueTime: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: '#64748B',
  },
  scoreRowMini: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
  },
  teamMini: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamNameMini: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    maxWidth: 90,
  },
  scoreDigitMini: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 4,
  },
  vsDash: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    paddingHorizontal: 6,
  },
  freezeNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0F9FF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  freezeNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
  },
  freezeNoticeSub: {
    fontSize: 12,
    color: '#0284C7',
    lineHeight: 17,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  disputeStatusTag: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  disputeStatusTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  disputeInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
  },
  infoValueHighlight: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 2,
  },
  evidenceImagePreview: {
    width: '100%',
    height: 160,
    borderRadius: BORDER_RADIUS.md,
    marginTop: 6,
    backgroundColor: '#E2E8F0',
  },
  counterSection: {
    gap: 10,
    marginTop: 6,
  },
  deadlineBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  deadlineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  deadlineTimer: {
    fontSize: 16,
    fontWeight: '800',
    color: '#B45309',
    marginVertical: 2,
  },
  deadlineSub: {
    fontSize: 11.5,
    color: '#92400E',
    lineHeight: 16,
  },
  counterFormBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 8,
  },
  formHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  submittedEvidenceBox: {
    backgroundColor: '#ECFDF5',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 6,
  },
  submittedEvidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submittedEvidenceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  submittedEvidenceSub: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 17,
  },
  waitingForHostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  waitingForHostText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  resolvedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  resolvedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  resolvedScore: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  resolvedNote: {
    fontSize: 12,
    color: '#047857',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  reasonList: {
    gap: 6,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reasonCardActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  reasonCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  reasonCardTextActive: {
    color: '#DC2626',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    fontSize: 12.5,
    minHeight: 64,
    textAlignVertical: 'top',
    color: '#0F172A',
  },
  pickImageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
  },
  pickBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  pickedImagePreview: {
    width: '100%',
    height: 180,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#E2E8F0',
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeImageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  penaltyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF1F2',
    padding: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  penaltyNoticeText: {
    fontSize: 11.5,
    color: '#BE123C',
    flex: 1,
    lineHeight: 16,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitDangerBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
