import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../shared/config/theme';

export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      <Text style={styles.subtitle}>Sporta Platform - Thông tin & Cài đặt cá nhân</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    ...TYPOGRAPHY.headlineLgMobile,
    color: COLORS.onSurface,
    marginBottom: SPACING.base,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurfaceVariant,
  },
});
