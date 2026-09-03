import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../../shared/config/theme';
import { LeaderboardItem } from '../../../../shared/api/leaderboard';
import { DEFAULT_CLUB_AVATAR } from '../../../../entities/club';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PodiumTopThreeProps {
  topClubs: LeaderboardItem[];
  onClubPress: (club: LeaderboardItem) => void;
}

export function PodiumTopThree({ topClubs, onClubPress }: PodiumTopThreeProps) {
  const first = topClubs[0];
  const second = topClubs[1];
  const third = topClubs[2];

  if (!first) return null;

  return (
    <View style={styles.container}>
      {/* Background soft glow card */}
      <View style={styles.podiumWrapper}>
        
        {/* TOP 2 (RUNNER-UP - LEFT) */}
        {second ? (
          <TouchableOpacity
            style={styles.podiumColumn}
            activeOpacity={0.85}
            onPress={() => onClubPress(second)}
          >
            {/* Avatar & Rank Badge */}
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarGlowRing, styles.silverRing]}>
                <Image
                  source={
                    second.avatarUrl && typeof second.avatarUrl === 'string' && second.avatarUrl.trim().length > 0 && !(second.avatarUrl.startsWith('blob:') && Platform.OS !== 'web')
                      ? { uri: second.avatarUrl }
                      : DEFAULT_CLUB_AVATAR
                  }
                  style={styles.avatarImg}
                />
              </View>
              <View style={[styles.rankBadge, styles.silverBadge]}>
                <Text style={styles.rankBadgeText}>2</Text>
              </View>
            </View>

            {/* Club Name & Sport */}
            <Text style={styles.clubName} numberOfLines={1}>
              {second.clubName}
            </Text>
            <View style={styles.sportPill}>
              <Text style={styles.sportPillText}>{second.sportName || 'Thể thao'}</Text>
            </View>

            {/* CRP Score Pill */}
            <View style={[styles.crpPill, styles.silverCrpPill]}>
              <Text style={styles.crpPillValue}>{second.crp}</Text>
              <Text style={styles.crpPillLabel}>CRP</Text>
            </View>

            {/* Pedestal Step */}
            <LinearGradient
              colors={['#FFFFFF', '#F1F5F9', '#E2E8F0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.pedestal, styles.pedestalRank2]}
            >
              <View style={styles.pedestalHeader}>
                <Ionicons name="medal" size={16} color="#64748B" />
                <Text style={styles.pedestalRankText}>HẠNG 2</Text>
              </View>
              {second.winRate > 0 && (
                <Text style={styles.pedestalStatText}>Thắng {second.winRate}%</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={[styles.podiumColumn, styles.emptyColumn]} />
        )}

        {/* TOP 1 (CHAMPION - CENTER) */}
        {first && (
          <TouchableOpacity
            style={[styles.podiumColumn, styles.championColumn]}
            activeOpacity={0.85}
            onPress={() => onClubPress(first)}
          >
            {/* Crown on top */}
            <View style={styles.crownContainer}>
              <Ionicons name="trophy" size={26} color="#F59E0B" />
            </View>

            {/* Avatar with Gold Ring */}
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarGlowRing, styles.goldRing]}>
                <Image
                  source={
                    first.avatarUrl && typeof first.avatarUrl === 'string' && first.avatarUrl.trim().length > 0 && !(first.avatarUrl.startsWith('blob:') && Platform.OS !== 'web')
                      ? { uri: first.avatarUrl }
                      : DEFAULT_CLUB_AVATAR
                  }
                  style={[styles.avatarImg, styles.avatarImgChampion]}
                />
              </View>
              <View style={[styles.rankBadge, styles.goldBadge]}>
                <Ionicons name="star" size={12} color="#FFFFFF" />
              </View>
            </View>

            {/* Club Name & Sport */}
            <Text style={[styles.clubName, styles.clubNameChampion]} numberOfLines={1}>
              {first.clubName}
            </Text>
            <View style={[styles.sportPill, styles.sportPillChampion]}>
              <Text style={[styles.sportPillText, styles.sportPillTextChampion]}>
                {first.sportName || 'Thể thao'} • {first.area || 'Toàn quốc'}
              </Text>
            </View>

            {/* Prominent Gold CRP Badge */}
            <View style={[styles.crpPill, styles.goldCrpPill]}>
              <Ionicons name="flame" size={14} color="#D97706" />
              <Text style={[styles.crpPillValue, styles.goldCrpPillValue]}>{first.crp}</Text>
              <Text style={[styles.crpPillLabel, styles.goldCrpPillLabel]}>CRP</Text>
            </View>

            {/* Pedestal Step */}
            <LinearGradient
              colors={['#FEF3C7', '#FDE68A', '#FCD34D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.pedestal, styles.pedestalRank1]}
            >
              <View style={styles.pedestalHeader}>
                <Ionicons name="trophy" size={16} color="#B45309" />
                <Text style={[styles.pedestalRankText, styles.pedestalRankTextChampion]}>
                  QUÁN QUÂN
                </Text>
              </View>
              <Text style={styles.pedestalStatTextChampion}>
                {first.rankedWins} Trận Thắng {first.winRate > 0 ? `(${first.winRate}%)` : ''}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* TOP 3 (3RD PLACE - RIGHT) */}
        {third ? (
          <TouchableOpacity
            style={styles.podiumColumn}
            activeOpacity={0.85}
            onPress={() => onClubPress(third)}
          >
            {/* Avatar & Rank Badge */}
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarGlowRing, styles.bronzeRing]}>
                <Image
                  source={
                    third.avatarUrl && typeof third.avatarUrl === 'string' && third.avatarUrl.trim().length > 0 && !(third.avatarUrl.startsWith('blob:') && Platform.OS !== 'web')
                      ? { uri: third.avatarUrl }
                      : DEFAULT_CLUB_AVATAR
                  }
                  style={styles.avatarImg}
                />
              </View>
              <View style={[styles.rankBadge, styles.bronzeBadge]}>
                <Text style={styles.rankBadgeText}>3</Text>
              </View>
            </View>

            {/* Club Name & Sport */}
            <Text style={styles.clubName} numberOfLines={1}>
              {third.clubName}
            </Text>
            <View style={styles.sportPill}>
              <Text style={styles.sportPillText}>{third.sportName || 'Thể thao'}</Text>
            </View>

            {/* CRP Score Pill */}
            <View style={[styles.crpPill, styles.bronzeCrpPill]}>
              <Text style={styles.crpPillValue}>{third.crp}</Text>
              <Text style={styles.crpPillLabel}>CRP</Text>
            </View>

            {/* Pedestal Step */}
            <LinearGradient
              colors={['#FFFFFF', '#FFEDD5', '#FED7AA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.pedestal, styles.pedestalRank3]}
            >
              <View style={styles.pedestalHeader}>
                <Ionicons name="ribbon" size={16} color="#B45309" />
                <Text style={styles.pedestalRankText}>HẠNG 3</Text>
              </View>
              {third.winRate > 0 && (
                <Text style={styles.pedestalStatText}>Thắng {third.winRate}%</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={[styles.podiumColumn, styles.emptyColumn]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  podiumWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
  },
  podiumColumn: {
    flex: 1,
    alignItems: 'center',
    maxWidth: (SCREEN_WIDTH - 48) / 3,
  },
  championColumn: {
    zIndex: 10,
    marginTop: -16,
  },
  emptyColumn: {
    opacity: 0,
  },
  crownContainer: {
    marginBottom: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  avatarGlowRing: {
    padding: 3,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goldRing: {
    borderColor: '#F59E0B',
    padding: 4,
    borderRadius: 42,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  silverRing: {
    borderColor: '#94A3B8',
  },
  bronzeRing: {
    borderColor: '#D97706',
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
  },
  avatarImgChampion: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  goldBadge: {
    backgroundColor: '#F59E0B',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  silverBadge: {
    backgroundColor: '#64748B',
  },
  bronzeBadge: {
    backgroundColor: '#D97706',
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clubName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    width: '100%',
    paddingHorizontal: 2,
  },
  clubNameChampion: {
    fontSize: 13,
    color: '#0F172A',
  },
  sportPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
    marginBottom: 4,
  },
  sportPillChampion: {
    backgroundColor: '#FEF3C7',
  },
  sportPillText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#64748B',
  },
  sportPillTextChampion: {
    color: '#B45309',
    fontWeight: '700',
  },
  crpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  goldCrpPill: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  silverCrpPill: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  bronzeCrpPill: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  crpPillValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  goldCrpPillValue: {
    fontSize: 13,
    color: '#B45309',
  },
  crpPillLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  goldCrpPillLabel: {
    color: '#D97706',
  },
  pedestal: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  pedestalRank1: {
    height: 110,
    borderColor: '#FCD34D',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  pedestalRank2: {
    height: 85,
    borderColor: '#CBD5E1',
  },
  pedestalRank3: {
    height: 70,
    borderColor: '#FED7AA',
  },
  pedestalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pedestalRankText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  pedestalRankTextChampion: {
    color: '#B45309',
  },
  pedestalStatText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 4,
  },
  pedestalStatTextChampion: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
    marginTop: 4,
  },
});
