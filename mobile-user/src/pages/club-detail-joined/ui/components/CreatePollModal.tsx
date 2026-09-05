import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Button } from '../../../../shared/ui';
import { CreateMatchPollPayload } from '../../../../shared/api/clubs';
import { PollMaxPlayersStepper } from './PollMaxPlayersStepper';
import { PollDatePicker } from './PollDatePicker';
import { PollTimePicker } from './PollTimePicker';

export interface CreatePollModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateMatchPollPayload) => void | Promise<void>;
  clubSportName?: string;
}

export function CreatePollModal({
  visible,
  onClose,
  onSubmit,
  clubSportName,
}: CreatePollModalProps) {
  const [pollType, setPollType] = useState<'MATCHMAKING' | 'INTERNAL'>('MATCHMAKING');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Minimum and Default Max Players
  const getMinPlayersHint = (sport?: string) => {
    if (!sport) return 1;
    const s = sport.toLowerCase();
    if (s.includes('bóng đá') || s.includes('football')) return 5;
    if (s.includes('bóng rổ') || s.includes('basketball')) return 3;
    if (s.includes('cầu lông') || s.includes('badminton') || s.includes('pickleball')) return 2;
    return 1;
  };

  const minPlayers = getMinPlayersHint(clubSportName);
  const defaultMax = minPlayers >= 5 ? 7 : (minPlayers === 3 ? 5 : (minPlayers === 2 ? 4 : 2));
  const [maxPlayers, setMaxPlayers] = useState<number>(defaultMax);

  // Date & Time states
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default 1 day ahead
    return d;
  });
  const [selectedHour, setSelectedHour] = useState<number>(18);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);

  // Custom options (unlimited)
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [newOptionInput, setNewOptionInput] = useState('');

  const handleAddCustomOption = () => {
    const trimmed = newOptionInput.trim();
    if (!trimmed) return;
    if (customOptions.includes(trimmed)) return;
    setCustomOptions([...customOptions, trimmed]);
    setNewOptionInput('');
  };

  const handleRemoveOption = (index: number) => {
    setCustomOptions(customOptions.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const deadlineObj = new Date(selectedDate);
      deadlineObj.setHours(selectedHour, selectedMinute, 0, 0);

      const payload: CreateMatchPollPayload = {
        title: title.trim(),
        pollType,
        deadline: deadlineObj.toISOString(),
        minPlayers,
        maxPlayers: pollType === 'MATCHMAKING' ? maxPlayers : undefined,
        customOptions: customOptions.length > 0 ? customOptions : undefined,
      };

      await onSubmit(payload);

      // Reset form
      setTitle('');
      setCustomOptions([]);
      setNewOptionInput('');
    } catch (err) {
      // Handled by caller
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="stats-chart" size={18} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Tạo biểu quyết mới</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {/* Poll Type Tabs */}
            <View style={styles.typeTabsContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.typeTab, pollType === 'MATCHMAKING' && styles.typeTabActive]}
                onPress={() => setPollType('MATCHMAKING')}
              >
                <Ionicons
                  name="trophy"
                  size={14}
                  color={pollType === 'MATCHMAKING' ? '#FFFFFF' : '#64748B'}
                />
                <Text style={[styles.typeTabText, pollType === 'MATCHMAKING' && styles.typeTabTextActive]}>
                  Ghép trận đối thủ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.typeTab, pollType === 'INTERNAL' && styles.typeTabActive]}
                onPress={() => setPollType('INTERNAL')}
              >
                <Ionicons
                  name="people"
                  size={14}
                  color={pollType === 'INTERNAL' ? '#FFFFFF' : '#64748B'}
                />
                <Text style={[styles.typeTabText, pollType === 'INTERNAL' && styles.typeTabTextActive]}>
                  Giao lưu nội bộ
                </Text>
              </TouchableOpacity>
            </View>

            {/* Explainer Card */}
            <View style={styles.explainerCard}>
              <Ionicons name="information-circle-outline" size={16} color="#64748B" />
              <Text style={styles.explainerText}>
                {pollType === 'MATCHMAKING'
                  ? 'Khi đủ quân số đăng ký, hệ thống sẽ chốt danh sách thi đấu đại diện CLB tìm đối thủ giao lưu.'
                  : 'Hệ thống tự động phân phối các thành viên thành 2 đội thi đấu cân sức theo trình độ.'}
              </Text>
            </View>

            {/* Title Input Card */}
            <View style={styles.inputCard}>
              <Text style={styles.fieldLabel}>
                Tiêu đề biểu quyết <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Nhập tiêu đề biểu quyết..."
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Max Players Stepper (Only for Matchmaking) */}
            {pollType === 'MATCHMAKING' && (
              <PollMaxPlayersStepper
                value={maxPlayers}
                minPlayers={minPlayers}
                onChange={setMaxPlayers}
                sportName={clubSportName}
              />
            )}

            {/* Date Picker */}
            <PollDatePicker
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {/* Time Picker */}
            <PollTimePicker
              selectedHour={selectedHour}
              selectedMinute={selectedMinute}
              onChangeHour={setSelectedHour}
              onChangeMinute={setSelectedMinute}
            />

            {/* Poll Options Section */}
            <View style={styles.optionsSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.fieldLabel}>Lựa chọn biểu quyết</Text>
                <Text style={styles.fieldHint}>2 lựa chọn mặc định cố định</Text>
              </View>

              {/* Option 1: Có */}
              <View style={styles.lockedOptionCard}>
                <View style={styles.lockedOptionLeft}>
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  <Text style={styles.lockedOptionTitle}>Có (Tham gia thi đấu)</Text>
                </View>
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={11} color="#64748B" />
                  <Text style={styles.lockedBadgeText}>Mặc định</Text>
                </View>
              </View>

              {/* Option 2: Không */}
              <View style={styles.lockedOptionCard}>
                <View style={styles.lockedOptionLeft}>
                  <Ionicons name="close-circle" size={18} color="#EF4444" />
                  <Text style={styles.lockedOptionTitle}>Không (Bận / Vắng mặt)</Text>
                </View>
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={11} color="#64748B" />
                  <Text style={styles.lockedBadgeText}>Mặc định</Text>
                </View>
              </View>

              {/* Custom Options List */}
              {customOptions.map((opt, i) => (
                <View key={i} style={styles.customOptionCard}>
                  <View style={styles.customOptionLeft}>
                    <Ionicons name="radio-button-on" size={16} color={COLORS.primary} />
                    <Text style={styles.customOptionText} numberOfLines={1}>{opt}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveOption(i)}
                    style={styles.removeOptionBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add Custom Option Input */}
              <View style={styles.addOptionRow}>
                <TextInput
                  style={styles.addOptionInput}
                  value={newOptionInput}
                  onChangeText={setNewOptionInput}
                  placeholder="Thêm lựa chọn khác (VD: Đến muộn 15p)..."
                  placeholderTextColor="#94A3B8"
                  onSubmitEditing={handleAddCustomOption}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.addOptionBtn, !newOptionInput.trim() && styles.addOptionBtnDisabled]}
                  disabled={!newOptionInput.trim()}
                  onPress={handleAddCustomOption}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.addOptionBtnText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.modalFooter}>
            <Button
              title="Tạo biểu quyết"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={!title.trim() || isSubmitting}
              onPress={handleCreate}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    height: '88%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
    flexShrink: 1,
  },
  scrollBody: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  typeTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.sm,
    gap: 4,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
  },
  typeTabActive: {
    backgroundColor: COLORS.primary,
  },
  typeTabText: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    fontWeight: '700',
    fontSize: 12,
  },
  typeTabTextActive: {
    color: '#FFFFFF',
  },
  explainerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    padding: 10,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  explainerText: {
    ...TYPOGRAPHY.caption,
    color: '#475569',
    flex: 1,
    lineHeight: 16,
    fontSize: 12,
  },
  inputCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  fieldLabel: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0F172A',
  },
  optionsSection: {
    marginTop: 2,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldHint: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  lockedOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  lockedOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedOptionTitle: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 13.5,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  lockedBadgeText: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '600',
  },
  customOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 6,
  },
  customOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  customOptionText: {
    ...TYPOGRAPHY.bodySm,
    color: '#0369A1',
    fontWeight: '700',
    fontSize: 13,
  },
  removeOptionBtn: {
    padding: 4,
  },
  addOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  addOptionInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
  },
  addOptionBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  addOptionBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  modalFooter: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.md + 4 : SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  submitBtn: {
    width: '100%',
  },
});
