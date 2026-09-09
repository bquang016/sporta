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
      quality: 0.7,
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
      quality: 0.7,
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
        try {
          uploadedUrl = await Promise.race([
            uploadImageApi(evidenceUri, 'general'),
            new Promise<string>((_, reject) =>
              setTimeout(() => reject(new Error('Tải ảnh quá thời gian kết nối. Bạn có thể gửi trước mô tả.')), 15000)
            ),
          ]);
        } catch (imgErr: any) {
          console.warn('Image upload error:', imgErr);
        }
        setUploadingImage(false);
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
      showAlert('Lỗi gửi khiếu nại', e.message || 'Không thể gửi khiếu nại lúc này.', 'danger');
    } finally {
      setUploadingImage(false);
      setSubmitting(false);
    }
  };

  // 2. Submit Counter Evidence by Host A
  const handleSubmitCounterEvidence = async () => {
    if (!counterEvidenceUri && !counterNote.trim()) {
      showAlert('Thiếu thông tin', 'Vui lòng nhập giải trình hoặc đính kèm ảnh bằng chứng đối chất của bạn.', 'warning');
      return;
    }

    setSubmittingCounter(true);
    try {
      let uploadedUrl: string = '';
      if (counterEvidenceUri) {
        setUploadingImage(true);
        try {
          uploadedUrl = await Promise.race([
            uploadImageApi(counterEvidenceUri, 'general'),
            new Promise<string>((_, reject) =>
              setTimeout(() => reject(new Error('Tải ảnh đối chất quá thời gian kết nối. Bạn có thể gửi giải trình chữ trước.')), 15000)
            ),
          ]);
        } catch (imgErr: any) {
          console.warn('Image upload error on counter-evidence:', imgErr);
        }
        setUploadingImage(false);
      }

      await MatchmakingApiRepository.submitDisputeEvidence(id as string, uploadedUrl, counterNote.trim() || undefined);

      showAlert(
        'Đã gửi bằng chứng đối chất',
        'Bằng chứng của bạn đã được ghi nhận và gửi tới Ban Quản Trị để đối chiếu xử lý.',
        'success',
        () => {
          refetchRoom();
          fetchDispute();
        }
      );
    } catch (e: any) {
      showAlert('Lỗi gửi đối chất', e.message || 'Không thể gửi bằng chứng đối chất lúc này.', 'danger');
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

  if (roomLoading || !room || loadingDispute) {
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

  const isResolved = disputeDetail?.status === 'RESOLVED' || room.status === 'RESULT_FINAL';
  const isDisputed = disputeDetail?.status === 'OPEN' || room.status === 'DISPUTED';
  const hasDispute = Boolean(disputeDetail);
  const resolvedParts = disputeDetail?.resolvedResultJson ? disputeDetail.resolvedResultJson.split('-') : null;
  const hostScoreDisplay = isResolved && resolvedParts ? resolvedParts[0].trim() : (submission?.hostScore ?? 0);
  const guestScoreDisplay = isResolved && resolvedParts ? resolvedParts[1].trim() : (submission?.guestScore ?? 0);
  const isHost = Boolean(room.permissions?.isHostAdmin && !room.permissions?.isGuestAdmin);
  const isGuest = Boolean(room.permissions?.isGuestAdmin && !room.permissions?.isHostAdmin);
  const canFileDispute = !isHost && (room.status === 'SCORE_CONFIRMING' || room.status === 'RESULT_OVERDUE') && !hasDispute && !isResolved && !isDisputed;

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
        <Text style={styles.headerTitle}>Khiếu nại & xử lý tỷ số</Text>
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
                  <Text style={styles.sportBadgeText}>{room.booking?.sportName || 'Thể thao'} • {room.booking?.format || 'Ghép trận'}</Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  isResolved ? styles.statusResolved : isDisputed ? styles.statusDisputed : styles.statusConfirming
                ]}>
                  <Text style={[
                    styles.statusBadgeText, 
                    isResolved ? styles.statusResolvedText : isDisputed ? styles.statusDisputedText : styles.statusConfirmingText
                  ]}>
                    {isResolved ? 'Đã giải quyết' : isDisputed ? 'Đang xử lý tranh chấp' : 'Chờ xác nhận'}
                  </Text>
                </View>
              </View>

              <Text style={styles.venueName} numberOfLines={1}>{room.booking?.facilityName || 'Sân thi đấu'}</Text>
              <Text style={styles.venueTime}>
                {room.booking?.date} • {room.booking?.startTime} - {room.booking?.endTime}
              </Text>

              {/* Submitted Score Summary Box */}
              <View style={styles.scoreRowMini}>
                <View style={styles.teamMini}>
                  <UserAvatar uri={hostAvatarUri} name={host.name} size={24} />
                  <Text style={styles.teamNameMini} numberOfLines={1}>{host.name}</Text>
                  <Text style={styles.scoreDigitMini}>{hostScoreDisplay}</Text>
                </View>
                <Text style={styles.vsDash}>-</Text>
                <View style={[styles.teamMini, { justifyContent: 'flex-end' }]}>
                  <Text style={styles.scoreDigitMini}>{guestScoreDisplay}</Text>
                  <Text style={[styles.teamNameMini, { textAlign: 'right' }]} numberOfLines={1}>
                    {guest?.name || 'Đội bạn'}
                  </Text>
                  <UserAvatar uri={guestAvatarUri} name={guest?.name || 'B'} size={24} />
                </View>
              </View>
            </View>

            {/* CASE 1: MATCH DISPUTE HAS BEEN RESOLVED */}
            {isResolved ? (
              <View style={styles.card}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="checkmark-circle" size={22} color="#059669" />
                  <Text style={styles.sectionTitle}>Hồ sơ phân xử tranh chấp</Text>
                  <View style={[styles.disputeStatusTag, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.disputeStatusTagText, { color: '#059669' }]}>Đã giải quyết</Text>
                  </View>
                </View>

                {/* Admin Resolution Box */}
                <View style={styles.resolvedBox}>
                  <Ionicons name="ribbon" size={26} color="#059669" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resolvedTitle}>Kết quả phân xử từ Ban Quản Trị</Text>
                    <Text style={styles.resolvedScore}>{disputeDetail?.resolvedResultJson || `${hostScoreDisplay} - ${guestScoreDisplay}`}</Text>
                    <Text style={styles.resolvedNote}>
                      {disputeDetail?.resolutionNote || 'Trận đấu đã hoàn tất xử lý và chốt kết quả xếp hạng chính thức.'}
                    </Text>
                  </View>
                </View>

                {/* Dispute Details if available */}
                {disputeDetail ? (
                  <View style={styles.disputeInfoBox}>
                    <Text style={styles.infoLabel}>Bên gửi khiếu nại ban đầu:</Text>
                    <Text style={styles.infoValue}>CLB {disputeDetail.openedByClubName || guest?.name || 'Bên B'}</Text>

                    <Text style={[styles.infoLabel, { marginTop: 8 }]}>Lý do khiếu nại:</Text>
                    <Text style={styles.infoValueHighlight}>
                      {DISPUTE_REASONS.find((r) => r.code === disputeDetail.reasonCode)?.label || disputeDetail.reasonCode}
                    </Text>

                    {disputeDetail.description ? (
                      <>
                        <Text style={[styles.infoLabel, { marginTop: 8 }]}>Nội dung khiếu nại:</Text>
                        <Text style={styles.infoValue}>{disputeDetail.description}</Text>
                      </>
                    ) : null}

                    {disputeDetail.guestEvidenceImageUrl ? (
                      <View style={{ marginTop: 10 }}>
                        <Text style={styles.infoLabel}>Ảnh minh chứng từ Bên B:</Text>
                        <Image source={{ uri: disputeDetail.guestEvidenceImageUrl }} style={styles.evidenceImagePreview} resizeMode="cover" />
                      </View>
                    ) : null}

                    {/* Host counter evidence if submitted */}
                    {disputeDetail.hostHasSubmittedEvidence ? (
                      <View style={[styles.submittedEvidenceBox, { marginTop: 12 }]}>
                        <View style={styles.submittedEvidenceHeader}>
                          <Ionicons name="checkmark-circle" size={16} color="#059669" />
                          <Text style={styles.submittedEvidenceTitle}>Bằng chứng đối chất của Chủ nhà (Bên A)</Text>
                        </View>
                        {disputeDetail.hostEvidenceDescription ? (
                          <View style={{ marginTop: 4 }}>
                            <Text style={styles.infoLabel}>Giải trình của Chủ nhà:</Text>
                            <Text style={styles.infoValue}>{disputeDetail.hostEvidenceDescription}</Text>
                          </View>
                        ) : null}
                        {disputeDetail.hostEvidenceImageUrl ? (
                          <Image source={{ uri: disputeDetail.hostEvidenceImageUrl }} style={styles.evidenceImagePreview} resizeMode="cover" />
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {/* Action Buttons for Resolved State */}
                <View style={{ gap: 8, marginTop: 6 }}>
                  <TouchableOpacity
                    style={styles.viewResultBtn}
                    onPress={() => router.push(`/matchmaking/${room.id}/result` as any)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="trophy-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.viewResultBtnText}>Xem Kết Quả & Điểm CRP Trận Đấu</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryActionBtn}
                    onPress={() => router.push(`/matchmaking/${room.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.secondaryActionBtnText}>Về chi tiết kèo đấu</Text>
                  </TouchableOpacity>
                </View>
              </View>

            ) : isDisputed && disputeDetail ? (
              /* CASE 2: MATCH UNDER ACTIVE DISPUTE */
              <View style={styles.card}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <Text style={styles.sectionTitle}>Hồ sơ khiếu nại trận đấu</Text>
                  <View style={styles.disputeStatusTag}>
                    <Text style={styles.disputeStatusTagText}>Đang xử lý</Text>
                  </View>
                </View>

                {/* FREEZE NOTICE */}
                <View style={styles.freezeNotice}>
                  <Ionicons name="shield-outline" size={20} color="#0369A1" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.freezeNoticeTitle}>Đóng băng điểm số an toàn</Text>
                    <Text style={styles.freezeNoticeSub}>
                      Khi trận đấu có khiếu nại, điểm ELO và CRP được đóng băng cho đến khi Ban Quản Trị kiểm tra và ra quyết định chính thức.
                    </Text>
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
                <View style={styles.counterSection}>
                  <View style={styles.deadlineBox}>
                    <Ionicons name="timer-outline" size={20} color="#B45309" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.deadlineTitle}>Thời hạn gửi bằng chứng đối chất:</Text>
                      <Text style={styles.deadlineTimer}>{getRemainingHours()}</Text>
                      <Text style={styles.deadlineSub}>
                        Nếu quá 24h Chủ nhà không gửi bằng chứng đối chất, bên B sẽ được mặc định xử thắng 3-0 và bên A bị trừ 10 CRP.
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
                      {disputeDetail.hostEvidenceDescription ? (
                        <View style={{ marginTop: 6, marginBottom: 8 }}>
                          <Text style={styles.infoLabel}>Giải trình của Chủ nhà:</Text>
                          <Text style={styles.infoValue}>{disputeDetail.hostEvidenceDescription}</Text>
                        </View>
                      ) : null}
                      {disputeDetail.hostEvidenceImageUrl ? (
                        <Image source={{ uri: disputeDetail.hostEvidenceImageUrl }} style={styles.evidenceImagePreview} resizeMode="cover" />
                      ) : null}
                      <Text style={styles.submittedEvidenceSub}>
                        Cả hai bên đã cung cấp đầy đủ thông tin. Ban Quản Trị đang tiến hành đối chiếu xử lý tại hệ thống Admin.
                      </Text>
                    </View>
                  ) : isHost ? (
                    /* Host Counter Evidence Form (STRICTLY ONLY FOR HOST A) */
                    <View style={styles.counterFormBox}>
                      <Text style={styles.formHeading}>Gửi bằng chứng đối chất (dành cho chủ nhà A)</Text>
                      <Text style={styles.formSubText}>
                        Nhập giải trình và đính kèm ảnh minh chứng để bảo vệ kết quả của bạn:
                      </Text>

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
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <ActivityIndicator color="#FFFFFF" size="small" />
                            <Text style={styles.submitBtnText}>
                              {uploadingImage ? 'Đang tải ảnh lên...' : 'Đang gửi đối chất...'}
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.submitBtnText}>Gửi bằng chứng đối chất</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    /* GUEST B & NON-HOST VIEW: Informational waiting badge */
                    <View style={styles.waitingForHostBadge}>
                      <Ionicons name="hourglass-outline" size={20} color="#D97706" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.waitingForHostTitle}>Đang chờ chủ nhà (Bên A) phản hồi</Text>
                        <Text style={styles.waitingForHostSub}>
                          Chủ nhà (Bên A) có tối đa 24 giờ để gửi bằng chứng đối chất. Nếu bên A không phản hồi, hệ thống sẽ tự động xử bên B thắng 3-0 và trừ 10 điểm CRP của bên A.
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

            ) : isHost && (room.status === 'SCORE_CONFIRMING' || room.status === 'RESULT_OVERDUE') ? (
              /* CASE 3A: HOST A TRIES TO OPEN DISPUTE FORM BEFORE DISPUTE */
              <View style={styles.card}>
                <View style={styles.infoOnlyBox}>
                  <Ionicons name="checkmark-done-circle-outline" size={32} color="#059669" />
                  <Text style={styles.infoOnlyTitle}>Bạn là Chủ nhà (Bên A)</Text>
                  <Text style={styles.infoOnlySub}>
                    Bạn đã khai báo tỷ số trận đấu ({submission?.hostScore ?? 0} - {submission?.guestScore ?? 0}). Quyền khiếu nại báo sai tỷ số thuộc về Đội Khách (Bên B).
                  </Text>
                  <Text style={styles.infoOnlyNote}>
                    • Nếu Bên B xác nhận hoặc không có khiếu nại sau 24 giờ, trận đấu sẽ tự động chốt kết quả như bạn đã khai báo.
                  </Text>
                </View>
              </View>

            ) : canFileDispute ? (
              /* CASE 3B: FILING A NEW DISPUTE (Guest B during score confirmation) */
              <View style={styles.card}>
                <Text style={styles.cardHeading}>Báo sai tỷ số & khiếu nại trận đấu</Text>
                <Text style={styles.cardSubtitle}>
                  Chọn lý do khiếu nại và cung cấp ảnh chụp bằng chứng để Admin xử lý công tâm:
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.submitBtnText}>
                        {uploadingImage ? 'Đang tải ảnh lên...' : 'Đang gửi khiếu nại...'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.submitBtnText}>Gửi khiếu nại lên Admin</Text>
                  )}
                </TouchableOpacity>
              </View>

            ) : (
              /* CASE 4: OTHER MATCH STATUSES */
              <View style={styles.card}>
                <View style={styles.infoOnlyBox}>
                  <Ionicons name="information-circle-outline" size={32} color="#0284C7" />
                  <Text style={[styles.infoOnlyTitle, { color: '#0284C7' }]}>Không có khiếu nại</Text>
                  <Text style={styles.infoOnlySub}>
                    Trận đấu hiện tại không ở trạng thái tranh chấp tỷ số.
                  </Text>
                  <TouchableOpacity
                    style={[styles.secondaryActionBtn, { marginTop: 12 }]}
                    onPress={() => router.push(`/matchmaking/${room.id}` as any)}
                  >
                    <Text style={styles.secondaryActionBtnText}>Về chi tiết kèo đấu</Text>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  scrollContent: {
    padding: SPACING.md,
  },
  responsiveContainer: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    gap: 12,
  },
  matchSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sportBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sportBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusConfirming: {
    backgroundColor: '#FEF3C7',
  },
  statusConfirmingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  statusDisputed: {
    backgroundColor: '#FEE2E2',
  },
  statusDisputedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  statusResolved: {
    backgroundColor: '#ECFDF5',
  },
  statusResolvedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  venueName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  venueTime: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  scoreRowMini: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  teamMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  teamNameMini: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    maxWidth: 90,
  },
  scoreDigitMini: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginLeft: 4,
  },
  vsDash: {
    fontSize: 14,
    fontWeight: '900',
    color: '#94A3B8',
    paddingHorizontal: 8,
  },
  freezeNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  freezeNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
    marginBottom: 2,
  },
  freezeNoticeSub: {
    fontSize: 11.5,
    color: '#0C4A6E',
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  reasonList: {
    gap: 8,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reasonCardActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  reasonCardText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  reasonCardTextActive: {
    color: '#DC2626',
    fontWeight: '800',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    fontSize: 12.5,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  pickImageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
  },
  pickBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  imagePreviewContainer: {
    alignItems: 'flex-start',
    gap: 6,
  },
  pickedImagePreview: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: '#000000',
  },
  removeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  removeImageText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  penaltyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
  },
  penaltyNoticeText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  submitDangerBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginLeft: 6,
  },
  disputeStatusTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  disputeStatusTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  disputeInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  infoValueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  evidenceImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 4,
  },
  counterSection: {
    gap: 10,
  },
  deadlineBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 10,
  },
  deadlineTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#92400E',
  },
  deadlineTimer: {
    fontSize: 13,
    fontWeight: '900',
    color: '#B45309',
    marginTop: 1,
  },
  deadlineSub: {
    fontSize: 10.5,
    color: '#78350F',
    marginTop: 3,
    lineHeight: 15,
  },
  submittedEvidenceBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  submittedEvidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submittedEvidenceTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#065F46',
  },
  submittedEvidenceSub: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 15,
  },
  counterFormBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  formHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
  },
  formSubText: {
    fontSize: 11,
    color: '#0284C7',
    marginBottom: 4,
  },
  waitingForHostBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
  },
  waitingForHostTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  waitingForHostSub: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
  },
  resolvedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 14,
  },
  resolvedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  resolvedScore: {
    fontSize: 18,
    fontWeight: '900',
    color: '#047857',
    marginTop: 2,
  },
  resolvedNote: {
    fontSize: 11.5,
    color: '#065F46',
    marginTop: 4,
    lineHeight: 16,
  },
  infoOnlyBox: {
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  infoOnlyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  infoOnlySub: {
    fontSize: 12.5,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 18,
  },
  infoOnlyNote: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  viewResultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  viewResultBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
});
