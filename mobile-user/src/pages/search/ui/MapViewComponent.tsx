import React, { useEffect, useState, memo } from 'react';
import { View, StyleSheet, Text, Keyboard } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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
  distances?: Record<string, number>;
  isFullScreen?: boolean;
  mapRef?: React.RefObject<any>;
  selectedFacilityId?: string | null;
  onMapPress?: () => void;
}

interface SingleMarkerProps {
  facility: Facility;
  displayMode: MapDisplayMode;
  isSelected: boolean;
  onMarkerPress: (facility: Facility) => void;
  distance?: number;
}

const SingleSearchMarker = memo(
  ({ facility, displayMode, isSelected, onMarkerPress, distance }: SingleMarkerProps) => {
    const [tracksViewChanges, setTracksViewChanges] = useState(true);

    useEffect(() => {
      setTracksViewChanges(true);
      const timer = setTimeout(() => {
        setTracksViewChanges(false);
      }, 200);
      return () => clearTimeout(timer);
    }, [isSelected, displayMode]);

    const getMarkerLabel = () => {
      switch (displayMode) {
        case 'price':
          if (!facility.price) return '0 VND';
          if (facility.price.includes('VND') || facility.price.includes('đ')) {
            return facility.price.replace('/h', '');
          }
          return `${facility.price} VND`;
        case 'distance':
          return distance !== undefined ? `${distance.toFixed(1)} km` : 'N/A';
        case 'sport':
          return facility.sport || 'Thể thao';
        case 'rating':
          return facility.rating > 0 ? `⭐ ${facility.rating.toFixed(1)}` : 'Mới';
        default:
          return facility.price || '0 VND';
      }
    };

    const getBubbleStyle = () => {
      switch (displayMode) {
        case 'sport':
          return styles.sportBubble;
        case 'rating':
          return styles.ratingBubble;
        case 'distance':
          return styles.distanceBubble;
        default:
          return styles.priceBubble;
      }
    };

    const getArrowStyle = () => {
      switch (displayMode) {
        case 'sport':
          return styles.sportArrow;
        case 'rating':
          return styles.ratingArrow;
        case 'distance':
          return styles.distanceArrow;
        default:
          return styles.priceArrow;
      }
    };

    return (
      <Marker
        key={facility.id}
        coordinate={{
          latitude: facility.latitude as number,
          longitude: facility.longitude as number,
        }}
        anchor={{ x: 0.5, y: 1 }}
        tracksViewChanges={tracksViewChanges}
        onPress={(e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          onMarkerPress(facility);
        }}
        zIndex={isSelected ? 99 : 1}
      >
        <View key={isSelected ? 'active' : 'inactive'} style={styles.pinWrapper}>
          <View
            style={[
              styles.pinBubble,
              getBubbleStyle(),
              isSelected && styles.activeBubble,
            ]}
          >
            {displayMode === 'sport' ? (
              (() => {
                const sportIcon = getSportIcon(facility.sport);
                return sportIcon.type === 'material' ? (
                  <MaterialIcons
                    name={sportIcon.name as any}
                    size={18}
                    color={isSelected ? COLORS.white : COLORS.primary}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={sportIcon.name as any}
                    size={18}
                    color={isSelected ? COLORS.white : COLORS.primary}
                  />
                );
              })()
            ) : (
              <Text
                style={[
                  styles.pinText,
                  displayMode === 'distance' && styles.distanceText,
                  isSelected && styles.activePinText,
                ]}
              >
                {getMarkerLabel()}
              </Text>
            )}
          </View>
          <View
            style={[
              styles.pinArrow,
              getArrowStyle(),
              isSelected && styles.activeArrow,
            ]}
          />
        </View>
      </Marker>
    );
  }
);

SingleSearchMarker.displayName = 'SingleSearchMarker';

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

  useEffect(() => {
    if (facilities && facilities.length > 0 && mapRef && mapRef.current) {
      const coords = facilities
        .filter((f) => f.latitude && f.longitude)
        .map((f) => ({
          latitude: f.latitude as number,
          longitude: f.longitude as number,
        }));

      if (coords.length > 0) {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 70, right: 40, bottom: 260, left: 40 },
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
        showsCompass={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onPress={() => {
          Keyboard.dismiss();
          if (onMapPress) onMapPress();
        }}
      >
        {facilities.map((facility) => {
          if (!facility.latitude || !facility.longitude) return null;

          return (
            <SingleSearchMarker
              key={facility.id}
              facility={facility}
              displayMode={displayMode}
              isSelected={selectedFacilityId === facility.id}
              onMarkerPress={onMarkerPress}
              distance={distances[facility.id]}
            />
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
  },
  pinBubble: {
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
  },
  pinText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.white,
  },
  distanceText: {
    color: COLORS.primary,
  },
  activePinText: {
    color: COLORS.white,
  },
  pinArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },

  // Display Modes
  priceBubble: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.surface,
  },
  priceArrow: {
    borderTopColor: COLORS.primary,
  },

  sportBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  sportArrow: {
    borderTopColor: COLORS.primary,
  },

  ratingBubble: {
    backgroundColor: '#D97706',
    borderColor: COLORS.surface,
  },
  ratingArrow: {
    borderTopColor: '#D97706',
  },

  distanceBubble: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
  },
  distanceArrow: {
    borderTopColor: COLORS.primary,
  },

  activeBubble: {
    backgroundColor: '#047857',
    borderColor: COLORS.white,
    borderWidth: 2.5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  activeArrow: {
    borderTopColor: '#047857',
  },
});
