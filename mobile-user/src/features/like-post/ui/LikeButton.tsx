import React, { useRef, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, Animated, PanResponder, Easing } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useReactionOverlay } from './ReactionOverlayContext';
import { Post } from '../../../entities/post/model/post.types';
import { REACTION_MAP } from '../../../entities/post/model/post.constants';
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

  /* ── Tap animation (instant tactile feedback on quick tap) ── */
  const animateTap = useCallback(() => {
    buttonScale.setValue(1);
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.76,
        duration: 80,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1.22,
        damping: 8,
        stiffness: 340,
        mass: 0.4,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        damping: 12,
        stiffness: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [buttonScale]);

  /* ── Hold-Triggered Pop Animation (when long press activates) ── */
  const animateHoldTrigger = useCallback(() => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.16,
        duration: 100,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1.0,
        damping: 10,
        stiffness: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [buttonScale]);

  /* ── Select animation (reaction chosen from overlay) ── */
  const animateSelect = useCallback(() => {
    buttonScale.setValue(0.85);
    Animated.spring(buttonScale, {
      toValue: 1,
      damping: 10,
      stiffness: 260,
      mass: 0.4,
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  const animateTapRef = useRef(animateTap);
  animateTapRef.current = animateTap;
  const animateHoldTriggerRef = useRef(animateHoldTrigger);
  animateHoldTriggerRef.current = animateHoldTrigger;
  const animateSelectRef = useRef(animateSelect);
  animateSelectRef.current = animateSelect;

  /* ── PanResponder: Facebook-style hold-and-glide gesture ── */
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => !longPressActiveRef.current,

      onPanResponderGrant: (e) => {
        touchYRef.current = e.nativeEvent.pageY;

        // Subtle initial press-down scale
        Animated.timing(buttonScale, {
          toValue: 0.90,
          duration: 90,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();

        // 300ms long-press detection (snappy like Facebook)
        timerRef.current = setTimeout(() => {
          longPressActiveRef.current = true;
          animateHoldTriggerRef.current();

          overlayRef.current.show(touchYRef.current, (reaction: string) => {
            animateSelectRef.current();
            handleApplyReaction(reaction);
          });
        }, 300);
      },

      onPanResponderMove: (e, gs) => {
        if (!longPressActiveRef.current) {
          // If finger drifts before timer fires, cancel long press
          if (Math.abs(gs.dx) > 8 || Math.abs(gs.dy) > 8) {
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
            Animated.timing(buttonScale, {
              toValue: 1,
              duration: 90,
              useNativeDriver: true,
            }).start();
          }
          return;
        }

        // Forward absolute screen coordinates to floating reaction selector for live hover
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
          // Commit hovered reaction selection
          overlayRef.current.commitSelection();
          longPressActiveRef.current = false;
        } else {
          // Quick tap -> Toggle like/unlike
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
          active.iconLib === 'materialCommunity' ? (
            <MaterialCommunityIcons name={active.iconName} size={20} color={active.color} />
          ) : (
            <Ionicons name={active.iconName} size={20} color={active.color} />
          )
        ) : (
          <MaterialCommunityIcons
            name={isLikedStandard ? 'thumb-up' : 'thumb-up-outline'}
            size={20}
            color={isLikedStandard ? '#1877F2' : '#64748B'}
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
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  labelLiked: {
    color: '#1877F2',
    fontWeight: '700',
  },
});
