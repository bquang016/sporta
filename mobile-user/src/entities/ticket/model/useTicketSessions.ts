import { useState, useEffect, useCallback } from 'react';
import { TicketSession, TicketFilterState } from './ticket.types';
import { fetchAvailableSessions } from '../api/ticketApi';

export function useTicketSessions(initialFilters: TicketFilterState = {}) {
  const [sessions, setSessions] = useState<TicketSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilterState>(initialFilters);

  const loadSessions = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAvailableSessions(currentFilters);
      setSessions(data || []);
    } catch (err: any) {
      console.error('Failed to load ticket sessions:', err);
      setError(err.message || 'Không thể tải danh sách ca xé vé');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const updateFilters = (newFilters: Partial<TicketFilterState>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      return updated;
    });
  };

  const resetFilters = () => {
    setFilters({});
  };

  return {
    sessions,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: loadSessions,
  };
}
