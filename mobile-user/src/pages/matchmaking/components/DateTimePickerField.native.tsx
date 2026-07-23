/**
 * DateTimePickerField.native.tsx
 * Dùng native DateTimePicker cho iOS và Android
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

function formatTimeVi(d: Date) {
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function DateTimePickerField({ value, onChange }: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [androidStep, setAndroidStep] = useState<'date' | 'time' | null>(null);

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      setAndroidStep('date');
    } else {
      setShowDatePicker(true);
    }
  };

  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      setAndroidStep('time');
    } else {
      setShowTimePicker(true);
    }
  };

  const onDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (!selected) { setAndroidStep(null); return; }
    const next = new Date(value);
    next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    onChange(next);
    if (Platform.OS === 'android') setAndroidStep(null);
    else setShowDatePicker(false);
  };

  const onTimeChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (!selected) { setAndroidStep(null); return; }
    const next = new Date(value);
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    onChange(next);
    if (Platform.OS === 'android') setAndroidStep(null);
    else setShowTimePicker(false);
  };

  return (
    <>
      <View style={styles.dateTimeRow}>
        {/* Date Picker Card */}
        <TouchableOpacity style={styles.pickerBox} onPress={openDatePicker} activeOpacity={0.85}>
          <View style={styles.pickerIconRow}>
            <MaterialIcons name="calendar-today" size={16} color={COLORS.primary} />
            <Text style={styles.pickerLabel}>NGÀY</Text>
          </View>
          <Text style={styles.pickerBigValue}>
            {value.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
          </Text>
          <Text style={styles.pickerSub}>
            {value.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric' })}
          </Text>
        </TouchableOpacity>

        {/* Time Picker Card */}
        <TouchableOpacity style={styles.pickerBox} onPress={openTimePicker} activeOpacity={0.85}>
          <View style={styles.pickerIconRow}>
            <MaterialIcons name="schedule" size={16} color={COLORS.primary} />
            <Text style={styles.pickerLabel}>GIỜ BẮT ĐẦU</Text>
          </View>
          <Text style={styles.pickerBigValue}>{formatTimeVi(value)}</Text>
          <Text style={styles.pickerSub}>Giờ địa phương</Text>
        </TouchableOpacity>
      </View>

      {/* iOS — modal spinner */}
      {Platform.OS === 'ios' && (
        <>
          {showDatePicker && (
            <Modal transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.doneBtn}>XONG</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={value}
                    mode="date"
                    display="spinner"
                    minimumDate={new Date()}
                    onChange={onDateChange}
                    locale="vi-VN"
                  />
                </View>
              </View>
            </Modal>
          )}
          {showTimePicker && (
            <Modal transparent animationType="slide" onRequestClose={() => setShowTimePicker(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Text style={styles.doneBtn}>XONG</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={value}
                    mode="time"
                    display="spinner"
                    onChange={onTimeChange}
                    locale="vi-VN"
                  />
                </View>
              </View>
            </Modal>
          )}
        </>
      )}

      {/* Android — native pickers outside modal */}
      {Platform.OS === 'android' && androidStep === 'date' && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}
      {Platform.OS === 'android' && androidStep === 'time' && (
        <DateTimePicker
          value={value}
          mode="time"
          display="default"
          onChange={onTimeChange}
          is24Hour
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  dateTimeRow: { flexDirection: 'row', gap: SPACING.sm },
  pickerBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
    padding: SPACING.md,
    gap: 4,
  },
  pickerIconRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pickerLabel: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pickerBigValue: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  pickerSub: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 11,
    color: COLORS.outline,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  doneBtn: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
});
