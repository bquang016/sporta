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
import { LineupPicker } from '../../../../features/matchmaking/ui/LineupPicker';
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
  const [selectedLineup, setSelectedLineup] = useState<any | undefined>();
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

  const availableBookings = React.useMemo(() => {
    if (!selectedClub) return bookings;
    return bookings.filter((b) => String(b.sportId) === String(selectedClub.sportId));
  }, [bookings, selectedClub]);

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
    if (!selectedLineup) {
      showAlert('Chưa có đội hình ra sân', 'CLB cần chọn đội hình ra sân sẵn sàng để tạo kèo tìm đối thủ.', 'warning');
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
        lineupId: selectedLineup.id,
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ── Top Header ── */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={handleBack} style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo Kèo Tìm Đối Thủ</Text>
          <View style={{ width: 36 }} />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang nạp thông tin CLB và sân đã đặt...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.responsiveContainer}>
            {/* Section 1: Choose Club */}
            <ClubSelector
              clubs={clubs}
              selectedClubId={selectedClub?.id}
              onSelectClub={setSelectedClub}
            />

            {/* Section 2: Choose Lineup */}
            <LineupPicker
              clubId={selectedClub?.id}
              clubName={selectedClub?.name}
              sportId={selectedClub?.sportId}
              selectedLineupId={selectedLineup?.id}
              onSelectLineup={setSelectedLineup}
              onNavigateToClub={() => {
                if (selectedClub?.id) {
                  router.push(`/club/${selectedClub.id}` as any);
                }
              }}
            />

            {/* Section 3: Choose Booking */}
            <PaidBookingPicker
              bookings={availableBookings}
              selectedBookingId={selectedBooking?.id}
              onSelectBooking={setSelectedBooking}
              selectedSportName={selectedClub?.sportName}
            />

            {/* Section 4: Match Type Selector */}
            <View style={styles.sectionCard}>
              <View style={styles.headerRow}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="trophy" size={16} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>4. Loại Trận Đấu</Text>
                  <Text style={styles.subtext}>Chọn thể thức tính điểm xếp hạng</Text>
                </View>
              </View>

              <View style={styles.typeRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setMatchType('RANKED')}
                  style={[
                    styles.typeBtn,
                    matchType === 'RANKED' && styles.typeBtnRanked,
                  ]}
                >
                  <View style={styles.typeBtnHeader}>
                    <Ionicons
                      name="trophy"
                      size={18}
                      color={matchType === 'RANKED' ? '#B45309' : '#64748B'}
                    />
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
                  <View style={styles.typeBtnHeader}>
                    <Ionicons
                      name="people"
                      size={18}
                      color={matchType === 'FRIENDLY' ? '#0284C7' : '#64748B'}
                    />
                    <Text style={[styles.typeBtnTitle, matchType === 'FRIENDLY' && styles.typeTextFriendly]}>
                      Giao hữu
                    </Text>
                  </View>
                  <Text style={[styles.typeBtnDesc, matchType === 'FRIENDLY' && styles.typeTextFriendly]}>
                    Thi đấu giao lưu cọ xát, không tính điểm Elo.
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section 5: Fee Split Selector */}
            {selectedBooking && (
              <FeeSplitSelector
                totalPrice={selectedBooking.totalPrice}
                hostPercent={hostSharePercent}
                onChangeHostPercent={setHostSharePercent}
              />
            )}

            {/* Section 6: Opponent Level Target */}
            <View style={styles.sectionCard}>
              <View style={styles.headerRow}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="speedometer" size={16} color="#7C3AED" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>6. Trình Độ Đối Thủ Mong Muốn</Text>
                  <Text style={styles.subtext}>
                    Hệ thống sẽ gắn huy hiệu "Cân kèo" cho đối thủ phù hợp
                  </Text>
                </View>
              </View>

              <View style={styles.levelRow}>
                {levelOptions.map((lvl) => {
                  const isSelected = desiredLevel === lvl;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      onPress={() => setDesiredLevel(lvl)}
                      style={[styles.levelChip, isSelected && styles.levelChipActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.levelChipText, isSelected && styles.levelChipTextActive]}>
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 7: Note */}
            <View style={styles.sectionCard}>
              <View style={styles.headerRow}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="chatbox-ellipses" size={16} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>7. Lời Nhắn Gửi Đối Thủ (Tùy chọn)</Text>
                </View>
              </View>

              <TextInput
                style={styles.noteInput}
                multiline
                numberOfLines={3}
                placeholder="VD: Đội mình thi đấu giao lưu đúng giờ, fair-play, cần tìm đối thủ vừa miếng..."
                placeholderTextColor="#94A3B8"
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
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Đăng bài tìm đối thủ ngay</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerInner: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
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
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 15.5,
  },
  subtext: {
    ...TYPOGRAPHY.bodyMd,
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  typeBtnRanked: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  typeBtnFriendly: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  typeBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBtnTitle: {
    ...TYPOGRAPHY.titleSm,
    fontWeight: '800',
    fontSize: 13,
    color: '#475569',
  },
  typeTextRanked: {
    color: '#92400E',
  },
  typeTextFriendly: {
    color: '#0369A1',
  },
  typeBtnDesc: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 11,
    color: '#64748B',
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  levelChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  levelChipText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  levelChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  noteInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    fontSize: 13,
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
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    ...TYPOGRAPHY.titleSm,
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
});
