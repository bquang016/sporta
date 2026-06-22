import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Share, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Avatar, Button, Badge } from '../../../shared/ui';
import { useClubs } from '../../../entities/club';

// Mock Members for Joined Clubs to look premium
const MOCK_MEMBERS = [
  { id: 'm-1', name: 'Nguyễn Văn Hùng', role: 'Trưởng nhóm', elo: 1540, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80' },
  { id: 'm-2', name: 'Trần Thị Mai', role: 'Phó nhóm', elo: 1420, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { id: 'm-3', name: 'Phạm Minh Hoàng', role: 'Thành viên', elo: 1250, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80' },
  { id: 'm-4', name: 'Lê Hoàng Sơn', role: 'Thành viên', elo: 1180, avatar: 'https://images.unsplash.com/photo-1527983359383-4758693f760c?w=100&auto=format&fit=crop&q=80' },
];

const MOCK_MATCH_HISTORY = [
  {
    id: 'h-1',
    opponentName: 'FC Cầu Giấy United',
    opponentAvatar: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=100&auto=format&fit=crop&q=80',
    date: '20/06/2026',
    ourScore: 4,
    opponentScore: 2,
    result: 'win' as const,
    location: 'Sân bóng Đại học Y',
  },
  {
    id: 'h-2',
    opponentName: 'Hà Đông Football Club',
    opponentAvatar: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&auto=format&fit=crop&q=80',
    date: '14/06/2026',
    ourScore: 1,
    opponentScore: 3,
    result: 'lose' as const,
    location: 'Sân bóng Bách Khoa',
  },
  {
    id: 'h-3',
    opponentName: 'Bách Khoa Football Club',
    opponentAvatar: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=100&auto=format&fit=crop&q=80',
    date: '07/06/2026',
    ourScore: 2,
    opponentScore: 2,
    result: 'draw' as const,
    location: 'Sân bóng Chu Văn An',
  },
];

export function ClubDetailJoinedScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clubs, leaveClub } = useClubs();

  // Custom Leave Confirmation Modal State
  const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);
  
  // Custom Members Modal State
  const [isMembersModalVisible, setIsMembersModalVisible] = useState(false);

  // Custom Invite Modal State
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Poll & Matchmaking States
  const [activePoll, setActivePoll] = useState<{
    id: string;
    title: string;
    closeTime: string;
    isClosed: boolean;
    votes: {
      join: string[];
      absent: string[];
    };
  } | null>(null);

  const [userVote, setUserVote] = useState<'join' | 'absent' | null>(null);
  const [isCreatePollModalVisible, setIsCreatePollModalVisible] = useState(false);
  const [pollTitleInput, setPollTitleInput] = useState('Ghép trận cuối tuần');
  const [pollTimeHour, setPollTimeHour] = useState(15);
  const [pollTimeMinute, setPollTimeMinute] = useState(0);

  const [isMatchmakeModalVisible, setIsMatchmakeModalVisible] = useState(false);
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [matchmadeTeams, setMatchmadeTeams] = useState<{ teamA: string[]; teamB: string[] } | null>(null);

  const club = clubs.find(c => c.id === id);

  if (!club) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết câu lạc bộ</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Không tìm thấy câu lạc bộ này</Text>
          <Button title="Quay lại" onPress={() => router.back()} style={styles.errorBtn} />
        </View>
      </SafeAreaView>
    );
  }

  const handleNativeShare = async () => {
    try {
      const shareUrl = `https://sporta.vn/clubs/join/${club.id}`;
      await Share.share({
        message: `Tham gia câu lạc bộ "${club.name}" cùng mình trên Sporta nhé! Đường dẫn tham gia: ${shareUrl}`,
        url: shareUrl,
        title: `Mời gia nhập CLB ${club.name}`
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  // Adjust time helper
  const adjustHour = (amount: number) => {
    setPollTimeHour(prev => {
      let next = prev + amount;
      if (next < 0) next = 23;
      if (next > 23) next = 0;
      return next;
    });
  };

  const adjustMinute = (amount: number) => {
    setPollTimeMinute(prev => {
      let next = prev + amount;
      if (next < 0) next = 45;
      if (next > 59) next = 0;
      return next;
    });
  };

  const handleCreatePoll = () => {
    const formattedTime = `${pollTimeHour.toString().padStart(2, '0')}:${pollTimeMinute.toString().padStart(2, '0')}`;
    setActivePoll({
      id: 'poll-' + Date.now(),
      title: pollTitleInput.trim() || 'Ghép trận cuối tuần',
      closeTime: formattedTime,
      isClosed: false,
      votes: {
        join: ['Trần Thị Mai', 'Phạm Minh Hoàng'],
        absent: ['Lê Hoàng Sơn'],
      },
    });
    setUserVote(null);
    setMatchmadeTeams(null);
    setIsCreatePollModalVisible(false);
  };

  const handleVote = (option: 'join' | 'absent') => {
    if (!activePoll || activePoll.isClosed) return;

    setActivePoll(prev => {
      if (!prev) return null;

      let newJoin = [...prev.votes.join];
      let newAbsent = [...prev.votes.absent];

      newJoin = newJoin.filter(name => name !== 'Bạn (Tôi)');
      newAbsent = newAbsent.filter(name => name !== 'Bạn (Tôi)');

      if (userVote === option) {
        setUserVote(null);
      } else {
        if (option === 'join') {
          newJoin.push('Bạn (Tôi)');
          setUserVote('join');
        } else {
          newAbsent.push('Bạn (Tôi)');
          setUserVote('absent');
        }
      }

      return {
        ...prev,
        votes: {
          join: newJoin,
          absent: newAbsent,
        },
      };
    });
  };

  const handleClosePoll = () => {
    if (!activePoll) return;
    setActivePoll(prev => {
      if (!prev) return null;
      return {
        ...prev,
        isClosed: true,
      };
    });
  };

  const handleDeletePoll = () => {
    setActivePoll(null);
    setUserVote(null);
    setMatchmadeTeams(null);
  };

  const handleStartMatchmaking = () => {
    if (!activePoll) return;
    const participants = activePoll.votes.join;
    if (participants.length === 0) return;

    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    const mid = Math.ceil(shuffled.length / 2);
    setTeamA(shuffled.slice(0, mid));
    setTeamB(shuffled.slice(mid));
    setIsMatchmakeModalVisible(true);
  };

  const handleReshuffle = () => {
    if (!activePoll) return;
    const participants = activePoll.votes.join;
    if (participants.length === 0) return;

    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    const mid = Math.ceil(shuffled.length / 2);
    setTeamA(shuffled.slice(0, mid));
    setTeamB(shuffled.slice(mid));
  };

  const handleConfirmTeams = () => {
    setMatchmadeTeams({ teamA, teamB });
    setIsMatchmakeModalVisible(false);
  };

  const handleLeavePress = () => {
    setIsLeaveModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Custom Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          activeOpacity={0.7} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          Câu lạc bộ đã tham gia
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cover Photo */}
        <View style={styles.coverContainer}>
          {club.coverImage ? (
            <Image source={{ uri: club.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, { backgroundColor: COLORS.primary }]} />
          )}
        </View>

        {/* Avatar overlapping cover */}
        <View style={styles.avatarContainer}>
          <Avatar 
            size={80} 
            source={club.avatarImage} 
            fallbackIcon={club.sportIcon as any}
            style={styles.avatar}
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.clubName}>{club.name}</Text>
          
          {/* Badges row */}
          <View style={styles.badgesRow}>
            <Badge text={club.sport} variant="success" />
            <Badge 
              text={club.isPrivate ? 'Riêng tư' : 'Công khai'} 
              variant={club.isPrivate ? 'warning' : 'info'} 
            />
          </View>

          {/* Location & Members Details */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <MaterialIcons name="location-on" size={20} color={COLORS.primary} style={styles.metaIcon} />
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Khu vực hoạt động</Text>
                <Text style={styles.metaValue}>{club.area || 'Chưa cập nhật khu vực'}</Text>
              </View>
            </View>
            
            <View style={styles.metaRow}>
              <MaterialIcons name="people" size={20} color={COLORS.primary} style={styles.metaIcon} />
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Thành viên hiện tại</Text>
                <Text style={styles.metaValue}>
                  {club.members} / {club.maxMembers} thành viên (Tối đa {club.maxMembers})
                </Text>
              </View>
            </View>
          </View>

          {/* Bio / Description */}
          <Text style={styles.sectionTitle}>Giới thiệu câu lạc bộ</Text>
          <Text style={styles.description}>
            {club.description || 'Không có mô tả chi tiết cho câu lạc bộ này.'}
          </Text>

          {/* Action buttons row below description */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.rowActionBtn} 
              activeOpacity={0.7} 
              onPress={() => setIsInviteModalVisible(true)}
            >
              <MaterialIcons name="share" size={18} color={COLORS.primary} />
              <Text style={styles.actionBtnText}>Mời bạn bè</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.rowActionBtn} 
              activeOpacity={0.7} 
              onPress={() => setIsMembersModalVisible(true)}
            >
              <MaterialIcons name="people" size={18} color={COLORS.primary} />
              <Text style={styles.actionBtnText}>Thành viên ({club.members})</Text>
            </TouchableOpacity>
          </View>

          {/* Poll / Matchmaking Section */}
          <View style={styles.pollSection}>
            <View style={styles.pollSectionHeader}>
              <Text style={styles.pollSectionTitle}>Biểu quyết ghép trận</Text>
              {activePoll && (
                <TouchableOpacity onPress={handleDeletePoll} style={styles.deletePollBtn}>
                  <MaterialIcons name="delete-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              )}
            </View>

            {!activePoll ? (
              <View style={styles.emptyPollCard}>
                <MaterialIcons name="poll" size={40} color="rgba(6, 78, 59, 0.4)" style={styles.emptyPollIcon} />
                <Text style={styles.emptyPollTitle}>Chưa có biểu quyết nào</Text>
                <Text style={styles.emptyPollSubtitle}>
                  Tạo biểu quyết để thống kê số lượng thành viên tham gia ghép trận.
                </Text>
                <TouchableOpacity
                  style={styles.createPollBtn}
                  activeOpacity={0.8}
                  onPress={() => setIsCreatePollModalVisible(true)}
                >
                  <MaterialIcons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.createPollBtnText}>Tạo biểu quyết mới</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.pollCard, activePoll.isClosed && styles.pollCardClosed]}>
                <View style={styles.pollCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pollTitle}>{activePoll.title}</Text>
                    <View style={styles.pollMetaRow}>
                      <MaterialIcons name="access-time" size={14} color={COLORS.onSurfaceVariant} />
                      <Text style={styles.pollMetaText}>
                        {activePoll.isClosed 
                          ? `Đã đóng lúc ${activePoll.closeTime}` 
                          : `Đóng lúc ${activePoll.closeTime}`}
                      </Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    activePoll.isClosed ? styles.statusBadgeClosed : styles.statusBadgeActive
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      activePoll.isClosed ? styles.statusBadgeTextClosed : styles.statusBadgeTextActive
                    ]}>
                      {activePoll.isClosed ? 'Đã đóng' : 'Đang mở'}
                    </Text>
                  </View>
                </View>

                {/* Option 1: Tham gia */}
                <TouchableOpacity
                  style={[
                    styles.pollOptionCard,
                    userVote === 'join' && styles.pollOptionSelected,
                    activePoll.isClosed && styles.pollOptionDisabled
                  ]}
                  activeOpacity={activePoll.isClosed ? 1 : 0.7}
                  onPress={() => handleVote('join')}
                >
                  <View style={styles.optionHeader}>
                    <View style={styles.optionLeft}>
                      <MaterialIcons 
                        name={userVote === 'join' ? "check-circle" : "radio-button-unchecked"} 
                        size={20} 
                        color={userVote === 'join' ? COLORS.primary : COLORS.onSurfaceVariant} 
                      />
                      <Text style={styles.optionText}>Tham gia</Text>
                    </View>
                    <Text style={styles.optionCount}>{activePoll.votes.join.length} phiếu</Text>
                  </View>
                  
                  {/* Progress Bar */}
                  <View style={styles.progressBarBg}>
                    <View style={[
                      styles.progressBarFill, 
                      { 
                        width: `${
                          (activePoll.votes.join.length + activePoll.votes.absent.length) > 0 
                            ? (activePoll.votes.join.length / (activePoll.votes.join.length + activePoll.votes.absent.length)) * 100 
                            : 0
                        }%` 
                      }
                    ]} />
                  </View>

                  {/* Voter list */}
                  {activePoll.votes.join.length > 0 && (
                    <View style={styles.votersContainer}>
                      <Text style={styles.voterLabel}>Danh sách:</Text>
                      <View style={styles.voterChipsRow}>
                        {activePoll.votes.join.map((voter, index) => (
                          <View key={index} style={styles.voterChip}>
                            <Text style={styles.voterChipText}>{voter}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Option 2: Vắng mặt */}
                <TouchableOpacity
                  style={[
                    styles.pollOptionCard,
                    userVote === 'absent' && styles.pollOptionSelected,
                    activePoll.isClosed && styles.pollOptionDisabled
                  ]}
                  activeOpacity={activePoll.isClosed ? 1 : 0.7}
                  onPress={() => handleVote('absent')}
                >
                  <View style={styles.optionHeader}>
                    <View style={styles.optionLeft}>
                      <MaterialIcons 
                        name={userVote === 'absent' ? "check-circle" : "radio-button-unchecked"} 
                        size={20} 
                        color={userVote === 'absent' ? COLORS.primary : COLORS.onSurfaceVariant} 
                      />
                      <Text style={styles.optionText}>Vắng mặt</Text>
                    </View>
                    <Text style={styles.optionCount}>{activePoll.votes.absent.length} phiếu</Text>
                  </View>
                  
                  {/* Progress Bar */}
                  <View style={styles.progressBarBg}>
                    <View style={[
                      styles.progressBarFill, 
                      { 
                        backgroundColor: COLORS.onSurfaceVariant,
                        width: `${
                          (activePoll.votes.join.length + activePoll.votes.absent.length) > 0 
                            ? (activePoll.votes.absent.length / (activePoll.votes.join.length + activePoll.votes.absent.length)) * 100 
                            : 0
                        }%` 
                      }
                    ]} />
                  </View>

                  {/* Voter list */}
                  {activePoll.votes.absent.length > 0 && (
                    <View style={styles.votersContainer}>
                      <Text style={styles.voterLabel}>Danh sách:</Text>
                      <View style={styles.voterChipsRow}>
                        {activePoll.votes.absent.map((voter, index) => (
                          <View key={index} style={[styles.voterChip, styles.voterChipAbsent]}>
                            <Text style={styles.voterChipText}>{voter}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Matchmaking results if they are confirmed */}
                {activePoll.isClosed && matchmadeTeams && (
                  <View style={styles.confirmedTeamsContainer}>
                    <View style={styles.confirmedTeamsHeader}>
                      <MaterialIcons name="sports-kabaddi" size={20} color={COLORS.primary} />
                      <Text style={styles.confirmedTeamsTitle}>Đội hình đã chia</Text>
                    </View>
                    <View style={styles.teamsSplitGrid}>
                      <View style={styles.teamResultCol}>
                        <Text style={[styles.teamResultTitle, { color: COLORS.primary }]}>Đội A ({matchmadeTeams.teamA.length})</Text>
                        {matchmadeTeams.teamA.map((p, idx) => (
                          <Text key={idx} style={styles.teamResultMember}>• {p}</Text>
                        ))}
                      </View>
                      <View style={styles.teamResultCol}>
                        <Text style={[styles.teamResultTitle, { color: '#B45309' }]}>Đội B ({matchmadeTeams.teamB.length})</Text>
                        {matchmadeTeams.teamB.map((p, idx) => (
                          <Text key={idx} style={styles.teamResultMember}>• {p}</Text>
                        ))}
                      </View>
                    </View>
                  </View>
                )}

                {/* Leader Actions */}
                <View style={styles.pollCardActions}>
                  {!activePoll.isClosed ? (
                    <TouchableOpacity
                      style={styles.closePollActionBtn}
                      activeOpacity={0.8}
                      onPress={handleClosePoll}
                    >
                      <MaterialIcons name="lock-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.closePollActionText}>Đóng biểu quyết</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.matchmakeActionBtn}
                      activeOpacity={0.8}
                      onPress={handleStartMatchmaking}
                    >
                      <MaterialIcons name="shuffle" size={16} color="#FFFFFF" />
                      <Text style={styles.matchmakeActionText}>
                        {matchmadeTeams ? 'Chia lại đội hình' : 'Ghép trận & Chia đội'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Match History Section */}
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>Lịch sử đối đầu CLB khác</Text>
            
            <View style={styles.historyList}>
              {MOCK_MATCH_HISTORY.map((match) => {
                const getResultBadgeStyle = (result: 'win' | 'lose' | 'draw') => {
                  switch (result) {
                    case 'win':
                      return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981', label: 'THẮNG' };
                    case 'lose':
                      return { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', label: 'THUA' };
                    case 'draw':
                      return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6B7280', label: 'HÒA' };
                  }
                };

                const badge = getResultBadgeStyle(match.result);

                return (
                  <View key={match.id} style={styles.matchCard}>
                    {/* Match Meta (Date & Location) */}
                    <View style={styles.matchMetaHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialIcons name="event" size={14} color={COLORS.onSurfaceVariant} />
                        <Text style={styles.matchMetaText}>{match.date}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialIcons name="place" size={14} color={COLORS.onSurfaceVariant} />
                        <Text style={styles.matchMetaText} numberOfLines={1} ellipsizeMode="tail">
                          {match.location}
                        </Text>
                      </View>
                    </View>

                    {/* Scoreboard row */}
                    <View style={styles.scoreboardRow}>
                      {/* Left: Our Club */}
                      <View style={styles.teamCol}>
                        <Avatar 
                          size={36} 
                          source={club.avatarImage} 
                          fallbackIcon={club.sportIcon as any} 
                          style={styles.teamAvatar}
                        />
                        <Text style={styles.teamName} numberOfLines={1} ellipsizeMode="tail">
                          {club.name}
                        </Text>
                      </View>

                      {/* Center: Score & Result */}
                      <View style={styles.scoreContainer}>
                        <View style={[styles.resultBadge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.resultBadgeText, { color: badge.text }]}>
                            {badge.label}
                          </Text>
                        </View>
                        <Text style={styles.scoreText}>
                          {match.ourScore} - {match.opponentScore}
                        </Text>
                      </View>

                      {/* Right: Opponent */}
                      <View style={[styles.teamCol, { alignItems: 'flex-end' }]}>
                        <Image source={{ uri: match.opponentAvatar }} style={styles.opponentAvatarImage} />
                        <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1} ellipsizeMode="tail">
                          {match.opponentName}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>



      {/* Custom Leave Confirmation Modal */}
      <Modal
        visible={isLeaveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLeaveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertModalContent}>
            <MaterialIcons 
              name="warning-amber" 
              size={48} 
              color={COLORS.error} 
              style={styles.modalAlertIcon}
            />
            <Text style={styles.alertModalTitle}>Rời câu lạc bộ</Text>
            <Text style={styles.alertModalMessage}>
              Bạn có chắc chắn muốn rời khỏi câu lạc bộ "{club.name}" không?
            </Text>
            <View style={styles.alertModalActions}>
              <TouchableOpacity
                style={[styles.alertModalBtn, styles.alertCancelBtn]}
                activeOpacity={0.7}
                onPress={() => setIsLeaveModalVisible(false)}
              >
                <Text style={styles.alertCancelText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertModalBtn, styles.alertConfirmBtn]}
                activeOpacity={0.7}
                onPress={() => {
                  setIsLeaveModalVisible(false);
                  setIsMembersModalVisible(false);
                  leaveClub(club.id);
                  router.back();
                }}
              >
                <Text style={styles.alertConfirmText}>Đồng ý rời</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Group Members Full Screen Modal */}
      <Modal
        visible={isMembersModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setIsMembersModalVisible(false)}
      >
        <SafeAreaView style={styles.fullScreenModalContainer} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.fullScreenModalHeader}>
            <TouchableOpacity 
              style={styles.closeModalButton} 
              activeOpacity={0.7} 
              onPress={() => setIsMembersModalVisible(false)}
            >
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.fullScreenModalTitle}>Thành viên nhóm ({club.members})</Text>
            <View style={styles.headerPlaceholder} />
          </View>
          
          <ScrollView contentContainerStyle={styles.fullScreenModalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalMembersContainer}>
              {MOCK_MEMBERS.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <View style={styles.memberMetaRow}>
                      <Text style={styles.memberRole}>{member.role}</Text>
                      <Text style={styles.memberDivider}>•</Text>
                      <View style={styles.memberEloContainer}>
                        <MaterialIcons name="star" size={10} color="#D97706" style={{ marginRight: 2 }} />
                        <Text style={styles.memberElo}>{member.elo} Elo</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.chatButton} activeOpacity={0.7}>
                    <MaterialIcons name="chat-bubble-outline" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Button
              variant="outline"
              title="Rời khỏi câu lạc bộ"
              icon="exit-to-app"
              style={styles.actionBtn}
              onPress={handleLeavePress}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Invite Friend Modal */}
      <Modal
        visible={isInviteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertModalContent}>
            <MaterialIcons name="share" size={48} color={COLORS.primary} style={styles.modalAlertIcon} />
            <Text style={styles.alertModalTitle}>Mời bạn bè tham gia</Text>
            <Text style={styles.alertModalMessage}>
              Gửi liên kết dưới đây để mời bạn bè tham gia câu lạc bộ "{club.name}" của bạn.
            </Text>
            
            {/* Link Container */}
            <View style={styles.linkContainer}>
              <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
                {`https://sporta.vn/clubs/join/${club.id}`}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.inviteModalActions}>
              <TouchableOpacity 
                style={[styles.inviteModalBtn, styles.copyBtn]} 
                onPress={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                <MaterialIcons name={copied ? "check" : "content-copy"} size={16} color="#FFFFFF" />
                <Text style={styles.copyBtnText}>
                  {copied ? "Đã sao chép" : "Sao chép"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.inviteModalBtn, styles.shareBtn]} 
                onPress={handleNativeShare}
              >
                <MaterialIcons name="send" size={16} color={COLORS.primary} />
                <Text style={styles.shareBtnText}>Chia sẻ</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.closeInviteBtn} 
              onPress={() => setIsInviteModalVisible(false)}
            >
              <Text style={styles.closeInviteText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Poll Modal */}
      <Modal
        visible={isCreatePollModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreatePollModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pollModalContent}>
            <View style={styles.pollModalHeader}>
              <Text style={styles.pollModalTitle}>Tạo biểu quyết mới</Text>
              <TouchableOpacity onPress={() => setIsCreatePollModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.onSurface} />
              </TouchableOpacity>
            </View>

            {/* Poll Title Input */}
            <Text style={styles.modalFieldLabel}>Tiêu đề biểu quyết</Text>
            <TextInput
              style={styles.pollTextInput}
              value={pollTitleInput}
              onChangeText={setPollTitleInput}
              placeholder="Ví dụ: Ghép trận cuối tuần"
              placeholderTextColor={COLORS.onSurfaceVariant}
            />

            {/* Close Time Input */}
            <Text style={styles.modalFieldLabel}>Cài đặt thời gian đóng</Text>
            <View style={styles.timePickerContainer}>
              <View style={styles.timeSelectorRow}>
                <TouchableOpacity 
                  style={styles.timeAdjustBtn} 
                  onPress={() => adjustHour(-1)}
                >
                  <MaterialIcons name="remove" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <View style={styles.timeDisplayBox}>
                  <Text style={styles.timeDisplayText}>
                    {pollTimeHour.toString().padStart(2, '0')}
                  </Text>
                </View>
                <Text style={styles.timeSeparator}>:</Text>
                <View style={styles.timeDisplayBox}>
                  <Text style={styles.timeDisplayText}>
                    {pollTimeMinute.toString().padStart(2, '0')}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.timeAdjustBtn} 
                  onPress={() => adjustHour(1)}
                >
                  <MaterialIcons name="add" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              
              {/* Preset Chips */}
              <View style={styles.presetTimeChipsRow}>
                {[
                  { h: 12, m: 0, label: '12:00' },
                  { h: 15, m: 0, label: '15:00' },
                  { h: 18, m: 0, label: '18:00' },
                  { h: 20, m: 0, label: '20:00' },
                ].map((preset, index) => {
                  const isSelected = pollTimeHour === preset.h && pollTimeMinute === preset.m;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.presetTimeChip, isSelected && styles.presetTimeChipSelected]}
                      onPress={() => {
                        setPollTimeHour(preset.h);
                        setPollTimeMinute(preset.m);
                      }}
                    >
                      <Text style={[styles.presetTimeChipText, isSelected && styles.presetTimeChipTextSelected]}>
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Default Options (Locked Visual display) */}
            <Text style={styles.modalFieldLabel}>Tùy chọn mặc định (Không thể xóa)</Text>
            <View style={styles.lockedOptionsRow}>
              <View style={styles.lockedOptionBadge}>
                <MaterialIcons name="check" size={14} color={COLORS.primary} />
                <Text style={styles.lockedOptionText}>Tham gia</Text>
              </View>
              <View style={styles.lockedOptionBadge}>
                <MaterialIcons name="check" size={14} color={COLORS.primary} />
                <Text style={styles.lockedOptionText}>Vắng mặt</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.pollModalActions}>
              <TouchableOpacity
                style={[styles.pollModalBtn, styles.pollModalCancelBtn]}
                onPress={() => setIsCreatePollModalVisible(false)}
              >
                <Text style={styles.pollModalCancelText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pollModalBtn, styles.pollModalConfirmBtn]}
                onPress={handleCreatePoll}
              >
                <Text style={styles.pollModalConfirmText}>Tạo biểu quyết</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Matchmaking Team Split Modal */}
      <Modal
        visible={isMatchmakeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMatchmakeModalVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.matchmakeSheetContent}>
            <View style={styles.sheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="sports-kabaddi" size={24} color={COLORS.primary} />
                <Text style={styles.sheetTitle}>Tự động chia đội ghép trận</Text>
              </View>
              <TouchableOpacity onPress={() => setIsMatchmakeModalVisible(false)}>
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
                  <View style={[styles.teamHeaderBadge, { backgroundColor: 'rgba(6, 78, 59, 0.1)' }]}>
                    <Text style={[styles.teamHeaderText, { color: COLORS.primary }]}>ĐỘI A ({teamA.length})</Text>
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
                  <View style={[styles.teamHeaderBadge, { backgroundColor: 'rgba(180, 83, 9, 0.1)' }]}>
                    <Text style={[styles.teamHeaderText, { color: '#B45309' }]}>ĐỘI B ({teamB.length})</Text>
                  </View>
                  <View style={styles.teamMemberList}>
                    {teamB.length === 0 ? (
                      <Text style={styles.emptyTeamText}>Chưa có thành viên</Text>
                    ) : (
                      teamB.map((member, index) => (
                        <View key={index} style={styles.teamMemberItem}>
                          <MaterialIcons name="person" size={16} color="#B45309" />
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
                  onPress={handleReshuffle}
                >
                  <MaterialIcons name="refresh" size={18} color={COLORS.primary} />
                  <Text style={styles.reshuffleBtnText}>Chia lại đội</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.matchmakeBtn, styles.confirmTeamsBtn]}
                  onPress={handleConfirmTeams}
                >
                  <MaterialIcons name="check" size={18} color="#FFFFFF" />
                  <Text style={styles.confirmTeamsBtnText}>Xác nhận đội hình</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 78, 59, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    position: 'absolute',
    left: 60,
    right: 60,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
  },
  headerPlaceholder: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  coverContainer: {
    height: 180,
    width: '100%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarContainer: {
    alignItems: 'flex-start',
    paddingLeft: SPACING.marginMobile,
    marginTop: -40,
    zIndex: 10,
  },
  avatar: {
    borderWidth: 3,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.surfaceContainer,
  },
  infoSection: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  clubName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.base,
    marginBottom: SPACING.md,
  },
  metaContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.08)',
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  metaIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    lineHeight: 36,
  },
  metaContent: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    marginBottom: SPACING.base,
    marginTop: 0,
  },
  description: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    marginBottom: SPACING.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginTop: 0,
  },
  rowActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.15)',
    backgroundColor: COLORS.surface,
    gap: 8,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
  },
  linkContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    width: '100%',
    marginBottom: SPACING.md,
  },
  linkText: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    textAlign: 'center',
  },
  inviteModalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  inviteModalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: BORDER_RADIUS.default,
    gap: 6,
  },
  copyBtn: {
    backgroundColor: COLORS.primary,
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  shareBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  shareBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  closeInviteBtn: {
    paddingVertical: SPACING.xs,
    width: '100%',
    alignItems: 'center',
  },
  closeInviteText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '500',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
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
    borderBottomColor: 'rgba(6, 78, 59, 0.1)',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
  },
  sheetScroll: {
    paddingVertical: SPACING.base,
  },
  modalMembersContainer: {
    borderRadius: BORDER_RADIUS.default,
    overflow: 'hidden',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.sm,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
  },
  memberRole: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    marginTop: 2,
  },
  chatButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(6, 78, 59, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: SPACING.marginMobile,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(6, 78, 59, 0.08)',
  },
  actionBtn: {
    width: '100%',
    height: 48,
    borderRadius: BORDER_RADIUS.default,
    borderColor: COLORS.error,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.base,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
  },
  errorBtn: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  alertModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalAlertIcon: {
    marginBottom: SPACING.md,
  },
  alertModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  alertModalMessage: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  alertModalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
  },
  alertModalBtn: {
    flex: 1,
    height: 44,
    borderRadius: BORDER_RADIUS.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCancelBtn: {
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  alertCancelText: {
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
    fontSize: 14,
  },
  alertConfirmBtn: {
    backgroundColor: COLORS.error,
  },
  alertConfirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  pollSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(6, 78, 59, 0.08)',
  },
  pollSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pollSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
  },
  deletePollBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPollCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(6, 78, 59, 0.3)',
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(6, 78, 59, 0.02)',
  },
  emptyPollIcon: {
    marginBottom: SPACING.sm,
  },
  emptyPollTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    marginBottom: 4,
  },
  emptyPollSubtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  createPollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.lg,
    gap: 6,
  },
  createPollBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pollCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.1)',
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
    gap: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pollCardClosed: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  pollCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 78, 59, 0.06)',
    paddingBottom: SPACING.sm,
  },
  pollTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    marginBottom: 4,
  },
  pollMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pollMetaText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(6, 78, 59, 0.1)',
  },
  statusBadgeClosed: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextActive: {
    color: COLORS.primary,
  },
  statusBadgeTextClosed: {
    color: COLORS.onSurfaceVariant,
  },
  pollOptionCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
  },
  pollOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(6, 78, 59, 0.02)',
  },
  pollOptionDisabled: {
    opacity: 0.85,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
  },
  optionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  votersContainer: {
    marginTop: 4,
  },
  voterLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginBottom: 4,
    fontWeight: '500',
  },
  voterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  voterChip: {
    backgroundColor: 'rgba(6, 78, 59, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  voterChipAbsent: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  voterChipText: {
    fontSize: 11,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  confirmedTeamsContainer: {
    marginTop: SPACING.base,
    backgroundColor: 'rgba(6, 78, 59, 0.03)',
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.08)',
  },
  confirmedTeamsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 78, 59, 0.08)',
    paddingBottom: 6,
    marginBottom: 8,
  },
  confirmedTeamsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  teamsSplitGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  teamResultCol: {
    flex: 1,
  },
  teamResultTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  teamResultMember: {
    fontSize: 12,
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  pollCardActions: {
    marginTop: 4,
  },
  closePollActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.default,
    gap: 6,
  },
  closePollActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  matchmakeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    gap: 6,
  },
  matchmakeActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  pollModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  pollModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 78, 59, 0.1)',
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.md,
  },
  pollModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
  },
  modalFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  pollTextInput: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    height: 44,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  timePickerContainer: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
  },
  timeSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  timeAdjustBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeDisplayBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.sm,
    width: 48,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeDisplayText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.onSurfaceVariant,
  },
  presetTimeChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  presetTimeChip: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetTimeChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  presetTimeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  presetTimeChipTextSelected: {
    color: '#FFFFFF',
  },
  lockedOptionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  lockedOptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6, 78, 59, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  lockedOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  pollModalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(6, 78, 59, 0.08)',
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
  },
  pollModalBtn: {
    flex: 1,
    height: 44,
    borderRadius: BORDER_RADIUS.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pollModalCancelBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  pollModalCancelText: {
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
    fontSize: 14,
  },
  pollModalConfirmBtn: {
    backgroundColor: COLORS.primary,
  },
  pollModalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  matchmakeSheetContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    maxHeight: '85%',
  },
  matchmakeScroll: {
    paddingVertical: SPACING.base,
  },
  matchmakeSubtitle: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: SPACING.md,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
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
  teamHeaderBadge: {
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  teamHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  teamMemberList: {
    padding: SPACING.sm,
    gap: 8,
    minHeight: 120,
  },
  emptyTeamText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  teamMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  teamMemberName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  matchmakeActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(6, 78, 59, 0.08)',
    paddingTop: SPACING.md,
  },
  matchmakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: BORDER_RADIUS.default,
    gap: 8,
  },
  reshuffleBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  reshuffleBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  confirmTeamsBtn: {
    backgroundColor: COLORS.primary,
  },
  confirmTeamsBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  historySection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(6, 78, 59, 0.08)',
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    marginBottom: SPACING.md,
  },
  historyList: {
    gap: SPACING.md,
  },
  matchCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.08)',
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  matchMetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 78, 59, 0.05)',
    paddingBottom: 6,
    marginBottom: 8,
  },
  matchMetaText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
  },
  scoreboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamCol: {
    flex: 1.2,
    alignItems: 'center',
    gap: 6,
  },
  teamAvatar: {
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.1)',
  },
  opponentAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  teamName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    width: '100%',
    textAlign: 'center',
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  resultBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    letterSpacing: 1,
  },
  memberMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  memberDivider: {
    fontSize: 11,
    color: COLORS.outlineVariant,
  },
  memberEloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  memberElo: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
  },
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fullScreenModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    height: 56,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 78, 59, 0.1)',
  },
  closeModalButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  fullScreenModalTitle: {
    position: 'absolute',
    left: 60,
    right: 60,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
  },
  fullScreenModalScroll: {
    padding: SPACING.marginMobile,
  },
});

export default ClubDetailJoinedScreen;
