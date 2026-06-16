import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export function BookingDetailScreen() {
  const router = useRouter();
  const { facilityId } = useLocalSearchParams<{ facilityId: string }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#064E3B" />
        </TouchableOpacity>
        <Text style={styles.title}>Chi Tiết Sân</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ID Sân vận động:</Text>
          <Text style={styles.cardValue}>{facilityId || 'N/A'}</Text>
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
  cardLabel: {
    fontFamily: 'HankenGrotesk-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardValue: {
    fontFamily: 'HankenGrotesk-Bold',
    fontSize: 18,
    color: '#191C20',
  },
});
