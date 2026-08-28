import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PostUploadProgressBarProps {
  progress: number; // 0 to 100
  step: string;
  isUploading: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  onDismiss?: () => void;
}

const FAB_SIZE = 58;
const STROKE_WIDTH = 4;
const RADIUS = (FAB_SIZE - STROKE_WIDTH) / 2; // 27
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~169.64

export function PostUploadProgressBar({
  progress,
  step,
  isUploading,
  isSuccess,
  isError,
  onDismiss,
}: PostUploadProgressBarProps) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [showTooltip, setShowTooltip] = useState(true);

  // Smooth Progress animation
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: Math.min(100, Math.max(0, progress)),
      duration: 350,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress, animatedProgress]);

  // Entrance Bounce Animation
  useEffect(() => {
    if (isUploading || isSuccess || isError) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isUploading, isSuccess, isError, scaleAnim]);

  // Ball spin animation while uploading
  useEffect(() => {
    if (isUploading) {
      const spin = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    } else {
      spinAnim.setValue(0);
    }
  }, [isUploading, spinAnim]);

  // Auto-dismiss tooltip after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onDismiss]);

  if (!isUploading && !isSuccess && !isError) return null;

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const strokeColor = isSuccess
    ? '#10B981'
    : isError
    ? '#EF4444'
    : COLORS.primary;

  return (
    <Animated.View style={[styles.fabWrapper, { transform: [{ scale: scaleAnim }] }]}>
      {/* Floating Tooltip Label (Left of FAB) */}
      {showTooltip && (
        <View style={[styles.tooltipCard, isSuccess && styles.tooltipSuccess, isError && styles.tooltipError]}>
          <View style={styles.tooltipTextCol}>
            <Text style={styles.tooltipTitle}>
              {isSuccess ? 'Đã đăng bài!' : isError ? 'Đăng thất bại' : 'Đang đăng bài...'}
            </Text>
            <Text style={[styles.tooltipSubtext, isSuccess && styles.subSuccess, isError && styles.subError]} numberOfLines={1}>
              {step}
            </Text>
          </View>

          {onDismiss && (
            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={14} color={COLORS.grayText} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Circular Floating Action Ball Icon */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => setShowTooltip((prev) => !prev)}
        style={styles.fabCircleBtn}
      >
        {/* SVG Circular Progress Ring */}
        <Svg width={FAB_SIZE} height={FAB_SIZE} style={styles.svgRing}>
          <Circle
            cx={FAB_SIZE / 2}
            cy={FAB_SIZE / 2}
            r={RADIUS}
            stroke={
              isSuccess
                ? 'rgba(16, 185, 129, 0.2)'
                : isError
                ? 'rgba(239, 68, 68, 0.2)'
                : 'rgba(6, 78, 59, 0.15)'
            }
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          <AnimatedCircle
            cx={FAB_SIZE / 2}
            cy={FAB_SIZE / 2}
            r={RADIUS}
            stroke={strokeColor}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${FAB_SIZE / 2} ${FAB_SIZE / 2})`}
          />
        </Svg>

        {/* Center Custom Sporta Sports Ball */}
        <Animated.View style={[styles.ballIconContainer, isUploading && { transform: [{ rotate: spin }] }]}>
          {isSuccess ? (
            <Ionicons name="checkmark" size={26} color="#10B981" />
          ) : isError ? (
            <Ionicons name="alert" size={24} color="#EF4444" />
          ) : (
            <MaterialCommunityIcons name="soccer" size={26} color={COLORS.primary} />
          )}
        </Animated.View>

        {/* Progress Percentage Badge */}
        {isUploading && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{Math.round(progress)}%</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabWrapper: {
    position: 'absolute',
    bottom: 280, // Moved up slightly as requested by user (approx 3/4 from top)
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    gap: 8,
  },
  tooltipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.lg,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.12)',
    maxWidth: 200,
  },
  tooltipSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  tooltipError: {
    backgroundColor: '#FEF2F2',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  tooltipTextCol: {
    gap: 2,
    flex: 1,
  },
  tooltipTitle: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  tooltipSubtext: {
    fontFamily: 'HankenGrotesk-Medium',
    fontSize: 10.5,
    color: COLORS.grayText,
  },
  subSuccess: {
    color: '#065F46',
  },
  subError: {
    color: '#991B1B',
  },
  closeBtn: {
    padding: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
  },
  fabCircleBtn: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
  },
  svgRing: {
    position: 'absolute',
  },
  ballIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(6, 78, 59, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 9.5,
    color: '#FFFFFF',
    fontWeight: '900',
  },
});
