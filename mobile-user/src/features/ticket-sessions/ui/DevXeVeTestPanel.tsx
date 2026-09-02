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
import { TicketSession } from '../../../entities/ticket/model/ticket.types';
import { fetchDevUsers, devForceFinishXeVe, DevUserSummary } from '../../../entities/ticket/api/ticketApi';

interface DevXeVeTestPanelProps {
  session: TicketSession;
  onRefresh: () => void;
}

export function DevXeVeTestPanel({ session, onRefresh }: DevXeVeTestPanelProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<boolean>(true);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);

  // Users for Side A and Side B
  const [allUsers, setAllUsers] = useState<DevUserSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [selectedHostUsers, setSelectedHostUsers] = useState<DevUserSummary[]>([]);
  const [selectedGuestUsers, setSelectedGuestUsers] = useState<DevUserSummary[]>([]);

  // User Picker Modal
  const [isUserModalVisible, setIsUserModalVisible] = useState<boolean>(false);
  const [targetTeam, setTargetTeam] = useState<'HOST' | 'GUEST'>('HOST');
  const [searchUserText, setSearchUserText] = useState<string>('');

  // Score Configuration
  const [hostScore, setHostScore] = useState<string>('3');
  const [guestScore, setGuestScore] = useState<string>('1');
  const [scoreDetails, setScoreDetails] = useState<string>('');

  const isFixedHost = Boolean(session.hasHostTeam);

  const getHostTeamBenchmarkElo = () => {
    switch (session.hostTeamLevel) {
      case 'GOOD': return 2100;
      case 'AVERAGE_GOOD': return 1800;
      case 'AVERAGE': return 1500;
      case 'WEAK_AVERAGE': return 1200;
      case 'WEAK': return 900;
      default: return 1500;
    }
  };

  // Initial load of system users
  useEffect(() => {
    loadUsers();
  }, [session.id, isFixedHost]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const users = await fetchDevUsers();
      setAllUsers(users);

      // Default distribute users
      if (users.length >= 1 && selectedHostUsers.length === 0 && selectedGuestUsers.length === 0) {
        if (isFixedHost) {
          setSelectedHostUsers([]);
          setSelectedGuestUsers(users.slice(0, Math.min(2, users.length)));
        } else {
          setSelectedHostUsers([users[0]]);
          setSelectedGuestUsers(users.length >= 2 ? [users[1]] : []);
          if (users.length >= 4) {
            setSelectedHostUsers([users[0], users[2]]);
            setSelectedGuestUsers([users[1], users[3]]);
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to load users for DEV panel:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenUserPicker = (team: 'HOST' | 'GUEST') => {
    setTargetTeam(team);
    setSearchUserText('');
    setIsUserModalVisible(true);
  };

  const toggleUserSelection = (user: DevUserSummary) => {
    if (targetTeam === 'HOST') {
      const exists = selectedHostUsers.some((u) => u.id === user.id);
      if (exists) {
        setSelectedHostUsers(selectedHostUsers.filter((u) => u.id !== user.id));
      } else {
        setSelectedGuestUsers(selectedGuestUsers.filter((u) => u.id !== user.id));
        setSelectedHostUsers([...selectedHostUsers, user]);
      }
    } else {
      const exists = selectedGuestUsers.some((u) => u.id === user.id);
      if (exists) {
        setSelectedGuestUsers(selectedGuestUsers.filter((u) => u.id !== user.id));
      } else {
        setSelectedHostUsers(selectedHostUsers.filter((u) => u.id !== user.id));
        setSelectedGuestUsers([...selectedGuestUsers, user]);
      }
    }
  };

  const handleAutoDistribute = (playersPerTeam: number) => {
    if (allUsers.length < playersPerTeam * 2) {
      Alert.alert('DEV Thông báo', `Hệ thống cần ít nhất ${playersPerTeam * 2} người chơi để phân đều.`);
      return;
    }
    const teamA = allUsers.slice(0, playersPerTeam);
    const teamB = allUsers.slice(playersPerTeam, playersPerTeam * 2);
    setSelectedHostUsers(teamA);
    setSelectedGuestUsers(teamB);
    Alert.alert('DEV Thành Công', `Đã phân bổ tự động ${playersPerTeam} người mỗi đội!`);
  };

  const handleQuickFillGuest = (count: number) => {
    if (allUsers.length < count) {
      Alert.alert('DEV Thông báo', `Hệ thống cần ít nhất ${count} người chơi trong danh sách.`);
      return;
    }
    const challengers = allUsers.slice(0, count);
    setSelectedGuestUsers(challengers);
    Alert.alert('DEV Thành Công', `Đã chọn nhanh ${count} đấu thủ cho Đội Thách Đấu!`);
  };

  const handleForceFinish = async () => {
    if (isFixedHost) {
      if (selectedGuestUsers.length === 0) {
        Alert.alert('Lỗi DEV', 'Vui lòng chọn ít nhất 1 người chơi cho Đội Thách Đấu.');
        return;
      }
    } else {
      if (selectedHostUsers.length === 0 || selectedGuestUsers.length === 0) {
        Alert.alert('Lỗi DEV', 'Vui lòng chọn ít nhất 1 người chơi cho Đội A và 1 người chơi cho Đội B.');
        return;
      }
    }

    if (!hostScore.trim() || !guestScore.trim()) {
      Alert.alert('Lỗi DEV', 'Vui lòng nhập tỷ số trận đấu.');
      return;
    }

    try {
      setLoadingAction(true);
      await devForceFinishXeVe(session.id, {
        hostScore: hostScore.trim(),
        guestScore: guestScore.trim(),
        rawScoreDetails: scoreDetails.trim(),
        hostUserIds: isFixedHost ? [] : selectedHostUsers.map((u) => u.id),
        guestUserIds: selectedGuestUsers.map((u) => u.id),
      });

      onRefresh();

      Alert.alert(
        'DEV XÉ VÉ HOÀN TẤT',
        isFixedHost
          ? `Đã kết thúc ca xé vé với tỷ số ${hostScore} - ${guestScore} và cập nhật điểm Elo cho ${selectedGuestUsers.length} người chơi của Đội Thách Đấu!`
          : `Đã kết thúc ca xé vé với tỷ số ${hostScore} - ${guestScore} và cập nhật điểm Elo cho toàn bộ ${selectedHostUsers.length + selectedGuestUsers.length} người chơi tham gia!`,
        [
          { text: 'Ở lại', style: 'cancel' },
          {
            text: 'Xem Lịch Sử Elo',
            onPress: () => router.push('/profile/ranked-matches' as any),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Lỗi DEV', err.message || 'Không thể kết thúc ca xé vé');
    } finally {
      setLoadingAction(false);
    }
  };

  const filteredUsers = allUsers.filter((u) => {
    if (!searchUserText) return true;
    const s = searchUserText.toLowerCase();
    return u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
  });

  return (
    <View style={styles.container}>
      {/* DEV Header Banner */}
      <TouchableOpacity
        style={styles.headerBanner}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={14} color="#FFFFFF" />
            <Text style={styles.badgeText}>DEV TEST PANEL</Text>
          </View>
          <Text style={styles.headerTitle}>Mô Phỏng & Test Elo Ca Xé Vé</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up-circle' : 'chevron-down-circle'}
          size={22}
          color="#8B5CF6"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.panelContent}>
          {/* Quick Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Công cụ dành riêng cho DEV Tester: Thêm người dùng vào 2 đội, tuỳ chỉnh tỷ số tự do và mô phỏng kết thúc ca xé vé để kiểm tra tính toán điểm Elo tức thì.
            </Text>
          </View>

          {/* Quick Auto Distribute Presets */}
          <View style={styles.quickPresetRow}>
            <Text style={styles.sectionLabel}>{isFixedHost ? 'CHỌN ĐẤU THỦ THÁCH ĐẤU:' : 'PHÂN ĐỘI NHANH:'}</Text>
            {isFixedHost ? (
              <>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => handleQuickFillGuest(1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>1 Người (Đơn)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => handleQuickFillGuest(2)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>2 Người (Đôi)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => handleQuickFillGuest(5)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>5 Người (Sân 5)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => handleQuickFillGuest(7)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>7 Người (Sân 7)</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => handleAutoDistribute(1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>1 vs 1 (Đơn)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => handleAutoDistribute(2)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>2 vs 2 (Đôi)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => handleAutoDistribute(5)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>5 vs 5 (Sân 5)</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Teams Lineup Section */}
          {isFixedHost ? (
            <View style={styles.fixedHostTeamsWrapper}>
              {/* Top: Fixed Host Team Info Banner */}
              <View style={styles.fixedHostCard}>
                <View style={styles.fixedHostHeaderRow}>
                  <View style={styles.fixedHostLeft}>
                    <Ionicons name="shield" size={15} color="#4338CA" />
                    <Text style={styles.fixedHostTitle}>ĐỘI SÂN NHÀ (ĐỐI THỦ)</Text>
                  </View>
                  <View style={styles.fixedTag}>
                    <Text style={styles.fixedTagText}>CỐ ĐỊNH</Text>
                  </View>
                </View>

                <View style={styles.fixedHostBodyRow}>
                  <View style={styles.fixedHostInfoCol}>
                    <Text style={styles.fixedHostTeamName} numberOfLines={1}>
                      {session.hostTeamName || 'Đội Sân Nhà'}
                    </Text>
                    <Text style={styles.fixedHostTeamLevel}>
                      Trình độ: <Text style={{ fontWeight: '800', color: '#1E1B4B' }}>{session.hostTeamLevel || session.sportLevel}</Text> • ~{getHostTeamBenchmarkElo()} Elo
                    </Text>
                  </View>
                  <View style={styles.fixedHostVsPill}>
                    <Text style={styles.fixedHostVsText}>VS</Text>
                  </View>
                </View>
              </View>

              {/* Bottom: Challengers Selection Card */}
              <View style={styles.challengersCard}>
                <View style={styles.challengersHeaderRow}>
                  <View style={styles.challengersTitleRow}>
                    <View style={[styles.teamDot, { backgroundColor: '#EA580C' }]} />
                    <Text style={styles.challengersTitle}>
                      ĐỘI THÁCH ĐẤU ({selectedGuestUsers.length} người)
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.challengersAddBtn}
                    onPress={() => handleOpenUserPicker('GUEST')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="person-add" size={13} color="#FFFFFF" />
                    <Text style={styles.challengersAddBtnText}>CHỌN</Text>
                  </TouchableOpacity>
                </View>

                {selectedGuestUsers.length === 0 ? (
                  <TouchableOpacity
                    style={styles.emptyChallengersBox}
                    onPress={() => handleOpenUserPicker('GUEST')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle-outline" size={24} color="#EA580C" />
                    <Text style={styles.emptyChallengersText}>Chưa có đấu thủ thách đấu</Text>
                    <Text style={styles.emptyChallengersSubText}>Bấm vào đây để tìm và chọn người chơi</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.challengersGrid}>
                    {selectedGuestUsers.map((u) => (
                      <View key={u.id} style={styles.challengerChip}>
                        <View style={styles.challengerAvatarWrap}>
                          <Text style={styles.challengerAvatarLetter}>{u.fullName.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={styles.challengerInfo}>
                          <Text style={styles.challengerName} numberOfLines={1}>
                            {u.fullName}
                          </Text>
                          <Text style={styles.challengerElo}>{u.elo ?? 1500} Elo</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setSelectedGuestUsers(selectedGuestUsers.filter((x) => x.id !== u.id))}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={styles.challengerRemoveBtn}
                        >
                          <Ionicons name="close-circle" size={16} color="#94A3B8" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ) : (
            // Standard 2-team side-by-side for regular open pickup sessions
            <View style={styles.teamsContainer}>
              {/* Team A (Host) */}
              <View style={styles.teamBox}>
                <View style={[styles.teamHeader, { backgroundColor: '#EFF6FF' }]}>
                  <View style={styles.teamTitleRow}>
                    <View style={[styles.teamDot, { backgroundColor: '#2563EB' }]} />
                    <Text style={[styles.teamTitle, { color: '#1D4ED8' }]}>
                      ĐỘI A ({selectedHostUsers.length})
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: '#DBEAFE' }]}
                    onPress={() => handleOpenUserPicker('HOST')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="person-add" size={12} color="#1D4ED8" />
                    <Text style={[styles.addBtnText, { color: '#1D4ED8' }]}>Chọn</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.teamMemberList} nestedScrollEnabled>
                  {selectedHostUsers.length === 0 ? (
                    <Text style={styles.emptyTeamText}>Chưa có người chơi</Text>
                  ) : (
                    selectedHostUsers.map((u, idx) => (
                      <View key={u.id} style={styles.memberItem}>
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName} numberOfLines={1}>
                            {idx === 0 ? '👑 ' : ''}{u.fullName}
                          </Text>
                          <Text style={styles.memberElo}>{u.elo ?? 1500} Elo</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setSelectedHostUsers(selectedHostUsers.filter((x) => x.id !== u.id))}
                          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                        >
                          <Ionicons name="close-circle" size={16} color="#94A3B8" />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>

              {/* VS Divider */}
              <View style={styles.vsBadge}>
                <Text style={styles.vsText}>VS</Text>
              </View>

              {/* Team B (Guest) */}
              <View style={styles.teamBox}>
                <View style={[styles.teamHeader, { backgroundColor: '#FFF7ED' }]}>
                  <View style={styles.teamTitleRow}>
                    <View style={[styles.teamDot, { backgroundColor: '#EA580C' }]} />
                    <Text style={[styles.teamTitle, { color: '#C2410C' }]}>
                      ĐỘI B ({selectedGuestUsers.length})
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: '#FFEDD5' }]}
                    onPress={() => handleOpenUserPicker('GUEST')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="person-add" size={12} color="#C2410C" />
                    <Text style={[styles.addBtnText, { color: '#C2410C' }]}>Chọn</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.teamMemberList} nestedScrollEnabled>
                  {selectedGuestUsers.length === 0 ? (
                    <Text style={styles.emptyTeamText}>Chưa có người chơi</Text>
                  ) : (
                    selectedGuestUsers.map((u) => (
                      <View key={u.id} style={styles.memberItem}>
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName} numberOfLines={1}>
                            {u.fullName}
                          </Text>
                          <Text style={styles.memberElo}>{u.elo ?? 1500} Elo</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setSelectedGuestUsers(selectedGuestUsers.filter((x) => x.id !== u.id))}
                          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                        >
                          <Ionicons name="close-circle" size={16} color="#94A3B8" />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>
            </View>
          )}

          {/* Score Customization Section */}
          <View style={styles.scoreSection}>
            <Text style={styles.sectionLabel}>TUỲ CHỈNH TỶ SỐ TRẬN ĐẤU:</Text>

            {/* Score Preset Chips */}
            <View style={styles.scorePresetsRow}>
              {[
                { h: '3', g: '1', label: '3 - 1 (Thắng vừa)' },
                { h: '5', g: '0', label: '5 - 0 (Áp đảo)' },
                { h: '15', g: '1', label: '15 - 1 (Đậm)' },
                { h: '2', g: '2', label: '2 - 2 (Hòa)' },
                { h: '0', g: '8', label: '0 - 8 (Thua đậm)' },
              ].map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.scorePresetChip,
                    hostScore === preset.h && guestScore === preset.g && styles.scorePresetChipActive,
                  ]}
                  onPress={() => {
                    setHostScore(preset.h);
                    setGuestScore(preset.g);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.scorePresetChipText,
                      hostScore === preset.h && guestScore === preset.g && styles.scorePresetChipTextActive,
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Free Score Input Fields */}
            <View style={styles.customScoreRow}>
              <View style={styles.scoreInputGroup}>
                <Text style={styles.scoreInputLabel}>
                  {isFixedHost ? 'Đội Sân Nhà' : 'Đội A (Xanh)'}
                </Text>
                <TextInput
                  style={styles.scoreInputField}
                  value={hostScore}
                  onChangeText={setHostScore}
                  keyboardType="numeric"
                  maxLength={3}
                  placeholder="0"
                />
              </View>

              <Text style={styles.scoreSeparator}>-</Text>

              <View style={styles.scoreInputGroup}>
                <Text style={styles.scoreInputLabel}>
                  {isFixedHost ? 'Đội Thách Đấu' : 'Đội B (Cam)'}
                </Text>
                <TextInput
                  style={styles.scoreInputField}
                  value={guestScore}
                  onChangeText={setGuestScore}
                  placeholder="0"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>
          </View>

          {/* Settle Action Button */}
          <TouchableOpacity
            style={[styles.finishBtn, loadingAction && styles.finishBtnDisabled]}
            onPress={handleForceFinish}
            disabled={loadingAction}
            activeOpacity={0.85}
          >
            {loadingAction ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="lightning-bolt" size={18} color="#FFFFFF" />
                <Text style={styles.finishBtnText}>KẾT THÚC & TÍNH ELO XÉ VÉ NGAY</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* User Selection Modal */}
      <Modal
        visible={isUserModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsUserModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {isFixedHost
                    ? 'Chọn Đấu Thủ Thách Đấu'
                    : targetTeam === 'HOST'
                    ? 'Chọn Người Chơi Cho Đội A (Xanh)'
                    : 'Chọn Người Chơi Cho Đội B (Cam)'}
                </Text>
                <Text style={styles.modalSub}>Chạm vào người dùng để thêm hoặc gỡ bỏ</Text>
              </View>
              <TouchableOpacity onPress={() => setIsUserModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={16} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm theo tên hoặc email..."
                value={searchUserText}
                onChangeText={setSearchUserText}
                placeholderTextColor="#94A3B8"
              />
              {searchUserText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchUserText('')}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Users List */}
            {loadingUsers ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.modalLoadingText}>Đang tải danh sách người dùng...</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalUserList}>
                {filteredUsers.map((u) => {
                  const isSelectedInA = selectedHostUsers.some((x) => x.id === u.id);
                  const isSelectedInB = selectedGuestUsers.some((x) => x.id === u.id);
                  const isCurrentTarget = targetTeam === 'HOST' ? isSelectedInA : isSelectedInB;

                  return (
                    <TouchableOpacity
                      key={u.id}
                      style={[styles.userListItem, isCurrentTarget && styles.userListItemSelected]}
                      onPress={() => toggleUserSelection(u)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.userItemLeft}>
                        {u.avatarUrl ? (
                          <Image source={{ uri: u.avatarUrl }} style={styles.userAvatar} />
                        ) : (
                          <View style={styles.userAvatarFallback}>
                            <Text style={styles.userAvatarText}>{u.fullName.charAt(0)}</Text>
                          </View>
                        )}
                        <View style={styles.userTextGroup}>
                          <Text style={styles.userFullName}>{u.fullName}</Text>
                          <Text style={styles.userEmailText}>{u.email}</Text>
                        </View>
                      </View>

                      <View style={styles.userItemRight}>
                        <View style={styles.userEloBadge}>
                          <Text style={styles.userEloBadgeText}>{u.elo ?? 1500} Elo</Text>
                        </View>
                        <Ionicons
                          name={
                            isCurrentTarget
                              ? 'checkmark-circle'
                              : isSelectedInA || isSelectedInB
                              ? 'swap-horizontal'
                              : 'ellipse-outline'
                          }
                          size={22}
                          color={isCurrentTarget ? '#8B5CF6' : isSelectedInA || isSelectedInB ? '#F59E0B' : '#CBD5E1'}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Modal Done Button */}
            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setIsUserModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalDoneBtnText}>Xong</Text>
            </TouchableOpacity>
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
    borderRadius: 20,
    backgroundColor: '#FAF5FF',
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
    overflow: 'hidden',
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3E8FF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5B21B6',
    flex: 1,
  },
  panelContent: {
    padding: 14,
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  infoText: {
    fontSize: 11.5,
    color: '#6B21A8',
    lineHeight: 16,
  },
  quickPresetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5B21B6',
    letterSpacing: 0.3,
  },
  presetChip: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6D28D9',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  teamTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  teamTitle: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  teamMemberList: {
    maxHeight: 120,
    padding: 6,
  },
  emptyTeamText: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
  },
  memberElo: {
    fontSize: 9.5,
    color: '#64748B',
  },
  vsBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vsText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreSection: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    gap: 8,
  },
  scorePresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  scorePresetChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scorePresetChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  scorePresetChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  scorePresetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  customScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  scoreInputGroup: {
    alignItems: 'center',
    gap: 4,
  },
  scoreInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  scoreInputField: {
    width: 60,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  scoreSeparator: {
    fontSize: 20,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 14,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  finishBtnDisabled: {
    opacity: 0.6,
  },
  finishBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
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
  modalUserList: {
    maxHeight: 320,
  },
  userListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderRadius: 10,
  },
  userListItemSelected: {
    backgroundColor: '#F5F3FF',
  },
  userItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7C3AED',
  },
  userTextGroup: {
    flex: 1,
  },
  userFullName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmailText: {
    fontSize: 11,
    color: '#64748B',
  },
  userItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userEloBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  userEloBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
  },
  modalDoneBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  modalDoneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Fixed Host & Challengers Modern Layout */
  fixedHostTeamsWrapper: {
    gap: 10,
  },
  fixedHostCard: {
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  fixedHostHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fixedHostLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fixedHostTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#312E81',
    letterSpacing: 0.3,
  },
  fixedTag: {
    backgroundColor: '#4338CA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fixedTagText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  fixedHostBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fixedHostInfoCol: {
    flex: 1,
    gap: 2,
  },
  fixedHostTeamName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E1B4B',
  },
  fixedHostTeamLevel: {
    fontSize: 11,
    color: '#4B5563',
  },
  fixedHostVsPill: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  fixedHostVsText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  /* Challengers Card Styles */
  challengersCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  challengersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  challengersTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  challengersTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#9A3412',
    letterSpacing: 0.3,
  },
  challengersAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  challengersAddBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  emptyChallengersBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#FDBA74',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
  },
  emptyChallengersText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C2410C',
  },
  emptyChallengersSubText: {
    fontSize: 10.5,
    color: '#9A3412',
  },
  challengersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  challengerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: '47%',
    flex: 1,
  },
  challengerAvatarWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengerAvatarLetter: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  challengerInfo: {
    flex: 1,
  },
  challengerName: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#7C2D12',
  },
  challengerElo: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2410C',
  },
  challengerRemoveBtn: {
    padding: 2,
  },
});
