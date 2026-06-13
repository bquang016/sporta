import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function SocialScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Social Screen</Text>
      <Text style={styles.subtitle}>Sporta Platform - Cộng đồng & Cáp kèo đấu</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
});
