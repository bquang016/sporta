import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Keyboard } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Facility } from '../../../entities/facility';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../shared/config/theme';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getSportIcon } from '../../../features/map-search/ui/FacilityMarker';
import { MapDisplayMode } from './MapDisplayOptions';


interface MapViewComponentProps {
  facilities: Facility[];
  userLocation?: { latitude: number; longitude: number } | null;
  onMarkerPress: (facility: Facility) => void;
  displayMode?: MapDisplayMode;
  distances?: Record<string, number>; // distance in km by facility id
  isFullScreen?: boolean;
  mapRef?: React.RefObject<any>; // MapView ref
  selectedFacilityId?: string | null;
  onMapPress?: () => void;
}

export function MapViewComponent({ facilities, userLocation, onMarkerPress, displayMode = 'price', distances = {}, isFullScreen = false, mapRef, selectedFacilityId, onMapPress }: MapViewComponentProps) {
  // Center map on user location or default (Hanoi)
  const initialRegion = {
    latitude: userLocation?.latitude || 21.028511,
    longitude: userLocation?.longitude || 105.804817,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const getMarkerLabel = (facility: Facility) => {
    switch (displayMode) {
      case 'price':
        return facility.price;
      case 'distance':
        const d = distances[facility.id];
        return d !== undefined ? `${d.toFixed(1)} km` : 'N/A';
      case 'sport':
        return facility.sport;
      case 'rating':
        return `⭐ ${facility.rating}`;
      default:
        return facility.price;
    }
  };

  const getBubbleStyle = () => {
    switch (displayMode) {
      case 'sport': return styles.sportBubble;
      case 'rating': return styles.ratingBubble;
      case 'distance': return styles.distanceBubble;
      default: return styles.priceBubble;
    }
  };

  const getArrowStyle = () => {
    switch (displayMode) {
      case 'sport': return styles.sportArrow;
      case 'rating': return styles.ratingArrow;
      case 'distance': return styles.distanceArrow;
      default: return styles.priceArrow;
    }
  };

  useEffect(() => {
    if (facilities && facilities.length > 0 && mapRef && mapRef.current) {
      const coords = facilities
        .filter(f => f.latitude && f.longitude)
        .map(f => ({ latitude: f.latitude as number, longitude: f.longitude as number }));
      
      if (coords.length > 0) {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 60, right: 40, bottom: 250, left: 40 },
          animated: true,
        });
      }
    }
  }, [facilities]);

  return (
    <View style={[styles.container, isFullScreen && styles.fullScreenContainer]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={!!userLocation}
        onPress={() => {
          Keyboard.dismiss();
          if (onMapPress) onMapPress();
        }}
      >
        {facilities.map((facility) => {
          if (!facility.latitude || !facility.longitude) return null;
          
          const lat = facility.latitude;
          const lng = facility.longitude;

          return (
            <Marker
              key={`${facility.id}-${displayMode}`}
              coordinate={{ latitude: lat, longitude: lng }}
              anchor={{ x: 0.5, y: 1 }}
              tracksViewChanges={false} // Improves performance, key change forces remount
              onPress={() => onMarkerPress(facility)}
              zIndex={selectedFacilityId === facility.id ? 99 : 1}
            >
              <View style={styles.pinWrapper}>
                <View style={[styles.pinBubble, getBubbleStyle(), selectedFacilityId === facility.id && styles.activeBubble]}>
                  {displayMode === 'sport' ? (
                    (() => {
                      const sportIcon = getSportIcon(facility.sport);
                      return sportIcon.type === 'material' ? (
                        <MaterialIcons
                          name={sportIcon.name as any}
                          size={18}
                          color={COLORS.primary}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name={sportIcon.name as any}
                          size={18}
                          color={COLORS.primary}
                        />
                      );
                    })()
                  ) : (
                    <Text style={[styles.pinText, displayMode === 'distance' && styles.distanceText]}>
                      {getMarkerLabel(facility)}
                    </Text>
                  )}
                </View>
                <View style={[styles.pinArrow, getArrowStyle(), selectedFacilityId === facility.id && styles.activeArrow]} />
              </View>

              <Callout onPress={() => onMarkerPress(facility)} tooltip>
                <View style={styles.customCallout}>
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
  fullScreenContainer: {
    margin: 0,
    borderRadius: 0,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  pinWrapper: {
    alignItems: 'center',
    paddingBottom: 2, // Space for callout
  },
  pinBubble: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  pinText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  distanceText: {
    color: COLORS.primary,
  },
  pinArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  
  // Display Modes
  priceBubble: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  priceArrow: {
    borderTopColor: COLORS.primary,
  },
  
  sportBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  sportArrow: {
    borderTopColor: COLORS.primary,
  },
  
  ratingBubble: {
    backgroundColor: COLORS.amber,
    borderColor: COLORS.amber,
  },
  ratingArrow: {
    borderTopColor: COLORS.amber,
  },
  
  distanceBubble: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
  },
  distanceArrow: {
    borderTopColor: COLORS.primary,
  },

  // Callout Styles
  customCallout: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    width: 160,
    alignItems: 'center',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: 8,
  },
  calloutTitle: {
    ...TYPOGRAPHY.labelMd,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
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
    marginTop: 2,
  },
  activeBubble: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.secondary,
    borderWidth: 3,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    elevation: 8,
    zIndex: 99,
  },
  activeArrow: {
    borderTopColor: COLORS.primary,
  },
});
