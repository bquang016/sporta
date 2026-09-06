import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ImageBackground,
  Dimensions,
  Animated,
  PanResponder,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useLogin } from '../hooks/useLogin';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 5 Curated Sports Hero Backgrounds for Interactive Horizontal Sliding
const BACKGROUND_CAROUSEL = [
  {
    id: '1',
    image: require('../../../../../assets/auth/sport_auth_hero.jpg'),
    tag: 'TÌM BẠN CHƠI THỂ THAO',
    headline: 'PLAY BEYOND\nTHE GAME',
    subtext: 'Kết nối vận động viên gần bạn, lên lịch thi đấu và tận hưởng từng trận cầu đỉnh cao.',
  },
  {
    id: '2',
    image: require('../../../../../assets/auth/badminton_court_hero.jpg'),
    tag: 'CẦU LÔNG ĐỈNH CAO',
    headline: 'SMASH &\nCONQUER',
    subtext: 'Tung cú smash bùng nổ, rèn luyện phản xạ và giao lưu cùng các tay vợt phong trào.',
  },
  {
    id: '3',
    image: require('../../../../../assets/auth/football_stadium_hero.jpg'),
    tag: 'SÂN CỎ RỰC LỬA',
    headline: 'CHÁY CÙNG\nĐỒNG ĐỘI',
    subtext: 'Đặt sân bóng đá nhanh chóng, tìm kèo giao hữu dễ dàng dưới ánh đèn sân vận động.',
  },
  {
    id: '4',
    image: require('../../../../../assets/auth/pickleball_court_hero.jpg'),
    tag: 'SÔI ĐỘNG PICKLEBALL',
    headline: 'RALLY\nTOGETHER',
    subtext: 'Bùng nổ đam mê cùng môn thể thao phát triển nhanh nhất, gắn kết niềm vui sau giờ làm.',
  },
  {
    id: '5',
    image: require('../../../../../assets/auth/tennis_court_cart.jpg'),
    tag: 'GẶP GỠ & TRANH TÀI',
    headline: 'MEET. PLAY.\nREPEAT.',
    subtext: 'Khám phá hàng trăm cụm sân chất lượng, tối ưu khung giờ và gia nhập cộng đồng.',
  },
];

// Standard 4-color Google G SVG Logo
function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <Path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <Path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <Path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </Svg>
  );
}

// Official Facebook Blue Vector Logo
function FacebookLogo({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </Svg>
  );
}

