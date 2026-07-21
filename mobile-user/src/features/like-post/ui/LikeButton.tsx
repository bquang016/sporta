import React, { useRef, useCallback } from 'react';
import { StyleSheet, Text, View, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLikePost } from '../model/useLikePost';
import { useReactionOverlay } from './ReactionOverlayContext';
import { Post } from '../../../entities/post';
import { REACTION_MAP } from '../../../entities/post/ui/PostCard';
import { COLORS, TYPOGRAPHY } from '../../../shared/config/theme';

interface LikeButtonProps {
  post: Post;
}

export function LikeButton({ post }: LikeButtonProps) {
  const { reactPost } = useLikePost();
  const overlay = useReactionOverlay();

  /* ── Animated scale for tap bounce ── */
  const buttonScale = useRef(new Animated.Value(1)).current;

  /* ── Refs for stable PanResponder closure ── */
  const overlayRef = useRef(overlay);
  overlayRef.current = overlay;

  const postRef = useRef(post);
  postRef.current = post;

  const reactPostRef = useRef(reactPost);
  reactPostRef.current = reactPost;

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressingRef = useRef(false);
  const grantPageYRef = useRef(0);

  /* ── Bounce micro-animation ── */
  const triggerBounce = useCallback(() => {
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.82,
        friction: 8,
        tension: 150,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1.15,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [buttonScale]);

  const triggerBounceRef = useRef(triggerBounce);
  triggerBounceRef.current = triggerBounce;

  /* ── PanResponder — single continuous touch gesture ── */
  const panResponder = useRef(
    PanResponder.create({
      // Claim the touch immediately
      onStartShouldSetPanResponder: () => true,

      // Refuse to give up responder once long press is active
      // (prevents ScrollView from stealing the gesture mid-drag)
      onPanResponderTerminationRequest: () => !isLongPressingRef.current,

      /* GRANT — finger down */
      onPanResponderGrant: (evt) => {
        grantPageYRef.current = evt.nativeEvent.pageY;

        // Subtle press-down visual feedback
        Animated.spring(buttonScale, {
          toValue: 0.92,
          friction: 8,
          useNativeDriver: true,
        }).start();

        // Start 350ms long-press timer
        longPressTimerRef.current = setTimeout(() => {
          isLongPressingRef.current = true;

          overlayRef.current.show(
            grantPageYRef.current,
            (reaction: string) => {
              // Called when user releases on a reaction
              triggerBounceRef.current();
              reactPostRef.current({
                postId: postRef.current.id,
                reaction: reaction as any,
              });
            },
          );
        }, 350);
      },

      /* MOVE — finger dragging */
      onPanResponderMove: (evt, gestureState) => {
        if (!isLongPressingRef.current) {
          // Cancel long-press if finger drifted > 10px before timer
          if (
            Math.abs(gestureState.dx) > 10 ||
            Math.abs(gestureState.dy) > 10
          ) {
            if (longPressTimerRef.current) {
              clearTimeout(longPressTimerRef.current);
              longPressTimerRef.current = null;
            }
          }
          return;
        }

        // Forward absolute coordinates to the overlay for hover calculation
        overlayRef.current.updateHover(
          evt.nativeEvent.pageX,
          evt.nativeEvent.pageY,
        );
      },

      /* RELEASE — finger lifted */
      onPanResponderRelease: () => {
        // Clear any pending long-press timer
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }

        if (isLongPressingRef.current) {
          // Was in long-press mode → commit the hovered selection
          overlayRef.current.commitSelection();
          isLongPressingRef.current = false;
          // Gentle return-to-normal
          Animated.spring(buttonScale, {
            toValue: 1,
            friction: 8,
            useNativeDriver: true,
          }).start();
        } else {
          // Short tap → toggle standard like
          triggerBounceRef.current();
          const p = postRef.current;
          if (p.isLiked) {
            reactPostRef.current({ postId: p.id, reaction: null });
          } else {
            reactPostRef.current({ postId: p.id, reaction: 'like' });
          }
        }
      },

      /* TERMINATE — responder stolen (e.g., by ScrollView) */
      onPanResponderTerminate: () => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        if (isLongPressingRef.current) {
          overlayRef.current.hide();
          isLongPressingRef.current = false;
        }
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  /* ── Derived reaction state ── */
  const activeReaction = post.userReaction
    ? REACTION_MAP[post.userReaction]
    : null;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.actionButtonInner,
          { transform: [{ scale: buttonScale }] },
        ]}
      >
        {activeReaction ? (
          <Ionicons
            name={activeReaction.iconName}
            size={20}
            color={activeReaction.color}
          />
        ) : (
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.isLiked ? '#EF4444' : COLORS.onSurface}
          />
        )}
        <Text
          style={[
            styles.actionText,
            post.isLiked && styles.actionTextLiked,
            activeReaction && { color: activeReaction.color },
          ]}
        >
          {activeReaction ? activeReaction.label : 'Thích'}
        </Text>
      </Animated.View>
    </View>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    width: '100%',
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
});
