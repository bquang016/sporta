import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Avatar } from '../../../../shared/ui';
import { Club } from '../../../../entities/club';

export interface MatchItem {
  id: string;
  opponentName: string;
  opponentAvatar: string;
  date: string;
  ourScore: number;
  opponentScore: number;
  result: 'win' | 'lose' | 'draw';
  location: string;
}

export interface MatchHistoryCardProps {
  match: MatchItem;
  club: Club;
}

export function MatchHistoryCard({ match, club }: MatchHistoryCardProps) {
  const getResultBadgeStyle = (result: 'win' | 'lose' | 'draw') => {
    switch (result) {
      case 'win':
        return { bg: COLORS.successOpacity10, text: COLORS.successText, label: 'THẮNG' };
      case 'lose':
        return { bg: COLORS.errorOpacity10, text: COLORS.errorText, label: 'THUA' };
      case 'draw':
        return { bg: COLORS.grayOpacity10, text: COLORS.grayText, label: 'HÒA' };
    }
  };
 
  const badge = getResultBadgeStyle(match.result);
 
  return (
    <View style={styles.matchCard}>
      {/* Match Meta (Date & Location) */}
      <View style={styles.matchMetaHeader}>
        <View style={styles.metaCol}>
          <MaterialIcons name="event" size={14} color={COLORS.onSurfaceVariant} />
          <Text style={styles.matchMetaText}>{match.date}</Text>
        </View>
        <View style={styles.metaCol}>
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
          <Avatar 
            size={36} 
            source={match.opponentAvatar} 
            fallbackType="club" 
            style={styles.opponentAvatarImage} 
          />
          <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1} ellipsizeMode="tail">
            {match.opponentName}
          </Text>
        </View>
      </View>
    </View>
  );
}
 
const styles = StyleSheet.create({
  matchCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity08,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
  },
  matchMetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerLow,
    paddingBottom: SPACING.base,
    marginBottom: SPACING.base,
  },
  metaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  matchMetaText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  scoreboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamCol: {
    flex: 2,
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  teamAvatar: {
    backgroundColor: COLORS.primaryOpacity10,
  },
  opponentAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  teamName: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    color: COLORS.onSurface,
    maxWidth: '100%',
  },
  scoreContainer: {
    flex: 3,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  resultBadge: {
    paddingHorizontal: SPACING.base,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  resultBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 9,
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontWeight: '800',
  },
  scoreText: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 20,
    color: COLORS.onSurface,
  },
});
