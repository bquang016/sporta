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
  const winnerPercent = Math.min(hostPercent, guestPercent);
  const loserPercent = Math.max(hostPercent, guestPercent);

  const winnerAmount = Math.round((totalPrice * winnerPercent) / 100);
  const loserAmount = totalPrice - winnerAmount;

  const presets = [
    { label: '50/50', sub: 'Chia đôi', desc: 'Mỗi đội 50%', host: 50 },
    { label: '70/30', sub: 'Thắng trả 30%', desc: 'Đội thắng giảm 40%', host: 70 },
    { label: '100/0', sub: 'Thua bao sân', desc: 'Đội thắng miễn 100%', host: 100 },
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
        <View style={styles.sectionIconCircle}>
          <Ionicons name="flame" size={16} color="#EA580C" />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.sectionTitle}>3. Tỉ Lệ Chia Tiền Sân</Text>
            {isLocked && (
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={11} color="#DC2626" />
                <Text style={styles.lockedText}>Đã khóa</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtext}>
            Quy tắc khuyến khích thi đấu: <Text style={{ fontWeight: '800', color: COLORS.primary }}>Đội Thắng trả ít hơn</Text>.
          </Text>
        </View>
      </View>

      {/* Presets Grid */}
      <View style={styles.presetGrid}>
        {presets.map((p) => {
          const isSelected = !isCustom && hostPercent === p.host;
          return (
            <TouchableOpacity
              key={p.host}
              disabled={isLocked}
              activeOpacity={0.85}
              onPress={() => handleSelectPreset(p.host)}
              style={[
                styles.presetCard,
                isSelected && styles.presetCardActive,
                isLocked && styles.btnDisabled,
              ]}
            >
              <Text style={[styles.presetMain, isSelected && styles.presetMainActive]}>
                {p.label}
              </Text>
              <Text style={[styles.presetSub, isSelected && styles.presetSubActive]}>
                {p.sub}
              </Text>
              <Text style={[styles.presetDesc, isSelected && styles.presetDescActive]}>
                {p.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Option Button */}
      <TouchableOpacity
        disabled={isLocked}
        activeOpacity={0.85}
        onPress={() => {
          if (isLocked) return;
          setIsCustom(true);
        }}
        style={[
          styles.customBtn,
          isCustom && styles.customBtnActive,
          isLocked && styles.btnDisabled,
        ]}
      >
        <Ionicons
          name="options-outline"
          size={14}
          color={isCustom ? COLORS.primary : '#64748B'}
        />
        <Text style={[styles.customBtnText, isCustom && styles.customBtnTextActive]}>
          Tùy chỉnh tỉ lệ phần trăm
        </Text>
      </TouchableOpacity>

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
            → Đối thủ: {guestPercent}%
          </Text>
        </View>
      )}

      {/* Calculated Breakdown Box */}
      <View style={styles.breakdownBox}>
        <View style={styles.breakdownItemWin}>
          <View style={styles.breakdownTitleRow}>
            <Ionicons name="trophy" size={13} color="#15803D" />
            <Text style={styles.breakdownTitleWin}>Đội Thắng ({winnerPercent}%)</Text>
          </View>
          <Text style={styles.breakdownAmountWin}>
            ~{winnerAmount.toLocaleString('vi-VN')}đ
          </Text>
        </View>

        <View style={styles.breakdownDivider} />

        <View style={styles.breakdownItemLose}>
          <View style={styles.breakdownTitleRow}>
            <Ionicons name="alert-circle" size={13} color="#B91C1C" />
            <Text style={styles.breakdownTitleLose}>Đội Thua ({loserPercent}%)</Text>
          </View>
          <Text style={styles.breakdownAmountLose}>
            ~{loserAmount.toLocaleString('vi-VN')}đ
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 15.5,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  lockedText: {
    ...TYPOGRAPHY.labelSm,
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 10,
  },
  subtext: {
    ...TYPOGRAPHY.bodyMd,
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  presetGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  presetCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 2,
  },
  presetCardActive: {
    backgroundColor: 'rgba(6, 78, 59, 0.05)',
    borderColor: COLORS.primary,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  presetMain: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    fontSize: 15,
    color: COLORS.onSurface,
  },
  presetMainActive: {
    color: COLORS.primary,
  },
  presetSub: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  presetSubActive: {
    color: COLORS.primary,
  },
  presetDesc: {
    ...TYPOGRAPHY.bodySm,
    fontSize: 9.5,
    color: '#94A3B8',
    textAlign: 'center',
  },
  presetDescActive: {
    color: '#059669',
    fontWeight: '600',
  },
  customBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customBtnActive: {
    backgroundColor: 'rgba(6, 78, 59, 0.05)',
    borderColor: COLORS.primary,
  },
  customBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: '#64748B',
    fontWeight: '600',
    fontSize: 12,
  },
  customBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  customLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurface,
    fontSize: 12,
    fontWeight: '600',
  },
  customInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 50,
    textAlign: 'center',
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 13,
  },
  customCalc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    flex: 1,
  },
  breakdownBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  breakdownItemWin: {
    flex: 1,
    gap: 3,
  },
  breakdownItemLose: {
    flex: 1,
    gap: 3,
    alignItems: 'flex-end',
  },
  breakdownTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breakdownTitleWin: {
    ...TYPOGRAPHY.labelSm,
    color: '#15803D',
    fontWeight: '700',
    fontSize: 11.5,
  },
  breakdownTitleLose: {
    ...TYPOGRAPHY.labelSm,
    color: '#B91C1C',
    fontWeight: '700',
    fontSize: 11.5,
  },
  breakdownAmountWin: {
    ...TYPOGRAPHY.titleMd,
    color: '#15803D',
    fontWeight: '900',
    fontSize: 15,
  },
  breakdownAmountLose: {
    ...TYPOGRAPHY.titleMd,
    color: '#B91C1C',
    fontWeight: '900',
    fontSize: 15,
  },
  breakdownDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
});
