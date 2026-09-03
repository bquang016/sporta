import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Club } from '../../model/clubStore';
import { getSafeCoverSource, getSafeAvatarSource } from '../../model/clubDefaults';

export interface ClubDetailHeaderProps {
  club: Club;
  isLeadership?: boolean;
  userRole?: string;
}

export function ClubDetailHeader({ 
  club, 
  userRole = 'Thành viên',
}: ClubDetailHeaderProps) {
  const isLeader = userRole === 'Trưởng câu lạc bộ' || userRole === 'ADMIN';
  const isSubLeader = userRole === 'Phó câu lạc bộ' || userRole === 'SUB_LEADER';

  return (
    <View style={styles.container}>
      {/* Cover Image with gradient overlay */}
      <View style={styles.coverWrapper}>
        <Image 
          source={getSafeCoverSource(club.sport, club.coverImage)} 
          style={styles.coverImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.45)']}
          style={styles.coverGradient}
        />
        
        {/* Sport badge in bottom corner of cover */}
        <View style={styles.sportBadgeCover}>
          <FontAwesome5 name="futbol" size={12} color="#FFFFFF" />
          <Text style={styles.sportBadgeCoverText}>{club.sport || 'Bóng đá'}</Text>
        </View>
      </View>

      {/* Main Profile Info Header */}
      <View style={styles.infoSection}>
        {/* Avatar with clean online ring */}
        <View style={styles.avatarRow}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={getSafeAvatarSource(club.sport, club.avatarImage)} 
              style={styles.avatarImage} 
            />
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
            </View>
          </View>

          {/* User's role in this club pill */}
          <View style={[
            styles.userRoleBadge,
            isLeader && styles.userRoleBadgeLeader,
            isSubLeader && styles.userRoleBadgeSubLeader
          ]}>
            <Ionicons 
              name={isLeader ? "shield-checkmark" : (isSubLeader ? "ribbon" : "person")} 
              size={12} 
              color={isLeader ? "#B45309" : (isSubLeader ? "#0369A1" : "#475569")} 
            />
            <Text style={[
              styles.userRoleText,
              isLeader && styles.userRoleTextLeader,
              isSubLeader && styles.userRoleTextSubLeader
            ]}>
              {userRole}
            </Text>
          </View>
        </View>

        {/* Club Name */}
        <Text style={styles.clubName} numberOfLines={2}>
          {club.name}
        </Text>

        {/* Badges metadata row */}
        <View style={styles.badgesRow}>
          {/* Privacy Badge */}
          <View style={[
            styles.tagBadge, 
            club.isPrivate ? styles.tagBadgePrivate : styles.tagBadgePublic
          ]}>
            <Ionicons 
              name={club.isPrivate ? "lock-closed" : "globe-outline"} 
              size={11} 
              color={club.isPrivate ? "#DC2626" : "#059669"} 
            />
            <Text style={[
              styles.tagBadgeText,
              club.isPrivate ? styles.tagBadgeTextPrivate : styles.tagBadgeTextPublic
            ]}>
              {club.isPrivate ? 'Riêng tư' : 'Công khai'}
            </Text>
          </View>

          {/* Activity Level Badge */}
          <View style={[styles.tagBadge, styles.tagBadgeActivity]}>
            <Ionicons name="time-outline" size={11} color="#D97706" />
            <Text style={[styles.tagBadgeText, { color: '#B45309' }]}>
              {club.activityLevel || 'Hàng tuần'}
            </Text>
          </View>

          {/* Area Location Badge */}
          <View style={[styles.tagBadge, styles.tagBadgeLocation]}>
            <Ionicons name="location-outline" size={11} color="#64748B" />
            <Text style={[styles.tagBadgeText, { color: '#475569' }]} numberOfLines={1}>
              {club.area || 'Toàn quốc'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  coverWrapper: {
    width: '100%',
    height: 120,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  sportBadgeCover: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sportBadgeCoverText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: -32,
    marginBottom: 8,
  },
  avatarWrapper: {
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  onlineBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  userRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userRoleBadgeLeader: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  userRoleBadgeSubLeader: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },
  userRoleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  userRoleTextLeader: {
    color: '#B45309',
  },
  userRoleTextSubLeader: {
    color: '#0369A1',
  },
  clubName: {
    ...TYPOGRAPHY.headlineMd,
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagBadgePublic: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  tagBadgePrivate: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  tagBadgeActivity: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  tagBadgeLocation: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    maxWidth: 160,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagBadgeTextPublic: {
    color: '#059669',
  },
  tagBadgeTextPrivate: {
    color: '#DC2626',
  },
});
