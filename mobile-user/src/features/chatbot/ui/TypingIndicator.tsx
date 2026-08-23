import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, SPACING } from '../../../shared/config/theme';

export const TypingIndicator: React.FC = () => {
  const animation1 = useRef(new Animated.Value(0)).current;
  const animation2 = useRef(new Animated.Value(0)).current;
  const animation3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(animation1, 0);
    animate(animation2, 180);
    animate(animation3, 360);
  }, [animation1, animation2, animation3]);

  const getAnimatedStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.35, 1],
    }),
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.botAvatar}>
        <Ionicons name="sparkles" size={13} color={COLORS.secondary} />
      </View>
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, getAnimatedStyle(animation1)]} />
        <Animated.View style={[styles.dot, getAnimatedStyle(animation2)]} />
        <Animated.View style={[styles.dot, getAnimatedStyle(animation3)]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.md,
  },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'rgba(254, 208, 27, 0.4)',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainerHigh,
    width: 64,
    justifyContent: 'space-between',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary, // Deep Emerald
  },
});
