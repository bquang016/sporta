import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, Animated, PanResponder, LayoutAnimation, UIManager, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { loginApi, googleLoginApi } from '../../../../shared/api/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

WebBrowser.maybeCompleteAuthSession();

import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../shared/config/theme';
import { Button } from '../../../../shared/ui';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [isPromoVisible, setIsPromoVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const isExpandedRef = useRef(true);
  const router = useRouter();

  React.useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (e, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        const screenWidth = Dimensions.get('window').width;
        const containerWidth = isExpandedRef.current ? 180 : 52;
        const leftX = -(screenWidth - 40 - containerWidth);
        const currentX = (pan.x as any)._value;
        const currentY = (pan.y as any)._value;
        const midPoint = leftX / 2;

        const targetX = currentX < midPoint ? leftX : 0;

        Animated.spring(pan, {
          toValue: { x: targetX, y: currentY },
          useNativeDriver: false,
          friction: 6,
          tension: 40,
        }).start();
      }
    })
  ).current;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '109569873589-sqselp48lq4blv5f8g4icka0747tpbnt.apps.googleusercontent.com',
    webClientId: '109569873589-sqselp48lq4blv5f8g4icka0747tpbnt.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleBackendGoogleLogin(id_token);
      }
    } else if (response?.type === 'error') {
      const errorMsg = response.error?.message || 'Không thể đăng nhập Google.';
      if (Platform.OS === 'web') {
        window.alert('Lỗi đăng nhập Google: ' + errorMsg);
      } else {
        Alert.alert('Lỗi đăng nhập Google', errorMsg);
      }
    }
  }, [response]);

  const handleBackendGoogleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const response = await googleLoginApi(idToken);
      if (response.isNewUser) {
        const dummyPassword = `google_${Math.random().toString(36).substring(2, 11)}`;
        router.push({
          pathname: '/(auth)/personal-info',
          params: {
            registrationToken: response.registrationToken,
            email: response.email,
            password: dummyPassword,
            fullName: response.fullName
          }
        });
      } else {
        if (Platform.OS === 'web') {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('userEmail', response.email);
          localStorage.setItem('userName', response.fullName);
        } else {
          await SecureStore.setItemAsync('accessToken', response.accessToken);
          await SecureStore.setItemAsync('userEmail', response.email);
          await SecureStore.setItemAsync('userName', response.fullName);
        }
        if (Platform.OS !== 'web') {
          Alert.alert('Thành công', response.message);
        } else {
          window.alert(response.message);
        }
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error(error);
      if (Platform.OS !== 'web') {
        Alert.alert('Lỗi xác thực', error.message || 'Xác thực Google thất bại.');
      } else {
        window.alert('Lỗi xác thực: ' + (error.message || 'Xác thực Google thất bại.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    promptAsync();
  };

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
            onPress={handleGoogleLogin}
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

      {/* Floating Partner Promo */}
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
  },
  floatingPromoContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30,
    right: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
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
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  promoTextContainer: {
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.labelMd.fontFamily,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  promoSubtitle: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    color: COLORS.onSurfaceVariant,
  },
  promoCloseButton: {
    position: 'absolute',
    top: 14,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
