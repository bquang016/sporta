import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Ionicons } from '@expo/vector-icons';

interface FeeSplitSelectorProps {
  totalPrice: number;
  hostPercent: number;
  onChangeHostPercent: (percent: number) => void;
  isLocked?: boolean;
}

export function FeeSplitSelector({
  totalPrice,
  hostPercent,
  onChangeHostPercent,
  isLocked = false,
}: FeeSplitSelectorProps) {
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>(hostPercent.toString());

  const guestPercent = 100 - hostPercent;
  const guestAmount = Math.round((totalPrice * guestPercent) / 100);

  const presets = [
    { label: '50/50 (Chia đôi)', host: 50 },
    { label: '70/30 (Thắng trả 30%)', host: 70 },
    { label: '100/0 (Thua bao sân)', host: 100 },
  ];

  const handleSelectPreset = (pHost: number) => {
    if (isLocked) return;
    setIsCustom(false);
    onChangeHostPercent(pHost);
  };

  const handleCustomChange = (text: string) => {
    setCustomInput(text);
    const val = parseInt(text, 10);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      onChangeHostPercent(val);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Tỉ lệ chia tiền sân (Cơ chế Đội Thắng trả ít hơn)</Text>
        {isLocked && (
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={12} color={COLORS.error} />
            <Text style={styles.lockedText}>Đã khóa</Text>
          </View>
        )}
      </View>

      <Text style={styles.subtext}>
        Tổng giá trị tiền sân: <Text style={styles.totalHighlight}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
      </Text>

      {/* Presets */}
      <View style={styles.presetRow}>
        {presets.map((p) => {
          const isSelected = !isCustom && hostPercent === p.host;
          return (
            <TouchableOpacity
              key={p.host}
              disabled={isLocked}
              activeOpacity={0.85}
              onPress={() => handleSelectPreset(p.host)}
              style={[
                styles.presetBtn,
                isSelected && styles.presetBtnActive,
                isLocked && styles.btnDisabled,
              ]}
            >
              <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          disabled={isLocked}
          activeOpacity={0.85}
          onPress={() => {
            if (isLocked) return;
            setIsCustom(true);
          }}
          style={[
            styles.presetBtn,
            isCustom && styles.presetBtnActive,
            isLocked && styles.btnDisabled,
          ]}
        >
          <Text style={[styles.presetText, isCustom && styles.presetTextActive]}>Tùy chỉnh</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Input */}
      {isCustom && !isLocked && (
        <View style={styles.customRow}>
          <Text style={styles.customLabel}>Chủ sân chịu (%):</Text>
          <TextInput
            style={styles.customInput}
            keyboardType="number-pad"
            maxLength={3}
            value={customInput}
            onChangeText={handleCustomChange}
          />
          <Text style={styles.customCalc} numberOfLines={1}>
            → Đối thủ chịu {guestPercent}% (~{guestAmount.toLocaleString('vi-VN')}đ)
          </Text>
        </View>
      )}

      {/* Incentive Explanation Summary Box */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryHeader}>
          <Ionicons name="trophy-outline" size={16} color={COLORS.primary} />
          <Text style={styles.summaryHeaderTitle}>Quy tắc thanh toán theo kết quả:</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="trophy" size={14} color="#15803D" />
            <Text style={styles.summaryLabel}>Nếu Đội Thắng:</Text>
          </View>
          <Text style={styles.summaryHostValue}>
            Giảm/miễn trả chỉ còn {Math.min(hostPercent, guestPercent)}% (~{Math.round((totalPrice * Math.min(hostPercent, guestPercent)) / 100).toLocaleString('vi-VN')}đ)
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="alert-circle" size={14} color="#B91C1C" />
            <Text style={styles.summaryLabel}>Nếu Đội Thua:</Text>
          </View>
          <Text style={styles.summaryGuestValue}>
            Thanh toán phần còn lại {Math.max(hostPercent, guestPercent)}% (~{Math.round((totalPrice * Math.max(hostPercent, guestPercent)) / 100).toLocaleString('vi-VN')}đ)
          </Text>
        </View>
      </View>

      <Text style={styles.noteCopy}>
        Đội đối thủ sẽ <Text style={{ fontWeight: '800' }}>thanh toán trực tiếp</Text> khoản tiền sân ngoài đời cho Chủ sân theo kết quả trận đấu.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.08)',
    gap: SPACING.sm,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 15.5,
    flex: 1,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  lockedText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.error,
    fontWeight: '800',
    fontSize: 10,
  },
  subtext: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 12.5,
  },
  totalHighlight: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  presetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  presetBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  presetText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontSize: 12,
  },
  presetTextActive: {
    color: COLORS.white,
    fontWeight: '800',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: BORDER_RADIUS.lg,
  },
  customLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontSize: 12,
  },
  customInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    width: 60,
    textAlign: 'center',
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  customCalc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11.5,
    color: COLORS.primary,
    fontWeight: '700',
    flex: 1,
  },
  summaryBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: 6,
    marginTop: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  summaryHeaderTitle: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    color: COLORS.primary,
    fontSize: 12.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12.5,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  summaryHostValue: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    color: '#15803D',
    fontSize: 12,
  },
  summaryGuestValue: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    color: '#B91C1C',
    fontSize: 12,
  },
  noteCopy: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
    lineHeight: 16,
  },
});
