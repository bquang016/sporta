import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Avatar } from '../../../../shared/ui';
import { Club } from '../../../../entities/club';

export interface MatchItem {
  id: string | number;
  matchId?: string;
  opponentClubId?: number;
  opponentName: string;
  opponentAvatar?: string;
  date: string;
  ourScore: number;
  opponentScore: number;
  scoreText?: string;
  result: 'win' | 'lose' | 'draw';
  crpDelta?: number;
  location?: string;
  matchType?: string;
}

export interface MatchHistoryCardProps {
  match: MatchItem;
  club: Club;
}

export function MatchHistoryCard({ match, club }: MatchHistoryCardProps) {
  const isWin = match.result === 'win';
  const isLoss = match.result === 'lose';

  return (
    <View style={[
      styles.matchCard,
      isWin && styles.matchCardWin,
      isLoss && styles.matchCardLoss
    ]}>
      {/* Top Header: Date & Match Type */}
      <View style={styles.cardHeader}>
        <View style={styles.dateCol}>
          <Ionicons name="calendar" size={12} color="#64748B" />
          <Text style={styles.dateText}>{match.date || 'Gần đây'}</Text>
        </View>

        <View style={styles.matchTypePill}>
          <FontAwesome5 name="trophy" size={9} color="#2563EB" />
          <Text style={styles.matchTypeText}>{match.matchType || 'Xếp Hạng Giao Hữu'}</Text>
        </View>
      </View>

      {/* Center Clash Area: Our Club vs Opponent */}
      <View style={styles.clashRow}>
        {/* Left: Our Club */}
        <View style={styles.clubCol}>
          <View style={styles.avatarGlow}>
            <Avatar 
              size={46} 
              source={club.avatarImage} 
              fallbackIcon={club.sportIcon as any} 
            />
          </View>
          <Text style={styles.clubName} numberOfLines={1} ellipsizeMode="tail">
            {club.name}
          </Text>
          <Text style={styles.homeLabel}>Đội nhà</Text>
        </View>

        {/* Center: Score & Result & CRP */}
        <View style={styles.centerScoreBox}>
          {/* Result Badge */}
          <View style={[
            styles.outcomeBadge,
            isWin && styles.outcomeBadgeWin,
            isLoss && styles.outcomeBadgeLoss
          ]}>
            <Text style={[
              styles.outcomeText,
              isWin && styles.outcomeTextWin,
              isLoss && styles.outcomeTextLoss
            ]}>
              {isWin ? 'THẮNG' : (isLoss ? 'THUA' : 'HÒA')}
            </Text>
          </View>

          {/* Big Score */}
          <Text style={styles.bigScoreText}>
            {match.scoreText || `${match.ourScore} - ${match.opponentScore}`}
          </Text>

          {/* CRP Delta */}
          {match.crpDelta !== undefined && (
            <View style={[
              styles.crpDeltaBadge,
              match.crpDelta >= 0 ? styles.crpDeltaBadgePlus : styles.crpDeltaBadgeMinus
            ]}>
              <Ionicons 
                name={match.crpDelta >= 0 ? "trending-up" : "trending-down"} 
                size={11} 
                color={match.crpDelta >= 0 ? "#059669" : "#DC2626"} 
              />
              <Text style={[
                styles.crpDeltaText,
                match.crpDelta >= 0 ? styles.crpDeltaTextPlus : styles.crpDeltaTextMinus
              ]}>
                {match.crpDelta >= 0 ? `+${match.crpDelta}` : match.crpDelta} CRP
              </Text>
            </View>
          )}
        </View>

        {/* Right: Opponent Club */}
        <View style={styles.clubCol}>
          <View style={styles.avatarGlow}>
            <Avatar 
              size={46} 
              source={match.opponentAvatar} 
              fallbackType="club" 
            />
          </View>
          <Text style={styles.clubName} numberOfLines={1} ellipsizeMode="tail">
            {match.opponentName}
          </Text>
          <Text style={styles.awayLabel}>Đối thủ</Text>
        </View>
      </View>

      {/* Footer: Venue Location */}
      {match.location && (
        <View style={styles.cardFooter}>
          <Ionicons name="location" size={12} color="#64748B" />
          <Text style={styles.locationText} numberOfLines={1}>
            {match.location}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  matchCardWin: {
    borderColor: '#A7F3D0',
    backgroundColor: '#FFFFFF',
  },
  matchCardLoss: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFFFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 10,
  },
  dateCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  matchTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  matchTypeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#1E40AF',
  },
  clashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  clubCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  avatarGlow: {
    padding: 2,
    borderRadius: 26,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clubName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    maxWidth: 95,
  },
  homeLabel: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '700',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  awayLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  centerScoreBox: {
    alignItems: 'center',
    minWidth: 100,
    gap: 3,
  },
  outcomeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  outcomeBadgeWin: {
    backgroundColor: '#ECFDF5',
  },
  outcomeBadgeLoss: {
    backgroundColor: '#FEF2F2',
  },
  outcomeText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  outcomeTextWin: {
    color: '#059669',
  },
  outcomeTextLoss: {
    color: '#DC2626',
  },
  bigScoreText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  crpDeltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  crpDeltaBadgePlus: {
    backgroundColor: '#ECFDF5',
  },
  crpDeltaBadgeMinus: {
    backgroundColor: '#FEF2F2',
  },
  crpDeltaText: {
    fontSize: 11,
    fontWeight: '800',
  },
  crpDeltaTextPlus: {
    color: '#059669',
  },
  crpDeltaTextMinus: {
    color: '#DC2626',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  locationText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
});
