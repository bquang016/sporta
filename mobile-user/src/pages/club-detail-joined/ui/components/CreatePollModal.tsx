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
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
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
      setIsCalendarExpanded(false);
    } catch (err) {
      // Handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const now = new Date();
  const isAtCurrentMonth = viewYear === now.getFullYear() && viewMonth <= now.getMonth();

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

            {/* Section 1: Title Input (No suggestions) */}
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

            {/* Section 2: Max Players Stepper (Only for Matchmaking) */}
            {pollType === 'MATCHMAKING' && (
              <View style={styles.sectionBlock}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Số lượng thành viên ra sân tối đa</Text>
                  <Text style={styles.fieldHint}>Tối thiểu: {minPlayers} người</Text>
                </View>

                {/* Stepper Control */}
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={[styles.stepperBtn, maxPlayers <= minPlayers && styles.stepperBtnDisabled]}
                    disabled={maxPlayers <= minPlayers}
                    onPress={() => setMaxPlayers(Math.max(minPlayers, maxPlayers - 1))}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="remove"
                      size={18}
                      color={maxPlayers <= minPlayers ? '#CBD5E1' : '#1E293B'}
                    />
                  </TouchableOpacity>

                  <View style={styles.stepperValueBox}>
                    <Text style={styles.stepperValueText}>{maxPlayers}</Text>
                    <Text style={styles.stepperUnitText}>thành viên</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setMaxPlayers(maxPlayers + 1)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={18} color="#1E293B" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Section 3: Date Selector & Embedded Calendar */}
            <View style={styles.sectionBlock}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Ngày kết thúc biểu quyết</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
                  style={styles.openCalendarBtn}
                >
                  <Ionicons name={isCalendarExpanded ? 'chevron-up' : 'calendar-outline'} size={14} color={COLORS.primary} />
                  <Text style={styles.openCalendarBtnText}>
                    {isCalendarExpanded ? 'Đóng lịch' : 'Mở lịch'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Date Display Card */}
              <TouchableOpacity
                style={styles.dateSelectorCard}
                activeOpacity={0.8}
                onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
              >
                <View style={styles.dateSelectorLeft}>
                  <View style={styles.calendarIconCircle}>
                    <Ionicons name="calendar" size={18} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.dateSelectorSub}>Thời hạn biểu quyết</Text>
                    <Text style={styles.dateSelectorTitle}>{formatDateDisplay(selectedDate)}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>

              {/* Embedded Interactive Calendar */}
              {isCalendarExpanded && (
                <View style={styles.embeddedCalendarCard}>
                  {/* Month Navigation */}
                  <View style={styles.calendarMonthHeader}>
                    <TouchableOpacity
                      style={[styles.calendarNavBtn, isAtCurrentMonth && styles.calendarNavBtnDisabled]}
                      disabled={isAtCurrentMonth}
                      onPress={handlePrevMonth}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="chevron-back" size={16} color={isAtCurrentMonth ? '#CBD5E1' : '#1E293B'} />
                    </TouchableOpacity>

                    <Text style={styles.calendarMonthTitle}>
                      Tháng {viewMonth + 1}, {viewYear}
                    </Text>

                    <TouchableOpacity style={styles.calendarNavBtn} onPress={handleNextMonth} activeOpacity={0.7}>
                      <Ionicons name="chevron-forward" size={16} color="#1E293B" />
                    </TouchableOpacity>
                  </View>

                  {/* Weekdays */}
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

                  {/* Confirm Date Button */}
                  <TouchableOpacity
                    style={styles.calendarDoneBtn}
                    onPress={() => setIsCalendarExpanded(false)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    <Text style={styles.calendarDoneBtnText}>Xác nhận ngày</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Section 4: Dedicated Time Selector (Giờ kết thúc) */}
            <View style={styles.sectionBlock}>
              <Text style={styles.fieldLabel}>Giờ kết thúc biểu quyết</Text>
              
              <View style={styles.timePickerContainer}>
                {/* Hour Stepper */}
                <View style={styles.timeUnitBox}>
                  <Text style={styles.timeUnitLabel}>Giờ</Text>
                  <View style={styles.timeStepper}>
                    <TouchableOpacity
                      style={styles.timeStepperBtn}
                      onPress={() => setSelectedHour((prev) => (prev === 0 ? 23 : prev - 1))}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="remove" size={16} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.timeValueText}>{String(selectedHour).padStart(2, '0')}</Text>
                    <TouchableOpacity
                      style={styles.timeStepperBtn}
                      onPress={() => setSelectedHour((prev) => (prev === 23 ? 0 : prev + 1))}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={16} color="#1E293B" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.timeColon}>:</Text>

                {/* Minute Stepper */}
                <View style={styles.timeUnitBox}>
                  <Text style={styles.timeUnitLabel}>Phút</Text>
                  <View style={styles.timeStepper}>
                    <TouchableOpacity
                      style={styles.timeStepperBtn}
                      onPress={() => setSelectedMinute((prev) => (prev === 0 ? 45 : prev - 15))}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="remove" size={16} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.timeValueText}>{String(selectedMinute).padStart(2, '0')}</Text>
                    <TouchableOpacity
                      style={styles.timeStepperBtn}
                      onPress={() => setSelectedMinute((prev) => (prev === 45 ? 0 : prev + 15))}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={16} color="#1E293B" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Section 5: Poll Options */}
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
    marginBottom: SPACING.md,
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
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperValueBox: {
    alignItems: 'center',
  },
  stepperValueText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepperUnitText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
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
    gap: 3,
  },
  openCalendarBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
  },
  embeddedCalendarCard: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calendarMonthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 8,
  },
  calendarNavBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarNavBtnDisabled: {
    opacity: 0.3,
  },
  calendarMonthTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  calendarWeekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  calendarWeekdayText: {
    width: 32,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDayEmpty: {
    width: 32,
    height: 32,
    marginVertical: 2,
  },
  calendarDayCell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  calendarDayCellSelected: {
    backgroundColor: COLORS.primary,
  },
  calendarDayText: {
    fontSize: 12.5,
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
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  calendarDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 10,
    gap: 12,
  },
  timeUnitBox: {
    alignItems: 'center',
  },
  timeUnitLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  timeStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BORDER_RADIUS.md,
    padding: 3,
  },
  timeStepperBtn: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeValueText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 12,
  },
  timeColon: {
    fontSize: 22,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 16,
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
