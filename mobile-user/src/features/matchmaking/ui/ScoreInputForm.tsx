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
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="trophy" size={16} color="#D97706" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Nhập Tỷ Số Trận Đấu</Text>
          <Text style={styles.sportBadgeText}>{room.booking.sportName} • {room.booking.format}</Text>
        </View>
      </View>

      {!isSetSport ? (
        /* Digital Scoreboard Card */
        <View style={styles.scoreboardCard}>
          {/* Host Club Counter */}
          <View style={styles.teamCol}>
            <View style={styles.avatarHost}>
              <Text style={styles.avatarText}>{room.hostClub.name.charAt(0) || 'A'}</Text>
            </View>
            <Text style={styles.teamName} numberOfLines={1}>
              {room.hostClub.name}
            </Text>
            <Text style={styles.roleLabel}>Chủ room (Bên A)</Text>

            <View style={styles.counterRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setHostScoreNum(Math.max(0, hostScoreNum - 1))}
                style={styles.stepBtn}
              >
                <Ionicons name="remove" size={18} color="#0F172A" />
              </TouchableOpacity>

              <View style={styles.scoreNumBox}>
                <Text style={styles.scoreNumText}>{hostScoreNum}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setHostScoreNum(hostScoreNum + 1)}
                style={styles.stepBtn}
              >
                <Ionicons name="add" size={18} color="#0F172A" />
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
              <Text style={styles.avatarText}>{room.guestClub?.name?.charAt(0) || 'B'}</Text>
            </View>
            <Text style={styles.teamName} numberOfLines={1}>
              {room.guestClub?.name || 'Đội bạn'}
            </Text>
            <Text style={styles.roleLabel}>Đối thủ (Bên B)</Text>

            <View style={styles.counterRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setGuestScoreNum(Math.max(0, guestScoreNum - 1))}
                style={styles.stepBtn}
              >
                <Ionicons name="remove" size={18} color="#0F172A" />
              </TouchableOpacity>

              <View style={styles.scoreNumBox}>
                <Text style={styles.scoreNumText}>{guestScoreNum}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setGuestScoreNum(guestScoreNum + 1)}
                style={styles.stepBtn}
              >
                <Ionicons name="add" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* Badminton / Pickleball set inputs */
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
        <Ionicons name="ribbon" size={18} color={COLORS.primary} />
        <Text style={styles.previewLabel}>Dự kiến:</Text>
        <Text style={styles.previewValue} numberOfLines={1}>{winnerPreview.text}</Text>
      </View>

      {/* Action Submit Button */}
      <TouchableOpacity activeOpacity={0.88} onPress={handleSubmit} style={styles.submitBtn}>
        <Ionicons name="checkmark-done-circle" size={20} color="#FFFFFF" />
        <Text style={styles.submitBtnText}>Xác nhận & Gửi Tỷ Số Cho Bên B</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 15.5,
  },
  sportBadgeText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#64748B',
    fontSize: 12,
  },
  scoreboardCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  avatarHost: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarGuest: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    ...TYPOGRAPHY.titleMd,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  teamName: {
    ...TYPOGRAPHY.titleSm,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 13,
    textAlign: 'center',
  },
  roleLabel: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    width: 48,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scoreNumText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  vsBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  vsText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
  },
  setContainer: {
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
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
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  setTag: {
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  setTagText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 10.5,
  },
  setInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    width: 42,
    height: 36,
    textAlign: 'center',
    fontWeight: '800',
    color: COLORS.primary,
    fontSize: 15,
  },
  setDash: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
  },
  previewLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12.5,
    color: '#64748B',
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
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  submitBtnText: {
    ...TYPOGRAPHY.titleSm,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
