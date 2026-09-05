import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Marker } from 'react-native-maps';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import { MapVenue } from '../../../entities/facility/model/useMapFacilities';
import { ClusterMarker } from '../model/useFacilitySearch';

// ---------------------------------------------------------------------------
// Sport icon helper
// ---------------------------------------------------------------------------
type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];
type CommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export const SPORT_ICON_MAP: Record<
  string,
  { type: 'material' | 'community'; name: string }
> = {
  'bóng đá': { type: 'material', name: 'sports-soccer' },
  'football': { type: 'material', name: 'sports-soccer' },
  'soccer': { type: 'material', name: 'sports-soccer' },
  'cầu lông': { type: 'community', name: 'badminton' },
  'badminton': { type: 'community', name: 'badminton' },
  'tennis': { type: 'material', name: 'sports-tennis' },
  'bóng rổ': { type: 'material', name: 'sports-basketball' },
  'basketball': { type: 'material', name: 'sports-basketball' },
  'pickleball': { type: 'material', name: 'sports-tennis' },
  'bóng chuyền': { type: 'material', name: 'sports-volleyball' },
  'volleyball': { type: 'material', name: 'sports-volleyball' },
};

export const getSportIcon = (sport?: string | null) => {
  if (!sport) return { type: 'material', name: 'place' };
  const key = sport.toLowerCase();
  return SPORT_ICON_MAP[key] ?? { type: 'material', name: 'place' };
};

// ---------------------------------------------------------------------------
// Single Venue Marker
// ---------------------------------------------------------------------------
interface VenueMarkerProps {
  venue: MapVenue;
  isActive: boolean;
  onPress: (venueId: string) => void;
}

export const VenueMarker = memo(
  ({ venue, isActive, onPress }: VenueMarkerProps) => {
    const sportIcon = getSportIcon(venue.sportName);
    const [tracksViewChanges, setTracksViewChanges] = useState(true);

    useEffect(() => {
      setTracksViewChanges(true);
      const timer = setTimeout(() => {
        setTracksViewChanges(false);
      }, 200);
      return () => clearTimeout(timer);
    }, [isActive]);

    return (
      <Marker
        key={venue.id}
        coordinate={{ latitude: venue.latitude, longitude: venue.longitude }}
        onPress={(e) => {
          if (e && e.stopPropagation) {
            e.stopPropagation();
          }
          onPress(venue.id);
        }}
        tracksViewChanges={tracksViewChanges}
        anchor={{ x: 0.5, y: 1 }}
        zIndex={isActive ? 99 : 1}
      >
        <View key={isActive ? 'active' : 'inactive'} style={styles.pinWrapper}>
          {/* Pin bubble */}
          <View
            style={[
              styles.pinBubble,
              isActive && styles.pinBubbleActive,
            ]}
          >
            {sportIcon.type === 'material' ? (
              <MaterialIcons
                name={sportIcon.name as MaterialIconName}
                size={18}
                color={isActive ? COLORS.white : COLORS.primary}
              />
            ) : (
              <MaterialCommunityIcons
                name={sportIcon.name as CommunityIconName}
                size={18}
                color={isActive ? COLORS.white : COLORS.primary}
              />
            )}
          </View>

          {/* Mũi tên chân Pin */}
          <View
            style={[styles.pinArrow, isActive && styles.pinArrowActive]}
          />
        </View>
      </Marker>
    );
  }
);

VenueMarker.displayName = 'VenueMarker';

// ---------------------------------------------------------------------------
// Cluster Marker
// ---------------------------------------------------------------------------
interface ClusterMarkerViewProps {
  cluster: ClusterMarker;
  onPress: (cluster: ClusterMarker) => void;
}

export const ClusterMarkerView = memo(
  ({ cluster, onPress }: ClusterMarkerViewProps) => {
    const size = cluster.count >= 50 ? 56 : cluster.count >= 20 ? 48 : 42;

    return (
      <Marker
        key={cluster.id}
        coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
        onPress={(e) => {
          if (e && e.stopPropagation) {
            e.stopPropagation();
          }
          onPress(cluster);
        }}
        tracksViewChanges={false}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.clusterBubble,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
          onPress={(e) => {
            if (e && e.stopPropagation) {
              e.stopPropagation();
            }
            onPress(cluster);
          }}
        >
          <View
            style={[
              styles.clusterRing,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          />
          <Text style={styles.clusterCount}>{cluster.count}</Text>
          <Text style={styles.clusterLabel}>sân</Text>
        </TouchableOpacity>
      </Marker>
    );
  }
);

ClusterMarkerView.displayName = 'ClusterMarkerView';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  pinWrapper: {
    alignItems: 'center',
  },
  pinBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  pinBubbleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.white,
    borderWidth: 2.5,
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
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
    borderTopColor: COLORS.primary,
    marginTop: -1,
  },
  pinArrowActive: {
    borderTopColor: COLORS.primary,
  },
  clusterBubble: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  clusterRing: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: COLORS.secondary,
    backgroundColor: 'transparent',
  },
  clusterCount: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: '700' as const,
    fontSize: 15,
    color: COLORS.white,
    lineHeight: 17,
  },
  clusterLabel: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 9,
    color: COLORS.secondary,
    lineHeight: 11,
  },
});
