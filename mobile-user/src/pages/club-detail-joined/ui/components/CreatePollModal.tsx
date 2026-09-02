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
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { CreateMatchPollPayload } from '../../../../shared/api/clubs';
import { CalendarPicker } from '../../../../shared/ui/CalendarPicker';

export interface CreatePollModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateMatchPollPayload) => void;
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
  const [maxPlayers, setMaxPlayers] = useState<string>('7');

  // Date & Time states
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default 1 day ahead
    return d;
  });
  const [selectedHour, setSelectedHour] = useState<number>(18);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  // Custom options (unlimited)
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [newOptionInput, setNewOptionInput] = useState('');

  const PRESETS = [
    { type: 'MATCHMAKING', title: 'Giao lưu ghép trận cuối tuần' },
    { type: 'MATCHMAKING', title: 'Tìm đối thủ thi đấu cọ sát phong trào' },
    { type: 'MATCHMAKING', title: 'Tuyển quân đá giao hữu sân 7' },
    { type: 'INTERNAL', title: 'Chia 2 đội giao lưu nội bộ CLB' },
    { type: 'INTERNAL', title: 'Buổi tập và thi đấu đối kháng' },
    { type: 'INTERNAL', title: 'Đấu tập nội bộ thứ Bảy' },
  ];

  const getMinPlayersHint = (sport?: string) => {
    if (!sport) return 1;
    const s = sport.toLowerCase();
    if (s.includes('bóng đá') || s.includes('football')) return 5;
    if (s.includes('bóng rổ') || s.includes('basketball')) return 3;
    return 1;
  };

  const minPlayers = getMinPlayersHint(clubSportName);

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

  const handleApplyDatePreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setSelectedDate(d);
  };

  const formatDateDisplay = (d: Date) => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[d.getDay()];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(selectedHour).padStart(2, '0');
    const min = String(selectedMinute).padStart(2, '0');
    return `${dayName}, ${dd}/${mm}/${yyyy} lúc ${hh}:${min}`;
  };

  const handleCreate = () => {
    if (!title.trim()) return;

    // Combine date + time for deadline
    const deadlineObj = new Date(selectedDate);
    deadlineObj.setHours(selectedHour, selectedMinute, 0, 0);

    const payload: CreateMatchPollPayload = {
      title: title.trim(),
      pollType,
      deadline: deadlineObj.toISOString(),
      minPlayers,
      maxPlayers: pollType === 'MATCHMAKING' ? (parseInt(maxPlayers, 10) || minPlayers) : undefined,
      customOptions: customOptions.length > 0 ? customOptions : undefined,
    };

    onSubmit(payload);
    // Reset form
    setTitle('');
    setCustomOptions([]);
    setNewOptionInput('');
    onClose();
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerTitleRow}>
                <MaterialIcons name="add-circle" size={20} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Tạo biểu quyết mới</Text>
              </View>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
                <MaterialIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Poll Type Tabs */}
              <View style={styles.typeTabsContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.typeTab, pollType === 'MATCHMAKING' && styles.typeTabActive]}
                  onPress={() => setPollType('MATCHMAKING')}
                >
                  <Ionicons
                    name="trophy"
                    size={16}
                    color={pollType === 'MATCHMAKING' ? '#FFFFFF' : '#64748B'}
                  />
                  <Text
                    style={[styles.typeTabText, pollType === 'MATCHMAKING' && styles.typeTabTextActive]}
                  >
                    Tìm đối thủ giao lưu
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.typeTab, pollType === 'INTERNAL' && styles.typeTabActive]}
                  onPress={() => setPollType('INTERNAL')}
                >
                  <Ionicons
                    name="people"
                    size={16}
                    color={pollType === 'INTERNAL' ? '#FFFFFF' : '#64748B'}
                  />
                  <Text
                    style={[styles.typeTabText, pollType === 'INTERNAL' && styles.typeTabTextActive]}
                  >
                    Giao lưu nội bộ CLB
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Explainer Card (Plain Vietnamese without jargons) */}
              <View style={styles.explainerCard}>
                <Ionicons
                  name="information-circle-outline"
                  size={17}
                  color={pollType === 'MATCHMAKING' ? '#B45309' : '#0369A1'}
                />
                <Text style={styles.explainerText}>
                  {pollType === 'MATCHMAKING'
                    ? 'Khi đủ quân số đăng ký, hệ thống sẽ chốt danh sách thành viên ra sân thi đấu để đại diện CLB tìm đối thủ giao lưu.'
                    : 'Hệ thống sẽ tự động phân phối các thành viên thành 2 đội thi đấu cân sức dựa trên trình độ và phong độ.'}
                </Text>
              </View>

              {/* Title Section */}
              <View style={styles.sectionBlock}>
                <Text style={styles.fieldLabel}>Tiêu đề biểu quyết</Text>
                <TextInput
                  style={styles.textInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Nhập tiêu đề hoặc chọn mẫu bên dưới..."
                  placeholderTextColor="#94A3B8"
                />

                {/* Suggestions */}
                <View style={styles.presetChipsRow}>
                  {PRESETS.filter((p) => p.type === pollType).map((p, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.presetChip, title === p.title && styles.presetChipActive]}
                      onPress={() => setTitle(p.title)}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          title === p.title && styles.presetChipTextActive,
                        ]}
                      >
                        {p.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Matchmaking Max Players (Only for Matchmaking) */}
              {pollType === 'MATCHMAKING' && (
                <View style={styles.sectionBlock}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldLabel}>Số lượng thành viên ra sân tối đa</Text>
                    <Text style={styles.fieldHint}>Tối thiểu môn {clubSportName || ''}: {minPlayers} người</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={maxPlayers}
                    onChangeText={setMaxPlayers}
                    placeholder={`Ví dụ: 7 (tối thiểu ${minPlayers})`}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              )}

              {/* Deadline with Native Calendar Picker Component */}
              <View style={styles.sectionBlock}>
                <Text style={styles.fieldLabel}>Thời hạn kết thúc biểu quyết</Text>

                {/* Date Display Card Clickable to open CalendarPicker */}
                <TouchableOpacity
                  style={styles.dateSelectorCard}
                  activeOpacity={0.8}
                  onPress={() => setIsCalendarVisible(true)}
                >
                  <View style={styles.dateSelectorLeft}>
                    <View style={styles.calendarIconCircle}>
                      <Ionicons name="calendar" size={18} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text style={styles.dateSelectorSub}>Chạm để đổi ngày kết thúc</Text>
                      <Text style={styles.dateSelectorTitle}>{formatDateDisplay(selectedDate)}</Text>
                    </View>
                  </View>
                  <View style={styles.openCalendarBtn}>
                    <Text style={styles.openCalendarBtnText}>Mở lịch</Text>
                    <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                  </View>
                </TouchableOpacity>

                {/* Quick Date Presets */}
                <View style={styles.presetChipsRow}>
                  {[
                    { days: 0, label: 'Hôm nay' },
                    { days: 1, label: 'Ngày mai' },
                    { days: 2, label: '2 ngày tới' },
                    { days: 3, label: '3 ngày tới' },
                    { days: 7, label: '1 tuần tới' },
                  ].map((preset) => (
                    <TouchableOpacity
                      key={preset.days}
                      style={styles.presetChip}
                      onPress={() => handleApplyDatePreset(preset.days)}
                    >
                      <Text style={styles.presetChipText}>{preset.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Quick Time Pickers */}
                <View style={styles.timePickerRow}>
                  <Text style={styles.timePickerLabel}>Giờ hết hạn:</Text>
                  {[
                    { h: 12, m: 0, label: '12:00' },
                    { h: 18, m: 0, label: '18:00' },
                    { h: 20, m: 0, label: '20:00' },
                    { h: 22, m: 0, label: '22:00' },
                  ].map((t) => (
                    <TouchableOpacity
                      key={t.label}
                      style={[
                        styles.timeChip,
                        selectedHour === t.h && selectedMinute === t.m && styles.timeChipActive,
                      ]}
                      onPress={() => {
                        setSelectedHour(t.h);
                        setSelectedMinute(t.m);
                      }}
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          selectedHour === t.h && selectedMinute === t.m && styles.timeChipTextActive,
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Poll Options Section: Locked defaults "Có" and "Không" + Unlimited custom */}
              <View style={styles.sectionBlock}>
                <Text style={styles.fieldLabel}>Lựa chọn biểu quyết</Text>
                <Text style={styles.subLabel}>
                  Thành viên sẽ bình chọn theo danh sách các lựa chọn bên dưới:
                </Text>

                {/* Fixed Default Option 1: "Có" */}
                <View style={styles.lockedOptionCard}>
                  <View style={styles.lockedOptionLeft}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={styles.lockedOptionTitle}>Có</Text>
                  </View>
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={11} color="#64748B" />
                    <Text style={styles.lockedBadgeText}>Mặc định • Cố định</Text>
                  </View>
                </View>

                {/* Fixed Default Option 2: "Không" */}
                <View style={styles.lockedOptionCard}>
                  <View style={styles.lockedOptionLeft}>
                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                    <Text style={styles.lockedOptionTitle}>Không</Text>
                  </View>
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={11} color="#64748B" />
                    <Text style={styles.lockedBadgeText}>Mặc định • Cố định</Text>
                  </View>
                </View>

                {/* Custom Options List (Unlimited) */}
                {customOptions.map((opt, i) => (
                  <View key={i} style={styles.customOptionCard}>
                    <View style={styles.customOptionLeft}>
                      <Ionicons name="radio-button-off" size={16} color="#0284C7" />
                      <Text style={styles.customOptionText}>{opt}</Text>
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

                {/* Add Custom Option Input Row (No Limit) */}
                <View style={styles.addOptionWrapper}>
                  <Text style={styles.addOptionHeader}>Thêm lựa chọn khác (Tùy chọn, không giới hạn):</Text>
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
                      style={[
                        styles.addOptionBtn,
                        !newOptionInput.trim() && styles.addOptionBtnDisabled,
                      ]}
                      disabled={!newOptionInput.trim()}
                      onPress={handleAddCustomOption}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                      <Text style={styles.addOptionBtnText}>Thêm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Footer Submit Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.submitBtn, !title.trim() && styles.submitBtnDisabled]}
                disabled={!title.trim()}
                activeOpacity={0.85}
                onPress={handleCreate}
              >
                <Text style={styles.submitBtnText}>Tạo biểu quyết</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Embedded CalendarPicker Component from Shared UI */}
      <CalendarPicker
        visible={isCalendarVisible}
        selectedDate={selectedDate}
        minimumDate={new Date()}
        onConfirm={(date) => {
          setSelectedDate(date);
          setIsCalendarVisible(false);
        }}
        onClose={() => setIsCalendarVisible(false)}
      />
    </>
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
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldHint: {
    ...TYPOGRAPHY.caption,
    color: '#D97706',
    fontWeight: '600',
    fontSize: 11,
  },
  subLabel: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 15,
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
    marginBottom: 8,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetChipActive: {
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    borderColor: COLORS.primary,
  },
  presetChipText: {
    ...TYPOGRAPHY.caption,
    color: '#475569',
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dateSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    marginBottom: 8,
  },
  dateSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  calendarIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSelectorSub: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontSize: 10.5,
  },
  dateSelectorTitle: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '800',
    color: '#0F172A',
    fontSize: 13,
  },
  openCalendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  openCalendarBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  timePickerLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: '#475569',
  },
  timeChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeChipText: {
    ...TYPOGRAPHY.caption,
    color: '#475569',
    fontWeight: '600',
    fontSize: 11,
  },
  timeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
});
