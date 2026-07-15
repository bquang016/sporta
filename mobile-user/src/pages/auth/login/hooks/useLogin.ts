import { useState, useEffect, useRef } from 'react';
import { Platform, Alert, Animated, PanResponder, LayoutAnimation, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import { loginApi, googleLoginApi } from '../../../../shared/api/auth';

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
  const isExpandedRef = useRef(true);
  const router = useRouter();

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
