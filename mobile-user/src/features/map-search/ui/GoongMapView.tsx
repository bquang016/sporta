import React, { useRef, useMemo, useEffect, useCallback, memo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { MapVenue } from '../../../entities/facility/model/useMapFacilities';
import { Facility } from '../../../entities/facility';
import { COLORS } from '../../../shared/config/theme';

export interface GoongMapViewRef {
  flyTo: (coords: { latitude: number; longitude: number; zoom?: number }) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

interface GoongMapViewProps {
  venues?: (MapVenue | Facility)[];
  userLocation?: { latitude: number; longitude: number } | null;
  selectedVenueId?: string | null;
  onVenuePress?: (venueId: string) => void;
  onMapPress?: () => void;
  initialCenter?: { latitude: number; longitude: number; zoom?: number };
}

const DEFAULT_CENTER = {
  latitude: 21.028511,
  longitude: 105.804817,
  zoom: 13,
};

const GOONG_MAP_KEY =
  process.env.EXPO_PUBLIC_GOONG_MAP_KEY ||
  process.env.VITE_GOONG_MAP_KEY ||
  '8n7WDTHRsELT9F8UA4g3nsDbFWn5KQPig2dDkJHZ';

export const GoongMapView = memo(
  React.forwardRef<GoongMapViewRef, GoongMapViewProps>(
    (
      {
        venues = [],
        userLocation,
        selectedVenueId,
        onVenuePress,
        onMapPress,
        initialCenter = DEFAULT_CENTER,
      },
      ref
    ) => {
      const webViewRef = useRef<WebView>(null);
      const isMapReady = useRef(false);

      // Expose imperative methods to parent (flyTo, zoomIn, zoomOut)
      React.useImperativeHandle(ref, () => ({
        flyTo: ({ latitude, longitude, zoom = 15 }) => {
          const js = `
            if (window.map) {
              window.map.flyTo({
                center: [${longitude}, ${latitude}],
                zoom: ${zoom},
                essential: true
              });
            }
          `;
          webViewRef.current?.injectJavaScript(js);
        },
        zoomIn: () => {
          webViewRef.current?.injectJavaScript(`if (window.map) window.map.zoomIn();`);
        },
        zoomOut: () => {
          webViewRef.current?.injectJavaScript(`if (window.map) window.map.zoomOut();`);
        },
      }));

      // Prepare sanitized venue data for the webview
      const venuesDataJson = useMemo(() => {
        const sanitized = venues
          .filter((v) => {
            const lat = Number(v.latitude);
            const lng = Number(v.longitude);
            return isFinite(lat) && isFinite(lng) && lat !== 0 && lng !== 0;
          })
          .map((v) => ({
            id: String(v.id),
            name: v.name,
            sport: (v as any).sportName || (v as any).sport || 'Thể thao',
            price: (v as any).minPrice ? `${((v as any).minPrice / 1000).toFixed(0)}k` : ((v as any).price || ''),
            lat: Number(v.latitude),
            lng: Number(v.longitude),
            rating: (v as any).rating || (v as any).averageRating || 0,
          }));
        return JSON.stringify(sanitized);
      }, [venues]);

      // Push updated markers to the webview
      const updateMarkersInWebView = useCallback(() => {
        if (!isMapReady.current) return;
        const js = `
          if (window.updateVenues) {
            window.updateVenues(${venuesDataJson}, "${selectedVenueId || ''}");
          }
        `;
        webViewRef.current?.injectJavaScript(js);
      }, [venuesDataJson, selectedVenueId]);

      useEffect(() => {
        updateMarkersInWebView();
      }, [updateMarkersInWebView]);

      // Push user location update
      useEffect(() => {
        if (userLocation && isMapReady.current) {
          const js = `
            if (window.updateUserLocation) {
              window.updateUserLocation(${userLocation.longitude}, ${userLocation.latitude});
            }
          `;
          webViewRef.current?.injectJavaScript(js);
        }
      }, [userLocation]);

      // HTML Template with Goong JS SDK
      const htmlContent = useMemo(() => {
        const centerLng = initialCenter.longitude || DEFAULT_CENTER.longitude;
        const centerLat = initialCenter.latitude || DEFAULT_CENTER.latitude;
        const zoom = initialCenter.zoom || DEFAULT_CENTER.zoom;

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src="https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background-color: #E2E8F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    #map {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    /* Sport Marker Pin */
    .venue-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.18s ease-out;
      transform: translate(-50%, -100%);
    }
    .venue-marker:active {
      transform: translate(-50%, -100%) scale(0.95);
    }
    .venue-bubble {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: #FFFFFF;
      font-size: 11.5px;
      font-weight: 800;
      padding: 5px 9px;
      border-radius: 20px;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
      border: 1.5px solid #FFFFFF;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
      letter-spacing: -0.2px;
    }
    .venue-bubble.active {
      background: linear-gradient(135deg, #047857 0%, #064E3B 100%);
      border: 2px solid #FFFFFF;
      box-shadow: 0 4px 14px rgba(4, 120, 87, 0.55);
      transform: scale(1.15);
    }
    .venue-arrow {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 6px solid #059669;
      margin-top: -1px;
    }
    .venue-bubble.active + .venue-arrow {
      border-top-color: #064E3B;
    }
    .venue-name-badge {
      max-width: 110px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* User Location Pulse */
    .user-dot {
      width: 16px;
      height: 16px;
      background-color: #0284C7;
      border-radius: 50%;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 0 0 5px rgba(2, 132, 199, 0.35);
    }
    /* Clean Goong logo */
    .goong-ctrl-attrib { display: none !important; }
    .goong-ctrl-logo { transform: scale(0.8); transform-origin: bottom left; opacity: 0.85; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    try {
      goongjs.accessToken = '${GOONG_MAP_KEY}';
      
      var map = new goongjs.Map({
        container: 'map',
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [${centerLng}, ${centerLat}],
        zoom: ${zoom},
        attributionControl: false
      });

      window.map = map;
      var currentMarkers = {};
      var userLocationMarker = null;

      function sendToNative(data) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
      }

      map.on('load', function() {
        sendToNative({ type: 'MAP_LOADED' });
        window.updateVenues(${venuesDataJson}, "${selectedVenueId || ''}");
        ${userLocation ? `window.updateUserLocation(${userLocation.longitude}, ${userLocation.latitude});` : ''}
      });

      map.on('click', function(e) {
        if (e.originalEvent && e.originalEvent.__isMarkerClick) return;
        sendToNative({ type: 'MAP_CLICK' });
      });

      window.updateVenues = function(venuesList, selectedId) {
        // Remove old markers
        for (var id in currentMarkers) {
          if (currentMarkers[id]) {
            currentMarkers[id].remove();
          }
        }
        currentMarkers = {};

        if (!venuesList || !venuesList.length) return;

        venuesList.forEach(function(venue) {
          var isSelected = String(venue.id) === String(selectedId);
          var el = document.createElement('div');
          el.className = 'venue-marker';
          
          var priceText = venue.price ? venue.price : (venue.name ? venue.name.substring(0, 10) : 'Sân');
          
          el.innerHTML = '<div class="venue-bubble ' + (isSelected ? 'active' : '') + '">' +
            '<span>' + (venue.sport === 'Pickleball' ? '🏓' : venue.sport === 'Cầu lông' ? '🏸' : venue.sport === 'Bóng đá' ? '⚽' : '🏆') + '</span>' +
            '<span class="venue-name-badge">' + priceText + '</span>' +
            '</div>' +
            '<div class="venue-arrow"></div>';

          el.addEventListener('click', function(evt) {
            evt.stopPropagation();
            if (evt.originalEvent) evt.originalEvent.__isMarkerClick = true;
            sendToNative({ type: 'VENUE_PRESS', venueId: String(venue.id) });
          });

          var marker = new goongjs.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([venue.lng, venue.lat])
            .addTo(map);

          currentMarkers[venue.id] = marker;
        });
      };

      window.updateUserLocation = function(lng, lat) {
        if (userLocationMarker) {
          userLocationMarker.setLngLat([lng, lat]);
        } else {
          var el = document.createElement('div');
          el.className = 'user-dot';
          userLocationMarker = new goongjs.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map);
        }
      };

    } catch (err) {
      sendToNative({ type: 'MAP_ERROR', error: String(err) });
    }
  </script>
</body>
</html>
        `;
      }, [initialCenter]);

      const handleMessage = (event: any) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'MAP_LOADED') {
            isMapReady.current = true;
            updateMarkersInWebView();
          } else if (data.type === 'VENUE_PRESS') {
            if (onVenuePress) onVenuePress(data.venueId);
          } else if (data.type === 'MAP_CLICK') {
            if (onMapPress) onMapPress();
          }
        } catch {
          // parse error
        }
      };

      return (
        <View style={styles.container}>
          <WebView
            ref={webViewRef}
            source={{ html: htmlContent }}
            style={styles.webView}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            scrollEnabled={false}
            bounces={false}
            overScrollMode="never"
            androidLayerType="hardware"
            originWhitelist={['*']}
          />
        </View>
      );
    }
  )
);

GoongMapView.displayName = 'GoongMapView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLow,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default GoongMapView;
