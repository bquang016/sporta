import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../../shared/config/theme';
import { LeaderboardItem } from '../../../../shared/api/leaderboard';
import { DEFAULT_CLUB_AVATAR } from '../../../../entities/club';

interface LeaderboardItemCardProps {
  item: LeaderboardItem;
  onPress: (item: LeaderboardItem) => void;
}

export function LeaderboardItemCard({ item, onPress }: LeaderboardItemCardProps) {
  const isTopTen = item.rank <= 10;
  const isUserClub = Boolean(item.isUserClub);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isUserClub && styles.cardUserClub,
      ]}
      activeOpacity={0.8}
      onPress={() => onPress(item)}
    >
      {/* Rank Column */}
      <View
        style={[
          styles.rankContainer,
          isTopTen && styles.rankContainerTopTen,
          isUserClub && styles.rankContainerUserClub,
        ]}
      >
        <Text
          style={[
            styles.rankText,
            isTopTen && styles.rankTextTopTen,
            isUserClub && styles.rankTextUserClub,
          ]}
        >
          {item.rank}
        </Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <Image
          source={
            item.avatarUrl && typeof item.avatarUrl === 'string' && item.avatarUrl.trim().length > 0 && !(item.avatarUrl.startsWith('blob:') && Platform.OS !== 'web')
              ? { uri: item.avatarUrl }
              : DEFAULT_CLUB_AVATAR
          }
          style={styles.avatarImg}
        />
        {isUserClub && (
          <View style={styles.userClubBadge}>
            <Ionicons name="person" size={8} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Club Info */}
      <View style={styles.infoCol}>
        <View style={styles.titleRow}>
          <Text style={styles.clubName} numberOfLines={1}>
            {item.clubName}
          </Text>
          {isUserClub && (
            <View style={styles.myClubTag}>
              <Text style={styles.myClubTagText}>CLB của bạn</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.sportTag}>
            <Text style={styles.sportTagText}>{item.sportName || 'Thể thao'}</Text>
          </View>

          {item.area && (
            <View style={styles.areaTag}>
              <Ionicons name="location-outline" size={10} color="#64748B" />
              <Text style={styles.areaTagText} numberOfLines={1}>
                {item.area}
              </Text>
            </View>
          )}

          {item.activeMemberCount !== undefined && item.activeMemberCount > 0 && (
            <Text style={styles.memberCountText}>
              • {item.activeMemberCount} TV
            </Text>
          )}
        </View>
      </View>

      {/* Stats Right Column */}
      <View style={styles.statsCol}>
        <View style={styles.crpScoreBox}>
          <Text style={styles.crpScoreValue}>{item.crp}</Text>
          <Text style={styles.crpScoreLabel}>CRP</Text>
        </View>

        <View style={styles.subStatsRow}>
          {item.winRate > 0 && (
            <Text style={styles.winRateText}>
              {item.winRate}% Thắng
            </Text>
          )}
          {item.streak && item.streak !== '-' && (
            <Text style={styles.streakText}>
              {item.streak}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardUserClub: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 1.5,
    shadowColor: '#10B981',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  rankContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankContainerTopTen: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  rankContainerUserClub: {
    backgroundColor: '#059669',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  rankTextTopTen: {
    color: '#059669',
  },
  rankTextUserClub: {
    color: '#FFFFFF',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userClubBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  clubName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  myClubTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#86EFAC',
  },
  myClubTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  sportTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sportTagText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#475569',
  },
  areaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    maxWidth: 90,
  },
  areaTagText: {
    fontSize: 10,
    color: '#64748B',
  },
  memberCountText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  statsCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
  },
  crpScoreBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  crpScoreValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  crpScoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  subStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  winRateText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  streakText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
});
