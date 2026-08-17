import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { MaterialIcons } from '@expo/vector-icons';

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
  const hostAmount = totalPrice - guestAmount;

  const presets = [
    { label: '50/50', host: 50 },
    { label: '70/30 (A chịu 70%)', host: 70 },
    { label: '100/0 (A bao hết)', host: 100 },
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
        <Text style={styles.sectionTitle}>Chia chi phí sân</Text>
        {isLocked && (
          <View style={styles.lockedBadge}>
            <MaterialIcons name="lock" size={14} color={COLORS.error} />
            <Text style={styles.lockedText}>Đã khóa</Text>
          </View>
        )}
      </View>

      <Text style={styles.subtext}>
        Tổng tiền sân: <Text style={styles.totalHighlight}>{totalPrice.toLocaleString('vi-VN')}đ</Text>
      </Text>

      {/* Presets */}
      <View style={styles.presetRow}>
        {presets.map((p) => {
          const isSelected = !isCustom && hostPercent === p.host;
          return (
            <TouchableOpacity
              key={p.host}
              disabled={isLocked}
              activeOpacity={0.8}
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
          activeOpacity={0.8}
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
          <Text style={styles.customCalc}>
            → Đối thủ chịu {guestPercent}% (~{guestAmount.toLocaleString('vi-VN')}đ)
          </Text>
        </View>
      )}

      {/* Summary Box */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Chủ sân (Bạn) chịu {hostPercent}%:</Text>
          <Text style={styles.summaryHostValue}>{hostAmount.toLocaleString('vi-VN')}đ</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Đối thủ cần trả {guestPercent}%:</Text>
          <Text style={styles.summaryGuestValue}>{guestAmount.toLocaleString('vi-VN')}đ</Text>
        </View>
      </View>

      <Text style={styles.noteCopy}>
        💡 Đối thủ sẽ <Text style={{ fontWeight: '700' }}>thanh toán trực tiếp</Text> cho bạn khi gặp nhau thi đấu tại sân.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    gap: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  lockedText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.error,
    fontWeight: '700',
  },
  subtext: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
  },
  totalHighlight: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.default,
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
    fontWeight: '700',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: BORDER_RADIUS.default,
  },
  customLabel: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontSize: 12,
  },
  customInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outline,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    width: 60,
    textAlign: 'center',
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  customCalc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.primary,
    flex: 1,
  },
  summaryBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
    gap: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  summaryHostValue: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  summaryGuestValue: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.primary,
  },
  noteCopy: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    lineHeight: 16,
  },
});
