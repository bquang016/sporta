import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSetPassword } from '../hooks/useSetPassword';
import { COLORS, BORDER_RADIUS } from '../../../../shared/config/theme';

export function SetPasswordScreen() {
  const {
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    isFocusedPassword, setIsFocusedPassword,
    isFocusedConfirm, setIsFocusedConfirm,
    loading,
    handleSubmit,
    handleSkip,
  } = useSetPassword();

  const heroBg = require('../../../../../assets/auth/sport_auth_hero.jpg');

  return (
    <KeyboardAvoidingView
      style={styles.screenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.responsiveWrapper}>
          {/* TOP HERO SECTION */}
          <ImageBackground
            source={heroBg}
            style={styles.heroSection}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0, 33, 23, 0.4)', 'rgba(0, 33, 23, 0.85)', '#064E3B']}
              style={styles.heroGradient}
            >
              <View style={styles.topBar}>
                {/* Empty left space for balance */}
                <View style={{ width: 40 }} />
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                  <Text style={styles.skipButtonText}>Bỏ qua lúc này</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.heroCenter}>
                <View style={styles.sportBadge}>
                  <Text style={styles.sportBadgeText}>BẢO MẬT TÀI KHOẢN</Text>
                </View>
                <Text style={styles.heroHeadline}>SET YOUR{'\n'}PASSWORD</Text>
                <Text style={styles.heroSubHeadline}>
                  Bạn đang đăng nhập bằng Google. Hãy thiết lập mật khẩu để có thể đăng nhập bằng email ở các lần sau.
                </Text>
              </View>
            </LinearGradient>
          </ImageBackground>

          {/* CURVED WHITE SHEET */}
          <View style={styles.sheetContainer}>
            <View style={styles.formContainer}>
              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Mật khẩu mới <Text style={styles.requiredStar}>*</Text>
                </Text>
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
                    placeholder="Ít nhất 6 ký tự"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9AA1A9"
                    onFocus={() => setIsFocusedPassword(true)}
                    onBlur={() => setIsFocusedPassword(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
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

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Xác nhận mật khẩu <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    isFocusedConfirm && styles.inputWrapperFocused,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={20}
                    color={isFocusedConfirm ? '#064E3B' : '#8A929A'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor="#9AA1A9"
                    onFocus={() => setIsFocusedConfirm(true)}
                    onBlur={() => setIsFocusedConfirm(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#8A929A"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#003527" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Lưu mật khẩu & Bắt đầu</Text>
                  <Ionicons name="arrow-forward" size={18} color="#003527" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#064E3B',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#064E3B',
  },
  scrollContent: {
    flexGrow: 1,
  },
  responsiveWrapper: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    minHeight: '100%',
  },
  heroSection: {
    width: '100%',
    height: 280,
    backgroundColor: '#064E3B',
  },
  heroGradient: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 48,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  heroCenter: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sportBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  sportBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  heroHeadline: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSubHeadline: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    maxWidth: '90%',
  },
  sheetContainer: {
    marginTop: -32,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    flex: 1,
  },
  formContainer: {
    marginBottom: 32,
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#191C20',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  requiredStar: {
    color: '#BA1A1A',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    height: 54,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
  },
  inputWrapperFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#064E3B',
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
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
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#FACC15', // Athletic Yellow
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#003527', // Dark Emerald
    letterSpacing: 0.2,
  },
});
