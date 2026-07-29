import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

interface PostUploadProgressBarProps {
  progress: number; // 0 to 100
  step: string;
  isUploading: boolean;
  isSuccess?: boolean;
  onDismiss?: () => void;
}

export function PostUploadProgressBar({
  progress,
  step,
  isUploading,
  isSuccess,
  onDismiss,
}: PostUploadProgressBarProps) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: Math.min(100, Math.max(0, progress)),
      duration: 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress, animatedProgress]);

  useEffect(() => {
    if (isUploading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isUploading, pulseAnim]);

  if (!isUploading && !isSuccess) return null;

  const widthPercent = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, isSuccess && styles.containerSuccess]}>
      <View style={styles.headerRow}>
        <View style={styles.leftInfo}>
          {isSuccess ? (
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          ) : (
            <Animated.View style={{ opacity: pulseAnim }}>
              <Ionicons name="cloud-upload" size={20} color={COLORS.primary} />
            </Animated.View>
          )}
          <Text style={[styles.stepText, isSuccess && styles.stepTextSuccess]}>
            {step}
          </Text>
        </View>

        <View style={styles.rightInfo}>
          {!isSuccess && (
            <Text style={styles.percentText}>{Math.round(progress)}%</Text>
          )}
          {isSuccess && onDismiss && (
            <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={18} color={COLORS.grayText} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.bar,
            { width: widthPercent },
            isSuccess && styles.barSuccess,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0FDF4',
    borderColor: 'rgba(6, 78, 59, 0.15)',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  containerSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
    flex: 1,
  },
  stepTextSuccess: {
    color: '#065F46',
  },
  percentText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '800',
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(6, 78, 59, 0.12)',
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  bar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  barSuccess: {
    backgroundColor: '#10B981',
  },
});
