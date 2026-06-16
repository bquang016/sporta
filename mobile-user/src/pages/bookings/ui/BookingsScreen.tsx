import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

export function BookingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Lịch Đặt Sân</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>Bạn chưa có lịch đặt sân nào hoạt động.</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '100%',
    alignItems: 'center',
  },
  cardText: {
    fontFamily: 'HankenGrotesk-Regular',
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
  },
});
