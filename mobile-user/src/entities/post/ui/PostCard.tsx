import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Post } from '../model/post.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Custom Reaction Mappings with signature colors & Ionicons names
export const REACTION_MAP = {
  like: { iconName: 'thumbs-up' as const, label: 'Thích', color: '#064E3B' },
  love: { iconName: 'heart' as const, label: 'Yêu thích', color: '#EF4444' },
  fire: { iconName: 'flame' as const, label: 'Nhiệt', color: '#F97316' },
  muscle: { iconName: 'flash' as const, label: 'Sung sức', color: '#EAB308' },
  trophy: { iconName: 'trophy' as const, label: 'Đẳng cấp', color: '#10B981' },
};

interface PostCardProps {
  post: Post;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onTicketPress?: () => void;
  onJoinMatchPress?: () => void;
  onSelectReaction?: (reaction: 'like' | 'love' | 'fire' | 'muscle' | 'trophy' | null) => void;
  // Let the parent render the custom animated Like button triggers
  renderLikeButton?: (post: Post) => React.ReactNode;
}

export const PostCard = React.memo(({
  post,
  onLikePress,
  onCommentPress,
  onTicketPress,
  onJoinMatchPress,
  onSelectReaction,
  renderLikeButton,
}: PostCardProps) => {
  const isOwner = post.author.role === 'owner';
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  // Helper to format creation time
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  // Collage Layout Renderer
  const renderCollage = () => {
    const images = post.imageUrls;
    const count = images.length;
    if (count === 0) return null;

    if (count === 1) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setActiveImageIndex(0)}
          style={styles.collageSingleWrapper}
        >
          <Image source={{ uri: images[0] }} style={styles.mediaImageSingle} />
        </TouchableOpacity>
      );
    }

    if (count === 2) {
      return (
        <View style={styles.collageTwo}>
          <TouchableOpacity
            style={styles.collageTwoItem}
            activeOpacity={0.9}
            onPress={() => setActiveImageIndex(0)}
          >
            <Image source={{ uri: images[0] }} style={styles.collageImage} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.collageTwoItem}
            activeOpacity={0.9}
            onPress={() => setActiveImageIndex(1)}
          >
            <Image source={{ uri: images[1] }} style={styles.collageImage} />
          </TouchableOpacity>
        </View>
      );
    }

    if (count === 3) {
      return (
        <View style={styles.collageThree}>
          <TouchableOpacity
            style={styles.collageThreeLeft}
            activeOpacity={0.9}
            onPress={() => setActiveImageIndex(0)}
          >
            <Image source={{ uri: images[0] }} style={styles.collageImage} />
          </TouchableOpacity>
          <View style={styles.collageThreeRight}>
            <TouchableOpacity
              style={styles.collageThreeRightItem}
              activeOpacity={0.9}
              onPress={() => setActiveImageIndex(1)}
            >
              <Image source={{ uri: images[1] }} style={styles.collageImage} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.collageThreeRightItem}
              activeOpacity={0.9}
              onPress={() => setActiveImageIndex(2)}
            >
              <Image source={{ uri: images[2] }} style={styles.collageImage} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // count >= 4
    const remaining = count - 3;
    return (
      <View style={styles.collageThree}>
        <TouchableOpacity
          style={styles.collageThreeLeft}
          activeOpacity={0.9}
          onPress={() => setActiveImageIndex(0)}
        >
          <Image source={{ uri: images[0] }} style={styles.collageImage} />
        </TouchableOpacity>
        <View style={styles.collageThreeRight}>
          <TouchableOpacity
            style={styles.collageThreeRightItem}
            activeOpacity={0.9}
            onPress={() => setActiveImageIndex(1)}
          >
            <Image source={{ uri: images[1] }} style={styles.collageImage} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.collageThreeRightItem}
            activeOpacity={0.9}
            onPress={() => setActiveImageIndex(2)}
          >
            <Image source={{ uri: images[2] }} style={styles.collageImage} />
            {remaining > 0 && (
              <View style={styles.collageOverlay}>
                <Text style={styles.collageOverlayText}>+{remaining}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Get active reaction metadata
  const currentReaction = post.userReaction ? REACTION_MAP[post.userReaction] : null;

  return (
    <View style={styles.card}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{post.author.name}</Text>
            {isOwner && (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>Chủ Sân</Text>
              </View>
            )}
          </View>
          <Text style={styles.time}>{formatTime(post.createdAt)}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialIcons name="more-horiz" size={20} color={COLORS.outline} />
        </TouchableOpacity>
      </View>

      {/* ── Content Text ── */}
      <Text style={styles.content}>{post.content}</Text>

      {/* ── General Post Collage ── */}
      {post.type === 'general' && renderCollage()}

      {/* ── Ticket Post Layout (Phase 2 UI Placeholder) ── */}
      {post.type === 'ticket' && post.ticketData && (
        <View style={styles.ticketContainer}>
          {post.imageUrls.length > 0 && (
            <Image source={{ uri: post.imageUrls[0] }} style={styles.ticketImage} />
          )}
          <View style={styles.ticketBody}>
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketTag}>ƯU ĐÃI CHỦ SÂN</Text>
              {post.ticketData.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{post.ticketData.discount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.ticketVenueName}>{post.ticketData.venueName}</Text>
            
            <View style={styles.ticketInfoGrid}>
              <View style={styles.ticketInfoItem}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
                <Text style={styles.ticketInfoText}>{post.ticketData.date}</Text>
              </View>
              <View style={styles.ticketInfoItem}>
                <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                <Text style={styles.ticketInfoText}>{post.ticketData.timeSlot}</Text>
              </View>
              <View style={styles.ticketInfoItem}>
                <Ionicons name="grid-outline" size={14} color={COLORS.primary} />
                <Text style={styles.ticketInfoText}>{post.ticketData.courtType}</Text>
              </View>
            </View>

            <View style={styles.ticketFooter}>
              <View style={styles.priceContainer}>
                {post.ticketData.originalPrice && (
                  <Text style={styles.originalPrice}>{post.ticketData.originalPrice}</Text>
                )}
                <Text style={styles.price}>{post.ticketData.price}</Text>
              </View>
              <TouchableOpacity
                style={styles.ticketButton}
                activeOpacity={0.8}
                onPress={onTicketPress}
              >
                <Text style={styles.ticketButtonText}>Đặt ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ── Matchmaking Post Layout (Phase 2 UI Placeholder) ── */}
      {post.type === 'matchmaking' && post.matchmakingData && (
        <View style={styles.matchContainer}>
          <View style={styles.matchHeader}>
            <View style={styles.sportIconBg}>
              <MaterialIcons
                name={post.matchmakingData.sport === 'Bóng rổ' ? 'sports-basketball' : 'sports-tennis'}
                size={20}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.matchHeaderTitle}>
              <Text style={styles.matchSportTitle}>{post.matchmakingData.sport} • Ghép kèo đấu</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{post.matchmakingData.level}</Text>
              </View>
            </View>
            <View style={[
              styles.statusTag,
              post.matchmakingData.joinedCount === post.matchmakingData.maxCount ? styles.statusTagFull : styles.statusTagActive
            ]}>
              <Text style={styles.statusTagText}>
                {post.matchmakingData.joinedCount === post.matchmakingData.maxCount
                  ? 'Đủ người'
                  : `Còn ${post.matchmakingData.maxCount - post.matchmakingData.joinedCount} chỗ`}
              </Text>
            </View>
          </View>

          <View style={styles.matchBody}>
            <View style={styles.matchInfoRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.grayText} />
              <Text style={styles.matchInfoText}>{post.matchmakingData.time}</Text>
            </View>
            <View style={styles.matchInfoRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.grayText} />
              <Text style={styles.matchInfoText} numberOfLines={1}>
                {post.matchmakingData.location}
              </Text>
            </View>
          </View>

          <View style={styles.matchFooter}>
            <Text style={styles.matchSlotsCount}>
              Đã tham gia: <Text style={{ fontWeight: '700', color: COLORS.onSurface }}>{post.matchmakingData.joinedCount}/{post.matchmakingData.maxCount}</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.matchButton,
                post.matchmakingData.joinedCount === post.matchmakingData.maxCount && styles.matchButtonFull
              ]}
              disabled={post.matchmakingData.joinedCount === post.matchmakingData.maxCount}
              activeOpacity={0.8}
              onPress={onJoinMatchPress}
            >
              <Text style={styles.matchButtonText}>
                {post.matchmakingData.joinedCount === post.matchmakingData.maxCount ? 'Đã đầy' : 'Tham gia'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Footer Stats & Actions ── */}
      <View style={styles.footer}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={post.isLiked ? '#EF4444' : COLORS.outline}
            />
            <Text style={[styles.statText, post.isLiked && styles.statTextLiked]}>
              {post.likeCount}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="chatbubble-outline" size={17} color={COLORS.outline} />
            <Text style={styles.statText}>{post.commentCount}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          {renderLikeButton ? (
            renderLikeButton(post)
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={onLikePress} activeOpacity={0.6}>
              {currentReaction ? (
                <Ionicons name={currentReaction.iconName} size={20} color={currentReaction.color} />
              ) : (
                <Ionicons
                  name={post.isLiked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={post.isLiked ? '#EF4444' : COLORS.onSurface}
                />
              )}
              <Text style={[
                styles.actionText, 
                post.isLiked && styles.actionTextLiked,
                currentReaction && { color: currentReaction.color }
              ]}>
                {currentReaction ? currentReaction.label : 'Thích'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={onCommentPress} activeOpacity={0.6}>
            <Ionicons name="chatbubble-outline" size={19} color={COLORS.onSurface} />
            <Text style={styles.actionText}>Bình luận</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Lightbox Full-screen Image Viewer Modal ── */}
      <Modal
        visible={activeImageIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveImageIndex(null)}
      >
        <SafeAreaView style={styles.lightboxContainer}>
          {/* Backdrop Tap to Close */}
          <TouchableOpacity
            style={styles.lightboxBackdrop}
            activeOpacity={1}
            onPress={() => setActiveImageIndex(null)}
          />

          {activeImageIndex !== null && post.imageUrls[activeImageIndex] && (
            <View style={styles.lightboxContent}>
              {/* Header Pager & Close button */}
              <View style={styles.lightboxHeader}>
                <Text style={styles.lightboxPagerText}>
                  {activeImageIndex + 1} / {post.imageUrls.length}
                </Text>
                <TouchableOpacity
                  style={styles.lightboxCloseBtn}
                  onPress={() => setActiveImageIndex(null)}
                >
                  <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
              </View>

              {/* Main Image */}
              <Image
                source={{ uri: post.imageUrls[activeImageIndex] }}
                style={styles.lightboxFullImage}
                resizeMode="contain"
              />

              {/* Navigation Arrows */}
              {post.imageUrls.length > 1 && (
                <View style={styles.lightboxNav}>
                  <TouchableOpacity
                    style={[styles.navArrow, activeImageIndex === 0 && styles.navArrowDisabled]}
                    disabled={activeImageIndex === 0}
                    onPress={() => setActiveImageIndex((prev) => (prev !== null ? prev - 1 : null))}
                  >
                    <Ionicons name="chevron-back" size={32} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.navArrow,
                      activeImageIndex === post.imageUrls.length - 1 && styles.navArrowDisabled
                    ]}
                    disabled={activeImageIndex === post.imageUrls.length - 1}
                    onPress={() => setActiveImageIndex((prev) => (prev !== null ? prev + 1 : null))}
                  >
                    <Ionicons name="chevron-forward" size={32} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceDim,
  },
  headerText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  name: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontWeight: '700',
    fontSize: 14,
  },
  ownerBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ownerBadgeText: {
    fontSize: 9,
    fontFamily: 'HankenGrotesk-SemiBold',
    color: COLORS.onPrimary,
  },
  time: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: COLORS.grayText,
    marginTop: 2,
  },
  moreButton: {
    padding: SPACING.xs,
  },
  content: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },

  // Collage Layout Styles
  collageSingleWrapper: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.default,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surfaceDim,
  },
  mediaImageSingle: {
    width: '100%',
    height: '100%',
  },
  collageTwo: {
    flexDirection: 'row',
    height: 150,
    gap: 4,
    borderRadius: BORDER_RADIUS.default,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  collageTwoItem: {
    flex: 1,
    height: '100%',
    backgroundColor: COLORS.surfaceDim,
  },
  collageImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  collageThree: {
    flexDirection: 'row',
    height: 200,
    gap: 4,
    borderRadius: BORDER_RADIUS.default,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  collageThreeLeft: {
    flex: 0.6,
    height: '100%',
    backgroundColor: COLORS.surfaceDim,
  },
  collageThreeRight: {
    flex: 0.4,
    height: '100%',
    gap: 4,
  },
  collageThreeRightItem: {
    flex: 1,
    height: '100%',
    position: 'relative',
    backgroundColor: COLORS.surfaceDim,
  },
  collageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collageOverlayText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '700',
  },
  
  // Ticket (Phase 2 UI Placeholder)
  ticketContainer: {
    borderWidth: 1.5,
    borderColor: COLORS.primaryOpacity15,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLowest,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  ticketImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.surfaceDim,
  },
  ticketBody: {
    padding: SPACING.sm,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ticketTag: {
    fontFamily: 'HankenGrotesk-ExtraBold',
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  discountBadge: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 11,
    color: COLORS.onSecondary,
  },
  ticketVenueName: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 15,
    color: COLORS.onSurface,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  ticketInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.base,
    marginVertical: SPACING.xs,
  },
  ticketInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryOpacity05,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ticketInfoText: {
    fontFamily: 'HankenGrotesk-Medium',
    fontSize: 11,
    color: COLORS.primary,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerHigh,
    paddingTop: SPACING.sm,
  },
  priceContainer: {
    justifyContent: 'center',
  },
  originalPrice: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.outline,
    textDecorationLine: 'line-through',
    fontSize: 11,
  },
  price: {
    ...TYPOGRAPHY.titleMd,
    color: COLORS.errorText,
    fontWeight: '800',
    fontSize: 16,
  },
  ticketButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.default,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
  },
  ticketButtonText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    color: COLORS.onPrimary,
  },

  // Matchmaking (Phase 2 UI Placeholder)
  matchContainer: {
    borderWidth: 1.5,
    borderColor: 'rgba(6, 78, 59, 0.08)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.surfaceContainerLow,
    marginBottom: SPACING.sm,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sportIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchHeaderTitle: {
    marginLeft: SPACING.xs,
    flex: 1,
    gap: 2,
  },
  matchSportTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    color: COLORS.onSurface,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryOpacity08,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  levelText: {
    fontFamily: 'HankenGrotesk-Medium',
    fontSize: 10,
    color: COLORS.primary,
  },
  statusTag: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusTagActive: {
    backgroundColor: COLORS.secondaryOpacity15,
  },
  statusTagFull: {
    backgroundColor: COLORS.grayOpacity10,
  },
  statusTagText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 10,
    color: COLORS.onSecondaryContainer,
  },
  matchBody: {
    gap: 4,
    marginVertical: SPACING.xs,
    paddingLeft: 4,
  },
  matchInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  matchInfoText: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    paddingTop: SPACING.sm,
  },
  matchSlotsCount: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 12,
    color: COLORS.grayText,
  },
  matchButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.default,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
  },
  matchButtonFull: {
    backgroundColor: COLORS.grayOpacity20,
  },
  matchButtonText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    color: COLORS.onSecondary,
  },

  // Stats & Actions
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerLow,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.xs,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 12,
    color: COLORS.grayText,
  },
  statTextLiked: {
    color: '#EF4444',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerLow,
    paddingTop: SPACING.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  actionText: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    fontSize: 13,
  },
  actionTextLiked: {
    color: '#EF4444',
    fontWeight: '700',
  },

  // Lightbox Viewer Styles
  lightboxContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  lightboxContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  lightboxPagerText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'HankenGrotesk-Bold',
    fontWeight: '700',
  },
  lightboxCloseBtn: {
    padding: 6,
  },
  lightboxFullImage: {
    width: SCREEN_WIDTH,
    height: '75%',
  },
  lightboxNav: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 5,
  },
  navArrow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrowDisabled: {
    opacity: 0.2,
  },
});
