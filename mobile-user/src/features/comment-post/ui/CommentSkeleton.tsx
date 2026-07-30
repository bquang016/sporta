import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';

export const CommentSkeleton = () => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.avatar, { opacity }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Animated.View style={[styles.name, { opacity }]} />
          <Animated.View style={[styles.time, { opacity }]} />
        </View>
        <Animated.View style={[styles.textLine, { width: '100%', opacity }]} />
        <Animated.View style={[styles.textLine, { width: '80%', opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  name: {
    width: 100,
    height: 14,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  time: {
    width: 40,
    height: 12,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  textLine: {
    height: 14,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
});
