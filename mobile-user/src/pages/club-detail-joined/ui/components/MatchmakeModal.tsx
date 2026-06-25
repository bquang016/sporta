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
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.matchmakeScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.matchmakeSubtitle}>
              Hệ thống tự động xuất danh sách thành viên đăng ký "Tham gia" và chia thành 2 đội cân bằng ngẫu nhiên.
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
                        <MaterialIcons name="person" size={16} color={COLORS.primary} />
                        <Text style={styles.teamMemberName}>{member}</Text>
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
                        <MaterialIcons name="person" size={16} color={COLORS.amber} />
                        <Text style={styles.teamMemberName}>{member}</Text>
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
                <MaterialIcons name="refresh" size={18} color={COLORS.primary} />
                <Text style={styles.reshuffleBtnText}>Chia lại đội</Text>
              </TouchableOpacity>
 
              <TouchableOpacity
                style={[styles.matchmakeBtn, styles.confirmTeamsBtn]}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <MaterialIcons name="check" size={18} color={COLORS.white} />
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
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    maxHeight: '75%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryOpacity10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  sheetTitle: {
    ...TYPOGRAPHY.bodyMd,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  matchmakeScroll: {
    paddingVertical: SPACING.base,
  },
  matchmakeSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  teamsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  teamCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    overflow: 'hidden',
  },
  teamHeaderBadgeA: {
    backgroundColor: COLORS.primaryOpacity10,
    paddingVertical: SPACING.base,
    alignItems: 'center',
  },
  teamHeaderTextA: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    fontSize: 12,
    color: COLORS.primary,
  },
  teamHeaderBadgeB: {
    backgroundColor: COLORS.amberOpacity10,
    paddingVertical: SPACING.base,
    alignItems: 'center',
  },
  teamHeaderTextB: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: '800',
    fontSize: 12,
    color: COLORS.amber,
  },
  teamMemberList: {
    padding: SPACING.sm,
    gap: SPACING.base,
  },
  teamMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  teamMemberName: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurface,
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
    height: 44,
    borderRadius: BORDER_RADIUS.default,
    gap: SPACING.xs + 2,
  },
  reshuffleBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  reshuffleBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  confirmTeamsBtn: {
    backgroundColor: COLORS.primary,
  },
  confirmTeamsBtnText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
