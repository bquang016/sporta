import React, { useState, useEffect, useRef } from 'react';
import goongjs from '@goongmaps/goong-js';
import { useGoongSearch } from '../hooks/useGoongSearch';
import type { GoongSuggestion } from '../hooks/useGoongSearch';
import '@goongmaps/goong-js/dist/goong-js.css';

// Default center: Hanoi
const DEFAULT_LAT = 21.028511;
const DEFAULT_LNG = 105.804817;
const GOONG_MAP_KEY = import.meta.env.VITE_GOONG_MAP_KEY || '8n7WDTHRsELT9F8UA4g3nsDbFWn5KQPig2dDkJHZ';

interface LocationPickerMapProps {
  initialLocation?: {
    lat: number;
    lng: number;
  };
  initialAddress?: string;
  onChange?: (data: { lat: number; lng: number; address: string }) => void;
  onClose?: () => void;
  /** When true, fills the parent container's height instead of using a fixed height */
  fullHeight?: boolean;
}

export const LocationPickerMap = ({
  initialLocation,
  initialAddress = '',
  onChange,
  onClose,
  fullHeight = false
}: LocationPickerMapProps) => {
  const {
    suggestions,
    loading: searchLoading,
    searchAddress,
    getPlaceDetails,
    reverseGeocode,
    clearSuggestions
  } = useGoongSearch();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // States
  const [address, setAddress] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [isDragging, setIsDragging] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [coords, setCoords] = useState({
    lat: initialLocation?.lat && initialLocation.lat !== 0 ? initialLocation.lat : DEFAULT_LAT,
    lng: initialLocation?.lng && initialLocation.lng !== 0 ? initialLocation.lng : DEFAULT_LNG
  });

  // Sync initial location if it changes
  useEffect(() => {
    if (initialLocation?.lat && initialLocation?.lng && initialLocation.lat !== 0 && initialLocation.lng !== 0) {
      const newCoords = { lat: initialLocation.lat, lng: initialLocation.lng };
      setCoords(newCoords);
      if (mapRef.current) {
        mapRef.current.setCenter([newCoords.lng, newCoords.lat]);
      }
    }
    if (initialAddress) {
      setAddress(initialAddress);
      setSearchQuery(initialAddress);
    }
  }, [initialLocation, initialAddress]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    goongjs.accessToken = GOONG_MAP_KEY;

    // Create Map
    const map = new goongjs.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [coords.lng, coords.lat],
      zoom: 15
    });
    mapRef.current = map;

    // Add Navigation Control
    map.addControl(new goongjs.NavigationControl({ showCompass: false }), 'top-right');

    // Create Marker Element
    const el = document.createElement('div');
    el.className = 'marker-pin-wrapper pointer-events-none select-none';
    el.innerHTML = `
      <div class="relative flex flex-col items-center">
        <!-- Bouncing Pin Icon -->
        <div class="pin-icon-body w-9 h-9 rounded-full bg-brand-emerald border-2 border-white flex items-center justify-center shadow-[0_6px_20px_rgba(16,185,129,0.3)]">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
        <!-- Pin Tail -->
        <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white -mt-0.5"></div>
        <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-brand-emerald -mt-[7.5px]"></div>
      </div>
    `;

    // Create Marker
    const marker = new goongjs.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map);
    markerRef.current = marker;

    // Event Listeners
    map.on('movestart', () => {
      setIsDragging(true);
    });

    map.on('move', () => {
      const center = map.getCenter();
      marker.setLngLat(center);
      setCoords({ lat: center.lat, lng: center.lng });
    });

    map.on('moveend', () => {
      setIsDragging(false);
      const center = map.getCenter();

      // Clear any pending geocode request
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }

      // Debounce geocoding
      geocodeTimeoutRef.current = setTimeout(async () => {
        try {
          const geoAddress = await reverseGeocode(center.lat, center.lng);
          if (geoAddress) {
            setAddress(geoAddress);
            setSearchQuery(geoAddress);
          }
        } catch (err) {
          console.error('Failed to geocode center coordinate:', err);
        }
      }, 600);
    });

    // Cleanup on unmount
    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Handle Search Query Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowSuggestions(true);
    searchAddress(val, coords);
  };

  // Select Suggestion
  const handleSelectSuggestion = async (suggestion: GoongSuggestion) => {
    setShowSuggestions(false);
    clearSuggestions();
    try {
      const details = await getPlaceDetails(suggestion.place_id);
      if (details && mapRef.current) {
        setAddress(details.address);
        setSearchQuery(details.address);
        setCoords(details.location);
        
        mapRef.current.flyTo({
          center: [details.location.lng, details.location.lat],
          zoom: 16,
          essential: true
        });
      }
    } catch (err) {
      console.error('Error fetching suggestion details:', err);
    }
  };

  // Locate Current GPS Position
  const handleLocateCurrent = async () => {
    setIsLocating(true);
    try {
      let gpsCoords: { lat: number; lng: number };

      // Capacitor Native Geolocation
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const { Geolocation } = await import('@capacitor/geolocation');
        const permission = await Geolocation.checkPermissions();
        if (permission.location !== 'granted') {
          await Geolocation.requestPermissions();
        }
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 5000
        });
        gpsCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
      } else {
        // Standard Web Geolocation
        gpsCoords = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('GPS location is not supported by your browser.'));
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              });
            },
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 5000 }
          );
        });
      }

      setCoords(gpsCoords);

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [gpsCoords.lng, gpsCoords.lat],
          zoom: 16,
          essential: true
        });
      }

      const geoAddress = await reverseGeocode(gpsCoords.lat, gpsCoords.lng);
      if (geoAddress) {
        setAddress(geoAddress);
        setSearchQuery(geoAddress);
      }
    } catch (err: any) {
      console.error('Error locating GPS coordinate:', err);
      alert('Không thể xác định vị trí hiện tại. Vui lòng bật dịch vụ định vị GPS.');
    } finally {
      setIsLocating(false);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      if (showSuggestions) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSuggestions]);

  const handleConfirm = () => {
    if (onChange) {
      onChange({
        lat: coords.lat,
        lng: coords.lng,
        address
      });
    }
  };

  return (
    <div className={`relative w-full bg-slate-100 overflow-hidden flex flex-col ${
      fullHeight
        ? 'h-full rounded-none shadow-none border-0'
        : 'h-[450px] md:h-[500px] rounded-3xl shadow-lg border border-slate-200'
    }`}>
      {/* Autocomplete Search input */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 px-4 py-3">
          <svg className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm địa chỉ cụ thể..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(true)}
            className="w-full text-xs font-bold text-slate-700 bg-transparent focus:outline-none placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setAddress('');
                clearSuggestions();
              }}
              className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-full hover:bg-slate-100 transition-all flex-shrink-0"
            >
              ✕
            </button>
          )}
          {searchLoading && (
            <div className="ml-2 w-4 h-4 border-2 border-brand-emerald border-t-transparent rounded-full animate-spin flex-shrink-0" />
          )}
        </div>

        {/* Suggestion Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-2 bg-white/98 backdrop-blur-md rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-100 max-h-[200px] overflow-y-auto z-30 divide-y divide-slate-50 select-none">
            {suggestions.map((item) => (
              <div
                key={item.place_id}
                onClick={() => handleSelectSuggestion(item)}
                className="px-4 py-3 hover:bg-slate-50 active:bg-slate-100 cursor-pointer flex flex-col gap-0.5 text-left transition-all"
              >
                <span className="text-[11px] font-black text-slate-800">
                  {item.structured_formatting?.main_text || item.description.split(',')[0]}
                </span>
                <span className="text-[9px] font-bold text-slate-400 truncate">
                  {item.structured_formatting?.secondary_text || item.description}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full relative z-10" />

      {/* Dynamic Marker animation behavior when map drags */}
      <style>{`
        .marker-pin-wrapper {
          transition: transform 0.15s ease-out;
        }
        /* Bounce pin body slightly upwards while dragging map */
        .marker-pin-wrapper:has(+.mapboxgl-map.mapboxgl-user-interaction) .pin-icon-body,
        .marker-pin-wrapper {
          transform: translateY(${isDragging ? '-12px' : '0px'}) scale(${isDragging ? '1.1' : '1'});
          transition: transform 0.2s ease-out;
        }
      `}</style>

      {/* GPS locate button */}
      <button
        onClick={handleLocateCurrent}
        disabled={isLocating}
        className={`absolute bottom-24 right-4 z-20 w-11 h-11 bg-white hover:bg-slate-50 text-slate-700 hover:text-brand-emerald shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-slate-100 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
          isLocating ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        title="Lấy vị trí hiện tại"
      >
        {isLocating ? (
          <div className="w-5 h-5 border-2 border-brand-emerald border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>

      {/* Coordinates & Location Footer details panel */}
      <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-slate-100/80 p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-ping" />
              Địa chỉ hiện tại
            </span>
            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[8px] font-bold text-slate-500 tracking-wider">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-700 min-h-[32px] line-clamp-2">
            {address || (isDragging ? 'Đang xác định vị trí...' : 'Vui lòng di chuyển bản đồ để chọn địa chỉ')}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-50 pt-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 font-extrabold text-[10px] uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
            >
              Hủy
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!address || isDragging}
            className={`bg-brand-emerald hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider px-6 py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer border-b-2 border-emerald-900 shadow-md ${
              (!address || isDragging) ? 'opacity-55 cursor-not-allowed border-b-0' : ''
            }`}
          >
            Xác nhận vị trí
          </button>
        </div>
      </div>
    </div>
  );
};
