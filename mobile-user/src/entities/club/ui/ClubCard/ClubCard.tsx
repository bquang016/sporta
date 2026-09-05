import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Badge } from '../../../../shared/ui';
import { Club } from '../../model/clubStore';
import { getDefaultAvatar } from '../../model/clubDefaults';
import { getEloLevelLabel } from '../../../../shared/lib/utils/elo';

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

export const ClubCard = React.memo(({ club, onPress, style }: ClubCardProps) => {
  const memberRatio = Math.min(1, (club.members || 1) / (club.maxMembers || 30));
  const avatarUrl = getDefaultAvatar(club.sport, club.avatarImage);
  const remainingSlots = Math.max(0, (club.maxMembers || 30) - (club.members || 0));
  const elo = club.averageElo || club.elo || 1350;
  const levelLabel = club.levelLabel || getEloLevelLabel(elo);

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
              size={11}
              color="#064E3B"
            />
          </View>
        </View>

        {/* Right: Info */}
        <View style={styles.cardInfoCol}>
          {/* Header Row */}
          <View style={styles.titleRow}>
            <Text style={styles.clubName} numberOfLines={1}>
              {club.name}
            </Text>
            <Badge
              text={club.isPrivate ? 'Riêng tư' : 'Công khai'}
              variant={club.isPrivate ? 'warning' : 'success_flat'}
            />
          </View>

          {/* Key Metrics Row: Area + Elo Badge */}
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <MaterialIcons name="location-on" size={11} color="#64748B" />
              <Text style={styles.metaPillText} numberOfLines={1}>
                {club.area || 'Toàn quốc'}
              </Text>
            </View>

            <View style={styles.eloPill}>
              <Ionicons name="flash" size={9.5} color="#059669" />
              <Text style={styles.eloPillText} numberOfLines={1}>
                {elo} Elo • {levelLabel}
              </Text>
            </View>
          </View>

          {/* Description Preview if any */}
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
                    remainingSlots === 0 && { backgroundColor: '#EF4444' },
                  ]}
                />
              </View>
              <Text style={styles.memberCountText} numberOfLines={1}>
                {club.members}/{club.maxMembers} TV {remainingSlots > 0 ? `(Còn ${remainingSlots})` : '(Đã đủ)'}
              </Text>
            </View>

            <View style={styles.actionBtnBox}>
              <Text style={styles.actionBtnText}>Khám phá</Text>
              <MaterialIcons name="chevron-right" size={14} color="#064E3B" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  clubCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 9,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  sportBadgeSmall: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
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
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  metaPillText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  eloPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    gap: 2.5,
    flexShrink: 0,
  },
  eloPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
  },
  descText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  memberProgressWrapper: {
    flex: 1,
    gap: 2.5,
  },
  memberProgressBar: {
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    width: 90,
  },
  memberProgressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 2,
  },
  memberCountText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  actionBtnBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    flexShrink: 0,
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#064E3B',
  },
});
