import { useState, useEffect, useRef } from 'react';
import { Platform, Animated, PanResponder, LayoutAnimation, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import { loginApi, googleLoginApi } from '../../../../shared/api/auth';
import { useAlert } from '../../../../shared/contexts/AlertContext';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  
  // Trạng thái cho banner Hợp tác Sporta nổi
  const [isPromoVisible, setIsPromoVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const { showAlert, showConfirm } = useAlert();
  const router = useRouter();

  const isExpandedRef = useRef(isExpanded);

  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  useEffect(() => {
    const timer = setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Xử lý kéo thả cho Banner nổi
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

  // Google Sign-In setup
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '109569873589-sqselp48lq4blv5f8g4icka0747tpbnt.apps.googleusercontent.com',
    webClientId: '109569873589-sqselp48lq4blv5f8g4icka0747tpbnt.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleBackendGoogleLogin(id_token);
      }
    } else if (response?.type === 'error') {
      const errorMsg = response.error?.message || 'Không thể đăng nhập Google.';
      showAlert('Lỗi đăng nhập Google', errorMsg);
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
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error(error);
      showAlert('Lỗi xác thực', error.message || 'Xác thực Google thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    promptAsync();
  };

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      showAlert('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!password) {
      showAlert('Lỗi', 'Vui lòng nhập mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginApi(email, password);
      let realFullName = email.split('@')[0];
      realFullName = realFullName.charAt(0).toUpperCase() + realFullName.slice(1);
      let realAvatar: string | null = null;

      if (Platform.OS === 'web') {
        localStorage.setItem('accessToken', response.accessToken);
      } else {
        await SecureStore.setItemAsync('accessToken', response.accessToken);
      }

      // Sync real profile from backend
      try {
        const { usersApi } = require('../../../../shared/api/users');
        const profile = await usersApi.getProfile();
        if (profile && profile.fullName) {
          realFullName = profile.fullName;
          realAvatar = profile.avatarUrl || null;
        }
      } catch (err) {
        console.log('Profile sync on login warning:', err);
      }
      
      if (Platform.OS === 'web') {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', realFullName);
        if (realAvatar) {
          localStorage.setItem('userAvatar', realAvatar);
        } else {
          localStorage.removeItem('userAvatar');
        }
      } else {
        await SecureStore.setItemAsync('userEmail', email);
        await SecureStore.setItemAsync('userName', realFullName);
        if (realAvatar) {
          await SecureStore.setItemAsync('userAvatar', realAvatar);
        } else {
          await SecureStore.deleteItemAsync('userAvatar');
        }
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      showAlert('Lỗi', error.message || 'Email hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  return {
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
    isPromoVisible,
    setIsPromoVisible,
    isExpanded,
    pan,
    panResponder,
    handleGoogleLogin,
    handleLogin,
    router,
  };
}
