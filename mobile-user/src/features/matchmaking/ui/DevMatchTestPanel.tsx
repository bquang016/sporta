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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MatchRoomVM, ClubSummaryVM } from '../../../entities/match/model/match.types';
import { MatchmakingApiRepository } from '../../../shared/api/matchmaking';
import { getClubLineupsApi, createLineupApi, addLineupMemberApi } from '../../../shared/api/clubs';
import { UserAvatar } from '../../../shared/ui/UserAvatar';

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

  // Team-line (MatchLineup) state
  const [hostLineups, setHostLineups] = useState<any[]>([]);
  const [guestLineups, setGuestLineups] = useState<any[]>([]);
  const [selectedHostLineupId, setSelectedHostLineupId] = useState<number | null>(null);
  const [selectedGuestLineupId, setSelectedGuestLineupId] = useState<number | null>(null);
  const [showLineupConfig, setShowLineupConfig] = useState<boolean>(true);
  const [loadingLineups, setLoadingLineups] = useState<boolean>(false);
  const [creatingLineupSide, setCreatingLineupSide] = useState<'HOST' | 'GUEST' | null>(null);

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

  const handleSelectClub = async (clubId: string | number) => {
    try {
      setLoadingAction(true);
      setIsClubModalVisible(false);
      const numericId = Number(clubId);
      const params = assigningSide === 'HOST' ? { hostClubId: numericId } : { guestClubId: numericId };
      await MatchmakingApiRepository.devAssignClubs(room.id, params);
      Alert.alert('DEV Thành Công', `Đã gán CLB cho ${assigningSide === 'HOST' ? 'Đội Chủ Nhà (Side A)' : 'Đội Khách (Side B)'}!`);
      onRefresh();
    } catch (err: any) {
      Alert.alert('Lỗi DEV', err.message || 'Không thể gán CLB');
    } finally {
      setLoadingAction(false);
    }
  };

  // Load team-lines (lineups) for both clubs
  const loadLineups = async () => {
    try {
      setLoadingLineups(true);

      // Side A Lineups
      if (room.hostClub?.id) {
        const hostData = await getClubLineupsApi(Number(room.hostClub.id));
        const listA = Array.isArray(hostData) ? hostData : [];
        setHostLineups(listA);

        if (room.hostLineup?.id && listA.some((l) => l.id === room.hostLineup?.id)) {
          setSelectedHostLineupId(room.hostLineup.id);
        } else if (listA.length > 0) {
          setSelectedHostLineupId(listA[0].id);
        } else {
          setSelectedHostLineupId(null);
        }
      } else {
        setHostLineups([]);
        setSelectedHostLineupId(null);
      }

      // Side B Lineups
      if (room.guestClub?.id) {
        const guestData = await getClubLineupsApi(Number(room.guestClub.id));
        const listB = Array.isArray(guestData) ? guestData : [];
        setGuestLineups(listB);

        if (room.guestLineup?.id && listB.some((l) => l.id === room.guestLineup?.id)) {
          setSelectedGuestLineupId(room.guestLineup.id);
        } else if (listB.length > 0) {
          setSelectedGuestLineupId(listB[0].id);
        } else {
          setSelectedGuestLineupId(null);
        }
      } else {
        setGuestLineups([]);
        setSelectedGuestLineupId(null);
      }
    } catch (err) {
      console.error('Failed to load team-lines for DEV panel', err);
    } finally {
      setLoadingLineups(false);
    }
  };

  useEffect(() => {
    loadLineups();
  }, [room.hostClub?.id, room.guestClub?.id, room.hostLineup?.id, room.guestLineup?.id]);

  // Quick helper to auto-create a sample team-line if a club has no lineups
  const handleAutoCreateLineup = async (side: 'HOST' | 'GUEST') => {
    const club = side === 'HOST' ? room.hostClub : room.guestClub;
    if (!club?.id) return;

    try {
      setCreatingLineupSide(side);
      const members = await MatchmakingApiRepository.getClubMembers(club.id);
      const approved = (members || []).filter((m: any) => m.status === 'APPROVED' || !m.status);

      const newLineup = await createLineupApi(Number(club.id), `Đội hình 1 - ${club.name}`, 'MATCHMAKING');
      if (newLineup?.id) {
        for (const m of approved.slice(0, 7)) {
          const uid = m.userId || m.id;
          if (uid) {
            try {
              await addLineupMemberApi(Number(newLineup.id), Number(uid));
            } catch (ignored) {}
          }
        }
      }

      await loadLineups();
      Alert.alert('Thành công', `Đã tạo nhanh Đội hình mẫu cho ${club.name}!`);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tạo đội hình');
    } finally {
      setCreatingLineupSide(null);
    }
  };

  const selectedHostLineup = hostLineups.find((l) => l.id === selectedHostLineupId);
  const selectedGuestLineup = guestLineups.find((l) => l.id === selectedGuestLineupId);

  const handleForceFinish = async () => {
    if (!room.hostClub || !room.guestClub) {
      Alert.alert('Lỗi DEV', 'Vui lòng gán đủ cả 2 CLB (Side A và Side B) trước khi kết thúc trận đấu.');
      return;
    }

    const hostMemberIds = selectedHostLineup?.members?.map((m: any) => m.userId || m.id) || [];
    const guestMemberIds = selectedGuestLineup?.members?.map((m: any) => m.userId || m.id) || [];

    try {
      setLoadingAction(true);
      await MatchmakingApiRepository.devForceFinishMatch(room.id, {
        hostScore,
        guestScore,
        rawScoreDetails: scoreDetails || undefined,
        hostLineupId: selectedHostLineupId || undefined,
        guestLineupId: selectedGuestLineupId || undefined,
        hostPlayerUserIds: hostMemberIds.length > 0 ? hostMemberIds : undefined,
        guestPlayerUserIds: guestMemberIds.length > 0 ? guestMemberIds : undefined,
      });

      if (onRefresh) {
        await onRefresh();
      }

      const hostLineupName = selectedHostLineup?.name || 'Mặc định';
      const guestLineupName = selectedGuestLineup?.name || 'Mặc định';

      Alert.alert(
        '⚡ DEV: Đã Kết Thúc Trận Đấu!',
        `Tỷ số (${hostScore} - ${guestScore}) đã được ghi nhận.\nTeam-line Side A: "${hostLineupName}" (${hostMemberIds.length} cầu thủ)\nTeam-line Side B: "${guestLineupName}" (${guestMemberIds.length} cầu thủ).\nĐiểm Elo cá nhân và Điểm CRP đã được tính toán & cập nhật!`,
        [
          {
            text: 'Xem Kết Quả & CRP',
            onPress: () => {
              router.push(`/matchmaking/${room.id}/result` as any);
            },
          },
          {
            text: 'Xem Lịch Sử Rank Cá Nhân',
            onPress: () => {
              router.push('/profile/ranked-matches' as any);
            },
          },
          {
            text: 'Ở lại',
            style: 'cancel',
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
            <Ionicons name="code-slash" size={15} color="#FFFFFF" />
          </View>
          <View style={styles.headerTitleWrap}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>BẢNG ĐIỀU KHIỂN TEST</Text>
              <View style={styles.devBadgeInline}>
                <Text style={styles.devBadgeInlineText}>DEV</Text>
              </View>
            </View>
            <Text style={styles.headerSub}>Tài khoản DEV Tester • Tùy chỉnh Team-line & Elo</Text>
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

          {/* Section 2: Choose Team-Line (Đội hình ra sân) */}
          <View style={styles.lineupHeaderRow}>
            <Text style={styles.sectionLabel}>2. ĐỘI HÌNH RA SÂN (TEAM-LINE)</Text>
            <TouchableOpacity
              style={styles.lineupToggleBtn}
              onPress={() => setShowLineupConfig(!showLineupConfig)}
            >
              <Ionicons
                name={showLineupConfig ? 'eye-off-outline' : 'shield-checkmark-outline'}
                size={14}
                color="#7C3AED"
              />
              <Text style={styles.lineupToggleBtnText}>
                {showLineupConfig ? 'Thu gọn' : 'Xem Team-line'}
              </Text>
            </TouchableOpacity>
          </View>

          {showLineupConfig && (
            <View style={styles.lineupContainer}>
              {loadingLineups ? (
                <View style={{ padding: 12, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#7C3AED" />
                  <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                    Đang tải danh sách Team-line...
                  </Text>
                </View>
              ) : (
                <View style={styles.lineupGrid}>
                  {/* Side A Team-Lines */}
                  <View style={styles.lineupCol}>
                    <View style={styles.lineupColHeader}>
                      <Text style={styles.lineupColTitle} numberOfLines={1}>
                        Side A: {room.hostClub?.name || 'Chưa chọn'}
                      </Text>
                    </View>

                    <ScrollView style={styles.lineupScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                      {hostLineups.length === 0 ? (
                        <View style={styles.emptyLineupBox}>
                          <Text style={styles.emptyMemberText}>Chưa có Team-line nào</Text>
                          <TouchableOpacity
                            style={styles.autoCreateBtn}
                            onPress={() => handleAutoCreateLineup('HOST')}
                            disabled={creatingLineupSide === 'HOST'}
                          >
                            {creatingLineupSide === 'HOST' ? (
                              <ActivityIndicator size="small" color="#7C3AED" />
                            ) : (
                              <>
                                <Ionicons name="add-circle-outline" size={13} color="#7C3AED" />
                                <Text style={styles.autoCreateBtnText}>Tạo nhanh Team-line</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      ) : (
                        hostLineups.map((l: any) => {
                          const isSelected = selectedHostLineupId === l.id;
                          return (
                            <TouchableOpacity
                              key={l.id}
                              style={[
                                styles.teamLineCard,
                                isSelected && styles.teamLineCardSelected,
                              ]}
                              onPress={() => setSelectedHostLineupId(l.id)}
                              activeOpacity={0.7}
                            >
                              <View style={styles.teamLineTop}>
                                <Ionicons
                                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                                  size={16}
                                  color={isSelected ? '#7C3AED' : '#94A3B8'}
                                />
                                <Text style={[styles.teamLineName, isSelected && styles.teamLineNameActive]} numberOfLines={1}>
                                  {l.name || `Đội hình #${l.id}`}
                                </Text>
                              </View>

                              <View style={styles.teamLineMetaRow}>
                                <View style={styles.eloBadge}>
                                  <Text style={styles.eloBadgeText}>{l.eloAvg || 1500} ELO</Text>
                                </View>
                                <Text style={styles.playerCountText}>
                                  {l.memberCount || l.members?.length || 0} cầu thủ
                                </Text>
                              </View>

                              {l.members && l.members.length > 0 && (
                                <View style={styles.avatarStack}>
                                  {l.members.slice(0, 4).map((m: any, idx: number) => (
                                    <UserAvatar
                                      key={m.userId || idx}
                                      uri={m.avatarUrl}
                                      name={m.fullName || m.name}
                                      size={20}
                                      style={{ marginLeft: idx === 0 ? 0 : -6, zIndex: 10 - idx }}
                                    />
                                  ))}
                                </View>
                              )}
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </ScrollView>
                  </View>

                  {/* Side B Team-Lines */}
                  <View style={styles.lineupCol}>
                    <View style={styles.lineupColHeader}>
                      <Text style={styles.lineupColTitle} numberOfLines={1}>
                        Side B: {room.guestClub?.name || 'Chưa chọn'}
                      </Text>
                    </View>

                    <ScrollView style={styles.lineupScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                      {guestLineups.length === 0 ? (
                        <View style={styles.emptyLineupBox}>
                          <Text style={styles.emptyMemberText}>Chưa có Team-line nào</Text>
                          <TouchableOpacity
                            style={styles.autoCreateBtn}
                            onPress={() => handleAutoCreateLineup('GUEST')}
                            disabled={creatingLineupSide === 'GUEST'}
                          >
                            {creatingLineupSide === 'GUEST' ? (
                              <ActivityIndicator size="small" color="#7C3AED" />
                            ) : (
                              <>
                                <Ionicons name="add-circle-outline" size={13} color="#7C3AED" />
                                <Text style={styles.autoCreateBtnText}>Tạo nhanh Team-line</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      ) : (
                        guestLineups.map((l: any) => {
                          const isSelected = selectedGuestLineupId === l.id;
                          return (
                            <TouchableOpacity
                              key={l.id}
                              style={[
                                styles.teamLineCard,
                                isSelected && styles.teamLineCardSelected,
                              ]}
                              onPress={() => setSelectedGuestLineupId(l.id)}
                              activeOpacity={0.7}
                            >
                              <View style={styles.teamLineTop}>
                                <Ionicons
                                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                                  size={16}
                                  color={isSelected ? '#7C3AED' : '#94A3B8'}
                                />
                                <Text style={[styles.teamLineName, isSelected && styles.teamLineNameActive]} numberOfLines={1}>
                                  {l.name || `Đội hình #${l.id}`}
                                </Text>
                              </View>

                              <View style={styles.teamLineMetaRow}>
                                <View style={styles.eloBadge}>
                                  <Text style={styles.eloBadgeText}>{l.eloAvg || 1500} ELO</Text>
                                </View>
                                <Text style={styles.playerCountText}>
                                  {l.memberCount || l.members?.length || 0} cầu thủ
                                </Text>
                              </View>

                              {l.members && l.members.length > 0 && (
                                <View style={styles.avatarStack}>
                                  {l.members.slice(0, 4).map((m: any, idx: number) => (
                                    <UserAvatar
                                      key={m.userId || idx}
                                      uri={m.avatarUrl}
                                      name={m.fullName || m.name}
                                      size={20}
                                      style={{ marginLeft: idx === 0 ? 0 : -6, zIndex: 10 - idx }}
                                    />
                                  ))}
                                </View>
                              )}
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
                value={searchClubText}
                onChangeText={setSearchClubText}
                placeholder="Tìm kiếm CLB theo tên..."
                placeholderTextColor="#94A3B8"
              />
              {searchClubText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchClubText('')}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {loadingClubs ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color="#7C3AED" />
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
                    {club.logoUrl || club.avatarUrl ? (
                      <Image
                        source={{ uri: club.logoUrl || club.avatarUrl }}
                        style={styles.clubAvatar}
                      />
                    ) : (
                      <View style={styles.clubAvatarPlaceholder}>
                        <Ionicons name="shield" size={18} color="#7C3AED" />
                      </View>
                    )}
                    <View style={styles.clubInfo}>
                      <Text style={styles.clubItemName} numberOfLines={1}>
                        {club.name}
                      </Text>
                      <Text style={styles.clubItemSub}>
                        {club.sportName || 'Thể thao'}
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
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D8B4FE',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F3E8FF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  devIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#581C87',
    letterSpacing: 0.5,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  devBadgeInline: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devBadgeInlineText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  headerSub: {
    fontSize: 10.5,
    color: '#7E22CE',
    marginTop: 2,
  },
  body: {
    padding: 14,
    gap: 10,
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
    includeFontPadding: false,
    textAlignVertical: 'center',
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
    includeFontPadding: false,
    textAlignVertical: 'center',
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
  lineupScroll: {
    maxHeight: 180,
  },
  teamLineCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  teamLineCardSelected: {
    backgroundColor: '#FAF5FF',
    borderColor: '#A855F7',
    borderWidth: 1.5,
  },
  teamLineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamLineName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  teamLineNameActive: {
    color: '#7C3AED',
    fontWeight: '800',
  },
  teamLineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  eloBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eloBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  playerCountText: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  emptyLineupBox: {
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  emptyMemberText: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  autoCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  autoCreateBtnText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#7C3AED',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  quickScoreRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickScoreChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickScoreChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  quickScoreChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B21A8',
    includeFontPadding: false,
    textAlignVertical: 'center',
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
    paddingVertical: 0,
    textAlignVertical: 'center',
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
    includeFontPadding: false,
    textAlignVertical: 'center',
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
    gap: 10,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flexShrink: 1,
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
    height: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
    textAlignVertical: 'center',
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
