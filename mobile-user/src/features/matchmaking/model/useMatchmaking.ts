import { useState, useCallback, useEffect } from 'react';
import {
  MatchRoomVM,
  ClubSummaryVM,
  BookingSummaryVM,
  MatchmakingFilterState,
  MatchmakingSortOption,
  MatchType,
} from '../../../entities/match/model/match.types';
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
      const data = await MockMatchmakingRepository.listRooms(filters, sortOption);
      setRooms(data);
    } catch (e) {
      console.error('Error fetching matchmaking rooms:', e);
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
      const data = await MockMatchmakingRepository.getRoom(roomId);
      setRoom(data);
    } catch (e) {
      console.error('Error fetching room detail:', e);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) fetchRoom();
  }, [roomId, fetchRoom]);

  const requestJoin = async (clubId: string, note?: string) => {
    if (!roomId) return;
    const req = await MockMatchmakingRepository.createJoinRequest(roomId, clubId, note);
    await fetchRoom();
    return req;
  };

  const acceptRequest = async (requestId: string) => {
    if (!roomId) return;
    const updated = await MockMatchmakingRepository.acceptJoinRequest(roomId, requestId);
    setRoom(updated);
    return updated;
  };

  const submitScore = async (hostScore: number | string, guestScore: number | string, details?: string) => {
    if (!roomId) return;
    const updated = await MockMatchmakingRepository.submitScore(roomId, hostScore, guestScore, details);
    setRoom(updated);
    return updated;
  };

  const confirmScore = async () => {
    if (!roomId) return;
    const updated = await MockMatchmakingRepository.confirmScore(roomId);
    setRoom(updated);
    return updated;
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
