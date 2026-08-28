import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import {
  BookingItem,
  CancellationPreviewData,
  CancelBookingResponseData,
  getCancellationPreviewApi,
  cancelBookingApi
} from '../../../shared/api/bookings';

export interface CancellationPreviewModalProps {
  visible: boolean;
  booking: BookingItem | null;
  onClose: () => void;
  onSuccess: (result: CancelBookingResponseData) => void;
}

const CANCELLATION_REASONS = [
  'Bận việc đột xuất',
  'Thời tiết xấu / Mưa',
  'Thay đổi lịch trình',
  'Không đủ người chơi',
  'Lý do khác'
];

export const CancellationPreviewModal: React.FC<CancellationPreviewModalProps> = ({
  visible,
  booking,
  onClose,
  onSuccess
}) => {
  const { width, height } = useWindowDimensions();
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<CancellationPreviewData | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>(CANCELLATION_REASONS[0]);
  const [customNote, setCustomNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible && booking) {
      setErrorMessage(null);
      setCancelling(false);
      setSelectedReason(CANCELLATION_REASONS[0]);
      setCustomNote('');
      fetchPreview();
    } else {
      setPreviewData(null);
    }
  }, [visible, booking]);

  const fetchPreview = async () => {
    if (!booking) return;
    try {
      setLoadingPreview(true);
      const data = await getCancellationPreviewApi(booking.id);
      setPreviewData(data);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Không thể tải chính sách hủy sân');
    } finally {
      setLoadingPreview(false);
    }
  };

  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);

  // Initialize countdown when modal opens or previewData updates
  useEffect(() => {
    if (visible && previewData?.isGracePeriod) {
      const bookingTime = booking?.createdAt ? new Date(booking.createdAt).getTime() : Date.now();
      const tenMinutesMs = 10 * 60 * 1000;
      const elapsedMs = Math.max(0, Date.now() - bookingTime);
      const remainingSec = Math.max(0, Math.floor((tenMinutesMs - elapsedMs) / 1000));
      
      const fallbackSec = (previewData.graceMinutesRemaining ?? 10) * 60;
      setCountdownSeconds(remainingSec > 0 ? remainingSec : fallbackSec);
    } else {
      setCountdownSeconds(0);
    }
  }, [visible, previewData, booking]);

  // Tick down every second
  useEffect(() => {
    if (!visible || countdownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          fetchPreview(); // Auto refresh preview if grace period expired
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, countdownSeconds]);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleConfirmCancel = async () => {
    if (!booking) return;
    try {
      setCancelling(true);
      setErrorMessage(null);
      const reasonToSubmit = selectedReason === 'Lý do khác' && customNote.trim()
        ? customNote.trim()
        : selectedReason;

      const result = await cancelBookingApi(booking.id, reasonToSubmit, customNote.trim() || undefined);
      onSuccess(result);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Hủy đơn thất bại. Vui lòng thử lại sau.');
    } finally {
      setCancelling(false);
    }
  };

  const formatVND = (amount?: number) => {
    if (amount === undefined || amount === null) return '0 đ';
    return amount.toLocaleString('vi-VN') + ' đ';
  };

  if (!visible || !booking) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalCard, { maxHeight: height * 0.88, maxWidth: Math.min(width * 0.94, 440) }]}>
              
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleGroup}>
                  <View style={styles.headerIconWrapper}>
                    <Ionicons name="alert-circle" size={22} color={COLORS.error} />
                  </View>
                  <Text style={styles.headerTitle}>Xác nhận hủy đặt sân</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={20} color={COLORS.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Booking Brief Info */}
                <View style={styles.bookingBriefCard}>
                  <View style={styles.briefRow}>
                    <Text style={styles.briefLabel}>Mã đơn đặt:</Text>
                    <Text style={styles.briefCode}>{booking.bookingCode}</Text>
                  </View>
                  <View style={styles.briefRow}>
                    <Text style={styles.briefLabel}>Cơ sở:</Text>
                    <Text style={styles.briefVenueName} numberOfLines={1}>{booking.venueName}</Text>
                  </View>
                  {booking.details?.[0] && (
                    <View style={styles.briefRow}>
                      <Text style={styles.briefLabel}>Khung giờ:</Text>
                      <Text style={styles.briefTime}>
                        {booking.details[0].startTime.substring(0, 5)} - {booking.details[0].endTime.substring(0, 5)} ({booking.details[0].bookingDate})
                      </Text>
                    </View>
                  )}
                </View>

                {/* Loading State */}
                {loadingPreview ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Đang kiểm tra chính sách hoàn tiền...</Text>
                  </View>
                ) : previewData ? (
                  <>
                    {/* Refund Rate & Policy Banner */}
                    <View style={[
                      styles.policyBanner,
                      previewData.isGracePeriod
                        ? styles.policyBannerGrace
                        : previewData.refundRate === 100 
                          ? styles.policyBannerFull 
                          : previewData.refundRate > 0 
                            ? styles.policyBannerPartial 
                            : styles.policyBannerZero
                    ]}>
                      <View style={styles.policyHeader}>
                        <View style={[
                          styles.rateBadge,
                          previewData.isGracePeriod
                            ? styles.rateBadgeGrace
                            : previewData.refundRate === 100 
                              ? styles.rateBadgeFull 
                              : previewData.refundRate > 0 
                                ? styles.rateBadgePartial 
                                : styles.rateBadgeZero
                        ]}>
                          <Ionicons 
                            name={previewData.isGracePeriod ? "flash" : previewData.refundRate === 100 ? "checkmark-circle" : previewData.refundRate > 0 ? "information-circle" : "close-circle"} 
                            size={13} 
                            color={previewData.isGracePeriod ? "#047857" : previewData.refundRate === 100 ? "#15803D" : previewData.refundRate > 0 ? "#B45309" : "#B91C1C"} 
                          />
                          <Text style={[
                            styles.rateBadgeText,
                            previewData.isGracePeriod
                              ? styles.rateBadgeTextGrace
                              : previewData.refundRate === 100 
                                ? styles.rateBadgeTextFull 
                                : previewData.refundRate > 0 
                                  ? styles.rateBadgeTextPartial 
                                  : styles.rateBadgeTextZero
                          ]}>
                            {previewData.isGracePeriod 
                              ? "Huỷ miễn phí (Hoàn 100%)" 
                              : previewData.refundRate === 100 
                                ? "Hoàn tiền 100%" 
                                : previewData.refundRate > 0 
                                  ? `Hoàn tiền ${previewData.refundRate}%` 
                                  : "Không hoàn tiền"}
                          </Text>
                        </View>
                        
                        {previewData.isGracePeriod && countdownSeconds > 0 ? (
                          <View style={styles.graceCountdownBadge}>
                            <Ionicons name="time-outline" size={12} color="#047857" />
                            <Text style={styles.graceCountdownText}>
                              {formatCountdown(countdownSeconds)}
                            </Text>
                          </View>
                        ) : previewData.hoursRemaining !== undefined ? (
                          <Text style={styles.hoursRemainingText}>
                            Còn {previewData.hoursRemaining}h đến giờ đá
                          </Text>
                        ) : null}
                      </View>

                      <Text style={styles.policyDescText}>
                        {previewData.isGracePeriod
                          ? `Trong thời gian 10 phút sau khi đặt: Miễn phí hủy, hoàn 100% toàn bộ tiền vào Ví Sporta.`
                          : previewData.policyDescription}
                      </Text>
                    </View>

                    {/* Financial Breakdown Card */}
                    <View style={styles.financialCard}>
                      <Text style={styles.sectionTitle}>Chi tiết hoàn tiền</Text>
                      
                      <View style={styles.financialRow}>
                        <Text style={styles.financialLabel}>Tổng tiền đã thanh toán</Text>
                        <Text style={styles.financialValue}>{formatVND(previewData.finalPaidPrice)}</Text>
                      </View>

                      {previewData.cancellationFee > 0 && (
                        <View style={styles.financialRow}>
                          <Text style={styles.financialLabelFee}>Khấu trừ phí hủy sân</Text>
                          <Text style={styles.financialValueFee}>- {formatVND(previewData.cancellationFee)}</Text>
                        </View>
                      )}

                      <View style={styles.divider} />

                      <View style={styles.refundBox}>
                        <View style={styles.refundLabelGroup}>
                          <Ionicons name="wallet-outline" size={15} color="#047857" />
                          <Text style={styles.refundLabel}>Tiền hoàn vào Ví Sporta</Text>
                        </View>
                        <Text style={styles.refundAmount}>+ {formatVND(previewData.refundAmount)}</Text>
                      </View>
                    </View>

                    {/* Reason Selection */}
                    <View style={styles.reasonSection}>
                      <Text style={styles.sectionTitle}>Lý do hủy đặt sân</Text>
                      
                      <View style={styles.reasonChipsContainer}>
                        {CANCELLATION_REASONS.map((r) => {
                          const isSelected = selectedReason === r;
                          return (
                            <TouchableOpacity
                              key={r}
                              style={[styles.reasonChip, isSelected && styles.reasonChipSelected]}
                              onPress={() => setSelectedReason(r)}
                              activeOpacity={0.8}
                            >
                              <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                                {isSelected && <View style={styles.radioInnerCircle} />}
                              </View>
                              <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>{r}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {selectedReason === 'Lý do khác' && (
                        <TextInput
                          style={styles.customNoteInput}
                          placeholder="Nhập lý do chi tiết..."
                          placeholderTextColor={COLORS.onSurfaceVariant}
                          value={customNote}
                          onChangeText={setCustomNote}
                          multiline
                          numberOfLines={2}
                        />
                      )}
                    </View>
                  </>
                ) : null}

                {/* Error Banner */}
                {errorMessage && (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                )}
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.keepBookingBtn}
                  onPress={onClose}
                  disabled={cancelling}
                  activeOpacity={0.8}
                >
                  <Text style={styles.keepBookingBtnText}>Giữ lại lịch</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmCancelBtn, (cancelling || loadingPreview) && styles.confirmCancelBtnDisabled]}
                  onPress={handleConfirmCancel}
                  disabled={cancelling || loadingPreview}
                  activeOpacity={0.85}
                >
                  {cancelling ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.confirmCancelBtnText}>Xác nhận hủy</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    width: '100%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowBlack,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
      } as any,
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.errorContainer || '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  bookingBriefCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: 6,
  },
  briefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  briefLabel: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  briefCode: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: '800',
    color: COLORS.primary,
    fontSize: 13,
  },
  briefVenueName: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: '700',
    color: COLORS.onSurface,
    maxWidth: '65%',
    textAlign: 'right',
    fontSize: 13,
  },
  briefTime: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: '600',
    color: COLORS.onSurface,
    fontSize: 12,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
  },
  policyBanner: {
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: 8,
    borderWidth: 1,
  },
  policyBannerGrace: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  policyBannerFull: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  policyBannerPartial: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  policyBannerZero: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  rateBadgeGrace: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  rateBadgeFull: {
    backgroundColor: '#DCFCE7',
  },
  rateBadgePartial: {
    backgroundColor: '#FEF3C7',
  },
  rateBadgeZero: {
    backgroundColor: '#FEE2E2',
  },
  rateBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  rateBadgeTextGrace: {
    color: '#047857',
  },
  rateBadgeTextFull: {
    color: '#15803D',
  },
  rateBadgeTextPartial: {
    color: '#B45309',
  },
  rateBadgeTextZero: {
    color: '#B91C1C',
  },
  graceCountdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: BORDER_RADIUS.full,
  },
  graceCountdownText: {
    fontSize: 11.5,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.3,
  },
  hoursRemainingText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  policyDescText: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  financialCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleSm,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 13,
    marginBottom: 2,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  financialValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  financialLabelFee: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '500',
  },
  financialValueFee: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 2,
  },
  refundBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refundLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  refundLabel: {
    fontSize: 12,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '700',
    color: '#065F46',
  },
  refundAmount: {
    fontSize: 13.5,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#047857',
  },
  reasonSection: {
    gap: 8,
  },
  reasonChipsContainer: {
    gap: 6,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  reasonChipSelected: {
    backgroundColor: '#ECFDF5',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.onSurfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInnerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  reasonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  reasonTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  customNoteInput: {
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    fontSize: 12,
    color: COLORS.onSurface,
    backgroundColor: COLORS.surface,
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerLow,
  },
  keepBookingBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepBookingBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  confirmCancelBtn: {
    flex: 1.3,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  confirmCancelBtnDisabled: {
    opacity: 0.6,
  },
  confirmCancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
