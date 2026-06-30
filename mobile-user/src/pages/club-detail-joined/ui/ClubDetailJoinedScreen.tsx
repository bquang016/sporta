import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Button, Card } from '../../../shared/ui';
import { useClubs, ClubDetailHeader } from '../../../entities/club';
import { MatchHistoryCard, MatchItem } from './components/MatchHistoryCard';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { InviteModal } from './components/InviteModal';
import { LeaveConfirmationModal } from './components/LeaveConfirmationModal';
import { MembersModal, MemberItem } from './components/MembersModal';
import { CreatePollModal } from './components/CreatePollModal';
import { MatchmakeModal } from './components/MatchmakeModal';
import { PollCard, PollData } from './components/PollCard';

// Mock Members for Joined Clubs to look premium
const MOCK_MEMBERS: MemberItem[] = [
  { id: 'm-1', name: 'Nguyễn Văn Hùng', role: 'Trưởng nhóm', elo: 1540, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80' },
  { id: 'm-2', name: 'Trần Thị Mai', role: 'Phó nhóm', elo: 1420, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { id: 'm-3', name: 'Phạm Minh Hoàng', role: 'Thành viên', elo: 1250, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80' },
  { id: 'm-4', name: 'Lê Hoàng Sơn', role: 'Thành viên', elo: 1180, avatar: 'https://images.unsplash.com/photo-1527983359383-4758693f760c?w=100&auto=format&fit=crop&q=80' },
];

const MOCK_MATCH_HISTORY: MatchItem[] = [
  {
    id: 'h-1',
    opponentName: 'FC Cầu Giấy United',
    opponentAvatar: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=100&auto=format&fit=crop&q=80',
    date: '20/06/2026',
    ourScore: 4,
    opponentScore: 2,
    result: 'win',
    location: 'Sân bóng Đại học Y',
  },
  {
    id: 'h-2',
    opponentName: 'Hà Đông Football Club',
    opponentAvatar: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&auto=format&fit=crop&q=80',
    date: '14/06/2026',
    ourScore: 1,
    opponentScore: 3,
    result: 'lose',
    location: 'Sân bóng Bách Khoa',
  },
  {
    id: 'h-3',
    opponentName: 'Bách Khoa Football Club',
    opponentAvatar: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=100&auto=format&fit=crop&q=80',
    date: '07/06/2026',
    ourScore: 2,
    opponentScore: 2,
    result: 'draw',
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

  // Custom Match History Modal State
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);

  // Poll & Matchmaking States
  const [activePoll, setActivePoll] = useState<PollData | null>(null);
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

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const handleConfirmLeave = () => {
    setIsLeaveModalVisible(false);
    setIsMembersModalVisible(false);
    leaveClub(club.id);
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* Header wrapper to color the status bar and notch area white */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            activeOpacity={0.7} 
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {club.name}
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>

      {/* Main Content */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Reusable Club detail header */}
        <ClubDetailHeader club={club} hideMembersMeta={true} />

        {/* Bio / Description */}
        <View style={styles.infoSection}>
          <Card variant="outline" style={styles.bioCard}>
            <Text style={styles.sectionTitle}>Giới thiệu câu lạc bộ</Text>
            <Text style={styles.description}>
              {club.description || 'Không có mô tả chi tiết cho câu lạc bộ này.'}
            </Text>
          </Card>
          
          {/* Action buttons row below description */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.rowActionBtn} 
              activeOpacity={0.7} 
              onPress={() => setIsInviteModalVisible(true)}
            >
              <MaterialIcons name="share" size={16} color={COLORS.primary} />
              <Text style={styles.actionBtnText} numberOfLines={1}>Mời bạn</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.rowActionBtn} 
              activeOpacity={0.7} 
              onPress={() => setIsMembersModalVisible(true)}
            >
              <MaterialIcons name="people" size={16} color={COLORS.primary} />
              <Text style={styles.actionBtnText} numberOfLines={1}>Thành viên</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.rowActionBtn} 
              activeOpacity={0.7} 
              onPress={() => setIsHistoryModalVisible(true)}
            >
              <MaterialIcons name="history" size={16} color={COLORS.primary} />
              <Text style={styles.actionBtnText} numberOfLines={1}>Lịch sử đấu</Text>
            </TouchableOpacity>
          </View>

          {/* Poll / Matchmaking Section */}
          <PollCard 
            activePoll={activePoll}
            userVote={userVote}
            matchmadeTeams={matchmadeTeams}
            onVote={handleVote}
            onClosePoll={handleClosePoll}
            onStartMatchmaking={handleStartMatchmaking}
            onDeletePoll={handleDeletePoll}
            onCreatePollPress={() => setIsCreatePollModalVisible(true)}
          />
        </View>
      </ScrollView>

      {/* Custom Leave Confirmation Modal */}
      <LeaveConfirmationModal 
        visible={isLeaveModalVisible}
        onClose={() => setIsLeaveModalVisible(false)}
        onConfirm={handleConfirmLeave}
        clubName={club.name}
      />

      {/* Group Members Full Screen Modal */}
      <MembersModal 
        visible={isMembersModalVisible}
        onClose={() => setIsMembersModalVisible(false)}
        membersCount={club.members}
        members={MOCK_MEMBERS}
        onLeavePress={handleLeavePress}
      />

      {/* Invite Friend Modal */}
      <InviteModal 
        visible={isInviteModalVisible}
        onClose={() => setIsInviteModalVisible(false)}
        club={club}
        onShare={handleNativeShare}
        copied={copied}
        onCopy={handleCopyLink}
      />

      {/* Create Poll Modal */}
      <CreatePollModal 
        visible={isCreatePollModalVisible}
        onClose={() => setIsCreatePollModalVisible(false)}
        pollTitleInput={pollTitleInput}
        setPollTitleInput={setPollTitleInput}
        pollTimeHour={pollTimeHour}
        pollTimeMinute={pollTimeMinute}
        adjustHour={adjustHour}
        adjustMinute={adjustMinute}
        setPollTimeHour={setPollTimeHour}
        setPollTimeMinute={setPollTimeMinute}
        onCreatePoll={handleCreatePoll}
      />

      {/* Matchmaking Team Split Modal */}
      <MatchmakeModal 
        visible={isMatchmakeModalVisible}
        onClose={() => setIsMatchmakeModalVisible(false)}
        teamA={teamA}
        teamB={teamB}
        onReshuffle={handleReshuffle}
        onConfirm={handleConfirmTeams}
      />

      {/* Match History Full Screen Modal */}
      <MatchHistoryModal 
        visible={isHistoryModalVisible}
        onClose={() => setIsHistoryModalVisible(false)}
        club={club}
        matches={MOCK_MATCH_HISTORY}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSafeArea: {
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    height: 64,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
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
    ...TYPOGRAPHY.headlineMd,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerPlaceholder: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  infoSection: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  bioCard: {
    backgroundColor: COLORS.primaryOpacity05,
    borderColor: COLORS.primaryOpacity15,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: SPACING.base,
    marginTop: 0,
  },
  description: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 0,
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
    borderColor: COLORS.primaryOpacity15,
    backgroundColor: COLORS.surface,
    gap: SPACING.base,
  },
  actionBtnText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.base,
  },
  errorText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  errorBtn: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
});

export default ClubDetailJoinedScreen;
