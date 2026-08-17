import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useMatchDetail } from '../../../../features/matchmaking/model/useMatchmaking';
import { ScoreInputForm } from '../../../../features/matchmaking/ui/ScoreInputForm';

export function ScoreInputScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { room, loading, submitScore, confirmScore } = useMatchDetail(id as string);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isOverdue, setIsOverdue] = useState<boolean>(false);

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
      await confirmScore();
      // Chuyển thẳng tới màn hình kết quả & thưởng CRP
      router.replace(`/matchmaking/${room.id}/result` as any);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể gửi tỷ số');
      setSubmitting(false);
    }
  };

  const handleConfirmScore = async () => {
    setSubmitting(true);
    try {
      await confirmScore();
      // Chuyển thẳng tới màn hình kết quả & thưởng CRP
      router.replace(`/matchmaking/${room.id}/result` as any);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể xác nhận kết quả');
      setSubmitting(false);
    }
  };

  const handleProposeDraw = () => {
    Alert.alert(
      'Đề xuất hòa',
      'Đề xuất ghi nhận kết quả hòa đã được gửi cho đối thủ. Cả hai đội cần đồng ý để hoàn tất.',
      [{ text: 'Đồng ý' }]
    );
  };

  const submission = room.scoreSubmission;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảng Điểm & Tỷ Số</Text>
        <TouchableOpacity onPress={() => setIsOverdue(!isOverdue)} style={styles.overdueToggle}>
          <Text style={styles.overdueToggleText}>{isOverdue ? 'Thường' : 'Mô phỏng Quá hạn'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stadium Header Info Card */}
        <View style={styles.stadiumCard}>
          <View style={styles.stadiumBadgeRow}>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTagText}>CẬP NHẬT TỶ SỐ</Text>
            </View>
            <Text style={styles.stadiumSport}>{room.booking.sportName} • {room.booking.format}</Text>
          </View>

          <Text style={styles.stadiumName}>{room.booking.facilityName}</Text>
          <Text style={styles.stadiumTime}>{room.booking.date} • {room.booking.startTime} - {room.booking.endTime}</Text>

          <View style={styles.teamVsRow}>
            <Text style={styles.teamVsName}>{room.hostClub.name}</Text>
            <View style={styles.vsBadge}><Text style={styles.vsText}>VS</Text></View>
            <Text style={styles.teamVsName}>{room.guestClub?.name || 'Đội bạn'}</Text>
          </View>
        </View>

        {/* OVERDUE State Box */}
        {isOverdue && (
          <View style={styles.overdueCard}>
            <View style={styles.overdueHeader}>
              <MaterialIcons name="error-outline" size={24} color="#DC2626" />
              <Text style={styles.overdueTitle}>Trận đấu quá hạn xác nhận (+1h)</Text>
            </View>
            <Text style={styles.overdueDesc}>
              Đã quá 1 giờ từ khi trận đấu kết thúc mà hai đội chưa chốt tỷ số. Hệ thống không tự động ghi nhận kết quả để đảm bảo tính chính xác.
            </Text>

            <View style={styles.overdueActions}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => Alert.alert('Báo cáo', 'Báo cáo sự cố đã được gửi tới quản trị viên.')} style={styles.reportBtn}>
                <MaterialIcons name="report" size={16} color="#DC2626" />
                <Text style={styles.reportBtnText}>Báo cáo vấn đề</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.8} onPress={handleProposeDraw} style={styles.drawBtn}>
                <MaterialIcons name="handshake" size={16} color={COLORS.primary} />
                <Text style={styles.drawBtnText}>Đề xuất hòa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Form Nhập tỷ số */}
        {room.status === 'MATCHED' && !submission && (
          <ScoreInputForm room={room} onSubmitScore={handleSubmitScore} />
        )}

        {/* View Xác nhận Tỷ số */}
        {(room.status === 'SCORE_CONFIRMING' || submission) && (
          <View style={styles.confirmCard}>
            <View style={styles.confirmHeader}>
              <MaterialIcons name="sports-score" size={28} color={COLORS.primary} />
              <Text style={styles.confirmTitle}>Xác Nhận Kết Quả Trận Đấu</Text>
            </View>
            <Text style={styles.confirmSub}>Đại diện {room.hostClub.name} đã cập nhật tỷ số:</Text>

            <View style={styles.scoreboardBox}>
              <Text style={styles.scoreboardText}>{submission?.hostScore ?? 3} - {submission?.guestScore ?? 2}</Text>
              {submission?.rawScoreDetails && (
                <Text style={styles.scoreboardDetails}>{submission.rawScoreDetails}</Text>
              )}
            </View>

            <Text style={styles.confirmQuestion}>Bấm nút bên dưới để chốt kết quả và nhận thưởng điểm CRP:</Text>

            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                disabled={submitting}
                onPress={handleConfirmScore}
                style={styles.confirmScoreBtn}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <MaterialIcons name="emoji-events" size={20} color={COLORS.white} />
                    <Text style={styles.confirmScoreText}>🏆 XÁC NHẬN KẾT QUẢ & XEM ĐIỂM CRP (+/-)</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  iconBtn: {
    padding: 6,
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 18,
  },
  overdueToggle: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.xl,
  },
  overdueToggleText: {
    ...TYPOGRAPHY.labelSm,
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
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
    paddingBottom: 40,
  },
  stadiumCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
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
    fontWeight: '800',
    fontSize: 10,
  },
  stadiumSport: {
    ...TYPOGRAPHY.labelSm,
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
  },
  stadiumName: {
    ...TYPOGRAPHY.headlineMd,
    fontWeight: '800',
    color: COLORS.white,
    fontSize: 18,
  },
  stadiumTime: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  teamVsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
    marginTop: 4,
  },
  teamVsName: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '700',
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
    color: COLORS.onSurface,
    fontWeight: '800',
    fontSize: 10,
  },
  overdueCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  overdueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overdueTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: '#991B1B',
    fontSize: 15,
  },
  overdueDesc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 18,
  },
  overdueActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  reportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.default,
  },
  reportBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
  },
  drawBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.default,
  },
  drawBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  confirmCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    gap: SPACING.sm,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    fontSize: 18,
  },
  confirmSub: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  scoreboardBox: {
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  scoreboardText: {
    ...TYPOGRAPHY.headlineXl,
    fontWeight: '900',
    color: COLORS.primary,
    fontSize: 42,
    letterSpacing: 2,
  },
  scoreboardDetails: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
    fontWeight: '600',
  },
  confirmQuestion: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    fontSize: 13,
  },
  confirmBtnRow: {
    width: '100%',
    marginTop: 8,
  },
  confirmScoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmScoreText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
});
