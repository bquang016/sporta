import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Facility } from '../../../entities/facility';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../../shared/config/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { MapDisplayMode } from './MapDisplayOptions';

interface MapViewComponentProps {
  facilities?: Facility[];
  userLocation?: { latitude: number; longitude: number } | null;
  onMarkerPress?: (facility: Facility) => void;
  displayMode?: MapDisplayMode;
  distances?: Record<string, number>;
  isFullScreen?: boolean;
  mapRef?: React.RefObject<any>;
  selectedFacilityId?: string | null;
  onMapPress?: () => void;
}

export function MapViewComponent({ isFullScreen }: MapViewComponentProps) {
  return (
    <View style={[styles.container, isFullScreen && styles.fullScreenContainer]}>
      <MaterialIcons name="map" size={48} color={COLORS.outline} />
      <Text style={styles.text}>Bản đồ không hỗ trợ trên Web</Text>
      <Text style={styles.subtext}>
        Tính năng bản đồ chỉ hỗ trợ trên thiết bị di động (iOS/Android) hoặc giả lập.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    margin: SPACING.marginMobile,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerHigh || COLORS.surface,
    padding: 24,
    minHeight: 300,
  },
  fullScreenContainer: {
    margin: 0,
    borderRadius: 0,
  },
  text: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
    marginTop: 12,
    textAlign: 'center',
  },
  subtext: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: 6,
    textAlign: 'center',
  },
});
