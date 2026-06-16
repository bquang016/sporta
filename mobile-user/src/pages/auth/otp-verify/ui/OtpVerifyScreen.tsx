import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export function OtpVerifyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Xác Thực OTP</Text>
        <Text style={styles.subtitle}>Nhập mã xác thực đã được gửi</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.buttonText}>Xác nhận</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9FF',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#064E3B',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'HankenGrotesk-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#FACC15',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'HankenGrotesk-Bold',
    color: '#191c20',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
