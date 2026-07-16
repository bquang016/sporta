import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { verifyOtp, sendOtp } from '../../../../shared/api/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Button } from '../../../../shared/ui';

export function OtpVerifyScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const router = useRouter();
  const { email, password } = useLocalSearchParams();
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã 6 số.');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(email as string, otpCode);
      
      if (response.isNewUser) {
        // Bỏ window.alert vì nó có thể làm đứt luồng JS trên Web
        if (Platform.OS !== 'web') {
          Alert.alert('Thành công', 'Xác thực OTP thành công!');
        }
        
        // Đảm bảo params là string
        router.push({ 
          pathname: '/(auth)/personal-info', 
          params: { 
            registrationToken: response.registrationToken, 
            email: email as string, 
            password: password as string 
          } 
        });
      } else {
        // User exists, save access token and go home
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
        
        if (Platform.OS !== 'web') {
          Alert.alert('Thành công', response.message);
        }
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      if (Platform.OS !== 'web') {
        Alert.alert('Lỗi', error.message || 'Mã OTP không đúng hoặc đã hết hạn.');
      } else {
        window.alert('Lỗi: ' + (error.message || 'Mã OTP không đúng hoặc đã hết hạn.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await sendOtp(email as string);
      if (response.otp) {
        Alert.alert('Thành công', `Đã gửi lại mã OTP. Mã OTP của bạn là: ${response.otp}`);
      } else {
        Alert.alert('Thành công', 'Đã gửi lại mã OTP.');
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/register')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác thực OTP</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>
          Chúng tôi đã gửi mã 6 chữ số đến gmail của bạn{'\n'}({email})
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.otpInput,
                focusedIndex === index && styles.otpInputFocused
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleResend} style={styles.resendContainer}>
          <Text style={styles.resendText}>Gửi lại mã ngay</Text>
        </TouchableOpacity>

        <Button 
          title="Xác nhận & Tiếp tục"
          variant="primary"
          size="lg"
          onPress={handleVerify}
          loading={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: SPACING.marginMobile,
    paddingBottom: SPACING.md,
    zIndex: 10,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    marginLeft: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.marginMobile,
    paddingTop: SPACING.md,
  },
  instruction: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.primary,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  otpInput: {
    width: 52,
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.md,
    ...TYPOGRAPHY.headlineLg,
    textAlign: 'center',
    color: COLORS.onSurface,
    backgroundColor: COLORS.surface,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  otpInputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.surfaceBright,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  resendText: {
    color: COLORS.primary,
    ...TYPOGRAPHY.labelMd,
    fontWeight: '600',
  },
});
