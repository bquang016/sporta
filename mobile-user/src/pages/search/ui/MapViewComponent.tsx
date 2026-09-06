import React, { useMemo } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { Facility } from '../../../entities/facility';
import { BORDER_RADIUS } from '../../../shared/config/theme';
import { MapDisplayMode } from './MapDisplayOptions';
import { GoongMapView, GoongMapViewRef } from '../../../features/map-search';

interface MapViewComponentProps {
  facilities: Facility[];
  userLocation?: { latitude: number; longitude: number } | null;
  onMarkerPress: (facility: Facility) => void;
  displayMode?: MapDisplayMode;
  distances?: Record<string, number>;
  isFullScreen?: boolean;
  mapRef?: React.RefObject<GoongMapViewRef | null>;
  selectedFacilityId?: string | null;
  onMapPress?: () => void;
}

export function MapViewComponent({
  facilities,
  userLocation,
  onMarkerPress,
  displayMode = 'price',
  distances = {},
  isFullScreen = false,
  mapRef,
  selectedFacilityId,
  onMapPress,
}: MapViewComponentProps) {
  const initialRegion = {
    latitude: userLocation?.latitude || 21.028511,
    longitude: userLocation?.longitude || 105.804817,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const markerVenues = useMemo(() => {
    return facilities
      .filter((f) => f.latitude && f.longitude)
      .map((f) => ({
        id: f.id,
        name: f.name,
        latitude: Number(f.latitude),
        longitude: Number(f.longitude),
        price: f.price,
        rating: f.rating,
        sportName: f.sport,
        distance: distances[f.id],
      }));
  }, [facilities, distances]);

  return (
    <View style={[styles.container, isFullScreen && styles.fullScreenContainer]}>
      <GoongMapView
        ref={mapRef as any}
        style={styles.map}
        venues={markerVenues}
        userLocation={userLocation}
        initialRegion={initialRegion}
        selectedVenueId={selectedFacilityId}
        displayMode={displayMode}
        onVenuePress={(venueId) => {
          const found = facilities.find((f) => String(f.id) === String(venueId));
          if (found) onMarkerPress(found);
        }}
        onMapPress={() => {
          Keyboard.dismiss();
          if (onMapPress) onMapPress();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  fullScreenContainer: {
    margin: 0,
    borderRadius: 0,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
