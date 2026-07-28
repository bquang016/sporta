import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Button } from '../../../../shared/ui';
import { Club } from '../../../../entities/club';
import { addClubMatchApi, ClubMatchPayload } from '../../../../shared/api/clubs';
import { useAlert } from '../../../../shared/contexts/AlertContext';

export interface CreateMatchModalProps {
  visible: boolean;
  onClose: () => void;
  club: Club;
  onSuccess: () => void;
}

export function CreateMatchModal({ visible, onClose, club, onSuccess }: CreateMatchModalProps) {
  const { showAlert } = useAlert();

  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const [opponentName, setOpponentName] = useState('');
  const [ourScore, setOurScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const [date, setDate] = useState(todayStr);
  const [location, setLocation] = useState('');
  const [result, setResult] = useState<'WIN' | 'LOSE' | 'DRAW'>('WIN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto calculate result based on scores
  const handleOurScoreChange = (val: string) => {
    setOurScore(val);
    updateResult(val, opponentScore);
  };

  const handleOpponentScoreChange = (val: string) => {
    setOpponentScore(val);
    updateResult(ourScore, val);
  };

  const updateResult = (our: string, opp: string) => {
    const nOur = parseInt(our, 10);
    const nOpp = parseInt(opp, 10);
    if (!isNaN(nOur) && !isNaN(nOpp)) {
      if (nOur > nOpp) setResult('WIN');
      else if (nOur < nOpp) setResult('LOSE');
      else setResult('DRAW');
    }
  };

  const handleSubmit = async () => {
    if (!opponentName.trim()) {
      showAlert('Lỗi nhập liệu', 'Vui lòng nhập tên câu lạc bộ đối thủ.');
      return;
    }
    const nOur = parseInt(ourScore, 10);
    const nOpp = parseInt(opponentScore, 10);
    if (isNaN(nOur) || nOur < 0 || isNaN(nOpp) || nOpp < 0) {
      showAlert('Lỗi nhập liệu', 'Vui lòng nhập điểm số hợp lệ (từ 0 trở lên).');
      return;
    }
    if (!date.trim()) {
      showAlert('Lỗi nhập liệu', 'Vui lòng nhập ngày thi đấu.');
      return;
    }

    const payload: ClubMatchPayload = {
      opponentName: opponentName.trim(),
      date: date.trim(),
      ourScore: nOur,
      opponentScore: nOpp,
      result: result,
      location: location.trim() || 'Chưa xác định sân',
      opponentAvatar: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=100&auto=format&fit=crop&q=80',
    };

    setIsSubmitting(true);
    try {
      await addClubMatchApi(club.id, payload);
      showAlert('Thành công', 'Đã ghi nhận kết quả trận đấu mới!');
      setOpponentName('');
      setOurScore('');
      setOpponentScore('');
      setLocation('');
      onClose();
      onSuccess();
    } catch (err: any) {
      showAlert('Lỗi', err.message || 'Không thể ghi nhận trận đấu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => !isSubmitting && onClose()}
    >
      <SafeAreaProvider>
        <View style={styles.container}>
          <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.closeButton} 
                activeOpacity={0.7} 
                disabled={isSubmitting}
                onPress={onClose}
              >
                <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Ghi nhận trận đấu</Text>
              <View style={styles.headerPlaceholder} />
            </View>
          </SafeAreaView>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              {/* Opponent Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tên CLB đối thủ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: CLB Hải Âu, FC Rồng Vàng..."
                  placeholderTextColor={COLORS.outline}
                  value={opponentName}
                  onChangeText={setOpponentName}
                />
              </View>

              {/* Scoreboard Input Row */}
              <View style={styles.scoreRowContainer}>
                <View style={styles.scoreCol}>
                  <Text style={styles.scoreColLabel} numberOfLines={1}>
                    {club?.name || 'Đội nhà'}
                  </Text>
                  <TextInput
                    style={styles.scoreInput}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.outline}
                    value={ourScore}
                    onChangeText={handleOurScoreChange}
                  />
                </View>

                <Text style={styles.scoreVS}>-</Text>

                <View style={styles.scoreCol}>
                  <Text style={styles.scoreColLabel} numberOfLines={1}>
                    {opponentName || 'Đối thủ'}
                  </Text>
                  <TextInput
                    style={styles.scoreInput}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.outline}
                    value={opponentScore}
                    onChangeText={handleOpponentScoreChange}
                  />
                </View>
              </View>

              {/* Result Select Chips */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Kết quả trận đấu</Text>
                <View style={styles.resultChipsRow}>
                  <TouchableOpacity
                    style={[
                      styles.resultChip,
                      result === 'WIN' && styles.resultChipWin
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setResult('WIN')}
                  >
                    <Text style={[
                      styles.resultChipText,
                      result === 'WIN' && styles.resultChipTextActive
                    ]}>
                      THẮNG
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.resultChip,
                      result === 'DRAW' && styles.resultChipDraw
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setResult('DRAW')}
                  >
                    <Text style={[
                      styles.resultChipText,
                      result === 'DRAW' && styles.resultChipTextActive
                    ]}>
                      HÒA
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.resultChip,
                      result === 'LOSE' && styles.resultChipLose
                    ]}
                    activeOpacity={0.8}
                    onPress={() => setResult('LOSE')}
                  >
                    <Text style={[
                      styles.resultChipText,
                      result === 'LOSE' && styles.resultChipTextActive
                    ]}>
                      THUA
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Date Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngày thi đấu (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.outline}
                  value={date}
                  onChangeText={setDate}
                />
              </View>

              {/* Location Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Địa điểm thi đấu</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tên sân vận động, nhà thi đấu..."
                  placeholderTextColor={COLORS.outline}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.footer}>
            <Button
              title="Lưu kết quả"
              loading={isSubmitting}
              onPress={handleSubmit}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
    gap: SPACING.lg,
  },
  inputGroup: {
    gap: SPACING.xs + 2,
  },
  label: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    fontSize: 14,
    color: COLORS.onSurface,
    backgroundColor: COLORS.surface,
  },
  scoreRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
  },
  scoreCol: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  scoreColLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  scoreInput: {
    width: 60,
    height: 50,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  scoreVS: {
    ...TYPOGRAPHY.headlineLg,
    fontSize: 24,
    color: COLORS.outline,
    marginHorizontal: SPACING.sm,
  },
  resultChipsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  resultChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  resultChipWin: {
    backgroundColor: COLORS.successOpacity10,
    borderColor: COLORS.successText,
  },
  resultChipDraw: {
    backgroundColor: COLORS.grayOpacity10,
    borderColor: COLORS.grayText,
  },
  resultChipLose: {
    backgroundColor: COLORS.errorOpacity10,
    borderColor: COLORS.errorText,
  },
  resultChipText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
  },
  resultChipTextActive: {
    fontWeight: '800',
  },
  footer: {
    padding: SPACING.marginMobile,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  submitBtn: {
    width: '100%',
  },
});
