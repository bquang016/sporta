import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { sendOtp } from '../../../../shared/api/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Button } from '../../../../shared/ui';

export function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [isFocusedConfirm, setIsFocusedConfirm] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(email);
      router.push({ 
        pathname: '/(auth)/otp-verify', 
        params: { email, password } 
      });
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Email này đã tồn tại hoặc có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/login')} 
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Đăng ký tài khoản</Text>
        <Text style={styles.subtitle}>Vui lòng đăng ký tài khoản để tiếp tục hành trình tập luyện</Text>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={[
            styles.inputContainer,
            isFocusedEmail && styles.inputContainerFocused
          ]}>
            <MaterialCommunityIcons 
              name="email-outline" 
              size={20} 
              color={isFocusedEmail ? COLORS.primary : COLORS.outline} 
              style={styles.inputIcon} 
            />
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
          <View style={[
            styles.inputContainer,
            isFocusedPassword && styles.inputContainerFocused
          ]}>
            <MaterialCommunityIcons 
              name="lock-outline" 
              size={20} 
              color={isFocusedPassword ? COLORS.primary : COLORS.outline} 
              style={styles.inputIcon} 
            />
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
              <MaterialCommunityIcons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={COLORS.outline} 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nhập lại mật khẩu</Text>
          <View style={[
            styles.inputContainer,
            isFocusedConfirm && styles.inputContainerFocused
          ]}>
            <MaterialCommunityIcons 
              name="lock-outline" 
              size={20} 
              color={isFocusedConfirm ? COLORS.primary : COLORS.outline} 
              style={styles.inputIcon} 
            />
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
              <MaterialCommunityIcons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={COLORS.outline} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.submitContainer}>
            <Button 
              title="Đăng ký"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleRegister}
            />
          </View>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: TYPOGRAPHY.headlineMd.fontWeight,
    color: COLORS.primary,
    marginLeft: 15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    marginTop: -50,
  },
  title: {
    fontSize: 24,
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: TYPOGRAPHY.headlineMd.fontWeight,
    color: COLORS.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontWeight: TYPOGRAPHY.bodyMd.fontWeight,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  formContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: TYPOGRAPHY.labelMd.fontWeight,
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default, // 8px
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 15,
    backgroundColor: COLORS.surface,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary, // Forest Green border on focus
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    color: COLORS.onSurface,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  submitContainer: {
    marginTop: 15,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    color: COLORS.onSurfaceVariant,
  },
  footerLink: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: 'bold',
    color: COLORS.primary, // Forest Green for sign in link
  }
});
