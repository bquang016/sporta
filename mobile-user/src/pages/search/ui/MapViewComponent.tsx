import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Facility } from '../../../entities/facility';
import { BORDER_RADIUS } from '../../../shared/config/theme';
import { GoongMapView, GoongMapViewRef } from '../../../features/map-search';

interface MapViewComponentProps {
  facilities: Facility[];
  userLocation?: { latitude: number; longitude: number } | null;
  onMarkerPress: (facility: Facility) => void;
  distances?: Record<string, number>;
  isFullScreen?: boolean;
  mapRef?: React.RefObject<GoongMapViewRef | any>;
  selectedFacilityId?: string | null;
  onMapPress?: () => void;
  displayMode?: any;
}

export const MapViewComponent = memo(
  ({
    facilities,
    userLocation,
    onMarkerPress,
    isFullScreen = false,
    mapRef,
    selectedFacilityId,
    onMapPress,
  }: MapViewComponentProps) => {
    return (
      <View style={[styles.container, isFullScreen && styles.fullScreenContainer]}>
        <GoongMapView
          ref={mapRef}
          venues={facilities}
          userLocation={userLocation}
          selectedVenueId={selectedFacilityId}
          onVenuePress={(venueId) => {
            const fac = facilities.find((f) => String(f.id) === String(venueId));
            if (fac) onMarkerPress(fac);
          }}
          onMapPress={onMapPress}
        />
      </View>
    );
  }
);

MapViewComponent.displayName = 'MapViewComponent';

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
});

export default MapViewComponent;
