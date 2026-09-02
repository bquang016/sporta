import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { MatchRoomVM, NormalizedOutcome } from '../../../entities/match/model/match.types';
import { UserAvatar } from '../../../shared/ui/UserAvatar';

interface ScoreInputFormProps {
  room: MatchRoomVM;
  onSubmitScore: (hostScore: number | string, guestScore: number | string, details?: string) => void;
  loading?: boolean;
}

export function ScoreInputForm({ room, onSubmitScore, loading = false }: ScoreInputFormProps) {
  const isSetSport =
    room.booking.sportId === 'badminton' ||
    room.booking.sportId === 'pickleball' ||
    room.booking.sportId === 'tennis';

  const [hostScoreNum, setHostScoreNum] = useState<number>(0);
  const [guestScoreNum, setGuestScoreNum] = useState<number>(0);
  const [matchNotes, setMatchNotes] = useState<string>('');

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
      if (hostSetsWon > guestSetsWon) {
        return { text: `${room.hostClub.name} thắng (${hostSetsWon} - ${guestSetsWon})`, outcome: 'WIN_A' };
      }
      if (guestSetsWon > hostSetsWon) {
        return { text: `${room.guestClub?.name || 'Đội bạn'} thắng (${guestSetsWon} - ${hostSetsWon})`, outcome: 'WIN_B' };
      }
      return { text: `Hòa (${hostSetsWon} - ${guestSetsWon})`, outcome: 'DRAW' };
    } else {
      if (hostScoreNum > guestScoreNum) {
        return { text: `${room.hostClub.name} thắng (${hostScoreNum} - ${guestScoreNum})`, outcome: 'WIN_A' };
      }
      if (guestScoreNum > hostScoreNum) {
        return { text: `${room.guestClub?.name || 'Đội bạn'} thắng (${guestScoreNum} - ${hostScoreNum})`, outcome: 'WIN_B' };
      }
      return { text: `Hòa (${hostScoreNum} - ${guestScoreNum})`, outcome: 'DRAW' };
    }
  };

  const handleAddSet = () => {
    if (sets.length >= 5) return;
    setSets([...sets, { host: '0', guest: '0' }]);
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length <= 1) return;
    setSets(sets.filter((_, idx) => idx !== index));
  };

  const handleSubmit = () => {
    if (isSetSport) {
      const { hostSetsWon, guestSetsWon } = calculateSetWinner();
      const setDetails = sets.map((s, idx) => `Set ${idx + 1}: ${s.host}-${s.guest}`).join(', ');
      const fullDetails = matchNotes ? `${setDetails} • ${matchNotes}` : setDetails;
      onSubmitScore(hostSetsWon, guestSetsWon, fullDetails);
    } else {
      onSubmitScore(hostScoreNum, guestScoreNum, matchNotes || undefined);
    }
  };

  const winnerPreview = getWinnerPreview();
  const host = room.hostClub;
  const guest = room.guestClub;
  const hostAvatarUri = host?.avatarUrl || host?.logoUrl || (host as any)?.avatarImage;
  const guestAvatarUri = guest?.avatarUrl || guest?.logoUrl || (guest as any)?.avatarImage;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Nhập tỷ số chung cuộc</Text>

      {/* Standard Sport (Football, etc.) */}
      {!isSetSport ? (
        <View style={styles.scoreboardRow}>
          {/* Host Club */}
          <View style={styles.teamColumn}>
            <UserAvatar uri={hostAvatarUri} name={host.name} size={48} />
            <Text style={styles.teamName} numberOfLines={1}>{host.name}</Text>
            <Text style={styles.roleLabel}>Chủ nhà</Text>

            <View style={styles.counterControl}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setHostScoreNum(Math.max(0, hostScoreNum - 1))}
                style={styles.stepButton}
              >
                <Ionicons name="remove" size={18} color="#475569" />
              </TouchableOpacity>

              <Text style={styles.scoreText}>{hostScoreNum}</Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setHostScoreNum(hostScoreNum + 1)}
                style={[styles.stepButton, styles.stepButtonActive]}
              >
                <Ionicons name="add" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* VS Divider */}
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>-</Text>
          </View>

          {/* Guest Club */}
          <View style={styles.teamColumn}>
            <UserAvatar uri={guestAvatarUri} name={guest?.name || 'B'} size={48} />
            <Text style={styles.teamName} numberOfLines={1}>{guest?.name || 'Đội bạn'}</Text>
            <Text style={styles.roleLabel}>Đội khách</Text>

            <View style={styles.counterControl}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setGuestScoreNum(Math.max(0, guestScoreNum - 1))}
                style={styles.stepButton}
              >
                <Ionicons name="remove" size={18} color="#475569" />
              </TouchableOpacity>

              <Text style={styles.scoreText}>{guestScoreNum}</Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setGuestScoreNum(guestScoreNum + 1)}
                style={[styles.stepButton, styles.stepButtonActive]}
              >
                <Ionicons name="add" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* Set-based Sport (Badminton / Tennis / Pickleball) */
        <View style={styles.setSection}>
          <View style={styles.setHeader}>
            <Text style={styles.setSubTitle}>Tỷ số từng set</Text>
            {sets.length < 5 && (
              <TouchableOpacity activeOpacity={0.7} onPress={handleAddSet} style={styles.addSetTextBtn}>
                <Ionicons name="add" size={15} color={COLORS.primary} />
                <Text style={styles.addSetText}>Thêm set</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.setColumnsHeader}>
            <Text style={styles.setColTitle} numberOfLines={1}>{host.name}</Text>
            <View style={{ width: 44 }} />
            <Text style={styles.setColTitle} numberOfLines={1}>{guest?.name || 'Đội bạn'}</Text>
          </View>

          {sets.map((set, idx) => (
            <View key={idx} style={styles.setRow}>
              <TextInput
                style={styles.setInput}
                keyboardType="number-pad"
                maxLength={2}
                value={set.host}
                onChangeText={(val) => {
                  const next = [...sets];
                  next[idx].host = val;
                  setSets(next);
                }}
              />

              <View style={styles.setLabelBox}>
                <Text style={styles.setLabelText}>Set {idx + 1}</Text>
              </View>

              <TextInput
                style={styles.setInput}
                keyboardType="number-pad"
                maxLength={2}
                value={set.guest}
                onChangeText={(val) => {
                  const next = [...sets];
                  next[idx].guest = val;
                  setSets(next);
                }}
              />

              {sets.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveSet(idx)}
                  style={styles.deleteSetBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={15} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Outcome Preview */}
      <View style={styles.outcomeRow}>
        <Ionicons name="trophy-outline" size={15} color="#64748B" />
        <Text style={styles.outcomeLabel}>Dự kiến:</Text>
        <Text style={styles.outcomeText}>{winnerPreview.text}</Text>
      </View>

      {/* Optional Note */}
      <View style={styles.noteBox}>
        <TextInput
          style={styles.noteInput}
          placeholder="Ghi chú thêm (VD: Cầu thủ ghi bàn, hiệp phụ...)"
          placeholderTextColor="#94A3B8"
          value={matchNotes}
          onChangeText={setMatchNotes}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleSubmit}
        disabled={loading}
        style={[styles.submitButton, loading && { opacity: 0.6 }]}
      >
        <Text style={styles.submitButtonText}>Gửi tỷ số cho đối thủ xác nhận</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: SPACING.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  scoreboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  teamName: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
    textAlign: 'center',
  },
  roleLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: '#94A3B8',
  },
  counterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonActive: {
    backgroundColor: '#ECFDF5',
  },
  scoreText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    minWidth: 32,
    textAlign: 'center',
  },
  vsContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#94A3B8',
  },
  setSection: {
    gap: 8,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setSubTitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  addSetTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addSetText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  setColumnsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  setColTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  setInput: {
    width: 56,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  setLabelBox: {
    paddingHorizontal: 8,
  },
  setLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  deleteSetBtn: {
    padding: 4,
  },
  outcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  outcomeLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: '#64748B',
  },
  outcomeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  noteBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  noteInput: {
    fontSize: 12.5,
    color: '#0F172A',
    minHeight: 38,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
  },
  submitButtonText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
