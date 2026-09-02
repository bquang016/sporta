import React, { useState, useMemo } from 'react';
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
import { COLORS, SPACING, BORDER_RADIUS } from '../../../../shared/config/theme';
import { CreateMatchPollPayload } from '../../../../shared/api/clubs';

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stepper state for Max Players
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
  const [isCalendarExpanded, setIsCalendarExpanded] = useState<boolean>(false);

  // Embedded Calendar viewing year & month
  const [viewYear, setViewYear] = useState<number>(() => selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => selectedDate.getMonth()); // 0-11

  // Custom options (unlimited)
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [newOptionInput, setNewOptionInput] = useState('');

  const PRESETS = [
    { type: 'MATCHMAKING', title: 'Giao lưu ghép trận cuối tuần' },
    { type: 'MATCHMAKING', title: 'Tìm đối thủ thi đấu cọ sát phong trào' },
    { type: 'MATCHMAKING', title: 'Tuyển quân đá giao hữu' },
    { type: 'MATCHMAKING', title: 'Giao lưu thi đấu đối kháng buổi tối' },
    { type: 'INTERNAL', title: 'Chia 2 đội giao lưu nội bộ CLB' },
    { type: 'INTERNAL', title: 'Buổi tập và thi đấu đối kháng' },
    { type: 'INTERNAL', title: 'Đấu tập nội bộ cuối tuần' },
    { type: 'INTERNAL', title: 'Giao lưu nội bộ tính điểm xếp hạng' },
  ];

  const filteredPresets = useMemo(() => {
    return PRESETS.filter((p) => p.type === pollType);
  }, [pollType]);

  const quickPlayerPresets = useMemo(() => {
    const s = (clubSportName || '').toLowerCase();
    if (s.includes('bóng đá') || s.includes('football')) return [5, 7, 11];
    if (s.includes('bóng rổ') || s.includes('basketball')) return [3, 5];
    if (s.includes('cầu lông') || s.includes('badminton') || s.includes('pickleball')) return [2, 4];
    return [2, 4, 6];
  }, [clubSportName]);

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
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const formatDateDisplay = (d: Date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayName = days[d.getDay()];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(selectedHour).padStart(2, '0');
    const min = String(selectedMinute).padStart(2, '0');
    return `${dayName}, ${dd}/${mm}/${yyyy} • ${hh}:${min}`;
  };

  // Embedded Calendar Grid calculation
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
    const startCol = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // 0 = Mon ... 6 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: Array<{ day: number | null; dateObj: Date | null; isPast: boolean; isSelected: boolean }> = [];
    for (let i = 0; i < startCol; i++) {
      cells.push({ day: null, dateObj: null, isPast: false, isSelected: false });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(viewYear, viewMonth, day);
      cellDate.setHours(0, 0, 0, 0);
      const isPast = cellDate < today;
      const isSelected =
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === viewMonth &&
        selectedDate.getFullYear() === viewYear;

      cells.push({ day, dateObj: cellDate, isPast, isSelected });
    }

    return cells;
  }, [viewYear, viewMonth, selectedDate]);

  const handlePrevMonth = () => {
    const now = new Date();
    const isCurrentOrPastMonth = viewYear === now.getFullYear() && viewMonth <= now.getMonth();
    if (isCurrentOrPastMonth) return;

    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
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

      setTitle('');
      setCustomOptions([]);
      setNewOptionInput('');
      setShowSuggestions(false);
      setIsCalendarExpanded(false);
    } catch (err) {
      // Handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const TIME_PRESETS = [
    { hour: 6, min: 0, label: '06:00' },
    { hour: 7, min: 30, label: '07:30' },
    { hour: 17, min: 0, label: '17:00' },
    { hour: 18, min: 0, label: '18:00' },
    { hour: 19, min: 30, label: '19:30' },
    { hour: 20, min: 0, label: '20:00' },
  ];

  const now = new Date();
  const isAtCurrentMonth = viewYear === now.getFullYear() && viewMonth <= now.getMonth();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalContent}>
          {/* Drag Handle */}
          <View style={styles.dragHandleWrap}>
            <View style={styles.dragHandle} />
          </View>

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="stats-chart" size={16} color="#064E3B" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Tạo biểu quyết</Text>
                <Text style={styles.modalSubTitle}>Lấy ý kiến & chốt đội hình</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <MaterialIcons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* Poll Type Segmented Control */}
            <View style={styles.typeTabsContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.typeTab, pollType === 'MATCHMAKING' && styles.typeTabActive]}
                onPress={() => setPollType('MATCHMAKING')}
              >
                <Ionicons
                  name="trophy"
                  size={13}
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
                  size={13}
                  color={pollType === 'INTERNAL' ? '#FFFFFF' : '#64748B'}
                />
                <Text style={[styles.typeTabText, pollType === 'INTERNAL' && styles.typeTabTextActive]}>
                  Giao lưu nội bộ
                </Text>
              </TouchableOpacity>
            </View>

            {/* Explainer Card */}
            <View style={styles.explainerCard}>
              <Ionicons name="information-circle" size={15} color="#064E3B" />
              <Text style={styles.explainerText}>
                {pollType === 'MATCHMAKING'
                  ? 'Đủ quân số sẽ chốt danh sách thi đấu đại diện CLB tìm đối thủ giao lưu.'
                  : 'Tự động phân phối thành viên thành 2 đội thi đấu cân sức theo trình độ.'}
              </Text>
            </View>

            {/* Section 1: Title Input */}
            <View style={styles.sectionBlock}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Tiêu đề biểu quyết <Text style={styles.requiredStar}>*</Text></Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowSuggestions(!showSuggestions)}
                  style={styles.suggestionLinkBtn}
                >
                  <Ionicons name={showSuggestions ? "chevron-up" : "bulb-outline"} size={13} color="#059669" />
                  <Text style={styles.suggestionLinkText}>
                    {showSuggestions ? 'Ẩn gợi ý' : `Gợi ý mẫu (${filteredPresets.length})`}
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Nhập tiêu đề biểu quyết..."
                placeholderTextColor="#94A3B8"
              />

              {/* Suggestions List */}
              {showSuggestions && (
                <View style={styles.presetChipsContainer}>
                  {filteredPresets.map((p, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.presetChip, title === p.title && styles.presetChipActive]}
                      onPress={() => setTitle(p.title)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.presetChipText, title === p.title && styles.presetChipTextActive]}>
                        {p.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Section 2: Max Players Stepper (Only for Matchmaking) */}
            {pollType === 'MATCHMAKING' && (
              <View style={styles.sectionBlock}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Quân số ra sân tối đa</Text>
                  <Text style={styles.fieldHint}>Tối thiểu môn {clubSportName || ''}: {minPlayers} người</Text>
                </View>

                {/* Compact Inline Stepper + Quick Presets */}
                <View style={styles.stepperRow}>
                  <View style={styles.stepperControl}>
                    <TouchableOpacity
                      style={[styles.stepperBtn, maxPlayers <= minPlayers && styles.stepperBtnDisabled]}
                      disabled={maxPlayers <= minPlayers}
                      onPress={() => setMaxPlayers(Math.max(minPlayers, maxPlayers - 1))}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="remove"
                        size={15}
                        color={maxPlayers <= minPlayers ? '#CBD5E1' : '#064E3B'}
                      />
                    </TouchableOpacity>

                    <View style={styles.stepperValueContainer}>
                      <Text style={styles.stepperValueText}>{maxPlayers}</Text>
                      <Text style={styles.stepperUnitText}>người</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => setMaxPlayers(maxPlayers + 1)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={15} color="#064E3B" />
                    </TouchableOpacity>
                  </View>

                  {/* Inline Quick Presets */}
                  <View style={styles.quickPresetsInline}>
                    <Text style={styles.quickPresetsLabel}>Gợi ý:</Text>
                    {quickPlayerPresets.map((qty) => (
                      <TouchableOpacity
                        key={qty}
                        style={[styles.quickPresetPill, maxPlayers === qty && styles.quickPresetPillActive]}
                        onPress={() => setMaxPlayers(qty)}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.quickPresetPillText, maxPlayers === qty && styles.quickPresetPillTextActive]}>
                          {qty}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Section 3: Deadline & Embedded Calendar */}
            <View style={styles.sectionBlock}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Hạn kết thúc biểu quyết</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
                  style={styles.dateActionBtn}
                >
                  <Ionicons name={isCalendarExpanded ? 'chevron-up' : 'calendar-outline'} size={13} color="#064E3B" />
                  <Text style={styles.dateActionBtnText}>
                    {isCalendarExpanded ? 'Đóng lịch' : 'Chọn ngày'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Date Display Pill */}
              <TouchableOpacity
                style={[styles.dateSelectorCard, isCalendarExpanded && styles.dateSelectorCardActive]}
                activeOpacity={0.8}
                onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
              >
                <View style={styles.dateSelectorLeft}>
                  <View style={styles.calendarIconMini}>
                    <Ionicons name="calendar" size={14} color="#064E3B" />
                  </View>
                  <Text style={styles.dateSelectorTitle}>{formatDateDisplay(selectedDate)}</Text>
                </View>
                <Ionicons name="chevron-down" size={14} color="#94A3B8" />
              </TouchableOpacity>

              {/* Embedded Calendar View */}
              {isCalendarExpanded && (
                <View style={styles.embeddedCalendarCard}>
                  {/* Quick Presets */}
                  <View style={styles.calendarQuickPresets}>
                    <TouchableOpacity style={styles.calendarQuickBtn} onPress={() => handleApplyDatePreset(0)}>
                      <Text style={styles.calendarQuickBtnText}>Hôm nay</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.calendarQuickBtn} onPress={() => handleApplyDatePreset(1)}>
                      <Text style={styles.calendarQuickBtnText}>Ngày mai</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.calendarQuickBtn} onPress={() => handleApplyDatePreset(3)}>
                      <Text style={styles.calendarQuickBtnText}>+3 ngày</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.calendarQuickBtn}
                      onPress={() => {
                        const d = new Date();
                        const day = d.getDay();
                        const diff = (6 - day + 7) % 7 || 7;
                        handleApplyDatePreset(diff);
                      }}
                    >
                      <Text style={styles.calendarQuickBtnText}>Cuối tuần</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Month Header */}
                  <View style={styles.calendarMonthHeader}>
                    <TouchableOpacity
                      style={[styles.calendarNavBtn, isAtCurrentMonth && styles.calendarNavBtnDisabled]}
                      disabled={isAtCurrentMonth}
                      onPress={handlePrevMonth}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="chevron-back" size={15} color={isAtCurrentMonth ? '#CBD5E1' : '#064E3B'} />
                    </TouchableOpacity>

                    <Text style={styles.calendarMonthTitle}>
                      Tháng {viewMonth + 1}, {viewYear}
                    </Text>

                    <TouchableOpacity style={styles.calendarNavBtn} onPress={handleNextMonth} activeOpacity={0.7}>
                      <Ionicons name="chevron-forward" size={15} color="#064E3B" />
                    </TouchableOpacity>
                  </View>

                  {/* Weekday Row */}
                  <View style={styles.calendarWeekdaysRow}>
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((wd, i) => (
                      <Text key={i} style={styles.calendarWeekdayText}>{wd}</Text>
                    ))}
                  </View>

                  {/* Days Grid */}
                  <View style={styles.calendarDaysGrid}>
                    {calendarGrid.map((cell, index) => {
                      if (!cell.day) {
                        return <View key={index} style={styles.calendarDayEmpty} />;
                      }

                      return (
                        <TouchableOpacity
                          key={index}
                          style={[styles.calendarDayCell, cell.isSelected && styles.calendarDayCellSelected]}
                          disabled={cell.isPast}
                          onPress={() => cell.dateObj && setSelectedDate(cell.dateObj)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.calendarDayText,
                              cell.isPast && styles.calendarDayTextPast,
                              cell.isSelected && styles.calendarDayTextSelected,
                            ]}
                          >
                            {cell.day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Confirm Day Button */}
                  <TouchableOpacity
                    style={styles.calendarDoneBtn}
                    onPress={() => setIsCalendarExpanded(false)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark" size={14} color="#064E3B" />
                    <Text style={styles.calendarDoneBtnText}>Xác nhận ngày</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Time Presets Row */}
              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>Giờ kết thúc:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeChipsRow}>
                  {TIME_PRESETS.map((tp, idx) => {
                    const isSelected = selectedHour === tp.hour && selectedMinute === tp.min;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.timePresetChip, isSelected && styles.timePresetChipActive]}
                        onPress={() => {
                          setSelectedHour(tp.hour);
                          setSelectedMinute(tp.min);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.timePresetChipText, isSelected && styles.timePresetChipTextActive]}>
                          {tp.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Section 4: Poll Options */}
            <View style={styles.sectionBlock}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Lựa chọn biểu quyết</Text>
                <Text style={styles.fieldHint}>Có / Không cố định</Text>
              </View>

              {/* Fixed Option 1: Có */}
              <View style={styles.lockedOptionCard}>
                <View style={styles.lockedOptionLeft}>
                  <View style={styles.dotGreen} />
                  <Text style={styles.lockedOptionTitle}>Có (Tham gia)</Text>
                </View>
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={10} color="#064E3B" />
                  <Text style={styles.lockedBadgeText}>Mặc định</Text>
                </View>
              </View>

              {/* Fixed Option 2: Không */}
              <View style={styles.lockedOptionCard}>
                <View style={styles.lockedOptionLeft}>
                  <View style={styles.dotRed} />
                  <Text style={styles.lockedOptionTitle}>Không (Bận / Vắng)</Text>
                </View>
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={10} color="#064E3B" />
                  <Text style={styles.lockedBadgeText}>Mặc định</Text>
                </View>
              </View>

              {/* Custom Options List */}
              {customOptions.map((opt, i) => (
                <View key={i} style={styles.customOptionCard}>
                  <View style={styles.customOptionLeft}>
                    <Ionicons name="checkbox-outline" size={14} color="#059669" />
                    <Text style={styles.customOptionText} numberOfLines={1}>{opt}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveOption(i)}
                    style={styles.removeOptionBtn}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add Custom Option Input Row */}
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
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.addOptionBtnText}>Thêm</Text>
                </TouchableOpacity>
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  dragHandleWrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 2,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  modalSubTitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrollBody: {
    paddingHorizontal: SPACING.md,
    paddingTop: 12,
    paddingBottom: 20,
  },
  typeTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 2.5,
    marginBottom: 10,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: 8,
  },
  typeTabActive: {
    backgroundColor: '#064E3B',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  typeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  explainerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  explainerText: {
    flex: 1,
    fontSize: 11.5,
    color: '#064E3B',
    lineHeight: 16,
    fontWeight: '500',
  },
  sectionBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  requiredStar: {
    color: '#EF4444',
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  fieldHint: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  suggestionLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  suggestionLinkText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  presetChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  presetChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  presetChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  presetChipText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stepperControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 7,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnDisabled: {
    backgroundColor: '#F1F5F9',
  },
  stepperValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    paddingHorizontal: 10,
  },
  stepperValueText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#064E3B',
  },
  stepperUnitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  quickPresetsInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  quickPresetsLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  quickPresetPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickPresetPillActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  quickPresetPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  quickPresetPillTextActive: {
    color: '#FFFFFF',
  },
  dateActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dateActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#064E3B',
  },
  dateSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateSelectorCardActive: {
    borderColor: '#064E3B',
    backgroundColor: '#F0FDF4',
  },
  dateSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  calendarIconMini: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSelectorTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  embeddedCalendarCard: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#D1FAE5',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  calendarQuickPresets: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  calendarQuickBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  calendarQuickBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#064E3B',
  },
  calendarMonthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
    marginBottom: 6,
  },
  calendarNavBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarNavBtnDisabled: {
    backgroundColor: '#F8FAFC',
  },
  calendarMonthTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#064E3B',
  },
  calendarWeekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  calendarWeekdayText: {
    width: 30,
    textAlign: 'center',
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDayEmpty: {
    width: 30,
    height: 30,
    marginVertical: 2,
  },
  calendarDayCell: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  calendarDayCellSelected: {
    backgroundColor: '#064E3B',
  },
  calendarDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  calendarDayTextPast: {
    color: '#CBD5E1',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  calendarDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 8,
    paddingVertical: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
  },
  calendarDoneBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#064E3B',
  },
  timeSection: {
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  timeChipsRow: {
    gap: 5,
  },
  timePresetChip: {
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 7,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timePresetChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  timePresetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  timePresetChipTextActive: {
    color: '#FFFFFF',
  },
  lockedOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 5,
  },
  lockedOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotGreen: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  dotRed: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  lockedOptionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#064E3B',
  },
  customOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 5,
  },
  customOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  customOptionText: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
    flex: 1,
  },
  removeOptionBtn: {
    padding: 2,
  },
  addOptionRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  addOptionInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#0F172A',
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#064E3B',
    borderRadius: 8,
    paddingHorizontal: 11,
    justifyContent: 'center',
  },
  addOptionBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  addOptionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalFooter: {
    paddingHorizontal: SPACING.md,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  submitBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
  },
  submitLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
