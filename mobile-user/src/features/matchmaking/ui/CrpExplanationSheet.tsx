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
  const hostClubName = room?.hostClub?.name || 'Đội chủ nhà';
  const guestClubName = room?.guestClub?.name || 'Đội khách';

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

  const renderExplanationIcon = (text: string) => {
    if (text.includes('thắng') || text.includes('bất ngờ') || text.includes('phong độ')) {
      return <Ionicons name="trophy-outline" size={17} color="#D97706" />;
    }
    if (text.includes('bảo vệ điểm') || text.includes('giảm')) {
      return <Ionicons name="shield-checkmark-outline" size={17} color="#2563EB" />;
    }
    if (text.includes('đầu tiên trong ngày')) {
      return <Ionicons name="sunny-outline" size={17} color="#EA580C" />;
    }
    if (text.includes('chuỗi')) {
      return <Ionicons name="flame-outline" size={17} color="#DC2626" />;
    }
    if (text.includes('hòa')) {
      return <Ionicons name="git-commit-outline" size={17} color="#64748B" />;
    }
    if (text.includes('Quỹ') || text.includes('hỗ trợ')) {
      return <Ionicons name="gift-outline" size={17} color="#7C3AED" />;
    }
    if (text.includes('chống cày điểm') || text.includes('giới hạn')) {
      return <Ionicons name="alert-circle-outline" size={17} color="#D97706" />;
    }
    return <Ionicons name="checkmark-circle-outline" size={17} color={COLORS.primary} />;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="stats-chart" size={22} color={COLORS.primary} />
              <Text style={styles.title}>Chi Tiết Tính Điểm Xếp Hạng (CRP)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Summary Box */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeaderRow}>
                <Ionicons name="information-circle" size={16} color="#B45309" />
                <Text style={styles.summaryTitle}>Biến động điểm xếp hạng của 2 CLB:</Text>
              </View>
              
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
            <View style={styles.bulletsList}>
              {rawExplanations.map((item, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <View style={styles.bulletIconWrap}>
                    {renderExplanationIcon(item)}
                  </View>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Rules without emoji, using icons and non-technical language */}
            <View style={styles.rulesBox}>
              <View style={styles.ruleHeaderRow}>
                <Ionicons name="shield-outline" size={16} color="#475569" />
                <Text style={styles.ruleTitle}>Quy định xếp hạng Sporta:</Text>
              </View>
              <Text style={styles.ruleItem}>
                • <Text style={{ fontWeight: '800' }}>Bảo vệ điểm số (Không âm):</Text> Điểm xếp hạng CLB luôn được giữ tối thiểu từ 0, giúp CLB an tâm thi đấu giao lưu.
              </Text>
              <Text style={styles.ruleItem}>
                • <Text style={{ fontWeight: '800' }}>Đội hình thực tế & Thưởng bất ngờ:</Text> Điểm thưởng tính toán theo trình độ thực tế của 2 đội hình ra sân; chiến thắng đội mạnh hơn sẽ nhận thêm điểm thưởng.
              </Text>
              <Text style={styles.ruleItem}>
                • <Text style={{ fontWeight: '800' }}>Chống cày điểm:</Text> Giới hạn tối đa 3 trận xếp hạng trong 7 ngày giữa cùng một cặp đối thủ để đảm bảo tính công bằng.
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
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.titleMd,
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
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  summaryTitle: {
    ...TYPOGRAPHY.labelMd,
    color: '#B45309',
    fontWeight: '700',
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
  bulletsList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bulletIconWrap: {
    marginTop: 1,
  },
  bulletText: {
    ...TYPOGRAPHY.bodyMd,
    color: '#334155',
    flex: 1,
    lineHeight: 20,
  },
  rulesBox: {
    backgroundColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  ruleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
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
