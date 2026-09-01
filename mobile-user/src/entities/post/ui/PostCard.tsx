import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Post, ClubInfoData } from '../model/post.types';
import { MatchCardAttachment } from './MatchCardAttachment';
import { VenuePromoAttachment } from './VenuePromoAttachment';
import { VoucherPostAttachment } from '../../../features/voucher/ui/VoucherPostAttachment';
import { PostImageViewerModal } from './PostImageViewerModal';
import { PostMediaGrid } from './PostMediaGrid';
import { REACTION_MAP } from '../model/post.constants';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface PostCardProps {
  post: Post;
  renderLikeButton?: (post: Post) => React.ReactNode;
  onReactPost?: (postId: string, reaction: any) => void;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
  onUserPress?: (userId: string) => void;
  onClubPress?: (clubInfo: ClubInfoData) => void;
  onOptionPress?: (post: Post) => void;
  onJoinMatch?: (post: Post) => void;
  onLeaveMatch?: (post: Post) => void;
  onVenuePress?: (venueId?: string, venueName?: string) => void;
}

export const PostCard = React.memo(({
  post,
  renderLikeButton,
  onReactPost,
  onLikePress,
  onCommentPress,
  onSharePress,
  onUserPress,
  onClubPress,
  onOptionPress,
  onJoinMatch,
  onLeaveMatch,
  onVenuePress,
}: PostCardProps) => {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const totalReactions = post.reactionsCount
    ? Object.values(post.reactionsCount).reduce((sum, count) => sum + (count || 0), 0)
    : (post.likeCount || 0);

  const isMatchPost = post.type === 'MATCH_FINDING' || !!post.matchAttachment;
  const isPromoPost = post.type === 'VENUE_PROMO' || !!post.venuePromoAttachment;
  const isInternalClubPost =
    (post.audience === 'CLUB' || post.audience === 'CLUB_MEMBERS' || !!post.clubInfo) &&
    !!post.clubInfo &&
    !isMatchPost;

  return (
    <View style={[styles.cardContainer, post.isUploading && styles.cardUploading]}>
      {/* ── 0. Realtime Uploading Progress Bar Banner ── */}
      {post.isUploading ? (
        <View style={styles.uploadingProgressBanner}>
          <View style={styles.uploadingInfoRow}>
            <View style={styles.uploadingLeft}>
              {post.uploadProgress === 100 ? (
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              ) : (
                <ActivityIndicator size="small" color="#1877F2" />
              )}
              <Text style={[styles.uploadingText, post.uploadProgress === 100 && { color: '#10B981', fontWeight: '700' }]}>
                {post.uploadProgress === 100
                  ? 'Đã tải lên bài viết thành công!'
                  : `Đang tải lên bài viết... ${post.uploadProgress || 20}%`}
              </Text>
            </View>
            <Ionicons
              name={post.uploadProgress === 100 ? 'checkmark-done' : 'cloud-upload-outline'}
              size={16}
              color={post.uploadProgress === 100 ? '#10B981' : '#1877F2'}
            />
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(post.uploadProgress || 20, 100)}%` },
                post.uploadProgress === 100 && { backgroundColor: '#10B981' },
              ]}
            />
          </View>
        </View>
      ) : null}

      <View style={{ opacity: post.isUploading && post.uploadProgress !== 100 ? 0.65 : 1 }}>
      {/* ── 1. Post Header ── */}
      <View style={styles.header}>
        {/* Double Avatar (Facebook Group Style) if Post is internal to a Club */}
        {isInternalClubPost && post.clubInfo ? (
          <View style={styles.doubleAvatarContainer}>
            {/* Club Logo in Background */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onClubPress && onClubPress(post.clubInfo!)}
            >
              <Image 
                source={
                  (post.clubInfo.avatarUrl || (post.clubInfo as any).avatar || (post.clubInfo as any).avatarImage)
                    ? { uri: post.clubInfo.avatarUrl || (post.clubInfo as any).avatar || (post.clubInfo as any).avatarImage }
                    : require('../../../../assets/logo/club/699x699__1_-removebg-preview.png')
                } 
                style={styles.clubAvatar} 
              />
            </TouchableOpacity>

            {/* User Avatar Overlapping on Bottom-Right */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onUserPress && onUserPress(post.author.id)}
              style={styles.userOverlappingTouch}
            >
              <Image 
                source={post.author.avatar ? { uri: post.author.avatar } : require('../../../../assets/player/player_699x699.png')} 
                style={styles.userOverlappingAvatar} 
              />
            </TouchableOpacity>
          </View>
        ) : (
          /* Standard Single Avatar */
          <TouchableOpacity activeOpacity={0.8} onPress={() => onUserPress && onUserPress(post.author.id)}>
            <Image 
              source={post.author.avatar ? { uri: post.author.avatar } : require('../../../../assets/player/player_699x699.png')} 
              style={styles.singleAvatar} 
            />
          </TouchableOpacity>
        )}

        {/* User / Club Title Block */}
        <View style={styles.headerTextGroup}>
          {isInternalClubPost && post.clubInfo ? (
            /* Club Post Header: Author Name -> Club Name (Facebook Group Style) */
            <View style={styles.clubHeaderBlock}>
              <View style={styles.clubTitleRow}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => onUserPress && onUserPress(post.author.id)}>
                  <Text style={styles.authorTitleText} numberOfLines={1}>{post.author.name}</Text>
                </TouchableOpacity>

                <Ionicons name="caret-forward" size={12} color={COLORS.grayText} style={styles.clubTitleArrow} />

                <TouchableOpacity activeOpacity={0.8} onPress={() => onClubPress && onClubPress(post.clubInfo!)} style={{ flex: 1 }}>
                  <Text style={styles.clubTitleText} numberOfLines={1}>
                    {post.clubInfo.name}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.subAuthorRow}>
                <Text style={styles.timestampText}>{post.createdAt}</Text>
                <Text style={styles.dotSeparator}>•</Text>

                <View style={styles.clubAudienceBadge}>
                  <Ionicons name="shield-checkmark" size={11} color={COLORS.primary} />
                  <Text style={styles.clubAudienceBadgeText}>Nội bộ CLB</Text>
                </View>

                {post.sportName && !isMatchPost ? (
                  <View style={styles.sportTagBadge}>
                    <Ionicons name="trophy-outline" size={10} color={COLORS.primary} />
                    <Text style={styles.sportTagBadgeText}>{post.sportName}</Text>
                  </View>
                ) : null}

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
                  <Ionicons
                    name={post.audience === 'PUBLIC' ? 'earth' : 'shield-checkmark-outline'}
                    size={12}
                    color={post.audience === 'PUBLIC' ? COLORS.grayText : COLORS.primary}
                  />
                  <Text style={styles.publicAudienceBadgeText}>
                    {post.audience === 'PUBLIC' ? 'Công khai' : 'Nội bộ CLB'}
                  </Text>
                </View>

                {post.sportName && !isMatchPost ? (
                  <View style={styles.sportTagBadge}>
                    <Ionicons name="trophy-outline" size={10} color={COLORS.primary} />
                    <Text style={styles.sportTagBadgeText}>{post.sportName}</Text>
                  </View>
                ) : null}

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
      {/* ── 2. Caption Text / Gradient Background (Full Width Edge-to-Edge like Facebook) ── */}
      {post.backgroundGradient && post.backgroundGradient.length > 0 && (!post.mediaUrls || post.mediaUrls.length === 0) ? (
        <LinearGradient
          colors={post.backgroundGradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fullWidthGradientCard}
        >
          <Text
            style={[
              styles.gradientCardText,
              post.content.length > 100
                ? { fontSize: 17, lineHeight: 26 }
                : post.content.length > 40
                ? { fontSize: 21, lineHeight: 30 }
                : { fontSize: 28, lineHeight: 38 },
            ]}
          >
            {post.content}
          </Text>
        </LinearGradient>
      ) : (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{post.content}</Text>
        </View>
      )}

      {/* ── 3. Embedded Attachments (Attachment Component Architecture) ── */}
      {/* 3.1 Match Finding Attachment */}
      {isMatchPost ? (
        <MatchCardAttachment
          data={{
            matchRoomId: post.matchRoomId,
            clubId: post.clubInfo?.id,
            clubName: post.clubInfo?.name,
            clubAvatar: post.clubInfo?.avatarUrl,
            sportName: post.sportName || post.matchAttachment?.sportName,
            content: post.content,
            venueId: (post as any).venueId || post.venue?.id,
            venueName: post.venueName || post.venue?.name || post.matchAttachment?.venueName,
            venue: post.venue,
            timeSlot: post.timeSlot || post.matchAttachment?.timeSlot,
            playDate: post.playDate,
            startTime: post.startTime,
            endTime: post.endTime,
            targetLevel: post.targetLevel || post.matchAttachment?.level,
            totalPrice: post.totalPrice,
            memberFee: post.memberFee || post.matchAttachment?.pricePerSlot,
            memberFeeAmount: post.memberFeeAmount,
            note: post.note,
            slotsNeeded: post.slotsNeeded || post.matchAttachment?.slotsLeft,
            currentSlots: post.currentSlots,
            matchStatus: post.matchStatus,
            guestClubName: (post as any).guestClubName,
            guestClubAvatar: (post as any).guestClubAvatar,
            isJoined: post.isJoined,
          }}
          onClubPress={() => {
            if (onClubPress && post.clubInfo) {
              onClubPress(post.clubInfo);
            }
          }}
          onVenuePress={(venueId) => {
            if (onVenuePress) {
              onVenuePress(venueId || (post as any).venueId || post.venue?.id, post.venueName || post.venue?.name);
            }
          }}
          onJoinMatch={() => onJoinMatch && onJoinMatch(post)}
          onLeaveMatch={() => onLeaveMatch && onLeaveMatch(post)}
        />
      ) : null}

      {/* ── 4. Media Images Grid ── */}
      {post.mediaUrls && post.mediaUrls.length > 0 ? (
        <>
          <PostMediaGrid
            mediaUrls={post.mediaUrls}
            onPressImage={(index) => {
              setSelectedImageIndex(index);
              setViewerVisible(true);
            }}
          />
          <PostImageViewerModal
            visible={viewerVisible}
            post={post}
            initialIndex={selectedImageIndex}
            onClose={() => setViewerVisible(false)}
            onReact={(reaction) => {
              if (onReactPost) {
                onReactPost(post.id, reaction);
              } else if (onLikePress) {
                onLikePress();
              }
            }}
            onUserPress={(userId) => {
              setViewerVisible(false);
              setTimeout(() => {
                if (onUserPress) onUserPress(userId);
              }, 200);
            }}
            onOptionPress={(p) => {
              setViewerVisible(false);
              setTimeout(() => {
                if (onOptionPress) onOptionPress(p);
              }, 250);
            }}
            onComment={() => {
              // Comment added inside viewer - updates comment count
            }}
            onShare={() => {
              setViewerVisible(false);
              setTimeout(() => {
                if (onSharePress) onSharePress();
              }, 200);
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
            const reactionTypes: { key: string; count: number; icon: string; iconLib?: string; color: string }[] = Object.keys(REACTION_MAP).map(key => ({
              key,
              count: (post.reactionsCount as any)?.[key] || 0,
              icon: REACTION_MAP[key].iconName,
              iconLib: REACTION_MAP[key].iconLib,
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
                    {r.iconLib === 'materialCommunity' ? (
                      <MaterialCommunityIcons name={r.icon as any} size={11} color="#FFFFFF" />
                    ) : (
                      <Ionicons name={r.icon as any} size={10} color="#FFFFFF" />
                    )}
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

      {/* ── 6. Bottom Interaction Buttons Bar (Facebook Style) ── */}
      <View style={styles.actionsBar}>
        {renderLikeButton ? (
          renderLikeButton(post)
        ) : (
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={onLikePress}>
            <MaterialCommunityIcons
              name={post.userReaction || post.isLiked ? 'thumb-up' : 'thumb-up-outline'}
              size={19}
              color={post.userReaction || post.isLiked ? '#1877F2' : '#64748B'}
            />
            <Text
              style={[
                styles.actionButtonText,
                (post.userReaction || post.isLiked) && { color: '#1877F2', fontWeight: '700' },
              ]}
            >
              {post.userReaction || post.isLiked ? 'Đã thích' : 'Thích'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={onCommentPress}>
          <Ionicons
            name="chatbubble-outline"
            size={18}
            color="#64748B"
          />
          <Text style={styles.actionButtonText}>Bình luận</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7} onPress={onSharePress}>
          <Ionicons
            name="arrow-redo-outline"
            size={20}
            color="#64748B"
          />
          <Text style={styles.actionButtonText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>
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
  cardUploading: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  uploadingProgressBanner: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  uploadingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadingText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12.5,
    color: '#1E40AF',
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#DBEAFE',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1877F2',
    borderRadius: 2,
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
  clubTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  authorTitleText: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  clubTitleArrow: {
    marginHorizontal: 4,
  },
  clubTitleText: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
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
  sportTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.primaryOpacity08,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  sportTagBadgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 10,
    color: COLORS.primary,
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
  fullWidthGradientCard: {
    width: '100%',
    minHeight: 350,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  gradientCardText: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
});
