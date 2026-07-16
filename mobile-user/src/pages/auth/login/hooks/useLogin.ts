import { useState, useEffect, useRef } from 'react';
import { Platform, Animated, PanResponder, LayoutAnimation, Dimensions } from 'react-native';
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
  // State cho Custom Alert Modal
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success'>('error');

  const showAlert = (title: string, message: string, type: 'error' | 'success' = 'error') => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const hideAlert = () => setAlertVisible(false);

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
      showAlert('Lỗi đăng nhập Google', errorMsg, 'error');
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
        showAlert('Thành công', response.message, 'success');
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error(error);
      showAlert('Lỗi xác thực', error.message || 'Xác thực Google thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    promptAsync();
  };

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      showAlert('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ.', 'error');
      return;
    }
    if (!password) {
      showAlert('Lỗi', 'Vui lòng nhập mật khẩu.', 'error');
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
      showAlert('Thành công', response.message, 'success');
      router.replace('/(tabs)');
    } catch (error: any) {
      showAlert('Lỗi', error.message || 'Email hoặc mật khẩu không đúng.', 'error');
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
    alertVisible,
    alertTitle,
    alertMessage,
    alertType,
    hideAlert,
    handleGoogleLogin,
    handleLogin,
    router,
  };
}
