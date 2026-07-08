import React, { useState, useEffect, useRef } from 'react';
import goongjs from '@goongmaps/goong-js';
import { useGoongSearch } from '../hooks/useGoongSearch';
import type { GoongSuggestion } from '../hooks/useGoongSearch';
import '@goongmaps/goong-js/dist/goong-js.css';

// Default center: Hanoi
const DEFAULT_LAT = 21.028511;
const DEFAULT_LNG = 105.804817;
const GOONG_MAP_KEY = import.meta.env.VITE_GOONG_MAP_KEY || '8n7WDTHRsELT9F8UA4g3nsDbFWn5KQPig2dDkJHZ';

// Address Component Extraction Helper
const extractAddressComponents = (components: any[], formattedAddress: string) => {
  let province = '';
  let district = '';
  let ward = '';
  let streetNumber = '';
  let route = '';

  components.forEach((comp: any) => {
    const types = comp.types || [];
    if (types.includes('administrative_area_level_1')) {
      province = comp.long_name;
    } else if (types.includes('administrative_area_level_2')) {
      district = comp.long_name;
    } else if (types.includes('administrative_area_level_3') || types.includes('sublocality_level_1') || types.includes('ward')) {
      ward = comp.long_name;
    } else if (types.includes('route')) {
      route = comp.long_name;
    } else if (types.includes('street_number')) {
      streetNumber = comp.long_name;
    }
  });

  // Clean administrative level prefixes
  const cleanProvince = province.replace(/^(Tỉnh|Thành phố|Thành Phố|Tp\.|TP)/i, '').trim();
  const cleanDistrict = district.replace(/^(Quận|Huyện|Thị xã|Thị Xã|Thành phố|Thành Phố|Tp\.|TP)/i, '').trim();
  const cleanWard = ward.replace(/^(Phường|Xã|Thị trấn|Thị Trấn)/i, '').trim();

  let addressDetail = '';
  if (streetNumber && route) {
    addressDetail = `${streetNumber} ${route}`;
  } else if (route) {
    addressDetail = route;
  }

  // Fallback splitting if some names are blank
  if (!cleanProvince || !cleanDistrict || !cleanWard || !addressDetail) {
    const parts = formattedAddress.split(',').map((p: string) => p.trim());
    const len = parts.length;
    
    if (len >= 4) {
      if (!addressDetail) addressDetail = parts[0];
      if (!cleanWard) ward = parts[1].replace(/^(Phường|Xã|Thị trấn|Thị Trấn)/i, '').trim();
      if (!cleanDistrict) district = parts[2].replace(/^(Quận|Huyện|Thị xã|Thị Xã|Thành phố|Thành Phố|Tp\.|TP)/i, '').trim();
      if (!cleanProvince) province = parts[3].replace(/^(Tỉnh|Thành phố|Thành Phố|Tp\.|TP)/i, '').trim();
    } else if (len === 3) {
      if (!addressDetail) addressDetail = parts[0];
      if (!cleanDistrict) district = parts[1].replace(/^(Quận|Huyện|Thị xã|Thị Xã|Thành phố|Thành Phố|Tp\.|TP)/i, '').trim();
      if (!cleanProvince) province = parts[2].replace(/^(Tỉnh|Thành phố|Thành Phố|Tp\.|TP)/i, '').trim();
    } else if (len === 2) {
      if (!addressDetail) addressDetail = parts[0];
      if (!cleanProvince) province = parts[1].replace(/^(Tỉnh|Thành phố|Thành Phố|Tp\.|TP)/i, '').trim();
    }
  }

  return {
    province: cleanProvince || province.replace(/^(Tỉnh|Thành phố|Thành Phố|Tp\.|TP)/i, '').trim(),
    district: cleanDistrict || district.replace(/^(Quận|Huyện|Thị xã|Thị Xã|Thành phố|Thành Phố|Tp\.|TP)/i, '').trim(),
    ward: cleanWard || ward.replace(/^(Phường|Xã|Thị trấn|Thị Trấn)/i, '').trim(),
    addressDetail: addressDetail || formattedAddress.split(',')[0].trim()
  };
};

