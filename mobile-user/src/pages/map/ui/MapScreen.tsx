import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Keyboard,
} from 'react-native';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../shared/config/theme';
import {
  useMapFacilities,
  HANOI_COORDINATE,
} from '../../../entities/facility/model/useMapFacilities';
import {
  useFacilitySearch,
  VenueMarker,
  ClusterMarkerView,
  MapFacilityCard,
  FloatingSportFilter,
  MapSearchBar,
  useMapSearchAutocomplete,
  SearchResultItem,
  getGoongPlaceDetail,
} from '../../../features/map-search';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DEFAULT_REGION: Region = {
  latitude: HANOI_COORDINATE.latitude,
  longitude: HANOI_COORDINATE.longitude,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const USER_ZOOM_DELTA = 0.02;

// ---------------------------------------------------------------------------
// MapScreen Component
// ---------------------------------------------------------------------------
export function MapScreen() {
  const mapRef = useRef<MapView>(null);

  // State
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Data from entity layer
  const { venues, loading, error } = useMapFacilities();

  const {
    availableSports,
    mapItems,
    selectedSport,
    selectedVenue,
    filteredVenues,
    handleSelectSport,
    handleSelectVenue,
    handleRegionChange,
  } = useFacilitySearch(venues);

  // Search logic
  const { 
    query: searchQuery, 
    setQuery: setSearchQuery, 
    results: searchResults, 
    loading: searchLoading 
  } = useMapSearchAutocomplete(venues);

  // ---------------------------------------------------------------------------
  // GPS Permission
  // ---------------------------------------------------------------------------
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const userCoord = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setUserLocation(userCoord);

        // Center bản đồ về vị trí user
        mapRef.current?.animateToRegion(
          {
            ...userCoord,
            latitudeDelta: USER_ZOOM_DELTA,
            longitudeDelta: USER_ZOOM_DELTA,
          },
          800
        );
      } else {
        // GPS bị từ chối → fallback về Hà Nội
        setLocationGranted(false);
      }
    } catch {
      setLocationGranted(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleRegionChangeComplete = useCallback(
    (newRegion: Region) => {
      setRegion(newRegion);
      handleRegionChange(newRegion.latitudeDelta);
    },
    [handleRegionChange]
  );

  const handleMyLocation = useCallback(async () => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: USER_ZOOM_DELTA,
          longitudeDelta: USER_ZOOM_DELTA,
        },
        600
      );
    } else {
      // Thử xin quyền lại
      await requestLocationPermission();
    }
  }, [userLocation]);

  const handleZoomIn = useCallback(() => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 0.5,
      longitudeDelta: region.longitudeDelta * 0.5,
    };
    mapRef.current?.animateToRegion(newRegion, 300);
  }, [region]);

  const handleZoomOut = useCallback(() => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 2,
      longitudeDelta: region.longitudeDelta * 2,
    };
    mapRef.current?.animateToRegion(newRegion, 300);
  }, [region]);

  const handleClosePopup = useCallback(() => {
    handleSelectVenue(null);
    Keyboard.dismiss();
  }, [handleSelectVenue]);

  const router = useRouter();

  const handleBook = useCallback((venueId: string) => {
    router.push(`/booking/${venueId}`);
  }, [router]);

  const handleDirections = useCallback(
    (venue: { latitude: number; longitude: number; name: string }) => {
      // TODO: open maps with directions
      console.log('Directions to:', venue.name, venue.latitude, venue.longitude);
    },
    []
  );

  const handleSelectSearchResult = useCallback(async (item: SearchResultItem) => {
    if (item.type === 'venue') {
      const venue = item.data;
      mapRef.current?.animateToRegion({
        latitude: venue.latitude,
        longitude: venue.longitude,
        latitudeDelta: USER_ZOOM_DELTA,
        longitudeDelta: USER_ZOOM_DELTA,
      }, 800);
      handleSelectVenue(venue.id);
    } else {
      // It's a place. Fetch details
      const placeDetails = await getGoongPlaceDetail(item.data.place_id);
      if (placeDetails) {
        mapRef.current?.animateToRegion({
          latitude: placeDetails.latitude,
          longitude: placeDetails.longitude,
          latitudeDelta: 0.03, // Suitable zoom for a neighborhood/street
          longitudeDelta: 0.03,
        }, 800);
        handleSelectVenue(null); // Close any open venue card
      }
    }
  }, [handleSelectVenue]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <View style={styles.container}>
      {/* ---- Header / Search Bar ---- */}
      <SafeAreaView style={styles.headerSafe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <MapSearchBar
            query={searchQuery}
            onChangeQuery={setSearchQuery}
            results={searchResults}
            loading={searchLoading}
            onSelectResult={handleSelectSearchResult}
          />

          {/* GPS permission warning */}
          {locationGranted === false && (
            <TouchableOpacity
              style={styles.gpsWarning}
              onPress={requestLocationPermission}
            >
              <MaterialIcons
                name="location-off"
                size={14}
                color={COLORS.amber}
              />
              <Text style={styles.gpsWarningText}>
                Chưa cấp quyền GPS · Đang hiển thị Hà Nội
              </Text>
              <MaterialIcons name="refresh" size={14} color={COLORS.amber} />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {/* ---- Map ---- */}
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={DEFAULT_REGION}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation={locationGranted === true}
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
          mapPadding={{ top: 0, right: 0, bottom: selectedVenue ? 180 : 0, left: 0 }}
          onPress={handleClosePopup}
        >
          {/* --- Render markers --- */}
          {mapItems.map((item) => {
            if (item.type === 'venue') {
              return (
                <VenueMarker
                  key={item.data.id}
                  venue={item.data}
                  isActive={selectedVenue?.id === item.data.id}
                  onPress={handleSelectVenue}
                />
              );
            } else {
              return (
                <ClusterMarkerView
                  key={item.data.id}
                  cluster={item.data}
                  onPress={(cluster) => {
                    // Zoom in vào cluster khi tap
                    mapRef.current?.animateToRegion(
                      {
                        latitude: cluster.latitude,
                        longitude: cluster.longitude,
                        latitudeDelta: region.latitudeDelta * 0.4,
                        longitudeDelta: region.longitudeDelta * 0.4,
                      },
                      500
                    );
                  }}
                />
              );
            }
          })}
        </MapView>

        {/* ---- Floating Sport Filter ---- */}
        <FloatingSportFilter
          availableSports={availableSports}
          selectedSport={selectedSport}
          onSelectSport={handleSelectSport}
          venueCount={filteredVenues.length}
        />

        {/* ---- Floating Action Buttons (Zoom + MyLocation) ---- */}
        <View style={styles.floatingActions}>
          <TouchableOpacity style={styles.floatingBtn} onPress={handleZoomIn}>
            <MaterialIcons name="add" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingBtn} onPress={handleZoomOut}>
            <MaterialIcons name="remove" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
          <View style={styles.floatingDivider} />
          <TouchableOpacity
            style={[
              styles.floatingBtn,
              locationGranted === true && styles.floatingBtnActive,
            ]}
            onPress={handleMyLocation}
          >
            <MaterialIcons
              name="my-location"
              size={22}
              color={
                locationGranted === true ? COLORS.primary : COLORS.onSurfaceVariant
              }
            />
          </TouchableOpacity>
        </View>

        {/* ---- Loading overlay ---- */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải sân...</Text>
            </View>
          </View>
        )}

        {/* ---- Error state ---- */}
        {error && !loading && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="wifi-off" size={16} color={COLORS.error} />
            <Text style={styles.errorText}>Không thể tải dữ liệu sân</Text>
          </View>
        )}

        {/* ---- Empty state ---- */}
        {!loading && !error && filteredVenues.length === 0 && (
          <View style={styles.emptyOverlay}>
            <View style={styles.emptyCard}>
              <MaterialIcons
                name="sports"
                size={32}
                color={COLORS.outline}
              />
              <Text style={styles.emptyTitle}>Không tìm thấy sân</Text>
              <Text style={styles.emptySubtitle}>
                {selectedSport
                  ? `Không có sân ${selectedSport} nào trong khu vực này`
                  : 'Chưa có sân nào được đăng ký trong khu vực'}
              </Text>
            </View>
          </View>
        )}

        {/* ---- Venue Pop-up Card ---- */}
        {selectedVenue && (
          <MapFacilityCard
            venue={selectedVenue}
            onClose={handleClosePopup}
            onBook={handleBook}
            onDirections={handleDirections}
          />
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerSafe: {
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 20,
  },
  header: {
    paddingHorizontal: SPACING.marginMobile,
    paddingVertical: SPACING.base,
    gap: SPACING.xs,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: TYPOGRAPHY.headlineMd.fontWeight,
    fontSize: 18,
    color: COLORS.onSurface,
  },
  gpsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.amberOpacity10,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  gpsWarningText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 11,
    color: COLORS.amber,
    flex: 1,
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  floatingActions: {
    position: 'absolute',
    right: SPACING.marginMobile,
    bottom: 110,
    gap: 4,
    alignItems: 'center',
  },
  floatingBtn: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.default,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  floatingBtnActive: {
    backgroundColor: COLORS.primaryOpacity08,
  },
  floatingDivider: {
    width: 32,
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.base,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  errorBanner: {
    position: 'absolute',
    top: 70,
    left: SPACING.marginMobile,
    right: SPACING.marginMobile,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    backgroundColor: COLORS.errorContainer,
    borderRadius: BORDER_RADIUS.default,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.base,
    zIndex: 15,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.labelSm.fontFamily,
    fontSize: 13,
    color: COLORS.onErrorContainer,
    flex: 1,
  },
  emptyOverlay: {
    position: 'absolute',
    bottom: 110,
    left: SPACING.marginMobile,
    right: SPACING.marginMobile,
    alignItems: 'center',
    zIndex: 5,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
    shadowColor: COLORS.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    width: '100%',
  },
  emptyTitle: {
    fontFamily: TYPOGRAPHY.headlineMd.fontFamily,
    fontWeight: '600' as const,
    fontSize: 16,
    color: COLORS.onSurface,
  },
  emptySubtitle: {
    fontFamily: TYPOGRAPHY.bodyMd.fontFamily,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
});

export default MapScreen;
