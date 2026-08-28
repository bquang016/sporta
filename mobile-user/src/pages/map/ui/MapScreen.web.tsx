import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../../shared/config/theme';
import { MaterialIcons } from '@expo/vector-icons';

export function MapScreen() {
  return (
    <View style={styles.container}>
      <MaterialIcons name="map" size={64} color={COLORS.outline} />
      <Text style={styles.text}>Bản đồ không hỗ trợ trên Web</Text>
      <Text style={styles.subtext}>
        Vui lòng sử dụng ứng dụng trên thiết bị di động (iOS/Android) hoặc máy ảo để trải nghiệm tính năng bản đồ.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 32,
  },
  text: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: '600',
    fontSize: 20,
    color: COLORS.onSurface,
    marginTop: 16,
    textAlign: 'center',
  },
  subtext: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MapScreen;
