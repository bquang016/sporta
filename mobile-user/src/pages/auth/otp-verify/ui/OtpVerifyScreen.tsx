import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { verifyOtp, sendOtp } from '../../../../shared/api/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export function OtpVerifyScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
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
        if (Platform.OS === 'web') {
          localStorage.setItem('accessToken', response.accessToken);
        } else {
          await SecureStore.setItemAsync('accessToken', response.accessToken);
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
      await sendOtp(email as string);
      Alert.alert('Thành công', 'Đã gửi lại mã OTP.');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/register')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#2A5C43" />
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
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleResend} style={styles.resendContainer}>
          <Text style={styles.resendText}>Gửi lại mã ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.verifyButton, loading && styles.verifyButtonDisabled]} 
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.verifyButtonText}>Xác nhận & Tiếp tục</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginLeft: 15,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  instruction: {
    fontSize: 16,
    color: '#2A5C43',
    lineHeight: 24,
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    color: '#333',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    color: '#2A5C43',
    fontSize: 14,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#FFCC00',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
