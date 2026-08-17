import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { MatchRoomVM, NormalizedOutcome } from '../../../entities/match/model/match.types';

interface ScoreInputFormProps {
  room: MatchRoomVM;
  onSubmitScore: (hostScore: number | string, guestScore: number | string, details?: string) => void;
}

export function ScoreInputForm({ room, onSubmitScore }: ScoreInputFormProps) {
  const isSetSport = room.booking.sportId === 'badminton' || room.booking.sportId === 'pickleball';

  // Standard match scores (e.g. Football)
  const [hostScoreNum, setHostScoreNum] = useState<number>(3);
  const [guestScoreNum, setGuestScoreNum] = useState<number>(2);

  // Set-based scores (e.g. Badminton)
  const [sets, setSets] = useState<{ host: string; guest: string }[]>([
    { host: '21', guest: '18' },
    { host: '19', guest: '21' },
    { host: '21', guest: '15' },
  ]);

  const calculateSetWinner = () => {
    let hostSetsWon = 0;
    let guestSetsWon = 0;
    sets.forEach((s) => {
      const h = parseInt(s.host, 10) || 0;
      const g = parseInt(s.guest, 10) || 0;
      if (h > g) hostSetsWon++;
      else if (g > h) guestSetsWon++;
    });
    return { hostSetsWon, guestSetsWon };
  };

  const getWinnerPreview = (): { text: string; outcome: NormalizedOutcome } => {
    if (isSetSport) {
      const { hostSetsWon, guestSetsWon } = calculateSetWinner();
      if (hostSetsWon > guestSetsWon) return { text: `Thắng: ${room.hostClub.name}`, outcome: 'WIN_A' };
      if (guestSetsWon > hostSetsWon) return { text: `Thắng: ${room.guestClub?.name || 'Đội bạn'}`, outcome: 'WIN_B' };
      return { text: 'Kết quả Hòa', outcome: 'DRAW' };
    } else {
      if (hostScoreNum > guestScoreNum) return { text: `Thắng: ${room.hostClub.name}`, outcome: 'WIN_A' };
      if (guestScoreNum > guestScoreNum) return { text: `Thắng: ${room.guestClub?.name || 'Đội bạn'}`, outcome: 'WIN_B' };
      return { text: 'Kết quả Hòa', outcome: 'DRAW' };
    }
  };

  const handleSubmit = () => {
    if (isSetSport) {
      const { hostSetsWon, guestSetsWon } = calculateSetWinner();
      const details = sets.map((s, idx) => `Set ${idx + 1}: ${s.host}-${s.guest}`).join(', ');
      onSubmitScore(hostSetsWon, guestSetsWon, details);
    } else {
      onSubmitScore(hostScoreNum, guestScoreNum);
    }
  };

  const winnerPreview = getWinnerPreview();

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Cập Nhật Tỷ Số Trận Đấu</Text>
        <Text style={styles.sportBadgeText}>{room.booking.sportName} • {room.booking.format}</Text>
      </View>

      {!isSetSport ? (
        /* Consolidated Scoreboard Card (Horizontal Host vs Guest Layout) */
        <View style={styles.scoreboardCard}>
          {/* Host Club Counter */}
          <View style={styles.teamCol}>
            <View style={styles.avatarHost}>
              <Text style={styles.avatarText}>{room.hostClub.name.charAt(4) || 'A'}</Text>
            </View>
            <Text style={styles.teamName} numberOfLines={1}>
              {room.hostClub.name}
            </Text>

            <View style={styles.counterRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setHostScoreNum(Math.max(0, hostScoreNum - 1))}
                style={styles.stepBtn}
              >
                <Ionicons name="remove" size={18} color={COLORS.primary} />
              </TouchableOpacity>

              <View style={styles.scoreNumBox}>
                <Text style={styles.scoreNumText}>{hostScoreNum}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setHostScoreNum(hostScoreNum + 1)}
                style={styles.stepBtn}
              >
                <Ionicons name="add" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Versus Center Badge */}
          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {/* Guest Club Counter */}
          <View style={styles.teamCol}>
            <View style={styles.avatarGuest}>
              <Text style={styles.avatarText}>{room.guestClub?.name?.charAt(4) || 'B'}</Text>
            </View>
            <Text style={styles.teamName} numberOfLines={1}>
              {room.guestClub?.name || 'Đội bạn'}
            </Text>

            <View style={styles.counterRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setGuestScoreNum(Math.max(0, guestScoreNum - 1))}
                style={styles.stepBtn}
              >
                <Ionicons name="remove" size={18} color={COLORS.primary} />
              </TouchableOpacity>

              <View style={styles.scoreNumBox}>
                <Text style={styles.scoreNumText}>{guestScoreNum}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setGuestScoreNum(guestScoreNum + 1)}
                style={styles.stepBtn}
              >
                <Ionicons name="add" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* Badminton / Tennis set inputs */
        <View style={styles.setContainer}>
          <Text style={styles.setTitle}>Tỷ số từng Set (Cầu lông/Pickleball):</Text>
          {sets.map((set, idx) => (
            <View key={idx} style={styles.setRow}>
              <View style={styles.setTag}>
                <Text style={styles.setTagText}>SET {idx + 1}</Text>
              </View>

              <View style={styles.setInputGroup}>
                <TextInput
                  style={styles.setInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={set.host}
                  onChangeText={(val) => {
                    const newSets = [...sets];
                    newSets[idx].host = val;
                    setSets(newSets);
                  }}
                />
                <Text style={styles.setDash}>-</Text>
                <TextInput
                  style={styles.setInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={set.guest}
                  onChangeText={(val) => {
                    const newSets = [...sets];
                    newSets[idx].guest = val;
                    setSets(newSets);
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Outcome Preview Card */}
      <View style={styles.previewCard}>
        <Ionicons name="trophy-outline" size={18} color={COLORS.primary} />
        <Text style={styles.previewLabel}>Dự kiến kết quả:</Text>
        <Text style={styles.previewValue} numberOfLines={1}>{winnerPreview.text}</Text>
      </View>

      {/* Super Handsome Action Submit Button */}
      <TouchableOpacity activeOpacity={0.88} onPress={handleSubmit} style={styles.submitBtn}>
        <View style={styles.trophyIconBg}>
          <Ionicons name="trophy" size={18} color={COLORS.secondary} />
        </View>
        <Text style={styles.submitBtnText}>XÁC NHẬN KẾT QUẢ & XEM ĐIỂM CRP (+/-)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity08,
    gap: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 16,
  },
  sportBadgeText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
  },
  scoreboardCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  avatarHost: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGuest: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.white,
    fontWeight: '800',
  },
  teamName: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 13,
    textAlign: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    width: 50,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scoreNumText: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
  },
  vsBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  vsText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    fontWeight: '900',
    fontSize: 10,
  },
  setContainer: {
    gap: 8,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  setTitle: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  setTag: {
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  setTagText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 10,
  },
  setInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    width: 44,
    height: 38,
    textAlign: 'center',
    fontWeight: '800',
    color: COLORS.primary,
    fontSize: 16,
  },
  setDash: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.onSurfaceVariant,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.full,
  },
  previewLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12.5,
    color: COLORS.onSurfaceVariant,
  },
  previewValue: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    color: COLORS.primary,
    flex: 1,
  },
  submitBtn: {
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
  submitBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 13.5,
    letterSpacing: 0.4,
  },
});
