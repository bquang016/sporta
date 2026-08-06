import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Post, ClubInfoData, REACTION_MAP } from '../model/post.types';
import { MatchCardAttachment } from './MatchCardAttachment';
import { VenuePromoAttachment } from './VenuePromoAttachment';
import { PostImageViewerModal } from './PostImageViewerModal';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface PostCardProps {
  post: Post;
  renderLikeButton?: (post: Post) => React.ReactNode;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  onUserPress?: (userId: string) => void;
  onClubPress?: (clubInfo: ClubInfoData) => void;
  onOptionPress?: (post: Post) => void;
}

export const PostCard = React.memo(({
  post,
  renderLikeButton,
  onLikePress,
  onCommentPress,
  onSharePress,
  onUserPress,
  onClubPress,
  onOptionPress,
}: PostCardProps) => {
  const [viewerVisible, setViewerVisible] = useState(false);
  const totalReactions = post.reactionsCount
    ? Object.values(post.reactionsCount).reduce((sum, count) => sum + (count || 0), 0)
    : (post.likeCount || post.likeCount || 0);

  return (
    <View style={styles.cardContainer}>
      {/* ── 1. Post Header ── */}
      <View style={styles.header}>
        {/* Double Avatar (Facebook Group Style) if Post belongs to a Club */}
        {post.clubInfo ? (
          <View style={styles.doubleAvatarContainer}>
            {/* Club Logo in Background */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onClubPress && onClubPress(post.clubInfo!)}
            >
              <Image source={{ uri: post.clubInfo.avatarUrl }} style={styles.clubAvatar} />
            </TouchableOpacity>

            {/* User Avatar Overlapping on Bottom-Right */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onUserPress && onUserPress(post.author.id)}
              style={styles.userOverlappingTouch}
            >
              <Image source={{ uri: post.author.avatar }} style={styles.userOverlappingAvatar} />
            </TouchableOpacity>
          </View>
        ) : (
          /* Standard Single Avatar */
          <TouchableOpacity activeOpacity={0.8} onPress={() => onUserPress && onUserPress(post.author.id)}>
            <Image source={{ uri: post.author.avatar }} style={styles.singleAvatar} />
          </TouchableOpacity>
        )}

        {/* User / Club Title Block */}
        <View style={styles.headerTextGroup}>
          {post.clubInfo ? (
            /* Club Post Header: Club Name on TOP, Author Name BELOW */
            <View style={styles.clubHeaderBlock}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onClubPress && onClubPress(post.clubInfo!)}
              >
                <Text style={styles.clubTitleText} numberOfLines={1}>
                  {post.clubInfo.name}
                </Text>
              </TouchableOpacity>

              <View style={styles.subAuthorRow}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => onUserPress && onUserPress(post.author.id)}>
                  <Text style={styles.authorSubText}>{post.author.name}</Text>
                </TouchableOpacity>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.timestampText}>{post.createdAt}</Text>
                <Text style={styles.dotSeparator}>•</Text>

                {post.audience === 'CLUB_MEMBERS' ? (
                  <View style={styles.clubAudienceBadge}>
                    <Ionicons name="shield-checkmark" size={11} color={COLORS.primary} />
                    <Text style={styles.clubAudienceBadgeText}>Nội bộ CLB</Text>
                  </View>
                ) : (
                  <View style={styles.publicAudienceBadge}>
                    <Ionicons name="earth" size={11} color={COLORS.grayText} />
                    <Text style={styles.publicAudienceBadgeText}>Công khai</Text>
                  </View>
                )}

                {post.isPinned && (
                  <View style={styles.pinnedBadge}>
                    <Ionicons name="pin" size={10} color={COLORS.secondary} />
                    <Text style={styles.pinnedBadgeText}>Đã ghim</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            /* Standard User Post Header */
            <View style={styles.standardHeaderBlock}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => onUserPress && onUserPress(post.author.id)}>
                <Text style={styles.authorName}>{post.author.name}</Text>
              </TouchableOpacity>

              <View style={styles.metaRow}>
                <Text style={styles.timestampText}>{post.createdAt}</Text>
                <Text style={styles.dotSeparator}>•</Text>
                <View style={styles.publicAudienceBadge}>
                  <Ionicons name="earth" size={12} color={COLORS.grayText} />
                  <Text style={styles.publicAudienceBadgeText}>Công khai</Text>
                </View>
                {post.isPinned && (
                  <View style={styles.pinnedBadge}>
                    <Ionicons name="pin" size={11} color={COLORS.secondary} />
                    <Text style={styles.pinnedBadgeText}>Đã ghim</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* 3-Dots Menu Button */}
        <TouchableOpacity
          style={styles.moreButton}
          activeOpacity={0.7}
          onPress={() => onOptionPress && onOptionPress(post)}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* ── 2. Caption Text ── */}
      <View style={styles.captionContainer}>
        <Text style={styles.captionText}>{post.content}</Text>
      </View>

      {/* ── 3. Embedded Attachments (Attachment Component Architecture) ── */}
      {/* 3.1 Match Finding Attachment */}
      {post.matchAttachment ? (
        <MatchCardAttachment data={post.matchAttachment} />
      ) : null}

      {/* 3.2 Venue Promo Attachment */}
      {post.venuePromoAttachment ? (
        <VenuePromoAttachment data={post.venuePromoAttachment} />
      ) : null}

      {/* ── 4. Media Images ── */}
      {post.mediaUrls && post.mediaUrls.length > 0 ? (
        <>
          <TouchableOpacity activeOpacity={0.9} onPress={() => setViewerVisible(true)}>
            <View style={styles.mediaContainer}>
              <Image source={{ uri: post.mediaUrls[0] }} style={styles.mediaImage} />
            </View>
          </TouchableOpacity>
          <PostImageViewerModal
            visible={viewerVisible}
            post={post}
            initialIndex={0}
            onClose={() => setViewerVisible(false)}
            onReact={onLikePress ? () => onLikePress() : undefined}
            onOptionPress={onOptionPress}
            onComment={() => {
              setViewerVisible(false);
              setTimeout(() => {
                if (onCommentPress) onCommentPress();
              }, 300);
            }}
          />
        </>
      ) : null}

      {/* ── 5. Reaction & Comment Statistics Bar ── */}
      <View style={styles.statsBar}>
        <View style={styles.reactionsCountRow}>
          {totalReactions > 0 && (() => {
            // Facebook-pattern: only show reaction icons that have count > 0,
            // sorted by count descending, max 3 icons
            const reactionTypes: { key: string; count: number; icon: string; color: string }[] = Object.keys(REACTION_MAP).map(key => ({
              key,
              count: (post.reactionsCount as any)?.[key] || 0,
              icon: REACTION_MAP[key].iconName,
              color: REACTION_MAP[key].color,
            }));
            const activeReactions = reactionTypes
              .filter((r) => r.count > 0)
              .sort((a, b) => b.count - a.count)
              .slice(0, 3);

            return (
              <View style={styles.stackedIconsRow}>
                {activeReactions.map((r, idx) => (
                  <View
                    key={r.key}
                    style={[
                      styles.iconCircleBadge,
                      { backgroundColor: r.color },
                      idx > 0 && { marginLeft: -4 },
                    ]}
                  >
                    <Ionicons name={r.icon as any} size={10} color="#FFFFFF" />
                  </View>
                ))}
              </View>
            );
          })()}
          <Text style={styles.statsText}>{totalReactions > 0 ? totalReactions : ''}</Text>
        </View>

        <View style={styles.commentsCountRow}>
          <Text style={styles.statsText}>{post.commentsCount} bình luận</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.statsText}>{post.sharesCount} chia sẻ</Text>
        </View>
      </View>

      {/* ── 6. Bottom Interaction Buttons Bar ── */}
      <View style={styles.actionsBar}>
        {renderLikeButton ? (
          renderLikeButton(post)
        ) : (
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={onLikePress}>
            <Ionicons
              name={post.userReaction ? 'thumbs-up' : 'thumbs-up-outline'}
              size={19}
              color={post.userReaction ? COLORS.primary : COLORS.onSurfaceVariant}
            />
            <Text
              style={[
                styles.actionButtonText,
                post.userReaction && { color: COLORS.primary, fontWeight: '700' },
              ]}
            >
              {post.userReaction ? 'Đã thích' : 'Thích'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={onCommentPress}>
          <MaterialCommunityIcons
            name="comment-outline"
            size={19}
            color={COLORS.onSurfaceVariant}
          />
          <Text style={styles.actionButtonText}>Bình luận</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={onSharePress}>
          <MaterialCommunityIcons
            name="share-outline"
            size={21}
            color={COLORS.onSurfaceVariant}
          />
          <Text style={styles.actionButtonText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.xs,
    paddingTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    marginBottom: SPACING.xs,
  },
  singleAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surfaceDim,
  },

  // Double Avatar (Facebook Group Style)
  doubleAvatarContainer: {
    position: 'relative',
    width: 44,
    height: 44,
  },
  clubAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceDim,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
  },
  userOverlappingTouch: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  userOverlappingAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.surfaceDim,
  },

  headerTextGroup: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  clubHeaderBlock: {
    justifyContent: 'center',
  },
  clubTitleText: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
    lineHeight: 20,
  },
  subAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
    gap: 4,
  },
  authorSubText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  standardHeaderBlock: {
    justifyContent: 'center',
  },
  authorName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  timestampText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
  dotSeparator: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
  clubAudienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  clubAudienceBadgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 10,
    color: COLORS.primary,
  },
  publicAudienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  publicAudienceBadgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  pinnedBadgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 10,
    color: '#B45309',
  },
  moreButton: {
    padding: 6,
  },
  captionContainer: {
    paddingHorizontal: SPACING.marginMobile,
    marginBottom: SPACING.xs,
  },
  captionText: {
    ...TYPOGRAPHY.bodyLg,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.onSurface,
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: COLORS.surfaceDim,
    marginVertical: SPACING.xs,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainerHigh,
  },
  reactionsCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stackedIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircleBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  commentsCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.grayText,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.background,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  actionButtonText: {
    ...TYPOGRAPHY.labelMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: '600',
  },
});
