import { useState, useCallback } from 'react';
import { ticketService } from '../services/ticketService';
import type { TicketSessionResponse, TicketSessionRequest, TicketCheckInResponse, TestTicketResponse } from '../types/ticket.types';

export const useTicketSessions = (venueId: string | null) => {
  const [sessions, setSessions] = useState<TicketSessionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodaySessions = useCallback(async () => {
    if (!venueId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ticketService.getTodaySessions(venueId);
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách trận xé vé');
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  const createSession = async (data: Omit<TicketSessionRequest, 'venueId'>) => {
    if (!venueId) throw new Error('Chưa chọn cụm sân');
    setLoading(true);
    try {
      const newSession = await ticketService.createSession({
        ...data,
        venueId,
      });
      await fetchTodaySessions();
      return newSession;
    } catch (err: any) {
      throw new Error(err.message || 'Không thể tạo trận xé vé mới');
    } finally {
      setLoading(false);
    }
  };

  const checkInTicket = async (token: string): Promise<TicketCheckInResponse> => {
    try {
      const res = await ticketService.checkInTicket(token);
      await fetchTodaySessions();
      return res;
    } catch (err: any) {
      throw new Error(err.message || 'Quét check-in vé thất bại');
    }
  };

  const getTestTickets = async (sessionId: string): Promise<TestTicketResponse[]> => {
    try {
      return await ticketService.getTestTickets(sessionId);
    } catch (err: any) {
      throw new Error(err.message || 'Không thể lấy danh sách vé test');
    }
  };

  return {
    sessions,
    loading,
    error,
    fetchTodaySessions,
    createSession,
    checkInTicket,
    getTestTickets,
  };
};

export const getSportLevelLabel = (level: string): string => {
  switch (level) {
    case 'WEAK':
      return 'Yếu (Beginner)';
    case 'WEAK_AVERAGE':
      return 'Yếu - Trung bình';
    case 'AVERAGE':
      return 'Trung bình (Intermediate)';
    case 'AVERAGE_GOOD':
      return 'Trung bình - Khá';
    case 'GOOD':
      return 'Khá - Khéo (Advanced)';
    case 'ALL':
      return 'Mọi trình độ';
    default:
      return level;
  }
};
