import React, { useRef, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, Animated, PanResponder, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReactionOverlay } from './ReactionOverlayContext';
import { Post } from '../../../entities/post';
import { REACTION_MAP } from '../../../entities/post';
import { COLORS, TYPOGRAPHY } from '../../../shared/config/theme';

interface LikeButtonProps {
  post: Post;
  onReactPost?: (postId: string, reaction: any) => void;
}

export function LikeButton({ post, onReactPost }: LikeButtonProps) {
  const overlay = useReactionOverlay();

  const buttonScale = useRef(new Animated.Value(1)).current;

  /* ── Refs for stable closure inside PanResponder ── */
  const overlayRef = useRef(overlay);
  overlayRef.current = overlay;
  const postRef = useRef(post);
  postRef.current = post;
  const onReactPostRef = useRef(onReactPost);
  onReactPostRef.current = onReactPost;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressActiveRef = useRef(false);
  const touchYRef = useRef(0);

  const handleApplyReaction = useCallback((reaction: any) => {
    const p = postRef.current;
    if (onReactPostRef.current) {
      onReactPostRef.current(p.id, reaction);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  /* ── Tap animation (quick like toggle) ── */
  const animateTap = useCallback(() => {
    buttonScale.setValue(1);
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.78,
        duration: 70,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        damping: 6,
        stiffness: 320,
        mass: 0.45,
        useNativeDriver: true,
      }),
    ]).start();
  }, [buttonScale]);

  /* ── Select animation (reaction chosen from overlay) ── */
  const animateSelect = useCallback(() => {
    buttonScale.setValue(0.92);
    Animated.spring(buttonScale, {
      toValue: 1,
      damping: 10,
      stiffness: 240,
      mass: 0.4,
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  const animateTapRef = useRef(animateTap);
  animateTapRef.current = animateTap;
  const animateSelectRef = useRef(animateSelect);
  animateSelectRef.current = animateSelect;

  /* ── PanResponder: single-touch Facebook-style gesture ── */
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      // Lock responder once long-press fires (block scroll)
      onPanResponderTerminationRequest: () => !longPressActiveRef.current,

      onPanResponderGrant: (e) => {
        touchYRef.current = e.nativeEvent.pageY;

        // Subtle press-down
        Animated.timing(buttonScale, {
          toValue: 0.92,
          duration: 80,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();

        // Start 400ms long-press detection
        timerRef.current = setTimeout(() => {
          longPressActiveRef.current = true;

          overlayRef.current.show(touchYRef.current, (reaction: string) => {
            animateSelectRef.current();
            handleApplyReaction(reaction);
          });
        }, 400);
      },

      onPanResponderMove: (e, gs) => {
        if (!longPressActiveRef.current) {
          // Cancel long-press if finger drifts > 8px before timer
          if (Math.abs(gs.dx) > 8 || Math.abs(gs.dy) > 8) {
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
            Animated.timing(buttonScale, {
              toValue: 1,
              duration: 80,
              useNativeDriver: true,
            }).start();
          }
          return;
        }
        // Forward absolute screen coords to overlay for hover detection
        overlayRef.current.updateHover(
          e.nativeEvent.pageX,
          e.nativeEvent.pageY,
        );
      },

      onPanResponderRelease: () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        if (longPressActiveRef.current) {
          // Commit whatever reaction is hovered (or cancel if none)
          overlayRef.current.commitSelection();
          longPressActiveRef.current = false;
        } else {
          // Short tap → toggle standard like
          animateTapRef.current();
          const p = postRef.current;
          const nextReaction = p.userReaction || p.isLiked ? null : 'like';
          handleApplyReaction(nextReaction);
        }
      },

      onPanResponderTerminate: () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        if (longPressActiveRef.current) {
          overlayRef.current.hide();
          longPressActiveRef.current = false;
        }
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  /* ── Derived UI state ── */
  const active = post.userReaction ? REACTION_MAP[post.userReaction] : null;
  const isLikedStandard = !active && post.isLiked;

  return (
    <View style={styles.container} {...pan.panHandlers}>
      <Animated.View
        style={[styles.inner, { transform: [{ scale: buttonScale }] }]}
      >
        {active ? (
          <Ionicons name={active.iconName} size={20} color={active.color} />
        ) : (
          <Ionicons
            name={isLikedStandard ? 'thumbs-up' : 'thumbs-up-outline'}
            size={20}
            color={isLikedStandard ? COLORS.primary : COLORS.onSurfaceVariant}
          />
        )}
        <Text
          style={[
            styles.label,
            isLikedStandard && styles.labelLiked,
            active && { color: active.color, fontWeight: '700' },
          ]}
        >
          {active ? active.label : 'Thích'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    width: '100%',
  },
  label: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurfaceVariant,
    fontSize: 13,
  },
  labelLiked: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
