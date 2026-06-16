import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Club } from '../../../entities/club';
import { Button } from '../../../shared/ui';

const { width } = Dimensions.get('window');

// Colors matching Sporty-Tech Design System (DESIGN.md)
const COLORS = {
  background: '#ffffff', // Canvas: Pure White
  card: '#ffffff',
  surfaceContainerLow: '#f0f3ff', // Light gray-blue for container depth
  primary: '#064E3B', // Deep Emerald Green (#064E3B)
  accent: '#FACC15',  // Dynamic Athletic Yellow (#FACC15)
  neutral: '#707974', // Outline/Neutral text
  neutralLight: '#ededf3', // Very light gray/blue
  border: 'rgba(6, 78, 59, 0.1)', // 1px borders in primary
  iconBg: 'rgba(6, 78, 59, 0.08)', // Icon round wrapper background (8% opacity)
  primaryLight: 'rgba(6, 78, 59, 0.05)',
  accentLight: 'rgba(250, 204, 21, 0.15)',
};

interface VisitorClubDetailProps {
  club: Club;
  clubElo: number;
  area: string;
  memberLimit: number;
  joinStatus: 'idle' | 'pending';
  onJoinPress: () => void;
  onBackPress: () => void;
}

export function VisitorClubDetail({
  club,
  clubElo,
  area,
  memberLimit,
  joinStatus,
  onJoinPress,
  onBackPress
}: VisitorClubDetailProps) {

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

  const isPending = joinStatus === 'pending';

  return (
    <SafeAreaWrapper style={styles.safeArea}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Chi tiết câu lạc bộ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Cover Section (16:9 ratio) */}
        <View style={styles.coverSection}>
          <View style={styles.coverBg}>
            <View style={styles.fieldCenterCircle} />
            <View style={styles.fieldHalfLine} />
            <View style={styles.fieldPenaltyArea} />
          </View>
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
              <Ionicons name="location" size={12} color={COLORS.primary} />
              <Text style={styles.tagText}>{club.area || area}</Text>
            </View>
            <View style={styles.privacyTag}>
              <Ionicons name={club.isPrivate ? "lock-closed" : "earth"} size={12} color={COLORS.primary} />
              <Text style={styles.tagText}>{club.isPrivate ? "Riêng tư" : "Công khai"}</Text>
            </View>
          </View>

          {/* Join Club Button (Visitor Only) */}
          <View style={styles.visitorJoinRow}>
            <Button 
              title={isPending ? "Đang chờ duyệt..." : "Tham gia CLB"}
              variant="primary"
              disabled={isPending}
              style={[
                styles.visitorJoinBtn, 
                isPending && { backgroundColor: COLORS.neutralLight, shadowOpacity: 0, elevation: 0 }
              ]}
              textStyle={[
                styles.visitorJoinBtnText, 
                isPending && { color: COLORS.neutral }
              ]}
              onPress={onJoinPress}
            />
          </View>
        </View>

        {/* Visitor Details Section */}
        <View style={styles.visitorSection}>
          <Text style={styles.visitorSectionHeading}>Thông tin câu lạc bộ</Text>
          
          {/* 1. Bio Card */}
          <View style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <View style={styles.metricIconWrapper}>
                <Ionicons name="document-text" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.metricTitleContainer}>
                <Text style={styles.metricLabel}>Giới thiệu câu lạc bộ</Text>
                <Text style={styles.metricSublabel}>Mục tiêu và định hướng hoạt động</Text>
              </View>
            </View>
            <View style={styles.visitorBioContainer}>
              <Text style={styles.visitorBioText}>{club.description}</Text>
            </View>
          </View>

          {/* 2. Member Limit Card with Progress Bar */}
          <View style={styles.metricCard}>
            <View style={styles.metricCardHeader}>
              <View style={styles.metricIconWrapper}>
                <Ionicons name="people" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.metricTitleContainer}>
                <Text style={styles.metricLabel}>Thành viên câu lạc bộ</Text>
                <Text style={styles.metricSublabel}>Số lượng vị trí trong danh sách</Text>
              </View>
              <Text style={styles.memberRatioText}>
                {club.members}/{club.memberLimit || memberLimit}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${Math.min(100, (club.members / (club.memberLimit || memberLimit)) * 100)}%` }
                ]} 
              />
            </View>

            {/* Avatar stack visualization (anonymous preview) */}
            <View style={styles.avatarStackContainer}>
              <View style={styles.avatarStackRow}>
                <View style={[styles.avatarStackItem, { backgroundColor: '#e7eefe' }]}>
                  <Text style={styles.avatarLetter}>N</Text>
                </View>
                <View style={[styles.avatarStackItem, { backgroundColor: '#dce2f3', marginLeft: -8 }]}>
                  <Text style={styles.avatarLetter}>H</Text>
                </View>
                <View style={[styles.avatarStackItem, { backgroundColor: '#f0f3ff', marginLeft: -8 }]}>
                  <Text style={styles.avatarLetter}>A</Text>
                </View>
                <Text style={styles.avatarStackText}>
                  +{club.members} người đã tham gia hoạt động
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

// Simple wrapper to support both iOS safe areas and Android styles seamlessly
function SafeAreaWrapper({ children, style }: { children: React.ReactNode, style: any }) {
  return <SafeAreaView style={style}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40, // Reduced padding bottom since sticky footer is removed
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
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 8,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
    textAlign: 'center',
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
  visitorJoinRow: {
    marginTop: 20,
    width: '100%',
  },
  visitorJoinBtn: {
    backgroundColor: COLORS.accent, // Athletic Yellow
    borderRadius: 12, // 12px corners for buttons
    height: 46,
    width: '100%',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  visitorJoinBtnText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 15,
    color: COLORS.primary, // Deep Emerald
    fontWeight: 'bold',
  },
  visitorSection: {
    paddingHorizontal: 20, // margin-mobile 20px
    paddingTop: 24,
    paddingBottom: 40,
  },
  visitorSectionHeading: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: COLORS.surfaceContainerLow, // 30% tonal container background
    borderRadius: 16, // Standard container 16px radius
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.05)',
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16, // Circle
    backgroundColor: COLORS.iconBg, // 8% opacity primary
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricTitleContainer: {
    flex: 1,
  },
  metricLabel: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  metricSublabel: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 11,
    color: COLORS.neutral,
    marginTop: 1,
  },
  visitorBioContainer: {
    marginTop: 4,
  },
  visitorBioText: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#444748', // neutral variant
  },
  memberRatioText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(6, 78, 59, 0.08)',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary, // Emerald green fill
    borderRadius: 4,
  },
  avatarStackContainer: {
    marginTop: 4,
  },
  avatarStackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStackItem: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  avatarStackText: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 12,
    color: COLORS.neutral,
    marginLeft: 12,
  },
});
