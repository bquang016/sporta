import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Facility } from '../../../entities/facility';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface MapViewComponentProps {
  facilities: Facility[];
  userLocation?: { latitude: number; longitude: number } | null;
  onMarkerPress: (facility: Facility) => void;
}

export function MapViewComponent({ facilities }: MapViewComponentProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="map" size={48} color={COLORS.outline} />
      <Text style={styles.title}>Chế độ bản đồ trên Web</Text>
      <Text style={styles.subtitle}>
        Tính năng bản đồ trực quan với {facilities.length} địa điểm hiện hỗ trợ tốt nhất trên ứng dụng di động (iOS & Android).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    margin: SPACING.marginMobile,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderStyle: 'dashed',
  },
  title: {
    ...TYPOGRAPHY.titleMd,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xxs,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default MapViewComponent;
