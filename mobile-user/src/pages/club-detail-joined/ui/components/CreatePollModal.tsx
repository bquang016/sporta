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
            <View style={styles.headerTitleRow}>
              <MaterialIcons name="add-circle" size={22} color={COLORS.primary} />
              <Text style={styles.pollModalTitle}>Tạo biểu quyết mới</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Poll Title Input */}
          <Text style={styles.modalFieldLabel}>Tiêu đề biểu quyết</Text>
          <TextInput
            style={styles.pollTextInput}
            value={pollTitleInput}
            onChangeText={setPollTitleInput}
            placeholder="Ví dụ: Ghép trận cuối tuần, Giao lưu nội bộ..."
            placeholderTextColor={COLORS.outline}
          />

          {/* Close Time Input */}
          <Text style={styles.modalFieldLabel}>Thời gian đóng biểu quyết</Text>
          <View style={styles.timePickerContainer}>
            <View style={styles.timeSelectorRow}>
              <TouchableOpacity 
                style={styles.timeAdjustBtn} 
                onPress={() => adjustHour(-1)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="remove" size={20} color={COLORS.primary} />
              </TouchableOpacity>

              <View style={styles.timeDisplayBox}>
                <Text style={styles.timeDisplayText}>
                  {pollTimeHour.toString().padStart(2, '0')}
                </Text>
                <Text style={styles.timeUnitLabel}>Giờ</Text>
              </View>

              <Text style={styles.timeSeparator}>:</Text>

              <View style={styles.timeDisplayBox}>
                <Text style={styles.timeDisplayText}>
                  {pollTimeMinute.toString().padStart(2, '0')}
                </Text>
                <Text style={styles.timeUnitLabel}>Phút</Text>
              </View>

              <TouchableOpacity 
                style={styles.timeAdjustBtn} 
                onPress={() => adjustHour(1)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="add" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            {/* Preset Chips */}
            <View style={styles.presetTimeChipsRow}>
              {[
                { h: 12, m: 0, label: '12:00' },
                { h: 15, m: 0, label: '15:00' },
                { h: 18, m: 0, label: '18:00' },
                { h: 20, m: 0, label: '20:00' },
                { h: 22, m: 0, label: '22:00' },
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

          {/* Default Options Display */}
          <Text style={styles.modalFieldLabel}>Lựa chọn biểu quyết</Text>
          <View style={styles.lockedOptionsRow}>
            <View style={styles.lockedOptionBadge}>
              <MaterialIcons name="check-circle" size={16} color={COLORS.primary} />
              <Text style={styles.lockedOptionText}>Tham gia thi đấu</Text>
            </View>
            <View style={[styles.lockedOptionBadge, styles.lockedOptionBadgeAbsent]}>
              <MaterialIcons name="cancel" size={16} color="#d97706" />
              <Text style={[styles.lockedOptionText, { color: '#d97706' }]}>Bận / Vắng mặt</Text>
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
              activeOpacity={0.85}
            >
              <MaterialIcons name="check" size={18} color={COLORS.white} />
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
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl * 1.5,
    maxHeight: '90%',
    gap: SPACING.xs,
  },
  pollModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    marginBottom: SPACING.xs,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  pollModalTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 17,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFieldLabel: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: SPACING.xs,
  },
  pollTextInput: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  timePickerContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
    borderRadius: BORDER_RADIUS.md,
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
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.primaryOpacity25,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeDisplayBox: {
    width: 72,
    height: 58,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  timeDisplayText: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 24,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: COLORS.primary,
  },
  timeUnitLabel: {
    fontSize: 9,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
    marginTop: -2,
  },
  timeSeparator: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  presetTimeChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xs + 2,
  },
  presetTimeChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  presetTimeChipSelected: {
    backgroundColor: COLORS.primaryOpacity12,
    borderColor: COLORS.primary,
  },
  presetTimeChipText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  presetTimeChipTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  lockedOptionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  lockedOptionBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryOpacity10,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
  },
  lockedOptionBadgeAbsent: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  lockedOptionText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pollModalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  pollModalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  pollModalCancelBtn: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  pollModalCancelText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  pollModalConfirmBtn: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pollModalConfirmText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
