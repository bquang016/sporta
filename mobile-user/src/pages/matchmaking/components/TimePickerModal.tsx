import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button } from '../../../shared/ui/Button';

interface TimePickerModalProps {
  visible: boolean;
  selectedTime: string; // "HH:mm" e.g. "17:45"
  onConfirm: (time: string) => void;
  onClose: () => void;
}

const HOURS = Array.from({ length: 18 }, (_, i) => (i + 5).toString().padStart(2, '0')); // 05..22
const MINUTES = ['00', '15', '30', '45'];

export function TimePickerModal({
  visible,
  selectedTime,
  onConfirm,
  onClose,
}: TimePickerModalProps) {
  const initialParts = selectedTime ? selectedTime.split(':') : ['18', '00'];
  const [hour, setHour] = useState(initialParts[0] || '18');
  const [minute, setMinute] = useState(initialParts[1] || '00');

  const handleConfirm = () => {
    onConfirm(`${hour}:${minute}`);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialIcons name="schedule" size={22} color={COLORS.primary} />
              <Text style={styles.headerTitle}>Chọn giờ thi đấu</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Time Display */}
          <View style={styles.timePreview}>
            <Text style={styles.timePreviewText}>{hour}:{minute}</Text>
            <Text style={styles.timePreviewSub}>Giờ bắt đầu dự kiến</Text>
          </View>

          {/* Selector Columns */}
          <View style={styles.selectorContainer}>
            {/* Hours Column */}
            <View style={styles.columnWrapper}>
              <Text style={styles.columnLabel}>GIỜ</Text>
              <ScrollView style={styles.columnScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.chipGrid}>
                  {HOURS.map((h) => {
                    const isSelected = h === hour;
                    return (
                      <TouchableOpacity
                        key={h}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => setHour(h)}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          {h}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Separator */}
            <View style={styles.columnSeparator} />

            {/* Minutes Column */}
            <View style={styles.columnWrapper}>
              <Text style={styles.columnLabel}>PHÚT</Text>
              <View style={styles.chipGrid}>
                {MINUTES.map((m) => {
                  const isSelected = m === minute;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setMinute(m)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        :{m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Confirm Button */}
          <Button
            title="Xác nhận giờ"
            variant="primary"
            size="md"
            onPress={handleConfirm}
            style={styles.confirmBtn}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    maxWidth: 400,
    paddingBottom: SPACING.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
  },
  timePreview: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity05,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryOpacity15,
  },
  timePreviewText: {
    ...TYPOGRAPHY.headlineLg,
    fontSize: 36,
    color: COLORS.primary,
    fontWeight: '800',
  },
  timePreviewSub: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  selectorContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    maxHeight: 220,
  },
  columnWrapper: {
    flex: 1,
    gap: SPACING.xs,
  },
  columnLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  columnScroll: {
    maxHeight: 170,
  },
  columnSeparator: {
    width: 1,
    backgroundColor: COLORS.outlineVariant,
    marginHorizontal: SPACING.xs,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    minWidth: 48,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.onPrimary,
    fontWeight: '800',
  },
  confirmBtn: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
  },
});
