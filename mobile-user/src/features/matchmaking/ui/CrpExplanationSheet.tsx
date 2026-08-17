import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { RankingCalculationPreview } from '../../../entities/match/model/match.types';

interface CrpExplanationSheetProps {
  visible: boolean;
  onClose: () => void;
  preview: RankingCalculationPreview;
}

export function CrpExplanationSheet({ visible, onClose, preview }: CrpExplanationSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialIcons name="emoji-events" size={24} color={COLORS.secondary} />
              <Text style={styles.title}>Cách Tính Điểm CRP</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Summary Box */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Cụ thể biến động CRP cho trận đấu:</Text>
              <View style={styles.deltaRow}>
                <Text style={styles.clubNameText}>CLB Host:</Text>
                <Text style={styles.crpDeltaText}>
                  {preview.hostCrpBefore} → <Text style={{ fontWeight: '800' }}>{preview.hostCrpAfter}</Text> (
                  {preview.hostCrpDelta >= 0 ? `+${preview.hostCrpDelta}` : preview.hostCrpDelta} CRP)
                </Text>
              </View>
            </View>

            {/* Explanations Bullet Points */}
            <Text style={styles.sectionHeader}>Yếu tố ảnh hưởng:</Text>
            {preview.explanation.map((item, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <MaterialIcons name="check-circle" size={16} color={COLORS.primary} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}

            <View style={styles.rulesBox}>
              <Text style={styles.ruleTitle}>📌 Nguyên tắc xếp hạng Sporta CRP:</Text>
              <Text style={styles.ruleItem}>
                • <Text style={{ fontWeight: '700' }}>Positive-sum & Zero-floor:</Text> Trận Xếp hạng giúp tăng điểm phong độ tổng thể, CRP không bị âm.
              </Text>
              <Text style={styles.ruleItem}>
                • <Text style={{ fontWeight: '700' }}>Anti-farming:</Text> Đánh với đội chênh lệch Elo quá xa sẽ nhận ít điểm thưởng để tránh cày điểm.
              </Text>
              <Text style={styles.ruleItem}>
                • <Text style={{ fontWeight: '700' }}>Không thay đổi Elo cá nhân:</Text> Matchmaking chỉ dùng Elo snapshot của CLB để cân kèo.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Đã hiểu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '80%',
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontSize: 18,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    gap: SPACING.sm,
  },
  summaryCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
    gap: 6,
  },
  summaryTitle: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '700',
    color: '#92400E',
  },
  deltaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clubNameText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#78350F',
  },
  crpDeltaText: {
    ...TYPOGRAPHY.titleMd,
    color: '#B45309',
    fontSize: 14,
  },
  sectionHeader: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.default,
  },
  bulletText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurface,
    flex: 1,
  },
  rulesBox: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    gap: 6,
    marginTop: 8,
  },
  ruleTitle: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  ruleItem: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.default,
    alignItems: 'center',
    marginTop: 8,
  },
  doneBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '700',
  },
});
