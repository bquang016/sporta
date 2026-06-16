import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Dimensions,
  Share,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MOCK_CLUBS, INITIAL_JOINED_CLUBS } from '../../../entities/club';
import { Button } from '../../../shared/ui';
import { VisitorClubDetail } from './VisitorClubDetail';

const { width } = Dimensions.get('window');

// Colors matching Sporty-Tech Design System
const COLORS = {
  background: '#ffffff', // Canvas: Pure White
  card: '#ffffff',
  surfaceContainerLow: '#f0f3ff', // Light gray-blue for container depth
  primary: '#064E3B', // Deep Emerald Green (#064E3B)
  accent: '#FACC15',  // Dynamic Athletic Yellow (#FACC15)
  neutral: '#707974', // Outline/Neutral text
  neutralLight: '#ededf3', // Very light gray/blue
  error: '#ba1a1a',   // Error red
  border: 'rgba(6, 78, 59, 0.1)', // 1px borders in primary
  iconBg: 'rgba(6, 78, 59, 0.08)', // Icon round wrapper background (8% opacity)
  primaryLight: 'rgba(6, 78, 59, 0.05)',
  accentLight: 'rgba(250, 204, 21, 0.15)',
};

interface Match {
  id: string;
  opponentName: string;
  opponentElo: number;
  date: string;
  time: string;
  score?: string;
  status: 'finished' | 'scheduled' | 'disputed';
  sport: string;
}

