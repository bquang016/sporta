import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  PanResponder,
  Platform,
  Share,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageViewer from 'react-native-image-zoom-viewer';
import * as Clipboard from 'expo-clipboard';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Post } from '../model/post.types';
import { COLORS, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { ReactionSelector, ReactionSelectorRef } from '../../../features/like-post/ui/ReactionSelector';
import { REACTION_MAP } from '../model/post.constants';
import { CommentSectionSheet } from '../../../features/comment-post';
import { UserProfileModal } from '../../../features/user-profile';
import { PostOptionsMenuModal } from './PostOptionsMenuModal';
import { SharePostModal, SharePostSheet } from './SharePostModal';
import { EditPostModal } from './EditPostModal';
import { ChangeAudienceModal } from './ChangeAudienceModal';
import { ReportPostModal } from './ReportPostModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BAR_WIDTH = 280;
const BAR_HEIGHT = 56;
const ITEM_WIDTH = BAR_WIDTH / 5;
const REACTIONS = ['like', 'love', 'fire', 'muscle', 'trophy'] as const;

// Swipe down threshold for smooth dismissal
const SWIPE_DISMISS_THRESHOLD = 50;

interface PostImageViewerModalProps {
  visible: boolean;
  post: Post;
  initialIndex: number;
  onClose: () => void;
  onReact?: (reaction: string | null) => void;
  onComment?: () => void;
  onShare?: () => void;
  onUserPress?: (userId: string) => void;
  onOptionPress?: (post: Post) => void;
  currentUserId?: string | null;
}

export const PostImageViewerModal = React.memo(({
  visible,
  post,
  initialIndex,
  onClose,
  onReact,
  onComment,
  onShare,
  onUserPress,
  onOptionPress,
  currentUserId,
}: PostImageViewerModalProps) => {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 48);
  const bottomInset = Math.max(insets.bottom, 20);

  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [reactionSelectorVisible, setReactionSelectorVisible] = useState(false);
  const [copyToastVisible, setCopyToastVisible] = useState(false);

  // Nested in-viewer modals (without closing viewer)
  const [showComments, setShowComments] = useState(false);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [changingAudiencePost, setChangingAudiencePost] = useState<Post | null>(null);
  const [reportPostId, setReportPostId] = useState<string | null>(null);

  const selectorRef = useRef<ReactionSelectorRef>(null);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const containerTranslateY = useRef(new Animated.Value(30)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const likeButtonScaleRef = useRef(new Animated.Value(1)).current;
  const hasAnimatedIn = useRef(false);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressActiveRef = useRef(false);
  const selectorAnchorY = useRef(SCREEN_HEIGHT - 200);

  // Sync initial index when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex || 0);
      setIsCaptionExpanded(false);
      setShowOverlay(true);
      setShowComments(false);
      setViewUserId(null);
      setShowOptionsMenu(false);
      setShowShareModal(false);
      overlayOpacity.setValue(1);

      if (!hasAnimatedIn.current) {
        hasAnimatedIn.current = true;
        Animated.parallel([
          Animated.timing(containerOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(containerTranslateY, {
            toValue: 0,
            damping: 24,
            stiffness: 320,
            mass: 0.7,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } else {
      hasAnimatedIn.current = false;
      containerOpacity.setValue(0);
      containerTranslateY.setValue(30);
    }
  }, [visible, initialIndex]);

  const animateClose = useCallback((onDone: () => void) => {
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(containerTranslateY, {
        toValue: SCREEN_HEIGHT * 0.4,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      containerTranslateY.setValue(0);
      containerOpacity.setValue(0);
      onDone();
    });
  }, []);

  const handleClose = useCallback(() => {
    animateClose(onClose);
  }, [animateClose, onClose]);

  // Toggle Header & Footer overlay visibility on single tap
  const toggleOverlay = useCallback(() => {
    const newVal = showOverlay ? 0 : 1;
    Animated.timing(overlayOpacity, {
      toValue: newVal,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setShowOverlay(!showOverlay));
  }, [showOverlay, overlayOpacity]);

  // Handle Like long-press gesture
  const handleLikeButtonLayout = useCallback((event: any) => {
    event.target.measure((_x: number, _y: number, _w: number, _h: number, _px: number, py: number) => {
      selectorAnchorY.current = py;
    });
  }, []);

  const likePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => !longPressActiveRef.current,

      onPanResponderGrant: () => {
        Animated.spring(likeButtonScaleRef, {
          toValue: 0.88,
          useNativeDriver: true,
          damping: 12,
          stiffness: 300,
        }).start();

        longPressTimerRef.current = setTimeout(() => {
          longPressActiveRef.current = true;
          setReactionSelectorVisible(true);
        }, 350);
      },

      onPanResponderMove: (e, gs) => {
        if (!longPressActiveRef.current) {
          if (Math.abs(gs.dx) > 8 || Math.abs(gs.dy) > 8) {
            if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
            Animated.spring(likeButtonScaleRef, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 300 }).start();
          }
          return;
        }
        const barLeft = (SCREEN_WIDTH - BAR_WIDTH) / 2;
        const barTop = Math.max(selectorAnchorY.current - 120, 30);
        const inY = e.nativeEvent.pageY >= barTop - 40 && e.nativeEvent.pageY <= barTop + BAR_HEIGHT + 40;
        const inX = e.nativeEvent.pageX >= barLeft - 15 && e.nativeEvent.pageX <= barLeft + BAR_WIDTH + 15;

        let idx: number | null = null;
        if (inY && inX) {
          const relX = Math.max(0, e.nativeEvent.pageX - barLeft);
          idx = Math.min(Math.max(Math.floor(relX / ITEM_WIDTH), 0), 4);
        }
        selectorRef.current?.setHoveredIndex(idx);
      },

      onPanResponderRelease: () => {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
        Animated.spring(likeButtonScaleRef, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 300 }).start();

        if (longPressActiveRef.current) {
          const idx = selectorRef.current?.getHoveredIndex();
          if (idx !== null && idx !== undefined) {
            const reaction = REACTIONS[idx];
            if (onReact) onReact(reaction);
          }
          longPressActiveRef.current = false;
          setReactionSelectorVisible(false);
        } else {
          // Short tap toggle
          const nextReaction = post.userReaction ? null : 'like';
          if (onReact) onReact(nextReaction);
        }
      },

      onPanResponderTerminate: () => {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
        longPressActiveRef.current = false;
        setReactionSelectorVisible(false);
        Animated.spring(likeButtonScaleRef, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 300 }).start();
      },
    })
  ).current;

  const handleShare = useCallback(async () => {
    try {
      const currentUrl = post.mediaUrls && post.mediaUrls[currentIndex] ? post.mediaUrls[currentIndex] : '';
      await Share.share({
        message: post.content ? `${post.content}\n${currentUrl}` : currentUrl || 'Xem ảnh này trên Sporta!',
        title: `Bài viết của ${post.author?.name || 'Sporta'}`,
        url: currentUrl,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  }, [post, currentIndex]);

  const handleCopyImageLink = useCallback(async () => {
    const currentUrl = post.mediaUrls && post.mediaUrls[currentIndex] ? post.mediaUrls[currentIndex] : '';
    if (currentUrl) {
      await Clipboard.setStringAsync(currentUrl);
      setCopyToastVisible(true);
      setTimeout(() => setCopyToastVisible(false), 2500);
    }
  }, [post, currentIndex]);

  if (!post.mediaUrls || post.mediaUrls.length === 0) return null;

  const images = post.mediaUrls.map((url) => ({ url }));
  const isSingleImage = images.length === 1;
  const activeReaction = post.userReaction ? REACTION_MAP[post.userReaction] : null;
  const totalReactions = post.reactionsCount
    ? Object.values(post.reactionsCount).reduce((sum, count) => sum + (count || 0), 0)
    : (post.likeCount || 0);

  const selectorTop = Math.max((selectorAnchorY.current || SCREEN_HEIGHT - 200) - 120, 30);
  const captionIsLong = post.content && post.content.length > 90;

  // Title line: Club name or Author name
  const mainTitle = post.clubInfo?.name || post.author?.name || 'Cộng đồng Sporta';
  const authorName = post.author?.name || 'Thành viên';

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: containerOpacity,
            transform: [{ translateY: containerTranslateY }],
          },
        ]}
      >
        <StatusBar hidden={!showOverlay} barStyle="light-content" backgroundColor="#000000" />

        {/* ── Main Interactive Zoom Image Viewer ── */}
        <ImageViewer
          imageUrls={images}
          index={currentIndex}
          onChange={(idx) => {
            if (idx !== undefined && idx !== null) {
              setCurrentIndex(idx);
            }
          }}
          onSwipeDown={handleClose}
          onCancel={handleClose}
          enableSwipeDown
          swipeDownThreshold={SWIPE_DISMISS_THRESHOLD}
          onClick={toggleOverlay}
          backgroundColor="#000000"
          doubleClickInterval={250}
          minScale={0.85}
          maxScale={4}
          // ── FIX: When only 1 image, lock horizontal dragging / overscroll ──
          maxOverflow={isSingleImage ? 0 : 100}
          flipThreshold={isSingleImage ? 999999 : 80}
          pageAnimateTime={isSingleImage ? 0 : 200}
          enablePreload={!isSingleImage}
          useNativeDriver={true}
          // ── FIX: Disable broken built-in English "save to album" menu that freezes screen ──
          saveToLocalByLongPress={false}
          menus={() => <View />}
          onLongPress={handleCopyImageLink}
          renderIndicator={() => <View />}
          loadingRender={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
        />

        {/* ── Top Header Overlay (Below Notch / Dynamic Island) ── */}
        <Animated.View
          style={[
            styles.topOverlay,
            { opacity: overlayOpacity, paddingTop: topInset },
          ]}
          pointerEvents={showOverlay ? 'auto' : 'none'}
        >
          <View style={styles.header}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={handleClose}
              style={styles.iconBtn}
              activeOpacity={0.8}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: 'center' }}>
              {/* Counter Badge (Only if > 1 image) */}
              {!isSingleImage && (
                <View style={styles.counterBadge}>
                  <Text style={styles.counterText}>
                    {currentIndex + 1}/{images.length}
                  </Text>
                </View>
              )}
            </View>

            {/* Top Right Options Button (•••) */}
            <TouchableOpacity
              onPress={() => setShowOptionsMenu(true)}
              style={styles.iconBtn}
              activeOpacity={0.8}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Bottom Overlay (Facebook Sleek Compact Layout) ── */}
        <Animated.View
          style={[
            styles.bottomOverlay,
            { opacity: overlayOpacity, paddingBottom: bottomInset },
          ]}
          pointerEvents={showOverlay ? 'auto' : 'none'}
        >
          {/* 1. Header Information Group (Club/Author Title + Subline) */}
          <View style={styles.postInfoWrap}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (post.author?.id) {
                  setViewUserId(String(post.author.id));
                }
              }}
            >
              <Text style={styles.mainTitleText} numberOfLines={1}>
                {mainTitle}
              </Text>
              <View style={styles.subInfoRow}>
                <Text style={styles.subInfoText} numberOfLines={1}>
                  {authorName} · {post.createdAt || 'Vừa xong'} · 
                </Text>
                {post.audience === 'CLUB' || post.audience === 'CLUB_MEMBERS' ? (
                  <Ionicons name="shield-checkmark" size={12.5} color="rgba(255, 255, 255, 0.72)" />
                ) : (
                  <Ionicons name="earth" size={12.5} color="rgba(255, 255, 255, 0.72)" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* 2. Post Caption with Expand / Collapse */}
          {post.content ? (
            <View style={styles.captionWrap}>
              <Text
                style={styles.captionText}
                numberOfLines={isCaptionExpanded ? undefined : 2}
              >
                {post.content}
              </Text>
              {captionIsLong && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsCaptionExpanded(!isCaptionExpanded)}
                  style={styles.expandBtn}
                >
                  <Text style={styles.expandBtnText}>
                    {isCaptionExpanded ? 'Thu gọn' : '... Xem thêm'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {/* 3. Facebook-Style Action / Reaction Row */}
          <View style={styles.fbActionRow}>
            {/* Left Actions: Like, Comment, Share */}
            <View style={styles.fbLeftActionsGroup}>
              {/* Like / Reaction Button */}
              <View onLayout={handleLikeButtonLayout}>
                <Animated.View
                  {...likePan.panHandlers}
                  style={[styles.fbActionItem, { transform: [{ scale: likeButtonScaleRef }] }]}
                >
                  {activeReaction ? (
                    activeReaction.iconLib === 'materialCommunity' ? (
                      <MaterialCommunityIcons
                        name={activeReaction.iconName}
                        size={21}
                        color={activeReaction.color}
                      />
                    ) : (
                      <Ionicons
                        name={activeReaction.iconName}
                        size={21}
                        color={activeReaction.color}
                      />
                    )
                  ) : (
                    <MaterialCommunityIcons
                      name="thumb-up-outline"
                      size={21}
                      color="#FFFFFF"
                    />
                  )}
                  {totalReactions > 0 ? (
                    <Text
                      style={[
                        styles.fbActionNumText,
                        activeReaction && { color: activeReaction.color, fontWeight: '700' },
                      ]}
                    >
                      {totalReactions}
                    </Text>
                  ) : null}
                </Animated.View>
              </View>

              {/* Comment Button */}
              <TouchableOpacity
                style={styles.fbActionItem}
                activeOpacity={0.7}
                onPress={() => setShowComments(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
                {post.commentsCount !== undefined && post.commentsCount > 0 ? (
                  <Text style={styles.fbActionNumText}>{post.commentsCount}</Text>
                ) : null}
              </TouchableOpacity>

              {/* Share Button */}
              <TouchableOpacity
                style={styles.fbActionItem}
                activeOpacity={0.7}
                onPress={() => setShowShareModal(true)}
                onLongPress={handleCopyImageLink}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="arrow-redo-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Right Side: Top/Active Reaction Icon Badge */}
            <View style={styles.fbRightGroup}>
              {activeReaction ? (
                <View style={[styles.rightReactionCircle, { backgroundColor: activeReaction.color }]}>
                  {activeReaction.iconLib === 'materialCommunity' ? (
                    <MaterialCommunityIcons name={activeReaction.iconName} size={11} color="#FFFFFF" />
                  ) : (
                    <Ionicons name={activeReaction.iconName} size={11} color="#FFFFFF" />
                  )}
                </View>
              ) : totalReactions > 0 ? (
                <View style={[styles.rightReactionCircle, { backgroundColor: '#1877F2' }]}>
                  <MaterialCommunityIcons name="thumb-up" size={11} color="#FFFFFF" />
                </View>
              ) : null}
            </View>
          </View>
        </Animated.View>

        {/* ── Link Copied Toast Notification ── */}
        {copyToastVisible && (
          <View style={styles.toastContainer} pointerEvents="none">
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.toastText}>Đã sao chép liên kết ảnh</Text>
          </View>
        )}

        {/* ── Reaction Selector Popover ── */}
        {reactionSelectorVisible && (
          <>
            <View style={StyleSheet.absoluteFill} pointerEvents="none" />
            <View style={[styles.selectorWrap, { top: selectorTop }]} pointerEvents="none">
              <ReactionSelector ref={selectorRef} />
            </View>
          </>
        )}

        {/* ── Facebook-Style Nested Comments Bottom Sheet Overlay ── */}
        {showComments && (
          <CommentSectionSheet
            visible={showComments}
            postId={post.id}
            onClose={() => setShowComments(false)}
            currentUser={{ id: currentUserId }}
            onCommentAdded={() => {
              if (onComment) onComment();
            }}
          />
        )}

        {/* ── Nested User Profile Modal ── */}
        {viewUserId && (
          <UserProfileModal
            visible={!!viewUserId}
            userId={viewUserId}
            onClose={() => setViewUserId(null)}
          />
        )}

        {/* ── Nested Post Options Menu Modal (•••) ── */}
        <PostOptionsMenuModal
          visible={showOptionsMenu}
          post={post}
          currentUserId={currentUserId || 'current-user'}
          onClose={() => setShowOptionsMenu(false)}
          onEditPost={(p) => {
            setShowOptionsMenu(false);
            setEditingPost(p);
          }}
          onChangeAudience={(p) => {
            setShowOptionsMenu(false);
            setChangingAudiencePost(p);
          }}
          onHidePost={(p) => {
            setShowOptionsMenu(false);
            if (onOptionPress) onOptionPress(p);
            handleClose();
          }}
          onDeletePost={() => {
            setShowOptionsMenu(false);
            if (onOptionPress) onOptionPress(post);
            handleClose();
          }}
          onReportPost={(id) => {
            setShowOptionsMenu(false);
            setReportPostId(id);
          }}
          onCopyLink={handleCopyImageLink}
        />

        {/* ── Nested Share Post Modal ── */}
        {showShareModal && (
          <SharePostSheet
            visible={showShareModal}
            post={post}
            onClose={() => setShowShareModal(false)}
            onOptionSelected={(option) => {
              if (option === 'copy_link') {
                setCopyToastVisible(true);
                setTimeout(() => setCopyToastVisible(false), 2500);
              }
            }}
          />
        )}

        {/* ── Nested Edit Post Modal ── */}
        {editingPost && (
          <EditPostModal
            visible={!!editingPost}
            post={editingPost}
            onClose={() => setEditingPost(null)}
            onSaveSuccess={() => setEditingPost(null)}
          />
        )}

        {/* ── Nested Change Audience Modal ── */}
        {changingAudiencePost && (
          <ChangeAudienceModal
            visible={!!changingAudiencePost}
            post={changingAudiencePost}
            onClose={() => setChangingAudiencePost(null)}
            onSaveSuccess={() => setChangingAudiencePost(null)}
          />
        )}

        {/* ── Nested Report Post Modal ── */}
        {reportPostId && (
          <ReportPostModal
            visible={!!reportPostId}
            onClose={() => setReportPostId(null)}
          />
        )}
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  counterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingTop: 12,
  },
  postInfoWrap: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  mainTitleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subInfoText: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 12,
  },
  captionWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  captionText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 13.5,
    lineHeight: 19,
  },
  expandBtn: {
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  expandBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  fbActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 4,
  },
  fbLeftActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
  },
  fbActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  fbActionNumText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  fbRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightReactionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  toastContainer: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  selectorWrap: {
    position: 'absolute',
    left: (SCREEN_WIDTH - BAR_WIDTH) / 2,
    width: BAR_WIDTH,
    zIndex: 10000,
    elevation: 10000,
    overflow: 'visible',
  },
});
