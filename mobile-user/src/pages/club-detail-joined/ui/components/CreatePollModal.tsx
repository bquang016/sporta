import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../../shared/config/theme';

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
  onCreatePoll,
}: CreatePollModalProps) {
  const PRESET_TITLES = [
    'Ghép trận cuối tuần',
    'Giao lưu nội bộ CLB',
    'Khảo sát quân số thi đấu',
    'Buổi tập chiến thuật',
  ];

  const PRESET_TIMES = [
    { h: 18, m: 0, label: '18:00' },
    { h: 19, m: 30, label: '19:30' },
    { h: 20, m: 0, label: '20:00' },
    { h: 21, m: 0, label: '21:00' },
    { h: 12, m: 0, label: '12:00' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <MaterialIcons name="add-circle" size={20} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Tạo biểu quyết quân số</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Title Section */}
            <View style={styles.sectionBlock}>
              <Text style={styles.fieldLabel}>Tiêu đề biểu quyết</Text>
              <TextInput
                style={styles.textInput}
                value={pollTitleInput}
                onChangeText={setPollTitleInput}
                placeholder="Ví dụ: Ghép trận giao lưu cuối tuần..."
                placeholderTextColor="#94A3B8"
              />

              {/* Title Suggestions */}
              <View style={styles.presetChipsRow}>
                {PRESET_TITLES.map((title, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.presetChip,
                      pollTitleInput === title && styles.presetChipActive,
                    ]}
                    onPress={() => setPollTitleInput(title)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        pollTitleInput === title && styles.presetChipTextActive,
                      ]}
                    >
                      {title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time Section */}
            <View style={styles.sectionBlock}>
              <Text style={styles.fieldLabel}>Thời gian chốt sổ biểu quyết</Text>

              <View style={styles.timePickerRow}>
                {/* Hour */}
                <View style={styles.timeUnitCol}>
                  <TouchableOpacity
                    style={styles.timeAdjustBtn}
                    onPress={() => adjustHour(1)}
                  >
                    <MaterialIcons name="keyboard-arrow-up" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <View style={styles.timeBox}>
                    <Text style={styles.timeNumber}>
                      {pollTimeHour.toString().padStart(2, '0')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.timeAdjustBtn}
                    onPress={() => adjustHour(-1)}
                  >
                    <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.timeSubLabel}>Giờ</Text>
                </View>

                <Text style={styles.timeColon}>:</Text>

                {/* Minute */}
                <View style={styles.timeUnitCol}>
                  <TouchableOpacity
                    style={styles.timeAdjustBtn}
                    onPress={() => adjustMinute(15)}
                  >
                    <MaterialIcons name="keyboard-arrow-up" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <View style={styles.timeBox}>
                    <Text style={styles.timeNumber}>
                      {pollTimeMinute.toString().padStart(2, '0')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.timeAdjustBtn}
                    onPress={() => adjustMinute(-15)}
                  >
                    <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.timeSubLabel}>Phút</Text>
                </View>
              </View>

              {/* Time Presets */}
              <View style={styles.presetChipsRow}>
                {PRESET_TIMES.map((preset, index) => {
                  const isSelected = pollTimeHour === preset.h && pollTimeMinute === preset.m;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.presetChip, isSelected && styles.presetChipActive]}
                      onPress={() => {
                        setPollTimeHour(preset.h);
                        setPollTimeMinute(preset.m);
                      }}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          isSelected && styles.presetChipTextActive,
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Voting Options Preview */}
            <View style={styles.sectionBlock}>
              <Text style={styles.fieldLabel}>Các lựa chọn mặc định</Text>
              <View style={styles.optionsPreviewRow}>
                <View style={styles.previewOptionPillJoin}>
                  <MaterialIcons name="check-circle" size={14} color={COLORS.primary} />
                  <Text style={styles.previewOptionTextJoin}>Tham gia thi đấu</Text>
                </View>
                <View style={styles.previewOptionPillAbsent}>
                  <MaterialIcons name="cancel" size={14} color="#D97706" />
                  <Text style={styles.previewOptionTextAbsent}>Bận / Vắng mặt</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={onCreatePoll}
              activeOpacity={0.85}
            >
              <MaterialIcons name="publish" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Phát hành biểu quyết</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '90%',
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    gap: 14,
    paddingVertical: 4,
  },
  sectionBlock: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#1E293B',
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  presetChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: COLORS.primaryOpacity10,
    borderColor: COLORS.primary,
  },
  presetChipText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  presetChipTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeUnitCol: {
    alignItems: 'center',
    gap: 3,
  },
  timeAdjustBtn: {
    padding: 3,
  },
  timeBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    width: 52,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  timeColon: {
    fontSize: 22,
    fontWeight: '600',
    color: '#64748B',
    marginTop: -16,
  },
  timeSubLabel: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '400',
  },
  optionsPreviewRow: {
    flexDirection: 'row',
    gap: 8,
  },
  previewOptionPillJoin: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  previewOptionTextJoin: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#065F46',
  },
  previewOptionPillAbsent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  previewOptionTextAbsent: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#92400E',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  submitBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
