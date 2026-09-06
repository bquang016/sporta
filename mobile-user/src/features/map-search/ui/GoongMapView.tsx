import React, { useRef, useImperativeHandle, forwardRef, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { COLORS } from '../../../shared/config/theme';
import { MapItem, ClusterMarker } from '../model/useFacilitySearch';
import { MapVenue } from '../../../entities/facility/model/useMapFacilities';

export interface GoongMapCoordinate {
  latitude: number;
  longitude: number;
}

export interface GoongMapRegion extends GoongMapCoordinate {
  latitudeDelta?: number;
  longitudeDelta?: number;
  zoom?: number;
}

export interface GoongMapViewProps {
  items?: MapItem[];
  venues?: MapVenue[] | any[];
  selectedVenueId?: string | null;
  userLocation?: GoongMapCoordinate | null;
  initialRegion?: GoongMapRegion;
  displayMode?: 'price' | 'distance' | 'sport' | 'rating' | 'default';
  onVenuePress?: (venueId: string) => void;
  onClusterPress?: (cluster: ClusterMarker) => void;
  onMapPress?: () => void;
  onRegionChangeComplete?: (region: GoongMapRegion) => void;
  style?: any;
}

export interface GoongMapViewRef {
  animateToRegion: (region: { latitude: number; longitude: number; latitudeDelta?: number; longitudeDelta?: number }, duration?: number) => void;
  flyTo: (options: { latitude: number; longitude: number; zoom?: number; duration?: number }) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToCoordinates: (coordinates: GoongMapCoordinate[], options?: { edgePadding?: { top?: number; right?: number; bottom?: number; left?: number }; animated?: boolean }) => void;
}

const deltaToZoom = (delta?: number): number => {
  if (!delta || delta <= 0) return 14;
  return Math.max(3, Math.min(19, Math.round(Math.log2(360 / delta))));
};

const GOONG_MAP_KEY =
  process.env.EXPO_PUBLIC_GOONG_MAP_KEY ||
  process.env.VITE_GOONG_MAP_KEY ||
  '8n7WDTHRsELT9F8UA4g3nsDbFWn5KQPig2dDkJHZ';

export const GoongMapView = forwardRef<GoongMapViewRef, GoongMapViewProps>((props, ref) => {
  const {
    items,
    venues,
    selectedVenueId,
    userLocation,
    initialRegion = { latitude: 21.028511, longitude: 105.804817, latitudeDelta: 0.05, longitudeDelta: 0.05 },
    displayMode = 'default',
    onVenuePress,
    onClusterPress,
    onMapPress,
    onRegionChangeComplete,
    style,
  } = props;

  const webViewRef = useRef<WebView>(null);
  const isMapLoadedRef = useRef(false);

  // Normalize data: if items is provided, use items; else construct MapItem array from venues
  const normalizedItems = useMemo<MapItem[]>(() => {
    if (items && items.length > 0) return items;
    if (venues && venues.length > 0) {
      return venues.map((v) => ({ type: 'venue' as const, data: v }));
    }
    return [];
  }, [items, venues]);

  // Imperative handle for parent components
  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration = 600) => {
      const zoom = region.latitudeDelta ? deltaToZoom(region.latitudeDelta) : 14.5;
      sendToMap({
        type: 'FLY_TO',
        center: [region.longitude, region.latitude],
        zoom,
        duration,
      });
    },
    flyTo: ({ latitude, longitude, zoom = 15, duration = 600 }) => {
      sendToMap({
        type: 'FLY_TO',
        center: [longitude, latitude],
        zoom,
        duration,
      });
    },
    zoomIn: () => {
      sendToMap({ type: 'ZOOM_IN' });
    },
    zoomOut: () => {
      sendToMap({ type: 'ZOOM_OUT' });
    },
    fitToCoordinates: (coords, options) => {
      if (!coords || coords.length === 0) return;
      sendToMap({
        type: 'FIT_BOUNDS',
        coordinates: coords.map((c) => [c.longitude, c.latitude]),
        padding: options?.edgePadding,
      });
    },
  }));

  const sendToMap = useCallback((data: any) => {
    if (webViewRef.current) {
      const script = `window.handleNativeMessage && window.handleNativeMessage(${JSON.stringify(data)}); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  }, []);

  // Update map markers when items, selectedVenueId, or displayMode changes
  useEffect(() => {
    if (isMapLoadedRef.current) {
      sendToMap({
        type: 'SET_MAP_ITEMS',
        items: normalizedItems,
        selectedVenueId,
        displayMode,
      });
    }
  }, [normalizedItems, selectedVenueId, displayMode, sendToMap]);

  // Update user location pin
  useEffect(() => {
    if (isMapLoadedRef.current && userLocation) {
      sendToMap({
        type: 'SET_USER_LOCATION',
        userLocation: [userLocation.longitude, userLocation.latitude],
      });
    }
  }, [userLocation, sendToMap]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_LOADED') {
        isMapLoadedRef.current = true;
        sendToMap({
          type: 'SET_MAP_ITEMS',
          items: normalizedItems,
          selectedVenueId,
          displayMode,
        });
        if (userLocation) {
          sendToMap({
            type: 'SET_USER_LOCATION',
            userLocation: [userLocation.longitude, userLocation.latitude],
          });
        }
      } else if (data.type === 'SELECT_VENUE') {
        if (onVenuePress) onVenuePress(data.venueId);
      } else if (data.type === 'CLUSTER_PRESS') {
        if (onClusterPress) {
          onClusterPress(data.cluster);
        } else {
          // Default zoom in on cluster
          sendToMap({
            type: 'FLY_TO',
            center: [data.cluster.longitude, data.cluster.latitude],
            zoom: (data.currentZoom || 13) + 2,
            duration: 500,
          });
        }
      } else if (data.type === 'MAP_CLICK') {
        if (onMapPress) onMapPress();
      } else if (data.type === 'REGION_CHANGE') {
        if (onRegionChangeComplete) {
          const zoom = data.zoom;
          const latDelta = 360 / Math.pow(2, zoom);
          onRegionChangeComplete({
            latitude: data.center.lat,
            longitude: data.center.lng,
            zoom,
            latitudeDelta: latDelta,
            longitudeDelta: latDelta,
          });
        }
      }
    } catch {
      // Ignored
    }
  };

  const initialLng = initialRegion.longitude;
  const initialLat = initialRegion.latitude;
  const initialZoom = initialRegion.zoom || deltaToZoom(initialRegion.latitudeDelta || 0.05);

  const htmlContent = useMemo(
    () => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src="https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css" rel="stylesheet" />
  <style>
    * { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; background-color: #0B0F19; }
    .goong-ctrl-logo, .goong-ctrl-attrib { display: none !important; }

    /* ─── SINGLE VENUE PIN ─── */
    .pin-marker {
      cursor: pointer;
      z-index: 10;
    }
    .pin-marker.active {
      z-index: 9999 !important;
    }

    .pin-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
      will-change: transform;
    }
    .pin-marker:active .pin-inner {
      transform: scale(0.92);
    }
    .pin-marker.active .pin-inner {
      transform: scale(1.18);
    }

    /* Round Sport Pin Bubble (MapScreen mode) */
    .pin-bubble {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      background: #FFFFFF;
      border: 2.5px solid #064E3B;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #064E3B;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22), 0 1px 3px rgba(6, 78, 59, 0.15);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .pin-marker.active .pin-bubble {
      width: 46px;
      height: 46px;
      border-radius: 23px;
      background: #064E3B;
      border: 2.5px solid #FFFFFF;
      color: #FFFFFF;
      box-shadow: 0 6px 20px rgba(6, 78, 59, 0.6), 0 0 0 3px rgba(6, 78, 59, 0.3);
    }

    /* Pill Pin Bubble (SearchScreen price/rating/distance modes) */
    .pin-bubble.pill-bubble {
      width: auto;
      height: auto;
      padding: 6px 11px;
      border-radius: 22px;
      gap: 6px;
      font-size: 12px;
      font-weight: 800;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      letter-spacing: -0.2px;
      background: #FFFFFF;
      border: 2px solid #064E3B;
      color: #064E3B;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    .pin-marker.active .pin-bubble.pill-bubble {
      background: #064E3B;
      border-color: #FFFFFF;
      color: #FFFFFF;
      box-shadow: 0 6px 20px rgba(6, 78, 59, 0.6), 0 0 0 3px rgba(6, 78, 59, 0.3);
    }

    /* Pin Downward Triangular Arrow */
    .pin-arrow {
      width: 0;
      height: 0;
      border-left: 5.5px solid transparent;
      border-right: 5.5px solid transparent;
      border-top: 6.5px solid #064E3B;
      margin-top: -1px;
      transition: border-top-color 0.2s ease;
    }
    .pin-marker.active .pin-arrow {
      border-top-color: #064E3B;
      border-top-width: 7.5px;
      border-left-width: 6.5px;
      border-right-width: 6.5px;
    }

    /* ─── CLUSTER BUBBLE ─── */
    .cluster-marker {
      cursor: pointer;
      z-index: 5;
    }
    .cluster-inner {
      position: relative;
      border-radius: 50%;
      background: #064E3B;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(6, 78, 59, 0.5);
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      user-select: none;
    }
    .cluster-marker:active .cluster-inner {
      transform: scale(0.92);
    }
    .cluster-inner.size-sm { width: 44px; height: 44px; }
    .cluster-inner.size-md { width: 50px; height: 50px; }
    .cluster-inner.size-lg { width: 58px; height: 58px; }

    .cluster-ring {
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border-radius: 50%;
      border: 2.5px solid #00D084;
      pointer-events: none;
    }

    .cluster-count {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: 800;
      font-size: 15px;
      color: #FFFFFF;
      line-height: 16px;
    }
    .cluster-label {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 9px;
      font-weight: 700;
      color: #00D084;
      line-height: 11px;
      text-transform: lowercase;
    }

    /* ─── USER LOCATION RADAR PIN ─── */
    .user-marker {
      z-index: 20;
    }
    .user-location-pin {
      width: 18px;
      height: 18px;
      background: #007AFF;
      border-radius: 50%;
      border: 3px solid #FFFFFF;
      box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.35);
      position: relative;
    }
    .user-location-pin::after {
      content: '';
      position: absolute;
      top: -9px;
      left: -9px;
      right: -9px;
      bottom: -9px;
      border-radius: 50%;
      border: 2px solid #007AFF;
      animation: user-pulse 2s infinite ease-out;
    }
    @keyframes user-pulse {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var markersMap = {};
    var userMarker = null;
    var isMapReady = false;

    // High-precision SVG Sport Icons (20x20 viewBox 0 0 24 24)
    var ICONS = {
      // Bóng đá (Classic geometric football / soccer ball)
      football: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="12 7 15.5 9.5 14.2 14 9.8 14 8.5 9.5" fill="currentColor"/><line x1="12" y1="7" x2="12" y2="2"/><line x1="15.5" y1="9.5" x2="20.5" y2="7.5"/><line x1="14.2" y1="14" x2="18" y2="19.5"/><line x1="9.8" y1="14" x2="6" y2="19.5"/><line x1="8.5" y1="9.5" x2="3.5" y2="7.5"/></svg>',
      
      // Cầu lông (Shuttlecock with cork dome & feathered skirt)
      badminton: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5.5 L9.5 16 H14.5 L18 5.5 C18.3 4.6 17.5 4 16.6 4 H7.4 C6.5 4 5.7 4.6 6 5.5 Z"/><path d="M10 16 C10 18.2 11 20 12 20 C13 20 14 18.2 14 16 Z" fill="currentColor"/><line x1="7.2" y1="9" x2="16.8" y2="9"/><line x1="8.5" y1="13" x2="15.5" y2="13"/><line x1="12" y1="4" x2="12" y2="16"/><line x1="9" y1="4" x2="10.8" y2="16"/><line x1="15" y1="4" x2="13.2" y2="16"/></svg>',
      
      // Pickleball (Paddle with perforated holes pattern)
      pickleball: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2.5" width="14" height="13" rx="5"/><circle cx="9" cy="6.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="6.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="8.8" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="11" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="11" r="1.1" fill="currentColor" stroke="none"/><path d="M10.5 15.5 L10.5 21 C10.5 21.6 10.9 22 11.5 22 L12.5 22 C13.1 22 13.5 21.6 13.5 21 L13.5 15.5" fill="currentColor"/></svg>',
      
      // Tennis (Tennis ball with dual curved seam arcs)
      tennis: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93 C7.5 7.5 8.7 10 8.7 12 C8.7 14 7.5 16.5 4.93 19.07"/><path d="M19.07 4.93 C16.5 7.5 15.3 10 15.3 12 C15.3 14 16.5 16.5 19.07 19.07"/></svg>',
      
      // Bóng rổ (Basketball with cross and curved seams)
      basketball: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="M4.93 4.93 C7.8 7.8 9.5 9.8 9.5 12 C9.5 14.2 7.8 16.2 4.93 19.07"/><path d="M19.07 4.93 C16.2 7.8 14.5 9.8 14.5 12 C14.5 14.2 16.2 16.2 19.07 19.07"/></svg>',
      
      // Bóng chuyền (Volleyball swirl triple seams)
      volleyball: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2 C12 7.5 16.5 12 22 12"/><path d="M12 22 C12 16.5 7.5 12 2 12"/><path d="M3.5 6 C8.5 7.5 12 12 12 18"/><path d="M20.5 18 C15.5 16.5 12 12 12 6"/></svg>',
      
      // Bida / Pool / Billiards (8-ball)
      billiards: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4.8" fill="currentColor" stroke="none"/><circle cx="12" cy="9.8" r="1.3" fill="#FFFFFF" stroke="none"/><circle cx="12" cy="14.2" r="1.5" fill="#FFFFFF" stroke="none"/></svg>',
      
      // Bóng bàn / Table Tennis (Ping pong paddle & ball)
      tabletennis: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="8.5" r="6.5"/><path d="M15 13 L19.5 17.5 C20.2 18.2 20.2 19 19.5 19.7 C18.8 20.4 18 20.4 17.3 19.7 L12.8 15.2" stroke-width="2.2"/><circle cx="19" cy="5.5" r="2.2" fill="currentColor" stroke="none"/></svg>',
      
      // Bơi lội (Swimming swimmer & waves)
      swimming: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="17.5" cy="6" r="2" fill="currentColor" stroke="none"/><path d="M3 17 C5 16 7 16 9 17 C11 18 13 18 15 17 C17 16 19 16 21 17"/><path d="M3 20.5 C5 19.5 7 19.5 9 20.5 C11 21.5 13 21.5 15 20.5 C17 19.5 19 19.5 21 20.5"/><path d="M6 13 L11 8.5 L14 10.5 L17 9"/><path d="M11 8.5 L13 13.5"/></svg>',
      
      // Gym / Thể hình (Dumbbell)
      gym: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="3" height="6" rx="1" fill="currentColor"/><rect x="5" y="7" width="2.5" height="10" rx="1" fill="currentColor"/><line x1="7.5" y1="12" x2="16.5" y2="12" stroke-width="2.5"/><rect x="16.5" y="7" width="2.5" height="10" rx="1" fill="currentColor"/><rect x="19" y="9" width="3" height="6" rx="1" fill="currentColor"/></svg>',
      
      // Chạy bộ / Điền kinh (Running)
      running: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="4" r="2" fill="currentColor" stroke="none"/><path d="M8 12 L11 9 L15 10 L18 7"/><path d="M11 9 L10 14 L14 16 L13 21"/><path d="M10 14 L6 16"/><path d="M15 10 L17 13 L20 13.5"/></svg>',

      // Default Venue / Stadium Location Pin
      place: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
    };

    function getSportSvg(sport) {
      if (!sport) return ICONS.place;
      var s = sport.toLowerCase().trim();
      if (s.indexOf('bóng đá') !== -1 || s.indexOf('đá bóng') !== -1 || s.indexOf('soccer') !== -1 || s.indexOf('football') !== -1 || s.indexOf('futsal') !== -1) return ICONS.football;
      if (s.indexOf('cầu lông') !== -1 || s.indexOf('đánh cầu') !== -1 || s.indexOf('badminton') !== -1) return ICONS.badminton;
      if (s.indexOf('pickleball') !== -1 || s.indexOf('pickle ball') !== -1 || s.indexOf('pikleball') !== -1) return ICONS.pickleball;
      if (s.indexOf('tennis') !== -1 || s.indexOf('quần vợt') !== -1) return ICONS.tennis;
      if (s.indexOf('bóng rổ') !== -1 || s.indexOf('basketball') !== -1) return ICONS.basketball;
      if (s.indexOf('bóng chuyền') !== -1 || s.indexOf('volleyball') !== -1) return ICONS.volleyball;
      if (s.indexOf('bida') !== -1 || s.indexOf('bi-a') !== -1 || s.indexOf('billiards') !== -1 || s.indexOf('pool') !== -1 || s.indexOf('snooker') !== -1) return ICONS.billiards;
      if (s.indexOf('bóng bàn') !== -1 || s.indexOf('table tennis') !== -1 || s.indexOf('ping pong') !== -1 || s.indexOf('pingpong') !== -1) return ICONS.tabletennis;
      if (s.indexOf('bơi') !== -1 || s.indexOf('swimming') !== -1 || s.indexOf('swim') !== -1) return ICONS.swimming;
      if (s.indexOf('gym') !== -1 || s.indexOf('thể hình') !== -1 || s.indexOf('fitness') !== -1) return ICONS.gym;
      if (s.indexOf('chạy bộ') !== -1 || s.indexOf('điền kinh') !== -1 || s.indexOf('running') !== -1) return ICONS.running;
      return ICONS.place;
    }

    goongjs.accessToken = '${GOONG_MAP_KEY}';
    var map = new goongjs.Map({
      container: 'map',
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [${initialLng}, ${initialLat}],
      zoom: ${initialZoom},
      attributionControl: false
    });

    map.on('load', function() {
      isMapReady = true;
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_LOADED' }));
      }
    });

    map.on('click', function(e) {
      if (!e.originalEvent.target.closest('.pin-marker') && !e.originalEvent.target.closest('.cluster-marker')) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_CLICK' }));
        }
      }
    });

    map.on('moveend', function() {
      if (window.ReactNativeWebView) {
        var center = map.getCenter();
        var zoom = map.getZoom();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'REGION_CHANGE',
          center: { lat: center.lat, lng: center.lng },
          zoom: zoom
        }));
      }
    });

    function formatPillLabel(venue, mode) {
      if (mode === 'sport') return venue.sportName || venue.sport || 'Thể thao';
      if (mode === 'rating') return (venue.rating && venue.rating > 0) ? ('⭐ ' + Number(venue.rating).toFixed(1)) : 'Mới';
      if (mode === 'distance') return (venue.distance !== undefined) ? (Number(venue.distance).toFixed(1) + ' km') : 'Gần đây';
      if (venue.price) {
        var p = String(venue.price).replace('/h', '').trim();
        return p;
      }
      return venue.name || 'Sân';
    }

    window.handleNativeMessage = function(data) {
      if (!data || !isMapReady) return;

      if (data.type === 'FLY_TO') {
        map.flyTo({
          center: data.center,
          zoom: data.zoom || 15,
          duration: data.duration || 600,
          essential: true
        });
      } else if (data.type === 'ZOOM_IN') {
        map.zoomIn();
      } else if (data.type === 'ZOOM_OUT') {
        map.zoomOut();
      } else if (data.type === 'FIT_BOUNDS') {
        if (data.coordinates && data.coordinates.length > 0) {
          var bounds = new goongjs.LngLatBounds();
          data.coordinates.forEach(function(coord) {
            bounds.extend(coord);
          });
          var p = data.padding || {};
          map.fitBounds(bounds, {
            padding: {
              top: p.top || 60,
              bottom: p.bottom || 240,
              left: p.left || 40,
              right: p.right || 40
            },
            maxZoom: 16,
            duration: 600
          });
        }
      } else if (data.type === 'SET_MAP_ITEMS') {
        var items = data.items || [];
        var activeId = data.selectedVenueId;
        var displayMode = data.displayMode || 'default';
        var isPillMode = (displayMode === 'price' || displayMode === 'rating' || displayMode === 'distance');

        var currentKeys = {};

        items.forEach(function(item) {
          if (item.type === 'cluster') {
            var cluster = item.data;
            var cLat = parseFloat(cluster.latitude);
            var cLng = parseFloat(cluster.longitude);
            if (isNaN(cLat) || isNaN(cLng)) return;

            var cKey = 'cluster_' + cluster.id;
            currentKeys[cKey] = true;

            var sizeCat = cluster.count >= 50 ? 'size-lg' : cluster.count >= 20 ? 'size-md' : 'size-sm';

            if (!markersMap[cKey]) {
              var el = document.createElement('div');
              el.className = 'cluster-marker';
              el.innerHTML = '<div class="cluster-inner ' + sizeCat + '"><div class="cluster-ring"></div><div class="cluster-count">' + cluster.count + '</div><div class="cluster-label">sân</div></div>';

              el.addEventListener('click', function(e) {
                e.stopPropagation();
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'CLUSTER_PRESS',
                    cluster: cluster,
                    currentZoom: map.getZoom()
                  }));
                }
              });

              var marker = new goongjs.Marker({ element: el, anchor: 'center' })
                .setLngLat([cLng, cLat])
                .addTo(map);

              markersMap[cKey] = marker;
            }
          } else if (item.type === 'venue') {
            var venue = item.data;
            var vLat = parseFloat(venue.latitude);
            var vLng = parseFloat(venue.longitude);
            if (isNaN(vLat) || isNaN(vLng)) return;

            var vKey = 'venue_' + venue.id;
            currentKeys[vKey] = true;
            var isActive = (String(activeId) === String(venue.id));

            var iconSvg = getSportSvg(venue.sportName || venue.sport);
            var labelText = isPillMode ? formatPillLabel(venue, displayMode) : '';

            if (markersMap[vKey]) {
              var el = markersMap[vKey].getElement();
              if (isActive) {
                el.classList.add('active');
              } else {
                el.classList.remove('active');
              }
              if (isPillMode) {
                var labelSpan = el.querySelector('.pill-label');
                if (labelSpan) labelSpan.innerText = labelText;
              }
            } else {
              var el = document.createElement('div');
              el.className = 'pin-marker' + (isActive ? ' active' : '');

              if (isPillMode) {
                el.innerHTML = '<div class="pin-inner"><div class="pin-bubble pill-bubble">' + iconSvg + '<span class="pill-label">' + labelText + '</span></div><div class="pin-arrow"></div></div>';
              } else {
                el.innerHTML = '<div class="pin-inner"><div class="pin-bubble">' + iconSvg + '</div><div class="pin-arrow"></div></div>';
              }

              el.addEventListener('click', function(e) {
                e.stopPropagation();
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'SELECT_VENUE',
                    venueId: venue.id
                  }));
                }
              });

              var marker = new goongjs.Marker({ element: el, anchor: 'bottom' })
                .setLngLat([vLng, vLat])
                .addTo(map);

              markersMap[vKey] = marker;
            }
          }
        });

        // Remove old markers
        Object.keys(markersMap).forEach(function(key) {
          if (!currentKeys[key]) {
            markersMap[key].remove();
            delete markersMap[key];
          }
        });
      } else if (data.type === 'SET_USER_LOCATION') {
        var userLoc = data.userLocation;
        if (userLoc && userLoc.length === 2) {
          var uLng = parseFloat(userLoc[0]);
          var uLat = parseFloat(userLoc[1]);
          if (!isNaN(uLng) && !isNaN(uLat)) {
            if (!userMarker) {
              var el = document.createElement('div');
              el.className = 'user-marker';
              el.innerHTML = '<div class="user-location-pin"></div>';
              userMarker = new goongjs.Marker({ element: el, anchor: 'center' })
                .setLngLat([uLng, uLat])
                .addTo(map);
            } else {
              userMarker.setLngLat([uLng, uLat]);
            }
          }
        }
      }
    };
  </script>
</body>
</html>
`,
    [initialLng, initialLat, initialZoom]
  );

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
});

GoongMapView.displayName = 'GoongMapView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0B0F19',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