export function LoginScreen() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    isFocusedEmail,
    setIsFocusedEmail,
    isFocusedPassword,
    setIsFocusedPassword,
    handleGoogleLogin,
    handleLogin,
    router,
  } = useLogin();

  const logoImg = require('../../../../../assets/logo/logo-main_699x699.png');

  // Interactive Carousel State
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<FlatList>(null);

  // Modal Expand/Collapse Animated Progress (0 = Fully Open, 1 = Collapsed)
  const modalProgress = useRef(new Animated.Value(0)).current;
  const isCollapsedRef = useRef(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Direct 60 FPS Spring Animation Toggle
  const toggleModal = useCallback((collapse: boolean) => {
    isCollapsedRef.current = collapse;
    setIsCollapsed(collapse);
    Animated.spring(modalProgress, {
      toValue: collapse ? 1 : 0,
      damping: 18,
      stiffness: 170,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [modalProgress]);

  // Dedicated Drag Handle Swipe Down PanResponder (Attached only to the top drag handle)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture on intentional downward vertical drag > 10px
        return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0 && !isCollapsedRef.current) {
          const progress = Math.min(Math.max(gestureState.dy / (SCREEN_HEIGHT * 0.7), 0), 1);
          modalProgress.setValue(progress);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 70 || gestureState.vy > 0.4) {
          toggleModal(true);
        } else {
          toggleModal(false);
        }
      },
    })
  ).current;

  // Sync active slide index from horizontal carousel
  const handleCarouselScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / (slideSize || SCREEN_WIDTH));
    if (index >= 0 && index < BACKGROUND_CAROUSEL.length) {
      setActiveSlide(index);
    }
  }, []);

  const scrollToSlide = (index: number) => {
    setActiveSlide(index);
    carouselRef.current?.scrollToIndex({ index, animated: true });
  };

  // Interpolations for 60 FPS Native Transforms
  const sheetTranslateY = modalProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_HEIGHT * 0.84],
  });

  // Zero-degree rotation when sheet is active/open to keep Android coordinate mapping stable
  const sheetRotate = modalProgress.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: ['0deg', '0deg', '3.8deg'],
  });

  const sheetScale = modalProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.93],
  });

  const sheetOpacity = modalProgress.interpolate({
    inputRange: [0, 0.75, 1],
    outputRange: [1, 0.85, 0],
  });

  // Quick Action Dock Animation
  const dockTranslateY = modalProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [140, 0],
  });

  const dockOpacity = modalProgress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.15, 1],
  });

  const currentBg = BACKGROUND_CAROUSEL[activeSlide] || BACKGROUND_CAROUSEL[0];

  return (
    <View style={styles.screenContainer}>
      {/* ========================================================
          HORIZONTAL SLIDING BACKGROUND CAROUSEL
         ======================================================== */}
      <View style={StyleSheet.absoluteFill}>
        <FlatList
          ref={carouselRef}
          data={BACKGROUND_CAROUSEL}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleCarouselScroll}
          decelerationRate="fast"
          removeClippedSubviews={Platform.OS === 'android'}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          style={StyleSheet.absoluteFill}
          renderItem={({ item }) => (
            <View style={styles.carouselSlideItem}>
              <ImageBackground
                source={item.image}
                style={styles.fullBgImage}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={['rgba(0, 33, 23, 0.3)', 'rgba(0, 33, 23, 0.6)', 'rgba(6, 78, 59, 0.95)']}
                  style={styles.fullBgGradient}
                />
              </ImageBackground>
            </View>
          )}
        />

        {/* Global Floating Header Over Background */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Trang chủ</Text>
          </TouchableOpacity>

          {/* Toggle Explore/Collapse Button */}
          <TouchableOpacity
            onPress={() => toggleModal(!isCollapsed)}
            style={styles.explorePillBtn}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isCollapsed ? 'create-outline' : 'images-outline'}
              size={14}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.explorePillText}>
              {isCollapsed ? 'Mở đăng nhập' : 'Ngắm ảnh'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inspiring Hero Story Text & Swipe Indicator */}
        <View style={styles.carouselStoryBox} pointerEvents="box-none">
          <View style={styles.sportBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.sportBadgeText}>{currentBg.tag}</Text>
          </View>
          <Text style={styles.heroHeadline}>{currentBg.headline}</Text>
          <Text style={styles.heroSubtext}>{currentBg.subtext}</Text>

          {/* Swipe indicator dots */}
          <View style={styles.carouselDotsRow}>
            {BACKGROUND_CAROUSEL.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => scrollToSlide(idx)}
                activeOpacity={0.8}
                style={[
                  styles.dot,
                  activeSlide === idx ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* ========================================================
            NEAT QUICK ACTION DOCK (Appears when sheet is collapsed)
           ======================================================== */}
        <Animated.View
          pointerEvents={isCollapsed ? 'auto' : 'none'}
          style={[
            styles.quickActionDock,
            {
              transform: [{ translateY: dockTranslateY }],
              opacity: dockOpacity,
            },
          ]}
        >
          {/* Row 1: Primary Auth Actions (Đăng nhập & Đăng ký) */}
          <View style={styles.dockRowPrimary}>
            <TouchableOpacity
              style={styles.dockPrimaryButton}
              onPress={() => toggleModal(false)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="email-outline" size={18} color="#064E3B" />
              <Text style={styles.dockPrimaryText}>Đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dockSecondaryButton}
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.85}
            >
              <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
              <Text style={styles.dockSecondaryText}>Đăng ký</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2: Compact Social Logins (Google & Facebook) */}
          <View style={styles.dockRowSocial}>
            <TouchableOpacity
              style={styles.dockSocialPill}
              onPress={handleGoogleLogin}
              activeOpacity={0.85}
            >
              <GoogleLogo size={18} />
              <Text style={styles.dockSocialText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dockSocialPill}
              onPress={handleGoogleLogin}
              activeOpacity={0.85}
            >
              <FacebookLogo size={18} />
              <Text style={styles.dockSocialText}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* ========================================================
          ANIMATED FLOATING MODAL SHEET (Stable Native Touch)
         ======================================================== */}
      <Animated.View
        style={[
          styles.modalSheetAnimatedWrapper,
          {
            transform: [
              { translateY: sheetTranslateY },
              { rotate: sheetRotate },
              { scale: sheetScale },
            ],
            opacity: sheetOpacity,
          },
        ]}
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.sheetScrollView}
            contentContainerStyle={styles.sheetScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            nestedScrollEnabled={true}
            overScrollMode="never"
            bounces={false}
          >
            {/* Top Pull-down handle bar with isolated PanResponder */}
            <View
              style={styles.dragHandleContainer}
              {...panResponder.panHandlers}
            >
              <View style={styles.dragHandleBar} />
              <TouchableOpacity
                onPress={() => toggleModal(true)}
                style={styles.collapseHintButton}
                activeOpacity={0.7}
              >
                <Text style={styles.collapseHintText}>Vuốt thanh kéo xuống để ngắm ảnh</Text>
                <Ionicons name="chevron-down" size={14} color="#8A929A" />
              </TouchableOpacity>
            </View>

            {/* Brand Logo & Welcome Title */}
            <View style={styles.sheetHeader}>
              <View style={styles.brandLogoRow}>
                <Image source={logoImg} style={styles.brandLogoImage} resizeMode="contain" />
                <Text style={styles.brandTitleText}>Sporta</Text>
              </View>
              <Text style={styles.welcomeTitle}>Chào mừng trở lại!</Text>
              <Text style={styles.welcomeSubtitle}>
                Đăng nhập để giữ vững nhịp độ, ghép trận, đặt sân và kết nối cùng cộng đồng thể thao.
              </Text>
            </View>

            {/* Form Inputs Container */}
            <View style={styles.formContainer}>
              {/* Email / Username Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên đăng nhập / Email</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isFocusedEmail && styles.inputWrapperFocused,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color={isFocusedEmail ? '#064E3B' : '#8A929A'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="name@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    placeholderTextColor="#9AA1A9"
                    onFocus={() => setIsFocusedEmail(true)}
                    onBlur={() => setIsFocusedEmail(false)}
                  />
                  {email.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setEmail('')}
                      style={styles.iconButton}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close-circle" size={18} color="#B4BCC4" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mật khẩu</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isFocusedPassword && styles.inputWrapperFocused,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={20}
                    color={isFocusedPassword ? '#064E3B' : '#8A929A'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="password"
                    placeholderTextColor="#9AA1A9"
                    onFocus={() => setIsFocusedPassword(true)}
                    onBlur={() => setIsFocusedPassword(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.iconButton}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#8A929A"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => router.push('/(auth)/forgot-password')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              {/* Primary Login Button */}
              <TouchableOpacity
                style={[styles.primaryPillButton, loading && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.88}
              >
                <Text style={styles.primaryPillButtonText}>
                  {loading ? 'Đang xác thực...' : 'Đăng nhập'}
                </Text>
                {!loading && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
              </TouchableOpacity>
            </View>

            {/* Split Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>Hoặc tiếp tục với</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Authentication Pill Buttons (Google & Facebook) */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialPillButton}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <GoogleLogo size={18} />
                <Text style={styles.socialPillText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialPillButton}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <FacebookLogo size={18} />
                <Text style={styles.socialPillText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Registration Redirection Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerPromptText}>Chưa có tài khoản Sporta? </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/register')}
                activeOpacity={0.7}
              >
                <Text style={styles.footerHighlightLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>

            {/* Partner Intro Banner Ribbon */}
            <TouchableOpacity
              style={styles.partnerCard}
              activeOpacity={0.85}
              onPress={() => router.push('/partner-intro')}
            >
              <View style={styles.partnerIconWrapper}>
                <MaterialCommunityIcons name="storefront-outline" size={20} color="#064E3B" />
              </View>
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerHeadline}>Dành cho chủ sân bãi</Text>
                <Text style={styles.partnerSubtext}>
                  Đăng ký hợp tác để tối ưu hóa công suất và doanh thu sân
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#064E3B" />
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#064E3B',
  },
  carouselSlideItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullBgImage: {
    width: '100%',
    height: '100%',
  },
  fullBgGradient: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 28,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 2,
  },
  explorePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  explorePillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  carouselStoryBox: {
    position: 'absolute',
    bottom: 160,
    left: 24,
    right: 24,
    alignItems: 'flex-start',
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FED01B',
    marginRight: 6,
  },
  sportBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroHeadline: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
    letterSpacing: -0.7,
    marginBottom: 8,
  },
  heroSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13.5,
    lineHeight: 19,
    maxWidth: 320,
    marginBottom: 14,
  },
  carouselDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 22,
    backgroundColor: '#FED01B',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  quickActionDock: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 36 : 20,
    left: 18,
    right: 18,
    backgroundColor: 'rgba(6, 40, 31, 0.75)',
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  dockRowPrimary: {
    flexDirection: 'row',
    gap: 10,
  },
  dockPrimaryButton: {
    flex: 1,
    height: 46,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  dockPrimaryText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#064E3B',
  },
  dockSecondaryButton: {
    flex: 1,
    height: 46,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dockSecondaryText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dockRowSocial: {
    flexDirection: 'row',
    gap: 10,
  },
  dockSocialPill: {
    flex: 1,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dockSocialText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalSheetAnimatedWrapper: {
    position: 'absolute',
    top: 96,
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 14,
  },
  keyboardContainer: {
    flex: 1,
  },
  sheetScrollView: {
    flex: 1,
  },
  sheetScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 48,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 6,
    width: '100%',
  },
  dragHandleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D4DCDE',
    marginBottom: 6,
  },
  collapseHintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  collapseHintText: {
    fontSize: 11.5,
    color: '#8A929A',
    fontWeight: '600',
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  brandLogoImage: {
    width: 30,
    height: 30,
  },
  brandTitleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#064E3B',
    letterSpacing: -0.5,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#151C27',
    marginBottom: 4,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 13.5,
    color: '#5C6460',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },
  formContainer: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#191C20',
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
  },
  inputWrapperFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#064E3B',
    ...Platform.select({
      ios: {
        shadowColor: '#064E3B',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        // Keep elevation static on Android to avoid relayout
      },
    }),
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#151C27',
    paddingVertical: 0,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  iconButton: {
    padding: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 18,
    marginTop: -4,
  },
  forgotPasswordText: {
    color: '#064E3B',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryPillButton: {
    height: 52,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#064E3B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.65,
  },
  primaryPillButtonText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8ECF0',
  },
  dividerLabel: {
    marginHorizontal: 12,
    color: '#8A929A',
    fontSize: 12,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  socialPillButton: {
    flex: 1,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E8ECF0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialPillText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#151C27',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  footerPromptText: {
    fontSize: 13.5,
    color: '#5C6460',
  },
  footerHighlightLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#064E3B',
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5F2',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D4E2D9',
    gap: 12,
  },
  partnerIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerInfo: {
    flex: 1,
  },
  partnerHeadline: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 2,
  },
  partnerSubtext: {
    fontSize: 11.5,
    color: '#5C6460',
    lineHeight: 15,
  },
});



