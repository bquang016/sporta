import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
      if (guestScoreNum > hostScoreNum) return { text: `Thắng: ${room.guestClub?.name || 'Đội bạn'}`, outcome: 'WIN_B' };
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
      <Text style={styles.title}>Nhập tỷ số trận đấu</Text>
      <Text style={styles.subtitle}>
        Môn thi đấu: <Text style={{ fontWeight: '700' }}>{room.booking.sportName}</Text> ({room.booking.format})
      </Text>

      {!isSetSport ? (
        /* Football / Basketball numeric input with quick +/- buttons */
        <View style={styles.scoreRow}>
          {/* Host Club Counter */}
          <View style={styles.teamCol}>
            <Text style={styles.teamName} numberOfLines={1}>{room.hostClub.name}</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                onPress={() => setHostScoreNum(Math.max(0, hostScoreNum - 1))}
                style={styles.stepBtn}
              >
                <MaterialIcons name="remove" size={20} color={COLORS.onSurface} />
              </TouchableOpacity>

              <View style={styles.scoreNumBox}>
                <Text style={styles.scoreNumText}>{hostScoreNum}</Text>
              </View>

              <TouchableOpacity
                onPress={() => setHostScoreNum(hostScoreNum + 1)}
                style={styles.stepBtn}
              >
                <MaterialIcons name="add" size={20} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.versusText}>VS</Text>

          {/* Guest Club Counter */}
          <View style={styles.teamCol}>
            <Text style={styles.teamName} numberOfLines={1}>{room.guestClub?.name || 'Đội bạn'}</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                onPress={() => setGuestScoreNum(Math.max(0, guestScoreNum - 1))}
                style={styles.stepBtn}
              >
                <MaterialIcons name="remove" size={20} color={COLORS.onSurface} />
              </TouchableOpacity>

              <View style={styles.scoreNumBox}>
                <Text style={styles.scoreNumText}>{guestScoreNum}</Text>
              </View>

              <TouchableOpacity
                onPress={() => setGuestScoreNum(guestScoreNum + 1)}
                style={styles.stepBtn}
              >
                <MaterialIcons name="add" size={20} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* Badminton / Tennis set inputs */
        <View style={styles.setContainer}>
          {sets.map((set, idx) => (
            <View key={idx} style={styles.setRow}>
              <Text style={styles.setLabel}>Set {idx + 1}:</Text>
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
          ))}
        </View>
      )}

      {/* Live Preview Result Badge */}
      <View style={styles.previewBox}>
        <Text style={styles.previewLabel}>Dự kiến kết quả:</Text>
        <Text style={styles.previewText}>{winnerPreview.text}</Text>
      </View>

      <TouchableOpacity activeOpacity={0.85} onPress={handleSubmit} style={styles.submitBtn}>
        <MaterialIcons name="emoji-events" size={22} color={COLORS.white} />
        <Text style={styles.submitBtnText}>🏆 CHỐT KẾT QUẢ & XEM ĐIỂM CRP (+/-) NGAY</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 18,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
  },
  teamCol: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  teamName: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '700',
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    width: 52,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  versusText: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.outline,
    fontWeight: '800',
    marginHorizontal: 4,
  },
  setContainer: {
    gap: 8,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  setLabel: {
    ...TYPOGRAPHY.labelMd,
    width: 50,
    color: COLORS.onSurfaceVariant,
  },
  setInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: BORDER_RADIUS.sm,
    width: 44,
    height: 40,
    textAlign: 'center',
    fontWeight: '700',
  },
  setDash: {
    fontSize: 16,
    fontWeight: '700',
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
  },
  previewLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  previewText: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.primary,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.default,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
  },
});
