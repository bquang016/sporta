import React, { useState, useRef, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { verifyOtp, sendOtp } from '../../../../shared/api/auth';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { useAlert } from '../../../../shared/contexts/AlertContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function OtpVerifyScreen() {
  const { showAlert } = useAlert();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const router = useRouter();
  const { email, password } = useLocalSearchParams();
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const heroBg = require('../../../../../assets/auth/sport_auth_hero.jpg');

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];

    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split('');
      chars.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = cleaned;
    setOtp(newOtp);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      showAlert('Lỗi', 'Vui lòng nhập đầy đủ mã xác thực 6 số.');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(email as string, otpCode);

      if (response.isNewUser) {
        router.push({
          pathname: '/(auth)/personal-info',
          params: {
            registrationToken: response.registrationToken,
            email: email as string,
            password: password as string,
          },
        });
      } else {
        const emailStr = email as string;
        const username = emailStr ? emailStr.split('@')[0] : 'user';
        const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);

        if (Platform.OS === 'web') {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('userEmail', emailStr);
          localStorage.setItem('userName', capitalizedUsername);
        } else {
          await SecureStore.setItemAsync('accessToken', response.accessToken);
          await SecureStore.setItemAsync('userEmail', emailStr);
          await SecureStore.setItemAsync('userName', capitalizedUsername);
        }

        showAlert('Thành công', response.message, () => router.replace('/(tabs)'));
      }
    } catch (error: any) {
      showAlert('Lỗi', error.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setCanResend(false);
      setCountdown(60);
      await sendOtp(email as string);
      showAlert('Thành công', 'Đã gửi lại mã OTP qua email. Vui lòng kiểm tra hộp thư.');
    } catch (error: any) {
      setCanResend(true);
      showAlert('Lỗi', error.message || 'Không thể gửi lại mã OTP.');
    }
  };

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
          {/* ========================================================
              TOP HERO SECTION: Lush sports backdrop
             ======================================================== */}
          <ImageBackground
            source={heroBg}
            style={styles.heroSection}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['rgba(0, 33, 23, 0.4)', 'rgba(0, 33, 23, 0.75)', '#064E3B']}
              style={styles.heroGradient}
            >
              {/* Top Navigation Bar */}
              <View style={styles.topBar}>
                <TouchableOpacity
                  onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/register'))}
                  style={styles.backButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                  <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
              </View>

              {/* Hero Banner Slogan */}
              <View style={styles.heroCenter}>
                <View style={styles.sportBadge}>
                  <Ionicons name="shield-checkmark" size={13} color="#FED01B" style={{ marginRight: 5 }} />
                  <Text style={styles.sportBadgeText}>BẢO MẬT TÀI KHOẢN</Text>
                </View>
                <Text style={styles.heroHeadline}>VERIFY YOUR{'\n'}ACCOUNT</Text>
              </View>
            </LinearGradient>
          </ImageBackground>

          {/* ========================================================
              CURVED WHITE SHEET: OTP Input Container
             ======================================================== */}
          <View style={styles.sheetContainer}>
            {/* Security Shield Icon Badge */}
            <View style={styles.shieldIconWrapper}>
              <View style={styles.shieldIconCircle}>
                <MaterialCommunityIcons name="shield-key-outline" size={32} color="#064E3B" />
              </View>
            </View>

            <Text style={styles.welcomeTitle}>Nhập mã xác thực OTP</Text>
            <Text style={styles.welcomeSubtitle}>
              Mã xác thực gồm 6 chữ số đã được gửi tới hộp thư:
            </Text>
            <View style={styles.emailPillBadge}>
              <Ionicons name="mail" size={14} color="#064E3B" style={{ marginRight: 6 }} />
              <Text style={styles.emailPillText}>{email}</Text>
            </View>

            {/* 6-Digit OTP Inputs */}
            <View style={styles.otpGrid}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpBox,
                    digit.length > 0 && styles.otpBoxFilled,
                    focusedIndex === index && styles.otpBoxFocused,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Resend Code Section */}
            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} activeOpacity={0.7} style={styles.resendActionBtn}>
                  <Ionicons name="refresh" size={16} color="#064E3B" />
                  <Text style={styles.resendActionText}>Gửi lại mã OTP</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.resendTimerPill}>
                  <Ionicons name="time-outline" size={14} color="#5C6460" style={{ marginRight: 4 }} />
                  <Text style={styles.resendTimerText}>
                    Gửi lại mã sau <Text style={styles.timerHighlightText}>{countdown}s</Text>
                  </Text>
                </View>
              )}
            </View>

            {/* Primary Verify CTA Button */}
            <TouchableOpacity
              style={[styles.primaryPillButton, loading && styles.btnDisabled]}
              onPress={handleVerify}
              disabled={loading}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryPillButtonText}>
                {loading ? 'Đang xác thực...' : 'Xác nhận & Tiếp tục'}
              </Text>
              {!loading && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
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
    height: 220,
    backgroundColor: '#064E3B',
  },
  heroGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingBottom: 44,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 2,
  },
  heroCenter: {
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: 6,
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
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  sheetContainer: {
    marginTop: -32,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  shieldIconWrapper: {
    marginBottom: 16,
  },
  shieldIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F0F5F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4E2D9',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#151C27',
    marginBottom: 6,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 13.5,
    color: '#5C6460',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  emailPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5F2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 8,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#D4E2D9',
  },
  emailPillText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#064E3B',
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    width: '100%',
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#151C27',
    backgroundColor: '#F5F7FA',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  otpBoxFilled: {
    borderColor: '#064E3B',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFocused: {
    borderColor: '#064E3B',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  resendActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resendActionText: {
    color: '#064E3B',
    fontSize: 14,
    fontWeight: '700',
  },
  resendTimerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  resendTimerText: {
    color: '#5C6460',
    fontSize: 13,
  },
  timerHighlightText: {
    color: '#064E3B',
    fontWeight: '700',
  },
  primaryPillButton: {
    width: '100%',
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
});

