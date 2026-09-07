import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SportaSplashScreenProps {
  onAnimationFinish: () => void;
}

export const SportaSplashScreen: React.FC<SportaSplashScreenProps> = ({
  onAnimationFinish,
}) => {
  // Shared Values (Executing 100% on Native UI Thread via Reanimated Worklets)
  const logoScale = useSharedValue(0.85);
  const logoOpacity = useSharedValue(0);

  const pulse1Scale = useSharedValue(1);
  const pulse1Opacity = useSharedValue(0.5);

  const pulse2Scale = useSharedValue(1);
  const pulse2Opacity = useSharedValue(0.35);

  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(14);

  const badgesOpacity = useSharedValue(0);
  const progressScaleX = useSharedValue(0);

  const screenOpacity = useSharedValue(1);
  const screenScale = useSharedValue(1);

  useEffect(() => {
    // 1. Logo Spring & Fade In
    logoOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) });
    logoScale.value = withSpring(1, { damping: 14, stiffness: 140 });

    // 2. Pulse 1 Wave (Hardware Accelerated on UI Thread)
    pulse1Scale.value = withRepeat(
      withTiming(1.65, { duration: 1600, easing: Easing.out(Easing.cubic) }),
      -1,
      false
    );
    pulse1Opacity.value = withRepeat(
      withTiming(0, { duration: 1600, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );

    // 3. Pulse 2 Wave (Offset Delay)
    pulse2Scale.value = withDelay(
      350,
      withRepeat(
        withTiming(1.95, { duration: 1800, easing: Easing.out(Easing.cubic) }),
        -1,
        false
      )
    );
    pulse2Opacity.value = withDelay(
      350,
      withRepeat(
        withTiming(0, { duration: 1800, easing: Easing.out(Easing.quad) }),
        -1,
        false
      )
    );

    // 4. Text and Slogan
    textOpacity.value = withDelay(
      180,
      withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) })
    );
    textTranslateY.value = withDelay(
      180,
      withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) })
    );

    // 5. Sports Badges
    badgesOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) })
    );

    // 6. Progress Bar (scaleX transforms are 100% GPU accelerated)
    progressScaleX.value = withTiming(1, {
      duration: 1100,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    // 7. Ultra-Smooth Exit Transition (at 1.35s)
    const timer = setTimeout(() => {
      screenOpacity.value = withTiming(
        0,
        { duration: 280, easing: Easing.inOut(Easing.quad) },
        (finished) => {
          if (finished) {
            runOnJS(onAnimationFinish)();
          }
        }
      );
      screenScale.value = withTiming(1.03, { duration: 280, easing: Easing.out(Easing.quad) });
    }, 1350);

    return () => clearTimeout(timer);
  }, []);

  // Native UI Animated Styles
  const animatedScreenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ scale: screenScale.value }],
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const animatedPulse1Style = useAnimatedStyle(() => ({
    opacity: pulse1Opacity.value,
    transform: [{ scale: pulse1Scale.value }],
  }));

  const animatedPulse2Style = useAnimatedStyle(() => ({
    opacity: pulse2Opacity.value,
    transform: [{ scale: pulse2Scale.value }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const animatedBadgesStyle = useAnimatedStyle(() => ({
    opacity: badgesOpacity.value,
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progressScaleX.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedScreenStyle]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Deep Luxury Emerald Background */}
      <LinearGradient
        colors={['#001C14', '#003527', '#064E3B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Center Hero Section */}
      <View style={styles.centerWrapper}>
        {/* Pulse Waves Container */}
        <View style={styles.pulseWrapper}>
          <Animated.View style={[styles.pulseCircle, styles.pulseCircleGold, animatedPulse1Style]} />
          <Animated.View style={[styles.pulseCircle, styles.pulseCircleEmerald, animatedPulse2Style]} />
        </View>

        {/* Central Logo Emblem */}
        <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../../assets/logo/logo-icon_1024x1024.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Brand Name Typography */}
        <Animated.View style={[styles.textContainer, animatedTextStyle]}>
          <Text style={styles.brandName}>SPORTA</Text>
          <Text style={styles.sloganText}>NỀN TẢNG THỂ THAO & ĐẶT SÂN THÔNG MINH</Text>
        </Animated.View>

        {/* 4 Sports Highlight Pill */}
        <Animated.View style={[styles.sportsPillContainer, animatedBadgesStyle]}>
          <View style={styles.sportsPill}>
            <Text style={styles.sportsPillItem}>Bóng đá</Text>
            <Text style={styles.sportsPillDot}>•</Text>
            <Text style={styles.sportsPillItem}>Cầu lông</Text>
            <Text style={styles.sportsPillDot}>•</Text>
            <Text style={styles.sportsPillItem}>Pickleball</Text>
            <Text style={styles.sportsPillDot}>•</Text>
            <Text style={styles.sportsPillItem}>Bóng rổ</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Loading Progress & Version */}
      <View style={styles.footerContainer}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, animatedProgressStyle]}>
            <LinearGradient
              colors={['#00E699', '#FED01B', '#FFE580']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        <Text style={styles.versionText}>Phiên bản 1.0.0 • Sẵn sàng bứt phá</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 999999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003527',
  },
  centerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pulseWrapper: {
    position: 'absolute',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  pulseCircleGold: {
    borderWidth: 1.5,
    borderColor: 'rgba(254, 208, 27, 0.45)',
  },
  pulseCircleEmerald: {
    borderWidth: 1.5,
    borderColor: 'rgba(128, 190, 166, 0.35)',
  },
  logoContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    width: 112,
    height: 112,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(254, 208, 27, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  brandName: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'HankenGrotesk-Bold',
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4.5,
  },
  sloganText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'HankenGrotesk-Medium',
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FED01B',
    letterSpacing: 1.5,
    marginTop: 8,
    textAlign: 'center',
  },
  sportsPillContainer: {
    marginTop: 24,
  },
  sportsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  sportsPillItem: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10.5,
    fontWeight: '600',
  },
  sportsPillDot: {
    color: 'rgba(254, 208, 27, 0.7)',
    fontSize: 10,
    fontWeight: '900',
  },
  footerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 32,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  progressBarTrack: {
    width: SCREEN_WIDTH * 0.42,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
  },
  versionText: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
