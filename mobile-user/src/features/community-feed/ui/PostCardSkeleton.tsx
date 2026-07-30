import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';

export const PostCardSkeleton = () => {
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
    <View style={styles.card}>
      <View style={styles.header}>
        <Animated.View style={[styles.avatarSkeleton, { opacity }]} />
        <View style={styles.headerText}>
          <Animated.View style={[styles.nameSkeleton, { opacity }]} />
          <Animated.View style={[styles.timeSkeleton, { opacity }]} />
        </View>
      </View>
      <View style={styles.body}>
        <Animated.View style={[styles.textLine, { width: '100%', opacity }]} />
        <Animated.View style={[styles.textLine, { width: '90%', opacity }]} />
        <Animated.View style={[styles.textLine, { width: '60%', opacity }]} />
        <Animated.View style={[styles.imageSkeleton, { opacity }]} />
      </View>
      <View style={styles.footer}>
        <Animated.View style={[styles.actionSkeleton, { opacity }]} />
        <Animated.View style={[styles.actionSkeleton, { opacity }]} />
        <Animated.View style={[styles.actionSkeleton, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarSkeleton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  nameSkeleton: {
    width: '40%',
    height: 16,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  timeSkeleton: {
    width: '20%',
    height: 12,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  body: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  textLine: {
    height: 14,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  imageSkeleton: {
    width: '100%',
    height: 200,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionSkeleton: {
    width: 60,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },
});
