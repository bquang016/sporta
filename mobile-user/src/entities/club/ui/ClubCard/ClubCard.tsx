import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Avatar, Card, Badge } from '../../../../shared/ui';
import { Club } from '../../model/clubStore';

export interface ClubCardProps {
  club: Club;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ClubCard({ club, onPress, style }: ClubCardProps) {
  return (
    <Card 
      variant="default" 
      style={[styles.clubCard, style]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Avatar 
          size="lg" 
          source={club.avatarImage} 
          fallbackIcon={club.sportIcon as any} 
          style={styles.avatar} 
        />
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
            <MaterialIcons name="chevron-right" size={20} color={COLORS.outline} />
          </View>
          
          {/* Row with sport and members */}
          <View style={styles.infoRow}>
            <Badge text={club.sport} variant="success_flat" style={styles.sportBadge} />
            <View style={styles.memberBadge}>
              <MaterialIcons 
                name="people" 
                size={14} 
                color={COLORS.primary} 
                style={styles.memberIcon} 
              />
              <Text style={styles.infoText}>
                {club.members}/{club.maxMembers}
              </Text>
            </View>
            {club.averageElo && (
              <View style={styles.eloBadge}>
                <MaterialIcons 
                  name="star" 
                  size={14} 
                  color={COLORS.brandGold} 
                  style={styles.eloIcon} 
                />
                <Text style={styles.infoText}>
                  Elo: {club.averageElo}
                </Text>
              </View>
            )}
          </View>

          {/* Row with Area */}
          <View style={styles.areaRow}>
            <MaterialIcons 
              name="location-on" 
              size={14} 
              color={COLORS.primary} 
              style={styles.locationIcon} 
            />
            <Text style={styles.areaText} numberOfLines={1}>
              {club.area || 'Chưa cập nhật khu vực'}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  clubCard: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg, // 16px standard container radius
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    gap: SPACING.base,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: COLORS.primaryOpacity10,
    borderWidth: 2,
    borderColor: COLORS.primaryOpacity15,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  clubName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '700',
    color: COLORS.onSurface,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    marginTop: 2,
  },
  sportBadge: {},
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.base,
    paddingVertical: 2,
  },
  memberIcon: {
    marginRight: -2,
  },
  eloBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondaryOpacity10,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.base,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.secondaryOpacity20,
  },
  eloIcon: {
    marginRight: -2,
  },
  infoText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 2,
  },
  locationIcon: {
    marginRight: -2,
  },
  areaText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
});
