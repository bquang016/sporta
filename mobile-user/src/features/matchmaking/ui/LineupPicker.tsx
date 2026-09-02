import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { getAvailableLineupsApi } from '../../../shared/api/clubs';
import { EditLineupModal } from './EditLineupModal';
import { UserAvatar } from '../../../shared/ui/UserAvatar';

export interface LineupPickerProps {
  clubId?: string | number;
  clubName?: string;
  sportId?: string | number;
  selectedLineupId?: number;
  onSelectLineup: (lineup: any) => void;
  onNavigateToClub?: () => void;
  stepNumber?: number;
}

export function LineupPicker({
  clubId,
  clubName,
  sportId,
  selectedLineupId,
  onSelectLineup,
  onNavigateToClub,
  stepNumber = 2,
}: LineupPickerProps) {
  const [lineups, setLineups] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingLineup, setEditingLineup] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const fetchLineups = () => {
    if (!clubId) {
      setLineups([]);
      return;
    }
    setLoading(true);
    getAvailableLineupsApi(Number(clubId), sportId ? Number(sportId) : undefined)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setLineups(list);
        if (list.length > 0 && (!selectedLineupId || !list.some((l) => l.id === selectedLineupId))) {
          onSelectLineup(list[0]);
        }
      })
      .catch((err) => {
        console.error('Error fetching available lineups:', err);
        setLineups([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLineups();
  }, [clubId, sportId]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.sectionIconCircle}>
          <Ionicons name="people" size={16} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{stepNumber}. Chọn Đội Hình Ra Sân</Text>
          <Text style={styles.subtext}>
            Chọn danh sách các thành viên đại diện CLB ra sân thi đấu.
          </Text>
        </View>
      </View>

      {!clubId ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Vui lòng chọn CLB đại diện trước.</Text>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang kiểm tra đội hình khả dụng của CLB...</Text>
        </View>
      ) : lineups.length === 0 ? (
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning-outline" size={20} color="#D97706" />
            <Text style={styles.warningTitle}>Chưa có đội hình ra sân sẵn sàng</Text>
          </View>
          <Text style={styles.warningDesc}>
            CLB <Text style={{ fontWeight: '700', color: '#1E293B' }}>{clubName || 'này'}</Text> chưa có đội hình ghép trận (Đội GT) nào ở trạng thái sẵn sàng.
          </Text>
          <Text style={styles.warningSubDesc}>
            Hãy vào trang CLB, tạo biểu quyết để chốt quân số hoặc thiết lập đội hình trước khi tạo kèo tìm đối thủ.
          </Text>

          {onNavigateToClub && (
            <TouchableOpacity
              style={styles.ctaBtn}
              activeOpacity={0.8}
              onPress={onNavigateToClub}
            >
              <Ionicons name="stats-chart" size={14} color="#FFFFFF" />
              <Text style={styles.ctaBtnText}>Đến CLB tạo biểu quyết chốt đội hình</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.lineupList}>
          {lineups.map((lineup) => {
            const isSelected = selectedLineupId === lineup.id;
            const members = lineup.members || [];
            const count = lineup.memberCount || members.length || 0;

            return (
              <TouchableOpacity
                key={lineup.id}
                style={[styles.lineupCard, isSelected && styles.lineupCardSelected]}
                activeOpacity={0.85}
                onPress={() => onSelectLineup(lineup)}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.cardTitleWrap}>
                    <Text style={[styles.lineupName, isSelected && styles.lineupNameSelected]} numberOfLines={1}>
                      {lineup.name || 'Đội hình Ghép trận'}
                    </Text>
                    {lineup.eloAvg ? (
                      <View style={styles.eloBadge}>
                        <Ionicons name="star" size={11} color="#B45309" />
                        <Text style={styles.eloText}>{lineup.eloAvg} ELO</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>

                {/* Members preview & Edit CTA */}
                <View style={styles.cardBottomRow}>
                  <View style={styles.cardBottomLeft}>
                    <View style={styles.avatarStack}>
                      {members.slice(0, 5).map((m: any, idx: number) => (
                        <UserAvatar
                          key={m.userId || idx}
                          uri={m.avatarUrl || m.avatar}
                          name={m.fullName || m.name}
                          size={24}
                          style={{ marginLeft: idx === 0 ? 0 : -8, zIndex: 10 - idx }}
                        />
                      ))}
                    </View>
                    <Text style={styles.memberCountText}>
                      {count} thành viên
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.editLineupBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      setEditingLineup(lineup);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Ionicons name="create-outline" size={13} color={COLORS.primary} />
                    <Text style={styles.editLineupBtnText}>Đổi người</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Edit Lineup Modal */}
      {editingLineup && (
        <EditLineupModal
          visible={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingLineup(null);
          }}
          mode="MATCHMAKING"
          lineup={editingLineup}
          clubId={Number(clubId)}
          onSuccess={() => {
            fetchLineups();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.sm,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtext: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  emptyCard: {
    padding: SPACING.md,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.bodySm,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    color: '#64748B',
    fontSize: 12,
  },
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: 4,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  warningTitle: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '800',
    color: '#92400E',
    fontSize: 13,
  },
  warningDesc: {
    ...TYPOGRAPHY.bodySm,
    color: '#78350F',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  warningSubDesc: {
    ...TYPOGRAPHY.caption,
    color: '#B45309',
    fontSize: 11.5,
    lineHeight: 15,
    marginBottom: 10,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
  },
  ctaBtnText: {
    ...TYPOGRAPHY.labelSm,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  lineupList: {
    gap: 8,
    marginTop: 4,
  },
  lineupCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
  },
  lineupCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  lineupName: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  lineupNameSelected: {
    color: COLORS.primary,
  },
  eloBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  eloText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B45309',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editLineupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  editLineupBtnText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#CBD5E1',
  },
  memberCountText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
});
