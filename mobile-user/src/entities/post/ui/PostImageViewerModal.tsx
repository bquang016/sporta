import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Animated,
  PanResponder,
  Platform,
  Share,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../model/post.types';
import { COLORS } from '../../../shared/config/theme';
import { ReactionSelector, ReactionSelectorRef } from '../../../features/like-post/ui/ReactionSelector';
import { REACTION_MAP } from '../index';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BAR_WIDTH = 280;
const BAR_HEIGHT = 56;
const ITEM_WIDTH = BAR_WIDTH / 5;
const REACTIONS = ['like', 'love', 'fire', 'muscle', 'trophy'] as const;
type ReactionType = (typeof REACTIONS)[number];

// Swipe threshold - lower = easier to dismiss
const SWIPE_DISMISS_THRESHOLD = 60;

interface PostImageViewerModalProps {
  visible: boolean;
  post: Post;
  initialIndex: number;
  onClose: () => void;
  onReact?: (reaction: string | null) => void;
  onComment?: () => void;
  onOptionPress?: (post: Post) => void;
  currentUserId?: string | null;
}

export const PostImageViewerModal = ({
  visible,
  post,
  initialIndex,
  onClose,
  onReact,
  onComment,
  onOptionPress,
  currentUserId,
}: PostImageViewerModalProps) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [reactionSelectorVisible, setReactionSelectorVisible] = useState(false);
  const [hoveredReactionIndex, setHoveredReactionIndex] = useState<number | null>(null);
  const selectorRef = useRef<ReactionSelectorRef>(null);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  // Init at 0 so very first render is invisible — no flash
  const containerTranslateY = useRef(new Animated.Value(30)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const likeButtonScaleRef = useRef(new Animated.Value(1)).current;
  const hasAnimatedIn = useRef(false);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressActiveRef = useRef(false);

  const selectorAnchorY = useRef(SCREEN_HEIGHT - 200);

  // Animate in when modal becomes visible — only once per open
  useEffect(() => {
    if (visible && !hasAnimatedIn.current) {
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
    if (!visible) {
      hasAnimatedIn.current = false;
      containerOpacity.setValue(0);
      containerTranslateY.setValue(30);
    }
  }, [visible]);

  const animateClose = useCallback((onDone: () => void) => {
    Animated.parallel([
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(containerTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 240,
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

  // Overlay fade toggle
  const toggleOverlay = useCallback(() => {
    const newVal = showOverlay ? 0 : 1;
    Animated.timing(overlayOpacity, {
      toValue: newVal,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowOverlay(!showOverlay));
  }, [showOverlay, overlayOpacity]);

  // --- Reaction long-press logic ---
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
        }, 400);
      },

      onPanResponderMove: (e, gs) => {
        if (!longPressActiveRef.current) {
          if (Math.abs(gs.dx) > 8 || Math.abs(gs.dy) > 8) {
            if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
            Animated.spring(likeButtonScaleRef, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 300 }).start();
          }
          return;
        }
        // Update hover
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
        setHoveredReactionIndex(idx);
      },

      onPanResponderRelease: () => {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

        Animated.spring(likeButtonScaleRef, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 300 }).start();

        if (longPressActiveRef.current) {
          const idx = selectorRef.current?.getHoveredIndex();
          if (idx !== null && idx !== undefined) {
            const reaction = REACTIONS[idx];
            onReact && onReact(reaction);
          }
          longPressActiveRef.current = false;
          setReactionSelectorVisible(false);
          setHoveredReactionIndex(null);
        } else {
          // Short tap - toggle like
          const nextReaction = post.userReaction ? null : 'like';
          onReact && onReact(nextReaction);
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

  // --- Swipe-to-dismiss with lower threshold ---
  const swipeTranslateY = useRef(new Animated.Value(0)).current;
  const swipeOpacity = swipeTranslateY.interpolate({
    inputRange: [0, SWIPE_DISMISS_THRESHOLD, SWIPE_DISMISS_THRESHOLD * 2],
    outputRange: [1, 0.7, 0],
    extrapolate: 'clamp',
  });

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: post.content || 'Xem bài viết thú vị trên Sporta!',
        title: `Bài viết của ${post.author?.name || 'Sporta'}`,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  }, [post]);

  const handleOptions = useCallback(() => {
    if (Platform.OS === 'ios') {
      const isOwner = currentUserId && String(post.author?.id) === String(currentUserId);
      const options = isOwner
        ? ['Xoá bài viết', 'Chia sẻ', 'Huỷ']
        : ['Báo cáo bài viết', 'Chia sẻ', 'Huỷ'];

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          destructiveButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 0 && onOptionPress) {
            onOptionPress(post);
          } else if (buttonIndex === 1) {
            handleShare();
          }
        }
      );
    } else {
      // Android: delegate to parent
      if (onOptionPress) onOptionPress(post);
    }
  }, [post, currentUserId, onOptionPress, handleShare]);

  if (!post.mediaUrls || post.mediaUrls.length === 0) return null;

  const images = post.mediaUrls.map((url) => ({ url }));
  const activeReaction = post.userReaction ? REACTION_MAP[post.userReaction] : null;
  const totalReactions = post.reactionsCount
    ? Object.values(post.reactionsCount).reduce((s, c) => s + (c || 0), 0)
    : (post.likeCount || 0);

  const selectorTop = Math.max((selectorAnchorY.current || SCREEN_HEIGHT - 200) - 120, 30);

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.container, { opacity: containerOpacity, transform: [{ translateY: containerTranslateY }] }]}>
        <StatusBar hidden />

        {/* Image viewer — swipe handled internally + our custom overlay */}
        <ImageViewer
          imageUrls={images}
          index={initialIndex}
          onSwipeDown={handleClose}
          onCancel={handleClose}
          enableSwipeDown
          swipeDownThreshold={SWIPE_DISMISS_THRESHOLD}
          onClick={toggleOverlay}
          backgroundColor="black"
          renderIndicator={(currentIndex, allSize) => {
            if (allSize === 1) return <View />;
            return (
              <Animated.View style={[styles.indicatorWrap, { opacity: overlayOpacity }]}>
                <Text style={styles.indicatorText}>{currentIndex} / {allSize}</Text>
              </Animated.View>
            );
          }}
        />

        {/* ── Top Overlay ── */}
        <Animated.View style={[styles.topOverlay, { opacity: overlayOpacity }]} pointerEvents={showOverlay ? 'auto' : 'none'}>
          <SafeAreaView>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.iconBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="close" size={26} color="white" />
              </TouchableOpacity>

              <View style={styles.authorBlock}>
                <Text style={styles.authorName} numberOfLines={1}>{post.author?.name}</Text>
                <Text style={styles.timestamp}>{post.createdAt}</Text>
              </View>

              <TouchableOpacity onPress={handleOptions} style={styles.iconBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="ellipsis-horizontal" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* ── Bottom Overlay ── */}
        <Animated.View style={[styles.bottomOverlay, { opacity: overlayOpacity }]} pointerEvents={showOverlay ? 'auto' : 'none'}>
          {post.content ? (
            <View style={styles.captionWrap}>
              <Text style={styles.captionText} numberOfLines={3}>{post.content}</Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            {/* ── Like / Reaction long-press ── */}
            <View onLayout={handleLikeButtonLayout} style={styles.actionItem}>
              <Animated.View {...likePan.panHandlers} style={[styles.actionInner, { transform: [{ scale: likeButtonScaleRef }] }]}>
                {activeReaction ? (
                  <Ionicons name={activeReaction.iconName} size={22} color={activeReaction.color} />
                ) : (
                  <Ionicons name="thumbs-up-outline" size={22} color="rgba(255,255,255,0.9)" />
                )}
                <Text style={[styles.actionText, activeReaction && { color: activeReaction.color }]}>
                  {activeReaction ? activeReaction.label : 'Thích'}
                </Text>
              </Animated.View>
            </View>

            <View style={styles.divider} />

            {/* ── Comment ── */}
            <TouchableOpacity style={styles.actionItem} onPress={onComment} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View style={styles.actionInner}>
                <Ionicons name="chatbubble-outline" size={21} color="rgba(255,255,255,0.9)" />
                <Text style={styles.actionText}>Bình luận</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* ── Share ── */}
            <TouchableOpacity style={styles.actionItem} onPress={handleShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View style={styles.actionInner}>
                <Ionicons name="share-social-outline" size={21} color="rgba(255,255,255,0.9)" />
                <Text style={styles.actionText}>Chia sẻ</Text>
              </View>
            </TouchableOpacity>
          </View>
          <SafeAreaView />
        </Animated.View>

        {/* ── Reaction Selector Overlay ── */}
        {reactionSelectorVisible && (
          <>
            <View style={StyleSheet.absoluteFill} pointerEvents="none" />
            <View style={[styles.selectorWrap, { top: selectorTop }]} pointerEvents="none">
              <ReactionSelector ref={selectorRef} />
            </View>
          </>
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  indicatorWrap: {
    position: 'absolute',
    top: 56,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  indicatorText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  authorBlock: {
    flex: 1,
    paddingHorizontal: 14,
  },
  authorName: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    marginTop: 1,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingTop: 8,
  },
  captionWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  captionText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
  actionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  actionText: {
    color: 'rgba(255,255,255,0.9)',
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
