import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Avatar, Badge } from '../../../../shared/ui';
import { Club } from '../../model/clubStore';
import { getDefaultCover, getDefaultAvatar } from '../../model/clubDefaults';

export interface ClubDetailHeaderProps {
  club: Club;
  hideMembersMeta?: boolean;
  isLeadership?: boolean;
  userRole?: string;
  onEditPress?: () => void;
  showDescription?: boolean;
}

export function ClubDetailHeader({ 
  club, 
  hideMembersMeta = false,
  isLeadership = false,
  userRole,
  onEditPress,
  showDescription = true,
}: ClubDetailHeaderProps) {
  // Determine displayed role
  const displayRole = userRole || (isLeadership ? 'Trưởng câu lạc bộ' : (club.userStatus === 'SUB_LEADER' ? 'Phó câu lạc bộ' : 'Thành viên'));

  const coverUrl = getDefaultCover(club.sport, club.coverImage);
  const avatarUrl = getDefaultAvatar(club.sport, club.avatarImage);

  return (
    <View style={styles.container}>
      {/* Cover Photo with Gradient Overlay */}
      <View style={styles.coverContainer}>
        <Image source={{ uri: coverUrl }} style={styles.coverImage} />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={styles.coverGradient}
        />

        {/* Top Right Floating Edit Button for Leader */}
        {isLeadership && onEditPress && (
          <TouchableOpacity 
            style={styles.floatingEditBtn}
            activeOpacity={0.85}
            onPress={onEditPress}
          >
            <MaterialIcons name="edit" size={15} color={COLORS.white} />
            <Text style={styles.floatingEditText}>Sửa thông tin</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Profile Info Card */}
      <View style={styles.profileSection}>
        {/* Avatar Row */}
        <View style={styles.avatarRow}>
          <View style={styles.avatarWrapper}>
            <Avatar 
              size={84} 
              source={avatarUrl} 
              fallbackIcon={club.sportIcon as any}
              style={styles.avatar}
            />
          </View>

          {/* Quick Role & Sport Badge */}
          <View style={styles.roleContainer}>
            {isLeadership ? (
              <View style={[styles.roleBadge, styles.roleBadgeLeader]}>
                <MaterialIcons name="stars" size={14} color="#b45309" />
                <Text style={[styles.roleBadgeText, styles.roleBadgeTextLeader]}>
                  Trưởng câu lạc bộ
                </Text>
              </View>
            ) : displayRole === 'Phó câu lạc bộ' ? (
              <View style={[styles.roleBadge, styles.roleBadgeSubLeader]}>
                <MaterialIcons name="verified" size={14} color="#0369a1" />
                <Text style={[styles.roleBadgeText, styles.roleBadgeTextSubLeader]}>
                  Phó câu lạc bộ
                </Text>
              </View>
            ) : (
              <View style={[styles.roleBadge, styles.roleBadgeMember]}>
                <MaterialIcons name="person" size={14} color={COLORS.onSurfaceVariant} />
                <Text style={[styles.roleBadgeText, styles.roleBadgeTextMember]}>
                  Thành viên
                </Text>
              </View>
            )}

            <View style={styles.tagsRow}>
              <Badge text={club.sport} variant="success" />
              <Badge 
                text={club.isPrivate ? 'Riêng tư' : 'Công khai'} 
                variant={club.isPrivate ? 'warning' : 'info'} 
              />
            </View>
          </View>
        </View>

        {/* Club Name */}
        <View style={styles.titleSection}>
          <Text style={styles.clubName}>{club.name}</Text>
        </View>

        {/* 3-Column Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <MaterialIcons name="people" size={18} color={COLORS.primary} />
            <Text style={styles.statValue}>
              {club.members}/{club.maxMembers}
            </Text>
            <Text style={styles.statLabel}>Thành viên</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <MaterialIcons name="military-tech" size={18} color="#D97706" />
            <Text style={styles.statValue}>
              {club.averageElo || 1200}
            </Text>
            <Text style={styles.statLabel}>Elo trung bình</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <MaterialIcons name="location-on" size={18} color={COLORS.primary} />
            <Text style={styles.statValue} numberOfLines={1} ellipsizeMode="tail">
              {club.area ? club.area.split(',')[0] : 'Toàn quốc'}
            </Text>
            <Text style={styles.statLabel}>Khu vực</Text>
          </View>
        </View>

        {/* Description Card */}
        {showDescription && (
          <View style={styles.bioCard}>
            <View style={styles.bioHeaderRow}>
              <View style={styles.bioTitleRow}>
                <MaterialIcons name="article" size={18} color={COLORS.primary} />
                <Text style={styles.bioSectionTitle}>Giới thiệu câu lạc bộ</Text>
              </View>
              {isLeadership && onEditPress && (
                <TouchableOpacity 
                  style={styles.inlineEditBtn} 
                  activeOpacity={0.7}
                  onPress={onEditPress}
                >
                  <MaterialIcons name="edit" size={13} color={COLORS.primary} />
                  <Text style={styles.inlineEditText}>Chỉnh sửa</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.descriptionText}>
              {club.description || 'Chưa có mô tả chi tiết cho câu lạc bộ này.'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  coverContainer: {
    height: 190,
    width: '100%',
    position: 'relative',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  floatingEditBtn: {
    position: 'absolute',
    top: 14,
    right: SPACING.marginMobile,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingEditText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  profileSection: {
    paddingHorizontal: SPACING.marginMobile,
    marginTop: -44,
    zIndex: 10,
    gap: SPACING.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  avatarWrapper: {
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  avatar: {
    borderWidth: 3.5,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.surfaceContainer,
  },
  roleContainer: {
    flex: 1,
    alignItems: 'flex-end',
    gap: SPACING.xs + 2,
    paddingBottom: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  roleBadgeLeader: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  roleBadgeSubLeader: {
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  roleBadgeMember: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  roleBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '700',
  },
  roleBadgeTextLeader: {
    color: '#b45309',
  },
  roleBadgeTextSubLeader: {
    color: '#0369a1',
  },
  roleBadgeTextMember: {
    color: COLORS.onSurfaceVariant,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  titleSection: {
    marginTop: 2,
  },
  clubName: {
    ...TYPOGRAPHY.headlineLgMobile,
    fontSize: 22,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: COLORS.onSurface,
    lineHeight: 28,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  statLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.outlineVariant,
  },
  bioCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity10,
    gap: SPACING.xs,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bioHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  bioTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  bioSectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  inlineEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryOpacity10,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    gap: 3,
  },
  inlineEditText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  descriptionText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
  },
});
