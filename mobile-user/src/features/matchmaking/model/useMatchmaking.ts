import { useState, useCallback, useEffect } from 'react';
import {
  MatchRoomVM,
  MatchmakingFilterState,
  MatchmakingSortOption,
} from '../../../entities/match/model/match.types';
import { MatchmakingApiRepository } from '../../../shared/api/matchmaking';
import { MockMatchmakingRepository } from './mockMatchmakingRepository';

export function useMatchmakingList(
  initialFilters?: MatchmakingFilterState,
  initialSort: MatchmakingSortOption = 'BALANCE_FIRST'
) {
  const [rooms, setRooms] = useState<MatchRoomVM[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<MatchmakingFilterState>(initialFilters || {});
  const [sortOption, setSortOption] = useState<MatchmakingSortOption>(initialSort);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await MatchmakingApiRepository.listRooms(filters, sortOption);
      if (data && Array.isArray(data) && data.length > 0) {
        setRooms(data);
      } else {
        const mockData = await MockMatchmakingRepository.listRooms(filters, sortOption);
        setRooms(mockData);
      }
    } catch (e) {
      console.log('Backend API not available or empty, falling back to mock repository:', e);
      try {
        const mockData = await MockMatchmakingRepository.listRooms(filters, sortOption);
        setRooms(mockData);
      } catch (err) {
        console.error('Mock fetch failed:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, sortOption]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    loading,
    filters,
    setFilters,
    sortOption,
    setSortOption,
    refetch: fetchRooms,
  };
}

export function useMatchDetail(roomId: string) {
  const [room, setRoom] = useState<MatchRoomVM | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRoom = useCallback(async () => {
    setLoading(true);
    try {
      const data = await MatchmakingApiRepository.getRoom(roomId);
      setRoom(data);
    } catch (e) {
      console.log('Error fetching room detail from API, using mock:', e);
      const mockData = await MockMatchmakingRepository.getRoom(roomId);
      setRoom(mockData);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) fetchRoom();
  }, [roomId, fetchRoom]);

  const requestJoin = async (clubId: string, note?: string) => {
    if (!roomId) return;
    try {
      const req = await MatchmakingApiRepository.createJoinRequest(roomId, clubId, note);
      await fetchRoom();
      return req;
    } catch (e) {
      const req = await MockMatchmakingRepository.createJoinRequest(roomId, clubId, note);
      await fetchRoom();
      return req;
    }
  };

  const acceptRequest = async (requestId: string) => {
    if (!roomId) return;
    try {
      const updated = await MatchmakingApiRepository.acceptJoinRequest(roomId, requestId);
      setRoom(updated);
      return updated;
    } catch (e) {
      const updated = await MockMatchmakingRepository.acceptJoinRequest(roomId, requestId);
      setRoom(updated);
      return updated;
    }
  };

  const submitScore = async (hostScore: number | string, guestScore: number | string, details?: string) => {
    if (!roomId) return;
    try {
      const updated = await MatchmakingApiRepository.submitScore(roomId, hostScore, guestScore, details);
      setRoom(updated);
      return updated;
    } catch (e) {
      const updated = await MockMatchmakingRepository.submitScore(roomId, hostScore, guestScore, details);
      setRoom(updated);
      return updated;
    }
  };

  const confirmScore = async () => {
    if (!roomId) return;
    try {
      const updated = await MatchmakingApiRepository.confirmScore(roomId);
      setRoom(updated);
      return updated;
    } catch (e) {
      const updated = await MockMatchmakingRepository.confirmScore(roomId);
      setRoom(updated);
      return updated;
    }
  };

  return {
    room,
    loading,
    refetch: fetchRoom,
    requestJoin,
    acceptRequest,
    submitScore,
    confirmScore,
  };
}
