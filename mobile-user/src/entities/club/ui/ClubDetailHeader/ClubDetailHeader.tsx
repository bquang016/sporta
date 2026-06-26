import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Avatar, Badge } from '../../../../shared/ui';
import { Club } from '../../model/clubStore';

export interface ClubDetailHeaderProps {
  club: Club;
  hideMembersMeta?: boolean;
}

export function ClubDetailHeader({ club, hideMembersMeta = false }: ClubDetailHeaderProps) {
  return (
    <View style={styles.container}>
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
        {/* Badges row */}
        <View style={styles.badgesRow}>
          <Badge text={club.sport} variant="success" />
          <Badge 
            text={club.isPrivate ? 'Riêng tư' : 'Công khai'} 
            variant={club.isPrivate ? 'warning' : 'info'} 
          />
          <Badge text={club.activityLevel || 'Mới thành lập'} variant="default" />
        </View>

        {/* Location & Members Details */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <MaterialIcons 
              name="location-on" 
              size={16} 
              color={COLORS.primary} 
            />
            <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
              {club.area || 'Chưa cập nhật khu vực'}
            </Text>
          </View>
          
          {!hideMembersMeta && (
            <>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <MaterialIcons 
                  name="people" 
                  size={16} 
                  color={COLORS.primary} 
                />
                <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
                  {club.members}/{club.maxMembers} thành viên
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
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
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.base,
    marginBottom: SPACING.md,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.default,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity08,
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    flex: 1,
  },
  metaText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.primaryOpacity15,
    marginHorizontal: SPACING.sm,
  },
});
