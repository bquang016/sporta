import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { loginApi } from '../../../../shared/api/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Button } from '../../../../shared/ui';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginApi(email, password);
      const username = email.split('@')[0];
      const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);
      
      if (Platform.OS === 'web') {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', capitalizedUsername);
      } else {
        await SecureStore.setItemAsync('accessToken', response.accessToken);
        await SecureStore.setItemAsync('userEmail', email);
        await SecureStore.setItemAsync('userName', capitalizedUsername);
      }
      if (Platform.OS !== 'web') {
        Alert.alert('Thành công', response.message);
      } else {
        window.alert(response.message);
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      if (Platform.OS !== 'web') {
        Alert.alert('Lỗi', error.message || 'Email hoặc mật khẩu không đúng.');
      } else {
        window.alert('Lỗi: ' + (error.message || 'Email hoặc mật khẩu không đúng.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>Sporta</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Chào mừng quay trở lại</Text>
        <Text style={styles.subtitle}>Vui lòng đăng nhập để tiếp tục hành trình tập luyện</Text>

        {/* Form */}
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

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <Button 
            title="Đăng nhập"
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleLogin}
          />
        </View>

		{/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Hoặc đăng nhập với</Text>
          <View style={styles.divider} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialContainer}>
          <Button 
            variant="outline"
            style={styles.socialButton}
            onPress={() => console.log('Google login')}
            icon={<MaterialCommunityIcons name="google" size={18} color="#DB4437" />}
            title="Google"
          />
          <Button 
            variant="outline"
            style={styles.socialButton}
            onPress={() => console.log('Facebook login')}
            icon={<MaterialCommunityIcons name="facebook" size={18} color="#4267B2" />}
            title="Facebook"
          />
        </View>
        
        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Đăng ký</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoBadge: {
    backgroundColor: COLORS.primary, // Green Forest Green
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.default, // Standard 8px
  },
  logoText: {
    color: COLORS.secondary, // Yellow brand Gold
    fontSize: 24,
    fontFamily: TYPOGRAPHY.headlineLgMobile.fontFamily,
    fontWeight: TYPOGRAPHY.headlineLgMobile.fontWeight,
    fontStyle: 'italic',
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
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: COLORS.primary, // Green link
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: TYPOGRAPHY.labelMd.fontWeight,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
  dividerText: {
    marginHorizontal: 10,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontWeight: TYPOGRAPHY.labelSm.fontWeight,
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 0.48,
    height: 48,
    borderColor: COLORS.outlineVariant,
    borderRadius: BORDER_RADIUS.default,
  },
  footerContainer: {
    flexDirection: 'row',
    marginTop: 30,
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
    color: COLORS.primary, // Forest Green for sign up link
  }
});
