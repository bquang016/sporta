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
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
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

  // Minimum and Max Players based on sport
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
      <View style={styles.modalOverlay}>
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
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
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

            {/* Section 1: Title Input (No Suggestions) */}
            <View style={styles.sectionBlock}>
              <Text style={styles.fieldLabel}>Tiêu đề biểu quyết <Text style={styles.requiredStar}>*</Text></Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Nhập tiêu đề biểu quyết..."
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Section 2: Dedicated Max Players Component (Only for Matchmaking) */}
            {pollType === 'MATCHMAKING' && (
              <PollMaxPlayersStepper
                value={maxPlayers}
                minPlayers={minPlayers}
                onChange={setMaxPlayers}
                sportName={clubSportName}
              />
            )}

            {/* Section 3: Dedicated Date Picker Component */}
            <PollDatePicker
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {/* Section 4: Dedicated Time Picker Component */}
            <PollTimePicker
              selectedHour={selectedHour}
              selectedMinute={selectedMinute}
              onChangeHour={setSelectedHour}
              onChangeMinute={setSelectedMinute}
            />

            {/* Section 5: Poll Options (Có, Không + Custom) */}
            <View style={styles.sectionBlock}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Lựa chọn biểu quyết</Text>
                <Text style={styles.fieldHint}>2 lựa chọn mặc định cố định</Text>
              </View>

              {/* Fixed Option 1: Có */}
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

              {/* Fixed Option 2: Không */}
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

              {/* Add Custom Option Input Row */}
              <View style={styles.addOptionWrapper}>
                <Text style={styles.addOptionHeader}>Thêm lựa chọn bổ sung (không giới hạn):</Text>
                <View style={styles.addOptionRow}>
                  <TextInput
                    style={styles.addOptionInput}
                    value={newOptionInput}
                    onChangeText={setNewOptionInput}
                    placeholder="Ví dụ: Đến muộn 15 phút, Chưa chắc chắn..."
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
            </View>
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!title.trim() || isSubmitting) && styles.submitBtnDisabled,
              ]}
              disabled={!title.trim() || isSubmitting}
              activeOpacity={0.85}
              onPress={handleCreate}
            >
              {isSubmitting ? (
                <View style={styles.submitLoadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Đang tạo biểu quyết...</Text>
                </View>
              ) : (
                <Text style={styles.submitBtnText}>Tạo biểu quyết</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
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
  scrollBody: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
  sectionBlock: {
    marginBottom: 14,
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
  fieldLabelRow: {
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
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
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
  addOptionWrapper: {
    marginTop: 6,
  },
  addOptionHeader: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 6,
  },
  addOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  submitLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
