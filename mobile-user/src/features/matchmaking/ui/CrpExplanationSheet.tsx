import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Ionicons } from '@expo/vector-icons';
import { MatchRoomVM, RankingCalculationPreview } from '../../../entities/match/model/match.types';

interface CrpExplanationSheetProps {
  visible: boolean;
  onClose: () => void;
  result?: any;
  room?: MatchRoomVM;
  preview?: RankingCalculationPreview;
}

export function CrpExplanationSheet({ visible, onClose, result, room, preview }: CrpExplanationSheetProps) {
  const hostClubName = room?.hostClub?.name || 'CLB Host';
  const guestClubName = room?.guestClub?.name || 'CLB Guest';

  const hostBefore = result?.hostCrpBefore ?? preview?.hostCrpBefore ?? 100;
  const hostDelta = result?.hostCrpDelta ?? preview?.hostCrpDelta ?? 0;
  const hostAfter = result?.hostCrpAfter ?? preview?.hostCrpAfter ?? (hostBefore + hostDelta);

  const guestBefore = result?.guestCrpBefore ?? 100;
  const guestDelta = result?.guestCrpDelta ?? 0;
  const guestAfter = result?.guestCrpAfter ?? (guestBefore + guestDelta);

  const rawExplanations: string[] = result?.explanation?.length
    ? result.explanation
    : preview?.explanation?.length
    ? preview.explanation
    : [
        'Trận đấu Xếp hạng đã kết thúc và được xác nhận chính thức.',
        'Điểm CRP của CLB và Elo cá nhân của các thành viên ra sân đã được cập nhật.',
      ];

  const formatDelta = (d: number) => {
    if (d > 0) return `+${d}`;
    if (d === 0) return `0`;
    return `${d}`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="trophy-outline" size={24} color="#D97706" />
              <Text style={styles.title}>Cách Tính Điểm CRP</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Summary Box */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Cụ thể biến động CRP cho 2 CLB:</Text>
              
              <View style={styles.deltaRow}>
                <Text style={styles.clubNameText} numberOfLines={1}>{hostClubName}:</Text>
                <Text style={styles.crpDeltaText}>
                  {hostBefore} → <Text style={{ fontWeight: '900' }}>{hostAfter}</Text> ({formatDelta(hostDelta)} CRP)
                </Text>
              </View>

              <View style={[styles.deltaRow, { marginTop: 6 }]}>
                <Text style={styles.clubNameText} numberOfLines={1}>{guestClubName}:</Text>
                <Text style={styles.crpDeltaText}>
                  {guestBefore} → <Text style={{ fontWeight: '900' }}>{guestAfter}</Text> ({formatDelta(guestDelta)} CRP)
                </Text>
              </View>
            </View>

            {/* Explanations Bullet Points */}
            <Text style={styles.sectionHeader}>Yếu tố ảnh hưởng:</Text>
            {rawExplanations.map((item, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}

            <View style={styles.rulesBox}>
              <Text style={styles.ruleTitle}>📌 Nguyên tắc xếp hạng Sporta CRP:</Text>
              <Text style={styles.ruleItem}>
                • <Text style={{ fontWeight: '800' }}>Positive-sum & Zero-floor:</Text> Trận Xếp hạng giúp tăng điểm phong độ tổng thể, CRP không bị âm.
              </Text>
              <Text style={styles.ruleItem}>
                • <Text style={{ fontWeight: '800' }}>Line-up ELO & Upset:</Text> Điểm thưởng tính toán theo Elo trung bình thực tế của 2 đội hình ra sân.
              </Text>
              <Text style={styles.ruleItem}>
                • <Text style={{ fontWeight: '800' }}>Anti-farming:</Text> Giới hạn số trận xếp hạng lặp lại giữa 2 CLB trong 7 ngày để tránh cày điểm.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity activeOpacity={0.88} onPress={onClose} style={styles.doneBtn}>
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
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.titleLg,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  content: {
    gap: SPACING.md,
    paddingBottom: SPACING.md,
  },
  summaryCard: {
    backgroundColor: '#FFFBEB',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 4,
  },
  summaryTitle: {
    ...TYPOGRAPHY.labelMd,
    color: '#B45309',
    fontWeight: '700',
    marginBottom: 2,
  },
  deltaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clubNameText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#78350F',
    flex: 1,
    fontWeight: '600',
    marginRight: 8,
  },
  crpDeltaText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#B45309',
    fontWeight: '700',
  },
  sectionHeader: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  bulletText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    flex: 1,
    lineHeight: 20,
  },
  rulesBox: {
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  ruleTitle: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  ruleItem: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    ...TYPOGRAPHY.titleMd,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
