import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MatchRoomVM, ClubSummaryVM } from '../../../entities/match/model/match.types';
import { MatchmakingApiRepository } from '../../../shared/api/matchmaking';

interface DevMatchTestPanelProps {
  room: MatchRoomVM;
  onRefresh: () => void;
}

export function DevMatchTestPanel({ room, onRefresh }: DevMatchTestPanelProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<boolean>(true);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);

  // Club selection modal
  const [isClubModalVisible, setIsClubModalVisible] = useState<boolean>(false);
  const [assigningSide, setAssigningSide] = useState<'HOST' | 'GUEST'>('GUEST');
  const [allClubs, setAllClubs] = useState<ClubSummaryVM[]>([]);
  const [loadingClubs, setLoadingClubs] = useState<boolean>(false);
  const [searchClubText, setSearchClubText] = useState<string>('');

  // Score inputs
  const [hostScore, setHostScore] = useState<string>('3');
  const [guestScore, setGuestScore] = useState<string>('1');
  const [scoreDetails, setScoreDetails] = useState<string>('');

  const fetchClubs = async () => {
    try {
      setLoadingClubs(true);
      const data = await MatchmakingApiRepository.listAllClubs();
      setAllClubs(data);
    } catch (err: any) {
      Alert.alert('Lỗi DEV', err.message || 'Không thể tải danh sách CLB');
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleOpenAssignModal = (side: 'HOST' | 'GUEST') => {
    setAssigningSide(side);
    setSearchClubText('');
    setIsClubModalVisible(true);
    fetchClubs();
  };

  const handleSelectClub = async (clubId: string) => {
    try {
      setLoadingAction(true);
      setIsClubModalVisible(false);
      const params = assigningSide === 'HOST' ? { hostClubId: clubId } : { guestClubId: clubId };
      await MatchmakingApiRepository.devAssignClubs(room.id, params);
      Alert.alert('DEV Thành Công', `Đã gán CLB cho ${assigningSide === 'HOST' ? 'Đội Chủ Nhà (Side A)' : 'Đội Khách (Side B)'}!`);
      onRefresh();
    } catch (err: any) {
      Alert.alert('Lỗi DEV', err.message || 'Không thể gán CLB');
    } finally {
      setLoadingAction(false);
    }
  };

  // Lineup state
  const [hostMembers, setHostMembers] = useState<any[]>([]);
  const [guestMembers, setGuestMembers] = useState<any[]>([]);
  const [selectedHostUserIds, setSelectedHostUserIds] = useState<number[]>([]);
  const [selectedGuestUserIds, setSelectedGuestUserIds] = useState<number[]>([]);
  const [showLineupConfig, setShowLineupConfig] = useState<boolean>(false);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);

  // Load members when clubs change
  useEffect(() => {
    const loadClubMembers = async () => {
      try {
        setLoadingMembers(true);
        if (room.hostClub?.id) {
          const members = await MatchmakingApiRepository.getClubMembers(room.hostClub.id);
          const approved = (members || []).filter((m: any) => m.status === 'APPROVED' || !m.status);
          setHostMembers(approved);
          setSelectedHostUserIds(approved.map((m: any) => m.userId || m.id));
        } else {
          setHostMembers([]);
          setSelectedHostUserIds([]);
        }

        if (room.guestClub?.id) {
          const members = await MatchmakingApiRepository.getClubMembers(room.guestClub.id);
          const approved = (members || []).filter((m: any) => m.status === 'APPROVED' || !m.status);
          setGuestMembers(approved);
          setSelectedGuestUserIds(approved.map((m: any) => m.userId || m.id));
        } else {
          setGuestMembers([]);
          setSelectedGuestUserIds([]);
        }
      } catch (err) {
        console.error('Failed to load club members for DEV panel', err);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadClubMembers();
  }, [room.hostClub?.id, room.guestClub?.id]);

  const toggleHostMember = (userId: number) => {
    setSelectedHostUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleGuestMember = (userId: number) => {
    setSelectedGuestUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleAllHostMembers = () => {
    if (selectedHostUserIds.length === hostMembers.length) {
      setSelectedHostUserIds([]);
    } else {
      setSelectedHostUserIds(hostMembers.map((m) => m.userId || m.id));
    }
  };

  const toggleAllGuestMembers = () => {
    if (selectedGuestUserIds.length === guestMembers.length) {
      setSelectedGuestUserIds([]);
    } else {
      setSelectedGuestUserIds(guestMembers.map((m) => m.userId || m.id));
    }
  };

  const handleForceFinish = async () => {
    if (!room.hostClub || !room.guestClub) {
      Alert.alert('Lỗi DEV', 'Vui lòng gán đủ cả 2 CLB (Side A và Side B) trước khi kết thúc trận đấu.');
      return;
    }

    try {
      setLoadingAction(true);
      await MatchmakingApiRepository.devForceFinishMatch(room.id, {
        hostScore,
        guestScore,
        rawScoreDetails: scoreDetails || undefined,
        hostPlayerUserIds: selectedHostUserIds.length > 0 ? selectedHostUserIds : undefined,
        guestPlayerUserIds: selectedGuestUserIds.length > 0 ? selectedGuestUserIds : undefined,
      });

      Alert.alert(
        '⚡ DEV: Đã Kết Thúc Trận Đấu!',
        `Tỷ số (${hostScore} - ${guestScore}) đã được ghi nhận.\nĐội hình Side A: ${selectedHostUserIds.length} người\nĐội hình Side B: ${selectedGuestUserIds.length} người.\nĐiểm Elo cá nhân của những người tham gia và Điểm CRP của cả 2 CLB đã được cập nhật!`,
        [
          {
            text: 'Ở lại phòng',
            onPress: () => onRefresh(),
          },
          {
            text: 'Xem Lịch Sử Trận Xếp Hạng',
            onPress: () => {
              onRefresh();
              router.push('/profile/ranked-matches' as any);
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Lỗi DEV', err.message || 'Không thể kết thúc trận đấu');
    } finally {
      setLoadingAction(false);
    }
  };

  const filteredClubs = allClubs.filter((c) =>
    c.name.toLowerCase().includes(searchClubText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <View style={styles.devIconCircle}>
            <Ionicons name="code-slash" size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>BẢNG ĐIỀU KHIỂN TEST DEV</Text>
            <Text style={styles.headerSub}>Tài khoản DEV Tester • Tùy chỉnh đội hình & Elo</Text>
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#7C3AED" />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {/* Section 1: Assign Clubs */}
          <Text style={styles.sectionLabel}>1. GÁN CLB THAM GIA KÈO ĐẤU</Text>
          <View style={styles.clubAssignGrid}>
            <View style={styles.clubAssignBox}>
              <Text style={styles.clubAssignRole}>ĐỘI CHỦ (SIDE A)</Text>
              <Text style={styles.clubAssignName} numberOfLines={1}>
                {room.hostClub?.name || 'Chưa có'}
              </Text>
              <TouchableOpacity
                style={styles.changeClubBtn}
                onPress={() => handleOpenAssignModal('HOST')}
                disabled={loadingAction}
              >
                <Ionicons name="swap-horizontal" size={13} color="#7C3AED" />
                <Text style={styles.changeClubBtnText}>Đổi Side A</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.clubAssignBox}>
              <Text style={styles.clubAssignRole}>ĐỘI KHÁCH (SIDE B)</Text>
              <Text style={styles.clubAssignName} numberOfLines={1}>
                {room.guestClub?.name || 'Chưa có'}
              </Text>
              <TouchableOpacity
                style={styles.changeClubBtn}
                onPress={() => handleOpenAssignModal('GUEST')}
                disabled={loadingAction}
              >
                <Ionicons name="swap-horizontal" size={13} color="#7C3AED" />
                <Text style={styles.changeClubBtnText}>Đổi Side B</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 2: Choose Lineup (Đội hình ra sân) */}
          <View style={styles.lineupHeaderRow}>
            <Text style={styles.sectionLabel}>2. ĐỘI HÌNH THI ĐẤU (TÍNH ELO CÁ NHÂN)</Text>
            <TouchableOpacity
              style={styles.lineupToggleBtn}
              onPress={() => setShowLineupConfig(!showLineupConfig)}
            >
              <Ionicons
                name={showLineupConfig ? 'eye-off-outline' : 'people-outline'}
                size={14}
                color="#7C3AED"
              />
              <Text style={styles.lineupToggleBtnText}>
                {showLineupConfig
                  ? 'Thu gọn'
                  : `Chọn người (${selectedHostUserIds.length} vs ${selectedGuestUserIds.length})`}
              </Text>
            </TouchableOpacity>
          </View>

          {showLineupConfig && (
            <View style={styles.lineupContainer}>
              {loadingMembers ? (
                <View style={{ padding: 12, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#7C3AED" />
                  <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                    Đang tải thành viên...
                  </Text>
                </View>
              ) : (
                <View style={styles.lineupGrid}>
                  {/* Side A Lineup */}
                  <View style={styles.lineupCol}>
                    <View style={styles.lineupColHeader}>
                      <Text style={styles.lineupColTitle}>
                        Side A ({selectedHostUserIds.length}/{hostMembers.length})
                      </Text>
                      <TouchableOpacity onPress={toggleAllHostMembers}>
                        <Text style={styles.lineupSelectAllText}>
                          {selectedHostUserIds.length === hostMembers.length ? 'Bỏ chọn' : 'Tất cả'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.memberScroll} nestedScrollEnabled>
                      {hostMembers.length === 0 ? (
                        <Text style={styles.emptyMemberText}>Chưa có thành viên</Text>
                      ) : (
                        hostMembers.map((m: any) => {
                          const uid = m.userId || m.id;
                          const isSelected = selectedHostUserIds.includes(uid);
                          return (
                            <TouchableOpacity
                              key={uid}
                              style={[
                                styles.memberItem,
                                isSelected && styles.memberItemSelected,
                              ]}
                              onPress={() => toggleHostMember(uid)}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name={isSelected ? 'checkbox' : 'square-outline'}
                                size={16}
                                color={isSelected ? '#7C3AED' : '#94A3B8'}
                              />
                              <View style={styles.memberInfoCol}>
                                <Text style={styles.memberNameText} numberOfLines={1}>
                                  {m.name || m.fullName || `User #${uid}`}
                                </Text>
                                <Text style={styles.memberRoleText}>
                                  {m.role || 'Thành viên'} • {m.elo || 1500} Elo
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </ScrollView>
                  </View>

                  {/* Side B Lineup */}
                  <View style={styles.lineupCol}>
                    <View style={styles.lineupColHeader}>
                      <Text style={styles.lineupColTitle}>
                        Side B ({selectedGuestUserIds.length}/{guestMembers.length})
                      </Text>
                      <TouchableOpacity onPress={toggleAllGuestMembers}>
                        <Text style={styles.lineupSelectAllText}>
                          {selectedGuestUserIds.length === guestMembers.length ? 'Bỏ chọn' : 'Tất cả'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.memberScroll} nestedScrollEnabled>
                      {guestMembers.length === 0 ? (
                        <Text style={styles.emptyMemberText}>Chưa có thành viên</Text>
                      ) : (
                        guestMembers.map((m: any) => {
                          const uid = m.userId || m.id;
                          const isSelected = selectedGuestUserIds.includes(uid);
                          return (
                            <TouchableOpacity
                              key={uid}
                              style={[
                                styles.memberItem,
                                isSelected && styles.memberItemSelected,
                              ]}
                              onPress={() => toggleGuestMember(uid)}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name={isSelected ? 'checkbox' : 'square-outline'}
                                size={16}
                                color={isSelected ? '#7C3AED' : '#94A3B8'}
                              />
                              <View style={styles.memberInfoCol}>
                                <Text style={styles.memberNameText} numberOfLines={1}>
                                  {m.name || m.fullName || `User #${uid}`}
                                </Text>
                                <Text style={styles.memberRoleText}>
                                  {m.role || 'Thành viên'} • {m.elo || 1500} Elo
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </ScrollView>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Section 3: Input Score & Force Finish */}
          <Text style={[styles.sectionLabel, { marginTop: 10 }]}>3. NHẬP TỶ SỐ & KẾT THÚC TRẬN ĐẤU</Text>

          {/* Quick Score Chips */}
          <View style={styles.quickScoreRow}>
            {[
              { h: '3', g: '1' },
              { h: '2', g: '0' },
              { h: '1', g: '2' },
              { h: '0', g: '0' },
              { h: '5', g: '4' },
            ].map((s, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.quickScoreChip,
                  hostScore === s.h && guestScore === s.g && styles.quickScoreChipActive,
                ]}
                onPress={() => {
                  setHostScore(s.h);
                  setGuestScore(s.g);
                }}
              >
                <Text
                  style={[
                    styles.quickScoreChipText,
                    hostScore === s.h && guestScore === s.g && styles.quickScoreChipTextActive,
                  ]}
                >
                  {s.h} - {s.g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.scoreInputRow}>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreColLabel}>Tỷ số Side A</Text>
              <TextInput
                style={styles.scoreInput}
                keyboardType="numeric"
                value={hostScore}
                onChangeText={setHostScore}
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <Text style={styles.scoreVsText}>-</Text>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreColLabel}>Tỷ số Side B</Text>
              <TextInput
                style={styles.scoreInput}
                keyboardType="numeric"
                value={guestScore}
                onChangeText={setGuestScore}
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Force Finish Button */}
          <TouchableOpacity
            style={[styles.forceFinishBtn, loadingAction && { opacity: 0.6 }]}
            onPress={handleForceFinish}
            disabled={loadingAction}
            activeOpacity={0.85}
          >
            {loadingAction ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="flash" size={16} color="#FFFFFF" />
                <Text style={styles.forceFinishBtnText}>
                  KẾT THÚC TRẬN ĐẤU & TÍNH ĐIỂM ELO / CRP NGAY
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Club Selector Modal */}
      <Modal
        visible={isClubModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsClubModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Chọn CLB {assigningSide === 'HOST' ? 'Side A (Chủ)' : 'Side B (Khách)'}
                </Text>
                <Text style={styles.modalSubTitle}>
                  Tất cả CLB ({filteredClubs.length}/{allClubs.length})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsClubModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={16} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm tên CLB..."
                placeholderTextColor="#94A3B8"
                value={searchClubText}
                onChangeText={setSearchClubText}
              />
            </View>

            {loadingClubs ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator color="#7C3AED" />
                <Text style={styles.modalLoadingText}>Đang tải danh sách CLB...</Text>
              </View>
            ) : (
              <ScrollView style={styles.clubsList} showsVerticalScrollIndicator={false}>
                {filteredClubs.map((club) => (
                  <TouchableOpacity
                    key={club.id}
                    style={styles.clubItem}
                    onPress={() => handleSelectClub(club.id)}
                    activeOpacity={0.7}
                  >
                    {club.avatarUrl ? (
                      <Image source={{ uri: club.avatarUrl }} style={styles.clubAvatar} />
                    ) : (
                      <View style={styles.clubAvatarPlaceholder}>
                        <MaterialCommunityIcons name="shield" size={18} color="#7C3AED" />
                      </View>
                    )}
                    <View style={styles.clubInfo}>
                      <Text style={styles.clubItemName}>{club.name}</Text>
                      <Text style={styles.clubItemSub}>
                        {club.sportName} • {club.clubElo} Elo • {club.crp} CRP
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF5FF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#C084FC',
    marginHorizontal: 16,
    marginVertical: 10,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#F3E8FF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  devIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6B21A8',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 10,
    color: '#7E22CE',
    marginTop: 1,
  },
  body: {
    padding: 14,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B21A8',
    letterSpacing: 0.5,
  },
  clubAssignGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  clubAssignBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    gap: 4,
  },
  clubAssignRole: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9333EA',
  },
  clubAssignName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  changeClubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  changeClubBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
  },
  lineupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  lineupToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lineupToggleBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
  },
  lineupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    padding: 10,
  },
  lineupGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  lineupCol: {
    flex: 1,
  },
  lineupColHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 6,
  },
  lineupColTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B21A8',
  },
  lineupSelectAllText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
  },
  memberScroll: {
    maxHeight: 140,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  memberItemSelected: {
    backgroundColor: '#FAF5FF',
  },
  memberInfoCol: {
    flex: 1,
  },
  memberNameText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  memberRoleText: {
    fontSize: 8.5,
    color: '#64748B',
  },
  emptyMemberText: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 8,
    textAlign: 'center',
  },
  quickScoreRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickScoreChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  quickScoreChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  quickScoreChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B21A8',
  },
  quickScoreChipTextActive: {
    color: '#FFFFFF',
  },
  scoreInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  scoreCol: {
    alignItems: 'center',
    gap: 4,
  },
  scoreColLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  scoreInput: {
    width: 60,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C084FC',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  scoreVsText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 18,
  },
  forceFinishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
  },
  forceFinishBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubTitle: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '700',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  modalLoading: {
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  modalLoadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  clubsList: {
    maxHeight: 320,
  },
  clubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  clubAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  clubAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubInfo: {
    flex: 1,
  },
  clubItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  clubItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
