import { useState, useCallback, useEffect } from 'react';
import {
  MatchRoomVM,
  MatchmakingFilterState,
  MatchmakingSortOption,
} from '../../../entities/match/model/match.types';
import { MatchmakingApiRepository } from '../../../shared/api/matchmaking';

/**
 * Hook danh sách phòng ghép trận công khai (100% Backend API thật)
 */
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
      setRooms(data || []);
    } catch (e) {
      console.error('Error fetching real matchmaking rooms:', e);
      setRooms([]);
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

/**
 * Hook danh sách "Trận đấu của tôi" (Sắp đấu, Chờ cập nhật tỷ số, Đã hoàn thành) (100% Backend API thật)
 */
export function useMyMatches() {
  const [rooms, setRooms] = useState<MatchRoomVM[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMyMatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await MatchmakingApiRepository.listMyMatches();
      setRooms(data || []);
    } catch (e) {
      console.error('Error fetching my matches:', e);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyMatches();
  }, [fetchMyMatches]);

  return {
    rooms,
    loading,
    refetch: fetchMyMatches,
  };
}

/**
 * Hook chi tiết 1 phòng ghép trận & thao tác (100% Backend API thật)
 */
export function useMatchDetail(roomId: string) {
  const [room, setRoom] = useState<MatchRoomVM | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRoom = useCallback(async () => {
    setLoading(true);
    try {
      const data = await MatchmakingApiRepository.getRoom(roomId);
      setRoom(data);
    } catch (e) {
      console.error('Error fetching real room detail:', e);
      setRoom(undefined);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) fetchRoom();
  }, [roomId, fetchRoom]);

  const requestJoin = async (clubId: string, note?: string) => {
    if (!roomId) return;
    const req = await MatchmakingApiRepository.createJoinRequest(roomId, clubId, note);
    await fetchRoom();
    return req;
  };

  const acceptRequest = async (requestId: string) => {
    if (!roomId) return;
    const updated = await MatchmakingApiRepository.acceptJoinRequest(roomId, requestId);
    await fetchRoom();
    return updated;
  };

  const submitScore = async (hostScore: number | string, guestScore: number | string, details?: string) => {
    if (!roomId) return;
    const updated = await MatchmakingApiRepository.submitScore(roomId, hostScore, guestScore, details);
    setRoom(updated);
    return updated;
  };

  const confirmScore = async () => {
    if (!roomId) return;
    const updated = await MatchmakingApiRepository.confirmScore(roomId);
    setRoom(updated);
    return updated;
  };

  const rejectRequest = async (requestId: string, reason?: string) => {
    if (!roomId) return;
    await MatchmakingApiRepository.rejectJoinRequest(requestId, reason);
    await fetchRoom();
  };

  return {
    room,
    loading,
    refetch: fetchRoom,
    requestJoin,
    acceptRequest,
    rejectRequest,
    submitScore,
    confirmScore,
  };
}
