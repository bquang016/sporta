import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { MatchmakingApiRepository } from '../../../../shared/api/matchmaking';
import { ClubSummaryVM, BookingSummaryVM, MatchType } from '../../../../entities/match/model/match.types';
import { ClubSelector } from '../../../../features/matchmaking/ui/ClubSelector';
import { PaidBookingPicker } from '../../../../features/matchmaking/ui/PaidBookingPicker';
import { FeeSplitSelector } from '../../../../features/matchmaking/ui/FeeSplitSelector';
import { CustomConfirmModal } from '../../../../shared/ui/CustomConfirmModal';

export function CreateMatchScreen() {
  const router = useRouter();

  // Custom Modal Alert State
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

  const [clubs, setClubs] = useState<ClubSummaryVM[]>([]);
  const [bookings, setBookings] = useState<BookingSummaryVM[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [selectedClub, setSelectedClub] = useState<ClubSummaryVM | undefined>();
  const [selectedBooking, setSelectedBooking] = useState<BookingSummaryVM | undefined>();
  const [matchType, setMatchType] = useState<MatchType>('RANKED');
  const [hostSharePercent, setHostSharePercent] = useState<number>(70);
  const [desiredLevel, setDesiredLevel] = useState<string>('Tương đương');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const eligibleClubs = await MatchmakingApiRepository.getEligibleClubs();
        const paidBookings = await MatchmakingApiRepository.getPaidBookings();

        setClubs(eligibleClubs || []);
        setBookings(paidBookings || []);

        // Chọn thông minh: Ưu tiên CLB đủ điều kiện VÀ có sẵn lịch đặt sân cùng môn thể thao
        const clubWithBooking = (eligibleClubs || []).find(
          (c) => c.isEligibleForMatchmaking && (paidBookings || []).some((b) => String(b.sportId) === String(c.sportId))
        );
        const defaultClub = clubWithBooking || (eligibleClubs || []).find((c) => c.isEligibleForMatchmaking) || (eligibleClubs || [])[0];

        if (defaultClub) {
          setSelectedClub(defaultClub);
          const initialAvailable = (paidBookings || []).filter((b) => String(b.sportId) === String(defaultClub.sportId));
          if (initialAvailable.length > 0) {
            setSelectedBooking(initialAvailable[0]);
          }
        }
      } catch (e) {
        console.error('Error loading create match data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Lọc danh sách lịch đặt sân theo đúng môn thể thao của CLB đại diện được chọn
  const availableBookings = React.useMemo(() => {
    if (!selectedClub) return bookings;
    return bookings.filter((b) => String(b.sportId) === String(selectedClub.sportId));
  }, [bookings, selectedClub]);

  // Tự động chọn booking phù hợp khi đổi CLB đại diện
  useEffect(() => {
    if (selectedClub) {
      const matchInAvailable = availableBookings.find((b) => b.id === selectedBooking?.id);
      if (!matchInAvailable) {
        setSelectedBooking(availableBookings.length > 0 ? availableBookings[0] : undefined);
      }
    }
  }, [selectedClub, availableBookings]);

  const handleCreate = async () => {
    if (!selectedClub) {
      showAlert('Chưa chọn CLB', 'Vui lòng chọn CLB đại diện.', 'warning');
      return;
    }
    if (!selectedClub.isEligibleForMatchmaking) {
      showAlert('Chưa đủ thành viên', 'CLB đại diện cần có ít nhất 8 thành viên ACTIVE.', 'warning');
      return;
    }
    if (!selectedBooking) {
      showAlert('Chưa chọn sân', 'Vui lòng chọn lịch sân đã đặt (PAID).', 'warning');
      return;
    }
    if (selectedClub.sportId && selectedBooking.sportId && String(selectedClub.sportId) !== String(selectedBooking.sportId)) {
      showAlert(
        'Khác môn thể thao',
        `CLB ${selectedClub.name} (${selectedClub.sportName}) không cùng môn thể thao với sân đấu đã đặt (${selectedBooking.sportName}).`,
        'warning'
      );
      return;
    }

    setSubmitting(true);
    try {
      const created = await MatchmakingApiRepository.createRoom({
        bookingId: selectedBooking.id,
        hostClubId: selectedClub.id,
        matchType,
        hostSharePercent,
        desiredLevels: [desiredLevel],
        note: note.trim() || undefined,
      });

      router.replace(`/matchmaking/${created.id}` as any);
    } catch (e: any) {
      showAlert('Lỗi tạo phòng', e.message || 'Không thể tạo bài ghép trận', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const levelOptions = ['Tương đương', 'Yếu', 'TBY', 'TB', 'TBK', 'Khá'];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/matchmaking');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo Bài Ghép Kèo Nhanh</Text>
          <View style={{ width: 36 }} />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang nạp thông tin sân đã đặt...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.responsiveContainer}>
            {/* Section 1: Choose Club */}
            <ClubSelector
              clubs={clubs}
              selectedClubId={selectedClub?.id}
              onSelectClub={setSelectedClub}
            />

            {/* Section 2: Choose Booking */}
            <PaidBookingPicker
              bookings={availableBookings}
              selectedBookingId={selectedBooking?.id}
              onSelectBooking={setSelectedBooking}
              selectedSportName={selectedClub?.sportName}
            />

            {/* Section 3: Match Type Selector */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Loại trận đấu</Text>

              <View style={styles.typeRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setMatchType('RANKED')}
                  style={[
                    styles.typeBtn,
                    matchType === 'RANKED' && styles.typeBtnRanked,
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="trophy" size={18} color={matchType === 'RANKED' ? '#92400E' : COLORS.onSurfaceVariant} />
                    <Text style={[styles.typeBtnTitle, matchType === 'RANKED' && styles.typeTextRanked]}>
                      Xếp hạng (CRP)
                    </Text>
                  </View>
                  <Text style={[styles.typeBtnDesc, matchType === 'RANKED' && styles.typeTextRanked]}>
                    Tính điểm xếp hạng CLB & thưởng CRP chính thức.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setMatchType('FRIENDLY')}
                  style={[
                    styles.typeBtn,
                    matchType === 'FRIENDLY' && styles.typeBtnFriendly,
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="people" size={18} color={matchType === 'FRIENDLY' ? '#075985' : COLORS.onSurfaceVariant} />
                    <Text style={[styles.typeBtnTitle, matchType === 'FRIENDLY' && styles.typeTextFriendly]}>
                      Giao hữu
                    </Text>
                  </View>
                  <Text style={[styles.typeBtnDesc, matchType === 'FRIENDLY' && styles.typeTextFriendly]}>
                    Thi đấu cọ xát, thư giãn, không tính điểm Elo.
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section 4: Fee Split Selector */}
            {selectedBooking && (
              <FeeSplitSelector
                totalPrice={selectedBooking.totalPrice}
                hostPercent={hostSharePercent}
                onChangeHostPercent={setHostSharePercent}
              />
            )}

            {/* Section 5: Opponent Level Target */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Trình độ đối thủ mong muốn</Text>
              <Text style={styles.subtext}>
                Gợi ý các CLB có Elo tương đồng để đảm bảo trận đấu diễn ra kịch tính.
              </Text>

              <View style={styles.levelRow}>
                {levelOptions.map((lvl) => {
                  const isSelected = desiredLevel === lvl;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      onPress={() => setDesiredLevel(lvl)}
                      style={[styles.levelChip, isSelected && styles.levelChipActive]}
                    >
                      <Text style={[styles.levelChipText, isSelected && styles.levelChipTextActive]}>
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 6: Note */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Lời nhắn gửi tới đối thủ (Tùy chọn)</Text>

              <TextInput
                style={styles.noteInput}
                multiline
                numberOfLines={3}
                placeholder="VD: Đội mình thi đấu giao lưu đúng giờ, fair-play, cần tìm đối thủ vừa miếng..."
                placeholderTextColor={COLORS.outline}
                value={note}
                onChangeText={setNote}
              />
            </View>

            {/* Bottom Submit CTA */}
            <TouchableOpacity
              disabled={submitting || !selectedClub?.isEligibleForMatchmaking}
              activeOpacity={0.88}
              onPress={handleCreate}
              style={[
                styles.submitBtn,
                (!selectedClub?.isEligibleForMatchmaking || submitting) && styles.submitBtnDisabled,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Đăng bài tìm đối thủ ngay</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Custom Alert Modal */}
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
    paddingBottom: 40,
  },
  responsiveContainer: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    gap: SPACING.md,
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
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 4,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    gap: 4,
  },
  typeBtnRanked: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  typeBtnFriendly: {
    borderColor: '#0284C7',
    backgroundColor: '#E0F2FE',
  },
  typeBtnTitle: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '900',
    color: COLORS.onSurface,
    fontSize: 13.5,
  },
  typeTextRanked: {
    color: '#92400E',
  },
  typeTextFriendly: {
    color: '#075985',
  },
  typeBtnDesc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    lineHeight: 15,
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  levelChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  levelChipText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontSize: 12,
  },
  levelChipTextActive: {
    color: COLORS.white,
    fontWeight: '800',
  },
  noteInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
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
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 15,
  },
});
