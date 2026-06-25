import { useState, useCallback, useRef } from 'react';

const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY || 'TW0sH2XGWngVrfsNz8XrD2JpWSFhjLna8m3XqmOS';
const BASE_URL = 'https://rsapi.goong.io';

export interface GoongSuggestion {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export interface LatLng {
  lat: number;
  lng: number;
}

export const useGoongSearch = () => {
  const [suggestions, setSuggestions] = useState<GoongSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const searchAddress = useCallback(async (input: string, location?: LatLng): Promise<GoongSuggestion[]> => {
    if (!input.trim()) {
      setSuggestions([]);
      return [];
    }

    // Cancel the previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      let url = `${BASE_URL}/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(input)}&limit=5`;
      if (location) {
        url += `&location=${location.lat},${location.lng}`;
      }

      const response = await fetch(url, { signal: abortController.signal });
      if (!response.ok) {
        throw new Error('Không thể tải gợi ý địa chỉ');
      }

      const data = await response.json();
      if (data.status === 'OK' && data.predictions) {
        setSuggestions(data.predictions);
        return data.predictions;
      } else if (data.status === 'ZERO_RESULTS') {
        setSuggestions([]);
        return [];
      } else {
        throw new Error(data.error_message || 'Có lỗi xảy ra khi tìm kiếm');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Goong Autocomplete error:', err);
        setError(err.message || 'Lỗi kết nối dịch vụ bản đồ');
      }
      return [];
    } finally {
      if (abortControllerRef.current === abortController) {
        setLoading(false);
      }
    }
  }, []);

  const getPlaceDetails = useCallback(async (placeId: string): Promise<{ location: LatLng; address: string } | null> => {
    setLoading(true);
    setError(null);

    try {
      const url = `${BASE_URL}/Place/Detail?api_key=${GOONG_API_KEY}&place_id=${placeId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Không thể lấy thông tin chi tiết địa điểm');
      }

      const data = await response.json();
      if (data.status === 'OK' && data.result) {
        const { geometry, formatted_address } = data.result;
        if (geometry && geometry.location) {
          return {
            location: {
              lat: geometry.location.lat,
              lng: geometry.location.lng
            },
            address: formatted_address || ''
          };
        }
      }
      throw new Error(data.error_message || 'Không tìm thấy tọa độ địa điểm này');
    } catch (err: any) {
      console.error('Goong Detail error:', err);
      setError(err.message || 'Lỗi khi lấy chi tiết địa điểm');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string | null> => {
    setError(null);

    try {
      const url = `${BASE_URL}/Geocode?api_key=${GOONG_API_KEY}&latlng=${lat},${lng}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Không thể chuyển đổi tọa độ thành địa chỉ');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        // Return the first formatted address match
        return data.results[0].formatted_address;
      }
      return null;
    } catch (err: any) {
      console.error('Goong Reverse Geocoding error:', err);
      setError(err.message || 'Lỗi khi giải mã tọa độ');
      return null;
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    loading,
    error,
    searchAddress,
    getPlaceDetails,
    reverseGeocode,
    clearSuggestions
  };
};
