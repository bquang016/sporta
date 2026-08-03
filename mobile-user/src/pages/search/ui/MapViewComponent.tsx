import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Facility } from '../../../entities/facility';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface MapViewComponentProps {
  facilities: Facility[];
  userLocation?: { latitude: number; longitude: number } | null;
  onMarkerPress: (facility: Facility) => void;
}

export function MapViewComponent({ facilities, userLocation, onMarkerPress }: MapViewComponentProps) {
  // Center map on user location or default (Hanoi)
  const initialRegion = {
    latitude: userLocation?.latitude || 21.028511,
    longitude: userLocation?.longitude || 105.804817,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={!!userLocation}
      >
        {facilities.map((facility) => {
          if (!facility.latitude || !facility.longitude) return null;
          
          const lat = facility.latitude;
          const lng = facility.longitude;

          return (
            <Marker
              key={facility.id}
              coordinate={{ latitude: lat, longitude: lng }}
            >
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>{facility.price}</Text>
              </View>
              <Callout onPress={() => onMarkerPress(facility)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>{facility.name}</Text>
                  <View style={styles.ratingRow}>
                    <MaterialIcons name="star" size={14} color={COLORS.amber} />
                    <Text style={styles.ratingText}>{facility.rating}</Text>
                  </View>
                  <Text style={styles.calloutAction}>Chạm để xem</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    margin: SPACING.marginMobile,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  priceTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  priceText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  calloutContainer: {
    padding: SPACING.xs,
    width: 150,
  },
  calloutTitle: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    ...TYPOGRAPHY.labelSm,
    marginLeft: 4,
  },
  calloutAction: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.primary,
  }
});
