import React, { memo } from 'react';
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
  if (!sport) return { type: 'material', name: 'sports' };
  const key = sport.toLowerCase();
  return SPORT_ICON_MAP[key] ?? { type: 'material', name: 'sports' };
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
        tracksViewChanges={false}
        anchor={{ x: 0.5, y: 1 }}
      >
        <View style={styles.pinWrapper}>
          {/* Pop-up label khi active */}
          {isActive && (
            <View style={styles.pinLabel}>
              <Text style={styles.pinLabelText} numberOfLines={1}>
                {venue.name}
              </Text>
            </View>
          )}

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
                color={isActive ? COLORS.onPrimary : COLORS.primary}
              />
            ) : (
              <MaterialCommunityIcons
                name={sportIcon.name as CommunityIconName}
                size={18}
                color={isActive ? COLORS.onPrimary : COLORS.primary}
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
    // Kích thước vòng tròn tăng dần theo số lượng
    const size = cluster.count >= 50 ? 60 : cluster.count >= 20 ? 52 : 44;

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
          {/* Outer ring */}
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
  pinLabel: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.base,
    paddingVertical: 3,
    marginBottom: SPACING.xs,
    maxWidth: 140,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  pinLabelText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontWeight: TYPOGRAPHY.labelSm.fontWeight,
    fontSize: 10,
    color: COLORS.onSurface,
  },
  pinBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  pinBubbleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.secondary,
    borderWidth: 3,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    elevation: 8,
  },
  pinArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
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
    borderWidth: 3,
    borderColor: COLORS.secondary,
    backgroundColor: 'transparent',
  },
  clusterCount: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: '700' as const,
    fontSize: 16,
    color: COLORS.onPrimary,
    lineHeight: 18,
  },
  clusterLabel: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 9,
    color: COLORS.secondary,
    lineHeight: 11,
  },
});
