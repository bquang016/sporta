import { useState, useEffect } from 'react';
import { MapVenue } from '../../../entities/facility/model/useMapFacilities';
import { searchGoongPlaces, GoongPlace } from '../api/facilitySearchApi';

export type SearchResultItem =
  | { type: 'venue'; data: MapVenue }
  | { type: 'place'; data: GoongPlace };

export const useMapSearchAutocomplete = (venues: MapVenue[]) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        // 1. Search locally in venues (case-insensitive)
        const lowerQuery = query.toLowerCase();
        const localMatches = venues
          .filter(
            (v) =>
              v.name.toLowerCase().includes(lowerQuery) ||
              v.location.toLowerCase().includes(lowerQuery)
          )
          .slice(0, 3) // Limit local matches to 3
          .map((v) => ({ type: 'venue' as const, data: v }));

        // 2. Search Goong API
        const goongMatches = await searchGoongPlaces(query);
        const placeMatches = goongMatches.map((p) => ({
          type: 'place' as const,
          data: p,
        }));

        setResults([...localMatches, ...placeMatches]);
      } catch (error) {
        console.error('Search error', error);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query, venues]);

  return {
    query,
    setQuery,
    results,
    loading,
  };
};
