import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Avatar, Badge } from '../../../../shared/ui';
import { Club } from '../../model/clubStore';

export interface ClubDetailHeaderProps {
  club: Club;
  hideMembersMeta?: boolean;
  isLeadership?: boolean;
  onEditPress?: () => void;
  showDescription?: boolean;
  defaultExpanded?: boolean;
}

export function ClubDetailHeader({ 
  club, 
  hideMembersMeta = false,
  isLeadership = false,
  onEditPress,
  showDescription = true,
  defaultExpanded = false,
}: ClubDetailHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.container}>
      {/* Cover Photo */}
      <View style={styles.coverContainer}>
        {club.coverImage && typeof club.coverImage === 'string' && !club.coverImage.startsWith('blob:') ? (
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

      {/* Dropdown Accordion Section */}
      <View style={styles.infoSection}>
        {/* Accordion Toggle Header */}
        <TouchableOpacity 
          style={[styles.accordionHeader, isExpanded && styles.accordionHeaderExpanded]}
          activeOpacity={0.8}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <View style={styles.accordionTitleRow}>
            <MaterialIcons name="info-outline" size={20} color={COLORS.primary} />
            <Text style={styles.accordionTitle}>Thông tin chi tiết câu lạc bộ</Text>
          </View>
          <View style={styles.accordionRightRow}>
            <Text style={styles.accordionHintText}>
              {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
            </Text>
            <MaterialIcons 
              name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={22} 
              color={COLORS.primary} 
            />
          </View>
        </TouchableOpacity>

        {/* Collapsible Content */}
        {isExpanded && (
          <View style={styles.accordionContent}>
            {/* Badges row + Sửa thông tin button */}
            <View style={styles.badgesHeaderRow}>
              <View style={styles.badgesRow}>
                <Badge text={club.sport} variant="success" />
                <Badge 
                  text={club.isPrivate ? 'Riêng tư' : 'Công khai'} 
                  variant={club.isPrivate ? 'warning' : 'info'} 
                />
                <Badge text={club.activityLevel || 'Mới thành lập'} variant="default" />
              </View>

              {isLeadership && onEditPress && (
                <TouchableOpacity 
                  style={styles.editBioBtn} 
                  activeOpacity={0.7}
                  onPress={onEditPress}
                >
                  <MaterialIcons name="edit" size={14} color={COLORS.primary} />
                  <Text style={styles.editBioText}>Sửa thông tin</Text>
                </TouchableOpacity>
              )}
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

            {/* Description Card */}
            {showDescription && (
              <View style={styles.bioCard}>
                <View style={styles.bioHeaderRow}>
                  <Text style={styles.bioSectionTitle}>Giới thiệu câu lạc bộ</Text>
                </View>
                <Text style={styles.descriptionText}>
                  {club.description || 'Không có mô tả chi tiết cho câu lạc bộ này.'}
                </Text>
              </View>
            )}
          </View>
        )}
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
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: SPACING.xs,
  },
  accordionHeaderExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    borderColor: COLORS.primaryOpacity15,
    backgroundColor: COLORS.primaryOpacity05 || COLORS.surface,
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    flex: 1,
  },
  accordionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  accordionRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accordionHintText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  accordionContent: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: COLORS.primaryOpacity15,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  badgesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.base,
    flex: 1,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow || COLORS.background,
    borderRadius: BORDER_RADIUS.default,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
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
    backgroundColor: COLORS.outlineVariant,
    marginHorizontal: SPACING.sm,
  },
  bioCard: {
    backgroundColor: COLORS.primaryOpacity05,
    borderRadius: BORDER_RADIUS.default,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryOpacity15,
  },
  bioHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  bioSectionTitle: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  editBioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs + 4,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryOpacity15,
    gap: 3,
  },
  editBioText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  descriptionText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    lineHeight: 19,
  },
});
