import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

export function WalletScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Ví Của Tôi</Text>
        <View style={styles.card}>
          <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
          <Text style={styles.balanceValue}>0đ</Text>
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
    backgroundColor: '#064E3B',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontFamily: 'HankenGrotesk-Regular',
    color: '#E8F5E9',
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  balanceValue: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    color: '#FACC15',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
