import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang chủ Phát triển (Menu test)</Text>
      <Text style={styles.subtitle}>Nhấn vào các nút dưới đây để chuyển hướng nhanh đến các trang đã tạo.</Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.buttonText}>Đăng nhập (Login)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/(auth)/register')}
      >
        <Text style={styles.buttonText}>Đăng ký (Register)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push({
          pathname: '/(auth)/otp-verify',
          params: { email: 'test@gmail.com' }
        })}
      >
        <Text style={styles.buttonText}>Xác thực OTP (OTP Verify)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/(auth)/personal-info')}
      >
        <Text style={styles.buttonText}>Thông tin cá nhân (Personal Info)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/(auth)/sport-level')}
      >
        <Text style={styles.buttonText}>Bộ môn & Trình độ (Sport Level)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#2A5C43',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    backgroundColor: '#FFCC00',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  }
});
