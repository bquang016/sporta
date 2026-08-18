import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { MatchmakingApiRepository } from '../../../../shared/api/matchmaking';
import { MockMatchmakingRepository } from '../../../../features/matchmaking/model/mockMatchmakingRepository';
import { ClubSummaryVM, BookingSummaryVM, MatchType } from '../../../../entities/match/model/match.types';
import { ClubSelector } from '../../../../features/matchmaking/ui/ClubSelector';
import { PaidBookingPicker } from '../../../../features/matchmaking/ui/PaidBookingPicker';
import { FeeSplitSelector } from '../../../../features/matchmaking/ui/FeeSplitSelector';

export function CreateMatchScreen() {
  const router = useRouter();

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
        let eligibleClubs: ClubSummaryVM[] = [];
        let paidBookings: BookingSummaryVM[] = [];

        try {
          eligibleClubs = await MatchmakingApiRepository.getEligibleClubs();
          paidBookings = await MatchmakingApiRepository.getPaidBookings();
        } catch (e) {
          console.log('Error fetching from API, using mock repository:', e);
        }

        if (!eligibleClubs || eligibleClubs.length === 0) {
          eligibleClubs = await MockMatchmakingRepository.getEligibleClubs();
        }
        if (!paidBookings || paidBookings.length === 0) {
          paidBookings = await MockMatchmakingRepository.getPaidBookings();
        }

        setClubs(eligibleClubs);
        setBookings(paidBookings);

        const firstEligible = eligibleClubs.find((c) => c.isEligibleForMatchmaking);
        if (firstEligible) setSelectedClub(firstEligible);

        if (paidBookings.length > 0) setSelectedBooking(paidBookings[0]);
      } catch (e) {
        console.error('Error loading create match data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!selectedClub) {
      Alert.alert('Chưa chọn CLB', 'Vui lòng chọn CLB đại diện.');
      return;
    }
    if (!selectedClub.isEligibleForMatchmaking) {
      Alert.alert('Chưa đủ thành viên', 'CLB đại diện cần có ít nhất 8 thành viên ACTIVE.');
      return;
    }
    if (!selectedBooking) {
      Alert.alert('Chưa chọn sân', 'Vui lòng chọn lịch sân đã đặt (PAID).');
      return;
    }

    setSubmitting(true);
    try {
      let created;
      try {
        created = await MatchmakingApiRepository.createRoom({
          bookingId: selectedBooking.id,
          hostClubId: selectedClub.id,
          matchType,
          hostSharePercent,
          desiredLevels: [desiredLevel],
          note: note.trim() || undefined,
        });
      } catch (e) {
        console.log('API createRoom failed, falling back to mock:', e);
        created = await MockMatchmakingRepository.createRoom({
          bookingId: selectedBooking.id,
          hostClubId: selectedClub.id,
          matchType,
          hostSharePercent,
          desiredLevels: [desiredLevel],
          note: note.trim() || undefined,
        });
      }

      router.replace(`/matchmaking/${created.id}` as any);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể tạo bài ghép trận');
    } finally {
      setSubmitting(false);
    }
  };

  const levelOptions = ['Tương đương', 'Yếu', 'TBY', 'TB', 'TBK', 'Khá'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
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
              bookings={bookings}
              selectedBookingId={selectedBooking?.id}
              onSelectBooking={setSelectedBooking}
            />

            {/* Section 3: Match Type Selector */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Loại trận đấu</Text>

              <View style={styles.typeRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setMatchType('RANKED')}
                  style={[styles.typeBtn, matchType === 'RANKED' && styles.typeBtnRanked]}
                >
                  <Text style={[styles.typeBtnTitle, matchType === 'RANKED' && styles.typeTextRanked]}>
                    🏆 Xếp hạng
                  </Text>
                  <Text style={styles.typeBtnDesc}>
                    Thi đấu tích lũy điểm CRP thành tích CLB.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setMatchType('FRIENDLY')}
                  style={[styles.typeBtn, matchType === 'FRIENDLY' && styles.typeBtnFriendly]}
                >
                  <Text style={[styles.typeBtnTitle, matchType === 'FRIENDLY' && styles.typeTextFriendly]}>
                    🤝 Giao hữu
                  </Text>
                  <Text style={styles.typeBtnDesc}>
                    Giao lưu học hỏi, không tích lũy điểm CRP.
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
    fontSize: 14,
  },
  typeTextRanked: {
    color: '#92400E',
  },
  typeTextFriendly: {
    color: '#075985',
  },
  typeBtnDesc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 10.5,
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
    padding: SPACING.sm,
    minHeight: 80,
    textAlignVertical: 'top',
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
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
