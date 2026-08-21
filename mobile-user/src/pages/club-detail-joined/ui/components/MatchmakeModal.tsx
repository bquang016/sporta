import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';

export interface MatchmakeModalProps {
  visible: boolean;
  onClose: () => void;
  teamA: string[];
  teamB: string[];
  onReshuffle: () => void;
  onConfirm: () => void;
}

export function MatchmakeModal({
  visible,
  onClose,
  teamA,
  teamB,
  onReshuffle,
  onConfirm
}: MatchmakeModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <View style={styles.matchmakeSheetContent}>
          <View style={styles.sheetHeader}>
            <View style={styles.titleRow}>
              <MaterialIcons name="sports-kabaddi" size={24} color={COLORS.primary} />
              <Text style={styles.sheetTitle}>Tự động chia đội ghép trận</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.matchmakeScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.matchmakeSubtitle}>
              Hệ thống đã chọn ngẫu nhiên danh sách {teamA.length + teamB.length} thành viên biểu quyết "Tham gia" và phân bổ thành 2 đội cân đối.
            </Text>

            <View style={styles.teamsGrid}>
              {/* Team A */}
              <View style={styles.teamCard}>
                <View style={styles.teamHeaderBadgeA}>
                  <Text style={styles.teamHeaderTextA}>ĐỘI A ({teamA.length})</Text>
                </View>
                <View style={styles.teamMemberList}>
                  {teamA.length === 0 ? (
                    <Text style={styles.emptyTeamText}>Chưa có thành viên</Text>
                  ) : (
                    teamA.map((member, index) => (
                      <View key={index} style={styles.teamMemberItem}>
                        <View style={styles.memberNumberBadgeA}>
                          <Text style={styles.memberNumberTextA}>{index + 1}</Text>
                        </View>
                        <Text style={styles.teamMemberName} numberOfLines={1}>{member}</Text>
                      </View>
                    ))
                  )}
                </View>
              </View>

              {/* Team B */}
              <View style={styles.teamCard}>
                <View style={styles.teamHeaderBadgeB}>
                  <Text style={styles.teamHeaderTextB}>ĐỘI B ({teamB.length})</Text>
                </View>
                <View style={styles.teamMemberList}>
                  {teamB.length === 0 ? (
                    <Text style={styles.emptyTeamText}>Chưa có thành viên</Text>
                  ) : (
                    teamB.map((member, index) => (
                      <View key={index} style={styles.teamMemberItem}>
                        <View style={styles.memberNumberBadgeB}>
                          <Text style={styles.memberNumberTextB}>{index + 1}</Text>
                        </View>
                        <Text style={styles.teamMemberName} numberOfLines={1}>{member}</Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>

            <View style={styles.matchmakeActions}>
              <TouchableOpacity
                style={[styles.matchmakeBtn, styles.reshuffleBtn]}
                onPress={onReshuffle}
                activeOpacity={0.8}
              >
                <MaterialIcons name="refresh" size={20} color={COLORS.primary} />
                <Text style={styles.reshuffleBtnText}>Chia lại ngẫu nhiên</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.matchmakeBtn, styles.confirmTeamsBtn]}
                onPress={onConfirm}
                activeOpacity={0.85}
              >
                <MaterialIcons name="check" size={20} color={COLORS.white} />
                <Text style={styles.confirmTeamsBtnText}>Xác nhận đội hình</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity50,
    justifyContent: 'flex-end',
  },
  matchmakeSheetContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl * 1.5,
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  sheetTitle: {
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
  matchmakeScroll: {
    paddingVertical: SPACING.md,
  },
  matchmakeSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
    marginBottom: SPACING.md,
  },
  teamsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  teamCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest || COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: 'hidden',
  },
  teamHeaderBadgeA: {
    backgroundColor: COLORS.primaryOpacity12,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryOpacity15,
  },
  teamHeaderTextA: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    fontSize: 12,
    color: COLORS.primary,
  },
  teamHeaderBadgeB: {
    backgroundColor: '#fef3c7',
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  teamHeaderTextB: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    fontSize: 12,
    color: '#b45309',
  },
  teamMemberList: {
    padding: SPACING.sm,
    gap: SPACING.xs + 2,
  },
  teamMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberNumberBadgeA: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberNumberTextA: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  memberNumberBadgeB: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberNumberTextB: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b45309',
  },
  teamMemberName: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '600',
    flex: 1,
  },
  emptyTeamText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.outline,
    textAlign: 'center',
    paddingVertical: SPACING.base,
  },
  matchmakeActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  matchmakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  reshuffleBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  reshuffleBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  confirmTeamsBtn: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmTeamsBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
