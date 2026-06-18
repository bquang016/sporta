import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { Avatar, Badge, Button } from '../../../shared/ui';

export interface Match {
  id: string;
  title: string;
  time: string;
  elo: string;
  sportIcon: any; // Can map to any material icons
  joinedCount: number;
  maxCount: number;
  statusText: string;
  statusType: 'active' | 'full';
  eloType: 'gold' | 'silver';
}

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
  onJoinPress?: () => void;
}

export function MatchCard({ match, onPress, onJoinPress }: MatchCardProps) {
  const isFull = match.statusType === 'full';
  const progress = (match.joinedCount / match.maxCount) * 100;
  
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={match.sportIcon} size={24} color={COLORS.primary} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {match.title}
          </Text>
          <View style={styles.timeContainer}>
            <MaterialIcons name="schedule" size={16} color={COLORS.outline} />
            <Text style={styles.timeText}>{match.time}</Text>
          </View>
        </View>
        <Badge 
          text={`ELO: ${match.elo}`}
          variant={isFull ? 'full' : (match.eloType === 'gold' ? 'gold' : 'silver')}
          size="sm"
        />
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressText}>{match.joinedCount}/{match.maxCount} người tham gia</Text>
          <Text style={[styles.slotsText, isFull ? styles.slotsFull : styles.slotsAvailable]}>
            {match.statusText}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[
            styles.progressBarFill, 
            { width: `${progress}%` }, 
            isFull && { backgroundColor: COLORS.outline }
          ]} />
        </View>
      </View>
      
      <View style={[styles.footerRow, isFull && styles.footerOpacity]}>
        <View style={styles.avatarsContainer}>
          <Avatar size={32} style={[styles.avatar, { backgroundColor: '#CBD5E1', zIndex: 4 }]} />
          <Avatar size={32} style={[styles.avatar, { backgroundColor: '#94A3B8', zIndex: 3 }]} />
          <Avatar size={32} style={[styles.avatar, { backgroundColor: '#64748B', zIndex: 2 }]} />
          <Avatar 
            size={32} 
            text={`+${match.joinedCount - 3 > 0 ? match.joinedCount - 3 : 1}`} 
            style={[styles.avatar, styles.moreAvatar, { zIndex: 1 }]}
            textStyle={styles.moreAvatarText}
          />
        </View>
        <Button 
          variant="primary"
          size="sm"
          title={isFull ? 'Đã đầy' : 'Tham gia ngay'}
          disabled={isFull}
          onPress={onJoinPress}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg, // 16px radius for large cards
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: 'rgba(6, 78, 59, 0.1)', // Green at 10%
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: TYPOGRAPHY.headlineMd.fontWeight,
    fontSize: 16,
    color: COLORS.onSurface,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 14,
    color: COLORS.outline,
  },
  progressSection: {
    marginBottom: SPACING.md,
    gap: SPACING.base,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontWeight: TYPOGRAPHY.labelSm.fontWeight,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  slotsText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontWeight: TYPOGRAPHY.labelSm.fontWeight,
    fontSize: 12,
  },
  slotsAvailable: {
    color: COLORS.primary,
  },
  slotsFull: {
    color: COLORS.error,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerOpacity: {
    opacity: 0.6,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.surface,
    marginRight: -8,
  },
  moreAvatar: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
  },
  moreAvatarText: {
    color: COLORS.onPrimary,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontWeight: TYPOGRAPHY.labelSm.fontWeight,
    fontSize: 10,
  },
});
