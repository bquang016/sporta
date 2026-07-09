import { useState, useMemo, useCallback } from 'react';
import { MapVenue } from '../../../entities/facility/model/useMapFacilities';

export interface ClusterMarker {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  venueIds: string[];
}

export type MapItem =
  | { type: 'venue'; data: MapVenue }
  | { type: 'cluster'; data: ClusterMarker };

const CLUSTER_DISTANCE_THRESHOLD = 0.03; // ~3km in degrees
const ZOOM_CLUSTER_THRESHOLD = 0.08; // latitudeDelta > 0.08 thì cluster

/**
 * Gom nhóm các venue gần nhau thành cluster.
 * Thuật toán đơn giản O(n²) — phù hợp cho < 1000 venues.
 */
const clusterVenues = (
  venues: MapVenue[],
  regionDelta: number
): MapItem[] => {
  // Zoom in đủ gần → hiển thị từng pin
  if (regionDelta < ZOOM_CLUSTER_THRESHOLD) {
    return venues.map((v) => ({ type: 'venue', data: v }));
  }

  const visited = new Set<string>();
  const result: MapItem[] = [];

  for (const venue of venues) {
    if (visited.has(venue.id)) continue;

    const nearby = venues.filter((v) => {
      if (visited.has(v.id) || v.id === venue.id) return false;
      const dLat = Math.abs(v.latitude - venue.latitude);
      const dLng = Math.abs(v.longitude - venue.longitude);
      return dLat < CLUSTER_DISTANCE_THRESHOLD && dLng < CLUSTER_DISTANCE_THRESHOLD;
    });

    if (nearby.length > 0) {
      // Tạo cluster
      const allInCluster = [venue, ...nearby];
      allInCluster.forEach((v) => visited.add(v.id));

      const avgLat =
        allInCluster.reduce((s, v) => s + v.latitude, 0) / allInCluster.length;
      const avgLng =
        allInCluster.reduce((s, v) => s + v.longitude, 0) / allInCluster.length;

      result.push({
        type: 'cluster',
        data: {
          id: `cluster-${venue.id}`,
          latitude: avgLat,
          longitude: avgLng,
          count: allInCluster.length,
          venueIds: allInCluster.map((v) => v.id),
        },
      });
    } else {
      visited.add(venue.id);
      result.push({ type: 'venue', data: venue });
    }
  }

  return result;
};

export const useFacilitySearch = (venues: MapVenue[]) => {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [regionDelta, setRegionDelta] = useState<number>(0.05);

  // Lấy danh sách các môn thể thao duy nhất từ data thực
  const availableSports = useMemo<string[]>(() => {
    const sports = new Set<string>();
    venues.forEach((v) => {
      if (v.sportName) sports.add(v.sportName);
    });
    return Array.from(sports);
  }, [venues]);

  // Lọc theo môn thể thao
  const filteredVenues = useMemo<MapVenue[]>(() => {
    if (!selectedSport) return venues;
    return venues.filter(
      (v) => v.sportName?.toLowerCase() === selectedSport.toLowerCase()
    );
  }, [venues, selectedSport]);

  // Áp dụng clustering
  const mapItems = useMemo<MapItem[]>(
    () => clusterVenues(filteredVenues, regionDelta),
    [filteredVenues, regionDelta]
  );

  // Venue đang được chọn (để hiển thị pop-up)
  const selectedVenue = useMemo<MapVenue | null>(
    () => filteredVenues.find((v) => v.id === selectedVenueId) ?? null,
    [filteredVenues, selectedVenueId]
  );

  const handleSelectSport = useCallback((sport: string | null) => {
    setSelectedSport(sport);
    setSelectedVenueId(null);
  }, []);

  const handleSelectVenue = useCallback((venueId: string | null) => {
    setSelectedVenueId(venueId);
  }, []);

  const handleRegionChange = useCallback((latitudeDelta: number) => {
    setRegionDelta(latitudeDelta);
  }, []);

  return {
    availableSports,
    filteredVenues,
    mapItems,
    selectedSport,
    selectedVenue,
    selectedVenueId,
    handleSelectSport,
    handleSelectVenue,
    handleRegionChange,
  };
};
