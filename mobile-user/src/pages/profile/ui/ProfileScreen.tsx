import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#064E3B" />
        </TouchableOpacity>
        <Text style={styles.title}>Thiết Lập Cá Nhân</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>Thông tin cá nhân và cài đặt ứng dụng.</Text>
        </View>
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
    paddingTop: 48,
  },
  backButton: {
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#064E3B',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardText: {
    fontFamily: 'HankenGrotesk-Regular',
    color: '#6B7280',
    fontSize: 16,
  },
});
