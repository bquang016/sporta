import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Badge } from '../../../../shared/ui';
import { Club } from '../../model/clubStore';
import { getDefaultAvatar } from '../../model/clubDefaults';

export interface ClubCardProps {
  club: Club;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const getSportIconName = (sportName?: string) => {
  switch (sportName?.toLowerCase()) {
    case 'bóng đá':
      return 'sports-soccer';
    case 'cầu lông':
      return 'sports-tennis';
    case 'pickleball':
      return 'sports-tennis';
    case 'bóng rổ':
      return 'sports-basketball';
    case 'tennis':
      return 'sports-baseball';
    default:
      return 'sports';
  }
};

export function ClubCard({ club, onPress, style }: ClubCardProps) {
  const memberRatio = Math.min(1, (club.members || 1) / (club.maxMembers || 30));
  const avatarUrl = getDefaultAvatar(club.sport, club.avatarImage);

  return (
    <TouchableOpacity
      style={[styles.clubCard, style]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={styles.cardMainRow}>
        {/* Left: Avatar */}
        <View style={styles.avatarWrapper}>
          <Image 
            source={typeof avatarUrl === 'string' ? { uri: avatarUrl } : avatarUrl} 
            style={styles.avatarImg} 
          />
          <View style={styles.sportBadgeSmall}>
            <MaterialIcons
              name={getSportIconName(club.sport) as any}
              size={12}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* Right: Info */}
        <View style={styles.cardInfoCol}>
          <View style={styles.titleRow}>
            <Text style={styles.clubName} numberOfLines={1}>
              {club.name}
            </Text>
            <Badge
              text={club.isPrivate ? 'Riêng tư' : 'Công khai'}
              variant={club.isPrivate ? 'warning' : 'success_flat'}
            />
          </View>

          {/* Area Row */}
          <View style={styles.areaRow}>
            <MaterialIcons name="location-on" size={13} color={COLORS.primary} />
            <Text style={styles.areaText} numberOfLines={1}>
              {club.area || 'Toàn quốc'}
            </Text>
          </View>

          {/* Description Preview */}
          {club.description ? (
            <Text style={styles.descText} numberOfLines={1}>
              {club.description}
            </Text>
          ) : null}

          {/* Members & Action Bar */}
          <View style={styles.footerRow}>
            <View style={styles.memberProgressWrapper}>
              <View style={styles.memberProgressBar}>
                <View
                  style={[
                    styles.memberProgressFill,
                    { width: `${Math.round(memberRatio * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.memberCountText}>
                {club.members}/{club.maxMembers} thành viên
              </Text>
            </View>

            <View style={styles.actionBtnBox}>
              <Text style={styles.actionBtnText}>Xem CLB</Text>
              <MaterialIcons name="chevron-right" size={16} color={COLORS.primary} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  clubCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sportBadgeSmall: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  cardInfoCol: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  clubName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15.5,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  areaText: {
    fontSize: 11.5,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  descText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  memberProgressWrapper: {
    flex: 1,
    gap: 3,
  },
  memberProgressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    width: 100,
  },
  memberProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  memberCountText: {
    fontSize: 10.5,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
  actionBtnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
});
