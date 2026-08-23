import { useState, useMemo, useCallback } from 'react';
import { ClubFilterState } from '../model/types';
import { DEFAULT_FILTERS } from '../model/constants';

export function useClubFilters(initialFilters: ClubFilterState = DEFAULT_FILTERS) {
  const [filters, setFilters] = useState<ClubFilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<ClubFilterState>(initialFilters);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);

  // Count active filters in appliedFilters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.sport !== 'all') count++;
    if (appliedFilters.memberCount !== 'all') count++;
    if (appliedFilters.eloRange !== 'all') count++;
    if (appliedFilters.province !== 'all') count++;
    if (appliedFilters.ward !== 'all') count++;
    if (appliedFilters.privacy !== 'all') count++;
    return count;
  }, [appliedFilters]);

  // Open modal and sync draft filters with applied
  const openModal = useCallback(() => {
    setFilters(appliedFilters);
    setIsFilterModalVisible(true);
  }, [appliedFilters]);

  const closeModal = useCallback(() => {
    setIsFilterModalVisible(false);
  }, []);

  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
    setIsFilterModalVisible(false);
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setIsFilterModalVisible(false);
  }, []);

  const setFilterField = useCallback(
    <K extends keyof ClubFilterState>(key: K, value: ClubFilterState[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const clearProvince = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      province: 'all',
      provinceCode: null,
      ward: 'all',
    }));
  }, []);

  const clearWard = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      ward: 'all',
    }));
  }, []);

  const removeAppliedFilter = useCallback((key: keyof ClubFilterState) => {
    setAppliedFilters((prev) => {
      const next = { ...prev };
      if (key === 'province') {
        next.province = 'all';
        next.provinceCode = null;
        next.ward = 'all';
      } else if (key === 'ward') {
        next.ward = 'all';
      } else {
        (next as any)[key] = 'all';
      }
      return next;
    });
    setFilters((prev) => {
      const next = { ...prev };
      if (key === 'province') {
        next.province = 'all';
        next.provinceCode = null;
        next.ward = 'all';
      } else if (key === 'ward') {
        next.ward = 'all';
      } else {
        (next as any)[key] = 'all';
      }
      return next;
    });
  }, []);

  return {
    filters,
    appliedFilters,
    isFilterModalVisible,
    activeFilterCount,
    setFilters,
    setAppliedFilters,
    openModal,
    closeModal,
    applyFilters,
    resetFilters,
    setFilterField,
    clearProvince,
    clearWard,
    removeAppliedFilter,
  };
}
