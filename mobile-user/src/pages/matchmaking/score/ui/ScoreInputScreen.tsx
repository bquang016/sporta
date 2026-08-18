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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
      if (Platform.OS === 'web') {
        window.alert('Đã gửi tỷ số trận đấu thành công! ⚽ Tỷ số đã được chuyển cho Bên B phê duyệt.');
        router.replace(`/matchmaking/${room.id}` as any);
      } else {
        Alert.alert(
          'Đã gửi tỷ số trận đấu! ⚽',
          'Tỷ số đã được gửi tới đối thủ (Bên B). Trận đấu sẽ chính thức hoàn tất sau khi Bên B phê duyệt và xác nhận.',
          [
            {
              text: 'Hiểu rồi',
              onPress: () => router.replace(`/matchmaking/${room.id}` as any),
            },
          ]
        );
      }
    } catch (e: any) {
      if (Platform.OS === 'web') {
        window.alert('Không thể gửi tỷ số: ' + (e.message || 'Lỗi hệ thống'));
      } else {
        Alert.alert('Lỗi', e.message || 'Không thể gửi tỷ số');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmScore = async () => {
    setSubmitting(true);
    try {
      await confirmScore();
      if (Platform.OS === 'web') {
        window.alert('Hoàn tất trận đấu thành công! 🎉 Điểm CRP đã được cập nhật.');
        router.replace(`/matchmaking/${room.id}/result` as any);
      } else {
        Alert.alert('Hoàn tất trận đấu! 🎉', 'Kết quả đã được xác nhận và cập nhật điểm CRP.');
        router.replace(`/matchmaking/${room.id}/result` as any);
      }
    } catch (e: any) {
      if (Platform.OS === 'web') {
        window.alert('Không thể xác nhận: ' + (e.message || 'Lỗi hệ thống'));
      } else {
        Alert.alert('Lỗi', e.message || 'Không thể xác nhận kết quả');
      }
    } finally {
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bảng Điểm Trận Đấu</Text>
        <TouchableOpacity onPress={() => setIsOverdue(!isOverdue)} style={styles.overdueToggle}>
          <Text style={styles.overdueToggleText}>{isOverdue ? 'Thường' : 'Quá hạn'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.responsiveContainer}>
          {/* Stadium Header Info Card - Strict Theme Tokens */}
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

          {/* OVERDUE State Box */}
          {isOverdue && (
            <View style={styles.overdueCard}>
              <View style={styles.overdueHeader}>
                <Ionicons name="alert-circle-outline" size={24} color={COLORS.errorText} />
                <Text style={styles.overdueTitle}>Trận đấu quá hạn xác nhận (+1h)</Text>
              </View>
              <Text style={styles.overdueDesc}>
                Đã quá 1 giờ từ khi trận đấu kết thúc mà hai đội chưa chốt tỷ số. Hệ thống không tự động ghi nhận kết quả để đảm bảo tính chính xác.
              </Text>

              <View style={styles.overdueActions}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => Alert.alert('Báo cáo', 'Báo cáo sự cố đã được gửi tới quản trị viên.')} style={styles.reportBtn}>
                  <Ionicons name="flag-outline" size={16} color={COLORS.errorText} />
                  <Text style={styles.reportBtnText}>Báo cáo vấn đề</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} onPress={handleProposeDraw} style={styles.drawBtn}>
                  <Ionicons name="hand-left-outline" size={16} color={COLORS.white} />
                  <Text style={styles.drawBtnText}>Đề xuất hòa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Form Nhập tỷ số - CHỈ CHỦ ROOM (BÊN A) ĐƯỢC NHẬP */}
          {room.status === 'MATCHED' && !submission && (
            room.permissions?.canEnterScore ? (
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
                <Ionicons name="trophy" size={24} color={COLORS.primary} />
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
                <>
                  <Text style={styles.confirmQuestion}>Bạn là đại diện Bên B ({room.guestClub?.name}). Bấm nút bên dưới để duyệt kết quả và tính điểm CRP:</Text>
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
                          <View style={styles.trophyIconBg}>
                            <Ionicons name="trophy" size={18} color={COLORS.secondary} />
                          </View>
                          <Text style={styles.confirmScoreText}>DUYỆT & XÁC NHẬN TỶ SỐ TRẬN ĐẤU</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.waitingGuestBox}>
                  <Ionicons name="time" size={20} color="#92400E" />
                  <Text style={styles.waitingGuestText}>
                    Tỷ số đã được gửi thành công! Đang chờ đối thủ Bên B ({room.guestClub?.name || 'Đối thủ'}) phê duyệt & xác nhận.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
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
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryOpacity06,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 17,
  },
  overdueToggle: {
    backgroundColor: COLORS.secondaryOpacity15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  overdueToggleText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.amber,
    fontSize: 11,
    fontWeight: '800',
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
    backgroundColor: COLORS.whiteOpacity30,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.successText,
  },
  liveTagText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 10,
  },
  stadiumSport: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.whiteOpacity70,
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
    color: COLORS.whiteOpacity70,
  },
  teamVsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.whiteOpacity10,
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
  overdueCard: {
    backgroundColor: COLORS.errorOpacity08,
    borderWidth: 1.5,
    borderColor: COLORS.errorContainer,
    borderRadius: BORDER_RADIUS.xl,
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
    color: COLORS.errorText,
    fontSize: 15,
  },
  overdueDesc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.errorText,
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
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.errorContainer,
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.full,
  },
  reportBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.errorText,
    fontWeight: '800',
    fontSize: 12,
  },
  drawBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.full,
  },
  drawBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
  },
  confirmCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity08,
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