interface LocationPickerMapProps {
  initialLocation?: {
    lat: number;
    lng: number;
  };
  initialAddress?: string;
  onChange?: (data: {
    lat: number;
    lng: number;
    address: string;
    province: string;
    district: string;
    ward: string;
    addressDetail: string;
  }) => void;
  onClose?: () => void;
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

  const [addressComponents, setAddressComponents] = useState({
    province: '',
    district: '',
    ward: '',
    addressDetail: ''
  });

  // Sync initial location if it changes
  useEffect(() => {
    if (initialLocation?.lat && initialLocation?.lng && initialLocation.lat !== 0 && initialLocation.lng !== 0) {
      const newCoords = { lat: initialLocation.lat, lng: initialLocation.lng };
      setCoords(newCoords);
      if (mapRef.current) {
        mapRef.current.setCenter([newCoords.lng, newCoords.lat]);
      }
      if (markerRef.current) {
        markerRef.current.setLngLat([newCoords.lng, newCoords.lat]);
      }
      if (!initialAddress) {
        reverseGeocode(initialLocation.lat, initialLocation.lng).then(geoResult => {
          if (geoResult) {
            setAddress(geoResult.address);
            setSearchQuery(geoResult.address);
            const parsed = extractAddressComponents(geoResult.components, geoResult.address);
            setAddressComponents(parsed);
          }
        });
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

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    // Add Navigation Control
    map.addControl(new goongjs.NavigationControl({ showCompass: false }), 'top-right');

    // Create Marker Element
    const el = document.createElement('div');
    el.className = 'custom-map-marker select-none';
    el.innerHTML = `
      <div class="marker-container relative flex flex-col items-center">
        <!-- Marker shadow -->
        <div class="absolute -bottom-1.5 w-7.5 h-2 bg-slate-950/20 rounded-full blur-[1.8px] scale-x-100 transform origin-center marker-shadow"></div>
        
        <!-- Sporta Emerald Teardrop with Metallic Outline & Gold Core -->
        <div class="pin-body relative w-9 h-11 flex flex-col items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.12)]">
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 36 44">
            <defs>
              <linearGradient id="sporta-pin-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#10b981" />
                <stop offset="100%" stop-color="#047857" />
              </linearGradient>
            </defs>
            <path d="M18 0C8.06 0 0 8.06 0 18c0 12.75 18 26 18 26s18-13.25 18-26C36 8.06 27.94 0 18 0z" fill="url(#sporta-pin-grad)" />
            <path d="M18 1C8.61 1 1 8.61 1 18c0 11.87 17 24.31 17 24.31S35 29.87 35 18c0-9.39-7.61-17-17-17z" fill="none" stroke="white" stroke-opacity="0.3" stroke-width="1.5" />
          </svg>
          
          <!-- Inner White Ring with brand-yellow ball core -->
          <div class="absolute top-[8px] w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)]">
            <div class="w-2.5 h-2.5 rounded-full bg-brand-yellow shadow-inner animate-pulse"></div>
          </div>
        </div>
      </div>
    `;

    // Create Draggable Marker
    const marker = new goongjs.Marker({
      element: el,
      anchor: 'bottom',
      draggable: true
    })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map);
    markerRef.current = marker;

    // Marker Drag Listeners
    marker.on('dragstart', () => {
      setIsDragging(true);
      el.classList.add('dragging');
    });

    marker.on('drag', () => {
      const markerCoords = marker.getLngLat();
      setCoords({ lat: markerCoords.lat, lng: markerCoords.lng });
    });

    marker.on('dragend', () => {
      setIsDragging(false);
      el.classList.remove('dragging');
      const markerCoords = marker.getLngLat();
      setCoords({ lat: markerCoords.lat, lng: markerCoords.lng });

      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }

      geocodeTimeoutRef.current = setTimeout(async () => {
        try {
          const geoResult = await reverseGeocode(markerCoords.lat, markerCoords.lng);
          if (geoResult) {
            setAddress(geoResult.address);
            setSearchQuery(geoResult.address);
            const parsed = extractAddressComponents(geoResult.components, geoResult.address);
            setAddressComponents(parsed);
          }
        } catch (err) {
          console.error('Failed to geocode dragged marker:', err);
        }
      }, 500);
    });

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
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
      if (details && mapRef.current && markerRef.current) {
        setAddress(details.address);
        setSearchQuery(details.address);
        setCoords(details.location);
        
        const parsed = extractAddressComponents(details.components, details.address);
        setAddressComponents(parsed);

        markerRef.current.setLngLat([details.location.lng, details.location.lat]);
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

      if (mapRef.current && markerRef.current) {
        markerRef.current.setLngLat([gpsCoords.lng, gpsCoords.lat]);
        mapRef.current.flyTo({
          center: [gpsCoords.lng, gpsCoords.lat],
          zoom: 16,
          essential: true
        });
      }

      const geoResult = await reverseGeocode(gpsCoords.lat, gpsCoords.lng);
      if (geoResult) {
        setAddress(geoResult.address);
        setSearchQuery(geoResult.address);
        const parsed = extractAddressComponents(geoResult.components, geoResult.address);
        setAddressComponents(parsed);
      }
    } catch (err: any) {
      console.error('Error locating GPS coordinate:', err);
      alert('Không thể xác định vị trí hiện tại. Vui lòng bật dịch vụ định vị GPS.');
    } finally {
      setIsLocating(false);
    }
  };

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
        address,
        province: addressComponents.province,
        district: addressComponents.district,
        ward: addressComponents.ward,
        addressDetail: addressComponents.addressDetail
      });
    }
  };

  return (
    <div className={`relative w-full bg-slate-100 overflow-hidden flex flex-col ${
      fullHeight
        ? 'h-full rounded-none shadow-none border-0'
        : 'h-[360px] md:h-[400px] rounded-3xl shadow-lg border border-slate-200'
    }`}>
      {/* Autocomplete Search input */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 px-4 py-2.5">
          <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="mt-2 bg-white/98 backdrop-blur-md rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.1)] border border-slate-100 max-h-[160px] overflow-y-auto z-30 divide-y divide-slate-50 select-none">
            {suggestions.map((item) => (
              <div
                key={item.place_id}
                onClick={() => handleSelectSuggestion(item)}
                className="px-4 py-2.5 hover:bg-slate-50 active:bg-slate-100 cursor-pointer flex flex-col gap-0.5 text-left transition-all"
              >
                <span className="text-[10px] font-black text-slate-800">
                  {item.structured_formatting?.main_text || item.description.split(',')[0]}
                </span>
                <span className="text-[8px] font-bold text-slate-400 truncate">
                  {item.structured_formatting?.secondary_text || item.description}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full relative z-10" />

      {/* Styled lifting transition of draggable pin marker */}
      <style>{`
        .custom-map-marker .pin-body {
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .custom-map-marker .marker-shadow {
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .custom-map-marker.dragging .pin-body {
          transform: translateY(-8px) scale(1.08);
        }
        .custom-map-marker.dragging .marker-shadow {
          transform: scale(0.6);
          opacity: 0.4;
        }
      `}</style>

      {/* GPS locate button */}
      <button
        onClick={handleLocateCurrent}
        disabled={isLocating}
        className={`absolute bottom-20 right-4 z-20 w-10 h-10 bg-white hover:bg-slate-50 text-slate-700 hover:text-brand-emerald shadow-[0_4px_15px_rgba(0,0,0,0.08)] border border-slate-100 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
          isLocating ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        title="Lấy vị trí hiện tại"
      >
        {isLocating ? (
          <div className="w-4 h-4 border-2 border-brand-emerald border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>

      {/* ULTRA-COMPACT BOTTOM SINGLE-ROW FLOATING BAR */}
      <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-2xl p-2.5 flex flex-row items-center justify-between gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)] select-none">
        
        {/* Left Side: Pin Icon & Resolved Address (Truncated) */}
        <div className="flex items-center gap-2 min-w-0 flex-1 select-none">
          <div className="w-6 h-6 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center flex-shrink-0 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 truncate" title={address}>
            {address || (isDragging ? 'Đang xác định vị trí...' : 'Kéo thả ghim để chọn vị trí')}
          </span>
        </div>

        {/* Right Side: Confirm / Cancel Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-black text-[9px] uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
            >
              Hủy
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!address || isDragging}
            className={`bg-brand-emerald hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-wider px-4 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer border-b-2 border-emerald-900 shadow-xs ${
              (!address || isDragging) ? 'opacity-55 cursor-not-allowed border-b-0' : ''
            }`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};
export default LocationPickerMap;
