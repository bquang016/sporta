import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image, Alert, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Button } from '../../../../shared/ui';
import { useRegister } from '../hooks/useRegister';
// Standard 4-color Google G SVG Logo
function GoogleLogo({ size = 20 }: { size?: number }) {
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

// Standard Facebook SVG Logo
function FacebookLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </Svg>
  );
}

export function RegisterScreen() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    isFocusedEmail,
    setIsFocusedEmail,
    isFocusedPassword,
    setIsFocusedPassword,
    isFocusedConfirm,
    setIsFocusedConfirm,
    handleRegister,
    handleGoogleRegister,
    router,
    isPromoVisible,
    setIsPromoVisible,
    isExpanded,
    pan,
    panResponder,
  } = useRegister();

  const logoImg = require('../../../../../assets/logo/logo-horizontal_1600x400.png');

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} 
          style={styles.backHomeButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="home-outline" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.backHomeText}>Quay lại trang chủ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Logo */}
        <View style={styles.logoWrapper}>
          <Image source={logoImg} style={styles.logoImage} resizeMode="contain" />
        </View>

        {/* Header Title */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Đăng ký tài khoản</Text>
          <Text style={styles.subtitle}>Tạo tài khoản mới để bắt đầu khám phá sân thể thao cùng Sporta</Text>
        </View>

        {/* Register Form fields */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputContainer, isFocusedEmail && styles.inputContainerFocused]}>
            <MaterialCommunityIcons name="email-outline" size={20} color={isFocusedEmail ? COLORS.primary : COLORS.outline} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nhập địa chỉ email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORS.outline}
              onFocus={() => setIsFocusedEmail(true)}
              onBlur={() => setIsFocusedEmail(false)}
            />
          </View>

          <Text style={styles.label}>Mật khẩu</Text>
          <View style={[styles.inputContainer, isFocusedPassword && styles.inputContainerFocused]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={isFocusedPassword ? COLORS.primary : COLORS.outline} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={COLORS.outline}
              onFocus={() => setIsFocusedPassword(true)}
              onBlur={() => setIsFocusedPassword(false)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.outline} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nhập lại mật khẩu</Text>
          <View style={[styles.inputContainer, isFocusedConfirm && styles.inputContainerFocused]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={isFocusedConfirm ? COLORS.primary : COLORS.outline} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor={COLORS.outline}
              onFocus={() => setIsFocusedConfirm(true)}
              onBlur={() => setIsFocusedConfirm(false)}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <MaterialCommunityIcons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.outline} />
            </TouchableOpacity>
          </View>

          <View style={styles.submitContainer}>
            <Button 
              title="Đăng ký"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleRegister}
              style={styles.registerBtn}
            />
          </View>
        </View>

        {/* Hoặc đăng ký với */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Hoặc đăng ký với</Text>
          <View style={styles.divider} />
        </View>

        {/* Nút đăng ký Google/Facebook */}
        <View style={styles.socialContainer}>
          <Button 
            variant="outline"
            style={styles.socialButton}
            onPress={handleGoogleRegister}
            icon={<GoogleLogo size={18} />}
            title="Google"
            textStyle={styles.socialBtnText}
          />
          <Button 
            variant="outline"
            style={styles.socialButton}
            onPress={() => Alert.alert('Thông báo', 'Tính năng đăng ký qua Facebook đang được phát triển.')}
            icon={<FacebookLogo size={18} />}
            title="Facebook"
            textStyle={styles.socialBtnText}
          />
        </View>

        {/* Redirection link back to login */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Interactive Partner Promo */}
      {isPromoVisible && (
        <Animated.View 
          style={[
            styles.floatingPromoContainer, 
            { paddingRight: isExpanded ? 40 : 6 },
            { transform: [{ translateX: pan.x }, { translateY: pan.y }] }
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity 
            style={styles.floatingPromoContent}
            activeOpacity={0.8}
            onPress={() => router.push('/partner-intro')}
          >
            <View style={[styles.promoIconContainer, !isExpanded && { marginRight: 0 }]}>
              <MaterialCommunityIcons name="handshake" size={22} color={COLORS.primary} />
            </View>
            {isExpanded && (
              <View style={styles.promoTextContainer}>
                <Text style={styles.promoTitle}>Hợp tác Sporta?</Text>
                <Text style={styles.promoSubtitle}>Đăng ký làm chủ sân</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {isExpanded && (
            <TouchableOpacity 
              style={styles.promoCloseButton}
              onPress={() => setIsPromoVisible(false)}
            >
              <MaterialCommunityIcons name="close" size={16} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: SPACING.marginMobile,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  backHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.primaryOpacity15,
  },
  backHomeText: {
    color: COLORS.primary,
    ...TYPOGRAPHY.labelMd,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: 20,
    paddingBottom: 110,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    height: 48,
  },
  logoImage: {
    width: 190,
    height: '100%',
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: SPACING.sm,
    lineHeight: 18,
  },
  formContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.labelMd,
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB', // Default light border
    borderRadius: 16, // Bo tròn 16px sang trọng
    paddingHorizontal: SPACING.md,
    height: 54, // Tăng chiều cao lên 54 cho thoải mái
    marginBottom: SPACING.md,
    backgroundColor: '#F9FAFB', // Background hơi xám nhẹ cao cấp
  },
  inputContainerFocused: {
    borderColor: COLORS.primary, // Viền màu ngọc bích đậm khi focus
    backgroundColor: COLORS.white, // Nền trắng nổi bật
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  submitContainer: {
    marginTop: SPACING.sm,
  },
  registerBtn: {
    height: 50,
    borderRadius: 16, // Bo tròn nút 16px
  },
  footerContainer: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  footerLink: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
  dividerText: {
    marginHorizontal: SPACING.base,
    color: COLORS.outline,
    ...TYPOGRAPHY.labelMd,
    fontWeight: '700',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  socialButton: {
    flex: 0.48,
    height: 50,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  socialBtnText: {
    color: COLORS.onSurface,
    fontWeight: '700',
    fontSize: 14,
  },
  floatingPromoContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30,
    right: 20,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    zIndex: 100,
  },
  floatingPromoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryOpacity15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  promoTextContainer: {
    justifyContent: 'center',
  },
  promoTitle: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  promoSubtitle: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSurfaceVariant,
  },
  promoCloseButton: {
    position: 'absolute',
    top: 14,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
