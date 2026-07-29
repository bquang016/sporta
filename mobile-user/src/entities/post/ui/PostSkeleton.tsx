import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';

export function PostSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const sharedAnimation = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.8,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0.3,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(sharedAnimation).start();
  }, [pulseAnim]);

  return (
    <View style={styles.card}>
      {/* Author Header */}
      <View style={styles.header}>
        <Animated.View style={[styles.avatar, { opacity: pulseAnim }]} />
        <View style={styles.headerText}>
          <Animated.View style={[styles.nameBar, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.timeBar, { opacity: pulseAnim }]} />
        </View>
      </View>

      {/* Content Text Lines */}
      <View style={styles.contentContainer}>
        <Animated.View style={[styles.textLine, { width: '90%', opacity: pulseAnim }]} />
        <Animated.View style={[styles.textLine, { width: '95%', opacity: pulseAnim }]} />
        <Animated.View style={[styles.textLine, { width: '45%', opacity: pulseAnim }]} />
      </View>

      {/* Media Box */}
      <Animated.View style={[styles.mediaBox, { opacity: pulseAnim }]} />

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Animated.View style={[styles.footerBtn, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.footerBtn, { opacity: pulseAnim }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
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
    gap: 6,
  },
  nameBar: {
    width: 120,
    height: 14,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceDim,
  },
  timeBar: {
    width: 60,
    height: 10,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceDim,
  },
  contentContainer: {
    gap: 8,
    marginBottom: SPACING.sm,
  },
  textLine: {
    height: 12,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceDim,
  },
  mediaBox: {
    height: 180,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.surfaceDim,
    marginVertical: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainerLow,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  footerBtn: {
    width: 80,
    height: 20,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceDim,
  },
});
