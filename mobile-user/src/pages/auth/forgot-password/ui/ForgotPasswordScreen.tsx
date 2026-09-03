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
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BORDER_RADIUS } from '../../../../shared/config/theme';
import { useAlert } from '../../../../shared/contexts/AlertContext';
import {
  forgotPasswordSendOtpApi,
  forgotPasswordVerifyOtpApi,
  resetPasswordApi,
} from '../../../../shared/api/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Step = 'REQUEST_OTP' | 'VERIFY_OTP' | 'RESET_PASSWORD';

export function ForgotPasswordScreen() {
  const { showAlert } = useAlert();
  const router = useRouter();

  const [step, setStep] = useState<Step>('REQUEST_OTP');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const heroBg = require('../../../../../assets/auth/sport_auth_hero.jpg');

  useEffect(() => {
    let timer: any;
    if (step === 'VERIFY_OTP' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async () => {
    if (!email || !email.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập địa chỉ email.');
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordSendOtpApi(email.trim());
      setStep('VERIFY_OTP');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      showAlert('Thành công', 'Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn.');
    } catch (error: any) {
      showAlert('Lỗi', error.message || 'Không thể gửi mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    try {
      await forgotPasswordSendOtpApi(email.trim());
      setCountdown(60);
      setCanResend(false);
      showAlert('Thành công', 'Đã gửi lại mã OTP mới qua email.');
    } catch (error: any) {
      showAlert('Lỗi', error.message || 'Gửi lại mã OTP thất bại.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      showAlert('Lỗi', 'Vui lòng nhập đầy đủ mã xác thực 6 số.');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPasswordVerifyOtpApi(email.trim(), otpCode);
      setResetToken(response.resetToken);
      setStep('RESET_PASSWORD');
    } catch (error: any) {
      showAlert('Lỗi', error.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      showAlert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const response = await resetPasswordApi(resetToken, newPassword, confirmPassword);
      showAlert('Thành công', response.message || 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.', () => {
        router.replace('/(auth)/login');
      });
    } catch (error: any) {
      showAlert('Lỗi', error.message || 'Đặt lại mật khẩu thất bại.');
    } finally {
      setLoading(false);
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
          {/* Top Hero Section */}
          <ImageBackground source={heroBg} style={styles.heroSection} resizeMode="cover">
            <LinearGradient
              colors={['rgba(0, 33, 23, 0.4)', 'rgba(0, 33, 23, 0.75)', '#064E3B']}
              style={styles.heroGradient}
            >
              <View style={styles.topBar}>
                <TouchableOpacity
                  onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}
                  style={styles.backButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                  <Text style={styles.backButtonText}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.heroCenter}>
                <View style={styles.sportBadge}>
                  <Ionicons name="key" size={13} color="#FED01B" style={{ marginRight: 5 }} />
                  <Text style={styles.sportBadgeText}>KHÔI PHỤC TÀI KHOẢN</Text>
                </View>
                <Text style={styles.heroHeadline}>FORGOT{'\n'}PASSWORD</Text>
              </View>
            </LinearGradient>
          </ImageBackground>

          {/* Curved White Sheet */}
          <View style={styles.sheetContainer}>
            {/* STEP 1: REQUEST OTP */}
            {step === 'REQUEST_OTP' && (
              <View style={styles.stepBox}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="email-lock-outline" size={32} color="#064E3B" />
                </View>

                <Text style={styles.welcomeTitle}>Quên mật khẩu?</Text>
                <Text style={styles.welcomeSubtitle}>
                  Nhập địa chỉ email đăng ký tài khoản Sporta của bạn để nhận mã OTP xác thực.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Địa chỉ Email</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="email-outline" size={20} color="#064E3B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="name@example.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholderTextColor="#9AA1A9"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryPillButton, loading && styles.btnDisabled]}
                  onPress={handleSendOtp}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  <Text style={styles.primaryPillButtonText}>
                    {loading ? 'Đang gửi mã...' : 'Gửi mã OTP xác thực'}
                  </Text>
                  {!loading && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2: VERIFY OTP */}
            {step === 'VERIFY_OTP' && (
              <View style={styles.stepBox}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="shield-key-outline" size={32} color="#064E3B" />
                </View>

                <Text style={styles.welcomeTitle}>Nhập mã OTP</Text>
                <Text style={styles.welcomeSubtitle}>
                  Mã xác thực gồm 6 chữ số đã được gửi tới hộp thư:
                </Text>
                <View style={styles.emailPillBadge}>
                  <Ionicons name="mail" size={14} color="#064E3B" style={{ marginRight: 6 }} />
                  <Text style={styles.emailPillText}>{email}</Text>
                </View>

                {/* 6 OTP Boxes */}
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

                {/* Resend Section */}
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

                <TouchableOpacity
                  style={[styles.primaryPillButton, loading && styles.btnDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  <Text style={styles.primaryPillButtonText}>
                    {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
                  </Text>
                  {!loading && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === 'RESET_PASSWORD' && (
              <View style={styles.stepBox}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="lock-reset" size={32} color="#064E3B" />
                </View>

                <Text style={styles.welcomeTitle}>Đặt lại mật khẩu</Text>
                <Text style={styles.welcomeSubtitle}>
                  Tạo mật khẩu mới an toàn cho tài khoản Sporta của bạn.
                </Text>

                {/* New Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color="#064E3B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      placeholderTextColor="#9AA1A9"
                    />
                    <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.iconButton}>
                      <MaterialCommunityIcons
                        name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#8A929A"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="lock-check-outline" size={20} color="#064E3B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      placeholderTextColor="#9AA1A9"
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.iconButton}>
                      <MaterialCommunityIcons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#8A929A"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryPillButton, loading && styles.btnDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  <Text style={styles.primaryPillButtonText}>
                    {loading ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
                  </Text>
                  {!loading && <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>
            )}
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
    paddingTop: 28,
    paddingBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  stepBox: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F0F5F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4E2D9',
    marginBottom: 16,
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
    marginBottom: 20,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#191C20',
    marginBottom: 6,
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
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#151C27',
    fontWeight: '600',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  iconButton: {
    padding: 6,
  },
  emailPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5F2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    marginTop: -8,
    marginBottom: 24,
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
    marginBottom: 20,
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
    marginBottom: 24,
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
    marginTop: 8,
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
