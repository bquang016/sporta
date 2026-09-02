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
    { type: 'MATCHMAKING', title: 'Tuyển quân đá giao hữu sân 7' },
    { type: 'MATCHMAKING', title: 'Giao lưu bóng rổ 3x3 buổi tối' },
    { type: 'INTERNAL', title: 'Chia 2 đội giao lưu nội bộ CLB' },
    { type: 'INTERNAL', title: 'Buổi tập và thi đấu đối kháng' },
    { type: 'INTERNAL', title: 'Đấu tập nội bộ thứ Bảy' },
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
    // Convert to Monday-first: 0 = Mon, ..., 6 = Sun
    const startCol = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: Array<{ day: number | null; dateObj: Date | null; isPast: boolean; isSelected: boolean }> = [];
    // Leading empty cells
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

  const handleSelectCalendarDay = (d: Date) => {
    setSelectedDate(d);
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

      // Clean form state upon successful submission
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
          {/* Top Drag Indicator (Profile Style) */}
          <View style={styles.dragHandleWrap}>
            <View style={styles.dragHandle} />
          </View>

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="stats-chart" size={18} color="#064E3B" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Tạo biểu quyết mới</Text>
                <Text style={styles.modalSubTitle}>Lấy ý kiến thành viên & chuẩn bị đội hình</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Poll Type Tabs (Sporta Emerald Segmented Control) */}
            <View style={styles.typeTabsContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.typeTab, pollType === 'MATCHMAKING' && styles.typeTabActive]}
                onPress={() => setPollType('MATCHMAKING')}
              >
                <Ionicons
                  name="trophy"
                  size={15}
                  color={pollType === 'MATCHMAKING' ? '#FFFFFF' : '#64748B'}
                />
                <Text
                  style={[styles.typeTabText, pollType === 'MATCHMAKING' && styles.typeTabTextActive]}
                >
                  Tìm đối thủ giao lưu
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.typeTab, pollType === 'INTERNAL' && styles.typeTabActive]}
                onPress={() => setPollType('INTERNAL')}
              >
                <Ionicons
                  name="people"
                  size={15}
                  color={pollType === 'INTERNAL' ? '#FFFFFF' : '#64748B'}
                />
                <Text
                  style={[styles.typeTabText, pollType === 'INTERNAL' && styles.typeTabTextActive]}
                >
                  Giao lưu nội bộ CLB
                </Text>
              </TouchableOpacity>
            </View>

            {/* Explainer Card */}
            <View style={styles.explainerCard}>
              <Ionicons
                name="information-circle"
                size={18}
                color="#064E3B"
              />
              <Text style={styles.explainerText}>
                {pollType === 'MATCHMAKING'
                  ? 'Khi đủ quân số đăng ký, hệ thống sẽ chốt danh sách thành viên ra sân thi đấu để đại diện CLB tìm đối thủ giao lưu.'
                  : 'Hệ thống sẽ tự động phân phối các thành viên thành 2 đội thi đấu cân sức dựa trên trình độ và phong độ.'}
              </Text>
            </View>

            {/* Section 1: Title Input + Collapsible Suggestions Button */}
            <View style={styles.sectionBlock}>
              <Text style={styles.fieldLabel}>Tiêu đề biểu quyết <Text style={styles.requiredStar}>*</Text></Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Nhập tiêu đề hoặc chọn từ mẫu gợi ý..."
                placeholderTextColor="#94A3B8"
              />

              {/* Toggle Suggestions Button */}
              <TouchableOpacity
                style={styles.toggleSuggestionsBtn}
                activeOpacity={0.75}
                onPress={() => setShowSuggestions(!showSuggestions)}
              >
                <View style={styles.toggleSuggestionsLeft}>
                  <Ionicons
                    name={showSuggestions ? 'bulb' : 'bulb-outline'}
                    size={16}
                    color="#064E3B"
                  />
                  <Text style={styles.toggleSuggestionsText}>
                    {showSuggestions
                      ? 'Ẩn gợi ý tiêu đề'
                      : `Hiển thị gợi ý tiêu đề (${filteredPresets.length})`}
                  </Text>
                </View>
                <Ionicons
                  name={showSuggestions ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#064E3B"
                />
              </TouchableOpacity>

              {/* Collapsible Suggestions List */}
              {showSuggestions && (
                <View style={styles.presetChipsContainer}>
                  {filteredPresets.map((p, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.presetChip, title === p.title && styles.presetChipActive]}
                      onPress={() => {
                        setTitle(p.title);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={title === p.title ? '#FFFFFF' : '#CBD5E1'}
                      />
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
              )}
            </View>

            {/* Section 2: Matchmaking Max Players (Stepper Design with + / -) */}
            {pollType === 'MATCHMAKING' && (
              <View style={styles.sectionBlock}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Số lượng thành viên ra sân tối đa</Text>
                  <View style={styles.minPill}>
                    <Text style={styles.minPillText}>Tối thiểu môn {clubSportName || ''}: {minPlayers} người</Text>
                  </View>
                </View>

                {/* Compact Stepper Card */}
                <View style={styles.stepperContainer}>
                  {/* Minus Button */}
                  <TouchableOpacity
                    style={[
                      styles.stepperBtn,
                      maxPlayers <= minPlayers && styles.stepperBtnDisabled,
                    ]}
                    disabled={maxPlayers <= minPlayers}
                    onPress={() => setMaxPlayers(Math.max(minPlayers, maxPlayers - 1))}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={maxPlayers <= minPlayers ? '#CBD5E1' : '#064E3B'}
                    />
                  </TouchableOpacity>

                  {/* Centered Value Display */}
                  <View style={styles.stepperValueBox}>
                    <Text style={styles.stepperValueText}>{maxPlayers}</Text>
                    <Text style={styles.stepperSubText}>thành viên</Text>
                  </View>

                  {/* Plus Button */}
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setMaxPlayers(maxPlayers + 1)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="add" size={20} color="#064E3B" />
                  </TouchableOpacity>
                </View>

                {/* Quick Presets for Sport */}
                <View style={styles.quickPresetsRow}>
                  <Text style={styles.quickPresetsLabel}>Gợi ý nhanh:</Text>
                  {quickPlayerPresets.map((qty) => (
                    <TouchableOpacity
                      key={qty}
                      style={[
                        styles.quickPresetPill,
                        maxPlayers === qty && styles.quickPresetPillActive,
                      ]}
                      onPress={() => setMaxPlayers(qty)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.quickPresetPillText,
                          maxPlayers === qty && styles.quickPresetPillTextActive,
                        ]}
                      >
                        {qty} người
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Section 3: Deadline & Embedded Interactive Calendar */}
            <View style={styles.sectionBlock}>
              <Text style={styles.fieldLabel}>Thời hạn kết thúc biểu quyết</Text>

              {/* Date Display Card (Tapping toggles embedded calendar) */}
              <TouchableOpacity
                style={[
                  styles.dateSelectorCard,
                  isCalendarExpanded && styles.dateSelectorCardActive,
                ]}
                activeOpacity={0.85}
                onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
              >
                <View style={styles.dateSelectorLeft}>
                  <View style={styles.calendarIconCircle}>
                    <Ionicons name="calendar" size={18} color="#064E3B" />
                  </View>
                  <View>
                    <Text style={styles.dateSelectorSub}>
                      {isCalendarExpanded ? 'Chạm để thu gọn lịch' : 'Chạm để chọn ngày trên lịch'}
                    </Text>
                    <Text style={styles.dateSelectorTitle}>{formatDateDisplay(selectedDate)}</Text>
                  </View>
                </View>
                <View style={styles.openCalendarBadge}>
                  <Ionicons
                    name={isCalendarExpanded ? 'chevron-up' : 'calendar-outline'}
                    size={16}
                    color="#064E3B"
                  />
                  <Text style={styles.openCalendarBadgeText}>
                    {isCalendarExpanded ? 'Đóng lịch' : 'Mở lịch'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Embedded Interactive Calendar (No Nested Modal!) */}
              {isCalendarExpanded && (
                <View style={styles.embeddedCalendarCard}>
                  {/* Quick Preset Buttons */}
                  <View style={styles.calendarQuickPresets}>
                    <TouchableOpacity
                      style={styles.calendarQuickBtn}
                      onPress={() => handleApplyDatePreset(0)}
                    >
                      <Text style={styles.calendarQuickBtnText}>Hôm nay</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.calendarQuickBtn}
                      onPress={() => handleApplyDatePreset(1)}
                    >
                      <Text style={styles.calendarQuickBtnText}>Ngày mai</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.calendarQuickBtn}
                      onPress={() => handleApplyDatePreset(3)}
                    >
                      <Text style={styles.calendarQuickBtnText}>+3 ngày</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.calendarQuickBtn}
                      onPress={() => {
                        const d = new Date();
                        const day = d.getDay();
                        const diff = (6 - day + 7) % 7 || 7; // Next Saturday
                        handleApplyDatePreset(diff);
                      }}
                    >
                      <Text style={styles.calendarQuickBtnText}>Cuối tuần</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Month Navigation Row */}
                  <View style={styles.calendarMonthHeader}>
                    <TouchableOpacity
                      style={[
                        styles.calendarNavBtn,
                        isAtCurrentMonth && styles.calendarNavBtnDisabled,
                      ]}
                      disabled={isAtCurrentMonth}
                      onPress={handlePrevMonth}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="chevron-back"
                        size={18}
                        color={isAtCurrentMonth ? '#CBD5E1' : '#064E3B'}
                      />
                    </TouchableOpacity>

                    <Text style={styles.calendarMonthTitle}>
                      Tháng {viewMonth + 1}, {viewYear}
                    </Text>

                    <TouchableOpacity
                      style={styles.calendarNavBtn}
                      onPress={handleNextMonth}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="chevron-forward" size={18} color="#064E3B" />
                    </TouchableOpacity>
                  </View>

                  {/* Weekday Headers */}
                  <View style={styles.calendarWeekdaysRow}>
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((wd, i) => (
                      <Text key={i} style={styles.calendarWeekdayText}>
                        {wd}
                      </Text>
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
                          style={[
                            styles.calendarDayCell,
                            cell.isSelected && styles.calendarDayCellSelected,
                          ]}
                          disabled={cell.isPast}
                          onPress={() => cell.dateObj && handleSelectCalendarDay(cell.dateObj)}
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

                  {/* Done Selecting Date */}
                  <TouchableOpacity
                    style={styles.calendarDoneBtn}
                    onPress={() => setIsCalendarExpanded(false)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark" size={16} color="#064E3B" />
                    <Text style={styles.calendarDoneBtnText}>Xác nhận ngày này</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Time Pickers (Hours & Minutes Presets) */}
              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>Khung giờ kết thúc:</Text>
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
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color={isSelected ? '#FFFFFF' : '#475569'}
                        />
                        <Text
                          style={[styles.timePresetChipText, isSelected && styles.timePresetChipTextActive]}
                        >
                          {tp.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Section 4: Fixed Options ("Có" and "Không") & Custom Options */}
            <View style={styles.sectionBlock}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Lựa chọn biểu quyết</Text>
                <Text style={styles.fieldHint}>2 lựa chọn mặc định cố định</Text>
              </View>

              {/* Option "Có" (Fixed Default) */}
              <View style={styles.lockedOptionCard}>
                <View style={styles.lockedOptionLeft}>
                  <View style={styles.dotGreen} />
                  <Text style={styles.lockedOptionTitle}>Có (Tham gia thi đấu)</Text>
                </View>
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={11} color="#064E3B" />
                  <Text style={styles.lockedBadgeText}>Mặc định</Text>
                </View>
              </View>

              {/* Option "Không" (Fixed Default) */}
              <View style={styles.lockedOptionCard}>
                <View style={styles.lockedOptionLeft}>
                  <View style={styles.dotRed} />
                  <Text style={styles.lockedOptionTitle}>Không (Bận / Vắng mặt)</Text>
                </View>
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={11} color="#064E3B" />
                  <Text style={styles.lockedBadgeText}>Mặc định</Text>
                </View>
              </View>

              {/* Custom Options List (Unlimited) */}
              {customOptions.map((opt, i) => (
                <View key={i} style={styles.customOptionCard}>
                  <View style={styles.customOptionLeft}>
                    <Ionicons name="checkbox-outline" size={16} color="#059669" />
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
                    style={[
                      styles.addOptionBtn,
                      !newOptionInput.trim() && styles.addOptionBtnDisabled,
                    ]}
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

          {/* Footer Submit Button (Sporta Deep Green) */}
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  dragHandleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 42,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  modalSubTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrollBody: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 14,
    paddingBottom: 24,
  },
  typeTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    marginBottom: 12,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  typeTabActive: {
    backgroundColor: '#064E3B',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  typeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  typeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  explainerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  explainerText: {
    flex: 1,
    fontSize: 12.5,
    color: '#064E3B',
    lineHeight: 18,
    fontWeight: '500',
  },
  sectionBlock: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
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
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  minPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  minPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#064E3B',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },
  toggleSuggestionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  toggleSuggestionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleSuggestionsText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#064E3B',
  },
  presetChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 10,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
  },
  presetChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  presetChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  stepperBtnDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  stepperValueBox: {
    alignItems: 'center',
  },
  stepperValueText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#064E3B',
  },
  stepperSubText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  quickPresetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  quickPresetsLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  quickPresetPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickPresetPillActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  quickPresetPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  quickPresetPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dateSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
  },
  dateSelectorCardActive: {
    borderColor: '#064E3B',
    backgroundColor: '#F0FDF4',
  },
  dateSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  calendarIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  dateSelectorSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  dateSelectorTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  openCalendarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  openCalendarBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#064E3B',
  },
  embeddedCalendarCard: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#D1FAE5',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarQuickPresets: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarQuickBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    marginHorizontal: 3,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  calendarQuickBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#064E3B',
  },
  calendarMonthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginBottom: 8,
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  calendarNavBtnDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  calendarMonthTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#064E3B',
  },
  calendarWeekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  calendarWeekdayText: {
    width: 34,
    textAlign: 'center',
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDayEmpty: {
    width: 34,
    height: 34,
    marginVertical: 3,
  },
  calendarDayCell: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 3,
  },
  calendarDayCellSelected: {
    backgroundColor: '#064E3B',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarDayText: {
    fontSize: 13,
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
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  calendarDoneBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#064E3B',
  },
  timeSection: {
    marginTop: 12,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  timeChipsRow: {
    gap: 6,
  },
  timePresetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timePresetChipActive: {
    backgroundColor: '#064E3B',
    borderColor: '#064E3B',
  },
  timePresetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  timePresetChipTextActive: {
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
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  lockedOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  dotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  lockedOptionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  lockedBadgeText: {
    fontSize: 11,
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
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  customOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  customOptionText: {
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
    flex: 1,
  },
  removeOptionBtn: {
    padding: 4,
  },
  addOptionWrapper: {
    marginTop: 4,
  },
  addOptionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  addOptionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addOptionInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#064E3B',
    borderRadius: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  addOptionBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  addOptionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalFooter: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  submitBtn: {
    backgroundColor: '#064E3B',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  submitLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
