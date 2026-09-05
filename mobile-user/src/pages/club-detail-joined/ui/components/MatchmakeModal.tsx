import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../../shared/config/theme';
import { Avatar } from '../../../../shared/ui';
import { PollVoter } from './PollCard';

export interface MatchmakeModalProps {
  visible: boolean;
  onClose: () => void;
  teamA: string[];
  teamB: string[];
  teamAPlayers?: PollVoter[];
  teamBPlayers?: PollVoter[];
  allJoinedPlayers?: PollVoter[];
  onSaveTeams: (teams: {
    teamA: string[];
    teamB: string[];
    teamAPlayers: PollVoter[];
    teamBPlayers: PollVoter[];
    teamATotalElo: number;
    teamBTotalElo: number;
  }) => Promise<void> | void;
}

export function MatchmakeModal({
  visible,
  onClose,
  teamA,
  teamB,
  teamAPlayers: initialTeamAPlayers,
  teamBPlayers: initialTeamBPlayers,
  allJoinedPlayers = [],
  onSaveTeams,
}: MatchmakeModalProps) {
  // Local state for interactive player swapping and reshuffling
  const [currentTeamA, setCurrentTeamA] = useState<PollVoter[]>(() => {
    if (initialTeamAPlayers && initialTeamAPlayers.length > 0) return initialTeamAPlayers;
    return teamA.map((name, i) => ({
      userId: i + 1,
      name,
      avatar: '',
      elo: 1200,
      role: 'Thành viên',
    }));
  });

  const [currentTeamB, setCurrentTeamB] = useState<PollVoter[]>(() => {
    if (initialTeamBPlayers && initialTeamBPlayers.length > 0) return initialTeamBPlayers;
    return teamB.map((name, i) => ({
      userId: i + 100,
      name,
      avatar: '',
      elo: 1200,
      role: 'Thành viên',
    }));
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if props change when opening
  React.useEffect(() => {
    if (visible) {
      const allPool = allJoinedPlayers.length > 0
        ? allJoinedPlayers
        : [...(initialTeamAPlayers || []), ...(initialTeamBPlayers || [])];

      if (allPool.length > 0 && (!initialTeamAPlayers || initialTeamAPlayers.length === 0)) {
        // Initial balance split
        performBalanceSplit(allPool);
      } else {
        if (initialTeamAPlayers) setCurrentTeamA(initialTeamAPlayers);
        if (initialTeamBPlayers) setCurrentTeamB(initialTeamBPlayers);
      }
    }
  }, [visible]);

  // ELO Balanced Split (Snake draft)
  const performBalanceSplit = (pool?: PollVoter[]) => {
    const list = [...(pool || [...currentTeamA, ...currentTeamB])];
    list.sort((a, b) => (b.elo || 1200) - (a.elo || 1200));

    const a: PollVoter[] = [];
    const b: PollVoter[] = [];
    let toA = true;

    for (let i = 0; i < list.length; i++) {
      if (toA) {
        a.push(list[i]);
      } else {
        b.push(list[i]);
      }
      if (i % 2 === 1) {
        toA = !toA;
      }
    }

    setCurrentTeamA(a);
    setCurrentTeamB(b);
  };

  // Random Shuffle Split
  const performRandomShuffle = () => {
    const list = [...currentTeamA, ...currentTeamB];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    const mid = Math.ceil(list.length / 2);
    setCurrentTeamA(list.slice(0, mid));
    setCurrentTeamB(list.slice(mid));
  };

  // Swap player between Team A and Team B
  const handleMoveToB = (player: PollVoter) => {
    setCurrentTeamA((prev) => prev.filter((p) => p.userId !== player.userId));
    setCurrentTeamB((prev) => [...prev, player]);
  };

  const handleMoveToA = (player: PollVoter) => {
    setCurrentTeamB((prev) => prev.filter((p) => p.userId !== player.userId));
    setCurrentTeamA((prev) => [...prev, player]);
  };

  const totalPlayers = currentTeamA.length + currentTeamB.length;
  const totalEloA = currentTeamA.reduce((sum, p) => sum + (p.elo || 1200), 0);
  const totalEloB = currentTeamB.reduce((sum, p) => sum + (p.elo || 1200), 0);
  const avgEloA = currentTeamA.length > 0 ? Math.round(totalEloA / currentTeamA.length) : 0;
  const avgEloB = currentTeamB.length > 0 ? Math.round(totalEloB / currentTeamB.length) : 0;

  const handleConfirmSave = async () => {
    setIsSubmitting(true);
    try {
      await onSaveTeams({
        teamA: currentTeamA.map((p) => p.name || p.fullName || 'Thành viên'),
        teamB: currentTeamB.map((p) => p.name || p.fullName || 'Thành viên'),
        teamAPlayers: currentTeamA,
        teamBPlayers: currentTeamB,
        teamATotalElo: totalEloA,
        teamBTotalElo: totalEloB,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <View style={styles.sheetContent}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.titleRow}>
              <MaterialIcons name="sports-kabaddi" size={22} color={COLORS.primary} />
              <Text style={styles.sheetTitle}>Chia đội hình ghép trận</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <MaterialIcons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Actions Row */}
            <View style={styles.shuffleActionRow}>
              <TouchableOpacity
                style={styles.actionPillBtn}
                activeOpacity={0.8}
                onPress={() => performBalanceSplit()}
              >
                <MaterialIcons name="balance" size={16} color={COLORS.primary} />
                <Text style={styles.actionPillBtnText}>Cân bằng ELO</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionPillBtn, styles.actionPillBtnSecondary]}
                activeOpacity={0.8}
                onPress={performRandomShuffle}
              >
                <MaterialIcons name="shuffle" size={16} color="#0284C7" />
                <Text style={[styles.actionPillBtnText, { color: '#0284C7' }]}>
                  Chia ngẫu nhiên
                </Text>
              </TouchableOpacity>
            </View>

            {/* Total summary info */}
            <Text style={styles.helperText}>
              Chạm vào mũi tên bên cạnh cầu thủ để đổi đội hình thủ công.
            </Text>

            {/* Teams Comparison Grid */}
            <View style={styles.teamsGrid}>
              {/* ================= TEAM A ================= */}
              <View style={styles.teamCardA}>
                <View style={styles.teamCardHeaderA}>
                  <Text style={styles.teamCardTitleA}>ĐỘI XANH ({currentTeamA.length})</Text>
                  <Text style={styles.teamAvgEloBadgeA}>Avg {avgEloA} ELO</Text>
                </View>

                <View style={styles.playerList}>
                  {currentTeamA.length === 0 ? (
                    <Text style={styles.emptyRosterText}>Chưa có cầu thủ</Text>
                  ) : (
                    currentTeamA.map((p, idx) => (
                      <View key={p.userId || idx} style={styles.playerItem}>
                        <Avatar source={p.avatar} size={26} fallbackType="user" />
                        <View style={styles.playerItemInfo}>
                          <Text style={styles.playerNameText} numberOfLines={1}>
                            {p.name}
                          </Text>
                          <Text style={styles.playerEloText}>{p.elo || 1200} ELO</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.swapBtn}
                          onPress={() => handleMoveToB(p)}
                        >
                          <MaterialIcons name="arrow-forward" size={15} color="#0284C7" />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>
              </View>

              {/* ================= TEAM B ================= */}
              <View style={styles.teamCardB}>
                <View style={styles.teamCardHeaderB}>
                  <Text style={styles.teamCardTitleB}>ĐỘI CAM ({currentTeamB.length})</Text>
                  <Text style={styles.teamAvgEloBadgeB}>Avg {avgEloB} ELO</Text>
                </View>

                <View style={styles.playerList}>
                  {currentTeamB.length === 0 ? (
                    <Text style={styles.emptyRosterText}>Chưa có cầu thủ</Text>
                  ) : (
                    currentTeamB.map((p, idx) => (
                      <View key={p.userId || idx} style={styles.playerItem}>
                        <TouchableOpacity
                          style={styles.swapBtn}
                          onPress={() => handleMoveToA(p)}
                        >
                          <MaterialIcons name="arrow-back" size={15} color="#D97706" />
                        </TouchableOpacity>
                        <View style={[styles.playerItemInfo, { alignItems: 'flex-end' }]}>
                          <Text style={styles.playerNameText} numberOfLines={1}>
                            {p.name}
                          </Text>
                          <Text style={styles.playerEloText}>{p.elo || 1200} ELO</Text>
                        </View>
                        <Avatar source={p.avatar} size={26} fallbackType="user" />
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.sheetFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmSave}
              disabled={isSubmitting}
            >
              <MaterialIcons name="check" size={18} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>Lưu & Xuất đội hình</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '88%',
    gap: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    gap: 10,
    paddingVertical: 4,
  },
  shuffleActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionPillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  actionPillBtnSecondary: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },
  actionPillBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  helperText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '400',
  },
  teamsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  teamCardA: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 8,
    gap: 6,
  },
  teamCardHeaderA: {
    borderBottomWidth: 1,
    borderBottomColor: '#BAE6FD',
    paddingBottom: 6,
    alignItems: 'center',
    gap: 1,
  },
  teamCardTitleA: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0369A1',
  },
  teamAvgEloBadgeA: {
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '500',
  },
  teamCardB: {
    flex: 1,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 8,
    gap: 6,
  },
  teamCardHeaderB: {
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingBottom: 6,
    alignItems: 'center',
    gap: 1,
  },
  teamCardTitleB: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#B45309',
  },
  teamAvgEloBadgeB: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '500',
  },
  playerList: {
    gap: 6,
  },
  emptyRosterText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 12,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 6,
    gap: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  playerItemInfo: {
    flex: 1,
    gap: 1,
  },
  playerNameText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  playerEloText: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '400',
  },
  swapBtn: {
    padding: 3,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  sheetFooter: {
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
  confirmBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