export function ClubDetailScreen() {
  const router = useRouter();
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();

  // Find club in mock lists
  const club = MOCK_CLUBS.find(c => c.id === id) || INITIAL_JOINED_CLUBS.find(c => c.id === id);

  // Check if already joined (either in INITIAL_JOINED_CLUBS list or has joined flag)
  const isActuallyJoined = INITIAL_JOINED_CLUBS.some(c => c.id === id) || (club ? !!club.joined : false);
  
  // Track state of the join request approval
  const [joinStatus, setJoinStatus] = useState<'idle' | 'pending'>('idle');

  // Show full details if navigated from My Clubs
  const showFullDetails = from === 'my-clubs';

  // Poll Widget State
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);
  const [pollVotes, setPollVotes] = useState({
    join: 14,
    late: 3,
    absent: 2
  });

  if (!club) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin câu lạc bộ.</Text>
          <Button title="Quay lại" variant="primary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const clubElo = 1220; // Average elo rating for mock club
  const area = "Quận Cầu Giấy";
  const memberLimit = 50;

  // Mock matches list (for members only)
  const [matches, setMatches] = useState<Match[]>([
    {
      id: 'm1',
      opponentName: 'FC Bách Khoa',
      opponentElo: 1240,
      sport: club.sport,
      date: 'Tối thứ Năm, 18/06',
      time: '19:30',
      status: 'scheduled'
    },
    {
      id: 'm2',
      opponentName: 'Cầu Giấy United',
      opponentElo: 1180,
      sport: club.sport,
      date: '11/06/2026',
      time: '19:30',
      score: '1 - 1',
      status: 'disputed' // Tranh chấp
    },
    {
      id: 'm3',
      opponentName: 'FC Hàng Không',
      opponentElo: 1210,
      sport: club.sport,
      date: '04/06/2026',
      time: '18:00',
      score: '3 - 2',
      status: 'finished'
    }
  ]);

  const handleVote = (option: 'join' | 'late' | 'absent') => {
    if (selectedPollOption === option) {
      // Toggle off
      setSelectedPollOption(null);
      setPollVotes(prev => ({
        ...prev,
        [option]: prev[option] - 1
      }));
      return;
    }

    setPollVotes(prev => {
      const updated = { ...prev };
      if (selectedPollOption) {
        updated[selectedPollOption as 'join' | 'late' | 'absent'] -= 1;
      }
      updated[option] += 1;
      return updated;
    });
    setSelectedPollOption(option);
  };

  // Quick action: Invite Friends
  const handleInvite = async () => {
    try {
      const result = await Share.share({
        message: `Tham gia cùng chúng tôi tại ${club.name}! Mã liên kết tham gia của bạn: sporta://join-club/${club.id}. Elo trung bình: ${clubElo}`,
      });
      if (result.action === Share.sharedAction) {
        Alert.alert("Thành công", "Đã tạo liên kết chia sẻ thành công!");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo liên kết chia sẻ.");
    }
  };

  // Quick action: Create Match Lobby
  const handleCreateLobby = () => {
    Alert.alert(
      "Tạo phòng chờ giao hữu",
      `Tạo phòng chờ giao hữu cho ${club.name} với mức Elo tự động ghép cặp quanh ${clubElo}.`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xác nhận", 
          onPress: () => {
            Alert.alert("Đã tạo phòng chờ", "Hệ thống đang tìm kiếm đối thủ có mức Elo tương đương với bạn.");
          } 
        }
      ]
    );
  };

  const handleJoinPress = () => {
    setJoinStatus('pending');
    Alert.alert(
      "Gửi yêu cầu tham gia", 
      `Yêu cầu tham gia câu lạc bộ "${club.name}" đã được gửi thành công! Vui lòng chờ chủ câu lạc bộ phê duyệt.`
    );
  };

  // Helper function to render correct sport icon
  const renderSportIcon = (sport: string, size: number, color: string) => {
    switch (sport) {
      case 'Bóng đá':
        return <Ionicons name="football" size={size} color={color} />;
      case 'Bóng rổ':
        return <Ionicons name="basketball" size={size} color={color} />;
      case 'Cầu lông':
        return <MaterialCommunityIcons name="badminton" size={size} color={color} />;
      case 'Pickle ball':
        return <Ionicons name="tennisball" size={size} color={color} />;
      default:
        return <Ionicons name="people" size={size} color={color} />;
    }
  };

  if (!showFullDetails) {
    return (
      <VisitorClubDetail
        club={club}
        clubElo={clubElo}
        area={area}
        memberLimit={memberLimit}
        joinStatus={joinStatus}
        onJoinPress={handleJoinPress}
        onBackPress={() => router.back()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Cover Section (16:9 ratio) */}
        <View style={styles.coverSection}>
          <View style={styles.coverBg}>
            <View style={styles.fieldCenterCircle} />
            <View style={styles.fieldHalfLine} />
            <View style={styles.fieldPenaltyArea} />
          </View>
          
          {/* Translucent back button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Club Profile Header Section */}
        <View style={styles.overviewSection}>
          {/* Overlapping Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarInner}>
              {renderSportIcon(club.sport, 40, COLORS.primary)}
            </View>
          </View>

          {/* Name & Elo Row (Visible to both visitors and members) */}
          <View style={styles.titleRow}>
            <Text style={styles.clubName} numberOfLines={2}>
              {club.name}
            </Text>
            <View style={styles.eloBadge}>
              <Ionicons name="star" size={12} color={COLORS.primary} style={styles.eloStar} />
              <Text style={styles.eloText}>Elo {clubElo}</Text>
            </View>
          </View>

          {/* Sub-info description (Sport • Area • Members/Limit) */}
          <Text style={styles.subInfoText} numberOfLines={1}>
            {club.sport} • {club.area || area} • {club.members}/{club.memberLimit || memberLimit} thành viên
          </Text>

          {/* Area & Privacy Tags */}
          <View style={styles.tagRow}>
            <View style={styles.areaTag}>
              <Ionicons name="location" size={12} color={COLORS.neutral} />
              <Text style={styles.tagText}>{club.area || area}</Text>
            </View>
            <View style={styles.privacyTag}>
              <Ionicons name={club.isPrivate ? "lock-closed" : "earth"} size={12} color={COLORS.neutral} />
              <Text style={styles.tagText}>{club.isPrivate ? "Riêng tư" : "Công khai"}</Text>
            </View>
          </View>

          {/* Quick Action Row (Members Only) */}
          {showFullDetails && (
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.actionBtnOutline} 
                onPress={handleInvite}
                activeOpacity={0.8}
              >
                <Ionicons name="share-social-outline" size={18} color={COLORS.primary} style={styles.actionBtnIcon} />
                <Text style={styles.actionBtnOutlineText} numberOfLines={1}>Mời bạn bè</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionBtnAccent} 
                onPress={handleCreateLobby}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} style={styles.actionBtnIcon} />
                <Text style={styles.actionBtnAccentText} numberOfLines={1}>Tạo phòng chờ</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Content Details Area */}
        {/* Member View: Poll -> Bio -> Match Lobbies */}
        <View style={styles.detailsSection}>
            <Text style={styles.sectionHeading}>Khảo sát quân số</Text>
            <View style={styles.pollCard}>
              <View style={styles.pollHeaderRow}>
                <View style={styles.pollIconWrapper}>
                  <Ionicons name="checkbox-outline" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.pollTitle} numberOfLines={3}>
                  Khảo sát trận đấu tối thứ Năm tuần này - 19:30 sân cụm Cầu Giấy
                </Text>
              </View>

              {/* Options list */}
              <View style={styles.pollOptionsContainer}>
                {/* Option 1: Join */}
                <TouchableOpacity 
                  style={[
                    styles.pollOptionBtn,
                    selectedPollOption === 'join' && styles.pollOptionBtnActive
                  ]}
                  onPress={() => handleVote('join')}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    <Ionicons 
                      name={selectedPollOption === 'join' ? "radio-button-on" : "radio-button-off"} 
                      size={20} 
                      color={COLORS.primary} 
                    />
                    <Text style={styles.optionLabel}>Tham gia</Text>
                  </View>
                  <Text style={styles.optionCount}>{pollVotes.join} người</Text>
                </TouchableOpacity>

                {/* Option 2: Late */}
                <TouchableOpacity 
                  style={[
                    styles.pollOptionBtn,
                    selectedPollOption === 'late' && styles.pollOptionBtnActive
                  ]}
                  onPress={() => handleVote('late')}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    <Ionicons 
                      name={selectedPollOption === 'late' ? "radio-button-on" : "radio-button-off"} 
                      size={20} 
                      color={COLORS.primary} 
                    />
                    <Text style={styles.optionLabel}>Đến trễ</Text>
                  </View>
                  <Text style={styles.optionCount}>{pollVotes.late} người</Text>
                </TouchableOpacity>

                {/* Option 3: Absent */}
                <TouchableOpacity 
                  style={[
                    styles.pollOptionBtn,
                    selectedPollOption === 'absent' && styles.pollOptionBtnActive
                  ]}
                  onPress={() => handleVote('absent')}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    <Ionicons 
                      name={selectedPollOption === 'absent' ? "radio-button-on" : "radio-button-off"} 
                      size={20} 
                      color={COLORS.primary} 
                    />
                    <Text style={styles.optionLabel}>Vắng mặt</Text>
                  </View>
                  <Text style={styles.optionCount}>{pollVotes.absent} người</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.pollClosingText}>Hạn chốt: Đóng lúc 15:00 hôm nay</Text>
            </View>

            <Text style={styles.sectionHeading}>Mô tả câu lạc bộ</Text>
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{club.description}</Text>
            </View>

            <Text style={styles.sectionHeading}>Lịch sử đấu & Phòng chờ</Text>
            {matches.map((match) => {
              const isDisputed = match.status === 'disputed';
              const isScheduled = match.status === 'scheduled';
              const isFinished = match.status === 'finished';

              return (
                <View key={match.id} style={styles.matchCard}>
                  {/* Match Card Header (Sport & Date) */}
                  <View style={styles.matchHeader}>
                    <View style={styles.matchSportWrapper}>
                      <Ionicons name="football" size={14} color={COLORS.primary} />
                      <Text style={styles.matchSportText}>{match.sport}</Text>
                    </View>
                    <Text style={styles.matchDateText}>{match.date}</Text>
                  </View>

                  {/* Matchup row */}
                  <View style={styles.matchContentRow}>
                    <View style={styles.teamCol}>
                      <Text style={styles.ourTeamName} numberOfLines={1}>Sporta FC</Text>
                      <Text style={styles.eloSubText}>Elo {clubElo}</Text>
                    </View>

                    {/* Score or VS column */}
                    <View style={styles.scoreCol}>
                      {isScheduled ? (
                        <View style={styles.vsBadge}>
                          <Text style={styles.vsBadgeText}>VS</Text>
                        </View>
                      ) : (
                        <Text style={styles.scoreText}>{match.score}</Text>
                      )}
                    </View>

                    <View style={[styles.teamCol, styles.alignRight]}>
                      <Text style={styles.opponentName} numberOfLines={1}>{match.opponentName}</Text>
                      <Text style={styles.eloSubText}>Elo {match.opponentElo}</Text>
                    </View>
                  </View>

                  {/* Match Card Footer / Status Badge */}
                  <View style={styles.matchFooter}>
                    {isDisputed && (
                      <View style={styles.disputeBadge}>
                        <Ionicons name="warning-outline" size={14} color={COLORS.error} />
                        <Text style={styles.disputeBadgeText} numberOfLines={1}>Tranh chấp (Dispute)</Text>
                      </View>
                    )}
                    {isFinished && (
                      <View style={styles.statusBadgeFinished}>
                        <Ionicons name="checkmark-done" size={14} color="#2b6954" />
                        <Text style={styles.statusTextFinished} numberOfLines={1}>Đã kết thúc</Text>
                      </View>
                    )}
                    {isScheduled && (
                      <View style={styles.statusBadgeScheduled}>
                        <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.statusTextScheduled} numberOfLines={1}>Sắp diễn ra - {match.time}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40, // Reduced padding bottom since sticky footer is removed
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 16,
    color: '#444748',
    marginBottom: 16,
  },
  coverSection: {
    height: width * 9 / 16, // strictly 16:9 ratio
    width: '100%',
    position: 'relative',
  },
  coverBg: {
    flex: 1,
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
    position: 'relative',
  },
  fieldHalfLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  fieldCenterCircle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginLeft: -50,
    marginTop: -50,
  },
  fieldPenaltyArea: {
    position: 'absolute',
    right: 0,
    top: '20%',
    bottom: '20%',
    width: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRightWidth: 0,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 16 : 28,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewSection: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.card,
    borderWidth: 3,
    borderColor: COLORS.card,
    marginTop: -40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
    backgroundColor: COLORS.iconBg, // Perfect circle, mờ 8% màu chủ đạo
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  clubName: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
    marginRight: 8,
  },
  eloBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  eloStar: {
    marginRight: 4,
  },
  eloText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subInfoText: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.neutral,
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12, // CTA buttons use 12px corners
    height: 44,
    width: '38%',
  },
  actionBtnOutlineText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  actionBtnAccent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent, // Accent: Athletic Yellow #fed01b
    borderRadius: 12, // CTA buttons use 12px corners
    height: 44,
    width: '58%',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnAccentText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  actionBtnIcon: {
    marginRight: 6,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeading: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    marginTop: 16,
  },
  pollCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16, // bo góc chính xác 16px
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  pollHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pollIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.iconBg, // Perfect circle, mờ 8% màu chủ đạo
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pollTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
    lineHeight: 20,
    marginTop: 2,
  },
  pollOptionsContainer: {
    marginTop: 16,
  },
  pollOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  pollOptionBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontFamily: 'HankenGrotesk-SemiBold',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 10,
  },
  optionCount: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    color: COLORS.neutral,
    fontWeight: 'bold',
  },
  pollClosingText: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 11,
    color: COLORS.neutral,
    marginTop: 12,
    textAlign: 'left',
  },
  bioCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16, // bo góc chính xác 16px
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bioText: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 14,
    color: COLORS.neutral,
    lineHeight: 20,
  },
  matchCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16, // bo góc chính xác 16px
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
    marginBottom: 12,
  },
  matchSportWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.iconBg, // Perfect circle, mờ 8% màu chủ đạo
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  matchSportText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 4,
  },
  matchDateText: {
    fontFamily: 'HankenGrotesk-Medium',
    fontSize: 12,
    color: COLORS.neutral,
  },
  matchContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  teamCol: {
    width: '40%',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  ourTeamName: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  opponentName: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#191c20',
  },
  eloSubText: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 11,
    color: COLORS.neutral,
    marginTop: 2,
  },
  scoreCol: {
    width: '20%',
    alignItems: 'center',
  },
  scoreText: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  vsBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  vsBadgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.neutral,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  disputeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(186, 26, 26, 0.08)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  disputeBadgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.error, // Warning red (disputed)
    marginLeft: 6,
  },
  statusBadgeFinished: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 105, 84, 0.08)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusTextFinished: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2b6954',
    marginLeft: 6,
  },
  statusBadgeScheduled: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusTextScheduled: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 6,
  },
  detailsSection: {
    padding: 16,
  },
  // Visitor view specific styles
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  areaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight, // Light emerald tint background
    borderRadius: 24, // Pill shape
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  privacyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight, // Light emerald tint background
    borderRadius: 24, // Pill shape
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary, // Deep emerald color
    marginLeft: 4,
    letterSpacing: 0.05, // label-md tracking
  },
});
