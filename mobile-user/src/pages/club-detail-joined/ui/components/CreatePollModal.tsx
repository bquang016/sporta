import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

export interface CreatePollModalProps {
  visible: boolean;
  onClose: () => void;
  pollTitleInput: string;
  setPollTitleInput: (text: string) => void;
  pollTimeHour: number;
  pollTimeMinute: number;
  adjustHour: (amount: number) => void;
  adjustMinute: (amount: number) => void;
  setPollTimeHour: (h: number) => void;
  setPollTimeMinute: (m: number) => void;
  onCreatePoll: () => void;
}

export function CreatePollModal({
  visible,
  onClose,
  pollTitleInput,
  setPollTitleInput,
  pollTimeHour,
  pollTimeMinute,
  adjustHour,
  adjustMinute,
  setPollTimeHour,
  setPollTimeMinute,
  onCreatePoll
}: CreatePollModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.pollModalContent}>
          <View style={styles.pollModalHeader}>
            <Text style={styles.pollModalTitle}>Tạo biểu quyết mới</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Poll Title Input */}
          <Text style={styles.modalFieldLabel}>Tiêu đề biểu quyết</Text>
          <TextInput
            style={styles.pollTextInput}
            value={pollTitleInput}
            onChangeText={setPollTitleInput}
            placeholder="Ví dụ: Ghép trận cuối tuần"
            placeholderTextColor={COLORS.onSurfaceVariant}
          />

          {/* Close Time Input */}
          <Text style={styles.modalFieldLabel}>Cài đặt thời gian đóng</Text>
          <View style={styles.timePickerContainer}>
            <View style={styles.timeSelectorRow}>
              <TouchableOpacity 
                style={styles.timeAdjustBtn} 
                onPress={() => adjustHour(-1)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="remove" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <View style={styles.timeDisplayBox}>
                <Text style={styles.timeDisplayText}>
                  {pollTimeHour.toString().padStart(2, '0')}
                </Text>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeDisplayBox}>
                <Text style={styles.timeDisplayText}>
                  {pollTimeMinute.toString().padStart(2, '0')}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.timeAdjustBtn} 
                onPress={() => adjustHour(1)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="add" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            {/* Preset Chips */}
            <View style={styles.presetTimeChipsRow}>
              {[
                { h: 12, m: 0, label: '12:00' },
                { h: 15, m: 0, label: '15:00' },
                { h: 18, m: 0, label: '18:00' },
                { h: 20, m: 0, label: '20:00' },
              ].map((preset, index) => {
                const isSelected = pollTimeHour === preset.h && pollTimeMinute === preset.m;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.presetTimeChip, isSelected && styles.presetTimeChipSelected]}
                    onPress={() => {
                      setPollTimeHour(preset.h);
                      setPollTimeMinute(preset.m);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.presetTimeChipText, isSelected && styles.presetTimeChipTextSelected]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Default Options (Locked Visual display) */}
          <Text style={styles.modalFieldLabel}>Tùy chọn mặc định (Không thể xóa)</Text>
          <View style={styles.lockedOptionsRow}>
            <View style={styles.lockedOptionBadge}>
              <MaterialIcons name="check" size={14} color={COLORS.primary} />
              <Text style={styles.lockedOptionText}>Tham gia</Text>
            </View>
            <View style={styles.lockedOptionBadge}>
              <MaterialIcons name="check" size={14} color={COLORS.primary} />
              <Text style={styles.lockedOptionText}>Vắng mặt</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.pollModalActions}>
            <TouchableOpacity
              style={[styles.pollModalBtn, styles.pollModalCancelBtn]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.pollModalCancelText}>Hủy bỏ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pollModalBtn, styles.pollModalConfirmBtn]}
              onPress={onCreatePoll}
              activeOpacity={0.8}
            >
              <Text style={styles.pollModalConfirmText}>Tạo biểu quyết</Text>
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
    backgroundColor: COLORS.blackOpacity50,
    justifyContent: 'flex-end',
  },
  pollModalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    maxHeight: '85%',
  },
  pollModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryOpacity10,
    marginBottom: SPACING.md,
  },
  pollModalTitle: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 16,
    color: COLORS.onSurface,
  },
  modalFieldLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurface,
    marginBottom: SPACING.base,
    marginTop: SPACING.base,
  },
  pollTextInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.sm,
    height: 44,
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  timePickerContainer: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity10,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.md,
  },
  timeSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  timeAdjustBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeDisplayBox: {
    width: 60,
    height: 48,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.default,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  timeDisplayText: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 20,
    color: COLORS.primary,
  },
  timeSeparator: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
  },
  presetTimeChipsRow: {
    flexDirection: 'row',
    gap: SPACING.base,
  },
  presetTimeChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetTimeChipSelected: {
    backgroundColor: COLORS.secondaryContainer,
  },
  presetTimeChipText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
  },
  presetTimeChipTextSelected: {
    color: COLORS.onSecondaryContainer,
  },
  lockedOptionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  lockedOptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.xl,
  },
  lockedOptionText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
  },
  pollModalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  pollModalBtn: {
    flex: 1,
    height: 44,
    borderRadius: BORDER_RADIUS.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pollModalCancelBtn: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  pollModalCancelText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
  },
  pollModalConfirmBtn: {
    backgroundColor: COLORS.primary,
  },
  pollModalConfirmText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
  },
});
